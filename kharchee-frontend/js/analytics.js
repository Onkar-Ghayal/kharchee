/* =====================================================
   KHARCHEE – ADVANCED ANALYTICS ENGINE (PRO VERSION)
===================================================== */

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const givenEl = document.getElementById("analyticsGiven");
const takenEl = document.getElementById("analyticsTaken");
const netEl = document.getElementById("analyticsNet");
const insightEl = document.getElementById("analyticsInsight");

const filterButtons = document.querySelectorAll(".filter-btn");

let allFriends = [];
let currentFilter = "all";

/* ================= FORMATTER ================= */

function formatCurrency(num) {
    return "₹" + num.toLocaleString("en-IN");
}

/* ================= FETCH ================= */

async function fetchFriends() {
    const res = await fetch(`${API_BASE_URL}/friends`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    allFriends = await res.json();
    calculateAnalytics();
}

/* ================= FILTER ================= */

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter =
            btn.id === "filter30" ? "30days" : "all";

        calculateAnalytics();
    });
});

/* ================= CHART INSTANCES ================= */

let pieChart,
    monthlyChart,
    yearlyChart,
    dailyChart,
    weeklyChart;

/* ================= MAIN CALCULATION ================= */

function calculateAnalytics() {

    let totalGiven = 0;
    let totalTaken = 0;

    let monthlyData = new Array(12).fill(0);
    let yearlyData = {};

    let dailyData = new Array(30).fill(0);
    let weeklyData = [0, 0, 0, 0]; // 4 weeks

    const now = new Date();

    allFriends.forEach(friend => {

        friend.history.forEach(h => {

            const amount = h.amount;
            const date = new Date(h.date);

            const diffDays = (now - date) / (1000 * 60 * 60 * 24);

            /* ===== 30 DAY FILTER ===== */
            if (currentFilter === "30days" && diffDays > 30) return;

            if (amount > 0) totalGiven += amount;
            if (amount < 0) totalTaken += Math.abs(amount);

            /* ===== ALL TIME LOGIC ===== */
            if (currentFilter === "all") {
                monthlyData[date.getMonth()] += amount;

                const year = date.getFullYear();
                yearlyData[year] = (yearlyData[year] || 0) + amount;
            }

            /* ===== LAST 30 DAYS EXTRA ANALYSIS ===== */
            if (currentFilter === "30days") {

                const dayIndex = Math.floor(diffDays);
                if (dayIndex < 30) {
                    dailyData[29 - dayIndex] += amount;
                }

                const weekIndex = Math.floor(diffDays / 7);
                if (weekIndex < 4) {
                    weeklyData[3 - weekIndex] += amount;
                }
            }
        });
    });

    const net = totalGiven - totalTaken;

    /* ===== UPDATE UI ===== */

    givenEl.textContent = formatCurrency(totalGiven);
    takenEl.textContent = formatCurrency(totalTaken);
    netEl.textContent = formatCurrency(net);

    generateInsight(net);

    renderPieChart(totalGiven, totalTaken);

    if (currentFilter === "all") {
        renderMonthlyChart(monthlyData);
        renderYearlyChart(yearlyData);
    } else {
        renderDailyChart(dailyData);
        renderWeeklyChart(weeklyData);
    }
}

/* ================= INSIGHT ENGINE ================= */

function generateInsight(net) {

    if (currentFilter === "30days") {

        if (net > 0)
            insightEl.textContent =
                "Last 30 days show positive financial flow. You are gaining more than spending.";

        else if (net < 0)
            insightEl.textContent =
                "In the last 30 days, spending exceeded gains. Consider reviewing settlements.";

        else
            insightEl.textContent =
                "Last 30 days are financially balanced.";

        return;
    }

    if (net > 0)
        insightEl.textContent =
            "Overall positive financial position. Friends owe you money.";

    else if (net < 0)
        insightEl.textContent =
            "Overall negative balance. Consider settling dues.";

    else
        insightEl.textContent =
            "Perfectly balanced across all time.";
}

/* ================= PIE ================= */

function renderPieChart(given, taken) {

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(document.getElementById("pieChart"), {
        type: "doughnut",
        data: {
            labels: ["Given", "Taken"],
            datasets: [{
                data: [given, taken],
                backgroundColor: ["#10b981", "#ef4444"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } }
        }
    });
}

/* ================= MONTHLY ================= */

function renderMonthlyChart(data) {

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(document.getElementById("monthlyChart"), {
        type: "bar",
        data: {
            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
            datasets: [{
                label: "Monthly Net",
                data: data,
                borderRadius: 6,
                backgroundColor: "#9333ea"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

/* ================= YEARLY ================= */

function renderYearlyChart(dataObj) {

    if (yearlyChart) yearlyChart.destroy();

    const labels = Object.keys(dataObj);
    const values = Object.values(dataObj);

    yearlyChart = new Chart(document.getElementById("yearlyChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Yearly Net",
                data: values,
                tension: 0.4,
                borderColor: "#7e22ce",
                backgroundColor: "rgba(147,51,234,0.15)",
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/* ================= DAILY (30 DAYS) ================= */

function renderDailyChart(data) {

    if (monthlyChart) monthlyChart.destroy();
    if (yearlyChart) yearlyChart.destroy();

    monthlyChart = new Chart(document.getElementById("monthlyChart"), {
        type: "bar",
        data: {
            labels: Array.from({ length: 30 }, (_, i) => `Day ${i+1}`),
            datasets: [{
                label: "Daily Net (30 Days)",
                data: data,
                backgroundColor: "#6366f1",
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/* ================= WEEKLY (30 DAYS) ================= */

function renderWeeklyChart(data) {

    yearlyChart = new Chart(document.getElementById("yearlyChart"), {
        type: "bar",
        data: {
            labels: ["Week 1","Week 2","Week 3","Week 4"],
            datasets: [{
                label: "Weekly Net (30 Days)",
                data: data,
                backgroundColor: "#7c3aed",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", fetchFriends);
