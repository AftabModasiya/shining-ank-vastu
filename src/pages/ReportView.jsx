import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Download, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { updateClient } from '../services/clientService';
import { calculateLoShuGrid, calculateKua, getMissingNumbers, getPresentNumbers, calcMulank, calcBhagyank, getLuckyElements, calcPersonalYearForYear, getMobileAnalysis, getNameCompatibilityAnalysis, getCareerOutlook } from '../utils/numerology';
import './ReportView.css';

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


function ReportView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const getSafeClientData = (data) => {
    if (!data) return null;
    const safeData = { ...data };
    if (safeData.report) {
      safeData.report = {
        ...safeData.report,
        customPage1: safeData.report.customPage1 || { title: 'Note Page 1', content: '' },
        customPage2: safeData.report.customPage2 || { title: 'Note Page 2', content: '' },
        customPage3: safeData.report.customPage3 || { title: 'Note Page 3', content: '' }
      };
    }
    return safeData;
  };

  const [clientData, setClientData] = useState(() => getSafeClientData(location.state?.clientData || null));
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientData) {
      setEditedData(getSafeClientData(clientData));
    }
  }, [clientData]);

  const handleEdit = () => setIsEditing(true);

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

  const handleDownloadPDF = async () => {
    try {
      const pdf = await generatePDF(clientData);
      pdf.save(`${clientData.name}_Numerology_Report.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("An error occurred during PDF generation.");
    }
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
      setEditedData({ ...editedData, [name]: value });
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

  // ── Dynamic core calculations (always from raw DOB + gender) ────────
  const mulank = calcMulank(displayData.dob);
  const bhagyank = calcBhagyank(displayData.dob);
  const kuaNum = calculateKua(displayData.dob, displayData.gender);

  // Breakdown strings for display
  const mulankBreakdown = displayData.dob
    ? (displayData.dob.split('-')[2] || '').split('').join('+') + ' = ' + mulank
    : '';
  const bhagyankBreakdown = displayData.dob
    ? displayData.dob.replace(/-/g, '').split('').join('+') + ' = ' + bhagyank
    : '';
  const yearStr = displayData.dob ? displayData.dob.split('-')[0] : '';
  const yearSum = yearStr.split('').reduce((a, d) => a + parseInt(d), 0);
  const kuaBreakdown = displayData.gender === 'female'
    ? `4 + ${yearSum} = ${kuaNum}`
    : `11 - ${yearSum} = ${kuaNum}`;

  // Dynamic lucky elements — calculated from bhagyank + kuaNum (same logic as PDF)
  const luckyData = getLuckyElements(bhagyank, mulank, kuaNum);

  // Current personal year
  const personalYearNum = calcPersonalYearForYear(displayData.dob || '', new Date().getFullYear());

  // Dynamic mobile number compatibility insights
  const mobileData = getMobileAnalysis(displayData.phone || '', bhagyank);

  // Dynamic name compatibility insights
  const nameCompatData = getNameCompatibilityAnalysis(displayData.name || '', mulank, bhagyank);

  // Dynamic career outlook insights
  const careerData = getCareerOutlook(mulank, bhagyank);

  return (
    <div className={`report-page ${isEditing ? 'is-editing' : ''}`}>
      {/* ── Header ───────────────────────────────────────── */}
      <header className="report-header">
        <div className="container">
          <div className="report-header-content">
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              Back to Home
            </button>
            <div className="header-actions">
              {!isEditing ? (
                <>
                  <button className="btn btn-secondary" onClick={handleEdit}>
                    <Edit2 size={18} /> Edit Report
                  </button>
                  <button className="btn btn-primary" onClick={handleDownloadPDF}>
                    <Download size={18} /> Download PDF
                  </button>
                  <button
                    className="btn btn-outline btn-logout-small"
                    onClick={() => { localStorage.removeItem('isAuthenticated'); navigate('/login'); }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={handleCancel}>
                    <X size={18} /> Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    className="btn btn-outline btn-logout-small"
                    onClick={() => { localStorage.removeItem('isAuthenticated'); navigate('/login'); }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Report Content ────────────────────────────────── */}
      <div className="report-content">
        <div className="container rpt-inner">

          {/* ── 1. HERO / TITLE CARD ─────────────────────── */}
          <div className="report-title-section">
            {/* Decorative circles (top-right, matching screenshot) */}
            <div className="title-deco-ring title-deco-ring-1"></div>
            <div className="title-deco-ring title-deco-ring-2"></div>

            <p className="report-brand-label">SHINING ANK VASTU</p>

            <h1 className="report-client-name">
              {isEditing ? (
                <input type="text" name="name" value={editedData.name} onChange={handleInputChange} className="edit-input edit-name" />
              ) : displayData.name}
            </h1>

            <p className="report-meta">
              {isEditing ? (
                <input type="date" name="dob" value={editedData.dob} onChange={handleInputChange} className="edit-input edit-date" />
              ) : formatDateToDDMMYYYY(displayData.dob)}
              {' · '}
              <span style={{ textTransform: 'capitalize' }}>{displayData.gender}</span>
            </p>
          </div>

          {/* ── 2. ♦ Core Numbers ♦ DIVIDER ─────────────── */}
          <div className="core-divider">
            <div className="core-divider-line"></div>
            <div className="core-divider-label">
              <span className="core-diamond">♦</span>
              <span className="core-divider-text">Core Numbers</span>
              <span className="core-diamond">♦</span>
            </div>
            <div className="core-divider-line"></div>
          </div>

          {/* ── 3. CORE NUMBER CARDS (2-col grid) ─────────── */}
          <div className="core-numbers-grid">
            {/* Driver / Mulank — date digits only */}
            <div className="core-num-card core-yellow">
              <div className="title-deco-ring crd-ring-1"></div>
              <div className="title-deco-ring crd-ring-2"></div>
              <span className="core-num-label">MULANK</span>
              <span className="core-num-value">{mulank}</span>

              {isEditing && (
                <div className="core-edit-block">
                  <input type="text" name="report.lifePathTraits.planet" value={report.lifePathTraits.planet} onChange={handleInputChange} className="edit-input-small" placeholder="Planet" />
                  <textarea name="report.lifePathTraits.desc" value={report.lifePathTraits.desc} onChange={handleInputChange} className="edit-textarea" />
                </div>
              )}
            </div>

            {/* Conductor / Bhagyank — full DOB digit sum */}
            <div className="core-num-card core-yellow">
              <div className="title-deco-ring crd-ring-1"></div>
              <div className="title-deco-ring crd-ring-2"></div>
              <span className="core-num-label">BHAGYANK</span>
              <span className="core-num-value">{bhagyank}</span>

              {isEditing && (
                <div className="core-edit-block">
                  <input type="text" name="report.expressionTraits.planet" value={report.expressionTraits.planet} onChange={handleInputChange} className="edit-input-small" placeholder="Planet" />
                  <textarea name="report.expressionTraits.desc" value={report.expressionTraits.desc} onChange={handleInputChange} className="edit-textarea" />
                </div>
              )}
            </div>

            {/* Kua Number — gender-based formula */}
            <div className="core-num-card core-pink">
              <div className="title-deco-ring crd-ring-1"></div>
              <div className="title-deco-ring crd-ring-2"></div>
              <span className="core-num-label">KUA NUMBER</span>
              <span className="core-num-value">{kuaNum}</span>

            </div>

            {/* Name Number */}
            <div className="core-num-card core-yellow">
              <div className="title-deco-ring crd-ring-1"></div>
              <div className="title-deco-ring crd-ring-2"></div>
              <span className="core-num-label">NAME NUMBER</span>
              <div className="core-num-value-row">
                <span className="core-num-value">{nameCompatData.nameNumber}</span>
                <span className="core-num-compound">(Chaldean)</span>
              </div>
            </div>

            {/* Soul Urge */}
            {/* <div className="core-num-card core-blue">
              <div className="title-deco-ring crd-ring-1"></div>
              <div className="title-deco-ring crd-ring-2"></div>
              <span className="core-num-label">SOUL URGE</span>
              <span className="core-num-value">{report.soulUrge}</span>
            </div> */}

            {/* Personality */}
            {/* <div className="core-num-card core-blue">
              <div className="title-deco-ring crd-ring-1"></div>
              <div className="title-deco-ring crd-ring-2"></div>
              <span className="core-num-label">PERSONALITY</span>
              <span className="core-num-value">{report.personality}</span>
            </div> */}
          </div>

          {/* ── 4. DATE INFLUENCER ───────────────────────── */}
          <section className="report-section">
            <div className="date-influencer-card">
              {isEditing ? (
                <>
                  <input name="report.dateInfluencer.title" value={report.dateInfluencer.title} onChange={handleInputChange} className="edit-input-bold" />
                  <input name="report.dateInfluencer.desc" value={report.dateInfluencer.desc} onChange={handleInputChange} className="edit-input-small" />
                  <textarea name="report.dateInfluencer.content" value={report.dateInfluencer.content} onChange={handleInputChange} className="edit-textarea" />
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

          {/* ── 5. LUCKY ELEMENTS ────────────────────────── */}
          <section className="report-section">
            <h3 className="section-title">Lucky Elements</h3>
            <div className="lucky-grid">
              {[
                { label: 'Lucky Number', value: `${luckyData.luckyNumber} (Life Path)` },
                { label: 'Lucky Dates', value: luckyData.luckyDates },
                { label: 'Challenging Dates', value: luckyData.unluckyDates },
                { label: 'Lucky Color', value: luckyData.luckyColor },
                { label: 'Challenging Color', value: luckyData.unluckyColor },
                { label: 'Lucky Direction', value: luckyData.luckyDirection },
                { label: 'Core Element', value: luckyData.element },
                { label: 'Personal Year', value: `${personalYearNum} (${new Date().getFullYear()})` },
              ].map((item, idx) => (
                <div key={idx} className="lucky-item">
                  <span className="lucky-label">{item.label}</span>
                  <span className="lucky-value">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5b. MOBILE COMPATIBILITY INSIGHTS ─────────── */}
          <section className="report-section">
            <h3 className="section-title">Mobile Number Compatibility Insights</h3>
            {mobileData.isValid ? (
              <div className="mobile-insights-container">
                <div className="mobile-header-card">
                  <h4>Mobile Number: <span className="highlight-text">{displayData.phone}</span></h4>
                  <div className="mobile-badge-row">
                    <span className="badge">Total Sum: <strong>{mobileData.totalSum}</strong></span>
                    <span className="badge">Single Digit Root: <strong>{mobileData.singleDigit}</strong></span>
                    <span className="badge badge-compat">Compatibility: <strong>{mobileData.compatibility}</strong></span>
                  </div>
                </div>
                <div className="mobile-details-grid">
                  <div className="mobile-detail-card">
                    <span className="detail-label">Root Vibration Meaning</span>
                    <p className="detail-value">{mobileData.vibrationMeaning}</p>
                  </div>
                  <div className="mobile-detail-card">
                    <span className="detail-label">Destiny Compatibility</span>
                    <p className="detail-value">{mobileData.compatibilityDescription}</p>
                  </div>
                  <div className="mobile-detail-card">
                    <span className="detail-label">Vastu Energy Flow (Zeros)</span>
                    <p className="detail-value">{mobileData.zeroAnalysis}</p>
                  </div>
                  <div className="mobile-detail-card">
                    <span className="detail-label">Last 4 Digits Impact</span>
                    <p className="detail-value">
                      Digits [<strong>{mobileData.lastFourDigits}</strong>] sum to <strong>{mobileData.lastFourSingleDigit}</strong>: {mobileData.lastFourMeaning}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state-box">
                <p>No phone number registered for this client profile. Please click "Edit Report" and add a phone number in the contact details at the bottom of the page to generate mobile compatibility insights.</p>
              </div>
            )}
          </section>

          {/* ── 5c. NAME NUMBER COMPATIBILITY INSIGHTS ─────── */}
          <section className="report-section">
            <h3 className="section-title">Name Number Compatibility Analysis</h3>
            <div className="name-compatibility-container">
              <div className="name-header-card">
                <h4>Analyzed Name: <span className="highlight-text">{displayData.name || 'Native'}</span></h4>
                <div className="name-badge-row">
                  <span className="badge">Chaldean Root: <strong>{nameCompatData.nameNumber}</strong></span>
                  <span className="badge badge-compat">Compatibility Status: <strong>{nameCompatData.status}</strong></span>
                </div>
              </div>
              <div className="name-detail-card">
                <span className="detail-label">Planetary & Core Compatibility</span>
                <p className="detail-value">{nameCompatData.description}</p>
              </div>
            </div>
          </section>

          {/* ── 5d. PROFESSIONAL & CAREER OUTLOOK ─────────── */}
          <section className="report-section">
            <h3 className="section-title">💼 Professional & Career Outlook</h3>
            <div className="career-outlook-container">
              <div className="career-intro-card">
                <span className="detail-label">Dynamic Career Guidance & Best Paths</span>
                <p className="detail-value">{careerData.careerIntroText}</p>
              </div>
              <div className="career-professions-card">
                <span className="detail-label">Top Recommended Professions</span>
                <div className="professions-badge-row">
                  {careerData.professionsList.map((prof, idx) => (
                    <span key={idx} className="profession-badge">
                      <strong>{prof}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 6. LO SHU GRID ──────────────────────────── */}
          <section className="report-section">
            <h3 className="section-title">🔢 LO SHU GRID ANALYSIS</h3>
            <div className="loshu-container">
              <div className="loshu-grid">
                {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((num, idx) => {
                  const grid = calculateLoShuGrid(displayData.dob);
                  const count = grid[num - 1];
                  const kua = calculateKua(displayData.dob, displayData.gender);
                  return (
                    <div key={idx} className={`grid-cell ${count > 0 ? 'present' : ''} ${num === kua ? 'kua' : ''}`}>
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

          {/* ── 7. MISSING NUMBERS & REMEDIES ───────────── */}
          {report.missingNumbersRemedies?.length > 0 && (
            <section className="report-section">
              <h3 className="section-title">🔴 MISSING NUMBERS &amp; REMEDIES</h3>
              <div className="remedies-list">
                {report.missingNumbersRemedies.map((remedy, idx) => (
                  <div key={idx} className="remedy-card">
                    <div className="remedy-header">
                      <h4>Missing Number {remedy.num} ({remedy.planet})</h4>
                    </div>
                    {isEditing ? (
                      <div className="edit-remedy">
                        <label>Effects:</label>
                        <textarea value={remedy.effects} onChange={(e) => handleArrayChange(e, 'report.missingNumbersRemedies', idx, 'effects')} className="edit-textarea" />
                        <label>Crystal Remedy:</label>
                        <input type="text" value={remedy.crystal} onChange={(e) => handleArrayChange(e, 'report.missingNumbersRemedies', idx, 'crystal')} className="edit-input" />
                      </div>
                    ) : (
                      <div className="remedy-content">
                        <p><strong>Effects:</strong> {remedy.effects}</p>
                        <p className="crystal-text"><strong>Crystal Remedy:</strong> {remedy.crystal}</p>
                        {remedy.benefits && (
                          <div className="benefits-list">
                            <strong>Benefits:</strong>
                            <ul>{remedy.benefits.map((b, bIdx) => <li key={bIdx}>{b}</li>)}</ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 8. REPEATED NUMBERS ─────────────────────── */}
          {report.repeatedNumbersAnalysis?.length > 0 && (
            <section className="report-section">
              <h3 className="section-title">🔁 REPEATED NUMBERS INFLUENCE</h3>
              <div className="repeated-grid">
                {report.repeatedNumbersAnalysis.map((item, idx) => (
                  <div key={idx} className="repeated-card">
                    <h4>Number {item.num} ({item.count} times)</h4>
                    {isEditing ? (
                      <textarea value={item.influence} onChange={(e) => handleArrayChange(e, 'report.repeatedNumbersAnalysis', idx, 'influence')} className="edit-textarea" />
                    ) : (
                      <p>{item.influence}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 9. SUITABLE PROFESSIONS ──────────────────── */}
          {report.suitableProfessions?.length > 0 && (
            <section className="report-section">
              <h3 className="section-title">💼 SUITABLE PROFESSIONS</h3>
              <div className="professions-list">
                {report.suitableProfessions.map((prof, idx) => (
                  <div key={idx} className="profession-item">
                    {isEditing ? (
                      <input value={prof} onChange={(e) => handleArrayChange(e, 'report.suitableProfessions', idx)} className="edit-input-inline" />
                    ) : <span>• {prof}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 10. 3-YEAR FORECAST ──────────────────────── */}
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
                          <input value={forecast.title} onChange={(e) => handleNestedArrayChange(e, 'report.futurePredictions', key, 'title')} className="edit-input-bold" />
                          <textarea value={forecast.desc} onChange={(e) => handleNestedArrayChange(e, 'report.futurePredictions', key, 'desc')} className="edit-textarea" />
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

          {/* ── 11. PERSONALITY ANALYSIS ─────────────────── */}
          <section className="report-section">
            <h3 className="section-title">✨ Personality Analysis</h3>
            <div className="personality-card">
              {isEditing ? (
                <>
                  <input name="report.personalityAnalysis.title" value={report.personalityAnalysis.title} onChange={handleInputChange} className="edit-input-bold" />
                  <textarea name="report.personalityAnalysis.content" value={report.personalityAnalysis.content} onChange={handleInputChange} className="edit-textarea" />
                </>
              ) : (
                <>
                  <h4>{report.personalityAnalysis.title}</h4>
                  <p>{report.personalityAnalysis.content}</p>
                </>
              )}
              <div className="personality-highlights">
                <div className="highlight-item"><strong>Lucky Number:</strong> {luckyData.luckyNumber}</div>
                <div className="highlight-item"><strong>Lucky Color:</strong> {luckyData.luckyColor}</div>
                <div className="highlight-item"><strong>Lucky Direction:</strong> {luckyData.luckyDirection}</div>
              </div>
            </div>
          </section>

          {/* ── 12. DAILY AFFIRMATIONS ───────────────────── */}
          <section className="report-section">
            <h3 className="section-title">💫 Daily Affirmations</h3>
            <div className="affirmations-list">
              {report.affirmations.map((affirmation, index) => (
                <div key={index} className="affirmation-item">
                  <span className="affirmation-icon">✨</span>
                  {isEditing ? (
                    <input value={affirmation} onChange={(e) => handleArrayChange(e, 'report.affirmations', index)} className="edit-input" />
                  ) : <p>{affirmation}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* ── 13. CUSTOM NOTE PAGE 1 ─────────────────── */}
          <section className="report-section custom-page-section">
            <h3 className="section-title">📝 Notes / Suggestions (Page 1)</h3>
            {isEditing ? (
              <textarea name="report.customPage1.content" value={report.customPage1.content} onChange={handleInputChange} placeholder="Write notes / suggestions for page 1..." className="edit-textarea custom-page-textarea" />
            ) : (
              <p className="custom-page-content">{report.customPage1.content || 'No notes / suggestions.'}</p>
            )}
          </section>

          {/* ── 14. CUSTOM NOTE PAGE 2 ─────────────────── */}
          <section className="report-section custom-page-section">
            <h3 className="section-title">📝 Notes / Suggestions (Page 2)</h3>
            {isEditing ? (
              <textarea name="report.customPage2.content" value={report.customPage2.content} onChange={handleInputChange} placeholder="Write notes / suggestions for page 2..." className="edit-textarea custom-page-textarea" />
            ) : (
              <p className="custom-page-content">{report.customPage2.content || 'No notes / suggestions.'}</p>
            )}
          </section>

          {/* ── 15. CUSTOM NOTE PAGE 3 ─────────────────── */}
          <section className="report-section custom-page-section">
            <h3 className="section-title">📝 Notes / Suggestions (Page 3)</h3>
            {isEditing ? (
              <textarea name="report.customPage3.content" value={report.customPage3.content} onChange={handleInputChange} placeholder="Write notes / suggestions for page 3..." className="edit-textarea custom-page-textarea" />
            ) : (
              <p className="custom-page-content">{report.customPage3.content || 'No notes / suggestions.'}</p>
            )}
          </section>

          {/* ── 15. CONTACT INFO (edit mode only) ───────── */}
          {isEditing && (
            <section className="report-section">
              <h3 className="section-title">📞 Contact Information</h3>
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value={editedData.phone} onChange={handleInputChange} className="edit-input" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={editedData.email} onChange={handleInputChange} className="edit-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={editedData.address} onChange={handleInputChange} className="edit-input" />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="report-footer">
        <p>Shining Ank Vastu - M : 9913961553</p>
        <p>Vedic Numerology Report</p>
        <p>Report generated on: {(() => {
          const today = new Date();
          return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
        })()}</p>
      </footer>
    </div>
  );
}

export default ReportView;
