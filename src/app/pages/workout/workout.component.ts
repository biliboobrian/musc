import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AudioService } from '../../services/audio.service';
import { Session } from '../../models/session.model';
import { Exercise } from '../../models/exercise.model';
import { ExerciseLog, SetLog, WorkoutLog } from '../../models/workout-log.model';

type WorkoutPhase = 'idle' | 'countdown' | 'active' | 'rest' | 'session-rest' | 'done';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.scss']
})
export class WorkoutComponent implements OnInit, OnDestroy {
  session!: Session;
  currentExerciseIndex = 0;
  currentSetIndex = 0;
  phase: WorkoutPhase = 'idle';
  countdownValue = 0;
  setStartTime = 0;
  exerciseLogs: ExerciseLog[] = [];
  currentSetLogs: SetLog[] = [];
  workoutStartTime = 0;

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private audio: AudioService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    const s = this.storage.getSessionById(id);
    if (!s || s.exercises.length === 0) {
      this.router.navigate(['/sessions']);
      return;
    }
    this.session = s;
    this.workoutStartTime = Date.now();
    this.initExerciseLog(this.currentExerciseIndex);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get currentExercise(): Exercise {
    return this.session.exercises[this.currentExerciseIndex];
  }

  get setsLabel(): string {
    return `${this.currentSetIndex} / ${this.currentExercise.sets}`;
  }

  get isLastSet(): boolean {
    return this.currentSetIndex === this.currentExercise.sets - 1;
  }

  get isLastExercise(): boolean {
    return this.currentExerciseIndex === this.session.exercises.length - 1;
  }

  get isFirstSetOfFirstExercise(): boolean {
    return this.currentExerciseIndex === 0 && this.currentSetIndex === 0;
  }

  pressPlay(): void {
    if (this.isFirstSetOfFirstExercise) {
      this.startCountdown(5, () => this.startSet());
    } else {
      this.startSet();
    }
  }

  pressStop(): void {
    const durationSeconds = Math.round((Date.now() - this.setStartTime) / 1000);
    this.currentSetLogs.push({ setNumber: this.currentSetIndex + 1, durationSeconds });
    this.currentSetIndex++;
    this.clearTimer();

    const allSetsForExerciseDone = this.currentSetIndex >= this.currentExercise.sets;

    if (allSetsForExerciseDone) {
      this.finalizeExerciseLog();
      if (this.isLastExercise) {
        this.finishWorkout();
      } else {
        this.startCountdown(this.session.restBetweenExercises, () => {
          this.currentExerciseIndex++;
          this.currentSetIndex = 0;
          this.currentSetLogs = [];
          this.initExerciseLog(this.currentExerciseIndex);
          this.phase = 'idle';
        }, 'session-rest');
      }
    } else {
      this.startCountdown(this.currentExercise.restTime, () => {
        this.phase = 'idle';
      }, 'rest');
    }
  }

  private startSet(): void {
    this.phase = 'active';
    this.setStartTime = Date.now();
  }

  private startCountdown(seconds: number, onDone: () => void, phaseOverride?: WorkoutPhase): void {
    this.clearTimer();
    this.countdownValue = seconds;
    this.phase = phaseOverride ?? 'countdown';

    if (seconds === 0) {
      onDone();
      return;
    }

    this.timer = setInterval(() => {
      this.countdownValue--;
      if (this.countdownValue <= 3 && this.countdownValue > 0) {
        this.audio.playBeep(880, 0.12);
      }
      if (this.countdownValue === 0) {
        this.clearTimer();
        onDone();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private initExerciseLog(index: number): void {
    this.currentSetLogs = [];
    const ex = this.session.exercises[index];
    this.exerciseLogs[index] = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      weight: ex.weight,
      sets: [],
      averageDurationSeconds: 0
    };
  }

  private finalizeExerciseLog(): void {
    const log = this.exerciseLogs[this.currentExerciseIndex];
    log.sets = [...this.currentSetLogs];
    const total = log.sets.reduce((acc, s) => acc + s.durationSeconds, 0);
    log.averageDurationSeconds = log.sets.length > 0 ? Math.round(total / log.sets.length) : 0;
  }

  private finishWorkout(): void {
    this.phase = 'done';
    const totalDuration = Math.round((Date.now() - this.workoutStartTime) / 1000);
    const workoutLog: WorkoutLog = {
      id: this.storage.generateId(),
      sessionId: this.session.id,
      sessionName: this.session.name,
      date: new Date().toISOString(),
      exerciseLogs: this.exerciseLogs,
      totalDurationSeconds: totalDuration
    };
    this.storage.saveWorkoutLog(workoutLog);
    this.router.navigate(['/summary'], { state: { log: workoutLog } });
  }

  back(): void {
    this.clearTimer();
    this.router.navigate(['/sessions']);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
}
