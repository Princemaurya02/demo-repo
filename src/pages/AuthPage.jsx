import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Eye, EyeOff, Mail, Lock, User, ArrowRight,
    BookOpen, Zap, Target, Brain, TrendingUp, Code2
} from 'lucide-react';
import './AuthPage.css';



// ─── Password strength ────────────────────────────────────────────────────────
function passwordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: 'Weak',    color: '#ff4757' };
    if (score <= 2) return { score, label: 'Fair',    color: '#ffb347' };
    if (score <= 3) return { score, label: 'Good',    color: '#00d4ff' };
    return              { score, label: 'Strong',  color: '#00ff88' };
}

// ─── Floating background elements ─────────────────────────────────────────────
const FLOATS = [
    { icon: '📚', x: 8,  y: 15, size: 28, dur: 7  },
    { icon: '⚡', x: 18, y: 55, size: 22, dur: 9  },
    { icon: '🎯', x: 6,  y: 78, size: 26, dur: 6  },
    { icon: '🧠', x: 82, y: 20, size: 24, dur: 8  },
    { icon: '📈', x: 75, y: 62, size: 20, dur: 11 },
    { icon: '💡', x: 88, y: 85, size: 22, dur: 7  },
    { icon: '</>',x: 12, y: 40, size: 16, dur: 10 },
    { icon: '🚀', x: 90, y: 42, size: 20, dur: 9  },
];

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ icon: Icon, type, placeholder, value, onChange, error, rightEl }) {
    return (
        <div className="auth-field-wrap">
            <div className={`auth-input-row ${error ? 'has-error' : ''}`}>
                <Icon size={16} className="auth-input-icon" />
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete="off"
                    className="auth-input"
                />
                {rightEl}
            </div>
            {error && <p className="auth-field-error">{error}</p>}
        </div>
    );
}

// ─── Sign In Form ─────────────────────────────────────────────────────────────
function SignInForm({ onSwitch }) {
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [showPw,   setShowPw]   = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors,   setErrors]   = useState({});
    const [loading,  setLoading]  = useState(false);
    const [apiErr,   setApiErr]   = useState('');

    const validate = () => {
        const e = {};
        if (!email) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format.';
        if (!password) e.password = 'Password is required.';
        return e;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setApiErr('');
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            await signIn({ email, password });
            navigate('/', { replace: true });
        } catch (err) {
            setApiErr(err.message);
        } finally { setLoading(false); }
    };



    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-header">
                <h2 className="auth-form-title">Welcome Back</h2>
                <p className="auth-form-sub">Sign in to continue your learning journey.</p>
            </div>

            {apiErr && <div className="auth-api-error">{apiErr}</div>}

            <Field
                icon={Mail} type="email" placeholder="Email address"
                value={email} onChange={e => setEmail(e.target.value)}
                error={errors.email}
            />
            <Field
                icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                error={errors.password}
                rightEl={
                    <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                }
            />

            <div className="auth-row-opts">
                <label className="auth-remember">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    <span>Remember me</span>
                </label>
                <button type="button" className="auth-link">Forgot password?</button>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading
                    ? <><span className="auth-spinner"/><span style={{fontSize:13,opacity:0.85}}>Connecting…</span></>
                    : <><span>Sign In</span><ArrowRight size={16}/></>}
            </button>

            {loading && (
                <p style={{textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.45)',marginTop:0}}>
                    ⏳ Server may be waking up — please wait up to 30 seconds.
                </p>
            )}

            <p className="auth-switch-text">
                Don't have an account?{' '}
                <button type="button" className="auth-link" onClick={onSwitch}>Sign Up</button>
            </p>
        </form>
    );
}

// ─── Sign Up Form ─────────────────────────────────────────────────────────────
function SignUpForm({ onSwitch }) {
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [confirm,  setConfirm]  = useState('');
    const [showPw,   setShowPw]   = useState(false);
    const [showCf,   setShowCf]   = useState(false);
    const [agreed,   setAgreed]   = useState(false);
    const [errors,   setErrors]   = useState({});
    const [loading,  setLoading]  = useState(false);
    const [apiErr,   setApiErr]   = useState('');

    const pwStrength = passwordStrength(password);

    const validate = () => {
        const e = {};
        if (!username.trim()) e.username = 'Username is required.';
        if (!email) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format.';
        if (!password) e.password = 'Password is required.';
        else if (password.length < 8) e.password = 'Minimum 8 characters.';
        else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) e.password = 'Must include letters and numbers.';
        if (password !== confirm) e.confirm = 'Passwords do not match.';
        if (!agreed) e.agreed = 'You must accept the terms.';
        return e;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setApiErr('');
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            await signUp({ username: username.trim(), email, password });
            navigate('/', { replace: true });
        } catch (err) {
            setApiErr(err.message);
        } finally { setLoading(false); }
    };



    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-header">
                <h2 className="auth-form-title">Create Account</h2>
                <p className="auth-form-sub">Start your learning journey today.</p>
            </div>

            {apiErr && <div className="auth-api-error">{apiErr}</div>}

            <Field
                icon={User} type="text" placeholder="Username"
                value={username} onChange={e => setUsername(e.target.value)}
                error={errors.username}
            />
            <Field
                icon={Mail} type="email" placeholder="Email address"
                value={email} onChange={e => setEmail(e.target.value)}
                error={errors.email}
            />
            <Field
                icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                error={errors.password}
                rightEl={
                    <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                }
            />

            {/* Password strength */}
            {password && (
                <div className="auth-strength">
                    <div className="auth-strength-bars">
                        {[1,2,3,4,5].map(n => (
                            <div
                                key={n}
                                className="auth-strength-bar"
                                style={{ background: n <= pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)' }}
                            />
                        ))}
                    </div>
                    <span style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                </div>
            )}

            <Field
                icon={Lock} type={showCf ? 'text' : 'password'} placeholder="Confirm password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                error={errors.confirm}
                rightEl={
                    <button type="button" className="auth-pw-toggle" onClick={() => setShowCf(v => !v)} tabIndex={-1}>
                        {showCf ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                }
            />

            <label className="auth-terms-check">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span>I agree to the <button type="button" className="auth-link">Terms of Service</button></span>
            </label>
            {errors.agreed && <p className="auth-field-error" style={{marginTop:-6}}>{errors.agreed}</p>}

            <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading
                    ? <span className="auth-spinner"/>
                    : <><span>Create Account</span><ArrowRight size={16}/></>}
            </button>

            <p className="auth-switch-text">
                Already have an account?{' '}
                <button type="button" className="auth-link" onClick={onSwitch}>Sign In</button>
            </p>
        </form>
    );
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export default function AuthPage() {
    const [mode, setMode] = useState('signin');   // 'signin' | 'signup'

    const switchToSignUp = useCallback(() => setMode('signup'), []);
    const switchToSignIn = useCallback(() => setMode('signin'), []);

    return (
        <div className="auth-page">

            {/* Floating background icons */}
            {FLOATS.map((f, i) => (
                <div
                    key={i}
                    className="auth-float"
                    style={{ left:`${f.x}%`, top:`${f.y}%`, fontSize:f.size, animationDuration:`${f.dur}s`, animationDelay:`${i*0.4}s` }}
                >
                    {f.icon}
                </div>
            ))}

            {/* Left — Branding panel */}
            <div className="auth-left">
                <div className="auth-left-inner">
                    {/* Logo */}
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <svg width="36" height="36" viewBox="0 0 52 52" fill="none">
                                <circle cx="26" cy="26" r="26" fill="url(#authLogoGrad)"/>
                                <polygon points="21,16 21,36 38,26" fill="white" opacity="0.95"/>
                                <defs>
                                    <radialGradient id="authLogoGrad" cx="35%" cy="30%">
                                        <stop offset="0%" stopColor="#a78bfa"/>
                                        <stop offset="100%" stopColor="#5440e0"/>
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className="auth-logo-text">YT<span>Learn</span></span>
                    </div>

                    <div className="auth-left-content">
                        <h1 className="auth-headline">
                            Learn Smarter.<br/>
                            <span className="auth-headline-accent">Build Faster.</span>
                        </h1>
                        <p className="auth-tagline">
                            Your AI-powered study cockpit designed for focus, discipline, and measurable learning progress.
                        </p>

                        {/* Feature pills */}
                        <div className="auth-features">
                            {[
                                { icon: BookOpen,   label: 'Smart Notes'     },
                                { icon: Brain,      label: 'AI Tutor'        },
                                { icon: Target,     label: 'Roadmaps'        },
                                { icon: TrendingUp, label: 'Analytics'       },
                                { icon: Zap,        label: 'Focus Engine'    },
                                { icon: Code2,      label: 'Study Rooms'     },
                            ].map((f, i) => (
                                <div key={i} className="auth-feature-pill" style={{ animationDelay:`${i*0.1}s` }}>
                                    <f.icon size={14}/>
                                    <span>{f.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="auth-stats">
                            {[
                                { val: '10K+', label: 'Learners'   },
                                { val: '500+', label: 'Courses'    },
                                { val: '98%',  label: 'Completion' },
                            ].map((s, i) => (
                                <div key={i} className="auth-stat">
                                    <div className="auth-stat-val">{s.val}</div>
                                    <div className="auth-stat-lbl">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — Auth card */}
            <div className="auth-right">
                <div className="auth-card">
                    <div className={`auth-forms-slider ${mode === 'signup' ? 'show-signup' : ''}`}>
                        <div className="auth-form-pane auth-form-pane-signin">
                            <SignInForm onSwitch={switchToSignUp} />
                        </div>
                        <div className="auth-form-pane auth-form-pane-signup">
                            <SignUpForm onSwitch={switchToSignIn} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
