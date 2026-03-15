/* =====================================================
   DASHBOARD.JS – KHARCHE.IN
   + LOGOUT
   + SEARCH
   + SORT
   + FILTER
   + CALCULATOR
===================================================== */

const token = localStorage.getItem("token");

/* ================= AUTH GUARD ================= */
if (!token) {
    window.location.href = "login.html";
}

/* ================= DOM ELEMENTS ================= */

// Header
const logoutBtn = document.getElementById("logoutBtn");
const menuToggle = document.getElementById("menuToggle");
const dropdownMenu = document.getElementById("dropdownMenu");

// Search
const searchInput = document.getElementById("searchFriendInput");
const searchBtn = document.getElementById("searchFriendBtn");

// Sort & Filter
const sortSelect = document.getElementById("sortFriends");
const filterSelect = document.getElementById("filterFriends");

const totalGivenEl = document.getElementById("totalGiven");
const totalTakenEl = document.getElementById("totalTaken");
const netBalanceEl = document.getElementById("netBalance");

// Modals & buttons
const addFriendBtn = document.querySelector(".add-btn");
const modal = document.querySelector(".modal");
const cancelBtn = modal.querySelector(".btn-cancel");
const saveBtn = modal.querySelector(".btn-submit");

const friendNameInput = modal.querySelector('input[type="text"]');
const amountInput = modal.querySelector('input[type="number"]');
const typeSelect = modal.querySelector("select");
const descriptionInput = document.getElementById("transactionDescription");
const formError = modal.querySelector(".form-error");

// Dashboard
const friendList = document.querySelector(".friend-list");
const emptyState = document.querySelector(".empty-state");

// Delete modal
const deleteModal = document.querySelector(".delete-modal");
const deleteConfirmBtn = document.querySelector(".btn-delete-confirm");
const deleteCancelBtn = document.querySelector(".delete-cancel");

// Settle modal
const settleModal = document.querySelector(".settle-modal");
const settleConfirmBtn = document.querySelector(".settle-confirm");
const settleCancelBtn = document.querySelector(".settle-cancel");

// History modal
const historyModal = document.querySelector(".history-modal");
const historyList = document.querySelector(".history-list");
const historyCloseBtn = document.querySelector(".history-close");
const historyClearBtn = document.querySelector(".history-clear");

// Calculator modal
const calculatorModal = document.querySelector(".calculator-modal");
const calculatorDisplay = calculatorModal.querySelector(".calculator-display input");
const calculatorButtons = calculatorModal.querySelector(".calculator-buttons");
const useCalculatedBtn = calculatorModal.querySelector(".use-calculated-amount");
const closeCalculatorBtn = calculatorModal.querySelector(".close-calculator");

// Add Amount Modal (NEW)
const addAmountModal = document.querySelector(".add-amount-modal");
const addAmountValue = document.getElementById("addAmountValue");
const addAmountType = document.getElementById("addAmountType");
const addAmountDescription = document.getElementById("addAmountDescription");
const addAmountError = document.getElementById("addAmountError");
const confirmAddAmount = document.getElementById("confirmAddAmount");
const cancelAddAmount = document.getElementById("cancelAddAmount");

// State
let friendToEditId = null;
let calculatorExpression = "";
let allFriends = [];


/* ================= LOGOUT ================= */
logoutBtn.addEventListener("click", () => logout());

/* ================= HAMBURGER MENU ================= */

menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    dropdownMenu.classList.toggle("active");
});

// Close when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-wrapper")) {
        menuToggle.classList.remove("active");
        dropdownMenu.classList.remove("active");
    }
});


/* ================= SEARCH + SORT + FILTER ================= */

function applySearchSortFilter() {
    let filtered = [...allFriends];

    // 🔍 SEARCH
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        filtered = filtered.filter(f =>
            f.name.toLowerCase().includes(query)
        );
    }

    // 🎯 FILTER
    const filter = filterSelect.value;
    if (filter === "gain") {
        filtered = filtered.filter(f => f.currentAmount > 0);
    } else if (filter === "loss") {
        filtered = filtered.filter(f => f.currentAmount < 0);
    }

    // 🔽 SORT
    const sort = sortSelect.value;
    if (sort === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    // ✅ CORRECT AMOUNT SORT (HIGH → LOW)
    else if (sort === "amount") {
        filtered.sort((a, b) => b.currentAmount - a.currentAmount);
    }
    // RECENT
    else {
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    renderFriendList(filtered);
}

/* ================= ANIMATED COUNTER ================= */

function animateValue(element, start, end, duration = 600) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        const current = Math.floor(progress * (end - start) + start);

        element.textContent = `₹ ${current.toLocaleString()}`;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
}

/* ================= BALANCE SUMMARY ================= */

function updateBalanceSummary(friends) {
    let totalGiven = 0;
    let totalTaken = 0;

    friends.forEach(friend => {
        if (friend.currentAmount > 0) {
            totalGiven += friend.currentAmount;
        } else {
            totalTaken += Math.abs(friend.currentAmount);
        }
    });

    const netBalance = totalGiven - totalTaken;

    // Get current displayed values (remove ₹ and commas safely)
    const currentGiven = parseInt(totalGivenEl.textContent.replace(/[₹, ]/g, "")) || 0;
    const currentTaken = parseInt(totalTakenEl.textContent.replace(/[₹, ]/g, "")) || 0;
    const currentNet = parseInt(netBalanceEl.textContent.replace(/[₹, ]/g, "")) || 0;

    // Animate instead of direct update
    animateValue(totalGivenEl, currentGiven, totalGiven);
    animateValue(totalTakenEl, currentTaken, totalTaken);
    animateValue(netBalanceEl, currentNet, netBalance);
}


// Events
searchInput.addEventListener("input", applySearchSortFilter);
searchBtn.addEventListener("click", applySearchSortFilter);
sortSelect.addEventListener("change", applySearchSortFilter);
filterSelect.addEventListener("change", applySearchSortFilter);

/* ================= FETCH FRIENDS ================= */

const dashboardLoading = document.getElementById("dashboardLoading");

async function fetchFriends() {
    try {
        dashboardLoading.style.display = "flex";
        emptyState.style.display = "none";
        friendList.innerHTML = "";

        const res = await fetch(`${API_BASE_URL}/friends`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 🔐 Auto logout if token expired
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!res.ok) {
            throw new Error("Failed to fetch friends");
        }

        allFriends = await res.json();
        applySearchSortFilter();

    } catch (err) {
        showToast("Failed to load dashboard", "error");
        emptyState.style.display = "block";
    } finally {
        dashboardLoading.style.display = "none";
    }
}

/* ================= RENDER FRIEND LIST ================= */

function renderFriendList(friends) {
    friendList.innerHTML = "";

    if (!friends.length) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    friends.forEach(renderFriendCard);

    updateBalanceSummary(friends);
}

/* ================= ADD / EDIT FRIEND ================= */

addFriendBtn.addEventListener("click", () => {
    // ✅ FORCE ADD MODE
    friendToEditId = null;

    friendNameInput.disabled = false;
    friendNameInput.value = "";
    amountInput.value = "";
    typeSelect.value = "";
    descriptionInput.value = "";
    formError.textContent = "";

    modal.style.display = "flex";
});


cancelBtn.addEventListener("click", closeModal);

saveBtn.addEventListener("click", async () => {
    formError.textContent = "";

    const name = friendNameInput.value.trim();
    const amountValue = amountInput.value;
    const type = typeSelect.value;
    const description = descriptionInput.value.trim();

    if (!name || amountValue === "" || !type) {
        formError.textContent = "Please fill all fields";
        return;
    }

    let amount = Number(amountValue);
    if (isNaN(amount)) {
        formError.textContent = "Invalid amount";
        return;
    }

    amount = type === "loss" ? -Math.abs(amount) : Math.abs(amount);

    if (friendToEditId === null) {
        const res = await fetch(`${API_BASE_URL}/friends`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        const data = await res.json();
        if (!res.ok) {
            formError.textContent = data.message;
            return;
        }

        await updateAmount(data._id, amount, description);
    } else {
        await updateAmount(friendToEditId, amount, description, "replace");
    }

    closeModal();
    fetchFriends();
});

async function updateAmount(id, amount, description = "", mode = "add") {
    await fetch(`${API_BASE_URL}/friends/${id}/amount`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, description, mode })
    });
}


/* ================= CARD ACTIONS ================= */

friendList.addEventListener("click", e => {
    const card = e.target.closest(".friend-card");
    if (!card) return;

    const amount = Number(card.dataset.amount);

    if (e.target.textContent === "Edit") openEditModal(card, amount);
    if (e.target.classList.contains("add-amount-btn")) {
        friendToEditId = card.dataset.id;
        addAmountModal.style.display = "flex";
    }
    if (e.target.textContent === "Calculate") openCalculator(card, amount);
    if (e.target.textContent === "History") {
        friendToEditId = card.dataset.id; // ✅ SET STATE
        showHistory(card.dataset.history);
    }

    if (e.target.classList.contains("delete")) {
        deleteConfirmBtn.dataset.id = card.dataset.id;
        deleteModal.style.display = "flex";
    }

    if (e.target.classList.contains("settle-btn")) {
        friendToEditId = card.dataset.id;
        settleModal.style.display = "flex";
    }
});

/* ================= EDIT MODAL ================= */

function openEditModal(card, amount) {
    friendToEditId = card.dataset.id;
    friendNameInput.value = card.dataset.name;
    friendNameInput.disabled = true;

    amountInput.value = Math.abs(amount);
    typeSelect.value = amount < 0 ? "loss" : "gain";
    modal.style.display = "flex";
}

/* ================= DELETE ================= */

deleteCancelBtn.addEventListener("click", () => {
    deleteModal.style.display = "none";
});

deleteConfirmBtn.addEventListener("click", async () => {

    deleteConfirmBtn.disabled = true;

    const res = await fetch(
        `${API_BASE_URL}/friends/${deleteConfirmBtn.dataset.id}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    deleteConfirmBtn.disabled = false;

    if (!res.ok) {
        showToast("Delete failed", "error");
        return;
    }

    deleteModal.style.display = "none";
    fetchFriends();
});

/* ================= HISTORY BUTTON STATE ================= */

function updateClearHistoryButton(historyLength) {
    if (!historyClearBtn) return;

    if (historyLength === 0) {
        historyClearBtn.disabled = true;
        historyClearBtn.style.opacity = "0.5";
        historyClearBtn.style.cursor = "not-allowed";
    } else {
        historyClearBtn.disabled = false;
        historyClearBtn.style.opacity = "1";
        historyClearBtn.style.cursor = "pointer";
    }
}


/* ================= HISTORY ================= */

function showHistory(historyJson) {
    const history = JSON.parse(historyJson);
    historyList.innerHTML = "";
    updateClearHistoryButton(history.length);

    history.forEach(h => {   // ✅ NO reverse
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <div>${new Date(h.date).toLocaleString()}</div>
                ${h.description ? `<small style="color:#777;">${h.description}</small>` : ""}
            </div>
            <span class="${h.amount < 0 ? "loss" : "gain"}">
                ${h.amount < 0 ? "-" : "+"}₹${Math.abs(h.amount)}
            </span>
        `;
        historyList.appendChild(li);
    });

    historyModal.style.display = "flex";
}

historyCloseBtn.addEventListener("click", () => {
    historyModal.style.display = "none";
});


/* ================= CALCULATOR ================= */

function openCalculator(card, amount) {
    friendToEditId = card.dataset.id;
    friendNameInput.value = card.dataset.name;
    friendNameInput.disabled = true;

    calculatorExpression = amount.toString();
    calculatorDisplay.value = calculatorExpression;
    calculatorModal.style.display = "flex";
}

calculatorButtons.addEventListener("click", e => {
    const btn = e.target;
    if (!btn.dataset.value && !btn.dataset.action) return;

    if (btn.dataset.action === "clear") calculatorExpression = "";
    else if (btn.dataset.action === "cut") calculatorExpression = calculatorExpression.slice(0, -1);
    else calculatorExpression += btn.dataset.value;

    calculatorDisplay.value = calculatorExpression || "0";
});

useCalculatedBtn.addEventListener("click", () => {
    const result = eval(calculatorExpression || "0");
    calculatorModal.style.display = "none";
    amountInput.value = Math.abs(result);
    typeSelect.value = result < 0 ? "loss" : "gain";
    modal.style.display = "flex";
});

closeCalculatorBtn.addEventListener("click", () => {
    calculatorModal.style.display = "none";
});

/* ================= SETTLE FRIEND ================= */

function renderFriendCard(friend) {
    const card = document.createElement("div");
    card.className = `friend-card ${friend.currentAmount < 0 ? "loss" : "gain"}`;

    card.dataset.id = friend._id;
    card.dataset.name = friend.name;
    card.dataset.amount = friend.currentAmount;
    card.dataset.history = JSON.stringify(friend.history);

    const showSettleBtn = friend.currentAmount !== 0;

    card.innerHTML = `
        <div class="friend-top">
            <h3>${friend.name}</h3>
            <span class="amount">
                ${friend.currentAmount < 0 ? "-" : "+"}₹${Math.abs(friend.currentAmount)}
            </span>
        </div>

        <p class="date">
            Last updated: ${new Date(friend.updatedAt).toLocaleString()}
        </p>

        <div class="card-actions">
            <button class="add-amount-btn">Add Amount</button>
            ${showSettleBtn ? `<button class="settle-btn">Settle Up</button>` : ""}
            <button>Calculate</button>
            <button>Edit</button>
            <button>History</button>
            <button class="delete">Delete</button>
        </div>
    `;

    friendList.appendChild(card);
}

/* ================= SETTLE FRIEND ================= */

async function settleFriend(id) {
    try {
        const res = await fetch(
            `${API_BASE_URL}/friends/${id}/settle`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || "Settlement failed", "error");
            return;
        }

        showToast("Balance settled successfully", "success");

        await fetchFriends(); // 🔥 THIS FIXES AMOUNT NOT UPDATING

    } catch (err) {
        showToast("Settlement failed", "error");
    }
}

/* ================= SETTLE MODAL EVENTS ================= */

settleCancelBtn.addEventListener("click", () => {
    settleModal.style.display = "none";
    friendToEditId = null;
});

settleConfirmBtn.addEventListener("click", async () => {
    if (!friendToEditId) return;

    await settleFriend(friendToEditId);

    settleModal.style.display = "none";
    friendToEditId = null;
});


/* ================= RESET MODAL ================= */

function closeModal() {
    modal.style.display = "none";
    friendNameInput.value = "";
    friendNameInput.disabled = false;
    amountInput.value = "";
    typeSelect.value = "";
    formError.textContent = "";
    friendToEditId = null;
    descriptionInput.value = "";
}

/* ================= ADD AMOUNT LOGIC (NEW) ================= */

cancelAddAmount.addEventListener("click", () => {
    addAmountModal.style.display = "none";
    addAmountValue.value = "";
    addAmountType.value = "";
    addAmountDescription.value = "";
    addAmountError.textContent = "";
});

confirmAddAmount.addEventListener("click", async () => {

    addAmountError.textContent = "";

    const value = addAmountValue.value;
    const type = addAmountType.value;
    const description = addAmountDescription.value.trim();

    if (!value || !type) {
        addAmountError.textContent = "Please fill all fields";
        return;
    }

    let amount = Number(value);

    if (isNaN(amount)) {
        addAmountError.textContent = "Invalid amount";
        return;
    }

    amount = type === "loss"
        ? -Math.abs(amount)
        : Math.abs(amount);

    try {
        await updateAmount(friendToEditId, amount, description, "add");

        addAmountModal.style.display = "none";
        addAmountValue.value = "";
        addAmountType.value = "";
        addAmountDescription.value = "";

        await fetchFriends();

    } catch (err) {
        addAmountError.textContent = "Failed to add amount";
    }
});


/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", fetchFriends);

/* =====================================================
   TOAST NOTIFICATIONS (NEW – SAFE APPEND)
===================================================== */

// Create toast container dynamically
(function createToastContainer(){
    if (document.getElementById("toast-container")) return;

    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
})();

// Toast helper
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3200);
}

// 🔍 SAFE FETCH WRAPPER (NO LOGIC MODIFIED)
(function wrapFetchForToasts(){
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        const response = await originalFetch(...args);

        try {
            const [url, options] = args;
            const method = options?.method || "GET";

            if (response.ok) {
                if (method === "POST" && url.includes("/friends")) {
                    showToast("Friend added successfully", "success");
                }

                if (method === "PUT" && url.includes("/amount")) {
                    showToast("Amount updated", "info");
                }

                if (
                    method === "DELETE" &&
                    url.includes("/friends") &&
                    !url.includes("/history")
                ) {
                    showToast("Friend deleted", "error");
                }
            }
        } catch (e) {
            // silent fail – never block app
        }

        return response;
    };
})();

/* ================= SAFE API WRAPPER ================= */

async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return null;
        }

        if (!res.ok) {
            throw new Error("API Error");
        }

        return await res.json();
    } catch (err) {
        showToast("Server error. Try again.", "error");
        return null;
    }
}

/* ================= CLEAR HISTORY (FIXED & SAFE) ================= */

document.addEventListener("DOMContentLoaded", () => {

    if (!historyClearBtn) return;

    historyClearBtn.addEventListener("click", async () => {
        if (!friendToEditId) {
            showToast("No friend selected", "error");
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE_URL}/friends/${friendToEditId}/history`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) throw new Error("Failed");

            // Clear UI immediately
            historyList.innerHTML = "";

            // Disable button instantly
            updateClearHistoryButton(0);


            // 🔄 REFRESH FRIEND DATA (IMPORTANT)
            await fetchFriends();

            showToast("Transaction history cleared", "info");

        } catch (err) {
            showToast("Failed to clear history", "error");
        }
    });
});


