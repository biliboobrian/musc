export interface SetLog {
  setNumber: number;
  durationSeconds: number;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  sets: SetLog[];
  averageDurationSeconds: number;
}

export interface WorkoutLog {
  id: string;
  sessionId: string;
  sessionName: string;
  date: string; // ISO string
  exerciseLogs: ExerciseLog[];
  totalDurationSeconds: number;
}
