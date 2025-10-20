let participantID = prompt("Enter your Participant ID:");
let startTime, endTime, arenaVisible = false;
let attentionAnswer = "", deviceAnswer = "";
let positions = {};
let imageTimes = {};
let timerInterval;

const instruction = document.getElementById("instruction");
const arenaContainer = document.getElementById("arenaContainer");
const confirmation = document.getElementById("confirmation");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const images = document.querySelectorAll(".image");
const arena = document.getElementById("arena");
const totalTimeDisplay = document.getElementById("totalTime");
const timeADisplay = document.getElementById("timeA");
const timeBDisplay = document.getElementById("timeB");
const timeCDisplay = document.getElementById("timeC");

images.forEach(img => {
  img.addEventListener("mousedown", startDrag);
  img.addEventListener("touchstart", startDragTouch, { passive: false });
});

let activeImage = null;

function startDrag(e) {
  activeImage = e.target;
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);
}

function startDragTouch(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    activeImage = e.target;
    document.addEventListener("touchmove", dragTouch, { passive: false });
    document.addEventListener("touchend", stopDragTouch);
    document.addEventListener("touchcancel", stopDragTouch);
  }
}

function isWithinArena(x, y) {
  const arenaRect = arena.getBoundingClientRect();
  const arenaCenterX = arenaRect.left + arenaRect.width / 2;
  const arenaCenterY = arenaRect.top + arenaRect.height / 2;
  const radius = arenaRect.width / 2 - 40; // Adjust for image size (80px / 2)
  const distance = Math.sqrt(
    Math.pow(x - arenaCenterX, 2) + Math.pow(y - arenaCenterY, 2)
  );
  return distance <= radius;
}

function drag(e) {
  if (!activeImage) return;
  let newX = e.pageX - 40; // Center of 80px image
  let newY = e.pageY - 40;
  if (isWithinArena(newX + 40, newY + 40)) {
    activeImage.style.left = newX + "px";
    activeImage.style.top = newY + "px";
  }
}

function dragTouch(e) {
  e.preventDefault();
  if (!activeImage || e.touches.length !== 1) return;
  const touch = e.touches[0];
  let newX = touch.pageX - 40;
  let newY = touch.pageY - 40;
  if (isWithinArena(newX + 40, newY + 40)) {
    activeImage.style.left = newX + "px";
    activeImage.style.top = newY + "px";
  }
}

function handleDrop() {
  if (activeImage) {
    const rect = activeImage.getBoundingClientRect();
    const dropTime = new Date();
    const timeInSeconds = Math.floor((dropTime - startTime) / 1000);
    positions[activeImage.src] = {
      x: rect.left,
      y: rect.top,
      time: timeInSeconds
    };
    imageTimes[activeImage.src] = timeInSeconds;
    updateImageTimerDisplay(activeImage.src, timeInSeconds);
  }
  activeImage = null;
}

function stopDrag() {
  handleDrop();
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
}

function stopDragTouch() {
  handleDrop();
  document.removeEventListener("touchmove", dragTouch);
  document.removeEventListener("touchend", stopDragTouch);
  document.removeEventListener("touchcancel", stopDragTouch);
}

function updateImageTimerDisplay(src, time) {
  if (src.includes("text=A")) {
    timeADisplay.textContent = time;
  } else if (src.includes("text=B")) {
    timeBDisplay.textContent = time;
  } else if (src.includes("text=C")) {
    timeCDisplay.textContent = time;
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (startTime && arenaVisible) {
      const currentTime = new Date();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      totalTimeDisplay.textContent = elapsed;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !arenaVisible && !confirmation.classList.contains("visible")) {
    instruction.classList.remove("visible");
    arenaContainer.style.display = "block";
    startTime = new Date();
    arenaVisible = true;
    startTimer();
  } else if (e.code === "Space" && arenaVisible && !confirmation.classList.contains("visible")) {
    arenaVisible = false;
    arenaContainer.style.display = "none";
    confirmation.classList.add("visible");
    stopTimer();
  } else if (e.code === "KeyF" && confirmation.classList.contains("visible")) {
    confirmation.classList.remove("visible");
    arenaContainer.style.display = "block";
    arenaVisible = true;
    startTimer();
  } else if (e.code === "Enter" && confirmation.classList.contains("visible")) {
    confirmation.classList.remove("visible");
    stopTimer();
    showQuestions();
  }
});

document.addEventListener("touchstart", e => {
  if (!arenaVisible && e.target.tagName !== "BUTTON" && !confirmation.classList.contains("visible")) {
    instruction.classList.remove("visible");
    arenaContainer.style.display = "block";
    startTime = new Date();
    arenaVisible = true;
    startTimer();
  } else if (arenaVisible && e.target.tagName !== "IMG" && !confirmation.classList.contains("visible")) {
    arenaVisible = false;
    arenaContainer.style.display = "none";
    confirmation.classList.add("visible");
    stopTimer();
  } else if (confirmation.classList.contains("visible") && e.target.tagName !== "BUTTON") {
    confirmation.classList.remove("visible");
    stopTimer();
    showQuestions();
  }
});

function showQuestions() {
  endTime = new Date();
  totalSeconds = Math.floor((endTime - startTime) / 1000);
  questions.classList.add("visible");
}

function recordAnswer(type, answer) {
  if (type === "attention") {
    attentionAnswer = answer;
    document.getElementById("q1").style.display = "none";
    document.getElementById("q2").style.display = "block";
  } else if (type === "device") {
    deviceAnswer = answer;
    questions.classList.remove("visible");
    saveCSV();
    showEndMessage();
  }
}

async function saveCSV() {
  let csv = "ParticipantID,TotalTime(s),Attention,Device,Image,PosX,PosY,ImageTime(s)\n";
  for (let key in positions) {
    csv += `${participantID},${totalSeconds},${attentionAnswer},${deviceAnswer},${key},${positions[key].x},${positions[key].y},${imageTimes[key] || 0}\n`;
  }

  const backendUrl = 'https://your-backend-url/upload-csv'; // Replace with your actual backend URL

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent: csv, participantID }),
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    console.log('CSV uploaded to GitHub!');
  } catch (error) {
    console.error('Error:', error);
    // Fallback: Download locally
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arrangement_${participantID}.csv`;
    a.click();
  }
}

function showEndMessage() {
  endScreen.classList.add("visible");
}
