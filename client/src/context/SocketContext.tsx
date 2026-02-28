import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface GlobalState {
    socket: Socket | null;
    activePoll: any | null;
    history: any[];
    connected: boolean;
    role: 'teacher' | 'student' | null;
    user: { id: string; name: string } | null;
    isKicked: boolean;
    participants: { userId: string; name: string }[];
    messages: { sender: string; message: string; role: string; timestamp: number }[];
    setRole: (role: 'teacher' | 'student') => void;
    setUser: (user: { id: string; name: string } | null) => void;
    createPoll: (question: string, options: string[], duration: number) => void;
    submitVote: (pollId: string, optionIndex: number) => void;
    sendMessage: (message: string) => void;
    kickUser: (userId: string) => void;
}

const SocketContext = createContext<GlobalState | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activePoll, setActivePoll] = useState<any | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [connected, setConnected] = useState(false);
    const [role, setRoleState] = useState<'teacher' | 'student' | null>(null);
    const [user, setUserState] = useState<{ id: string; name: string } | null>(() => {
        const saved = localStorage.getItem('poll_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [participants, setParticipants] = useState<{ userId: string; name: string }[]>([]);
    const [messages, setMessages] = useState<{ sender: string; message: string; role: string; timestamp: number }[]>([]);
    const [isKicked, setIsKicked] = useState(false);

    const setRole = (newRole: 'teacher' | 'student') => {
        setRoleState(newRole);
    };

    const setUser = (newUser: { id: string; name: string } | null) => {
        if (newUser) {
            localStorage.setItem('poll_user', JSON.stringify(newUser));
            setUserState(newUser);
            setIsKicked(false);
            if (socket) {
                socket.emit('student:join', { name: newUser.name, userId: newUser.id });
            }
        } else {
            localStorage.removeItem('poll_user');
            setUserState(null);
        }
    };

    useEffect(() => {
        // If we are in production, `window.location.origin` will be the Render URL!
        const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001';
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setConnected(true);
            newSocket.emit('client:request_state', user?.id);
            if (role === 'teacher') {
                newSocket.emit('teacher:get_history');
            }
            if (role === 'student' && user) {
                newSocket.emit('student:join', { name: user.name, userId: user.id });
            }
        });

        newSocket.on('disconnect', () => setConnected(false));

        newSocket.on('server:state', (state) => {
            setActivePoll(state.activePoll);
        });

        newSocket.on('server:poll_started', (poll) => {
            setActivePoll(poll);
        });

        newSocket.on('server:poll_ended', () => {
            setActivePoll(null);
            if (role === 'teacher') {
                newSocket.emit('teacher:get_history');
            }
        });

        newSocket.on('server:history', (hist) => setHistory(hist));

        newSocket.on('server:vote_update', ({ pollId, votes }) => {
            setActivePoll((prev: any) => {
                if (prev && prev.id === pollId) {
                    return { ...prev, votes };
                }
                return prev;
            });
        });

        newSocket.on('server:error', (errorMsg) => {
            toast.error(errorMsg);
            setActivePoll((prev: any) => prev ? { ...prev, hasVoted: false } : prev);
        });

        // Bonus Features Handlers
        newSocket.on('server:participants_update', (data) => {
            setParticipants(data);
        });

        newSocket.on('server:chat_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        newSocket.on('server:kicked', () => {
            toast.error("You have been kicked out by the teacher.");
            localStorage.removeItem('poll_user');
            setUserState(null);
            setIsKicked(true);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [role, user?.id]);

    const createPoll = (question: string, options: string[], duration: number) => {
        socket?.emit('teacher:create_poll', { question, options, duration });
    };

    const submitVote = (pollId: string, optionIndex: number) => {
        if (!user) return;
        socket?.emit('student:vote', { userId: user.id, pollId, optionIndex });
        // Optimistically update ui state
        setActivePoll((prev: any) => prev ? { ...prev, hasVoted: true } : prev);
    };

    const sendMessage = (message: string) => {
        if (!message.trim()) return;
        const sender = role === 'teacher' ? 'Teacher' : (user?.name || 'Unknown');
        socket?.emit('chat:send', { sender, message, role });
    };

    const kickUser = (userId: string) => {
        socket?.emit('teacher:kick_user', userId);
    };

    return (
        <SocketContext.Provider value={{ socket, activePoll, history, connected, role, setRole, user, setUser, participants, messages, createPoll, submitVote, sendMessage, kickUser, isKicked }}>
            {children}
        </SocketContext.Provider>
    );
};
