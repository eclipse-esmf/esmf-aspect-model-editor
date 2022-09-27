/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {NotificationsService} from '@ame/shared';

enum VisibleStep {
  selection = 'selection',
  noError = 'no-error',
  hasErrors = 'has-errors',
  incorrectFile = 'incorrect-file',
  missingFile = 'missing-file',
}

@Component({
  selector: 'ame-workspace-summary',
  templateUrl: './workspace-summary.component.html',
  styleUrls: ['./workspace-summary.component.scss'],
})
export class WorkspaceSummaryComponent implements AfterViewInit {
  @Input() summary;
  @Input() readyToImport: boolean;
  @Output() hasMissingFiles = new EventEmitter<boolean>();
  @Output() namespacesToImport = new EventEmitter<string[]>();
  @Output() hasNamespacesToOverwrite = new EventEmitter<boolean>();
  @Output() replace = new EventEmitter();
  @Output() keep = new EventEmitter();

  public readonly icons = {
    violation: 'error',
    success: 'done',
  };
  public readonly step = VisibleStep;

  public visibleStep: VisibleStep = VisibleStep.selection;
  public invalidFiles: string[] = [];
  public missingFiles: any;

  public validations = {};
  public errors: any[];
  public filesToOverwrite = {};
  public hasFilesToOverwrite = false;
  public selectedFilesToReplace: string[] = [];
  public filesForWorkspace: string[] = [];

  public namespaces: {[key: string]: any};

  constructor(private notificationService: NotificationsService) {}

  ngAfterViewInit(): void {
    if (!Object.keys(this.validations).length) {
      this.invalidFiles = this.summary?.invalidFiles || [];
      const replaceNamespacesSet = new Set<string>();
      const keepNamespacesSet = new Set<string>();

      this.summary?.validFiles.forEach(value => {
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
          error.resultMessage = error.resultMessage?.replace(/ \(see focusNode\)/g, '').split('\n');
          return error;
        });

        this.validations[namespace].push({file, errors});
      });

      this.selectedFilesToReplace = Array.from<string>(replaceNamespacesSet);
      this.filesForWorkspace = Array.from(new Set([...this.selectedFilesToReplace, ...Array.from(keepNamespacesSet)]));

      this.namespacesToImport.emit(this.filesForWorkspace);
      this.hasNamespacesToOverwrite.emit(this.hasFilesToOverwrite);

      if (this.summary?.missingFiles) {
        this.missingFiles = this.summary.missingFiles?.map(data => {
          const [analysedFile] = (data.analysedFile || '').split('/').reverse();
          const errorMessage = data.errorMessage.split('\n');

          return {
            analysedFile,
            errorMessage,
            missingFile: data.missingFile,
          };
        });
      }

      this.hasMissingFiles.emit(this.missingFiles?.length > 0);
    }

    this.namespaces = this.validations;
  }

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
        invalidFiles: this.invalidFiles,
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
