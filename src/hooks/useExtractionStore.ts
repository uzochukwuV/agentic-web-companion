import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StoredExtraction {
  id: string;
  source_url: string;
  extraction_prompt: string;
  columns?: string[];
  data?: Record<string, string>[];
  total_records?: number;
  summary?: string;
  created_at: string;
  similarity?: number;
}

export const useExtractionStore = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [history, setHistory] = useState<StoredExtraction[]>([]);
  const [searchResults, setSearchResults] = useState<StoredExtraction[]>([]);

  const saveExtraction = async (extraction: {
    source_url: string;
    extraction_prompt: string;
    columns?: string[];
    data?: Record<string, string>[];
    total_records?: number;
  }) => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("embed-and-store", {
        body: { action: "store", ...extraction },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Save error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const searchExtractions = async (query: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("embed-and-store", {
        body: { action: "search", query },
      });
      if (error) throw error;
      setSearchResults(data?.results || []);
      return data;
    } catch (err) {
      console.error("Search error:", err);
      throw err;
    } finally {
      setIsSearching(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase.functions.invoke("embed-and-store", {
        body: { action: "list" },
      });
      if (error) throw error;
      setHistory(data?.results || []);
    } catch (err) {
      console.error("History error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getExtraction = async (id: string): Promise<StoredExtraction | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("embed-and-store", {
        body: { action: "get", id },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Get error:", err);
      return null;
    }
  };

  return {
    isSaving,
    isSearching,
    isLoadingHistory,
    history,
    searchResults,
    saveExtraction,
    searchExtractions,
    loadHistory,
    getExtraction,
  };
};
