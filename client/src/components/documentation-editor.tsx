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

// Funkcja pomocnicza do formatowania tekstu
const formatDocumentationText = (text: string) => {
  // Zamień nagłówki markdown na elementy HTML
  return text
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) {
        return `<h1 class="text-2xl font-bold mt-8 mb-4">${line.substring(2)}</h1>`;
      }
      if (line.startsWith('## ')) {
        return `<h2 class="text-xl font-semibold mt-6 mb-3">${line.substring(3)}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3 class="text-lg font-semibold mt-4 mb-2">${line.substring(4)}</h3>`;
      }
      if (line.startsWith('#### ')) {
        return `<h4 class="text-base font-semibold mt-3 mb-2">${line.substring(5)}</h4>`;
      }
      if (line.startsWith('- ')) {
        return `<li class="ml-4 mb-1">${line.substring(2)}</li>`;
      }
      if (line.trim() === '') {
        return '<div class="h-4"></div>';
      }
      return `<p class="mb-2">${line}</p>`;
    })
    .join('\n');
};

export function DocumentationEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

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
      setPreviewMode(false);
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
        {!previewMode ? (
          <Textarea
            placeholder="Treść nowej wersji dokumentacji..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
        ) : (
          <div className="border rounded-lg p-6 bg-white">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatDocumentationText(newContent) 
              }} 
            />
          </div>
        )}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? "Edytuj" : "Podgląd"}
          </Button>
          <Button type="submit" disabled={!newContent}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nową wersję
          </Button>
        </div>
      </form>

      <ScrollArea className="h-[600px] border rounded-lg">
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
                <TableCell className="whitespace-nowrap">
                  {format(new Date(version.versionDate), "PP", { locale: pl })}
                </TableCell>
                <TableCell>
                  <ScrollArea className="h-[400px]">
                    <div 
                      className="prose prose-sm max-w-none p-4"
                      dangerouslySetInnerHTML={{ 
                        __html: formatDocumentationText(version.content) 
                      }} 
                    />
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