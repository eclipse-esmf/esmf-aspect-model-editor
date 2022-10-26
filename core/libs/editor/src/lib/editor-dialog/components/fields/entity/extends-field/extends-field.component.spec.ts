import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NotificationsService, SearchService} from '@ame/shared';
import {provideMockObject} from '../../../../../../../../../jest-helpers';
import {EditorModelService} from '../../../../editor-model.service';
import {NamespacesCacheService} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';
import {MxGraphService} from '@ame/mx-graph';
import {EntityExtendsFieldComponent} from './extends-field.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {of} from 'rxjs';
import {DefaultEntity} from '@ame/meta-model';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

jest.mock('../../../../../../../../instantiator/src/lib/meta-model-element-instantiator');
jest.mock('../../../../../../../../instantiator/src/lib/instantiators/bamme-predefined-entity-instantiator', () => {
  class PredefinedEntityInstantiator {
    entityInstances = {};
  }

  return {
    PredefinedEntityInstantiator,
  };
});

describe('EntityExtendsFieldComponent', () => {
  let component: EntityExtendsFieldComponent;
  let fixture: ComponentFixture<EntityExtendsFieldComponent>;
  let editorModelService: EditorModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatFormFieldModule, MatAutocompleteModule, ReactiveFormsModule, MatInputModule, BrowserAnimationsModule],
      declarations: [EntityExtendsFieldComponent],
      providers: [
        {
          provide: NotificationsService,
          useValue: provideMockObject(NotificationsService),
        },
        {
          provide: EditorModelService,
          useValue: provideMockObject(EditorModelService),
        },
        {
          provide: NamespacesCacheService,
          useValue: provideMockObject(NamespacesCacheService),
        },
        {
          provide: RdfService,
          useValue: provideMockObject(RdfService),
        },
        {
          provide: SearchService,
          useValue: provideMockObject(SearchService),
        },
        {
          provide: MxGraphService,
          useValue: provideMockObject(MxGraphService),
        },
      ],
    });

    editorModelService = TestBed.inject(EditorModelService);
    editorModelService.getMetaModelElement = jest.fn(() => of(new DefaultEntity('', '', '')));

    fixture = TestBed.createComponent(EntityExtendsFieldComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
