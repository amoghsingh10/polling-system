import { useState, useEffect } from "react";

export const usePollTimer = (activePoll: any) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!activePoll) {
            setTimeLeft(null);
            return;
        }

        const calculateTime = () => {
            const remaining = Math.max(0, Math.floor((activePoll.endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
        };

        // Calculate immediately then every second
        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [activePoll]);

    return {
        timeLeft,
        isTimeUp: timeLeft === 0,
    };
};
