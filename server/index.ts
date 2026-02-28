import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
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

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve the React app for any unhandled routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server & Client running on port ${PORT}`);
});
