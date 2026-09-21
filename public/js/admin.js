const tokenKey = "meridianAdminToken";
const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const loginMessage = document.getElementById("loginMessage");
const dashboardMessage = document.getElementById("dashboardMessage");

function showMessage(element, message) {
  element.textContent = message || "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

function cell(value) {
  const element = document.createElement("td");
  element.textContent = value || "—";
  return element;
}

function addRow(tableBody, values) {
  const row = document.createElement("tr");
  values.forEach((value) => row.appendChild(cell(value)));
  tableBody.appendChild(row);
}

async function loadDashboard() {
  const token = sessionStorage.getItem(tokenKey);
  if (!token) return;
  const response = await fetch("http://localhost:5001/api/admin/data", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) {
    sessionStorage.removeItem(tokenKey);
    dashboardPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    throw new Error(result.message || "Your admin session has expired.");
  }

  const { academyRegistrations, scoutingRequests } = result.data;
  document.getElementById("academyCount").textContent =
    academyRegistrations.length;
  document.getElementById("scoutingCount").textContent =
    scoutingRequests.length;
  const academyRows = document.getElementById("academyRows");
  const scoutingRows = document.getElementById("scoutingRows");
  academyRows.replaceChildren();
  scoutingRows.replaceChildren();
  academyRegistrations.forEach((item) =>
    addRow(academyRows, [
      item.name,
      item.email,
      item.mobile,
      formatDate(item.createdAt),
    ]),
  );
  scoutingRequests.forEach((item) =>
    addRow(scoutingRows, [
      item.name,
      item.opponentClub,
      item.notes,
      item.status,
      formatDate(item.createdAt),
    ]),
  );
}

async function openDashboard() {
  loginPanel.classList.add("hidden");
  dashboardPanel.classList.remove("hidden");
  try {
    await loadDashboard();
    showMessage(dashboardMessage, "");
  } catch (error) {
    showMessage(loginMessage, error.message);
  }
}

document
  .getElementById("adminLoginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage(loginMessage, "Signing in...");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Login failed.");
      sessionStorage.setItem(tokenKey, result.token);
      event.currentTarget.reset();
      await openDashboard();
    } catch (error) {
      showMessage(loginMessage, error.message);
    }
  });

document.getElementById("refreshButton").addEventListener("click", async () => {
  try {
    await loadDashboard();
    showMessage(dashboardMessage, "Data refreshed.");
  } catch (error) {
    showMessage(dashboardMessage, error.message);
  }
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  const token = sessionStorage.getItem(tokenKey);
  await fetch("http://localhost:5001/api/admin/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  sessionStorage.removeItem(tokenKey);
  dashboardPanel.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  showMessage(loginMessage, "You have been logged out.");
});

if (sessionStorage.getItem(tokenKey)) openDashboard();
