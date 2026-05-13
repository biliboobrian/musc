import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <div class="dialog">
        <p class="message">{{ message }}</p>
        <div class="actions">
          <button class="btn-cancel" (click)="cancel.emit()">Annuler</button>
          <button class="btn-confirm" (click)="confirm.emit()">Confirmer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .dialog {
      background: #2a2a2a;
      border: 2px solid #ff8c00;
      border-radius: 8px;
      padding: 24px;
      max-width: 340px;
      width: 90%;
    }
    .message {
      color: #e0e0e0;
      font-size: 1rem;
      margin: 0 0 20px;
      text-align: center;
    }
    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn-cancel {
      background: transparent;
      border: 1px solid #666;
      color: #aaa;
      padding: 10px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .btn-confirm {
      background: #ff8c00;
      border: none;
      color: #1a1a1a;
      padding: 10px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.95rem;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() message = 'Êtes-vous sûr ?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.cancel.emit();
    }
  }
}
