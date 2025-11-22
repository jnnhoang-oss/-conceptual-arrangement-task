const arenaContainer = document.getElementById("arenaContainer");
const arena = document.getElementById("arena");
const instructions = document.getElementById("instructions");
const fullscreen = document.getElementById("fullscreen");
const pracInstructions = document.getElementById("pracInstructions");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const totalTimeDisplay = document.getElementById("totalTime");
const warningMessage = document.getElementById("warningMessage");

let participantID = prompt("Enter Participant ID:") || "P1";
let startTime, timerInterval;
let attentionAnswer = "", deviceAnswer = "";
let fullscreenAnswer = "";
let sleepAnswers = {};
let positions = {};
let totalSeconds = 0;
let arenaVisible = false;
let isPrac = false;

// image folder
const imageFolder = ".github/wth/";
const imageFiles = [
  "aardvark.jpg","anteater.jpg","brown_bear.jpg","camel.jpg","canary.jpg",
  "carp.jpg","caterpillarhawkmoth.jpg","catfish.jpg","chipmunk.jpg","cranebug.jpg",
  "cricket.jpg","elephantafrican.jpg","finch.jpg","firebug.jpg","flea.jpg",
  "gerbil.jpg","giraffe.jpg","goldfish.jpg","halibut.jpg","herculesbeetle.jpg",
  "herring.jpg","horse.jpg","hyena.jpg","leopard.jpg","llama.jpg","marmot.jpg",
  "mouse.jpg","ostrich.jpg","palmcockatoo.jpg","partridge.jpg","pelican.jpg",
  "perch.jpg","pigeon.jpg","pike.jpg","porcupine.jpg","prayingmantis.jpg",
  "rabbit.jpg","reindeer.jpg","salmon.jpg","shark.jpg","sheep.jpg","shrimp.jpg",
  "skunk.jpg","snail.jpg","starfish.jpg","tiger.jpg","turkey.jpg","waterbuffalo.jpg"
];

const pracImage = ["herring.jpg","horse.jpg","hyena.jpg"];


//----Practice image load----
function loadImages() {
  const imagesToLoad = isPrac ? pracImage : imageFiles;
  
  //clear pracImage
  const oldImages = document.querySelectorAll(".image");
  oldImages.forEach(img => img.remove());
  
  imagesToLoad.forEach(file => {
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
enableDragging();
}

// --- Dragging ---
let activeImg = null;
let grabOffsetX = 0;
let grabOffsetY = 0;

function enableDragging() {
  const imgs = document.querySelectorAll(".image");

  imgs.forEach(img => {
    img.style.position = "absolute";
    img.style.cursor = "grab";

    img.addEventListener("mousedown", e => {
      e.preventDefault();
      active = e.currentTarget;

      const rect = active.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      targetX = rect.left;
      targetY = rect.top;

      active.style.cursor = "grabbing";
      active.style.zIndex = "1000";
    });
  });

    // GPU accelerated movement
    activeImg.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
  });

  document.addEventListener("mouseup", () => {
    if (!activeImg) return;

    const rect = activeImg.getBoundingClientRect();
    const key = activeImg.src.split("/").pop();

    positions[key] = { x: rect.left, y: rect.top };

    // Lock transform to the final position
    activeImg.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    activeImg.style.transition = "";

    activeImg = null;
  });
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
  const createdAt = new Date().toLocaleString("en-US", {
  timeZone: "America/New_York"
  });
  let csv = `created_at,${createdAt}\n`;
  csv += "ParticipantID,Time,Fullscreen,Attention,Device,Image,X,Y";
  // Add GSQS columns (as strings: Yes/No)
  for (let i = 1; i <= 15; i++) csv += `,GSQS_Q${i}`;
  csv += ",GSQS_Total\n";

  // Calculate GSQS total (count "Yes" answers)
  let gsqsTotal = 0;
  for (let i = 1; i <= 15; i++) {
    if (sleepAnswers[i] === "Yes") gsqsTotal++;
  }

  // Add each image position
  for (let key in positions) {
    const p = positions[key];
    csv += `${participantID},${totalSeconds},${fullscreenAnswer},${attentionAnswer},${deviceAnswer},${key},${p.x},${p.y}`;
    
    // Add GSQS answers as strings (Yes/No)
    for (let i = 1; i <= 15; i++) {
      csv += `,${sleepAnswers[i] || ""}`;
    }
    
    // Add GSQS total score
    csv += `,${gsqsTotal}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `arrangement_${participantID}.csv`;
  a.click();
}

// --- Flow control ---
document.getElementById("beginBtn").addEventListener("click", showscreenQuestion);
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !arenaVisible) {
    if (instructions.style.display !== "none") {
      showscreenQuestion();
    }
  }
  else if (e.code === "Enter" && arenaVisible) endTask();
});

//show question before arrangement
function showscreenQuestion() {
  instructions.classList.remove("visible");
  instructions.style.display = "none";
  screenQuestion.classList.add("visible");
  screenQuestion.style.display = "flex";
}

//record screen question
function recordFullscreenAnswer(answer) {
  fullscreenAnswer = answer;
  screenQuestion.classList.remove("visible");
  screenQuestion.style.display = "none";
  pracInstructions.classList.add("visible");
  pracInstructions.style.display = "flex";
}

//start prac
function beginPractice() {
  pracInstructions.classList.remove("visible");
  pracInstructions.style.display = "none";
  isPrac = true;
  startTask();
}

//start actual
function startTask() {
  arenaContainer.classList.add("visible");
  arenaContainer.style.display = "block";
  loadImages();   
  startTimer();
  arenaVisible = true;
}

function endTask() {
  const imgs = document.querySelectorAll(".image");
  
  if (!isPrac) {
    imgs.forEach(img => {
      const rect = img.getBoundingClientRect();
      const key = img.src.split("/").pop();
      positions[key] = { x: rect.left, y: rect.top };
    });
  }

  if (allImagesInside()) {
    warningMessage.style.display = "none";
    arenaVisible = false;
    
    if (isPrac) {
      clearInterval(timerInterval);
      isPrac = false;
      
      alert("Practice complete! Press OK to begin the actual arrangement task.");
      startTask(); 
    } else {
      arenaContainer.classList.remove("visible");
      arenaContainer.style.display = "none";
      clearInterval(timerInterval);
      questions.classList.add("visible");
      questions.style.display = "flex";
    }
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
      saveCSV();
    }
  }
}
