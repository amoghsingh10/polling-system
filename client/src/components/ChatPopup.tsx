import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const ChatPopup = () => {
    const { role, participants, messages, sendMessage, kickUser, user } = useSocket();

    // Deduplicate participants by userId to prevent any UI artifacts
    const uniqueParticipants = Array.from(new Map(participants.map(p => [p.userId, p])).values());
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (isOpen && activeTab === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, activeTab]);

    if (!role) return null; // Don't show if role isn't selected

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage("");
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white rounded-lg shadow-2xl w-80 md:w-96 overflow-hidden border border-gray-100 flex flex-col h-[500px]">
                    {/* Header Details */}
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'chat' ? 'text-[#6B5AEE] border-b-2 border-[#6B5AEE]' : 'text-gray-500 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            Chat
                        </button>
                        {role === 'teacher' && (
                            <button
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'participants' ? 'text-[#6B5AEE] border-b-2 border-[#6B5AEE]' : 'text-gray-500 hover:bg-gray-50'}`}
                                onClick={() => setActiveTab('participants')}
                            >
                                Participants
                            </button>
                        )}
                        <button
                            className="px-4 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                        {activeTab === 'chat' ? (
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm mt-4">No messages yet. Start the conversation!</p>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMine = role === 'teacher' ? msg.role === 'teacher' : msg.sender === user?.name;
                                        return (
                                            <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                <span className="text-xs text-gray-500 mb-1 px-1">
                                                    {isMine ? 'You' : msg.sender}
                                                </span>
                                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMine ? 'bg-[#6B5AEE] text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                                {uniqueParticipants.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm p-4">No students have joined yet.</p>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Name</th>
                                                <th className="px-4 py-3 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uniqueParticipants.map((p) => (
                                                <tr key={p.userId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => kickUser(p.userId)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                                                        >
                                                            Kick out
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    {activeTab === 'chat' && (
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B5AEE]"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-[#6B5AEE] text-white min-w-[60px] rounded-full text-sm font-medium disabled:opacity-50 transition-opacity"
                            >
                                Send
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-[#6B5AEE] hover:bg-[#5B4AD9] text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                >
                    <MessageSquare size={24} />
                    {messages.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                            {messages.length}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};
