import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Loader2, Download, Table, Globe, Copy, Check, Save, Search, History, Clock, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentStreamLog from "@/components/AgentStreamLog";
import { useTinyFishAgent } from "@/hooks/useTinyFishAgent";
import { useExtractionStore } from "@/hooks/useExtractionStore";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState<"extract" | "history" | "search">("extract");
  const [searchQuery, setSearchQuery] = useState("");
  const agent = useTinyFishAgent({ feature: "data-extraction" });
  const store = useExtractionStore();

  useEffect(() => {
    if (activeTab === "history") {
      store.loadHistory();
    }
  }, [activeTab]);

  const handleExtract = async () => {
    if (!targetUrl.trim() || !extractionPrompt.trim()) return;
    const goal = `${extractionPrompt} Navigate up to ${maxPages} pages. Return as JSON with keys: data (array of objects with consistent keys), columns (array of column names), total_records (number), source_url (string).`;
    const res = await agent.run(targetUrl, goal);
    if (res) setResult(res);
  };

  const handleSave = async () => {
    if (!result?.data) return;
    try {
      await store.saveExtraction({
        source_url: targetUrl,
        extraction_prompt: extractionPrompt,
        columns: result.columns || Object.keys(result.data[0] || {}),
        data: result.data,
        total_records: result.total_records || result.data.length,
      });
      toast.success("Extraction saved to vector database");
    } catch {
      toast.error("Failed to save extraction");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await store.searchExtractions(searchQuery);
  };

  const loadSavedExtraction = async (id: string) => {
    const data = await store.getExtraction(id);
    if (data) {
      setResult({
        data: data.data as any,
        columns: data.columns,
        total_records: data.total_records,
        source_url: data.source_url,
      });
      setTargetUrl(data.source_url);
      setExtractionPrompt(data.extraction_prompt);
      setActiveTab("extract");
      toast.success("Loaded saved extraction");
    }
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-green">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Extractor</h1>
            <p className="text-sm text-muted-foreground">Scrape, store & semantically search extracted data</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card border border-border rounded-lg p-1">
          {([
            { key: "extract", label: "Extract", icon: Database },
            { key: "history", label: "History", icon: History },
            { key: "search", label: "Vector Search", icon: Search },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-mono transition-colors ${
                activeTab === key
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Extract Tab */}
        {activeTab === "extract" && (
          <>
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
                  placeholder="Describe what data to extract..."
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

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground font-mono">
                        <Table className="w-4 h-4 inline mr-1" />
                        {result.total_records || result.data?.length || 0} records
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleSave} disabled={store.isSaving || !result.data?.length}>
                        {store.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {store.isSaving ? "Saving..." : "Save to DB"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyJSON}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied" : "JSON"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportCSV} disabled={!result.data?.length}>
                        <Download className="w-3.5 h-3.5" /> CSV
                      </Button>
                    </div>
                  </div>

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
                    <div className="bg-card border border-border rounded-lg p-4">
                      <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{result.raw}</pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {store.isLoadingHistory ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading history...
              </div>
            ) : store.history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                No saved extractions yet. Run an extraction and click "Save to DB" to store it.
              </div>
            ) : (
              store.history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadSavedExtraction(item.id)}
                  className="w-full text-left bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-foreground font-mono truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      {item.source_url}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate mb-2">{item.extraction_prompt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span><Table className="w-3 h-3 inline mr-1" />{item.total_records} records</span>
                    <span><Clock className="w-3 h-3 inline mr-1" />{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search extractions semantically, e.g. 'product pricing data'"
                  className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                />
              </div>
              <Button variant="neon" onClick={handleSearch} disabled={store.isSearching || !searchQuery.trim()}>
                {store.isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </div>

            {store.searchResults.length > 0 && (
              <div className="space-y-3">
                {store.searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadSavedExtraction(item.id)}
                    className="w-full text-left bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-foreground font-mono truncate">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        {item.source_url}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.similarity !== undefined && (
                          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {(item.similarity * 100).toFixed(0)}% match
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate mb-2">{item.extraction_prompt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span><Table className="w-3 h-3 inline mr-1" />{item.total_records} records</span>
                      <span><Clock className="w-3 h-3 inline mr-1" />{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!store.isSearching && store.searchResults.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                No matching extractions found
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DataExtractor;
