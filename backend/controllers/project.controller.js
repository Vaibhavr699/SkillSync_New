const db = require("../config/db");
const cloudinary = require("../config/cloudinary"); // adjust if not using
const fs = require("fs");
const createNotification = require("../utils/createNotification");
const { uploadToCloudinary, uploadFile } = require('../services/file.service');
const { sendApplicationSubmittedEmail, sendApplicationStatusEmail } = require('../services/email.service');
const { createApplicationStatusNotification } = require('../services/notification.service');

// CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, tags, budget, deadline } = req.body;

    // Get company_id of creator
    const userRes = await db.query('SELECT company_id FROM users WHERE id = $1', [userId]);
    const companyId = userRes.rows[0]?.company_id || null;

    // Parse tags if sent as JSON string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const fileIds = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload file and insert into files table
        const fileRecord = await uploadFile(file, userId);
        fileIds.push(fileRecord.id);
      }
    }

    const project = await db.query(
      `INSERT INTO projects (title, description, tags, budget, deadline, created_by, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, parsedTags, budget, deadline, userId, companyId]
    );

    // Insert into project_files with correct columns
    for (const fileId of fileIds) {
      await db.query(
        `INSERT INTO project_files (project_id, file_id)
         VALUES ($1, $2)`,
        [project.rows[0].id, fileId]
      );
    }

    res.status(201).json(project.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error creating project" });
  }
};

// GET ALL PROJECTS
exports.getProjects = async (req, res) => {
  try {
    const { search, tag, status, minBudget, maxBudget, deadline, createdBy, company_id } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let query = `SELECT * FROM projects WHERE status != 'cancelled'`;
    const params = [];
    let idx = 1;
    if (search) {
      query += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    // Multi-tag support
    let tagsArray = [];
    if (tag) {
      if (Array.isArray(tag)) {
        tagsArray = tag;
      } else if (typeof tag === 'string') {
        tagsArray = tag.split(',');
      }
      if (tagsArray.length > 0) {
        query += ` AND (` + tagsArray.map(() => `$${idx} = ANY(tags)`).join(' OR ') + `)`;
        for (const t of tagsArray) {
          params.push(t);
          idx++;
        }
      }
    }
    if (status) {
      query += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (minBudget) {
      query += ` AND budget >= $${idx}`;
      params.push(minBudget);
      idx++;
    }
    if (maxBudget) {
      query += ` AND budget <= $${idx}`;
      params.push(maxBudget);
      idx++;
    }
    if (deadline) {
      query += ` AND deadline <= $${idx}`;
      params.push(deadline);
      idx++;
    }
    // ENFORCE: Company users only see their own projects
    if (userRole === 'company') {
      query += ` AND created_by = $${idx}`;
      params.push(userId);
      idx++;
    } else {
      if (createdBy) {
        query += ` AND created_by = $${idx}`;
        params.push(createdBy);
        idx++;
      }
      if (company_id) {
        query += ` AND company_id = $${idx}`;
        params.push(company_id);
        idx++;
      }
    }
    // Count total
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS count_sub`;
    const countResult = await db.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);
    const projects = await db.query(query, params);
    res.status(200).json({
      projects: projects.rows,
      totalPages,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching projects" });
  }
};

// GET SINGLE PROJECT DETAILS
exports.getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await db.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const files = await db.query(
      `SELECT f.* FROM files f
       JOIN project_files pf ON f.id = pf.file_id
       WHERE pf.project_id = $1`,
      [id]
    );

    res.status(200).json({ ...project.rows[0], files: files.rows });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching project details" });
  }
};

// APPLY TO A PROJECT
exports.applyToProject = async (req, res) => {
  try {
    console.log('Apply to project request received:', {
      userId: req.user?.id,
      projectId: req.params.id,
      body: req.body,
      headers: req.headers
    });

    const userId = req.user.id;
    const { id } = req.params;
    const { 
      coverLetter, 
      proposedBudget, 
      estimatedDuration, 
      relevantExperience 
    } = req.body;

    console.log('Parsed request data:', {
      userId,
      projectId: id,
      coverLetter: coverLetter?.substring(0, 50) + '...',
      proposedBudget,
      estimatedDuration,
      relevantExperience: relevantExperience?.substring(0, 50) + '...'
    });

    if (!coverLetter || !coverLetter.trim()) {
      console.log('Validation failed: Cover letter is required');
      return res.status(400).json({ message: "Cover letter is required" });
    }

    // Check if project exists and is open
    const projectRes = await db.query("SELECT * FROM projects WHERE id = $1", [id]);
    console.log('Project query result:', { found: projectRes.rows.length > 0, status: projectRes.rows[0]?.status });
    
    if (!projectRes.rows.length) {
      console.log('Project not found');
      return res.status(404).json({ message: "Project not found" });
    }
    if (projectRes.rows[0].status !== 'open') {
      console.log('Project is not open for applications');
      return res.status(400).json({ message: "Project is not open for applications" });
    }

    // Check for duplicate application
    const existing = await db.query(
      `SELECT * FROM project_applications WHERE project_id = $1 AND freelancer_id = $2`,
      [id, userId]
    );
    console.log('Duplicate check result:', { existing: existing.rows.length > 0 });
    
    if (existing.rows.length > 0) {
      console.log('Already applied to this project');
      return res.status(400).json({ message: "Already applied to this project" });
    }

    // Try to insert with enhanced fields, fallback to basic fields if columns don't exist
    let applicationResult;
    try {
      console.log('Attempting to insert with enhanced fields...');
      // First try with enhanced fields
      applicationResult = await db.query(
        `INSERT INTO project_applications (
          project_id, 
          freelancer_id, 
          proposal, 
          proposed_budget, 
          estimated_duration_text, 
          relevant_experience
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, userId, coverLetter, proposedBudget || projectRes.rows[0].budget, estimatedDuration || 'Not specified', relevantExperience || '']
      );
      console.log('Enhanced insert successful');
    } catch (columnError) {
      console.log('Enhanced columns not available, using basic schema:', columnError.message);
      // Fallback to basic schema
      applicationResult = await db.query(
        `INSERT INTO project_applications (project_id, freelancer_id, proposal)
         VALUES ($1, $2, $3) RETURNING *`,
        [id, userId, coverLetter]
      );
      console.log('Basic insert successful');
    }

    const project = projectRes.rows[0];
    
    // Create notification (handle errors gracefully)
    try {
      await createNotification(
        project.created_by,
        userId,
        "application",
        "A freelancer has applied to your project",
        "project",
        id
      );
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError);
      // Don't fail the application if notification fails
    }

    // Send email to company (handle errors gracefully)
    try {
      const companyUser = await db.query('SELECT email FROM users WHERE id = $1', [project.created_by]);
      const freelancerUser = await db.query('SELECT name FROM user_profiles WHERE user_id = $1', [userId]);
      
      if (companyUser.rows.length && freelancerUser.rows.length) {
        await sendApplicationSubmittedEmail(
          companyUser.rows[0].email,
          project.title,
          freelancerUser.rows[0].name || 'Unknown User',
          coverLetter
        );
        console.log('Email sent successfully');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the application if email fails
    }

    console.log('Application submitted successfully');
    res.status(201).json({ 
      message: "Application submitted successfully",
      application: applicationResult.rows[0]
    });
  } catch (error) {
    console.error('Apply to project error:', error);
    res.status(500).json({ message: "Server error applying to project" });
  }
};

// GET APPLICATIONS TO A PROJECT
exports.getProjectApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get project and its company_id
    const projectRes = await db.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const project = projectRes.rows[0];

    // Get requesting user's company_id
    const userRes = await db.query('SELECT company_id FROM users WHERE id = $1', [userId]);
    const userCompanyId = userRes.rows[0]?.company_id || null;

    // Allow if:
    // - user is the creator
    // - user is a company user and their company_id matches the project's company_id
    if (
      project.created_by === userId ||
      (userRole === 'company' && project.company_id && userCompanyId && project.company_id === userCompanyId)
    ) {
      // Allowed
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Simplified query to avoid potential database issues
    const applications = await db.query(
      `SELECT 
        a.id,
        a.project_id,
        a.freelancer_id,
        a.proposal,
        a.status,
        a.feedback,
        a.applied_at,
        a.updated_at,
        a.proposed_budget,
        a.estimated_duration_text,
        a.relevant_experience,
        up.name,
        up.photo,
        up.hourly_rate,
        up.skills,
        u.email
       FROM project_applications a
       JOIN users u ON u.id = a.freelancer_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE a.project_id = $1
       ORDER BY a.applied_at DESC`,
      [id]
    );

    // Format the applications data
    const formattedApplications = applications.rows.map(app => ({
      ...app,
      skills: app.skills || [],
      created_at: app.applied_at,
      updated_at: app.updated_at,
      // Add default values for missing fields
      average_rating: 0,
      total_reviews: 0,
      accepted_applications: 0,
      total_applications: 0,
      success_rate: 0
    }));

    res.status(200).json(formattedApplications);
  } catch (error) {
    console.error('Error fetching project applications:', error);
    res.status(500).json({ 
      message: "Server error fetching applications",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE APPLICATION STATUS
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;
    const { status, feedback } = req.body;
    const userId = req.user.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const project = await db.query(
      "SELECT * FROM projects WHERE id = $1 AND created_by = $2",
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const application = await db.query(
      "SELECT * FROM project_applications WHERE id = $1 AND project_id = $2",
      [applicationId, projectId]
    );

    if (application.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update application with feedback if provided
    const updateQuery = feedback 
      ? "UPDATE project_applications SET status = $1, feedback = $2 WHERE id = $3 RETURNING *"
      : "UPDATE project_applications SET status = $1 WHERE id = $2 RETURNING *";
    
    const updateParams = feedback 
      ? [status, feedback, applicationId]
      : [status, applicationId];

    const updated = await db.query(updateQuery, updateParams);

    if (status === "accepted") {
      await db.query(
        "INSERT INTO project_team (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [projectId, application.rows[0].freelancer_id]
      );

      if (project.rows[0].status === "open") {
        await db.query("UPDATE projects SET status = $1 WHERE id = $2", [
          "in-progress",
          projectId,
        ]);
      }

      // Fetch company name
      let companyName = '';
      try {
        const companyRes = await db.query('SELECT name FROM user_profiles WHERE user_id = $1', [userId]);
        if (companyRes.rows.length) companyName = companyRes.rows[0].name;
      } catch {}

      // Create enhanced notification
      try {
        await createApplicationStatusNotification(
          application.rows[0].freelancer_id,
          userId,
          projectId,
          project.rows[0].title,
          'accepted',
          companyName,
          feedback
        );
      } catch (notificationError) {
        console.error('Failed to create application accepted notification:', notificationError);
      }
      
      // Send email to freelancer
      const freelancerUser = await db.query('SELECT email FROM users WHERE id = $1', [application.rows[0].freelancer_id]);
      if (freelancerUser.rows.length) {
        await sendApplicationStatusEmail(
          freelancerUser.rows[0].email,
          project.rows[0].title,
          'accepted',
          feedback
        );
      }
    } else {
      // Fetch company name
      let companyName = '';
      try {
        const companyRes = await db.query('SELECT name FROM user_profiles WHERE user_id = $1', [userId]);
        if (companyRes.rows.length) companyName = companyRes.rows[0].name;
      } catch {}
      // Create enhanced notification
      try {
        await createApplicationStatusNotification(
          application.rows[0].freelancer_id,
          userId,
          projectId,
          project.rows[0].title,
          'rejected',
          companyName,
          feedback
        );
      } catch (notificationError) {
        console.error('Failed to create application rejected notification:', notificationError);
      }
      
      // Send email to freelancer
      const freelancerUser = await db.query('SELECT email FROM users WHERE id = $1', [application.rows[0].freelancer_id]);
      if (freelancerUser.rows.length) {
        await sendApplicationStatusEmail(
          freelancerUser.rows[0].email,
          project.rows[0].title,
          'rejected',
          feedback
        );
      }
    }

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROJECT STATUS
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["open", "in-progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const project = await db.query(
      "SELECT * FROM projects WHERE id = $1 AND created_by = $2",
      [id, userId]
    );

    if (project.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await db.query(
      "UPDATE projects SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (status === "completed" || status === "cancelled") {
      const team = await db.query(
        "SELECT user_id FROM project_team WHERE project_id = $1",
        [id]
      );

      const notificationPromises = team.rows.map(async (member) => {
        await createNotification(
          member.user_id,
          userId,
          "project-update",
          `Project has been ${status}`,
          "project",
          id
        );
      });

      await Promise.all(notificationPromises);
    }

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE PROJECT (company only)
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // Only allow if the user is the creator
    const project = await db.query('SELECT * FROM projects WHERE id = $1 AND created_by = $2', [id, userId]);
    if (project.rows.length === 0) {
      return res.status(403).json({ message: 'Forbidden: You do not own this project.' });
    }
    // Delete related project_files
    await db.query('DELETE FROM project_files WHERE project_id = $1', [id]);
    // Delete related applications
    await db.query('DELETE FROM project_applications WHERE project_id = $1', [id]);
    // Delete related tasks
    await db.query('DELETE FROM tasks WHERE project_id = $1', [id]);
    // Delete the project itself
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

// GET PROJECTS BELONGING TO USER
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await db.query(
      `SELECT p.*, 
       CASE 
         WHEN p.created_by = $1 THEN 'owner'
         ELSE 'member' 
       END as user_role
       FROM projects p
       LEFT JOIN project_team pt ON p.id = pt.project_id
       WHERE p.created_by = $1 OR pt.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.status(200).json(projects.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL APPLICATIONS BY LOGGED-IN FREELANCER
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await db.query(
      `SELECT a.*, p.title as project_title, p.created_by as company_id, u.name as company_name
       FROM project_applications a
       JOIN projects p ON a.project_id = p.id
       JOIN users u ON p.created_by = u.id
       WHERE a.freelancer_id = $1
       ORDER BY a.createdAt DESC`,
      [userId]
    );
    res.status(200).json(applications.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// GET ALL APPLICATIONS FOR ALL PROJECTS OWNED BY COMPANY
exports.getCompanyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching company applications for user:', userId);
    
    // First, let's check if the user has any projects
    const userProjects = await db.query(
      'SELECT id, title FROM projects WHERE created_by = $1',
      [userId]
    );
    
    console.log('User projects found:', userProjects.rows.length);
    
    if (userProjects.rows.length === 0) {
      return res.status(200).json([]);
    }
    
    // Now get applications with a more robust query that handles both proposal and cover_letter
    const applications = await db.query(
      `SELECT 
        a.id,
        a.project_id,
        a.freelancer_id,
        COALESCE(a.cover_letter, a.proposal) as proposal,
        a.cover_letter,
        a.proposal as original_proposal,
        a.status,
        a.feedback,
        a.applied_at,
        a.proposed_budget,
        a.estimated_duration_text,
        a.relevant_experience,
        p.title as project_title,
        u.email as freelancer_email,
        COALESCE(up.name, u.email) as freelancer_name,
        up.photo as freelancer_photo,
        up.hourly_rate,
        up.skills
       FROM project_applications a
       JOIN projects p ON a.project_id = p.id
       JOIN users u ON u.id = a.freelancer_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE p.created_by = $1
       ORDER BY a.applied_at DESC`,
      [userId]
    );
    
    console.log('Applications found:', applications.rows.length);
    
    // Helper to robustly parse skills as array
    function parseSkills(skills) {
      if (Array.isArray(skills)) return skills;
      if (typeof skills === 'string') {
        try {
          const arr = JSON.parse(skills);
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      }
      if (skills) return [skills];
      return [];
    }
    // Transform the data to match frontend expectations
    const transformedApplications = applications.rows.map(app => ({
      id: app.id,
      project_id: app.project_id,
      freelancer_id: app.freelancer_id,
      proposal: app.proposal || app.cover_letter || 'No proposal provided',
      cover_letter: app.cover_letter || app.proposal || 'No cover letter provided',
      status: app.status,
      feedback: app.feedback,
      applied_at: app.applied_at,
      proposed_budget: app.proposed_budget,
      estimated_duration_text: app.estimated_duration_text,
      relevant_experience: app.relevant_experience,
      project_title: app.project_title,
      freelancer_email: app.freelancer_email,
      freelancer_name: app.freelancer_name,
      freelancer_photo: app.freelancer_photo,
      hourly_rate: app.hourly_rate,
      skills: parseSkills(app.skills)
    }));
    
    res.status(200).json(transformedApplications);
  } catch (error) {
    console.error('Error in getCompanyApplications:', error);
    res.status(500).json({ message: 'Server error fetching company applications', error: error.message });
  }
};

// GET PROJECT TEAM MEMBERS
exports.getProjectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await db.query(
      `SELECT u.id, up.name, u.email, up.photo as profile_picture
       FROM project_team pt
       JOIN users u ON pt.user_id = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE pt.project_id = $1`,
      [id]
    );
    res.status(200).json(team.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching project team' });
  }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, tags, budget, deadline, status } = req.body;

    // Parse tags if sent as JSON string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Update project fields
    const updateFields = [];
    const params = [];
    let idx = 1;
    if (title) { updateFields.push(`title = $${idx++}`); params.push(title); }
    if (description) { updateFields.push(`description = $${idx++}`); params.push(description); }
    if (parsedTags) { updateFields.push(`tags = $${idx++}`); params.push(parsedTags); }
    if (budget) { updateFields.push(`budget = $${idx++}`); params.push(budget); }
    if (deadline) { updateFields.push(`deadline = $${idx++}`); params.push(deadline); }
    if (status) { updateFields.push(`status = $${idx++}`); params.push(status); }
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    params.push(id);
    const updateQuery = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await db.query(updateQuery, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Handle new file uploads
    const fileIds = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileRecord = await uploadFile(file, userId);
        fileIds.push(fileRecord.id);
      }
      for (const fileId of fileIds) {
        await db.query(
          `INSERT INTO project_files (project_id, file_id) VALUES ($1, $2)`,
          [id, fileId]
        );
      }
    }
    // Return updated project with files
    const files = await db.query(
      'SELECT * FROM project_files WHERE project_id = $1',
      [id]
    );
    res.status(200).json({ ...result.rows[0], files: files.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// CANCEL PROJECT (company only)
exports.cancelProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // Only allow if the user is the creator
    const project = await db.query('SELECT * FROM projects WHERE id = $1 AND created_by = $2', [id, userId]);
    if (project.rows.length === 0) {
      return res.status(403).json({ message: 'Forbidden: You do not own this project.' });
    }
    // Set status to cancelled
    await db.query('UPDATE projects SET status = $1 WHERE id = $2', ['cancelled', id]);

    // Notify all team members and the owner
    try {
      // Notify the owner
      await createNotification(
        userId,
        userId,
        'project',
        `Your project "${project.rows[0].title}" has been cancelled.`,
        'project',
        id
      );
      // Notify all team members (except owner)
      const teamRes = await db.query(
        'SELECT user_id FROM project_team WHERE project_id = $1 AND user_id != $2',
        [id, userId]
      );
      for (const member of teamRes.rows) {
        await createNotification(
          userId,
          member.user_id,
          'project',
          `The project "${project.rows[0].title}" you are part of has been cancelled.`,
          'project',
          id
        );
      }
    } catch (notifyErr) {
      console.error('Notification error on cancel:', notifyErr);
    }

    res.status(200).json({ message: 'Project cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error cancelling project' });
  }
};
