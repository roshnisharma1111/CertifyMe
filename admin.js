const BASE_URL = "http://127.0.0.1:5000";

console.log("JS LOADED");

/* ================= HELPERS ================= */
function get(id) {
    return document.getElementById(id);
}

/* ================= CAPTCHA ================= */
let captchaStore = { login: "", signup: "", forgot: "" };

function generateCaptcha(type) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captcha = "";

    for (let i = 0; i < 5; i++) {
        captcha += chars[Math.floor(Math.random() * chars.length)];
    }

    captchaStore[type] = captcha;

    const el = get(type + "CaptchaText");
    if (el) el.innerText = captcha;
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {

    generateCaptcha("login");
    generateCaptcha("signup");
    generateCaptcha("forgot");

    initForms();
    initNavigation();
});

/* ================= FORMS ================= */
function initForms() {
    get("loginForm")?.addEventListener("submit", loginHandler);
    get("signupForm")?.addEventListener("submit", signupHandler);
    get("forgotForm")?.addEventListener("submit", forgotHandler);
}

/* ================= LOGIN ================= */
async function loginHandler(e) {
    e.preventDefault();

    const email = get("loginEmail").value;
    const password = get("loginPassword").value;
    const captcha = get("loginCaptchaInput").value;

    // ✅ CAPTCHA CHECK
    if (captcha !== captchaStore.login) {
        alert("Wrong captcha");
        generateCaptcha("login");
        return;
    }

    try {
        const res = await fetch(BASE_URL + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await res.json();

        alert(data.message || data.error);

        // ✅ SUCCESS LOGIN
        if (!data.error) {
            showDashboard();        // show dashboard
            loadOpportunities();   // 🔥 VERY IMPORTANT (assignment requirement)
        }

    } catch (err) {
        console.error(err);
        alert("Login failed. Check backend.");
    }
}

/* ================= SIGNUP ================= */
async function signupHandler(e) {
    e.preventDefault();

    const captcha = get("signupCaptchaInput").value;

    if (captcha !== captchaStore.signup) {
        alert("Wrong captcha");
        generateCaptcha("signup");
        return;
    }

    const res = await fetch(BASE_URL + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            full_name: get("signupName").value,
            email: get("signupEmail").value,
            password: get("signupPassword").value
        })
    });

    const data = await res.json();
    alert(data.message || data.error);

    if (!data.error) showPage("loginPage");
}

/* ================= FORGOT ================= */
function forgotHandler(e) {
    e.preventDefault();

    if (get("forgotCaptchaInput").value !== captchaStore.forgot) {
        alert("Wrong captcha");
        generateCaptcha("forgot");
        return;
    }

    alert("Reset link sent (demo)");
}

/* ================= DASHBOARD ================= */
function showDashboard() {
    get("authWrapper").style.display = "none";
    get("dashboardWrapper").style.display = "block";
}

/* ================= PAGE SWITCH ================= */
function showPage(pageId) {
    document.querySelectorAll(".form-page").forEach(p => p.classList.remove("active"));
    get(pageId).classList.add("active");

    if (pageId === "loginPage") generateCaptcha("login");
    if (pageId === "signupPage") generateCaptcha("signup");
    if (pageId === "forgotPage") generateCaptcha("forgot");
}

/* ================= NAVIGATION ================= */
function initNavigation() {
    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.addEventListener("click", function () {

            document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            const page = this.dataset.page;
            if (!page) return;

            document.querySelectorAll(".dash-section").forEach(sec => sec.classList.remove("active"));
            get(page + "Section")?.classList.add("active");

            get("pageTitle").innerText = this.innerText.trim();
        });
    });
}

/* ================= OPPORTUNITY FUNCTIONS ================= */

// Add New Opportunity button
function openOpportunityModal() {
    const title = prompt("Enter Opportunity Title");
    const description = prompt("Enter Description");

    if (!title) return;

    fetch(BASE_URL + "/opportunities", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            description: description || "",
            category: "General"
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Opportunity added");

        // ✅ NO PAGE RELOAD
        loadOpportunities();  // 🔥 IMPORTANT
    })
    .catch(err => {
        console.error(err);
        alert("Error adding opportunity");
    });
}
function handleLogout() {
    fetch(BASE_URL + "/logout", {
        method: "POST",
        credentials: "include"
    })
    .then(() => {
        alert("Logged out successfully");
        location.reload();
    });
}

function togglePass(id, btn) {
    const input = document.getElementById(id);

    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}
function loadOpportunities() {
    fetch(BASE_URL + "/opportunities", {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {

        const container = document.querySelector(".opportunity-list"); // ✅ FIXED
        if (!container) return;

        container.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            container.innerHTML = "<p>No opportunities yet</p>";
            return;
        }

        data.data.forEach(op => {
            container.innerHTML += `
                <div class="card">
                    <h3>${op.title}</h3>
                    <p>${op.description}</p>

                    <button onclick="openOpportunityDetails('${op.title}')">View</button>
                    <button onclick="deleteOpportunity(${op.id})">Delete</button>
                </div>
            `;
        });
    })
    .catch(err => {
        console.error(err);
        alert("Error loading opportunities");
    });
}
function deleteOpportunity(id) {
    if (!confirm("Delete this opportunity?")) return;

    fetch(BASE_URL + "/opportunities/" + id, {
        method: "DELETE",
        credentials: "include"
    })
    .then(() => {
        alert("Deleted");
        loadOpportunities();
    });
}
// View Details button
function openOpportunityDetails(title) {
    alert("Showing details for: " + title);
}
/* ================= UI FUNCTIONS ================= */
function toggleTheme() {
    document.body.classList.toggle("dark");
}

function openSearch() {
    get("searchContainer").style.display = "flex";
}

function closeSearch() {
    get("searchContainer").style.display = "none";
}

function toggleNotifications() {
    get("notificationDropdown").classList.toggle("active");
}

function markAllRead() {
    alert("All notifications marked as read");
}

function changeChartPeriod(type) {
    alert("Chart changed to " + type);
}

/* ================= SAFE EMPTY FUNCTIONS ================= */
function openQuickAddModal() { alert("Quick Add Student"); }
function openBulkUploadModal() { alert("Bulk Upload"); }
function filterStudents() {}

function openQuickAddVerifierModal() { alert("Add Verifier"); }
function openBulkUploadVerifierModal() { alert("Upload Verifier"); }
function filterVerifiers() {}

function openCourseDetails(name) { alert(name); }
function openVerifierDetails(name) { alert(name); }
function openCollaboratorCourses(name) { alert(name); }