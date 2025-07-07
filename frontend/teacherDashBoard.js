async function logout() {
  try {
    const response = await fetch(
      "http://localhost:2000/teacher/logoutTeacher",
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

async function fetchAppointments() {
  const section = document.getElementById("appointmentSection");
  const body = document.getElementById("appointmentBody");

  document.getElementById("approvedSection").style.display = "none";
  document.getElementById("chatSection").style.display = "none";

  const headingEl = document.getElementById("appointmentSubjectHeading");
  if (headingEl) headingEl.innerText = "Subject";

  section.style.display = "block";
  body.innerHTML = "";

  try {
    const response = await fetch(
      "http://localhost:2000/appointment/seeAppointments",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();
    console.log("Appointments response:", data);

    if (response.ok && Array.isArray(data.appointments)) {
      const pendingAppointments = data.appointments.filter(
        (a) => a.status === "pending"
      );

      if (pendingAppointments.length === 0) {
        body.innerHTML = `<tr><td colspan="3">No pending appointments.</td></tr>`;
        return;
      }

      pendingAppointments.forEach((appointment) => {
        const subject =
          appointment.subject ||
          appointment.teacherId?.subject ||
          "N/A";

        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${appointment.studentId?.name || "Unknown"}</td>
          <td>${subject}</td>
          <td class="action-icons">
            <i class="fas fa-check-circle" style="color:green" onclick="showConfirmOptions(this, '${appointment._id}', '${appointment.studentId._id}')"></i>
            <i class="fas fa-times-circle" style="color:red" data-student-id="${appointment.studentId._id}" onclick="rejectAppointment('${appointment._id}', this)"></i>
          </td>
        `;

        body.appendChild(row);
      });
    } else {
      alert(data.message || "Unauthorized or failed to fetch appointments.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Something went wrong while fetching appointments.");
  }
}

function showConfirmOptions(iconEl, appointmentId, studentId) {
  const parent = iconEl.parentElement;
  parent.innerHTML = `
    <div class="dropdown">
      <input type="date" id="date-${appointmentId}" />
      <input type="time" id="time-${appointmentId}" />
      <button class="btn primary-btn" data-student-id="${studentId}" onclick="confirmAppointment('${appointmentId}', this)">Confirm</button>
    </div>
  `;
}

async function rejectAppointment(appointmentId, iconElement) {
  const studentId = iconElement.getAttribute("data-student-id");

  const response = await fetch(
    `http://localhost:2000/teacher/appointmentController`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        appoitmentStatus: false,
        studentId,
      }),
    }
  );

  const data = await response.json();

  if (response.ok) {
    const row = iconElement.closest("tr");
    row.remove();
  } else {
    alert("Failed to reject: " + data.message);
  }
}

// ✅ Updated function with AM/PM time formatting
function formatTo12Hour(time) {
  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour, 10);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

async function confirmAppointment(appointmentId, btnElement) {
  const date = document.getElementById(`date-${appointmentId}`).value;
  const rawTime = document.getElementById(`time-${appointmentId}`).value;

  if (!date || !rawTime) {
    alert("Please enter both date and time.");
    return;
  }

  const formattedTime = formatTo12Hour(rawTime);

  const studentId = btnElement.getAttribute("data-student-id");

  const response = await fetch(
    `http://localhost:2000/teacher/appointmentController`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        appoitmentStatus: true,
        studentId,
        date,
        time: formattedTime,
      }),
    }
  );

  if (response.ok) {
    const row = btnElement.closest("tr");
    row.remove();
  } else {
    const data = await response.json();
    alert("Failed to confirm: " + data.message);
  }
}

async function fetchApprovedAppointments() {
  const section = document.getElementById("approvedSection");
  const body = document.getElementById("approvedBody");

  document.getElementById("appointmentSection").style.display = "none";
  document.getElementById("chatSection").style.display = "none";

  section.style.display = "block";
  body.innerHTML = "";

  try {
    const response = await fetch(
      "http://localhost:2000/appointment/seeAppointments",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data.appointments)) {
      const approved = data.appointments.filter(
        (app) => app.status === "confirmed"
      );

      if (approved.length === 0) {
        body.innerHTML = `<tr><td colspan="4">No approved appointments.</td></tr>`;
        return;
      }

      document.getElementById("approvedDateHeading").innerText = "Date";

      // 🧠 Sort by date and time
      approved.sort((a, b) => {
        const datetimeA = new Date(`${a.date} ${a.timeSlot || "00:00"}`);
        const datetimeB = new Date(`${b.date} ${b.timeSlot || "00:00"}`);
        return datetimeA - datetimeB; // ascending order
      });

      approved.forEach((appointment) => {
        const formattedDate = appointment.date
          ? new Date(appointment.date).toLocaleDateString("en-CA")
          : "Not set";

        const time = appointment.timeSlot || "N/A";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${appointment.studentId?.name || "Unknown"}</td>
          <td>${formattedDate}</td>
          <td>${time}</td>
          <td>${appointment.status}</td>
        `;
        body.appendChild(row);
      });
    } else {
      alert(data.message || "Failed to fetch approved appointments.");
    }
  } catch (error) {
    console.error("Error fetching approved appointments:", error);
    alert("An error occurred while loading approved appointments.");
  }
}


async function fetchChatUsers() {
  const chatSection = document.getElementById("chatSection");
  const chatBody = document.getElementById("chatBody");

  document.getElementById("appointmentSection").style.display = "none";
  document.getElementById("approvedSection").style.display = "none";

  chatSection.style.display = "block";
  chatBody.innerHTML = "";

  try {
    const currentUserRes = await fetch("http://localhost:2000/auth/getCurrentUser", {
      method: "GET",
      credentials: "include",
    });
    const currentUserData = await currentUserRes.json();
    const teacherId = currentUserData.user?._id;

    const response = await fetch("http://localhost:2000/message/getStudentMessages", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    const unreadRes = await fetch("http://localhost:2000/appointment/seeAppointments", {
      method: "GET",
      credentials: "include",
    });
    const unreadData = await unreadRes.json();
    const unreadMap = {};

    if (unreadData.success) {
      unreadData.appointments.forEach((app) => {
        const roomId = app.roomId;
        unreadMap[roomId] = app.unreadCount;
      });
    }

    if (response.ok && Array.isArray(data.students)) {
      if (data.students.length === 0) {
        chatBody.innerHTML = `<tr><td colspan="3">No students to chat with.</td></tr>`;
        return;
      }

      // 🧠 Sort students by unread message count
      data.students.sort((a, b) => {
        const roomIdA = `${a._id}-${teacherId}`;
        const roomIdB = `${b._id}-${teacherId}`;
        const countA = unreadMap[roomIdA] || 0;
        const countB = unreadMap[roomIdB] || 0;
        return countB - countA;
      });

      // Render sorted students
      data.students.forEach((student) => {
        const roomId = `${student._id}-${teacherId}`;
        const unreadCount = unreadMap[roomId] || 0;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.name || "Unknown"}</td>
          <td>${student.email || "N/A"}</td>
          <td>
            <button class="btn primary-btn" onclick="goToChat('${student._id}')">
              Chat
              ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ""}
            </button>
          </td>
        `;
        chatBody.appendChild(row);
      });
    } else {
      alert(data.message || "Failed to load chat users.");
    }
  } catch (err) {
    console.error("Error fetching chat users:", err);
    alert("Something went wrong while fetching messages.");
  }
}


async function goToChat(studentId) {
  try {
    const response = await fetch("http://localhost:2000/auth/getCurrentUser", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const result = await response.json();
    const teacherId = result.user?._id;

    if (!teacherId) {
      alert("Teacher not logged in!");
      return;
    }

    await fetch("http://localhost:2000/message/markAsRead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ teacherId, studentId }),
    });

    const url = `chatRoom.html?teacherId=${teacherId}&studentId=${studentId}`;
    window.location.href = url;
  } catch (err) {
    console.error("Error redirecting to chat:", err);
    alert("Could not open chat.");
  }
}
