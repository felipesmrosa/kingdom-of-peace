export type TemplateExercise = { name: string; sets: number; reps: string };
export type TemplateRoutine = { name: string; weekdays: number[]; exercises: TemplateExercise[] };
export type Template = {
  id: string;
  name: string;
  description: string;
  routines: TemplateRoutine[];
};

export const TEMPLATES: Template[] = [
  {
    id: "abc",
    name: "ABC",
    description: "3 treinos por semana: peito e tríceps, costas e bíceps, pernas e ombros.",
    routines: [
      {
        name: "A · Peito e tríceps",
        weekdays: [1],
        exercises: [
          { name: "Supino reto", sets: 4, reps: "8-10" },
          { name: "Supino inclinado com halteres", sets: 3, reps: "10" },
          { name: "Crucifixo", sets: 3, reps: "12" },
          { name: "Tríceps corda", sets: 3, reps: "12" },
          { name: "Tríceps testa", sets: 3, reps: "10" },
        ],
      },
      {
        name: "B · Costas e bíceps",
        weekdays: [3],
        exercises: [
          { name: "Puxada frontal", sets: 4, reps: "10" },
          { name: "Remada curvada", sets: 4, reps: "8-10" },
          { name: "Remada baixa", sets: 3, reps: "12" },
          { name: "Rosca direta", sets: 3, reps: "10" },
          { name: "Rosca martelo", sets: 3, reps: "12" },
        ],
      },
      {
        name: "C · Pernas e ombros",
        weekdays: [5],
        exercises: [
          { name: "Agachamento livre", sets: 4, reps: "8" },
          { name: "Leg press", sets: 4, reps: "10" },
          { name: "Cadeira extensora", sets: 3, reps: "12" },
          { name: "Mesa flexora", sets: 3, reps: "12" },
          { name: "Desenvolvimento com halteres", sets: 3, reps: "10" },
          { name: "Elevação lateral", sets: 3, reps: "12" },
          { name: "Panturrilha em pé", sets: 4, reps: "15" },
        ],
      },
    ],
  },
  {
    id: "full-body",
    name: "Corpo inteiro",
    description: "1 treino completo, 3 vezes por semana (seg, qua e sex).",
    routines: [
      {
        name: "Corpo inteiro",
        weekdays: [1, 3, 5],
        exercises: [
          { name: "Agachamento livre", sets: 3, reps: "8-10" },
          { name: "Supino reto", sets: 3, reps: "8-10" },
          { name: "Remada curvada", sets: 3, reps: "8-10" },
          { name: "Desenvolvimento com halteres", sets: 3, reps: "10" },
          { name: "Stiff", sets: 3, reps: "10" },
          { name: "Prancha", sets: 3, reps: "30" },
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "Superior e inferior",
    description: "4 treinos por semana alternando parte de cima e parte de baixo.",
    routines: [
      {
        name: "Superior",
        weekdays: [1, 4],
        exercises: [
          { name: "Supino reto", sets: 4, reps: "8-10" },
          { name: "Puxada frontal", sets: 4, reps: "10" },
          { name: "Desenvolvimento com halteres", sets: 3, reps: "10" },
          { name: "Remada baixa", sets: 3, reps: "12" },
          { name: "Rosca direta", sets: 3, reps: "12" },
          { name: "Tríceps corda", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Inferior",
        weekdays: [2, 5],
        exercises: [
          { name: "Agachamento livre", sets: 4, reps: "8" },
          { name: "Leg press", sets: 4, reps: "10" },
          { name: "Stiff", sets: 3, reps: "10" },
          { name: "Cadeira extensora", sets: 3, reps: "12" },
          { name: "Mesa flexora", sets: 3, reps: "12" },
          { name: "Panturrilha em pé", sets: 4, reps: "15" },
        ],
      },
    ],
  },
];

/** Sugestões para o campo de nome do exercício. */
export const EXERCISE_CATALOG: string[] = [
  "Supino reto",
  "Supino inclinado",
  "Supino inclinado com halteres",
  "Supino declinado",
  "Crucifixo",
  "Crossover",
  "Flexão de braço",
  "Puxada frontal",
  "Puxada articulada",
  "Barra fixa",
  "Remada curvada",
  "Remada baixa",
  "Remada unilateral",
  "Levantamento terra",
  "Stiff",
  "Agachamento livre",
  "Agachamento no smith",
  "Agachamento búlgaro",
  "Leg press",
  "Cadeira extensora",
  "Mesa flexora",
  "Cadeira abdutora",
  "Cadeira adutora",
  "Afundo",
  "Hip thrust",
  "Panturrilha em pé",
  "Panturrilha sentado",
  "Desenvolvimento com halteres",
  "Desenvolvimento militar",
  "Elevação lateral",
  "Elevação frontal",
  "Crucifixo invertido",
  "Encolhimento",
  "Rosca direta",
  "Rosca alternada",
  "Rosca martelo",
  "Rosca scott",
  "Tríceps corda",
  "Tríceps testa",
  "Tríceps francês",
  "Mergulho",
  "Abdominal",
  "Prancha",
  "Elevação de pernas",
];
