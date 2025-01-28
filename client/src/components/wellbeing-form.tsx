import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formSections } from "@/lib/types";
import type { NewWellbeingEntry } from "@db/schema";
import { useWellbeing } from "@/hooks/use-wellbeing";

export function WellbeingForm() {
  const [date, setDate] = useState<Date>(new Date());
  const { createEntry } = useWellbeing();

  const form = useForm<Omit<NewWellbeingEntry, 'userId' | 'date'>>({
    defaultValues: {
      sleepQuality: null,
      totalSleepDuration: null,
      deepSleepDuration: null,
      sleptWithWindowOpen: null,
      hadGoodDreams: null,
      hadBadDreams: null,
      wokeUpToToilet: null,
      sleepTime: null,
      wakeTime: null,
      neckStiffness: null,
      timeToGetUp: null,
      workedFromHome: null,
      workMotivation: null,
      mood: null,
      socialSatisfaction: null,
      physicalActivityDesire: null,
      headache: null,
      sleepiness: null,
      physicalFatigue: null,
      stepsCount: null,
      fullMealsCount: null,
      fruitsVeggiesPortions: null,
      alcoholMl: null,
      sweetsPortions: null,
      sweetDrinksPortions: null,
    },
  });

  const onSubmit = (data: Omit<NewWellbeingEntry, 'userId' | 'date'>) => {
    // Ustaw datę na północ UTC wybranego dnia
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const submitDate = new Date(Date.UTC(year, month, day));

    // Sprawdź czy data nie jest z przyszłości
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (submitDate > today) {
      form.setError('root', {
        type: 'manual',
        message: 'Nie można dodawać wpisów z przyszłą datą'
      });
      return;
    }

    createEntry({
      ...data,
      date: submitDate,
    } as NewWellbeingEntry);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Data wpisu</CardTitle>
            <CardDescription>Wybierz datę, której dotyczy wpis</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? (
                    format(date, "PP", { locale: pl })
                  ) : (
                    <span>Wybierz datę</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  locale={pl}
                  disabled={(date) => {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    return date > now;
                  }}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.root && (
              <p className="mt-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
          </CardContent>
        </Card>

        {formSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof Omit<NewWellbeingEntry, 'userId' | 'date'>}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        {field.type === "boolean" ? (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formField.value === true}
                              onCheckedChange={(checked) => {
                                formField.onChange(checked);
                              }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {formField.value === true ? "Tak" : formField.value === false ? "Nie" : "Nie podano"}
                            </span>
                          </div>
                        ) : field.type === "time" ? (
                          <Input
                            type="time"
                            {...formField}
                            value={formField.value || ""}
                            onChange={(e) => formField.onChange(e.target.value || null)}
                          />
                        ) : (
                          <Input
                            type="number"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            {...formField}
                            value={formField.value || ""}
                            onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>
        ))}

        <Button type="submit" className="w-full">
          Zapisz wpis
        </Button>
      </form>
    </Form>
  );
}