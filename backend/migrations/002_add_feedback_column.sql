-- Add feedback column to project_applications table
ALTER TABLE project_applications ADD COLUMN IF NOT EXISTS feedback TEXT; 