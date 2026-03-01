// Filename: growth.js

function renderGrowth() {
  if (!currentUser) return;
  const u = currentUser;
  const xp = u.xp || 0;
  const acc =
    u.totalAnswered > 0
      ? Math.round((u.totalCorrect / u.totalAnswered) * 100)
      : 0;
  const sessionMins = Math.round((Date.now() - sessionStart) / 60000);
  const eng = calcEngagement(u);
  const retention = Math.min(99, Math.round(eng * 0.9 + acc * 0.1));
  document.getElementById("g-xp").textContent = xp;
  document.getElementById("g-xp-trend").textContent =
    `↑ +${u.xpHistory?.slice(-1)?.[0] || xp} this session`;
  document.getElementById("g-acc").textContent = acc + "%";
  document.getElementById("g-acc-trend").textContent =
    acc >= 70 ? "↑ Above average" : "Keep improving!";
  document.getElementById("g-acc-trend").className =
    "gm-trend " + (acc >= 70 ? "trend-up" : "trend-dn");
  document.getElementById("g-time").textContent = (sessionMins || 1) + "m";
  document.getElementById("g-quizzes").textContent = u.quizzesDone || 0;
  document.getElementById("g-quiz-trend").textContent =
    (u.quizzesDone || 0) >= 3 ? "↑ Great consistency!" : "Keep going!";
  const hist = u.xpHistory?.length ? u.xpHistory : [0, 0, 0, 0, 0, 0, xp];
  const padded = [
    ...new Array(Math.max(0, 7 - hist.length)).fill(0),
    ...hist.slice(-7),
  ];
  const maxVal = Math.max(...padded, 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  document.getElementById("xpGraph").innerHTML = padded
    .map(
      (v, i) =>
        `<div class="xp-bar-item">
      <div class="xp-bar" style="height:${Math.max(4, Math.round((v / maxVal) * 90))}px"></div>
      <div class="xp-bar-lbl">${days[i]}</div>
    </div>`,
    )
    .join("");
  const mh = u.moodHistory || [];
  const now = new Date();
  document.getElementById("moodTimeline").innerHTML =
    mh.length === 0
      ? '<span class="text-muted text-sm">No mood data yet</span>'
      : mh
          .slice(-7)
          .map((m, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (mh.slice(-7).length - 1 - i));
            return `<div class="mt-item"><div class="me">${m.emoji}</div><div class="ml">${d.toLocaleDateString("en", { weekday: "short" })}</div></div>`;
          })
          .join("");
  const circumference = 239;
  document.getElementById("retentionRing").style.strokeDashoffset =
    circumference - (retention / 100) * circumference;
  document.getElementById("retentionVal").textContent = retention + "%";
  document.getElementById("accBreakdown").innerHTML = [
    { label: "Quiz Accuracy", val: acc, color: "var(--indigo)" },
    { label: "Engagement", val: eng, color: "var(--teal)" },
    {
      label: "Badges Earned",
      val: Math.round(
        (Object.values(u.badges).filter(Boolean).length / 5) * 100,
      ),
      color: "var(--amber)",
    },
  ]
    .map(
      (r) =>
        `<div style="margin-bottom:12px">
      <div class="flex-between mb-4"><span class="text-sm">${r.label}</span><span class="text-sm fw-700">${r.val}%</span></div>
      <div class="progress-track" style="height:7px"><div class="progress-fill" style="width:${r.val}%;background:${r.color};height:100%;border-radius:999px;transition:width .6s"></div></div>
    </div>`,
    )
    .join("");
  const range = getLevelRange(xp);
  const lvPct = Math.min(
    100,
    Math.round(((xp - range.min) / (range.max - range.min)) * 100),
  );
  document.getElementById("levelBreakdown").innerHTML =
    `<div class="flex-between mb-4"><span class="fw-700 text-sm">${getLevel(xp)}</span><span class="text-sm text-muted">${xp}/${range.max} XP</span></div>
    <div class="progress-track progress-teal" style="height:10px"><div class="progress-fill" style="width:${lvPct}%"></div></div>`;
  document.getElementById("nextLevelNote").textContent =
    `${range.max - xp} XP to ${range.next}`;
  refreshXPChips();
}
