// Filename: mood.js

function selectMood(mood) {
  document
    .querySelectorAll(".mood-opt")
    .forEach((o) => o.classList.remove("chosen"));
  document
    .querySelector(`.mood-opt[onclick="selectMood('${mood}')"]`)
    .classList.add("chosen");
  const emojiMap = {
    Happy: "😊",
    Motivated: "💪",
    Neutral: "😐",
    Stressed: "😟",
    Sad: "😔",
  };
  currentUser.todayMood = { mood, emoji: emojiMap[mood] };
  const responses = {
    Happy:
      "Awesome! Let's channel that positive energy into a great learning session! 🚀",
    Motivated:
      "Perfect mindset for crushing goals today! Let's get started. 💥",
    Neutral:
      "Alright, steady as she goes. We'll take it at a comfortable pace. ⚖️",
    Stressed:
      "I understand — we'll keep things light and supportive today. Breathe easy! 💙",
    Sad: "It's okay to have off days. We'll focus on gentle progress and self-care. 🌱",
  };
  const tips = {
    Stressed:
      "Pro Tip: Try the Breathing exercise in Focus Tools before starting your quiz.",
    Sad: "Pro Tip: Start with a quick Reflection in Focus Tools to process your feelings.",
  };
  const resBox = document.getElementById("moodResponse");
  resBox.textContent = responses[mood];
  resBox.style.display = "block";
  const tipBox = document.getElementById("moodTip");
  tipBox.textContent = tips[mood] || "";
  tipBox.style.display = tips[mood] ? "block" : "none";
}

function doMoodCheck() {
  if (!currentUser.todayMood) {
    toast("⚠️ Please select your mood first!");
    return;
  }
  currentUser.moodHistory = currentUser.moodHistory || [];
  currentUser.moodHistory.push(currentUser.todayMood);
  if (currentUser.moodHistory.length > 7) currentUser.moodHistory.shift();
  updateCurrentUser({ moodHistory: currentUser.moodHistory });
  navTo("screen-student");
}
