import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NotificationService} from '@bci-web-core/core';

enum VisibleStep {
  selection = 'selection',
  noError = 'no-error',
  hasErrors = 'has-errors',
  incorrectFile = 'incorrect-file',
  missingFile = 'missing-file',
}

@Component({
  selector: 'bci-workspace-summary',
  templateUrl: './workspace-summary.component.html',
  styleUrls: ['./workspace-summary.component.scss'],
})
export class WorkspaceSummaryComponent {
  @Input() summary;
  @Output() filesToReplace = new EventEmitter<string[]>();

  public readonly icons = {
    violation: 'Bosch-Ic-notification-error',
    success: 'Bosch-Ic-notification-success',
  };
  public readonly step = VisibleStep;

  public visibleStep: VisibleStep = VisibleStep.selection;
  public incorrectFiles: string[] = [];
  public missingFiles: any;

  public validations = {};
  public errors: any[];
  public filesToOverwrite = {};
  public hasFilesToOverwrite = false;
  public selectedFilesToReplace: string[] = [];

  get namespaces() {
    if (!Object.keys(this.validations).length) {
      this.incorrectFiles = this.summary?.incorrectFiles || [];

      this.summary?.correctFiles.forEach(value => {
        const pieces = value.aspectModelFileName.split(':');
        const file = pieces.pop();
        const namespace = pieces.join(':');

        if (value.fileAlreadyDefined) {
          this.selectedFilesToReplace.push(value.aspectModelFileName);
          this.hasFilesToOverwrite ||= value.fileAlreadyDefined;

          if (this.filesToOverwrite[namespace]) {
            this.filesToOverwrite[namespace].push(file);
          } else {
            this.filesToOverwrite[namespace] = [file];
          }
        }

        if (!this.validations[namespace]) {
          this.validations[namespace] = [];
        }

        const errors = (value?.validationErrors || []).map(error => {
          error.focusNode = error.focusNode?.split('#')[1];
          error.resultSeverity = error.resultSeverity?.split('#')[1]?.toLowerCase();
          error.resultMessage = error.resultMessage?.replace(/ \(see focusNode\)/g, '');
          return error;
        });

        this.validations[namespace].push({file, errors});
      });
      this.filesToReplace.emit(this.selectedFilesToReplace);
    }
    return this.validations;
  }

  constructor(private notificationService: NotificationService) {}

  replaceFile(namespace: string, file: string) {
    this.selectedFilesToReplace = [...this.selectedFilesToReplace, `${namespace}:${file}`];
    this.filesToReplace.emit(this.selectedFilesToReplace);
  }

  keepFile(namespace: string, file: string) {
    this.selectedFilesToReplace = this.selectedFilesToReplace.filter(entry => entry !== `${namespace}:${file}`);
    this.filesToReplace.emit(this.selectedFilesToReplace);
  }

  async copySummaryToClipboard() {
    const textToClipboard = JSON.stringify(
      {
        namespaces: this.namespaces,
        incorrectFiles: this.incorrectFiles,
        missingFiles: this.missingFiles,
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(textToClipboard);
      this.notificationService.success('Summary copied to clipboard');
    } catch {
      this.notificationService.success('Error on copying summary to clipboard');
    }
  }
}
