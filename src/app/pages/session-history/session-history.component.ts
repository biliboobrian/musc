import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { WorkoutLog } from '../../models/workout-log.model';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.scss']
})
export class SessionHistoryComponent implements OnInit {
  sessionName = '';
  logs: WorkoutLog[] = [];
  expandedLogId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.logs = this.storage.getLogsForSession(id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const session = this.storage.getSessionById(id);
    this.sessionName = session?.name ?? 'Séance inconnue';
  }

  toggleLog(logId: string): void {
    this.expandedLogId = this.expandedLogId === logId ? null : logId;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m} min ${s} s` : `${s} s`;
  }

  back(): void {
    this.router.navigate(['/sessions']);
  }
}
