import { useSocket } from "./context/SocketContext";
import { TeacherView } from "./pages/TeacherView";
import { StudentView } from "./pages/StudentView";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ChatPopup } from "./components/ChatPopup";

function App() {
  const { connected, role, setRole, isKicked, user, setUser } = useSocket();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [nameInput, setNameInput] = useState("");

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  };

  const handleJoin = () => {
    if (nameInput.trim()) {
      setUser({
        id: crypto.randomUUID(),
        name: nameInput.trim()
      });
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted font-medium">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (isKicked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-primary px-4 py-1.5 rounded-full text-white text-xs font-semibold mb-8">
          <Sparkles size={14} fill="currentColor" />
          Intervue Poll
        </div>

        <h1 className="text-4xl text-black mb-4 tracking-wide">
          <span className="font-normal">You've been</span> <span className="font-bold">Kicked out !</span>
        </h1>

        <p className="text-[#8B8B8B] max-w-sm mx-auto text-sm md:text-base leading-relaxed">
          Looks like the teacher had removed you from the poll system .Please Try again sometime.
        </p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">

        <div className="inline-flex items-center gap-1.5 bg-primary px-4 py-1.5 rounded-full text-white text-xs font-semibold mb-6">
          <Sparkles size={14} fill="currentColor" />
          Intervue Poll
        </div>

        <h1 className="text-4xl md:text-4xl text-black mb-3 tracking-wide">
          <span className="font-normal">Welcome to the</span> <span className="font-bold">Live Polling System</span>
        </h1>

        <p className="text-[#8B8B8B] max-w-lg mx-auto mb-12 text-sm md:text-base">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center mb-10">
          <div
            onClick={() => setSelectedRole("student")}
            className={`p-6 bg-white rounded-lg border-[1.5px] text-left cursor-pointer transition-all flex-1 ${selectedRole === "student" ? "border-[#5B58EB]" : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className="font-bold text-lg text-black mb-2">I'm a Student</div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
          </div>

          <div
            onClick={() => setSelectedRole("teacher")}
            className={`p-6 bg-white rounded-lg border-[1.5px] text-left cursor-pointer transition-all flex-1 ${selectedRole === "teacher" ? "border-[#5B58EB]" : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className="font-bold text-lg text-black mb-2">I'm a Teacher</div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <button
          disabled={!selectedRole}
          onClick={handleContinue}
          className="bg-[#6B5AEE] hover:bg-primary-hover text-white font-medium px-16 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    );
  }

  // If role is student and they haven't entered their name yet
  if (role === 'student' && !user) {
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

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <ChatPopup />
      {role === "teacher" ? <TeacherView /> : <StudentView />}
    </div>
  );
}

export default App;
