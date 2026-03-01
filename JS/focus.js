// Filename: focus.js

function switchFocusTab(tab) {
  document
    .querySelectorAll(".focus-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelector(`.focus-tab[onclick="switchFocusTab('${tab}')"]`)
    .classList.add("active");
  document
    .querySelectorAll(".focus-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(`fp-${tab}`).classList.add("active");
}

const breathPhases = [
  { text: "Breathe In", inner: "In", class: "inhale", dur: 4 },
  { text: "Hold", inner: "Hold", class: "", dur: 4 },
  { text: "Breathe Out", inner: "Out", class: "exhale", dur: 4 },
  { text: "Hold", inner: "Hold", class: "", dur: 4 },
];

let breathInterval = null;
let breathRunning = false;
let breathSeconds = 60;

function toggleBreathing() {
  breathRunning = !breathRunning;
  const btn = document.getElementById("breathBtn");
  btn.textContent = breathRunning ? "■ Stop" : "▶ Start Breathing";
  if (breathRunning) {
    breathSeconds = 60;
    let phaseIdx = 0;
    let phaseTime = breathPhases[0].dur;
    const inner = document.getElementById("breathInner");
    const status = document.getElementById("breathStatus");
    const count = document.getElementById("breathCount");
    inner.className = "breath-inner " + breathPhases[0].class;
    inner.textContent = breathPhases[0].inner;
    status.textContent = breathPhases[0].text;
    count.textContent = breathSeconds;
    breathInterval = setInterval(() => {
      breathSeconds--;
      phaseTime--;
      count.textContent = breathSeconds;
      if (breathSeconds <= 0) {
        toggleBreathing();
        toast("✅ Breathing session complete! +10 XP");
        updateCurrentUser({ xp: (currentUser.xp || 0) + 10 });
        refreshXPChips();
        return;
      }
      if (phaseTime <= 0) {
        phaseIdx = (phaseIdx + 1) % breathPhases.length;
        const phase = breathPhases[phaseIdx];
        phaseTime = phase.dur;
        inner.className = "breath-inner " + phase.class;
        inner.textContent = phase.inner;
        status.textContent = phase.text;
      }
    }, 1000);
  } else {
    clearInterval(breathInterval);
    document.getElementById("breathInner").className = "breath-inner";
    document.getElementById("breathStatus").textContent = "Ready";
    document.getElementById("breathCount").textContent = "60";
  }
}

let focusTimerInterval = null;
let focusSeconds = 300;

function toggleFocusTimer() {
  const btn = document.getElementById("focusTimerBtn");
  if (focusTimerInterval) {
    clearInterval(focusTimerInterval);
    focusTimerInterval = null;
    btn.textContent = "▶ Start";
  } else {
    focusTimerInterval = setInterval(() => {
      focusSeconds--;
      updateFocusTimerUI();
      if (focusSeconds <= 0) {
        clearInterval(focusTimerInterval);
        focusTimerInterval = null;
        btn.textContent = "▶ Start";
        toast("✅ Timer complete! +15 XP");
        updateCurrentUser({ xp: (currentUser.xp || 0) + 15 });
        refreshXPChips();
      }
    }, 1000);
    btn.textContent = "■ Pause";
  }
  updateFocusTimerUI();
}

function updateFocusTimerUI() {
  const min = String(Math.floor(focusSeconds / 60)).padStart(2, "0");
  const sec = String(focusSeconds % 60).padStart(2, "0");
  document.getElementById("focusTimerDisplay").textContent = `${min}:${sec}`;
  document.getElementById("focusTimerBar").style.width =
    (focusSeconds / 300) * 100 + "%";
}

function resetFocusTimer() {
  if (focusTimerInterval) toggleFocusTimer();
  focusSeconds = 300;
  updateFocusTimerUI();
}

const PROMPTS = [
  "What was your biggest learning win today?",
  "How did you handle a challenge during study?",
  "What one thing will you do differently tomorrow?",
  "Describe a moment when you felt focused.",
  "What are you grateful for in your learning journey?",
  "How did your mood affect your productivity?",
  "What skill do you want to improve next?",
];

function newPrompt() {
  const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  document.getElementById("reflectionPrompt").textContent = p;
}

function saveReflection() {
  const text = document.getElementById("reflectionText").value.trim();
  if (!text) {
    toast("⚠️ Write something first!");
    return;
  }
  currentUser.reflections = currentUser.reflections || [];
  currentUser.reflections.push({
    date: new Date().toISOString(),
    prompt: document.getElementById("reflectionPrompt").textContent,
    text,
  });
  updateCurrentUser({ reflections: currentUser.reflections });
  document.getElementById("reflectionText").value = "";
  newPrompt();
  toast("✅ Reflection saved! +5 XP");
  updateCurrentUser({ xp: (currentUser.xp || 0) + 5 });
  refreshXPChips();
  document.getElementById("reflectionSaved").style.display = "block";
  setTimeout(
    () => (document.getElementById("reflectionSaved").style.display = "none"),
    3000,
  );
}
