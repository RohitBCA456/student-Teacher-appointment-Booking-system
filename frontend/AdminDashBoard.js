async function logout() {
  try {
    const response = await fetch("http://localhost:2000/admin/logoutAdmin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Logged out successfully");
      localStorage.clear();
      window.location.href = "login.html";
    } else {
      alert(data.message || "Logout failed: " + data.message);
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("An error occurred during logout.");
  }
}

async function showTeachers() {
  document.getElementById("teacherTableSection").style.display = "block";
  document.getElementById("addTeacherSection").style.display = "none";
  document.getElementById("studentTableSection").style.display = "none";

  const tbody = document.getElementById("teacherTableBody");
  tbody.innerHTML = "";

  try {
    const response = await fetch("http://localhost:2000/admin/getAllTeachers", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (data.teachers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No teachers found.</td></tr>`;
        return;
      }

      data.teachers.forEach((teacher) => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", teacher._id);

        row.innerHTML = `
          <td class="editable">${teacher.name}</td>
          <td class="editable">${teacher.email}</td>
          <td class="editable">${teacher.department || ""}</td>
          <td class="editable">${teacher.subject || ""}</td>
          <td>
            <i class="fas fa-edit icon-btn" title="Edit" onclick="enableEdit(this)"></i>
            <i class="fas fa-save icon-btn" style="color: green; display: none;" title="Save" onclick="saveEdit(this)"></i>
            <i class="fas fa-trash icon-btn" style="color: red" title="Delete Teacher" onclick="deleteTeacher('${
              teacher._id
            }')"></i>
          </td>
        `;

        tbody.appendChild(row);
      });
    } else {
      alert(data.message || "Failed to fetch teachers.");
    }
  } catch (error) {
    console.error("Error fetching teachers:", error);
    alert("An error occurred while loading teachers.");
  }
}

function enableEdit(editIcon) {
  const row = editIcon.closest("tr");
  const cells = row.querySelectorAll(".editable");

  cells.forEach((cell) => {
    const text = cell.textContent.trim();
    cell.innerHTML = `<input type="text" value="${text}" />`;
  });

  // Toggle icon buttons
  editIcon.style.display = "none";
  row.querySelector(".fa-save").style.display = "inline-block";
}

async function saveEdit(saveIcon) {
  const row = saveIcon.closest("tr");
  const id = row.getAttribute("data-id");
  const inputs = row.querySelectorAll("input");

  const updatedData = {
    name: inputs[0].value,
    email: inputs[1].value,
    department: inputs[2].value,
    subject: inputs[3].value,
  };

  try {
    const response = await fetch(
      `http://localhost:2000/admin/editTeacherDetails/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      // Re-render row with updated values
      row.querySelectorAll(".editable").forEach((cell, index) => {
        cell.textContent = Object.values(updatedData)[index];
      });

      row.querySelector(".fa-edit").style.display = "inline-block";
      row.querySelector(".fa-save").style.display = "none";
    } else {
      alert(data.message || "Update failed.");
    }
  } catch (err) {
    console.error("Error saving teacher:", err);
    alert("An error occurred while updating teacher details.");
  }
}

async function showStudents() {
  document.getElementById("studentTableSection").style.display = "block";
  document.getElementById("addTeacherSection").style.display = "none";
  document.getElementById("teacherTableSection").style.display = "none";

  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = ""; // Clear old data

  try {
    const response = await fetch("http://localhost:2000/admin/getAllStudents", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (data.students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No students found.</td></tr>`;
        return;
      }

      data.students.forEach((student) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.department || "N/A"}</td>
          <td>
            <i class="fas fa-trash icon-btn" style="color: red" title="Delete Student" onclick="deleteStudent('${
              student._id
            }')"></i>
          </td>
        `;

        tbody.appendChild(row);
      });
    } else {
      alert(data.message || "Failed to fetch students.");
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    alert("An error occurred while loading students.");
  }
}

async function deleteStudent(studentId) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    const response = await fetch(
      `http://localhost:2000/admin/deleteStudent/${studentId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Student deleted successfully.");
      showStudents(); // Refresh the table
    } else {
      alert(data.message || "Failed to delete student.");
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    alert("An error occurred while deleting the student.");
  }
}

async function deleteTeacher(teacherId) {
  if (!confirm("Are you sure you want to delete this teacher?")) return;

  try {
    const response = await fetch(
      `http://localhost:2000/admin/deleteTeacher/${teacherId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Teacher deleted successfully.");
      showTeachers(); // Refresh the table
    } else {
      alert(data.message || "Failed to delete teacher.");
    }
  } catch (error) {
    console.error("Error deleting teacher:", error);
    alert("An error occurred while deleting the teacher.");
  }
}

function showAddTeacherForm() {
  document.getElementById("addTeacherSection").style.display = "block";
  document.getElementById("teacherTableSection").style.display = "none";
  document.getElementById("studentTableSection").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addTeacherForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("teacherName").value.trim();
      const email = document.getElementById("teacherEmail").value.trim();
      const password = document.getElementById("teacherPassword").value.trim();
      const department = document
        .getElementById("teacherDepartment")
        .value.trim();
      const subject = document.getElementById("teacherSubject").value.trim();

      try {
        const response = await fetch("http://localhost:2000/admin/addTeacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password, department, subject }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert("Teacher added successfully.");
          form.reset();
          document.getElementById("addTeacherSection").style.display = "none";
          showTeachers();
        } else {
          alert(data.message || "Error adding teacher.");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong while adding teacher.");
      }
    });
  }
});
