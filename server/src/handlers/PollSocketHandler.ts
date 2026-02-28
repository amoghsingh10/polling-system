import { Server, Socket } from "socket.io";
import { PollService } from "../services/PollService";

export class PollSocketHandler {
    private pollService: PollService;

    constructor(private io: Server, private socket: Socket) {
        this.pollService = new PollService(io);
        this.registerEvents();
    }

    private registerEvents() {
        this.socket.on("client:request_state", async (userId?: string) => {
            try {
                const state = await this.pollService.getPollState(userId);
                this.socket.emit("server:state", state);
            } catch (e) {
                console.error(e);
            }
        });

        this.socket.on("teacher:create_poll", async (data: { question: string, options: string[], duration: number }) => {
            try {
                await this.pollService.createPoll(data.question, data.options, data.duration);
            } catch (e: any) {
                console.error("Error creating poll:", e);
                this.socket.emit("server:error", "Failed to create poll");
            }
        });

        this.socket.on("teacher:get_history", async () => {
            try {
                const history = await this.pollService.getHistory();
                this.socket.emit("server:history", history);
            } catch (e) {
                console.error(e);
            }
        });

        this.socket.on("student:join", async (data: { name: string, userId: string }) => {
            try {
                const user = await this.pollService.joinStudent(data.userId, data.name);
                this.pollService.addStudentConnection(this.socket.id, data.userId, data.name);
                this.socket.broadcast.emit("server:student_joined", user);
                this.io.emit("server:participants_update", this.pollService.getParticipants());
            } catch (e) {
                console.error(e);
            }
        });

        this.socket.on("student:vote", async (data: { userId: string, pollId: string, optionIndex: number }) => {
            try {
                await this.pollService.castVote(data.userId, data.pollId, data.optionIndex);
            } catch (error: any) {
                console.error("Vote error:", error.message);
                this.socket.emit("server:error", error.message || "Failed to cast vote");
            }
        });

        // Chat Bonus Feature
        this.socket.on("chat:send", (data: { sender: string, message: string, role: string }) => {
            this.io.emit("server:chat_message", { ...data, timestamp: Date.now() });
        });

        // Kick Bonus Feature
        this.socket.on("teacher:kick_user", (userId: string) => {
            const socketIds = this.pollService.getSocketIdsByUserId(userId);
            socketIds.forEach(socketId => {
                this.io.to(socketId).emit("server:kicked");
                this.io.in(socketId).disconnectSockets(true); // forcibly disconnect
            });
        });

        this.socket.on("teacher:get_participants", () => {
            this.socket.emit("server:participants_update", this.pollService.getParticipants());
        });

        this.socket.on("disconnect", () => {
            console.log(`User disconnected: ${this.socket.id}`);
            this.pollService.removeStudentConnection(this.socket.id);
            this.io.emit("server:participants_update", this.pollService.getParticipants());
        });
    }
}
