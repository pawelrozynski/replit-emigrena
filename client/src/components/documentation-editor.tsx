import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import type { DocumentationVersion } from "@db/schema";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export function DocumentationEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState("");

  const { data: versions = [], isLoading } = useQuery<DocumentationVersion[]>({
    queryKey: ['/api/documentation'],
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          versionDate: new Date().toISOString(),
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documentation'] });
      toast({
        title: "Wersja dokumentacji dodana pomyślnie",
        variant: "default",
      });
      setNewContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd dodawania dokumentacji",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent) return;
    createMutation.mutate(newContent);
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Treść nowej wersji dokumentacji..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={8}
        />
        <Button type="submit" disabled={!newContent}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj nową wersję
        </Button>
      </form>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data wersji</TableHead>
              <TableHead className="w-[70%]">Treść</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>
                  {format(new Date(version.versionDate), "PP", { locale: pl })}
                </TableCell>
                <TableCell>
                  <ScrollArea className="h-[100px]">
                    <div className="whitespace-pre-wrap p-2">
                      {version.content}
                    </div>
                  </ScrollArea>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
