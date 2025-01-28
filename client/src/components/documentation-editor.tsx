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
import { Loader2, Plus, Download } from "lucide-react";
import type { DocumentationVersion } from "@db/schema";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const exportToPDF = async (version: DocumentationVersion) => {
    try {
      const content = document.createElement('div');
      content.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Dokumentacja eMigrena</h1>
          <p style="color: #666;">Wersja z dnia: ${format(new Date(version.versionDate), "PP", { locale: pl })}</p>
          <div style="margin-top: 20px; white-space: pre-wrap;">${version.content}</div>
        </div>
      `;
      document.body.appendChild(content);

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      document.body.removeChild(content);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`dokumentacja-emigrena-${format(new Date(version.versionDate), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF wygenerowany pomyślnie",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Błąd generowania PDF",
        description: "Nie udało się wygenerować pliku PDF",
        variant: "destructive",
      });
    }
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
          className="font-mono"
        />
        <Button type="submit" disabled={!newContent}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj nową wersję
        </Button>
      </form>

      <ScrollArea className="h-[600px] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data wersji</TableHead>
              <TableHead className="w-[60%]">Treść</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>
                  {format(new Date(version.versionDate), "PP", { locale: pl })}
                </TableCell>
                <TableCell>
                  <ScrollArea className="h-[200px]">
                    <div className="whitespace-pre-wrap p-4 font-mono">
                      {version.content}
                    </div>
                  </ScrollArea>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToPDF(version)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Eksportuj PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}