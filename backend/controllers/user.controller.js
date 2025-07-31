const db = require('../config/db');
const { uploadFile } = require('../services/file.service');

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    const user = await db.query(
      `SELECT u.id, u.email, u.role, u.is_verified, u.created_at, 
       up.name, up.bio, up.photo, up.hourly_rate as "hourlyRate", up.skills
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, hourlyRate, skills } = req.body;
    const userId = req.user.id;

    const existingProfile = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      await db.query(
        `UPDATE user_profiles 
         SET name = $1, bio = $2, hourly_rate = $3, skills = $4, updated_at = NOW()
         WHERE user_id = $5`,
        [name, bio, hourlyRate, skills, userId]
      );
    } else {
      await db.query(
        `INSERT INTO user_profiles (user_id, name, bio, hourly_rate, skills)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, name, bio, hourlyRate, skills]
      );
    }

    const user = await db.query(
      `SELECT u.id, u.email, u.role, u.is_verified, u.created_at, 
       up.name, up.bio, up.photo, up.hourly_rate as "hourlyRate", up.skills
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );
    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Profile Photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = await uploadFile(req.file, req.user.id);

    await db.query(
      'UPDATE user_profiles SET photo = $1 WHERE user_id = $2',
      [file.url, req.user.id]
    );

    res.status(200).json({ photoUrl: file.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search Users
const searchUsers = async (req, res) => {
  try {
    const { name, skills, role } = req.query;

    let query = `
      SELECT u.id, u.email, u.role, up.name, up.photo, up.skills
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.is_active = TRUE AND u.is_verified = TRUE
    `;
    const params = [];
    let paramCount = 1;

    if (name) {
      query += ` AND up.name ILIKE $${paramCount++}`;
      params.push(`%${name}%`);
    }

    if (skills) {
      // Ensure skills is a Postgres array
      const skillArray = skills.split(',').map(s => s.trim());
      query += ` AND up.skills @> $${paramCount++}::text[]`;
      params.push(skillArray);
    }

    if (role) {
      query += ` AND u.role = $${paramCount++}`;
      params.push(role);
    }

    query += ' LIMIT 20';

    const users = await db.query(query, params);
    res.status(200).json(users.rows);
  } catch (error) {
    console.error(error); // For debugging
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Users (Admin View)
const getAllUsers = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.email, u.role, u.is_verified, u.created_at, 
       up.name, up.bio, up.photo, up.hourly_rate as "hourlyRate", up.skills
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.is_active = TRUE
       ORDER BY u.created_at DESC
       LIMIT 20`
    );

    res.status(200).json(users.rows);
  } catch (error) {
    res.status(500).json({ message: 'NO users found' });
  }
};

// Update User Skills
const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const userId = req.user.id;

    await db.query(
      'UPDATE user_profiles SET skills = $1, updated_at = NOW() WHERE user_id = $2',
      [skills, userId]
    );

    // Return the updated profile
    const user = await db.query(
      `SELECT u.id, u.email, u.role, u.is_verified, u.created_at, 
       up.name, up.bio, up.photo, up.hourly_rate as "hourlyRate", up.skills
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );
    res.status(200).json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Public Profile (only public fields)
const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get basic user info
    const user = await db.query(
      `SELECT u.id, u.role, u.is_verified, u.created_at, up.name, up.bio, up.photo, up.skills, up.hourly_rate
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1 AND u.is_active = TRUE AND u.is_banned = FALSE`,
      [userId]
    );
    
    if (!user.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.rows[0];

    // Get user statistics
    const stats = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM projects WHERE created_by = $1) as projects_created,
        (SELECT COUNT(*) FROM project_applications WHERE freelancer_id = $1) as applications_submitted,
        (SELECT COUNT(*) FROM project_applications WHERE freelancer_id = $1 AND status = 'accepted') as projects_completed,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1) as tasks_assigned,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'done') as tasks_completed,
        (SELECT COUNT(*) FROM comments WHERE author_id = $1) as comments_made`,
      [userId]
    );

    // Get recent projects (created or participated in)
    const recentProjects = await db.query(
      `SELECT DISTINCT p.id, p.title, p.description, p.status, p.created_at, p.budget,
        CASE 
          WHEN p.created_by = $1 THEN 'created'
          WHEN pa.freelancer_id = $1 THEN 'participated'
          ELSE 'assigned'
        END as involvement_type
       FROM projects p
       LEFT JOIN project_applications pa ON p.id = pa.project_id AND pa.freelancer_id = $1
       LEFT JOIN project_team pt ON p.id = pt.project_id AND pt.user_id = $1
       WHERE p.created_by = $1 OR pa.freelancer_id = $1 OR pt.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get recent activity (comments, applications, etc.)
    const recentActivity = await db.query(
      `(SELECT 'comment' as type, c.created_at, c.content as description, 
         p.title as project_title, p.id as project_id
        FROM comments c
        JOIN projects p ON c.parent_id = p.id AND c.parent_type = 'project'
        WHERE c.author_id = $1)
       UNION ALL
       (SELECT 'application' as type, pa.applied_at as created_at, 
         CONCAT('Applied to ', p.title) as description,
         p.title as project_title, p.id as project_id
        FROM project_applications pa
        JOIN projects p ON pa.project_id = p.id
        WHERE pa.freelancer_id = $1)
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    // Get skills with proficiency levels (if available)
    let skillsArr = [];
    if (Array.isArray(userData.skills)) {
      skillsArr = userData.skills;
    } else if (typeof userData.skills === 'string') {
      try {
        skillsArr = JSON.parse(userData.skills);
        if (!Array.isArray(skillsArr)) skillsArr = [];
      } catch {
        skillsArr = [];
      }
    } else if (userData.skills) {
      skillsArr = [userData.skills];
    }
    const skillsWithLevels = skillsArr.map(skill => ({
      name: skill,
      level: 'intermediate' // Default level, can be enhanced later
    }));

    // Calculate success rate
    const successRate = stats.rows[0].applications_submitted > 0 
      ? Math.round((stats.rows[0].projects_completed / stats.rows[0].applications_submitted) * 100)
      : 0;

    // Calculate average rating (placeholder for future implementation)
    const averageRating = 4.5; // Placeholder
    const totalReviews = 12; // Placeholder

    const enhancedProfile = {
      // Basic info
      id: userData.id,
      name: userData.name,
      bio: userData.bio,
      photo: userData.photo,
      role: userData.role,
      isVerified: userData.is_verified,
      createdAt: userData.created_at,
      hourlyRate: userData.hourly_rate,
      
      // Enhanced skills
      skills: skillsWithLevels,
      
      // Statistics
      stats: {
        projectsCreated: parseInt(stats.rows[0].projects_created) || 0,
        applicationsSubmitted: parseInt(stats.rows[0].applications_submitted) || 0,
        projectsCompleted: parseInt(stats.rows[0].projects_completed) || 0,
        tasksAssigned: parseInt(stats.rows[0].tasks_assigned) || 0,
        tasksCompleted: parseInt(stats.rows[0].tasks_completed) || 0,
        commentsMade: parseInt(stats.rows[0].comments_made) || 0,
        successRate,
        averageRating,
        totalReviews
      },
      
      // Recent activity
      recentProjects: recentProjects.rows,
      recentActivity: recentActivity.rows,
      
      // Social metrics (placeholders for future implementation)
      social: {
        followers: 0,
        following: 0,
        isFollowing: false // Will be implemented when following system is added
      }
    };

    res.json(enhancedProfile);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User stats (stub)
const getUserStats = async (req, res) => {
  // TODO: Implement user stats logic
  res.json({ projects: 0, tasks: 0, comments: 0 });
};

// Update user settings (stub)
const updateUserSettings = async (req, res) => {
  // TODO: Implement update user settings logic
  res.json({ message: 'User settings updated' });
};

// Change password (stub)
const changePassword = async (req, res) => {
  // TODO: Implement change password logic
  res.json({ message: 'Password changed' });
};

// Delete profile photo (stub)
const deleteProfilePhoto = async (req, res) => {
  // TODO: Implement delete profile photo logic
  res.json({ message: 'Profile photo deleted' });
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await db.query(
      `SELECT u.id, u.email, u.role, u.is_verified, u.created_at, 
       up.name, up.bio, up.photo, up.hourly_rate as "hourlyRate", up.skills
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all unique skills
const getAllSkills = async (req, res) => {
  try {
    console.log('getAllSkills called');
    
    // Simple query to get all skills
    const result = await db.query(`
      SELECT DISTINCT unnest(skills) as skill 
      FROM user_profiles 
      WHERE skills IS NOT NULL 
      AND array_length(skills, 1) > 0
    `);
    
    const skills = result.rows
      .map(row => row.skill)
      .filter(Boolean)
      .sort();
    
    // If no skills found, return default skills
    if (skills.length === 0) {
      return res.json([
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 
        'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 
        'Docker', 'Git', 'TypeScript', 'Vue.js', 'Angular', 'PHP'
      ]);
    }
    
    res.json(skills);
  } catch (error) {
    console.error('getAllSkills error:', error);
    // Return default skills on error
    res.json([
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 
      'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 
      'Docker', 'Git', 'TypeScript', 'Vue.js', 'Angular', 'PHP'
    ]);
  }
};

// Add getUserImages controller
const getUserImages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const images = await db.query('SELECT url FROM files WHERE uploaded_by = $1 ORDER BY id DESC', [userId]);
    res.status(200).json(images.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch images' });
  }
};

// PATCH /api/companies/:companyId/name
const updateCompanyName = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;
    // Only allow if user belongs to this company
    const userRes = await db.query('SELECT company_id FROM users WHERE id = $1', [userId]);
    if (!userRes.rows.length || userRes.rows[0].company_id != companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Company name is required.' });
    }
    // Update company name
    const result = await db.query('UPDATE companies SET name = $1 WHERE id = $2 RETURNING *', [name, companyId]);
    res.status(200).json({ company: result.rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/companies/:companyId
const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await db.query('SELECT * FROM companies WHERE id = $1', [companyId]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ company: result.rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Export all controllers with expected names
module.exports = {
  getUserProfile: getProfile,
  updateUserProfile: updateProfile,
  uploadProfilePhoto,
  getPublicProfile,
  getUserStats,
  updateUserSettings,
  changePassword,
  deleteProfilePhoto,
  getUserById,
  searchUsers,
  getAllUsers,
  updateSkills,
  getAllSkills,
  getUserImages,
  updateCompanyName,
  getCompanyById
};