import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle, Download } from 'lucide-react';
import { getClientById } from '../services/clientService';
import { useLanguage } from '../context/LanguageContext';
import { generatePDF } from '../utils/pdfGenerator';
import {
  calcMulank,
  calcBhagyank,
  calculateKua,
  calculateLoShuGrid,
  getPresentNumbers,
  getMissingNumbers,
  getRepeatedNumbers,
  getArrows,
  getMobileAnalysis,
  getMobileCompatibilityCheck,
  getMarriageType,
  getMatchMaking,
  analyzeStockSuitability,
  analyzeLogo,
  getForeignSettlement,
  analyzeBirthDateRange,
  getNameSuggestions,
  getBirthDateGenderJustification
} from '../utils/numerology';
import './GlobalAnalysisScreen.css';
import './ReportView.css';
import gridConfig from '../config/analysisGridConfig.json';

function GlobalAnalysisScreen() {
  const { id, topicId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const rpt = t.rpt;
  const isHi = language === 'hi';

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customLines, setCustomLines] = useState([]);

  // States for interactive topic details (Baby Birth & Name Spelling suggestions)
  const [babyGender, setBabyGender] = useState('boy');
  const [selectedBabyDate, setSelectedBabyDate] = useState(null);
  const [activeChaldeanPopupName, setActiveChaldeanPopupName] = useState(null);
  const [selectedAlphabetFilter, setSelectedAlphabetFilter] = useState(null);

  // Active topic configuration matching JSON setup
  const activeTopic = gridConfig.find(item => item.id === topicId);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await getClientById(id);
        if (res.success && res.data) {
          setClientData(res.data);

          // Load custom lines for this specific topic (to preserve PDF printing capability)
          const report = res.data.report || {};
          const topicLines = report.customLines?.[topicId] || [];
          setCustomLines(topicLines);
        } else {
          setError('Client not found');
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
        setError('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, topicId]);

  if (loading) {
    return (
      <div className="analysis-screen-loading">
        <div className="spinner-large"></div>
        <p>{isHi ? 'गणना की जा रही है...' : 'Decoding cosmic frequencies...'}</p>
      </div>
    );
  }

  if (error || !clientData || !activeTopic) {
    return (
      <div className="analysis-screen-error">
        <AlertCircle size={48} className="error-icon" />
        <h2>Unable to load analysis screen</h2>
        <p>{error || 'Invalid configuration or route parameter.'}</p>
        <button className="btn-back" onClick={() => navigate(`/report/${id}`)}>
          <ArrowLeft size={16} /> Return to Report
        </button>
      </div>
    );
  }

  // Calculations
  const report = clientData.report || {};
  const dob = clientData.dob || '';
  const name = clientData.name || '';
  const phone = clientData.phone || '';
  const gender = clientData.gender || 'male';
  const spouseName = clientData.spouseName || '';

  const mulank = calcMulank(dob);
  const bhagyank = calcBhagyank(dob);
  const kuaNum = calculateKua(dob, gender);

  // Pre-calculate details for the PDF exporter fallback
  let calculatedDetailsFallback = {
    title: activeTopic.title,
    summary: '',
    points: [],
    extraInsights: []
  };

  switch (topicId) {
    case 'mobile_analysis': {
      const mobileCheck = getMobileCompatibilityCheck(phone, mulank, bhagyank, dob);
      const mobileAnalysis = getMobileAnalysis(phone, mulank, bhagyank);
      calculatedDetailsFallback.title = isHi ? 'प्लैनेटरी फ़ोन एनर्जी विश्लेषण' : 'Planetary Phone Energy Analysis';
      calculatedDetailsFallback.summary = `Mobile: ${phone || 'Not Provided'}`;
      calculatedDetailsFallback.points = [
        `Compound Total: ${mobileCheck.compoundSum || 'N/A'}`,
        `Single Digit: ${mobileCheck.singleDigit || 'N/A'} (Ruled by ${mobileCheck.rulingPlanet || 'N/A'})`,
        `Driver Compatibility: ${mobileCheck.driverRelationship?.toUpperCase() || 'N/A'}`,
        `Conductor Compatibility: ${mobileCheck.conductorRelationship?.toUpperCase() || 'N/A'}`,
        `Planetary Frequency Status: ${mobileCheck.statusMessage || 'N/A'}`
      ];
      calculatedDetailsFallback.extraInsights = mobileAnalysis.bullets || [];
      break;
    }
    case 'marriage_prediction': {
      const marriage = getMarriageType(dob, mulank, bhagyank);
      calculatedDetailsFallback.title = isHi ? 'विवाह संबंध और वाइब' : 'Marriage Affinity & Vibe';
      calculatedDetailsFallback.summary = `Life Partner Vibe & Path Connection`;
      calculatedDetailsFallback.points = [
        `Marriage Suitability Model: ${marriage.marriageType || 'N/A'}`,
        `Cosmic Support Level: ${marriage.strength || 'N/A'}`,
        `Planetary Influence: ${marriage.reason || 'N/A'}`
      ];
      calculatedDetailsFallback.extraInsights = marriage.remedies || [];
      break;
    }
    case 'match_making': {
      const match = getMatchMaking(dob, spouseName || '1976-05-12', mulank, bhagyank);
      calculatedDetailsFallback.title = isHi ? 'कुंडली मिलान विवरण' : 'Match Making Compatibility Details';
      calculatedDetailsFallback.summary = `Native vs Spouse Compatibility (36 Gunas Matrix)`;
      calculatedDetailsFallback.points = [
        `Couple Guna Score: ${match.gunaScore || 'N/A'} / 36`,
        `Compatibility Badge: ${match.compatibilityLevel || 'N/A'}`,
        `Conflict Severity: ${match.conflictDescription || 'None'}`
      ];
      calculatedDetailsFallback.extraInsights = match.bullets || [];
      break;
    }
    case 'stock_suitability': {
      const stock = analyzeStockSuitability(dob, mulank, bhagyank);
      calculatedDetailsFallback.title = isHi ? 'शेयर बाजार अनुकूलता और निवेश गाइड' : 'Stock Market Suitability & Investment Guide';
      calculatedDetailsFallback.summary = `Wealth Planes Investment Suitability`;
      calculatedDetailsFallback.points = [
        `Suitability Status: ${stock.overallStatus || 'N/A'}`,
        `Intraday Trading Fit: ${stock.intradayFit || 'N/A'}`,
        `Long-Term Investment Fit: ${stock.longTermFit || 'N/A'}`,
        `Lucky Sectors: ${stock.luckySectors?.join(', ') || 'N/A'}`
      ];
      calculatedDetailsFallback.extraInsights = stock.remedyList || [];
      break;
    }
    case 'logo_analysis': {
      const logo = (report.logoAnalysis && report.logoAnalysis.companyName)
        ? analyzeLogo(report.logoAnalysis, language)
        : analyzeLogo({ companyName: name || 'Company Name' }, language) || {
            soundHarmony: 'N/A',
            recommendedShapes: ['Circle', 'Rectangle'],
            favorableColors: ['Blue', 'Gold'],
            typographyStyle: 'Clean Sans-Serif / Stable Serif',
            auditChecklist: []
          };
      calculatedDetailsFallback.title = isHi ? 'ब्रांड पावर और कॉर्पोरेट पहचान विश्लेषण' : 'Brand Power & Corporate Identity Analysis';
      calculatedDetailsFallback.summary = `Logo Shapes, Colors & Typography Alignment`;
      calculatedDetailsFallback.points = [
        `Brand Sound Harmony: ${logo.soundHarmony || 'N/A'}`,
        `Recommended Shapes: ${logo.recommendedShapes?.join(', ') || 'Circle / Rectangle'}`,
        `Favorable Corporate Colors: ${logo.favorableColors?.join(', ') || 'Blue / Gold'}`,
        `Typography Directive: ${logo.typographyStyle || 'Clean Sans-Serif / Stable Serif'}`
      ];
      calculatedDetailsFallback.extraInsights = logo.auditChecklist || [];
      break;
    }
    case 'foreign_settlement': {
      const foreign = getForeignSettlement(dob, mulank, bhagyank);
      calculatedDetailsFallback.title = isHi ? 'विदेश यात्रा और पीआर संभावना' : 'Foreign Settlement & PR Potential';
      calculatedDetailsFallback.summary = `Globe Traveller Opportunities`;
      calculatedDetailsFallback.points = [
        `PR / Visa Chances: ${foreign.chances || 'N/A'}`,
        `Lucky Direction of Travel: ${foreign.luckyDirection || 'N/A'}`,
        `Favorable Settlement Years: ${foreign.favorableYears || 'N/A'}`
      ];
      calculatedDetailsFallback.extraInsights = foreign.points || [];
      break;
    }
    case 'baby_birth_calc': {
      const baby = analyzeBirthDateRange(dob, babyGender);
      calculatedDetailsFallback.title = isHi ? 'शिशु जन्म शुभ तिथि गणना' : 'Baby Birth Auspicious Date Analysis';
      calculatedDetailsFallback.summary = `Delivery Period & Birth Planes Harmony`;
      calculatedDetailsFallback.points = [
        `Ideal Delivery Range: ${baby.deliveryRange || 'N/A'}`,
        `Highly Favorable Target Dates: ${baby.favorableDates?.join(', ') || 'N/A'}`,
        `Auspicious Moon Signs: ${baby.auspiciousSigns || 'N/A'}`
      ];
      calculatedDetailsFallback.extraInsights = baby.recommendations || [];
      break;
    }
    case 'baby_name_suggest': {
      const suggestions = getNameSuggestions(name, mulank, bhagyank);
      calculatedDetailsFallback.title = isHi ? 'नाम हिज्जे सुधार और सुझाव' : 'Baby Name Spelling Suggestions & Correction';
      calculatedDetailsFallback.summary = `Chaldean Core Spelling Balances`;
      calculatedDetailsFallback.points = [
        `Name Spelling Vibe: ${suggestions.currentSpellingRating || 'N/A'}`,
        `Spelling Adjustments: ${suggestions.adjustmentsRequired || 'None'}`,
        `Auspicious Alphabet Anchors: ${suggestions.recommendedAlphabets?.join(', ') || 'N/A'}`
      ];
      calculatedDetailsFallback.extraInsights = suggestions.namesList || [];
      break;
    }
    default:
      break;
  }

  const handleDownloadPDF = async () => {
    try {
      const pdf = await generatePDF(clientData, language, activeTopic?.id, customLines);
      pdf.save(`${clientData.name}_${activeTopic?.id || 'Topic'}_Report.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred during PDF generation.');
    }
  };

  // Replicating the exact section layout from complete report
  const renderReportSection = () => {
    const report = clientData.report || {};

    // Helper functions for bullet and status translation
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

    switch (topicId) {
      case 'mobile_analysis': {
        const mobileCheck = getMobileCompatibilityCheck(phone || '', mulank, bhagyank, dob || '');
        if (!mobileCheck.isValid) {
          return (
            <div className="empty-state-box" style={{ padding: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px dashed rgba(232, 213, 191, 0.3)' }}>
              <p style={{ color: '#8c6f58', margin: 0 }}>{rpt.noPhoneMsg}</p>
            </div>
          );
        }
        return (
          <div className="name-compatibility-container">
            {/* Inputs Info Header */}
            <div className="name-header-card" style={{ background: 'linear-gradient(135deg, #f4f6f9, #e9ecef)', border: '1.5px solid #6c757d', marginBottom: '10px' }}>
              <h4 style={{ color: '#2b303a', marginBottom: '8px' }}>{rpt.mobileNumberAnalysis}: <span className="highlight-text">{phone}</span></h4>
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
        );
      }

      case 'marriage_prediction': {
        const marriageType = getMarriageType(dob || '', mulank, bhagyank);
        return (
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
        );
      }

      case 'match_making': {
        const clientGenderForMM = gender || 'male';
        const clientNameForMM = name || '';
        const clientDobForMM = dob || '';
        const spouseNameForMM = spouseName || '';
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

        const hasProfiles = mmData?.male?.name && mmData?.female?.name &&
          mmData.male.name !== 'Partner Name Not Added' &&
          mmData.female.name !== 'Partner Name Not Added' &&
          mmData?.male?.dob && mmData?.female?.dob;

        if (!hasProfiles) {
          return (
            <div className="empty-state-box">
              <p>{rpt.partnerNotDefined}</p>
            </div>
          );
        }

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
      }

      case 'stock_suitability': {
        const suitability = analyzeStockSuitability(dob || '', language);
        if (!suitability) return <div className="empty-state-box"><p>{rpt.stockNotDefined}</p></div>;

        const isHighRisk = suitability.statusCode === 'high_risk';
        const isLongTerm = suitability.statusCode === 'long_term';
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
      }

      case 'logo_analysis': {
        const logoReport = analyzeLogo(report.logoAnalysis, language);
        if (!logoReport) return <div className="empty-state-box"><p>{rpt.logoNotDefined}</p></div>;

        const getColorHex = (col) => {
          const map = {
            blue: '#1e40af', red: '#b91c1c', green: '#15803d', gold: '#b5820a',
            orange: '#c2410c', purple: '#6b21a8', black: '#111827', white: '#e5e7eb'
          };
          return map[col.toLowerCase()] || '#9ca3af';
        };

        return (
          <div className="logo-analysis-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Executive Summary Card */}
            <div className="logo-summary-card" style={{ background: 'rgba(255, 254, 249, 0.95)', border: '1px solid rgba(232, 213, 191, 0.8)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(181, 130, 10, 0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#8c6f58', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px dashed rgba(232, 213, 191, 0.6)', paddingBottom: '4px' }}>
                {isHi ? 'कार्यकारी सारांश' : 'EXECUTIVE SUMMARY'}
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#3d2c1e', fontStyle: 'italic', margin: 0 }}>
                "{logoReport.executiveSummary}"
              </p>
            </div>

            {/* 1. Design Quality Audit Grid */}
            <div className="logo-section-subtitle" style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#b5820a', marginTop: '10px' }}>
              {isHi ? '१. दृश्य डिज़ाइन ऑडिट (12-बिंदु ढांचा)' : '1. VISUAL DESIGN AUDIT (12-POINT FRAMEWORK)'}
            </div>
            <div className="logo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="logo-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#8c6f58', fontWeight: 'bold' }}>
                  {isHi ? 'लोगो प्रकार विश्लेषण' : 'LOGO CLASSIFICATION'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#5a4230', lineHeight: '1.5' }}>
                  {logoReport.designAudit.logoTypeInfo}
                </p>
              </div>
              <div className="logo-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#8c6f58', fontWeight: 'bold' }}>
                  {isHi ? 'आकार और ज्यामिति मनोविज्ञान' : 'SHAPE & GEOMETRY PSYCHOLOGY'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#5a4230', lineHeight: '1.5' }}>
                  {logoReport.designAudit.shapeInfo}
                </p>
              </div>
              <div className="logo-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#8c6f58', fontWeight: 'bold' }}>
                  {isHi ? 'टाइपोग्राफी और शैली' : 'TYPOGRAPHY STYLE & FIT'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#5a4230', lineHeight: '1.5' }}>
                  {logoReport.designAudit.typographyInfo}
                </p>
              </div>
              <div className="logo-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#8c6f58', fontWeight: 'bold' }}>
                  {isHi ? 'तकनीकी स्केलेबिलिटी और प्रिंट' : 'TECHNICAL SCALABILITY & PRINT'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#5a4230', lineHeight: '1.5' }}>
                  {logoReport.designAudit.scalabilityInfo}
                </p>
              </div>
            </div>

            {/* 2. Occult Metaphysical Layer */}
            <div className="logo-section-subtitle" style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#b5820a', marginTop: '10px' }}>
              {isHi ? '२. अवचेतन और आध्यात्मिक ऊर्जा परत' : '2. SUBCONSCIOUS & METAPHYSICAL ENERGY LAYER'}
            </div>
            <div className="logo-metaphysical-box" style={{ background: 'rgba(255, 254, 249, 0.88)', border: '1px solid rgba(232, 213, 191, 0.75)', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ background: 'linear-gradient(135deg, #3d2c1e, #5a4230)', color: '#fff', fontSize: '0.82rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px' }}>
                  {isHi ? 'तत्व:' : 'Element:'} {logoReport.psychologyLayer.occultElement?.split(" (")[0]}
                </span>
                <span style={{ background: 'linear-gradient(135deg, #b5820a, #d4a326)', color: '#fff', fontSize: '0.82rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px' }}>
                  {isHi ? 'प्रवाह:' : 'Flow:'} {logoReport.psychologyLayer.energyFlow?.split(" - ")[0]}
                </span>
                <span style={{ background: '#f5efe6', color: '#8c6f58', fontSize: '0.82rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                  {logoReport.predictions.trustSpeed}
                </span>
              </div>

              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#3d2c1e', lineHeight: '1.6' }}>
                <strong>{isHi ? 'ऊर्जा संरेखण व्याख्या:' : 'Metaphysical Balance Comment:'}</strong> {logoReport.psychologyLayer.metaphysicalBalance}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                {report.logoAnalysis?.primaryColor && (
                  <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(232, 213, 191, 0.4)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getColorHex(report.logoAnalysis.primaryColor), border: '1.5px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase' }}>
                        {isHi ? 'मुख्य रंग' : 'PRIMARY COLOR'} ({report.logoAnalysis.primaryColor})
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#5a4230', marginTop: '2px', lineHeight: '1.4' }}>
                        {logoReport.designAudit.primaryColorInfo}
                      </div>
                    </div>
                  </div>
                )}
                {report.logoAnalysis?.secondaryColor && (
                  <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(232, 213, 191, 0.4)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getColorHex(report.logoAnalysis.secondaryColor), border: '1.5px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase' }}>
                        {isHi ? 'सहायक रंग' : 'SECONDARY COLOR'} ({report.logoAnalysis.secondaryColor})
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#5a4230', marginTop: '2px', lineHeight: '1.4' }}>
                        {logoReport.designAudit.secondaryColorInfo}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Business Predictions */}
            <div className="logo-section-subtitle" style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#b5820a', marginTop: '10px' }}>
              {isHi ? '३. व्यावसायिक भविष्यवाणियाँ और प्रभाव' : '3. BUSINESS FUTURE PREDICTIONS'}
            </div>
            <div className="logo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isHi ? 'मूल्य निर्धारण समर्थन' : 'PRICING POWER'}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.4' }}>
                  {logoReport.predictions.pricingSupport}
                </p>
              </div>
              <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isHi ? 'बाजार पहुंच' : 'MARKET REACH'}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.4' }}>
                  {logoReport.predictions.marketReach}
                </p>
              </div>
              <div style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.6)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8c6f58', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isHi ? 'प्रथम प्रभाव संकेत' : 'FIRST IMPRESSION'}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#3d2c1e', lineHeight: '1.4' }}>
                  {logoReport.psychologyLayer.emotionalSignal}
                </p>
              </div>
            </div>

            {/* Timeline predictions */}
            <div className="logo-predictions-timeline" style={{ background: 'rgba(255,254,249,0.5)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(232,213,191,0.8)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: '80px', padding: '3px 8px', background: '#e8d5bf', color: '#5a4230', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', textAlign: 'center', marginTop: '2px' }}>
                    0 - 1 {isHi ? 'वर्ष' : 'Year'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#3d2c1e', lineHeight: '1.4' }}>{logoReport.predictions.shortTerm}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: '80px', padding: '3px 8px', background: '#b5820a', color: '#fff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', textAlign: 'center', marginTop: '2px' }}>
                    1 - 3 {isHi ? 'वर्ष' : 'Years'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#3d2c1e', lineHeight: '1.4' }}>{logoReport.predictions.midTerm}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: '80px', padding: '3px 8px', background: '#3d2c1e', color: '#fff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', textAlign: 'center', marginTop: '2px' }}>
                    3 - 7 {isHi ? 'वर्ष' : 'Years'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#3d2c1e', lineHeight: '1.4' }}>{logoReport.predictions.longTerm}</div>
                </div>
              </div>
            </div>

            {/* 4. Competitor Benchmark */}
            <div className="logo-section-subtitle" style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#b5820a', marginTop: '10px' }}>
              {isHi ? '४. प्रतिस्पर्धी बेंचमार्क तुलना' : '4. COMPETITIVE BENCHMARK'}
            </div>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left', background: '#fff' }}>
                <thead>
                  <tr style={{ background: 'rgba(232, 213, 191, 0.15)', borderBottom: '1px solid rgba(232, 213, 191, 0.6)' }}>
                    <th style={{ padding: '10px', color: '#8c6f58', fontWeight: 'bold' }}>{isHi ? 'ब्रांड / प्रतिस्पर्धी' : 'Brand / Competitor'}</th>
                    <th style={{ padding: '10px', color: '#8c6f58', fontWeight: 'bold' }}>{isHi ? 'मुख्य ताकत' : 'Strongest Feature'}</th>
                    <th style={{ padding: '10px', color: '#8c6f58', fontWeight: 'bold' }}>{isHi ? 'बड़ी कमजोरी' : 'Biggest Weakness'}</th>
                    <th style={{ padding: '10px', color: '#8c6f58', fontWeight: 'bold', textAlign: 'center' }}>{isHi ? 'रैंक' : 'Rank'}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.logoAnalysis?.companyName && (
                    <tr style={{ borderBottom: '1px solid rgba(232, 213, 191, 0.2)', background: 'rgba(181, 130, 10, 0.03)' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#b5820a' }}>{report.logoAnalysis.companyName} ({isHi ? 'आपका लोगो' : 'Your Logo'})</td>
                      <td style={{ padding: '10px', color: '#3d2c1e' }}>{logoReport.strengths[0]}</td>
                      <td style={{ padding: '10px', color: '#c05050' }}>{logoReport.weaknesses[0]}</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#b5820a' }}>3</td>
                    </tr>
                  )}
                  {logoReport.competitorBenchmark.items.map((comp) => (
                    <tr key={comp.name} style={{ borderBottom: '1px solid rgba(232, 213, 191, 0.2)' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#5a4230' }}>{comp.name}</td>
                      <td style={{ padding: '10px', color: '#5a4230' }}>{comp.strength}</td>
                      <td style={{ padding: '10px', color: '#c05050' }}>{comp.weak}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#5a4230' }}>{comp.rank === 3 ? 4 : comp.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8c6f58', fontStyle: 'italic', marginTop: '-4px' }}>
              {logoReport.competitorBenchmark.rankingText}
            </div>

            {/* 5. Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#15803d', marginBottom: '10px', borderBottom: '1.5px solid #15803d', paddingBottom: '4px' }}>
                  {isHi ? '✓ मुख्य ताकतें (Strengths)' : '✓ KEY STRENGTHS'}
                </div>
                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {logoReport.strengths.map((str, idx) => (
                    <li key={idx} style={{ fontSize: '0.88rem', color: '#3d2c1e', lineHeight: '1.4' }}>{str}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#c05050', marginBottom: '10px', borderBottom: '1.5px solid #c05050', paddingBottom: '4px' }}>
                  {isHi ? '✗ छिपे हुए दोष व जोखिम (Flaws)' : '✗ HIDDEN FLAWS & RISKS'}
                </div>
                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {logoReport.weaknesses.map((weak, idx) => (
                    <li key={idx} style={{ fontSize: '0.88rem', color: '#3d2c1e', lineHeight: '1.4' }}>{weak}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 6. Improvement Recommendations */}
            <div className="logo-section-subtitle" style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#b5820a', marginTop: '10px' }}>
              {isHi ? '५. पेशेवर सुधार सुझाव' : '5. STRATEGIC RECOMMENDATIONS'}
            </div>
            <div style={{ background: 'rgba(181, 130, 10, 0.05)', borderLeft: '4px solid #b5820a', padding: '16px', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontWeight: 'bold', color: '#b5820a', marginBottom: '6px', fontSize: '0.92rem' }}>
                {isHi ? 'अनुशंसित प्राथमिकता स्तर:' : 'Recommended Priority:'} {logoReport.recommendations.action}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#5a4230', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                {logoReport.recommendations.details}
              </div>
            </div>

            {/* 7. Final Scoring Matrix */}
            <div className="logo-section-subtitle" style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#b5820a', marginTop: '10px' }}>
              {isHi ? '६. समग्र लोगो स्कोर मैट्रिक्स' : '6. FINAL AUDIT SCORING MATRIX'}
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(232, 213, 191, 0.75)', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: isHi ? 'ब्रांड अनुकूलन (Brand Fit)' : 'Brand Fit', val: logoReport.scores.brandFit },
                  { label: isHi ? 'दृश्य स्पष्टता (Clarity)' : 'Visual Clarity', val: logoReport.scores.visualClarity },
                  { label: isHi ? 'याद रखने की क्षमता (Memorability)' : 'Memorability', val: logoReport.scores.memorability },
                  { label: isHi ? 'भरोसा कारक (Trust Factor)' : 'Trust Factor', val: logoReport.scores.trustFactor },
                  { label: isHi ? 'प्रीमियम महसूस होना (Premium Feel)' : 'Premium Feel', val: logoReport.scores.premiumFeel },
                  { label: isHi ? 'मापने की क्षमता (Scalability)' : 'Scalability', val: logoReport.scores.scalability },
                ].map((scoreItem) => (
                  <div key={scoreItem.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

              {/* Overall Potential Block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed rgba(232, 213, 191, 0.6)' }}>
                <span style={{ fontSize: '0.98rem', fontWeight: 'bold', color: '#3d2c1e' }}>
                  {isHi ? 'समग्र सफलता क्षमता (Overall Potential)' : 'Overall Success Potential'}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#b5820a' }}>
                  {logoReport.scores.potential} / 10
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'foreign_settlement': {
        const foreignSettlement = getForeignSettlement(dob || '', mulank, bhagyank);
        return (
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
        );
      }

      case 'baby_birth_calc': {
        const babyBirthData = report.babyBirth || { startDate: '2026-06-01', endDate: '2026-06-15' };
        const startDate = babyBirthData.startDate || '2026-06-01';
        const endDate = babyBirthData.endDate || '2026-06-15';

        const allResults = analyzeBirthDateRange(startDate, endDate);
        if (!allResults.length) return <div className="empty-state-box"><p>{rpt.babyNotDefined}</p></div>;

        const sorted = [...allResults].sort((a, b) =>
          babyGender === 'boy' ? b.boyScore - a.boyScore : b.girlScore - a.girlScore
        );
        const perfects = allResults.filter(r => r.isPerfect);
        const activeBaby = selectedBabyDate
          ? allResults.find(r => r.date === selectedBabyDate) || sorted[0]
          : sorted[0];

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

        const formatDDMMYYYY = (d) => {
          const [y, m, day] = d.split('-');
          return `${day}-${m}-${y}`;
        };

        const dcEmoji = (rel) => {
          if (rel === 'Compatible') return rpt.babyCompatible;
          if (rel === 'Anti') return rpt.babyAnti;
          return rpt.babyNeutral;
        };

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
                            {isHi ? 'भाग्यशाली नामांक ' + nameReport.bestTarget + ' के अनुकूल प्रारंभिक अक्षर' : 'Lucky starting alphabets matching Destiny Number ' + nameReport.bestTarget}
                          </div>
                        </div>
                      </div>

                      <div className="baby-justification" style={{ background: 'rgba(181, 130, 10, 0.05)', borderLeft: '4px solid #b5820a', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '20px', fontSize: '0.92rem', lineHeight: '1.5', color: '#5a4230' }}>
                        <strong>{rpt.babyNameJustification}:</strong> {isHi ? `लक्ष्य नामांक ${nameReport.bestTarget} को चुना गया है क्योंकि यह मूलांक ${nameReport.driver} और भाग्यांक ${nameReport.conductor} दोनों के साथ अनुकूल है, जिससे कोई भी विरोधाभास (Anti) अंक नहीं है। यह लो शू ग्रिड में अनुपस्थित प्राथमिक अंकों को संतुलित करता है।` : nameReport.justification}
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
      }

      case 'baby_name_suggest': {
        const clientGender = (gender === 'male' || gender === 'boy') ? 'boy' : 'girl';
        const nameReport = getNameSuggestions(dob || '', clientGender);
        if (!nameReport) return <div className="empty-state-box"><p>{rpt.babyNotDefined}</p></div>;

        const filteredSuggestions = selectedAlphabetFilter
          ? nameReport.suggestions.filter(s => s.name.toUpperCase().startsWith(selectedAlphabetFilter))
          : nameReport.suggestions;

        return (
          <div>
            <p style={{ color: '#8c6f58', fontSize: '0.9rem', marginBottom: '20px', marginTop: '-10px' }}>
              {rpt.nameSpellingDescription}
            </p>

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

              {/* Suggestions Table */}
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
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="global-analysis-screen light-theme-page">
      <div className="analysis-screen-container">

        {/* Header Navigation */}
        <header className="analysis-screen-header">
          <button className="btn-back" onClick={() => navigate(`/report/${id}`)}>
            <ArrowLeft size={18} /> {isHi ? 'पीछे जाएं' : 'Back to Report'}
          </button>

          <div className="header-right-actions">
            <button className="btn-download-pdf-accent" onClick={handleDownloadPDF}>
              <Download size={16} /> {isHi ? 'पीडीएफ डाउनलोड' : 'Download PDF'}
            </button>
            <span className="pill-admin">{isHi ? 'एडमिन पैनल' : 'ADMIN PANEL'}</span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="analysis-hero theme-gold-gradient">
          <span className="hero-tag">{activeTopic.tag}</span>
          <h1 className="hero-title">{activeTopic.title}</h1>
          <p className="hero-subtext">{isHi ? 'लो शू ग्रिड आधारित त्वरित वैदिक फलादेश' : 'Dynamic predictions based on cosmic grids'}</p>
        </div>

        {/* ── COMMON CLIENT OVERVIEW & LO SHU GRID ANALYSIS (Top Row) ── */}
        <div className="common-analysis-row">

          {/* Client Info Summary Card */}
          <div className="analysis-card client-info-summary-card">
            <div className="card-header-icon">
              <Sparkles className="icon-sparkle" size={24} />
              <h2>{isHi ? 'ग्राहक बुनियादी विवरण' : 'Client Common Info'}</h2>
            </div>
            <div className="info-grid-list-cols">
              <div className="info-column-left">
                <div className="info-item-row">
                  <span className="info-label">{isHi ? 'नाम:' : 'Name:'}</span>
                  <span className="info-value">{name}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-label">{isHi ? 'जन्म तिथि:' : 'DOB:'}</span>
                  <span className="info-value">{dob.split('-').reverse().join('-')}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-label">{isHi ? 'मोबाइल नंबर:' : 'Mobile:'}</span>
                  <span className="info-value">{phone || 'N/A'}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-label">{isHi ? 'लिंग:' : 'Gender:'}</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{gender}</span>
                </div>
              </div>
              <div className="info-column-right">
                <div className="info-item-row">
                  <span className="info-label highlight-label">{isHi ? 'मूलांक (Driver):' : 'Mulank (Driver):'}</span>
                  <span className="info-value highlight-val">{mulank}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-label highlight-label">{isHi ? 'भाग्यांक (Conductor):' : 'Bhagyank (Conductor):'}</span>
                  <span className="info-value highlight-val">{bhagyank}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-label highlight-label">{isHi ? 'कुआ नंबर:' : 'Kua Number:'}</span>
                  <span className="info-value highlight-val">{kuaNum}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lo Shu Grid Box Analysis */}
          <div className="analysis-card loshu-section-card">
            <div className="card-header-icon">
              <Sparkles className="icon-sparkle" size={24} />
              <h2>{rpt.loShuTitle}</h2>
            </div>

            <div className="loshu-container">
              <div className="loshu-grid">
                {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((num, idx) => {
                  const grid = calculateLoShuGrid(dob, [mulank, bhagyank, kuaNum]);
                  const count = grid[num - 1];
                  const cellValue = count > 0 ? Array(count).fill(num).join(' ') : '';
                  return (
                    <div key={idx} className={`grid-cell ${count > 0 ? 'present' : 'empty'}`}>
                      {cellValue}
                    </div>
                  );
                })}
              </div>

              <div className="grid-interpretation">
                <h4>{rpt.gridHighlights}</h4>
                {(() => {
                  const fullGrid = calculateLoShuGrid(dob, [mulank, bhagyank, kuaNum]);
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

                      <div className="missing-numbers" style={{ marginTop: '10px' }}>
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
                        <div className="repeated-numbers" style={{ marginTop: '10px' }}>
                          <p><strong>{rpt.repeatedNumbers}:</strong></p>
                          <div className="number-tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {repeatedNums.map((item, idx) => (
                              <span key={idx} className="tag tag-present" style={{ background: 'linear-gradient(145deg, #fdf2cc, #fde4a3)', border: '1px solid rgba(181,130,10,0.3)', color: '#8a6207', fontSize: '10.5px' }}>
                                {rpt.digit} {item.num}: {item.strength} ({item.count}x)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="arrow-analysis" style={{ marginTop: '12px', borderTop: '1px solid rgba(232,213,191,0.4)', paddingTop: '8px' }}>
                        {arrows.positive.length > 0 && (
                          <div style={{ marginBottom: '6px' }}>
                            <p style={{ margin: '0 0 2px', fontSize: '12.5px' }}><strong>{rpt.positivePlanes}:</strong></p>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {arrows.positive.map((arr, idx) => (
                                <span key={idx} style={{ padding: '3px 6px', borderRadius: '4px', background: '#e6f4ea', color: '#137333', fontSize: '10.5px', fontWeight: 'bold' }}>
                                  {arr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {arrows.negative.length > 0 && (
                          <div>
                            <p style={{ margin: '0 0 2px', fontSize: '12.5px' }}><strong>{rpt.weaknesses}:</strong></p>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {arrows.negative.map((arr, idx) => (
                                <span key={idx} style={{ padding: '3px 6px', borderRadius: '4px', background: '#fce8e6', color: '#c5221f', fontSize: '10.5px', fontWeight: 'bold' }}>
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
              </div>
            </div>
          </div>

        </div>

        {/* ── SPECIFIC TOPIC ANALYSIS (Full Report Style - Horizontal format topic wise) ── */}
        <div className="topic-analysis-report-container" style={{ marginTop: '24px', background: '#fffef9', borderRadius: '24px', border: '1px solid rgba(232, 213, 191, 0.75)', padding: '24px', boxShadow: '0 4px 20px rgba(181, 130, 10, 0.05)' }}>
          {renderReportSection()}
        </div>

      </div>

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
                    A: 1, I: 1, J: 1, Q: 1, Y: 1,
                    B: 2, K: 2, R: 2,
                    C: 3, G: 3, L: 3, S: 3,
                    D: 4, M: 4, T: 4,
                    E: 5, H: 5, N: 5, X: 5,
                    U: 6, V: 6, W: 6,
                    O: 7, Z: 7,
                    F: 8, P: 8
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

export default GlobalAnalysisScreen;
