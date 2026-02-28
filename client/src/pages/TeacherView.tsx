import { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { Eye, Plus, Sparkles } from "lucide-react";

export const TeacherView = () => {
    const { activePoll, createPoll, history } = useSocket();
    const [view, setView] = useState<"create" | "history">("create");

    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
    const [duration, setDuration] = useState(60); // default 60s

    const handleAddOption = () => {
        if (options.length < 4) {
            setOptions([...options, { text: "", isCorrect: false }]);
        }
    };

    const handleCreate = () => {
        const validOptions = options.filter(o => o.text.trim());
        if (!question.trim() || validOptions.length < 2) {
            alert("Please provide a question and at least 2 options.");
            return;
        }
        createPoll(question, validOptions.map(o => o.text), duration);
        setQuestion("");
        setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
    };

    // 1) Active Poll View
    if (activePoll) {
        const totalVotes = activePoll.votes?.length || 0;

        return (
            <div className="max-w-3xl mx-auto w-full p-6">
                <div className="flex justify-between items-center mb-12">
                    <div className="font-bold text-2xl tracking-tight flex items-center gap-1">
                        intervu<span className="text-primary">e</span>
                    </div>
                    <button
                        onClick={() => setView("history")}
                        className="bg-primary text-white px-5 py-2 rounded-full font-medium shadow-md shadow-primary/30 flex items-center gap-2 hover:bg-primary-hover transition-colors"
                    >
                        <Eye size={18} /> View Poll history
                    </button>
                </div>

                <div className="mt-16 relative">
                    {/* Decorative background circle */}
                    <div className="absolute -left-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10"></div>

                    <h2 className="text-2xl font-bold mb-8">{activePoll.question}</h2>

                    <div className="card border-0 shadow-lg shadow-gray-200/50">
                        <div className="bg-gray-600 text-white font-medium py-3 px-6 rounded-t-2xl">
                            {activePoll.question}
                        </div>
                        <div className="p-6 space-y-4">
                            {activePoll.options.map((opt: any, index: number) => {
                                const voteCount = activePoll.votes?.filter((v: any) => v.optionIndex === opt.id).length || 0;
                                const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);

                                return (
                                    <div key={opt.id} className="relative bg-[#F2F2F2] rounded-lg h-14 overflow-hidden flex items-center">
                                        {/* Progress Bar fill */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 bg-primary/80 transition-all duration-500 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />

                                        <div className="relative z-10 w-full flex justify-between items-center px-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs text-primary shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <span className={percentage > 50 ? "text-white" : "text-text"}>{opt.text}</span>
                                            </div>
                                            <span className={percentage > 50 ? "text-white" : "text-text"}>{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button disabled className="bg-primary/50 text-white px-6 py-3 rounded-xl font-medium cursor-not-allowed flex items-center gap-2">
                            <Plus size={18} /> Ask a new question
                        </button>
                        <p className="w-full text-right mt-2 text-sm text-muted">Wait for current poll to end</p>
                    </div>
                </div>
            </div>
        );
    }

    // 2) History View
    if (view === "history") {
        return (
            <div className="max-w-3xl mx-auto w-full p-6">
                <div className="flex justify-between items-center mb-12">
                    <div className="font-bold text-2xl tracking-tight flex items-center gap-1 cursor-pointer" onClick={() => setView("create")}>
                        intervu<span className="text-primary">e</span>
                    </div>
                    <button
                        onClick={() => setView("create")}
                        className="bg-gray-100 text-text px-5 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                <h1 className="text-3xl font-bold mb-8">Poll History</h1>

                {history.length === 0 ? (
                    <p className="text-muted">No polls have been created yet.</p>
                ) : (
                    <div className="space-y-8">
                        {history.map((poll) => {
                            const tVotes = poll.votes?.length || 0;
                            return (
                                <div key={poll.id} className="card border-0 shadow-lg shadow-gray-200/50">
                                    <div className="bg-gray-600 text-white font-medium py-3 px-6 rounded-t-2xl">
                                        {poll.question}
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {poll.options.map((opt: any, index: number) => {
                                            const vCount = poll.votes?.filter((v: any) => v.optionIndex === opt.id).length || 0;
                                            const pct = tVotes === 0 ? 0 : Math.round((vCount / tVotes) * 100);
                                            return (
                                                <div key={opt.id} className="relative bg-[#F2F2F2] rounded-lg h-12 overflow-hidden flex items-center">
                                                    <div className="absolute left-0 top-0 bottom-0 bg-primary/80" style={{ width: `${pct}%` }} />
                                                    <div className="relative z-10 w-full flex justify-between items-center px-4 font-medium text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs text-primary shadow-sm">{index + 1}</div>
                                                            <span className={pct > 50 ? "text-white" : "text-text"}>{opt.text}</span>
                                                        </div>
                                                        <span className={pct > 50 ? "text-white" : "text-text"}>{pct}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // 3) Create View
    if (view === "create") {
        return (
            <div className="max-w-4xl mx-auto w-full p-8 mt-4 bg-white min-h-screen">
                <div className="inline-flex items-center gap-1.5 bg-primary px-3 py-1 rounded-full text-white text-[11px] font-semibold mb-6 shadow-sm">
                    <Sparkles size={12} fill="currentColor" />
                    Intervue Poll
                </div>

                <h1 className="text-4xl text-black mb-3 tracking-wide">
                    <span className="font-normal">Let's</span> <span className="font-bold">Get Started</span>
                </h1>
                <p className="text-[#8B8B8B] mb-12 text-[15px] leading-relaxed max-w-2xl">
                    you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                </p>

                <div className="space-y-8">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                        <label className="text-lg font-bold text-black">Enter your question</label>
                        <div className="flex items-center bg-[#F2F2F2] rounded-md px-3 py-2 text-sm font-medium">
                            <select
                                className="bg-transparent outline-none cursor-pointer text-black"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                            >
                                <option value={30}>30 seconds</option>
                                <option value={60}>60 seconds</option>
                                <option value={90}>90 seconds</option>
                                <option value={120}>120 seconds</option>
                            </select>
                        </div>
                    </div>

                    <textarea
                        className="w-full bg-[#F2F2F2] rounded-lg p-5 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary min-h-[160px] resize-none text-[15px]"
                        placeholder="Rahul Bajaj"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        maxLength={100}
                    />
                    <div className="text-right text-sm font-medium -mt-6 pr-4 text-black">{question.length}/100</div>

                    <div className="flex flex-col md:flex-row gap-12 mt-8">
                        {/* Options Column */}
                        <div className="flex-1 space-y-4">
                            <label className="block text-base font-bold text-black mb-4">Edit Options</label>

                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#6B5AEE] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-[#F2F2F2] rounded-md px-4 py-3.5 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary text-[15px]"
                                        placeholder="Rahul Bajaj"
                                        value={opt.text}
                                        onChange={(e) => {
                                            const newOpts = [...options];
                                            newOpts[idx].text = e.target.value;
                                            setOptions(newOpts);
                                        }}
                                    />
                                </div>
                            ))}

                            {options.length < 4 && (
                                <div className="pl-12 pt-2">
                                    <button
                                        onClick={handleAddOption}
                                        className="text-[#6B5AEE] font-medium text-sm border border-[#6B5AEE] rounded-md px-4 py-2 hover:bg-[#6B5AEE]/5 transition-colors"
                                    >
                                        + Add More option
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Correctness Column */}
                        <div className="w-48 space-y-4">
                            <label className="block text-base font-bold text-black mb-4">Is it Correct?</label>

                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-6 h-[52px]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center ${opt.isCorrect ? 'border-[#6B5AEE]' : 'border-gray-300'}`}>
                                            {opt.isCorrect && <div className="w-3 h-3 rounded-full bg-[#6B5AEE]" />}
                                        </div>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            checked={opt.isCorrect}
                                            onChange={() => {
                                                const newOpts = [...options];
                                                newOpts[idx].isCorrect = true;
                                                setOptions(newOpts);
                                            }}
                                        />
                                        <span className="text-sm font-bold text-black">Yes</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center ${!opt.isCorrect ? 'border-[#6B5AEE]' : 'border-gray-300'}`}>
                                            {!opt.isCorrect && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                        </div>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            checked={!opt.isCorrect}
                                            onChange={() => {
                                                const newOpts = [...options];
                                                newOpts[idx].isCorrect = false;
                                                setOptions(newOpts);
                                            }}
                                        />
                                        <span className="text-sm font-bold text-black">No</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-12 pt-6 flex justify-between items-center">
                        <button
                            onClick={() => setView("history")}
                            className="text-[#6B5AEE] font-medium flex items-center gap-2 hover:underline"
                        >
                            <Eye size={18} /> View Poll history
                        </button>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setQuestion("");
                                    setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
                                    setDuration(60);
                                }}
                                className="px-6 py-3 font-medium text-muted hover:text-text"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="bg-[#6B5AEE] hover:bg-[#5B4AD9] text-white font-medium px-10 py-3 rounded-full transition-colors shadow-sm"
                            >
                                Ask Question
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
