-- Enhance project_applications table with additional fields for better application management
ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS proposed_budget DECIMAL(12, 2);

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS estimated_duration_text VARCHAR(100);

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS relevant_experience TEXT;

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS application_score DECIMAL(3, 2);

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS is_shortlisted BOOLEAN DEFAULT FALSE;

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE public.project_applications 
ADD COLUMN IF NOT EXISTS shortlisted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add constraints for data integrity
ALTER TABLE public.project_applications 
ADD CONSTRAINT IF NOT EXISTS project_applications_proposed_budget_check 
CHECK (proposed_budget IS NULL OR proposed_budget > 0);

ALTER TABLE public.project_applications 
ADD CONSTRAINT IF NOT EXISTS project_applications_application_score_check 
CHECK (application_score IS NULL OR (application_score >= 0 AND application_score <= 5));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_applications_proposed_budget ON public.project_applications(proposed_budget);

CREATE INDEX IF NOT EXISTS idx_project_applications_is_shortlisted ON public.project_applications(is_shortlisted);

CREATE INDEX IF NOT EXISTS idx_project_applications_application_score ON public.project_applications(application_score);

-- Update existing applications to have default values
UPDATE public.project_applications 
SET proposed_budget = (
  SELECT budget FROM projects WHERE projects.id = project_applications.project_id
)
WHERE proposed_budget IS NULL;

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_application_updated_at
  BEFORE UPDATE ON public.project_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_application_updated_at(); 