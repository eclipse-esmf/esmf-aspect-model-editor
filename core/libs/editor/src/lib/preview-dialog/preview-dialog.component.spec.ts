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

import {ClipboardService, NotificationsService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of, Subject, throwError} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PreviewDialogComponent, PreviewDialogOptions} from './preview-dialog.component';

describe('PreviewDialogComponent', () => {
  let component: PreviewDialogComponent;
  let fixture: ComponentFixture<PreviewDialogComponent>;
  let dialogRef: {close: ReturnType<typeof vi.fn>; componentInstance?: unknown};
  let clipboard: {copy: ReturnType<typeof vi.fn>};
  let notifications: {success: ReturnType<typeof vi.fn>};

  const baseData: PreviewDialogOptions = {
    title: 'JSON Preview',
    content: '{"key": "value"}',
    fileName: 'sample.json',
  };

  async function create(data: PreviewDialogOptions = baseData): Promise<void> {
    dialogRef = {close: vi.fn()};
    clipboard = {copy: vi.fn()};
    notifications = {success: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [
        PreviewDialogComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {en: {previewDialog: {copied: 'Copied to clipboard', language: 'Language'}}},
          translocoConfig: {availableLangs: ['en'], defaultLang: 'en'},
        }),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MAT_DIALOG_DATA, useValue: data},
        {provide: ClipboardService, useValue: clipboard},
        {provide: NotificationsService, useValue: notifications},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewDialogComponent);
    component = fixture.componentInstance;
    dialogRef.componentInstance = component;
    fixture.detectChanges();
  }

  function element(testId: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('basics', () => {
    beforeEach(() => create());

    it('should initialize title and content from data', () => {
      expect(component.title()).toBe(baseData.title);
      expect(component.content()).toBe(baseData.content);
      expect((element('dialogContent') as HTMLTextAreaElement).value).toBe(baseData.content);
    });

    it('should close via the shared (x) button', () => {
      element('dialog-close-button')!.click();
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    });

    it('reset should revert content to initial value', () => {
      component.content.set('modified content');
      component.reset();
      expect(component.content()).toBe(baseData.content);
    });

    it('should copy the current content via the ClipboardService and confirm it', () => {
      component.content.set('edited');
      element('previewCopyButton')!.click();
      expect(clipboard.copy).toHaveBeenCalledWith('edited');
      expect(notifications.success).toHaveBeenCalledWith(expect.objectContaining({title: 'Copied to clipboard'}));
    });

    it('should not show a language switch without languages', () => {
      expect(component.hasLanguageSwitch).toBe(false);
      expect(element('previewLanguageSelect')).toBeNull();
    });
  });

  describe('language switch', () => {
    it('should not show a switch for a single language', async () => {
      await create({...baseData, languages: ['en'], language: 'en', regenerate: vi.fn()});
      expect(element('previewLanguageSelect')).toBeNull();
    });

    it('should not show a switch without a regenerate function', async () => {
      await create({...baseData, languages: ['en', 'de'], language: 'en'});
      expect(element('previewLanguageSelect')).toBeNull();
    });

    it('should list the model languages with their names', async () => {
      await create({...baseData, languages: ['en', 'de'], language: 'en', regenerate: vi.fn()});
      expect(element('previewLanguageSelect')).not.toBeNull();
      expect(component.languages).toEqual([
        {tag: 'en', name: 'English'},
        {tag: 'de', name: 'German'},
      ]);
      expect(component.language()).toBe('en');
    });

    it('should regenerate the content in the selected language and make it the new reset point', async () => {
      const regenerate = vi.fn(() => of('{"description": "Deutsch"}'));
      await create({...baseData, languages: ['en', 'de'], language: 'en', regenerate});

      component.changeLanguage('de');

      expect(regenerate).toHaveBeenCalledWith('de');
      expect(component.language()).toBe('de');
      expect(component.content()).toBe('{"description": "Deutsch"}');
      expect(component.regenerating()).toBe(false);

      component.content.set('edited');
      component.reset();
      expect(component.content()).toBe('{"description": "Deutsch"}');
    });

    it('should show progress and lock the editor while regenerating', async () => {
      const pending = new Subject<string>();
      await create({...baseData, languages: ['en', 'de'], language: 'en', regenerate: () => pending});

      component.changeLanguage('de');
      fixture.detectChanges();
      expect(component.regenerating()).toBe(true);
      expect(element('previewRegenerating')).not.toBeNull();
      expect((element('dialogContent') as HTMLTextAreaElement).readOnly).toBe(true);

      pending.next('{}');
      pending.complete();
      fixture.detectChanges();
      expect(element('previewRegenerating')).toBeNull();
      expect((element('dialogContent') as HTMLTextAreaElement).readOnly).toBe(false);
    });

    it('should keep the previous language and content if regenerating fails', async () => {
      await create({...baseData, languages: ['en', 'de'], language: 'en', regenerate: () => throwError(() => 'failed')});

      component.changeLanguage('de');

      expect(component.language()).toBe('en');
      expect(component.content()).toBe(baseData.content);
      expect(component.regenerating()).toBe(false);
    });

    it('should ignore selecting the current language', async () => {
      const regenerate = vi.fn(() => of('{}'));
      await create({...baseData, languages: ['en', 'de'], language: 'en', regenerate});
      component.changeLanguage('en');
      component.changeLanguage('');
      expect(regenerate).not.toHaveBeenCalled();
    });
  });
});
