import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface AgentStreamLogProps {
  logs: string[];
  isRunning: boolean;
  label?: string;
  accentClass?: string;
}

const AgentStreamLog = ({ logs, isRunning, label = "Agent Activity", accentClass = "text-primary" }: AgentStreamLogProps) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isRunning && logs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 bg-terminal-bg border border-border rounded-lg p-4 scanline"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
      </div>
      <div ref={logRef} className="max-h-48 overflow-y-auto space-y-1">
        {logs.map((log, i) => (
          <p key={i} className="text-xs font-mono text-muted-foreground">
            <span className={accentClass}>›</span> {log}
          </p>
        ))}
        {isRunning && (
          <p className={`text-xs font-mono ${accentClass}`}>
            <span className="animate-cursor">█</span> Processing...
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AgentStreamLog;
