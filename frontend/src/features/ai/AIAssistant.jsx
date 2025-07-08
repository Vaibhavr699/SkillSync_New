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
  Tooltip,
  ListItemText,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import { Send, HelpOutline, ExpandMore, ExpandLess, Close as CloseIcon, SmartToy } from '@mui/icons-material';
import { askAI } from '../../api/ai';
import { useThemeContext } from '../../context/ThemeContext';

const AIAssistant = () => {
  const { projectId } = useParams();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [expandedSources, setExpandedSources] = useState({}); // {msgIdx: Set of expanded source idx}
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

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

  // Toggle expand/collapse for a source chip
  const handleToggleSource = (msgIdx, srcIdx) => {
    setExpandedSources(prev => {
      const prevSet = prev[msgIdx] || new Set();
      const newSet = new Set(prevSet);
      if (newSet.has(srcIdx)) newSet.delete(srcIdx);
      else newSet.add(srcIdx);
      return { ...prev, [msgIdx]: newSet };
    });
  };

  // Floating button and panel styles
  return (
    <div
      className="fixed z-[1200] right-4 sm:right-6 bottom-4 sm:bottom-6 flex flex-col items-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Floating Button */}
      {!open && (
        <button
          className={`rounded-full shadow-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl transition-transform duration-300 hover:scale-110 ${hovered ? 'animate-bounce' : ''} ` +
            (isDark
              ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white border border-indigo-700'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white')}
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
        >
          <span className="text-2xl sm:text-3xl">🤖</span>
        </button>
      )}
      {/* Animated Panel */}
      <div
        className={`transition-all duration-500 ease-in-out ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'} origin-bottom-right w-full max-w-xs sm:max-w-sm md:max-w-md min-w-0`}
        style={{ width: '100%' }}
      >
        {open && (
          <div className={`rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border ${isDark ? 'bg-gray-900 border-indigo-800' : 'bg-white border-indigo-200'}` }>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-indigo-800 bg-gradient-to-r from-gray-900 to-indigo-900' : 'border-indigo-100 bg-gradient-to-r from-indigo-500 to-purple-600'}` }>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">🤖 Project Assistant</span>
              </div>
              <IconButton size="small" onClick={() => setOpen(false)} className="text-white">
                <CloseIcon />
              </IconButton>
            </div>
            {/* Conversation */}
            <div className={`p-4 h-64 sm:h-80 min-h-[220px] sm:min-h-[320px] overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'}` }>
        {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <SmartToy className={`text-4xl mb-2 animate-pulse ${isDark ? 'text-indigo-300' : 'text-indigo-400'}`} />
                  <div className={`font-semibold ${isDark ? 'text-indigo-100' : ''}`}>👋 Hi there! How can I help you today?</div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    💡 Try asking things like "What are we working on this week?" or "📊 Summarize the project status"
                  </div>
                </div>
        ) : (
          <List>
            {conversation.map((msg, msgIdx) => (
              <Box key={msgIdx}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle2" 
                              color={msg.role === 'user' ? 'indigo' : msg.isError ? 'error' : 'purple'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {msg.role === 'user' ? '🧑 You' : '🤖 Project Assistant'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color={msg.isError ? 'error' : 'text.primary'}
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {msg.content}
                        </Typography>
                        {msg.sources && msg.sources.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Sources:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {msg.sources.map((source, srcIdx) => {
                                const isExpanded = expandedSources[msgIdx]?.has(srcIdx);
                                return (
                                  <Box key={srcIdx}>
                                    <Chip 
                                      label={source.type === 'task' ? `Task: ${source.title}` : `Comment`}
                                      size="small"
                                      variant="outlined"
                                      clickable
                                      onClick={() => handleToggleSource(msgIdx, srcIdx)}
                                      icon={isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                      sx={{ mb: 0.5 }}
                                    />
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                      <Paper sx={{ p: 1, mt: 0.5, mb: 0.5, bgcolor: 'grey.50', maxWidth: 320 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                          {source.type === 'task' ? `Task: ${source.title}` : source.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {source.snippet}
                                        </Typography>
                                      </Paper>
                                    </Collapse>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {msgIdx < conversation.length - 1 && <Divider component="li" />}
              </Box>
            ))}
            {isLoading && (
              <ListItem>
                      <div className="flex items-center gap-2 text-indigo-500 animate-pulse">
                        <CircularProgress size={20} />
                        <span>AI is thinking...</span>
                      </div>
              </ListItem>
            )}
          </List>
        )}
            </div>
            {/* Input */}
            <form onSubmit={handleSubmit} className={`flex gap-2 p-4 border-t ${isDark ? 'border-indigo-800 bg-gray-800' : 'border-indigo-100 bg-gray-50'}`}>
              <input
                type="text"
                className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 text-white border-gray-700 focus:ring-indigo-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 focus:ring-indigo-400 placeholder-gray-400'}`}
                placeholder="Ask a question about the project..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={isLoading}
                autoFocus={open}
              />
              <button
                type="submit"
                className={`rounded-lg px-4 py-2 font-semibold shadow transition disabled:opacity-50 ${isDark ? 'bg-gradient-to-r from-gray-900 to-indigo-900 text-white hover:from-indigo-800 hover:to-indigo-900' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'} ${!question.trim() || isLoading ? 'cursor-not-allowed' : ''}`}
                disabled={!question.trim() || isLoading}
              >
                <Send fontSize="small" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;