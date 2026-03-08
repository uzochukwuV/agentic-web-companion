import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const TINYFISH_API_KEY = Deno.env.get("TINYFISH_API_KEY");
  if (!TINYFISH_API_KEY) {
    return new Response(
      JSON.stringify({ error: "TINYFISH_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { url, goal, feature } = await req.json();

    if (!url || !goal) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: url, goal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling TinyFish API with:", { url, goal: goal.substring(0, 100) });

    // Use AbortController for timeout (300s for long-running operations)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
      method: "POST",
      headers: {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, goal }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TinyFish API error:", response.status, errorText);
      throw new Error(`TinyFish API error [${response.status}]: ${errorText}`);
    }

    // Parse SSE stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let resultJson = null;
    const logs: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              console.log("SSE event type:", event.type);
              
              if (event.type === "ACTION") {
                logs.push(`${event.action || event.description || "Performing action..."}`);
              } else if (event.type === "NAVIGATION") {
                logs.push(`Navigating to ${event.url || "..."}`);
              } else if (event.type === "COMPLETE" && event.status === "COMPLETED") {
                resultJson = event.resultJson;
                logs.push("✅ Completed successfully");
              } else if (event.type === "RESULT" || event.type === "FINAL_RESULT") {
                // Some TinyFish versions use different event names for results
                resultJson = event.resultJson || event.result || event.data;
                logs.push("✅ Result received");
              } else if (event.type === "ERROR") {
                logs.push(`❌ ${event.message || "Error occurred"}`);
              } else if (event.message || event.description) {
                logs.push(event.message || event.description);
              }
              
              // Check if event itself contains the result at top level
              if (!resultJson && event.topic && event.overview) {
                resultJson = event;
                logs.push("✅ Result extracted from event");
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }
    } catch (streamError) {
      console.error("Stream reading error:", streamError);
      // If we already got a result, that's fine
      if (!resultJson) {
        logs.push("⚠ Stream interrupted");
      }
    } finally {
      try { reader.releaseLock(); } catch { /* ignore */ }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      if (buffer.startsWith("data: ")) {
        try {
          const event = JSON.parse(buffer.slice(6));
          if (event.type === "COMPLETE" || event.type === "RESULT" || event.type === "FINAL_RESULT") {
            resultJson = event.resultJson || event.result || event.data || resultJson;
          }
          if (!resultJson && event.topic && event.overview) {
            resultJson = event;
          }
        } catch { /* ignore */ }
      }
    }

    console.log("Final result:", resultJson ? "received" : "null", "Logs:", logs.length);

    return new Response(
      JSON.stringify({ resultJson, logs, feature }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("TinyFish proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const isTimeout = message.includes("abort");
    return new Response(
      JSON.stringify({ 
        error: isTimeout ? "Request timed out. The agent took too long to respond." : message 
      }),
      { status: isTimeout ? 504 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
