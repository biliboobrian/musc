import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Session } from '../../models/session.model';
import { Exercise } from '../../models/exercise.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-session-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './session-edit.component.html',
  styleUrls: ['./session-edit.component.scss']
})
export class SessionEditComponent implements OnInit {
  session: Session = {
    id: '',
    name: '',
    restBetweenExercises: 90,
    exercises: []
  };
  isNew = true;
  showDeleteDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const existing = this.storage.getSessionById(id);
      if (existing) {
        this.session = JSON.parse(JSON.stringify(existing));
        this.isNew = false;
      }
    } else {
      this.session.id = this.storage.generateId();
      this.addExercise();
    }
  }

  addExercise(): void {
    const exercise: Exercise = {
      id: this.storage.generateId(),
      name: '',
      sets: 3,
      restTime: 60
    };
    this.session.exercises.push(exercise);
  }

  removeExercise(index: number): void {
    this.session.exercises.splice(index, 1);
  }

  moveUp(index: number): void {
    if (index > 0) {
      [this.session.exercises[index - 1], this.session.exercises[index]] =
        [this.session.exercises[index], this.session.exercises[index - 1]];
    }
  }

  moveDown(index: number): void {
    if (index < this.session.exercises.length - 1) {
      [this.session.exercises[index], this.session.exercises[index + 1]] =
        [this.session.exercises[index + 1], this.session.exercises[index]];
    }
  }

  save(): void {
    if (!this.session.name.trim()) return;
    this.storage.saveSession(this.session);
    this.router.navigate(['/sessions']);
  }

  confirmDelete(): void {
    this.showDeleteDialog = true;
  }

  doDelete(): void {
    this.storage.deleteSession(this.session.id);
    this.showDeleteDialog = false;
    this.router.navigate(['/sessions']);
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  back(): void {
    this.router.navigate(['/sessions']);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
