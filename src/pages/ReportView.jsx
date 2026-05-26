import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Download, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { updateClient } from '../services/clientService';
import { calculateLoShuGrid, calculateKua, getMissingNumbers, getPresentNumbers, calcMulank, calcBhagyank, getLuckyElements, calcPersonalYearForYear, getMobileAnalysis, getNameCompatibilityAnalysis, getCareerOutlook, getArrows, getRepeatedNumbers, getKuaVastuData, getMissingNumberRemedyData, getNumberCompatibilityAnalysis, getMobileCompatibilityCheck, getNameNumerologyCheck, getForeignSettlement, getMatchMaking, getMarriageType } from '../utils/numerology';
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
    if (!safeData.report) {
      safeData.report = {};
    }
    const clientGender = safeData.gender || 'male';
    const clientName = safeData.name || '';
    const clientDob = safeData.dob || '';
    const spouseName = safeData.spouseName || '';
    const clientIsFemale = clientGender === 'female';

    safeData.report = {
      ...safeData.report,
      customPage1: safeData.report.customPage1 || { title: 'Note Page 1', content: '' },
      customPage2: safeData.report.customPage2 || { title: 'Note Page 2', content: '' },
      customPage3: safeData.report.customPage3 || { title: 'Note Page 3', content: '' },
      matchMaking: safeData.report.matchMaking || {
        male: {
          name: clientIsFemale ? (spouseName || 'Partner Name Not Added') : clientName,
          dob: clientIsFemale ? '1971-07-27' : clientDob
        },
        female: {
          name: clientIsFemale ? clientName : (spouseName || 'Partner Name Not Added'),
          dob: clientIsFemale ? clientDob : '1976-05-12'
        }
      }
    };
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

  // Dynamic mobile number compatibility insights (Bug 3 fix: pass mulank AND bhagyank)
  const mobileData = getMobileAnalysis(displayData.phone || '', mulank, bhagyank);

  // NEW: Strict planetary matrix mobile compatibility check
  const mobileCheck = getMobileCompatibilityCheck(displayData.phone || '', mulank, bhagyank, displayData.dob || '');

  // Dynamic name compatibility insights
  const nameCompatData = getNameCompatibilityAnalysis(displayData.name || '', mulank, bhagyank);

  // NEW: Strict planetary matrix name numerology check
  const nameNumerologyCheck = getNameNumerologyCheck(displayData.name || '', mulank, bhagyank);

  // Dynamic Chaldean compatibility insights
  const compatibilityAnalysis = getNumberCompatibilityAnalysis(mulank, bhagyank);

  // Dynamic career outlook insights
  const careerData = getCareerOutlook(mulank, bhagyank);

  // NEW: Foreign Settlement prediction
  const foreignSettlement = getForeignSettlement(displayData.dob || '', mulank, bhagyank);

  // NEW: Love vs Arranged Marriage prediction
  const marriageType = getMarriageType(displayData.dob || '', mulank, bhagyank);

  // NOTE: Match Making uses two separate client profiles — it's filled by the consultant
  // in edit mode via report.matchMaking fields; default empty guard here
  const clientGenderForMM = displayData.gender || 'male';
  const clientNameForMM = displayData.name || '';
  const clientDobForMM = displayData.dob || '';
  const spouseNameForMM = displayData.spouseName || '';
  const clientIsFemaleForMM = clientGenderForMM === 'female';

  const mmData = {
    male: {
      name: report?.matchMaking?.male?.name || (clientIsFemaleForMM ? (spouseNameForMM || 'Partner Name Not Added') : clientNameForMM),
      dob: report?.matchMaking?.male?.dob || (clientIsFemaleForMM ? '1971-07-27' : clientDobForMM)
    },
    female: {
      name: report?.matchMaking?.female?.name || (clientIsFemaleForMM ? clientNameForMM : (spouseNameForMM || 'Partner Name Not Added')),
      dob: report?.matchMaking?.female?.dob || (clientIsFemaleForMM ? clientDobForMM : '1976-05-12')
    }
  };

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

            {isEditing ? (
              <div className="report-meta-edit" style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', color: '#1a3a2e', marginBottom: '2px', fontWeight: 'bold' }}>Date of Birth</label>
                  <input type="date" name="dob" value={editedData.dob} onChange={handleInputChange} className="edit-input edit-date" style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #d4a017', background: '#fff', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', color: '#1a3a2e', marginBottom: '2px', fontWeight: 'bold' }}>Phone Number</label>
                  <input type="tel" name="phone" value={editedData.phone} onChange={handleInputChange} className="edit-input edit-phone" style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #d4a017', background: '#fff', fontSize: '0.85rem', width: '130px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', color: '#1a3a2e', marginBottom: '2px', fontWeight: 'bold' }}>Gender</label>
                  <select name="gender" value={editedData.gender} onChange={handleInputChange} className="edit-input edit-gender" style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #d4a017', background: '#fff', fontSize: '0.85rem' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="report-meta">
                {formatDateToDDMMYYYY(displayData.dob)}
                {' · '}
                <span style={{ textTransform: 'capitalize' }}>{displayData.gender}</span>
                {displayData.phone && ` · M: ${displayData.phone}`}
              </p>
            )}
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
                // ... (header and report content)

                { label: 'Lucky Dates', value: luckyData.luckyDates },
                { label: 'Challenging Dates', value: luckyData.unluckyDates },
                { label: 'Lucky Color', value: luckyData.luckyColor },
                { label: 'Challenging Color', value: luckyData.unluckyColor },
                { label: 'Lucky Direction', value: luckyData.luckyDirection },
                { label: 'Core Element', value: `${luckyData.element} (${luckyData.planetEnergy})` },
                { label: 'Personal Year', value: `${personalYearNum} (${new Date().getFullYear()})` },
              ].map((item, idx) => (
                <div key={idx} className="lucky-item">
                  <span className="lucky-label">{item.label}</span>
                  <span className="lucky-value">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5b. MOBILE ANALYSIS (Strict Planetary Matrix) ─── */}
          <section className="report-section">
            <h3 className="section-title">📱 Mobile Number Analysis</h3>
            {mobileCheck.isValid ? (
              <div className="name-compatibility-container">

                {/* Inputs Info Header */}
                <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #f4f6f9, #e9ecef)', border: '1.5px solid #6c757d', marginBottom: '10px' }}>
                  <h4 style={{ color: '#2b303a', marginBottom: '8px' }}>MOBILE NUMBER ANALYSIS: <span className="highlight-text">{displayData.phone}</span></h4>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#495057' }}>Mobile Total: <strong style={{ color: '#007bff' }}>{mobileCheck.totalSum} ({mobileCheck.singleDigit})</strong></span>
                    <span style={{ fontSize: '0.9rem', color: '#495057' }}>Mulank: <strong>{mobileCheck.mulank}</strong></span>
                    <span style={{ fontSize: '0.9rem', color: '#495057' }}>Bhagyank: <strong>{mobileCheck.bhagyank}</strong></span>
                  </div>
                </div>

                {/* Analysis Bullets */}
                <div className="name-detail-card" style={{ marginBottom: '10px' }}>
                  <span className="detail-label">DETAILED COMPATIBILITY INSIGHTS</span>
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mobileCheck.bullets.map((bullet, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1rem', color: '#495057' }}>•</span>
                        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#333' }}>{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Banner */}
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  background: mobileCheck.overallStatus === 'Friendly' ? '#d4edda' : mobileCheck.overallStatus === 'Non-Friendly' ? '#f8d7da' : '#fff3cd',
                  border: `2px solid ${mobileCheck.overallStatus === 'Friendly' ? '#28a745' : mobileCheck.overallStatus === 'Non-Friendly' ? '#dc3545' : '#ffc107'}`,
                  textAlign: 'center'
                }}>
                  <strong style={{ fontSize: '1.05rem', color: mobileCheck.overallStatus === 'Friendly' ? '#155724' : mobileCheck.overallStatus === 'Non-Friendly' ? '#721c24' : '#856404' }}>
                    STATUS: {mobileCheck.overallStatus}
                  </strong>
                </div>

              </div>
            ) : (
              <div className="empty-state-box">
                <p>No phone number registered for this client profile. Add a phone number to generate mobile analysis.</p>
              </div>
            )}
          </section>

          {/* ── 5c. NAME NUMEROLOGY (Strict Planetary Matrix) ─── */}
          <section className="report-section">
            <h3 className="section-title">🔤 Name Numerology Analysis</h3>
            {nameNumerologyCheck.isValid ? (
              <div className="name-compatibility-container">

                {!nameNumerologyCheck.lastNameCard ? (
                  /* SINGLE NAME ANALYSIS (when no last name is present) */
                  <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                    <h4 style={{ color: '#1a3a2e' }}>NAME ANALYSIS: <span className="highlight-text">{nameNumerologyCheck.firstNameCard.name}</span></h4>
                    <div className="name-badge-row" style={{ marginTop: '6px' }}>
                      <span className="badge">Compound: <strong>{nameNumerologyCheck.firstNameCard.compound}</strong></span>
                      <span className="badge">Single: <strong>{nameNumerologyCheck.firstNameCard.single}</strong></span>
                      <span className="badge" style={{
                        background: nameNumerologyCheck.fullNameCard.overallGood ? '#d4edda' : '#f8d7da',
                        color: nameNumerologyCheck.fullNameCard.overallGood ? '#155724' : '#721c24',
                      }}>{nameNumerologyCheck.fullNameCard.overallGood ? '✓ Good' : '✗ Needs Attention'}</span>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span>{nameNumerologyCheck.firstNameCard.not48Check ? '🟢' : '🔴'}</span>
                        <span style={{ fontSize: '0.88rem', color: '#444' }}>
                          Name Count should not be 4 or 8.{nameNumerologyCheck.firstNameCard.not48Check ? ' ✓' : ` Currently ${nameNumerologyCheck.firstNameCard.single}.`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span>{nameNumerologyCheck.firstNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.firstNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                        <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.firstNameCard.compatLine}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span>{nameNumerologyCheck.fullNameCard.targetOk ? '🟢' : '🔴'}</span>
                        <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.fullNameCard.targetLine}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span>{nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                        <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.firstNameCard.compoundLine}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* THREE SECTIONS: FIRST, LAST, AND FULL NAME ANALYSIS */
                  <>
                    {/* FIRST NAME CARD */}
                    <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                      <h4 style={{ color: '#1a3a2e' }}>FIRST NAME: <span className="highlight-text">{nameNumerologyCheck.firstNameCard.name}</span></h4>
                      <div className="name-badge-row" style={{ marginTop: '6px' }}>
                        <span className="badge">Compound: <strong>{nameNumerologyCheck.firstNameCard.compound}</strong></span>
                        <span className="badge">Single: <strong>{nameNumerologyCheck.firstNameCard.single}</strong></span>
                        <span className="badge" style={{
                          background: nameNumerologyCheck.firstNameCard.overallGood ? '#d4edda' : '#f8d7da',
                          color: nameNumerologyCheck.firstNameCard.overallGood ? '#155724' : '#721c24',
                        }}>{nameNumerologyCheck.firstNameCard.overallGood ? '✓ Good' : '✗ Needs Attention'}</span>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.firstNameCard.not48Check ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>
                            First Name Count should not be 4 or 8.{nameNumerologyCheck.firstNameCard.not48Check ? ' ✓' : ` Currently ${nameNumerologyCheck.firstNameCard.single}.`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.firstNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.firstNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.firstNameCard.compatLine}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.firstNameCard.compoundLine}</span>
                        </div>
                      </div>
                    </div>

                    {/* LAST NAME CARD */}
                    <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                      <h4 style={{ color: '#1a3a2e' }}>LAST NAME: <span className="highlight-text">{nameNumerologyCheck.lastNameCard.name}</span></h4>
                      <div className="name-badge-row" style={{ marginTop: '6px' }}>
                        <span className="badge">Compound: <strong>{nameNumerologyCheck.lastNameCard.compound}</strong></span>
                        <span className="badge">Single: <strong>{nameNumerologyCheck.lastNameCard.single}</strong></span>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.lastNameCard.not48Check ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>Last Name Count should not be 4 or 8.{nameNumerologyCheck.lastNameCard.not48Check ? ' ✓' : ` Currently ${nameNumerologyCheck.lastNameCard.single}.`}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.lastNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.lastNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.lastNameCard.compatLine}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.lastNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.lastNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.lastNameCard.compoundLine}</span>
                        </div>
                      </div>
                    </div>

                    {/* FULL NAME CARD */}
                    <div className="name-detail-card" style={{ display: 'block', marginBottom: '10px' }}>
                      <span className="detail-label" style={{ fontSize: '0.95rem', color: '#1a3a2e' }}>FULL NAME ANALYSIS</span>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.fullNameCard.not48Check ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>Full Name Count should not be 4 or 8.{nameNumerologyCheck.fullNameCard.not48Check ? ' ✓' : ` Currently ${nameNumerologyCheck.fullNameCard.single}.`}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.fullNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.fullNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.fullNameCard.compatLine}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.fullNameCard.targetOk ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.fullNameCard.targetLine}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.fullNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.fullNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{nameNumerologyCheck.fullNameCard.compoundLine}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* FINAL STATUS */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '8px',
                  background: nameNumerologyCheck.finalStatusGood ? '#d4edda' : '#f8d7da',
                  border: `2px solid ${nameNumerologyCheck.finalStatusGood ? '#28a745' : '#dc3545'}`,
                  textAlign: 'center'
                }}>
                  <strong style={{ fontSize: '1rem', color: nameNumerologyCheck.finalStatusGood ? '#155724' : '#721c24' }}>
                    STATUS: {nameNumerologyCheck.finalStatus}
                  </strong>
                </div>

              </div>
            ) : (
              <div className="empty-state-box"><p>No name available to analyze.</p></div>
            )}
          </section>

          {/* ── 5c2. CHALDEAN NUMBER COMPATIBILITY ANALYSIS ─── */}
          <section className="report-section">
            <h3 className="section-title">Chaldean Number Compatibility Analysis</h3>
            <div className="name-compatibility-container">
              <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017' }}>
                <h4>Mulank {mulank} ({compatibilityAnalysis.mulankPlanet}) vs Bhagyank {bhagyank} ({compatibilityAnalysis.bhagyankPlanet})</h4>
                <div className="name-badge-row">
                  <span className="badge" style={{
                    background: compatibilityAnalysis.overallStatus === 'friend' ? '#e6f4ea' :
                      compatibilityAnalysis.overallStatus === 'enemy' ? '#fce8e6' : '#fff7e6',
                    color: compatibilityAnalysis.overallStatus === 'friend' ? '#137333' :
                      compatibilityAnalysis.overallStatus === 'enemy' ? '#c5221f' : '#b06000',
                    border: '1px solid currentColor'
                  }}>
                    <strong>
                      {compatibilityAnalysis.overallStatus === 'friend' ? 'HIGHLY COMPATIBLE ✓' :
                        compatibilityAnalysis.overallStatus === 'enemy' ? 'CHALLENGING — REMEDY RECOMMENDED' : 'NEUTRAL'}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="name-detail-card" style={{ display: 'block' }}>
                <span className="detail-label">Chaldean Planetary Relationship & Remedies</span>
                <div className="detail-value" style={{ whiteSpace: 'pre-line', marginTop: '8px', lineHeight: '1.6' }}>
                  {compatibilityAnalysis.description}
                </div>
              </div>
            </div>
          </section>

          {/* ── 5d. PROFESSIONAL & CAREER OUTLOOK ─────────── */}
          <section className="report-section">
            <h3 className="section-title">💼 Professional & Career Outlook</h3>
            <div className="career-outlook-container">
              {/* Compatibility matrix block */}
              <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #f3f6fc, #eaf0fc)', border: '1px solid #adc1e6', marginBottom: '15px' }}>
                <h4>Compatibility: Mulank {mulank} & Bhagyank {bhagyank} (Combination {mulank}-{bhagyank})</h4>
                <div className="name-badge-row">
                  <span className="badge" style={{
                    background: careerData.compatibilityStatus === 'Highly Compatible' ? '#e6f4ea' :
                      careerData.compatibilityStatus === 'Anti' ? '#fce8e6' : '#fff7e6',
                    color: careerData.compatibilityStatus === 'Highly Compatible' ? '#137333' :
                      careerData.compatibilityStatus === 'Anti' ? '#c5221f' : '#b06000',
                    border: '1px solid currentColor'
                  }}>
                    <strong>{careerData.compatibilityStatus} Connection</strong>
                  </span>
                </div>
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#444', fontStyle: 'italic' }}>
                  <strong>Esoteric Insight:</strong> {careerData.esotericReason}
                </p>
              </div>

              {/* Workstyle */}
              <div className="name-detail-card" style={{ marginBottom: '15px' }}>
                <span className="detail-label">Impact on Workstyle</span>
                <p className="detail-value" style={{ lineHeight: '1.6' }}>{careerData.workstyle}</p>
              </div>

              {/* Suitable Careers */}
              <div className="name-detail-card" style={{ marginBottom: '15px' }}>
                <span className="detail-label">Top 3 Most Suitable Career Fields</span>
                <ul className="career-fields-list" style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0' }}>
                  {careerData.topCareers.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', borderLeft: '3px solid #d4a017', paddingLeft: '12px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#1a3a2e' }}>Field {idx + 1}: {c.field}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' }}>{c.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Careers to Avoid */}
              <div className="name-detail-card" style={{ background: '#fff0f0', border: '1px solid #f9d5d5', marginBottom: '15px' }}>
                <span className="detail-label" style={{ color: '#c5221f' }}>⚠️ Careers to Avoid (Strict Warning)</span>
                <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0', fontSize: '0.88rem', color: '#444', lineHeight: '1.5' }}>
                  {careerData.careersToAvoid.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Golden Remedy */}
              <div className="name-detail-card" style={{ background: '#fef9e7', border: '1px solid #f9e79f' }}>
                <span className="detail-label" style={{ color: '#b06000' }}>✨ Golden Professional Remedy</span>
                <p className="detail-value" style={{ marginTop: '8px', lineHeight: '1.6', fontSize: '0.9rem', fontWeight: '500' }}>
                  {careerData.goldenRemedy}
                </p>
              </div>
            </div>
          </section>

          {/* ── 6. LO SHU GRID ──────────────────────────── */}
          <section className="report-section">
            <h3 className="section-title">🔢 LO SHU GRID ANALYSIS</h3>
            <div className="loshu-container">
              <div className="loshu-grid">
                {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((num, idx) => {
                  // Full grid with Mulank, Bhagyank & Kua included per client spec
                  const grid = calculateLoShuGrid(displayData.dob, [mulank, bhagyank, kuaNum]);
                  const count = grid[num - 1];
                  const cellValue = count > 0 ? Array(count).fill(num).join(' ') : '';
                  return (
                    <div key={idx} className={`grid-cell ${count > 0 ? 'present' : 'empty'}`}>
                      {cellValue}
                    </div>
                  );
                })}
              </div>

              {/* Grid Highlights — computed from FULL grid (DOB + Mulank + Bhagyank + Kua) */}
              <div className="grid-interpretation">
                <h4>Grid Highlights</h4>
                {(() => {
                  const fullGrid = calculateLoShuGrid(displayData.dob, [mulank, bhagyank, kuaNum]);
                  const presentNums = getPresentNumbers(fullGrid);
                  const missingNums = getMissingNumbers(fullGrid);
                  const repeatedNums = getRepeatedNumbers(fullGrid);
                  const arrows = getArrows(fullGrid);

                  return (
                    <>
                      <div className="present-numbers">
                        <p><strong>Present Numbers:</strong></p>
                        <div className="number-tags">
                          {presentNums.map((item, idx) => (
                            <span key={idx} className="tag tag-present">
                              {item.num} ({item.planet}) {item.count > 1 ? `(x${item.count})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="missing-numbers" style={{ marginTop: '12px' }}>
                        <p><strong>Missing Numbers:</strong></p>
                        <div className="number-tags">
                          {missingNums.length > 0 ? missingNums.map((num, idx) => (
                            <span key={idx} className="tag tag-missing">{num}</span>
                          )) : (
                            <span className="tag tag-present">None — Complete Grid! ✓</span>
                          )}
                        </div>
                      </div>

                      {repeatedNums.length > 0 && (
                        <div className="repeated-numbers" style={{ marginTop: '12px' }}>
                          <p><strong>Repeated Numbers &amp; Strength:</strong></p>
                          <div className="number-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {repeatedNums.map((item, idx) => (
                              <span key={idx} className="tag tag-present" style={{ background: 'linear-gradient(145deg, #fdf2cc, #fde4a3)', border: '1px solid rgba(181,130,10,0.3)', color: '#8a6207' }}>
                                Digit {item.num}: {item.strength} ({item.count}x)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="arrow-analysis" style={{ marginTop: '14px', borderTop: '1px solid rgba(232,213,191,0.4)', paddingTop: '10px' }}>
                        {arrows.positive.length > 0 && (
                          <div style={{ marginBottom: '8px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '13px' }}><strong>Positive Planes / Arrows:</strong></p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {arrows.positive.map((arr, idx) => (
                                <span key={idx} style={{ padding: '4px 8px', borderRadius: '6px', background: '#e6f4ea', color: '#137333', fontSize: '11px', fontWeight: 'bold' }}>
                                  {arr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {arrows.negative.length > 0 && (
                          <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px' }}><strong>Weaknesses / Negative Arrows:</strong></p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {arrows.negative.map((arr, idx) => (
                                <span key={idx} style={{ padding: '4px 8px', borderRadius: '6px', background: '#fce8e6', color: '#c5221f', fontSize: '11px', fontWeight: 'bold' }}>
                                  {arr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
                <p className="kua-note" style={{ marginTop: '14px' }}><strong>Your Kua Number: {calculateKua(displayData.dob, displayData.gender)}</strong></p>
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
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#c5221f', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>EFFECT:</strong>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#444', lineHeight: '1.6' }}>
                            {(remedy.effectsList || (remedy.effects || '').split('\n')).map((e, eIdx) => {
                              const cleanText = e.replace(/^•\s*/, '').trim();
                              return cleanText ? <li key={eIdx}>{cleanText}</li> : null;
                            })}
                          </ul>
                        </div>
                        <div>
                          <strong style={{ color: '#137333', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>REMEDIES:</strong>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#444', lineHeight: '1.6' }}>
                            {(remedy.remediesList || (remedy.crystal || '').split('\n')).map((r, rIdx) => {
                              const cleanText = r.replace(/^•\s*/, '').trim();
                              return cleanText ? <li key={rIdx}>{cleanText}</li> : null;
                            })}
                          </ul>
                        </div>
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

          {/* ── FOREIGN SETTLEMENT PREDICTION ──────────────── */}
          <section className="report-section">
            <h3 className="section-title">✈️ Foreign Settlement Prediction</h3>
            <div className="name-compatibility-container">

              {/* Header card */}
              <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #e8f4fd, #d1eaf7)', border: '1.5px solid #1a6fa8', marginBottom: '10px' }}>
                <h4 style={{ color: '#0d3c5e' }}>
                  Probability Score: <span className="highlight-text" style={{ fontSize: '1.3rem' }}>{foreignSettlement.probabilityScore}%</span>
                </h4>
                <div className="name-badge-row" style={{ marginTop: '6px' }}>
                  <span className="badge" style={{ background: '#d0f0e8', color: '#0a5c3b' }}>Present: {foreignSettlement.presentNums.join(', ')}</span>
                  <span className="badge" style={{ background: '#fde8e8', color: '#7a1a1a' }}>Missing: {foreignSettlement.missingNums.join(', ') || 'None'}</span>
                </div>
              </div>

              {/* Core result */}
              <div className="name-detail-card" style={{ marginBottom: '10px' }}>
                <span className="detail-label">FOREIGN SETTLEMENT PREDICTIONS</span>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{foreignSettlement.coreGood ? '🟢' : '🔴'}</span>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>
                    <strong>{foreignSettlement.coreGood ? 'Match' : 'Alert'}:</strong> {foreignSettlement.coreResult}
                  </p>
                </div>
              </div>

              {/* Planetary friction */}
              {foreignSettlement.frictionLines.length > 0 && (
                <div className="name-detail-card" style={{ background: '#fff4e6', border: '1px solid #f5c07a', marginBottom: '10px' }}>
                  <span className="detail-label" style={{ color: '#8a4500' }}>⚠️ PLANETARY FRICTION</span>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {foreignSettlement.frictionLines.map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span>🔴</span>
                        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#555' }}>{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Planetary note */}
              <div className="name-detail-card" style={{ background: '#f0f4ff', border: '1px solid #bfd0f7' }}>
                <span className="detail-label" style={{ color: '#1a3a6e' }}>🪐 PLANETARY ALIGNMENT</span>
                <p style={{ margin: '8px 0 0', fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>{foreignSettlement.planetaryNote}</p>
              </div>

            </div>
          </section>

          {/* ── LOVE vs ARRANGED MARRIAGE ───────────────────── */}
          <section className="report-section">
            <h3 className="section-title">💍 Love vs Arranged Marriage Prediction</h3>
            <div className="name-compatibility-container">

              {/* Percentage row */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  flex: 1, minWidth: '140px', padding: '18px 14px', borderRadius: '10px', textAlign: 'center',
                  background: marriageType.dominant === 'Love' ? 'linear-gradient(135deg, #ffe0ec, #ffc2d4)' : 'linear-gradient(135deg, #fff0f0, #ffe5e5)',
                  border: `2px solid ${marriageType.dominant === 'Love' ? '#e91e63' : '#f5c6cb'}`,
                  transform: marriageType.dominant === 'Love' ? 'scale(1.04)' : 'scale(1)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ fontSize: marriageType.dominant === 'Love' ? '2.2rem' : '1.8rem' }}>💗</div>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', color: '#c2185b' }}>{marriageType.lovePct}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#880e4f', marginTop: '4px', fontWeight: 600 }}>Love Marriage</div>
                </div>
                <div style={{
                  flex: 1, minWidth: '140px', padding: '18px 14px', borderRadius: '10px', textAlign: 'center',
                  background: marriageType.dominant === 'Arranged' ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)' : 'linear-gradient(135deg, #f0f8ff, #e8f4fd)',
                  border: `2px solid ${marriageType.dominant === 'Arranged' ? '#1976d2' : '#bee0f5'}`,
                  transform: marriageType.dominant === 'Arranged' ? 'scale(1.04)' : 'scale(1)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ fontSize: marriageType.dominant === 'Arranged' ? '2.2rem' : '1.8rem' }}>💑</div>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', color: '#1565c0' }}>{marriageType.arrangePct}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#0d47a1', marginTop: '4px', fontWeight: 600 }}>Arranged Marriage</div>
                </div>
              </div>

              {/* Highlight */}
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fef9e7', border: '1px solid #f9e79f', marginBottom: '10px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#8a5500' }}>💡 {marriageType.highlight}</strong>
              </div>

              {/* Comments */}
              <div className="name-detail-card">
                <span className="detail-label">COMMENTS & JUSTIFICATION</span>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {marriageType.comments.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem' }}>{c.includes('MISSING') ? '🔴' : '🟢'}</span>
                      <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#333' }}>{c}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ── MATCH MAKING (Consultant fills two profiles in Edit mode) ── */}
          <section className="report-section">
            <h3 className="section-title">💞 Match Making Compatibility</h3>
            {isEditing ? (
              <div className="name-detail-card" style={{ display: 'block' }}>
                <span className="detail-label">Enter both profiles for compatibility analysis</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                  {['male', 'female'].map(gender => (
                    <div key={gender} style={{ border: '1px solid #e8ddc4', borderRadius: '8px', padding: '12px' }}>
                      <strong style={{ textTransform: 'capitalize', color: '#8a6207' }}>{gender} Profile</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <input placeholder="Name" className="edit-input" name={`report.matchMaking.${gender}.name`}
                          value={editedData?.report?.matchMaking?.[gender]?.name || ''} onChange={handleInputChange} />
                        <input placeholder="Date of Birth (YYYY-MM-DD)" className="edit-input" name={`report.matchMaking.${gender}.dob`}
                          value={editedData?.report?.matchMaking?.[gender]?.dob || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (mmData?.male?.name && mmData?.female?.name && mmData.male.name !== 'Partner Name Not Added' && mmData.female.name !== 'Partner Name Not Added' && mmData?.male?.dob && mmData?.female?.dob) ? (() => {
              const mDob = mmData.male.dob;
              const fDob = mmData.female.dob;
              const mMulank = calcMulank(mDob);
              const mBhagyank = calcBhagyank(mDob);
              const fMulank = calcMulank(fDob);
              const fBhagyank = calcBhagyank(fDob);
              const mGrid = calculateLoShuGrid(mDob, [mMulank, mBhagyank]);
              const fGrid = calculateLoShuGrid(fDob, [fMulank, fBhagyank]);
              const mPresent = mGrid.flatMap((cnt, i) => cnt > 0 ? Array(cnt).fill(i + 1) : []);
              const fPresent = fGrid.flatMap((cnt, i) => cnt > 0 ? Array(cnt).fill(i + 1) : []);
              const mm = getMatchMaking(
                { name: mmData.male.name, mulank: mMulank, bhagyank: mBhagyank, grid: [...new Set(mPresent)] },
                { name: mmData.female.name, mulank: fMulank, bhagyank: fBhagyank, grid: [...new Set(fPresent)] }
              );
              const starStr = '★'.repeat(mm.stars) + '☆'.repeat(5 - mm.stars);
              return (
                <div className="name-compatibility-container">
                  {/* Rating header */}
                  <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fff0f8, #ffe4f0)', border: '1.5px solid #e91e63', marginBottom: '10px' }}>
                    <h4 style={{ color: '#880e4f' }}>{mmData.male.name} & {mmData.female.name}</h4>
                    <div style={{ fontSize: '1.6rem', color: '#e91e63', letterSpacing: '2px', margin: '4px 0' }}>{starStr}</div>
                    <div className="name-badge-row">
                      <span className="badge" style={{ background: '#fce4ec', color: '#880e4f', fontWeight: 700 }}>{mm.ratingLabel}</span>
                      <span className="badge" style={{ background: '#fff', color: '#c2185b', border: '1px solid #e91e63' }}>Total: {mm.totalPercentage}%</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="name-detail-card" style={{ marginBottom: '10px' }}>
                    <span className="detail-label">HIGHLIGHTS</span>
                    <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '0.88rem', lineHeight: '1.6', color: '#444' }}>
                      {mm.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>

                  {/* Shared pairs */}
                  {mm.sharedPairs.length > 0 && (
                    <div className="name-detail-card" style={{ background: '#f0fff4', border: '1px solid #a5d6a7', marginBottom: '10px' }}>
                      <span className="detail-label" style={{ color: '#2e7d32' }}>🔗 SHARABLE NUMBER PAIRS</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {mm.sharedPairs.map((p, i) => (
                          <span key={i} style={{ background: '#e8f5e9', border: '1px solid #81c784', borderRadius: '20px', padding: '4px 14px', fontSize: '0.9rem', fontWeight: 600, color: '#1b5e20' }}>{p.pair}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Boost logs */}
                  <div className="name-detail-card">
                    <span className="detail-label">COMPATIBILITY INSIGHTS</span>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {mm.boostLogs.map((log, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>🟢</span>
                          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#333' }}>{log}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="empty-state-box">
                <p>Partner name not defined. Enter spouse name or partner details to generate Match Making analysis.</p>
              </div>
            )}
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
