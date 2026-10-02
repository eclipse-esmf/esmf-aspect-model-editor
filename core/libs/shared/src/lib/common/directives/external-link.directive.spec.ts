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

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BrowserService} from '../services/browser.service';
import {IPC_RENDERER} from '../tauri-ipc.provider';
import {ExternalLinkDirective} from './external-link.directive';

const URL = 'https://example.org/docs.html';

@Component({
  imports: [ExternalLinkDirective],
  template: `<a ameExternalLink href="${URL}" target="_blank" rel="noopener"><span class="inner">Docs</span></a>`,
})
class HostComponent {}

describe('ExternalLinkDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let isTauri: boolean;
  let ipcRenderer: {openExternalLink: ReturnType<typeof vi.fn>} | null;
  const openExternalLink = () => ipcRenderer?.openExternalLink;

  const setup = () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {provide: BrowserService, useValue: {isStartedAsTauriApp: () => isTauri}},
        {provide: IPC_RENDERER, useValue: ipcRenderer},
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  };

  const click = (): {event: MouseEvent; bodyListener: ReturnType<typeof vi.fn>} => {
    const bodyListener = vi.fn();
    document.body.appendChild(fixture.nativeElement);
    document.body.addEventListener('click', bodyListener);
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});
    fixture.nativeElement.querySelector('.inner').dispatchEvent(event);
    document.body.removeEventListener('click', bodyListener);
    fixture.nativeElement.remove();
    return {event, bodyListener};
  };

  beforeEach(() => {
    isTauri = false;
    ipcRenderer = {openExternalLink: vi.fn().mockResolvedValue(undefined)};
  });

  it('should keep the default browser behavior outside of Tauri', () => {
    setup();
    const {event, bodyListener} = click();

    expect(event.defaultPrevented).toBe(false);
    expect(bodyListener).toHaveBeenCalled();
    expect(openExternalLink()).not.toHaveBeenCalled();
  });

  it('should open the link once via IPC and stop propagation to the Tauri shell plugin listener', () => {
    isTauri = true;
    setup();
    const {event, bodyListener} = click();

    expect(event.defaultPrevented).toBe(true);
    expect(bodyListener).not.toHaveBeenCalled();
    expect(openExternalLink()).toHaveBeenCalledTimes(1);
    expect(openExternalLink()).toHaveBeenCalledWith(URL);
  });

  it('should log instead of throwing when the IPC call fails', async () => {
    isTauri = true;
    ipcRenderer = {openExternalLink: vi.fn().mockRejectedValue(new Error('boom'))};
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    setup();

    click();
    await Promise.resolve();
    await Promise.resolve();

    expect(consoleError).toHaveBeenCalledWith(`Failed to open external link ${URL}`, expect.any(Error));
    consoleError.mockRestore();
  });

  it('should keep the default behavior when no IPC renderer is available', () => {
    isTauri = true;
    ipcRenderer = null;
    setup();
    const {event} = click();

    expect(event.defaultPrevented).toBe(false);
  });
});
