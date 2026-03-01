function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  document.querySelectorAll(".auth-form-panel").forEach(function (panel) {
    panel.classList.toggle("active", panel.id === "auth-" + tab);
  });
}

function selectRole(role) {
  document.querySelectorAll(".role-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.role === role);
  });
}

function selectAvatar(el) {
  document.querySelectorAll(".avatar-opt").forEach(function (o) {
    o.classList.remove("selected");
  });
  el.classList.add("selected");
}

document.addEventListener("DOMContentLoaded", function () {
  var picker = document.getElementById("avatarPicker");
  if (!picker) return;
  picker.innerHTML = AVATARS.map(function (a) {
    return '<div class="avatar-opt" onclick="selectAvatar(this)">' + a + "</div>";
  }).join("");
  var first = picker.querySelector(".avatar-opt");
  if (first) first.classList.add("selected");
});

function doRegister() {
  var nameEl = document.getElementById("reg-name");
  var emailEl = document.getElementById("reg-email");
  var passEl = document.getElementById("reg-pass");
  var gradeEl = document.getElementById("reg-grade");
  var roleBtn = document.querySelector(".role-btn.active");
  var avatarEl = document.querySelector(".avatar-opt.selected");

  var name = nameEl ? nameEl.value.trim() : "";
  var email = emailEl ? emailEl.value.trim().toLowerCase() : "";
  var pass = passEl ? passEl.value : "";
  var grade = gradeEl ? gradeEl.value.trim() : "";
  var role = roleBtn ? roleBtn.dataset.role || "student" : "student";
  var avatar = avatarEl ? avatarEl.textContent : AVATARS[0];

  if (!name || !email || !pass) {
    toast("⚠️ Please fill all required fields!");
    return;
  }

  var users = getUsers();
  if (users.some(function (u) { return u.email === email; })) {
    toast("⚠️ Email already registered!");
    return;
  }

  var newUser = {
    id: Date.now(),
    name: name,
    email: email,
    pass: pass,
    role: role,
    grade: grade,
    avatar: avatar,
    xp: 0,
    streak: 1,
    totalCorrect: 0,
    totalAnswered: 0,
    quizzesDone: 0,
    badges: {},
    moodHistory: [],
    reflections: [],
    xpHistory: [0],
    sessionCount: 1,
    lastLogin: new Date().toDateString(),
  };

  users.push(newUser);
  setUsers(users);
  currentUser = newUser;
  setSessionUser(currentUser);
  toast("✅ Account created! Welcome aboard.");
  _onAuthSuccess(newUser);
}

function doLogin() {
  var emailEl = document.getElementById("login-email");
  var passEl = document.getElementById("login-pass");
  var email = emailEl ? emailEl.value.trim().toLowerCase() : "";
  var pass = passEl ? passEl.value : "";

  var users = getUsers();
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].pass === pass) {
      user = users[i];
      break;
    }
  }

  if (!user) {
    toast("⚠️ Invalid email or password!");
    return;
  }

  var today = new Date().toDateString();
  var lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
  if (lastLogin && lastLogin.toDateString() !== today) {
    var diff = Math.floor((new Date() - lastLogin) / 86400000);
    user.streak = diff === 1 ? (user.streak || 1) + 1 : 1;
  }
  user.sessionCount = (user.sessionCount || 0) + 1;
  user.lastLogin = today;

  setUsers(users);
  currentUser = user;
  setSessionUser(currentUser);
  if (user.streak >= 3) unlockBadge("consistencyHero");
  toast("✅ Logged in successfully!");
  _onAuthSuccess(user);
}

function _onAuthSuccess(user) {
  currentUser = user;
  sessionStart = Date.now();
  startSessionTimer();
  _applyRoleUI(user);
}
