try {
  let participantID = prompt("Enter your Participant ID:");
  let startTime, endTime, arenaVisible = false;
  let attentionAnswer = "", deviceAnswer = "";
  let positions = {};
  let imageTimes = {};
  let timerInterval;
  let failedImages = 0;
  let totalSeconds = 0;

  const instruction = document.getElementById("instruction");
  const arenaContainer = document.getElementById("arenaContainer");
  const questions = document.getElementById("questions");
  const endScreen = document.getElementById("endScreen");
  const images = document.querySelectorAll(".image");
  const arena = document.getElementById("arena");
  const totalTimeDisplay = document.getElementById("totalTime");

  if (!instruction || !arenaContainer || !questions || !endScreen || !arena || !totalTimeDisplay) {
    console.error("One or more DOM elements are missing. Check HTML IDs.");
    throw new Error("DOM initialization failed");
  }

  // ----- Handle missing images -----
  images.forEach(img => {
    img.addEventListener("pointerdown", startDrag);
    img.onerror = () => {
      console.error(`Failed to load image: ${img.src}`);
      failedImages++;
      const placeholder = document.createElement("div");
      placeholder.className = "image placeholder";
      placeholder.textContent = img.alt || "Placeholder";
      placeholder.style.background = "#555";
      placeholder.style.color = "white";
      placeholder.style.fontSize = "12px";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      placeholder.style.borderRadius = "8px";
      img.parentNode.replaceChild(placeholder, img);
      placeholder.addEventListener("pointerdown", startDrag);
    };
  });

  // ----- Randomize initial positions -----
  function randomizeImagePositions() {
    const minTop = 10;
    const maxTop = 90;
    const totalImages = images.length;
    const spacing = (maxTop - minTop) / totalImages;
    const shuffled = [...images].sort(() => Math.random() - 0.5);

    shuffled.forEach((img, i) => {
      img.style.left = '5%';
      img.style.top = `${minTop + i * spacing}%`;
    });
  }

  // ----- Smooth drag -----
  let activeImage = null;
  let offsetX = 0, offsetY = 0;

  function startDrag(e) {
    activeImage = e.target;
    const rect = activeImage.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    activeImage.setPointerCapture(e.pointerId);
    activeImage.style.transition = "none";
    activeImage.addEventListener("pointermove", drag);
    activeImage.addEventListener("pointerup", stopDrag);
  }

  function drag(e) {
    if (!activeImage) return;
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    const arenaRect = arena.getBoundingClientRect();
    const arenaCenterX = arenaRect.left + arenaRect.width / 2;
    const arenaCenterY = arenaRect.top + arenaRect.height / 2;
    const radius = arenaRect.width / 2 - 30;

    const imageCenterX = newX + activeImage.offsetWidth / 2;
    const imageCenterY = newY + activeImage.offsetHeight / 2;

    const dx = imageCenterX - arenaCenterX;
    const dy = imageCenterY - arenaCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Keep inside arena boundary
    if (distance < radius) {
      activeImage.style.left = newX + "px";
      activeImage.style.top = newY + "px";
    }
  }

  function stopDrag(e) {
    if (!activeImage) return;
    handleDrop(activeImage);
    activeImage.releasePointerCapture(e.pointerId);
    activeImage.removeEventListener("pointermove", drag);
    activeImage.removeEventListener("pointerup", stopDrag);
    activeImage = null;
  }

  // ----- Record drop -----
  function handleDrop(img) {
    const rect = img.getBoundingClientRect();
    const dropTime = new Date();
    const timeInSeconds = Math.floor((dropTime - startTime) / 1000);
    const key = img.src || img.textContent;
    positions[key] = { x: rect.left, y: rect.top, time: timeInSeconds };
    imageTimes[key] = timeInSeconds;
  }

  // ----- Timer -----
  function startTimer() {
    timerInterval = setInterval(() => {
      if (startTime && arenaVisible) {
        const currentTime = new Date();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        totalTimeDisplay.textContent = elapsed;
      }
    }, 1000);
  }

  // ----- Arena logic -----
  function areAllImagesInArena() {
    return Array.from(document.querySelectorAll(".image, .placeholder")).every(elem => {
      const rect = elem.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const arenaRect = arena.getBoundingClientRect();
      const cx = arenaRect.left + arenaRect.width / 2;
      const cy = arenaRect.top + arenaRect.height / 2;
      const radius = arenaRect.width / 2 - 25;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return dist <= radius;
    });
  }

  // ----- Keyboard flow -----
  document.addEventListener("keydown", e => {
    try {
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
          clearInterval(timerInterval);
          showQuestions();
        } else {
          alert("Please place all images inside the arena before proceeding.");
        }
      }
    } catch (err) {
      console.error("Keydown error:", err);
    }
  });

  // ----- Questions -----
  function showQuestions() {
    endTime = new Date();
    totalSeconds = Math.floor((endTime - startTime) / 1000);
    questions.classList.add("visible");
  }

  function recordAnswer(type, answer) {
    try {
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
    } catch (err) {
      console.error("Record answer error:", err);
    }
  }

  // ----- Save Data -----
  async function saveCSV() {
    let csv = "ParticipantID,TotalTime(s),Attention,Device,Image,PosX,PosY,ImageTime(s)\n";
    for (let key in positions) {
      const filename = key.split('/').pop() || key;
      csv += `${participantID},${totalSeconds},${attentionAnswer},${deviceAnswer},${filename},${positions[key].x},${positions[key].y},${imageTimes[key] || 0}\n`;
    }

    try {
      const backendUrl = "https://your-backend-url/upload-csv"; // <== Replace with real backend
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csv, participantID }),
      });
      if (!response.ok) throw new Error("Upload failed");
      console.log("✅ CSV uploaded successfully!");
    } catch (error) {
      console.error("CSV upload failed:", error);
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
} catch (error) {
  console.error("Initialization error:", error);
}
