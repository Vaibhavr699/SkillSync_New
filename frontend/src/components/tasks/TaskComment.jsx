import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getComments, createComment, updateComment, deleteComment } from '../../store/slices/commentSlice';
import { Avatar, Button, Card, Typography, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const TaskComment = ({ taskId }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const comments = useSelector(state => state.comments.comments.task?.[taskId] || []);
  const loading = useSelector(state => state.comments.loading);

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    dispatch(getComments({ resourceType: 'task', resourceId: taskId }));
  }, [dispatch, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        resourceType: 'task',
        resourceId: taskId,
        content,
        entityId: taskId,
        entityType: 'task'
      };
      await dispatch(createComment(payload));
      setContent('');
      setSuccess('Comment posted!');
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleEditSave = async (commentId) => {
    try {
      await dispatch(updateComment({
        resourceType: 'task',
        resourceId: taskId,
        commentId,
        content: editingContent
      }));
      setSuccess('Comment updated!');
      setEditingCommentId(null);
      setEditingContent('');
    } catch (err) {
      setError('Failed to update comment');
    }
  };

  const handleDeleteClick = (commentId) => {
    setDeleteTargetId(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await dispatch(deleteComment({
        resourceType: 'task',
        resourceId: taskId,
        commentId: deleteTargetId
      }));
      setSuccess('Comment deleted!');
    } catch (err) {
      setError('Failed to delete comment');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleDeleteCancelDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-4 my-4 bg-white border border-gray-100 rounded-xl shadow-md">
      <Typography variant="h6" className="mb-2 font-bold text-indigo-800">Task Comments</Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Avatar src={user?.photo} alt={user?.name} />
          <textarea
            className="w-full resize-none rounded border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            style={{ minHeight: 40, maxWidth: '100%' }}
            placeholder="Write a comment..."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 border border-gray-100">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment._id || comment.id} className="flex items-start gap-3 bg-white rounded-2xl shadow border border-gray-100 p-4">
              <Avatar src={comment.author_photo || comment.author?.photo} alt={comment.author_name || comment.author?.name} className="w-10 h-10 border-2 border-white shadow-md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{comment.author_name || comment.author?.name || 'Unknown'}</span>
                  {(user && (
                    user._id === comment.author_id ||
                    user.id === comment.author_id ||
                    user._id === comment.author?._id ||
                    user.id === comment.author?._id
                  )) && (
                    <span className="flex gap-1">
                      <IconButton size="small" onClick={() => handleEdit(comment._id || comment.id, comment.content)}>
                        Edit
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(comment._id || comment.id)} color="error">
                        Delete
                      </IconButton>
                    </span>
                  )}
                </div>
                {editingCommentId === (comment._id || comment.id) ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      className="w-full resize-none rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button variant="contained" size="small" onClick={() => handleEditSave(comment._id || comment.id)} disabled={!editingContent.trim()}>Save</Button>
                      <Button variant="outlined" size="small" onClick={handleEditCancel}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-1">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancelDialog}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this comment? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancelDialog} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TaskComment; 