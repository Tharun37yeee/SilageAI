const { useState, useEffect, useRef } = React;

// Static sample presets for 1-click testing
const SAMPLE_PRESETS = [
  {
    id: 'moldy',
    label: 'Preset: Bunker Mold',
    tier: 'discard',
    icon: '🌾',
    farm: 'High Ridge Holsteins - Bunk 4',
    farmer_name: 'Dan Miller',
    phone: '(608) 555-0142',
    email: 'dan.miller@highridgeholsteins.com',
    location: 'Verona, WI',
    smell: 'Musty',
    moisture: 'Normal',
    ph: '5.4',
    image: '/static/sample_images/sample_moldy_bunker.jpg',
    desc: 'Visible white hyphae & blue-green Penicillium colonies'
  },
  {
    id: 'clostridial',
    label: 'Preset: Hidden Clostridial',
    tier: 'caution',
    icon: '🦠',
    farm: 'Sunburst Dairy - Pile B',
    farmer_name: 'Sarah Jenkins',
    phone: '(608) 555-0189',
    email: 's.jenkins@sunburstdairy.com',
    location: 'Mount Horeb, WI',
    smell: 'Ammonia-like',
    moisture: 'Wet/slimy',
    ph: '5.1',
    image: '/static/sample_images/sample_clostridial_wet.jpg',
    desc: 'Clean-looking photo, but Ammonia smell & high pH 5.1'
  },
  {
    id: 'caramelized',
    label: 'Preset: Caramelized Heat',
    tier: 'caution',
    icon: '🍂',
    farm: 'Prairie View - Trench East',
    farmer_name: 'Marcus Larson',
    phone: '(715) 555-0123',
    email: 'marcus@prairievieworganics.org',
    location: 'Eau Claire, WI',
    smell: 'Sweet/fermented normal',
    moisture: 'Dry',
    ph: '4.3',
    image: '/static/sample_images/sample_caramelized_heat.jpg',
    desc: 'Tobacco-brown Maillard heating bands and dry forage'
  },
  {
    id: 'safe',
    label: 'Preset: Prime Safe Silage',
    tier: 'safe',
    icon: '🌿',
    farm: 'Cedar Creek Dairy - Ag-Bag #2',
    farmer_name: 'Hannah Zimmerman',
    phone: '(920) 555-0177',
    email: 'hannah@cedarcreekdairy.com',
    location: 'Appleton, WI',
    smell: 'Sweet/fermented normal',
    moisture: 'Normal',
    ph: '3.9',
    image: '/static/sample_images/sample_safe_silage.jpg',
    desc: 'Golden-olive chop, sweet lactic aroma, pH 3.9'
  },
  {
    id: 'slimy',
    label: 'Preset: Slimy Anaerobic Rot',
    tier: 'discard',
    icon: '🕳️',
    farm: 'Oak Ridge Farms - Bunker South',
    farmer_name: 'Robert Kowalski',
    phone: '(608) 555-0195',
    email: 'rkowalski@oakridgefarms.net',
    location: 'Platteville, WI',
    smell: 'Rancid/rotten',
    moisture: 'Wet/slimy',
    ph: '5.8',
    image: '/static/sample_images/sample_slimy_rot.jpg',
    desc: 'Dark decomposed sludge with foul rancid odor'
  }
];

// Persistent Disclaimer Banner Component
function DisclaimerBanner() {
  return (
    <div className="bg-harvest-950/75 border-y border-harvest-600/30 px-4 py-2 text-xs text-harvest-200 flex items-center justify-center gap-2 text-center backdrop-blur-md">
      <span className="font-semibold text-harvest-300 flex items-center gap-1.5 shrink-0">
        <svg className="w-4 h-4 text-harvest-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        SilageIQ Decision-Support Prototype:
      </span>
      <span className="text-harvest-200/90 font-normal">
        SilageIQ is an explainable decision-support copilot, not a certified feed safety test. For confirmed mycotoxin or pathogen risk, submit a sample to an accredited feed testing lab.
      </span>
    </div>
  );
}

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('farmer'); // 'farmer' | 'dashboard'
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiStatus, setApiStatus] = useState({ gemini_active: false });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (window.location.pathname === '/dashboard') {
      setCurrentView('dashboard');
    }
    fetchHealth();
    fetchStats();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const saveApiKey = async () => {
    try {
      await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKeyInput })
      });
      setApiKeyModalOpen(false);
      fetchHealth();
    } catch (e) {
      alert('Failed to save API key');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-agri-900 text-stone-100 selection:bg-agri-400 selection:text-agri-950">
      {/* Header & Navigation */}
      <header className="sticky top-0 z-40 bg-agri-900/95 border-b border-agri-800/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo with Agriculture Leaf Icon */}
          <div 
            onClick={() => setCurrentView('farmer')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-500 to-agri-700 border border-agri-400/30 flex items-center justify-center shadow-lg shadow-agri-600/20 group-hover:scale-105 transition-transform text-white">
              <svg className="w-6 h-6 text-agri-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white group-hover:text-agri-300 transition-colors">
                  SilageIQ
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-agri-800 text-agri-300 border border-agri-700">
                  Agri-AI
                </span>
              </div>
              <p className="text-xs text-agri-400/80 hidden sm:block">Explainable Dairy Silage & Forage Copilot</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('farmer')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                currentView === 'farmer'
                  ? 'bg-agri-500 text-white shadow-md shadow-agri-600/20 border border-agri-400/40'
                  : 'text-agri-300 hover:text-white hover:bg-agri-800/80'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Farmer View</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('dashboard');
                fetchStats();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all relative ${
                currentView === 'dashboard'
                  ? 'bg-agri-800 text-agri-300 border border-agri-700 shadow-md'
                  : 'text-agri-300 hover:text-white hover:bg-agri-800/80'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Co-op Dashboard</span>
              {stats && stats.discard_count > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-extrabold rounded-full">
                  {stats.discard_count}
                </span>
              )}
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              title="Configure Gemini API Key"
              className="p-2 rounded-xl text-agri-400 hover:text-white hover:bg-agri-800 transition-colors ml-1 border border-agri-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {currentView === 'farmer' ? (
          <FarmerView 
            onViewInDashboard={() => {
              setCurrentView('dashboard');
              fetchStats();
            }}
            onSubmissionCreated={fetchStats}
          />
        ) : (
          <InstitutionDashboard 
            onBackToFarmer={() => setCurrentView('farmer')} 
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-agri-800/60 bg-agri-950 py-5 text-center text-xs text-agri-400/80">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-300">SilageIQ</span>
            <span>•</span>
            <span>Explainable Silage Quality & Safety Copilot for Dairy Producers & Co-ops</span>
          </div>
          <div className="flex items-center gap-3 text-agri-400/70">
            <span>Agronomic Engine: <strong className="text-agri-300">{apiStatus.gemini_active ? 'Gemini 2.5 Vision' : 'Dairy Science Rule Matrix'}</strong></span>
            <span>•</span>
            <span>SQLite Local</span>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-agri-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-agri-850 border border-agri-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-heading font-bold text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              Gemini API Key Configuration
            </h3>
            <p className="text-xs text-stone-300 mb-4">
              Enter your Google Gemini API Key to enable live multimodal visual reasoning. If left empty, SilageIQ will use its deterministic Agronomic Dairy Science Engine.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400 mb-4 font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:bg-agri-800"
              >
                Cancel
              </button>
              <button
                onClick={saveApiKey}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-agri-500 hover:bg-agri-400 text-white shadow-lg shadow-agri-600/30"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 1: FARMER VIEW COMPONENT
// -------------------------------------------------------------
function FarmerView({ onViewInDashboard, onSubmissionCreated }) {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [samplePresetPath, setSamplePresetPath] = useState(null);
  
  const [smellRating, setSmellRating] = useState('Sweet/fermented normal');
  const [moistureFeel, setMoistureFeel] = useState('Normal');
  const [phReading, setPhReading] = useState('');
  const [farmName, setFarmName] = useState('Oak Ridge Farm - Bunker #2');
  
  // Farmer Contact Information State (Required: Name, Phone. Optional: Email, Location)
  const [farmerName, setFarmerName] = useState('Dan Miller');
  const [phoneNumber, setPhoneNumber] = useState('(608) 555-0142');
  const [email, setEmail] = useState('dan.miller@highridgeholsteins.com');
  const [farmLocation, setFarmLocation] = useState('Verona, WI');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  const fileInputRef = useRef(null);

  // Apply a sample preset for 1-click test
  const handleApplyPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setFarmName(preset.farm);
    setFarmerName(preset.farmer_name || '');
    setPhoneNumber(preset.phone || '');
    setEmail(preset.email || '');
    setFarmLocation(preset.location || '');
    setSmellRating(preset.smell);
    setMoistureFeel(preset.moisture);
    setPhReading(preset.ph);
    setPhotoPreview(preset.image);
    setSamplePresetPath(preset.image);
    setPhoto(null);
    setVerdict(null);
  };

  // Handle local file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setSamplePresetPath(null);
      setSelectedPresetId(null);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setVerdict(null);
    }
  };

  const handleClearPhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setSamplePresetPath(null);
    setSelectedPresetId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit analysis form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo && !samplePresetPath && !photoPreview) {
      alert('Please upload a photo of the silage or select a demo sample.');
      return;
    }
    if (!farmerName.trim()) {
      alert('Please enter the Farmer Contact Name (required for triage follow-up).');
      return;
    }
    if (!phoneNumber.trim()) {
      alert('Please enter a Phone Number (required for triage follow-up).');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('farm_name', farmName || 'Oak Ridge Farm - Bunker #2');
      formData.append('farmer_name', farmerName.trim());
      formData.append('phone_number', phoneNumber.trim());
      if (email.trim()) formData.append('email', email.trim());
      if (farmLocation.trim()) formData.append('farm_location', farmLocation.trim());
      formData.append('smell_rating', smellRating);
      formData.append('moisture_feel', moistureFeel);
      if (phReading) formData.append('ph_reading', phReading);

      if (photo) {
        formData.append('photo', photo);
      } else if (samplePresetPath) {
        formData.append('sample_preset', samplePresetPath);
      } else if (photoPreview && photoPreview.startsWith('data:')) {
        formData.append('photo_base64', photoPreview);
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed. Server responded with ' + res.status);
      }

      const data = await res.json();
      setVerdict(data);
      if (onSubmissionCreated) onSubmissionCreated();

      // Scroll to verdict smoothly
      setTimeout(() => {
        const el = document.getElementById('verdict-card');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      alert('Error analyzing silage: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setVerdict(null);
    handleClearPhoto();
    setSmellRating('Sweet/fermented normal');
    setMoistureFeel('Normal');
    setPhReading('');
    setFarmName('Oak Ridge Farm - Bunker #2');
    setFarmerName('Dan Miller');
    setPhoneNumber('(608) 555-0142');
    setEmail('dan.miller@highridgeholsteins.com');
    setFarmLocation('Verona, WI');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-agri-850 border border-agri-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>Silage Quality Copilot</span>
            </h1>
            <span className="text-xs font-bold text-agri-300 bg-agri-800 border border-agri-700 px-2.5 py-0.5 rounded-full">
              Farmer Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Submit a silage photo and sensory cues for an instant, explainable safety verdict before feeding your dairy herd.
          </p>
        </div>

        <button
          onClick={onViewInDashboard}
          className="self-start sm:self-auto text-xs font-bold text-agri-300 hover:text-white bg-agri-800 hover:bg-agri-750 px-3.5 py-2 rounded-xl border border-agri-700 flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>View Co-op Triage Board</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </div>

      {/* Quick Test Demo Presets */}
      <div className="bg-agri-850 border border-agri-800/90 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            1-Click Demo Samples (Quick Testing)
          </span>
          <span className="text-[11px] text-agri-400/80">Select any sample to populate fields</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {SAMPLE_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`specimen-card text-left p-3 rounded-xl border transition-all flex flex-col justify-between text-xs ${
                  isSelected
                    ? 'border-agri-400 bg-agri-800 shadow-md'
                    : 'border-agri-800/80 bg-agri-900/90 hover:border-agri-700 hover:bg-agri-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="truncate text-white">{p.label}</span>
                    <span className="text-base">{p.icon}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-agri-800/80 text-[10px] text-agri-400 flex justify-between font-mono">
                  <span>pH: {p.ph}</span>
                  <span className={`capitalize font-bold ${
                    p.tier === 'discard' ? 'text-red-400' : p.tier === 'caution' ? 'text-amber-400' : 'text-agri-300'
                  }`}>{p.tier}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Single-Screen Form */}
      <form onSubmit={handleSubmit} className="bg-agri-850 border border-agri-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        
        {/* Photo Upload Section */}
        <div>
          <label className="block text-sm font-heading font-bold text-white mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Silage Photo Specimen <span className="text-red-400">*</span>
            </span>
            <span className="text-xs text-stone-400 font-normal">Close-up of bunker face, bag, or pile</span>
          </label>

          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-agri-700 bg-agri-950 group">
              <img 
                src={photoPreview} 
                alt="Silage preview" 
                className="w-full h-56 sm:h-72 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-agri-950/90 via-transparent to-transparent flex items-end justify-between p-4">
                <div className="text-xs text-stone-200 bg-agri-900/90 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-agri-700">
                  {photo ? photo.name : 'Sample Demo Image Loaded'}
                </div>
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-600/30 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="border-2 border-dashed border-agri-700 hover:border-agri-400 bg-agri-900/60 hover:bg-agri-900/90 rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-agri-800 border border-agri-700 flex items-center justify-center text-agri-300 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Tap to capture with Camera or upload photo
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  JPG, PNG, or WEBP. Good lighting helps identify mold hyphae and caramelization.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-agri-800 text-xs font-semibold text-agri-300 border border-agri-700">
                Browse Photo
              </span>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Sensory Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Smell Rating Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <span>👃 Fermentation Aroma</span>
              <span className="text-red-400">*</span>
            </label>
            <select
              value={smellRating}
              onChange={(e) => setSmellRating(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400"
            >
              <option value="Sweet/fermented normal">Sweet/fermented normal (Pleasant bread/lactic)</option>
              <option value="Sour">Sour (Strong vinegar / acetic acid)</option>
              <option value="Musty">Musty (Damp basement / mold spores)</option>
              <option value="Ammonia-like">Ammonia-like (Sharp pungent / protein breakdown)</option>
              <option value="Rancid/rotten">Rancid/rotten (Foul butyric / decay)</option>
            </select>
            <p className="text-[11px] text-stone-400">
              Aroma is one of the most reliable indicators of anaerobic fermentation success.
            </p>
          </div>

          {/* Moisture Feel Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <span>💧 Moisture Feel</span>
              <span className="text-red-400">*</span>
            </label>
            <select
              value={moistureFeel}
              onChange={(e) => setMoistureFeel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400"
            >
              <option value="Dry">Dry (Brittle, feels &lt;30% DM)</option>
              <option value="Normal">Normal (Slightly moist, 32%–38% DM)</option>
              <option value="Wet/slimy">Wet/slimy (Leaves wet residue on hands, seepage)</option>
            </select>
            <p className="text-[11px] text-stone-400">
              Squeeze test: Wet/slimy silage increases clostridial risk; Dry leads to heating.
            </p>
          </div>

          {/* Optional pH Strip Reading */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                🧪 pH Strip Reading <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[11px] text-agri-400 font-mono">Normal Corn Silage: 3.8 – 4.2</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="8.5"
                placeholder="e.g. 4.0 (Leave blank if not measured)"
                value={phReading}
                onChange={(e) => setPhReading(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400 font-mono"
              />
              {phReading && (
                <button
                  type="button"
                  onClick={() => setPhReading('')}
                  className="absolute right-2.5 top-2.5 text-xs text-stone-400 hover:text-stone-200"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              pH above 4.8 indicates clostridial activity or aerobic deterioration.
            </p>
          </div>

          {/* Farm Name / ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
              🏷️ Farm Name / Bunker ID
            </label>
            <input
              type="text"
              placeholder="e.g. Oak Ridge Farm - Bunker #2 South"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400"
            />
            <p className="text-[11px] text-stone-400">
              Helps track submissions in the cooperative/lab dashboard.
            </p>
          </div>
        </div>

        {/* Farmer Contact Information Section */}
        <div className="pt-4 border-t border-agri-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Farmer Contact Information
            </span>
            <span className="text-[11px] text-stone-400 font-normal">Enables agronomist follow-up for Discard/Caution tiers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Farmer Contact Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1">
                <span>👤 Farmer Contact Name</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dan Miller"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1">
                  <span>📞 Phone Number</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-agri-400 font-mono">e.g. (608) 555-0142</span>
              </div>
              <input
                type="tel"
                required
                placeholder="e.g. (608) 555-0142"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400 font-mono"
              />
            </div>

            {/* Email Address (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                ✉️ Email Address <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="e.g. dan.miller@highridgeholsteins.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400"
              />
            </div>

            {/* Farm Location / Village (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                📍 Farm Location / Village <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Verona, WI"
                value={farmLocation}
                onChange={(e) => setFarmLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-agri-950 border border-agri-700 rounded-xl text-sm text-white focus:outline-none focus:border-agri-400"
              />
            </div>
          </div>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl font-heading font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-xl ${
              isSubmitting
                ? 'bg-agri-800 text-stone-400 cursor-not-allowed'
                : 'bg-agri-400 hover:bg-agri-300 text-agri-950 shadow-agri-500/25 hover:shadow-agri-400/40 hover:scale-[1.005]'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-agri-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Silage Quality & Fermentation...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Analyze Feed Safety Now</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* VERDICT CARD (Displayed after submission) */}
      {verdict && (
        <div 
          id="verdict-card" 
          className={`rounded-3xl border-2 p-5 sm:p-8 shadow-2xl transition-all animate-fade-in ${
            verdict.severity_level === 'discard'
              ? 'tier-card-discard'
              : verdict.severity_level === 'caution'
              ? 'tier-card-caution'
              : 'tier-card-safe'
          }`}
        >
          {/* Card Top: Severity Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-agri-800/80">
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg ${
                verdict.severity_level === 'discard'
                  ? 'bg-red-600 text-white shadow-red-600/30'
                  : verdict.severity_level === 'caution'
                  ? 'bg-harvest-400 text-agri-950 shadow-harvest-400/30'
                  : 'bg-agri-400 text-agri-950 shadow-agri-400/30'
              }`}>
                {verdict.severity_level === 'discard' ? '⛔' : verdict.severity_level === 'caution' ? '⚠️' : '✅'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-heading text-xl sm:text-2xl font-extrabold tracking-tight ${
                    verdict.severity_level === 'discard'
                      ? 'text-red-400'
                      : verdict.severity_level === 'caution'
                      ? 'text-harvest-300'
                      : 'text-agri-300'
                  }`}>
                    {verdict.severity_tier}
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-300 mt-0.5">
                  {verdict.severity_level === 'safe'
                    ? '✓ No visual or sensory spoilage indicators detected'
                    : verdict.severity_level === 'caution'
                    ? 'Moderate risk factors identified — management action recommended'
                    : 'Critical feed hazard — high mycotoxin/pathogen risk'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-agri-300 font-mono bg-agri-950 px-3 py-1.5 rounded-xl border border-agri-800">
                ID #{verdict.id} • {verdict.farm_name}
              </span>
            </div>
          </div>

          {/* Card Body: Explanation & Concrete Action */}
          <div className="py-6 space-y-5">
            
            {/* Plain-Language Explanation */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Plain-Language Assessment
              </h3>
              <p className="text-sm sm:text-base text-stone-100 leading-relaxed font-normal bg-agri-950/80 p-4 rounded-2xl border border-agri-800/80">
                {verdict.explanation}
              </p>
            </div>

            {/* Concrete Action Box */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
              verdict.severity_level === 'discard'
                ? 'bg-red-950/50 border-red-500/40'
                : verdict.severity_level === 'caution'
                ? 'bg-harvest-950/50 border-harvest-500/40'
                : 'bg-agri-950/60 border-agri-400/40'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  verdict.severity_level === 'discard'
                    ? 'bg-red-500/20 text-red-400'
                    : verdict.severity_level === 'caution'
                    ? 'bg-harvest-400/20 text-harvest-300'
                    : 'bg-agri-400/20 text-agri-300'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${
                    verdict.severity_level === 'discard'
                      ? 'text-red-300'
                      : verdict.severity_level === 'caution'
                      ? 'text-harvest-200'
                      : 'text-agri-200'
                  }`}>
                    Recommended Action
                  </h4>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1">
                    {verdict.recommended_action}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Cues Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="bg-agri-950 border border-agri-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Smell Rating</span>
                <span className="text-xs font-semibold text-stone-200 mt-0.5 block truncate">{verdict.smell_rating}</span>
              </div>
              <div className="bg-agri-950 border border-agri-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Moisture Feel</span>
                <span className="text-xs font-semibold text-stone-200 mt-0.5 block truncate">{verdict.moisture_feel}</span>
              </div>
              <div className="bg-agri-950 border border-agri-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">pH Reading</span>
                <span className="text-xs font-mono font-bold text-agri-300 mt-0.5 block">
                  {verdict.ph_reading !== null && verdict.ph_reading !== undefined ? verdict.ph_reading : 'Not Provided'}
                </span>
              </div>
              <div className="bg-agri-950 border border-agri-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">AI Confidence</span>
                <span className="text-xs font-mono font-bold text-stone-200 mt-0.5 block">
                  {Math.round((verdict.confidence_score || 0.95) * 100)}% ({verdict.source || 'AI'})
                </span>
              </div>
            </div>

            {/* Agronomist Raw Reasoning Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowReasoning(!showReasoning)}
                className="text-xs font-semibold text-agri-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>{showReasoning ? 'Hide' : 'Show'} Agronomist Diagnostic Reasoning (Co-op View)</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${showReasoning ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {showReasoning && (
                <div className="mt-3 p-4 rounded-xl bg-agri-950 border border-agri-800 text-xs font-mono text-stone-300 leading-relaxed animate-fade-in">
                  <div className="font-bold text-agri-300 mb-1">RAW DIAGNOSTIC REASONING:</div>
                  <p>{verdict.raw_reasoning}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="pt-6 border-t border-agri-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-750 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-agri-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Submit Another Batch
            </button>

            <button
              type="button"
              onClick={onViewInDashboard}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-agri-500 hover:bg-agri-400 text-white text-xs font-bold transition-all shadow-lg shadow-agri-600/25 flex items-center justify-center gap-2"
            >
              <span>View in Co-op Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 2: INSTITUTION DASHBOARD COMPONENT
// -------------------------------------------------------------
function InstitutionDashboard({ onBackToFarmer }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters & Sorting state
  const [hideSafe, setHideSafe] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('severity_desc'); // default: severity descending

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [hideSafe, severityFilter, searchQuery, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hideSafe) params.append('hide_safe', 'true');
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort_by', sortBy);

      const [subRes, statsRes] = await Promise.all([
        fetch(`/api/submissions?${params.toString()}`),
        fetch('/api/stats')
      ]);

      const subData = await subRes.json();
      const statsData = await statsRes.json();

      setSubmissions(subData.items || []);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollowup = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/submissions/${id}/followup`, { method: 'PATCH' });
      const updated = await res.json();
      setSubmissions((prev) => prev.map(s => s.id === id ? updated : s));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(updated);
      }
      // refresh stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-agri-850 border border-agri-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-white">Co-op & Feed Lab Triage Dashboard</h1>
            <span className="text-xs font-bold text-harvest-300 bg-harvest-950 border border-harvest-700/60 px-2.5 py-0.5 rounded-full">
              Agronomist View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Monitor and prioritize incoming farm silage submissions. Sorted by highest risk first to identify which dairy producers need urgent consultation today.
          </p>
        </div>

        <button
          onClick={onBackToFarmer}
          className="self-start sm:self-auto px-4 py-2.5 bg-agri-500 hover:bg-agri-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-agri-600/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>New Farmer Submission</span>
        </button>
      </div>

      {/* Triage Stats Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Total Submissions */}
          <div className="bg-agri-850 border border-agri-800 p-4 rounded-2xl">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total Submissions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-white">{stats.total_submissions}</span>
              <span className="text-xs text-stone-400">all batches</span>
            </div>
          </div>

          {/* Discard (Critical Urgent Follow-ups) */}
          <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">Urgent Calls Today</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-red-400">{stats.discard_count}</span>
              <span className="text-xs text-red-300/80">Discard tier</span>
            </div>
          </div>

          {/* Caution (Ration Adjustments) */}
          <div className="bg-harvest-950/40 border border-harvest-500/40 p-4 rounded-2xl">
            <span className="text-xs font-bold text-harvest-400 uppercase tracking-wider block">Caution / Watch</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-harvest-400">{stats.caution_count}</span>
              <span className="text-xs text-harvest-300/80">secondary ferment.</span>
            </div>
          </div>

          {/* Safe Tiers */}
          <div className="bg-agri-950/60 border border-agri-400/40 p-4 rounded-2xl">
            <span className="text-xs font-bold text-agri-300 uppercase tracking-wider block">Safe to Feed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-agri-300">{stats.safe_count}</span>
              <span className="text-xs text-agri-200/80">no spoilage</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Hide Safe Toggle, Search & Sort */}
      <div className="bg-agri-850 border border-agri-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by farm name, bunker ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-agri-950 border border-agri-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-agri-400"
            />
            <svg className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Hide Safe Toggle & Sort Selector */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            
            {/* Quick Filter: Hide Safe Tier */}
            <label className="flex items-center gap-2 cursor-pointer bg-agri-950 border border-agri-700 px-3 py-1.5 rounded-xl hover:border-agri-600 transition-colors">
              <input
                type="checkbox"
                checked={hideSafe}
                onChange={(e) => setHideSafe(e.target.checked)}
                className="rounded text-agri-500 focus:ring-agri-400 h-4 w-4 bg-agri-900 border-agri-700"
              />
              <span className="text-xs font-semibold text-stone-300">
                Hide "Safe" Tier
              </span>
            </label>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-agri-950 border border-agri-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-agri-400"
              >
                <option value="severity_desc">⚠️ Highest Risk First (Default)</option>
                <option value="newest">🕒 Newest Submissions First</option>
                <option value="oldest">⏳ Oldest Submissions First</option>
                <option value="farm_asc">🏷️ Farm Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-semibold mr-1">Severity:</span>
          {[
            { id: 'all', label: 'All Entries' },
            { id: 'discard', label: '🔴 Discard Only' },
            { id: 'caution', label: '🟡 Caution Only' },
            { id: 'safe', label: '🟢 Safe Only' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSeverityFilter(pill.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                severityFilter === pill.id
                  ? 'bg-agri-700 text-white border border-agri-500 shadow-sm'
                  : 'bg-agri-950 text-stone-400 border border-agri-800 hover:text-white hover:bg-agri-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List / Triage Table */}
      {loading ? (
        <div className="py-16 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-agri-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm">Loading submissions triage data...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-16 bg-agri-850/60 border border-agri-800 rounded-2xl text-center p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-agri-800 text-stone-400 mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-white">No submissions match the current filter</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try turning off "Hide Safe Tier" or clearing the search query to see all recorded farm samples.
          </p>
          <button
            onClick={() => {
              setHideSafe(false);
              setSeverityFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-agri-800 hover:bg-agri-750 text-xs font-semibold rounded-xl text-stone-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((item) => {
            const isDiscard = item.severity_level === 'discard';
            const isCaution = item.severity_level === 'caution';
            const isSafe = item.severity_level === 'safe';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`specimen-card p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDiscard
                    ? 'bg-agri-850 border-red-500/40 hover:border-red-500 hover:bg-red-950/20'
                    : isCaution
                    ? 'bg-agri-850 border-harvest-500/40 hover:border-harvest-500 hover:bg-harvest-950/20'
                    : 'bg-agri-850 border-agri-800 hover:border-agri-400/50 hover:bg-agri-800/80'
                }`}
              >
                {/* Left: Thumbnail + Details */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Silage Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-agri-950 shrink-0 border border-agri-700">
                    <img
                      src={item.photo_url}
                      alt={item.farm_name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                    />
                    <span className={`absolute bottom-1 right-1 text-[10px] font-bold px-1 rounded ${
                      isDiscard ? 'bg-red-600 text-white' : isCaution ? 'bg-harvest-400 text-agri-950' : 'bg-agri-500 text-white'
                    }`}>
                      #{item.id}
                    </span>
                  </div>

                  {/* Farm info & Summary */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-agri-300 transition-colors">
                        {item.farm_name}
                      </h3>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {item.timestamp}
                      </span>
                    </div>

                    {/* Farmer Contact Info Block */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-300 py-0.5">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <svg className="w-3.5 h-3.5 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>{item.farmer_name || 'Farm Operator'}</span>
                      </span>
                      {item.phone_number && (
                        <span className="flex items-center gap-1 font-mono text-agri-300 bg-agri-950 px-2 py-0.5 rounded border border-agri-800 text-[11px]">
                          <svg className="w-3 h-3 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                          <span>{item.phone_number}</span>
                        </span>
                      )}
                      {item.farm_location && (
                        <span className="text-[11px] text-stone-400 flex items-center gap-0.5">
                          📍 {item.farm_location}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 line-clamp-1 sm:line-clamp-2">
                      {item.short_summary || item.explanation}
                    </p>

                    {/* Sensory Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      <span className="bg-agri-950 border border-agri-800 px-2 py-0.5 rounded text-stone-300">
                        👃 {item.smell_rating}
                      </span>
                      <span className="bg-agri-950 border border-agri-800 px-2 py-0.5 rounded text-stone-300">
                        💧 {item.moisture_feel}
                      </span>
                      {item.ph_reading !== null && item.ph_reading !== undefined && (
                        <span className="bg-agri-950 border border-agri-800 px-2 py-0.5 rounded font-mono font-bold text-agri-300">
                          pH {item.ph_reading}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Tier Badge & Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-agri-800">
                  
                  {/* Severity Badge */}
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wide ${
                      isDiscard
                        ? 'badge-discard'
                        : isCaution
                        ? 'badge-caution'
                        : 'badge-safe'
                    }`}>
                      <span>{isDiscard ? '🔴' : isCaution ? '🟡' : '🟢'}</span>
                      <span>{item.severity_tier}</span>
                    </span>
                  </div>

                  {/* Follow up status toggle */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleFollowup(item.id, e)}
                    title={item.followed_up ? "Mark as Pending Call" : "Mark as Agronomist Contacted"}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      item.followed_up
                        ? 'bg-agri-950 text-agri-300 border border-agri-400/40'
                        : 'bg-agri-800 hover:bg-agri-750 text-stone-300 border border-agri-700'
                    }`}
                  >
                    {item.followed_up ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-agri-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>Contacted</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-harvest-400"></span>
                        <span>Pending Call</span>
                      </>
                    )}
                  </button>

                  {/* View Details Expand Icon */}
                  <div className="p-2 text-stone-400 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL EXPAND MODAL (Full Farmer View + Contact Profile + Conditional Actions + Raw Agronomist Reasoning) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-agri-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-agri-850 border border-agri-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-agri-800">
              <div>
                <span className="text-xs font-mono text-stone-400">Submission #{selectedItem.id} • {selectedItem.timestamp}</span>
                <h2 className="font-heading text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  {selectedItem.farm_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-agri-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Silage Photo High-Res */}
            <div className="relative rounded-2xl overflow-hidden border border-agri-700 bg-agri-950 max-h-72">
              <img
                src={selectedItem.photo_url}
                alt={selectedItem.farm_name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold shadow-lg ${
                  selectedItem.severity_level === 'discard'
                    ? 'badge-discard'
                    : selectedItem.severity_level === 'caution'
                    ? 'badge-caution'
                    : 'badge-safe'
                }`}>
                  {selectedItem.severity_tier}
                </span>
              </div>
            </div>

            {/* Farmer Contact Profile Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-agri-950 border border-agri-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-agri-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Farmer Contact Profile
                </h4>
                {selectedItem.farm_location && (
                  <span className="text-xs text-agri-300 flex items-center gap-1">
                    📍 {selectedItem.farm_location}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-agri-900/90 border border-agri-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Farmer Name</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{selectedItem.farmer_name || 'N/A'}</span>
                </div>
                <div className="bg-agri-900/90 border border-agri-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Phone Number</span>
                  <span className="text-sm font-bold text-agri-300 font-mono mt-0.5 block">{selectedItem.phone_number || 'N/A'}</span>
                </div>
                <div className="bg-agri-900/90 border border-agri-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Email Address</span>
                  <span className="text-xs font-medium text-stone-200 mt-0.5 block truncate">{selectedItem.email || 'Not provided'}</span>
                </div>
                <div className="bg-agri-900/90 border border-agri-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Location / Village</span>
                  <span className="text-xs font-medium text-stone-200 mt-0.5 block truncate">{selectedItem.farm_location || 'Not provided'}</span>
                </div>
              </div>

              {/* Conditional Agronomist Contact Action Buttons: ONLY on Discard and Caution, HIDDEN on Safe */}
              {selectedItem.severity_level !== 'safe' && (
                <div className="pt-2 border-t border-agri-800/80 flex flex-wrap items-center gap-2">
                  {selectedItem.phone_number && (
                    <a
                      href={`tel:${selectedItem.phone_number.replace(/[^0-9+]/g, '')}`}
                      className="px-4 py-2 bg-agri-500 hover:bg-agri-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-agri-600/25 transition-all flex-1 justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      <span>Call Farmer ({selectedItem.phone_number})</span>
                    </a>
                  )}
                  {selectedItem.email && (
                    <a
                      href={`mailto:${selectedItem.email}?subject=SilageIQ%20Triage%20Alert%20-%20${encodeURIComponent(selectedItem.farm_name)}&body=Hello%20${encodeURIComponent(selectedItem.farmer_name || 'Farmer')},%0D%0A%0D%0AWe%20reviewed%20your%20silage%20submission%20for%20${encodeURIComponent(selectedItem.farm_name)}%20(Verdict:%20${encodeURIComponent(selectedItem.severity_tier)}).%0D%0A%0D%0ARecommended%20Action:%20${encodeURIComponent(selectedItem.recommended_action)}`}
                      className="px-4 py-2 bg-agri-800 hover:bg-agri-750 text-agri-200 hover:text-white border border-agri-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all flex-1 justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      <span>Email Farmer</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Plain-Language Explanation */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Farmer Assessment (Plain Language)
              </h4>
              <p className="text-sm text-stone-200 leading-relaxed bg-agri-950 p-4 rounded-xl border border-agri-800">
                {selectedItem.explanation}
              </p>
            </div>

            {/* Recommended Action */}
            <div className={`p-4 rounded-xl border ${
              selectedItem.severity_level === 'discard'
                ? 'bg-red-950/40 border-red-500/40 text-red-200'
                : selectedItem.severity_level === 'caution'
                ? 'bg-harvest-950/40 border-harvest-500/40 text-harvest-200'
                : 'bg-agri-950/60 border-agri-400/40 text-agri-200'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Recommended Action</span>
              <p className="text-sm font-semibold mt-1 text-white">
                {selectedItem.recommended_action}
              </p>
            </div>

            {/* Why This Was Flagged (Model's Raw Reasoning) */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-agri-300 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Why This Was Flagged (Agronomist Raw Reasoning)
              </h4>
              <div className="p-4 rounded-xl bg-agri-950 border border-agri-800 font-mono text-xs text-stone-300 leading-relaxed">
                {selectedItem.raw_reasoning}
              </div>
            </div>

            {/* Cues Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-agri-950 border border-agri-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Smell</span>
                <span className="font-semibold text-stone-200 truncate block">{selectedItem.smell_rating}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-agri-950 border border-agri-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Moisture</span>
                <span className="font-semibold text-stone-200 truncate block">{selectedItem.moisture_feel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-agri-950 border border-agri-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">pH Reading</span>
                <span className="font-mono font-bold text-agri-300 block">
                  {selectedItem.ph_reading !== null && selectedItem.ph_reading !== undefined ? selectedItem.ph_reading : 'N/A'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-agri-800">
              <button
                type="button"
                onClick={(e) => handleToggleFollowup(selectedItem.id, e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  selectedItem.followed_up
                    ? 'bg-agri-950 text-agri-300 border border-agri-400/40'
                    : 'bg-agri-500 hover:bg-agri-400 text-white shadow-lg shadow-agri-600/30'
                }`}
              >
                {selectedItem.followed_up ? '✓ Marked Contacted' : 'Mark as Contacted / Followed Up'}
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-agri-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Render root
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

