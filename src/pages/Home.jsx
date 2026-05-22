import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Grid3x3, Compass, FileDown, ChevronDown, Menu, X } from 'lucide-react';
import { generateReport } from '../utils/numerology';
import { saveClient } from '../services/clientService';
import './Home.css';

// Language translations
const translations = {
  en: {
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
    errorRequired: 'Please fill in all required fields'
  },
  hi: {
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
    errorRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें'
  }
};

function Home() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'male',
    phone: '',
    email: '',
    birthTime: '',
    birthPlace: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    spouseName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickCalculation = () => {
    // Scroll to form
    document.getElementById('calculation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.dob) {
      setError(t.errorRequired);
      return;
    }

    setLoading(true);

    try {
      // Generate numerology report
      const report = generateReport(formData.name, formData.dob, formData.gender);

      // Save to Firebase
      const clientData = {
        ...formData,
        report
      };

      const result = await saveClient(clientData);

      if (result.success) {
        // Navigate to report view
        navigate(`/report/${result.id}`, { state: { clientData } });
      } else {
        setError('Failed to save client data. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="logo-text">{t.title}</span>
            </div>

            {/* Desktop Navigation */}
            <div className="header-actions">
              <div className="language-selector">
                <button
                  className="btn-language"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {language === 'en' ? 'EN' : 'हिं'}
                  <ChevronDown size={16} />
                </button>
                {showLangMenu && (
                  <div className="language-menu">
                    <button
                      className={`lang-option ${language === 'en' ? 'active' : ''}`}
                      onClick={() => toggleLanguage('en')}
                    >
                      English
                    </button>
                    <button
                      className={`lang-option ${language === 'hi' ? 'active' : ''}`}
                      onClick={() => toggleLanguage('hi')}
                    >
                      हिंदी (Hindi)
                    </button>
                  </div>
                )}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/history')}
              >
                {language === 'en' ? 'Client History' : 'ग्राहक इतिहास'}
              </button>
              <button
                className="btn btn-outline btn-logout"
                onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  window.location.reload();
                }}
              >
                {language === 'en' ? 'Logout' : 'लॉग आउट'}
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button className="btn-menu" onClick={() => setShowSidebar(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer Overlay */}
      {showSidebar && (
        <div className="sidebar-backdrop" onClick={() => setShowSidebar(false)}>
          <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <div className="logo">
                <div className="logo-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="logo-text">{t.title}</span>
              </div>
              <button className="btn-close" onClick={() => setShowSidebar(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="sidebar-content">
              {/* Language Selector Section */}
              <div className="sidebar-section">
                <span className="sidebar-section-label">
                  {language === 'en' ? 'Select Language' : 'भाषा चुनें'}
                </span>
                <div className="sidebar-lang-selector">
                  <button
                    className={`sidebar-lang-btn ${language === 'en' ? 'active' : ''}`}
                    onClick={() => toggleLanguage('en')}
                  >
                    English
                  </button>
                  <button
                    className={`sidebar-lang-btn ${language === 'hi' ? 'active' : ''}`}
                    onClick={() => toggleLanguage('hi')}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="sidebar-actions-group">
                <button
                  className="sidebar-action-btn"
                  onClick={() => {
                    setShowSidebar(false);
                    navigate('/history');
                  }}
                >
                  {language === 'en' ? 'Client History' : 'ग्राहक इतिहास'}
                </button>

                <button
                  className="sidebar-action-btn logout"
                  onClick={() => {
                    setShowSidebar(false);
                    localStorage.removeItem('isAuthenticated');
                    window.location.reload();
                  }}
                >
                  {language === 'en' ? 'Logout' : 'लॉग आउट'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t.title}</h1>
            <p className="hero-subtitle">
              {t.subtitle}
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={handleQuickCalculation}
              >
                {t.quickCalc}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <h3 className="feature-title">{t.features.name.title}</h3>
              <h4 className="feature-subtitle">{t.features.name.subtitle}</h4>
              <p className="feature-description">
                {t.features.name.desc}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Grid3x3 size={32} strokeWidth={1.5} />
              </div>
              <h3 className="feature-title">{t.features.grid.title}</h3>
              <h4 className="feature-subtitle">{t.features.grid.subtitle}</h4>
              <p className="feature-description">
                {t.features.grid.desc}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Compass size={32} strokeWidth={1.5} />
              </div>
              <h3 className="feature-title">{t.features.vastu.title}</h3>
              <h4 className="feature-subtitle">{t.features.vastu.subtitle}</h4>
              <p className="feature-description">
                {t.features.vastu.desc}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FileDown size={32} strokeWidth={1.5} />
              </div>
              <h3 className="feature-title">{t.features.report.title}</h3>
              <h4 className="feature-subtitle">{t.features.report.subtitle}</h4>
              <p className="feature-description">
                {t.features.report.desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider">
        <div className="container">
          <div className="divider-line"></div>
          <div className="divider-text">
            <span className="divider-dot">•</span>
            <span>{t.divider}</span>
            <span className="divider-dot">•</span>
          </div>
          <div className="divider-line"></div>
        </div>
      </div>

      {/* Form Section */}
      <section className="form-section" id="calculation-form">
        <div className="container">
          <div className="form-container">
            <div className="form-header">
              <h3>{t.enterDetails}</h3>
              <p>{t.formSubtitle}</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-row-three">
                <div className="form-group">
                  <label className="form-label">
                    {t.fullName} <span className="required">{t.required}</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t.dob} <span className="required">{t.required}</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t.gender} <span className="required">{t.required}</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>
              </div>

              <div className="form-row-three">
                <div className="form-group">
                  <label className="form-label">{t.phone}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.email}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.birthTime}</label>
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-three">
                <div className="form-group">
                  <label className="form-label">{t.birthPlace}</label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="City name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.city}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.pincode}</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="PIN"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t.address}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Street address"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.spouseName}</label>
                  <input
                    type="text"
                    name="spouseName"
                    value={formData.spouseName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-large btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      {t.generating}
                    </>
                  ) : (
                    <>
                      {t.generateReport}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>{t.footer}</p>
          <p>{t.footerSubtitle}</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
