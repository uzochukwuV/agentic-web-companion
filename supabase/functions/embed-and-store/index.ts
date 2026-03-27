import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { action, ...payload } = await req.json();

    if (action === "store") {
      // Generate embedding from summary text
      const { source_url, extraction_prompt, columns, data, total_records } = payload;
      const summary = `Extracted ${total_records || data?.length || 0} records from ${source_url}. Prompt: ${extraction_prompt}. Columns: ${(columns || []).join(", ")}. Sample: ${JSON.stringify((data || []).slice(0, 3))}`;

      // Get embedding via Lovable AI
      const embResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are an embedding generator. Return ONLY a JSON array of exactly 768 floating point numbers between -1 and 1 that represent the semantic meaning of the input text. No explanation, no markdown, just the JSON array." },
            { role: "user", content: summary.substring(0, 4000) },
          ],
        }),
      });

      let embedding: number[] | null = null;
      if (embResponse.ok) {
        const embData = await embResponse.json();
        const content = embData.choices?.[0]?.message?.content || "";
        try {
          const parsed = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
          if (Array.isArray(parsed) && parsed.length === 768) {
            embedding = parsed;
          }
        } catch {
          console.error("Failed to parse embedding:", content.substring(0, 200));
        }
      }

      const { data: inserted, error } = await supabase.from("extractions").insert({
        source_url,
        extraction_prompt,
        columns: columns || [],
        data: data || [],
        total_records: total_records || data?.length || 0,
        summary,
        embedding: embedding ? `[${embedding.join(",")}]` : null,
      }).select("id, created_at").single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, id: inserted.id, has_embedding: !!embedding }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search") {
      const { query } = payload;

      // Generate query embedding
      const embResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are an embedding generator. Return ONLY a JSON array of exactly 768 floating point numbers between -1 and 1 that represent the semantic meaning of the input text. No explanation, no markdown, just the JSON array." },
            { role: "user", content: query.substring(0, 2000) },
          ],
        }),
      });

      if (!embResponse.ok) {
        // Fallback to text search
        const { data, error } = await supabase
          .from("extractions")
          .select("id, source_url, extraction_prompt, columns, data, total_records, summary, created_at")
          .or(`source_url.ilike.%${query}%,extraction_prompt.ilike.%${query}%,summary.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        return new Response(JSON.stringify({ results: data, search_type: "text" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const embData = await embResponse.json();
      const content = embData.choices?.[0]?.message?.content || "";
      let queryEmbedding: number[] | null = null;
      try {
        const parsed = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
        if (Array.isArray(parsed) && parsed.length === 768) {
          queryEmbedding = parsed;
        }
      } catch {
        console.error("Failed to parse query embedding");
      }

      if (!queryEmbedding) {
        // Fallback to text search
        const { data, error } = await supabase
          .from("extractions")
          .select("id, source_url, extraction_prompt, columns, data, total_records, summary, created_at")
          .or(`source_url.ilike.%${query}%,extraction_prompt.ilike.%${query}%,summary.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        return new Response(JSON.stringify({ results: data, search_type: "text" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.rpc("search_extractions", {
        query_embedding: `[${queryEmbedding.join(",")}]`,
        match_threshold: 0.3,
        match_count: 10,
      });

      if (error) throw error;
      return new Response(JSON.stringify({ results: data, search_type: "vector" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("extractions")
        .select("id, source_url, extraction_prompt, total_records, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return new Response(JSON.stringify({ results: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get") {
      const { id } = payload;
      const { data, error } = await supabase
        .from("extractions")
        .select("id, source_url, extraction_prompt, columns, data, total_records, summary, created_at")
        .eq("id", id)
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("embed-and-store error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
