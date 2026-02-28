import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { PollSocketHandler } from "./src/handlers/PollSocketHandler";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    new PollSocketHandler(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
