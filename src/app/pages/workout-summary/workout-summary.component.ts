import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutLog } from '../../models/workout-log.model';

@Component({
  selector: 'app-workout-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-summary.component.html',
  styleUrls: ['./workout-summary.component.scss']
})
export class WorkoutSummaryComponent implements OnInit {
  log!: WorkoutLog;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = history.state as { log: WorkoutLog };
    if (!state?.log) {
      this.router.navigate(['/sessions']);
      return;
    }
    this.log = state.log;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m} min ${s} s` : `${s} s`;
  }

  goHome(): void {
    this.router.navigate(['/sessions']);
  }
}
