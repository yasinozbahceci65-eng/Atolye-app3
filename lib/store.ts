import { useState, useEffect, useCallback } from 'react';
import { supabase, Item, Category, Project } from './supabase';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*, categories(*)')
        .order('name');
      if (error) setError(error.message);
      else setItems(data ?? []);
    } catch {
      setError('Veriler yuklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch().catch(() => {}); }, [fetch]);

  return { items, loading, error, refetch: fetch };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('categories').select('*').order('name');
        setCategories(data ?? []);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  return { categories, loading };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select('*, project_materials(*)')
        .order('created_at', { ascending: false });
      setProjects(data ?? []);
    } catch {
      // supabase erisim hatasi
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch().catch(() => {}); }, [fetch]);

  return { projects, loading, refetch: fetch };
}
