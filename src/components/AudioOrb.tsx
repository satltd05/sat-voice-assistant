import React, { useEffect, useRef } from "react";
import { Mic, Volume2, Sparkles, Loader2, Square } from "lucide-react";

interface AudioOrbProps {
  state: "idle" | "listening" | "thinking" | "speaking";
  onMicClick: () => void;
  onStopSpeaking?: () => void;
  isMicSupported: boolean;
  language: "en" | "fr";
}

export const AudioOrb: React.FC<AudioOrbProps> = ({
  state,
  onMicClick,
  onStopSpeaking,
  isMicSupported,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let step = 0;

    const render = () => {
      step += 0.035;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Amplitude based on state
      let baseRadius = 58;
      let waveCount = 3;
      let amplitude = 2;

      if (state === "speaking") {
        amplitude = 10 + Math.sin(step * 2) * 5;
        waveCount = 4;
      } else if (state === "listening") {
        amplitude = 6 + Math.sin(step * 3) * 4;
        waveCount = 3;
      } else if (state === "thinking") {
        amplitude = 4 + Math.sin(step * 1.5) * 2;
      }

      // Draw subtle orbital rings
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        const rOffset = (i * 12) + Math.sin(step + i) * amplitude;
        const currentRadius = baseRadius + rOffset;

        ctx.arc(centerX, centerY, Math.max(10, currentRadius), 0, Math.PI * 2);
        
        if (state === "speaking") {
          ctx.strokeStyle = `rgba(164, 134, 94, ${0.45 - i * 0.1})`; // Champagne gold
          ctx.lineWidth = 1.6;
        } else if (state === "listening") {
          ctx.strokeStyle = `rgba(180, 83, 60, ${0.5 - i * 0.12})`; // Warm terracotta
          ctx.lineWidth = 1.8;
        } else if (state === "thinking") {
          ctx.strokeStyle = `rgba(130, 120, 110, ${0.4 - i * 0.1})`; // Warm slate taupe
          ctx.lineWidth = 1.4;
        } else {
          ctx.strokeStyle = `rgba(195, 185, 170, ${0.35 - i * 0.1})`; // Soft cream taupe
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();
      }

      // Center sphere gradient
      const gradient = ctx.createRadialGradient(
        centerX - 8,
        centerY - 8,
        5,
        centerX,
        centerY,
        baseRadius - 10
      );

      if (state === "speaking") {
        gradient.addColorStop(0, "#F5EAD8");
        gradient.addColorStop(0.6, "#D4B98E");
        gradient.addColorStop(1, "#A88B5E");
      } else if (state === "listening") {
        gradient.addColorStop(0, "#FCE9E4");
        gradient.addColorStop(0.6, "#E89F8F");
        gradient.addColorStop(1, "#B4533C");
      } else if (state === "thinking") {
        gradient.addColorStop(0, "#F2EFE9");
        gradient.addColorStop(0.6, "#C5BEB3");
        gradient.addColorStop(1, "#8F877B");
      } else {
        gradient.addColorStop(0, "#FAF7F2");
        gradient.addColorStop(0.5, "#E8E0D2");
        gradient.addColorStop(1, "#C9BEAC");
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius - 10, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(40, 30, 20, 0.08)";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state]);

  return (
    <div className="flex flex-col items-center justify-center select-none py-4">
      {/* Visualizer Canvas & Central Interactive Trigger */}
      <div className="relative flex items-center justify-center w-52 h-52">
        <canvas
          ref={canvasRef}
          width={208}
          height={208}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Central Action Button */}
        <button
          onClick={state === "speaking" ? onStopSpeaking : onMicClick}
          aria-label={
            state === "speaking"
              ? "Stop Sat speaking"
              : state === "listening"
              ? "Stop listening"
              : "Activate voice microphone"
          }
          className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C7654] ${
            state === "listening"
              ? "bg-[#B4533C] text-white shadow-lg scale-105"
              : state === "speaking"
              ? "bg-[#8C7654] text-white shadow-md hover:bg-[#786343]"
              : state === "thinking"
              ? "bg-[#7A7367] text-white shadow"
              : "bg-[#25221E] text-[#FBF9F5] hover:bg-[#38342E] shadow-md hover:scale-102"
          }`}
        >
          {state === "listening" && (
            <>
              <Square className="w-6 h-6 fill-current animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase font-sans-ui mt-1 font-medium">
                {language === "fr" ? "Écoute..." : "Listening"}
              </span>
            </>
          )}

          {state === "speaking" && (
            <>
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase font-sans-ui mt-1 font-medium">
                {language === "fr" ? "Parle..." : "Speaking"}
              </span>
            </>
          )}

          {state === "thinking" && (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-[#FBF9F5]" />
              <span className="text-[10px] tracking-widest uppercase font-sans-ui mt-1 font-medium">
                {language === "fr" ? "Réflexion..." : "Thinking"}
              </span>
            </>
          )}

          {state === "idle" && (
            <>
              <Mic className="w-6 h-6" />
              <span className="text-[10px] tracking-widest uppercase font-sans-ui mt-1 font-medium opacity-90">
                {language === "fr" ? "Parler" : "Tap to Speak"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Status Descriptor */}
      <div className="mt-3 text-center">
        <p className="text-xs uppercase tracking-widest text-[#7D7569] font-sans-ui font-medium">
          {state === "idle" && (language === "fr" ? "Sat est prête à échanger" : "Sat is ready to converse")}
          {state === "listening" && (language === "fr" ? "Parlez maintenant, Sat vous écoute..." : "Speak now, Sat is listening...")}
          {state === "thinking" && (language === "fr" ? "Formulation de la réponse vocale..." : "Composing voice answer...")}
          {state === "speaking" && (language === "fr" ? "Sat vous répond (Voix féminine)" : "Sat speaking (Deep female voice)")}
        </p>
        <p className="text-[11px] text-[#A39988] mt-0.5">
          {language === "fr" ? "Accent français parisien" : "American accent · Natural cadence"}
        </p>
      </div>
    </div>
  );
};
