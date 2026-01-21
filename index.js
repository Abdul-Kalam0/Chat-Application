import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import Message from "./models/Message.js";

// const CLIENT = "http://localhost:3000";
const CLIENT = "https://chat-application-001.vercel.app";

const app = express();
app.use(cors({ origin: CLIENT }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CLIENT },
  transports: ["websocket"],
});

// username -> Set<socketId>
const onlineUsers = new Map();

// ---------- SOCKET ----------
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join", (username) => {
    if (!username) return;

    socket.username = username;
    socket.join(username);

    if (!onlineUsers.has(username)) {
      onlineUsers.set(username, new Set());
    }
    onlineUsers.get(username).add(socket.id);

    emitOnlineUsers();
  });

  socket.on("typing", ({ sender, receiver }) => {
    io.to(receiver).emit("typing", { sender });
  });

  socket.on("stop_typing", ({ sender, receiver }) => {
    io.to(receiver).emit("stop_typing", { sender });
  });

  socket.on("send_message", async (data, ack) => {
    const { sender, receiver, message } = data;
    if (!sender || !receiver || !message) return;

    const saved = await Message.create({ sender, receiver, message });

    io.to(sender).emit("receive_message", saved);
    io.to(receiver).emit("receive_message", saved);

    ack?.({ success: true });
  });

  socket.on("disconnect", () => {
    const username = socket.username;
    if (!username) return;

    const set = onlineUsers.get(username);
    if (!set) return;

    set.delete(socket.id);
    if (set.size === 0) onlineUsers.delete(username);

    emitOnlineUsers();
  });
});

function emitOnlineUsers() {
  const list = {};
  for (const [u, sockets] of onlineUsers.entries()) {
    list[u] = sockets.size > 0;
  }
  io.emit("online_users", list);
}

// ---------- REST ----------
app.use("/auth", authRoutes);

app.get("/users", async (req, res) => {
  const users = await User.find({
    username: { $ne: req.query.currentUser },
  }).select("_id username");
  res.json(users);
});

app.get("/messages", async (req, res) => {
  const { sender, receiver } = req.query;
  const messages = await Message.find({
    $or: [
      { sender, receiver },
      { sender: receiver, receiver: sender },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

export default server;
