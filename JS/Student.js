// Filename: student.js

function renderStudent() {
  if (!currentUser) return;
  const u = currentUser;
  document.getElementById("heroAvatar").textContent = u.avatar;
  document.getElementById("heroName").textContent = u.name;
  document.getElementById("heroGrade").textContent = u.grade || "Student";
  document.getElementById("heroXP").textContent = u.xp || 0;
  document.getElementById("heroStreak").textContent = u.streak || 1;
  document.getElementById("heroQuizzes").textContent = u.quizzesDone || 0;
  document.getElementById("statLevel").textContent = getLevel(u.xp || 0);
  document.getElementById("statStreak").textContent = u.streak || 1;
  const acc =
    u.totalAnswered > 0
      ? Math.round((u.totalCorrect / u.totalAnswered) * 100)
      : 0;
  document.getElementById("statAcc").textContent = acc + "%";
  const badges = document.getElementById("badgeGrid");
  badges.innerHTML = BADGE_DEFS.map((b) => {
    const earned = u.badges[b.key];
    return `<div class="badge-tile ${earned ? "earned" : "locked"}">
      <span class="b-icon">${b.icon}</span>
      <span class="b-name">${b.name}</span>
      <span class="b-status">${earned ? "Earned" : "Locked"}</span>
    </div>`;
  }).join("");
  const range = getLevelRange(u.xp || 0);
  const pct = Math.min(
    100,
    Math.round(((u.xp - range.min) / (range.max - range.min)) * 100),
  );
  document.getElementById("currentLevel").textContent = getLevel(u.xp || 0);
  document.getElementById("levelXP").textContent =
    `${u.xp || 0} / ${range.max} XP`;
  document.getElementById("levelBar").style.width = pct + "%";
  document.getElementById("userAvatar").textContent = u.avatar;
  refreshXPChips();
}
