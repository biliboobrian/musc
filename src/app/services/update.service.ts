import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private swUpdate = inject(SwUpdate);
  readonly updateAvailable = signal(false);

  init(): void {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates.pipe(
      filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY')
    ).subscribe(() => this.updateAvailable.set(true));

    setInterval(() => this.swUpdate.checkForUpdate().catch(() => {}), 30 * 60 * 1000);
  }

  dismiss(): void {
    this.updateAvailable.set(false);
  }

  applyUpdate(): void {
    this.swUpdate.activateUpdate()
      .then(() => window.location.reload())
      .catch(() => window.location.reload());
  }
}
