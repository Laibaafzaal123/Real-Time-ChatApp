// ✅ Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set,
  remove,
  update,
  onChildAdded,
  onChildRemoved,
  onChildChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";


// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBsaEes6U5OLg6zr8EwG50XA3hsu4tlRwQ",
  authDomain: "authentication-app-3ed2c.firebaseapp.com",
  databaseURL: "https://authentication-app-3ed2c-default-rtdb.firebaseio.com",
  projectId: "authentication-app-3ed2c",
  storageBucket: "authentication-app-3ed2c.firebasestorage.app",
  messagingSenderId: "82368944179",
  appId: "1:82368944179:web:75b37e084330ee1f6feb46"
};


// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();


// ✅ Saved username
let globalUsername = localStorage.getItem("chat-username");


// ✅ SIGNUP
document.getElementById("signup")?.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) return alert("Enter email and password");
  if (password.length < 6) return alert("Password must be at least 6 characters");

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Signup Successful!");
      window.location.href = "user.html";
    })
    .catch(err => alert(err.message));
});


// ✅ LOGIN
document.getElementById("login-btn")?.addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) return alert("Enter email and password");

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login Successful!");
      window.location.href = "user.html";
    })
    .catch(err => alert(err.message));
});


// ✅ GOOGLE LOGIN
document.getElementById("google-btn")?.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Login Successful!");
      window.location.href = "user.html";
    })
    .catch(err => alert(err.message));
});


// ✅ RESET PASSWORD
document.getElementById("reset-password-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  const email = prompt("Enter your email:");

  if (!email) return alert("Please enter email!");

  sendPasswordResetEmail(auth, email)
    .then(() => alert("Password reset email sent!"))
    .catch(err => alert(err.message));
});


// ✅ AUTO REDIRECT (if logged in)
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (window.location.pathname.includes("login.html") || window.location.pathname.includes("index.html")) {
      window.location.href = "user.html";
    }
  }
});


// ✅ USERNAME PAGE
document.getElementById("user-btn")?.addEventListener("click", () => {
  const name = document.getElementById("username").value;
  if (!name.trim()) return alert("Enter username!");

  localStorage.setItem("chat-username", name);
  window.location.href = "chat.html";
});


// ✅ SEND MESSAGE + TIME STAMP
document.getElementById("send-btn")?.addEventListener("click", () => {
  const message = document.getElementById("message").value;
  if (!message.trim()) return;

  if (!globalUsername) globalUsername = localStorage.getItem("chat-username");

  const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const msgRef = push(ref(db, "messages"));
  set(msgRef, { 
    id: msgRef.key, 
    name: globalUsername, 
    text: message,
    time: timeNow      // ✅ Time save ho gaya
  });

  document.getElementById("message").value = "";
});


// ✅✅ RECEIVE MESSAGES — (Bubble + Time + Icons Outside) ✅✅
onChildAdded(ref(db, "messages"), (snapshot) => {
  const box = document.getElementById("messages");
  if (!box) return;

  const data = snapshot.val();

  const row = document.createElement("div");
  row.className = "chat-row";
  row.setAttribute("data-id", data.id);

  const bubble = document.createElement("div");
  bubble.className = "chat-message";

  if (data.name === globalUsername) bubble.dataset.self = "true";

  bubble.innerHTML = `
    <span class="msg-text">${data.text}</span>
    <span class="msg-time">${data.time || ""}</span>
  `;

  row.appendChild(bubble);

  if (data.name === globalUsername) {
    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.innerHTML = "✏";
    editBtn.onclick = () => editMessage(data.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "🗑";
    deleteBtn.onclick = () => deleteMessage(data.id);

    row.appendChild(editBtn);
    row.appendChild(deleteBtn);
  }

  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
});


// ✅ DELETE
window.deleteMessage = function (id) {
  remove(ref(db, "messages/" + id));
};


// ✅ EDIT
window.editMessage = function (id) {
  const newMsg = prompt("Edit your message:");
  if (!newMsg?.trim()) return;

  update(ref(db, "messages/" + id), { text: newMsg });
};


// ✅ REMOVE from UI on DELETE
onChildRemoved(ref(db, "messages"), (snapshot) => {
  const row = document.querySelector(`.chat-row[data-id="${snapshot.key}"]`);
  if (row) row.remove();
});


// ✅ UPDATE UI on EDIT
onChildChanged(ref(db, "messages"), (snapshot) => {
  const row = document.querySelector(`.chat-row[data-id="${snapshot.key}"]`);
  if (row) {
    row.querySelector(".msg-text").textContent = snapshot.val().text;
  }
});


// ✅ LOGOUT
document.getElementById("logout")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    localStorage.removeItem("chat-username");
    window.location.href = "index.html";
  });
});
