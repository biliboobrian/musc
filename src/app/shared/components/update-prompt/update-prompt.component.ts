import { Component, inject } from '@angular/core';
import { UpdateService } from '../../../services/update.service';

@Component({
  selector: 'app-update-prompt',
  standalone: true,
  templateUrl: './update-prompt.component.html',
  styleUrls: ['./update-prompt.component.scss']
})
export class UpdatePromptComponent {
  readonly update = inject(UpdateService);
}
