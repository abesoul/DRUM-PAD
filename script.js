// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let isLooping = false;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioContext.createAnalyser();
let isUserLoggedIn = false;
let projectData = [];

// Handle audio playback with loop functionality
let activeSounds = {};  // Track active sounds for merging

function toggleLooping(soundKey) {
  if (isLooping && activeSounds[soundKey]) {
    activeSounds[soundKey].stop();
    delete activeSounds[soundKey];
  } else {
    const audio = new Audio(sounds[soundKey]);
    activeSounds[soundKey] = audio;
    audio.loop = true;
    audio.play();
  }
}

// Handle Login/Logout
document.getElementById('login-btn').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then((result) => {
    isUserLoggedIn = true;
    document.getElementById('auth-container').style.display = 'none';
    console.log('Logged in');
  });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  auth.signOut().then(() => {
    isUserLoggedIn = false;
    document.getElementById('auth-container').style.display = 'block';
    console.log('Logged out');
  });
});

// Handle save and download functionality
document.getElementById("save-project-btn").addEventListener("click", () => {
  if (isUserLoggedIn) {
    db.collection("projects").add({
      projectName: "User's Custom Project",
      soundData: projectData,
    }).then(() => {
      alert("Project saved to Firebase!");
    });
  } else {
    alert("Please login to save projects!");
  }
});

document.getElementById("download-project-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(projectData)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "project.json";
  link.click();
});

// Implement Loop toggle functionality
document.getElementById("loop-toggle-checkbox").addEventListener("change", (e) => {
  isLooping = e.target.checked;
  if (!isLooping) {
    // Stop all active sounds if looping is disabled
    for (const key in activeSounds) {
      activeSounds[key].pause();
    }
    activeSounds = {};
  }
});

// Handle file upload
document.getElementById("file-upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const audioBuffer = audioContext.decodeAudioData(event.target.result, (buffer) => {
        const customSound = new Audio();
        customSound.src = URL.createObjectURL(file);
        sounds[document.getElementById("assign-key").value] = customSound.src;
      });
    };
    reader.readAsArrayBuffer(file);
  }
});
