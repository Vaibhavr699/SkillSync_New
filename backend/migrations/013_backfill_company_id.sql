-- 1. Create a company for each company user if not already present, and set company_id for users
DO $$
DECLARE
    rec RECORD;
    new_company_id INTEGER;
BEGIN
    FOR rec IN SELECT id, name, email FROM users WHERE role = 'company' LOOP
        -- Insert company if not exists (using email as unique name for demo)
        INSERT INTO companies (name) 
        VALUES (rec.name || ' (' || rec.email || ')')
        ON CONFLICT (name) DO NOTHING;
        -- Get the company id
        SELECT id INTO new_company_id FROM companies WHERE name = (rec.name || ' (' || rec.email || ')');
        -- Update user with company_id
        UPDATE users SET company_id = new_company_id WHERE id = rec.id;
    END LOOP;
END $$;

-- 2. Set company_id for all projects based on creator's company_id
UPDATE projects
SET company_id = users.company_id
FROM users
WHERE projects.created_by = users.id AND users.company_id IS NOT NULL; 