export const mockUser = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'freelancer',
    profilePicture: '',
    skills: ['React', 'Node.js'],
    hourlyRate: 50,
  };
  
  export const mockProject = {
    _id: '1',
    title: 'Website Development',
    description: 'Need a new company website built with React',
    budget: 3456,
    deadline: '2023-12-31',
    status: 'active',
    tags: ['web', 'react', 'design'],
    company: {
      _id: '2',
      name: 'Acme Inc',
      profilePicture: '',
    },
  };
  
  export const mockTask = {
    _id: '1',
    title: 'Create homepage',
    description: 'Design and implement the main homepage',
    status: 'in-progress',
    dueDate: '2023-11-15',
    checklist: [
      { _id: '1', text: 'Design layout', completed: true },
      { _id: '2', text: 'Implement components', completed: false },
    ],
  };