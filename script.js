const keys = {
  Q: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  W: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  E: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  A: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  S: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  D: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  Z: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  X: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  C: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
};

const display = document.getElementById("display-text");
const loopToggle = document.getElementById("loop-toggle");
const canvas = document.getElementById("spectrum-canvas");
const ctx = canvas.getContext("2d");

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();
let gainNode = audioCtx.createGain();
let convolver = audioCtx.createConvolver();
let compressor = audioCtx.createDynamicsCompressor();
let buffers = {};
let sources = {};
let trimStart = 0;
let trimEnd = 10;

// Load default reverb IR
fetch("https://cdn.jsdelivr.net/gh/mdn/webaudio-examples/voice-change-o-matic/audio/concert-crowd.ogg")
  .then(res => res.arrayBuffer())
  .then(buf => audioCtx.decodeAudioData(buf))
  .then(decoded => convolver.buffer = decoded);

Object.keys(keys).forEach(k => {
  const pad = document.createElement("div");
  pad.className = "drum-pad";
  pad.innerText = k;
  pad.onclick = () => handlePlay(k);
  document.getElementById("drum-pads").appendChild(pad);

  fetch(keys[k])
    .then(res => res.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(audio => buffers[k] = audio);
});

document.getElementById("start-time").addEventListener("input", e => trimStart = parseFloat(e.target.value));
document.getElementById("end-time").addEventListener("input", e => trimEnd = parseFloat(e.target.value));

function handlePlay(key) {
  if (!buffers[key]) return;

  if (sources[key]) {
    sources[key].stop();
    sources[key] = null;
    return;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffers[key];
  source.loop = loopToggle.checked;

  const reverbMix = parseFloat(document.getElementById("reverb-mix").value);
  const dryGain = audioCtx.createGain();
  dryGain.gain.value = 1 - reverbMix;
  const wetGain = audioCtx.createGain();
  wetGain.gain.value = reverbMix;

  source.connect(dryGain).connect(compressor);
  source.connect(convolver).connect(wetGain).connect(compressor);
  compressor.connect(analyser).connect(gainNode).connect(audioCtx.destination);

  const start = Math.min(trimStart, source.buffer.duration - 0.1);
  const end = Math.min(trimEnd, source.buffer.duration);
  const duration = Math.max(0.1, end - start);

  source.start(0, start, duration);
  sources[key] = source;
  display.innerText = `Playing ${key} from ${start}s to ${end}s`;
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function drawSpectrum() {
  requestAnimationFrame(drawSpectrum);
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0";
  data.forEach((v, i) => {
    ctx.fillRect(i * 3, canvas.height - v, 2, v);
  });
}

drawSpectrum();
