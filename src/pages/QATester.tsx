import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, FileText, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface TestStep {
  action: string;
  result: "pass" | "fail" | "pending";
  timestamp?: string;
  detail?: string;
}

interface TestReport {
  summary: string;
  status: "pass" | "fail" | "partial";
  detailed_steps: TestStep[];
  issues?: string[];
}

const QATester = () => {
  const [appUrl, setAppUrl] = useState("");
  const [testPrompt, setTestPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [report, setReport] = useState<TestReport | null>(null);

  const runTest = async () => {
    if (!appUrl.trim() || !testPrompt.trim()) return;
    setIsRunning(true);
    setStreamLog([]);
    setReport(null);

    try {
      const { data, error } = await supabase.functions.invoke("tinyfish-proxy", {
        body: {
          url: appUrl,
          goal: `Perform E2E test as described: ${testPrompt}. Navigate, interact, validate outcomes. Log each step with pass/fail. Return JSON report: { summary: string, status: "pass"|"fail"|"partial", detailed_steps: [{action, result: "pass"|"fail", detail}], issues: [string] }`,
          feature: "qa",
        },
      });

      if (error) throw error;

      if (data?.resultJson) {
        try {
          setReport(typeof data.resultJson === "string" ? JSON.parse(data.resultJson) : data.resultJson);
        } catch {
          setReport({
            summary: "Test completed but could not parse structured report.",
            status: "partial",
            detailed_steps: [],
            issues: [typeof data.resultJson === "string" ? data.resultJson : JSON.stringify(data.resultJson)],
          });
        }
      }
      if (data?.logs) setStreamLog(data.logs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setStreamLog((prev) => [...prev, `❌ Error: ${msg}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "pass") return "text-primary";
    if (s === "fail") return "text-destructive";
    return "text-neon-blue";
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "pass") return <CheckCircle2 className="w-4 h-4 text-primary" />;
    if (status === "fail") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-neon-blue" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center glow-purple">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">QA Tester</h1>
            <p className="text-sm text-muted-foreground">Prompt-based E2E testing with reports</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">App URL</label>
            <input
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="https://myapp.com"
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">Test Description</label>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Test user registration: sign up with valid email, verify confirmation, log in, check profile..."
              rows={4}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono text-sm resize-none"
            />
          </div>
          <Button
            variant="neon"
            onClick={runTest}
            disabled={isRunning || !appUrl.trim() || !testPrompt.trim()}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run Test
              </>
            )}
          </Button>
        </div>

        {/* Stream */}
        <AnimatePresence>
          {(isRunning || streamLog.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-terminal-bg border border-border rounded-lg p-4 scanline"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                <span className="text-xs font-mono text-muted-foreground">Test Agent</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {streamLog.map((log, i) => (
                  <p key={i} className="text-xs font-mono text-muted-foreground">
                    <span className="text-accent">›</span> {log}
                  </p>
                ))}
                {isRunning && (
                  <p className="text-xs font-mono text-accent">
                    <span className="animate-cursor">█</span> Testing...
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className={`bg-card border rounded-lg p-6 ${report.status === "pass" ? "border-primary/30" : report.status === "fail" ? "border-destructive/30" : "border-border"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <StatusIcon status={report.status} />
                  <span className={`text-sm font-semibold uppercase ${statusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-foreground/90">{report.summary}</p>
              </div>

              {/* Steps */}
              {report.detailed_steps.length > 0 && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground">Test Steps</span>
                  </div>
                  <div className="divide-y divide-border">
                    {report.detailed_steps.map((step, i) => (
                      <div key={i} className="px-4 py-3 flex items-start gap-3">
                        <StatusIcon status={step.result} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{step.action}</p>
                          {step.detail && (
                            <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {report.issues && report.issues.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-destructive mb-2">Issues Found</h4>
                  <ul className="space-y-1">
                    {report.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default QATester;
