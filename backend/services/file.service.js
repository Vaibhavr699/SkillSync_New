const supabase = require('../config/supabase');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const uploadToSupabase = async (file) => {
  try {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) throw error;
    // Get public URL
    const { publicUrl } = supabase.storage.from('uploads').getPublicUrl(fileName).data;
    return { url: publicUrl, fileName };
  } catch (error) {
    console.error('Supabase upload failed, falling back to local storage:', error);
    return uploadToLocal(file);
  }
};

const uploadToLocal = async (file) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to local storage
    fs.writeFileSync(filePath, file.buffer);

    // Return local URL (you might need to serve this statically)
    const localUrl = `/uploads/${fileName}`;
    return { url: localUrl, fileName };
  } catch (error) {
    console.error('Local upload failed:', error);
    throw new Error('File upload failed');
  }
};

const uploadFile = async (file, userId, resourceType = 'general', resourceId = null) => {
  try {
    // Try Supabase first, fallback to local
    const uploadResult = await uploadToSupabase(file);
    
    // Insert into files table
    const fileRecord = await db.query(
      `INSERT INTO files 
       (url, public_id, filename, name, size, mimetype, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        uploadResult.url, 
        uploadResult.fileName, 
        uploadResult.fileName, // filename (stored)
        file.originalname,     // name (original)
        file.size, 
        file.mimetype, 
        userId
      ]
    );

    const uploadedFile = fileRecord.rows[0];

    // If resource type and ID are provided, create the relationship
    if (resourceType && resourceId) {
      try {
        switch (resourceType) {
          case 'project':
            await db.query(
              'INSERT INTO project_files (project_id, file_id) VALUES ($1, $2)',
              [resourceId, uploadedFile.id]
            );
            break;
          case 'task':
            await db.query(
              'INSERT INTO task_files (task_id, file_id) VALUES ($1, $2)',
              [resourceId, uploadedFile.id]
            );
            break;
          case 'comment':
            await db.query(
              'INSERT INTO comment_files (comment_id, file_id) VALUES ($1, $2)',
              [resourceId, uploadedFile.id]
            );
            break;
        }
      } catch (relationshipError) {
        console.error('Error creating file relationship:', relationshipError);
        // Continue even if relationship creation fails
      }
    }

    return uploadedFile;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

const createFileVersion = async (fileId, newFile, userId) => {
  try {
    // Get current file
    const currentFile = await db.query('SELECT * FROM files WHERE id = $1', [fileId]);
    if (currentFile.rows.length === 0) {
      throw new Error('File not found');
    }
    // Verify ownership
    if (currentFile.rows[0].uploaded_by !== userId) {
      throw new Error('Unauthorized');
    }
    // Upload new version
    const newVersion = await uploadFile(newFile, userId);
    // Mark old version as not current
    await db.query(
      'UPDATE files SET is_current = FALSE, previous_version = $1 WHERE id = $2',
      [newVersion.id, fileId]
    );
    return newVersion;
  } catch (error) {
    console.error('Create file version error:', error);
    throw error;
  }
};

module.exports = {
  uploadToSupabase,
  uploadToLocal,
  uploadFile,
  createFileVersion
};