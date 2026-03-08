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

    const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
      method: "POST",
      headers: {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, goal }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TinyFish API error [${response.status}]: ${errorText}`);
    }

    // Parse SSE stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let resultJson = null;
    const logs: string[] = [];

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
            if (event.type === "ACTION") {
              logs.push(`${event.action || event.description || "Performing action..."}`);
            } else if (event.type === "NAVIGATION") {
              logs.push(`Navigating to ${event.url || "..."}`);
            } else if (event.type === "COMPLETE" && event.status === "COMPLETED") {
              resultJson = event.resultJson;
              logs.push("✅ Completed successfully");
            } else if (event.type === "ERROR") {
              logs.push(`❌ ${event.message || "Error occurred"}`);
            } else if (event.message || event.description) {
              logs.push(event.message || event.description);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ resultJson, logs, feature }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("TinyFish proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
