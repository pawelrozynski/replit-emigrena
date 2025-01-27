import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { WellbeingEntry, NewWellbeingEntry } from '@db/schema';

export function useWellbeing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<WellbeingEntry[]>({
    queryKey: ['/api/entries'],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: NewWellbeingEntry) => {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      toast({
        title: "Wpis dodany pomyślnie",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd dodawania wpisu",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    entries,
    isLoading,
    createEntry: createEntryMutation.mutate,
  };
}
