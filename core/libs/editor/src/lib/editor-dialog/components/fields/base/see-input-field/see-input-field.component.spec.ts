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

import {LoadedFilesService, NamespaceFile} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {ClipboardService, LanguageTranslationService, NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {SeeInputFieldComponent} from './see-input-field.component';

describe('SeeInputFieldComponent', () => {
  let component: SeeInputFieldComponent;
  let fixture: ComponentFixture<SeeInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let property: DefaultProperty;
  let clipboard: {copy: ReturnType<typeof vi.fn>};
  let notifications: {success: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    clipboard = {copy: vi.fn()};
    notifications = {success: vi.fn()};
    property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#testProp',
      name: 'testProp',
      metaModelVersion: '2.0.0',
    });
    property.see = ['https://example.com/doc'];

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        SeeInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {defaultLang: 'en', availableLangs: ['en']}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(property)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
          findElementOnExtReferences: vi.fn(() => null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(MaxGraphService, {
          getAllCells: vi.fn(() => []),
        }),
        MockProvider(SearchService),
        {provide: ClipboardService, useValue: clipboard},
        {provide: NotificationsService, useValue: notifications},
        {provide: LanguageTranslationService, useValue: {translateService: {translate: (key: string) => key}}},
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(SeeInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize see field with elements', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().see).toBe('https://example.com/doc');
    expect(component.elements().length).toBe(1);
    expect(component.elements()[0].urn).toBe('https://example.com/doc');
  });

  it('should add element to list when valid URI is provided', () => {
    component.searchField().value.set('https://example.com/second');
    component.addElementToList('SecondDoc');

    expect(component.elements().length).toBe(2);
    expect(signalForm.value().see).toBe('https://example.com/doc,https://example.com/second');
  });

  it('should remove element from list', () => {
    const toRemove = component.elements()[0];
    component.removeElement(toRemove);

    expect(component.elements().length).toBe(0);
    expect(signalForm.value().see).toBe('');
    expect(property.see).toEqual([]);
  });

  it('should update metaModelElement.see when adding an element', () => {
    component.searchField().value.set('https://example.com/second');
    component.addElementToList('SecondDoc');

    expect(property.see).toEqual(['https://example.com/doc', 'https://example.com/second']);
  });

  it.each(['https://example.com/doc%23section', 'https://example.com/a%2Cb', 'https://example.com/invalid%ZZ'])(
    'should keep the encoded see value %s unchanged',
    uri => {
      property.see = [uri];
      fixture.destroy();
      signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
      fixture = TestBed.createComponent(SeeInputFieldComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('signalForm', signalForm);
      fixture.detectChanges();

      expect(signalForm.value().see).toBe(uri);
      expect(component.elements().map(element => element.urn)).toEqual([uri]);
    },
  );

  it('should keep encoded see values of other entries when adding a new one', () => {
    property.see = ['https://example.com/doc%23section'];
    fixture.destroy();
    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(SeeInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();

    component.searchField().value.set('https://example.com/second');
    component.addElementToList();

    expect(property.see).toEqual(['https://example.com/doc%23section', 'https://example.com/second']);
    expect(signalForm.value().see).toBe('https://example.com/doc%23section,https://example.com/second');
  });

  it('should unregister see field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('see');
  });

  describe('copy see value', () => {
    function recreateWith(see: string[]): void {
      property.see = see;
      fixture.destroy();
      signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
      fixture = TestBed.createComponent(SeeInputFieldComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('signalForm', signalForm);
      fixture.detectChanges();
    }

    function copyButtons(): HTMLButtonElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('[data-testid="see-copy-chip"]'));
    }

    it('should render a copy button next to the remove button of every chip', () => {
      recreateWith(['https://example.com/a', 'https://example.com/b']);

      const chips = Array.from(fixture.nativeElement.querySelectorAll('mat-chip-row')) as HTMLElement[];
      expect(chips.length).toBe(2);
      chips.forEach(chip => {
        const buttons = Array.from(chip.querySelectorAll('button')).map(button => button.getAttribute('data-testid'));
        expect(buttons).toEqual(['see-copy-chip', 'see-remove-chip']);
      });
      expect(copyButtons()[0].getAttribute('aria-label')).toBe('editorCanvas.shapeSetting.field.seeInput.copy');
    });

    it('should copy the exact (encoded) URI and notify the user', () => {
      recreateWith(['https://example.com/doc%23section']);

      copyButtons()[0].click();

      expect(clipboard.copy).toHaveBeenCalledWith('https://example.com/doc%23section');
      expect(notifications.success).toHaveBeenCalledWith({
        title: 'editorCanvas.shapeSetting.field.seeInput.copied',
        message: 'https://example.com/doc%23section',
        timeout: 3000,
      });
    });

    it('should copy the value of the clicked chip only', () => {
      recreateWith(['https://example.com/a', 'https://example.com/b']);

      copyButtons()[1].click();

      expect(clipboard.copy).toHaveBeenCalledTimes(1);
      expect(clipboard.copy).toHaveBeenCalledWith('https://example.com/b');
    });

    it('should not remove the chip or change the value when copying', () => {
      copyButtons()[0].click();

      expect(component.elements().length).toBe(1);
      expect(property.see).toEqual(['https://example.com/doc']);
      expect(signalForm.value().see).toBe('https://example.com/doc');
    });

    it('should stop the click from reaching the chip', () => {
      const event = new MouseEvent('click', {bubbles: true});
      const stop = vi.spyOn(event, 'stopPropagation');
      component.copyElement(component.elements()[0], event);
      expect(stop).toHaveBeenCalled();
    });

    it('should still remove a chip with the remove button', () => {
      (fixture.nativeElement.querySelector('[data-testid="see-remove-chip"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.elements().length).toBe(0);
      expect(clipboard.copy).not.toHaveBeenCalled();
    });
  });
});
