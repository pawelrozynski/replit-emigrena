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
        <div style="
          padding: 40px;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
        ">
          <h1 style="
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
          ">Dokumentacja eMigrena</h1>
          <p style="
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
            text-align: center;
          ">Wersja z dnia: ${format(new Date(version.versionDate), "PP", { locale: pl })}</p>
          <div style="
            white-space: pre-wrap;
            text-align: justify;
          ">${version.content.replace(/\n\n/g, '<div style="height: 20px;"></div>')}</div>
        </div>
      `;
      document.body.appendChild(content);

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        width: 800,
      });

      document.body.removeChild(content);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Oblicz ile stron potrzebujemy
      const pageHeight = pdfHeight - 20; // Margines 10mm na górze i dole
      const imgAspectRatio = imgHeight / imgWidth;
      const pageWidth = pdfWidth - 20; // Margines 10mm po bokach
      const imgFitWidth = pageWidth;
      const imgFitHeight = imgFitWidth * imgAspectRatio;
      const pages = Math.ceil(imgFitHeight / pageHeight);

      // Podziel obraz na strony
      for (let page = 0; page < pages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const sourceY = page * (canvas.height / pages);
        const sourceHeight = canvas.height / pages;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        const ctx = tempCanvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );

          const pageImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(
            pageImgData,
            'PNG',
            10, // margines lewy
            10, // margines górny
            pageWidth,
            Math.min(pageHeight, imgFitHeight - (page * pageHeight))
          );
        }
      }

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