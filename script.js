const webpage = document.getElementById('webpage');
const textDisplay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const mode = document.body.dataset.mode;
// behavior parameters
let dropChance = 0;
let dropAfterWords = [];
let liveOpacity = 0.95;
let liveWeight = 520;
let liveColour = '#000';

// tune behavior based on hours of sleep
if (mode === "rested") {
  dropChance = 0;
  liveOpacity = 0.95;
  liveWeight = 620;
  dropAfterWords = [];
}

if (mode === "tired") {
  dropChance = 0.50;
  liveOpacity = 0.65;
  liveWeight = 460;
  // define word to drop
  dropAfterWords = ["the", "a", "an"];
}

if (mode === "wrecked") {
  dropChance = 1;
  liveOpacity = 0.35;
  liveWeight = 320;
  // define word to drop
  dropAfterWords = ["the", "a", "an", "this", "that", "these", "is", "what"];
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// rested placement
let restedY = 8;
const restedLineStepVh = 7;
const restedYWrapVh = 82;
const restedLeftPaddingPx = 72;  

recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.continuous = true;

recognition.onresult = function(event) {
  const transcript = event.results[event.results.length - 1][0].transcript;
  textDisplay.textContent = transcript || "Listening…";

  const result = event.results[event.results.length - 1];
  if (result.isFinal) {
    const t = (transcript || "").trim();
    if (t) sentencePlacement(t);
  }
};

recognition.onerror = function(event) {
  console.error('Speech recognition error:', event.error);
};

recognition.onend = function() {
  textDisplay.textContent = "Not listening.";
  startBtn.disabled = false;
};

recognition.onstart = function() {
  textDisplay.textContent = "Listening…";
  startBtn.disabled = true;
};

startBtn.addEventListener('click', () => {
  textDisplay.textContent = "Requesting microphone…";
  recognition.start();
});

// -----------------------
// word drop function
// -----------------------
function dropAfterArticles(text, prob, targets){
// split into 띄어쓰기 "" 
  const words = text.split(/\s+/);

  for (let i = 0; i < words.length - 1; i++) {
    const current = words[i].toLowerCase();

    if (targets.includes(current)) {
      if (Math.random() < prob) {
        words[i + 1] = "";
        i += 1;
      }
    }
  }
  // 띄어쓰기 + 지워진 empty string을 지우고 --> 그 다음에 join. export as finaltext
  const result = words.filter(Boolean).join(" ");
  return result || text;
}

// -----------------------
// Place line as floating text by creating a new DOM element, 스타일 위치,,,, conceptually, text = 말한거 finaltext = 들은거
function sentencePlacement(text) {
  const finalText = dropAfterArticles(text, dropChance, dropAfterWords);

  const line = document.createElement('div');
  // line body live-transcriitpion allowing linking btw csss, and text made here and positions it on to web
  line.className = 'line body live-transcription';
  line.textContent = finalText;
  line.style.opacity = String(liveOpacity);
  // wrecked mode add blur (legibility breaks down)
  line.style.setProperty('filter', mode === "wrecked" ? 'blur(0.6px)' : 'none');

  let xPx, xVw, yVh;

if (mode === "rested") {
  // fixed, 실제 종이같은 placement
  xPx = restedLeftPaddingPx;
  yVh = restedY;

  // linear progression text stacking
  restedY += restedLineStepVh;

  line.style.setProperty('--x', `${xPx}px`);
  line.style.setProperty('--y', `${yVh}vh`);
} else {
  // unstable, flexible placement --> for tired and wrecked
  xVw = 8 + Math.random() * 84;
  yVh = 3 + Math.random() * 18;

  line.style.setProperty('--x', `${xVw}vw`);
  line.style.setProperty('--y', `${yVh}vh`);
}

  // sleep-state behavior
  line.style.setProperty('--wght', String(liveWeight));

  // append it, so it shows on the screen
  webpage.appendChild(line);

  // fade and remove only for wrecked mode
  if (mode === "wrecked") {
    setTimeout(() => {
      line.classList.add('fading');
      setTimeout(() => line.remove(), 600);
    }, 20000);
  }
}
