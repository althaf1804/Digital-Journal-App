import React, { useState } from 'react';
import api from '../services/api';

const TaskDetail = ({ task, onClose, onUpdated, onDeleted, onEdit }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { text: comment });
      onUpdated(res.data);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDeleted(task._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{task.title}</h3>
        {error && <div className="error-msg">{error}</div>}
        <p style={{ marginBottom: 8 }}>{task.description || 'No description'}</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className="badge" style={{ background: '#e5e7eb', color: '#374151' }}>
            {task.status}
          </span>
          {task.dueDate && (
            <span className="due-date">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          Assigned to: <strong>{task.assignedTo?.name || 'Unassigned'}</strong> · Created
          by: <strong>{task.createdBy?.name}</strong>
        </p>

        <h4 style={{ marginBottom: 8 }}>Comments</h4>
        <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 8 }}>
          {task.comments?.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No comments yet.</p>
          )}
          {task.comments?.map((c) => (
            <div className="comment" key={c._id}>
              <div className="comment-meta">
                {c.user?.name} · {new Date(c.createdAt).toLocaleString()}
              </div>
              <div>{c.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ flex: 1, padding: 8, border: '1px solid var(--border)', borderRadius: 8 }}
          />
          <button className="btn btn-sm" type="submit" disabled={submitting}>
            Post
          </button>
        </form>

        <div className="modal-actions">
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete Task
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
