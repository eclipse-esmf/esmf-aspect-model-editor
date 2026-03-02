import {Component, input} from '@angular/core';

interface WorkspaceValidationError {
  code: number;
  message: string;
  path: string;
}

@Component({
  standalone: true,
  selector: 'ame-workspace-error',
  templateUrl: './workspace-error.component.html',
  styleUrls: ['./workspace-error.component.scss'],
})
export class WorkspaceErrorComponent {
  error = input<WorkspaceValidationError>();
}
