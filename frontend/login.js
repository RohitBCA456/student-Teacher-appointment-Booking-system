document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      // 1. Get user role by email
      const roleRes = await fetch("http://localhost:2000/auth/getUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const roleData = await roleRes.json();
      if (!roleRes.ok || !roleData.role) {
        alert(roleData.message || "Role not found for this email.");
        return;
      }

      const role = roleData.role;
      let loginUrl = "";

      // 2. Decide login endpoint
      if (role === "student") {
        loginUrl = "http://localhost:2000/student/loginStudent";
      } else if (role === "teacher") {
        loginUrl = "http://localhost:2000/teacher/loginTeacher";
      } else if (role === "admin") {
        loginUrl = "http://localhost:2000/admin/loginAdmin";
      } else {
        alert("Unknown role");
        return;
      }

      // 3. Attempt role-specific login
      const loginRes = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        alert(loginData.message || "Login failed");
        return;
      }

      alert("Login successful!");

      // 4. Redirect based on role
      if (role === "student") {
        window.location.href = "studentDashboard.html";
      } else if (role === "teacher") {
        window.location.href = "teacherDashboard.html";
      } else if (role === "admin") {
        window.location.href = "adminDashboard.html";
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  });
