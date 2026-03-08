import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Loader2, Building2, Globe, Mail, Linkedin, MapPin, DollarSign, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentStreamLog from "@/components/AgentStreamLog";
import { useTinyFishAgent } from "@/hooks/useTinyFishAgent";

interface LeadProfile {
  company_name?: string;
  website?: string;
  description?: string;
  industry?: string;
  headquarters?: string;
  employee_count?: string;
  funding?: string;
  tech_stack?: string[];
  key_people?: Array<{ name: string; title: string; linkedin?: string }>;
  contact_info?: { email?: string; phone?: string; linkedin?: string };
  recent_news?: Array<{ title: string; date?: string; url?: string }>;
  competitors?: string[];
  raw?: string;
}

const LeadResearch = () => {
  const [companyInput, setCompanyInput] = useState("");
  const [researchDepth, setResearchDepth] = useState<"quick" | "deep">("quick");
  const [profile, setProfile] = useState<LeadProfile | null>(null);
  const agent = useTinyFishAgent({ feature: "lead-research" });

  const handleResearch = async () => {
    if (!companyInput.trim()) return;

    const isUrl = companyInput.startsWith("http");
    const targetUrl = isUrl ? companyInput : `https://www.google.com/search?q=${encodeURIComponent(companyInput + " company")}`;

    const depthInstruction = researchDepth === "deep"
      ? "Do thorough research: visit the company website, check their about page, pricing page, team page, LinkedIn company page, and any Crunchbase or news articles. Follow multiple links."
      : "Do a focused research: visit the company website and extract key information from main pages.";

    const goal = `Research the company "${companyInput}". ${depthInstruction} Extract and return as JSON with keys: company_name, website, description, industry, headquarters, employee_count, funding (if available), tech_stack (array of technologies used), key_people (array of {name, title, linkedin}), contact_info ({email, phone, linkedin}), recent_news (array of {title, date, url}), competitors (array of competitor names).`;

    const result = await agent.run(targetUrl, goal);
    if (result) setProfile(result);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center" style={{ boxShadow: "0 0 20px hsl(200 100% 60% / 0.3)" }}>
            <Users className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead Research</h1>
            <p className="text-sm text-muted-foreground">AI agent researches companies across the live web</p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResearch()}
              placeholder="Enter company name or URL (e.g. Stripe, https://openai.com)"
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setResearchDepth("quick")}
                className={`px-4 py-2 text-xs font-mono transition-colors ${researchDepth === "quick" ? "bg-neon-blue/20 text-neon-blue" : "text-muted-foreground hover:text-foreground"}`}
              >
                Quick Scan
              </button>
              <button
                onClick={() => setResearchDepth("deep")}
                className={`px-4 py-2 text-xs font-mono transition-colors ${researchDepth === "deep" ? "bg-neon-blue/20 text-neon-blue" : "text-muted-foreground hover:text-foreground"}`}
              >
                Deep Research
              </button>
            </div>
            <Button
              variant="neon"
              onClick={handleResearch}
              disabled={agent.isRunning || !companyInput.trim()}
              className="ml-auto"
            >
              {agent.isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {agent.isRunning ? "Researching..." : "Research"}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          <AgentStreamLog logs={agent.streamLog} isRunning={agent.isRunning} label="Research Agent" accentClass="text-neon-blue" />
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {profile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Company Header */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-neon-blue" />
                      {profile.company_name || companyInput}
                    </h2>
                    {profile.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">{profile.description}</p>
                    )}
                  </div>
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline text-xs font-mono flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Visit
                    </a>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {profile.industry && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-mono">{profile.industry}</span>
                  )}
                  {profile.headquarters && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {profile.headquarters}
                    </span>
                  )}
                  {profile.employee_count && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-mono flex items-center gap-1">
                      <Users className="w-3 h-3" /> {profile.employee_count}
                    </span>
                  )}
                  {profile.funding && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-mono flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {profile.funding}
                    </span>
                  )}
                </div>
              </div>

              {/* Tech Stack */}
              {profile.tech_stack && profile.tech_stack.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-neon-blue flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.tech_stack.map((tech, i) => (
                      <span key={i} className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-md text-xs font-mono">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key People */}
              {profile.key_people && profile.key_people.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-accent flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4" /> Key People
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {profile.key_people.map((person, i) => (
                      <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.title}</p>
                        </div>
                        {person.linkedin && (
                          <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:text-neon-blue/80">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {profile.contact_info && (profile.contact_info.email || profile.contact_info.linkedin) && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4" /> Contact
                  </h3>
                  <div className="space-y-2">
                    {profile.contact_info.email && (
                      <p className="text-sm text-foreground/90 font-mono">{profile.contact_info.email}</p>
                    )}
                    {profile.contact_info.linkedin && (
                      <a href={profile.contact_info.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-neon-blue hover:underline font-mono flex items-center gap-1">
                        <Linkedin className="w-3 h-3" /> LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Recent News */}
              {profile.recent_news && profile.recent_news.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">📰 Recent News</h3>
                  <div className="space-y-2">
                    {profile.recent_news.map((news, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground text-xs mt-0.5">•</span>
                        <div>
                          {news.url ? (
                            <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/90 hover:text-neon-blue transition-colors flex items-center gap-1">
                              {news.title} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <p className="text-sm text-foreground/90">{news.title}</p>
                          )}
                          {news.date && <p className="text-xs text-muted-foreground">{news.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitors */}
              {profile.competitors && profile.competitors.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-accent mb-3">⚔️ Competitors</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.competitors.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-md text-xs font-mono">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw fallback */}
              {profile.raw && (
                <div className="bg-terminal-bg border border-border rounded-lg p-4">
                  <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{profile.raw}</pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LeadResearch;
