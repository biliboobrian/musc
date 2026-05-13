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

  constructor(private storage: StorageService, private router: Router) {}

  ngOnInit(): void {
    this.sessions = this.storage.getSessions();
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
