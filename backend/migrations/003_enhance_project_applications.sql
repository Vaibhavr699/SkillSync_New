-- Enhance project_applications table with additional useful columns
ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER;

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS cover_letter TEXT;

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS company_feedback_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS company_feedback_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_project_applications_project_id ON public.project_applications(project_id);

CREATE INDEX IF NOT EXISTS idx_project_applications_freelancer_id ON public.project_applications(freelancer_id);

CREATE INDEX IF NOT EXISTS idx_project_applications_status ON public.project_applications(status);

CREATE INDEX IF NOT EXISTS idx_project_applications_applied_at ON public.project_applications(applied_at);

-- Add constraints to ensure data integrity
ALTER TABLE public.project_applications 
ADD CONSTRAINT IF NOT EXISTS project_applications_hourly_rate_check 
CHECK (hourly_rate IS NULL OR hourly_rate > 0);

ALTER TABLE public.project_applications 
ADD CONSTRAINT IF NOT EXISTS project_applications_estimated_duration_check 
CHECK (estimated_duration IS NULL OR estimated_duration > 0); 