export interface FormSection {
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: "number" | "boolean" | "time";
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export const formSections: FormSection[] = [
  {
    title: "Parametry snu",
    description: "Informacje o jakości i długości snu",
    fields: [
      { name: "sleepQuality", label: "Jakość snu", type: "number", min: 1, max: 100 },
      { name: "sleptWithWindowOpen", label: "Spanie przy otwartym oknie", type: "boolean" },
      { name: "hadGoodDreams", label: "Przyjemne sny", type: "boolean" },
      { name: "hadBadDreams", label: "Koszmary", type: "boolean" },
      { name: "wokeUpToToilet", label: "Wybudzenie do toalety", type: "boolean" },
      { name: "sleepTime", label: "Godzina położenia się spać", type: "time" },
      { name: "wakeTime", label: "Godzina wstania", type: "time" },
      { name: "neckStiffness", label: "Sztywność karku", type: "boolean" },
      { name: "timeToGetUp", label: "Czas do wstania (minuty)", type: "number", min: 0, max: 120 }
    ]
  },
  {
    title: "Samopoczucie",
    description: "Ocena samopoczucia w skali 0-10",
    fields: [
      { name: "workMotivation", label: "Motywacja do pracy", type: "number", min: 0, max: 10 },
      { name: "mood", label: "Nastrój", type: "number", min: 0, max: 10 },
      { name: "socialSatisfaction", label: "Zadowolenie z kontaktów społecznych", type: "number", min: 0, max: 10 },
      { name: "physicalActivityDesire", label: "Chęć do aktywności fizycznej", type: "number", min: 0, max: 10 },
      { name: "headache", label: "Intensywność bólu głowy", type: "number", min: 0, max: 10 },
      { name: "sleepiness", label: "Senność", type: "number", min: 0, max: 10 },
      { name: "physicalFatigue", label: "Zmęczenie fizyczne", type: "number", min: 0, max: 10 }
    ]
  },
  {
    title: "Aktywność i dieta",
    description: "Informacje o aktywności fizycznej i diecie",
    fields: [
      { name: "stepsCount", label: "Liczba kroków", type: "number", min: 0, max: 100000 },
      { name: "fullMealsCount", label: "Liczba pełnych posiłków", type: "number", min: 0, max: 5 },
      { name: "fruitsVeggiesPortions", label: "Porcje owoców i warzyw", type: "number", min: 0, max: 5 },
      { name: "alcoholMl", label: "Spożycie alkoholu (ml)", type: "number", min: 0, max: 500 },
      { name: "sweetsPortions", label: "Porcje słodyczy", type: "number", min: 0, max: 5 },
      { name: "sweetDrinksPortions", label: "Porcje słodkich napojów", type: "number", min: 0, max: 10 }
    ]
  }
];
