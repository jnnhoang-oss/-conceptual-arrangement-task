const arenaContainer = document.getElementById("arenaContainer");
const arena = document.getElementById("arena");
const instruction = document.getElementById("instruction");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const totalTimeDisplay = document.getElementById("totalTime");
const warningMessage = document.getElementById("warningMessage");

let participantID = prompt("Enter Participant ID:");
let startTime, timerInterval;
let attentionAnswer = "", deviceAnswer = "";
let positions = {};
let totalSeconds = 0;
let arenaVisible = false;

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
    "skunk.jpg","snail.jpg","starfish.jpg","tiger.jpg","turkey.jpg","turkey copy.jpg","waterbuffalo.jpg"
  ];

  // --- Create scattered images ---
  function loadImages() {
    imageFiles.forEach((file) => {
      const img = document.createElement("img");
      img.src = imageFolder + file;
      img.alt = file.split(".")[0];
      img.classList.add("image");

      // randomize positions
      const randomX = Math.random() * (window.innerWidth * 0.4 - 60);
      const randomY = Math.random() * (window.innerHeight - 80);
      img.style.left = `${randomX}px`;
      img.style.top = `${randomY}px`;

      arenaContainer.appendChild(img);
    });
  }

  // --- Dragging functionality ---
  let active = null;
  let offsetX = 0, offsetY = 0;

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
      active.style.left = x + "px";
      active.style.top = y + "px";
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

  // --- Check if inside arena ---
  function isInsideArena(img) {
    const arenaRect = arena.getBoundingClientRect();
    const arenaCenterX = arenaRect.left + arenaRect.width / 2;
    const arenaCenterY = arenaRect.top + arenaRect.height / 2;
    const radius = arenaRect.width / 2;

    const imgRect = img.getBoundingClientRect();
    const imgCenterX = imgRect.left + imgRect.width / 2;
    const imgCenterY = imgRect.top + imgRect.height / 2;

    const dx = imgCenterX - arenaCenterX;
    const dy = imgCenterY - arenaCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance + imgRect.width / 2 < radius;
  }

  function allImagesInside() {
    const imgs = document.querySelectorAll(".image");
    return Array.from(imgs).every(isInsideArena);
  }

  // --- Record answers ---
  function recordAnswer(type, answer) {
    if (type === "attention") {
      attentionAnswer = answer;
      document.getElementById("q1").style.display = "none";
      document.getElementById("q2").style.display = "block";
    } else {
      deviceAnswer = answer;
      questions.classList.remove("visible");
      saveCSV();
      endScreen.classList.add("visible");
    }
  }

  // --- Save CSV ---
  function saveCSV() {
    let csv = "ParticipantID,Time,Attention,Device,Image,X,Y\n";
    for (let key in positions) {
      const p = positions[key];
      csv += `${participantID},${totalSeconds},${attentionAnswer},${deviceAnswer},${key},${p.x},${p.y}\n`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `arrangement_${participantID}.csv`;
    a.click();
  }

  // --- Controls ---
  document.addEventListener("keydown", e => {
    if (e.code === "Space" && !arenaVisible) {
      instruction.classList.remove("visible");
      arenaContainer.style.display = "block";
      loadImages();
      enableDragging();
      arenaVisible = true;
      startTimer();
    } else if (e.code === "Enter" && arenaVisible) {
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
        questions.classList.add("visible");
      } else {
        warningMessage.style.display = "block";
      }
    }
  });

