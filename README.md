# 📚 Student-Teacher Appointment Booking System

A full-stack role-based web application that allows **students** to search for teachers and book appointments, while **teachers** can manage those requests. An **admin** can monitor and manage all users. Includes real-time chat and dynamic appointment tracking.

---

## 🚀 Features

- 👨‍🎓 Student Role:
  - Register & login
  - Search for teachers
  - Send appointment requests
  - Chat with teachers in real time

- 👩‍🏫 Teacher Role:
  - Register & login
  - View and manage incoming appointments
  - Accept or reject student requests
  - Chat with students in real time

- 🛠 Admin Role:
  - View all students and teachers
  - Add, update, or delete teacher records

- 💬 Real-Time Chat:
  - One-on-one chat with pin/edit/delete message options
  - Message read/unread tracking with live updates

---

## 🛠️ Tech Stack

### Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO (for real-time messaging)
- Cookie-parser

### Frontend:
- HTML, CSS, JavaScript (Vanilla)
- Bootstrap (for basic styling)

---

## 📁 Project Structure

```
student-Teacher-appointment-Booking-system/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   ├── app.js
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── login.html
│   ├── register.html
│   ├── studentDashboard.html
│   ├── teacherDashboard.html
│   ├── adminDashboard.html
│   ├── chatRoom.html
│   ├── css/
│   ├── js/
│   └── assets/
│
└── README.md
```

---

## 🌐 How It Works

1. **Student** logs in → searches for a teacher → sends appointment → chats after confirmation  
2. **Teacher** logs in → sees all appointment requests → accepts/rejects → chats with students  
3. **Admin** logs in → views all users → manages teacher accounts  
4. **Real-time chat** available post-confirmation

---

## ⚙️ Setup Instructions

### Prerequisites:
- Node.js
- MongoDB

### Install dependencies

```
npm install
```

### Environment setup

Create `.env` file in `backend/`

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appointmentSystem
```

### Run the server

```
npm start
```

> Open the `frontend/*.html` files manually in your browser

---

## 🧪 API Routes Overview

| Method | Endpoint                    | Role     | Description                      |
|--------|-----------------------------|----------|----------------------------------|
| POST   | /auth/register              | All      | Register student or teacher      |
| POST   | /auth/login                 | All      | Login with credentials           |
| GET    | /teacher/search             | Student  | Search teachers                  |
| POST   | /appointment/sendAppointment| Student  | Book appointment with teacher    |
| GET    | /appointment/seeAppointments| Teacher  | View incoming requests           |          
| POST   | /appointment/confirm        | Teacher  | Confirm/reject appointment       |
| GET    | /admin/students             | Admin    | View all students                |
| GET    | /admin/teachers             | Admin    | View all teachers                |
| POST   | /admin/teacher/add          | Admin    | Add a new teacher                |
| PUT    | /admin/teacher/update/:id   | Admin    | Update a teacher                 |
| DELETE | /admin/teacher/delete/:id   | Admin    | Delete a teacher                 |

---

## 💬 Chat Features

- Message pin/edit/delete
- Unread message counter
- Room-based real-time Socket.IO
- Each chat room is formed as: `studentId-teacherId`

---

## 📦 Dependencies

- express  
- mongoose  
- socket.io  
- cookie-parser  
- dotenv  
- cors  
- nodemon (dev)

---

## 🤝 Contributing

```
git clone https://github.com/RohitBCA456/student-Teacher-appointment-Booking-system.git
cd student-Teacher-appointment-Booking-system
npm install
```

---

## 📄 License

MIT License © [Rohit Yadav](https://github.com/RohitBCA456)
