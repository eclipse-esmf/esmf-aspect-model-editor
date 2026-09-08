/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultEntity, DefaultEntityInstance, DefaultState, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {DefaultValueEntityInputFieldComponent} from './default-value-entity-input-field.component';

describe('DefaultValueEntityInputFieldComponent', () => {
  let component: DefaultValueEntityInputFieldComponent;
  let fixture: ComponentFixture<DefaultValueEntityInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let state: DefaultState;
  let loadedFiles: LoadedFilesService;
  const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
  const first = createInstance('FirstInstance');
  const second = createInstance('SecondInstance');

  beforeEach(() => {
    state = new DefaultState({
      aspectModelUrn: 'urn:test:1.0.0#State',
      name: 'State',
      metaModelVersion: '2.0.0',
      dataType: entity,
      values: [first, second],
      defaultValue: first,
    });
    TestBed.configureTestingModule({
      imports: [DefaultValueEntityInputFieldComponent, BrowserAnimationsModule],
      providers: [
        MockProvider(EditorModelService, {getMetaModelElement: vi.fn(() => of(state)), isReadOnly: vi.fn(() => false)}),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(SearchService),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
      ],
    });
    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    signalForm.set('chipList', [first, second]);
    loadedFiles = TestBed.inject(LoadedFilesService);
    fixture = TestBed.createComponent(DefaultValueEntityInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and aggregate the entity instance name', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().defaultValue).toBe('FirstInstance');
  });

  it('should filter entity values reactively by name', () => {
    component.field().value.set('Second');
    expect(component.entityValues()).toEqual([second]);

    signalForm.set('chipList', [first]);
    expect(component.entityValues()).toEqual([]);
  });

  it('should retain externally owned values while disabling the field', () => {
    vi.mocked(loadedFiles.isElementExtern).mockReturnValue(true);
    component.initForm();

    expect(component.field().disabled()).toBe(true);
    expect(signalForm.value().defaultValue).toBe('FirstInstance');
  });

  it('should unregister the field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('defaultValue');
  });

  function createInstance(name: string): DefaultEntityInstance {
    return new DefaultEntityInstance({
      aspectModelUrn: `urn:test:1.0.0#${name}`,
      name,
      metaModelVersion: '2.0.0',
      type: entity,
    });
  }
});
