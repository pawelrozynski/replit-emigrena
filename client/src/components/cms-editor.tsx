import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Plus, Edit2, Save } from "lucide-react";
import type { CmsContent } from "@db/schema";

export function CmsEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingKey, setEditingKey] = useState<{ id: string, key: string } | null>(null);

  const { data: contents = [], isLoading } = useQuery<CmsContent[]>({
    queryKey: ['/api/cms'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { key: string; content: string }) => {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      toast({
        title: "Treść dodana pomyślnie",
        variant: "default",
      });
      setNewKey("");
      setNewContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd dodawania treści",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; content: string; key?: string }) => {
      const res = await fetch(`/api/cms/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content, key: data.key }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      toast({
        title: "Treść zaktualizowana pomyślnie",
        variant: "default",
      });
      setEditingKey(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd aktualizacji treści",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newContent) return;

    createMutation.mutate({ key: newKey, content: newContent });
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Input
              placeholder="Klucz..."
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Treść..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <Button type="submit" disabled={!newKey || !newContent}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj treść
        </Button>
      </form>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Klucz</TableHead>
              <TableHead className="w-[60%]">Treść</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell>
                  {editingKey?.id === content.id ? (
                    <Input
                      value={editingKey.key}
                      onChange={(e) => setEditingKey({ id: content.id, key: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{content.key}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingKey({ id: content.id, key: content.key })}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Textarea
                    defaultValue={content.content}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue !== content.content) {
                        updateMutation.mutate({
                          id: content.id,
                          content: newValue,
                          key: editingKey?.id === content.id ? editingKey.key : undefined
                        });
                      }
                    }}
                    rows={2}
                  />
                </TableCell>
                <TableCell>
                  {editingKey?.id === content.id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateMutation.mutate({
                          id: content.id,
                          content: content.content,
                          key: editingKey.key
                        });
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Zapisz klucz
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground block mt-2">
                    Ostatnia aktualizacja:<br />
                    {new Date(content.updatedAt).toLocaleString('pl')}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}