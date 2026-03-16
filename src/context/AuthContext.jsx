import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Storage key ──────────────────────────────────────────────────────────────
const USER_KEY = 'ytlearn_user';

// ─── API base (set VITE_API_URL in production, leave empty for dev proxy) ─────
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API      = `${BASE_URL}/api/auth`;

// ─── Fetch with timeout ───────────────────────────────────────────────────────
// Render free tier cold-starts in ~30s. Give it 60s before failing clearly.
async function fetchWithTimeout(url, options, timeoutMs = 60_000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return res;
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw new Error('Server is taking too long to respond. It may be waking up — please wait 30 seconds and try again.');
        }
        throw new Error('Cannot reach the server. Please check your internet connection.');
    }
}

// ─── Safe JSON parser — never throws "Unexpected end of JSON" ─────────────────
async function safeJson(res) {
    const text = await res.text();
    if (!text || !text.trim()) {
        throw new Error('Server returned an empty response. It may still be starting up — please try again in 30 seconds.');
    }
    try {
        return JSON.parse(text);
    } catch {
        console.error('[YTLearn] Non-JSON response body:', text.slice(0, 300));
        throw new Error('Server returned an invalid response. Please try again.');
    }
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function saveUser(user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
}

function loadUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}

function removeUser() {
    try { localStorage.removeItem(USER_KEY); } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user,      setUser]      = useState(loadUser);
    const [loading]                 = useState(false);
    const [authError, setAuthError] = useState('');

    // ── Sign Up ───────────────────────────────────────────────────────────────
    const signUp = useCallback(async ({ username, email, password }) => {
        setAuthError('');
        const res  = await fetchWithTimeout(`${API}/signup`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, email, password }),
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.message || 'Sign up failed.');
        saveUser(data.user);
        setUser(data.user);
        return data.user;
    }, []);

    // ── Sign In ───────────────────────────────────────────────────────────────
    const signIn = useCallback(async ({ email, password }) => {
        setAuthError('');
        const res  = await fetchWithTimeout(`${API}/signin`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }),
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.message || 'Sign in failed.');
        saveUser(data.user);
        setUser(data.user);
        return data.user;
    }, []);

    // ── Sign Out ──────────────────────────────────────────────────────────────
    const signOut = useCallback(() => {
        removeUser();
        setUser(null);
    }, []);

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user, loading, authError, isAuthenticated,
            signUp, signIn, signOut, setAuthError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
