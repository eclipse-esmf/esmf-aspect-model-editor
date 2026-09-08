import {beforeEach, describe, expect, it, vi} from 'vitest';

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormField} from '@angular/forms/signals';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoService, TranslocoTestingModule} from '@jsverse/transloco';
import {MockProviders} from 'ng-mocks';
import {of} from 'rxjs';
import {FileHandlingService} from '../../services';
import {TextModelLoaderModalComponent} from './text-model-loader-modal.component';

describe('TextModelLoaderModalComponent', () => {
  let component: TextModelLoaderModalComponent;
  let fixture: ComponentFixture<TextModelLoaderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormField,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProviders(MatDialogRef),
        {
          provide: FileHandlingService,
          useValue: {
            loadModel: () => of(null),
          },
        },
        TranslocoService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextModelLoaderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not call loadModel when textarea text is empty', () => {
    vi.spyOn(component, 'loadModel');

    const button = fixture.debugElement.nativeElement.querySelectorAll('button')[2];
    expect(button.disabled).toBe(true);
    button.click();

    fixture.detectChanges();

    expect(component.loadModel).not.toHaveBeenCalled();
  });

  it('should call loadModel when textarea text is not empty', () => {
    vi.spyOn(component, 'loadModel');

    component.modelData.set({modelText: 'ttl value'});
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelectorAll('button')[2];
    expect(button.disabled).toBe(false);
    button.click();
    fixture.detectChanges();

    expect(component.loadModel).toHaveBeenCalled();
  });
});
