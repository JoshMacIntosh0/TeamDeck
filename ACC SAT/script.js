//Login Page

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const message = document.getElementById("message");


loginBtn.addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "" || password === "") {
    message.textContent = "Please enter both username and password.";
    message.style.color = "red";
  } else {
    window.location.href = "dashboard.html";
  }
});


signupBtn.addEventListener("click", function () {
  message.textContent = "Sign up page coming soon.";
  message.style.color = "#f15a2b";
});


//Dashboard Page