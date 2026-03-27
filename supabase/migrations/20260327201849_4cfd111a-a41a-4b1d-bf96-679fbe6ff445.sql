
CREATE OR REPLACE FUNCTION public.search_extractions(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  source_url TEXT,
  extraction_prompt TEXT,
  columns TEXT[],
  data JSONB,
  total_records INTEGER,
  summary TEXT,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE sql STABLE
SET search_path = public, extensions
AS $$
  SELECT
    e.id,
    e.source_url,
    e.extraction_prompt,
    e.columns,
    e.data,
    e.total_records,
    e.summary,
    e.created_at,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.extractions e
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
$$;
