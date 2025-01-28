import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWellbeing } from "@/hooks/use-wellbeing";
import { formSections } from "@/lib/types";
import type { WellbeingEntry } from "@db/schema";

function EntryDialog({ entry }: { entry: WellbeingEntry }) {
  const formatFieldValue = (value: any, type: string) => {
    if (value === null || value === undefined) return "-";
    if (type === "boolean") return value ? "Tak" : "Nie";
    return value.toString();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:bg-accent">
          <CardHeader>
            <CardTitle>
              {format(new Date(entry.date), "PP", { locale: pl })}
            </CardTitle>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Wpis z dnia {format(new Date(entry.date), "PP", { locale: pl })}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {formSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <div className="grid grid-cols-2 gap-4">
                {section.fields.map((field) => {
                  const value = entry[field.name as keyof WellbeingEntry];
                  if (value === null || value === undefined) return null;

                  return (
                    <div key={field.name}>
                      <p className="text-sm text-muted-foreground">{field.label}</p>
                      <p className="text-sm font-medium">
                        {formatFieldValue(value, field.type)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function EntriesList() {
  const { entries, isLoading } = useWellbeing();

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia wpisów</CardTitle>
        <CardDescription>
          Kliknij na wpis, aby zobaczyć szczegóły
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {entries.map((entry) => (
            <EntryDialog key={entry.id} entry={entry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}