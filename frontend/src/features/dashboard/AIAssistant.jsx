import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Send, HelpOutline } from '@mui/icons-material';
import { askAI } from '../../api/ai';

const AIAssistant = () => {
  const { projectId } = useParams();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: question };
    setConversation(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      const response = await askAI(projectId, question);
      const aiMessage = { 
        role: 'ai', 
        content: response.answer,
        sources: response.sources 
      };
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again later.',
        isError: true 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, sm: 4 }, minHeight: '100vh', bgcolor: { xs: '#f8fafc', dark: '#181a2a' }, color: { xs: '#23234f', dark: '#fff' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1, color: { xs: '#23234f', dark: '#fff' }, fontWeight: 700 }}>
          Project Assistant
        </Typography>
        <Tooltip title="Ask about project details, tasks, or discussions">
          <IconButton sx={{ color: { xs: '#6366f1', dark: '#a5b4fc' } }}>
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{
        p: { xs: 1, sm: 2 },
        mb: 2,
        height: { xs: 300, sm: 400, md: 500 },
        overflow: 'auto',
        bgcolor: { xs: '#fff', dark: '#23234f' },
        color: { xs: '#23234f', dark: '#fff' },
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: 3,
        border: '1.5px solid',
        borderColor: { xs: '#e0e7ff', dark: '#3730a3' }
      }}>
        {conversation.length === 0 ? (
          <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            color: { xs: '#6366f1', dark: '#a5b4fc' }
          }}>
            <HelpOutline sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>How can I help you today?</Typography>
            <Typography variant="body2" sx={{ mt: 1, color: { xs: '#64748b', dark: '#c7d2fe' } }}>
              Ask questions like "What are we working on this week?" or
              "Summarize the project status"
            </Typography>
          </Box>
        ) : (
          <List>
            {conversation.map((msg, index) => (
              <Box key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        color={msg.role === 'user' ? 'primary' : msg.isError ? 'error' : 'text.primary'}
                        sx={{ fontWeight: 'bold', color: { xs: '#23234f', dark: '#a5b4fc' } }}
                      >
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color={msg.isError ? 'error' : 'text.primary'}
                          sx={{ whiteSpace: 'pre-wrap', color: { xs: '#23234f', dark: '#fff' } }}
                        >
                          {msg.content}
                        </Typography>
                        {msg.sources && msg.sources.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ color: { xs: '#64748b', dark: '#c7d2fe' } }}>
                              Sources:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {msg.sources.map((source, i) => (
                                <Chip
                                  key={i}
                                  label={source.type === 'task' ? `Task: ${source.title}` : `Comment`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: { xs: '#6366f1', dark: '#a5b4fc' },
                                    borderColor: { xs: '#6366f1', dark: '#a5b4fc' },
                                    bgcolor: { xs: '#eef2ff', dark: '#23234f' }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < conversation.length - 1 && <Divider component="li" sx={{ borderColor: { xs: '#e0e7ff', dark: '#3730a3' } }} />}
              </Box>
            ))}
            {isLoading && (
              <ListItem>
                <CircularProgress size={24} sx={{ color: { xs: '#6366f1', dark: '#a5b4fc' } }} />
              </ListItem>
            )}
          </List>
        )}
      </Paper>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, bgcolor: { xs: '#fff', dark: '#23234f' }, borderRadius: 3, p: 1, border: '1.5px solid', borderColor: { xs: '#e0e7ff', dark: '#3730a3' } }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question about the project..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          InputProps={{
            sx: {
              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#23234f',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#23234f' : '#fff',
              border: '1.5px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? '#6366f1' : '#a5b4fc',
              borderRadius: '12px',
              fontWeight: 500,
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!question.trim() || isLoading}
          endIcon={<Send />}
          sx={{
            background: 'linear-gradient(90deg, #6366f1 0%, #a21caf 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            boxShadow: 3,
            '&:hover': { background: 'linear-gradient(90deg, #a21caf 0%, #6366f1 100%)' }
          }}
        >
          Ask
        </Button>
      </Box>
    </Box>
  );
};

export default AIAssistant;