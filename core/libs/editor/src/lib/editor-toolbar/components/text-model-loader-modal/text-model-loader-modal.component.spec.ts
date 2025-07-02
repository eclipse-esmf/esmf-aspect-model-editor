import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MockProviders} from 'ng-mocks';
import {of} from 'rxjs';
import {FileHandlingService} from '../../services';
import {TextModelLoaderModalComponent} from './text-model-loader-modal.component';

describe('TextModelLoaderModalComponent', () => {
  let component: TextModelLoaderModalComponent;
  let fixture: ComponentFixture<TextModelLoaderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, MatFormFieldModule, MatInputModule, MatDialogModule, BrowserAnimationsModule, TranslateModule.forRoot()],
      providers: [
        MockProviders(MatDialogRef),
        {
          provide: FileHandlingService,
          useValue: {
            loadModel: () => of(null),
          },
        },
        TranslateService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextModelLoaderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not call loadModel when textarea text is empty', () => {
    jest.spyOn(component, 'loadModel');

    const button = fixture.debugElement.nativeElement.querySelectorAll('button')[1];
    button.click();

    fixture.detectChanges();

    expect(component.loadModel).not.toHaveBeenCalled();
  });

  it('should call loadModel when textarea text is not empty', () => {
    jest.spyOn(component, 'loadModel');

    const textarea = fixture.debugElement.nativeElement.querySelector('textarea[matInput]');
    const text = 'ttl value';
    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelectorAll('button')[2];
    button.click();
    fixture.detectChanges();

    expect(component.loadModel).toHaveBeenCalled();
  });
});
