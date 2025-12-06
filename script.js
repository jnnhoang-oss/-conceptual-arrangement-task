// ------------------------
// Complete Memory Task Script with All Screens
// ------------------------

// Folders and images
const oldImageFolder = "oldpics/";
const oldImages = [
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

const newImageFolder = "newpic/";
const newImages = [
 "alligator.jpg", "angelfish.jpg","ant.jpg","armadillo.jpg","assassinbug.jpg",
  "baboon.jpg","badger.jpg","baldeagle.jpg","bat.jpg","beaver.jpg","bluejay.jpg","boar.jpg",
"bull.jpg","butterfly.jpg","cardinal.jpg","caribou.jpg","cat.jpg","caterpillarpeacockmoth.jpg",
  "cedarwaxwing.jpg","chameleon.jpg","cheetah.jpg","chimpanzee.jpg","clownfish.jpg","cobra.jpg","cockroach.jpg","cougar.jpg","cow.jpg","crab.jpg","crow.jpg","dolphin.jpg",
"dragonfly.jpg","dramaderry.jpg","duck.jpg","eagle.jpg","fennec.jpg","flamingo.jpg","gecko.jpg","gorilla.jpg",
"hummingbird.jpg","mahimahi.jpg","mink.jpg","mole.jpg","quail.jpg","racoon.jpg","rhino.jpg","seal.jpg","snapper.jpg","zebra.jpg"
];

// Build and shuffle trials
let trials = [];
oldImages.forEach(img => trials.push({img: oldImageFolder + img, old: 1}));
newImages.forEach(img => trials.push({img: newImageFolder + img, old: 0}));
function shuffle(array){for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}}shuffle(trials);

// ------------------------
// Variables
// ------------------------
let trialIndex = 0;
let preTestQ1 = null;
let preTestQ2 = null;
let responses = [];
let itiDuration = 0;

// ------------------------
// DOM Elements
// ------------------------
const screens = {
  id: document.getElementById('idScreen'),
  instructions: document.getElementById('instructionsScreen'),
  memoryInstructions: document.getElementById('memoryInstructionsScreen'),
  question1: document.getElementById('question1Screen'),
  question2: document.getElementById('question2Screen'),
  ready: document.getElementById('readyScreen'),
  image: document.getElementById('imageScreen'),
  choice: document.getElementById('choiceScreen'),
  confidence: document.getElementById('confidenceScreen'),
  feedback: document.getElementById('feedbackScreen'),
  end: document.getElementById('endScreen')
};
const imgStage = document.getElementById('imgStage');

// ------------------------
// Show screen function
// ------------------------
function showScreen(screenName){for(let key in screens){screens[key].classList.remove('active');}screens[screenName].classList.add('active');}

// ------------------------
// ID Screen
// ------------------------
document.getElementById('subid').addEventListener('keydown',e=>{if(e.key==='Enter') showScreen('instructions');});

// ------------------------
// Instructions Screens
// ------------------------
document.addEventListener('keydown', e => {
  if(e.key==='Enter'){
    if(screens.instructions.classList.contains('active')) showScreen('memoryInstructions');
    else if(screens.memoryInstructions.classList.contains('active')) showScreen('question1');
    else if(screens.ready.classList.contains('active')) runTrial();
  }
});

// ------------------------
// Pre-test Questions
// ------------------------
document.getElementById('q1Scale').addEventListener('click', e => {if(e.target.classList.contains('rating-option')){preTestQ1 = e.target.dataset.value; showScreen('question2');}});
document.getElementById('q2Scale').addEventListener('click', e => {if(e.target.classList.contains('rating-option')){preTestQ2 = e.target.dataset.value; showScreen('ready');}});

// ------------------------
// Memory Task Functions
// ------------------------
function randomITI(){return 1000+Math.random()*500;}

function runTrial(){
  if(trialIndex>=trials.length) return endExperiment();
  itiDuration=randomITI();
  imgStage.textContent='+';
  showScreen('image');
  setTimeout(showImage, itiDuration);
}

function showImage(){
  const t = trials[trialIndex];
  imgStage.style.backgroundImage=`url(${t.img})`;
  imgStage.style.backgroundSize='contain';
  imgStage.style.backgroundRepeat='no-repeat';
  imgStage.style.backgroundPosition='center';
  setTimeout(()=>{showScreen('choice'); startChoice(t);},2000);
}

function startChoice(currentTrial){
  document.onkeydown = e=>{
    if(['f','j'].includes(e.key.toLowerCase())){
      currentTrial.choice=(e.key.toLowerCase()==='f')?'New':'Old';
      showScreen('confidence');
      startConfidence(currentTrial);
    }
  };
}

function startConfidence(currentTrial){
  document.onkeydown = e=>{
    if(['1','2','3','4','5'].includes(e.key)){
      currentTrial.confidence=e.key;
      currentTrial.preTestQ1=preTestQ1;
      currentTrial.preTestQ2=preTestQ2;
      currentTrial.iti=itiDuration;
      responses.push(currentTrial);
      showScreen('feedback');
      document.getElementById('feedbackText').textContent = currentTrial.choice===((currentTrial.old===1)?'Old':'New')?'Correct!':'Incorrect';
      trialIndex++;
      setTimeout(runTrial,800);
    }
  };
}

// ------------------------
// End Experiment
// ------------------------
function endExperiment(){
  showScreen('end');
  let csv='image,old,choice,confidence,preTestQ1,preTestQ2,iti\n';
  responses.forEach(r=>csv+=`${r.img},${r.old},${r.choice},${r.confidence},${r.preTestQ1},${r.preTestQ2},${r.iti}\n`);
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='memory_test.csv';
  a.click();
}
