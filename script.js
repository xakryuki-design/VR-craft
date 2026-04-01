/**
 * V-R-CRAFT Global Script
 * Handles Dark Mode, API Keys, and shared UI logic.
 */

// --- Dark Mode Logic ---
function initDarkMode() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (!toggleBtn) return;

    // Check saved preference or system setting
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    toggleBtn.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    });
}

// --- Gemini API Key Management ---
const API_KEY_NAME = 'GEMINI_KEY';

function getApiKey() {
    return localStorage.getItem(API_KEY_NAME);
}

function saveApiKey(key) {
    if (key) {
        localStorage.setItem(API_KEY_NAME, key.trim());
        return true;
    }
    return false;
}

function resetKey() {
    const key = prompt("Gemini APIキーを入力してください");
    if (saveApiKey(key)) {
        location.reload();
    }
}

// --- Navigation Scroll Effect ---
function initNavScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('py-2', 'bg-white/90', 'dark:bg-slate-900/90', 'shadow-lg');
            nav.classList.remove('p-4');
        } else {
            nav.classList.remove('py-2', 'bg-white/90', 'dark:bg-slate-900/90', 'shadow-lg');
            nav.classList.add('p-4');
        }
    });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initNavScroll();
});
