import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NotificationsService} from '@bame/shared';

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
  @Output() namespacesToImport = new EventEmitter<string[]>();
  @Output() hasNamespacesToOverwrite = new EventEmitter<boolean>();
  @Output() replace = new EventEmitter();
  @Output() keep = new EventEmitter();

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
  public filesForWorkspace: string[] = [];

  get namespaces() {
    if (!Object.keys(this.validations).length) {
      this.incorrectFiles = this.summary?.incorrectFiles || [];
      const replaceNamespacesSet = new Set<string>();
      const keepNamespacesSet = new Set<string>();

      this.summary?.correctFiles.forEach(value => {
        const pieces = value.aspectModelFileName.split(':');
        const file = pieces.pop();
        const namespace = pieces.join(':');

        if (value.fileAlreadyDefined) {
          replaceNamespacesSet.add(namespace);
          this.hasFilesToOverwrite ||= value.fileAlreadyDefined;

          if (this.filesToOverwrite[namespace]) {
            this.filesToOverwrite[namespace].push(file);
          } else {
            this.filesToOverwrite[namespace] = [file];
          }
        } else {
          keepNamespacesSet.add(namespace);
        }

        if (!this.validations[namespace]) {
          this.validations[namespace] = [];
        }

        const errors = (value?.validationReport?.validationErrors || []).map(error => {
          error.focusNode = error.focusNode?.split('#')[1];
          error.resultSeverity = error.resultSeverity?.split('#')[1]?.toLowerCase();
          error.resultMessage = error.resultMessage?.replace(/ \(see focusNode\)/g, '');
          return error;
        });

        this.validations[namespace].push({file, errors});
      });

      this.selectedFilesToReplace = Array.from<string>(replaceNamespacesSet);
      this.filesForWorkspace = Array.from(new Set([...this.selectedFilesToReplace, ...Array.from(keepNamespacesSet)]));

      this.namespacesToImport.emit(this.filesForWorkspace);
      this.hasNamespacesToOverwrite.emit(this.hasFilesToOverwrite);
    }
    return this.validations;
  }

  constructor(private notificationService: NotificationsService) {}

  replaceNamespace(namespace: string) {
    this.replace.emit(namespace);
  }

  keepNamespace(namespace: string) {
    this.keep.emit(namespace);
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
