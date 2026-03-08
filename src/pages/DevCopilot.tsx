import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Code, BookOpen, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentStreamLog from "@/components/AgentStreamLog";
import { useTinyFishAgent } from "@/hooks/useTinyFishAgent";
import { Loader2 } from "lucide-react";

interface ExtractedResult {
  overview?: string;
  code_examples?: Array<{ title: string; code: string; language: string }>;
  errors_solutions?: Array<{ error: string; solution: string }>;
  raw?: string;
}

const DevCopilot = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ExtractedResult | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const agent = useTinyFishAgent({ feature: "copilot" });

  const handleExtract = async () => {
    if (!query.trim()) return;
    setResult(null);

    const res = await agent.run(
      "https://devdocs.io/",
      `Search for '${query}', navigate to the most relevant result, and extract: overview/description, code examples (with language), common errors and solutions. Return as JSON with keys: overview, code_examples (array of {title, code, language}), errors_solutions (array of {error, solution}).`
    );

    if (res) {
      try {
        setResult(typeof res === "string" ? JSON.parse(res) : res);
      } catch {
        setResult({ raw: typeof res === "string" ? res : JSON.stringify(res, null, 2) });
      }
    }
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-green">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">DevCopilot</h1>
            <p className="text-sm text-muted-foreground">Extract docs, examples & fixes from the web</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
            placeholder="e.g. React useEffect cleanup, Express.js authentication..."
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
          />
          <Button
            variant="neon"
            size="sm"
            onClick={handleExtract}
            disabled={agent.isRunning || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            {agent.isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extract"}
          </Button>
        </div>

        <AnimatePresence>
          <AgentStreamLog logs={agent.streamLog} isRunning={agent.isRunning} />
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {result.overview && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Overview
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">{result.overview}</p>
                </div>
              )}

              {result.code_examples && result.code_examples.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-accent flex items-center gap-2">
                    <Code className="w-4 h-4" /> Code Examples
                  </h3>
                  {result.code_examples.map((ex, i) => (
                    <div key={i} className="bg-terminal-bg border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <span className="text-xs font-mono text-muted-foreground">{ex.title || ex.language}</span>
                        <button onClick={() => copyCode(ex.code, i)} className="text-muted-foreground hover:text-primary transition-colors">
                          {copied === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto">
                        <code>{ex.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {result.errors_solutions && result.errors_solutions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-destructive">Common Issues</h3>
                  {result.errors_solutions.map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-4">
                      <p className="text-xs font-mono text-destructive/80 mb-2">⚠ {item.error}</p>
                      <p className="text-sm text-foreground/80">{item.solution}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.raw && (
                <div className="bg-terminal-bg border border-border rounded-lg p-4">
                  <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{result.raw}</pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DevCopilot;
