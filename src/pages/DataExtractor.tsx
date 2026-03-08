import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Loader2, Download, Table, Globe, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentStreamLog from "@/components/AgentStreamLog";
import { useTinyFishAgent } from "@/hooks/useTinyFishAgent";

interface ExtractionResult {
  data?: Array<Record<string, string>>;
  columns?: string[];
  total_records?: number;
  source_url?: string;
  raw?: string;
}

const TEMPLATES = [
  { label: "Product Listings", prompt: "Extract all product listings with name, price, description, image URL, and rating. Handle pagination if present." },
  { label: "Job Postings", prompt: "Extract all job postings with title, company, location, salary (if shown), and posting date. Navigate through all pages." },
  { label: "Reviews", prompt: "Extract all reviews with reviewer name, rating, date, title, and review text. Paginate through all review pages." },
  { label: "Directory Entries", prompt: "Extract all directory entries with name, address, phone, website, and category. Navigate all pages." },
  { label: "News Articles", prompt: "Extract all article headlines with title, author, date, summary, and article URL." },
];

const DataExtractor = () => {
  const [targetUrl, setTargetUrl] = useState("");
  const [extractionPrompt, setExtractionPrompt] = useState("");
  const [maxPages, setMaxPages] = useState(3);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const agent = useTinyFishAgent({ feature: "data-extraction" });

  const handleExtract = async () => {
    if (!targetUrl.trim() || !extractionPrompt.trim()) return;

    const goal = `${extractionPrompt} Navigate up to ${maxPages} pages. Return as JSON with keys: data (array of objects with consistent keys), columns (array of column names), total_records (number), source_url (string).`;

    const res = await agent.run(targetUrl, goal);
    if (res) setResult(res);
  };

  const exportCSV = () => {
    if (!result?.data || result.data.length === 0) return;
    const cols = result.columns || Object.keys(result.data[0]);
    const rows = result.data.map((row) => cols.map((c) => `"${(row[c] || "").replace(/"/g, '""')}"`).join(","));
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    if (!result?.data) return;
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-green">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Extractor</h1>
            <p className="text-sm text-muted-foreground">Scrape structured data from any website with pagination</p>
          </div>
        </div>

        {/* Templates */}
        <div className="mb-4">
          <label className="text-xs font-mono text-muted-foreground mb-2 block">Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => setExtractionPrompt(tpl.prompt)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors border ${
                  extractionPrompt === tpl.prompt
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">Target URL</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/products"
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">What to Extract</label>
            <textarea
              value={extractionPrompt}
              onChange={(e) => setExtractionPrompt(e.target.value)}
              placeholder="Describe what data to extract, e.g. 'Extract all product names, prices, and ratings from the listing page...'"
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">Max Pages</label>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {[1, 2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>{n} page{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <Button
              variant="neon"
              onClick={handleExtract}
              disabled={agent.isRunning || !targetUrl.trim() || !extractionPrompt.trim()}
              className="ml-auto"
            >
              {agent.isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {agent.isRunning ? "Extracting..." : "Extract Data"}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          <AgentStreamLog logs={agent.streamLog} isRunning={agent.isRunning} label="Extraction Agent" />
        </AnimatePresence>

        {/* Results Table */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Stats & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground font-mono">
                    <Table className="w-4 h-4 inline mr-1" />
                    {result.total_records || result.data?.length || 0} records
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyJSON}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "JSON"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportCSV} disabled={!result.data?.length}>
                    <Download className="w-3.5 h-3.5" /> CSV
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              {result.data && result.data.length > 0 && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          {(result.columns || Object.keys(result.data[0])).map((col) => (
                            <th key={col} className="px-4 py-3 text-left text-xs font-mono text-muted-foreground font-semibold whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((row, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            {(result.columns || Object.keys(row)).map((col) => (
                              <td key={col} className="px-4 py-3 text-xs font-mono text-foreground/80 max-w-[200px] truncate">
                                {row[col] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

export default DataExtractor;
