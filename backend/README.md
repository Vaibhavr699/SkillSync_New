# SkillSync Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillsync
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary (alternative to Supabase for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3456
NODE_ENV=development
```

### 3. Database Setup
Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE skillsync;
```

### 4. Run Migrations
The database schema is defined in the `migrations/` folder. Run the SQL files in order:
1. `001_initial_tables.sql`
2. `002_add_feedback_column.sql`
3. `003_enhance_project_applications.sql`
4. `004_add_task_checklist.sql`
5. `005_add_project_images.sql`
6. `006_complete_schema_update.sql`
7. `007_add_indexes_and_constraints.sql`
8. `008_add_is_banned_to_users.sql`
9. `009_enhance_application_fields.sql`

### 5. Start the Server
```bash
npm start
```

## File Upload Configuration

### Option 1: Supabase (Recommended)
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to Storage and create a bucket called "uploads"
4. Set the bucket to public
5. Get your project URL and service role key
6. Add them to your `.env` file

### Option 2: Cloudinary
1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile-photo` - Upload profile photo
- `GET /api/users/skills` - Get all skills

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/apply` - Apply to project
- `GET /api/projects/:id/applications` - Get project applications
- `PUT /api/projects/:id/applications/:applicationId` - Update application status
- `GET /api/projects/company-applications` - Get company applications
- `GET /api/projects/my-applications` - Get my applications

### Files
- `POST /api/files/upload` - Upload files
- `GET /api/files/:id` - Get file by ID
- `DELETE /api/files/:id` - Delete file

## Troubleshooting

### Profile Photo Upload Issues
1. Check if Supabase environment variables are set correctly
2. Verify the "uploads" bucket exists in Supabase
3. Check if the bucket is set to public
4. Verify the user_profiles table has a "photo" column

### Database Connection Issues
1. Make sure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify the database exists

### JWT Issues
1. Make sure JWT_SECRET is set in `.env`
2. Check if the token is being sent in Authorization header 