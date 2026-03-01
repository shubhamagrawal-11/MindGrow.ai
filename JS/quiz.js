var QUESTIONS = {
  easy: [
    {
      section: "Mathematics",
      q: "What is 6 × 7?",
      opts: ["40", "42", "45", "48"],
      ans: 1,
      exp: "6 × 7 = 42. Multiplication table.",
    },
    {
      section: "Science",
      q: "What is the closest planet to the Sun?",
      opts: ["Venus", "Mars", "Mercury", "Earth"],
      ans: 2,
      exp: "Mercury is closest to the Sun.",
    },
    {
      section: "English",
      q: 'Which word means the opposite of "ancient"?',
      opts: ["Old", "Modern", "Large", "Dark"],
      ans: 1,
      exp: "Modern is the antonym of ancient.",
    },
    {
      section: "Mathematics",
      q: "What is 50% of 80?",
      opts: ["20", "30", "40", "50"],
      ans: 2,
      exp: "50% of 80 = 80 ÷ 2 = 40.",
    },
    {
      section: "Science",
      q: "How many legs does a spider have?",
      opts: ["6", "8", "10", "12"],
      ans: 1,
      exp: "Spiders are arachnids and have 8 legs.",
    },
  ],
  medium: [
    {
      section: "Mathematics",
      q: "What is the square root of 196?",
      opts: ["12", "13", "14", "15"],
      ans: 2,
      exp: "√196 = 14, since 14 × 14 = 196.",
    },
    {
      section: "Science",
      q: "What gas do plants use in photosynthesis?",
      opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      ans: 2,
      exp: "Plants absorb CO₂ during photosynthesis.",
    },
    {
      section: "English",
      q: "Identify the correct sentence.",
      opts: [
        "She don't know.",
        "She doesn't knows.",
        "She doesn't know.",
        "She not know.",
      ],
      ans: 2,
      exp: 'Correct subject-verb agreement with "she doesn\'t know."',
    },
    {
      section: "Mathematics",
      q: "What is 15% of 240?",
      opts: ["30", "36", "40", "45"],
      ans: 1,
      exp: "15% of 240 = 0.15 × 240 = 36.",
    },
    {
      section: "Science",
      q: "What is the unit of electrical resistance?",
      opts: ["Volt", "Ampere", "Ohm", "Watt"],
      ans: 2,
      exp: "Resistance is measured in Ohms (Ω). Named after Georg Ohm.",
    },
  ],
  hard: [
    {
      section: "Mathematics",
      q: "If f(x) = 3x² − 2x + 1, what is f(3)?",
      opts: ["22", "24", "26", "28"],
      ans: 0,
      exp: "f(3) = 3(9) − 2(3) + 1 = 27 − 6 + 1 = 22.",
    },
    {
      section: "Science",
      q: 'Which organelle is called the "powerhouse of the cell"?',
      opts: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
      ans: 2,
      exp: 'Mitochondria produce ATP energy — hence "powerhouse".',
    },
    {
      section: "English",
      q: 'What literary device is used in "The wind whispered secrets"?',
      opts: ["Simile", "Personification", "Metaphor", "Alliteration"],
      ans: 1,
      exp: "Personification — giving human qualities (whispering) to the wind.",
    },
    {
      section: "Mathematics",
      q: "What is the sum of interior angles of a hexagon?",
      opts: ["540°", "600°", "720°", "840°"],
      ans: 2,
      exp: "Sum = (n−2)×180 = (6−2)×180 = 720°.",
    },
    {
      section: "Science",
      q: "What is Newton's 3rd Law?",
      opts: [
        "F=ma",
        "Energy is conserved",
        "Every action has equal and opposite reaction",
        "Objects in motion stay in motion",
      ],
      ans: 2,
      exp: "Newton's 3rd law: For every action, there is an equal and opposite reaction.",
    },
  ],
  ei: [
    {
      section: "Emotional Intelligence",
      q: "Your teammate made a serious mistake on your group project. What do you do?",
      opts: [
        "Blame them in front of everyone",
        "Ignore the mistake and move on",
        "Help them understand and improve",
        "Complain to the teacher immediately",
      ],
      ans: 2,
      exp: "Helping teammates learn builds trust and collaboration — the hallmark of emotional intelligence.",
    },
  ],
};

var quizState = {};
var timerInterval = null;

function determineDifficulty() {
  if (!currentUser) return "medium";
  var acc =
    currentUser.totalAnswered > 0
      ? currentUser.totalCorrect / currentUser.totalAnswered
      : 0.5;
  var mood = currentUser.todayMood ? currentUser.todayMood.mood : "Neutral";
  if (mood === "Stressed" || mood === "Sad") return "easy";
  if (mood === "Happy" && acc > 0.75) return "hard";
  if (acc < 0.4) return "easy";
  if (acc > 0.7) return "hard";
  return "medium";
}

function initQuiz() {
  var diff = determineDifficulty();
  var academic = QUESTIONS[diff].slice().sort(function() { return Math.random() - 0.5; }).slice(0, 5);
  quizState = {
    questions: academic.concat(QUESTIONS.ei),
    current: 0,
    correct: 0,
    xpEarned: 0,
    answered: false,
    difficulty: diff,
    newBadges: [],
    questionStart: null,
    timeLeft: 30,
    lastQuestion: null,
  };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  var qs = quizState;
  var q = qs.questions[qs.current];
  qs.answered = false;
  qs.questionStart = Date.now();
  qs.timeLeft = 30;
  qs.lastQuestion = q;
  document.getElementById("qNum").textContent = qs.current + 1;
  document.getElementById("qTotal").textContent = qs.questions.length;
  document.getElementById("diffBadge").textContent =
    qs.difficulty.charAt(0).toUpperCase() + qs.difficulty.slice(1);
  document.getElementById("diffBadge").className = "diff-badge diff-" + qs.difficulty;
  document.getElementById("qNextBtn").style.display = "none";
  document.getElementById("xpAnim").style.display = "none";
  var prog = document.getElementById("qProgress");
  var dots = "";
  for (var i = 0; i < qs.questions.length; i++) {
    var cls = i < qs.current ? "done" : i === qs.current ? "current" : "";
    dots += '<div class="q-dot ' + cls + '"></div>';
  }
  prog.innerHTML = dots;
  var letters = ["A", "B", "C", "D"];
  var optsHtml = "";
  for (var i = 0; i < q.opts.length; i++) {
    optsHtml += '<button class="opt-btn" onclick="answerQuiz(' + i + ')">';
    optsHtml += '<span class="opt-letter">' + letters[i] + '</span>' + q.opts[i];
    optsHtml += '</button>';
  }
  document.getElementById("qCard").innerHTML = '<div class="q-section-tag">' + q.section + '</div>' +
    '<div class="q-text">' + q.q + '</div>' +
    '<div class="options" id="optionsList">' + optsHtml + '</div>' +
    '<div class="feedback-bar" id="qFeedback"></div>';
  clearInterval(timerInterval);
  updateTimerUI(30, 30);
  timerInterval = setInterval(function() {
    qs.timeLeft--;
    updateTimerUI(qs.timeLeft, 30);
    if (qs.timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!qs.answered) autoSkip();
    }
  }, 1000);
}

function updateTimerUI(t, max) {
  var el = document.getElementById("timerCircle");
  var bar = document.getElementById("timerBar");
  if (el) {
    el.textContent = t;
    el.className = "timer-circle" + (t <= 8 ? " warning" : "");
  }
  if (bar) {
    bar.style.width = (t / max) * 100 + "%";
  }
}

function autoSkip() {
  if (quizState.answered) return;
  quizState.answered = true;
  quizState.current++;
  if (quizState.current >= quizState.questions.length) finishQuiz();
  else renderQuizQuestion();
}

function answerQuiz(idx) {
  if (quizState.answered) return;
  quizState.answered = true;
  clearInterval(timerInterval);
  var timeSpent = (Date.now() - quizState.questionStart) / 1000;
  var q = quizState.questions[quizState.current];
  var correct = idx === q.ans;
  var xp = 0;
  var opts = document.querySelectorAll(".opt-btn");
  opts.forEach(function(o) { o.disabled = true; });
  if (correct) {
    opts[idx].classList.add("correct");
    xp += 20;
    quizState.correct++;
    if (timeSpent < 5) {
      xp += 5;
      quizState.newBadges.push("speedster");
    }
    var anim = document.getElementById("xpAnim");
    anim.textContent = timeSpent < 5 ? "+25 XP ⚡ (Speed Bonus!)" : "+20 XP ⚡";
    anim.style.display = "block";
    setTimeout(function() { anim.style.display = "none"; }, 1500);
    var fb = document.getElementById("qFeedback");
    fb.className = "feedback-bar feedback-correct";
    fb.innerHTML = "✓ Correct! " + q.exp;
    fb.style.display = "block";
    if (q.section === "Emotional Intelligence")
      quizState.newBadges.push("empathyStar");
  } else {
    opts[idx].classList.add("wrong");
    opts[q.ans].classList.add("correct");
    var fb = document.getElementById("qFeedback");
    fb.className = "feedback-bar feedback-wrong";
    fb.innerHTML = "✗ Not quite. " + q.exp;
    fb.style.display = "block";
  }
  quizState.xpEarned += xp;
  var btn = document.getElementById("qNextBtn");
  btn.style.display = "block";
  btn.textContent = quizState.current < quizState.questions.length - 1
    ? "Next Question →"
    : "See Results 🏆";

}

function nextQuestion() {
  quizState.current++;
  if (quizState.current >= quizState.questions.length) {
    finishQuiz();
  } else {
    renderQuizQuestion();
  }
}
