import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Download, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { updateClient } from '../services/clientService';
import { calculateLoShuGrid, calculateKua, getMissingNumbers, getPresentNumbers } from '../utils/numerology';
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
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      const newData = { ...editedData };
      let current = newData;
      
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
      setEditedData(newData);
    } else {
      setEditedData({
        ...editedData,
        [name]: value
      });
    }
  };

  const handleArrayChange = (e, path, index) => {
    const { value } = e.target;
    const parts = path.split('.');
    const newData = { ...editedData };
    let current = newData;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = { ...current[parts[i]] };
      current = current[parts[i]];
    }
    
    const arrayName = parts[parts.length - 1];
    current[arrayName] = [...current[arrayName]];
    
    // Support for both simple arrays and arrays of objects
    if (typeof current[arrayName][index] === 'object' && arguments[3]) {
      current[arrayName][index] = { ...current[arrayName][index], [arguments[3]]: value };
    } else {
      current[arrayName][index] = value;
    }
    
    setEditedData(newData);
  };

  const handleNestedArrayChange = (e, path, key, subfield) => {
    const { value } = e.target;
    const parts = path.split('.');
    const newData = { ...editedData };
    let current = newData;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = { ...current[parts[i]] };
      current = current[parts[i]];
    }
    
    const objName = parts[parts.length - 1];
    current[objName] = { ...current[objName] };
    current[objName][key] = { ...current[objName][key], [subfield]: value };
    setEditedData(newData);
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

  const report = isEditing ? editedData.report : clientData.report;
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
                  <button 
                    className="btn btn-outline btn-logout-small"
                    onClick={() => {
                      localStorage.removeItem('isAuthenticated');
                      window.location.href = '/login';
                    }}
                  >
                    Logout
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
                  <button 
                    className="btn btn-outline btn-logout-small"
                    onClick={() => {
                      localStorage.removeItem('isAuthenticated');
                      window.location.href = '/login';
                    }}
                  >
                    Logout
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
                  <p className="number-planet">
                    Planet: {isEditing ? (
                      <input 
                        type="text" 
                        name="report.lifePathTraits.planet" 
                        value={report.lifePathTraits.planet} 
                        onChange={handleInputChange} 
                        className="edit-input-inline"
                      />
                    ) : report.lifePathTraits.planet}
                  </p>
                  {isEditing ? (
                    <textarea 
                      name="report.lifePathTraits.desc" 
                      value={report.lifePathTraits.desc} 
                      onChange={handleInputChange} 
                      className="edit-textarea"
                    />
                  ) : (
                    <p className="number-desc">{report.lifePathTraits.desc}</p>
                  )}
                  
                  <div className="key-traits-edit">
                    <strong>Key Traits:</strong>
                    {report.lifePathTraits.keyTraits?.map((trait, idx) => (
                      isEditing ? (
                        <input 
                          key={idx}
                          type="text" 
                          value={trait} 
                          onChange={(e) => handleArrayChange(e, 'report.lifePathTraits.keyTraits', idx)} 
                          className="edit-input-small"
                        />
                      ) : (
                        <p key={idx} className="trait-item">• {trait}</p>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div className="number-card conductor-card">
                <div className="number-badge badge-2">2</div>
                <div className="number-info">
                  <h4>Conductor Number (Bhagyank)</h4>
                  <p className="number-subtitle">The Intuitive</p>
                  <p className="number-planet">
                    Planet: {isEditing ? (
                      <input 
                        type="text" 
                        name="report.expressionTraits.planet" 
                        value={report.expressionTraits.planet} 
                        onChange={handleInputChange} 
                        className="edit-input-inline"
                      />
                    ) : report.expressionTraits.planet}
                  </p>
                  {isEditing ? (
                    <textarea 
                      name="report.expressionTraits.desc" 
                      value={report.expressionTraits.desc} 
                      onChange={handleInputChange} 
                      className="edit-textarea"
                    />
                  ) : (
                    <p className="number-desc">{report.expressionTraits.desc}</p>
                  )}

                  <div className="key-traits-edit">
                    <strong>Key Traits:</strong>
                    {report.expressionTraits.keyTraits?.map((trait, idx) => (
                      isEditing ? (
                        <input 
                          key={idx}
                          type="text" 
                          value={trait} 
                          onChange={(e) => handleArrayChange(e, 'report.expressionTraits.keyTraits', idx)} 
                          className="edit-input-small"
                        />
                      ) : (
                        <p key={idx} className="trait-item">• {trait}</p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Date Influencer */}
          <section className="report-section">
            <div className="date-influencer-card">
              {isEditing ? (
                <>
                  <input 
                    name="report.dateInfluencer.title" 
                    value={report.dateInfluencer.title} 
                    onChange={handleInputChange} 
                    className="edit-input-bold"
                  />
                  <input 
                    name="report.dateInfluencer.desc" 
                    value={report.dateInfluencer.desc} 
                    onChange={handleInputChange} 
                    className="edit-input-small"
                  />
                  <textarea 
                    name="report.dateInfluencer.content" 
                    value={report.dateInfluencer.content} 
                    onChange={handleInputChange} 
                    className="edit-textarea"
                  />
                </>
              ) : (
                <>
                  <h4>{report.dateInfluencer.title}</h4>
                  <p>{report.dateInfluencer.desc}</p>
                  <p>{report.dateInfluencer.content}</p>
                </>
              )}
            </div>
          </section>

          {/* Lucky Elements */}
          <section className="report-section">
            <h3 className="section-title">🍀 Lucky Elements</h3>
            <div className="lucky-grid">
              {[
                { label: 'Lucky Dates', name: 'report.luckyElements.luckyDates', value: report.luckyElements.luckyDates },
                { label: 'Unlucky Dates', name: 'report.luckyElements.unluckyDates', value: report.luckyElements.unluckyDates },
                { label: 'Lucky Color', name: 'report.luckyElements.luckyColor', value: report.luckyElements.luckyColor },
                { label: 'Unlucky Color', name: 'report.luckyElements.unluckyColor', value: report.luckyElements.unluckyColor },
                { label: 'Lucky Direction', name: 'report.luckyElements.luckyDirection', value: report.luckyElements.luckyDirection },
                { label: 'Element', name: 'report.luckyElements.element', value: report.luckyElements.element },
              ].map((item, idx) => (
                <div key={idx} className="lucky-item">
                  <span className="lucky-label">{item.label}</span>
                  {isEditing ? (
                    <input 
                      name={item.name} 
                      value={item.value} 
                      onChange={handleInputChange} 
                      className="edit-input-small"
                    />
                  ) : (
                    <span className="lucky-value">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Lo Shu Grid */}
          <section className="report-section">
            <h3 className="section-title">🔢 LO SHU GRID ANALYSIS</h3>
            <div className="loshu-container">
              <div className="loshu-grid">
                {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((num, idx) => {
                  const grid = calculateLoShuGrid(displayData.dob);
                  const count = grid[num - 1];
                  const kua = calculateKua(displayData.dob, displayData.gender);
                  return (
                    <div key={idx} className={`grid-cell ${num === kua ? 'kua' : ''}`}>
                      {count > 0 ? (
                        <>
                          {num}
                          {count > 1 && <span className="cell-count">x{count}</span>}
                        </>
                      ) : (num === kua ? num : '-')}
                    </div>
                  );
                })}
              </div>
              <div className="grid-interpretation">
                <h4>Grid Interpretation</h4>
                <div className="present-numbers">
                  <p><strong>Present Numbers:</strong></p>
                  <div className="number-tags">
                    {getPresentNumbers(calculateLoShuGrid(displayData.dob)).map((item, idx) => (
                      <span key={idx} className="tag tag-present">
                        {item.num}{item.count > 1 ? `(x${item.count})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="missing-numbers">
                  <p><strong>Missing Numbers:</strong></p>
                  <div className="number-tags">
                    {getMissingNumbers(calculateLoShuGrid(displayData.dob)).map((num, idx) => (
                      <span key={idx} className="tag tag-missing">{num}</span>
                    ))}
                  </div>
                </div>
                <p className="kua-note"><strong>Your Kua Number: {calculateKua(displayData.dob, displayData.gender)}</strong></p>
                <p className="kua-desc">(Filled in grid as it was not naturally present in DOB)</p>
              </div>
            </div>
          </section>


          {/* Missing Numbers & Remedies */}
          {report.missingNumbersRemedies?.length > 0 && (
            <section className="report-section">
              <h3 className="section-title">🔴 MISSING NUMBERS & REMEDIES</h3>
              <div className="remedies-list">
                {report.missingNumbersRemedies.map((remedy, idx) => (
                  <div key={idx} className="remedy-card">
                    <div className="remedy-header">
                      <h4>Missing Number {remedy.num} ({remedy.planet})</h4>
                    </div>
                    {isEditing ? (
                      <div className="edit-remedy">
                        <label>Effects:</label>
                        <textarea 
                          value={remedy.effects} 
                          onChange={(e) => handleArrayChange(e, 'report.missingNumbersRemedies', idx, 'effects')} 
                          className="edit-textarea"
                        />
                        <label>Crystal Remedy:</label>
                        <input 
                          type="text" 
                          value={remedy.crystal} 
                          onChange={(e) => handleArrayChange(e, 'report.missingNumbersRemedies', idx, 'crystal')} 
                          className="edit-input"
                        />
                      </div>
                    ) : (
                      <div className="remedy-content">
                        <p><strong>Effects:</strong> {remedy.effects}</p>
                        <p className="crystal-text"><strong>Crystal Remedy:</strong> {remedy.crystal}</p>
                        {remedy.benefits && (
                          <div className="benefits-list">
                            <strong>Benefits:</strong>
                            <ul>
                              {remedy.benefits.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Repeated Numbers Analysis */}
          {report.repeatedNumbersAnalysis?.length > 0 && (
            <section className="report-section">
              <h3 className="section-title">🔁 REPEATED NUMBERS INFLUENCE</h3>
              <div className="repeated-grid">
                {report.repeatedNumbersAnalysis.map((item, idx) => (
                  <div key={idx} className="repeated-card">
                    <h4>Number {item.num} ({item.count} times)</h4>
                    {isEditing ? (
                      <textarea 
                        value={item.influence} 
                        onChange={(e) => handleArrayChange(e, 'report.repeatedNumbersAnalysis', idx, 'influence')} 
                        className="edit-textarea"
                      />
                    ) : (
                      <p>{item.influence}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Suitable Professions */}
          {report.suitableProfessions?.length > 0 && (
            <section className="report-section">
              <h3 className="section-title">💼 SUITABLE PROFESSIONS</h3>
              <div className="professions-list">
                {report.suitableProfessions.map((prof, idx) => (
                  <div key={idx} className="profession-item">
                    {isEditing ? (
                      <input 
                        value={prof} 
                        onChange={(e) => handleArrayChange(e, 'report.suitableProfessions', idx)} 
                        className="edit-input-inline"
                      />
                    ) : (
                      <span>• {prof}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Future Predictions (Personal Year Forecast) */}
          {report.futurePredictions && (
            <section className="report-section">
              <h3 className="section-title">📅 3-YEAR PERSONAL FORECAST</h3>
              <div className="forecast-grid">
                {Object.keys(report.futurePredictions).map((key) => {
                  const forecast = report.futurePredictions[key];
                  return (
                    <div key={key} className="forecast-card">
                      <h4>Year {forecast.year}</h4>
                      {isEditing ? (
                        <>
                          <input 
                            value={forecast.title} 
                            onChange={(e) => handleNestedArrayChange(e, 'report.futurePredictions', key, 'title')} 
                            className="edit-input-bold"
                          />
                          <textarea 
                            value={forecast.desc} 
                            onChange={(e) => handleNestedArrayChange(e, 'report.futurePredictions', key, 'desc')} 
                            className="edit-textarea"
                          />
                        </>
                      ) : (
                        <>
                          <h5>{forecast.title}</h5>
                          <p>{forecast.desc}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Personality Analysis */}
          <section className="report-section">
            <h3 className="section-title">✨ Personality Analysis</h3>
            <div className="personality-card">
              {isEditing ? (
                <>
                  <input 
                    name="report.personalityAnalysis.title" 
                    value={report.personalityAnalysis.title} 
                    onChange={handleInputChange} 
                    className="edit-input-bold"
                  />
                  <textarea 
                    name="report.personalityAnalysis.content" 
                    value={report.personalityAnalysis.content} 
                    onChange={handleInputChange} 
                    className="edit-textarea"
                  />
                </>
              ) : (
                <>
                  <h4>{report.personalityAnalysis.title}</h4>
                  <p>{report.personalityAnalysis.content}</p>
                </>
              )}
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
                  {isEditing ? (
                    <input 
                      value={affirmation} 
                      onChange={(e) => handleArrayChange(e, 'report.affirmations', index)} 
                      className="edit-input"
                    />
                  ) : (
                    <p>{affirmation}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Custom Page 1 */}
          <section className="report-section custom-page-section">
            <h3 className="section-title">📝 {isEditing ? (
              <input 
                name="report.customPage1.title" 
                value={report.customPage1.title} 
                onChange={handleInputChange} 
                className="edit-input-inline-title"
              />
            ) : report.customPage1.title}</h3>
            {isEditing ? (
              <textarea 
                name="report.customPage1.content" 
                value={report.customPage1.content} 
                onChange={handleInputChange} 
                placeholder="Write your custom notes here..."
                className="edit-textarea custom-page-textarea"
              />
            ) : (
              <p className="custom-page-content">{report.customPage1.content || "No additional notes."}</p>
            )}
          </section>

          {/* Custom Page 2 */}
          <section className="report-section custom-page-section">
            <h3 className="section-title">💎 {isEditing ? (
              <input 
                name="report.customPage2.title" 
                value={report.customPage2.title} 
                onChange={handleInputChange} 
                className="edit-input-inline-title"
              />
            ) : report.customPage2.title}</h3>
            {isEditing ? (
              <textarea 
                name="report.customPage2.content" 
                value={report.customPage2.content} 
                onChange={handleInputChange} 
                placeholder="Write your special recommendations here..."
                className="edit-textarea custom-page-textarea"
              />
            ) : (
              <p className="custom-page-content">{report.customPage2.content || "No special recommendations."}</p>
            )}
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

