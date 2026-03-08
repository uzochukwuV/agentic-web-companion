import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, Zap, ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "DevCopilot",
    desc: "Extract docs, code examples & bug fixes from live developer sites using AI agents.",
    to: "/copilot",
    color: "text-primary",
    glow: "glow-green",
  },
  {
    icon: FileText,
    title: "QA Tester",
    desc: "Describe tests in natural language. AI agents run them in real browsers and generate reports.",
    to: "/qa",
    color: "text-accent",
    glow: "glow-purple",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pt-14">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
              <Zap className="w-3 h-3" /> Powered by TinyFish Agents
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
              Dev<span className="text-primary text-glow-green">Agent</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Autonomous AI agents that extract documentation, fix bugs, and test your apps — all from natural language prompts.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="neon" size="lg" asChild>
                <Link to="/copilot">
                  <Terminal className="w-4 h-4" /> Start Extracting
                </Link>
              </Button>
              <Button variant="neon-outline" size="lg" asChild>
                <Link to="/qa">
                  Run Tests <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                to={f.to}
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center ${f.glow} mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
