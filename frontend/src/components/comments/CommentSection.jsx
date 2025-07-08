import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FaReply, FaEdit, FaTrash, FaPaperclip, FaDownload, FaFileImage, FaFilePdf, FaFileAlt, FaFileArchive, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileVideo, FaFileAudio, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useThemeContext } from '../../context/ThemeContext';

// Helper to format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
}

// Helper to get file icon by mimetype/extension
function getFileIcon(file) {
  const type = file.mimetype || '';
  const ext = (file.filename || '').split('.').pop()?.toLowerCase();
  if (type.startsWith('image/')) return <FaFileImage className="text-blue-400 w-5 h-5" />;
  if (type === 'application/pdf' || ext === 'pdf') return <FaFilePdf className="text-red-500 w-5 h-5" />;
  if (type.startsWith('video/') || ext === 'mp4' || ext === 'mov') return <FaFileVideo className="text-purple-500 w-5 h-5" />;
  if (type.startsWith('audio/') || ext === 'mp3' || ext === 'wav') return <FaFileAudio className="text-pink-500 w-5 h-5" />;
  if (type.includes('word') || ext === 'doc' || ext === 'docx') return <FaFileWord className="text-blue-700 w-5 h-5" />;
  if (type.includes('excel') || ext === 'xls' || ext === 'xlsx') return <FaFileExcel className="text-green-600 w-5 h-5" />;
  if (type.includes('powerpoint') || ext === 'ppt' || ext === 'pptx') return <FaFilePowerpoint className="text-orange-500 w-5 h-5" />;
  if (type.includes('zip') || ext === 'zip' || ext === 'rar' || ext === '7z') return <FaFileArchive className="text-yellow-500 w-5 h-5" />;
  if (type.includes('text') || ext === 'txt' || ext === 'md') return <FaFileAlt className="text-gray-500 w-5 h-5" />;
  return <FaPaperclip className="text-gray-400 w-5 h-5" />;
}

// Helper to format file size
function formatFileSize(size) {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// Main CommentSection component
const CommentSection = ({
  resourceType, // 'project' or 'task'
  resourceId,
  fetchComments, // async function to fetch comments
  addComment,    // async function to add comment
  editComment,   // async function to edit comment
  deleteComment, // async function to delete comment
  currentUser    // current user object
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ content: '', files: [] });
  const fileInputRef = useRef();
  const [previewImg, setPreviewImg] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, commentId: null });
  const { mode } = useThemeContext();
  const darkMode = mode === 'dark';
  const [expandedAttachments, setExpandedAttachments] = useState({}); // { [commentId]: boolean }

  // Fetch comments on mount or when resource changes
  useEffect(() => {
    setLoading(true);
    fetchComments(resourceType, resourceId)
      .then(data => {
        console.log('Raw SQL result:', data.rows);
        setComments(data);
      })
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [resourceType, resourceId, fetchComments]);

  // Handle form input
  const handleInput = e => setForm(f => ({ ...f, content: e.target.value }));
  const handleFile = e => setForm(f => ({ ...f, files: Array.from(e.target.files) }));
  const resetForm = () => setForm({ content: '', files: [] });

  // Submit new or edited comment
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.content.trim() && form.files.length === 0) return;
    setLoading(true);
    try {
      if (editId) {
        await editComment(editId, form.content);
        setEditId(null);
      } else {
        await addComment({ content: form.content, files: form.files, replyTo });
        setReplyTo(null);
      }
      resetForm();
      // Refresh comments
      const data = await fetchComments(resourceType, resourceId);
      setComments(data);
    } catch {
      setError('Failed to submit comment');
    } finally {
      setLoading(false);
    }
  };

  // Delete comment
  const handleDelete = async () => {
    if (!deleteDialog.commentId) return;
    setLoading(true);
    try {
      await deleteComment(deleteDialog.commentId);
      const data = await fetchComments(resourceType, resourceId);
      setComments(data);
      toast.success('Comment deleted successfully!');
      setDeleteDialog({ open: false, commentId: null });
    } catch {
      setError('Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  // Toggle attachment dropdown for a comment
  const toggleAttachments = (commentId) => {
    setExpandedAttachments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Render a single comment (recursive for replies)
  const renderComment = (comment, depth = 0) => (
    <div key={comment._id} className={`pl-${depth * 4} py-2 border-l border-gray-200`}> 
      <div className="flex items-start gap-3">
        <img
          src={comment.author?.profilePicture || comment.author?.photo || `https://ui-avatars.com/api/?name=${comment.author?.name || 'U'}`}
          alt={comment.author?.name || 'User'}
          className="w-8 h-8 rounded-full object-cover border"
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
            <span className="font-semibold text-sm break-words max-w-full">{comment.author?.name || 'User'}</span>
            <span className="hidden [@media(min-width:400px)]:inline text-[10px] sm:text-xs text-gray-400 break-words max-w-full truncate sm:whitespace-nowrap" style={{minWidth:0}}>{formatDate(comment.createdAt)}</span>
          </div>
          {editId === comment._id ? (
            <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2">
              <textarea
                className="w-full border rounded p-2 text-sm"
                value={form.content}
                onChange={handleInput}
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Save</button>
                <button type="button" onClick={() => setEditId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="text-sm mt-1 whitespace-pre-line">{comment.content}</div>
          )}
          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold text-xs text-gray-500 mb-1">Attachments:</div>
              {/* Small screens: dropdown */}
              <div className="block sm:hidden -mx-2">
                <button
                  className={`flex items-center gap-2 px-2 py-1 rounded bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-white font-medium text-xs mb-2 focus:outline-none w-full max-w-full box-border justify-between overflow-hidden`}
                  onClick={() => toggleAttachments(comment._id)}
                  type="button"
                >
                  <span className="truncate overflow-hidden whitespace-nowrap block w-0 flex-1">Show Attachments ({comment.attachments.length})</span>
                  {expandedAttachments[comment._id] ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedAttachments[comment._id] && (
                  <div className="flex flex-wrap gap-3">
                    {comment.attachments.map(file => (
                      <div
                        key={file.id || file.file_id || file.url}
                        className={`flex flex-col items-center gap-1 p-1 rounded-xl border shadow hover:shadow-lg transition w-full max-w-full min-w-0 overflow-hidden box-border
                          ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        style={{ wordBreak: 'break-word' }}
                      >
                        <div className="flex items-center gap-2 w-full justify-center">
                          {getFileIcon(file)}
                          <span className="font-medium text-xs truncate break-all" title={file.filename}>{file.filename}</span>
                        </div>
                        {file.mimetype?.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="rounded shadow w-full h-auto object-contain max-h-28 hover:opacity-80 transition"
                            onClick={() => setPreviewImg(file.url)}
                            style={{ cursor: 'zoom-in' }}
                          />
                        ) : null}
                        <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                        <div className="flex gap-2 w-full justify-center">
                          <button
                            className="px-1 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            onClick={() => window.open(file.url, '_blank')}
                            title="Download file"
                            type="button"
                          >
                            <FaDownload className="inline mr-1" />Download
                          </button>
                          {file.mimetype?.startsWith('image/') && (
                            <button
                              className=" py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                              onClick={() => setPreviewImg(file.url)}
                              title="Preview image"
                              type="button"
                            >
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Large screens: always show */}
              <div className="hidden sm:flex flex-wrap gap-3">
                {comment.attachments.map(file => (
                  <div
                    key={file.id || file.file_id || file.url}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border shadow hover:shadow-lg transition w-full sm:w-44 max-w-full min-w-0 overflow-hidden
                      ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    <div className="flex items-center gap-2 w-full justify-center">
                      {getFileIcon(file)}
                      <span className="font-medium text-xs truncate break-all" title={file.filename}>{file.filename}</span>
                    </div>
                    {file.mimetype?.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="rounded shadow w-full h-auto object-contain max-h-28 hover:opacity-80 transition"
                        onClick={() => setPreviewImg(file.url)}
                        style={{ cursor: 'zoom-in' }}
                      />
                    ) : null}
                    <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                    <div className="flex gap-1 w-full justify-center">
                      <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        onClick={() => window.open(file.url, '_blank')}
                        title="Download file"
                        type="button"
                      >
                        <FaDownload className="inline mr-1" />Download
                      </button>
                      {file.mimetype?.startsWith('image/') && (
                        <button
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                          onClick={() => setPreviewImg(file.url)}
                          title="Preview image"
                          type="button"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Image preview modal */}
              {previewImg && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setPreviewImg(null)}>
                  <img src={previewImg} alt="Preview" className="max-h-[80vh] max-w-[90vw] rounded shadow-2xl border-4 border-white" />
                </div>
              )}
            </div>
          )}
          {/* Actions */}
          <div className="flex gap-2 mt-2 text-xs text-gray-500">
            <button onClick={() => { setReplyTo(comment._id); setEditId(null); setForm({ content: '', files: [] }); }} className="hover:text-blue-600 flex items-center gap-1"><FaReply />Reply</button>
            {currentUser && (currentUser._id === comment.author?._id || currentUser.id === comment.author?._id) && (
              <>
                <button onClick={() => { setEditId(comment._id); setForm({ content: comment.content, files: [] }); }} className="hover:text-blue-600 flex items-center gap-1"><FaEdit />Edit</button>
                <button onClick={() => setDeleteDialog({ open: true, commentId: comment._id })} className="hover:text-red-600 flex items-center gap-1"><FaTrash />Delete</button>
              </>
            )}
          </div>
          {/* Reply form */}
          {replyTo === comment._id && (
            <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
              <textarea
                className="w-full border rounded p-2 text-sm"
                value={form.content}
                onChange={handleInput}
                rows={2}
                autoFocus
              />
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFile}
                className="block text-xs"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Reply</button>
                <button type="button" onClick={() => { setReplyTo(null); resetForm(); }} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs">Cancel</button>
              </div>
            </form>
          )}
          {/* Render replies recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 border-l-2 border-gray-200 pl-4">
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full max-w-3xl px-2 sm:px-6 mx-auto p-2 sm:p-4 rounded shadow border transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'}`}
      style={{ minHeight: 0 }}>
      <h2 className="text-base sm:text-lg font-bold mb-4">Comments</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <textarea
          className={`w-full border rounded p-2 text-sm ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} resize-none min-h-[40px]`}
          placeholder="Add a comment..."
          value={form.content}
          onChange={handleInput}
          rows={2}
          style={{ fontSize: '0.95rem' }}
        />
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFile}
          className="block text-xs"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="submit" className={`w-full sm:w-auto px-4 py-2 rounded text-sm ${darkMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'}`} disabled={loading}>
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
          <button type="button" onClick={resetForm} className={`w-full sm:w-auto px-4 py-2 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}>Clear</button>
        </div>
      </form>
      <div>
        {loading && <div className="text-gray-400">Loading comments...</div>}
        {!loading && comments.length === 0 && <div className="text-gray-400">No comments yet.</div>}
        {!loading && comments.map(comment => renderComment(comment))}
      </div>
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="mb-4 text-center">Are you sure you want to delete this comment?</div>
            <div className="flex gap-4">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              <button onClick={() => setDeleteDialog({ open: false, commentId: null })} className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CommentSection.propTypes = {
  resourceType: PropTypes.oneOf(['project', 'task']).isRequired,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  fetchComments: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  editComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired
};

export default CommentSection; 