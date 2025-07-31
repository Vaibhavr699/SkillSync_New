-- Add priority column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Add index for better performance on priority queries
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Update existing tasks to have medium priority if not set
UPDATE tasks SET priority = 'medium' WHERE priority IS NULL; 