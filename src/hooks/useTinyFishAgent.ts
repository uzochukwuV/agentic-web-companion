import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseTinyFishAgentOptions {
  feature: string;
}

export const useTinyFishAgent = ({ feature }: UseTinyFishAgentOptions) => {
  const [isRunning, setIsRunning] = useState(false);
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (url: string, goal: string) => {
    setIsRunning(true);
    setStreamLog([]);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("tinyfish-proxy", {
        body: { url, goal, feature },
      });

      if (fnError) {
        // Try to parse error body for result data
        if (fnError.context?.body) {
          try {
            const bodyText = await fnError.context.body.text?.() || "";
            const parsed = JSON.parse(bodyText);
            if (parsed.resultJson) {
              const r = typeof parsed.resultJson === "string" ? JSON.parse(parsed.resultJson) : parsed.resultJson;
              setResult(r);
              if (parsed.logs) setStreamLog(parsed.logs);
              return r;
            }
          } catch { /* fall through */ }
        }
        throw fnError;
      }

      let parsedResult = null;
      if (data?.resultJson) {
        try {
          parsedResult = typeof data.resultJson === "string" ? JSON.parse(data.resultJson) : data.resultJson;
        } catch {
          parsedResult = { raw: typeof data.resultJson === "string" ? data.resultJson : JSON.stringify(data.resultJson, null, 2) };
        }
        setResult(parsedResult);
      }
      if (data?.logs) {
        setStreamLog(data.logs);
      }
      return parsedResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStreamLog((prev) => [...prev, `❌ Error: ${msg}`]);
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setStreamLog([]);
    setResult(null);
    setError(null);
  };

  return { run, reset, isRunning, streamLog, result, error };
};
