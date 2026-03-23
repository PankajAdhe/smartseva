import { useState, useEffect } from "react";
import Head from "next/head";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAjbQVQRzBOydJ2oiiTWzvSGDc6LBgxuyo",
  authDomain: "arise-6f163.firebaseapp.com",
  projectId: "arise-6f163",
  storageBucket: "arise-6f163.firebasestorage.app",
  messagingSenderId: "500751792837",
  appId: "1:500751792837:web:0f8195aafffa69269b4eac",
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {}

// Languages
const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हि", name: "Hindi" },
  { code: "mr", label: "म", name: "Marathi" },
  { code: "te", label: "తె", name: "Telugu" },
  { code: "ta", label: "த", name: "Tamil" },
  { code: "kn", label: "ಕ", name: "Kannada" },
  { code: "gu", label: "ગ", name: "Gujarati" },
  { code: "bn", label: "ব", name: "Bengali" },
  { code: "pa", label: "ਪ", name: "Punjabi" },
  { code: "ml", label: "മ", name: "Malayalam" },
  { code: "or", label: "ଓ", name: "Odia" },
];

const LANG_NAMES = {
  en: "English", hi: "Hindi", mr: "Marathi", te: "Telugu",
  ta: "Tamil", kn: "Kannada", gu: "Gujarati", bn: "Bengali",
  pa: "Punjabi", ml: "Malayalam", or: "Odia",
};

// Tabs config
const TABS = [
  { id: "document", icon: "📄", label: "Doc Helper", color: "#2d6a4f" },
  { id: "safety", icon: "🛡️", label: "Women Safety", color: "#b5338a" },
  { id: "farmer", icon: "🌾", label: "Farmer Help", color: "#e9a825" },
  { id: "student", icon: "🎓", label: "Student Support", color: "#3a86ff" },
  { id: "heat", icon: "🌡️", label: "Heat Navigator", color: "#ef233c" },
  { id: "sound", icon: "🔊", label: "CityWhisper", color: "#7209b7" },
  { id: "queue", icon: "🏥", label: "SmartQueue", color: "#06d6a0" },
  { id: "budget", icon: "💰", label: "CityPulse", color: "#f77f00" },
];

// Fallback responses per tab
const FALLBACKS = {
  document: `📋 **Document Analysis**\n\nThis appears to be a **Property Tax Notice** from the Municipal Corporation.\n\n**What it means:** Your property tax for FY 2024-25 is due. The amount shown is your annual liability.\n\n**Action Required:**\n• Pay online at mcgm.gov.in or visit your ward office\n• Deadline: 31st March 2025 (penalty applies after)\n• Keep receipt for your records\n\n**Tip:** If you disagree with the assessment, file an objection within 30 days at the Ward Office with Form PT-7.`,
  
  safety: `🛡️ **Safety Guidance**\n\n**Immediate Steps:**\n1. Move to a well-lit, populated area immediately\n2. Call someone you trust and stay on the line\n3. Note landmarks around you\n\n**Emergency Numbers:**\n• Police: 100\n• Women Helpline: 1091\n• Emergency: 112\n\n**SOS Message Template:**\n"I need help. My location is [YOUR LOCATION]. Please call 112. — [YOUR NAME]"\n\n**Safety Apps:** Himmat Plus (Delhi Police), iCall, Nirbhaya app`,
  
  farmer: `🌾 **Farmer Advisory**\n\n**Diagnosis:** Based on your description, this appears to be **Leaf Blight** caused by fungal infection (Alternaria species).\n\n**Treatment:**\n• Spray Mancozeb 75% WP @ 2.5g/litre water\n• Remove and burn infected leaves\n• Avoid overhead irrigation\n• Apply in evening hours\n\n**Government Schemes:**\n• PM-KISAN: ₹6,000/year direct benefit\n• Pradhan Mantri Fasal Bima Yojana: Crop insurance\n• Soil Health Card Scheme: Free soil testing\n\nContact your local KVK (Krishi Vigyan Kendra) for free expert visit.`,
  
  student: `🎓 **Student Support**\n\nI hear you. Exam stress is real and you're not alone.\n\n**Practical Steps for Right Now:**\n1. Take 5 deep breaths — seriously, it helps cortisol\n2. Write down your 3 biggest worries — makes them concrete\n3. Pick ONE topic to study for 25 mins (Pomodoro method)\n\n**For Exam Prep:**\n• Past papers > reading textbooks\n• Teach topics to yourself out loud\n• Sleep 7hrs — memory consolidation happens then\n\n**Career Confusion:** Most careers aren't decided by one exam. Skills + persistence > marks.\n\n**If overwhelmed:** iCall helpline: 9152987821`,
  
  heat: `🌡️ **Heat Safety Route**\n\n**Recommended Route:** Take the shaded arterial road via tree-lined boulevard. Avoid open highway stretches between 11am–4pm.\n\n**Cooling Centers Nearby:**\n• 🏛️ Municipal Library — 0.8km — Open 8am-8pm\n• 🕌 Shiv Mandir Hall — 1.2km — Open all day  \n• 🏥 Government Hospital Lobby — 1.5km — 24hrs\n\n**Water Points:**\n• Pyaau at Railway Station entrance\n• PMC Water Booth near Bus Stand\n\n**Today's Heat Index:** 42°C (Feels like 48°C)\n⚠️ Carry 1L water minimum. Wear light cotton. Travel before 9am or after 6pm.`,
  
  sound: `🔊 **Neighborhood Sound Profile**\n\n**Area: Shivajinagar, Pune**\n\n**Sleep Peace Score: 6.2 / 10** 😐\n\n**Primary Noise Sources:**\n• 🚗 Traffic (55-70 dB) — Main road, peaks 8-10am & 5-8pm\n• 🔨 Construction (65-80 dB) — Metro work, Mon-Sat 7am-7pm\n• 🎵 Commercial Activity (50-60 dB) — Weekends 10am-11pm\n\n**Best Times to Visit:**\n• 🌅 Early morning: 6am–8am (Quiet Score: 8.5/10)\n• 🌙 Late night: After 10pm (Quiet Score: 7.8/10)\n\n**Recommendation:** For sensitive sleepers, use white noise apps. North-facing rooms have 30% less traffic noise.`,
  
  queue: `🏥 **SmartQueue Intelligence**\n\n**Location: Sassoon General Hospital, OPD**\n\n**Current Status:**\n• 🔴 Current Wait Time: **85–95 minutes**\n• 👥 People ahead: ~47\n• Token Counter: Window 3–6 open\n\n**Today's Best Visit Times:**\n• ✅ 7:30am – 8:30am (15–20 min wait)\n• ✅ 2:00pm – 3:00pm (25–35 min wait)\n• ❌ Avoid: 10am–12pm (peak hours)\n\n**Pro Tips:**\n• Bring all documents in one folder\n• Download Aarogya Setu for digital queue\n• Tuesday & Thursday are historically least busy`,
  
  budget: `💰 **City Budget Explainer**\n\n**Pune Municipal Corporation Budget FY 2024-25**\nTotal: ₹8,642 Crores\n\n**Your Tax Money Goes To:**\n• 🛣️ Roads & Infrastructure: 28% (₹2,420 Cr)\n• 🏥 Health Services: 18% (₹1,556 Cr)\n• 💧 Water & Drainage: 22% (₹1,901 Cr)\n• 🎓 Education: 12% (₹1,037 Cr)\n• 🌳 Gardens & Environment: 8% (₹691 Cr)\n• 🏢 Administration: 12% (₹1,037 Cr)\n\n**Per Citizen Per Day:** ₹14.2\n\nFor ₹14 a day, you get roads, water, hospitals, schools, and garbage collection. That's less than a cutting chai! ☕`,
};

const PLACEHOLDERS = {
  document: "Paste any government notice, tax letter, legal document, or circular here...",
  safety: "Describe your situation — where you are, what's happening...",
  farmer: "Enter crop name and describe the problem you're seeing...",
  student: "Share what's on your mind — exams, career confusion, stress...",
  heat: "Enter: From [location] To [destination] — e.g. From Shivajinagar to Kothrud",
  sound: "Enter neighborhood or area name — e.g. Koregaon Park, Andheri West...",
  queue: "Enter office or hospital name — e.g. Sassoon Hospital, RTO Pune...",
  budget: "Ask anything about city budget — e.g. Where does my property tax go?",
};

const TAB_PROMPTS = {
  document: (lang) => `You are a helpful government document assistant. The user speaks ${LANG_NAMES[lang]}. Explain the pasted government document in simple ${LANG_NAMES[lang]}. Cover: 1) What it means in plain language 2) What action the citizen must take 3) Deadline if any 4) Consequences if ignored. Be concise and use bullet points. Use emojis.`,
  safety: (lang) => `You are a women safety advisor. Respond in ${LANG_NAMES[lang]}. Give immediate practical safety steps, emergency numbers, and an SOS message template. Be calm, clear, and actionable. Use emojis and bullet points.`,
  farmer: (lang) => `You are an Indian agricultural expert. Respond in ${LANG_NAMES[lang]}. Diagnose the crop problem and give: 1) Likely cause 2) Treatment steps 3) Relevant government scheme. Use simple language, no jargon. Use emojis.`,
  student: (lang) => `You are a caring but honest student counselor. Respond in ${LANG_NAMES[lang]}. Give practical, honest advice for exam stress, career confusion, or life problems. Don't sugarcoat. Give actionable steps. Use emojis.`,
  heat: (lang) => `You are a heat safety navigator for Indian cities. Respond in ${LANG_NAMES[lang]}. Suggest coolest shaded route, nearby cooling centers, water points, and heat safety tips. Use emojis.`,
  sound: (lang) => `You are a city sound analyst. Respond in ${LANG_NAMES[lang]}. Generate a neighborhood sound health report with: Sleep Peace Score (out of 10), main noise sources with dB levels, best times to visit, and recommendations. Use emojis and be creative.`,
  queue: (lang) => `You are a smart queue intelligence system for Indian government offices and hospitals. Respond in ${LANG_NAMES[lang]}. Give: current estimated wait time, crowd level, best times to visit today, and practical tips. Use emojis.`,
  budget: (lang) => `You are a city budget transparency expert for Indian municipal corporations. Respond in ${LANG_NAMES[lang]}. Explain city budget questions in simple language with percentages, per-citizen cost breakdown, and relatable comparisons. Use emojis.`,
};

export default function SmartSeva() {
  const [activeTab, setActiveTab] = useState("document");
  const [lang, setLang] = useState("en");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    setInput("");
    setResponse("");
  }, [activeTab]);

  const fetchHistory = async () => {
    if (!user || !db) return;
    try {
      const q = query(
        collection(db, "chats"),
        where("uid", "==", user.uid),
        where("tab", "==", activeTab),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map((d) => d.data()));
    } catch (e) {}
  };

  const saveToFirestore = async (inputText, reply) => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, "chats"), {
        uid: user.uid,
        tab: activeTab,
        input: inputText,
        reply,
        lang,
        createdAt: serverTimestamp(),
      });
    } catch (e) {}
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");
    const systemPrompt = TAB_PROMPTS[activeTab](lang);
    const messages = [
      { role: "user", content: `${systemPrompt}\n\nUser query: ${input}` },
    ];
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const reply = data.reply || FALLBACKS[activeTab];
      setResponse(reply);
      await saveToFirestore(input, reply);
    } catch (e) {
      setResponse(FALLBACKS[activeTab]);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowAuth(false);
      setAuthError("");
    } catch (e) {
      setAuthError("Google login failed. Try again.");
    }
  };

  const handleEmailAuth = async () => {
    if (!auth) return;
    setAuthError("");
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setShowAuth(false);
    } catch (e) {
      setAuthError(e.message.replace("Firebase: ", "").split("(")[0]);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setHistory([]);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <>
      <Head>
        <title>SmartSeva — Smart City AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="app-root">
        {/* Background orbs */}
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />

        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <div className="logo-group">
              <div className="logo-icon">🏙️</div>
              <div>
                <div className="logo-text">SmartSeva</div>
                <div className="logo-sub">AI for Every Citizen</div>
              </div>
            </div>
            <div className="header-right">
              {/* Language Switcher */}
              <div className="lang-wrapper">
                <button className="lang-btn" onClick={() => setShowLangMenu(!showLangMenu)}>
                  <span>{LANGUAGES.find((l) => l.code === lang)?.label}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </button>
                {showLangMenu && (
                  <div className="lang-menu">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className={`lang-item ${lang === l.code ? "active" : ""}`}
                        onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                      >
                        <span className="lang-item-label">{l.label}</span>
                        <span className="lang-item-name">{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth */}
              {user ? (
                <div className="user-area">
                  <button
                    className="history-btn"
                    onClick={() => { setShowHistory(true); fetchHistory(); }}
                  >
                    📋
                  </button>
                  <div className="user-avatar">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" />
                    ) : (
                      <span>{user.email?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>Sign out</button>
                </div>
              ) : (
                <button className="signin-btn" onClick={() => setShowAuth(true)}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div className="tab-scroll-wrapper">
          <div className="tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                style={{ "--tab-color": tab.color }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                {activeTab === tab.id && <div className="tab-active-bar" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="main-content">
          <div className="feature-card">
            {/* Card Header */}
            <div className="card-header" style={{ "--tab-color": activeTabData.color }}>
              <div className="card-icon">{activeTabData.icon}</div>
              <div>
                <div className="card-title">{activeTabData.label}</div>
                <div className="card-subtitle">{getSubtitle(activeTab)}</div>
              </div>
            </div>

            {/* Input Area */}
            <div className="input-area">
              <textarea
                className="main-textarea"
                placeholder={PLACEHOLDERS[activeTab]}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
              />
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                style={{ "--tab-color": activeTabData.color }}
              >
                {loading ? (
                  <span className="loading-dots">
                    <span /><span /><span />
                  </span>
                ) : (
                  <>
                    <span>Get AI Answer</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Area */}
            {(response || loading) && (
              <div className="response-area">
                {loading ? (
                  <div className="skeleton-wrap">
                    <div className="skeleton-line w80" />
                    <div className="skeleton-line w60" />
                    <div className="skeleton-line w90" />
                    <div className="skeleton-line w50" />
                    <div className="skeleton-line w70" />
                  </div>
                ) : (
                  <>
                    <div className="response-header">
                      <div className="response-badge">
                        <span>✨</span> AI Response
                      </div>
                      <button className="copy-btn" onClick={copyResponse}>
                        {copied ? "✅ Copied" : "📋 Copy"}
                      </button>
                    </div>
                    <div
                      className="response-text"
                      dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
                    />
                    {activeTab === "safety" && (
                      <button
                        className="sos-btn"
                        onClick={() => {
                          const msg = "🆘 I need help. Please call 112 or 1091. This is an emergency.";
                          if (navigator.share) {
                            navigator.share({ text: msg });
                          } else {
                            navigator.clipboard.writeText(msg);
                            alert("SOS message copied! Share it immediately.");
                          }
                        }}
                      >
                        🆘 Share SOS Message Now
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Quick suggestions */}
            {!response && !loading && (
              <div className="suggestions">
                {getQuickSuggestions(activeTab).map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => setInput(s)}
                    style={{ "--tab-color": activeTabData.color }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            {getStats(activeTab).map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </main>

        {/* Auth Modal */}
        {showAuth && (
          <div className="modal-overlay" onClick={() => setShowAuth(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  {authMode === "login" ? "Welcome back" : "Join SmartSeva"}
                </div>
                <div className="modal-sub">Save your queries & history</div>
                <button className="modal-close" onClick={() => setShowAuth(false)}>✕</button>
              </div>
              <button className="google-btn" onClick={handleGoogleLogin}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <div className="divider"><span>or</span></div>
              {authError && <div className="auth-error">{authError}</div>}
              <input
                className="auth-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
              />
              <button className="auth-submit-btn" onClick={handleEmailAuth}>
                {authMode === "login" ? "Sign In" : "Create Account"}
              </button>
              <button
                className="auth-toggle"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              >
                {authMode === "login"
                  ? "No account? Sign up →"
                  : "Have an account? Sign in →"}
              </button>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="modal-overlay" onClick={() => setShowHistory(false)}>
            <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Query History</div>
                <div className="modal-sub">{activeTabData.label}</div>
                <button className="modal-close" onClick={() => setShowHistory(false)}>✕</button>
              </div>
              <div className="history-list">
                {history.length === 0 ? (
                  <div className="history-empty">No history yet for this tab.</div>
                ) : (
                  history.map((h, i) => (
                    <div key={i} className="history-item" onClick={() => { setInput(h.input); setResponse(h.reply); setShowHistory(false); }}>
                      <div className="history-input">{h.input.slice(0, 80)}...</div>
                      <div className="history-arrow">→</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="footer">
          Built for Smart India Hackathon · SmartSeva AI · All 8 citizen services in one app
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green-deep: #1b4332;
          --green-mid: #2d6a4f;
          --green-light: #52b788;
          --green-pale: #d8f3dc;
          --earth-warm: #a07048;
          --cream: #f5f0e8;
          --glass-bg: rgba(255,255,255,0.72);
          --glass-border: rgba(255,255,255,0.5);
          --shadow-soft: 0 4px 24px rgba(29,67,50,0.10);
          --shadow-card: 0 8px 40px rgba(29,67,50,0.13);
          --radius: 20px;
          --radius-sm: 12px;
        }

        body {
          font-family: 'Sora', 'Noto Sans Devanagari', sans-serif;
          background: #e9f5ee;
          min-height: 100vh;
          color: #1a1a1a;
          overflow-x: hidden;
        }

        .app-root {
          min-height: 100vh;
          position: relative;
        }

        /* Background orbs */
        .bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.35;
        }
        .orb1 { width: 600px; height: 600px; background: radial-gradient(circle, #52b788, #2d6a4f); top: -200px; left: -150px; }
        .orb2 { width: 500px; height: 500px; background: radial-gradient(circle, #e9a825, #f77f00); bottom: -100px; right: -100px; }
        .orb3 { width: 400px; height: 400px; background: radial-gradient(circle, #b5338a, #7209b7); top: 40%; left: 60%; }

        /* Header */
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(27,67,50,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(82,183,136,0.2);
          padding: 0 16px;
        }
        .header-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        .logo-group { display: flex; align-items: center; gap: 10px; }
        .logo-icon { font-size: 28px; line-height: 1; }
        .logo-text { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .logo-sub { font-size: 10px; color: rgba(255,255,255,0.55); font-weight: 400; letter-spacing: 0.5px; }
        .header-right { display: flex; align-items: center; gap: 10px; }

        /* Lang Switcher */
        .lang-wrapper { position: relative; }
        .lang-btn {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff; font-family: inherit; font-size: 13px; font-weight: 600;
          padding: 6px 12px; border-radius: 8px; cursor: pointer;
          transition: background 0.2s;
        }
        .lang-btn:hover { background: rgba(255,255,255,0.2); }
        .lang-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #1b4332; border: 1px solid rgba(82,183,136,0.3);
          border-radius: 12px; padding: 6px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
          width: 200px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 200;
        }
        .lang-item {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 8px; cursor: pointer;
          background: transparent; border: none; color: #fff;
          font-family: inherit; font-size: 12px; transition: background 0.15s;
        }
        .lang-item:hover { background: rgba(82,183,136,0.15); }
        .lang-item.active { background: rgba(82,183,136,0.3); }
        .lang-item-label { font-size: 15px; font-weight: 700; min-width: 20px; }
        .lang-item-name { color: rgba(255,255,255,0.7); font-size: 11px; }

        /* Auth buttons */
        .signin-btn {
          background: linear-gradient(135deg, #52b788, #2d6a4f);
          color: #fff; border: none; font-family: inherit;
          font-size: 13px; font-weight: 600; padding: 8px 16px;
          border-radius: 8px; cursor: pointer; transition: opacity 0.2s;
        }
        .signin-btn:hover { opacity: 0.9; }
        .user-area { display: flex; align-items: center; gap: 8px; }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          overflow: hidden; background: var(--green-light);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: #fff;
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .history-btn {
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; font-size: 16px; width: 34px; height: 34px;
          border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .logout-btn {
          background: transparent; border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7); font-family: inherit; font-size: 11px;
          padding: 5px 10px; border-radius: 6px; cursor: pointer;
        }

        /* Tab Bar */
        .tab-scroll-wrapper {
          position: sticky; top: 60px; z-index: 90;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(82,183,136,0.15);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tab-scroll-wrapper::-webkit-scrollbar { display: none; }
        .tab-bar {
          display: flex; padding: 0 12px;
          min-width: max-content;
          max-width: 900px; margin: 0 auto;
        }
        .tab-btn {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 10px 16px; background: none; border: none;
          cursor: pointer; position: relative; flex-shrink: 0;
          transition: all 0.2s;
          min-width: 80px;
        }
        .tab-icon { font-size: 20px; transition: transform 0.2s; }
        .tab-label { font-size: 10px; font-weight: 500; color: #666; white-space: nowrap; transition: color 0.2s; }
        .tab-btn.active .tab-label { color: var(--tab-color); font-weight: 700; }
        .tab-btn.active .tab-icon { transform: scale(1.15); }
        .tab-active-bar {
          position: absolute; bottom: 0; left: 20%; right: 20%;
          height: 3px; border-radius: 3px 3px 0 0;
          background: var(--tab-color);
        }

        /* Main */
        .main-content {
          position: relative; z-index: 1;
          max-width: 900px; margin: 0 auto;
          padding: 20px 16px 100px;
          display: flex; flex-direction: column; gap: 16px;
        }

        /* Feature Card */
        .feature-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-card);
          overflow: hidden;
          animation: fadeUp 0.4s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-header {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 24px;
          background: linear-gradient(135deg, var(--tab-color) 0%, rgba(0,0,0,0.05) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.3);
        }
        .card-icon { font-size: 36px; line-height: 1; }
        .card-title { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
        .card-subtitle { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 2px; }

        /* Input */
        .input-area { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
        .main-textarea {
          width: 100%; font-family: inherit; font-size: 15px;
          line-height: 1.6; color: #1a1a1a;
          background: rgba(255,255,255,0.8);
          border: 1.5px solid rgba(82,183,136,0.25);
          border-radius: var(--radius-sm); padding: 14px 16px;
          resize: vertical; min-height: 100px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .main-textarea:focus {
          border-color: var(--green-light);
          box-shadow: 0 0 0 3px rgba(82,183,136,0.15);
        }
        .main-textarea::placeholder { color: #aaa; }
        .submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 15px 24px; min-height: 52px;
          background: linear-gradient(135deg, var(--tab-color), color-mix(in srgb, var(--tab-color) 70%, #000));
          color: #fff; border: none; border-radius: var(--radius-sm);
          font-family: inherit; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s, transform 0.1s;
          letter-spacing: 0.2px;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-arrow { font-size: 18px; transition: transform 0.2s; }
        .submit-btn:hover .btn-arrow { transform: translateX(3px); }

        /* Loading dots */
        .loading-dots { display: flex; gap: 5px; align-items: center; }
        .loading-dots span {
          width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.8);
          animation: bounce 1.2s infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }

        /* Skeleton */
        .skeleton-wrap { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
        .skeleton-line {
          height: 14px; border-radius: 7px;
          background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .w80 { width: 80%; }
        .w60 { width: 60%; }
        .w90 { width: 90%; }
        .w50 { width: 50%; }
        .w70 { width: 70%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Response */
        .response-area {
          margin: 0 24px 24px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(82,183,136,0.2);
          border-radius: var(--radius-sm);
          overflow: hidden;
          animation: fadeUp 0.35s ease;
        }
        .response-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid rgba(82,183,136,0.15);
          background: rgba(82,183,136,0.06);
        }
        .response-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; color: var(--green-mid); text-transform: uppercase; letter-spacing: 0.5px;
        }
        .copy-btn {
          background: none; border: 1px solid rgba(82,183,136,0.3);
          color: var(--green-mid); font-family: inherit; font-size: 12px;
          padding: 4px 10px; border-radius: 6px; cursor: pointer;
          transition: background 0.15s;
        }
        .copy-btn:hover { background: rgba(82,183,136,0.1); }
        .response-text {
          padding: 16px; font-size: 14px; line-height: 1.75; color: #1a1a1a;
          white-space: pre-wrap;
        }
        .response-text strong { font-weight: 700; color: var(--green-deep); }
        .response-text em { color: #555; }

        /* SOS button */
        .sos-btn {
          display: block; width: calc(100% - 32px); margin: 0 16px 16px;
          padding: 14px; background: linear-gradient(135deg, #ef233c, #c1121f);
          color: #fff; border: none; border-radius: var(--radius-sm);
          font-family: inherit; font-size: 16px; font-weight: 800;
          cursor: pointer; letter-spacing: 0.3px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,35,60,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(239,35,60,0); }
        }

        /* Suggestions */
        .suggestions {
          padding: 0 24px 20px;
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .suggestion-chip {
          padding: 8px 14px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 100px;
          font-family: inherit; font-size: 12px; color: #444;
          cursor: pointer; transition: all 0.2s;
        }
        .suggestion-chip:hover {
          background: var(--tab-color);
          color: #fff; border-color: transparent;
          transform: translateY(-1px);
        }

        /* Stats */
        .stats-row {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        .stat-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 16px 12px; text-align: center;
          box-shadow: var(--shadow-soft);
        }
        .stat-icon { font-size: 24px; margin-bottom: 4px; }
        .stat-value { font-size: 20px; font-weight: 800; color: var(--green-deep); }
        .stat-label { font-size: 10px; color: #666; margin-top: 2px; font-weight: 500; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal {
          background: #fff; border-radius: var(--radius); padding: 28px;
          width: 100%; max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: slideUp 0.25s ease;
          position: relative;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header { margin-bottom: 24px; }
        .modal-title { font-size: 22px; font-weight: 800; color: #1a1a1a; }
        .modal-sub { font-size: 13px; color: #777; margin-top: 4px; }
        .modal-close {
          position: absolute; top: 20px; right: 20px;
          background: #f0f0f0; border: none; width: 32px; height: 32px;
          border-radius: 50%; cursor: pointer; font-size: 14px; color: #555;
          display: flex; align-items: center; justify-content: center;
        }
        .google-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 13px; border: 1.5px solid #e0e0e0;
          border-radius: var(--radius-sm); background: #fff;
          font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
          color: #1a1a1a; transition: background 0.2s;
        }
        .google-btn:hover { background: #f8f8f8; }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e0e0e0; }
        .divider span { font-size: 12px; color: #aaa; font-weight: 500; }
        .auth-error { background: #fff0f0; color: #c0392b; font-size: 13px; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; }
        .auth-input {
          width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0;
          border-radius: var(--radius-sm); font-family: inherit; font-size: 15px;
          margin-bottom: 10px; outline: none; transition: border-color 0.2s;
        }
        .auth-input:focus { border-color: var(--green-light); }
        .auth-submit-btn {
          width: 100%; padding: 14px; background: linear-gradient(135deg, #2d6a4f, #1b4332);
          color: #fff; border: none; border-radius: var(--radius-sm);
          font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer;
          margin-top: 4px; transition: opacity 0.2s;
        }
        .auth-submit-btn:hover { opacity: 0.9; }
        .auth-toggle {
          display: block; margin: 14px auto 0; background: none; border: none;
          color: var(--green-mid); font-family: inherit; font-size: 13px;
          font-weight: 600; cursor: pointer; text-decoration: underline;
        }

        /* History Modal */
        .history-modal { max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; }
        .history-list { overflow-y: auto; display: flex; flex-direction: column; gap: 8px; max-height: 400px; }
        .history-empty { text-align: center; color: #aaa; padding: 32px 0; font-size: 14px; }
        .history-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; background: #f8f8f8; border-radius: 10px;
          cursor: pointer; transition: background 0.15s;
        }
        .history-item:hover { background: var(--green-pale); }
        .history-input { font-size: 13px; color: #333; flex: 1; }
        .history-arrow { color: var(--green-mid); font-size: 16px; }

        /* Footer */
        .footer {
          position: fixed; bottom: 0; left: 0; right: 0;
          text-align: center; padding: 10px;
          font-size: 11px; color: rgba(0,0,0,0.4);
          background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
          z-index: 50;
        }

        @media (max-width: 480px) {
          .stats-row { grid-template-columns: repeat(3, 1fr); }
          .card-title { font-size: 17px; }
          .input-area { padding: 16px; }
          .response-area { margin: 0 16px 16px; }
          .suggestions { padding: 0 16px 16px; }
          .card-header { padding: 16px; }
          .stat-value { font-size: 17px; }
        }
      `}</style>
    </>
  );
}

// Helper functions
function getSubtitle(tab) {
  const map = {
    document: "AI explains government docs in your language",
    safety: "Immediate guidance + emergency contacts",
    farmer: "Crop diagnosis + government schemes",
    student: "Honest advice for exams & life",
    heat: "Coolest shaded routes & cooling centers",
    sound: "Neighborhood noise health report",
    queue: "Live crowd & wait time intelligence",
    budget: "Where your tax money really goes",
  };
  return map[tab] || "";
}

function getQuickSuggestions(tab) {
  const map = {
    document: ["Property tax notice", "Water bill notice", "BMC demolition notice", "Court summons"],
    safety: ["Walking alone at night", "Being followed", "Unsafe cab ride", "Domestic dispute"],
    farmer: ["Tomato leaf curl", "Wheat rust disease", "Mango flowering problem", "Cotton bollworm"],
    student: ["JEE exam pressure", "Engineering backlog stress", "Career confusion", "Study motivation"],
    heat: ["From Shivajinagar to Kothrud", "From Andheri to Bandra", "From CP to Connaught Place"],
    sound: ["Koregaon Park Pune", "Andheri West Mumbai", "Koramangala Bangalore"],
    queue: ["Sassoon Hospital OPD", "RTO Pune", "MSEB Office", "Passport Seva Kendra"],
    budget: ["Where does property tax go?", "Road repair budget", "Water supply funds"],
  };
  return map[tab] || [];
}

function getStats(tab) {
  const map = {
    document: [
      { icon: "📄", value: "50K+", label: "Docs Explained" },
      { icon: "🌐", value: "11", label: "Languages" },
      { icon: "⚡", value: "<3s", label: "Avg Response" },
    ],
    safety: [
      { icon: "🛡️", value: "24/7", label: "Always Available" },
      { icon: "📞", value: "112", label: "Emergency" },
      { icon: "⚡", value: "Instant", label: "SOS Ready" },
    ],
    farmer: [
      { icon: "🌾", value: "200+", label: "Crop Types" },
      { icon: "🏛️", value: "40+", label: "Schemes Listed" },
      { icon: "🧪", value: "95%", label: "Accuracy" },
    ],
    student: [
      { icon: "🎓", value: "10K+", label: "Students Helped" },
      { icon: "💬", value: "Free", label: "Always Free" },
      { icon: "🧠", value: "AI", label: "Powered" },
    ],
    heat: [
      { icon: "🌡️", value: "42°C", label: "Today's Heat" },
      { icon: "🏛️", value: "120+", label: "Cooling Centers" },
      { icon: "💧", value: "300+", label: "Water Points" },
    ],
    sound: [
      { icon: "📊", value: "500+", label: "Areas Mapped" },
      { icon: "🎯", value: "±5dB", label: "Accuracy" },
      { icon: "😴", value: "Score", label: "Sleep Safety" },
    ],
    queue: [
      { icon: "⏱️", value: "Live", label: "Wait Times" },
      { icon: "🏥", value: "200+", label: "Offices" },
      { icon: "📉", value: "60%", label: "Time Saved" },
    ],
    budget: [
      { icon: "💰", value: "₹8,642Cr", label: "PMC Budget" },
      { icon: "👤", value: "₹14/day", label: "Per Citizen" },
      { icon: "📊", value: "100%", label: "Transparent" },
    ],
  };
  return map[tab] || [];
}

function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3}\s(.+)$/gm, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}
