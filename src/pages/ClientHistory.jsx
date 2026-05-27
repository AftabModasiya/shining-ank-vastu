import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Trash2, Search, Calendar, User } from 'lucide-react';
import { getAllClients, deleteClient } from '../services/clientService';
import { calcMulank, calcBhagyank, getNameCompatibilityAnalysis } from '../utils/numerology';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './ClientHistory.css';

function ClientHistory() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    return dateStr;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="history-page">
      {/* Header */}
      <header className="history-header">
        <div className="container">
          <div className="history-header-content">
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              <ArrowLeft size={20} />
              {t.backToHome}
            </button>
            <div className="header-title">
              <User size={32} />
              <div>
                <h1>{t.historyTitle}</h1>
                <p>{clients.length} {t.historySubtitle}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LanguageSwitcher />
              <button
                className="btn btn-outline btn-logout"
                onClick={() => { localStorage.removeItem('isAuthenticated'); window.location.reload(); }}
              >
                {t.logout}
              </button>
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
                placeholder={t.searchPlaceholder}
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
              <p>{t.loadingClients}</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <User size={64} className="empty-icon" />
              <h2>{t.noClientsFound}</h2>
              <p>
                {searchTerm ? t.noClientsSearch : t.noClientsEmpty}
              </p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  {t.addFirstClient}
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
                        {formatDateToDDMMYYYY(client.dob)}
                      </p>
                    </div>
                  </div>

                  <div className="client-details">
                    {client.email && (
                      <div className="detail-item">
                        <span className="detail-label">{t.emailLabel}</span>
                        <span className="detail-value">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="detail-item">
                        <span className="detail-label">{t.phoneLabel}</span>
                        <span className="detail-value">{client.phone}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">{t.genderLabel}</span>
                      <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                        {client.gender === 'female' ? t.female : (client.gender === 'male' ? t.male : client.gender)}
                      </span>
                    </div>
                    {client.createdAt && (
                      <div className="detail-item">
                        <span className="detail-label">{t.createdLabel}</span>
                        <span className="detail-value">{formatDate(client.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const mVal = calcMulank(client.dob || '');
                    const bVal = calcBhagyank(client.dob || '');
                    const nVal = getNameCompatibilityAnalysis(client.name || '', mVal, bVal).nameNumber;
                    const isHi = language === 'hi';
                    return (
                      <div className="client-numbers">
                        <div className="number-badge-small">
                          <span className="badge-label">{t.rpt.mulank}</span>
                          <span className="badge-number">{mVal}</span>
                        </div>
                        <div className="number-badge-small">
                          <span className="badge-label">{t.rpt.bhagyank}</span>
                          <span className="badge-number">{bVal}</span>
                        </div>
                        <div className="number-badge-small">
                          <span className="badge-label">{isHi ? 'नाम अंक' : 'Name No.'}</span>
                          <span className="badge-number">{nVal}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="client-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleView(client)}
                    >
                      <Eye size={16} />
                      {t.viewReport}
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => setDeleteConfirm(client.id)}
                    >
                      <Trash2 size={16} />
                      {t.delete}
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === client.id && (
                    <div className="delete-confirm">
                      <p>{t.deleteConfirmMsg}</p>
                      <div className="confirm-actions">
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(client.id)}
                        >
                          {t.confirmDelete}
                        </button>
                        <button
                          className="btn btn-outline btn-small"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          {t.cancel}
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
        <p>{t.footer}</p>
        <p>{t.footerSubtitle}</p>
      </footer>
    </div>
  );
}

export default ClientHistory;
