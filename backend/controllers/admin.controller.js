const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let query = `
      SELECT u.id, u.email, u.role, u.is_verified, u.is_active, u.is_banned, u.created_at,
      up.name, up.photo
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (role) {
      query += ` AND u.role = $${paramCount++}`;
      params.push(role);
    }
    
    if (search) {
      query += ` AND (u.email ILIKE $${paramCount} OR up.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    const users = await db.query(query, params);
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const updated = await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, userId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updated = await db.query(
      'UPDATE users SET is_banned = TRUE WHERE id = $1 RETURNING *',
      [userId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User banned', user: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updated = await db.query(
      'UPDATE users SET is_banned = FALSE WHERE id = $1 RETURNING *',
      [userId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User unbanned', user: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT p.*, up.name as creator_name, up.photo as creator_photo
      FROM projects p
      JOIN user_profiles up ON p.created_by = up.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (status) {
      query += ` AND p.status = $${paramCount++}`;
      params.push(status);
    }
    
    if (search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const projects = await db.query(query, params);
    res.status(200).json(projects.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    if (!['open', 'in-progress', 'completed', 'cancelled', 'banned', 'deleted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await db.query(
      'UPDATE projects SET status = $1 WHERE id = $2 RETURNING *',
      [status, projectId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.banProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updated = await db.query(
      "UPDATE projects SET status = 'banned' WHERE id = $1 RETURNING *",
      [projectId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project banned', project: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unbanProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updated = await db.query(
      "UPDATE projects SET status = 'open' WHERE id = $1 RETURNING *",
      [projectId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project unbanned', project: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const usersByRole = await db.query(
      `SELECT role, COUNT(*) as count 
       FROM users 
       WHERE is_verified = TRUE AND is_active = TRUE
       GROUP BY role`
    );
    const projectsByStatus = await db.query(
      `SELECT status, COUNT(*) as count 
       FROM projects 
       GROUP BY status`
    );
    const totalUsers = await db.query('SELECT COUNT(*) FROM users');
    const totalProjects = await db.query('SELECT COUNT(*) FROM projects');
    const totalTasks = await db.query('SELECT COUNT(*) FROM tasks');
    const totalComments = await db.query('SELECT COUNT(*) FROM comments');
    const totalFiles = await db.query('SELECT COUNT(*) FROM files');
    res.status(200).json({
      usersByRole: usersByRole.rows,
      projectsByStatus: projectsByStatus.rows,
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalProjects: parseInt(totalProjects.rows[0].count),
      totalTasks: parseInt(totalTasks.rows[0].count),
      totalComments: parseInt(totalComments.rows[0].count),
      totalFiles: parseInt(totalFiles.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updated = await db.query(
      'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING *',
      [userId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User soft deleted', user: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updated = await db.query(
      "UPDATE projects SET status = 'deleted' WHERE id = $1 RETURNING *",
      [projectId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project soft deleted', project: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};