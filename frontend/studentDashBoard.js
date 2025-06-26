async function logout() {
  try {
    const response = await fetch(
      "http://localhost:2000/student/logoutStudent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

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

async function searchTeacher() {
  const searchQuery = document.getElementById("searchInput").value;
  const response = await fetch("http://localhost:2000/student/searchTeacher", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ subject: searchQuery }),
  });

  const data = await response.json();
  console.log("Search response:", data);

  const dynamicSection = document.getElementById("dynamicSection");
  const dynamicTitle = document.getElementById("dynamicTitle");
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (response.ok) {
    dynamicTitle.textContent = "Teachers Found";
    dynamicSection.style.display = "block";

    tableHead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Subject</th>
        <th>Actions</th>
      </tr>
    `;

    data.data.forEach((teacher) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${teacher.name}</td>
        <td>${teacher.subject || teacher.department}</td>
        <td>
          <button class="icon-btn" onclick="bookAppointment('${
            teacher._id
          }')">📅</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    alert(data.message || "Error searching for teachers.");
    dynamicSection.style.display = "none";
  }
}

async function bookAppointment(teacherId) {
  try {
    const response = await fetch(
      "http://localhost:2000/appointment/sendAppointment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ teacherId }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Appointment request sent successfully.");

      document.getElementById("searchInput").value = "";

      const row = document
        .querySelector(`button[onclick="bookAppointment('${teacherId}')"]`)
        .closest("tr");
      if (row) row.remove();

      // Hide the table if no rows are left
      const tableBody = document.getElementById("tableBody");
      if (tableBody.children.length === 0) {
        document.getElementById("dynamicSection").style.display = "none";
      }
    } else {
      alert(data.message || "Failed to send appointment request.");
    }
  } catch (error) {
    console.error("Appointment error:", error);
    alert("An error occurred while sending the appointment.");
  }
}

async function seeAppointments() {
  const response = await fetch(
    "http://localhost:2000/appointment/seeAppointments",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  const data = await response.json();

  const dynamicSection = document.getElementById("dynamicSection");
  const dynamicTitle = document.getElementById("dynamicTitle");
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (response.ok) {
    dynamicTitle.textContent = "Your Appointment Requests";
    dynamicSection.style.display = "block";

    tableHead.innerHTML = `
      <tr>
        <th>Teacher</th>
        <th>Date</th>
        <th>Time</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    `;

    data.appointments.forEach((app) => {
      const formattedDate = app.date
        ? new Date(app.date).toLocaleDateString("en-CA")
        : "Not set";

      const unreadCount = app.unreadCount || 0;

      const row = document.createElement("tr");
      row.innerHTML = `
  <td>${app.teacherId?.name || "Unknown"}</td>
  <td>${formattedDate}</td>
  <td>${app.timeSlot || "Not set"}</td>
  <td>${app.status}</td>
  <td>
    <button class="icon-btn" onclick="deleteAppointment('${
      app._id
    }')">🗑️</button>
    <button class="icon-btn" onclick="sendMessage('${
      app.teacherId?._id || ""
    }')">
      💬 ${
        unreadCount > 0
          ? `<span class="unread-badge">${unreadCount}</span>`
          : ""
      }
    </button>
  </td>
`;
      tableBody.appendChild(row);
    });
  } else {
    alert(data.message || "Failed to fetch appointments.");
    dynamicSection.style.display = "none";
  }
}

async function deleteAppointment(appointmentId) {
  try {
    const response = await fetch(
      "http://localhost:2000/appointment/deleteAppointment",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId: appointmentId }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("Appointment deleted:", result.message);
      seeAppointments();
    } else {
      const error = await response.json();
      console.error("Failed to delete appointment:", error.message);
    }
  } catch (err) {
    console.error("Error while deleting appointment:", err.message);
  }
}

async function sendMessage(teacherId) {
  try {
    const response = await fetch("http://localhost:2000/auth/getCurrentUser", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const result = await response.json();
    const studentId = result.user?._id;

    if (!studentId) {
      alert("Student not logged in!");
      return;
    }

    const roomId = `${studentId}-${teacherId}`;

    localStorage.setItem("studentId", studentId);
    localStorage.setItem("teacherId", teacherId);
    localStorage.setItem("roomId", roomId);

    const markAsRead = await fetch("http://localhost:2000/message/markAsRead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ teacherId, studentId }),
    });

    if (!markAsRead) {
        return res.status(400).json({
        message: "Message Not marked as read.",
      });
    }

    const roomUrl = `chatRoom.html?teacherId=${teacherId}&studentId=${studentId}`;
    window.location.href = roomUrl;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    alert("Could not start chat. Please try logging in again.");
  }
}
