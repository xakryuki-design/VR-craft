/**
 * V-R-CRAFT Global Script
 * Handles Dark Mode, API Keys, and shared UI logic.
 */

// --- Dark Mode Logic ---
function initDarkMode() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (!toggleBtn) return;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Initial load
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (systemDark) {
        applyTheme('dark');
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// --- Gemini API Key Management ---
const API_KEY_NAME = 'GEMINI_KEY';

function getApiKey() {
    return localStorage.getItem(API_KEY_NAME);
}

function saveApiKey(key) {
    if (key && key.trim().length > 10) {
        localStorage.setItem(API_KEY_NAME, key.trim());
        return true;
    }
    return false;
}

function resetKey() {
    const key = prompt("Gemini APIキーを入力してください\n(Google AI Studioで取得したキーが必要です)");
    if (key === null) return; // Cancelled
    
    if (saveApiKey(key)) {
        alert("APIキーを保存しました。");
        location.reload();
    } else {
        alert("無効なキーです。正しく入力してください。");
    }
}

// --- Navigation Scroll Effect ---
function initNavScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('py-2', 'bg-white/90', 'dark:bg-slate-950/90', 'shadow-2xl', 'backdrop-blur-md');
            nav.classList.remove('p-4');
        } else {
            nav.classList.remove('py-2', 'bg-white/90', 'dark:bg-slate-950/90', 'shadow-2xl', 'backdrop-blur-md');
            nav.classList.add('p-4');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call once on load
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initNavScroll();
});
