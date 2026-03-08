import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, Zap, ArrowRight, Terminal, Users, BarChart3, Database, Workflow, Globe, Bot, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "Lead Research",
    desc: "Enter a company name or URL — the agent researches their website, team, tech stack, funding, and news across the live web.",
    to: "/leads",
    color: "text-neon-blue",
    glow: "",
    glowStyle: { boxShadow: "0 0 20px hsl(200 100% 60% / 0.2)" },
    tag: "Multi-Step",
  },
  {
    icon: BarChart3,
    title: "Competitive Intel",
    desc: "Analyze competitors by visiting their websites, pricing pages, and feature lists. Get actionable positioning insights.",
    to: "/intel",
    color: "text-accent",
    glow: "glow-purple",
    tag: "Multi-Site",
  },
  {
    icon: Database,
    title: "Data Extractor",
    desc: "Scrape structured data from any website — products, jobs, reviews — with pagination support. Export as CSV or JSON.",
    to: "/extract",
    color: "text-primary",
    glow: "glow-green",
    tag: "Pagination",
  },
  {
    icon: Workflow,
    title: "Workflow Builder",
    desc: "Chain multi-step web tasks into automated workflows. Define sequences, the agent executes them end-to-end.",
    to: "/workflows",
    color: "text-neon-blue",
    glow: "",
    glowStyle: { boxShadow: "0 0 20px hsl(200 100% 60% / 0.2)" },
    tag: "Composable",
  },
  {
    icon: BookOpen,
    title: "DevCopilot",
    desc: "Extract documentation, code examples, and bug fixes from live developer sites using AI agents.",
    to: "/copilot",
    color: "text-primary",
    glow: "glow-green",
    tag: "Docs",
  },
  {
    icon: FileText,
    title: "QA Tester",
    desc: "Describe tests in plain English. AI agents execute them in real browsers and generate pass/fail reports.",
    to: "/qa",
    color: "text-accent",
    glow: "glow-purple",
    tag: "E2E",
  },
];

const stats = [
  { label: "Web Pages Navigated", value: "∞" },
  { label: "Data Formats", value: "JSON / CSV" },
  { label: "Concurrent Agents", value: "6 Types" },
  { label: "Max Timeout", value: "300s" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pt-14">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none opacity-50" />
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
              <Bot className="w-3.5 h-3.5" /> Autonomous Web Agents — Powered by TinyFish
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              AI That Actually<br />
              <span className="text-primary text-glow-green">Works the Web</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Not another chatbot. DevAgent sends autonomous AI agents into live websites to research companies, 
              analyze competitors, extract data, and execute multi-step workflows — all from natural language.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="neon" size="lg" asChild>
                <Link to="/leads">
                  <Users className="w-4 h-4" /> Research a Company
                </Link>
              </Button>
              <Button variant="neon-outline" size="lg" asChild>
                <Link to="/workflows">
                  <Workflow className="w-4 h-4" /> Build a Workflow
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-8 mb-16"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Describe the Task", desc: "Tell the agent what you need in plain English — research a company, extract pricing data, test a signup flow.", icon: Terminal },
              { step: "02", title: "Agent Navigates the Web", desc: "TinyFish agents open real browsers, navigate complex UIs, handle pop-ups, pagination, and form fills autonomously.", icon: Globe },
              { step: "03", title: "Get Structured Results", desc: "Receive clean, structured data — JSON, CSV, reports — ready to use in your workflows or export to your tools.", icon: Shield },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-3xl font-bold text-primary/20 font-mono mb-3">{item.step}</div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-primary font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Agent Cards */}
        <h2 className="text-lg font-semibold text-foreground mb-6 text-center">Agent Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <Link
                to={f.to}
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center ${f.glow}`}
                    style={f.glowStyle}
                  >
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-mono">{f.tag}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  Launch Agent <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            Built with <span className="text-primary">TinyFish</span> Web Agent API — Real AI agents that navigate the live web
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
