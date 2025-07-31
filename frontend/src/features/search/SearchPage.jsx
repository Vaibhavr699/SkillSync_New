import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Tabs, 
  Tab, 
  Grid,
  Skeleton,
  Divider,
  IconButton,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Rating,
  Badge,
  Tooltip
} from '@mui/material';
import { 
  Search, 
  Person, 
  Work, 
  Assignment, 
  Visibility, 
  FilterList,
  Star,
  TrendingUp,
  LocationOn,
  Schedule,
  AttachMoney,
  Sort,
  Clear
} from '@mui/icons-material';
import api from '../../api/api';

const initialProjectFilters = {
  tag: [],
  minBudget: '',
  maxBudget: '',
  deadline: ''
};

const initialUserFilters = {
  role: '',
  skills: [],
  minRating: 0,
  maxHourlyRate: '',
  minHourlyRate: '',
  sortBy: 'relevance'
};

const initialTaskFilters = {
  assignee: '',
  dueDate: ''
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [],
    projects: [],
    tasks: []
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [projectFilters, setProjectFilters] = useState(initialProjectFilters);
  const { user } = useSelector(state => state.auth);
  const [userFilters, setUserFilters] = useState(() => {
    if (user?.role === 'company') {
      return { ...initialUserFilters, role: 'freelancer' };
    }
    return initialUserFilters;
  });
  const [taskFilters, setTaskFilters] = useState(initialTaskFilters);
  const [allTags, setAllTags] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [userSuggestions, setUserSuggestions] = useState([]);

  const tabLabels = [
    `All (${(results.users?.length || 0) + (results.projects?.length || 0) + (results.tasks?.length || 0)})`,
    `Users (${results.users?.length || 0})`,
    `Projects (${results.projects?.length || 0})`,
    `Tasks (${results.tasks?.length || 0})`
  ];

  useEffect(() => {
    // Fetch all tags for project filter
    api.get('/users/skills').then(res => {
      setAllTags(res.data || []);
      setAllSkills(res.data || []);
    });
    // Fetch all users for assignee filter
    api.get('/users').then(res => setAllUsers(res.data || []));
  }, []);

  useEffect(() => {
    if (searchTerm) {
      performSearch();
    }
    // eslint-disable-next-line
  }, [searchTerm, activeTab, projectFilters, userFilters, taskFilters, sortBy]);

  useEffect(() => {
    if (activeTab === 1 && searchTerm.trim()) {
      api.get('/users', { params: { name: searchTerm.trim() } })
        .then(res => setUserSuggestions(res.data || []));
    } else {
      setUserSuggestions([]);
    }
  }, [searchTerm, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchPromises = [];
      
      // Users
      if (activeTab === 0 || activeTab === 1) {
        const userParams = {
          name: searchTerm,
          ...userFilters,
        };
        if (userParams.skills && userParams.skills.length === 0) delete userParams.skills;
        if (!userParams.minHourlyRate) delete userParams.minHourlyRate;
        if (!userParams.maxHourlyRate) delete userParams.maxHourlyRate;
        if (!userParams.role) delete userParams.role;
        if (userParams.minRating === 0) delete userParams.minRating;
        
        searchPromises.push(
          api.get('/users', { params: userParams })
            .then(res => res.data)
            .catch(() => [])
        );
      }
      
      // Projects
      if (activeTab === 0 || activeTab === 2) {
        const params = {
          search: searchTerm,
          ...projectFilters,
        };
        if (params.tag && params.tag.length === 0) delete params.tag;
        if (!params.minBudget) delete params.minBudget;
        if (!params.maxBudget) delete params.maxBudget;
        if (!params.deadline) delete params.deadline;
        searchPromises.push(
          api.get('/projects', { params })
            .then(res => res.data.projects || [])
            .catch(() => [])
        );
      }
      
      // Tasks
      if (activeTab === 0 || activeTab === 3) {
        const params = {
          search: searchTerm,
          ...taskFilters,
        };
        if (!params.assignee) delete params.assignee;
        if (!params.dueDate) delete params.dueDate;
        searchPromises.push(
          api.get('/tasks/search', { params })
            .then(res => res.data || [])
            .catch(() => [])
        );
      }
      
      const [users, projects, tasks] = await Promise.all(searchPromises);
      
      // Sort results based on sortBy
      const sortResults = (items, type) => {
        switch (sortBy) {
          case 'rating':
            return items.sort((a, b) => (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0));
          case 'recent':
            return items.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
          case 'name':
            return items.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
          case 'budget':
            return items.sort((a, b) => (b.budget || 0) - (a.budget || 0));
          default:
            return items;
        }
      };

      setResults({
        users: sortResults(users, 'users'),
        projects: sortResults(projects, 'projects'),
        tasks: sortResults(tasks, 'tasks')
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/dashboard/tasks/${taskId}`);
  };

  const handleResetFilters = () => {
    setProjectFilters(initialProjectFilters);
    setUserFilters(initialUserFilters);
    setTaskFilters(initialTaskFilters);
    setSortBy('relevance');
  };

  const renderUserCard = (user) => (
    <Card key={user.id} className="search-result card-hover" sx={{ mb: 2, cursor: 'pointer' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'success.main',
                border: '2px solid white'
              }} />
            }
          >
            <Avatar 
              src={user.photo} 
              sx={{ width: 64, height: 64 }}
            >
              {user.name?.charAt(0) || 'U'}
            </Avatar>
          </Badge>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {user.name || 'Anonymous User'}
              </Typography>
              {user.isVerified && (
                <Tooltip title="Verified User">
                  <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ fontSize: 16 }} />
                  </Box>
                </Tooltip>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 16 }} />
              {user.role}
              {user.hourlyRate && (
                <>
                  <AttachMoney sx={{ fontSize: 16 }} />
                  ₹{user.hourlyRate.toLocaleString('en-IN')}/hr
                </>
              )}
            </Typography>

            {user.stats && (
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  <TrendingUp sx={{ fontSize: 12, mr: 0.5 }} />
                  {user.stats.successRate}% success
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <Work sx={{ fontSize: 12, mr: 0.5 }} />
                  {user.stats.projectsCompleted} completed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <Star sx={{ fontSize: 12, mr: 0.5 }} />
                  {user.stats.averageRating?.toFixed(1) || 'N/A'}
                </Typography>
              </Box>
            )}

            {user.skills && user.skills.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.skills.slice(0, 4).map((skill) => (
                  <Chip 
                    key={skill.name || skill} 
                    label={skill.name || skill} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
                {user.skills.length > 4 && (
                  <Chip 
                    label={`+${user.skills.length - 4} more`} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            )}
          </Box>
          
          <IconButton 
            onClick={() => handleUserClick(user.id)}
            color="primary"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            <Visibility />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderProjectCard = (project) => (
    <Card key={project.id} className="search-result card-hover" sx={{ mb: 2, cursor: 'pointer' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              {project.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {project.description}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachMoney sx={{ fontSize: 12 }} />
                ₹{project.budget?.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 12 }} />
                {new Date(project.deadline).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Work sx={{ fontSize: 12 }} />
                {project.status}
              </Typography>
            </Box>

            {project.tags && project.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {project.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {project.tags.length > 3 && (
                  <Chip label={`+${project.tags.length - 3} more`} size="small" variant="outlined" />
                )}
              </Box>
            )}
          </Box>
          <IconButton 
            onClick={() => handleProjectClick(project.id)}
            color="primary"
            size="small"
          >
            <Visibility />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderTaskCard = (task) => (
    <Card key={task.id} className="search-result card-hover" sx={{ mb: 2, cursor: 'pointer' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {task.description}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Assignment sx={{ fontSize: 12 }} />
                {task.status}
              </Typography>
              {task.due_date && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Schedule sx={{ fontSize: 12 }} />
                  {new Date(task.due_date).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton 
            onClick={() => handleTaskClick(task.id)}
            color="primary"
            size="small"
          >
            <Visibility />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} className="skeleton" />
    </Box>
  );

  const renderFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: 320, p: 3 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <Clear />
        </IconButton>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          label="Sort By"
        >
          <MenuItem value="relevance">Relevance</MenuItem>
          <MenuItem value="rating">Rating</MenuItem>
          <MenuItem value="recent">Most Recent</MenuItem>
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="budget">Budget</MenuItem>
        </Select>
      </FormControl>

      {activeTab === 1 && (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={userFilters.role}
              onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="freelancer">Freelancer</MenuItem>
              <MenuItem value="company">Company</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Skills</Typography>
            <FormGroup>
              {allSkills.slice(0, 10).map((skill) => (
                <FormControlLabel
                  key={skill}
                  control={
                    <Checkbox
                      checked={userFilters.skills.includes(skill)}
                      onChange={(e) => {
                        const newSkills = e.target.checked
                          ? [...userFilters.skills, skill]
                          : userFilters.skills.filter(s => s !== skill);
                        setUserFilters({ ...userFilters, skills: newSkills });
                      }}
                    />
                  }
                  label={skill}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Minimum Rating</Typography>
            <Rating
              value={userFilters.minRating}
              onChange={(event, newValue) => {
                setUserFilters({ ...userFilters, minRating: newValue });
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Hourly Rate Range</Typography>
            <TextField
              fullWidth
              label="Min Rate (₹)"
              type="number"
              value={userFilters.minHourlyRate}
              onChange={(e) => setUserFilters({ ...userFilters, minHourlyRate: e.target.value })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Max Rate (₹)"
              type="number"
              value={userFilters.maxHourlyRate}
              onChange={(e) => setUserFilters({ ...userFilters, maxHourlyRate: e.target.value })}
            />
          </Box>
        </>
      )}

      {activeTab === 2 && (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags</Typography>
            <FormGroup>
              {allTags.slice(0, 10).map((tag) => (
                <FormControlLabel
                  key={tag}
                  control={
                    <Checkbox
                      checked={projectFilters.tag.includes(tag)}
                      onChange={(e) => {
                        const newTags = e.target.checked
                          ? [...projectFilters.tag, tag]
                          : projectFilters.tag.filter(t => t !== tag);
                        setProjectFilters({ ...projectFilters, tag: newTags });
                      }}
                    />
                  }
                  label={tag}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Budget Range</Typography>
            <TextField
              fullWidth
              label="Min Budget (₹)"
              type="number"
              value={projectFilters.minBudget}
              onChange={(e) => setProjectFilters({ ...projectFilters, minBudget: e.target.value })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Max Budget (₹)"
              type="number"
              value={projectFilters.maxBudget}
              onChange={(e) => setProjectFilters({ ...projectFilters, maxBudget: e.target.value })}
            />
          </Box>
        </>
      )}

      <Button
        fullWidth
        variant="outlined"
        onClick={handleResetFilters}
        sx={{ mt: 2 }}
      >
        Clear All Filters
      </Button>
    </Drawer>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Search SkillSync
        </Typography>
        <form onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, position: 'relative' }}>
            <TextField
              fullWidth
              placeholder="Search for users, projects, or tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            {/* User suggestion dropdown */}
            {searchTerm && activeTab === 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 10,
                  width: '100%',
                  maxWidth: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                  borderRadius: 1,
                  mt: 1,
                  maxHeight: 300,
                  overflowY: 'auto'
                }}
              >
                {userSuggestions.length === 0 ? (
                  <Typography sx={{ px: 2, py: 1, color: 'text.secondary' }}>No users found</Typography>
                ) : (
                  userSuggestions.slice(0, 5).map((user) => (
                    <Box
                      key={user.id || user._id || user.email || user.name}
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                      onClick={() => handleUserClick(user.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={user.photo} sx={{ width: 28, height: 28 }}>
                          {user.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="body2">{user.name}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}
            <Button
              type="submit"
              variant="contained"
              sx={{ px: 4 }}
              disabled={!searchTerm.trim()}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          </Box>
        </form>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          {tabLabels.map((label, index) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Results */}
      <Box>
        {loading ? (
          <Box>
            {[1, 2, 3].map((i) => renderSkeleton(i))}
          </Box>
        ) : searchTerm ? (
          <Box>
            {(activeTab === 0 || activeTab === 1) && (results.users && results.users.length > 0) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Users ({results.users.length})
                </Typography>
                {results.users.map(user => renderUserCard(user))}
              </Box>
            )}

            {(activeTab === 0 || activeTab === 2) && (results.projects && results.projects.length > 0) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Projects ({results.projects.length})
                </Typography>
                {results.projects.map(project => renderProjectCard(project))}
              </Box>
            )}

            {(activeTab === 0 || activeTab === 3) && (results.tasks && results.tasks.length > 0) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Tasks ({results.tasks.length})
                </Typography>
                {results.tasks.map(task => renderTaskCard(task))}
              </Box>
            )}

            {(results.users?.length === 0 && results.projects?.length === 0 && results.tasks?.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No results found for "{searchTerm}"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or filters
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Start searching to discover amazing talent and opportunities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search for users, projects, or tasks to get started
            </Typography>
          </Box>
        )}
      </Box>

      {renderFilterDrawer()}
    </Box>
  );
};

export default SearchPage; 