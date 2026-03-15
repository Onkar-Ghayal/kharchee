/* =========================================
   COMMON.JS – AUTH & SESSION MANAGEMENT
========================================= */

// ✅ GLOBAL CONFIG (ONLY HERE)
const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://kharchee.onrender.com/api";

/* ===============================
   TOKEN HELPERS
================================ */

function getToken() {
    return localStorage.getItem("token");
}

function isLoggedIn() {
    return !!getToken();
}

/* ===============================
   LOGOUT
================================ */

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

/* ===============================
   AUTH GUARD
================================ */

(function authGuard() {
    const path = window.location.pathname;

    const isDashboard = path.includes("dashboard.html");
    const isLogin = path.includes("login.html");
    const isRegister = path.includes("register.html");

    // ❌ Not logged in → block dashboard
    if (isDashboard && !isLoggedIn()) {
        window.location.href = "login.html";
    }

    // ❌ Logged in → block login/register
    if ((isLogin || isRegister) && isLoggedIn()) {
        window.location.href = "dashboard.html";
    }
})();

/* =====================================================
   🌙 DARK MODE TOGGLE (NEW – APPEND ONLY)
===================================================== */

(function darkModeInit() {
    const toggleBtn = document.getElementById("themeToggle");
    const body = document.body;

    // Load saved preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        body.classList.add("dark-mode");
        if (toggleBtn) toggleBtn.textContent = "☀️";
    }

    // Toggle handler
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            body.classList.toggle("dark-mode");

            const isDark = body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");

            toggleBtn.textContent = isDark ? "☀️" : "🌙";
        });
    }
})();

/* =====================================================
   🔐 GLOBAL FETCH WRAPPER – AUTO LOGOUT ON 401
   Production Security Hardening
===================================================== */

(function secureFetchWrapper() {

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {

        const response = await originalFetch(...args);

        // 🔐 If token expired or unauthorized
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return Promise.reject("Unauthorized");
        }

        return response;
    };

})();