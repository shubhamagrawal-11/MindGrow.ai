function finishQuiz() {
  if (!quizState || !currentUser) return;

  clearInterval(timerInterval);

  var qs = quizState;
  var total = qs.questions.length;
  var acc = total > 0 ? Math.round((qs.correct / total) * 100) : 0;

  // Compute new totals
  var newXP = (currentUser.xp || 0) + qs.xpEarned;
  var newCorrect = (currentUser.totalCorrect || 0) + qs.correct;
  var newAnswered = (currentUser.totalAnswered || 0) + total;
  var newQuizzes = (currentUser.quizzesDone || 0) + 1;

  // XP history (rolling 7)
  var hist = (currentUser.xpHistory || []).slice();
  hist.push(newXP);
  if (hist.length > 7) hist.shift();

  // Last result snapshot (used by Astra)
  var lastResult = {
    correct: qs.correct,
    total: total,
    xpEarned: qs.xpEarned,
    difficulty: qs.difficulty,
    accuracy: acc,
  };

  // Persist BEFORE badge unlocks (unlockBadge reads currentUser)
  updateCurrentUser({
    xp: newXP,
    totalCorrect: newCorrect,
    totalAnswered: newAnswered,
    quizzesDone: newQuizzes,
    xpHistory: hist,
    lastQuizResult: lastResult,
  });

  // Badge unlocks
  qs.newBadges.push("focusChampion"); // always for completing a quiz
  if (acc === 100) qs.newBadges.push("perfectRun");

  var badgesUnlocked = [];
  var seen = {};
  qs.newBadges.forEach(function (key) {
    if (!seen[key]) {
      seen[key] = true;
      if (unlockBadge(key)) {
        var def = BADGE_DEFS.find(function (b) {
          return b.key === key;
        });
        if (def) badgesUnlocked.push(def);
      }
    }
  });

  showResults({
    correct: qs.correct,
    total: total,
    xpEarned: qs.xpEarned,
    difficulty: qs.difficulty,
    badgesUnlocked: badgesUnlocked,
  });
}
