import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Download, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { updateClient } from '../services/clientService';
import { calculateLoShuGrid, calculateKua, getMissingNumbers, getPresentNumbers, calcMulank, calcBhagyank, getLuckyElements, calcPersonalYearForYear, getMobileAnalysis, getNameCompatibilityAnalysis, getCareerOutlook, getArrows, getRepeatedNumbers, getKuaVastuData, getMissingNumberRemedyData, getNumberCompatibilityAnalysis, getMobileCompatibilityCheck, getNameNumerologyCheck, getForeignSettlement, getMatchMaking, getMarriageType, analyzeStock, getStockComments } from '../utils/numerology';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
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
      },
      stockMarket: safeData.report.stockMarket || {
        companyName: '',
        symbol: '',
        listingDate: ''
      }
    };
    return safeData;
  };

    const [clientData, setClientData] = useState(() => getSafeClientData(location.state?.clientData || null));
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [saving, setSaving] = useState(false);
    const { t, language } = useLanguage();
    const rpt = t.rpt;

    const isHi = language === 'hi';

    const getPlanetTranslation = (planetName) => {
      const planetMap = {
        "Sun": "सूर्य (Sun)", "Moon": "चंद्र (Moon)", "Jupiter": "गुरु (Jupiter)",
        "Rahu": "राहु (Rahu)", "Mercury": "बुध (Mercury)", "Venus": "शुक्र (Venus)",
        "Ketu": "केतु (Ketu)", "Saturn": "शनि (Saturn)", "Mars": "मंगल (Mars)"
      };
      return planetMap[planetName] || planetName;
    };

    const getCompatStatusTranslation = (status) => {
      const statusMap = {
        "Highly Compatible": "उच्च संगत",
        "Compatible": "संगत",
        "Neutral": "तटस्थ",
        "Challenging": "चुनौतीपूर्ण",
        "Non-Friendly": "गैर-अनुकूल",
        "Friendly": "अनुकूल",
        "Excellent": "उत्कृष्ट",
        "Good": "अच्छा",
        "Avoid": "बचें (अशुभ)"
      };
      return statusMap[status] || status;
    };

    const translateMobileBullet = (bullet) => {
      if (!isHi) return bullet;

      if (bullet.includes("mobile number compound total is")) {
        const match = bullet.match(/total\s+is\s+(\d+),\s+reducing\s+to\s+single\s+digit\s+(\d+),\s+which\s+is\s+ruled\s+by\s+(.*?)\s+and/);
        if (match) {
          const [_, compound, single, planet] = match;
          const cleanPlanet = planet.split(" (")[0];
          const tPlanet = getPlanetTranslation(cleanPlanet);
          return `मोबाइल नंबर का संयुक्त योग ${compound} है, जो घटकर एकल अंक ${single} बनता है, जो कि ${tPlanet} द्वारा शासित है और इसके बुनियादी गुणों का प्रतिनिधित्व करता है।`;
        }
      }

      if (bullet.includes("with your Driver")) {
        const match = bullet.match(/sum\s+(\d+)\s+is\s+(friendly|non-friendly|neutral)\s+with\s+your\s+Driver\s+(\d+)/);
        if (match) {
          const [_, single, relation, driver] = match;
          const relText = relation === 'friendly' ? 'अनुकूल' : (relation === 'non-friendly' ? 'गैर-अनुकूल (शत्रु)' : 'तटस्थ');
          const descText = relation === 'friendly'
            ? 'है, जो सहायक और रचनात्मक ऊर्जा का एक सक्रिय प्रवाह बनाता है।'
            : (relation === 'non-friendly'
              ? 'है, जो आपके दैनिक कार्यों में ग्रहीय घर्षण और संभावित बाधाएं उत्पन्न करता है।'
              : 'है, जो आपकी मूल ऊर्जा के साथ एक स्थिर और संतुलित संबंध प्रदान करता है।');
          return `एकल अंक का योग ${single} आपके मूलांक ${driver} के साथ ${relText} ${descText}`;
        }
      }

      if (bullet.includes("with your Conductor")) {
        const match = bullet.match(/(friendly|conflicts|neutral)\s+relationship\s+with\s+your\s+Conductor\s+(\d+)/);
        if (match) {
          const [_, relation, conductor] = match;
          const relText = relation === 'friendly' ? 'अनुकूल' : (relation === 'conflicts' ? 'गैर-अनुकूल' : 'तटस्थ');
          const descText = relation === 'friendly'
            ? 'है, जो आपके भाग्य पथ के साथ संरेखित होता है और समग्र प्रगति का समर्थन करता है।'
            : (relation === 'conflicts'
              ? 'है, जिससे आंतरिक घर्षण उत्पन्न होता है जो महत्वपूर्ण लक्ष्यों या भाग्य के परिणामों में देरी कर सकता है।'
              : 'है, जो टकराव से बचाता है और आपके भाग्य पथ को निर्बाध रखता है।');
          return `यह आपके भाग्यांक ${conductor} के साथ एक ${relText} संबंध ${descText}`;
        }
      }

      if (bullet.includes("already present in your birth date")) {
        const match = bullet.match(/number\s+(\d+)\s+is\s+already/);
        if (match) {
          return `अंक ${match[1]} आपकी जन्म तिथि में पहले से मौजूद है, जो आपकी मूल ग्रहीय ऊर्जा को मजबूत करता है और आपके ग्रिड की स्थिरता को बढ़ाता है।`;
        }
      }
      if (bullet.includes("is missing from your birth date")) {
        const match = bullet.match(/number\s+(\d+)\s+is\s+missing/);
        if (match) {
          return `चूंकि अंक ${match[1]} आपकी जन्म तिथि से गायब है, इसलिए इस मोबाइल नंबर का उपयोग करना एक ऊर्जावान उपाय के रूप में कार्य करता है, जिससे आपके जीवन में इस आवश्यक कंपन का समावेश होता है।`;
        }
      }

      if (bullet.includes("Using this vibration regularly")) {
        return "नियमित रूप से इस कंपन का उपयोग करने से सकारात्मक संचार, उपयोगी व्यावसायिक अवसर और सहज व्यक्तिगत संबंध आकर्षित होंगे।";
      }
      if (bullet.includes("this frequency may trigger sudden misunderstandings")) {
        return "सावधानी बरतने की सलाह दी जाती है: यह आवृत्ति अचानक गलतफहमी, व्यावसायिक अवसरों में कमी या करियर में अप्रत्याशित देरी का कारण बन सकती है।";
      }
      if (bullet.includes("It serves as a reliable, balanced connection")) {
        return "यह किसी भी बड़े सकारात्मक या नकारात्मक व्यवधान के बिना दैनिक बातचीत के लिए एक विश्वसनीय, संतुलित संपर्क प्रदान करता है।";
      }

      if (bullet.includes("this mobile number is highly favorable")) {
        return "कुल मिलाकर, यह मोबाइल नंबर आपके लिए अत्यधिक अनुकूल है, और इसे सक्रिय रखने से आपकी समृद्धि और संचार क्षमता में वृद्धि होगी।";
      }
      if (bullet.includes("this mobile number is not recommended due to direct planetary clashes")) {
        return "कुल मिलाकर, सीधे ग्रहीय टकराव के कारण इस मोबाइल नंबर की सिफारिश नहीं की जाती है, और एक अनुकूल योग पर स्थानांतरित होने का सुझाव दिया जाता है।";
      }
      if (bullet.includes("this mobile number is neutral, offering steady performance")) {
        return "कुल मिलाकर, यह मोबाइल नंबर तटस्थ है, जो बिना किसी प्रतिकूल ग्रहीय घर्षण के स्थिर प्रदर्शन प्रदान करता है।";
      }

      return bullet;
    };

    const translateNameItemText = (text) => {
      if (!isHi) return text;
      if (text.includes("ideal range")) {
        const match = text.match(/is\s+(\d+)/);
        return `पूर्ण नाम का योग ${match ? match[1] : ""} है जो आदर्श श्रेणी (1, 3, 5 या 6) में है। ✓`;
      }
      if (text.includes("should be 1, 3, 5 or 6")) {
        const match = text.match(/is\s+(\d+)/);
        return `पूर्ण नाम का योग 1, 3, 5 या 6 होना चाहिए। वर्तमान में यह ${match ? match[1] : ""} है।`;
      }

      const isFirst = text.includes("First Name");
      const isLast = text.includes("Last Name");
      const nameType = isFirst ? "प्रथम नाम" : (isLast ? "अंतिम नाम" : "पूर्ण नाम");

      if (text.includes("Combination Count is")) {
        const match = text.match(/is\s+(\d+)\s+which\s+is\s+(\w+\s?\w*)\s+and\s+rating\s+is\s+(\S+)/);
        if (match) {
          const [_, compound, label, rating] = match;
          const tLabel = label === 'Very Good' ? 'बहुत अच्छा' : (label === 'Bad' ? 'अशुभ' : 'औसत/मध्यम');
          return `${nameType} संयोजन का योग ${compound} है जो ${tLabel} है और रेटिंग ${rating} है।`;
        }
      }
      if (text.includes("Combination Count is") || text.includes("rating is")) {
        const match = text.match(/is\s+(\d+)\s+—\s+rating\s+is\s+(\S+)\s+\((\w+\s?\w*)\)/);
        if (match) {
          const [_, compound, rating, label] = match;
          const tLabel = label === 'Very Good' ? 'बहुत अच्छा' : (label === 'Bad' ? 'अशुभ' : 'औसत/मध्यम');
          return `${nameType} संयोजन का योग ${compound} है — रेटिंग ${rating} (${tLabel}) है।`;
        }
      }

      const compatMatch = text.match(/is\s+(\d+)\s+which\s+is\s+(Good Friend|Non-Friend|Neutral)\s+with\s+Driver\s+(\d+)\s+and\s+(Good Friend|Non-Friend|Neutral)\s+with\s+Conductor\s+(\d+)/i);
      if (compatMatch) {
        const [_, single, driverCompat, driver, conductorCompat, conductor] = compatMatch;
        const getLabel = (l) => {
          if (l === 'Good Friend') return 'मित्र';
          if (l === 'Non-Friend') return 'शत्रु';
          return 'तटस्थ';
        };
        return `${nameType} संख्या का योग ${single} है जो मूलांक ${driver} के साथ ${getLabel(driverCompat)} है और भाग्यांक ${conductor} के साथ ${getLabel(conductorCompat)} है।`;
      }

      return text;
    };

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
        const pdf = await generatePDF(clientData, language);
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

    const stockData = report?.stockMarket || {
      companyName: '',
      symbol: '',
      listingDate: ''
    };

    return (
      <div className={`report-page ${isEditing ? 'is-editing' : ''}`}>
        {/* ── Header ───────────────────────────────────────── */}
        <header className="report-header">
          <div className="container">
            <div className="report-header-content">
              <button className="btn btn-outline" onClick={() => navigate('/')}>
                <ArrowLeft size={18} />
                {t.backHome}
              </button>
              <div className="header-actions">
                {!isEditing ? (
                  <>
                    <LanguageSwitcher />
                    <button className="btn btn-secondary" onClick={handleEdit}>
                      <Edit2 size={18} /> {t.editReport}
                    </button>
                    <button className="btn btn-primary" onClick={handleDownloadPDF}>
                      <Download size={18} /> {t.downloadPDF}
                    </button>
                    <button
                      className="btn btn-outline btn-logout-small"
                      onClick={() => { localStorage.removeItem('isAuthenticated'); navigate('/login'); }}
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <LanguageSwitcher />
                    <button className="btn btn-outline" onClick={handleCancel}>
                      <X size={18} /> {t.cancel}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      <Save size={18} /> {saving ? t.saving : t.saveChanges}
                    </button>
                    <button
                      className="btn btn-outline btn-logout-small"
                      onClick={() => { localStorage.removeItem('isAuthenticated'); navigate('/login'); }}
                    >
                      {t.logout}
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
                    <label style={{ fontSize: '0.75rem', color: '#1a3a2e', marginBottom: '2px', fontWeight: 'bold' }}>{rpt.dateOfBirth}</label>
                    <input type="date" name="dob" value={editedData.dob} onChange={handleInputChange} className="edit-input edit-date" style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #d4a017', background: '#fff', fontSize: '0.85rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.75rem', color: '#1a3a2e', marginBottom: '2px', fontWeight: 'bold' }}>{rpt.phoneNumber}</label>
                    <input type="tel" name="phone" value={editedData.phone} onChange={handleInputChange} className="edit-input edit-phone" style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #d4a017', background: '#fff', fontSize: '0.85rem', width: '130px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.75rem', color: '#1a3a2e', marginBottom: '2px', fontWeight: 'bold' }}>{rpt.gender}</label>
                    <select name="gender" value={editedData.gender} onChange={handleInputChange} className="edit-input edit-gender" style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #d4a017', background: '#fff', fontSize: '0.85rem' }}>
                      <option value="male">{rpt.genderMale}</option>
                      <option value="female">{rpt.genderFemale}</option>
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
                <span className="core-divider-text">{rpt.coreNumbers}</span>
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
              <h3 className="section-title">{rpt.luckyElements}</h3>
              <div className="lucky-grid">
                {[
                  { label: rpt.luckyNumber, value: `${luckyData.luckyNumber} (Life Path)` },

                  { label: rpt.luckyDates, value: luckyData.luckyDates },
                  { label: rpt.challengingDates, value: luckyData.unluckyDates },
                  { label: rpt.luckyColor, value: luckyData.luckyColor },
                  { label: rpt.challengingColor, value: luckyData.unluckyColor },
                  { label: rpt.luckyDirection, value: luckyData.luckyDirection },
                  { label: rpt.coreElement, value: `${luckyData.element} (${luckyData.planetEnergy})` },
                  { label: rpt.personalYear, value: `${personalYearNum} (${new Date().getFullYear()})` },
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
              <h3 className="section-title">{rpt.mobileAnalysis}</h3>
              {mobileCheck.isValid ? (
                <div className="name-compatibility-container">

                  {/* Inputs Info Header */}
                  <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #f4f6f9, #e9ecef)', border: '1.5px solid #6c757d', marginBottom: '10px' }}>
                    <h4 style={{ color: '#2b303a', marginBottom: '8px' }}>{rpt.mobileNumberAnalysis}: <span className="highlight-text">{displayData.phone}</span></h4>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.mobileTotal}: <strong style={{ color: '#007bff' }}>{mobileCheck.totalSum} ({mobileCheck.singleDigit})</strong></span>
                      <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.mulank}: <strong>{mobileCheck.mulank}</strong></span>
                      <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.bhagyank}: <strong>{mobileCheck.bhagyank}</strong></span>
                    </div>
                  </div>

                  {/* Analysis Bullets */}
                  <div className="name-detail-card" style={{ marginBottom: '10px' }}>
                    <span className="detail-label">{rpt.detailedInsights}</span>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {mobileCheck.bullets.map((bullet, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '1rem', color: '#495057' }}>•</span>
                          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#333' }}>{translateMobileBullet(bullet)}</p>
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
                      {rpt.status}: {isHi ? getCompatStatusTranslation(mobileCheck.overallStatus) : mobileCheck.overallStatus}
                    </strong>
                  </div>

                </div>
              ) : (
                <div className="empty-state-box">
                  <p>{rpt.noPhoneMsg}</p>
                </div>
              )}
            </section>

            {/* ── 5c. NAME NUMEROLOGY (Strict Planetary Matrix) ─── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.nameAnalysis}</h3>
              {nameNumerologyCheck.isValid ? (
                <div className="name-compatibility-container">

                  {!nameNumerologyCheck.lastNameCard ? (
                    /* SINGLE NAME ANALYSIS (when no last name is present) */
                    <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                      <h4 style={{ color: '#1a3a2e' }}>{rpt.nameAnalysisCard}: <span className="highlight-text">{nameNumerologyCheck.firstNameCard.name}</span></h4>
                      <div className="name-badge-row" style={{ marginTop: '6px' }}>
                        <span className="badge">{rpt.compound}: <strong>{nameNumerologyCheck.firstNameCard.compound}</strong></span>
                        <span className="badge">{rpt.single}: <strong>{nameNumerologyCheck.firstNameCard.single}</strong></span>
                        <span className="badge" style={{
                          background: nameNumerologyCheck.fullNameCard.overallGood ? '#d4edda' : '#f8d7da',
                          color: nameNumerologyCheck.fullNameCard.overallGood ? '#155724' : '#721c24',
                        }}>{nameNumerologyCheck.fullNameCard.overallGood ? rpt.good : rpt.needsAttention}</span>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.firstNameCard.not48Check ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>
                            {rpt.nameCount48}{nameNumerologyCheck.firstNameCard.not48Check ? ' ✓' : ` ${rpt.currently} ${nameNumerologyCheck.firstNameCard.single}.`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.firstNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.firstNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.firstNameCard.compatLine)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.fullNameCard.targetOk ? '🟢' : '🔴'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.fullNameCard.targetLine)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span>{nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                          <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.firstNameCard.compoundLine)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* THREE SECTIONS: FIRST, LAST, AND FULL NAME ANALYSIS */
                    <>
                      {/* FIRST NAME CARD */}
                      <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                        <h4 style={{ color: '#1a3a2e' }}>{rpt.firstNameCard}: <span className="highlight-text">{nameNumerologyCheck.firstNameCard.name}</span></h4>
                        <div className="name-badge-row" style={{ marginTop: '6px' }}>
                          <span className="badge">{rpt.compound}: <strong>{nameNumerologyCheck.firstNameCard.compound}</strong></span>
                          <span className="badge">{rpt.single}: <strong>{nameNumerologyCheck.firstNameCard.single}</strong></span>
                          <span className="badge" style={{
                            background: nameNumerologyCheck.firstNameCard.overallGood ? '#d4edda' : '#f8d7da',
                            color: nameNumerologyCheck.firstNameCard.overallGood ? '#155724' : '#721c24',
                          }}>{nameNumerologyCheck.firstNameCard.overallGood ? rpt.good : rpt.needsAttention}</span>
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.firstNameCard.not48Check ? '🟢' : '🔴'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>
                              {rpt.firstNameCount48}{nameNumerologyCheck.firstNameCard.not48Check ? ' ✓' : ` ${rpt.currently} ${nameNumerologyCheck.firstNameCard.single}.`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.firstNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.firstNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.firstNameCard.compatLine)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.firstNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.firstNameCard.compoundLine)}</span>
                          </div>
                        </div>
                      </div>

                      {/* LAST NAME CARD */}
                      <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                        <h4 style={{ color: '#1a3a2e' }}>{rpt.lastNameCard}: <span className="highlight-text">{nameNumerologyCheck.lastNameCard.name}</span></h4>
                        <div className="name-badge-row" style={{ marginTop: '6px' }}>
                          <span className="badge">{rpt.compound}: <strong>{nameNumerologyCheck.lastNameCard.compound}</strong></span>
                          <span className="badge">{rpt.single}: <strong>{nameNumerologyCheck.lastNameCard.single}</strong></span>
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.lastNameCard.not48Check ? '🟢' : '🔴'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{rpt.lastNameCount48}{nameNumerologyCheck.lastNameCard.not48Check ? ' ✓' : ` ${rpt.currently} ${nameNumerologyCheck.lastNameCard.single}.`}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.lastNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.lastNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.lastNameCard.compatLine)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.lastNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.lastNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.lastNameCard.compoundLine)}</span>
                          </div>
                        </div>
                      </div>

                      {/* FULL NAME CARD */}
                      <div className="name-detail-card" style={{ display: 'block', marginBottom: '10px' }}>
                        <span className="detail-label" style={{ fontSize: '0.95rem', color: '#1a3a2e' }}>{rpt.fullNameAnalysis}</span>
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.fullNameCard.not48Check ? '🟢' : '🔴'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{rpt.fullNameCount48}{nameNumerologyCheck.fullNameCard.not48Check ? ' ✓' : ` ${rpt.currently} ${nameNumerologyCheck.fullNameCard.single}.`}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.fullNameCard.driverStatus !== 'enemy' && nameNumerologyCheck.fullNameCard.conductorStatus !== 'enemy' ? '🟢' : '🔴'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.fullNameCard.compatLine)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.fullNameCard.targetOk ? '🟢' : '🔴'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.fullNameCard.targetLine)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span>{nameNumerologyCheck.fullNameCard.compoundRating?.label === 'Very Good' ? '🟢' : nameNumerologyCheck.fullNameCard.compoundRating?.label === 'Bad' ? '🔴' : '🟡'}</span>
                            <span style={{ fontSize: '0.88rem', color: '#444' }}>{translateNameItemText(nameNumerologyCheck.fullNameCard.compoundLine)}</span>
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
                      {rpt.status}: {nameNumerologyCheck.finalStatusGood ? (isHi ? 'नाम संतुलित ✓' : 'Name Balanced ✓') : (isHi ? 'नाम संतुलित नहीं ✗' : 'Name Not Balanced ✗')}
                    </strong>
                  </div>

                </div>
              ) : (
                <div className="empty-state-box"><p>{rpt.noNameMsg}</p></div>
              )}
            </section>

            {/* ── 5c2. CHALDEAN NUMBER COMPATIBILITY ANALYSIS ─── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.chaldeanTitle}</h3>
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
                        {compatibilityAnalysis.overallStatus === 'friend' ? rpt.highlyCompatible :
                          compatibilityAnalysis.overallStatus === 'enemy' ? rpt.challenging : rpt.neutral}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="name-detail-card" style={{ display: 'block' }}>
                  <span className="detail-label">{rpt.chaldeanRelationship}</span>
                  <div className="detail-value" style={{ whiteSpace: 'pre-line', marginTop: '8px', lineHeight: '1.6' }}>
                    {compatibilityAnalysis.description}
                  </div>
                </div>
              </div>
            </section>

            {/* ── 5d. PROFESSIONAL & CAREER OUTLOOK ─────────── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.careerTitle}</h3>
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
                      <strong>{careerData.compatibilityStatus} {rpt.connection}</strong>
                    </span>
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#444', fontStyle: 'italic' }}>
                    <strong>{rpt.esotericInsight}:</strong> {careerData.esotericReason}
                  </p>
                </div>

                {/* Workstyle */}
                <div className="name-detail-card" style={{ marginBottom: '15px' }}>
                  <span className="detail-label">{rpt.workstyle}</span>
                  <p className="detail-value" style={{ lineHeight: '1.6' }}>{careerData.workstyle}</p>
                </div>

                {/* Suitable Careers */}
                <div className="name-detail-card" style={{ marginBottom: '15px' }}>
                  <span className="detail-label">{rpt.topCareers}</span>
                  <ul className="career-fields-list" style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0' }}>
                    {careerData.topCareers.map((c, idx) => (
                      <li key={idx} style={{ marginBottom: '12px', borderLeft: '3px solid #d4a017', paddingLeft: '12px' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#1a3a2e' }}>{rpt.field} {idx + 1}: {c.field}</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' }}>{c.explanation}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Careers to Avoid */}
                <div className="name-detail-card" style={{ background: '#fff0f0', border: '1px solid #f9d5d5', marginBottom: '15px' }}>
                  <span className="detail-label" style={{ color: '#c5221f' }}>{rpt.careersToAvoid}</span>
                  <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0', fontSize: '0.88rem', color: '#444', lineHeight: '1.5' }}>
                    {careerData.careersToAvoid.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Golden Remedy */}
                <div className="name-detail-card" style={{ background: '#fef9e7', border: '1px solid #f9e79f' }}>
                  <span className="detail-label" style={{ color: '#b06000' }}>{rpt.goldenRemedy}</span>
                  <p className="detail-value" style={{ marginTop: '8px', lineHeight: '1.6', fontSize: '0.9rem', fontWeight: '500' }}>
                    {careerData.goldenRemedy}
                  </p>
                </div>
              </div>
            </section>

            {/* ── 6. LO SHU GRID ──────────────────────────── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.loShuTitle}</h3>
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
                  <h4>{rpt.gridHighlights}</h4>
                  {(() => {
                    const fullGrid = calculateLoShuGrid(displayData.dob, [mulank, bhagyank, kuaNum]);
                    const presentNums = getPresentNumbers(fullGrid);
                    const missingNums = getMissingNumbers(fullGrid);
                    const repeatedNums = getRepeatedNumbers(fullGrid);
                    const arrows = getArrows(fullGrid);

                    return (
                      <>
                        <div className="present-numbers">
                          <p><strong>{rpt.presentNumbers}:</strong></p>
                          <div className="number-tags">
                            {presentNums.map((item, idx) => (
                              <span key={idx} className="tag tag-present">
                                {item.num} ({item.planet}) {item.count > 1 ? `(x${item.count})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="missing-numbers" style={{ marginTop: '12px' }}>
                          <p><strong>{rpt.missingNumbers}:</strong></p>
                          <div className="number-tags">
                            {missingNums.length > 0 ? missingNums.map((num, idx) => (
                              <span key={idx} className="tag tag-missing">{num}</span>
                            )) : (
                              <span className="tag tag-present">{rpt.completeGrid}</span>
                            )}
                          </div>
                        </div>

                        {repeatedNums.length > 0 && (
                          <div className="repeated-numbers" style={{ marginTop: '12px' }}>
                            <p><strong>{rpt.repeatedNumbers}:</strong></p>
                            <div className="number-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {repeatedNums.map((item, idx) => (
                                <span key={idx} className="tag tag-present" style={{ background: 'linear-gradient(145deg, #fdf2cc, #fde4a3)', border: '1px solid rgba(181,130,10,0.3)', color: '#8a6207' }}>
                                  {rpt.digit} {item.num}: {item.strength} ({item.count}x)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="arrow-analysis" style={{ marginTop: '14px', borderTop: '1px solid rgba(232,213,191,0.4)', paddingTop: '10px' }}>
                          {arrows.positive.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <p style={{ margin: '0 0 4px', fontSize: '13px' }}><strong>{rpt.positivePlanes}:</strong></p>
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
                              <p style={{ margin: '0 0 4px', fontSize: '13px' }}><strong>{rpt.weaknesses}:</strong></p>
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
                  <p className="kua-note" style={{ marginTop: '14px' }}><strong>{rpt.kuaNumber}: {calculateKua(displayData.dob, displayData.gender)}</strong></p>
                </div>
              </div>
            </section>

            {/* ── 7. MISSING NUMBERS & REMEDIES ───────────── */}
            {report.missingNumbersRemedies?.length > 0 && (
              <section className="report-section">
                <h3 className="section-title">{rpt.missingRemediesTitle}</h3>
                <div className="remedies-list">
                  {report.missingNumbersRemedies.map((remedy, idx) => (
                    <div key={idx} className="remedy-card">
                      <div className="remedy-header">
                        <h4>{rpt.missingNumber} {remedy.num} ({remedy.planet})</h4>
                      </div>
                      {isEditing ? (
                        <div className="edit-remedy">
                          <label>{rpt.effects}:</label>
                          <textarea value={remedy.effects} onChange={(e) => handleArrayChange(e, 'report.missingNumbersRemedies', idx, 'effects')} className="edit-textarea" />
                          <label>{rpt.crystalRemedy}:</label>
                          <input type="text" value={remedy.crystal} onChange={(e) => handleArrayChange(e, 'report.missingNumbersRemedies', idx, 'crystal')} className="edit-input" />
                        </div>
                      ) : (
                        <div className="remedy-content">
                          <div style={{ marginBottom: '12px' }}>
                            <strong style={{ color: '#c5221f', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>{rpt.effectLabel}:</strong>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#444', lineHeight: '1.6' }}>
                              {(remedy.effectsList || (remedy.effects || '').split('\n')).map((e, eIdx) => {
                                const cleanText = e.replace(/^•\s*/, '').trim();
                                return cleanText ? <li key={eIdx}>{cleanText}</li> : null;
                              })}
                            </ul>
                          </div>
                          <div>
                            <strong style={{ color: '#137333', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>{rpt.remediesLabel}:</strong>
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
                <h3 className="section-title">{rpt.repeatedTitle}</h3>
                <div className="repeated-grid">
                  {report.repeatedNumbersAnalysis.map((item, idx) => (
                    <div key={idx} className="repeated-card">
                      <h4>{rpt.number} {item.num} ({item.count} {rpt.times})</h4>
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
                <h3 className="section-title">{rpt.professionsTitle}</h3>
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
                <h3 className="section-title">{rpt.forecastTitle}</h3>
                <div className="forecast-grid">
                  {Object.keys(report.futurePredictions).map((key) => {
                    const forecast = report.futurePredictions[key];
                    return (
                      <div key={key} className="forecast-card">
                        <h4>{rpt.year} {forecast.year}</h4>
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
              <h3 className="section-title">{rpt.personalityTitle}</h3>
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
                  <div className="highlight-item"><strong>{rpt.luckyNumberLabel}:</strong> {luckyData.luckyNumber}</div>
                  <div className="highlight-item"><strong>{rpt.luckyColorLabel}:</strong> {luckyData.luckyColor}</div>
                  <div className="highlight-item"><strong>{rpt.luckyDirectionLabel}:</strong> {luckyData.luckyDirection}</div>
                </div>
              </div>
            </section>

            {/* ── 12. DAILY AFFIRMATIONS ───────────────────── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.affirmationsTitle}</h3>
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
              <h3 className="section-title">{rpt.foreignTitle}</h3>
              <div className="name-compatibility-container">

                {/* Header card */}
                <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #e8f4fd, #d1eaf7)', border: '1.5px solid #1a6fa8', marginBottom: '10px' }}>
                  <h4 style={{ color: '#0d3c5e' }}>
                    {rpt.probabilityScore}: <span className="highlight-text" style={{ fontSize: '1.3rem' }}>{foreignSettlement.probabilityScore}%</span>
                  </h4>
                  <div className="name-badge-row" style={{ marginTop: '6px' }}>
                    <span className="badge" style={{ background: '#d0f0e8', color: '#0a5c3b' }}>{rpt.present}: {foreignSettlement.presentNums.join(', ')}</span>
                    <span className="badge" style={{ background: '#fde8e8', color: '#7a1a1a' }}>{rpt.missing}: {foreignSettlement.missingNums.join(', ') || rpt.none}</span>
                  </div>
                </div>

                {/* Core result */}
                <div className="name-detail-card" style={{ marginBottom: '10px' }}>
                  <span className="detail-label">{rpt.foreignPredictions}</span>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{foreignSettlement.coreGood ? '🟢' : '🔴'}</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>
                      <strong>{foreignSettlement.coreGood ? rpt.matchAlert : rpt.alert}:</strong> {foreignSettlement.coreResult}
                    </p>
                  </div>
                </div>

                {/* Planetary friction */}
                {foreignSettlement.frictionLines.length > 0 && (
                  <div className="name-detail-card" style={{ background: '#fff4e6', border: '1px solid #f5c07a', marginBottom: '10px' }}>
                    <span className="detail-label" style={{ color: '#8a4500' }}>{rpt.planetaryFriction}</span>
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
                  <span className="detail-label" style={{ color: '#1a3a6e' }}>{rpt.planetaryAlignment}</span>
                  <p style={{ margin: '8px 0 0', fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>{foreignSettlement.planetaryNote}</p>
                </div>

              </div>
            </section>

            {/* ── LOVE vs ARRANGED MARRIAGE ───────────────────── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.marriageTitle}</h3>
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
                    <div style={{ fontSize: '0.85rem', color: '#880e4f', marginTop: '4px', fontWeight: 600 }}>{rpt.loveMarriage}</div>
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
                    <div style={{ fontSize: '0.85rem', color: '#0d47a1', marginTop: '4px', fontWeight: 600 }}>{rpt.arrangedMarriage}</div>
                  </div>
                </div>

                {/* Highlight */}
                <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fef9e7', border: '1px solid #f9e79f', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#8a5500' }}>💡 {marriageType.highlight}</strong>
                </div>

                {/* Comments */}
                <div className="name-detail-card">
                  <span className="detail-label">{rpt.commentsJustification}</span>
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
              <h3 className="section-title">{rpt.matchTitle}</h3>
              {isEditing ? (
                <div className="name-detail-card" style={{ display: 'block' }}>
                  <span className="detail-label">{rpt.enterProfiles}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                    {['male', 'female'].map(gender => (
                      <div key={gender} style={{ border: '1px solid #e8ddc4', borderRadius: '8px', padding: '12px' }}>
                        <strong style={{ textTransform: 'capitalize', color: '#8a6207' }}>{gender === 'male' ? rpt.genderMale : rpt.genderFemale} {rpt.profile}</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          <input placeholder={rpt.namePlaceholder} className="edit-input" name={`report.matchMaking.${gender}.name`}
                            value={editedData?.report?.matchMaking?.[gender]?.name || ''} onChange={handleInputChange} />
                          <input placeholder={rpt.dobPlaceholder} className="edit-input" name={`report.matchMaking.${gender}.dob`}
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
                      <span className="detail-label">{rpt.highlights}</span>
                      <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '0.88rem', lineHeight: '1.6', color: '#444' }}>
                        {mm.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>

                    {/* Shared pairs */}
                    {mm.sharedPairs.length > 0 && (
                      <div className="name-detail-card" style={{ background: '#f0fff4', border: '1px solid #a5d6a7', marginBottom: '10px' }}>
                        <span className="detail-label" style={{ color: '#2e7d32' }}>{rpt.sharableNumbers}</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {mm.sharedPairs.map((p, i) => (
                            <span key={i} style={{ background: '#e8f5e9', border: '1px solid #81c784', borderRadius: '20px', padding: '4px 14px', fontSize: '0.9rem', fontWeight: 600, color: '#1b5e20' }}>{p.pair}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Boost logs */}
                    <div className="name-detail-card">
                      <span className="detail-label">{rpt.compatInsights}</span>
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
                  <p>{rpt.partnerNotDefined}</p>
                </div>
              )}
            </section>

            {/* ── STOCK MARKET COMPATIBILITY ── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.stockTitle}</h3>
              {isEditing ? (
                <div className="name-detail-card" style={{ display: 'block' }}>
                  <span className="detail-label">{rpt.enterStockDetails}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.companyNameLabel}</label>
                      <input
                        placeholder="e.g. Reliance Industries"
                        className="edit-input"
                        name="report.stockMarket.companyName"
                        value={editedData?.report?.stockMarket?.companyName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.symbolLabel}</label>
                      <input
                        placeholder="e.g. RELIANCE"
                        className="edit-input"
                        name="report.stockMarket.symbol"
                        value={editedData?.report?.stockMarket?.symbol || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.listingDateLabel}</label>
                      <input
                        type="date"
                        className="edit-input"
                        name="report.stockMarket.listingDate"
                        value={editedData?.report?.stockMarket?.listingDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Live Dynamic Preview */}
                    {(() => {
                      const cName = editedData?.report?.stockMarket?.companyName;
                      const cSymbol = editedData?.report?.stockMarket?.symbol;
                      const cListingDate = editedData?.report?.stockMarket?.listingDate || '-';
                      if (cName && cSymbol) {
                        const stockAnalysis = analyzeStock(
                          editedData?.dob || '',
                          cName,
                          cSymbol,
                          cListingDate
                        );

                        const comments = getStockComments(
                          stockAnalysis.bestIndicator,
                          stockAnalysis.mulank,
                          stockAnalysis.bhagyank,
                          editedData?.dob || '',
                          stockAnalysis.status,
                          stockAnalysis.score,
                          language
                        );

                        const getStatusColor = (status) => {
                          if (status === 'Strongly Suitable') return { bg: '#d4edda', border: '#28a745', text: '#155724' };
                          if (status === 'Suitable') return { bg: '#e8f4fd', border: '#007bff', text: '#004085' };
                          if (status === 'Watchlist') return { bg: '#fff3cd', border: '#ffc107', text: '#856404' };
                          return { bg: '#f8d7da', border: '#dc3545', text: '#721c24' };
                        };

                        const colors = getStatusColor(stockAnalysis.status);
                        const isHi = language === 'hi';

                        const tStatus = isHi ? {
                          'Strongly Suitable': 'अत्यधिक उपयुक्त',
                          'Suitable': 'उपयुक्त',
                          'Watchlist': 'वॉचलिस्ट',
                          'Avoid': 'बचें'
                        }[stockAnalysis.status] || stockAnalysis.status : stockAnalysis.status;

                        return (
                          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(232, 213, 191, 0.5)', paddingTop: '15px' }}>
                            <span className="detail-label" style={{ color: '#28a745', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                              🟢 {isHi ? 'लाइव पूर्वावलोकन (Live Preview)' : 'LIVE COMPATIBILITY PREVIEW'}
                            </span>
                            <div className="name-compatibility-container">
                              {/* Best Match Info */}
                              <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                                <h4 style={{ color: '#1a3a2e', marginBottom: '4px' }}>{rpt.bestIndicatorLabel}</h4>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '4px' }}>
                                  <span style={{ fontSize: '0.9rem', color: '#495057' }}>Source: <strong style={{ color: '#d4a017' }}>{stockAnalysis.bestIndicator.label}</strong></span>
                                  {stockAnalysis.bestIndicator.compound > 0 && (
                                    <span style={{ fontSize: '0.9rem', color: '#495057' }}>Compound: <strong style={{ color: '#d4a017' }}>{stockAnalysis.bestIndicator.compound}</strong></span>
                                  )}
                                  <span style={{ fontSize: '0.9rem', color: '#495057' }}>Single: <strong style={{ color: '#d4a017' }}>{stockAnalysis.bestIndicator.single}</strong></span>
                                  <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.scoreLabel}: <strong style={{ color: '#007bff' }}>{stockAnalysis.score}</strong></span>
                                </div>
                              </div>

                              {/* Bullet Insights */}
                              <div className="name-detail-card" style={{ marginBottom: '10px' }}>
                                <span className="detail-label">{isHi ? 'विस्तृत अंतर्दृष्टि' : 'DETAILED INSIGHTS'}</span>
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {comments.map((bullet, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                      <span style={{ fontSize: '1rem', color: '#495057' }}>•</span>
                                      <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#333' }}>{bullet}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Final Status */}
                              <div style={{
                                padding: '14px 18px',
                                borderRadius: '8px',
                                background: colors.bg,
                                border: `2px solid ${colors.border}`,
                                textAlign: 'center'
                              }}>
                                <strong style={{ fontSize: '1.05rem', color: colors.text }}>
                                  {isHi ? 'स्थिति' : 'STATUS'}: {tStatus}
                                </strong>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              ) : (stockData?.companyName && stockData?.symbol) ? (() => {
                const stockAnalysis = analyzeStock(
                  displayData.dob || '',
                  stockData.companyName,
                  stockData.symbol,
                  stockData.listingDate || '-'
                );

                const comments = getStockComments(
                  stockAnalysis.bestIndicator,
                  stockAnalysis.mulank,
                  stockAnalysis.bhagyank,
                  displayData.dob || '',
                  stockAnalysis.status,
                  stockAnalysis.score,
                  language
                );

                const getStatusColor = (status) => {
                  if (status === 'Strongly Suitable') return { bg: '#d4edda', border: '#28a745', text: '#155724' };
                  if (status === 'Suitable') return { bg: '#e8f4fd', border: '#007bff', text: '#004085' };
                  if (status === 'Watchlist') return { bg: '#fff3cd', border: '#ffc107', text: '#856404' };
                  return { bg: '#f8d7da', border: '#dc3545', text: '#721c24' };
                };

                const colors = getStatusColor(stockAnalysis.status);
                const isHi = language === 'hi';

                const tStatus = isHi ? {
                  'Strongly Suitable': 'अत्यधिक उपयुक्त',
                  'Suitable': 'उपयुक्त',
                  'Watchlist': 'वॉचलिस्ट',
                  'Avoid': 'बचें'
                }[stockAnalysis.status] || stockAnalysis.status : stockAnalysis.status;

                return (
                  <div className="name-compatibility-container">
                    {/* Stock Info Cards */}
                    <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #f4f6f9, #e9ecef)', border: '1.5px solid #6c757d', marginBottom: '10px' }}>
                      <h4 style={{ color: '#2b303a', marginBottom: '8px' }}>{rpt.stockDetails}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.companyNameLabel}: <strong style={{ color: '#333' }}>{stockData.companyName}</strong></span>
                        <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.symbolLabel}: <strong style={{ color: '#333' }}>{stockData.symbol}</strong></span>
                        {stockData.listingDate && (
                          <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.listingDateLabel}: <strong style={{ color: '#333' }}>{formatDateToDDMMYYYY(stockData.listingDate)}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Best Match Info */}
                    <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '10px' }}>
                      <h4 style={{ color: '#1a3a2e', marginBottom: '4px' }}>{rpt.bestIndicatorLabel}</h4>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#495057' }}>Source: <strong style={{ color: '#d4a017' }}>{stockAnalysis.bestIndicator.label}</strong></span>
                        {stockAnalysis.bestIndicator.compound > 0 && (
                          <span style={{ fontSize: '0.9rem', color: '#495057' }}>Compound: <strong style={{ color: '#d4a017' }}>{stockAnalysis.bestIndicator.compound}</strong></span>
                        )}
                        <span style={{ fontSize: '0.9rem', color: '#495057' }}>Single: <strong style={{ color: '#d4a017' }}>{stockAnalysis.bestIndicator.single}</strong></span>
                        <span style={{ fontSize: '0.9rem', color: '#495057' }}>{rpt.scoreLabel}: <strong style={{ color: '#007bff' }}>{stockAnalysis.score}</strong></span>
                      </div>
                    </div>

                    {/* Bullet Insights */}
                    <div className="name-detail-card" style={{ marginBottom: '10px' }}>
                      <span className="detail-label">{isHi ? 'विस्तृत अंतर्दृष्टि' : 'DETAILED INSIGHTS'}</span>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {comments.map((bullet, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '1rem', color: '#495057' }}>•</span>
                            <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: '#333' }}>{bullet}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Status */}
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: '8px',
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                      textAlign: 'center'
                    }}>
                      <strong style={{ fontSize: '1.05rem', color: colors.text }}>
                        {isHi ? 'स्थिति' : 'STATUS'}: {tStatus}
                      </strong>
                    </div>
                  </div>
                );
              })() : (
                <div className="empty-state-box">
                  <p>{rpt.stockNotDefined}</p>
                </div>
              )}
            </section>

            {/* ── 13. CUSTOM NOTE PAGE 1 ─────────────────── */}
            <section className="report-section custom-page-section">
              <h3 className="section-title">{rpt.notesPage1}</h3>
              {isEditing ? (
                <textarea name="report.customPage1.content" value={report.customPage1.content} onChange={handleInputChange} placeholder={rpt.notesPlaceholder1} className="edit-textarea custom-page-textarea" />
              ) : (
                <p className="custom-page-content">{report.customPage1.content || rpt.noNotes}</p>
              )}
            </section>

            {/* ── 14. CUSTOM NOTE PAGE 2 ─────────────────── */}
            <section className="report-section custom-page-section">
              <h3 className="section-title">{rpt.notesPage2}</h3>
              {isEditing ? (
                <textarea name="report.customPage2.content" value={report.customPage2.content} onChange={handleInputChange} placeholder={rpt.notesPlaceholder2} className="edit-textarea custom-page-textarea" />
              ) : (
                <p className="custom-page-content">{report.customPage2.content || rpt.noNotes}</p>
              )}
            </section>

            {/* ── 15. CUSTOM NOTE PAGE 3 ─────────────────── */}
            <section className="report-section custom-page-section">
              <h3 className="section-title">{rpt.notesPage3}</h3>
              {isEditing ? (
                <textarea name="report.customPage3.content" value={report.customPage3.content} onChange={handleInputChange} placeholder={rpt.notesPlaceholder3} className="edit-textarea custom-page-textarea" />
              ) : (
                <p className="custom-page-content">{report.customPage3.content || rpt.noNotes}</p>
              )}
            </section>

            {/* ── 15. CONTACT INFO (edit mode only) ───────── */}
            {isEditing && (
              <section className="report-section">
                <h3 className="section-title">{rpt.contactInfo}</h3>
                <div className="edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{rpt.phoneLabel}</label>
                      <input type="tel" name="phone" value={editedData.phone} onChange={handleInputChange} className="edit-input" />
                    </div>
                    <div className="form-group">
                      <label>{rpt.emailLabel}</label>
                      <input type="email" name="email" value={editedData.email} onChange={handleInputChange} className="edit-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{rpt.addressLabel}</label>
                    <input type="text" name="address" value={editedData.address} onChange={handleInputChange} className="edit-input" />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="report-footer">
          <p>{rpt.footerLine1}</p>
          <p>{rpt.footerLine2}</p>
          <p>{rpt.reportGenerated}: {(() => {
            const today = new Date();
            return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
          })()}</p>
        </footer>
      </div>
    );
  }

  export default ReportView;
