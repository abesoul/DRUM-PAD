function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const users = getUsers();

  if (users[username] && users[username].password === password) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "index.html";
  } else {
    document.getElementById("login-msg").innerText = "Invalid credentials.";
  }
}

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const users = getUsers();

  if (users[username]) {
    document.getElementById("login-msg").innerText = "Username already exists.";
    return;
  }

  users[username] = { password, projects: [] };
  saveUsers(users);
  document.getElementById("login-msg").innerText = "Registered! Now login.";
}
