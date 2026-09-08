/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService} from '@ame/cache';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {EntityInstanceViewComponent} from './entity-instance-view.component';

describe('EntityInstanceViewComponent', () => {
  let component: EntityInstanceViewComponent;
  let fixture: ComponentFixture<EntityInstanceViewComponent>;
  let context: EditorSignalFormContext;
  let dialog: MatDialog;
  let entity: DefaultEntity;
  let enumeration: DefaultEnumeration;
  let existing: DefaultEntityInstance;

  beforeEach(async () => {
    entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    enumeration = new DefaultEnumeration({
      aspectModelUrn: 'urn:test:1.0.0#Enumeration',
      name: 'Enumeration',
      metaModelVersion: '2.0.0',
      dataType: entity,
      values: [],
    });
    existing = instance('Existing', entity);
    await TestBed.configureTestingModule({
      imports: [
        EntityInstanceViewComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [MockProvider(MatDialog, {open: vi.fn()}), MockProvider(LoadedFilesService)],
    }).compileComponents();

    context = TestBed.runInInjectionContext(
      () => new EditorSignalFormContext<Record<string, unknown>>({changedMetaModel: null, dataTypeEntity: entity}),
    );

    fixture = TestBed.createComponent(EntityInstanceViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', context);
    fixture.componentRef.setInput('enumeration', enumeration);
    fixture.componentRef.setInput('complexValues', [existing]);
    fixture.detectChanges();
    dialog = TestBed.inject(MatDialog);
  });

  it('registers new and deleted entity values in the shared context', () => {
    expect(context.value()).toMatchObject({newEntityValues: [], deletedEntityValues: []});
  });

  it('adds a dialog result and flattens nested new entity values', () => {
    const created = instance('Created', entity);
    const nested = instance('Nested', entity);
    vi.mocked(dialog.open).mockReturnValue({
      beforeClosed: () => of({entityValue: created, newEntityValues: [nested]}),
      afterClosed: () => of({entityValue: created, newEntityValues: [nested]}),
    } as never);
    const emitted = vi.fn();
    component.complexValueChange.subscribe(emitted);

    component.onNew();

    expect(emitted).toHaveBeenLastCalledWith([existing, created]);
    expect(context.value().newEntityValues).toEqual([nested]);
  });

  it('does not report a newly created and then removed value as persisted deletion', () => {
    const created = instance('Created', entity);
    vi.mocked(dialog.open).mockReturnValue({
      beforeClosed: () => of({entityValue: created, newEntityValues: []}),
      afterClosed: () => of({entityValue: created, newEntityValues: []}),
    } as never);
    component.onNew();

    component.onDelete(created, {stopPropagation: vi.fn()} as unknown as Event);

    expect(context.value().deletedEntityValues).toEqual([]);
  });

  it('reports deletion of an existing value', () => {
    const stopPropagation = vi.fn();

    component.onDelete(existing, {stopPropagation} as unknown as Event);

    expect(stopPropagation).toHaveBeenCalled();
    expect(context.value().deletedEntityValues).toEqual([existing]);
  });

  it('unregisters its fields on destroy', () => {
    fixture.destroy();

    expect(context.value()).not.toHaveProperty('newEntityValues');
    expect(context.value()).not.toHaveProperty('deletedEntityValues');
  });
});

function instance(name: string, type: DefaultEntity): DefaultEntityInstance {
  return new DefaultEntityInstance({aspectModelUrn: `urn:test:1.0.0#${name}`, name, metaModelVersion: '2.0.0', type});
}
