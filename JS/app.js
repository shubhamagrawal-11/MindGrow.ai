var USERS_KEY = "mindgrow_users_v1";
var SESSION_USER_KEY = "mindgrow_session_v1";
var ROLE_KEY = "mindgrow_userRole_v1";

var AVATARS = ["🦁", "🦊", "🦉", "🐼", "🐯", "🐺", "🦄", "🐘", "🦅", "🐢"];

var BADGE_DEFS = [
  { key: "focusChampion", name: "Focus Champion", icon: "🎯" },
  { key: "empathyStar", name: "Empathy Star", icon: "🤝" },
  { key: "consistencyHero", name: "Consistency Hero", icon: "🔥" },
  { key: "speedster", name: "Speedster", icon: "⚡" },
  { key: "perfectRun", name: "Perfect Run", icon: "💎" },
];

var LEVELS = [
  { name: "Beginner", min: 0, max: 100, next: "Apprentice" },
  { name: "Apprentice", min: 100, max: 250, next: "Scholar" },
  { name: "Scholar", min: 250, max: 500, next: "Expert" },
  { name: "Expert", min: 500, max: 1000, next: "Master" },
  { name: "Master", min: 1000, max: Infinity, next: "Legend" },
];

var ROLE_NAV = {
  student: ["screen-student", "screen-quiz", "screen-focus", "screen-growth"],
  teacher: ["screen-teacher"],
};

var currentUser = null;
var sessionStart = Date.now();
var sessionTimerInterval = null;

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_USER_KEY));
  } catch (e) {
    return null;
  }
}

function setSessionUser(user) {
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, user.role);
}

function clearSession() {
  sessionStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

function updateCurrentUser(updates) {
  if (!currentUser) return;
  Object.assign(currentUser, updates);
  setSessionUser(currentUser);
  var users = getUsers();
  var idx = users.findIndex(function (u) {
    return u.id === currentUser.id;
  });
  if (idx !== -1) {
    users[idx] = currentUser;
    setUsers(users);
  }
}

function toast(msg) {
  var el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(el._t);
  el._t = setTimeout(function () {
    el.classList.add("hidden");
  }, 3000);
}

function showNavbar(role) {
  var nav = document.getElementById("topNav");
  if (!nav) return;
  nav.classList.remove("hidden");
  var allowed = ROLE_NAV[role] || [];
  nav.querySelectorAll(".nav-tab[data-screen]").forEach(function (btn) {
    if (allowed.indexOf(btn.dataset.screen) !== -1) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  });
  var xpChip = document.getElementById("globalXP");
  if (xpChip) {
    if (role === "student") xpChip.classList.remove("hidden");
    else xpChip.classList.add("hidden");
  }
}

function hideNavbar() {
  var nav = document.getElementById("topNav");
  if (nav) nav.classList.add("hidden");
}

function astraShow() {
  var el = document.getElementById("astra-float");
  if (el) el.classList.remove("hidden");
}

function astraHide() {
  var el = document.getElementById("astra-float");
  if (el) el.classList.add("hidden");
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function (s) {
    s.classList.remove("active");
  });
  var target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function navTo(screenId) {
  showScreen(screenId);
  document.querySelectorAll(".nav-tab").forEach(function (t) {
    t.classList.remove("active");
  });
  var tab = document.querySelector(".nav-tab[data-screen='" + screenId + "']");
  if (tab) tab.classList.add("active");
  if (screenId === "screen-student") renderStudent();
  else if (screenId === "screen-quiz") initQuiz();
  else if (screenId === "screen-teacher") renderTeacher();
  else if (screenId === "screen-growth") renderGrowth();
}

function logout() {
  clearSession();
  currentUser = null;
  clearInterval(sessionTimerInterval);
  sessionTimerInterval = null;
  astraHide();
  hideNavbar();
  showScreen("screen-auth");
  toast("✅ Logged out successfully!");
}

function getLevel(xp) {
  var lv = LEVELS.find(function (l) {
    return xp >= l.min && xp < l.max;
  });
  return lv ? lv.name : "Beginner";
}

function getLevelRange(xp) {
  return (
    LEVELS.find(function (l) {
      return xp >= l.min && xp < l.max;
    }) || LEVELS[0]
  );
}

function refreshXPChips() {
  var xp = currentUser && currentUser.xp ? currentUser.xp : 0;
  document.querySelectorAll(".xp-chip").forEach(function (el) {
    el.textContent = xp + " XP";
  });
}

function unlockBadge(key) {
  if (!currentUser || currentUser.badges[key]) return false;
  currentUser.badges[key] = true;
  updateCurrentUser({ badges: currentUser.badges });
  var def = BADGE_DEFS.find(function (b) {
    return b.key === key;
  });
  if (def) toast("🏅 Badge unlocked: " + def.name + "!");
  return true;
}

function showCoach(msg) {
  var panel = document.getElementById("coachPanel");
  var msgEl = document.getElementById("coachMsg");
  if (!panel || !msgEl) return;
  msgEl.textContent = msg;
  panel.classList.add("visible");
}

function hideCoach() {
  var panel = document.getElementById("coachPanel");
  if (panel) panel.classList.remove("visible");
}

function startSessionTimer() {
  clearInterval(sessionTimerInterval);
  sessionTimerInterval = setInterval(function () {
    var el = document.getElementById("sessionTimer");
    if (!el) return;
    var secs = Math.floor((Date.now() - sessionStart) / 1000);
    var mm = String(Math.floor(secs / 60)).padStart(2, "0");
    var ss = String(secs % 60).padStart(2, "0");
    el.textContent = mm + ":" + ss;
  }, 1000);
}

function showResults(opts) {
  var correct = opts.correct || 0;
  var total = opts.total || 0;
  var xpEarned = opts.xpEarned || 0;
  var difficulty = opts.difficulty || "medium";
  var badgesUnlocked = opts.badgesUnlocked || [];
  var acc = total > 0 ? Math.round((correct / total) * 100) : 0;
  var trophy = acc >= 80 ? "🏆" : acc >= 50 ? "🥈" : "⭐";
  var headline =
    acc >= 80 ? "Outstanding!" : acc >= 50 ? "Quest Complete!" : "Good Effort!";

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  setText("resTrophy", trophy);
  setText("resTitle", headline);
  setText(
    "resSub",
    correct + " of " + total + " correct · " + difficulty + " difficulty"
  );
  setText("resScore", correct + "/" + total);
  setText("resAccuracy", acc + "%");
  setText("resXPEarned", "+" + xpEarned);
  setText("resNewLevel", getLevel(currentUser ? currentUser.xp || 0 : 0));

  var badgeSec = document.getElementById("newBadgesSection");
  if (badgeSec) {
    if (badgesUnlocked.length > 0) {
      var chips = badgesUnlocked
        .map(function (b) {
          return '<div class="nb-chip">' + b.icon + " " + b.name + "</div>";
        })
        .join("");
      badgeSec.innerHTML =
        '<p class="text-sm text-muted mt-8 mb-8">🏅 New badges earned:</p>' +
        '<div class="new-badge-row">' +
        chips +
        "</div>";
    } else {
      badgeSec.innerHTML = "";
    }
  }

  var userXP = currentUser ? currentUser.xp || 0 : 0;
  if (acc < 50) {
    showCoach(
      "Don't worry — mistakes are how we grow! Review the explanations and try again. 📈"
    );
  } else if (acc === 100) {
    showCoach(
      "PERFECT SCORE! 💎 You're absolutely crushing it. The Master level is calling!"
    );
  } else if (userXP > 250) {
    showCoach(
      "🔥 Great momentum! You're getting close to Master level. Keep it going!"
    );
  }

  showScreen("screen-results");
  document.querySelectorAll(".nav-tab").forEach(function (t) {
    t.classList.remove("active");
  });

  if (currentUser && currentUser.role === "student") {
    setTimeout(function () {
      var notif = document.getElementById("astra-notif");
      if (notif) notif.classList.remove("hidden");
    }, 1000);
  }
}

function _applyRoleUI(user) {
  showNavbar(user.role);
  refreshXPChips();
  if (user.role === "teacher") {
    astraHide();
    showScreen("screen-teacher");
    renderTeacher();
  } else {
    astraShow();
    showScreen("screen-mood");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var savedUser = getSessionUser();
  if (savedUser) {
    currentUser = savedUser;
    sessionStart = Date.now();
    startSessionTimer();
    _applyRoleUI(currentUser);
  } else {
    hideNavbar();
    astraHide();
    showScreen("screen-auth");
  }

  document.querySelectorAll(".nav-tab[data-screen]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      navTo(btn.dataset.screen);
    });
  });

  var emailInput = document.getElementById("login-email");
  var passInput = document.getElementById("login-pass");
  if (emailInput)
    emailInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") doLogin();
    });
  if (passInput)
    passInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") doLogin();
    });

  if (typeof newPrompt === "function") newPrompt();
});
