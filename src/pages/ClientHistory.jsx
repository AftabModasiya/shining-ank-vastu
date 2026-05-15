import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Trash2, Search, Calendar, User } from 'lucide-react';
import { getAllClients, deleteClient } from '../services/clientService';
import './ClientHistory.css';

function ClientHistory() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllClients();
      if (result.success) {
        setClients(result.data);
        setFilteredClients(result.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const handleView = (client) => {
    navigate(`/report/${client.id}`, { state: { clientData: client } });
  };

  const handleDelete = async (clientId) => {
    try {
      const result = await deleteClient(clientId);
      if (result.success) {
        setClients(clients.filter(c => c.id !== clientId));
        setDeleteConfirm(null);
      } else {
        alert('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('An error occurred while deleting');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="history-page">
      {/* Header */}
      <header className="history-header">
        <div className="container">
          <div className="history-header-content">
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              <ArrowLeft size={20} />
              Back to Home
            </button>
            <div className="header-title">
              <User size={32} />
              <div>
                <h1>Client History</h1>
                <p>{clients.length} total clients</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="history-content">
        <div className="container">
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Clients List */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <User size={64} className="empty-icon" />
              <h2>No Clients Found</h2>
              <p>
                {searchTerm
                  ? 'No clients match your search criteria'
                  : 'Start by adding your first client'}
              </p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  Add First Client
                </button>
              )}
            </div>
          ) : (
            <div className="clients-grid">
              {filteredClients.map((client) => (
                <div key={client.id} className="client-card">
                  <div className="client-header">
                    <div className="client-avatar">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="client-info">
                      <h3>{client.name}</h3>
                      <p className="client-dob">
                        <Calendar size={14} />
                        {client.dob}
                      </p>
                    </div>
                  </div>

                  <div className="client-details">
                    {client.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{client.phone}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Gender:</span>
                      <span className="detail-value">{client.gender}</span>
                    </div>
                    {client.createdAt && (
                      <div className="detail-item">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">{formatDate(client.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {client.report && (
                    <div className="client-numbers">
                      <div className="number-badge-small">
                        <span className="badge-label">Life Path</span>
                        <span className="badge-number">{client.report.lifePath}</span>
                      </div>
                      <div className="number-badge-small">
                        <span className="badge-label">Expression</span>
                        <span className="badge-number">{client.report.expression}</span>
                      </div>
                      <div className="number-badge-small">
                        <span className="badge-label">Soul Urge</span>
                        <span className="badge-number">{client.report.soulUrge}</span>
                      </div>
                    </div>
                  )}

                  <div className="client-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleView(client)}
                    >
                      <Eye size={16} />
                      View Report
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => setDeleteConfirm(client.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === client.id && (
                    <div className="delete-confirm">
                      <p>Are you sure you want to delete this client?</p>
                      <div className="confirm-actions">
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(client.id)}
                        >
                          Yes, Delete
                        </button>
                        <button
                          className="btn btn-outline btn-small"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="history-footer">
        <p>© 2026 Occult King by Pinnacle Vastu. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default ClientHistory;
