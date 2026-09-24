/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {BrowserService, IPC_RENDERER} from '@ame/shared';
import {Component, computed, inject, input} from '@angular/core';
import {TranslocoDirective} from '@jsverse/transloco';

interface WorkspaceValidationError {
  code: number;
  message: string;
  path: string;
}

interface MessagePart {
  text: string;
  isLink?: boolean;
  isError?: boolean;
  isSeparator?: boolean;
  applicationUrl?: string;
  fallbackUrl?: string;
}

@Component({
  selector: 'ame-workspace-error',
  templateUrl: './workspace-error.component.html',
  styleUrls: ['./workspace-error.component.scss'],
  imports: [TranslocoDirective],
})
export class WorkspaceErrorComponent {
  private readonly ipcRenderer = inject(IPC_RENDERER);
  private readonly browserService = inject(BrowserService);

  readonly error = input<WorkspaceValidationError>();

  readonly messageParts = computed<MessagePart[]>(() => {
    const msg = this.error()?.message;
    if (!msg) return [];

    const parts: MessagePart[] = [];

    // Matches either a "File: <path>" label (turned into a clickable link) or a "• Error:" label
    // (highlighted in red), wherever they occur in the message - there can be several of each.
    const regex = /(File:\s*)(\S+)|(•\s*Error:\s*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let fileCount = 0;

    while ((match = regex.exec(msg)) !== null) {
      if (match.index > lastIndex) {
        parts.push({text: msg.substring(lastIndex, match.index)});
      }

      if (match[1]) {
        // Separate each file block from the previous one with a horizontal rule.
        if (fileCount > 0) {
          parts.push({text: '', isSeparator: true});
        }
        fileCount++;

        // "File: " label followed by the file path
        parts.push({text: match[1]});
        const filePath = match[2];
        const cleanPath = filePath.replace(/^file:\/\//, '').replace(/^file:/, '');
        parts.push({
          text: filePath,
          isLink: true,
          applicationUrl: `vscode://file/${cleanPath}`,
          fallbackUrl: `file://${cleanPath}`,
        });
      } else if (match[3]) {
        // "• Error:" label
        parts.push({text: match[3], isError: true});
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < msg.length) {
      parts.push({text: msg.substring(lastIndex)});
    }

    return parts;
  });

  openLink(event: MouseEvent, part: MessagePart): void {
    event.preventDefault();

    if (!part.applicationUrl || !this.browserService.isStartedAsElectronApp()) return;

    // Try opening the file in VSCode first; if VSCode isn't installed on the system,
    // fall back to opening it with the OS default application for that file type.
    this.ipcRenderer.openInVsCodeOrDefault(part.applicationUrl, part.fallbackUrl ?? part.applicationUrl);
  }
}
