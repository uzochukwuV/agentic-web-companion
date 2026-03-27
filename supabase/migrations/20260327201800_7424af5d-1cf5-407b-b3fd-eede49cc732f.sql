
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create extractions table with vector embeddings
CREATE TABLE public.extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  extraction_prompt TEXT NOT NULL,
  columns TEXT[] DEFAULT '{}',
  data JSONB NOT NULL DEFAULT '[]',
  total_records INTEGER DEFAULT 0,
  summary TEXT,
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX extractions_embedding_idx ON public.extractions 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for text search fallback
CREATE INDEX extractions_source_url_idx ON public.extractions (source_url);
CREATE INDEX extractions_created_at_idx ON public.extractions (created_at DESC);

-- Enable RLS (public access since no auth)
ALTER TABLE public.extractions ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth in this app)
CREATE POLICY "Allow public read" ON public.extractions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.extractions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.extractions FOR DELETE USING (true);

-- Create similarity search function
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
