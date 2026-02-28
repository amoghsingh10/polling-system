import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

const prisma = new PrismaClient();

// Track in memory
let activePollServerState: {
    pollId: string;
    endTime: number;
} | null = null;

let pollTimer: NodeJS.Timeout | null = null;

export interface ConnectedStudent {
    socketId: string;
    userId: string;
    name: string;
}
export const connectedStudents = new Map<string, ConnectedStudent>();

export class PollService {
    constructor(private io: Server) { }

    async getPollState(userId?: string) {
        if (!activePollServerState) {
            return { activePoll: null };
        }
        const poll = await prisma.poll.findUnique({
            where: { id: activePollServerState.pollId },
            include: { votes: true }
        });
        if (!poll) return { activePoll: null };

        let hasVoted = false;
        if (userId) {
            hasVoted = poll.votes.some(v => v.userId === userId);
        }
        return {
            activePoll: {
                id: poll.id,
                question: poll.question,
                options: JSON.parse(poll.options),
                endTime: activePollServerState.endTime,
                hasVoted,
                votes: poll.votes
            }
        };
    }

    async createPoll(question: string, options: string[], duration: number) {
        const formattedOptions = options.map((opt, idx) => ({ id: idx, text: opt }));
        const newPoll = await prisma.poll.create({
            data: {
                question,
                options: JSON.stringify(formattedOptions),
                duration,
            }
        });

        const endTime = Date.now() + (duration * 1000);
        activePollServerState = {
            pollId: newPoll.id,
            endTime
        };

        this.io.emit("server:poll_started", {
            id: newPoll.id,
            question: newPoll.question,
            options: formattedOptions,
            endTime
        });

        if (pollTimer) clearTimeout(pollTimer);
        pollTimer = setTimeout(() => {
            activePollServerState = null;
            this.io.emit("server:poll_ended", { pollId: newPoll.id });
        }, duration * 1000);

        return newPoll;
    }

    async getHistory() {
        const history = await prisma.poll.findMany({
            orderBy: { createdAt: "desc" },
            include: { votes: true }
        });
        return history.map(h => ({
            ...h,
            options: JSON.parse(h.options)
        }));
    }

    async joinStudent(userId: string, name: string) {
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: { id: userId, name }
            });
        }
        return user;
    }

    async castVote(userId: string, pollId: string, optionIndex: number) {
        if (!activePollServerState || activePollServerState.pollId !== pollId) {
            throw new Error("Poll is no longer active");
        }
        if (Date.now() > activePollServerState.endTime) {
            throw new Error("Time has expired");
        }

        const existingVote = await prisma.vote.findUnique({
            where: {
                pollId_userId: { pollId, userId }
            }
        });

        if (existingVote) {
            throw new Error("You have already voted");
        }

        await prisma.vote.create({
            data: {
                pollId,
                userId,
                optionIndex
            }
        });

        const updatedPoll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: { votes: true }
        });
        this.io.emit("server:vote_update", { pollId, votes: updatedPoll?.votes || [] });
    }

    addStudentConnection(socketId: string, userId: string, name: string) {
        connectedStudents.set(socketId, { socketId, userId, name });
    }

    removeStudentConnection(socketId: string) {
        connectedStudents.delete(socketId);
    }

    getParticipants() {
        // Return unique students by userId, just in case they have multiple tabs
        const unique = new Map<string, ConnectedStudent>();
        for (const student of connectedStudents.values()) {
            if (!unique.has(student.userId)) {
                unique.set(student.userId, student);
            }
        }
        return Array.from(unique.values());
    }

    getSocketIdsByUserId(userId: string) {
        const sockets: string[] = [];
        for (const [sid, student] of connectedStudents.entries()) {
            if (student.userId === userId) {
                sockets.push(sid);
            }
        }
        return sockets;
    }
}
