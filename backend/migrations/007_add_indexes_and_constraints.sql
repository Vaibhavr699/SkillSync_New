-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_featured_image ON projects(featured_image);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_checklist ON tasks USING GIN (checklist);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_project_id ON project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_freelancer_id ON project_applications(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_status ON project_applications(status);
CREATE INDEX IF NOT EXISTS idx_project_applications_applied_at ON project_applications(applied_at);

-- Add constraints to ensure data integrity
ALTER TABLE project_applications 
ADD CONSTRAINT IF NOT EXISTS project_applications_hourly_rate_check 
CHECK (hourly_rate IS NULL OR hourly_rate > 0);

ALTER TABLE project_applications 
ADD CONSTRAINT IF NOT EXISTS project_applications_estimated_duration_check 
CHECK (estimated_duration IS NULL OR estimated_duration > 0); 