let participantID = prompt("Enter your Participant ID:");
let startTime, endTime, arenaVisible = false;
let attentionAnswer = "", deviceAnswer = "";
let positions = {};
let imageTimes = {};
let timerInterval;

const instruction = document.getElementById("instruction");
const arenaContainer = document.getElementById("arenaContainer");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const images = document.querySelectorAll(".image");
const arena = document.getElementById("arena");
const totalTimeDisplay = document.getElementById("totalTime");

images.forEach(img => {
  img.addEventListener("mousedown", startDrag);
  img.addEventListener("touchstart", startDragTouch, { passive: false });
  // Log image loading errors
  img.onerror = () => {
    console.error(`Failed to load image: ${img.src}`);
  };
});

function randomizeImagePositions() {
  const minTop = 10; // 10% from top
  const maxTop = 90; // 90% from top
  const range = maxTop - minTop;
  const totalImages = images.length;
  const spacing = range / totalImages; // Distribute images to avoid overlap

  // Shuffle indices to randomize order
  const indices = Array.from({ length: totalImages }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  images.forEach((img, index) => {
    const positionIndex = indices[index];
    const topPercent = minTop + positionIndex * spacing;
    img.style.left = '5%';
    img.style.top = `${topPercent}%`;
  });
}

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
  const radius = arenaRect.width / 2 - 25; // Adjust for image size (50px / 2)
  const distance = Math.sqrt(
    Math.pow(x - arenaCenterX, 2) + Math.pow(y - arenaCenterY, 2)
  );
  return distance <= radius;
}

function areAllImagesInArena() {
  return Array.from(images).every(img => {
    const rect = img.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return isWithinArena(centerX, centerY);
  });
}

function drag(e) {
  if (!activeImage) return;
  let newX = e.pageX - 25; // Center of 50px image
  let newY = e.pageY - 25;
  if (isWithinArena(newX + 25, newY + 25)) {
    activeImage.style.left = newX + "px";
    activeImage.style.top = newY + "px";
  }
}

function dragTouch(e) {
  e.preventDefault();
  if (!activeImage || e.touches.length !== 1) return;
  const touch = e.touches[0];
  let newX = touch.pageX - 25;
  let newY = touch.pageY - 25;
  if (isWithinArena(newX + 25, newY + 25)) {
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
  // Only update imageTimes for CSV, no DOM manipulation
  imageTimes[src] = time;
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

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !arenaVisible) {
    instruction.classList.remove("visible");
    arenaContainer.style.display = "block";
    randomizeImagePositions();
    startTime = new Date();
    arenaVisible = true;
    startTimer();
  } else if (e.code === "Enter" && arenaVisible) {
    if (areAllImagesInArena()) {
      arenaVisible = false;
      arenaContainer.style.display = "none";
      stopTimer();
      showQuestions();
    } else {
      alert("Please place all images inside the arena before proceeding.");
    }
  }
});

document.addEventListener("touchstart", e => {
  if (!arenaVisible && e.target.tagName !== "BUTTON") {
    instruction.classList.remove("visible");
    arenaContainer.style.display = "block";
    randomizeImagePositions();
    startTime = new Date();
    arenaVisible = true;
    startTimer();
  } else if (arenaVisible && e.target.tagName !== "IMG") {
    if (areAllImagesInArena()) {
      arenaVisible = false;
      arenaContainer.style.display = "none";
      stopTimer();
      showQuestions();
    } else {
      alert("Please place all images inside the arena before proceeding.");
    }
  }
});

function stopTimer() {
  clearInterval(timerInterval);
}

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
    deviceAnswer = answer
