// Filename: astra.js

let astraOpen = false;
let astraChatHistory = [];
let astraInitialized = false;

function astraToggle() {
  astraOpen = !astraOpen;
  document.getElementById("astra-panel").classList.toggle("open", astraOpen);
  if (astraOpen) {
    const notif = document.getElementById("astra-notif");
    if (notif) notif.classList.add("hidden");
    if (!astraInitialized) {
      astraInit();
    }
    setTimeout(() => document.getElementById("astra-input").focus(), 300);
  }
}

function astraInit() {
  if (astraInitialized || !currentUser) return;
  astraInitialized = true;
  const u = currentUser;
  const level = getLevel(u.xp || 0);
  const mood = u.todayMood?.mood || "Neutral";
  let greeting = `Hi ${u.name.split(" ")[0]}! 👋 I'm **Astra**, your smart learning companion.\n\nI can see you're a **${level}** with **${u.xp || 0} XP** and a **${u.streak || 1}-day streak**. `;
  if (mood === "Stressed")
    greeting += `I noticed you're feeling stressed today — I'm here to help. Let's take it easy! 💙`;
  else if (mood === "Happy")
    greeting += `You're feeling great today — let's channel that energy into a productive session! 🚀`;
  else if (u.quizzesDone > 0)
    greeting += `You've completed **${u.quizzesDone} quiz${u.quizzesDone > 1 ? "zes" : ""}** so far. Ready to keep going?`;
  else
    greeting += `Use the quick buttons below or ask me anything about your learning!`;
  astraBotMsg(greeting);
}

function astraBotMsg(text) {
  astraChatHistory.push({ from: "bot", text });
  astraRender();
}

function astraUserMsg(text) {
  astraChatHistory.push({ from: "user", text });
  astraRender();
}

function astraRender() {
  const container = document.getElementById("astra-msgs");
  container.innerHTML = astraChatHistory
    .map((m) => {
      if (m.typing)
        return `<div class="astra-typing-ind" id="astra-typing"><span></span><span></span><span></span></div>`;
      const formatted = m.text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
      if (m.from === "bot")
        return `<div class="amsg amsg-bot"><div class="amsg-sender">🤖 Astra</div>${formatted}</div>`;
      return `<div class="amsg amsg-user">${formatted}</div>`;
    })
    .join("");
  container.scrollTop = container.scrollHeight;
}

function astraShowTyping() {
  astraChatHistory.push({ typing: true });
  astraRender();
}

function astraHideTyping() {
  astraChatHistory = astraChatHistory.filter((m) => !m.typing);
  astraRender();
}

function astraSend() {
  const input = document.getElementById("astra-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  astraUserMsg(text);
  astraShowTyping();
  const delay = 700 + Math.random() * 600;
  setTimeout(() => {
    astraHideTyping();
    astraBotMsg(astraGenerateReply(text.toLowerCase()));
  }, delay);
}

function astraAction(action) {
  const labels = {
    explain: "📖 Explain Last Question",
    improve: "🎯 How can I improve my score?",
    strategy: "🧠 Give me a study strategy",
    stuck: "😰 I feel stuck right now",
    challenge: "🚀 Give me a challenge",
    progress: "📊 Show my progress insight",
  };
  astraUserMsg(labels[action]);
  astraShowTyping();
  const delay = 800 + Math.random() * 700;
  setTimeout(() => {
    astraHideTyping();
    astraBotMsg(astraHandleAction(action));
  }, delay);
}

function astraHandleAction(action) {
  const u = currentUser;
  if (!u) return "Please log in to see your personalised insights!";
  const xp = u.xp || 0;
  const acc =
    u.totalAnswered > 0
      ? Math.round((u.totalCorrect / u.totalAnswered) * 100)
      : 0;
  const level = getLevel(xp);
  const mood = u.todayMood?.mood || "Neutral";
  const streak = u.streak || 1;
  const quizzes = u.quizzesDone || 0;
  const lastResult = u.lastQuizResult;

  switch (action) {
    case "explain":
      if (!lastResult)
        return "You haven't completed a quiz yet! Head to the **Quiz** section and I'll be ready to explain any question after you finish. 🎯";
      const emoji =
        lastResult.accuracy >= 80
          ? "🏆"
          : lastResult.accuracy >= 50
            ? "👏"
            : "💪";
      return `${emoji} **Last Quiz Summary:**\n\nYou scored **${lastResult.correct}/${lastResult.total}** on **${lastResult.difficulty}** difficulty, earning **+${lastResult.xpEarned} XP**.\n\nAccuracy: **${lastResult.accuracy}%**\n\n${lastResult.accuracy < 60 ? "For questions you missed, always re-read the feedback explanation — that's where the real learning happens! 📚" : "Great performance! Review the explanations even for correct answers to deepen your understanding."}`;
    case "improve":
      if (acc === 0)
        return "Take your first quiz and I'll give you a personalised improvement plan! 🎯";
      if (acc < 40)
        return `Your accuracy is **${acc}%** — here's your improvement plan:\n\n1️⃣ Start with **Easy** mode only\n2️⃣ Never skip the explanation after a wrong answer\n3️⃣ Do 1 quiz daily — consistency beats cramming\n4️⃣ Try the breathing exercise before each quiz\n5️⃣ Focus on one subject per session\n\nYou'll improve faster than you think! 💪`;
      if (acc < 70)
        return `You're at **${acc}%** — solid foundation! To reach 75%+:\n\n1️⃣ Move to **Medium** difficulty quizzes\n2️⃣ Pay extra attention to your weakest subjects\n3️⃣ Track patterns in the questions you miss\n4️⃣ Use the Reflection tool to consolidate learning\n\nYou're on the right track! 📈`;
      return `Impressive **${acc}%** accuracy! To push past 85%:\n\n1️⃣ Take on **Hard** difficulty questions\n2️⃣ Challenge yourself on speed — answer under 10 seconds\n3️⃣ Focus on the EI scenario — it's a free badge opportunity!\n4️⃣ Aim for a Perfect Run badge 💎\n\nThe Master level is within reach!`;
    case "strategy":
      const diff = determineDifficulty();
      return `**🗓️ Your Personalised 5-Day Study Plan:**\n\n**Day 1 — Foundation:** 1 ${diff} quiz + review all explanations (20 min)\n**Day 2 — Practice:** 2 quizzes + use Focus Timer during study (30 min)\n**Day 3 — Rest & Reflect:** Breathing exercise + Reflection journal only\n**Day 4 — Push:** 1 hard quiz + try to beat your best score\n**Day 5 — Review:** Mixed difficulty + revisit any weak subjects\n\n${mood === "Stressed" ? "💙 Given your stress today, start with Day 3 instead." : "🚀 Start with Day 1 tomorrow morning for best results!"}\n\nConsistency > Intensity every time!`;
    case "stuck":
      const stuckMsgs = [
        `Feeling stuck is completely **normal** — it means you're at the edge of your learning zone!\n\n**Try this right now:**\n1️⃣ Do the **60-second breathing** exercise\n2️⃣ Take a 5-minute break, then return\n3️⃣ Switch to **Easy** mode to rebuild confidence\n4️⃣ Write one sentence in Reflection about what's confusing you\n\nYou've already earned **${xp} XP** — that proves you can do this! 💙`,
        `I hear you. Let's reset! 🌱\n\nYou have **${streak} day streak** — don't let that go to waste. Sometimes the best thing is to take a smaller step:\n\n→ Just answer **1 question** in Easy mode\n→ That's it. One question.\n\nMomentum builds from tiny wins. You've got this! 💪`,
      ];
      return stuckMsgs[Math.floor(Math.random() * stuckMsgs.length)];
    case "challenge":
      const overallAcc =
        u.totalAnswered > 0 ? u.totalCorrect / u.totalAnswered : 0;
      if (overallAcc < 0.5 && u.totalAnswered > 0)
        return `You're building toward a challenge — you need **50%+ accuracy** first (you're at ${acc}%). Keep taking quizzes and I'll unlock your challenge when you're ready! 💪\n\nFor now: focus on **Medium** mode and read every explanation carefully.`;
      if (xp >= 200)
        return `🚀 **Challenge Mode Unlocked!**\n\nYou have **${xp} XP** — you're ready for this:\n\n⚡ Take a **Hard** difficulty quiz\n🎯 Try to answer every question in under 8 seconds\n💎 Aim for **100% accuracy** to unlock the Perfect Run badge\n🔥 Do it before your streak resets!\n\nAre you up for it?`;
      return `Almost challenge-ready! You need **200+ XP** to unlock challenge mode (you have ${xp} XP).\n\nTake **${Math.ceil((200 - xp) / 20)} more correct answers** and I'll have a special challenge waiting! 🎯`;
    case "progress":
      const badgeCount = Object.values(u.badges).filter(Boolean).length;
      const stressCount = (u.moodHistory || []).filter(
        (m) => m.mood === "Stressed" || m.mood === "Sad",
      ).length;
      const sessionMins = Math.round((Date.now() - sessionStart) / 60000);
      const eng = calcEngagement(u);
      let insight = `📊 **Your Progress Insight Report:**\n\n`;
      insight += `• **Level:** ${level} (${xp} XP)\n`;
      insight += `• **Accuracy:** ${acc}% ${acc >= 70 ? "✅ Above average" : "📈 Room to grow"}\n`;
      insight += `• **Streak:** 🔥 ${streak} day${streak !== 1 ? "s" : ""}\n`;
      insight += `• **Quizzes Done:** ${quizzes}\n`;
      insight += `• **Badges Earned:** ${badgeCount}/5\n`;
      insight += `• **Engagement Score:** ${eng}%\n`;
      insight += `• **Session Time:** ${sessionMins}m today\n\n`;
      if (stressCount >= 2)
        insight += `⚠️ You've logged stress or sadness **${stressCount} times** recently. Consider using Focus Tools before your next quiz.\n\n`;
      if (acc >= 70 && streak >= 3)
        insight += `🌟 **Key Insight:** You're performing consistently above average. Ready to attempt Master-level content!`;
      else if (quizzes === 0)
        insight += `🎯 **Key Insight:** Complete your first quiz to unlock personalised performance data!`;
      else
        insight += `📈 **Key Insight:** Your consistency is your strongest asset. Keep the ${streak}-day streak going!`;
      return insight;
  }
}

function astraGenerateReply(text) {
  const u = currentUser;
  if (!u) return "Please log in first!";
  const acc =
    u.totalAnswered > 0
      ? Math.round((u.totalCorrect / u.totalAnswered) * 100)
      : 0;
  const xp = u.xp || 0;
  const level = getLevel(xp);
  const mood = u.todayMood?.mood || "Neutral";

  if (text.match(/stress|anxious|nervous|overwhelm|worried/)) {
    return `I hear you. Stress is a normal part of learning. 💙\n\nPlease try the **Breathing Exercise** in Focus Tools — it only takes 60 seconds and genuinely helps reset your focus.\n\n⚠️ For ongoing stress or anxiety, please speak with a trusted adult, teacher, or counsellor. I'm here for learning support only.`;
  }
  if (text.match(/sad|depress|unhappy|low|down/)) {
    return `It's okay to have tough days. 💙 Take it easy — I've set lighter questions for you.\n\nSometimes just doing one small thing (one question, one reflection) can shift your mood.\n\n⚠️ If you're persistently feeling low, please reach out to a trusted adult or school counsellor.`;
  }
  if (text.match(/math|maths|algebra|calculus|geometry|arithmetic/)) {
    return `Mathematics is all about **patterns and practice**! 🔢\n\nFor your level, I suggest:\n1️⃣ Practice core operations daily (5 min)\n2️⃣ Draw diagrams for geometry problems\n3️⃣ Write out each step — don't skip mental shortcuts\n4️⃣ Relate formulas to real-world examples\n\nYour current accuracy is **${acc}%**. Take the Medium quiz to target math questions specifically!`;
  }
  if (text.match(/science|biology|chemistry|physics/)) {
    return `Science is fascinating! 🔬\n\n**Study Strategy:**\n• Biology → Use mnemonics and diagrams\n• Chemistry → Understand *why* reactions happen\n• Physics → Always connect formulas to real examples\n\nYour MindGrow.AI quizzes include all three. Check your **Growth** page to see which subject you score best in!`;
  }
  if (text.match(/english|grammar|literature|reading|writing|language/)) {
    return `English skills compound beautifully! 📚\n\nKey strategies:\n• **Grammar:** Read the sentence aloud — if it sounds wrong, it probably is\n• **Vocabulary:** Learn 3 new words per day in context\n• **Literature:** Focus on themes and character motivations\n\nYour quiz includes English comprehension questions. Try Medium difficulty for grammar challenges!`;
  }
  if (text.match(/xp|points|level|badge|achievement/)) {
    const badgeCount = Object.values(u.badges).filter(Boolean).length;
    return `You currently have **${xp} XP** as a **${level}**! 🏆\n\nYou've earned **${badgeCount}/5 badges**. Here's how to earn the rest:\n• 🎯 Focus Champion — Complete a quiz\n• 🤝 Empathy Star — Nail the EI question\n• 🔥 Consistency Hero — Login 3+ times\n• ⚡ Speedster — Answer in under 5 seconds\n• 💎 Perfect Run — Score 100% accuracy`;
  }
  if (text.match(/quiz|test|exam|question/)) {
    const diff = determineDifficulty();
    return `Based on your **${acc}% accuracy** and **${mood.toLowerCase()}** mood, your next quiz will be on **${diff}** difficulty.\n\nEach correct answer gives you **+20 XP** plus a **+5 XP speed bonus** if you answer in under 5 seconds! ⚡\n\nReady? Head to the **Quiz** tab!`;
  }
  if (text.match(/focus|concentrate|attention|distract/)) {
    return `Focus is a skill you can train! 🧠\n\nTry this sequence:\n1️⃣ **Breathing exercise** (60 sec) to reset\n2️⃣ **Focus Timer** (5 min) of pure, distraction-free work\n3️⃣ One quiz attempt\n4️⃣ **Reflection** to consolidate\n\nThis cycle takes under 15 minutes and is highly effective. Go to Focus Tools to start!`;
  }
  if (text.match(/help|what can you do|capabilities|features/)) {
    return `I'm **Astra**, your MindGrow.AI learning companion! Here's what I can help with:\n\n📖 Explain your quiz performance\n🎯 Build a score improvement plan\n🧠 Create a personalised study strategy\n😰 Support you when you're stuck\n🚀 Unlock challenge mode when you're ready\n📊 Analyse your full progress\n\nI read your **actual dashboard data** to give you personalised advice. Use the quick buttons below or just ask me anything! 🤖`;
  }
  if (text.match(/hello|hi|hey|sup|good/)) {
    return `Hi there, ${u.name.split(" ")[0]}! 😊 Great to chat. You have **${xp} XP** and a **${u.streak || 1}-day streak**.\n\nWhat would you like to work on today? Use the quick buttons below or ask me anything!`;
  }
  if (text.match(/thank|thanks|appreciate/)) {
    return `You're very welcome, ${u.name.split(" ")[0]}! 🙏 That's what I'm here for. Keep learning — every step counts. 💪\n\nIs there anything else I can help you with?`;
  }
  const defaults = [
    `Based on your profile — **${level}**, ${acc}% accuracy, ${u.streak || 1}-day streak — my recommendation is to focus on consistent daily quizzes and review each explanation carefully. Quality beats quantity! 📚`,
    `Great question! Here's a tailored tip: ${acc < 50 ? "Start with Easy mode and build confidence" : "Challenge yourself with Medium or Hard difficulty"}. Your **${xp} XP** shows you have real dedication — keep it up! 🌱`,
    `I'm always here to help you grow, ${u.name.split(" ")[0]}! Try one of the quick action buttons below for specific guidance, or check your **Growth** page for detailed analytics. 📊`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}
