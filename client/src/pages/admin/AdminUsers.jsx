// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import { adminAPI } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers(filterRole ? { role: filterRole } : {});
      setUsers(res.data.users);
    } catch {
      setMessage('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filterRole]);

  const handleToggle = async (userId) => {
    try {
      const res = await adminAPI.toggleUser(userId);
      setMessage(res.data.message);
      fetchUsers();
    } catch {
      setMessage('Failed to update user status.');
    }
  };

  const roleBadge = (role) => {
    const colors = { admin: 'danger', student: 'primary', donor: 'success' };
    return <span className={`badge bg-${colors[role] || 'secondary'}`}>{role.toUpperCase()}</span>;
  };

  return (
    <>
      <Topbar title="Users Management" />
      <div className="page-content">
        {message && (
          <div className={`alert ${message.includes('Failed') ? 'alert-danger' : 'alert-success'} alert-dismissible`}>
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        )}

        <div className="card mb-3">
          <div className="card-body d-flex gap-2">
            {['', 'student', 'donor', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`btn btn-sm ${filterRole === r ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="bi bi-people me-2"></i>Users ({users.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-muted py-4">No users found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggle(u._id)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;

