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
      const pdf = new jsPDF();
      const lineHeight = 7;
      const fontSize = 12;
      const marginLeft = 20;
      const marginTop = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - 2 * marginLeft;

      // Funkcja pomocnicza do dodawania tekstu z automatycznym podziałem na linie
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + (line ? ' ' : '') + words[i];
          const testWidth = pdf.getStringUnitWidth(testLine) * fontSize / pdf.internal.scaleFactor;

          if (testWidth > maxWidth) {
            pdf.text(line, x, currentY);
            line = words[i];
            currentY += lineHeight;

            // Dodaj nową stronę, jeśli tekst przekracza wysokość strony
            if (currentY >= pdf.internal.pageSize.getHeight() - marginTop) {
              pdf.addPage();
              currentY = marginTop + lineHeight;
            }
          } else {
            line = testLine;
          }
        }

        if (line) {
          pdf.text(line, x, currentY);
          currentY += lineHeight;
        }

        return currentY;
      };

      // Ustaw czcionkę i rozmiar
      pdf.setFont("helvetica");
      pdf.setFontSize(fontSize);

      // Tytuł
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      const title = "Dokumentacja eMigrena";
      const titleWidth = pdf.getStringUnitWidth(title) * 24 / pdf.internal.scaleFactor;
      const titleX = (pageWidth - titleWidth) / 2;
      pdf.text(title, titleX, marginTop);

      // Data wersji
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      const dateText = `Wersja z dnia: ${format(new Date(version.versionDate), "PP", { locale: pl })}`;
      const dateWidth = pdf.getStringUnitWidth(dateText) * 14 / pdf.internal.scaleFactor;
      const dateX = (pageWidth - dateWidth) / 2;
      pdf.text(dateText, dateX, marginTop + 10);

      // Treść dokumentacji
      pdf.setFontSize(fontSize);
      let currentY = marginTop + 20;

      // Podziel tekst na sekcje (według nagłówków)
      const sections = version.content.split(/^#+ /m);

      for (const section of sections) {
        if (!section.trim()) continue;

        // Sprawdź, czy potrzebna jest nowa strona
        if (currentY >= pdf.internal.pageSize.getHeight() - marginTop) {
          pdf.addPage();
          currentY = marginTop;
        }

        // Dodaj sekcję z zawijaniem tekstu
        currentY = addWrappedText(section.trim(), marginLeft, currentY, maxLineWidth);
        currentY += lineHeight; // Dodatkowy odstęp między sekcjami
      }

      // Zapisz PDF
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