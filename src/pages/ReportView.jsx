import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Download, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { updateClient, getClientById } from '../services/clientService';
import { calculateLoShuGrid, calculateKua, getMissingNumbers, getPresentNumbers, calcMulank, calcBhagyank, getLuckyElements, calcPersonalYearForYear, getMobileAnalysis, getNameCompatibilityAnalysis, getCareerOutlook, getArrows, getRepeatedNumbers, getKuaVastuData, getMissingNumberRemedyData, getNumberCompatibilityAnalysis, getMobileCompatibilityCheck, getNameNumerologyCheck, getForeignSettlement, getMatchMaking, getMarriageType, analyzeStock, getStockComments, analyzeStockSuitability, analyzeBirthDateRange, getBirthDateGenderJustification, getNameSuggestions, analyzeLogo, DATE_INFLUENCER_EN, DATE_INFLUENCER_HI } from '../utils/numerology';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AnalysisGrid from '../components/AnalysisGrid';
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
      },
      babyBirth: safeData.report.babyBirth || {
        startDate: '',
        endDate: ''
      },
      logoAnalysis: {
        analysisMode: safeData.report?.logoAnalysis?.analysisMode || 'text',
        logoImage: safeData.report?.logoAnalysis?.logoImage || '',
        companyName: safeData.report?.logoAnalysis?.companyName || '',
        industry: safeData.report?.logoAnalysis?.industry || '',
        targetAudience: safeData.report?.logoAnalysis?.targetAudience || '',
        market: safeData.report?.logoAnalysis?.market || 'national',
        brandStyle: safeData.report?.logoAnalysis?.brandStyle || 'modern',
        mainPromise: safeData.report?.logoAnalysis?.mainPromise || '',
        logoType: safeData.report?.logoAnalysis?.logoType || 'combination',
        shapeStyle: safeData.report?.logoAnalysis?.shapeStyle || 'circle',
        primaryColor: safeData.report?.logoAnalysis?.primaryColor || 'blue',
        secondaryColor: safeData.report?.logoAnalysis?.secondaryColor || 'gray',
        typographyStyle: safeData.report?.logoAnalysis?.typographyStyle || 'sans',
        symbolismDesc: safeData.report?.logoAnalysis?.symbolismDesc || ''
      }
    };
    return safeData;
  };

    const [clientData, setClientData] = useState(() => getSafeClientData(location.state?.clientData || null));
    const [activeView, setActiveView] = useState('dashboard');
    const [loading, setLoading] = useState(!location.state?.clientData);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [babyGender, setBabyGender] = useState('boy');
    const [selectedBabyDate, setSelectedBabyDate] = useState(null);
    const [selectedAlphabetFilter, setSelectedAlphabetFilter] = useState(null);
    const [activeChaldeanPopupName, setActiveChaldeanPopupName] = useState(null);
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
      const fetchClient = async () => {
        if (id) {
          if (!location.state?.clientData) {
            setLoading(true);
          }
          try {
            const res = await getClientById(id);
            if (res.success && res.data) {
              setClientData(getSafeClientData(res.data));
            }
          } catch (err) {
            console.error("Error loading client:", err);
          } finally {
            setLoading(false);
          }
        }
      };
      fetchClient();
    }, [id]);

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

    const sanitizeForFirestore = (obj) => {
      if (obj === null || obj === undefined) return null;
      if (Array.isArray(obj)) {
        return obj.map(sanitizeForFirestore);
      }
      if (typeof obj === 'object') {
        const clean = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (value !== undefined) {
              clean[key] = sanitizeForFirestore(value);
            }
          }
        }
        return clean;
      }
      return obj;
    };

    const handleSave = async () => {
      setSaving(true);
      try {
        const cleanData = sanitizeForFirestore(editedData);
        const result = await updateClient(id, cleanData);
        if (result.success) {
          setClientData(cleanData);
          setIsEditing(false);
          navigate(location.pathname, { replace: true, state: { clientData: cleanData } });
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

    if (loading) {
      return (
        <div className="report-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div className="spinner"></div>
        </div>
      );
    }

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

    const babyBirthData = report?.babyBirth || { startDate: '', endDate: '' };

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

            {/* View Selector Tabs */}
            <div className="report-view-selector">
              <button 
                className={`view-tab-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
              >
                ✨ Premium Dashboard
              </button>
              <button 
                className={`view-tab-btn ${activeView === 'report' ? 'active' : ''}`}
                onClick={() => setActiveView('report')}
              >
                📄 Complete Report
              </button>
            </div>

            {activeView === 'dashboard' && (
              <AnalysisGrid 
                clientData={clientData} 
                onCardClick={(card) => navigate(`/report/${id}/analysis/${card.id}`)} 
              />
            )}

            <div className={activeView === 'dashboard' ? 'hidden-report-view' : ''}>

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
            </div>

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

            {/* ── 4. DATE INFLUENCER ───────────────────────── */}
            {(() => {
              const rDob = report?.dob || editedData?.dob || '';
              const rParts = rDob.split('-');
              const rDayNum = rParts.length === 3 ? parseInt(rParts[2]) : 1;
              
              const defaultEnTitle = `Date Influencer — Born on ${rDayNum}`;
              const defaultEnDesc = `People born on ${rDayNum}, ${rDayNum + 9 <= 31 ? rDayNum + 9 : ''} ${rDayNum + 18 <= 31 ? ', ' + (rDayNum + 18) : ''} share this birth energy.`.trim();
              const defaultEnContent = DATE_INFLUENCER_EN[rDayNum] || '';

              const defaultHiTitle = `जन्म तिथि प्रभाव — ${rDayNum} तारीख को जन्म`;
              const defaultHiDesc = `${rDayNum}, ${rDayNum + 9 <= 31 ? rDayNum + 9 : ''} ${rDayNum + 18 <= 31 ? ', ' + (rDayNum + 18) : ''} तारीखों को जन्मे लोगों में भी समान ऊर्जा होती है।`.trim();
              const defaultHiContent = DATE_INFLUENCER_HI[rDayNum] || '';

              const isTitleEdited = report?.dateInfluencer?.title && report.dateInfluencer.title !== defaultEnTitle;
              const isDescEdited = report?.dateInfluencer?.desc && report.dateInfluencer.desc !== defaultEnDesc;
              const isContentEdited = report?.dateInfluencer?.content && report.dateInfluencer.content !== defaultEnContent;

              const displayTitle = (isHi && !isTitleEdited) ? defaultHiTitle : (report?.dateInfluencer?.title || '');
              const displayDesc = (isHi && !isDescEdited) ? defaultHiDesc : (report?.dateInfluencer?.desc || '');
              const displayContent = (isHi && !isContentEdited) ? defaultHiContent : (report?.dateInfluencer?.content || '');

              return (
                <section className="report-section">
                  <div className="date-influencer-card">
                    {isEditing ? (
                      <>
                        <input name="report.dateInfluencer.title" value={report?.dateInfluencer?.title || ''} onChange={handleInputChange} className="edit-input-bold" />
                        <input name="report.dateInfluencer.desc" value={report?.dateInfluencer?.desc || ''} onChange={handleInputChange} className="edit-input-small" />
                        <textarea name="report.dateInfluencer.content" value={report?.dateInfluencer?.content || ''} onChange={handleInputChange} className="edit-textarea" />
                      </>
                    ) : (
                      <>
                        <h4>{displayTitle}</h4>
                        <p>{displayDesc}</p>
                        <p>{displayContent}</p>
                      </>
                    )}
                  </div>
                </section>
              );
            })()}

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

              {/* Yantra & Bracelet Remedies */}
              <div className="name-compatibility-container" style={{ marginTop: '20px' }}>
                <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #f3f6fc, #eaf0fc)', border: '1.5px solid #adc1e6', marginBottom: '14px' }}>
                  <h4 style={{ color: '#1a3a6e' }}>
                    {language === 'hi' ? '🛡️ महा यंत्र और क्रिस्टल ब्रेसलेट उपाय' : '🛡️ MAHA YANTRA & CRYSTAL BRACELET REMEDIES'}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#444' }}>
                    {language === 'hi' 
                      ? 'ये ऊर्जावान धातु यंत्र और अर्ध-कीमती क्रिस्टल ब्रेसलेट आपके जीवन में लापता संख्याओं के ग्रहों के कंपन को संतुलित करने के लिए सिद्ध हैं।'
                      : 'These energized metal yantras and semi-precious crystal bracelets are proven to balance the planetary vibrations of missing numbers in your life.'}
                  </p>
                </div>

                <div className="name-detail-card" style={{ display: 'block' }}>
                  <span className="detail-label" style={{ color: '#137333' }}>
                    {language === 'hi' ? 'अनुशंसित रत्न और ब्रेसलेट उपाय' : 'RECOMMENDED GEMSTONES & BRACELETS'}
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    {(() => {
                      const braceletRemedies = [
                        { num: 1, name: language === 'hi' ? 'लाल जैस्पर / गार्नेट ब्रेसलेट (सूर्य)' : 'Red Jasper / Garnet Bracelet (Sun)', desc: language === 'hi' ? 'ऊर्जा, आत्मविश्वास और नेतृत्व कौशल में सुधार करता है।' : 'Improves energy, confidence, and leadership skills.' },
                        { num: 2, name: language === 'hi' ? 'सफेद मूनस्टोन / मोती ब्रेसलेट (चंद्र)' : 'White Moonstone / Pearl Bracelet (Moon)', desc: language === 'hi' ? 'मानसिक शांति, अंतर्ज्ञान और भावनात्मक संतुलन लाता है।' : 'Brings mental peace, intuition, and emotional balance.' },
                        { num: 3, name: language === 'hi' ? 'पीला एवेन्ट्यूरिन ब्रेसलेट (गुरु)' : 'Yellow Aventurine Bracelet (Jupiter)', desc: language === 'hi' ? 'ज्ञान, शिक्षा और आध्यात्मिक विकास को बढ़ाता है।' : 'Enhances knowledge, education, and spiritual growth.' },
                        { num: 4, name: language === 'hi' ? 'गोमेद / हेसोनाइट ब्रेसलेट (राहु)' : 'Hessonite / Rahu Bracelet (Rahu)', desc: language === 'hi' ? 'अचानक लाभ, सुरक्षा और भ्रम को दूर करने में मदद करता है।' : 'Helps with sudden gains, protection, and clearing illusions.' },
                        { num: 5, name: language === 'hi' ? 'हरा एवेन्ट्यूरिन / जेड ब्रेसलेट (बुध)' : 'Green Aventurine / Jade Bracelet (Mercury)', desc: language === 'hi' ? 'संचार, व्यवसाय और धन संचय को बढ़ाता है।' : 'Enhances communication, business, and wealth compounding.' },
                        { num: 6, name: language === 'hi' ? 'क्लियर क्वार्ट्ज / स्फटिक ब्रेसलेट (शुक्र)' : 'Clear Quartz / Sphatik Bracelet (Venus)', desc: language === 'hi' ? 'लक्जरी, आकर्षण और संबंधों में सुधार लाता है।' : 'Brings luxury, charm, and improves relationships.' },
                        { num: 7, name: language === 'hi' ? 'टाइगर आई ब्रेसलेट (केतु)' : 'Tiger Eye Bracelet (Ketu)', desc: language === 'hi' ? 'बुरी नजर से सुरक्षा, साहस और ध्यान में सुधार लाता है।' : 'Brings protection from evil eye, courage, and concentration.' },
                        { num: 8, name: language === 'hi' ? 'काला ओब्सीडियन / एमेथिस्ट ब्रेसलेट (शनि)' : 'Black Obsidian / Amethyst Bracelet (Saturn)', desc: language === 'hi' ? 'स्थायित्व, करियर में वृद्धि और सुरक्षा देता है।' : 'Brings stability, career growth, and protection.' },
                        { num: 9, name: language === 'hi' ? 'लाल मूंगा / कार्वेलियन ब्रेसलेट (मंगल)' : 'Red Coral / Carnelian Bracelet (Mars)', desc: language === 'hi' ? 'साहस, शारीरिक ऊर्जा और विजय दिलाता है।' : 'Brings courage, physical energy, and victory.' }
                      ];
                      
                      const dob = isEditing ? (editedData?.dob || '') : (displayData?.dob || '');
                      const grid = calculateLoShuGrid(dob, [mulank, bhagyank, kuaNum]);
                      const missingNums = [];
                      for (let i = 1; i <= 9; i++) {
                        if (grid[i - 1] === 0) missingNums.push(i);
                      }

                      const activeRemedies = braceletRemedies.filter(r => missingNums.includes(r.num));

                      return activeRemedies.length > 0 ? activeRemedies.map((r, idx) => (
                        <div key={idx} style={{ background: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#1a3a2e', display: 'block' }}>Number {r.num}: {r.name}</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#555', lineHeight: '1.4' }}>{r.desc}</p>
                        </div>
                      )) : <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>{language === 'hi' ? 'कोई लापता संख्या नहीं है, किसी विशिष्ट रत्न या ब्रेसलेट की आवश्यकता नहीं है।' : 'No missing numbers, no specific bracelet remedies needed.'}</div>;
                    })()}
                  </div>
                </div>
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

            
            {/* ── Topic 7: Professional Career Outlook ── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.careerTitle}</h3>
              <div className="career-outlook-container">
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
              </div>
            </section>

            {/* ── Topic 8: Impact on Work Style ── */}
            <section className="report-section">
              <h3 className="section-title">{language === 'hi' ? '💼 कार्य शैली पर प्रभाव' : '💼 Impact on Work Style'}</h3>
              <div className="career-outlook-container">
                <div className="name-detail-card">
                  <span className="detail-label">{rpt.workstyle}</span>
                  <p className="detail-value" style={{ lineHeight: '1.6' }}>{careerData.workstyle}</p>
                </div>
              </div>
            </section>

            {/* ── Topic 9: Most Suitable Career ── */}
            <section className="report-section">
              <h3 className="section-title">{language === 'hi' ? '🚀 सबसे उपयुक्त करियर क्षेत्र' : '🚀 Most Suitable Career'}</h3>
              <div className="career-outlook-container">
                {/* Suitable Careers List */}
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

              {/* Detailed Personal Year Forecast Card */}
              <div className="name-compatibility-container" style={{ marginTop: '20px' }}>
                <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '14px' }}>
                  <h4 style={{ color: '#8a6207' }}>
                    {language === 'hi' ? '📈 चालू वर्ष व्यक्तिगत वर्ष विश्लेषण' : '📈 CURRENT YEAR PERSONAL YEAR DETAILED ANALYSIS'}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#444' }}>
                    {language === 'hi' 
                      ? 'वर्तमान व्यक्तिगत वर्ष चक्र के आधार पर आपके जीवन के विभिन्न क्षेत्रों पर पड़ने वाला प्रभाव।'
                      : 'Detailed impact on various aspects of your life based on the current Personal Year cycle.'}
                  </p>
                </div>

                <div className="name-detail-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {(() => {
                    const detailedForecasts = [
                      { label: language === 'hi' ? '❤️ संबंध और परिवार' : '❤️ Relationships & Family', desc: language === 'hi' ? 'पारिवारिक सुख-शांति बनी रहेगी, आपसी विश्वास मजबूत होगा और संबंधों में मधुरता आएगी।' : 'Family peace and harmony will prevail, strengthening mutual trust and harmony.' },
                      { label: language === 'hi' ? '💼 करियर और व्यवसाय' : '💼 Career & Business', desc: language === 'hi' ? 'नए अवसरों के साथ पेशेवर जीवन में सकारात्मक बदलाव आएंगे और नए प्रोजेक्ट शुरू होंगे।' : 'Positive changes in professional life with new opportunities and execution of new projects.' },
                      { label: language === 'hi' ? '💰 वित्तीय स्थिति' : '💰 Financial Outlook', desc: language === 'hi' ? 'निवेश के लिए अच्छा वर्ष है, लेकिन सोच-समझकर और गणना किए गए जोखिमों के साथ ही निर्णय लें।' : 'Good year for investments, but make calculated decisions and avoid impulsive spending.' },
                      { label: language === 'hi' ? '💚 स्वास्थ्य दृष्टिकोण' : '💚 Health Outlook', desc: language === 'hi' ? 'स्वास्थ्य सामान्यतः ठीक रहेगा, लेकिन जीवनशैली में सुधार और तनाव प्रबंधन आवश्यक है।' : 'Health will remain mostly stable, but lifestyle improvements and stress management are highly advised.' }
                    ];
                    return detailedForecasts.map((df, idx) => (
                      <div key={idx} style={{ background: '#fffcf5', border: '1px solid #f9e79f', borderRadius: '8px', padding: '10px 12px' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#8a6207', display: 'block', marginBottom: '4px' }}>{df.label}</strong>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#4a3728', lineHeight: '1.45' }}>{df.desc}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              </section>
            )}

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

            {/* ── 13. NAME SPELLING SUGGESTION ─────────────────── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.nameSpellingTitle}</h3>
              <p style={{ color: '#8c6f58', fontSize: '0.9rem', marginBottom: '20px', marginTop: '-10px' }}>
                {rpt.nameSpellingDescription}
              </p>

              {(() => {
                const clientDob = displayData.dob;
                const clientGender = (displayData.gender === 'male' || displayData.gender === 'boy') ? 'boy' : 'girl';
                const nameReport = getNameSuggestions(clientDob, clientGender);
                if (!nameReport) return null;

                // Filter name suggestions by selected alphabet
                const filteredSuggestions = selectedAlphabetFilter
                  ? nameReport.suggestions.filter(s => s.name.toUpperCase().startsWith(selectedAlphabetFilter))
                  : nameReport.suggestions;

                return (
                  <div className="baby-name-suggestions-container" style={{ marginTop: '10px' }}>
                    <div className="baby-name-card-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div className="baby-name-card" style={{ background: 'rgba(255, 254, 249, 0.88)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)', boxShadow: '0 2px 8px rgba(181, 130, 10, 0.04)' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px dashed rgba(232, 213, 191, 0.6)', paddingBottom: '4px' }}>
                          {rpt.babyNameAnalysisTitle}
                        </div>
                        <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                          <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyDriver}:</span>
                          <span className="baby-stat-val" style={{ fontWeight: 'bold', color: '#3d2c1e' }}>{nameReport.driver}</span>
                        </div>
                        <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                          <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyConductor}:</span>
                          <span className="baby-stat-val" style={{ fontWeight: 'bold', color: '#3d2c1e' }}>{nameReport.conductor}</span>
                        </div>
                        <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                          <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyNameMissingPriority}:</span>
                          <span className="baby-stat-val" style={{ color: '#c05050', fontWeight: 'bold' }}>{nameReport.missingPriority.length > 0 ? nameReport.missingPriority.join(', ') : rpt.babyNone}</span>
                        </div>
                        <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                          <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyNameSelectedTarget}:</span>
                          <span className="baby-stat-val" style={{ color: '#b5820a', fontWeight: 'bold', fontSize: '1.05rem' }}>{nameReport.bestTarget}</span>
                        </div>
                      </div>

                      <div className="baby-name-card" style={{ background: 'rgba(255, 254, 249, 0.88)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)', boxShadow: '0 2px 8px rgba(181, 130, 10, 0.04)' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px dashed rgba(232, 213, 191, 0.6)', paddingBottom: '4px' }}>
                          {rpt.babyNameInitialsTitle}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          {nameReport.initials.map(letter => (
                            <span key={letter} style={{ background: 'linear-gradient(135deg, #b5820a, #d4a326)', color: '#fff', fontWeight: 'bold', padding: '6px 14px', borderRadius: '8px', fontSize: '1.1rem', boxShadow: '0 2px 4px rgba(181,130,10,0.15)' }}>
                              {letter}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#8c6f58', marginTop: '12px', fontStyle: 'italic' }}>
                          {isHi ? 'भाग्यशाली नामांक ' + nameReport.bestTarget + ' के अनुकूल प्रारंभिक अक्षर' : 'Lucky starting alphabets matching Destiny Number ' + nameReport.bestTarget}
                        </div>
                      </div>
                    </div>

                    <div className="baby-justification" style={{ background: 'rgba(181, 130, 10, 0.05)', borderLeft: '4px solid #b5820a', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '20px', fontSize: '0.92rem', lineHeight: '1.5', color: '#5a4230' }}>
                      <strong>{rpt.babyNameJustification}:</strong> {isHi ? `लक्ष्य नामांक ${nameReport.bestTarget} को चुना गया है क्योंकि यह मूलांक ${nameReport.driver} और भाग्यांक ${nameReport.conductor} दोनों के साथ अनुकूल है, जिससे कोई भी विरोधाभास (Anti) अंक नहीं है। यह लो शू ग्रिड में अनुपस्थित प्राथमिक अंकों को संतुलित करता है।` : nameReport.justification}
                    </div>

                    {/* Filter chips */}
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#8c6f58' }}>{rpt.alphabetFilterLabel}</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setSelectedAlphabetFilter(null)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1.5px solid #b5820a',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: !selectedAlphabetFilter ? 'linear-gradient(135deg, #b5820a, #d4a326)' : '#fff',
                            color: !selectedAlphabetFilter ? '#fff' : '#b5820a',
                          }}
                        >
                          {rpt.showAll}
                        </button>
                        {nameReport.initials.map(letter => (
                          <button
                            key={letter}
                            onClick={() => setSelectedAlphabetFilter(letter)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              border: '1.5px solid #b5820a',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: selectedAlphabetFilter === letter ? 'linear-gradient(135deg, #b5820a, #d4a326)' : '#fff',
                              color: selectedAlphabetFilter === letter ? '#fff' : '#b5820a',
                            }}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="baby-breakdown-title" style={{ fontSize: '1rem', color: '#b5820a', marginBottom: '12px' }}>{rpt.babyNameTableTitle} ({displayData.gender})</div>
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left', background: '#fff' }}>
                        <thead>
                          <tr style={{ background: 'rgba(232, 213, 191, 0.15)', borderBottom: '1px solid rgba(232, 213, 191, 0.6)' }}>
                            <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameSrNo}</th>
                            <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameSuggestedName}</th>
                            <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameBreakdown}</th>
                            <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold', textAlign: 'center' }}>{rpt.babyNameTotal}</th>
                            <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameMeaning}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSuggestions.map((s) => (
                            <tr
                              key={s.srNo}
                              onClick={() => setActiveChaldeanPopupName({ ...s, target: nameReport.bestTarget })}
                              style={{ 
                                borderBottom: '1px solid rgba(232, 213, 191, 0.3)', 
                                background: s.srNo % 2 === 0 ? 'rgba(232, 213, 191, 0.05)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'background 0.15s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 130, 10, 0.04)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = s.srNo % 2 === 0 ? 'rgba(232, 213, 191, 0.05)' : 'transparent'}
                            >
                              <td style={{ padding: '12px', color: '#8c6f58' }}>{s.srNo}</td>
                              <td style={{ padding: '12px', fontWeight: 'bold', color: '#b5820a' }}>
                                <span style={{ borderBottom: '1.5px dashed rgba(181, 130, 10, 0.5)', paddingBottom: '2px' }}>{s.name}</span>
                              </td>
                              <td style={{ padding: '12px', fontFamily: 'monospace', color: '#5a4230', fontSize: '0.85rem' }}>{s.calculation}</td>
                              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#3d2c1e' }}>{s.total}</td>
                              <td style={{ padding: '12px', color: '#5a4230', fontSize: '0.85rem' }}>{s.meaning}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
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

            {/* ── STOCK MARKET SUITABILITY ── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.stockTitle}</h3>
              {(() => {
                const dob = isEditing ? (editedData?.dob || '') : (displayData?.dob || '');
                if (!dob) return (
                  <div className="empty-state-box"><p>{rpt.stockNotDefined}</p></div>
                );
                const suitability = analyzeStockSuitability(dob, language);
                if (!suitability) return (
                  <div className="empty-state-box"><p>{rpt.stockNotDefined}</p></div>
                );
                const isHighRisk = suitability.statusCode === 'high_risk';
                const isLongTerm = suitability.statusCode === 'long_term';
                const isHi = language === 'hi';
                const statusStyle = isHighRisk
                  ? { bg: 'linear-gradient(135deg, #1a0000, #3d0000)', border: '#ff0000', text: '#ff4444', glow: '0 0 20px rgba(255,0,0,0.6), 0 0 40px rgba(255,0,0,0.3)' }
                  : isLongTerm
                  ? { bg: 'linear-gradient(135deg, #1a1400, #3d3000)', border: '#ffc107', text: '#ffd700', glow: '0 0 16px rgba(255,193,7,0.4)' }
                  : { bg: 'linear-gradient(135deg, #001a08, #003d14)', border: '#28a745', text: '#4cff80', glow: '0 0 16px rgba(40,167,69,0.4)' };
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* 1. Core Market Suitability Status */}
                    <div style={{
                      background: statusStyle.bg,
                      border: `2px solid ${statusStyle.border}`,
                      borderRadius: '12px',
                      padding: '20px 22px',
                      boxShadow: statusStyle.glow,
                      animation: isHighRisk ? 'neonPulse 1.8s ease-in-out infinite' : 'none',
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: statusStyle.border, marginBottom: '8px', textTransform: 'uppercase' }}>
                        {isHi ? '1. मुख्य बाजार उपयुक्तता स्थिति' : '1. CORE MARKET SUITABILITY STATUS'}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.65', color: statusStyle.text, fontWeight: 600 }}>
                        {suitability.statusText}
                      </p>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: '#aaa', background: 'rgba(255,255,255,0.07)', padding: '4px 10px', borderRadius: '20px' }}>
                          {isHi ? 'मूलांक' : 'Driver'}: <strong style={{ color: '#fff' }}>{suitability.driver}</strong>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#aaa', background: 'rgba(255,255,255,0.07)', padding: '4px 10px', borderRadius: '20px' }}>
                          {isHi ? 'भाग्यांक' : 'Conductor'}: <strong style={{ color: '#fff' }}>{suitability.conductor}</strong>
                        </span>
                        {suitability.antiDetected && (
                          <span style={{ fontSize: '0.78rem', color: '#ff4444', background: 'rgba(255,0,0,0.12)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                            ⚡ {isHi ? 'एंटी-नंबर' : 'ANTI-NUMBER'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Investment Style Analysis */}
                    <div style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', borderRadius: '10px', padding: '18px 20px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: '#8a6207', marginBottom: '12px', textTransform: 'uppercase' }}>
                        {isHi ? '2. निवेश शैली विश्लेषण' : '2. INVESTMENT STYLE ANALYSIS'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '12px 14px', border: '1px solid rgba(212,160,23,0.3)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#8a6207', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                            {isHi ? 'इंट्राडे ट्रेडिंग' : 'Intraday Trading Suitability'}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isHighRisk ? '#c0392b' : '#2d6a4f' }}>
                            {suitability.intradayText}
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '12px 14px', border: '1px solid rgba(212,160,23,0.3)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#8a6207', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                            {isHi ? 'दीर्घकालिक धन संचय' : 'Long-Term Wealth Compounding'}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2d6a4f' }}>
                            {suitability.longTermText}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4a3728', lineHeight: '1.55', padding: '10px 14px', background: 'rgba(255,255,255,0.5)', borderRadius: '7px', borderLeft: '3px solid #d4a017' }}>
                        <strong style={{ color: '#8a6207' }}>{isHi ? 'मुख्य कारण: ' : 'Key Reason: '}</strong>
                        {suitability.keyReason}
                      </div>
                    </div>

                    {/* 3. Recommended Sectors */}
                    <div style={{ background: '#fff', border: '1.5px solid #e0d5c5', borderRadius: '10px', padding: '18px 20px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: '#8a6207', marginBottom: '12px', textTransform: 'uppercase' }}>
                        {isHi ? '3. अनुशंसित शेयर बाजार क्षेत्र (शीर्ष 3 अनुकूल क्षेत्र)' : '3. RECOMMENDED STOCK MARKET SECTORS (Top 3 Compatible Fields)'}
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                          <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #d4a017, #c4910d)', color: '#fff' }}>
                              <th style={{ padding: '9px 12px', textAlign: 'left', borderRadius: '6px 0 0 0', fontWeight: 700, fontSize: '0.75rem' }}>
                                {isHi ? 'उपयुक्त क्षेत्र' : 'Suitable Sector'}
                              </th>
                              <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem' }}>
                                {isHi ? 'अनुकूल ग्रह/संख्या' : 'Compatible Planet/Number'}
                              </th>
                              <th style={{ padding: '9px 12px', textAlign: 'left', borderRadius: '0 6px 0 0', fontWeight: 700, fontSize: '0.75rem' }}>
                                {isHi ? 'क्यों सुरक्षित/लाभदायक' : 'Why it is Safe/Profitable for You'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {suitability.sectorRows.map((row, i) => (
                              <tr key={i} style={{ background: i % 2 === 0 ? '#fffcf5' : '#fff5e6', borderBottom: '1px solid #f0e8d8' }}>
                                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a3a2e' }}>{row.sector}</td>
                                <td style={{ padding: '10px 12px', color: '#8a6207', fontWeight: 600 }}>{row.planet}</td>
                                <td style={{ padding: '10px 12px', color: '#4a3728', lineHeight: '1.45' }}>{row.why}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#8a8a8a', textAlign: 'center', padding: '8px 0', borderTop: '1px dashed #ddd', fontStyle: 'italic' }}>
                      ⚠️ {suitability.disclaimer}
                    </p>
                  </div>
                );
              })()}
            </section>

            {/* ── BABY BIRTH CALCULATOR ────────────────────────────── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.babyTitle}</h3>

              {/* Edit mode: date range inputs */}
              {isEditing && (
                <div className="name-detail-card" style={{ display: 'block', marginBottom: '14px' }}>
                  <span className="detail-label">{rpt.babyDateRangeLabel}</span>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.babyStartDate}</label>
                      <input
                        type="date"
                        className="edit-input"
                        name="report.babyBirth.startDate"
                        value={editedData?.report?.babyBirth?.startDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.babyEndDate}</label>
                      <input
                        type="date"
                        className="edit-input"
                        name="report.babyBirth.endDate"
                        value={editedData?.report?.babyBirth?.endDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Main analysis block */}
              {(() => {
                const startDate = isEditing
                  ? (editedData?.report?.babyBirth?.startDate || '')
                  : babyBirthData.startDate;
                const endDate = isEditing
                  ? (editedData?.report?.babyBirth?.endDate || '')
                  : babyBirthData.endDate;

                if (!startDate || !endDate) {
                  return (
                    <div className="empty-state-box">
                      <p>{rpt.babyNotDefined}</p>
                    </div>
                  );
                }

                const allResults = analyzeBirthDateRange(startDate, endDate);
                if (!allResults.length) {
                  return <div className="empty-state-box"><p>{rpt.babyNotDefined}</p></div>;
                }

                // Sort by gender score
                const sorted = [...allResults].sort((a, b) =>
                  babyGender === 'boy' ? b.boyScore - a.boyScore : b.girlScore - a.girlScore
                );

                const perfects = allResults.filter(r => r.isPerfect);

                const getScoreClass = (score) => {
                  if (score >= 70) return 'perfect';
                  if (score >= 50) return 'good';
                  if (score >= 30) return 'neutral';
                  return 'avoid';
                };
                const getCalCellClass = (score) => `${getScoreClass(score)}-cell`;
                const getBarColor = (pct) => {
                  if (pct === 100) return '#10b981';
                  if (pct === 66) return '#3b82f6';
                  if (pct === 33) return '#eab308';
                  return '#e5e7eb';
                };

                const activeBaby = selectedBabyDate
                  ? allResults.find(r => r.date === selectedBabyDate) || sorted[0]
                  : sorted[0];

                const formatDDMMYYYY = (d) => {
                  const [y, m, day] = d.split('-');
                  return `${day}-${m}-${y}`;
                };

                const dcEmoji = (rel) => {
                  if (rel === 'Compatible') return rpt.babyCompatible;
                  if (rel === 'Anti') return rpt.babyAnti;
                  return rpt.babyNeutral;
                };

                const isHi = language === 'hi';

                return (
                  <div>
                    {/* Gender toggle */}
                    <div className="baby-gender-toggle">
                      <button
                        className={`baby-gender-btn ${babyGender === 'boy' ? 'active-boy' : ''}`}
                        onClick={() => setBabyGender('boy')}
                      >{rpt.babyGenderBoy}</button>
                      <button
                        className={`baby-gender-btn ${babyGender === 'girl' ? 'active-girl' : ''}`}
                        onClick={() => setBabyGender('girl')}
                      >{rpt.babyGenderGirl}</button>
                    </div>

                    {/* Summary Card */}
                    <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #fffcf3, #fdf6e2)', border: '1.5px solid #d4a017', marginBottom: '14px' }}>
                      <h4 style={{ color: '#1a3a2e', marginBottom: '8px' }}>{rpt.babySummaryCard}</h4>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.88rem', color: '#495057' }}>
                          {rpt.babyTotalDays}: <strong style={{ color: '#d4a017' }}>{allResults.length}</strong>
                        </span>
                        <span style={{ fontSize: '0.88rem', color: '#495057' }}>
                          {rpt.babyPerfectDates}: <strong style={{ color: '#10b981' }}>{perfects.length}</strong>
                        </span>
                        <span style={{ fontSize: '0.88rem', color: '#495057' }}>
                          {rpt.babySelectedDates}: <strong style={{ color: '#333' }}>{formatDDMMYYYY(startDate)} → {formatDDMMYYYY(endDate)}</strong>
                        </span>
                      </div>

                      {/* Date Pills */}
                      <div className="baby-pills-row">
                        {sorted.slice(0, 12).map(r => (
                          <span
                            key={r.date}
                            className={`baby-pill ${getScoreClass(babyGender === 'boy' ? r.boyScore : r.girlScore)} ${selectedBabyDate === r.date || (!selectedBabyDate && r.date === sorted[0].date) ? 'selected' : ''}`}
                            onClick={() => setSelectedBabyDate(r.date)}
                          >
                            {formatDDMMYYYY(r.date)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Heatmap Calendar */}
                    <div className="name-detail-card" style={{ marginBottom: '14px' }}>
                      <span className="detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                        {isHi ? '🗓️ कैलेंडर हीटमैप' : '🗓️ CALENDAR HEATMAP'}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#8c6f58', marginBottom: '6px' }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>&#9632;</span> {isHi ? 'परफेक्ट (70+)' : 'Perfect (70+)'} &nbsp;
                        <span style={{ color: '#3b82f6', fontWeight: 700 }}>&#9632;</span> {isHi ? 'अच्छा (50-69)' : 'Good (50-69)'} &nbsp;
                        <span style={{ color: '#eab308', fontWeight: 700 }}>&#9632;</span> {isHi ? 'तटस्थ (30-49)' : 'Neutral (30-49)'} &nbsp;
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>&#9632;</span> {isHi ? 'बचें (<30)' : 'Avoid (<30)'}
                      </div>
                      <div className="baby-calendar">
                        {allResults.map(r => {
                          const gScore = babyGender === 'boy' ? r.boyScore : r.girlScore;
                          const isSelected = selectedBabyDate === r.date || (!selectedBabyDate && r.date === sorted[0].date);
                          const [, , dd] = r.date.split('-');
                          return (
                            <div
                              key={r.date}
                              className={`baby-cal-cell ${getCalCellClass(gScore)} ${isSelected ? 'selected-cell' : ''}`}
                              onClick={() => setSelectedBabyDate(r.date)}
                              title={`${formatDDMMYYYY(r.date)} — Score: ${gScore}`}
                            >
                              <span>{dd}</span>
                              <span className="baby-cal-score">{gScore}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top 5 Ranked List */}
                    <div className="name-detail-card" style={{ marginBottom: '14px' }}>
                      <span className="detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                        {isHi ? `शीर्ष 5 अनुशंसित तिथियाँ (${babyGender === 'boy' ? 'बॉय' : 'गर्ल'})` : `TOP 5 DATES FOR BABY ${babyGender === 'boy' ? 'BOY' : 'GIRL'}`}
                      </span>
                      <div className="baby-ranked-list">
                        {sorted.slice(0, 5).map((r, idx) => {
                          const gScore = babyGender === 'boy' ? r.boyScore : r.girlScore;
                          const isSelected = selectedBabyDate === r.date || (!selectedBabyDate && r.date === sorted[0].date);
                          return (
                            <div
                              key={r.date}
                              className={`baby-ranked-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedBabyDate(r.date)}
                            >
                              <span className="baby-rank-num">#{idx + 1}</span>
                              <div style={{ flex: 1 }}>
                                <div className="baby-rank-date">{formatDDMMYYYY(r.date)}</div>
                                <div className="baby-rank-meta">
                                  {rpt.babyDriver}: {r.driver} | {rpt.babyConductor}: {r.conductor} | DC: {dcEmoji(r.dcRelationship)}
                                </div>
                              </div>
                              <span className={`baby-score-badge baby-score-${getScoreClass(gScore)}`}>
                                {gScore}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Breakdown for selected date */}
                    {activeBaby && (
                      <div className="baby-breakdown-card">
                        <div className="baby-breakdown-title">
                          {rpt.babyDateBreakdown}: {formatDDMMYYYY(activeBaby.date)}
                        </div>

                        <div className="baby-stat-row">
                          <span className="baby-stat-key">{rpt.babyDriver} | {rpt.babyConductor}:</span>
                          <span className="baby-stat-val">{activeBaby.driver} | {activeBaby.conductor} (Compound: {activeBaby.compoundConductor})</span>
                        </div>
                        <div className="baby-stat-row">
                          <span className="baby-stat-key">{rpt.babyDCRelation}:</span>
                          <span className="baby-stat-val">{dcEmoji(activeBaby.dcRelationship)}</span>
                        </div>
                        <div className="baby-stat-row">
                          <span className="baby-stat-key">{rpt.babyKarmic}:</span>
                          <span className="baby-stat-val">{activeBaby.karmicNumber || rpt.babyNone}</span>
                        </div>
                        <div className="baby-stat-row">
                          <span className="baby-stat-key">{rpt.babyMaster}:</span>
                          <span className="baby-stat-val">{activeBaby.masterNumber || rpt.babyNone}</span>
                        </div>
                        <div className="baby-stat-row">
                          <span className="baby-stat-key">{rpt.babyMissingNums}:</span>
                          <span className="baby-stat-val">{activeBaby.missingNumbers.length ? activeBaby.missingNumbers.join(', ') : rpt.babyNone}</span>
                        </div>
                        <div className="baby-stat-row">
                          <span className="baby-stat-key">{rpt.babyRepeatedNums}:</span>
                          <span className="baby-stat-val">{activeBaby.repeatedNumbers.length ? activeBaby.repeatedNumbers.join(', ') : rpt.babyNone}</span>
                        </div>
                        <div className="baby-stat-row">
                          <span className="baby-stat-key">{rpt.babyGridStatus}:</span>
                          <span className="baby-stat-val">{activeBaby.gridFilled} {rpt.babyOutOf9} {activeBaby.gridFilled >= 7 ? '🟢' : activeBaby.gridFilled >= 5 ? '🟡' : '🔴'}</span>
                        </div>

                        {/* Planes Matrix */}
                        <div className="baby-breakdown-title" style={{ marginTop: '16px' }}>{rpt.babyPlaneMatrix}</div>
                        <div className="baby-plane-grid">
                          {Object.entries(activeBaby.planes).map(([key, plane]) => (
                            <div key={key} className="baby-plane-row">
                              <span className="baby-plane-label">{isHi ? plane.labelHi : plane.label}:</span>
                              <div className="baby-plane-bar-wrap">
                                <div className="baby-plane-bar" style={{ width: `${plane.percentage}%`, background: getBarColor(plane.percentage) }} />
                              </div>
                              <span className="baby-plane-pct">{plane.percentage}%</span>
                            </div>
                          ))}
                        </div>

                        {/* Gender Suitability Justification */}
                        <div className="baby-breakdown-title" style={{ marginTop: '16px' }}>{rpt.babyGenderSuitability}</div>
                        <div className={`baby-justification ${babyGender}`}>
                          {getBirthDateGenderJustification(activeBaby, babyGender, language)}
                        </div>

                        {/* Baby Name Suggestion Report */}
                        {(() => {
                          const nameReport = getNameSuggestions(activeBaby.date, babyGender);
                          if (!nameReport) return null;
                          return (
                            <div className="baby-name-suggestions-container" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(232, 213, 191, 0.5)' }}>
                              <div className="baby-breakdown-title" style={{ fontSize: '1rem', color: '#b5820a', marginBottom: '16px' }}>{rpt.babyNameSuggestionTitle}</div>
                              
                              <div className="baby-name-card-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="baby-name-card" style={{ background: 'rgba(255, 254, 249, 0.88)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)', boxShadow: '0 2px 8px rgba(181, 130, 10, 0.04)' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px dashed rgba(232, 213, 191, 0.6)', paddingBottom: '4px' }}>
                                    {rpt.babyNameAnalysisTitle}
                                  </div>
                                  <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                                    <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyDriver}:</span>
                                    <span className="baby-stat-val" style={{ fontWeight: 'bold', color: '#3d2c1e' }}>{nameReport.driver}</span>
                                  </div>
                                  <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                                    <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyConductor}:</span>
                                    <span className="baby-stat-val" style={{ fontWeight: 'bold', color: '#3d2c1e' }}>{nameReport.conductor}</span>
                                  </div>
                                  <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                                    <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyNameMissingPriority}:</span>
                                    <span className="baby-stat-val" style={{ color: '#c05050', fontWeight: 'bold' }}>{nameReport.missingPriority.length > 0 ? nameReport.missingPriority.join(', ') : rpt.babyNone}</span>
                                  </div>
                                  <div className="baby-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#5a4230' }}>
                                    <span className="baby-stat-key" style={{ color: '#8c6f58' }}>{rpt.babyNameSelectedTarget}:</span>
                                    <span className="baby-stat-val" style={{ color: '#b5820a', fontWeight: 'bold', fontSize: '1.05rem' }}>{nameReport.bestTarget}</span>
                                  </div>
                                </div>

                                <div className="baby-name-card" style={{ background: 'rgba(255, 254, 249, 0.88)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)', boxShadow: '0 2px 8px rgba(181, 130, 10, 0.04)' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px dashed rgba(232, 213, 191, 0.6)', paddingBottom: '4px' }}>
                                    {rpt.babyNameInitialsTitle}
                                  </div>
                                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    {nameReport.initials.map(letter => (
                                      <span key={letter} style={{ background: 'linear-gradient(135deg, #b5820a, #d4a326)', color: '#fff', fontWeight: 'bold', padding: '6px 14px', borderRadius: '8px', fontSize: '1.1rem', boxShadow: '0 2px 4px rgba(181,130,10,0.15)' }}>
                                        {letter}
                                      </span>
                                    ))}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#8c6f58', marginTop: '12px', fontStyle: 'italic' }}>
                                    {isHi ? 'भाग्यशाली नामाંક ' + nameReport.bestTarget + ' के अनुकूल प्रारंभिक अक्षर' : 'Lucky starting alphabets matching Destiny Number ' + nameReport.bestTarget}
                                  </div>
                                </div>
                              </div>

                              <div className="baby-justification" style={{ background: 'rgba(181, 130, 10, 0.05)', borderLeft: '4px solid #b5820a', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '20px', fontSize: '0.92rem', lineHeight: '1.5', color: '#5a4230' }}>
                                <strong>{rpt.babyNameJustification}:</strong> {isHi ? `लक्ष्य नामाંક ${nameReport.bestTarget} को चुना गया है क्योंकि यह मूલાંક ${nameReport.driver} અને ભાગ્યાંક ${nameReport.conductor} બંને સાથે અત્યંત અનુકૂળ અને મિત્ર છે, જેથી કોઈ વિરોધાભાસી (Anti) અંક નથી. તે લો શૂ ગ્રિડમાં ગુમ થયેલ પ્રાથમિક અંકોને પણ સંતુલિત કરે છે.` : nameReport.justification}
                              </div>

                              <div className="baby-breakdown-title" style={{ fontSize: '1rem', color: '#b5820a', marginBottom: '12px' }}>{rpt.babyNameTableTitle} ({babyGender === 'boy' ? (isHi ? 'बेबी बॉय' : 'Boy') : (isHi ? 'बेबी गर्ल' : 'Girl')})</div>
                              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left', background: '#fff' }}>
                                  <thead>
                                    <tr style={{ background: 'rgba(232, 213, 191, 0.15)', borderBottom: '1px solid rgba(232, 213, 191, 0.6)' }}>
                                      <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameSrNo}</th>
                                      <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameSuggestedName}</th>
                                      <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameBreakdown}</th>
                                      <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold', textAlign: 'center' }}>{rpt.babyNameTotal}</th>
                                      <th style={{ padding: '12px', color: '#8c6f58', fontWeight: 'bold' }}>{rpt.babyNameMeaning}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {nameReport.suggestions.map((s) => (
                                      <tr
                                        key={s.srNo}
                                        onClick={() => setActiveChaldeanPopupName({ ...s, target: nameReport.bestTarget })}
                                        style={{ 
                                          borderBottom: '1px solid rgba(232, 213, 191, 0.3)', 
                                          background: s.srNo % 2 === 0 ? 'rgba(232, 213, 191, 0.05)' : 'transparent',
                                          cursor: 'pointer',
                                          transition: 'background 0.15s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 130, 10, 0.04)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = s.srNo % 2 === 0 ? 'rgba(232, 213, 191, 0.05)' : 'transparent'}
                                      >
                                        <td style={{ padding: '12px', color: '#8c6f58' }}>{s.srNo}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#b5820a' }}>
                                          <span style={{ borderBottom: '1.5px dashed rgba(181, 130, 10, 0.5)', paddingBottom: '2px' }}>{s.name}</span>
                                        </td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#5a4230', fontSize: '0.85rem' }}>{s.calculation}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#3d2c1e' }}>{s.total}</td>
                                        <td style={{ padding: '12px', color: '#5a4230', fontSize: '0.85rem' }}>{s.meaning}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* ── SIGNATURE STYLE FOR SUCCESS ─────────────────── */}
            <section className="report-section">
              <h3 className="section-title">{language === 'hi' ? '💎 सफलता के लिए हस्ताक्षर शैली' : '💎 SIGNATURE STYLE FOR SUCCESS'}</h3>
              <div className="lucky-container">
                <div className="name-detail-card" style={{ background: 'linear-gradient(135deg, #fffcf5, #fdf6e2)', border: '1.5px solid #d4a017', padding: '16px' }}>
                  <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '0.88rem', lineHeight: '1.6', color: '#4a3728' }}>
                    {(() => {
                      const sigRules = [
                        language === 'hi' ? '• लगभग 45 डिग्री के निरंतर बढ़ते कोण पर हस्ताक्षर करें।' : '• Sign at a continuous rising angle of approximately 45 degrees.',
                        language === 'hi' ? '• अपने नाम के किसी भी अक्षर को काटती हुई रेखा कभी न खींचें।' : '• Never put a line cutting through any letters of your name.',
                        language === 'hi' ? '• अपने हस्ताक्षर को हमेशा आगे और ऊपर की ओर बढ़ते हुए स्ट्रोक के साथ समाप्त करें।' : '• Always end your signature with a forward and rising stroke.',
                        language === 'hi' ? '• बढ़ते हुए अंत के साथ हस्ताक्षर के नीचे दो समानांतर रेखाएं खींचें।' : '• Use two parallel underlines below the signature with a rising ending.',
                        language === 'hi' ? '• सुनिश्चित करें कि आपके नाम का पहला अक्षर बड़ा और स्पष्ट रूप से पठनीय हो।' : '• Ensure the first alphabet of your name is larger and clearly readable.'
                      ];
                      return sigRules.map((rule, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{rule}</li>);
                    })()}
                  </ul>
                </div>
              </div>
            </section>

            {/* ── 14. BRAND LOGO ANALYSIS & AUDIT ─────────────────── */}
            <section className="report-section">
              <h3 className="section-title">{rpt.logoTitle}</h3>
              {isEditing ? (
                <div className="name-detail-card" style={{ display: 'block' }}>
                  <span className="detail-label">{rpt.enterLogoDetails}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    
                    {/* Mode Selection Toggle */}
                    <div className="form-group" style={{ gridColumn: 'span 2', background: 'rgba(138, 98, 7, 0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px dashed rgba(138, 98, 7, 0.2)', marginBottom: '8px' }}>
                      <label className="form-label" style={{ fontSize: '0.88rem', color: '#8a6207', fontWeight: 700, marginBottom: '6px', display: 'block' }}>{rpt.logoAnalysisMode}</label>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#3d2c1e', fontWeight: 500 }}>
                          <input
                            type="radio"
                            name="report.logoAnalysis.analysisMode"
                            value="text"
                            checked={(editedData?.report?.logoAnalysis?.analysisMode || 'text') === 'text'}
                            onChange={() => {
                              setEditedData(prev => {
                                const next = { ...prev };
                                if (!next.report) next.report = {};
                                if (!next.report.logoAnalysis) next.report.logoAnalysis = {};
                                next.report.logoAnalysis.analysisMode = 'text';
                                return next;
                              });
                            }}
                            style={{ accentColor: '#8a6207', width: '16px', height: '16px' }}
                          />
                          {rpt.logoModeText}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#3d2c1e', fontWeight: 500 }}>
                          <input
                            type="radio"
                            name="report.logoAnalysis.analysisMode"
                            value="image"
                            checked={(editedData?.report?.logoAnalysis?.analysisMode || 'text') === 'image'}
                            onChange={() => {
                              setEditedData(prev => {
                                const next = { ...prev };
                                if (!next.report) next.report = {};
                                if (!next.report.logoAnalysis) next.report.logoAnalysis = {};
                                next.report.logoAnalysis.analysisMode = 'image';
                                return next;
                              });
                            }}
                            style={{ accentColor: '#8a6207', width: '16px', height: '16px' }}
                          />
                          {rpt.logoModeImage}
                        </label>
                      </div>
                    </div>

                    {/* Common Fields */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoCompanyName}</label>
                      <input
                        placeholder="e.g. Shining Ank Vastu"
                        className="edit-input"
                        name="report.logoAnalysis.companyName"
                        value={editedData?.report?.logoAnalysis?.companyName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoIndustry}</label>
                      <input
                        placeholder="e.g. Numerology & Astrology"
                        className="edit-input"
                        name="report.logoAnalysis.industry"
                        value={editedData?.report?.logoAnalysis?.industry || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoTargetAudience}</label>
                      <input
                        placeholder="e.g. Families, Business Owners"
                        className="edit-input"
                        name="report.logoAnalysis.targetAudience"
                        value={editedData?.report?.logoAnalysis?.targetAudience || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoMainPromise}</label>
                      <input
                        placeholder="e.g. Prosperity & Harmony"
                        className="edit-input"
                        name="report.logoAnalysis.mainPromise"
                        value={editedData?.report?.logoAnalysis?.mainPromise || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Conditional Rendering of Fields Based on Mode */}
                    {(!editedData?.report?.logoAnalysis?.analysisMode || editedData?.report?.logoAnalysis?.analysisMode === 'text') ? (
                      <>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoMarket}</label>
                          <select
                            className="edit-input"
                            name="report.logoAnalysis.market"
                            value={editedData?.report?.logoAnalysis?.market || 'national'}
                            onChange={handleInputChange}
                            style={{ height: '38px', padding: '6px' }}
                          >
                            <option value="local">{rpt.logoMarketLocal}</option>
                            <option value="regional">{rpt.logoMarketRegional}</option>
                            <option value="national">{rpt.logoMarketNational}</option>
                            <option value="global">{rpt.logoMarketGlobal}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoBrandStyle}</label>
                          <select
                            className="edit-input"
                            name="report.logoAnalysis.brandStyle"
                            value={editedData?.report?.logoAnalysis?.brandStyle || 'modern'}
                            onChange={handleInputChange}
                            style={{ height: '38px', padding: '6px' }}
                          >
                            <option value="premium">{rpt.logoBrandStylePremium}</option>
                            <option value="massmarket">{rpt.logoBrandStyleMassMarket}</option>
                            <option value="spiritual">{rpt.logoBrandStyleSpiritual}</option>
                            <option value="corporate">{rpt.logoBrandStyleCorporate}</option>
                            <option value="modern">{rpt.logoBrandStyleModern}</option>
                            <option value="traditional">{rpt.logoBrandStyleTraditional}</option>
                            <option value="bold">{rpt.logoBrandStyleBold}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoTypeLabel}</label>
                          <select
                            className="edit-input"
                            name="report.logoAnalysis.logoType"
                            value={editedData?.report?.logoAnalysis?.logoType || 'combination'}
                            onChange={handleInputChange}
                            style={{ height: '38px', padding: '6px' }}
                          >
                            <option value="wordmark">Wordmark</option>
                            <option value="lettermark">Lettermark</option>
                            <option value="monogram">Monogram</option>
                            <option value="symbol">Symbol</option>
                            <option value="emblem">Emblem</option>
                            <option value="mascot">Mascot</option>
                            <option value="abstract">Abstract Mark</option>
                            <option value="combination">Combination Mark</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoShapeLabel}</label>
                          <select
                            className="edit-input"
                            name="report.logoAnalysis.shapeStyle"
                            value={editedData?.report?.logoAnalysis?.shapeStyle || 'circle'}
                            onChange={handleInputChange}
                            style={{ height: '38px', padding: '6px' }}
                          >
                            <option value="circle">Circle (Circular/Curves)</option>
                            <option value="square">Square / Rectangle</option>
                            <option value="triangle">Triangle / Angular</option>
                            <option value="shield">Shield</option>
                            <option value="abstract">Abstract shape</option>
                            <option value="lettermark">Lettermark / Initials based</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoPrimaryColorLabel}</label>
                          <select
                            className="edit-input"
                            name="report.logoAnalysis.primaryColor"
                            value={editedData?.report?.logoAnalysis?.primaryColor || 'blue'}
                            onChange={handleInputChange}
                            style={{ height: '38px', padding: '6px' }}
                          >
                            <option value="blue">Blue</option>
                            <option value="red">Red</option>
                            <option value="green">Green</option>
                            <option value="gold">Gold / Yellow</option>
                            <option value="orange">Orange</option>
                            <option value="purple">Purple</option>
                            <option value="black">Black</option>
                            <option value="white">White / Gray</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoSecondaryColorLabel}</label>
                          <select
                            className="edit-input"
                            name="report.logoAnalysis.secondaryColor"
                            value={editedData?.report?.logoAnalysis?.secondaryColor || 'gray'}
                            onChange={handleInputChange}
                            style={{ height: '38px', padding: '6px' }}
                          >
                            <option value="blue">Blue</option>
                            <option value="red">Red</option>
                            <option value="green">Green</option>
                            <option value="gold">Gold / Yellow</option>
                            <option value="orange">Orange</option>
                            <option value="purple">Purple</option>
                            <option value="black">Black</option>
                            <option value="white">White / Gray</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoTypographyLabel}</label>
                          <select
                            className="edit-input"
                            name="report.logoAnalysis.typographyStyle"
                            value={editedData?.report?.logoAnalysis?.typographyStyle || 'sans'}
                            onChange={handleInputChange}
                            style={{ height: '38px', padding: '6px' }}
                          >
                            <option value="serif">Serif (Traditional/Premium)</option>
                            <option value="sans">Sans-serif (Modern/Tech)</option>
                            <option value="geometric">Geometric (Structured/Clean)</option>
                            <option value="script">Script (Personal/Feminine)</option>
                            <option value="display">Display (Bold/Creative)</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>{rpt.logoSymbolismLabel}</label>
                          <input
                            placeholder="e.g. An ascending arrow, a rising sun, or clean geometric lines"
                            className="edit-input"
                            name="report.logoAnalysis.symbolismDesc"
                            value={editedData?.report?.logoAnalysis?.symbolismDesc || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem', color: '#8a6207', fontWeight: 600 }}>
                          {isHi ? 'लोगो छवि अपलोड करें (Upload Logo Image)' : 'Upload Brand Logo Image'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64Data = reader.result;

                                // Compress and analyze logo image
                                const img = new Image();
                                img.onload = () => {
                                  // Determine aspect ratio
                                  const aspect = img.width / img.height;
                                  let detectedType = 'combination';
                                  let detectedShape = 'circle';
                                  if (aspect > 1.6) {
                                    detectedType = 'wordmark';
                                    detectedShape = 'lettermark';
                                  } else if (aspect < 0.6) {
                                    detectedType = 'emblem';
                                    detectedShape = 'shield';
                                  } else {
                                    detectedType = 'symbol';
                                    detectedShape = 'circle';
                                  }

                                  // Client-side compression to max 300px
                                  const maxDim = 300;
                                  let width = img.width;
                                  let height = img.height;
                                  if (width > maxDim || height > maxDim) {
                                    if (width > height) {
                                      height = Math.round((height * maxDim) / width);
                                      width = maxDim;
                                    } else {
                                      width = Math.round((width * maxDim) / height);
                                      height = maxDim;
                                    }
                                  }

                                  const canvas = document.createElement('canvas');
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  let finalBase64 = base64Data;
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, width, height);
                                    finalBase64 = canvas.toDataURL('image/jpeg', 0.7);
                                  }

                                  // Extract dominant color from image pixels using small 10x10 canvas
                                  const colorCanvas = document.createElement('canvas');
                                  colorCanvas.width = 10;
                                  colorCanvas.height = 10;
                                  const colorCtx = colorCanvas.getContext('2d');
                                  let primaryColor = 'blue';
                                  let secondaryColor = 'white';

                                  if (colorCtx) {
                                    colorCtx.drawImage(img, 0, 0, 10, 10);
                                    const imgData = colorCtx.getImageData(0, 0, 10, 10).data;

                                    const getClosestColor = (r, g, b) => {
                                      const colors = [
                                        { name: 'blue', r: 30, g: 64, b: 175 },
                                        { name: 'red', r: 185, g: 28, b: 28 },
                                        { name: 'green', r: 21, g: 128, b: 61 },
                                        { name: 'gold', r: 181, g: 130, b: 10 },
                                        { name: 'orange', r: 194, g: 65, b: 12 },
                                        { name: 'purple', r: 107, g: 33, b: 168 },
                                        { name: 'black', r: 17, g: 24, b: 39 },
                                        { name: 'white', r: 240, g: 240, b: 240 }
                                      ];
                                      let minD = Infinity;
                                      let closest = 'blue';
                                      for (const c of colors) {
                                        const d = Math.sqrt((r - c.r)**2 + (g - c.g)**2 + (b - c.b)**2);
                                        if (d < minD) {
                                          minD = d;
                                          closest = c.name;
                                        }
                                      }
                                      return closest;
                                    };

                                    const colorMap = {};
                                    for (let i = 0; i < imgData.length; i += 4) {
                                      const r = imgData[i];
                                      const g = imgData[i+1];
                                      const b = imgData[i+2];
                                      const a = imgData[i+3];
                                      if (a < 50) continue; // Skip transparency

                                      const closest = getClosestColor(r, g, b);
                                      colorMap[closest] = (colorMap[closest] || 0) + 1;
                                    }

                                    const sortedColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
                                    primaryColor = sortedColors[0] ? sortedColors[0][0] : 'blue';
                                    secondaryColor = sortedColors[1] ? sortedColors[1][0] : 'white';
                                  }

                                  setEditedData(prev => {
                                    const next = { ...prev };
                                    if (!next.report) next.report = {};
                                    if (!next.report.logoAnalysis) next.report.logoAnalysis = {};
                                    next.report.logoAnalysis.logoImage = finalBase64;
                                    next.report.logoAnalysis.logoType = detectedType;
                                    next.report.logoAnalysis.shapeStyle = detectedShape;
                                    next.report.logoAnalysis.primaryColor = primaryColor;
                                    next.report.logoAnalysis.secondaryColor = secondaryColor;
                                    return next;
                                  });
                                };
                                img.src = base64Data;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display: 'block', width: '100%', padding: '6px', fontSize: '0.88rem' }}
                        />
                        {editedData?.report?.logoAnalysis?.logoImage && (
                          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={editedData.report.logoAnalysis.logoImage}
                              alt="Logo Thumbnail"
                              style={{ height: '50px', borderRadius: '4px', border: '1px solid #ccc', objectFit: 'contain' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditedData(prev => {
                                  const next = { ...prev };
                                  if (next.report?.logoAnalysis) {
                                    next.report.logoAnalysis.logoImage = null;
                                  }
                                  return next;
                                });
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                            >
                              {isHi ? 'हटाएं' : 'Remove'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                (() => {
                  const logoReport = analyzeLogo(report.logoAnalysis, language);
                  if (!logoReport) {
                    return (
                      <div className="empty-state-box">
                        <p>{rpt.logoNotDefined}</p>
                      </div>
                    );
                  }

                  const getColorHex = (col) => {
                    const map = {
                      blue: '#1e40af', red: '#b91c1c', green: '#15803d', gold: '#b5820a',
                      orange: '#c2410c', purple: '#6b21a8', black: '#111827', white: '#e5e7eb'
                    };
                    return map[col.toLowerCase()] || '#9ca3af';
                  };

                  const audit = logoReport.auditReport;

                  return (
                    <div className="logo-analysis-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
                      
                      {/* Logo Image Preview */}
                      {report.logoAnalysis.logoImage && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                          <div style={{ padding: '16px', border: '1px solid rgba(232, 213, 191, 0.6)', borderRadius: '16px', background: '#fff', boxShadow: '0 8px 24px rgba(181, 130, 10, 0.05)', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={report.logoAnalysis.logoImage} alt="Uploaded Logo" style={{ maxHeight: '150px', objectFit: 'contain', maxWidth: '100%', borderRadius: '8px' }} />
                            <span style={{ fontSize: '0.75rem', color: '#b5820a', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                              {isHi ? 'ऑडिट किया गया लोगो' : 'AUDITED BRAND LOGO'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Brand Basics Box */}
                      <div style={{ background: 'linear-gradient(135deg, #fefdf9, #fbf8f0)', border: '1px solid rgba(232, 213, 191, 0.8)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)' }}>
                        <div style={{ fontSize: '0.78rem', color: '#8c6f58', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px dashed rgba(232, 213, 191, 0.6)', paddingBottom: '6px', letterSpacing: '1px' }}>
                          {isHi ? 'ब्रांड बुनियादी जानकारी' : 'BRAND IDENTITY PROFILE'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: '0.88rem' }}>
                          <div><span style={{ color: '#8c6f58', fontWeight: 600 }}>{isHi ? 'ब्रांड का नाम:' : 'Brand Name:'}</span> <strong style={{ color: '#3d2c1e' }}>{logoReport.basics.companyName}</strong></div>
                          <div><span style={{ color: '#8c6f58', fontWeight: 600 }}>{isHi ? 'उद्योग / डोमेन:' : 'Industry/Domain:'}</span> <strong style={{ color: '#3d2c1e' }}>{logoReport.basics.industry}</strong></div>
                          <div><span style={{ color: '#8c6f58', fontWeight: 600 }}>{isHi ? 'लक्षित दर्शक:' : 'Target Audience:'}</span> <strong style={{ color: '#3d2c1e' }}>{logoReport.basics.targetAudience}</strong></div>
                          <div><span style={{ color: '#8c6f58', fontWeight: 600 }}>{isHi ? 'मुख्य वादा:' : 'Main Promise:'}</span> <strong style={{ color: '#3d2c1e' }}>{logoReport.basics.mainPromise}</strong></div>
                          <div><span style={{ color: '#8c6f58', fontWeight: 600 }}>{isHi ? 'बाजार का दायरा:' : 'Market Scope:'}</span> <strong style={{ color: '#3d2c1e' }}>{logoReport.basics.market}</strong></div>
                          <div><span style={{ color: '#8c6f58', fontWeight: 600 }}>{isHi ? 'ब्रांड शैली:' : 'Brand Style:'}</span> <strong style={{ color: '#3d2c1e' }}>{logoReport.basics.brandStyle}</strong></div>
                        </div>
                      </div>

                      {/* 1. EXECUTIVE SUMMARY */}
                      <div style={{ borderLeft: '4px solid #b5820a', paddingLeft: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#b5820a', letterSpacing: '0.5px' }}>
                          {isHi ? '१. कार्यकारी सारांश (EXECUTIVE SUMMARY)' : '1. EXECUTIVE SUMMARY'}
                        </h3>
                        <div style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.5)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.6', color: '#3d2c1e', fontStyle: 'italic' }}>
                            <strong>{isHi ? 'समग्र मूल्यांकन:' : 'Overall Assessment:'}</strong> "{audit.executiveSummary.overallAssessment}"
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                                {isHi ? 'सबसे बड़ी ताकत' : 'BIGGEST STRENGTH'}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#14532d', lineHeight: '1.5' }}>{audit.executiveSummary.biggestStrength}</p>
                            </div>
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>
                                {isHi ? 'घातक दोष' : 'FATAL FLAW'}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: '1.5' }}>{audit.executiveSummary.fatalFlaw}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. FULL VISUAL DESIGN ANALYSIS */}
                      <div style={{ borderLeft: '4px solid #b5820a', paddingLeft: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#b5820a', letterSpacing: '0.5px' }}>
                          {isHi ? '२. पूर्ण दृश्य डिज़ाइन विश्लेषण (VISUAL DESIGN ANALYSIS)' : '2. FULL VISUAL DESIGN ANALYSIS'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {[
                            { title: isHi ? 'दृश्य संरचना और ज्यामिति' : 'Visual Structure & Geometry', desc: audit.visualAnalysis.structureGeometry },
                            { title: isHi ? 'रंग मनोविज्ञान और प्रभाव' : 'Color Psychology & Impact', desc: audit.visualAnalysis.colorPsychology },
                            { title: isHi ? 'टाइपोग्राफी मनोविज्ञान और सुपाठ्यता' : 'Typography Psychology & Legibility', desc: audit.visualAnalysis.typographyLegibility },
                            { title: isHi ? 'संतुलन और संरचना' : 'Balance & Composition', desc: audit.visualAnalysis.balanceComposition },
                            { title: isHi ? 'बाजार विशिष्टता' : 'Market Distinctiveness', desc: audit.visualAnalysis.marketDistinctiveness }
                          ].map((item, idx) => (
                            <div key={idx} style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.4)', padding: '14px 16px', borderRadius: '10px' }}>
                              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', color: '#8c6f58', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {item.title}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.88rem', color: '#3d2c1e', lineHeight: '1.5' }}>{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. TRUST & TECHNICAL ASSESSMENT */}
                      <div style={{ borderLeft: '4px solid #b5820a', paddingLeft: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#b5820a', letterSpacing: '0.5px' }}>
                          {isHi ? '३. विश्वास और तकनीकी मूल्यांकन (TRUST & TECHNICAL ASSESSMENT)' : '3. TRUST & TECHNICAL ASSESSMENT'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.5)', padding: '16px', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#8c6f58', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              {isHi ? 'विश्वास और प्रीमियम धारणा' : 'Trust & Premium Perception'}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.5' }}>{audit.trustTechnical.trustPerception}</p>
                          </div>
                          <div style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.5)', padding: '16px', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#8c6f58', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              {isHi ? 'तकनीकी सुगमता (Usability)' : 'Technical Usability'}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.5' }}>{audit.trustTechnical.technicalUsability}</p>
                          </div>
                        </div>
                      </div>

                      {/* 4. EXPERT OBSERVATIONS & HIDDEN FLAWS */}
                      <div style={{ borderLeft: '4px solid #b5820a', paddingLeft: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#b5820a', letterSpacing: '0.5px' }}>
                          {isHi ? '४. विशेषज्ञ अवलोकन और छिपे हुए दोष (EXPERT OBSERVATIONS)' : '4. EXPERT OBSERVATIONS & HIDDEN FLAWS'}
                        </h3>
                        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {audit.expertObservations.map((obs, idx) => (
                            <div key={idx} style={{ fontSize: '0.88rem', color: '#742a2a', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: '1.4' }}>
                              <span style={{ fontSize: '1rem', color: '#c53030' }}>⚠️</span>
                              <span>{obs}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. PREDICTED BUSINESS IMPACT */}
                      <div style={{ borderLeft: '4px solid #b5820a', paddingLeft: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#b5820a', letterSpacing: '0.5px' }}>
                          {isHi ? '५. अनुमानित व्यावसायिक प्रभाव (PREDICTED BUSINESS IMPACT)' : '5. PREDICTED BUSINESS IMPACT'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <div style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.5)', padding: '14px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '6px' }}>
                              {isHi ? 'ग्राहक धारणा' : 'CUSTOMER PERCEPTION'}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.4' }}>{audit.predictedImpact.customerPerception}</p>
                          </div>
                          <div style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.5)', padding: '14px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '6px' }}>
                              {isHi ? 'ब्रांड स्मरण' : 'BRAND RECALL'}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.4' }}>{audit.predictedImpact.brandRecall}</p>
                          </div>
                          <div style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.5)', padding: '14px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '6px' }}>
                              {isHi ? 'बाजार स्थिति' : 'MARKET POSITION'}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.4' }}>{audit.predictedImpact.marketPosition}</p>
                          </div>
                        </div>
                      </div>

                      {/* 6. ACTIONABLE IMPROVEMENTS & ACTION PLAN */}
                      <div style={{ borderLeft: '4px solid #b5820a', paddingLeft: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#b5820a', letterSpacing: '0.5px' }}>
                          {isHi ? '६. सुधारात्मक कार्य योजना (ACTIONABLE IMPROVEMENTS)' : '6. ACTIONABLE IMPROVEMENTS & ACTION PLAN'}
                        </h3>
                        <div style={{ background: 'rgba(181, 130, 10, 0.04)', border: '1px solid rgba(232, 213, 191, 0.6)', padding: '18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {audit.actionPlan.map((act, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '22px', height: '22px', borderRadius: '50%', background: '#b5820a', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '2px' }}>
                                {idx + 1}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.88rem', color: '#5a4230', lineHeight: '1.4', fontWeight: 500 }}>{act}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 7. EVALUATION SCORECARD */}
                      <div style={{ borderLeft: '4px solid #b5820a', paddingLeft: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#b5820a', letterSpacing: '0.5px' }}>
                          {isHi ? '७. मूल्यांकन स्कोरकार्ड (EVALUATION SCORECARD)' : '7. EVALUATION SCORECARD'}
                        </h3>
                        <div style={{ background: '#fff', border: '1px solid rgba(232, 213, 191, 0.75)', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 12px rgba(181, 130, 10, 0.03)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                            {[
                              { label: isHi ? 'दृश्य संरचना और आकार (Visual Structure & Shape)' : 'Visual Structure & Shape', val: audit.scorecard.visualStructure },
                              { label: isHi ? 'रंग और टाइपोग्राफी प्रभाव (Color & Typography Impact)' : 'Color & Typography Impact', val: audit.scorecard.colorTypography },
                              { label: isHi ? 'बाजार विशिष्टता और स्मरण (Market Distinction & Recall)' : 'Market Distinction & Recall', val: audit.scorecard.marketDistinction },
                              { label: isHi ? 'तकनीकी स्केलेबिलिटी (Technical Scalability)' : 'Technical Scalability', val: audit.scorecard.technicalScalability },
                              { label: isHi ? 'विश्वास और प्रीमियम एहसास (Trust & Premium Feel)' : 'Trust & Premium Feel', val: audit.scorecard.trustPremium }
                            ].map((scoreItem) => (
                              <div key={scoreItem.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', color: '#5a4230' }}>
                                  <span>{scoreItem.label}</span>
                                  <span>{scoreItem.val} / 10</span>
                                </div>
                                <div style={{ height: '8px', background: '#f3ece3', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${scoreItem.val * 10}%`, height: '100%', background: 'linear-gradient(90deg, #b5820a, #d4a326)', borderRadius: '4px' }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Overall Score Badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1.5px dashed rgba(232, 213, 191, 0.6)' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3d2c1e' }}>
                              {isHi ? 'समग्र लोगो स्कोर (OVERALL LOGO SCORE)' : 'OVERALL LOGO SCORE'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b5820a' }}>
                                {audit.scorecard.overallScore}
                              </span>
                              <span style={{ fontSize: '0.9rem', color: '#8c6f58', fontWeight: 600 }}>/ 10</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })()
              )}
            </section>

            {/* ── 15. CUSTOM NOTE PAGE 1 ─────────────────── */}
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

        {/* Chaldean Calculator Popup Modal */}
        {activeChaldeanPopupName && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(145deg, #ffffff, #fdfbf7)',
              border: '2px solid #b5820a',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 12px 36px rgba(181, 130, 10, 0.25)',
              padding: '24px',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button 
                onClick={() => setActiveChaldeanPopupName(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.6rem',
                  color: '#8c6f58',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}
              >
                &times;
              </button>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem',
                color: '#b5820a',
                textAlign: 'center',
                margin: '0 0 4px 0',
                fontWeight: 'bold'
              }}>
                {activeChaldeanPopupName.name}
              </h3>
              
              <p style={{
                fontSize: '0.82rem',
                color: '#8c6f58',
                textAlign: 'center',
                margin: '0 0 20px 0',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                {rpt.chaldeanCalculatorTitle}
              </p>

              <div style={{
                background: 'rgba(181, 130, 10, 0.03)',
                border: '1px solid rgba(232, 213, 191, 0.5)',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '20px'
              }}>
                {/* Letters Breakdown Grid */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginBottom: '18px'
                }}>
                  {activeChaldeanPopupName.name.toUpperCase().split('').map((char, index) => {
                    const letterVals = {
                      A:1, I:1, J:1, Q:1, Y:1,
                      B:2, K:2, R:2,
                      C:3, G:3, L:3, S:3,
                      D:4, M:4, T:4,
                      E:5, H:5, N:5, X:5,
                      U:6, V:6, W:6,
                      O:7, Z:7,
                      F:8, P:8
                    };
                    const val = letterVals[char] || 0;
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: '#fff',
                        border: '1.5px solid rgba(181, 130, 10, 0.35)',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        minWidth: '38px',
                        boxShadow: '0 2px 4px rgba(181, 130, 10, 0.04)'
                      }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#3d2c1e' }}>{char}</span>
                        <span style={{ fontSize: '0.8rem', color: '#b5820a', fontWeight: 'bold', borderTop: '1px solid rgba(232, 213, 191, 0.4)', marginTop: '4px', paddingTop: '2px', width: '100%', textAlign: 'center' }}>
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Graphic calculation */}
                <div style={{
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontSize: '0.98rem',
                  color: '#5a4230',
                  marginBottom: '14px',
                  fontWeight: 'bold'
                }}>
                  {activeChaldeanPopupName.calculation.split(' = ')[0]} = {activeChaldeanPopupName.calculation.split(' = ')[1]?.split(' -> ')[0]}
                </div>

                {/* Reduction */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1.05rem',
                  color: '#3d2c1e',
                  fontWeight: 'bold',
                  borderTop: '1px solid rgba(232, 213, 191, 0.4)',
                  paddingTop: '14px'
                }}>
                  <span>{isHi ? 'अंतिम योग:' : 'Total:'}</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #b5820a, #d4a326)',
                    color: '#fff',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(181,130,10,0.2)'
                  }}>
                    {activeChaldeanPopupName.total}
                  </span>
                </div>
              </div>

              <p style={{
                fontSize: '0.85rem',
                color: '#5a4230',
                lineHeight: '1.5',
                textAlign: 'center',
                margin: '0 0 20px 0'
              }}>
                {rpt.gridFulfillmentText.replace('{target}', activeChaldeanPopupName.target)}
              </p>

              <button 
                onClick={() => setActiveChaldeanPopupName(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #b5820a, #d4a326)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 3px 6px rgba(181, 130, 10, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default ReportView;
