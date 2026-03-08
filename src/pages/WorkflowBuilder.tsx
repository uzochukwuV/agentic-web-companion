import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Workflow, Plus, X, Play, Loader2, GripVertical, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentStreamLog from "@/components/AgentStreamLog";
import { useTinyFishAgent } from "@/hooks/useTinyFishAgent";

interface WorkflowStep {
  id: string;
  url: string;
  action: string;
}

interface StepResult {
  step: string;
  status: "pass" | "fail" | "skipped";
  detail?: string;
  data?: any;
}

interface WorkflowResult {
  status: "completed" | "partial" | "failed";
  summary: string;
  step_results?: StepResult[];
  output_data?: any;
  raw?: string;
}

const PRESETS = [
  {
    name: "🔍 Price Monitor",
    steps: [
      { url: "https://www.amazon.com", action: "Search for 'wireless headphones', extract top 5 results with name, price, rating, and URL" },
      { url: "https://www.bestbuy.com", action: "Search for 'wireless headphones', extract top 5 results with name, price, rating" },
    ],
  },
  {
    name: "📊 Competitor Pricing",
    steps: [
      { url: "", action: "Navigate to pricing page, extract all plan names, prices, and features" },
      { url: "", action: "Navigate to the second competitor's pricing page, extract the same data" },
    ],
  },
  {
    name: "📝 Form Submission Test",
    steps: [
      { url: "", action: "Navigate to the registration/signup page" },
      { url: "", action: "Fill out the form with test data and submit" },
      { url: "", action: "Verify the submission was successful and check for confirmation" },
    ],
  },
];

let nextId = 1;
const makeStep = (url = "", action = ""): WorkflowStep => ({
  id: `step-${nextId++}`,
  url,
  action,
});

const WorkflowBuilder = () => {
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([makeStep()]);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const agent = useTinyFishAgent({ feature: "workflow" });

  const addStep = () => setSteps([...steps, makeStep()]);
  const removeStep = (id: string) => setSteps(steps.filter((s) => s.id !== id));
  const updateStep = (id: string, field: keyof WorkflowStep, value: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setWorkflowName(preset.name);
    setSteps(preset.steps.map((s) => makeStep(s.url, s.action)));
  };

  const runWorkflow = async () => {
    const validSteps = steps.filter((s) => s.action.trim());
    if (validSteps.length === 0) return;

    const stepsDescription = validSteps
      .map((s, i) => `Step ${i + 1}${s.url ? ` (on ${s.url})` : ""}: ${s.action}`)
      .join("\n");

    const firstUrl = validSteps[0].url || "https://www.google.com";
    const goal = `Execute this multi-step workflow:
${stepsDescription}

For each step, perform the described action. If a step specifies a URL, navigate there first. Carry forward context between steps (e.g. data extracted in step 1 might be needed in step 2).

Return JSON with:
- status: "completed" | "partial" | "failed"
- summary: overall result description
- step_results: array of { step (description), status ("pass"|"fail"|"skipped"), detail (what happened), data (any extracted data) }
- output_data: combined output data from all steps`;

    const res = await agent.run(firstUrl, goal);
    if (res) setResult(res);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "pass" || status === "completed") return <CheckCircle2 className="w-4 h-4 text-primary" />;
    if (status === "fail" || status === "failed") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-neon-blue" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center" style={{ boxShadow: "0 0 20px hsl(200 100% 60% / 0.3)" }}>
            <Workflow className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workflow Builder</h1>
            <p className="text-sm text-muted-foreground">Chain multi-step web agent tasks into automated workflows</p>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="text-xs font-mono text-muted-foreground mb-2 block">Load Preset</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                className="px-3 py-1.5 rounded-md text-xs font-mono border border-border bg-card text-muted-foreground hover:text-foreground hover:border-neon-blue/30 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Name */}
        <div className="mb-4">
          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow name (optional)"
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 font-mono text-sm"
          />
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">Step {i + 1}</span>
                {steps.length > 1 && (
                  <button onClick={() => removeStep(step.id)} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <input
                  value={step.url}
                  onChange={(e) => updateStep(step.id, "url", e.target.value)}
                  placeholder="URL (optional — agent will navigate from previous step if empty)"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-blue/50 font-mono text-xs"
                />
                <textarea
                  value={step.action}
                  onChange={(e) => updateStep(step.id, "action", e.target.value)}
                  placeholder="Describe what the agent should do in this step..."
                  rows={2}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-blue/50 font-mono text-xs resize-none"
                />
              </div>
            </motion.div>
          ))}

          <button
            onClick={addStep}
            className="w-full py-3 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-neon-blue/30 transition-colors text-xs font-mono flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>

        <Button
          variant="neon"
          onClick={runWorkflow}
          disabled={agent.isRunning || !steps.some((s) => s.action.trim())}
          className="w-full mb-6"
        >
          {agent.isRunning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running Workflow...</>
          ) : (
            <><Play className="w-4 h-4" /> Execute Workflow</>
          )}
        </Button>

        <AnimatePresence>
          <AgentStreamLog logs={agent.streamLog} isRunning={agent.isRunning} label="Workflow Agent" accentClass="text-neon-blue" />
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Summary */}
              <div className={`bg-card border rounded-lg p-6 ${
                result.status === "completed" ? "border-primary/30" : result.status === "failed" ? "border-destructive/30" : "border-border"
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <StatusIcon status={result.status} />
                  <span className={`text-sm font-semibold uppercase ${
                    result.status === "completed" ? "text-primary" : result.status === "failed" ? "text-destructive" : "text-neon-blue"
                  }`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-sm text-foreground/90">{result.summary}</p>
              </div>

              {/* Step Results */}
              {result.step_results && result.step_results.length > 0 && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground">Workflow Steps</span>
                  </div>
                  <div className="divide-y divide-border">
                    {result.step_results.map((sr, i) => (
                      <div key={i} className="px-4 py-3 flex items-start gap-3">
                        <StatusIcon status={sr.status} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{sr.step}</p>
                          {sr.detail && <p className="text-xs text-muted-foreground mt-1">{sr.detail}</p>}
                          {sr.data && (
                            <pre className="mt-2 text-xs font-mono text-foreground/60 bg-terminal-bg rounded p-2 overflow-x-auto">
                              {typeof sr.data === "string" ? sr.data : JSON.stringify(sr.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Output Data */}
              {result.output_data && (
                <div className="bg-terminal-bg border border-border rounded-lg p-4">
                  <h4 className="text-xs font-mono text-muted-foreground mb-2">Output Data</h4>
                  <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                    {typeof result.output_data === "string" ? result.output_data : JSON.stringify(result.output_data, null, 2)}
                  </pre>
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

export default WorkflowBuilder;
