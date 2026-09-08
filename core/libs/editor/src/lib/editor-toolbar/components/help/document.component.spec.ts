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

import {APP_CONFIG, BrowserService, IPC_RENDERER} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DocumentComponent} from './document.component';

describe('DocumentComponent', () => {
  let component: DocumentComponent;
  let fixture: ComponentFixture<DocumentComponent>;
  let ipcRenderer: any;

  beforeEach(async () => {
    ipcRenderer = {
      openExternalLink: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        DocumentComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: IPC_RENDERER, useValue: ipcRenderer},
        {provide: APP_CONFIG, useValue: {version: '1.0.0'}},
        MockProvider(BrowserService, {
          isStartedAsElectronApp: vi.fn(() => true),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and have documentation link', () => {
    expect(component).toBeTruthy();
    expect(component.AMEDocumentationLink()).toBe('https://eclipse-esmf.github.io/ame-guide/introduction.html');
  });

  it('openLink should open external link via ipcRenderer in electron app', () => {
    const event = {
      preventDefault: vi.fn(),
      target: {href: 'https://eclipse-esmf.github.io/ame-guide/introduction.html'},
    } as unknown as MouseEvent;

    component.openLink(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(ipcRenderer.openExternalLink).toHaveBeenCalledWith('https://eclipse-esmf.github.io/ame-guide/introduction.html');
  });
});
