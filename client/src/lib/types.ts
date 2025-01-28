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
        label: formCmsKeys.sections.sleepParameters.fields.sleepQuality,
        description: formCmsKeys.sections.sleepParameters.fields.sleepQualityDesc,
        type: "number", 
        min: 1, 
        max: 100 
      },
      { 
        name: "sleptWithWindowOpen", 
        label: formCmsKeys.sections.sleepParameters.fields.sleptWithWindowOpen,
        description: formCmsKeys.sections.sleepParameters.fields.sleptWithWindowOpenDesc,
        type: "boolean" 
      },
      { 
        name: "hadGoodDreams", 
        label: formCmsKeys.sections.sleepParameters.fields.hadGoodDreams,
        description: formCmsKeys.sections.sleepParameters.fields.hadGoodDreamsDesc,
        type: "boolean" 
      },
      { 
        name: "hadBadDreams", 
        label: formCmsKeys.sections.sleepParameters.fields.hadBadDreams,
        description: formCmsKeys.sections.sleepParameters.fields.hadBadDreamsDesc,
        type: "boolean" 
      },
      { 
        name: "wokeUpToToilet", 
        label: formCmsKeys.sections.sleepParameters.fields.wokeUpToToilet,
        description: formCmsKeys.sections.sleepParameters.fields.wokeUpToToiletDesc,
        type: "boolean" 
      },
      { 
        name: "sleepTime", 
        label: formCmsKeys.sections.sleepParameters.fields.sleepTime,
        description: formCmsKeys.sections.sleepParameters.fields.sleepTimeDesc,
        type: "time" 
      },
      { 
        name: "wakeTime", 
        label: formCmsKeys.sections.sleepParameters.fields.wakeTime,
        description: formCmsKeys.sections.sleepParameters.fields.wakeTimeDesc,
        type: "time" 
      },
      { 
        name: "neckStiffness", 
        label: formCmsKeys.sections.sleepParameters.fields.neckStiffness,
        description: formCmsKeys.sections.sleepParameters.fields.neckStiffnessDesc,
        type: "boolean" 
      },
      { 
        name: "timeToGetUp", 
        label: formCmsKeys.sections.sleepParameters.fields.timeToGetUp,
        description: formCmsKeys.sections.sleepParameters.fields.timeToGetUpDesc,
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
        label: formCmsKeys.sections.wellbeing.fields.workMotivation,
        description: formCmsKeys.sections.wellbeing.fields.workMotivationDesc,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "mood", 
        label: formCmsKeys.sections.wellbeing.fields.mood,
        description: formCmsKeys.sections.wellbeing.fields.moodDesc,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "socialSatisfaction", 
        label: formCmsKeys.sections.wellbeing.fields.socialSatisfaction,
        description: formCmsKeys.sections.wellbeing.fields.socialSatisfactionDesc,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "physicalActivityDesire", 
        label: formCmsKeys.sections.wellbeing.fields.physicalActivityDesire,
        description: formCmsKeys.sections.wellbeing.fields.physicalActivityDesireDesc,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "headache", 
        label: formCmsKeys.sections.wellbeing.fields.headache,
        description: formCmsKeys.sections.wellbeing.fields.headacheDesc,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "sleepiness", 
        label: formCmsKeys.sections.wellbeing.fields.sleepiness,
        description: formCmsKeys.sections.wellbeing.fields.sleepinessDesc,
        type: "number", 
        min: 0, 
        max: 10 
      },
      { 
        name: "physicalFatigue", 
        label: formCmsKeys.sections.wellbeing.fields.physicalFatigue,
        description: formCmsKeys.sections.wellbeing.fields.physicalFatigueDesc,
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
        label: formCmsKeys.sections.activityAndDiet.fields.stepsCount,
        description: formCmsKeys.sections.activityAndDiet.fields.stepsCountDesc,
        type: "number", 
        min: 0, 
        max: 100000 
      },
      { 
        name: "fullMealsCount", 
        label: formCmsKeys.sections.activityAndDiet.fields.fullMealsCount,
        description: formCmsKeys.sections.activityAndDiet.fields.fullMealsCountDesc,
        type: "number", 
        min: 0, 
        max: 5 
      },
      { 
        name: "fruitsVeggiesPortions", 
        label: formCmsKeys.sections.activityAndDiet.fields.fruitsVeggiesPortions,
        description: formCmsKeys.sections.activityAndDiet.fields.fruitsVeggiesPortionsDesc,
        type: "number", 
        min: 0, 
        max: 5 
      },
      { 
        name: "alcoholMl", 
        label: formCmsKeys.sections.activityAndDiet.fields.alcoholMl,
        description: formCmsKeys.sections.activityAndDiet.fields.alcoholMlDesc,
        type: "number", 
        min: 0, 
        max: 500 
      },
      { 
        name: "sweetsPortions", 
        label: formCmsKeys.sections.activityAndDiet.fields.sweetsPortions,
        description: formCmsKeys.sections.activityAndDiet.fields.sweetsPortionsDesc,
        type: "number", 
        min: 0, 
        max: 5 
      },
      { 
        name: "sweetDrinksPortions", 
        label: formCmsKeys.sections.activityAndDiet.fields.sweetDrinksPortions,
        description: formCmsKeys.sections.activityAndDiet.fields.sweetDrinksPortionsDesc,
        type: "number", 
        min: 0, 
        max: 10 
      }
    ]
  }
];