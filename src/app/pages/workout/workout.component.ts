import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AudioService } from '../../services/audio.service';
import { Session } from '../../models/session.model';
import { Exercise } from '../../models/exercise.model';
import { ExerciseLog, SetLog, WorkoutLog } from '../../models/workout-log.model';

type WorkoutPhase = 'idle' | 'countdown' | 'active' | 'rest' | 'session-rest' | 'done';

const CIRCLE_RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.scss']
})
export class WorkoutComponent implements OnInit, OnDestroy {
  session!: Session;
  currentExerciseIndex = 0;
  currentSetIndex = 0;
  phase: WorkoutPhase = 'idle';
  countdownValue = 0;
  countdownTotal = 0;
  readonly circumference = CIRCUMFERENCE;
  setStartTime = 0;
  exerciseLogs: ExerciseLog[] = [];
  currentSetLogs: SetLog[] = [];
  workoutStartTime = 0;
  private historicalSets = new Map<string, SetLog[]>();

  get currentHistoricalSet() {
    return this.historicalSets.get(this.currentExercise?.id)
      ?.find(s => s.setNumber === this.currentSetIndex + 1);
  }

  get restingSetWeight(): number {
    return this.currentSetLogs[this.currentSetLogs.length - 1]?.weight ?? 0;
  }
  set restingSetWeight(value: number) {
    if (this.currentSetLogs.length > 0) {
      this.currentSetLogs[this.currentSetLogs.length - 1].weight = value;
    }
  }

  get restingSetReps(): number {
    return this.currentSetLogs[this.currentSetLogs.length - 1]?.reps ?? 0;
  }
  set restingSetReps(value: number) {
    if (this.currentSetLogs.length > 0) {
      this.currentSetLogs[this.currentSetLogs.length - 1].reps = value;
    }
  }

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private audio: AudioService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
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

    const allLogs = this.storage.getAllLogs();
    const sessionLogs = allLogs.filter(l => l.sessionId === s.id);
    if (sessionLogs.length > 0) {
      const lastLog = sessionLogs.reduce((a, b) => a.date > b.date ? a : b);
      for (const exLog of lastLog.exerciseLogs) {
        this.historicalSets.set(exLog.exerciseId, exLog.sets);
      }
    }

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
    const completedSetNumber = this.currentSetIndex + 1;
    const prev = this.currentSetLogs[this.currentSetLogs.length - 1];
    const hist = prev === undefined
      ? this.historicalSets.get(this.currentExercise.id)?.find(s => s.setNumber === completedSetNumber)
      : undefined;
    const prevWeight = prev?.weight ?? hist?.weight ?? 0;
    const prevReps = prev?.reps ?? hist?.reps ?? 0;
    this.currentSetLogs.push({ setNumber: completedSetNumber, durationSeconds, weight: prevWeight, reps: prevReps });
    this.currentSetIndex++;
    this.clearTimer();

    const allSetsForExerciseDone = this.currentSetIndex >= this.currentExercise.sets;

    if (allSetsForExerciseDone) {
      if (this.isLastExercise) {
        this.finalizeExerciseLog();
        this.finishWorkout();
      } else {
        this.startCountdown(this.session.restBetweenExercises, () => {
          this.finalizeExerciseLog();
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

  get dashOffset(): number {
    if (this.countdownTotal === 0) return 0;
    return CIRCUMFERENCE * (1 - this.countdownValue / this.countdownTotal);
  }

  private startCountdown(seconds: number, onDone: () => void, phaseOverride?: WorkoutPhase): void {
    this.clearTimer();
    this.countdownValue = seconds;
    this.countdownTotal = seconds;
    this.phase = phaseOverride ?? 'countdown';

    if (seconds === 0) {
      onDone();
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => {
          this.countdownValue--;
          if (this.countdownValue <= 3 && this.countdownValue > 0) {
            this.audio.playBeep(880, 0.12);
          }
          if (this.countdownValue === 0) {
            this.clearTimer();
            onDone();
          }
          this.cdr.markForCheck();
        });
      }, 1000);
    });
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
