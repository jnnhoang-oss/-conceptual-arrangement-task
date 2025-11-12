const arenaContainer = document.getElementById("arenaContainer");
const arena = document.getElementById("arena");
const instructions = document.getElementById("instructions");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const totalTimeDisplay = document.getElementById("totalTime");
const warningMessage = document.getElementById("warningMessage");

let participantID = prompt("Enter Participant ID:") || "P1";
let startTime, timerInterval;
let attentionAnswer = "", deviceAnswer = "";
let sleepAnswers = {};
let positions = {};
let totalSeconds = 0;
let arenaVisible = false;

// Your image folder
const imageFolder = ".github/wth/";
const imageFiles = [
  "aardvark.jpg
];

// --- Load and display images ---
function loadImages() {
  imageFiles.forEach(file => {
    const img = document.createElement("img");
    img.src = imageFolder + file;
    img.alt = file;
    img.classList.add("image");

    const x = Math.random() * (window.innerWidth * 0.4 - 60);
    const y = Math.random() * (window.innerHeight - 80);
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    arenaContainer.appendChild(img);
  });
}

// --- Dragging ---
let active = null, offsetX = 0, offsetY = 0;

function enableDragging() {
  const imgs = document.querySelectorAll(".image");

  imgs.forEach(img => {
    img.addEventListener("mousedown", e => {
      active = e.target;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    });
  });

  document.addEventListener("mousemove", e => {
    if (!active) return;
    const x = e.pageX - offsetX;
    const y = e.pageY - offsetY;
    active.style.left = `${x}px`;
    active.style.top = `${y}px`;
  });

  document.addEventListener("mouseup", () => {
    if (active) {
      const rect = active.getBoundingClientRect();
      const key = active.src.split("/").pop();
      positions[key] = { x: rect.left, y: rect.top };
      active = null;
    }
  });
}

// --- Timer ---
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    totalSeconds = Math.floor((new Date() - startTime) / 1000);
    totalTimeDisplay.textContent = totalSeconds;
  }, 1000);
}

// --- Check inside arena ---
function isInsideArena(img) {
  const arenaRect = arena.getBoundingClientRect();
  const centerX = arenaRect.left + arenaRect.width / 2;
  const centerY = arenaRect.top + arenaRect.height / 2;
  const radius = arenaRect.width / 2;

  const imgRect = img.getBoundingClientRect();
  const imgCenterX = imgRect.left + imgRect.width / 2;
  const imgCenterY = imgRect.top + imgRect.height / 2;

  const dx = imgCenterX - centerX;
  const dy = imgCenterY - centerY;
  return Math.sqrt(dx * dx + dy * dy) + imgRect.width / 2 < radius;
}

function allImagesInside() {
  return Array.from(document.querySelectorAll(".image")).every(isInsideArena);
}

// --- Save CSV ---
function saveCSV() {
  let csv = "ParticipantID,Time,Attention,Device,Image,X,Y";

  // Add GSQS columns
  for (let i = 1; i <= 15; i++) csv += `,GSQS_Q${i}`;
  csv += "\n";

  // Add each image position
  for (let key in positions) {
    const p = positions[key];
    csv += `${participantID},${totalSeconds},${attentionAnswer},${deviceAnswer},${key},${p.x},${p.y}`;
    for (let i = 1; i <= 15; i++) csv += `,${sleepAnswers[i] || ""}`;
    csv += "\n";
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `arrangement_${participantID}.csv`;
  a.click();
}

// --- Flow control ---
document.getElementById("beginBtn").addEventListener("click", startTask);
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !arenaVisible) startTask();
  else if (e.code === "Enter" && arenaVisible) endTask();
});

function startTask() {
  instructions.style.display = "none";
  arenaContainer.style.display = "block";
  loadImages();
  enableDragging();
  startTimer();
  arenaVisible = true;
}

function endTask() {
  const imgs = document.querySelectorAll(".image");
  imgs.forEach(img => {
    const rect = img.getBoundingClientRect();
    const key = img.src.split("/").pop();
    positions[key] = { x: rect.left, y: rect.top };
  });

  if (allImagesInside()) {
    warningMessage.style.display = "none";
    arenaContainer.style.display = "none";
    clearInterval(timerInterval);
    questions.style.display = "flex";
  } else {
    warningMessage.style.display = "block";
  }
}

// --- Question logic ---
function recordAnswer(type, answer) {
  if (type === "attention") {
    attentionAnswer = answer;
    document.getElementById("q1").style.display = "none";
    document.getElementById("q2").style.display = "block";
  } else if (type === "device") {
    deviceAnswer = answer;
    document.getElementById("q2").style.display = "none";
    showSleepQuestionnaire();
  }
}

// --- Groningen Sleep Questionnaire ---
const gsqsQuestions = [
  "I had a deep sleep last night",
  "I feel that I slept poorly last night",
  "It took me more than half an hour to fall asleep last night",
  "I woke up several times last night",
  "I felt tired after waking up this morning",
  "I feel that I didn't get enough sleep last night",
  "I got up in the middle of the night",
  "I felt rested after waking up this morning",
  "I feel that I only had a couple of hours' sleep last night",
  "I feel that I slept well last night",
  "I didn't sleep a wink last night",
  "I didn't have trouble falling asleep last night",
  "After I woke up last night, I had trouble falling asleep again",
  "I tossed and turned all night last night",
  "I didn't get more than 5 hours' sleep last night"
];

function showSleepQuestionnaire() {
  questions.innerHTML = "";
  let index = 0;

  const qDiv = document.createElement("div");
  qDiv.className = "question";

  const qText = document.createElement("h2");
  qText.textContent = gsqsQuestions[index];
  qDiv.appendChild(qText);

  const yesBtn = document.createElement("button");
  const noBtn = document.createElement("button");
  yesBtn.textContent = "Yes";
  noBtn.textContent = "No";

  yesBtn.onclick = () => nextGSQS("Yes");
  noBtn.onclick = () => nextGSQS("No");

  qDiv.appendChild(yesBtn);
  qDiv.appendChild(noBtn);
  questions.appendChild(qDiv);
  questions.style.display = "flex";

  function nextGSQS(answer) {
    sleepAnswers[index + 1] = answer;
    index++;
    if (index < gsqsQuestions.length) {
      qText.textContent = gsqsQuestions[index];
    } else {
      questions.style.display = "none";
      endScreen.style.display = "flex";
      saveCSV(); // ✅ Save everything together
    }
  }
}
