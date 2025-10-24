try {
  let participantID = prompt("Enter your Participant ID:");
  let startTime, endTime, arenaVisible = false;
  let attentionAnswer = "", deviceAnswer = "";
  let positions = {};
  let imageTimes = {};
  let timerInterval;
  let totalSeconds = 0;
  let activeImage = null;
  let offsetX = 0, offsetY = 0;

  const instruction = document.getElementById("instruction");
  const arenaContainer = document.getElementById("arenaContainer");
  const arena = document.getElementById("arena");
  const totalTimeDisplay = document.getElementById("totalTime");
  const questions = document.getElementById("questions");
  const endScreen = document.getElementById("endScreen");

  // ✅ Automatically load all images in your repo
  const imageNames = [
    "aardvark.jpg","anteater.jpg","brown_bear.jpg","camel.jpg","canary.jpg","carp.jpg",
    "caterpillarhawkmoth.jpg","catfish.jpg","chipmunk.jpg","cranebug.jpg","cricket.jpg",
    "elephantafrican.jpg","finch.jpg","firebug.jpg","flea.jpg","gerbil.jpg","giraffe.jpg",
    "goldfish.jpg","halibut.jpg","herculesbeetle.jpg","herring.jpg","horse.jpg","hyena.jpg",
    "leopard.jpg","llama.jpg","marmot.jpg","mouse.jpg","ostrich.jpg","palmcockatoo.jpg",
    "partridge.jpg","pelican.jpg","perch.jpg","pigeon.jpg","pike.jpg","porcupine.jpg",
    "prayingmantis.jpg","rabbit.jpg","reindeer.jpg","salmon.jpg","shark.jpg","sheep.jpg",
    "shrimp.jpg","skunk.jpg","snail.jpg","starfish.jpg","tiger.jpg","turkey.jpg","turkey copy.jpg",
    "waterbuffalo.jpg"
  ];

  // Create image elements
  imageNames.forEach(name => {
    const img = document.createElement("img");
    img.src = name;
    img.alt = name.replace(".jpg", "");
    img.className = "image";
    img.draggable = false;
    img.style.position = "absolute";
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.cursor = "grab";
    img.addEventListener("mousedown", startDrag);
    img.addEventListener("touchstart", startDragTouch, { passive: false });
    arenaContainer.appendChild(img);
  });

  const images = document.querySelectorAll(".image");

  function randomizeImagePositions() {
    images.forEach((img, i) => {
      img.style.left = `${5 + Math.random() * 10}%`;
      img.style.top = `${10 + i * 2}%`;
    });
  }

  function startDrag(e) {
    if (!arenaVisible) return;
    activeImage = e.target;
    const rect = activeImage.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    activeImage.style.cursor = "grabbing";
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  }

  function drag(e) {
    if (!activeImage) return;
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;
    activeImage.style.left = `${newX}px`;
    activeImage.style.top = `${newY}px`;
  }

  function stopDrag() {
    if (!activeImage) return;
    const rect = activeImage.getBoundingClientRect();
    const dropTime = new Date();
    const timeInSeconds = Math.floor((dropTime - startTime) / 1000);
    const key = activeImage.src.split("/").pop();
    positions[key] = { x: rect.left, y: rect.top, time: timeInSeconds };
    imageTimes[key] = timeInSeconds;
    activeImage.style.cursor = "grab";
    activeImage = null;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  }

  function startDragTouch(e) {
    e.preventDefault();
    if (!arenaVisible || e.touches.length !== 1) return;
    activeImage = e.target;
    const rect = activeImage.getBoundingClientRect();
    const touch = e.touches[0];
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    document.addEventListener("touchmove", dragTouch, { passive: false });
    document.addEventListener("touchend", stopDragTouch);
  }

  function dragTouch(e) {
    e.preventDefault();
    if (!activeImage || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - offsetX;
    const newY = touch.clientY - offsetY;
    activeImage.style.left = `${newX}px`;
    activeImage.style.top = `${newY}px`;
  }

  function stopDragTouch() {
    stopDrag();
    document.removeEventListener("touchmove", dragTouch);
    document.removeEventListener("touchend", stopDragTouch);
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      if (startTime && arenaVisible) {
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        totalTimeDisplay.textContent = elapsed;
      }
    }, 1000);
  }

  function areAllImagesInArena() {
    const arenaRect = arena.getBoundingClientRect();
    const centerX = arenaRect.left + arenaRect.width / 2;
    const centerY = arenaRect.top + arenaRect.height / 2;
    const radius = arenaRect.width / 2;
    return Array.from(images).every(img => {
      const rect = img.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      return dist <= radius;
    });
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
        clearInterval(timerInterval);
        showQuestions();
      } else {
        alert("Please place all images inside the arena before proceeding.");
      }
    }
  });

  function showQuestions() {
    endTime = new Date();
    totalSeconds = Math.floor((endTime - startTime) / 1000);
    questions.classList.add("visible");
  }

  window.recordAnswer = function (type, answer) {
    if (type === "attention") {
      attentionAnswer = answer;
      document.getElementById("q1").classList.add("hidden");
      document.getElementById("q2").classList.remove("hidden");
    } else if (type === "device") {
      deviceAnswer = answer;
      questions.classList.remove("visible");
      saveCSV();
      showEndMessage();
    }
  };

  function saveCSV() {
    let csv = "ParticipantID,TotalTime(s),Attention,Device,Image,PosX,PosY,ImageTime(s)\n";
    for (let key in positions) {
      csv += `${participantID},${totalSeconds},${attentionAnswer},${deviceAnswer},${key},${positions[key].x},${positions[key].y},${positions[key].time}\n`;
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arrangement_${participantID}.csv`;
    a.click();
  }

  function showEndMessage() {
    endScreen.classList.add("visible");
  }
} catch (error) {
  console.error("Script initialization failed:", error);
}
