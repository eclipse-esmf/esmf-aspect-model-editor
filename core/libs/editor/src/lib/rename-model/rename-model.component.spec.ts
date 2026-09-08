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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {RenameModelComponent} from './rename-model.component';

describe('RenameModelComponent', () => {
  let component: RenameModelComponent;
  let fixture: ComponentFixture<RenameModelComponent>;
  let dialogRef: MatDialogRef<RenameModelComponent>;

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<RenameModelComponent>;

    const aspect = new DefaultAspect({
      aspectModelUrn: 'urn:samm:com.example:1.0.0#TestAspect',
      name: 'TestAspect',
      metaModelVersion: '2.0.0',
    });

    await TestBed.configureTestingModule({
      imports: [
        RenameModelComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MAT_DIALOG_DATA, useValue: {namespaces: 'com.example:1.0.0', rdfModel: new RdfModel(new Store())}},
        MockProvider(ModelApiService, {
          fetchAllNamespaceFilesContent: vi.fn(() =>
            of([
              {
                aspectModelUrn: 'urn:samm:com.example:1.0.0#OtherAspect',
                name: 'other.ttl',
              } as any,
            ]),
          ),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(
            new RdfModel(new Store(), '2.0.0', 'urn:samm:com.example:1.0.0#'),
            new ModelElementCache(),
            aspect,
          ),
          files: {},
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RenameModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize renameForm', () => {
    expect(component).toBeTruthy();
    expect(component.renameForm).toBeDefined();
    expect(component.loading()).toBe(false);
  });

  it('closeAndGiveResult should format name and close dialog', () => {
    component.renameModel.set({fileName: 'MyRenamedModel'});
    component.closeAndGiveResult(true);

    expect(dialogRef.close).toHaveBeenCalledWith({name: 'MyRenamedModel.ttl'});
  });

  it('closeAndGiveResult with false should close with false', () => {
    component.closeAndGiveResult(false);
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
