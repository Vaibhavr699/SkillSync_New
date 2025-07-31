const db = require('../config/db');
const { createCommentNotification } = require('../services/notification.service');
const { uploadToCloudinary, uploadFile } = require('../services/file.service');

// Create a comment (project/task, supports nesting and file attachments)
exports.createComment = async (req, res) => {
  try {
    console.log('CreateComment payload:', req.body, req.files);
    const { parentId, entityId, entityType, content, replyTo } = req.body; // entityType: 'project' | 'task'
    const files = req.files || [];
    const userId = req.user.id;

    // Insert comment with reply_to support
    const commentResult = await db.query(
      `INSERT INTO comments (author_id, parent_id, parent_type, content, reply_to, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [userId, entityId, entityType, content, replyTo || null]
    );
    const comment = commentResult.rows[0];

    // Get author information
    const authorResult = await db.query(
      `SELECT up.name, up.photo FROM user_profiles up WHERE up.user_id = $1`,
      [userId]
    );
    const author = authorResult.rows[0];

    // Attach files if any
    const fileAttachments = [];
    for (const file of files) {
      // Save file to storage and DB, get file record
      const fileRecord = await uploadFile(file, userId);
      // Link file to comment
      await db.query(
        `INSERT INTO comment_files (comment_id, file_id)
         VALUES ($1, $2)`,
        [comment.id, fileRecord.id]
      );
      // Fetch full file info
      const fileInfoResult = await db.query(
        `SELECT f.id, f.filename, f.url, f.size, f.mimetype
         FROM files f WHERE f.id = $1`,
        [fileRecord.id]
      );
      if (fileInfoResult.rows.length > 0) {
        fileAttachments.push(fileInfoResult.rows[0]);
      }
    }

    // Create notification for task comments (not for project comments or replies)
    if (entityType === 'task' && !replyTo) {
      try {
        // Get task details
        const taskResult = await db.query(
          'SELECT t.*, p.title as project_title FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1',
          [entityId]
        );
        
        if (taskResult.rows.length > 0) {
          const task = taskResult.rows[0];
          
          // Notify task assignee if different from comment author
          if (task.assigned_to && task.assigned_to !== userId) {
            await createCommentNotification(
              task.assigned_to, // recipient
              userId, // sender
              entityId, // taskId
              task.title // taskTitle
            );
          }
          
          // Notify project owner if different from comment author and task assignee
          if (task.project_id) {
            const projectResult = await db.query(
              'SELECT created_by FROM projects WHERE id = $1',
              [task.project_id]
            );
            
            if (projectResult.rows.length > 0) {
              const projectOwnerId = projectResult.rows[0].created_by;
              if (projectOwnerId !== userId && projectOwnerId !== task.assigned_to) {
                await createCommentNotification(
                  projectOwnerId, // recipient
                  userId, // sender
                  entityId, // taskId
                  task.title // taskTitle
                );
              }
            }
          }
        }
      } catch (notificationError) {
        console.error('Failed to create comment notification:', notificationError);
        // Don't fail the comment creation if notification fails
      }
    }

    // Only check for parent comment if replyTo is present and not null/undefined
    if (replyTo !== undefined && replyTo !== null && replyTo !== '') {
      try {
        // Get parent comment
        const parentCommentResult = await db.query('SELECT * FROM comments WHERE id = $1', [replyTo]);
        if (parentCommentResult.rows.length === 0) {
          return res.status(400).json({ message: 'Parent comment (replyTo) not found' });
        }
        const parentComment = parentCommentResult.rows[0];
        if (parentComment.author_id !== userId) {
          await createCommentNotification(
            parentComment.author_id, // recipient
            userId, // sender
            entityId, // taskId or projectId
            'You have a new reply to your comment.'
          );
        }
      } catch (notificationError) {
        console.error('Failed to create reply notification:', notificationError);
      }
    }

    // NEW: Notification for project-level comments
    if (entityType === 'project' && !replyTo) {
      try {
        // Get project owner
        const projectResult = await db.query('SELECT created_by FROM projects WHERE id = $1', [entityId]);
        if (projectResult.rows.length > 0) {
          const projectOwnerId = projectResult.rows[0].created_by;
          if (projectOwnerId !== userId) {
            await createCommentNotification(
              projectOwnerId, // recipient
              userId, // sender
              entityId, // projectId
              'New comment on your project.'
            );
          }
        }
      } catch (notificationError) {
        console.error('Failed to create project comment notification:', notificationError);
      }
    }

    // Return comment in the same format as getComments
    const responseComment = {
      _id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      isEdited: comment.is_edited,
      replyTo: comment.reply_to,
      author: {
        _id: comment.author_id,
        name: author?.name || 'Unknown User',
        photo: author?.photo,
        profilePicture: author?.photo
      },
      attachments: fileAttachments,
      replies: []
    };

    res.status(201).json(responseComment);
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get comments for an entity (project/task), nested
exports.getComments = async (req, res) => {
  try {
    const { entityId, entityType } = req.query;
    
    // Get all comments for this entity with author info and file attachments
    const commentsResult = await db.query(
      `SELECT 
        c.*,
        up.name as author_name, 
        up.photo as author_photo,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', cf.id,
            'file_id', cf.file_id,
            'filename', f.filename,
            'url', f.url,
            'size', f.size,
            'mimetype', f.mimetype
          )
        ) FILTER (WHERE cf.id IS NOT NULL) as attachments
       FROM comments c
       LEFT JOIN user_profiles up ON c.author_id = up.user_id
       LEFT JOIN comment_files cf ON c.id = cf.comment_id
       LEFT JOIN files f ON cf.file_id = f.id
       WHERE c.parent_id = $1 AND c.parent_type = $2 
       GROUP BY c.id, up.name, up.photo
       ORDER BY c.created_at ASC`,
      [entityId, entityType]
    );
    
    // Transform the response and build hierarchical structure
    const allComments = commentsResult.rows.map(comment => ({
      _id: comment.id,
      content: comment.content,
      createdAt: comment.created_at || new Date(0),
      updatedAt: comment.updated_at || comment.created_at || new Date(0),
      isEdited: comment.is_edited,
      replyTo: comment.reply_to,
      author: {
        _id: comment.author_id,
        name: comment.author_name || 'Unknown User',
        photo: comment.author_photo,
        profilePicture: comment.author_photo
      },
      attachments: comment.attachments && comment.attachments[0] ? comment.attachments : [],
      replies: []
    }));

    // Build hierarchical structure
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create a map of all comments
    allComments.forEach(comment => {
      commentMap.set(comment._id, comment);
    });

    // Second pass: build the tree structure
    allComments.forEach(comment => {
      if (comment.replyTo) {
        // This is a reply, add it to the parent's replies
        const parentComment = commentMap.get(comment.replyTo);
        if (parentComment) {
          // Ensure reply has createdAt/updatedAt
          comment.createdAt = comment.createdAt || new Date(0);
          comment.updatedAt = comment.updatedAt || comment.createdAt || new Date(0);
          parentComment.replies.push(comment);
        }
      } else {
        // This is a root comment
        // Ensure root comment has createdAt/updatedAt
        comment.createdAt = comment.createdAt || new Date(0);
        comment.updatedAt = comment.updatedAt || comment.createdAt || new Date(0);
        rootComments.push(comment);
      }
    });

    res.json(rootComments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update own comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    console.log('Edit request for commentId:', commentId, 'by userId:', userId);
    // Check ownership
    const commentResult = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (commentResult.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (commentResult.rows[0].author_id !== userId) return res.status(403).json({ message: 'Forbidden' });
    // Update
    const updated = await db.query(
      'UPDATE comments SET content = $1, updated_at = NOW(), is_edited = TRUE WHERE id = $2 RETURNING *',
      [req.body.content, commentId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete own comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    // Find the comment (could be top-level or any nested reply)
    let commentResult = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (commentResult.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    let comment = commentResult.rows[0];
    if (comment.author_id !== userId) return res.status(403).json({ message: 'Forbidden' });
    // Helper: recursively delete all replies
    async function deleteRepliesRecursive(parentId) {
      const replies = await db.query('SELECT id FROM comments WHERE reply_to = $1', [parentId]);
      for (const reply of replies.rows) {
        await deleteRepliesRecursive(reply.id);
        await db.query('DELETE FROM comment_files WHERE comment_id = $1', [reply.id]);
        await db.query('DELETE FROM comments WHERE id = $1', [reply.id]);
      }
    }
    // Delete all nested replies
    await deleteRepliesRecursive(commentId);
    // Delete attachments for this comment
    await db.query('DELETE FROM comment_files WHERE comment_id = $1', [commentId]);
    // Delete the comment itself
    await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add file to comment
exports.addCommentFile = async (req, res) => {
  try {
    const { commentId } = req.params;
    const files = req.files || [];
    const userId = req.user.id;

    // Check if comment exists and user owns it
    const commentResult = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (commentResult.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (commentResult.rows[0].author_id !== userId) return res.status(403).json({ message: 'Forbidden' });

    // Attach files
    const attachedFiles = [];
    for (const file of files) {
      const fileResult = await db.query(
        `INSERT INTO comment_files (comment_id, file_id)
         VALUES ($1, $2) RETURNING *`,
        [commentId, file.id]
      );
      attachedFiles.push(fileResult.rows[0]);
    }

    res.json({ message: 'Files added to comment', files: attachedFiles });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Remove file from comment
exports.removeCommentFile = async (req, res) => {
  try {
    const { commentId, fileId } = req.params;
    const userId = req.user.id;

    // Check if comment exists and user owns it
    const commentResult = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (commentResult.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (commentResult.rows[0].author_id !== userId) return res.status(403).json({ message: 'Forbidden' });

    // Remove file
    await db.query('DELETE FROM comment_files WHERE id = $1 AND comment_id = $2', [fileId, commentId]);
    res.json({ message: 'File removed from comment' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if comment exists
    const commentResult = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (commentResult.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });

    // Check if already liked
    const likeResult = await db.query(
      'SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );
    if (likeResult.rows.length > 0) return res.status(400).json({ message: 'Already liked' });

    // Add like
    await db.query(
      'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
      [commentId, userId]
    );

    res.json({ message: 'Comment liked' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Unlike a comment
exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Remove like
    await db.query(
      'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );

    res.json({ message: 'Comment unliked' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProjectComments = async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('Fetching comments for projectId:', projectId);
    const commentsResult = await db.query(
      `SELECT 
        c.*,
        up.name as author_name, 
        up.photo as author_photo,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', cf.file_id,
              'filename', f.filename,
              'url', f.url,
              'size', f.size,
              'mimetype', f.mimetype
            )
          ) FILTER (WHERE cf.file_id IS NOT NULL), '[]'::json
        ) as attachments
      FROM comments c
      LEFT JOIN user_profiles up ON c.author_id = up.user_id
      LEFT JOIN comment_files cf ON c.id = cf.comment_id
      LEFT JOIN files f ON cf.file_id = f.id
      WHERE c.parent_type = $1 AND c.parent_id = $2
      GROUP BY c.id, up.name, up.photo
      ORDER BY c.created_at ASC`,
      ['project', projectId]
    );
    console.log('Number of comments fetched:', commentsResult.rows.length);
    // Map to camelCase and build flat array
    const allComments = commentsResult.rows.map(comment => ({
      _id: comment.id,
      content: comment.content,
      createdAt: comment.created_at || new Date(0),
      updatedAt: comment.updated_at || comment.created_at || new Date(0),
      isEdited: comment.is_edited,
      replyTo: comment.reply_to,
      author: {
        _id: comment.author_id,
        name: comment.author_name || 'Unknown User',
        photo: comment.author_photo,
        profilePicture: comment.author_photo
      },
      attachments: Array.isArray(comment.attachments) && comment.attachments[0] ? comment.attachments : [],
      replies: []
    }));
    // Build nested structure
    const commentMap = new Map();
    const rootComments = [];
    allComments.forEach(comment => {
      commentMap.set(comment._id, comment);
    });
    allComments.forEach(comment => {
      if (comment.replyTo) {
        const parent = commentMap.get(comment.replyTo);
        if (parent) {
          comment.createdAt = comment.createdAt || new Date(0);
          comment.updatedAt = comment.updatedAt || comment.createdAt || new Date(0);
          parent.replies.push(comment);
        }
      } else {
        comment.createdAt = comment.createdAt || new Date(0);
        comment.updatedAt = comment.updatedAt || comment.createdAt || new Date(0);
        rootComments.push(comment);
      }
    });
    res.status(200).json(rootComments);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching project comments' });
  }
};

exports.createProjectComment = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const { content, replyTo } = req.body;
    const authorId = req.user.id;
    const result = await db.query(
      `INSERT INTO comments (content, author_id, parent_type, parent_id, reply_to)
       VALUES ($1, $2, 'project', $3, $4) RETURNING *`,
      [content, authorId, id, replyTo || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Error creating comment' });
  }
};
