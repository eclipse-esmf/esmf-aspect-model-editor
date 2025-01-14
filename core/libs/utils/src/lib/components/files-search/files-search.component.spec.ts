import {FileHandlingService, SaveModelDialogService} from '@ame/editor';
import {MxGraphService} from '@ame/mx-graph';
import {ModelSavingTrackerService, NotificationsService, SearchService} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MockProvider} from 'ng-mocks';
import {SearchesStateService} from '../../search-state.service';
import {FilesSearchComponent} from './files-search.component';

describe('Files search', () => {
  let component: FilesSearchComponent;
  let fixture: ComponentFixture<FilesSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        HttpClientModule,
      ],
      providers: [
        MockProvider(MatDialogRef),
        MockProvider(MxGraphService),
        MockProvider(NotificationsService),
        MockProvider(FileHandlingService),
        TranslateService,
        SearchesStateService,
        SidebarStateService,
        MatDialog,
        ModelSavingTrackerService,
        SaveModelDialogService,
        SearchService,
        LanguageTranslationService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const files = [
    {
      name: 'AspectDefault.ttl',
      loaded: true,
      locked: false,
      outdated: false,
      errored: false,
      sammVersion: '2.1.0',
    },
    {
      name: 'SharedModel.ttl',
      locked: false,
      outdated: false,
      errored: false,
      loaded: true,
      sammVersion: '2.1.0',
    },
  ];

  const namespaces = {
    'org.eclipse.examples:1.0.0': files,
  };

  it('should parse files correctly', () => {
    component.parseFiles(namespaces);

    expect(component.searchableFiles).toEqual([
      {file: 'AspectDefault.ttl', namespace: 'org.eclipse.examples:1.0.0'},
      {file: 'SharedModel.ttl', namespace: 'org.eclipse.examples:1.0.0'},
    ]);
  });

  it('should have mat option if there are namespaces with files', () => {
    jest.spyOn(component, 'openFile');

    component.searchableFiles = files;
    fixture.detectChanges();
    const autocomplete = fixture.debugElement.query(By.css('mat-autocomplete'));
    expect(autocomplete).toBeTruthy();
    fixture.detectChanges();
    const matOptions = autocomplete.nativeElement.querySelectorAll('mat-option');
    expect(matOptions).toBeTruthy();
  });
});
