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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {RdfService} from '@ame/rdf/services';
import {NotificationsService, SearchService} from '@ame/shared';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultEntity, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoService} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {EntityExtendsFieldComponent} from './extends-field.component';

describe('EntityExtendsFieldComponent', () => {
  let component: EntityExtendsFieldComponent;
  let fixture: ComponentFixture<EntityExtendsFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let currentEntity: DefaultEntity;
  let cachedFile: ModelElementCache;
  let loadedFilesService: LoadedFilesService;
  let notificationsService: NotificationsService;
  let validators: EditorDialogValidators;

  beforeEach(() => {
    currentEntity = createEntity('CurrentEntity');
    cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [MatFormFieldModule, MatAutocompleteModule, MatInputModule, BrowserAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        MockProvider(TranslocoService, {
          langChanges$: new BehaviorSubject('en'),
          events$: new Subject(),
          translate: vi.fn(() => ''),
          selectTranslate: vi.fn(() => of('')),
          _loadDependencies: vi.fn(() => of(undefined)),
          config: {reRenderOnLangChange: false} as any,
        } as Partial<TranslocoService>),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
          findElementOnExtReferences: vi.fn(() => null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(NotificationsService, {error: vi.fn()}),
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(currentEntity)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(EditorDialogValidators, {
          duplicateNameWithDifferentTypeValue: vi.fn(value =>
            of(value === 'UsedByProperty' ? {checkShapeName: true, foundModel: {name: value}} : null),
          ),
        }),
        MockProvider(RdfService),
        MockProvider(SearchService),
        MockProvider(MaxGraphService),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    loadedFilesService = TestBed.inject(LoadedFilesService);
    notificationsService = TestBed.inject(NotificationsService);
    validators = TestBed.inject(EditorDialogValidators);
    fixture = TestBed.createComponent(EntityExtendsFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register both stored values in the shared Signal Forms context', () => {
    expect(signalForm.value()).toMatchObject({extendsValue: '', extends: null});
    expect(signalForm.field('extendsValue')).toBe(component.displayField);
  });

  it('should initialize and lock an existing relation without losing its save value', () => {
    const baseEntity = createEntity('BaseEntity');
    currentEntity.extends_ = baseEntity;

    component.setExtendsControl();

    expect(component.displayValue()).toBe('BaseEntity');
    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.value()).toMatchObject({extendsValue: 'BaseEntity', extends: baseEntity});
  });

  it('should unlock and clear both values while marking the relation as touched', () => {
    const baseEntity = createEntity('BaseEntity');
    component.onSelectionChange({name: baseEntity.name, urn: baseEntity.aspectModelUrn, entity: baseEntity});

    component.unlockExtends();

    expect(component.displayField().disabled()).toBe(false);
    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({extendsValue: '', extends: null});
  });

  it('should resolve a selected entity from the local cache before using fallback data', () => {
    const cachedEntity = createEntity('CachedEntity');
    const fallbackEntity = createEntity('FallbackEntity');
    cachedFile.addElement(cachedEntity.aspectModelUrn, cachedEntity);

    component.onSelectionChange({name: cachedEntity.name, urn: cachedEntity.aspectModelUrn, entity: fallbackEntity});

    expect(signalForm.value().extends).toBe(cachedEntity);
    expect(loadedFilesService.findElementOnExtReferences).not.toHaveBeenCalled();
  });

  it('should resolve a selected entity from external references and then from the option fallback', () => {
    const externalEntity = createEntity('ExternalEntity');
    const fallbackEntity = createEntity('FallbackEntity');
    vi.mocked(loadedFilesService.findElementOnExtReferences).mockReturnValueOnce(externalEntity);

    component.onSelectionChange({name: externalEntity.name, urn: externalEntity.aspectModelUrn, entity: fallbackEntity});
    expect(signalForm.value().extends).toBe(externalEntity);

    component.unlockExtends();
    component.onSelectionChange({name: fallbackEntity.name, urn: fallbackEntity.aspectModelUrn, entity: fallbackEntity});
    expect(signalForm.value().extends).toBe(fallbackEntity);
  });

  it('should create concrete and abstract entities with the current namespace', () => {
    component.createEntity('CreatedEntity');
    const concrete = signalForm.value().extends as DefaultEntity;

    expect(concrete).toBeInstanceOf(DefaultEntity);
    expect(concrete.aspectModelUrn).toBe('urn:test:1.0.0#CreatedEntity');
    expect(concrete.isAbstractEntity()).toBeFalsy();

    component.unlockExtends();
    component.createNewAbstractEntity('CreatedAbstractEntity');
    const abstract = signalForm.value().extends as DefaultEntity;

    expect(abstract.aspectModelUrn).toBe('urn:test:1.0.0#CreatedAbstractEntity');
    expect(abstract.isAbstractEntity()).toBe(true);
    expect(component.displayField().disabled()).toBe(true);
  });

  it('should reject invalid casing without changing the relation', () => {
    component.createEntity('lowerCaseEntity');
    component.createNewAbstractEntity('anotherLowerCaseEntity');

    expect(signalForm.value()).toMatchObject({extendsValue: '', extends: null});
  });

  it('should prevent links to the current URN or the edited name', () => {
    component.createEntity('CurrentEntity');

    expect(notificationsService.error).toHaveBeenCalledWith({title: 'Element left cannot link itself'});
    expect(signalForm.value()).toMatchObject({extendsValue: '', extends: null});

    signalForm.set('name', 'RenamedEntity');
    component.createNewAbstractEntity('RenamedEntity');

    expect(notificationsService.error).toHaveBeenCalledTimes(2);
    expect(signalForm.value()).toMatchObject({extendsValue: '', extends: null});
  });

  it('should exclude itself while aggregating matching local concrete and abstract entities', () => {
    const concrete = createEntity('ConcreteEntity');
    const abstract = createEntity('AbstractEntity', true);
    cachedFile.addElement(currentEntity.aspectModelUrn, currentEntity);
    cachedFile.addElement(concrete.aspectModelUrn, concrete);
    cachedFile.addElement(abstract.aspectModelUrn, abstract);
    component.displayField().value.set('Entity');

    const names = component.filteredAbstractEntities().map(entity => entity.name);

    expect(names).toContain('ConcreteEntity');
    expect(names).toContain('AbstractEntity');
    expect(names).not.toContain('CurrentEntity');
  });

  it('should expose duplicate-name validation as foundModel and invalidate the shared form', async () => {
    component.displayField().value.set('UsedByProperty');
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.waitFor(() =>
      expect(validators.duplicateNameWithDifferentTypeValue).toHaveBeenCalledWith('UsedByProperty', currentEntity, DefaultEntity),
    );
    await vi.waitFor(() => expect(component.hasError('foundModel')).toBe(true));
    expect(signalForm.valid()).toBe(false);

    component.displayField().value.set('AvailableEntity');
    fixture.detectChanges();
    await fixture.whenStable();
    await vi.waitFor(() => expect(component.displayField().valid()).toBe(true));
    expect(signalForm.valid()).toBe(true);
  });

  it('should keep externally owned values in save output while disabling display field', () => {
    const baseEntity = createEntity('BaseEntity');
    currentEntity.extends_ = baseEntity;
    vi.mocked(loadedFilesService.isElementExtern).mockReturnValue(true);

    component.setExtendsControl();

    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.value()).toMatchObject({extendsValue: 'BaseEntity', extends: baseEntity});
  });

  it('should unregister both dynamic fields on destroy', () => {
    fixture.destroy();

    expect(signalForm.value()).not.toHaveProperty('extendsValue');
    expect(signalForm.value()).not.toHaveProperty('extends');
  });

  function createEntity(name: string, isAbstract = false): DefaultEntity {
    return new DefaultEntity({
      metaModelVersion: '2.0.0',
      aspectModelUrn: `urn:test:1.0.0#${name}`,
      name,
      isAbstract,
    });
  }
});
