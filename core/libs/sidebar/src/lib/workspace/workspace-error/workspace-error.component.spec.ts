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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it} from 'vitest';
import {WorkspaceErrorComponent} from './workspace-error.component';

describe('WorkspaceErrorComponent', () => {
  let component: WorkspaceErrorComponent;
  let fixture: ComponentFixture<WorkspaceErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkspaceErrorComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              sidebar: {
                workspaceError: {
                  title: 'Workspace validation error!',
                  description:
                    'During loading the models from the workspace, the following validation error(s) occured. The affected ttl files need to be removed or fixed outside the editor to display and use the workspace.',
                },
              },
            },
          },
          translocoConfig: {availableLangs: ['en'], defaultLang: 'en'},
        }),
      ],
    });

    fixture = TestBed.createComponent(WorkspaceErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render error details when error input is provided', () => {
    fixture.componentRef.setInput('error', {
      code: 400,
      message: 'Invalid syntax in model file',
      path: '/workspace/models/Invalid.ttl',
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Workspace validation error!');
    expect(compiled.textContent).toContain('Invalid syntax in model file');
  });
});
