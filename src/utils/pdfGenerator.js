import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { 
  calculateLoShuGrid, 
  getMissingNumbers, 
  getPresentNumbers, 
  calculateKua,
  calcMulank,
  calcBhagyank,
  getNumberCompatibilityAnalysis,
  getHiddenInfluences,
  getPersonalYearData,
  calcPersonalYearForYear,
  getLuckyElements,
  getMobileAnalysis,
  getNameCompatibilityAnalysis,
  getCareerOutlook,
  getArrows,
  getRepeatedNumbers,
  getKuaVastuData,
  getMissingNumberRemedyData,
  getMobileCompatibilityCheck,
  getNameNumerologyCheck,
  getForeignSettlement,
  getMatchMaking,
  getMarriageType,
  analyzeStock,
  getStockComments,
  analyzeBirthDateRange,
  getBirthDateGenderJustification,
  getNameSuggestions
} from "./numerology";

// Static assets imported directly so Vite bundles them
import firstp1Img from "../assets/Firstp1.png"; // This is actually the Wheel image
import firstp2Img from "../assets/firstp2.png"; // This is actually the Lord Ganesha image
import lastPageImg from "../assets/LastPage.png";
import ganeshaMantraImg from "../assets/ganeshaMantra.png";

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

// Helper to asynchronously load images for PDF generation
const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

const fetchFontAsBase64 = async (url) => {
  try {
    const cached = localStorage.getItem(url);
    if (cached) return cached;
  } catch (e) {}
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      try {
        localStorage.setItem(url, base64);
      } catch (e) {}
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generatePDF = async (clientData, language = 'en') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Translation helper
  const isHi = language === 'hi';
  const t = (en, hi) => isHi ? hi : en;

  const getPlanetTranslation = (planetName) => {
    const planetMap = {
      "Sun": "सूर्य (Sun)", "Moon": "चंद्र (Moon)", "Jupiter": "गुरु (Jupiter)", 
      "Rahu": "राहु (Rahu)", "Mercury": "बुध (Mercury)", "Venus": "शुक्र (Venus)", 
      "Ketu": "केतु (Ketu)", "Saturn": "शनि (Saturn)", "Mars": "मंगल (Mars)"
    };
    return planetMap[planetName] || planetName;
  };

  const translatePlaneName = (key) => {
    const names = {
      mental: t("Mental Plane (4-9-2)", "मानसिक तल (4-9-2)"),
      emotional: t("Emotional/Heart Plane (3-5-7)", "भावनात्मक/हृदय तल (3-5-7)"),
      practical: t("Practical Plane (8-1-6)", "व्यावहारिक तल (8-1-6)"),
      left: t("Thought Plane (4-3-8)", "विचार तल (4-3-8)"),
      middle: t("Will Plane (9-5-1)", "इच्छा/संकल्प तल (9-5-1)"),
      right: t("Action Plane (2-7-6)", "कर्म/क्रिया तल (2-7-6)")
    };
    return names[key] || key;
  };

  const getPlaneInterpretation = (plane) => {
    if (!isHi) return plane.interpretation;
    
    const key = plane.key;
    const isActive = plane.isActive;
    const isInactive = plane.isInactive;
    const presentStr = plane.present.slice().sort((a, b) => a - b).join(",");
    
    if (isActive) {
      const activeMap = {
        mental: "आपका दिमाग बहुत तेज है। आपके पास असाधारण विश्लेषणात्मक क्षमता, योजना कौशल और शैक्षणिक योग्यता है। तीनों ऊर्जाएं (राहु, मंगल, चंद्रमा) बौद्धिक महारत के लिए मिलकर काम करती हैं।",
        emotional: "आप अत्यधिक विकसित भावनात्मक और आध्यात्मिक स्वभाव के स्वामी हैं। मजबूत करुणा, गहरी अंतर्दृष्टि, आध्यात्मिक झुकाव और संतुलित आंतरिक दुनिया के साथ उत्कृष्ट संचार।",
        practical: "आप भौतिक दुनिया में एक स्वाभाविक उपलब्धि हासिल करने वाले हैं। शनि का अनुशासन (8), सूर्य का नेतृत्व (1), और शुक्र का सामंजस्य (6) मिलकर उत्कृष्ट वास्तविक दुनिया की सफलता और धन निर्माण लाते हैं।",
        left: "आपकी विचार-से-क्रिया की पाइपलाइन पूरी तरह से सक्रिय है। विचार (3-गुरु) संरचना (4-राहु) द्वारा जमीनी बनते हैं और दृढ़ता (8-शनि) के साथ निष्पादित होते हैं।",
        middle: "आप असाधारण इच्छाशक्ति और दृढ़ संकल्प के स्वामी हैं। मंगल का उत्साह (9), बुध की अनुकूलनशीलता (5), और सूर्य का आत्मविश्वास (1) उद्देश्यपूर्ण कार्रवाई और सफलता का मार्ग प्रशस्त करते हैं।",
        right: "आपकी भावनात्मक और आध्यात्मिक संवेदनशीलता पूरी तरह से जागृत है। चंद्रमा का अंतर्ज्ञान (2), केतु की आध्यात्मिकता (7), और शुक्र का प्रेम (6) एक सहानुभूतिपूर्ण और आध्यात्मिक रूप से जुड़े व्यक्तित्व का निर्माण करते हैं।"
      };
      return activeMap[key] || plane.interpretation;
    }
    
    if (isInactive) {
      const inactiveMap = {
        mental: "मानसिक तल (4-9-2) पूरी तरह से अनुपस्थित है। आपको एकाग्रता, स्मृति, शैक्षणिक प्रदर्शन और रणनीतिक सोच में कठिनाई हो सकती है। शिक्षा के उपायों और ध्यान पर ध्यान दें।",
        emotional: "भावनात्मक तल (3-5-7) पूरी तरह से अनुपस्थित है। यह भावनाओं को व्यक्त करने में कठिनाई, दबी हुई भावनाओं, आध्यात्मिक अलगाव और रचनात्मक संचार में चुनौतियों को दर्शाता है।",
        practical: "व्यावहारिक तल (8-1-6) पूरी तरह से अनुपस्थित है। भौतिक दुनिया की उपलब्धियों के लिए दोगुने प्रयास की आवश्यकता हो सकती है। वित्तीय अनुशासन और करियर वृद्धि के लिए सक्रिय उपायों की आवश्यकता है।",
        left: "बायाँ स्तंभ / विचार तल (4-3-8) अनुपस्थित है। सोचने और योजना बनाने की क्षमताओं में विकास की आवश्यकता है। आप विचारों को उत्पादक कार्यों में बदलने में संघर्ष कर सकते हैं।",
        middle: "मध्य स्तंभ / इच्छाशक्ति तल (9-5-1) अनुपस्थित है। इच्छाशक्ति और आत्मविश्वास का निर्माण मुख्य फोकस क्षेत्र हैं। आत्मविश्वास और दृढ़ता से जुड़ी चुनौतियां आ सकती हैं।",
        right: "दायाँ स्तंभ / संवेदनशीलता तल (2-7-6) अनुपस्थित है। संवेदनशीलता और भावनात्मक संबंधों में संतुलन की आवश्यकता है। दूसरों के साथ तालमेल बिठाने में अधिक प्रयास करें।"
      };
      return inactiveMap[key] || plane.interpretation;
    }
    
    // Partial translations
    const partialMap = {
      mental: {
        "4,2": "मजबूत भौतिक सोच और भावनात्मक संवेदनशीलता मौजूद है, लेकिन रणनीतिक आक्रामकता (अंक 9 missing) कमजोर है। आप योजना अच्छी बनाते हैं लेकिन संघर्षों से बच सकते हैं।",
        "9,2": "तीक्ष्ण अंतर्ज्ञान और भावनात्मक बुद्धिमत्ता है, लेकिन व्यावहारिक निष्पादन और स्थिरता (अंक 4 missing) कमजोर है।",
        "4,9": "मजबूत ड्राइव के साथ उत्कृष्ट रणनीतिकार हैं, लेकिन लोगों को समझने और भावनात्मक संवेदनशीलता (अंक 2 missing) कम है।",
        "4": "केवल व्यावहारिक-भौतिक मानसिकता सक्रिय है। आप संरचना और प्रणालियों के संदर्भ में सोचते हैं लेकिन भावनात्मक गहराई की कमी है।",
        "9": "मानसिक तल की केवल मंगल ऊर्जा सक्रिय है। मजबूत ड्राइव और महत्वाकांक्षा है लेकिन योजना बनाने और भावनात्मक जागरूकता में संघर्ष होता है।",
        "2": "केवल चंद्र ऊर्जा सक्रिय है। भावनात्मक रूप से बुद्धिमान हैं लेकिन बड़े लक्ष्यों के लिए आवश्यक बौद्धिक आक्रामकता और योजना कौशल की कमी है।"
      },
      emotional: {
        "3,7": "आध्यात्मिक और संचारी संतुलन मौजूद है, लेकिन निर्णय लेने और अनुकूलनशीलता (अंक 5 missing) में भ्रम पैदा हो सकता है।",
        "5,7": "बुध और केतु सक्रिय हैं — अनुकूलनशील और आध्यात्मिक, लेकिन ज्ञान, शिक्षण क्षमता और वित्तीय भाग्य (अंक 3 missing) की कमी है।",
        "3,5": "अभिव्यंजक और गतिशील संचार (गुरु + बुध) मौजूद है, लेकिन आध्यात्मिक गहराई और आत्मनिरीक्षण (अंक 7 missing) कमजोर है।",
        "3": "केवल गुरु ऊर्जा सक्रिय है। आप अभिव्यंजक और दार्शनिक हैं लेकिन केतु के आध्यात्मिक अलगाव और अनुकूलनशीलता की कमी है।",
        "5": "केवल Mercury ऊर्जा सक्रिय है। तेज-तर्रार हैं लेकिन गुरु के ज्ञान और केतु के शांत आत्मनिरीक्षण के बिना भावनात्मक अस्थिरता आ सकती है।",
        "7": "केवल केतु ऊर्जा सक्रिय है। आप गहराई से आध्यात्मिक हैं लेकिन इस आंतरिक ज्ञान को बाहरी दुनिया में संप्रेषित करने या अनुकूलित करने में संघर्ष करते हैं।"
      },
      practical: {
        "1,6": "मजबूत नेतृत्व और व्यक्तिगत आकर्षण है, लेकिन धैर्य, अनुशासन और दीर्घकालिक दृढ़ता (अंक 8 missing) कमजोर है।",
        "8,6": "अनुशासित और कलात्मक हैं, लेकिन आत्मविश्वास, अधिकार और आत्म-जोर (अंक 1 missing) कमजोर है।",
        "8,1": "शक्तिशाली अनुशासन और नेतृत्व है, लेकिन रिश्तों, विलासिता और सौंदर्य बोध (अंक 6 missing) की कमी है।",
        "8": "Saturn's discipline is active. You work hard but lack leadership confidence (1) and relationship skills (6) for full success.",
        "1": "Sun's leadership is active. Natural leader but lacks Saturn's perseverance and Venus's charm and relationship skills.",
        "6": "Venus's harmony is active. Creative and relationship-oriented but lacks drive (1) and discipline (8) for material success."
      },
      left: {
        "4,8": "व्यवस्थित और दृढ़ हैं, लेकिन आशावाद, ज्ञान और रचनात्मक विचार (अंक 3 missing) कमजोर है।",
        "3,8": "रचनात्मक और दृढ़ हैं, लेकिन संगठनात्मक क्षमता और स्थिरता (अंक 4 missing) कमजोर है।",
        "3,4": "आदर्शवादी और व्यवस्थित हैं, लेकिन सहनशक्ति और भौतिक अभिव्यक्ति (अंक 8 missing) कमजोर है।",
        "4": "केवल राहु की संगठनात्मक ऊर्जा सक्रिय है — व्यवस्थित लेकिन पूर्ण परिणामों के लिए पर्याप्त रचनात्मक या दृढ़ नहीं।",
        "3": "केवल गुरु की रचनात्मकता सक्रिय है — विचारों से भरे हुए लेकिन उन्हें फल देने के लिए संरचना और अनुशासन की कमी है।",
        "8": "केवल शनि की दृढ़ता सक्रिय है — मेहनती लेकिन रचनात्मक विचारों या संरचनात्मक योजनाओं के बिना प्रयास गलत दिशा में जा सकता है।"
      },
      middle: {
        "9,1": "मजबूत ड्राइव और नेतृत्व है, लेकिन बदलती परिस्थितियों में लचीलेपन और अनुकूलनशीलता (अंक 5 missing) की कमी है।",
        "5,1": "अनुकूलनशील और आश्वस्त हैं, लेकिन प्रतिस्पर्धी ड्राइव और मुखरता (अंक 9 missing) कमजोर है।",
        "9,5": "गतिशील और अनुकूलनशील हैं, लेकिन आत्मविश्वास और अधिकार (अंक 1 missing) कमजोर है।",
        "9": "केवल मंगल सक्रिय है — अत्यधिक प्रेरित लेकिन बुध और सूर्य के बिना अनुकूलनशीलता और आत्म-दिशा में संघर्ष करते हैं।",
        "5": "केवल बुध सक्रिय है — अत्यधिक अनुकूलनशील और संचारी, लेकिन साहसिक नेतृत्व के लिए आवश्यक ड्राइव और आत्मविश्वास की कमी है।",
        "1": "केवल सूर्य सक्रिय है — पहचान में आश्वस्त हैं लेकिन लचीली सफलता के लिए आवश्यक ड्राइव और अनुकूलनशीलता की कमी है।"
      },
      right: {
        "2,6": "भावनेशनल रूप से देखभाल करने वाले और सामंजस्यपूर्ण हैं, लेकिन आध्यात्मिक गहराई और आत्मनिरीक्षण (अंक 7 missing) कमजोर है।",
        "7,6": "आध्यात्मिक और कलात्मक हैं, लेकिन भावनात्मक तालमेल और लोगों को समझने की कला (अंक 2 missing) कमजोर है।",
        "2,7": "अंतर्ज्ञानी और आध्यात्मिक हैं, लेकिन प्रेम जीवन, कलात्मक अभिव्यक्ति और घरेलू सद्भाव (अंक 6 missing) कमजोर है।",
        "2": "केवल चंद्र सक्रिय है — भावनात्मक रूप से संवेदनशील और सहज, लेकिन आध्यात्मिक गहराई और कलात्मक अभिव्यक्ति की कमी है।",
        "7": "केवल केतु सक्रिय है — आध्यात्मिक रूप से झुके हुए लेकिन भावनात्मक गर्मजोशी और संबंध सद्भाव से कटे हुए।",
        "6": "केवल शुक्र सक्रिय है — स्नेही और कलात्मक, लेकिन अच्छी संवेदनशीलता के लिए आवश्यक अंतर्ज्ञान (2) और आध्यात्मिक गहराई (7) की कमी है।"
      }
    };
    
    const planePartials = partialMap[key] || {};
    return planePartials[presentStr] || plane.interpretation;
  };

  // Custom font loading for proper Hindi/Devanagari rendering
  try {
    const fontRegular = await fetchFontAsBase64("https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf");
    const fontBold = await fetchFontAsBase64("https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf");

    if (fontRegular && fontBold) {
      doc.addFileToVFS("Poppins-Regular.ttf", fontRegular);
      doc.addFont("Poppins-Regular.ttf", "Poppins", "normal");
      doc.addFileToVFS("Poppins-Bold.ttf", fontBold);
      doc.addFont("Poppins-Bold.ttf", "Poppins", "bold");

      const originalSetFont = doc.setFont;
      doc.setFont = function(fontName, fontStyle, fontWeight) {
        let resolvedFont = fontName;
        if (fontName === 'helvetica' || fontName === 'Helvetica') {
          resolvedFont = 'Poppins';
        }
        let resolvedStyle = fontStyle;
        if (fontStyle === 'italic') {
          resolvedStyle = 'normal';
        } else if (fontStyle === 'bolditalic') {
          resolvedStyle = 'bold';
        }
        return originalSetFont.call(doc, resolvedFont, resolvedStyle, fontWeight);
      };
    }
  } catch (err) {
    console.warn("Failed to load Poppins fonts dynamically, falling back to Helvetica:", err);
  }


  
  const reportData = clientData.report || clientData;
  const rawDob = clientData.dob || "";
  const phone = clientData.phone || "-";
  const gender = clientData.gender || "male";

  // ── Dynamic core number calculations ──────────────────────────────────
  // Mulank  : sum of DAY digits only        e.g. 17 → 1+7 = 8
  // Bhagyank: sum of ALL DOB digits         e.g. 17-04-1972 → 31 → 4
  // Kua     : year digit sum → 11-sum (male) / 4+sum (female), reduced
  const mulank   = calcMulank(rawDob);
  const bhagyank = calcBhagyank(rawDob);
  const kuaNum   = calculateKua(rawDob, gender);

  // Dynamic lucky elements (fully calculated from bhagyank, mulank, kuaNum)
  const luckyData = getLuckyElements(bhagyank, mulank, kuaNum);

  // Dynamic mobile number compatibility insights (Bug 3 fix: pass mulank AND bhagyank)
  const mobileData = getMobileAnalysis(phone, mulank, bhagyank);

  // Dynamic name number compatibility insights
  const nameCompatData = getNameCompatibilityAnalysis(clientData.name || '', mulank, bhagyank);

  // Dynamic professional & career outlook insights
  const careerData = getCareerOutlook(mulank, bhagyank);

  // NEW: Strict planetary matrix mobile & name checks (client spec)
  const mobileCheck = getMobileCompatibilityCheck(phone, mulank, bhagyank, rawDob);
  const nameNumerologyCheck = getNameNumerologyCheck(clientData.name || '', mulank, bhagyank);

  // NEW: Foreign Settlement, Marriage Type
  const foreignSettlement = getForeignSettlement(rawDob, mulank, bhagyank);
  const marriageType = getMarriageType(rawDob, mulank, bhagyank);

  // NEW: Match Making (from report.matchMaking if consultant filled it)
  const reportObj = clientData.report || clientData;
  const clientGenderForPDF = clientData.gender || 'male';
  const clientNameForPDF = clientData.name || '';
  const clientDobForPDF = rawDob || '';
  const spouseNameForPDF = clientData.spouseName || '';
  const clientIsFemaleForPDF = clientGenderForPDF === 'female';

  const mmRaw = {
    male: {
      name: reportObj.matchMaking?.male?.name || (clientIsFemaleForPDF ? (spouseNameForPDF || 'Partner Name Not Added') : clientNameForPDF),
      dob: reportObj.matchMaking?.male?.dob || (clientIsFemaleForPDF ? '1971-07-27' : clientDobForPDF)
    },
    female: {
      name: reportObj.matchMaking?.female?.name || (clientIsFemaleForPDF ? clientNameForPDF : (spouseNameForPDF || 'Partner Name Not Added')),
      dob: reportObj.matchMaking?.female?.dob || (clientIsFemaleForPDF ? clientDobForPDF : '1976-05-12')
    }
  };
  let mmResult = null;
  const hasPartnerName = mmRaw?.male?.name && mmRaw?.female?.name &&
                         mmRaw.male.name !== 'Partner Name Not Added' &&
                         mmRaw.female.name !== 'Partner Name Not Added';
  if (hasPartnerName && mmRaw?.male?.dob && mmRaw?.female?.dob) {
    const mMulank = calcMulank(mmRaw.male.dob);
    const mBhagyank = calcBhagyank(mmRaw.male.dob);
    const fMulank = calcMulank(mmRaw.female.dob);
    const fBhagyank = calcBhagyank(mmRaw.female.dob);
    const mGrid = calculateLoShuGrid(mmRaw.male.dob, [mMulank, mBhagyank]);
    const fGrid = calculateLoShuGrid(mmRaw.female.dob, [fMulank, fBhagyank]);
    const mPresent = [...new Set(mGrid.flatMap((cnt, i) => cnt > 0 ? [i + 1] : []))];
    const fPresent = [...new Set(fGrid.flatMap((cnt, i) => cnt > 0 ? [i + 1] : []))];
    mmResult = getMatchMaking(
      { name: mmRaw.male.name, mulank: mMulank, bhagyank: mBhagyank, grid: mPresent },
      { name: mmRaw.female.name, mulank: fMulank, bhagyank: fBhagyank, grid: fPresent }
    );
    mmResult.maleName = mmRaw.male.name;
    mmResult.femaleName = mmRaw.female.name;
  }

  // Helper: build the display breakdown string for Mulank
  const mulankBreakdown = (() => {
    if (!rawDob) return "";
    const day = rawDob.split("-")[2] || "";
    return day.split("").join("+") + " = " + mulank;
  })();

  // Helper: build the display breakdown string for Bhagyank
  const bhagyankBreakdown = (() => {
    if (!rawDob) return "";
    const digits = rawDob.replace(/-/g, "").split("");
    return digits.join("+") + " = " + bhagyank;
  })();

  // Helper: build the display breakdown string for Kua
  const kuaBreakdown = (() => {
    if (!rawDob) return "";
    const yearStr = rawDob.split("-")[0] || "";
    const yearSum = yearStr.split("").reduce((a, d) => a + parseInt(d), 0);
    if (gender === "female") {
      return `4 + ${yearSum} = ${kuaNum}`;
    } else {
      return `11 - ${yearSum} = ${kuaNum}`;
    }
  })();

  // Format date of birth to DD-MM-YYYY dynamically
  let formattedDob = rawDob;
  if (rawDob.includes("-")) {
    const parts = rawDob.split("-");
    if (parts.length === 3) {
      formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // Helper function to replace unicode stars with standard text representations for PDF compatibility
  const cleanStars = (str) => {
    if (!str) return "";
    return str
      .replace(/★★★★★/g, "5/5 Stars")
      .replace(/★★★☆☆/g, "3/5 Stars")
      .replace(/★☆☆☆☆/g, "1/5 Stars")
      .replace(/★/g, "")
      .replace(/☆/g, "");
  };

  // Current Date in DD-MM-YYYY
  const today = new Date();
  const reportDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  // Pre-compute new analysis data
  // Full Lo Shu Grid including Mulank, Bhagyank & Kua digits (Bug 2 fix / client spec)
  const loShuGridEarly = calculateLoShuGrid(rawDob, [mulank, bhagyank, kuaNum]);

  // 1. Chaldean Compatibility between Mulank & Bhagyank
  const compatibilityAnalysis = getNumberCompatibilityAnalysis(mulank, bhagyank);

  // 2. Hidden Influences based on Lo Shu planes (partial presence logic)
  const hiddenInfluences = getHiddenInfluences(loShuGridEarly);

  // 3. Personal Year data for current year
  const personalYearNum = calcPersonalYearForYear(rawDob, today.getFullYear());
  const personalYearInfo = getPersonalYearData(personalYearNum);

  // 4. Five-Year Personal Year Predictions
  const fiveYearPredictions = Array.from({ length: 5 }, (_, i) => {
    const yr = today.getFullYear() + i;
    const pyNum = calcPersonalYearForYear(rawDob, yr);
    const pyInfo = getPersonalYearData(pyNum);
    return { year: yr, personalYear: pyNum, title: pyInfo.title, theme: pyInfo.theme };
  });



  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load assets asynchronously (swap so firstp2Img is Ganesha, firstp1Img is Wheel)
  const [ganeshaImg, wheelImg, lastPageGraphic, ganeshaMantra] = await Promise.all([
    loadImage(firstp2Img), // Ganesha (firstp2)
    loadImage(firstp1Img), // Wheel (Firstp1)
    loadImage(lastPageImg),
    loadImage(ganeshaMantraImg)
  ]);

  // Color theme variables (gradient ivory/pastel aesthetic)
  const peachBg = [252, 246, 238];     // Ivory base
  const ivoryMid = [249, 240, 228];    // Slightly deeper ivory
  const goldPrimary = [181, 130, 10];   // Luxury gold #b5820a
  const textDark = [61, 44, 30];       // Rich brown text
  const textMuted = [140, 111, 88];     // Muted label brown
  const greenText = [26, 128, 46];     // Vibrant green for "Thank You,"

  // Helper: Draw background gradient + watermark + border on each page
  const drawPageShell = (doc, skipWatermark = false) => {
    // Gradient pastel & ivory background
    doc.setFillColor(...peachBg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(...ivoryMid);
    doc.rect(0, pageHeight * 0.6, pageWidth, pageHeight * 0.4, "F");

    // Standard Gold Border with Elegant Corner Elements
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.4);
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12);
    
    doc.setLineWidth(1.2);
    // Top-left corner
    doc.line(6, 6, 16, 6);
    doc.line(6, 6, 6, 16);
    // Top-right corner
    doc.line(pageWidth - 16, 6, pageWidth - 6, 6);
    doc.line(pageWidth - 6, 6, pageWidth - 6, 16);
    // Bottom-left corner
    doc.line(6, pageHeight - 16, 6, pageHeight - 6);
    doc.line(6, pageHeight - 6, 16, pageHeight - 6);
    // Bottom-right corner
    doc.line(pageWidth - 6, pageHeight - 16, pageWidth - 6, pageHeight - 6);
    doc.line(pageWidth - 16, pageHeight - 6, pageWidth - 6, pageHeight - 6);

    // Light shed watermark: Shining Ank Vastu (using elegant visible gold/ivory tint)
    if (!skipWatermark) {
      doc.setFont("helvetica", "bold");
      const wmFontSize = 46;
      doc.setFontSize(wmFontSize);
      doc.setTextColor(205, 195, 178); // More visible soft gold/ivory color

      const wmText = "Shining Ank Vastu";
      const scale = doc.internal.scaleFactor;
      const w = (doc.getStringUnitWidth(wmText) * wmFontSize) / scale;
      const h = wmFontSize / scale;

      const cx = pageWidth / 2;
      const cy = pageHeight / 2;

      // Centering calculations for rotated text (45 degrees)
      const angleRad = Math.PI / 4;
      const cosAngle = Math.cos(angleRad);
      const sinAngle = Math.sin(angleRad);

      const x = cx - ((w - h) / 2) * cosAngle;
      const y = cy + ((w + h) / 2) * sinAngle;

      doc.text(wmText, x, y, { angle: 45 });
    }
  };

  // Helper: Universal Footer
  const drawFooter = (doc) => {
    const pWidth = doc.internal.pageSize.getWidth();
    const pHeight = doc.internal.pageSize.getHeight();

    // Draw horizontal line
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.25);
    doc.line(6, pHeight - 18, pWidth - 6, pHeight - 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 58, 46); // Shining Ank Vastu brand dark green/teal
    doc.text(t("Shining Ank Vastu - M : 9913961553", "शाइनिंग अंक वास्तु - मो : 9913961553"), pWidth / 2, pHeight - 13, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(t("Align Your Numbers, Transform Your Life", "अपने अंकों को संरेखित करें, अपने जीवन को बदलें"), pWidth / 2, pHeight - 9, { align: "center" });
  };

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER PAGE
  // ════════════════════════════════════════════════════════════════════════
  drawPageShell(doc, true);

  // 1. Lord Ganesha Image (Top Center)
  if (ganeshaImg) {
    // 35mm wide, 35mm high, perfectly centered square (y shifted from 12 to 15)
    doc.addImage(ganeshaImg, "PNG", (pageWidth - 35) / 2, 15, 35, 35);
  }

  // Ganesha Mantra in Hindi centered below Ganesha image
  if (ganeshaMantra) {
    // 35mm wide, 8.5mm high, perfectly centered horizontally
    doc.addImage(ganeshaMantra, "PNG", (pageWidth - 35) / 2, 51.5, 35, 8.5);
  }

  // Brand Name above the wheel image (y shifted from 52 to 65)
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Shining Ank Vastu", 55.5, 65, { align: "center" });

  // Circular Wheel Graphic on Left column (centered at x = 55.5, size 80x80, y shifted from 58 to 75)
  if (wheelImg) {
    doc.addImage(wheelImg, "PNG", 15.5, 75, 80, 80);
  }

  // Middle vertical line separator (y shifted from 62-142 to 78-158)
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.6);
  doc.line(105, 78, 105, 158);

  // Right column dynamic metadata
  let textX = 110;
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(t("REPORT PREPARED FOR:", "रिपोर्ट तैयार की गई:"), textX, 88);

  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(16);
  doc.text(clientData.name || t("Client Name", "ग्राहक का नाम"), textX, 98);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${t("DATE OF BIRTH", "जन्म तिथि")}: ${formattedDob}`, textX, 110);

  // Prepared by block
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(12);
  doc.text(t("Prepared by:", "तैयारकर्ता:"), textX, 130);
  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(13);
  doc.text(t("Mr. Veren Misstry", "श्री वेरेन मिस्त्री"), textX, 136);
  doc.setFontSize(11);
  doc.text(t("Numerologist", "अंकशास्त्री"), textX, 141);

  // Brand Name & Contact removed from right column to avoid duplication

  // Wheel Title & Date (Bottom left column area, centered at x = 55.5, y shifted down)
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.text(t("Crown Lifepath Report", "क्राउन लाइफपाथ रिपोर्ट"), 55.5, 168, { align: "center" });

  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(11);
  doc.text(`${t("Report Date", "रिपोर्ट की तारीख")}: ${reportDate}`, 55.5, 174, { align: "center" });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2: BIRTH CHART OVERVIEW & CORE PERSONALITY INSIGHTS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section Header
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("BIRTH CHART OVERVIEW", "जन्म कुंडली अवलोकन"), 14, 27);

  // Use full grid (with Mulank/Bhagyank/Kua) for PDF too
  const loShuGrid = calculateLoShuGrid(rawDob, [mulank, bhagyank, kuaNum]);
  const gridSize = 22;
  const gridStartX = 25;
  const gridStartY = 42;
  const gridLayout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.4);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const num = gridLayout[i][j];
      const count = loShuGrid[num - 1];
      const x = gridStartX + j * gridSize;
      const y = gridStartY + i * gridSize;

      // Draw blank square border
      doc.rect(x, y, gridSize, gridSize, "D");
      
      // If present in DOB, draw pastel yellow background and show repeated digits
      if (count > 0) {
        doc.setFillColor(254, 249, 231); 
        doc.rect(x, y, gridSize, gridSize, "F");
        doc.rect(x, y, gridSize, gridSize, "D"); // Redraw border over fill
        
        const cellValue = String(num).repeat(count);
        // Adjust font size dynamically to fit repeated digits inside the cell
        let fontSize = 15;
        if (count === 2) fontSize = 13.5;
        else if (count === 3) fontSize = 11.5;
        else if (count >= 4) fontSize = 9.5;
        
        doc.setFontSize(fontSize);
        doc.setTextColor(...goldPrimary);
        doc.setFont("helvetica", "bold");
        doc.text(cellValue, x + gridSize / 2, y + gridSize / 2 + (fontSize * 0.25), { align: "center" });
      }
    }
  }

  const sideX = 104;
  const presentNums = getPresentNumbers(loShuGrid).map(n => n.num).join(", ");
  const missingNums = getMissingNumbers(loShuGrid).join(", ");
  
  const repeats = getRepeatedNumbers(loShuGrid);
  const repeatsStr = repeats.length > 0 
    ? repeats.map(r => `${r.num} (${r.strength})`).join(", ") 
    : t("None", "कोई नहीं");

  const arrows = getArrows(loShuGrid);
  const posArrowsStr = arrows.positive.length > 0 
    ? arrows.positive.map(a => a.split(" (")[0]).join(", ") 
    : t("None", "कोई नहीं");
  const negArrowsStr = arrows.negative.length > 0 
    ? arrows.negative.map(a => a.split(" (")[0]).join(", ") 
    : t("None", "कोई नहीं");

  // Calculate wrapped lines and height dynamically to prevent overflow
  const getLineHeight = (val, labelOffset) => {
    const lines = doc.splitTextToSize(val, pageWidth - (sideX + 6 + labelOffset) - 18);
    return (lines.length * 4.5) + 3.5;
  };

  let totalTextHeight = 14; // start offset + title padding
  totalTextHeight += getLineHeight(presentNums || t("None", "कोई नहीं"), 26);
  totalTextHeight += getLineHeight(missingNums || t("None", "कोई नहीं"), 26);
  totalTextHeight += getLineHeight(repeatsStr, 28);
  totalTextHeight += getLineHeight(posArrowsStr, 25);
  totalTextHeight += getLineHeight(negArrowsStr, 26);
  totalTextHeight += 8; // Kua details height + padding + safety margin

  const sideCardHeight = Math.max(gridSize * 3, totalTextHeight);

  // Side summary box (ivory background card)
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(sideX, gridStartY, pageWidth - sideX - 15, sideCardHeight, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(sideX, gridStartY, pageWidth - sideX - 15, sideCardHeight, 3, 3, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text(t("GRID HIGHLIGHTS", "ग्रिड मुख्य बिंदु"), sideX + 6, gridStartY + 8);

  let currY = gridStartY + 14;
  const drawLine = (label, val, labelOffset) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.setFontSize(8.2);
    doc.text(label, sideX + 6, currY);
    
    doc.setFont("helvetica", "bold");
    const lines = doc.splitTextToSize(val, pageWidth - (sideX + 6 + labelOffset) - 18);
    doc.text(lines, sideX + 6 + labelOffset, currY);
    currY += (lines.length * 4.5) + 3.5;
  };

  drawLine(t("Present Numbers: ", "उपस्थित अंक: "), presentNums || t("None", "कोई नहीं"), 26);
  drawLine(t("Missing Numbers: ", "लापता अंक: "), missingNums || t("None", "कोई नहीं"), 26);
  drawLine(t("Repeated Numbers: ", "दोहराए गए अंक: "), repeatsStr, 28);
  drawLine(t("Positive Arrows: ", "सकारात्मक तीर: "), posArrowsStr, 25);
  drawLine(t("Negative Arrows: ", "नकारात्मक तीर: "), negArrowsStr, 26);
  
  // Kua Vastu direction (Issue 7 fix: use getKuaVastuData for correct direction)
  const kuaVastuInfo = getKuaVastuData(kuaNum);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textDark);
  doc.setFontSize(8.2);
  doc.text(t("Kua Details: ", "कुआ विवरण: "), sideX + 6, currY);
  doc.setFont("helvetica", "bold");
  doc.text(`${kuaNum} (${t("Direction", "दिशा")}: ${kuaVastuInfo.direction})`, sideX + 24, currY);

  // Section 2: Core Personality Insights
  const coreY = gridStartY + sideCardHeight + 15;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, coreY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("CORE PERSONALITY INSIGHTS", "मूल व्यक्तित्व अंतर्दृष्टि"), 14, coreY + 7);

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, coreY + 16, pageWidth - 30, 48, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, coreY + 16, pageWidth - 30, 48, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${t("Analysis for", "विश्लेषण")}: ${clientData.name || t("Native", "जातक")}:`, 20, coreY + 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const pText = reportData.personalityAnalysis?.content || t("You are highly intuitive, emotionally rich, and creative. The balance of your cosmic grid suggests a strong potential to convert dreams into practical reality. You easily gain respect from peers and maintain high spiritual insights.", "आप अत्यधिक सहज, भावनात्मक रूप से समृद्ध और रचनात्मक हैं। आपके ब्रह्मांडीय ग्रिड का संतुलन सपनों को व्यावहारिक वास्तविकता में बदलने की एक मजबूत क्षमता का सुझाव देता है। आप आसानी से साथियों से सम्मान प्राप्त करते हैं और उच्च आध्यात्मिक अंतर्दृष्टि बनाए रखते हैं।");
  const pLines = doc.splitTextToSize(pText, pageWidth - 42);
  doc.text(pLines, 20, coreY + 31);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3: MULANK-BHAGYANK ALIGNMENT & YOGAS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section Header
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("MULANK – BHAGYANK ALIGNMENT & ITS MEANING", 14, 27);

  // ── Dynamic traits based on calculated mulank / bhagyank ──────────────
  const mulankTraits = reportData.lifePathTraits || {};
  const bhagyankTraits = reportData.expressionTraits || {};

  // Mulank Box (Left Column) — date digits only
  doc.setFillColor(254, 249, 231); // Pastel yellow card
  doc.roundedRect(15, 38, 85, 68, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 38, 85, 68, 3, 3, "D");

  doc.setFillColor(...goldPrimary);
  doc.circle(57.5, 52, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(String(mulank), 57.5, 55, { align: "center" });

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("Mulank", "मूलांक"), 57.5, 68, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...goldPrimary);
  doc.text(`${t("Planet", "ग्रह")}: ${isHi ? getPlanetTranslation(mulankTraits.planet || "Sun") : (mulankTraits.planet || "Sun")}`, 20, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const mulLines = doc.splitTextToSize(mulankTraits.desc || t("Represents leadership qualities, innovation, independent thought process, and primary life focus.", "नेतृत्व गुण, नवाचार, स्वतंत्र विचार प्रक्रिया और प्राथमिक जीवन फोकस का प्रतिनिधित्व करता है।"), 76);
  doc.text(mulLines, 20, 84);

  // Bhagyank Box (Right Column) — all DOB digits
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(pageWidth - 100, 38, 85, 68, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth - 100, 38, 85, 68, 3, 3, "D");

  doc.setFillColor(...goldPrimary);
  doc.circle(pageWidth - 57.5, 52, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(String(bhagyank), pageWidth - 57.5, 55, { align: "center" });

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("Bhagyank", "भाग्यांक"), pageWidth - 57.5, 68, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...goldPrimary);
  doc.text(`${t("Planet", "ग्रह")}: ${isHi ? getPlanetTranslation(bhagyankTraits.planet || "Moon") : (bhagyankTraits.planet || "Moon")}`, pageWidth - 95, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const bhagLines = doc.splitTextToSize(bhagyankTraits.desc || t("Represents dynamic action, relationship handling, and how your inner potential converts to tangible actions.", "गतिशील कार्रवाई, संबंध प्रबंधन का प्रतिनिधित्व करता है, और यह दर्शाता है कि आपकी आंतरिक क्षमता कैसे ठोस कार्यों में बदलती है।"), 76);
  doc.text(bhagLines, pageWidth - 95, 84);

  // ── Kua Number box (below the two main boxes, centered) ──────────────
  const kuaBoxY = 112;
  doc.setFillColor(234, 245, 255); // soft blue for kua
  doc.roundedRect(pageWidth / 2 - 35, kuaBoxY, 70, 18, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2 - 35, kuaBoxY, 70, 18, 3, 3, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${t("KUA NUMBER", "कुआ नंबर")}: ${kuaNum}`, pageWidth / 2, kuaBoxY + 10, { align: "center" });

  // Section 4: Hidden Influences of Yogas (Dynamic — all 6 planes with partial logic)
  const yogY = 136;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, yogY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("SECRET POWER OF LO SHU PLANES", "लो शु तल की गुप्त शक्ति"), 14, yogY + 7);

  // Show first 4 planes on Page 3 (3 horizontal + first vertical)
  const pagePlanes = hiddenInfluences.slice(0, 4);
  let planeY = yogY + 16;
  pagePlanes.forEach(plane => {
    const statusLabel = plane.isActive ? t("FULLY ACTIVE", "पूर्ण सक्रिय") : plane.isInactive ? t("ABSENT", "अनुपस्थित") : t("PARTIAL", "आंशिक सक्रिय");
    const bgColor = plane.isActive ? [234, 248, 240] : plane.isInactive ? [253, 234, 234] : [254, 249, 231];
    const borderWidth = plane.isActive ? 0.4 : 0.15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const planeInterp = getPlaneInterpretation(plane);
    const interpLines = doc.splitTextToSize(planeInterp, pageWidth - 42);
    const cardHeight = 8 + interpLines.length * 5;

    doc.setFillColor(...bgColor);
    doc.roundedRect(15, planeY, pageWidth - 30, cardHeight, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(borderWidth);
    doc.roundedRect(15, planeY, pageWidth - 30, cardHeight, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${translatePlaneName(plane.key)} — ${statusLabel}`, 20, planeY + 5.5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(interpLines, 20, planeY + 11);

    planeY += cardHeight + 3.5;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 4: REPEATING NUMBERS, EFFECTS OF MISSING NUMBERS & REMEDIES
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("EFFECT OF REPEATING NUMBERS", "दोहराए गए अंकों का प्रभाव"), 14, 27);

  let repY = 36;
  const repeated = reportData.repeatedNumbersAnalysis || [];
  if (repeated.length === 0) {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, repY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(t("No numbers are repeated in your Date of Birth. This brings a very balanced and single-frequency energy vibration to your planes.", "आपकी जन्म तिथि में कोई भी अंक दोहराया नहीं गया है। यह आपके तलों में एक बहुत ही संतुलित और एकल-आवृत्ति ऊर्जा कंपन लाता है।"), 20, repY + 10);
    repY += 22;
  } else {
    repeated.forEach(item => {
      doc.setFillColor(254, 249, 231); // light yellow
      doc.roundedRect(15, repY, pageWidth - 30, 13, 2, 2, "F");
      doc.setDrawColor(...goldPrimary);
      doc.setLineWidth(0.25);
      doc.roundedRect(15, repY, pageWidth - 30, 13, 2, 2, "D");

      doc.setTextColor(...goldPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${t("Number", "अंक")} ${item.num} ${t("repeated", "दोहराया गया")} ${item.count} ${t("times:", "बार:")}`, 20, repY + 5);

      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(item.influence || t("Enhances the qualities of this number significantly.", "इस संख्या के गुणों को महत्वपूर्ण रूप से बढ़ाता है।"), 20, repY + 9);
      repY += 15.5;
    });
  }

  // Section 6 & 7: Effects of Missing Numbers & Personalized Remedies
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, repY + 4, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("EFFECTS OF MISSING NUMBERS & PERSONALIZED REMEDIES", "लापता अंक और व्यक्तिगत उपाय"), 14, repY + 11);

  let remY = repY + 20;
  const missingArr = getMissingNumbers(loShuGrid);
  
  // Issue 8 fix: Show ALL missing numbers using dynamic getMissingNumberRemedyData
  if (missingArr.length === 0) {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, remY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(t("Congratulations! Your Lo Shu Grid contains no missing numbers. You have a highly cohesive primary energy spectrum.", "बधाई हो! आपके लो शु ग्रिड में कोई भी लापता अंक नहीं है। आपके पास एक अत्यधिक सुसंगत प्राथमिक ऊर्जा स्पेक्ट्रम है।"), 20, remY + 10);
  } else {
    missingArr.forEach(num => {
      const remInfo = getMissingNumberRemedyData(num);

      // Handle arrays of effects/remedies if available, else split string by newline
      const effectsList = remInfo.effectsList || (remInfo.effects || "").split("\n").map(e => e.replace(/^•\s*/, ""));
      const remediesList = remInfo.remediesList || (remInfo.crystal || "").split("\n").map(r => r.replace(/^•\s*/, ""));

      // Set active font to helvetica normal size 8.2 for splitTextToSize calculations
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);

      const wrappedEffects = [];
      effectsList.forEach(eff => {
        const lines = doc.splitTextToSize(`• ${eff}`, pageWidth - 46);
        wrappedEffects.push(lines);
      });

      const wrappedRemedies = [];
      remediesList.forEach(rem => {
        const lines = doc.splitTextToSize(`• ${rem}`, pageWidth - 46);
        wrappedRemedies.push(lines);
      });

      // Calculate total text lines to size the card dynamically
      const totalEffectsLines = wrappedEffects.reduce((acc, lines) => acc + lines.length, 0);
      const totalRemediesLines = wrappedRemedies.reduce((acc, lines) => acc + lines.length, 0);

      // Height: Header title (9.5) + "EFFECT:" title (5.5) + effects lines + "REMEDIES:" title (5.5) + remedies lines + padding
      const cardH = 9.5 + 5.5 + (totalEffectsLines * 4.2) + 5.5 + (totalRemediesLines * 4.2) + 7;

      // Guard: add new page if content overflows
      if (remY + cardH > pageHeight - 25) {
        doc.addPage();
        drawPageShell(doc);
        drawFooter(doc);
        remY = 25;
      }

      doc.setFillColor(253, 234, 234); // Pastel pink card
      doc.roundedRect(15, remY, pageWidth - 30, cardH, 3, 3, "F");
      doc.setDrawColor(...goldPrimary);
      doc.setLineWidth(0.25);
      doc.roundedRect(15, remY, pageWidth - 30, cardH, 3, 3, "D");

      // Draw title
      doc.setTextColor(...goldPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(`${t("Missing Number", "लापता अंक")} ${num} (${isHi ? getPlanetTranslation(remInfo.planet) : remInfo.planet})`, 20, remY + 6.5);

      let textY = remY + 11.5;

      // EFFECT section
      doc.setTextColor(197, 34, 31); // Reddish text for effect heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(t("EFFECT:", "प्रभाव:"), 20, textY);
      textY += 4.2;

      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      wrappedEffects.forEach(lines => {
        doc.text(lines, 20, textY);
        textY += lines.length * 4.2;
      });

      // REMEDIES section
      textY += 1.5;
      doc.setTextColor(19, 115, 51); // Greenish text for remedies heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(t("REMEDIES:", "उपाय:"), 20, textY);
      textY += 4.2;

      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      wrappedRemedies.forEach(lines => {
        doc.text(lines, 20, textY);
        textY += lines.length * 4.2;
      });

      remY += cardH + 4;
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 5: PROFESSIONAL & CAREER OUTLOOK & NAME COMPATIBILITY
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section 8
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("PROFESSIONAL & CAREER OUTLOOK", "व्यावसायिक एवं करियर दृष्टिकोण"), 14, 27);

  // 1. Compatibility Matrix
  let careerY = 36;
  doc.setFillColor(243, 246, 252);
  doc.roundedRect(15, careerY, pageWidth - 30, 22, 2, 2, "F");
  doc.setDrawColor(173, 193, 230);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, careerY, pageWidth - 30, 22, 2, 2, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  // Translate compatibility status
  const getCompatStatusTranslation = (status) => {
    const statusMap = {
      "Highly Compatible": "उच्च संगत",
      "Compatible": "संगत",
      "Neutral": "तटस्थ",
      "Challenging": "चुनौतीपूर्ण",
      "Non-Friendly": "गैर-अनुकूल",
      "Friendly": "अनुकूल"
    };
    return statusMap[status] || status;
  };
  doc.text(`${t("Combination", "संयोजन")} ${mulank}-${bhagyank} ${t("Connection", "संबंध")}: ${isHi ? getCompatStatusTranslation(careerData.compatibilityStatus) : careerData.compatibilityStatus}`, 20, careerY + 6);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const esotericLines = doc.splitTextToSize(`${t("Esoteric Insight", "रहस्यमय अंतर्दृष्टि")}: ${careerData.esotericReason}`, pageWidth - 42);
  doc.text(esotericLines, 20, careerY + 11);
  
  careerY += 26;

  // 2. Workstyle
  const workstyleLines = doc.splitTextToSize(careerData.workstyle, pageWidth - 42);
  const workstyleH = 10 + workstyleLines.length * 4.5;
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, careerY, pageWidth - 30, workstyleH, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, workstyleH, 2, 2, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(t("Impact on Workstyle", "कार्यशैली पर प्रभाव"), 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(workstyleLines, 20, careerY + 11);

  careerY += workstyleH + 4;

  // 3. Suitable Careers
  let careersH = 8;
  const suitableWrapped = careerData.topCareers.map((c, idx) => {
    const lines = doc.splitTextToSize(`${t("Field", "क्षेत्र")} ${idx + 1}: ${c.field} - ${c.explanation}`, pageWidth - 46);
    careersH += lines.length * 4.5 + 2;
    return lines;
  });

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, careerY, pageWidth - 30, careersH, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, careersH, 2, 2, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(t("Top 3 Recommended Career Fields", "शीर्ष 3 अनुशंसित करियर क्षेत्र"), 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let innerY = careerY + 11;
  suitableWrapped.forEach(lines => {
    doc.text(lines, 20, innerY);
    innerY += lines.length * 4.5 + 2;
  });

  careerY += careersH + 4;

  // 4. Careers to Avoid
  let avoidH = 8;
  const avoidWrapped = careerData.careersToAvoid.map(item => {
    const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 42);
    avoidH += lines.length * 4.5 + 1;
    return lines;
  });

  doc.setFillColor(255, 240, 240);
  doc.roundedRect(15, careerY, pageWidth - 30, avoidH, 2, 2, "F");
  doc.setDrawColor(249, 213, 213);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, avoidH, 2, 2, "D");

  doc.setTextColor(197, 34, 31);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(t("Careers to Avoid (Strict Warning)", "इन करियर से बचें (कड़ी चेतावनी)"), 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let innerAvoidY = careerY + 11;
  avoidWrapped.forEach(lines => {
    doc.text(lines, 20, innerAvoidY);
    innerAvoidY += lines.length * 4.5 + 1;
  });

  careerY += avoidH + 4;

  // 5. Golden Remedy
  const remedyLines = doc.splitTextToSize(careerData.goldenRemedy, pageWidth - 42);
  const remedyH = 10 + remedyLines.length * 4.5;

  doc.setFillColor(254, 249, 231);
  doc.roundedRect(15, careerY, pageWidth - 30, remedyH, 2, 2, "F");
  doc.setDrawColor(249, 231, 159);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, remedyH, 2, 2, "D");

  doc.setTextColor(176, 96, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(t("Golden Professional Remedy", "स्वर्णिम व्यावसायिक उपाय"), 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(remedyLines, 20, careerY + 11);

  const careerCardH = careerY + remedyH - 36;

  // Section 9: Name Number Compatibility Analysis
  let sec9StartY = 36 + careerCardH + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  const nameCompLines = doc.splitTextToSize(nameCompatData.description, pageWidth - 46);
  const cardHeight = 16 + (nameCompLines.length * 4.5) + 12; // dynamic height including headers, description height, status line, and padding
  
  if (sec9StartY + cardHeight + 20 > pageHeight - 25) {
    doc.addPage();
    drawPageShell(doc);
    drawFooter(doc);
    sec9StartY = 20;
  }

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, sec9StartY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("NAME NUMBER COMPATIBILITY ANALYSIS", "नाम अंक संगतता विश्लेषण"), 14, sec9StartY + 7);

  const sec9CardStartY = sec9StartY + 16;

  doc.setFillColor(234, 238, 252); // Pastel blue card
  doc.roundedRect(15, sec9CardStartY, pageWidth - 30, cardHeight, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, sec9CardStartY, pageWidth - 30, cardHeight, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`${t("Current Name Vibrations", "वर्तमान नाम कंपन")}: ${clientData.name || t("Native", "जातक")} (${t("Chaldean Root", "चाल्डियन मूल")}: ${nameCompatData.nameNumber})`, 20, sec9CardStartY + 7);

  // Divider line inside name card
  doc.setDrawColor(200, 210, 240);
  doc.setLineWidth(0.15);
  doc.line(18, sec9CardStartY + 10, pageWidth - 18, sec9CardStartY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  let currentTextY = sec9CardStartY + 16;
  nameCompLines.forEach(line => {
    doc.text(line, 20, currentTextY);
    currentTextY += 4.5;
  });

  const statusY = currentTextY + 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...goldPrimary);
  doc.text(`${t("Name Number Compatibility Status", "नाम अंक संगतता स्थिति")}: ${isHi ? getCompatStatusTranslation(nameCompatData.status) : nameCompatData.status}`, 20, statusY);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6: MOBILE COMPATIBILITY & 5-YEAR FUTURE PREDICTIONS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section 10
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("MOBILE NUMBER COMPATIBILITY INSIGHTS", "मोबाइल नंबर संगतता अंतर्दृष्टि"), 14, 27);

  // 1. Pre-calculate line wraps and heights to compute container height
  const descWidth = pageWidth - 66; // 144mm width
  const vibLines = mobileData.isValid ? doc.splitTextToSize(mobileData.vibrationMeaning, descWidth) : [];
  const compLines = mobileData.isValid ? doc.splitTextToSize(mobileData.compatibilityDescription, descWidth) : [];
  const zeroLines = mobileData.isValid ? doc.splitTextToSize(mobileData.zeroAnalysis, descWidth) : [];
  const lastFourText = mobileData.isValid ? (isHi ? `[${mobileData.lastFourDigits}] योग ${mobileData.lastFourSingleDigit}: ${mobileData.lastFourMeaning}` : `[${mobileData.lastFourDigits}] sum to ${mobileData.lastFourSingleDigit}: ${mobileData.lastFourMeaning}`) : "";
  const lastFourLines = mobileData.isValid ? doc.splitTextToSize(lastFourText, descWidth) : [];

  let cardH = 30; // default height if invalid
  if (mobileData.isValid) {
    const h1 = Math.max(4.5, vibLines.length * 4);
    const h2 = Math.max(4.5, compLines.length * 4);
    const h3 = Math.max(4.5, zeroLines.length * 4);
    const h4 = Math.max(4.5, lastFourLines.length * 4);
    cardH = 14 + h1 + h2 + h3 + h4 + 4; // 14mm header offset + total line heights + padding
  }

  // Draw background box for Section 10
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 35, pageWidth - 30, cardH, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 35, pageWidth - 30, cardH, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`${t("Mobile Number", "मोबाइल नंबर")}: ${phone} (${t("Sum", "योग")}: ${mobileData.totalSum} | ${t("Root", "मूलांक")}: ${mobileData.singleDigit})`, 20, 42);

  // Draw a horizontal divider line below title
  doc.setDrawColor(232, 213, 191);
  doc.setLineWidth(0.15);
  doc.line(18, 45, pageWidth - 18, 45);

  doc.setFontSize(8.5);
  let contentY = 50;

  if (mobileData.isValid) {
    // 1. Vibration
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text(t("VIBRATION:", "कंपन:"), 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(vibLines, 48, contentY);
    contentY += Math.max(4.5, vibLines.length * 4);

    // 2. Compatibility
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text(t("COMPATIBILITY:", "संगतता:"), 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(compLines, 48, contentY);
    contentY += Math.max(4.5, compLines.length * 4);

    // 3. Vastu Flow
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text(t("VASTU FLOW:", "वास्तु प्रवाह:"), 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(zeroLines, 48, contentY);
    contentY += Math.max(4.5, zeroLines.length * 4);

    // 4. Last 4 Digits
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text(t("LAST 4 DIGITS:", "अंतिम 4 अंक:"), 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(lastFourLines, 48, contentY);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textMuted);
    doc.text(t("No mobile number has been provided for this client profile.", "इस ग्राहक प्रोफ़ाइल के लिए कोई मोबाइल नंबर प्रदान नहीं किया गया है।"), 20, 52);
  }

  // Section 11: 5-Year Future Predictions (Dynamic Personal Year per calendar year)
  // Dynamically position Section 11 relative to the end of Section 10 card
  const sec11StartY = 35 + cardH + 6;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, sec11StartY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("5-YEAR PERSONAL YEAR FORECAST", "5-वर्षीय व्यक्तिगत वर्ष पूर्वानुमान"), 14, sec11StartY + 7);

  let yrY = sec11StartY + 16;
  fiveYearPredictions.forEach(pred => {
    const themeLines = doc.splitTextToSize(pred.theme, pageWidth - 58);
    const cardH = 8 + themeLines.length * 4.5;

    doc.setFillColor(254, 249, 231);
    doc.roundedRect(15, yrY, pageWidth - 30, cardH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, yrY, pageWidth - 30, cardH, 2, 2, "D");

    // Year badge
    doc.setFillColor(...goldPrimary);
    doc.roundedRect(15, yrY, 26, cardH, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${pred.year}`, 28, yrY + cardH / 2 + 1, { align: "center" });
    doc.setFontSize(7);
    doc.text(`PY ${pred.personalYear}`, 28, yrY + cardH / 2 + 5.5, { align: "center" });

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(pred.title, 44, yrY + 5.5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(themeLines, 44, yrY + 10.5);

    yrY += cardH + 3;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6b: CHALDEAN COMPATIBILITY + REMAINING LO SHU PLANES
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // ── Chaldean Number Compatibility ──────────────────────────────────────
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("CHALDEAN NUMBER COMPATIBILITY ANALYSIS", "चाल्डियन अंक संगतता विश्लेषण"), 14, 27);

  const ca = compatibilityAnalysis;
  const compatBg = ca.overallStatus === "friend"  ? [234, 248, 240] :
                   ca.overallStatus === "enemy"   ? [253, 234, 234] : [254, 249, 231];
  const compatLabel = ca.overallStatus === "friend"  ? t("HIGHLY COMPATIBLE ✓", "उच्च संगत ✓") :
                      ca.overallStatus === "enemy"   ? t("CHALLENGING — REMEDY RECOMMENDED", "चुनौतीपूर्ण — उपाय अनुशंसित") : t("NEUTRAL", "तटस्थ");
  const compatLabelColor = ca.overallStatus === "friend"  ? [0, 128, 0] :
                           ca.overallStatus === "enemy"   ? [200, 50, 50] : [...goldPrimary];

  // Two number boxes side by side
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(15, 36, 55, 36, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 36, 55, 36, 3, 3, "D");
  doc.setFillColor(...goldPrimary);
  doc.circle(42.5, 47, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(String(mulank), 42.5, 50, { align: "center" });
  doc.setTextColor(...textDark);
  doc.setFontSize(8.5);
  doc.text(t("Mulank", "मूलांक"), 42.5, 60, { align: "center" });
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(isHi ? getPlanetTranslation(ca.mulankPlanet) : ca.mulankPlanet, 42.5, 65, { align: "center" });

  // "vs" connector
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t("vs", "बनाम"), pageWidth / 2, 56, { align: "center" });

  // Bhagyank box
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(pageWidth - 70, 36, 55, 36, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth - 70, 36, 55, 36, 3, 3, "D");
  doc.setFillColor(...goldPrimary);
  doc.circle(pageWidth - 42.5, 47, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(String(bhagyank), pageWidth - 42.5, 50, { align: "center" });
  doc.setTextColor(...textDark);
  doc.setFontSize(8.5);
  doc.text(t("Bhagyank", "भाग्यांक"), pageWidth - 42.5, 60, { align: "center" });
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(isHi ? getPlanetTranslation(ca.bhagyankPlanet) : ca.bhagyankPlanet, pageWidth - 42.5, 65, { align: "center" });

  // Compatibility status badge
  doc.setFillColor(...compatBg);
  doc.roundedRect(15, 78, pageWidth - 30, 8, 2, 2, "F");
  doc.setTextColor(...compatLabelColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(compatLabel, pageWidth / 2, 83.5, { align: "center" });

  // Description
  doc.setFillColor(255, 254, 249);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const caDescLines = doc.splitTextToSize(ca.description, pageWidth - 42);
  doc.roundedRect(15, 90, pageWidth - 30, caDescLines.length * 5.5 + 6, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, 90, pageWidth - 30, caDescLines.length * 5.5 + 6, 2, 2, "D");
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(caDescLines, 20, 96);

  // ── Remaining Lo Shu Planes (Middle & Right columns) ───────────────────
  const caDescCardH = caDescLines.length * 5.5 + 6;
  let remPlaneY = 90 + caDescCardH + 10;

  // Guard: if vertical planes will overflow this page, push them to a new page
  if (remPlaneY + 40 > pageHeight - 25) {
    doc.addPage();
    drawPageShell(doc);
    drawFooter(doc);
    remPlaneY = 25;
  }

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, remPlaneY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("HIDDEN INFLUENCE — VERTICAL PLANES", "गुप्त प्रभाव — लंबवत तल"), 14, remPlaneY + 7);
  remPlaneY += 14;

  hiddenInfluences.slice(4).forEach(plane => {
    const statusLabel = plane.isActive ? t("FULLY ACTIVE", "पूर्ण सक्रिय") : plane.isInactive ? t("ABSENT", "अनुपस्थित") : t("PARTIAL", "आंशिक सक्रिय");
    const bgColor = plane.isActive ? [234, 248, 240] : plane.isInactive ? [253, 234, 234] : [254, 249, 231];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const planeInterp = getPlaneInterpretation(plane);
    const interpLines = doc.splitTextToSize(planeInterp, pageWidth - 42);
    const cardH = 8 + interpLines.length * 5;

    doc.setFillColor(...bgColor);
    doc.roundedRect(15, remPlaneY, pageWidth - 30, cardH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(plane.isActive ? 0.4 : 0.15);
    doc.roundedRect(15, remPlaneY, pageWidth - 30, cardH, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${translatePlaneName(plane.key)} — ${statusLabel}`, 20, remPlaneY + 5.5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(interpLines, 20, remPlaneY + 11);

    remPlaneY += cardH + 3.5;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6c: PERSONAL YEAR DETAILED ANALYSIS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${t("PERSONAL YEAR", "व्यक्तिगत वर्ष")} ${personalYearNum} — ${t("DETAILED ANALYSIS", "विस्तृत विश्लेषण")}`, 14, 27);

  // Year badge
  doc.setFillColor(234, 248, 240);
  doc.roundedRect(15, 36, pageWidth - 30, 20, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 36, pageWidth - 30, 20, 3, 3, "D");
  doc.setFillColor(...goldPrimary);
  doc.circle(32, 46, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(personalYearNum), 32, 49, { align: "center" });
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(personalYearInfo.title, 46, 43);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const pyThemeLines = doc.splitTextToSize(personalYearInfo.theme, pageWidth - 65);
  doc.text(pyThemeLines, 46, 49);

  // 4 life area cards
  const lifeAreas = [
    { label: t("HEALTH", "स्वास्थ्य"),       text: personalYearInfo.health,       bg: [253, 234, 234] },
    { label: t("FINANCE", "वित्त"),      text: personalYearInfo.finance,      bg: [234, 248, 240] },
    { label: t("CAREER", "करियर"),       text: personalYearInfo.career,       bg: [234, 238, 252] },
    { label: t("RELATIONSHIP", "संबंध"), text: personalYearInfo.relationship, bg: [254, 249, 231] }
  ];

  let lifeY = 62;
  lifeAreas.forEach(area => {
    const aLines = doc.splitTextToSize(area.text, pageWidth - 46);
    const aH = 8 + aLines.length * 5.2;

    doc.setFillColor(...area.bg);
    doc.roundedRect(15, lifeY, pageWidth - 30, aH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, lifeY, pageWidth - 30, aH, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(area.label, 20, lifeY + 6);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(aLines, 20, lifeY + 12);

    lifeY += aH + 4;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 7: LUCKY/UNLUCKY ELEMENTS, COLORS & SIGNATURE STYLE
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);


  // Section 12 & 13
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("LUCKY ELEMENTS", "भाग्यशाली कारक"), 14, 27);

  // Helper translation maps
  const getLuckyColorTranslation = (color) => {
    const map = {
      "Red": "लाल",
      "Yellow": "पीला",
      "Green": "हरा",
      "Blue": "नीला",
      "White": "सफेद",
      "Black": "काला",
      "Pink": "गुलाबी",
      "Orange": "नारंगी",
      "Gold": "सुनहरा",
      "Silver": "चांदी",
      "Grey": "स्लेटी",
      "Brown": "भूरा",
      "Sky Blue": "आसमानी नीला",
      "Light Yellow": "हल्का पीला",
      "Dark Blue": "गहरा नीला",
      "Royal Blue": "शाही नीला",
      "Light Green": "हल्का हरा"
    };
    return map[color] || color;
  };

  const getLuckyDirectionTranslation = (dir) => {
    const map = {
      "North": "उत्तर",
      "South": "दक्षिण",
      "East": "पूर्व",
      "West": "पश्चिम",
      "North-East": "उत्तर-पूर्व (ईशान)",
      "North-West": "उत्तर-पश्चिम (वायव्य)",
      "South-East": "दक्षिण-पूर्व (आग्नेय)",
      "South-West": "दक्षिण-पश्चिम (नैऋत्य)",
      "Northeast": "उत्तर-पूर्व (ईशान)",
      "Northwest": "उत्तर-पश्चिम (वायव्य)",
      "Southeast": "दक्षिण-पूर्व (आग्नेय)",
      "Southwest": "दक्षिण-पश्चिम (नैऋत्य)"
    };
    return map[dir] || dir;
  };

  const getLuckyElementTranslation = (elem) => {
    const map = {
      "Water": "जल",
      "Fire": "अग्नि",
      "Earth": "पृथ्वी",
      "Metal": "धातु",
      "Wood": "लकड़ी (काष्ठ)"
    };
    return map[elem] || elem;
  };

  const luckyElements = [
    { label: t("Lucky Number", "भाग्यशाली अंक"),       value: `${luckyData.luckyNumber} (${t("Life Path", "जीवन पथ")})`,   color: [181, 130, 10] },
    { label: t("Lucky Dates", "भाग्यशाली तिथियां"),        value: luckyData.luckyDates,                      color: [0, 150, 100] },
    { label: t("Challenging Dates", "चुनौतीपूर्ण तिथियां"),  value: luckyData.unluckyDates,                    color: [229, 62, 62] },
    { label: t("Lucky Color", "भाग्यशाली रंग"),        value: isHi ? getLuckyColorTranslation(luckyData.luckyColor) : luckyData.luckyColor,                      color: [181, 130, 10] },
    { label: t("Challenging Color", "चुनौतीपूर्ण रंग"),  value: isHi ? getLuckyColorTranslation(luckyData.unluckyColor) : luckyData.unluckyColor,                    color: [61, 44, 30] },
    { label: t("Lucky Direction", "भाग्यशाली दिशा"),    value: isHi ? getLuckyDirectionTranslation(luckyData.luckyDirection) : luckyData.luckyDirection,                  color: [0, 150, 100] },
    { label: t("Core Element", "मूल तत्व"),       value: `${isHi ? getLuckyElementTranslation(luckyData.element) : luckyData.element} (${isHi ? getPlanetTranslation(luckyData.planetEnergy) : luckyData.planetEnergy})`, color: [105, 80, 180] },
  ];

  const colWidth = (pageWidth - 40) / 3;
  let xIdx = 0;
  let yIdx = 0;

  luckyElements.forEach((elem) => {
    const curX = 15 + xIdx * colWidth;
    const curY = 38 + yIdx * 20;

    doc.setFillColor(255, 254, 249);
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(curX, curY, colWidth - 5, 18, 2, 2, "FD");

    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(elem.label, curX + 4, curY + 5.5);

    doc.setFontSize(8.5);
    doc.setTextColor(...(elem.color || textDark));
    doc.setFont("helvetica", "bold");
    // Wrap long values to fit within card width
    const valLines = doc.splitTextToSize(String(elem.value || "-"), colWidth - 12);
    doc.text(valLines[0], curX + 4, curY + 12); // show first line only

    xIdx++;
    if (xIdx > 2) {
      xIdx = 0;
      yIdx++;
    }
  });

  // Section 14: Signature Style for Success
  // Use tracked yIdx to accurately position after the last row
  const actualRows = yIdx + (xIdx > 0 ? 1 : 0); // rows actually used (yIdx doesn't increment after last row if incomplete)
  const luckyGridEndY = 38 + actualRows * 20 + 8;  // 8mm gap after the grid

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, luckyGridEndY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("SIGNATURE STYLE FOR SUCCESS", "सफलता के लिए हस्ताक्षर शैली"), 14, luckyGridEndY + 7);

  const sigBoxY = luckyGridEndY + 14;  // 4mm below header bottom (header is 10mm)
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, sigBoxY, pageWidth - 30, 68, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, sigBoxY, pageWidth - 30, 68, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(t("Prosperity Signature Rules:", "समृद्धि हस्ताक्षर नियम:"), 20, sigBoxY + 8);

  const sigRules = [
    t("• Sign at a continuous rising angle of approximately 45 degrees.", "• लगभग 45 डिग्री के निरंतर बढ़ते कोण पर हस्ताक्षर करें।"),
    t("• Never put a line cutting through any letters of your name.", "• अपने नाम के किसी भी अक्षर को काटती हुई रेखा कभी न खींचें।"),
    t("• Always end your signature with a forward and rising stroke.", "• अपने हस्ताक्षर को हमेशा आगे और ऊपर की ओर बढ़ते हुए स्ट्रोक के साथ समाप्त करें।"),
    t("• Use two parallel underlines below the signature with a rising ending.", "• बढ़ते हुए अंत के साथ हस्ताक्षर के नीचे दो समानांतर रेखाएं खींचें।"),
    t("• Ensure the first alphabet of your name is larger and clearly readable.", "• सुनिश्चित करें कि आपके नाम का पहला अक्षर बड़ा और स्पष्ट रूप से पठनीय हो।")
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  let sigY = sigBoxY + 16;
  sigRules.forEach(rule => {
    doc.text(rule, 20, sigY);
    sigY += 9;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 8: YANTRA-BASED REMEDIES & BRACELET REMEDIES
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section 15
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("REMEDIES", "उपाय"), 14, 27);

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const yantraText = t("The Lo Shu Grid is considered a divine representation of the universe. Drawing the grid numbers on high-quality copper or keeping a personalized copper Lo Shu Yantra in your home's north or east sector balances missing planetary energies. Chant planetary mantras daily to amplify success grids.", "लो शु ग्रिड को ब्रह्मांड का एक दिव्य प्रतिनिधित्व माना जाता है। ग्रिड के अंकों को उच्च गुणवत्ता वाले तांबे पर बनाना या अपने घर के उत्तर या पूर्व क्षेत्र में एक व्यक्तिगत तांबे का लो शु यंत्र रखना लापता ग्रहीय ऊर्जा को संतुलित करता है। सफलता के ग्रिड को बढ़ाने के लिए प्रतिदिन ग्रहीय मंत्रों का जाप करें।");
  const yantraLines = doc.splitTextToSize(yantraText, pageWidth - 42);
  doc.text(yantraLines, 20, 51);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...goldPrimary);
  doc.text(t("Yantra Direction placement: North / East living sector", "यंत्र दिशा स्थान: उत्तर / पूर्व लिविंग क्षेत्र"), 20, 80);

  // // Section 16: Bracelet & Energy Remedies
  // doc.setFillColor(...goldPrimary);
  // doc.roundedRect(10, 96, pageWidth - 20, 10, 2, 2, "F");
  // doc.setTextColor(255, 255, 255);
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(12);
  // doc.text("BRACELET & ENERGY REMEDIES", 14, 103);

  // doc.setFillColor(254, 249, 231);
  // doc.roundedRect(15, 112, pageWidth - 30, 52, 3, 3, "F");
  // doc.setDrawColor(...goldPrimary);
  // doc.setLineWidth(0.25);
  // doc.roundedRect(15, 112, pageWidth - 30, 52, 3, 3, "D");

  // doc.setTextColor(...textDark);
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(11);
  // doc.text("Crystal Recommendation for Life Balance:", 20, 120);

  // doc.setFont("helvetica", "normal");
  // doc.setFontSize(9.5);
  // const crystalText = "Crystals acts as high-frequency energy conduits. Wearing a dynamic combination of Green Aventurine, Tiger Eye, and Clear Quartz bracelet aligns cosmic vibrations. Rudraksha beads (Five Mukhi) keep the heart chakra grounded and shield against modern electromagnetic pollutions.";
  // const crystalLines = doc.splitTextToSize(crystalText, pageWidth - 42);
  // doc.text(crystalLines, 20, 127);

  // doc.setFont("helvetica", "bold");
  // doc.setTextColor(0, 150, 100);
  // doc.text("Recommended: Multi-Gemstone Prosperity Bracelet (Wear on Left hand)", 20, 154);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: FOREIGN SETTLEMENT PREDICTION
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("FOREIGN SETTLEMENT PREDICTION", "विदेश यात्रा और निवास पूर्वानुमान"), 14, 27);

  // Probability header card
  doc.setFillColor(232, 244, 253);
  doc.roundedRect(15, 34, pageWidth - 30, 22, 3, 3, "F");
  doc.setDrawColor(26, 111, 168);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 34, pageWidth - 30, 22, 3, 3, "D");

  doc.setTextColor(13, 60, 94);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`${t("Probability Score", "संभावना स्कोर")}: ${foreignSettlement.probabilityScore}%`, 20, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`${t("Present", "मौजूद अंक")}: ${foreignSettlement.presentNums.join(', ')}`, 20, 50);
  doc.text(`${t("Missing", "लापता अंक")}: ${foreignSettlement.missingNums.length > 0 ? foreignSettlement.missingNums.join(', ') : t("None", "कोई नहीं")}`, pageWidth / 2, 50);

  let fsY = 62;

  // Core result
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, fsY, pageWidth - 30, 26, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, fsY, pageWidth - 30, 26, 2, 2, "D");
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(t("FOREIGN SETTLEMENT PREDICTIONS", "विदेश यात्रा के पूर्वानुमान"), 20, fsY + 6);

  const coreColor = foreignSettlement.coreGood ? [19, 115, 51] : [197, 34, 31];
  doc.setFillColor(...coreColor);
  doc.circle(21, fsY + 17, 2, "F");
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const coreLines = doc.splitTextToSize(`${foreignSettlement.coreGood ? t("Match", "अनुकूल") : t("Alert", "चेतावनी")}: ${foreignSettlement.coreResult}`, pageWidth - 50);
  doc.text(coreLines, 26, fsY + 18);
  fsY += 32;

  // Friction lines
  if (foreignSettlement.frictionLines.length > 0) {
    const frH = 10 + foreignSettlement.frictionLines.length * 8;
    doc.setFillColor(255, 244, 230);
    doc.roundedRect(15, fsY, pageWidth - 30, frH, 2, 2, "F");
    doc.setDrawColor(245, 192, 122);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, fsY, pageWidth - 30, frH, 2, 2, "D");
    doc.setTextColor(138, 69, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(t("PLANETARY FRICTION", "ग्रहीय घर्षण"), 20, fsY + 6);
    let fline = fsY + 13;
    foreignSettlement.frictionLines.forEach(line => {
      doc.setFillColor(197, 34, 31);
      doc.circle(21, fline, 1.8, "F");
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const fl = doc.splitTextToSize(line, pageWidth - 52);
      doc.text(fl, 26, fline + 1);
      fline += fl.length * 4.5 + 2;
    });
    fsY += frH + 6;
  }

  // Planetary note
  const pnLines = doc.splitTextToSize(foreignSettlement.planetaryNote, pageWidth - 42);
  const pnH = 10 + pnLines.length * 4.5;
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(15, fsY, pageWidth - 30, pnH, 2, 2, "F");
  doc.setDrawColor(191, 208, 247);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, fsY, pageWidth - 30, pnH, 2, 2, "D");
  doc.setTextColor(26, 58, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(t("PLANETARY ALIGNMENT", "ग्रहीय संरेखण"), 20, fsY + 6);
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(pnLines, 20, fsY + 12);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: LOVE vs ARRANGED MARRIAGE PREDICTION
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("LOVE vs ARRANGED MARRIAGE PREDICTION", "प्रेम बनाम तय विवाह पूर्वानुमान"), 14, 27);

  let mrY = 36;

  // Two percentage boxes side by side
  const boxW = (pageWidth - 36) / 2;
  // Love box
  const loveBg   = marriageType.dominant === 'Love' ? [255, 194, 212] : [255, 235, 240];
  const loveFg   = [194, 24, 91];
  doc.setFillColor(...loveBg);
  doc.roundedRect(15, mrY, boxW, 28, 3, 3, "F");
  doc.setDrawColor(...loveFg);
  doc.setLineWidth(marriageType.dominant === 'Love' ? 0.6 : 0.2);
  doc.roundedRect(15, mrY, boxW, 28, 3, 3, "D");
  doc.setTextColor(...loveFg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(marriageType.dominant === 'Love' ? 14 : 12);
  doc.text(`${marriageType.lovePct}%`, 15 + boxW / 2, mrY + 12, { align: "center" });
  doc.setFontSize(8.5);
  doc.text(t("Love Marriage", "प्रेम विवाह"), 15 + boxW / 2, mrY + 22, { align: "center" });

  // Arranged box
  const arrBg  = marriageType.dominant === 'Arranged' ? [187, 222, 251] : [232, 244, 253];
  const arrFg  = [21, 101, 192];
  doc.setFillColor(...arrBg);
  doc.roundedRect(21 + boxW, mrY, boxW, 28, 3, 3, "F");
  doc.setDrawColor(...arrFg);
  doc.setLineWidth(marriageType.dominant === 'Arranged' ? 0.6 : 0.2);
  doc.roundedRect(21 + boxW, mrY, boxW, 28, 3, 3, "D");
  doc.setTextColor(...arrFg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(marriageType.dominant === 'Arranged' ? 14 : 12);
  doc.text(`${marriageType.arrangePct}%`, 21 + boxW + boxW / 2, mrY + 12, { align: "center" });
  doc.setFontSize(8.5);
  doc.text(t("Arranged Marriage", "तय विवाह"), 21 + boxW + boxW / 2, mrY + 22, { align: "center" });
  mrY += 34;

  // Highlight banner
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(15, mrY, pageWidth - 30, 12, 2, 2, "F");
  doc.setDrawColor(249, 231, 159);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, mrY, pageWidth - 30, 12, 2, 2, "D");
  doc.setTextColor(138, 85, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(marriageType.highlight, pageWidth / 2, mrY + 8, { align: "center" });
  mrY += 18;

  // Comments section
  const commentsH = 10 + marriageType.comments.length * 9;
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, mrY, pageWidth - 30, commentsH, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, mrY, pageWidth - 30, commentsH, 2, 2, "D");
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(t("COMMENTS & JUSTIFICATION", "टिप्पणियाँ और औचित्य"), 20, mrY + 6);
  let cmY = mrY + 13;
  marriageType.comments.forEach(c => {
    const isMissing = c.includes('MISSING');
    doc.setFillColor(...(isMissing ? [197, 34, 31] : [19, 115, 51]));
    doc.circle(21, cmY, 1.8, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    const cl = doc.splitTextToSize(c, pageWidth - 52);
    doc.text(cl, 26, cmY + 1);
    cmY += cl.length * 4.2 + 3;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: MATCH MAKING COMPATIBILITY (only if consultant filled the data)
  // ════════════════════════════════════════════════════════════════════════
  if (mmResult) {
    doc.addPage();
    drawPageShell(doc);

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(t("MATCH MAKING COMPATIBILITY", "कुंडली मिलान संगतता"), 14, 27);

    // Rating header
    doc.setFillColor(255, 228, 240);
    doc.roundedRect(15, 34, pageWidth - 30, 24, 3, 3, "F");
    doc.setDrawColor(233, 30, 99);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, 34, pageWidth - 30, 24, 3, 3, "D");

    doc.setTextColor(136, 14, 79);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${mmResult.maleName} & ${mmResult.femaleName}`, 20, 42);
    doc.setFontSize(9);
    doc.text(`${mmResult.ratingLabel}  |  Total: ${mmResult.totalPercentage}%`, 20, 51);
    doc.setFontSize(10);
    // Draw stars as text using standard chars
    const starText = `${'*'.repeat(mmResult.stars)}${'o'.repeat(5 - mmResult.stars)}  (${mmResult.stars}/5 ${t("Stars", "सितारे")})`;
    doc.text(starText, pageWidth - 20, 51, { align: "right" });

    let mmY = 64;

    // Highlights
    const hlH = 10 + mmResult.highlights.length * 7;
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, mmY, pageWidth - 30, hlH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, mmY, pageWidth - 30, hlH, 2, 2, "D");
    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(t("HIGHLIGHTS", "मुख्य विशेषताएं"), 20, mmY + 6);
    let hlY = mmY + 13;
    mmResult.highlights.forEach(h => {
      doc.setFillColor(...goldPrimary);
      doc.circle(21, hlY, 1.5, "F");
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const hl = doc.splitTextToSize(h, pageWidth - 52);
      doc.text(hl, 26, hlY + 1);
      hlY += hl.length * 4.2 + 2;
    });
    mmY += hlH + 6;

    // Shared pairs
    if (mmResult.sharedPairs.length > 0) {
      doc.setFillColor(240, 255, 244);
      doc.roundedRect(15, mmY, pageWidth - 30, 18, 2, 2, "F");
      doc.setDrawColor(165, 214, 167);
      doc.setLineWidth(0.2);
      doc.roundedRect(15, mmY, pageWidth - 30, 18, 2, 2, "D");
      doc.setTextColor(46, 125, 50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(t("SHARABLE NUMBER PAIRS", "साझा करने योग्य संख्या जोड़े"), 20, mmY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(mmResult.sharedPairs.map(p => p.pair).join('   '), 20, mmY + 14);
      mmY += 24;
    }

    // Boost logs
    const blH = 10 + mmResult.boostLogs.length * 9;
    if (mmY + blH < pageHeight - 30) {
      doc.setFillColor(255, 254, 249);
      doc.roundedRect(15, mmY, pageWidth - 30, blH, 2, 2, "F");
      doc.setDrawColor(...goldPrimary);
      doc.setLineWidth(0.2);
      doc.roundedRect(15, mmY, pageWidth - 30, blH, 2, 2, "D");
      doc.setTextColor(...goldPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(t("COMPATIBILITY INSIGHTS", "संगतता अंतर्दृष्टि"), 20, mmY + 6);
      let blY = mmY + 13;
      mmResult.boostLogs.forEach(log => {
        doc.setFillColor(19, 115, 51);
        doc.circle(21, blY, 1.8, "F");
        doc.setTextColor(...textDark);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.2);
        const bl = doc.splitTextToSize(cleanStars(log), pageWidth - 52);
        doc.text(bl, 26, blY + 1);
        blY += bl.length * 4.2 + 3;
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 12b: MOBILE NUMBER ANALYSIS (Strict Planetary Matrix)
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("MOBILE NUMBER ANALYSIS", "मोबाइल नंबर विश्लेषण"), 14, 27);

  let mbY = 36;

  // Helpers for final pages translations
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
        const tLabel = label === 'Very Good' ? 'बहुत अच्छा' : (label === 'Bad' ? 'अशुभ' : 'औसत/मध्यen');
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

  if (mobileCheck.isValid) {
    // Header card
    doc.setFillColor(244, 246, 249);
    doc.roundedRect(15, mbY, pageWidth - 30, 22, 3, 3, "F");
    doc.setDrawColor(108, 117, 125);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, mbY, pageWidth - 30, 22, 3, 3, "D");

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${t("Mobile Number", "मोबाइल नंबर")}: ${phone}`, 20, mbY + 7);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${t("Mobile Total", "मोबाइल योग")}: ${mobileCheck.totalSum} (${mobileCheck.singleDigit})   |   ${t("Mulank", "मूलांक")}: ${mobileCheck.mulank}   |   ${t("Bhagyank", "भाग्यांक")}: ${mobileCheck.bhagyank}`, 20, mbY + 14);

    mbY += 28;

    // Detailed Insights Card
    // Pre-calculate height of all bullets to draw a clean container
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    let cardH = 12; // top padding + title
    mobileCheck.bullets.forEach(bullet => {
      const translated = translateMobileBullet(bullet);
      const lines = doc.splitTextToSize(translated, pageWidth - 54);
      cardH += lines.length * 4.2 + 3.5;
    });
    cardH += 4; // bottom padding

    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, mbY, pageWidth - 30, cardH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, mbY, pageWidth - 30, cardH, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(t("DETAILED COMPATIBILITY INSIGHTS", "विस्तृत संगतता अंतर्दृष्टि"), 20, mbY + 6);

    let bulletY = mbY + 12;
    mobileCheck.bullets.forEach(bullet => {
      // Draw bullet point dot
      doc.setFillColor(...goldPrimary);
      doc.circle(21, bulletY + 1, 1.6, "F");
      
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const translated = translateMobileBullet(bullet);
      const lines = doc.splitTextToSize(translated, pageWidth - 54);
      doc.text(lines, 26, bulletY + 2);
      bulletY += lines.length * 4.2 + 3.5;
    });

    mbY += cardH + 6;

    // Status Banner at bottom
    const statusBg = mobileCheck.overallStatus === 'Friendly' ? [212, 237, 218] : mobileCheck.overallStatus === 'Non-Friendly' ? [248, 215, 218] : [255, 243, 205];
    const statusFg = mobileCheck.overallStatus === 'Friendly' ? [21, 87, 36]   : mobileCheck.overallStatus === 'Non-Friendly' ? [114, 28, 36]  : [133, 100, 4];
    const statusBorder = mobileCheck.overallStatus === 'Friendly' ? [40, 167, 69] : mobileCheck.overallStatus === 'Non-Friendly' ? [220, 53, 69] : [255, 193, 7];

    doc.setFillColor(...statusBg);
    doc.roundedRect(15, mbY, pageWidth - 30, 14, 3, 3, "F");
    doc.setDrawColor(...statusBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, mbY, pageWidth - 30, 14, 3, 3, "D");

    doc.setTextColor(...statusFg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${t("STATUS", "स्थिति")}: ${isHi ? getCompatStatusTranslation(mobileCheck.overallStatus) : mobileCheck.overallStatus}`, pageWidth / 2, mbY + 9, { align: "center" });

  } else {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, mbY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.text(t("No mobile number provided for this client profile.", "इस ग्राहक प्रोफ़ाइल के लिए कोई मोबाइल नंबर प्रदान नहीं किया गया है।"), 20, mbY + 10);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 12c: NAME NUMEROLOGY ANALYSIS (Strict Planetary Matrix)
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t("NAME NUMEROLOGY ANALYSIS", "नाम अंकज्योतिष विश्लेषण"), 14, 27);

  let nmY = 36;

  const drawNameCard = (title, cardData, isFullName = false) => {
    if (!cardData) return;
    const lineItems = [
      { good: cardData.not48Check,     text: cleanStars(isHi ? `नाम का योग 4 या 8 नहीं होना चाहिए। ${cardData.not48Check ? '✓' : `वर्तमान में ${cardData.single} है।`}` : `Count should not be 4 or 8. ${cardData.not48Check ? '✓' : `Currently ${cardData.single}.`}`) },
      { good: cardData.driverStatus !== 'enemy' && cardData.conductorStatus !== 'enemy', text: cleanStars(translateNameItemText(cardData.compatLine)) },
    ];
    if (isFullName) {
      lineItems.push({ good: cardData.targetOk, text: cleanStars(translateNameItemText(cardData.targetLine)) });
    }
    lineItems.push({ good: cardData.compoundRating?.label !== 'Bad', text: cleanStars(translateNameItemText(cardData.compoundLine)) });

    // Pre-calculate height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    let totalH = 12 + 6; // title + compound badge row
    lineItems.forEach(item => {
      const lines = doc.splitTextToSize(item.text, pageWidth - 54);
      totalH += lines.length * 4.2 + 3;
    });
    totalH += 4; // bottom padding

    if (nmY + totalH > pageHeight - 30) {
      doc.addPage();
      drawPageShell(doc);
      drawFooter(doc);
      nmY = 25;
    }

    doc.setFillColor(254, 249, 231);
    doc.roundedRect(15, nmY, pageWidth - 30, totalH, 3, 3, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.25);
    doc.roundedRect(15, nmY, pageWidth - 30, totalH, 3, 3, "D");

    // Title + numbers
    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(title, 20, nmY + 6);
    doc.setTextColor(...textMuted);
    doc.setFontSize(8);
    doc.text(`${t("Compound", "संयुक्त")}: ${cardData.compound}   ${t("Single", "एकल")}: ${cardData.single}`, pageWidth - 20, nmY + 6, { align: "right" });

    let lineY = nmY + 12;
    lineItems.forEach(item => {
      const dotColor = item.good ? [19, 115, 51] : [197, 34, 31];
      doc.setFillColor(...dotColor);
      doc.circle(21, lineY + 1, 1.8, "F");
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const lines = doc.splitTextToSize(item.text, pageWidth - 54);
      doc.text(lines, 26, lineY + 2);
      lineY += lines.length * 4.2 + 3;
    });

    nmY += totalH + 5;
  };

  if (nameNumerologyCheck.isValid) {
    if (!nameNumerologyCheck.lastNameCard) {
      drawNameCard(`${t("NAME ANALYSIS", "नाम विश्लेषण")}: ${nameNumerologyCheck.firstNameCard.name}`, nameNumerologyCheck.fullNameCard, true);
    } else {
      drawNameCard(`${t("FIRST NAME", "प्रथम नाम")}: ${nameNumerologyCheck.firstNameCard.name}`, nameNumerologyCheck.firstNameCard, false);
      drawNameCard(`${t("LAST NAME", "अंतिम नाम")}: ${nameNumerologyCheck.lastNameCard.name}`, nameNumerologyCheck.lastNameCard, false);
      drawNameCard(`${t("FULL NAME", "पूर्ण नाम")}: ${nameNumerologyCheck.fullNameCard.name}`, nameNumerologyCheck.fullNameCard, true);
    }

    // Final Status Banner
    if (nmY + 16 > pageHeight - 30) {
      doc.addPage();
      drawPageShell(doc);
      drawFooter(doc);
      nmY = 25;
    }
    const statusBg = nameNumerologyCheck.finalStatusGood ? [212, 237, 218] : [248, 215, 218];
    const statusFg = nameNumerologyCheck.finalStatusGood ? [21, 87, 36]   : [114, 28, 36];
    const statusBorder = nameNumerologyCheck.finalStatusGood ? [40, 167, 69] : [220, 53, 69];
    doc.setFillColor(...statusBg);
    doc.roundedRect(15, nmY, pageWidth - 30, 14, 3, 3, "F");
    doc.setDrawColor(...statusBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, nmY, pageWidth - 30, 14, 3, 3, "D");
    doc.setTextColor(...statusFg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    const friendlyStatusTxt = nameNumerologyCheck.finalStatusGood ? t("Name Balanced ✓", "नाम संतुलित ✓") : t("Name Not Balanced ✗", "नाम संतुलित नहीं ✗");
    doc.text(`${t("STATUS", "स्थिति")}: ${friendlyStatusTxt}`, pageWidth / 2, nmY + 9, { align: "center" });
  } else {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, nmY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.text(t("No name data available for analysis.", "विश्लेषण के लिए कोई नाम डेटा उपलब्ध नहीं है।"), 20, nmY + 10);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: STOCK MARKET COMPATIBILITY
  // ════════════════════════════════════════════════════════════════════════
  const stockInfo = reportData.stockMarket || {};
  if (stockInfo.companyName && stockInfo.symbol) {
    doc.addPage();
    drawPageShell(doc);

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(t("STOCK MARKET COMPATIBILITY", "शेयर बाजार अनुकूलता"), 14, 27);

    // Stock details banner
    doc.setFillColor(244, 246, 249);
    doc.roundedRect(15, 34, pageWidth - 30, 24, 3, 3, "F");
    doc.setDrawColor(108, 117, 125);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, 34, pageWidth - 30, 24, 3, 3, "D");

    doc.setTextColor(51, 51, 51);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${t("Company / Stock Name", "कंपनी / स्टॉक का नाम")}: ${stockInfo.companyName}`, 20, 41);
    doc.text(`${t("Stock Symbol", "स्टॉक सिंबल")}: ${stockInfo.symbol}`, 20, 47);
    if (stockInfo.listingDate) {
      doc.text(`${t("Listing Date", "सूचीबद्धता की तिथि")}: ${formatDateToDDMMYYYY(stockInfo.listingDate)}`, 20, 53);
    }

    // Best Indicator Card
    const stockAnalysis = analyzeStock(rawDob, stockInfo.companyName, stockInfo.symbol, stockInfo.listingDate || '-');
    let smY = 64;

    doc.setFillColor(255, 252, 243);
    doc.roundedRect(15, smY, pageWidth - 30, 20, 3, 3, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, smY, pageWidth - 30, 20, 3, 3, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(t("BEST SCORING INDICATOR", "सर्वश्रेष्ठ संकेतक"), 20, smY + 6);
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Source: ${stockAnalysis.bestIndicator.label}  |  Single: ${stockAnalysis.bestIndicator.single}${stockAnalysis.bestIndicator.compound > 0 ? `  |  Compound: ${stockAnalysis.bestIndicator.compound}` : ''}  |  Score: ${stockAnalysis.score}`, 20, smY + 13);

    smY += 26;

    // Bullet insights
    const comments = getStockComments(
      stockAnalysis.bestIndicator,
      stockAnalysis.mulank,
      stockAnalysis.bhagyank,
      rawDob,
      stockAnalysis.status,
      stockAnalysis.score,
      language
    );

    const hlH = 10 + comments.length * 8;
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, smY, pageWidth - 30, hlH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, smY, pageWidth - 30, hlH, 2, 2, "D");
    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(t("DETAILED COMPATIBILITY INSIGHTS", "विस्तृत अनुकूलता अंतर्दृष्टि"), 20, smY + 6);

    let hlY = smY + 13;
    comments.forEach(h => {
      doc.setFillColor(...goldPrimary);
      doc.circle(21, hlY, 1.5, "F");
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const hl = doc.splitTextToSize(h, pageWidth - 52);
      doc.text(hl, 26, hlY + 1);
      hlY += hl.length * 4.2 + 2;
    });

    smY += hlH + 6;

    // Suitability Banner
    const getStatusColor = (status) => {
      if (status === 'Strongly Suitable') return { bg: [212, 237, 218], border: [40, 167, 69], text: [21, 87, 36] };
      if (status === 'Suitable') return { bg: [232, 244, 253], border: [0, 123, 255], text: [0, 64, 133] };
      if (status === 'Watchlist') return { bg: [255, 243, 205], border: [255, 193, 7], text: [133, 100, 4] };
      return { bg: [248, 215, 218], border: [220, 53, 105], text: [114, 28, 36] };
    };

    const colors = getStatusColor(stockAnalysis.status);
    const tStatus = isHi ? {
      'Strongly Suitable': 'अत्यधिक उपयुक्त',
      'Suitable': 'उपयुक्त',
      'Watchlist': 'वॉचलिस्ट',
      'Avoid': 'बचें'
    }[stockAnalysis.status] || stockAnalysis.status : stockAnalysis.status;

    doc.setFillColor(...colors.bg);
    doc.roundedRect(15, smY, pageWidth - 30, 14, 3, 3, "F");
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, smY, pageWidth - 30, 14, 3, 3, "D");
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${t("STATUS", "स्थिति")}: ${tStatus}`, pageWidth / 2, smY + 9, { align: "center" });
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: BABY BIRTH DATE CALCULATOR
  // ════════════════════════════════════════════════════════════════════════
  const babyBirthInfo = reportData.babyBirth || {};
  const babyStart = babyBirthInfo.startDate || '';
  const babyEnd   = babyBirthInfo.endDate   || '';

  if (babyStart && babyEnd) {
    const babyResults = analyzeBirthDateRange(babyStart, babyEnd);
    if (babyResults.length > 0) {
      // Two pages: one for boy, one for girl
      ['boy', 'girl'].forEach(gender => {
        doc.addPage();
        drawPageShell(doc);

        // Section header
        doc.setFillColor(...goldPrimary);
        doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(
          t('BABY BIRTH DATE CALCULATOR', 'बेबी बर्थ डेट कैलकुलेटर') +
          ' — ' +
          (gender === 'boy' ? t('BABY BOY', 'बेबी बॉय') : t('BABY GIRL', 'बेबी गर्ल')),
          14, 27
        );

        // Summary stats row
        const perfects = babyResults.filter(r => r.isPerfect).length;
        doc.setTextColor(...textDark);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const [sy, sm, sd] = babyStart.split('-');
        const [ey, em, ed] = babyEnd.split('-');
        doc.text(
          `${t('Date Range', 'तिथि सीमा')}: ${sd}-${sm}-${sy} → ${ed}-${em}-${ey}   |   ` +
          `${t('Total Days', 'कुल दिन')}: ${babyResults.length}   |   ` +
          `${t('Perfect Dates (Score ≥70)', 'परफेक्ट तिथियाँ (≥70)')} : ${perfects}`,
          14, 38
        );

        // Sort by gender score
        const sorted = [...babyResults].sort((a, b) =>
          gender === 'boy' ? b.boyScore - a.boyScore : b.girlScore - a.girlScore
        );
        const top5 = sorted.slice(0, 5);

        // Top-5 ranked table header
        let bY = 45;
        doc.setFillColor(250, 245, 235);
        doc.roundedRect(15, bY, pageWidth - 30, 8, 1, 1, 'FD');
        doc.setDrawColor(...goldPrimary);
        doc.setLineWidth(0.2);
        doc.setTextColor(...goldPrimary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        const cols = [18, 38, 68, 102, 138, 168];
        doc.text(t('Rank', 'क्रम'), cols[0], bY + 5.5);
        doc.text(t('Date', 'तिथि'), cols[1], bY + 5.5);
        doc.text(t('Driver|Conductor', 'मूलांक|भाग्यांक'), cols[2], bY + 5.5);
        doc.text(t('DC Relation', 'DC संबंध'), cols[3], bY + 5.5);
        doc.text(t('Grid Filled', 'ग्रिड'), cols[4], bY + 5.5);
        doc.text(t('Score', 'स्कोर'), cols[5], bY + 5.5);
        bY += 9;

        top5.forEach((r, idx) => {
          const gScore = gender === 'boy' ? r.boyScore : r.girlScore;
          const [ry, rm, rd] = r.date.split('-');
          const fDate = `${rd}-${rm}-${ry}`;
          const rowBg = gScore >= 70 ? [209, 250, 229] : gScore >= 50 ? [219, 234, 254] : gScore >= 30 ? [254, 249, 195] : [254, 226, 226];
          doc.setFillColor(...rowBg);
          doc.setDrawColor(220, 220, 210);
          doc.setLineWidth(0.15);
          doc.roundedRect(15, bY, pageWidth - 30, 9, 1, 1, 'FD');
          doc.setTextColor(...textDark);
          doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
          doc.setFontSize(8.2);
          doc.text(`#${idx + 1}`, cols[0], bY + 6);
          doc.text(fDate, cols[1], bY + 6);
          doc.text(`${r.driver} | ${r.conductor}`, cols[2], bY + 6);
          const dcStr = r.dcRelationship === 'Compatible' ? t('Compatible', 'संगत')
            : r.dcRelationship === 'Anti' ? t('Anti', 'विरोधी') : t('Neutral', 'तटस्थ');
          doc.text(dcStr, cols[3], bY + 6);
          doc.text(`${r.gridFilled}/9`, cols[4], bY + 6);
          doc.setTextColor(r.dcRelationship === 'Compatible' ? 21 : r.dcRelationship === 'Anti' ? 127 : 110,
            r.dcRelationship === 'Compatible' ? 128 : r.dcRelationship === 'Anti' ? 29 : 90,
            r.dcRelationship === 'Compatible' ? 60 : 36);
          doc.setFont('helvetica', 'bold');
          doc.text(`${gScore}`, cols[5], bY + 6);
          bY += 10;
        });

        bY += 4;

        // Plane Matrix for top date
        const best = top5[0];
        if (best) {
          doc.setFillColor(...goldPrimary);
          doc.roundedRect(15, bY, pageWidth - 30, 8, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.text(
            t('PLANES SUMMARY — TOP DATE', 'तल सारांश — शीर्ष तिथि') +
            `: ${best.date.split('-').reverse().join('-')}`,
            20, bY + 5.5
          );
          bY += 11;

          const planeEntries = Object.entries(best.planes);
          const halfLen = Math.ceil(planeEntries.length / 2);
          const leftPanes  = planeEntries.slice(0, halfLen);
          const rightPanes = planeEntries.slice(halfLen);
          const maxRows = Math.max(leftPanes.length, rightPanes.length);

          for (let i = 0; i < maxRows; i++) {
            [[leftPanes[i], 15], [rightPanes[i], 108]].forEach(([entry, xOff]) => {
              if (!entry) return;
              const [, plane] = entry;
              const pLabel = isHi ? plane.labelHi : plane.label;
              const barW = 30;
              const pct = plane.percentage;
              const fillW = Math.round(barW * pct / 100);
              doc.setFillColor(240, 236, 225);
              doc.roundedRect(xOff, bY, 87, 7, 1, 1, 'F');
              doc.setDrawColor(220, 210, 190);
              doc.setLineWidth(0.1);
              doc.roundedRect(xOff, bY, 87, 7, 1, 1, 'D');
              doc.setTextColor(...textDark);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7.5);
              doc.text(pLabel + ':', xOff + 2, bY + 4.8);
              // progress bar
              const barX = xOff + 44;
              doc.setFillColor(225, 218, 205);
              doc.roundedRect(barX, bY + 2, barW, 3.5, 1, 1, 'F');
              if (fillW > 0) {
                const barColor = pct === 100 ? [16, 185, 129] : pct === 66 ? [59, 130, 246] : [234, 179, 8];
                doc.setFillColor(...barColor);
                doc.roundedRect(barX, bY + 2, fillW, 3.5, 1, 1, 'F');
              }
              doc.setTextColor(...goldPrimary);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(7.5);
              doc.text(`${pct}%`, barX + barW + 2, bY + 4.8);
            });
            bY += 9;
          }

          bY += 4;

          // Gender Suitability Justification
          doc.setFillColor(gender === 'boy' ? 239 : 253, gender === 'boy' ? 246 : 242, gender === 'boy' ? 255 : 248);
          doc.setDrawColor(gender === 'boy' ? 59 : 236, gender === 'boy' ? 130 : 72, gender === 'boy' ? 246 : 153);
          doc.setLineWidth(0.5);
          doc.roundedRect(15, bY, pageWidth - 30, 6, 2, 2, 'FD');
          doc.setTextColor(...textDark);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(t('GENDER SUITABILITY JUSTIFICATION', 'लिंग अनुकूलता'), 20, bY + 4.5);
          bY += 9;

          const justText = getBirthDateGenderJustification(best, gender, language);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          const justLines = doc.splitTextToSize(justText, pageWidth - 36);
          doc.setTextColor(...textDark);
          doc.text(justLines, 18, bY);

          // ── PAGE: BABY NAME SUGGESTION REPORT ───────────────────
          const nameReport = getNameSuggestions(best.date, gender);
          if (nameReport) {
            doc.addPage();
            drawPageShell(doc);

            // Page Header
            doc.setFillColor(...goldPrimary);
            doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(
              t('BABY NAME SUGGESTION REPORT', 'बच्चे के नाम सुझाव की रिपोर्ट') +
              ' — ' +
              (gender === 'boy' ? t('BABY BOY', 'बेबी बॉय') : t('BABY GIRL', 'बेबी गर्ल')),
              14, 27
            );

            let nY = 38;

            // Core Numerology Analysis box
            doc.setFillColor(250, 245, 235);
            doc.setDrawColor(...goldPrimary);
            doc.setLineWidth(0.2);
            doc.roundedRect(15, nY, 87, 34, 2, 2, 'FD');

            doc.setTextColor(...goldPrimary);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(t('CORE NUMEROLOGY ANALYSIS', 'मूल अंकशास्त्र विश्लेषण'), 20, nY + 6);

            doc.setTextColor(...textDark);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.2);
            doc.text(`${t('Driver', 'मूलांक')}: ${nameReport.driver}`, 20, nY + 13);
            doc.text(`${t('Conductor', 'भाग्यांक')}: ${nameReport.conductor}`, 20, nY + 19);
            
            const missingStr = nameReport.missingPriority.length > 0 ? nameReport.missingPriority.join(', ') : t('None', 'कोई नहीं');
            doc.text(`${t('Missing Priority Numbers', 'लापता प्राथमिकता अंक')}: ${missingStr}`, 20, nY + 25);
            
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(22, 163, 74);
            doc.text(`${t('Selected Target Name Number', 'चयनित लक्षित नाम अंक')}: ${nameReport.bestTarget}`, 20, nY + 30);

            // Recommended Alphabets box
            doc.setFillColor(250, 245, 235);
            doc.setDrawColor(...goldPrimary);
            doc.setLineWidth(0.2);
            doc.roundedRect(108, nY, 87, 34, 2, 2, 'FD');

            doc.setTextColor(...goldPrimary);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(t('RECOMMENDED ALPHABETS (INITIALS)', 'अनुशंसित प्रारंभिक अक्षर (Initials)'), 112, nY + 6);

            // Draw letters
            let xL = 115;
            nameReport.initials.forEach(letter => {
              doc.setFillColor(...goldPrimary);
              doc.roundedRect(xL, nY + 11, 10, 10, 1.5, 1.5, 'F');
              doc.setTextColor(255, 255, 255);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(10.5);
              doc.text(letter, xL + 5, nY + 17.5, { align: 'center' });
              xL += 14;
            });

            doc.setTextColor(...textDark);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            const initialComment = isHi 
              ? `भाग्यशाली नामांक ${nameReport.bestTarget} के अनुकूल प्रारंभिक अक्षर`
              : `Lucky starting alphabets matching Destiny Number ${nameReport.bestTarget}`;
            doc.text(initialComment, 112, nY + 28);

            nY += 39;

            // Justification box
            doc.setFillColor(240, 253, 250);
            doc.setDrawColor(45, 212, 191);
            doc.setLineWidth(0.25);
            doc.roundedRect(15, nY, pageWidth - 30, 14, 2, 2, 'FD');
            
            doc.setTextColor(...textDark);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.2);
            doc.text(`${t('Justification', 'औचित्य')}:`, 19, nY + 5.5);
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.8);
            const justTxt = isHi 
              ? `लक्ष्य नामांक ${nameReport.bestTarget} को चुना गया है क्योंकि यह मूलांक ${nameReport.driver} और भाग्यांक ${nameReport.conductor} दोनों के साथ अनुकूल है, जिससे कोई भी विरोधाभास (Anti) अंक नहीं है। यह लो शू ग्रिड में अनुपस्थित प्राथमिक अंकों को संतुलित करता है।`
              : nameReport.justification;
            const justTxtLines = doc.splitTextToSize(justTxt, pageWidth - 38);
            doc.text(justTxtLines, 19, nY + 9.5);

            nY += 19;

            // Table header
            doc.setFillColor(...goldPrimary);
            doc.roundedRect(15, nY, pageWidth - 30, 8, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            
            const tblCols = [17, 28, 56, 138, 166];
            doc.text(t('Sr. No', 'क्र. सं.'), tblCols[0], nY + 5.5);
            doc.text(t('Suggested Name', 'सुझाया गया नाम'), tblCols[1], nY + 5.5);
            doc.text(t('Chaldean Letter Breakdown & Calculation', 'किल्डियन अक्षर विश्लेषण और गणना'), tblCols[2], nY + 5.5);
            doc.text(t('Final Name Total', 'अंतिम नाम योग'), tblCols[3], nY + 5.5);
            doc.text(t('English Meaning', 'अंग्रेजी अर्थ'), tblCols[4], nY + 5.5);
            
            nY += 9;

            nameReport.suggestions.forEach((s) => {
              doc.setFillColor(s.srNo % 2 === 0 ? 252 : 255, s.srNo % 2 === 0 ? 251 : 255, s.srNo % 2 === 0 ? 247 : 255);
              doc.setDrawColor(230, 230, 220);
              doc.setLineWidth(0.15);
              doc.roundedRect(15, nY, pageWidth - 30, 8.5, 1, 1, 'FD');
              
              doc.setTextColor(...textDark);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7.8);
              doc.text(String(s.srNo), tblCols[0], nY + 5.8);
              
              doc.setFont('helvetica', 'bold');
              doc.text(s.name, tblCols[1], nY + 5.8);
              
              doc.setFont('courier', 'normal');
              doc.setFontSize(7.2);
              doc.text(s.calculation, tblCols[2], nY + 5.8);
              
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(7.8);
              doc.text(String(s.total), tblCols[3] + 8, nY + 5.8);
              
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7.5);
              const mText = doc.splitTextToSize(s.meaning, pageWidth - tblCols[4] - 17);
              doc.text(mText, tblCols[4], nY + 5.8);
              
              nY += 9.5;
            });
          }
        }
      });
    }
  }

  // ── PAGE: NAME SPELLING SUGGESTION ───────────────────
  const clientDobForName = rawDob;
  const clientGenderForName = (gender === 'male' || gender === 'boy') ? 'boy' : 'girl';
  const nameReport = getNameSuggestions(clientDobForName, clientGenderForName);
  if (nameReport) {
    doc.addPage();
    drawPageShell(doc);

    // Page Header
    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(
      t('NAME SPELLING SUGGESTION', 'नाम वर्तनी सुझाव (Name Spelling Suggestion)'),
      14, 27
    );

    let nY = 38;

    // Core Numerology Analysis box
    doc.setFillColor(255, 254, 249);
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, nY, 92, 33, 3, 3, 'FD');

    doc.setTextColor(...goldPrimary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(t('CORE NUMEROLOGY ANALYSIS', 'मूल अंकशास्त्र विश्लेषण'), 20, nY + 6);

    // Grid lines in analysis box
    doc.setDrawColor(232, 213, 191);
    doc.setLineWidth(0.15);
    doc.line(20, nY + 9, 101, nY + 9);

    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(`${t('Driver', 'मूलांक')}:`, 20, nY + 14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(nameReport.driver), 70, nY + 14);

    doc.setFont('helvetica', 'normal');
    doc.text(`${t('Conductor', 'भाग्यांक')}:`, 20, nY + 19);
    doc.setFont('helvetica', 'bold');
    doc.text(String(nameReport.conductor), 70, nY + 19);

    doc.setFont('helvetica', 'normal');
    doc.text(`${t('Missing Priority Numbers', 'लापता प्राथमिकता अंक')}:`, 20, nY + 24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(192, 80, 80);
    doc.text(nameReport.missingPriority.length > 0 ? nameReport.missingPriority.join(', ') : t('None', 'कोई नहीं'), 70, nY + 24);

    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('Selected Target Name Number', 'चयनित लक्षित नाम अंक')}:`, 20, nY + 29);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...goldPrimary);
    doc.text(String(nameReport.bestTarget), 70, nY + 29);

    // Recommended Alphabets box
    doc.setFillColor(255, 254, 249);
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(111, nY, 84, 33, 3, 3, 'FD');

    doc.setTextColor(...goldPrimary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(t('RECOMMENDED ALPHABETS (INITIALS)', 'अनुशंसित प्रारंभिक अक्षर (Initials)'), 115, nY + 6);

    // Draw letters
    let xL = 118;
    nameReport.initials.forEach(letter => {
      doc.setFillColor(...goldPrimary);
      doc.roundedRect(xL, nY + 11, 10, 10, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(letter, xL + 5, nY + 17.5, { align: 'center' });
      xL += 14;
    });

    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    const initialComment = isHi 
      ? `भाग्यशाली नामांक ${nameReport.bestTarget} के अनुकूल प्रारंभिक अक्षर`
      : `Lucky starting alphabets matching Destiny Number ${nameReport.bestTarget}`;
    doc.text(initialComment, 115, nY + 28);

    nY += 39;

    // Justification box
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(45, 212, 191);
    doc.setLineWidth(0.25);
    doc.roundedRect(15, nY, pageWidth - 30, 14, 2, 2, 'FD');
    
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.text(`${t('Justification', 'औचित्य')}:`, 19, nY + 5.5);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    const justTxt = isHi 
      ? `लक्ष्य नामांक ${nameReport.bestTarget} को चुना गया है क्योंकि यह मूलांक ${nameReport.driver} और भाग्यांक ${nameReport.conductor} दोनों के साथ अनुकूल है, जिससे कोई भी विरोधाभास (Anti) अंक नहीं है। यह लो शू ग्रिड में अनुपस्थित प्राथमिक अंकों को संतुलित करता है।`
      : nameReport.justification;
    const justTxtLines = doc.splitTextToSize(justTxt, pageWidth - 38);
    doc.text(justTxtLines, 19, nY + 9.5);

    nY += 19;

    // Table header
    doc.setFillColor(...goldPrimary);
    doc.roundedRect(15, nY, pageWidth - 30, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    
    const tblCols = [17, 28, 56, 138, 166];
    doc.text(t('Sr. No', 'क्र. सं.'), tblCols[0], nY + 5.5);
    doc.text(t('Suggested Name', 'सुझाया गया नाम'), tblCols[1], nY + 5.5);
    doc.text(t('Chaldean Letter Breakdown & Calculation', 'किल्डियन अक्षर विश्लेषण और गणना'), tblCols[2], nY + 5.5);
    doc.text(t('Final Name Total', 'अंतिम नाम योग'), tblCols[3], nY + 5.5);
    doc.text(t('English Meaning', 'अंग्रेजी अर्थ'), tblCols[4], nY + 5.5);
    
    nY += 9;

    nameReport.suggestions.forEach((s) => {
      doc.setFillColor(s.srNo % 2 === 0 ? 252 : 255, s.srNo % 2 === 0 ? 251 : 255, s.srNo % 2 === 0 ? 247 : 255);
      doc.setDrawColor(230, 230, 220);
      doc.setLineWidth(0.15);
      doc.roundedRect(15, nY, pageWidth - 30, 8.5, 1, 1, 'FD');
      
      doc.setTextColor(...textDark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.text(String(s.srNo), tblCols[0], nY + 5.8);
      
      doc.setFont('helvetica', 'bold');
      doc.text(s.name, tblCols[1], nY + 5.8);
      
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.2);
      doc.text(s.calculation, tblCols[2], nY + 5.8);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.text(String(s.total), tblCols[3] + 8, nY + 5.8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const mText = doc.splitTextToSize(s.meaning, pageWidth - tblCols[4] - 17);
      doc.text(mText, tblCols[4], nY + 5.8);
      
      nY += 9.5;
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGES: 3 BLANK PAGES FOR CONSULTANT NOTES / SUGGESTIONS
  // ════════════════════════════════════════════════════════════════════════
  for (let c = 1; c <= 3; c++) {

    doc.addPage();
    drawPageShell(doc);

    const pageData = reportData[`customPage${c}`] || {};
    const contentText = pageData.content || "";

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(t("NOTES / SUGGESTIONS", "टिप्पणियाँ / सुझाव"), 14, 27);

    doc.setFillColor(255, 254, 249);
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, 38, pageWidth - 30, pageHeight - 74, 4, 4, "FD");

    if (contentText) {
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const lines = doc.splitTextToSize(contentText, pageWidth - 42);
      doc.text(lines, 20, 48);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: FINAL THANK YOU & DISCLAIMER PAGE
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc, true);

  // Add LastPage png asset
  if (lastPageGraphic) {
    doc.addImage(lastPageGraphic, "PNG", (pageWidth - 95) / 2, 35, 95, 60);
  }

  // "Thank You," text in dynamic green font
  doc.setTextColor(...greenText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(t("Thank You,", "धन्यवाद,"), pageWidth / 2, 115, { align: "center" });

  // Disclaimer Title
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(t("DISCLAIMER", "अस्वीकरण"), pageWidth / 2, 155, { align: "center" });

  // Disclaimer Body text
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const disclaimerText = t(
    "This report is for informational and entertainment purposes only. The findings provided are based on traditional numerological methods and should not be considered professional advice in any field, such as financial, medical, legal, or psychological. Results can be different, and any choices you make from this report are your own responsibility. Use this as a tool for self-reflection, and consult qualified professionals for significant life decisions.",
    "यह रिपोर्ट केवल सूचनात्मक और मनोरंजक उद्देश्यों के लिए है। प्रदान किए गए निष्कर्ष पारंपरिक अंकज्योतिषीय तरीकों पर आधारित हैं और इन्हें किसी भी क्षेत्र, जैसे वित्तीय, चिकित्सा, कानूनी या मनोवैज्ञानिक में पेशेवर सलाह नहीं माना जाना चाहिए। परिणाम भिन्न हो सकते हैं, और इस रिपोर्ट के आधार पर आपके द्वारा लिए गए निर्णय पूरी तरह से आपकी जिम्मेदारी हैं। इसका उपयोग आत्म-चिंतन के लिए एक साधन के रूप में करें, और महत्वपूर्ण जीवन निर्णयों के लिए योग्य पेशेवरों से परामर्श लें।"
  );
  const discLines = doc.splitTextToSize(disclaimerText, pageWidth - 36);
  doc.text(discLines, pageWidth / 2, 163, { align: "center" });

  // Add all footers sequentially
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Draw footer on all pages (cover is page 1, but user requested in all report pages)
    drawFooter(doc);
  }

  return doc;
};
