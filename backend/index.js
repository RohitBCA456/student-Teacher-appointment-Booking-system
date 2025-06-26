import { app, server } from "./app.js";
import { connectDB } from "./database/db.js";

connectDB().then(() => {
  app.on("Error", (error) => {
    console.error("Server encountered an error:", error);
  });
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});

server.listen(process.env.SOCKET_PORT, () => {
  console.log(`Socket server is running on port ${process.env.SOCKET_PORT}`);
});