import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formSections } from "@/lib/types";
import { useCms } from "@/hooks/use-cms";
import type { WellbeingEntry } from "@db/schema";
import { useWellbeing } from "@/hooks/use-wellbeing";

const defaultLabels = {
  // Sleep parameters
  sleep_quality_field_label: "Jakość snu",
  total_sleep_duration_field_label: "Całkowity czas snu",
  deep_sleep_duration_field_label: "Czas głębokiego snu",
  slept_with_window_open_field_label: "Spanie przy otwartym oknie",
  had_good_dreams_field_label: "Przyjemne sny",
  had_bad_dreams_field_label: "Koszmary",
  woke_up_to_toilet_field_label: "Wybudzenie do toalety",
  sleep_time_field_label: "Godzina położenia się spać",
  wake_time_field_label: "Godzina wstania",
  neck_stiffness_field_label: "Sztywność karku",
  time_to_get_up_field_label: "Czas do wstania (minuty)",

  // Wellbeing
  work_motivation_field_label: "Motywacja do pracy",
  mood_field_label: "Nastrój",
  social_satisfaction_field_label: "Zadowolenie z kontaktów społecznych",
  physical_activity_desire_field_label: "Chęć do aktywności fizycznej",
  headache_field_label: "Intensywność bólu głowy",
  sleepiness_field_label: "Senność",
  physical_fatigue_field_label: "Zmęczenie fizyczne",

  // Activity and diet
  steps_count_field_label: "Liczba kroków",
  full_meals_count_field_label: "Liczba pełnych posiłków",
  fruits_veggies_portions_field_label: "Porcje owoców i warzyw",
  alcohol_ml_field_label: "Spożycie alkoholu (ml)",
  sweets_portions_field_label: "Porcje słodyczy",
  sweet_drinks_portions_field_label: "Porcje słodkich napojów",

  // Sections
  sleep_parameters_section_title: "Parametry snu",
  sleep_parameters_section_description: "Informacje o jakości i ilości snu",
  wellbeing_section_title: "Samopoczucie",
  wellbeing_section_description: "Ocena samopoczucia w ciągu dnia",
  activity_diet_section_title: "Aktywność i dieta",
  activity_diet_section_description: "Informacje o aktywności fizycznej i diecie"
};

export function WellbeingForm() {
  const [date, setDate] = useState<Date>(new Date());
  const { createEntry } = useWellbeing();
  const { getContent } = useCms();

  const form = useForm<Omit<WellbeingEntry, 'userId' | 'id' | 'date' | 'createdAt'>>({
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

  const onSubmit = (data: Omit<WellbeingEntry, 'userId' | 'id' | 'date' | 'createdAt'>) => {
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
    } as WellbeingEntry);
  };

  const getLabel = (key: string) => {
    const content = getContent(key);
    return content === key ? defaultLabels[key as keyof typeof defaultLabels] || key : content;
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
              <CardTitle>{getLabel(section.title)}</CardTitle>
              <CardDescription>{getLabel(section.description)}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof Omit<WellbeingEntry, 'userId' | 'id' | 'date' | 'createdAt'>}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{getLabel(field.label)}</FormLabel>
                      <FormDescription>{getLabel(field.description)}</FormDescription>
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