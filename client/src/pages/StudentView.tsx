import { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { usePollTimer } from "../hooks/usePollTimer";
import { Sparkles } from "lucide-react";

export const StudentView = () => {
    const { user, setUser, activePoll, submitVote } = useSocket();
    const [nameInput, setNameInput] = useState("");
    const { timeLeft, isTimeUp } = usePollTimer(activePoll);

    const handleJoin = () => {
        if (nameInput.trim()) {
            setUser({
                id: crypto.randomUUID(),
                name: nameInput.trim()
            });
        }
    };

    // 1) Name Entry View (First time only)
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center absolute inset-0 z-50">
                <div className="inline-flex items-center gap-1.5 bg-primary px-4 py-1.5 rounded-full text-white text-xs font-semibold mb-6 mt-[-10vh]">
                    <Sparkles size={14} fill="currentColor" />
                    Intervue Poll
                </div>

                <h1 className="text-4xl md:text-4xl text-black mb-3 tracking-wide">
                    <span className="font-normal">Let's</span> <span className="font-bold">Get Started</span>
                </h1>

                <p className="text-[#8B8B8B] max-w-lg mx-auto mb-10 text-sm md:text-base leading-relaxed">
                    If you're a student, you'll be able to <span className="font-bold text-black">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
                </p>

                <div className="w-full max-w-md text-left mb-10">
                    <label className="block text-sm font-medium text-black mb-2 px-1">
                        Enter your Name
                    </label>
                    <input
                        type="text"
                        className="w-full bg-[#F4F4F5] rounded-lg px-4 py-3.5 text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        placeholder="Rahul Bajaj"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        autoFocus
                    />
                </div>

                <button
                    disabled={!nameInput.trim()}
                    onClick={handleJoin}
                    className="bg-[#6B5AEE] hover:bg-[#5B4AD9] text-white font-medium px-16 py-3 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        );
    }

    // 2) Waiting View (No active poll)
    if (!activePoll) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
                <div className="font-bold text-2xl tracking-tight flex items-center gap-1 absolute top-6 left-6">
                    intervu<span className="text-primary">e</span>
                </div>
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-bold mb-2">Wait for the teacher to ask questions...</h2>
                <p className="text-muted">You will see the question here automatically.</p>
            </div>
        );
    }

    // 3) Active Poll View
    const hasVoted = activePoll.hasVoted;

    return (
        <div className="max-w-2xl mx-auto w-full p-6 mt-10 relative">
            <div className="font-bold text-2xl tracking-tight flex items-center gap-1 mb-12">
                intervu<span className="text-primary">e</span>
            </div>

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{activePoll.question}</h2>
                </div>

                {/* Timer Sync Display */}
                {timeLeft !== null && !hasVoted && (
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted font-medium mb-1">Time remaining</span>
                        <div className="bg-gray-100 text-primary font-bold px-4 py-2 rounded-lg text-xl tabular-nums tracking-wider shadow-inner">
                            00:{timeLeft.toString().padStart(2, "0")}
                        </div>
                    </div>
                )}
            </div>

            <div className="card p-6 space-y-4 shadow-lg shadow-gray-200/50">
                {activePoll.options.map((opt: any, index: number) => {

                    if (hasVoted || isTimeUp) {
                        // Voted / Time Up View (No percentages shown to students)
                        return (
                            <div key={opt.id} className="relative bg-[#F2F2F2] rounded-lg h-14 overflow-hidden flex items-center opacity-70">
                                <div className="relative z-10 w-full flex justify-between items-center px-4 font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs text-primary shadow-sm">
                                            {index + 1}
                                        </div>
                                        <span className="text-text">{opt.text}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Voting View
                    return (
                        <button
                            key={opt.id}
                            onClick={() => submitVote(activePoll.id, opt.id)}
                            className="w-full text-left bg-white border-2 border-gray-100 hover:border-primary/50 hover:bg-primary/5 rounded-xl h-14 px-4 font-medium flex items-center gap-3 transition-colors group cursor-pointer text-lg"
                        >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs group-hover:bg-primary group-hover:text-white transition-colors bg-gray-100 text-muted shadow-sm">
                                {index + 1}
                            </div>
                            <span>{opt.text}</span>
                        </button>
                    );
                })}
            </div>

            {(hasVoted || isTimeUp) && (
                <p className="text-center mt-8 text-muted font-medium text-lg">
                    Wait for the teacher to ask questions...
                </p>
            )}
        </div>
    );
};
