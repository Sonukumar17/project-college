// =========================================================
// MOBILE NAV TOGGLE
// =========================================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// =========================================================
// CANVAS — draw a football pitch diagram
// =========================================================
function drawPitch() {
  const canvas = document.getElementById('pitchCanvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const margin = 20;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#F1FAEE';
  ctx.lineWidth = 3;

  // outer boundary
  ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

  // halfway line
  ctx.beginPath();
  ctx.moveTo(w / 2, margin);
  ctx.lineTo(w / 2, h - margin);
  ctx.stroke();

  // center circle
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 55, 0, Math.PI * 2);
  ctx.stroke();

  // center spot
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#F1FAEE';
  ctx.fill();

  // penalty boxes (left + right)
  const boxW = 90, boxH = 190;
  ctx.strokeRect(margin, h / 2 - boxH / 2, boxW, boxH);
  ctx.strokeRect(w - margin - boxW, h / 2 - boxH / 2, boxW, boxH);

  // six-yard boxes
  const sixW = 35, sixH = 90;
  ctx.strokeRect(margin, h / 2 - sixH / 2, sixW, sixH);
  ctx.strokeRect(w - margin - sixW, h / 2 - sixH / 2, sixW, sixH);

  // penalty arcs ("the D")
  ctx.beginPath();
  ctx.arc(margin + boxW, h / 2, 50, -0.65, 0.65);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w - margin - boxW, h / 2, 50, Math.PI - 0.65, Math.PI + 0.65);
  ctx.stroke();
}
drawPitch();

// =========================================================
// 45' CONTROL ROOM — event handling
// =========================================================

// -- Scoreboard counter
const scoreValue = document.getElementById('scoreValue');
const incBtn = document.getElementById('incBtn');
const decBtn = document.getElementById('decBtn');
let score = 0;

incBtn.addEventListener('click', () => {
  score++;
  scoreValue.textContent = score;
});
decBtn.addEventListener('click', () => {
  score = Math.max(0, score - 1);
  scoreValue.textContent = score;
});

// -- Kit color selection (background change on selection)
const kitButtons = document.querySelectorAll('.kit-btn');
const kitSwatchArea = document.getElementById('kitSwatchArea');
const kitPreviewText = document.getElementById('kitPreviewText');

kitButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.dataset.color;
    kitSwatchArea.style.background = color;
    kitPreviewText.textContent = `Away kit set to ${color}`;
    // pick readable text color
    kitPreviewText.style.color = (color === '#FFD60A') ? '#0B1D26' : '#F1FAEE';
  });
});

// -- Player card zoom on mouseover / mouseout
const zoomImg = document.getElementById('zoomImg');
zoomImg.addEventListener('mouseover', () => zoomImg.classList.add('zoomed'));
zoomImg.addEventListener('mouseout', () => zoomImg.classList.remove('zoomed'));

// -- Image switching via thumbnail buttons
const switchImg = document.getElementById('switchImg');
const thumbButtons = document.querySelectorAll('.thumb-btn');

thumbButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchImg.src = btn.dataset.src;
    switchImg.alt = btn.dataset.alt;
    thumbButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// -- Show / hide bench list
const toggleBenchBtn = document.getElementById('toggleBenchBtn');
const benchList = document.getElementById('benchList');

toggleBenchBtn.addEventListener('click', () => {
  const isHidden = benchList.classList.toggle('hidden');
  toggleBenchBtn.textContent = isHidden ? 'Show Bench' : 'Hide Bench';
});

// =========================================================
// 60' ACADEMY REGISTRATION — client-side validation
// =========================================================
const regForm = document.getElementById('regForm');
const regSuccess = document.getElementById('regSuccess');

const fields = {
  regName: document.getElementById('regName'),
  regEmail: document.getElementById('regEmail'),
  regPassword: document.getElementById('regPassword'),
  regConfirm: document.getElementById('regConfirm'),
  regMobile: document.getElementById('regMobile'),
};

function setError(fieldKey, message) {
  const input = fields[fieldKey];
  const errorEl = document.getElementById('err-' + fieldKey);
  if (message) {
    errorEl.textContent = message;
    input.classList.add('invalid');
    input.classList.remove('valid');
  } else {
    errorEl.textContent = '';
    input.classList.remove('invalid');
    input.classList.add('valid');
  }
}

function validateForm() {
  let isValid = true;
  regSuccess.classList.add('hidden');

  const name = fields.regName.value.trim();
  const email = fields.regEmail.value.trim();
  const password = fields.regPassword.value;
  const confirm = fields.regConfirm.value;
  const mobile = fields.regMobile.value.trim();

  // Name
  if (!name) {
    setError('regName', 'Please enter your full name.');
    isValid = false;
  } else {
    setError('regName', '');
  }

  // Email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    setError('regEmail', 'Email address is required.');
    isValid = false;
  } else if (!emailPattern.test(email)) {
    setError('regEmail', 'Enter a valid email address.');
    isValid = false;
  } else {
    setError('regEmail', '');
  }

  // Password: min 8 chars, letters + numbers
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!password) {
    setError('regPassword', 'Password is required.');
    isValid = false;
  } else if (!passwordPattern.test(password)) {
    setError('regPassword', 'Min 8 characters, with letters and numbers.');
    isValid = false;
  } else {
    setError('regPassword', '');
  }

  // Confirm password
  if (!confirm) {
    setError('regConfirm', 'Please confirm your password.');
    isValid = false;
  } else if (confirm !== password) {
    setError('regConfirm', 'Passwords do not match.');
    isValid = false;
  } else {
    setError('regConfirm', '');
  }

  // Mobile number: digits only, fixed length (10)
  const mobilePattern = /^\d{10}$/;
  if (!mobile) {
    setError('regMobile', 'Mobile number is required.');
    isValid = false;
  } else if (!mobilePattern.test(mobile)) {
    setError('regMobile', 'Enter exactly 10 digits, numbers only.');
    isValid = false;
  } else {
    setError('regMobile', '');
  }

  return isValid;
}

regForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const success = validateForm();
  if (success) {
    regSuccess.classList.remove('hidden');
    regForm.reset();
    Object.values(fields).forEach(input => input.classList.remove('valid'));
  } else {
    regSuccess.classList.add('hidden');
  }
});

// =========================================================
// 75' LIVE CLUB LOOKUP — fetch() + JSON
// =========================================================
const teamSearchBtn = document.getElementById('teamSearchBtn');
const teamSearchInput = document.getElementById('teamSearch');
const teamResults = document.getElementById('teamResults');

async function searchTeam() {
  const query = teamSearchInput.value.trim();
  if (!query) {
    teamResults.innerHTML = '<p class="caption">Type a club name first.</p>';
    return;
  }

  teamResults.innerHTML = '<p class="caption">Searching&hellip;</p>';

  try {
    // TheSportsDB free public test endpoint (key "3")
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`
    );

    if (!response.ok) throw new Error('Network response was not OK');

    const data = await response.json();
    const teams = data.teams;

    if (!teams) {
      teamResults.innerHTML = '<p class="caption">No club found with that name. Try another spelling.</p>';
      return;
    }

    teamResults.innerHTML = teams.slice(0, 5).map(team => `
      <div class="team-card">
        <img src="${team.strTeamBadge || team.strTeamLogo || 'https://via.placeholder.com/64'}" alt="${team.strTeam} badge">
        <div>
          <h3>${team.strTeam}</h3>
          <p>${team.strLeague || 'League unknown'} &middot; ${team.strStadium || 'Stadium unknown'}</p>
        </div>
      </div>
    `).join('');

  } catch (err) {
    teamResults.innerHTML = '<p class="caption">Could not reach the live data service right now. Please try again shortly.</p>';
  }
}

teamSearchBtn.addEventListener('click', searchTeam);
teamSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchTeam();
  }
});
