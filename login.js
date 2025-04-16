// login.js
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

const provider = new GoogleAuthProvider();

document.getElementById("login-btn").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = "app.html";
    })
    .catch(console.error);
});

onAuthStateChanged(auth, user => {
  if (user) window.location.href = "app.html";
});
