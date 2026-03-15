/* =========================================
   AUTH.JS – LOGIN & REGISTER (HARDENED)
========================================= */

/* ===============================
   REGISTER
================================ */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const registerBtn = registerForm.querySelector("button[type='submit']");

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = registerForm.name.value.trim();
        const email = registerForm.email.value.trim();
        const mobile = registerForm.mobile.value.trim();
        const password = registerForm.password.value;
        const confirmPassword = registerForm.confirmPassword.value;

        const errorEl = registerForm.querySelector(".form-error");
        errorEl.textContent = "";

        if (!name || !email || !mobile || !password || !confirmPassword) {
            errorEl.textContent = "Please fill all fields";
            return;
        }

        if (password !== confirmPassword) {
            errorEl.textContent = "Passwords do not match";
            return;
        }

        // 🔒 Disable button
        registerBtn.disabled = true;
        registerBtn.style.opacity = "0.7";
        registerBtn.textContent = "Registering...";

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    mobile,
                    password,
                    confirmPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                errorEl.textContent = data.message || "Registration failed";
            } else {
                window.location.href = "login.html";
            }

        } catch (err) {
            errorEl.textContent = "Server error. Try again later.";
        }

        // 🔓 Re-enable button
        registerBtn.disabled = false;
        registerBtn.style.opacity = "1";
        registerBtn.textContent = "Register";
    });
}


/* ===============================
   LOGIN
================================ */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginBtn = loginForm.querySelector("button[type='submit']");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value;

        const errorEl = loginForm.querySelector(".form-error");
        errorEl.textContent = "";

        if (!email || !password) {
            errorEl.textContent = "Please fill all fields";
            return;
        }

        // 🔒 Disable button
        loginBtn.disabled = true;
        loginBtn.style.opacity = "0.7";
        loginBtn.textContent = "Logging in...";

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                errorEl.textContent = data.message || "Login failed";
            } else {
                localStorage.setItem("token", data.token);
                window.location.href = "dashboard.html";
            }

        } catch (err) {
            errorEl.textContent = "Server error. Try again later.";
        }

        // 🔓 Re-enable button
        loginBtn.disabled = false;
        loginBtn.style.opacity = "1";
        loginBtn.textContent = "Login";
    });
}