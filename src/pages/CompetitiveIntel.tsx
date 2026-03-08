import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Loader2, Plus, X, TrendingUp, DollarSign, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentStreamLog from "@/components/AgentStreamLog";
import { useTinyFishAgent } from "@/hooks/useTinyFishAgent";

interface CompetitorAnalysis {
  your_product?: { name: string; strengths?: string[]; weaknesses?: string[] };
  competitors?: Array<{
    name: string;
    website?: string;
    pricing?: string;
    features?: string[];
    strengths?: string[];
    weaknesses?: string[];
    positioning?: string;
  }>;
  market_insights?: string;
  recommendations?: string[];
  raw?: string;
}

const CompetitiveIntel = () => {
  const [yourProduct, setYourProduct] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const agent = useTinyFishAgent({ feature: "competitive-intel" });

  const addCompetitor = () => setCompetitors([...competitors, ""]);
  const removeCompetitor = (i: number) => setCompetitors(competitors.filter((_, idx) => idx !== i));
  const updateCompetitor = (i: number, val: string) => {
    const updated = [...competitors];
    updated[i] = val;
    setCompetitors(updated);
  };

  const handleAnalyze = async () => {
    const validCompetitors = competitors.filter((c) => c.trim());
    if (!yourProduct.trim() || validCompetitors.length === 0) return;

    const competitorList = validCompetitors.join(", ");
    const goal = `Perform competitive analysis for "${yourProduct}" against these competitors: ${competitorList}. 
    For each competitor:
    1. Visit their website
    2. Check their pricing page
    3. Identify key features
    4. Analyze their positioning and messaging
    
    Return JSON with keys:
    - your_product: { name, strengths (array), weaknesses (array) }
    - competitors: array of { name, website, pricing (summary), features (array), strengths (array), weaknesses (array), positioning (one sentence) }
    - market_insights: string with overall market analysis
    - recommendations: array of actionable recommendations`;

    const firstCompetitor = validCompetitors[0];
    const isUrl = firstCompetitor.startsWith("http");
    const targetUrl = isUrl ? firstCompetitor : `https://www.google.com/search?q=${encodeURIComponent(firstCompetitor + " vs " + yourProduct)}`;

    const result = await agent.run(targetUrl, goal);
    if (result) setAnalysis(result);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center glow-purple">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Competitive Intel</h1>
            <p className="text-sm text-muted-foreground">AI agent analyzes competitors across live websites</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">Your Product / Company</label>
            <input
              value={yourProduct}
              onChange={(e) => setYourProduct(e.target.value)}
              placeholder="e.g. Acme Analytics"
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">Competitors (name or URL)</label>
            <div className="space-y-2">
              {competitors.map((comp, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={comp}
                    onChange={(e) => updateCompetitor(i, e.target.value)}
                    placeholder={`Competitor ${i + 1} (e.g. Mixpanel or https://mixpanel.com)`}
                    className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono text-sm"
                  />
                  {competitors.length > 1 && (
                    <button onClick={() => removeCompetitor(i)} className="px-3 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {competitors.length < 5 && (
              <button onClick={addCompetitor} className="mt-2 text-xs font-mono text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add Competitor
              </button>
            )}
          </div>

          <Button
            variant="neon"
            onClick={handleAnalyze}
            disabled={agent.isRunning || !yourProduct.trim() || !competitors.some((c) => c.trim())}
            className="w-full"
          >
            {agent.isRunning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Competitors...</>
            ) : (
              <><BarChart3 className="w-4 h-4" /> Analyze Competition</>
            )}
          </Button>
        </div>

        <AnimatePresence>
          <AgentStreamLog logs={agent.streamLog} isRunning={agent.isRunning} label="Intel Agent" accentClass="text-accent" />
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Market Insights */}
              {analysis.market_insights && (
                <div className="bg-card border border-accent/20 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-accent flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4" /> Market Insights
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">{analysis.market_insights}</p>
                </div>
              )}

              {/* Competitor Cards */}
              {analysis.competitors && analysis.competitors.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Competitor Breakdown</h3>
                  {analysis.competitors.map((comp, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-foreground">{comp.name}</h4>
                        {comp.website && (
                          <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-accent hover:underline">
                            {comp.website}
                          </a>
                        )}
                      </div>

                      {comp.positioning && (
                        <p className="text-sm text-muted-foreground mb-4 italic">"{comp.positioning}"</p>
                      )}

                      {comp.pricing && (
                        <div className="mb-4 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground/90 font-mono">{comp.pricing}</span>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        {comp.features && comp.features.length > 0 && (
                          <div>
                            <h5 className="text-xs font-mono text-muted-foreground mb-2 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Features
                            </h5>
                            <ul className="space-y-1">
                              {comp.features.map((f, j) => (
                                <li key={j} className="text-xs text-foreground/80 flex items-start gap-1">
                                  <span className="text-accent mt-0.5">•</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {comp.strengths && comp.strengths.length > 0 && (
                          <div>
                            <h5 className="text-xs font-mono text-primary mb-2 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Strengths
                            </h5>
                            <ul className="space-y-1">
                              {comp.strengths.map((s, j) => (
                                <li key={j} className="text-xs text-foreground/80 flex items-start gap-1">
                                  <span className="text-primary mt-0.5">✓</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {comp.weaknesses && comp.weaknesses.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-xs font-mono text-destructive mb-2">Weaknesses</h5>
                          <ul className="space-y-1">
                            {comp.weaknesses.map((w, j) => (
                              <li key={j} className="text-xs text-foreground/80 flex items-start gap-1">
                                <span className="text-destructive mt-0.5">−</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-primary mb-3">🎯 Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                        <span className="text-primary font-bold">{i + 1}.</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.raw && (
                <div className="bg-terminal-bg border border-border rounded-lg p-4">
                  <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{analysis.raw}</pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CompetitiveIntel;
