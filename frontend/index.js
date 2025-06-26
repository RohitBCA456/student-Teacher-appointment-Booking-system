document.getElementById("role").addEventListener("change", function () {
  const role = this.value;
  const departmentField = document.getElementById("department");
  const subjectField = document.getElementById("subject");

  if (role === "student") {
    departmentField.style.display = "block";
    subjectField.style.display = "none";
  } else if (role === "teacher") {
    departmentField.style.display = "block";
    subjectField.style.display = "block";
  } else {
    departmentField.style.display = "none";
    subjectField.style.display = "none";
  }
});

document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const role = document.getElementById("role").value;

  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role,
    department: document.getElementById("department").value || undefined,
    subject: document.getElementById("subject").value || undefined,
  };

  let url = "";
  if (role === "student") {
    url = "http://localhost:2000/student/registerStudent";
  } else if (role === "teacher") {
    url = "http://localhost:2000/teacher/registerTeacher";
  } else if (role === "admin") {
    url = "http://localhost:2000/admin/registerAdmin";
  } else {
    alert("Invalid role selected.");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const data = await res.json();
    alert(data.message || "Registration complete");
    if(res.ok) {
          window.location.href="http://127.0.0.1:5500/student%20teacher%20appointment%20app/frontend/login.html";
    }
  } catch (err) {
    alert("Error registering user");
    console.error(err);
  }
});
