const routes = {
  // ===== PUBLIC ROUTES =====
  home: '/',
  search: '/search',
  userProfile: (userId) => `/users/${userId}`,
  
  // ===== AUTHENTICATION ROUTES =====
  auth: {
    login: '/login',
    register: '/register',
    verifyEmail: '/verify-email',
    forgotPassword: '/forgot-password',
    resetPassword: (token) => `/reset-password/${token}`,
    createAdmin: '/create-admin',
  },

  // ===== DASHBOARD ROUTES =====
  dashboard: {
    main: '/dashboard',
    profile: '/dashboard/profile',
    notifications: '/dashboard/notifications',
    messages: '/dashboard/messages',
    aiAssistant: '/dashboard/ai',
    company: '/dashboard/company',
    projectManagement: '/dashboard/project-management',
  },

  // ===== PROJECT MANAGEMENT ROUTES =====
  projects: {
    list: '/dashboard/projects',
    create: '/dashboard/projects/new',
    detail: (id) => `/dashboard/projects/${id}`,
    edit: (id) => `/dashboard/projects/${id}/edit`,
    aiAssistant: (projectId) => `/dashboard/projects/${projectId}/ai`,
  },

  // ===== TASK MANAGEMENT ROUTES =====
  tasks: {
    board: (projectId) => `/dashboard/projects/${projectId}/tasks`,
    detail: (projectId, taskId) => `/dashboard/projects/${projectId}/tasks/${taskId}`,
    create: (projectId) => `/dashboard/projects/${projectId}/tasks/new`,
    edit: (projectId, taskId) => `/dashboard/projects/${projectId}/tasks/${taskId}/edit`,
  },

  // ===== APPLICATION MANAGEMENT ROUTES =====
  applications: {
    // Freelancer routes
    myApplications: '/dashboard/applications',
    // Company routes
    companyApplications: '/dashboard/company-applications',
    projectApplications: (projectId) => `/dashboard/projects/${projectId}/applications`,
  },

  // ===== COMMENT SYSTEM ROUTES =====
  comments: {
    projectComments: (projectId) => `/dashboard/projects/${projectId}/comments`,
    taskComments: (projectId, taskId) => `/dashboard/projects/${projectId}/tasks/${taskId}/comments`,
  },

  // ===== FILE MANAGEMENT ROUTES =====
  files: {
    projectFiles: (projectId) => `/dashboard/projects/${projectId}/files`,
    taskFiles: (projectId, taskId) => `/dashboard/projects/${projectId}/tasks/${taskId}/files`,
    upload: '/dashboard/files/upload',
  },

  // ===== ADMIN ROUTES =====
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    projects: '/admin/projects',
    stats: '/admin/stats',
    settings: '/admin/settings',
  },

  // ===== API ROUTES (for reference) =====
  api: {
    // Auth
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      verify: '/api/auth/verify',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
    },
    
    // Projects
    projects: {
      list: '/api/projects',
      create: '/api/projects',
      detail: (id) => `/api/projects/${id}`,
      update: (id) => `/api/projects/${id}`,
      delete: (id) => `/api/projects/${id}`,
      apply: (id) => `/api/projects/${id}/apply`,
      applications: (id) => `/api/projects/${id}/applications`,
      companyApplications: '/api/projects/company-applications',
      myApplications: '/api/projects/my-applications',
    },

    // Tasks
    tasks: {
      list: (projectId) => `/api/projects/${projectId}/tasks`,
      create: (projectId) => `/api/projects/${projectId}/tasks`,
      detail: (projectId, taskId) => `/api/projects/${projectId}/tasks/${taskId}`,
      update: (projectId, taskId) => `/api/projects/${projectId}/tasks/${taskId}`,
      delete: (projectId, taskId) => `/api/projects/${projectId}/tasks/${taskId}`,
      reorder: (projectId) => `/api/projects/${projectId}/tasks/reorder`,
    },

    // Comments
    comments: {
      projectComments: (projectId) => `/api/projects/${projectId}/comments`,
      taskComments: (projectId, taskId) => `/api/projects/${projectId}/tasks/${taskId}/comments`,
      create: (type, id) => `/api/${type}/${id}/comments`,
      update: (type, id, commentId) => `/api/${type}/${id}/comments/${commentId}`,
      delete: (type, id, commentId) => `/api/${type}/${id}/comments/${commentId}`,
    },

    // Files
    files: {
      upload: '/api/files/upload',
      delete: (id) => `/api/files/${id}`,
      projectFiles: (projectId) => `/api/projects/${projectId}/files`,
      taskFiles: (projectId, taskId) => `/api/projects/${projectId}/tasks/${taskId}/files`,
    },

    // Applications
    applications: {
      updateStatus: (projectId, applicationId) => `/api/projects/${projectId}/applications/${applicationId}`,
    },

    // Users
    users: {
      profile: (id) => `/api/users/${id}`,
      update: (id) => `/api/users/${id}`,
      publicProfile: (id) => `/api/users/${id}/public`,
    },

    // Admin
    admin: {
      users: '/api/admin/users',
      projects: '/api/admin/projects',
      stats: '/api/admin/stats',
      userActions: (id) => `/api/admin/users/${id}`,
      projectActions: (id) => `/api/admin/projects/${id}`,
    },
  },
};

export default routes;