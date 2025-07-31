-- Add image fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured_image VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Add index for better performance on image queries
CREATE INDEX IF NOT EXISTS idx_projects_featured_image ON projects(featured_image); 