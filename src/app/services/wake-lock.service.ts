import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WakeLockService {
  private wakeLock: WakeLockSentinel | null = null;

  async acquire(): Promise<void> {
    if (!('wakeLock' in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    } catch {
      // Refus possible en mode économie d'énergie
    }
  }

  async release(): Promise<void> {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  // Le wake lock est libéré automatiquement quand la page est masquée ;
  // on le réacquiert dès que la page redevient visible.
  private onVisibilityChange = async (): Promise<void> => {
    if (document.visibilityState === 'visible' && this.wakeLock === null) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
      } catch {
        // ignore
      }
    }
  };
}
