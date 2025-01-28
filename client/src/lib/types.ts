import { formCmsKeys } from "./cms-keys";

export interface FormSection {
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  description: string;
  type: "number" | "boolean" | "time";
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export const formSections: FormSection[] = [
  {
    title: formCmsKeys.sections.sleepParameters.title,
    description: formCmsKeys.sections.sleepParameters.description,
    fields: [
      { 
        name: "sleepQuality", 
        label: "Jakość snu", 
        description: formCmsKeys.sections.sleepParameters.fields.sleepQuality,
        type: "number", 
        min: 1, 
        max: 100 
      },
      { 
        name: "sleptWithWindowOpen", 
        label: "Spanie przy otwartym oknie", 
        description: formCmsKeys.sections.sleepParameters.fields.sleptWithWindowOpen,
        type: "boolean" 
      },
      { 
        name: "hadGoodDreams", 
        label: "Przyjemne sny", 
        description: formCmsKeys.sections.sleepParameters.fields.hadGoodDreams,
        type: "boolean" 
      },
      { 
        name: "hadBadDreams", 
        label: "Koszmary", 
        description: formCmsKeys.sections.sleepParameters.fields.hadBadDreams,
        type: "boolean" 
      },
      { 
        name: "wokeUpToToilet", 
        label: "Wybudzenie do toalety", 
        description: formCmsKeys.sections.sleepParameters.fields.wokeUpToToilet,
        type: "boolean" 
      },
      { 
        name: "sleepTime", 
        label: "Godzina położenia się spać", 
        description: formCmsKeys.sections.sleepParameters.fields.sleepTime,
        type: "time" 
      },
      { 
        name: "wakeTime", 
        label: "Godzina wstania", 
        description: formCmsKeys.sections.sleepParameters.fields.wakeTime,
        type: "time" 
      },
      { 
        name: "neckStiffness", 
        label: "Sztywność karku", 
        description: formCmsKeys.sections.sleepParameters.fields.neckStiffness,
        type: "boolean" 
      },
      { 
        name: "timeToGetUp", 
        label: "Czas do wstania (minuty)", 
        description: formCmsKeys.sections.sleepParameters.fields.timeToGetUp,
        type: "number", 
        min: 0, 
        max: 120 
      }
    ]
  },
  {
    title: formCmsKeys.sections.wellbeing.title,
    description: formCmsKeys.sections.wellbeing.description,
    fields: [
      { 
        name: "workMotivation", 
        label: "Motywacja do pracy", 
        description: formCmsKeys.sections.wellbeing.fields.workMotivation,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "mood", 
        label: "Nastrój", 
        description: formCmsKeys.sections.wellbeing.fields.mood,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "socialSatisfaction", 
        label: "Zadowolenie z kontaktów społecznych", 
        description: formCmsKeys.sections.wellbeing.fields.socialSatisfaction,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "physicalActivityDesire", 
        label: "Chęć do aktywności fizycznej", 
        description: formCmsKeys.sections.wellbeing.fields.physicalActivityDesire,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "headache", 
        label: "Intensywność bólu głowy", 
        description: formCmsKeys.sections.wellbeing.fields.headache,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "sleepiness", 
        label: "Senność", 
        description: formCmsKeys.sections.wellbeing.fields.sleepiness,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "physicalFatigue", 
        label: "Zmęczenie fizyczne", 
        description: formCmsKeys.sections.wellbeing.fields.physicalFatigue,
        type: "number", 
        min: 0, 
        max: 10 
      }
    ]
  },
  {
    title: formCmsKeys.sections.activityAndDiet.title,
    description: formCmsKeys.sections.activityAndDiet.description,
    fields: [
      { 
        name: "stepsCount", 
        label: "Liczba kroków", 
        description: formCmsKeys.sections.activityAndDiet.fields.stepsCount,
        type: "number", 
        min: 0, 
        max: 100000 
      },
      { 
        name: "fullMealsCount", 
        label: "Liczba pełnych posiłków", 
        description: formCmsKeys.sections.activityAndDiet.fields.fullMealsCount,
        type: "number", 
        min: 0, 
        max: 5 
      },
      { 
        name: "fruitsVeggiesPortions", 
        label: "Porcje owoców i warzyw", 
        description: formCmsKeys.sections.activityAndDiet.fields.fruitsVeggiesPortions,
        type: "number", 
        min: 0, 
        max: 5 
      },
      { 
        name: "alcoholMl", 
        label: "Spożycie alkoholu (ml)", 
        description: formCmsKeys.sections.activityAndDiet.fields.alcoholMl,
        type: "number", 
        min: 0, 
        max: 500 
      },
      { 
        name: "sweetsPortions", 
        label: "Porcje słodyczy", 
        description: formCmsKeys.sections.activityAndDiet.fields.sweetsPortions,
        type: "number", 
        min: 0, 
        max: 5 
      },
      { 
        name: "sweetDrinksPortions", 
        label: "Porcje słodkich napojów", 
        description: formCmsKeys.sections.activityAndDiet.fields.sweetDrinksPortions,
        type: "number", 
        min: 0, 
        max: 10 
      }
    ]
  }
];