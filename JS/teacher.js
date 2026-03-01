// Filename: teacher.js

function renderTeacher() {
  const students = getUsers().filter((u) => u.role === "student");
  if (students.length === 0) {
    document.getElementById("studentTableBody").innerHTML =
      '<tr><td colspan="7" class="text-center text-muted">No students yet — invite some to join!</td></tr>';
    return;
  }
  document.getElementById("t-total").textContent = students.length;
  const active = students.filter((u) => (u.sessionCount || 0) > 0).length;
  document.getElementById("t-active").textContent = active;
  const avgXP = Math.round(
    students.reduce((s, u) => s + (u.xp || 0), 0) / students.length,
  );
  document.getElementById("t-avgxp").textContent = avgXP;
  const atRisk = students.filter((u) => calcEngagement(u) < 40).length;
  document.getElementById("t-atrisk").textContent = atRisk;
  const avgEng = Math.round(
    students.reduce((s, u) => s + calcEngagement(u), 0) / students.length,
  );
  document.getElementById("t-avgEng").textContent = avgEng + "%";
  document.getElementById("t-avgEngBar").style.width = avgEng + "%";
  const avgAcc = Math.round(
    students.reduce(
      (s, u) =>
        s +
        (u.totalAnswered > 0 ? (u.totalCorrect / u.totalAnswered) * 100 : 0),
      0,
    ) / students.length,
  );
  document.getElementById("t-avgAcc").textContent = avgAcc + "%";
  document.getElementById("t-avgAccBar").style.width = avgAcc + "%";
  document.getElementById("studentTableBody").innerHTML =
    renderStudentTable(students);
}

function renderStudentTable(students) {
  return students
    .map((u) => {
      const eng = calcEngagement(u);
      const engColor =
        eng >= 70
          ? "linear-gradient(90deg, var(--teal), #4dd9bc)"
          : eng >= 40
            ? "linear-gradient(90deg, var(--amber), #f5b942)"
            : "linear-gradient(90deg, var(--rose), #f87171)";
      const moodIcons =
        u.moodHistory
          ?.slice(-3)
          .map((m) => m.emoji)
          .join("") || '<span class="text-xs text-muted">–</span>';
      const risk =
        eng < 40 ||
        u.moodHistory?.some((m) => m.mood === "Stressed" || m.mood === "Sad");
      const riskClass = risk ? "risk-high" : "risk-ok";
      const riskText = risk ? "At Risk" : "Good";
      const acc =
        u.totalAnswered > 0
          ? Math.round((u.totalCorrect / u.totalAnswered) * 100) + "%"
          : "–";
      return `<tr>
      <td class="fw-700">${u.name} <span class="text-muted text-xs">(${u.avatar})</span></td>
      <td>${getLevel(u.xp || 0)}</td>
      <td>${u.xp || 0}</td>
      <td>${acc}</td>
      <td>
        <div class="engagement-bar" style="width:80px;margin-bottom:3px">
          <div class="engagement-fill" style="width:${eng}%;background:${engColor}"></div>
        </div>
        <div class="text-xs text-muted">${eng}%</div>
      </td>
      <td><div class="mood-icons">${moodIcons}</div></td>
      <td><span class="risk-flag ${riskClass}">${riskText}</span></td>
    </tr>`;
    })
    .join("");
}

function calcEngagement(u) {
  if (!u) return 0;
  const xpScore = Math.min(40, (u.xp || 0) / 8);
  const accScore =
    u.totalAnswered > 0
      ? Math.min(30, (u.totalCorrect / u.totalAnswered) * 30)
      : 0;
  const streakScore = Math.min(20, (u.streak || 0) * 4);
  const quizScore = Math.min(10, (u.quizzesDone || 0) * 2);
  return Math.round(xpScore + accScore + streakScore + quizScore);
}
