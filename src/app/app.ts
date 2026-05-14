import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpdateService } from './services/update.service';
import { UpdatePromptComponent } from './shared/components/update-prompt/update-prompt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UpdatePromptComponent],
  template: `
    <router-outlet />
    <app-update-prompt />
  `
})
export class App implements OnInit {
  private updateService = inject(UpdateService);

  ngOnInit(): void {
    this.updateService.init();
  }
}
