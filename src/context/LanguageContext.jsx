import { createContext, useContext, useState } from 'react';

// ── Translations ────────────────────────────────────────────────────────────
export const translations = {
  en: {
    // Home page
    title: 'Shining Ank Vastu',
    subtitle: 'Decode the cosmic numbers hidden in your name & birth — delivered as an exquisite, editable client report.',
    quickCalc: 'Quick Calculation',
    enterDetails: 'Enter Client Details',
    formSubtitle: 'Fill in the information below to generate a personalized numerology report',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    dob: 'Date of Birth',
    birthTime: 'Birth Time',
    birthPlace: 'Birth Place',
    address: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    spouseName: 'Spouse Name (Optional)',
    generateReport: 'Generate Numerology Report',
    generating: 'Generating Report...',
    required: '*',
    features: {
      name: { title: 'NAME', subtitle: 'Name Numerology', desc: 'Vibrational analysis of every letter in the native\'s full name.' },
      grid: { title: 'GRID', subtitle: '3×3 Number Grid', desc: 'Visualize present, missing & repeated numbers across mind, soul & action planes.' },
      vastu: { title: 'VASTU', subtitle: 'Kua & Direction', desc: 'Personal Kua number unlocks your auspicious direction and energy zones.' },
      report: { title: 'REPORT', subtitle: 'Editable PDF', desc: 'Refine every interpretation, then export a branded, print-ready PDF.' }
    },
    divider: 'Quick Divine Calculation',
    footer: 'Shining Ank Vastu - M : 9913961553',
    footerSubtitle: 'Vedic Numerology Report',
    errorRequired: 'Please fill in all required fields',

    // Shared navigation
    clientHistory: 'Client History',
    logout: 'Logout',
    backToHome: 'Back to Home',
    selectLanguage: 'Select Language',

    // ClientHistory page
    historyTitle: 'Client History',
    historySubtitle: 'total clients',
    searchPlaceholder: 'Search by name, email, or phone...',
    loadingClients: 'Loading clients...',
    noClientsFound: 'No Clients Found',
    noClientsSearch: 'No clients match your search criteria',
    noClientsEmpty: 'Start by adding your first client',
    addFirstClient: 'Add First Client',
    viewReport: 'View Report',
    delete: 'Delete',
    deleteConfirmMsg: 'Are you sure you want to delete this client?',
    confirmDelete: 'Yes, Delete',
    cancel: 'Cancel',
    emailLabel: 'Email:',
    phoneLabel: 'Phone:',
    genderLabel: 'Gender:',
    createdLabel: 'Created:',

    // ReportView page
    backHome: 'Back to Home',
    editReport: 'Edit Report',
    downloadPDF: 'Download PDF',
    saveChanges: 'Save Changes',
    saving: 'Saving…',

    // Report page content labels
    rpt: {
      // Hero / profile
      dateOfBirth: 'Date of Birth',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      genderMale: 'Male',
      genderFemale: 'Female',

      // Core numbers divider
      coreNumbers: 'Core Numbers',

      // Lucky Elements
      luckyElements: 'Lucky Elements',
      luckyNumber: 'Lucky Number',
      luckyDates: 'Lucky Dates',
      challengingDates: 'Challenging Dates',
      luckyColor: 'Lucky Color',
      challengingColor: 'Challenging Color',
      luckyDirection: 'Lucky Direction',
      coreElement: 'Core Element',
      personalYear: 'Personal Year',

      // Mobile Analysis
      mobileAnalysis: '📱 Mobile Number Analysis',
      mobileNumberAnalysis: 'MOBILE NUMBER ANALYSIS',
      mobileTotal: 'Mobile Total',
      mulank: 'Mulank',
      bhagyank: 'Bhagyank',
      detailedInsights: 'DETAILED COMPATIBILITY INSIGHTS',
      status: 'STATUS',
      noPhoneMsg: 'No phone number registered for this client profile. Add a phone number to generate mobile analysis.',

      // Name Numerology
      nameAnalysis: '🔤 Name Numerology Analysis',
      nameAnalysisCard: 'NAME ANALYSIS',
      firstNameCard: 'FIRST NAME',
      lastNameCard: 'LAST NAME',
      fullNameAnalysis: 'FULL NAME ANALYSIS',
      compound: 'Compound',
      single: 'Single',
      good: '✓ Good',
      needsAttention: '✗ Needs Attention',
      nameCount48: 'Name Count should not be 4 or 8.',
      firstNameCount48: 'First Name Count should not be 4 or 8.',
      lastNameCount48: 'Last Name Count should not be 4 or 8.',
      fullNameCount48: 'Full Name Count should not be 4 or 8.',
      currently: 'Currently',
      noNameMsg: 'No name available to analyze.',

      // Chaldean compatibility
      chaldeanTitle: 'Chaldean Number Compatibility Analysis',
      highlyCompatible: 'HIGHLY COMPATIBLE ✓',
      challenging: 'CHALLENGING — REMEDY RECOMMENDED',
      neutral: 'NEUTRAL',
      chaldeanRelationship: 'Chaldean Planetary Relationship & Remedies',

      // Career
      careerTitle: '💼 Professional & Career Outlook',
      esotericInsight: 'Esoteric Insight',
      connection: 'Connection',
      workstyle: 'Impact on Workstyle',
      topCareers: 'Top 3 Most Suitable Career Fields',
      field: 'Field',
      careersToAvoid: '⚠️ Careers to Avoid (Strict Warning)',
      goldenRemedy: '✨ Golden Professional Remedy',

      // Lo Shu Grid
      loShuTitle: '🔢 LO SHU GRID ANALYSIS',
      gridHighlights: 'Grid Highlights',
      presentNumbers: 'Present Numbers',
      missingNumbers: 'Missing Numbers',
      completeGrid: 'None — Complete Grid! ✓',
      repeatedNumbers: 'Repeated Numbers & Strength',
      digit: 'Digit',
      positivePlanes: 'Positive Planes / Arrows',
      weaknesses: 'Weaknesses / Negative Arrows',
      kuaNumber: 'Your Kua Number',

      // Missing Numbers & Remedies
      missingRemediesTitle: '🔴 MISSING NUMBERS & REMEDIES',
      missingNumber: 'Missing Number',
      effects: 'Effects',
      crystalRemedy: 'Crystal Remedy',
      effectLabel: 'EFFECT',
      remediesLabel: 'REMEDIES',

      // Repeated Numbers
      repeatedTitle: '🔁 REPEATED NUMBERS INFLUENCE',
      number: 'Number',
      times: 'times',

      // Suitable Professions
      professionsTitle: '💼 SUITABLE PROFESSIONS',

      // 3-Year Forecast
      forecastTitle: '📅 3-YEAR PERSONAL FORECAST',
      year: 'Year',

      // Personality
      personalityTitle: '✨ Personality Analysis',
      luckyNumberLabel: 'Lucky Number',
      luckyColorLabel: 'Lucky Color',
      luckyDirectionLabel: 'Lucky Direction',

      // Affirmations
      affirmationsTitle: '💫 Daily Affirmations',

      // Foreign Settlement
      foreignTitle: '✈️ Foreign Settlement Prediction',
      probabilityScore: 'Probability Score',
      present: 'Present',
      missing: 'Missing',
      none: 'None',
      foreignPredictions: 'FOREIGN SETTLEMENT PREDICTIONS',
      matchAlert: 'Match',
      alert: 'Alert',
      planetaryFriction: '⚠️ PLANETARY FRICTION',
      planetaryAlignment: '🪐 PLANETARY ALIGNMENT',

      // Marriage
      marriageTitle: '💍 Love vs Arranged Marriage Prediction',
      loveMarriage: 'Love Marriage',
      arrangedMarriage: 'Arranged Marriage',
      commentsJustification: 'COMMENTS & JUSTIFICATION',

      // Match Making
      matchTitle: '💞 Match Making Compatibility',
      enterProfiles: 'Enter both profiles for compatibility analysis',
      profile: 'Profile',
      namePlaceholder: 'Name',
      dobPlaceholder: 'Date of Birth (YYYY-MM-DD)',
      highlights: 'HIGHLIGHTS',
      sharableNumbers: '🔗 SHARABLE NUMBER PAIRS',
      compatInsights: 'COMPATIBILITY INSIGHTS',
      partnerNotDefined: 'Partner name not defined. Enter spouse name or partner details to generate Match Making analysis.',

      // Stock Market Compatibility
      stockTitle: '📈 Stock Market Compatibility',
      enterStockDetails: 'Enter Company/Stock Details for Suitability Analysis',
      companyNameLabel: 'Company / Stock Name',
      symbolLabel: 'Stock Symbol',
      listingDateLabel: 'Listing Date',
      stockDetails: 'STOCK DETAILS',
      bestIndicatorLabel: 'BEST SCORING INDICATOR',
      scoreLabel: 'Final Score',
      stockNotDefined: 'Stock details not defined. Enter Company Name, Stock Symbol, and Listing Date in Edit mode to generate Stock Suitability Analysis.',

      // Baby Birth Calculator
      babyTitle: '👶 Baby Birth Date Calculator',
      babyDateRangeLabel: 'Expected Delivery Date Range',
      babyStartDate: 'From Date',
      babyEndDate: 'To Date',
      babyAnalyze: 'Analyze Dates',
      babyGenderBoy: '👦 Recommend for Boy',
      babyGenderGirl: '👧 Recommend for Girl',
      babyTotalDays: 'Total Days',
      babyPerfectDates: 'Perfect Dates (Score ≥ 70)',
      babySummaryCard: 'DATES SUMMARY',
      babySelectedDates: 'Selected Date Range',
      babyDateBreakdown: 'DATE BREAKDOWN',
      babyDriver: 'Driver',
      babyConductor: 'Conductor',
      babyDCRelation: 'Driver–Conductor Relationship',
      babyKarmic: 'Karmic Number',
      babyMaster: 'Master Number',
      babyMissingNums: 'Missing Numbers',
      babyRepeatedNums: 'Repeated Numbers',
      babyGridStatus: 'Grid Status',
      babyOutOf9: 'out of 9 positions filled',
      babyPlaneMatrix: 'PLANES SUMMARY MATRIX',
      babyGenderSuitability: 'GENDER SUITABILITY',
      babyScore: 'Score',
      babyBoyScore: 'Boy Score',
      babyGirlScore: 'Girl Score',
      babyPerfect: '✨ Perfect',
      babyCompatible: '🟢 Compatible',
      babyNeutral: '🟡 Neutral',
      babyAnti: '🔴 Anti',
      babyNotDefined: 'Enter a date range in Edit mode to generate the Baby Birth Date analysis.',
      babyNone: 'None',
      babyNameSuggestionTitle: '👶 Baby Name Suggestion Report',
      babyNameAnalysisTitle: 'CORE NUMEROLOGY ANALYSIS',
      babyNameInitialsTitle: 'RECOMMENDED ALPHABETS (INITIALS)',
      babyNameTableTitle: 'COMPATIBLE NAME SUGGESTIONS TABLE',
      babyNameSrNo: 'Sr. No',
      babyNameSuggestedName: 'Suggested Name',
      babyNameBreakdown: 'Chaldean Letter Breakdown & Calculation',
      babyNameTotal: 'Final Name Total',
      babyNameMeaning: 'English Meaning',
      babyNameSelectedTarget: 'Selected Target Name Number',
      babyNameMissingPriority: 'Missing Priority Numbers',
      babyNameJustification: 'Justification',

      nameSpellingTitle: '✨ Name Spelling Suggestion',
      nameSpellingDescription: 'Chaldean & Lo Shu Grid compatible name suggestions based on missing priority numbers, Driver, and Conductor.',
      alphabetFilterLabel: 'Filter by Initial:',
      showAll: 'All',
      chaldeanCalculatorTitle: 'Chaldean Calculator',
      chaldeanValueExplanation: 'Below is the mathematical value breakdown of each character in the name according to the Chaldean Numerology system.',
      gridFulfillmentText: 'This name spelling vibration reduces to target number {target}, which successfully balances the missing grid elements.',

      // Notes
      notesPage1: '📝 Notes / Suggestions (Page 1)',
      notesPage2: '📝 Notes / Suggestions (Page 2)',
      notesPage3: '📝 Notes / Suggestions (Page 3)',
      noNotes: 'No notes / suggestions.',
      notesPlaceholder1: 'Write notes / suggestions for page 1...',
      notesPlaceholder2: 'Write notes / suggestions for page 2...',
      notesPlaceholder3: 'Write notes / suggestions for page 3...',

      // Contact Info (edit mode)
      contactInfo: '📞 Contact Information',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      addressLabel: 'Address',

      // Footer
      footerLine1: 'Shining Ank Vastu - M : 9913961553',
      footerLine2: 'Vedic Numerology Report',
      reportGenerated: 'Report generated on',
    },
  },

  hi: {
    // Home page
    title: 'शाइनिंग अंक वास्तु',
    subtitle: 'अपने नाम और जन्म में छिपे ब्रह्मांडीय अंकों को डिकोड करें — एक उत्कृष्ट, संपादन योग्य क्लाइंट रिपोर्ट के रूप में वितरित।',
    quickCalc: 'त्वरित गणना',
    enterDetails: 'ग्राहक विवरण दर्ज करें',
    formSubtitle: 'व्यक्तिगत अंकशास्त्र रिपोर्ट बनाने के लिए नीचे जानकारी भरें',
    fullName: 'पूरा नाम',
    phone: 'फ़ोन नंबर',
    email: 'ईमेल पता',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    dob: 'जन्म तिथि',
    birthTime: 'जन्म समय',
    birthPlace: 'जन्म स्थान',
    address: 'पता',
    city: 'शहर',
    state: 'राज्य',
    pincode: 'पिनकोड',
    spouseName: 'जीवनसाथी का नाम (वैकल्पिक)',
    generateReport: 'अंकशास्त्र रिपोर्ट बनाएं',
    generating: 'रिपोर्ट बनाई जा रही है...',
    required: '*',
    features: {
      name: { title: 'नाम', subtitle: 'नाम अंकशास्त्र', desc: 'मूल निवासी के पूरे नाम में प्रत्येक अक्षर का कंपन विश्लेषण।' },
      grid: { title: 'ग्रिड', subtitle: '3×3 संख्या ग्रिड', desc: 'मन, आत्मा और कर्म तलों में मौजूद, लापता और दोहराई गई संख्याओं की कल्पना करें।' },
      vastu: { title: 'वास्तु', subtitle: 'कुआ और दिशा', desc: 'व्यक्तिगत कुआ संख्या आपकी शुभ दिशा और ऊर्जा क्षेत्रों को अनलॉक करती है।' },
      report: { title: 'रिपोर्ट', subtitle: 'संपादन योग्य पीडीएफ', desc: 'प्रत्येक व्याख्या को परिष्कृत करें, फिर एक ब्रांडेड, प्रिंट-रेडी पीडीएफ निर्यात करें।' }
    },
    divider: 'त्वरित दिव्य गणना',
    footer: 'शाइनिंग अंक वास्तु - मो : 9913961553',
    footerSubtitle: 'वेदिक अंक ज्योतिष रिपोर्ट',
    errorRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें',

    // Shared navigation
    clientHistory: 'ग्राहक इतिहास',
    logout: 'लॉग आउट',
    backToHome: 'होम पर वापस',
    selectLanguage: 'भाषा चुनें',

    // ClientHistory page
    historyTitle: 'ग्राहक इतिहास',
    historySubtitle: 'कुल ग्राहक',
    searchPlaceholder: 'नाम, ईमेल या फ़ोन से खोजें...',
    loadingClients: 'ग्राहक लोड हो रहे हैं...',
    noClientsFound: 'कोई ग्राहक नहीं मिला',
    noClientsSearch: 'कोई ग्राहक खोज मानदंडों से मेल नहीं खाता',
    noClientsEmpty: 'अपना पहला ग्राहक जोड़कर शुरुआत करें',
    addFirstClient: 'पहला ग्राहक जोड़ें',
    viewReport: 'रिपोर्ट देखें',
    delete: 'हटाएं',
    deleteConfirmMsg: 'क्या आप वाकई इस ग्राहक को हटाना चाहते हैं?',
    confirmDelete: 'हाँ, हटाएं',
    cancel: 'रद्द करें',
    emailLabel: 'ईमेल:',
    phoneLabel: 'फ़ोन:',
    genderLabel: 'लिंग:',
    createdLabel: 'बनाया:',

    // ReportView page
    backHome: 'होम पर वापस',
    editReport: 'रिपोर्ट संपादित करें',
    downloadPDF: 'पीडीएफ डाउनलोड करें',
    saveChanges: 'परिवर्तन सहेजें',
    saving: 'सहेजा जा रहा है…',

    // Report page content labels
    rpt: {
      // Hero / profile
      dateOfBirth: 'जन्म तिथि',
      phoneNumber: 'फ़ोन नंबर',
      gender: 'लिंग',
      genderMale: 'पुरुष',
      genderFemale: 'महिला',

      // Core numbers divider
      coreNumbers: 'मूल अंक',

      // Lucky Elements
      luckyElements: 'शुभ तत्व',
      luckyNumber: 'शुभ अंक',
      luckyDates: 'शुभ तिथियाँ',
      challengingDates: 'चुनौतीपूर्ण तिथियाँ',
      luckyColor: 'शुभ रंग',
      challengingColor: 'चुनौतीपूर्ण रंग',
      luckyDirection: 'शुभ दिशा',
      coreElement: 'मूल तत्व',
      personalYear: 'व्यक्तिगत वर्ष',

      // Mobile Analysis
      mobileAnalysis: '📱 मोबाइल नंबर विश्लेषण',
      mobileNumberAnalysis: 'मोबाइल नंबर विश्लेषण',
      mobileTotal: 'मोबाइल योग',
      mulank: 'मूलांक',
      bhagyank: 'भाग्यांक',
      detailedInsights: 'विस्तृत संगतता अंतर्दृष्टि',
      status: 'स्थिति',
      noPhoneMsg: 'इस ग्राहक प्रोफ़ाइल के लिए कोई फ़ोन नंबर पंजीकृत नहीं है। मोबाइल विश्लेषण के लिए फ़ोन नंबर जोड़ें।',

      // Name Numerology
      nameAnalysis: '🔤 नाम अंकशास्त्र विश्लेषण',
      nameAnalysisCard: 'नाम विश्लेषण',
      firstNameCard: 'पहला नाम',
      lastNameCard: 'अंतिम नाम',
      fullNameAnalysis: 'पूर्ण नाम विश्लेषण',
      compound: 'यौगिक',
      single: 'एकल',
      good: '✓ शुभ',
      needsAttention: '✗ ध्यान आवश्यक',
      nameCount48: 'नाम अंक 4 या 8 नहीं होना चाहिए।',
      firstNameCount48: 'पहले नाम का अंक 4 या 8 नहीं होना चाहिए।',
      lastNameCount48: 'अंतिम नाम का अंक 4 या 8 नहीं होना चाहिए।',
      fullNameCount48: 'पूर्ण नाम का अंक 4 या 8 नहीं होना चाहिए।',
      currently: 'वर्तमान में',
      noNameMsg: 'विश्लेषण के लिए कोई नाम उपलब्ध नहीं है।',

      // Chaldean compatibility
      chaldeanTitle: 'चाल्डियन अंक संगतता विश्लेषण',
      highlyCompatible: 'उच्च संगत ✓',
      challenging: 'चुनौतीपूर्ण — उपाय अनुशंसित',
      neutral: 'तटस्थ',
      chaldeanRelationship: 'चाल्डियन ग्रहीय संबंध और उपाय',

      // Career
      careerTitle: '💼 व्यावसायिक एवं करियर दृष्टिकोण',
      esotericInsight: 'रहस्यमय अंतर्दृष्टि',
      connection: 'संबंध',
      workstyle: 'कार्यशैली पर प्रभाव',
      topCareers: 'शीर्ष 3 सर्वाधिक उपयुक्त करियर क्षेत्र',
      field: 'क्षेत्र',
      careersToAvoid: '⚠️ इन करियर से बचें (कड़ी चेतावनी)',
      goldenRemedy: '✨ स्वर्णिम व्यावसायिक उपाय',

      // Lo Shu Grid
      loShuTitle: '🔢 लो शु ग्रिड विश्लेषण',
      gridHighlights: 'ग्रिड मुख्य बिंदु',
      presentNumbers: 'उपस्थित अंक',
      missingNumbers: 'लापता अंक',
      completeGrid: 'कोई नहीं — पूर्ण ग्रिड! ✓',
      repeatedNumbers: 'दोहराए गए अंक एवं शक्ति',
      digit: 'अंक',
      positivePlanes: 'सकारात्मक तल / तीर',
      weaknesses: 'कमज़ोरियाँ / नकारात्मक तीर',
      kuaNumber: 'आपका कुआ नंबर',

      // Missing Numbers & Remedies
      missingRemediesTitle: '🔴 लापता अंक एवं उपाय',
      missingNumber: 'लापता अंक',
      effects: 'प्रभाव',
      crystalRemedy: 'क्रिस्टल उपाय',
      effectLabel: 'प्रभाव',
      remediesLabel: 'उपाय',

      // Repeated Numbers
      repeatedTitle: '🔁 दोहराए गए अंकों का प्रभाव',
      number: 'अंक',
      times: 'बार',

      // Suitable Professions
      professionsTitle: '💼 उपयुक्त व्यवसाय',

      // 3-Year Forecast
      forecastTitle: '📅 3-वर्षीय व्यक्तिगत पूर्वानुमान',
      year: 'वर्ष',

      // Personality
      personalityTitle: '✨ व्यक्तित्व विश्लेषण',
      luckyNumberLabel: 'शुभ अंक',
      luckyColorLabel: 'शुभ रंग',
      luckyDirectionLabel: 'शुभ दिशा',

      // Affirmations
      affirmationsTitle: '💫 दैनिक प्रतिज्ञान',

      // Foreign Settlement
      foreignTitle: '✈️ विदेश बसाव भविष्यवाणी',
      probabilityScore: 'संभावना स्कोर',
      present: 'उपस्थित',
      missing: 'लापता',
      none: 'कोई नहीं',
      foreignPredictions: 'विदेश बसाव भविष्यवाणी',
      matchAlert: 'मिलान',
      alert: 'सचेत',
      planetaryFriction: '⚠️ ग्रहीय घर्षण',
      planetaryAlignment: '🪐 ग्रहीय संरेखण',

      // Marriage
      marriageTitle: '💍 प्रेम बनाम अरेंज्ड विवाह भविष्यवाणी',
      loveMarriage: 'प्रेम विवाह',
      arrangedMarriage: 'अरेंज्ड विवाह',
      commentsJustification: 'टिप्पणियाँ एवं औचित्य',

      // Match Making
      matchTitle: '💞 विवाह संगतता',
      enterProfiles: 'संगतता विश्लेषण के लिए दोनों प्रोफ़ाइल दर्ज करें',
      profile: 'प्रोफ़ाइल',
      namePlaceholder: 'नाम',
      dobPlaceholder: 'जन्म तिथि (YYYY-MM-DD)',
      highlights: 'मुख्य बिंदु',
      sharableNumbers: '🔗 साझा अंक जोड़े',
      compatInsights: 'संगतता अंतर्दृष्टि',
      partnerNotDefined: 'पार्टनर का नाम परिभाषित नहीं। विवाह संगतता विश्लेषण के लिए जीवनसाथी का नाम या पार्टनर विवरण दर्ज करें।',

      // Stock Market Compatibility
      stockTitle: '📈 शेयर बाजार अनुकूलता विश्लेषण',
      enterStockDetails: 'अनुकूलता विश्लेषण के लिए कंपनी/स्टॉक का विवरण दर्ज करें',
      companyNameLabel: 'कंपनी / स्टॉक का नाम',
      symbolLabel: 'स्टॉक सिंबल',
      listingDateLabel: 'सूचीबद्धता की तिथि (Listing Date)',
      stockDetails: 'स्टॉक विवरण',
      bestIndicatorLabel: 'सर्वश्रेष्ठ संकेतक',
      scoreLabel: 'अंतिम स्कोर',
      stockNotDefined: 'स्टॉक विवरण दर्ज नहीं हैं। शेयर बाजार अनुकूलता रिपोर्ट बनाने के लिए संपादन (Edit) मोड में कंपनी का नाम, स्टॉक सिंबल और सूचीकरण तिथि दर्ज करें।',

      // Baby Birth Calculator
      babyTitle: '👶 बेबी बर्थ डेट कैलकुलेटर',
      babyDateRangeLabel: 'अपेक्षित डिलीवरी तिथि सीमा',
      babyStartDate: 'प्रारंभ तिथि',
      babyEndDate: 'अंतिम तिथि',
      babyAnalyze: 'तिथियाँ विश्लेषण करें',
      babyGenderBoy: '👦 बेबी बॉय हेतु अनुशंसा',
      babyGenderGirl: '👧 बेबी गर्ल हेतु अनुशंसा',
      babyTotalDays: 'कुल दिन',
      babyPerfectDates: 'परफेक्ट तिथियाँ (स्कोर ≥ 70)',
      babySummaryCard: 'तिथि सारांश',
      babySelectedDates: 'चयनित तिथि सीमा',
      babyDateBreakdown: 'तिथि विवरण',
      babyDriver: 'मूलांक',
      babyConductor: 'भाग्यांक',
      babyDCRelation: 'मूलांक-भाग्यांक संबंध',
      babyKarmic: 'कार्मिक अंक',
      babyMaster: 'मास्टर अंक',
      babyMissingNums: 'लापता अंक',
      babyRepeatedNums: 'दोहराए गए अंक',
      babyGridStatus: 'ग्रिड स्थिति',
      babyOutOf9: 'में से 9 स्थान भरे',
      babyPlaneMatrix: 'तल सारांश मैट्रिक्स',
      babyGenderSuitability: 'लिंग अनुकूलता',
      babyScore: 'स्कोर',
      babyBoyScore: 'बॉय स्कोर',
      babyGirlScore: 'गर्ल स्कोर',
      babyPerfect: '✨ परफेक्ट',
      babyCompatible: '🟢 संगत',
      babyNeutral: '🟡 तटस्थ',
      babyAnti: '🔴 विरोधी',
      babyNotDefined: 'बेबी बर्थ डेट विश्लेषण के लिए संपादन (Edit) मोड में तिथि सीमा दर्ज करें।',
      babyNone: 'कोई नहीं',
      babyNameSuggestionTitle: '👶 बच्चे के नाम सुझाव की रिपोर्ट',
      babyNameAnalysisTitle: 'मूल अंकशास्त्र विश्लेषण',
      babyNameInitialsTitle: 'अनुशंसित प्रारंभिक अक्षर (Initials)',
      babyNameTableTitle: 'संगत नाम सुझाव तालिका',
      babyNameSrNo: 'क्र. सं.',
      babyNameSuggestedName: 'सुझाया गया नाम',
      babyNameBreakdown: 'किल्डियन अक्षर विश्लेषण और गणना',
      babyNameTotal: 'अंतिम नाम योग',
      babyNameMeaning: 'अंग्रेजी अर्थ',
      babyNameSelectedTarget: 'चयनित लक्षित नाम अंक',
      babyNameMissingPriority: 'लापता प्राथमिकता अंक',
      babyNameJustification: 'औचित्य',

      nameSpellingTitle: '✨ नाम वर्तनी सुझाव (Name Spelling Suggestion)',
      nameSpellingDescription: 'मिसिंग नंबर्स, मूलांक और भाग्यांक के आधार पर चैल्डियन और लो शू ग्रिड अनुकूल नाम सुझाव।',
      alphabetFilterLabel: 'प्रारंभिक अक्षर द्वारा फ़िल्टर करें:',
      showAll: 'सभी',
      chaldeanCalculatorTitle: 'ચાલડિયન કેલ્ક્યુલેટર',
      chaldeanValueExplanation: 'ચાલડિયન અંકશાસ્ત્ર પદ્ધતિ અનુસાર નામના દરેક અક્ષરનું ગણિત મૂલ્ય નીચે દર્શાવેલ છે.',
      gridFulfillmentText: 'આ નામ સ્પેલિંગ વાઇબ્રેશન લક્ષ્યાંક અંક {target} માં રૂપાંતરિત થાય છે, જે ગ્રીડના ખૂટતા તત્વોને સફળતાપૂર્વક સંતુલિત કરે છે.',

      // Notes
      notesPage1: '📝 नोट्स / सुझाव (पृष्ठ 1)',
      notesPage2: '📝 नोट्स / सुझाव (पृष्ठ 2)',
      notesPage3: '📝 नोट्स / सुझाव (पृष्ठ 3)',
      noNotes: 'कोई नोट्स / सुझाव नहीं।',
      notesPlaceholder1: 'पृष्ठ 1 के लिए नोट्स / सुझाव लिखें...',
      notesPlaceholder2: 'पृष्ठ 2 के लिए नोट्स / सुझाव लिखें...',
      notesPlaceholder3: 'पृष्ठ 3 के लिए नोट्स / सुझाव लिखें...',

      // Contact Info (edit mode)
      contactInfo: '📞 संपर्क जानकारी',
      phoneLabel: 'फ़ोन',
      emailLabel: 'ईमेल',
      addressLabel: 'पता',

      // Footer
      footerLine1: 'शाइनिंग अंक वास्तु - मो : 9913961553',
      footerLine2: 'वेदिक अंक ज्योतिष रिपोर्ट',
      reportGenerated: 'रिपोर्ट तैयार की गई',
    },
  }
};

// ── Context ─────────────────────────────────────────────────────────────────
const LanguageContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('app_language') || 'en'
  );

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
