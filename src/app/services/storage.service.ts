import { Injectable } from '@angular/core';
import { Session } from '../models/session.model';
import { WorkoutLog } from '../models/workout-log.model';

const SESSIONS_KEY = 'musc_sessions';
const LOGS_KEY = 'musc_workout_logs';

@Injectable({ providedIn: 'root' })
export class StorageService {

  getSessions(): Session[] {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  saveSession(session: Session): void {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    const logs = this.getLogsForSession(sessionId);
    if (logs.length > 0) {
      const allLogs = this.getAllLogs().filter(l => l.sessionId !== sessionId);
      localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
    }
  }

  getSessionById(id: string): Session | undefined {
    return this.getSessions().find(s => s.id === id);
  }

  getAllLogs(): WorkoutLog[] {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  getLogsForSession(sessionId: string): WorkoutLog[] {
    return this.getAllLogs().filter(l => l.sessionId === sessionId);
  }

  saveWorkoutLog(log: WorkoutLog): void {
    const logs = this.getAllLogs();
    logs.push(log);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
