import {Component, input} from '@angular/core';

interface WorkspaceValidationError {
  code: number;
  message: string;
  path: string;
}

@Component({
  standalone: true,
  selector: 'ame-workspace-error',
  template: `
    <h2>Workspace validation error!</h2>
    <p>It seems at least one workspace file has validation errors. Fix or remove the errored file then refresh the workspace.</p>
    <span>{{ error()?.message }}</span>
  `,
  styles: [
    `
      span {
        font-size: 14px;
        font-weight: 500;
        line-height: 1.2;
      }

      p {
        line-height: 1.5;
      }
    `,
  ],
})
export class WorkspaceErrorComponent {
  error = input<WorkspaceValidationError>();
}
