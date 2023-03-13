/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {ExportPackage} from '../../interfaces/export-package';
import {VisibleStep} from '../../enum';
import {MissingElement, ValidFile, Violation, ViolationError} from '../../interfaces';

@Component({
  selector: 'ame-workspace-summary',
  templateUrl: './workspace-summary.component.html',
  styleUrls: ['./workspace-summary.component.scss'],
})
export class WorkspaceSummaryComponent implements AfterViewInit {
  @Input() summary: ExportPackage;
  @Input() readyToImport: boolean;

  @Output() hasMissingElements = new EventEmitter<boolean>();
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
  public missingElements: MissingElement[];

  public violations: Violation[] = [];
  public errors: ViolationError[];
  public filesToOverwrite = {};
  public hasFilesToOverwrite = false;
  public selectedFilesToReplace: string[] = [];
  public filesForWorkspace: string[] = [];

  constructor(private notificationService: NotificationsService) {}

  ngAfterViewInit() {
    if (this.violations.length) {
      return;
    }

    const replaceNamespacesSet = new Set<string>();
    const keepNamespacesSet = new Set<string>();

    if (this.summary) {
      this.invalidFiles = this.summary.invalidFiles || [];
      this.processValidFiles(this.summary.validFiles, replaceNamespacesSet, keepNamespacesSet);

      this.missingElements = this.summary.missingElements || [];
      this.hasMissingElements.emit(this.summary.missingElements?.length > 0);
    }

    this.selectedFilesToReplace = Array.from<string>(replaceNamespacesSet);
    this.filesForWorkspace = Array.from(new Set([...this.selectedFilesToReplace, ...Array.from(keepNamespacesSet)]));

    this.namespacesToImport.emit(this.filesForWorkspace);
    this.hasNamespacesToOverwrite.emit(this.hasFilesToOverwrite);
  }

  private processValidFiles(validFiles: ValidFile[], replaceNamespacesSet: Set<string>, keepNamespacesSet: Set<string>) {
    validFiles?.forEach(value => {
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

      if (!this.violations.length) {
        this.violations.push({key: namespace, value: []});
      }

      const violationErrors = value?.violationReport?.violationErrors || [];

      this.violations
        .find(violation => violation.key === namespace)
        ?.value.push({
          file: file,
          violationError: violationErrors,
        });
    });
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
        namespaces: this.violations,
        invalidFiles: this.invalidFiles,
        missingElements: this.missingElements,
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(textToClipboard);
      this.notificationService.success({title: 'Summary copied to clipboard'});
    } catch {
      this.notificationService.success({title: 'Error on copying summary to clipboard'});
    }
  }
}
