export interface Ejercicio {
  id: string;
  nombre: string;
  grupoMuscular: GrupoMuscular;
  series: number;
  repeticiones: number;
  peso?: number;
  unidad: 'kg' | 'lbs';
  notas?: string;
}

export type GrupoMuscular =
  | 'Pierna'
  | 'Abdomen'
  | 'Espalda'
  | 'Bíceps'
  | 'Pecho'
  | 'Hombros'
  | 'Tríceps'
  | 'Otro';

export const GRUPOS_MUSCULARES: GrupoMuscular[] = [
  'Pierna',
  'Abdomen',
  'Espalda',
  'Bíceps',
  'Pecho',
  'Hombros',
  'Tríceps',
  'Otro',
];

// Ejercicio sin ID para plantillas (se genera ID al aplicar)
export type EjercicioPlantilla = Omit<Ejercicio, 'id'>;

// Día de la semana: 1=Lunes ... 7=Domingo
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const NOMBRES_DIA: Record<DiaSemana, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export interface Plantilla {
  id: string;
  nombre: string;
  descripcion?: string;
  // Mapeo de día de semana a lista de ejercicios
  dias: Partial<Record<DiaSemana, EjercicioPlantilla[]>>;
  esPredefinida?: boolean;
}

export interface SesionEntrenamiento {
  id: string;
  fecha: string; // ISO date string YYYY-MM-DD
  diaDelAnio: number;
  semanaISO: number;
  anioISO: number;
  ejercicios: Ejercicio[];
  completada: boolean;
}

export interface RegistroPeso {
  id: string;
  fecha: string; // ISO date string YYYY-MM-DD
  peso: number;
  unidad: 'kg' | 'lbs';
}

export interface RutinaCompartida {
  id: string;
  token: string;
  ejercicios: Ejercicio[];
  nombreRutina: string;
  creadaEn: string;
  expiraEn?: string;
}
