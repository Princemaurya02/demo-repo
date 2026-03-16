import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Storage key ──────────────────────────────────────────────────────────────
const USER_KEY = 'ytlearn_user';

// ─── API base (set VITE_API_URL in production, leave empty for dev proxy) ─────
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API      = `${BASE_URL}/api/auth`;

// ─── Safe JSON parser — never throws "Unexpected end of JSON" ─────────────────
async function safeJson(res) {
    const text = await res.text();
    if (!text || !text.trim()) {
        throw new Error('Server returned an empty response. Is the backend running?');
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
    const [user,    setUser]    = useState(loadUser);   // load from localStorage on first render
    const [loading]             = useState(false);       // no async token validation needed
    const [authError, setAuthError] = useState('');

    // ── Sign Up ───────────────────────────────────────────────────────────────
    const signUp = useCallback(async ({ username, email, password }) => {
        setAuthError('');
        const res  = await fetch(`${API}/signup`, {
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
        const res  = await fetch(`${API}/signin`, {
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
