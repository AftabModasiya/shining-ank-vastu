import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Download, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { updateClient } from '../services/clientService';
import './ReportView.css';

function ReportView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(location.state?.clientData || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientData) {
      setEditedData({ ...clientData });
    }
  }, [clientData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData({ ...clientData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateClient(id, editedData);
      if (result.success) {
        setClientData(editedData);
        setIsEditing(false);
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    const pdf = generatePDF(clientData.report);
    pdf.save(`${clientData.name}_Numerology_Report.pdf`);
  };

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };

  if (!clientData) {
    return (
      <div className="report-page">
        <div className="container">
          <div className="error-state">
            <h2>No Report Data Found</h2>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const report = clientData.report;
  const displayData = isEditing ? editedData : clientData;

  return (
    <div className="report-page">
      {/* Header */}
      <header className="report-header">
        <div className="container">
          <div className="report-header-content">
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              <ArrowLeft size={20} />
              Back to Home
            </button>
            <div className="header-actions">
              {!isEditing ? (
                <>
                  <button className="btn btn-secondary" onClick={handleEdit}>
                    <Edit2 size={20} />
                    Edit Report
                  </button>
                  <button className="btn btn-primary" onClick={handleDownloadPDF}>
                    <Download size={20} />
                    Download PDF
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={handleCancel}>
                    <X size={20} />
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <div className="report-content">
        <div className="container">
          {/* Title Section */}
          <div className="report-title-section">
            <div className="crown-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="report-main-title">SHINING ANK VASTU</h1>
            <h2 className="report-subtitle">Numerology Report</h2>
            <p className="report-tagline">Based on Vedic Science & Numerological Combinations</p>
            
            <div className="client-name-box">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedData.name}
                  onChange={handleInputChange}
                  className="edit-input edit-name"
                />
              ) : (
                <h3>{displayData.name.toUpperCase()}</h3>
              )}
            </div>
            
            <p className="birth-date">
              Born on: {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={editedData.dob}
                  onChange={handleInputChange}
                  className="edit-input edit-date"
                />
              ) : displayData.dob}
            </p>
          </div>

          {/* Core Numbers */}
          <section className="report-section">
            <h3 className="section-title">📊 CORE NUMBERS ANALYSIS</h3>
            
            <div className="numbers-grid">
              <div className="number-card driver-card">
                <div className="number-badge badge-1">1</div>
                <div className="number-info">
                  <h4>Driver Number (Mulank)</h4>
                  <p className="number-subtitle">The Leader</p>
                  <p className="number-planet">Planet: {report.lifePathTraits.planet}</p>
                  <p className="number-desc">{report.lifePathTraits.desc}</p>
                </div>
              </div>

              <div className="number-card conductor-card">
                <div className="number-badge badge-2">2</div>
                <div className="number-info">
                  <h4>Conductor Number (Bhagyank)</h4>
                  <p className="number-subtitle">The Intuitive</p>
                  <p className="number-planet">Planet: {report.expressionTraits.planet}</p>
                  <p className="number-desc">{report.expressionTraits.desc}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Date Influencer */}
          <section className="report-section">
            <div className="date-influencer-card">
              <h4>📅 Date Influencer - Born on {displayData.dob.split('-')[2]}</h4>
              <p>People born on 1, 10, 19, 28 (any month)</p>
              <p>These people give importance to other's point of view as well but have a rational mind. Due to the presence of 2, Moon, they will have a pleasing personality.</p>
            </div>
          </section>

          {/* Lucky Elements */}
          <section className="report-section">
            <h3 className="section-title">🍀 Lucky Elements</h3>
            <div className="lucky-grid">
              <div className="lucky-item">
                <span className="lucky-label">Lucky Dates</span>
                <span className="lucky-value">1, 10, 19, 28</span>
              </div>
              <div className="lucky-item">
                <span className="lucky-label">Unlucky Dates</span>
                <span className="lucky-value">8, 17, 26</span>
              </div>
              <div className="lucky-item">
                <span className="lucky-label">Lucky Color</span>
                <span className="lucky-value">Orange</span>
              </div>
              <div className="lucky-item">
                <span className="lucky-label">Unlucky Color</span>
                <span className="lucky-value">Black & Brown</span>
              </div>
              <div className="lucky-item">
                <span className="lucky-label">Lucky Direction</span>
                <span className="lucky-value">East</span>
              </div>
              <div className="lucky-item">
                <span className="lucky-label">Element</span>
                <span className="lucky-value">Fire</span>
              </div>
            </div>
          </section>

          {/* Lo Shu Grid */}
          <section className="report-section">
            <h3 className="section-title">🔢 LO SHU GRID ANALYSIS</h3>
            <div className="loshu-container">
              <div className="loshu-grid">
                <div className="grid-cell">-</div>
                <div className="grid-cell">9</div>
                <div className="grid-cell">2</div>
                <div className="grid-cell kua">3</div>
                <div className="grid-cell">-</div>
                <div className="grid-cell">-</div>
                <div className="grid-cell">8</div>
                <div className="grid-cell">1</div>
                <div className="grid-cell">-</div>
              </div>
              <div className="grid-interpretation">
                <h4>Grid Interpretation</h4>
                <div className="present-numbers">
                  <p><strong>Present Numbers:</strong></p>
                  <div className="number-tags">
                    <span className="tag tag-present">1(x4)</span>
                    <span className="tag tag-present">2(x2)</span>
                    <span className="tag tag-present">3</span>
                    <span className="tag tag-present">8(x3)</span>
                    <span className="tag tag-present">9</span>
                  </div>
                </div>
                <div className="missing-numbers">
                  <p><strong>Missing Numbers:</strong></p>
                  <div className="number-tags">
                    <span className="tag tag-missing">4</span>
                    <span className="tag tag-missing">5</span>
                    <span className="tag tag-missing">6</span>
                    <span className="tag tag-missing">7</span>
                  </div>
                </div>
                <p className="kua-note"><strong>Your Kua Number: 3</strong></p>
                <p className="kua-desc">(Filled in grid as it was not naturally present in DOB)</p>
              </div>
            </div>
          </section>

          {/* Personality Analysis */}
          <section className="report-section">
            <h3 className="section-title">✨ Personality Analysis</h3>
            <div className="personality-card">
              <h4>Life Path {report.lifePath} + Destiny {report.expression}</h4>
              <p>You will fulfil all that you take up in life provided you have good name number. You will work far more efficiently for others than if you work independently. In case you work independently, you will remain confused between the choices to make. You are physically strong but mentally emotional or sensitive. You will get a lot of attention from the opposite sex.</p>
              <div className="personality-highlights">
                <div className="highlight-item">
                  <strong>Lucky Numbers:</strong> 2, 3, 9
                </div>
                <div className="highlight-item">
                  <strong>Lucky Colors:</strong> White
                </div>
              </div>
            </div>
          </section>

          {/* Affirmations */}
          <section className="report-section">
            <h3 className="section-title">💫 Daily Affirmations</h3>
            <div className="affirmations-list">
              {report.affirmations.map((affirmation, index) => (
                <div key={index} className="affirmation-item">
                  <span className="affirmation-icon">✨</span>
                  <p>{affirmation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Info (if editing) */}
          {isEditing && (
            <section className="report-section">
              <h3 className="section-title">📞 Contact Information</h3>
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editedData.phone}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editedData.address}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="report-footer">
        <p>Shining Ank Vastu</p>
        <p>Vedic Numerology Report</p>
        <p>Report generated on: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

export default ReportView;
