import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Session } from '../../models/session.model';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit {
  sessions: Session[] = [];
  lastDuration = new Map<string, number>();

  constructor(private storage: StorageService, private router: Router) {}

  ngOnInit(): void {
    this.sessions = this.storage.getSessions();
    const allLogs = this.storage.getAllLogs();
    for (const session of this.sessions) {
      const logs = allLogs.filter(l => l.sessionId === session.id);
      if (logs.length > 0) {
        const last = logs.reduce((a, b) => a.date > b.date ? a : b);
        this.lastDuration.set(session.id, last.totalDurationSeconds);
      }
    }
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  createNew(): void {
    this.router.navigate(['/session/new']);
  }

  editSession(session: Session): void {
    this.router.navigate(['/session', session.id]);
  }

  startWorkout(session: Session): void {
    this.router.navigate(['/workout', session.id]);
  }

  viewHistory(session: Session): void {
    this.router.navigate(['/history', session.id]);
  }
}
