import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import TaskModal from '../components/TaskModal';
import TaskDetail from '../components/TaskDetail';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const ProjectBoard = () => {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    socket.emit('joinProject', projectId);

    const onCreated = (task) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === task._id)) return prev;
        return [task, ...prev];
      });
    };
    const onUpdated = (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      setSelectedTask((cur) => (cur && cur._id === task._id ? task : cur));
    };
    const onDeleted = ({ _id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== _id));
    };

    socket.on('taskCreated', onCreated);
    socket.on('taskUpdated', onUpdated);
    socket.on('taskDeleted', onDeleted);

    return () => {
      socket.emit('leaveProject', projectId);
      socket.off('taskCreated', onCreated);
      socket.off('taskUpdated', onUpdated);
      socket.off('taskDeleted', onDeleted);
    };
  }, [projectId]);

  const handleCreateTask = async (data) => {
    const res = await api.post(`/projects/${projectId}/tasks`, data);
    setTasks((prev) => [res.data, ...prev]);
  };

  const handleUpdateTask = async (data) => {
    const res = await api.put(`/tasks/${editingTask._id}`, data);
    setTasks((prev) => prev.map((t) => (t._id === res.data._id ? res.data : t)));
  };

  const handleStatusChange = async (task, newStatus) => {
    if (task.status === newStatus) return;
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === res.data._id ? res.data : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email: inviteEmail });
      setProject(res.data);
      setInviteEmail('');
      setShowInvite(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find((t) => t._id === taskId);
    if (task) handleStatusChange(task, status);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterAssignee && t.assignedTo?._id !== filterAssignee) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  if (loading) return <div className="container">Loading project...</div>;
  if (error && !project) return <div className="container error-msg">{error}</div>;

  return (
    <div className="container">
      <Link to="/">&larr; Back to projects</Link>
      <div className="page-header" style={{ marginTop: 12 }}>
        <div>
          <h2>{project.name}</h2>
          <p style={{ color: '#6b7280' }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
            + Invite Member
          </button>
          <button
            className="btn"
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
          >
            + New Task
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="filters-row">
        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          <option value="">All Assignees</option>
          {project.members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="board">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);
          return (
            <div
              className="board-column"
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.key)}
            >
              <h4>
                {col.label}
                <span className="column-count">{colTasks.length}</span>
              </h4>
              {colTasks.map((task) => (
                <div
                  className="task-card"
                  key={task._id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task._id)}
                  onClick={() => setSelectedTask(task)}
                >
                  <h5>{task.title}</h5>
                  <div className="task-meta">
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    {task.dueDate && (
                      <span className="due-date">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {task.assignedTo && (
                    <p style={{ fontSize: '0.8rem', marginTop: 6, color: '#6b7280' }}>
                      {task.assignedTo.name}
                    </p>
                  )}
                </div>
              ))}
              {colTasks.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No tasks</p>
              )}
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={editingTask ? handleUpdateTask : handleCreateTask}
          members={project.members}
          initialData={editingTask}
        />
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setSelectedTask(updated);
          }}
          onDeleted={(taskId) => setTasks((prev) => prev.filter((t) => t._id !== taskId))}
          onEdit={(task) => {
            setEditingTask(task);
            setSelectedTask(null);
            setShowTaskModal(true);
          }}
        />
      )}

      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Invite Member</h3>
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInvite(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
