const db = require('../config/db');
const { uploadFile, createFileVersion } = require('../services/file.service');

exports.uploadFiles = async (req, res) => {
  try {
    console.log('File upload request received:', {
      files: req.files?.length || 0,
      body: req.body,
      user: req.user?.id
    });

    // Handle both single file and multiple files
    const files = req.files || (req.file ? [req.file] : []);
    
    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    
    for (const file of files) {
      try {
        console.log('Processing file:', file.originalname, file.mimetype, file.size);
        
        // Add resource type and ID if provided
        const resourceType = req.body.resourceType || 'general';
        const resourceId = req.body.resourceId || null;
        
        const uploadedFile = await uploadFile(file, req.user.id, resourceType, resourceId);
        uploadedFiles.push(uploadedFile);
        
        console.log('File uploaded successfully:', uploadedFile.id);
      } catch (error) {
        console.error('Error uploading file:', file.originalname, error);
        // Continue with other files even if one fails
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ message: 'Failed to upload any files' });
    }

    // Return array of uploaded files, even if only one
    res.status(201).json(uploadedFiles);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Keep the old function name for backward compatibility
exports.uploadFile = exports.uploadFiles;

exports.uploadFileVersion = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newVersion = await createFileVersion(fileId, req.file, req.user.id);
    res.status(201).json(newVersion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await db.query(
      'SELECT * FROM files WHERE id = $1',
      [fileId]
    );

    if (file.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(file.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFileVersions = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // Verify file ownership
    const file = await db.query(
      'SELECT * FROM files WHERE id = $1 AND uploaded_by = $2',
      [fileId, userId]
    );

    if (file.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const versions = await db.query(
      `WITH RECURSIVE version_tree AS (
        SELECT * FROM files WHERE id = $1
        UNION ALL
        SELECT f.* FROM files f
        JOIN version_tree vt ON f.previous_version = vt.id
      )
      SELECT * FROM version_tree ORDER BY created_at DESC`,
      [fileId]
    );

    res.status(200).json(versions.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // Get file details
    const fileQuery = `
      SELECT f.*, p.owner_id 
      FROM files f 
      LEFT JOIN projects p ON f.resource_id = p.id AND f.resource_type = 'project'
      WHERE f.id = $1
    `;
    const fileResult = await db.query(fileQuery, [fileId]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = fileResult.rows[0];

    // Check if user has permission to delete the file
    // User can delete if they own the file or own the project
    if (file.uploaded_by !== userId && file.owner_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this file' });
    }

    // Delete from database
    const deleteQuery = 'DELETE FROM files WHERE id = $1 RETURNING *';
    const deleteResult = await db.query(deleteQuery, [fileId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Try to delete from Supabase storage if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        
        const fileName = file.filename || file.name;
        if (fileName) {
          await supabase.storage
            .from('files')
            .remove([fileName]);
        }
      } catch (storageError) {
        console.error('Error deleting from Supabase storage:', storageError);
        // Continue even if storage deletion fails
      }
    }

    // Try to delete from local storage if file exists
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../uploads', file.filename || file.name);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (localError) {
      console.error('Error deleting local file:', localError);
      // Continue even if local deletion fails
    }

    res.json({ 
      message: 'File deleted successfully',
      file: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file info
    const file = await db.query('SELECT * FROM files WHERE id = $1', [fileId]);
    if (file.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    const fileData = file.rows[0];

    // If file is stored locally
    if (fileData.filename) {
      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '../uploads', fileData.filename);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, fileData.name || fileData.filename);
      }
    }

    // If file is stored on cloud (Supabase/Cloudinary)
    if (fileData.url || fileData.file_url) {
      return res.redirect(fileData.url || fileData.file_url);
    }

    return res.status(404).json({ message: 'File not found in storage' });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get file information
exports.getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await db.query(
      'SELECT * FROM files WHERE id = $1',
      [fileId]
    );

    if (file.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileData = file.rows[0];
    
    // Check if user has access to the file
    if (fileData.uploaded_by !== userId) {
      const accessCheck = await db.query(
        `SELECT 1 FROM (
          SELECT project_id FROM project_files WHERE file_id = $1
          UNION
          SELECT p.id FROM projects p
          JOIN project_files pf ON p.id = pf.project_id
          WHERE pf.file_id = $1
        ) p
        JOIN project_members pm ON p.project_id = pm.project_id
        WHERE pm.user_id = $2`,
        [fileId, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(fileData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get files by resource type and ID
exports.getFilesByResource = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    let filesQuery;
    let queryParams = [id];

    switch (type) {
      case 'project':
        filesQuery = `
          SELECT f.*, u.name as uploaded_by_name
          FROM files f
          JOIN project_files pf ON f.id = pf.file_id
          JOIN users u ON f.uploaded_by = u.id
          WHERE pf.project_id = $1
          ORDER BY f.created_at DESC
        `;
        break;
      case 'task':
        filesQuery = `
          SELECT f.*, u.name as uploaded_by_name
          FROM files f
          JOIN task_files tf ON f.id = tf.file_id
          JOIN users u ON f.uploaded_by = u.id
          WHERE tf.task_id = $1
          ORDER BY f.created_at DESC
        `;
        break;
      case 'comment':
        filesQuery = `
          SELECT f.*, u.name as uploaded_by_name
          FROM files f
          JOIN comment_files cf ON f.id = cf.file_id
          JOIN users u ON f.uploaded_by = u.id
          WHERE cf.comment_id = $1
          ORDER BY f.created_at DESC
        `;
        break;
      default:
        return res.status(400).json({ message: 'Invalid resource type' });
    }

    const files = await db.query(filesQuery, queryParams);
    res.json(files.rows);
  } catch (error) {
    console.error('Error getting files by resource:', error);
    res.status(500).json({ message: 'Error getting files' });
  }
};

// Update file metadata
exports.updateFileMetadata = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Verify file ownership
    const file = await db.query(
      'SELECT * FROM files WHERE id = $1 AND uploaded_by = $2',
      [fileId, userId]
    );

    if (file.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update file metadata
    const updated = await db.query(
      'UPDATE files SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, fileId]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};