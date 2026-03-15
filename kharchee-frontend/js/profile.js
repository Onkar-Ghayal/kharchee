const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const mobileEl = document.getElementById("profileMobile");
const avatarEl = document.getElementById("profileAvatar");

const editBtn = document.getElementById("editNameBtn");
const editSection = document.getElementById("editSection");
const editInput = document.getElementById("editNameInput");
const saveBtn = document.getElementById("saveProfileBtn");
const messageEl = document.getElementById("profileMessage");

/* ================= LOAD PROFILE ================= */

async function loadProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const user = await res.json();

    nameEl.textContent = user.name;
    emailEl.textContent = user.email;
    mobileEl.textContent = user.mobile;

    avatarEl.textContent = user.name.charAt(0).toUpperCase();
    editInput.value = user.name;
}

/* ================= ENABLE EDIT MODE ================= */

editBtn.addEventListener("click", () => {
    editSection.style.display = "block";
    editInput.focus();
});

/* ================= SAVE NAME ================= */

saveBtn.addEventListener("click", async () => {

    const newName = editInput.value.trim();

    if (!newName) {
        messageEl.textContent = "Name cannot be empty";
        messageEl.style.color = "#ef4444";
        return;
    }

    // 🔒 Disable button
    saveBtn.disabled = true;
    saveBtn.style.opacity = "0.7";
    saveBtn.textContent = "Saving...";

    try {

        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: newName })
        });

        const data = await res.json();

        if (!res.ok) {
            messageEl.textContent = data.message || "Update failed";
            messageEl.style.color = "#ef4444";
        } else {
            messageEl.textContent = "Profile updated successfully";
            messageEl.style.color = "#10b981";
            editSection.style.display = "none";
            loadProfile();
        }

    } catch (err) {
        messageEl.textContent = "Server error";
        messageEl.style.color = "#ef4444";
    }

    // 🔓 Re-enable button
    saveBtn.disabled = false;
    saveBtn.style.opacity = "1";
    saveBtn.textContent = "Save Changes";

});

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", loadProfile);