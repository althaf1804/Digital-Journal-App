import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProjectModal from '../components/ProjectModal';

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (data) => {
    const res = await api.post('/projects', data);
    setProjects((prev) => [res.data, ...prev]);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>My Projects</h2>
        <button className="btn" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <Link
              to={`/projects/${project._id}`}
              key={project._id}
              style={{ color: 'inherit' }}
            >
              <div className="card">
                <h3>{project.name}</h3>
                <p>{project.description || 'No description'}</p>
                <div className="members-row">
                  {project.members.slice(0, 5).map((m) => (
                    <div className="avatar-chip" key={m._id} title={m.name}>
                      {getInitials(m.name)}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
    </div>
  );
};

export default Dashboard;
