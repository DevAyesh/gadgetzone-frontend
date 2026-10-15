"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function PromoCountdown({
  initialDays = 2,
  initialHours = 12,
  initialMinutes = 46,
  initialSeconds = 6,
}: {
  initialDays?: number;
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: initialDays,
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  useEffect(() => {
    const STORAGE_KEY = "gadgetzone_promo_target_time";
    const totalDurationMs =
      (initialDays * 86400 + initialHours * 3600 + initialMinutes * 60 + initialSeconds) * 1000;
    const now = Date.now();

    let targetTime: number;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

    if (stored) {
      const parsed = parseInt(stored, 10);
      if (parsed > now) {
        targetTime = parsed;
      } else {
        targetTime = now + totalDurationMs;
        localStorage.setItem(STORAGE_KEY, String(targetTime));
      }
    } else {
      targetTime = now + totalDurationMs;
      localStorage.setItem(STORAGE_KEY, String(targetTime));
    }

    const calculateTimeLeft = () => {
      const diff = Math.max(0, targetTime - Date.now());
      const totalSec = Math.floor(diff / 1000);

      const days = Math.floor(totalSec / (3600 * 24));
      const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [initialDays, initialHours, initialMinutes, initialSeconds]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex gap-3 md:gap-4 mb-8">
      <div className="flex flex-col items-center">
        <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
          {pad(timeLeft.days)}
        </div>
        <span className="text-[11px] mt-1.5 md:text-gray-300 text-gray-600 font-medium">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
          {pad(timeLeft.hours)}
        </div>
        <span className="text-[11px] mt-1.5 md:text-gray-300 text-gray-600 font-medium">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
          {pad(timeLeft.minutes)}
        </div>
        <span className="text-[11px] mt-1.5 md:text-gray-300 text-gray-600 font-medium">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
          {pad(timeLeft.seconds)}
        </div>
        <span className="text-[11px] mt-1.5 md:text-gray-300 text-gray-600 font-medium">Seconds</span>
      </div>
    </div>
  );
}
