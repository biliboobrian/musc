import { Exercise } from './exercise.model';

export interface Session {
  id: string;
  name: string;
  restBetweenExercises: number; // seconds
  exercises: Exercise[];
}
