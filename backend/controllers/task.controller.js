const db = require('../config/db');
const { createTaskAssignedNotification } = require('../services/notification.service');

// Helper to check if user is project owner or assigned member
async function hasTaskPermission(userId, projectId, taskId = null) {
  // Check if user is project owner
  const projectOwner = await db.query('SELECT created_by FROM projects WHERE id = $1', [projectId]);
  if (projectOwner.rows.length && projectOwner.rows[0].created_by === userId) return true;
  // If taskId is provided, check if user is assigned to the task
  if (taskId) {
    const task = await db.query('SELECT assigned_to FROM tasks WHERE id = $1', [taskId]);
    if (task.rows.length && task.rows[0].assigned_to === userId) return true;
  }
  return false;
}

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    // Permission: Only project owner can create tasks
    const projectOwner = await db.query('SELECT created_by FROM projects WHERE id = $1', [projectId]);
    if (!projectOwner.rows.length || projectOwner.rows[0].created_by !== userId) {
      return res.status(403).json({ message: 'Only the project owner can create tasks.' });
    }
    console.log('=== CREATE TASK DEBUG ===');
    console.log('Full request object:', {
      params: req.params,
      body: req.body,
      files: req.files,
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path
    });

    const {
      title,
      description,
      due_date,
      assigned_to,
      checklist,
      status
    } = req.body;

    console.log('=== ASSIGNED_TO DEBUG ===');
    console.log('Raw assigned_to value:', assigned_to);
    console.log('Type of assigned_to:', typeof assigned_to);
    console.log('assigned_to === "":', assigned_to === '');
    console.log('assigned_to === null:', assigned_to === null);
    console.log('assigned_to === undefined:', assigned_to === undefined);
    console.log('assigned_to.trim():', assigned_to ? assigned_to.trim() : 'N/A');

    console.log('Project ID from params:', projectId);
    console.log('All params:', req.params);
    
    if (!projectId) {
      console.log('ERROR: Project ID is missing from params');
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // Convert projectId to integer
    const projectIdInt = parseInt(projectId, 10);
    if (isNaN(projectIdInt)) {
      console.log('ERROR: Invalid Project ID format:', projectId);
      return res.status(400).json({ message: 'Invalid Project ID format' });
    }

    console.log('Project ID converted to int:', projectIdInt);

    const files = req.files || [];

    // Handle assigned_to - convert empty string to null
    let assignedToValue = null;
    if (assigned_to && assigned_to.trim() !== '' && assigned_to !== 'null') {
      assignedToValue = parseInt(assigned_to, 10);
      if (isNaN(assignedToValue)) {
        return res.status(400).json({ message: 'Invalid assigned_to value' });
      }
    }

    console.log('About to insert task with project_id:', projectIdInt);
    console.log('SQL Parameters:', [
      projectIdInt,
      title,
      description,
      due_date,
      assignedToValue,
      JSON.stringify(checklist || []),
      status || 'todo'
    ]);
    console.log('assignedToValue type:', typeof assignedToValue);
    console.log('assignedToValue value:', assignedToValue);
    
    // Temporarily test without assigned_to to isolate the issue
    const taskResult = await db.query(
      `INSERT INTO tasks (project_id, title, description, due_date, checklist, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        projectIdInt,
        title,
        description,
        due_date,
        JSON.stringify(checklist || []),
        status || 'todo'
      ]
    );

    const task = taskResult.rows[0];
    console.log('Task created successfully:', task);

    // Handle file attachments
    for (const file of files) {
      const fileUrl = file.path || file.url;
      if (!fileUrl) {
        console.warn('Skipping file with missing URL:', file);
        continue;
      }
      await db.query(
        `INSERT INTO task_attachments (task_id, file_url, file_name, file_size, file_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [task.id, fileUrl, file.originalname, file.size, file.mimetype]
      );
    }

    // Get task with full details including assigned user info
    const fullTaskResult = await db.query(
      `SELECT t.*, 
              up.name as assigned_to_name, 
              up.photo as assigned_to_photo,
              u.email as assigned_to_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE t.id = $1`,
      [task.id]
    );

    res.status(201).json({ ...fullTaskResult.rows[0], project: projectIdInt });
  } catch (err) {
    console.error('Create Task Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get tasks for a project with enhanced details
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { search, status, assignee, dueDate } = req.query;
    
    let query = `
      SELECT t.*, 
             up.name as assigned_to_name, 
             up.photo as assigned_to_photo,
             u.email as assigned_to_email,
             COUNT(ta.id) as attachment_count,
             COUNT(c.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN task_attachments ta ON t.id = ta.task_id
      LEFT JOIN comments c ON t.id = c.parent_id AND c.parent_type = 'task'
      WHERE t.project_id = $1
    `;
    
    const params = [projectId];
    let idx = 2;
    
    if (search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      query += ` AND t.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (assignee) {
      query += ` AND t.assigned_to = $${idx}`;
      params.push(assignee);
      idx++;
    }
    if (dueDate) {
      query += ` AND t.due_date <= $${idx}`;
      params.push(dueDate);
      idx++;
    }
    
    query += ' GROUP BY t.id, up.name, up.photo, u.email ORDER BY t.created_at ASC';
    
    const result = await db.query(query, params);
    
    // Add project field to each task for frontend compatibility
    const tasksWithProject = result.rows.map(task => ({
      ...task,
      project: parseInt(projectId, 10)
    }));
    res.status(200).json(tasksWithProject);
  } catch (err) {
    console.error('Get Tasks Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get project team members for assignment
exports.getProjectTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await db.query(
      `SELECT DISTINCT u.id, u.email, u.role, up.name, up.photo
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN project_team pt ON u.id = pt.user_id
       LEFT JOIN projects p ON p.created_by = u.id
       WHERE pt.project_id = $1 OR p.id = $1
       ORDER BY up.name`,
      [projectId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Project Team Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to update status.' });
    }
    const { status } = req.body;

    const result = await db.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ ...result.rows[0], project: result.rows[0].project_id });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update task details
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to update this task.' });
    }
    const { title, description, due_date, assigned_to, checklist } = req.body;

    // Handle assigned_to - convert empty string to null
    let assignedToValue = null;
    if (assigned_to && assigned_to.trim() !== '' && assigned_to !== 'null') {
      assignedToValue = parseInt(assigned_to, 10);
      if (isNaN(assignedToValue)) {
        return res.status(400).json({ message: 'Invalid assigned_to value' });
      }
    }

    const result = await db.query(
      `UPDATE tasks 
       SET title = $1, description = $2, due_date = $3, assigned_to = $4, checklist = $5, updated_at = NOW() 
       WHERE id = $6 
       RETURNING *`,
      [title, description, due_date, assignedToValue, JSON.stringify(checklist || []), taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get updated task with full details
    const fullTaskResult = await db.query(
      `SELECT t.*, 
              up.name as assigned_to_name, 
              up.photo as assigned_to_photo,
              u.email as assigned_to_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE t.id = $1`,
      [taskId]
    );

    res.status(200).json({ ...fullTaskResult.rows[0], project: fullTaskResult.rows[0].project_id });
  } catch (err) {
    console.error('Update Task Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Add checklist item
exports.addChecklistItem = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to modify checklist.' });
    }
    const { text } = req.body;

    const taskResChecklist = await db.query('SELECT checklist FROM tasks WHERE id = $1', [taskId]);
    if (taskResChecklist.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let checklist = taskResChecklist.rows[0].checklist;
    if (typeof checklist === 'string') {
      try {
        checklist = JSON.parse(checklist);
      } catch {
        checklist = [];
      }
    }
    if (!Array.isArray(checklist)) {
      checklist = [];
    }

    const newItem = { 
      id: Date.now().toString(), 
      text: text, 
      completed: false,
      created_at: new Date().toISOString()
    };
    checklist.push(newItem);

    const update = await db.query(
      `UPDATE tasks SET checklist = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(checklist), taskId]
    );

    res.status(200).json({ task: { ...update.rows[0], project: update.rows[0].project_id }, newItem });
  } catch (err) {
    console.error('Add Checklist Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update checklist item
exports.updateChecklistItem = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to modify checklist.' });
    }
    const { itemId } = req.params;
    const { completed, text } = req.body;

    // Checklist query
    const taskResChecklist = await db.query('SELECT checklist FROM tasks WHERE id = $1', [taskId]);
    if (taskResChecklist.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    let checklist = taskResChecklist.rows[0].checklist;
    if (typeof checklist === 'string') {
      try {
        checklist = JSON.parse(checklist);
      } catch {
        checklist = [];
      }
    }
    if (!Array.isArray(checklist)) {
      checklist = [];
    }

    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed, text: text || item.text } : item
    );

    const update = await db.query(
      `UPDATE tasks SET checklist = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(updatedChecklist), taskId]
    );

    res.status(200).json({ ...update.rows[0], project: update.rows[0].project_id });
  } catch (err) {
    console.error('Update Checklist Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete checklist item
exports.deleteChecklistItem = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to modify checklist.' });
    }
    const { itemId } = req.params;

    // Checklist query
    const taskResChecklist = await db.query('SELECT checklist FROM tasks WHERE id = $1', [taskId]);
    if (taskResChecklist.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    let checklist = taskResChecklist.rows[0].checklist;
    if (typeof checklist === 'string') {
      try {
        checklist = JSON.parse(checklist);
      } catch {
        checklist = [];
      }
    }
    if (!Array.isArray(checklist)) {
      checklist = [];
    }

    const updatedChecklist = checklist.filter(item => item.id !== itemId);

    const update = await db.query(
      `UPDATE tasks SET checklist = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(updatedChecklist), taskId]
    );

    res.status(200).json({ ...update.rows[0], project: update.rows[0].project_id });
  } catch (err) {
    console.error('Delete Checklist Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Upload a file to task
exports.uploadTaskFile = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to upload files.' });
    }
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    for (const file of files) {
      // Insert into files table
      const fileResult = await db.query(
        `INSERT INTO files (filename, url, mimetype, size, uploaded_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [file.originalname, file.path || file.url, file.mimetype, file.size, userId]
      );
      const fileRow = fileResult.rows[0];
      // Link to task in task_files
      await db.query(
        `INSERT INTO task_files (task_id, file_id) VALUES ($1, $2)`,
        [taskId, fileRow.id]
      );
      uploadedFiles.push(fileRow);
    }

    res.status(200).json(uploadedFiles);
  } catch (err) {
    console.error('Upload Task File Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get task attachments
exports.getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Fetch files attached to this task via task_files join
    const result = await db.query(
      `SELECT f.* FROM files f
       JOIN task_files tf ON f.id = tf.file_id
       WHERE tf.task_id = $1
       ORDER BY f.created_at DESC`,
      [taskId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Task Attachments Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete task attachment
exports.deleteTaskAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to delete attachments.' });
    }
    const { attachmentId } = req.params;

    const result = await db.query(
      'DELETE FROM task_attachments WHERE id = $1 AND task_id = $2 RETURNING *',
      [attachmentId, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    console.error('Delete Task Attachment Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get task comments
exports.getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await db.query(
      `SELECT c.*, up.name as author_name, up.photo as author_photo
       FROM comments c
       LEFT JOIN user_profiles up ON c.author_id = up.user_id
       WHERE c.parent_id = $1 AND c.parent_type = 'task'
       ORDER BY c.created_at ASC`,
      [taskId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Task Comments Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Add task comment
exports.addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;
    const files = req.files || [];

    // Insert comment
    const result = await db.query(
      `INSERT INTO comments (content, author_id, parent_type, parent_id)
       VALUES ($1, $2, 'task', $3) RETURNING *`,
      [content, authorId, taskId]
    );
    const comment = result.rows[0];

    // Save file associations
    const fileAttachments = [];
    for (const file of files) {
      const fileResult = await db.query(
        `INSERT INTO comment_files (comment_id, file_name, file_url, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [comment.id, file.originalname, file.path || file.url, file.mimetype, file.size]
      );
      fileAttachments.push(fileResult.rows[0]);
    }

    // Get comment with author details
    const commentWithAuthor = await db.query(
      `SELECT c.*, up.name as author_name, up.photo as author_photo
       FROM comments c
       LEFT JOIN user_profiles up ON c.author_id = up.user_id
       WHERE c.id = $1`,
      [comment.id]
    );

    // Attach files to response
    const response = commentWithAuthor.rows[0];
    response.attachments = fileAttachments;

    res.status(201).json(response);
  } catch (err) {
    console.error('Add Task Comment Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Reorder tasks (drag-and-drop)
exports.reorderTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    // Only project owner can reorder tasks
    const projectOwner = await db.query('SELECT created_by FROM projects WHERE id = $1', [projectId]);
    if (!projectOwner.rows.length || projectOwner.rows[0].created_by !== userId) {
      return res.status(403).json({ message: 'Only the project owner can reorder tasks.' });
    }
    const { taskIds } = req.body; // Array of task IDs in new order
    
    // Update the order of tasks
    for (let i = 0; i < taskIds.length; i++) {
      await db.query(
        'UPDATE tasks SET order_index = $1 WHERE id = $2 AND project_id = $3',
        [i, taskIds[i], projectId]
      );
    }
    
    res.status(200).json({ message: 'Tasks reordered successfully' });
  } catch (err) {
    console.error('Reorder Tasks Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Assign task to user
exports.assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to assign this task.' });
    }
    const { assigned_to } = req.body;
    
    // Handle assigned_to - convert empty string to null
    let assignedToValue = null;
    if (assigned_to && assigned_to.trim() !== '' && assigned_to !== 'null') {
      assignedToValue = parseInt(assigned_to, 10);
      if (isNaN(assignedToValue)) {
        return res.status(400).json({ message: 'Invalid assigned_to value' });
      }
    }
    
    // Get task details first
    const taskResult = await db.query(
      'SELECT t.*, p.title as project_title FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1',
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const task = taskResult.rows[0];
    
    const result = await db.query(
      'UPDATE tasks SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [assignedToValue, taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Create notification for the assigned user
    if (assignedToValue && assignedToValue !== req.user.id) {
      try {
        await createTaskAssignedNotification(
          assignedToValue, // recipient
          req.user.id, // sender
          taskId,
          task.title
        );
      } catch (notificationError) {
        console.error('Failed to create task assignment notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }
    
    // Get updated task with full details
    const fullTaskResult = await db.query(
      `SELECT t.*, 
              up.name as assigned_to_name, 
              up.photo as assigned_to_photo,
              u.email as assigned_to_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE t.id = $1`,
      [taskId]
    );
    
    res.status(200).json({ ...fullTaskResult.rows[0], project: fullTaskResult.rows[0].project_id });
  } catch (err) {
    console.error('Assign Task Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get projectId from task
    const taskResProject = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (!taskResProject.rows.length) return res.status(404).json({ message: 'Task not found' });
    const projectId = taskResProject.rows[0].project_id;
    const userId = req.user.id;
    if (!(await hasTaskPermission(userId, projectId, taskId))) {
      return res.status(403).json({ message: 'Not authorized to delete this task.' });
    }
    
    // Delete task attachments first
    await db.query('DELETE FROM task_attachments WHERE task_id = $1', [taskId]);
    
    // Delete task comments
    await db.query('DELETE FROM comments WHERE parent_id = $1 AND parent_type = $2', [taskId, 'task']);
    
    // Delete the task
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete Task Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Test endpoint for debugging
exports.testTaskCreation = async (req, res) => {
  try {
    console.log('=== TEST TASK CREATION ===');
    console.log('Request body:', req.body);
    
    const { title, description, due_date, assigned_to, checklist, status } = req.body;
    
    // Test the exact same logic as createTask
    let assignedToValue = null;
    if (assigned_to && assigned_to.trim() !== '' && assigned_to !== 'null') {
      assignedToValue = parseInt(assigned_to, 10);
      if (isNaN(assignedToValue)) {
        return res.status(400).json({ message: 'Invalid assigned_to value' });
      }
    }
    
    console.log('Processed assignedToValue:', assignedToValue);
    console.log('Type of assignedToValue:', typeof assignedToValue);
    
    // Test with a simple insert
    const testResult = await db.query(
      `INSERT INTO tasks (project_id, title, description, due_date, assigned_to, checklist, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, assigned_to`,
      [1, title || 'Test Task', description || 'Test Description', due_date, assignedToValue, JSON.stringify(checklist || []), status || 'todo']
    );
    
    console.log('Test insert successful:', testResult.rows[0]);
    
    // Clean up - delete the test task
    await db.query('DELETE FROM tasks WHERE id = $1', [testResult.rows[0].id]);
    
    res.status(200).json({ 
      message: 'Test successful', 
      assignedToValue, 
      type: typeof assignedToValue,
      result: testResult.rows[0]
    });
  } catch (err) {
    console.error('Test Task Creation Error:', err);
    res.status(400).json({ message: err.message, stack: err.stack });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await db.query(
      `SELECT t.*, 
              up.name as assigned_to_name, 
              up.photo as assigned_to_photo,
              u.email as assigned_to_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE t.id = $1`,
      [taskId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Get Task By ID Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Global search for tasks by title or assigned user
exports.searchTasks = async (req, res) => {
  try {
    const { search, assignee } = req.query;
    let query = `
      SELECT t.*, 
             up.name as assigned_to_name, 
             up.photo as assigned_to_photo,
             u.email as assigned_to_email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (assignee) {
      query += ` AND (t.assigned_to = $${idx} OR up.name ILIKE $${idx})`;
      params.push(assignee, `%${assignee}%`);
      idx++;
    }

    query += ' ORDER BY t.created_at DESC LIMIT 20';

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error searching tasks' });
  }
};
