import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {MaxGraphHelper} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultEntity, DefaultEntityInstance, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BaseModelService} from './base-model-service';

@Injectable()
class TestModelService extends BaseModelService {
  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultProperty;
  }

  public testAddNewEntityValues(values: DefaultEntityInstance[], parent: NamedElement) {
    this.addNewEntityValues(values, parent);
  }

  public testDeleteEntityValue(value: DefaultEntityInstance, parent: NamedElement) {
    this.deleteEntityValue(value, parent);
  }
}

describe('BaseModelService', () => {
  let service: TestModelService;
  let mockLoadedFilesService: any;
  let cachedElements: Map<string, any>;

  beforeEach(() => {
    cachedElements = new Map<string, any>();
    mockLoadedFilesService = {
      isElementInCurrentFile: vi.fn().mockReturnValue(true),
      currentLoadedFile: {
        namespace: 'org.eclipse.esmf.test',
        rdfModel: {
          getAspectModelUrn: () => 'urn:samm:org.eclipse.esmf.test:1.0.0#',
        },
        cachedFile: {
          updateElementKey: vi.fn((oldKey, newKey) => {
            const val = cachedElements.get(oldKey);
            cachedElements.delete(oldKey);
            cachedElements.set(newKey, val);
          }),
          removeElement: vi.fn(urn => cachedElements.delete(urn)),
          resolveInstance: vi.fn(el => {
            cachedElements.set(el.aspectModelUrn, el);
            return el;
          }),
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        TestModelService,
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
      ],
    });

    service = TestBed.inject(TestModelService);
  });

  it('should update element name, descriptions, preferred names, and see', () => {
    const prop = new DefaultProperty({
      name: 'oldName',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.test:1.0.0#oldName',
      metaModelVersion: '2.2.0',
    });
    cachedElements.set(prop.aspectModelUrn, prop);

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    const form = {
      name: 'newName',
      descriptionen: 'English description',
      preferredNameen: 'Preferred Name',
      see: 'http://example.com/doc',
    };

    service.update(cell, form);

    expect(prop.name).toBe('newName');
    expect(prop.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test:1.0.0#newName');
    expect(prop.getDescription('en')).toBe('English description');
    expect(prop.getPreferredName('en')).toBe('Preferred Name');
    expect(prop.see).toEqual(['http://example.com/doc']);
  });

  it('should update loadedFilesService aspect on DefaultAspect update', () => {
    const aspect = new DefaultAspect({
      name: 'OldAspect',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.test:1.0.0#OldAspect',
      metaModelVersion: '2.2.0',
    });
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: aspect} as any);

    service.update(cell, {name: 'NewAspect'});
    expect(mockLoadedFilesService.currentLoadedFile.aspect).toBe(aspect);
  });

  it('should delete element from cachedFile', () => {
    const prop = new DefaultProperty({name: 'prop', aspectModelUrn: 'urn:test#prop', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    service.delete(cell);
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#prop');
  });

  it('should update element when toggled to anonymous', () => {
    const prop = new DefaultProperty({
      name: 'oldName',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.test:1.0.0#oldName',
      metaModelVersion: '2.2.0',
    });
    cachedElements.set(prop.aspectModelUrn, prop);

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    service.update(cell, {name: 'oldName', isAnonymous: true});

    expect(prop.isAnonymous()).toBe(true);
    expect(prop.name).toBe('[Property]');
    expect(prop.aspectModelUrn).toContain('[Property]');
  });

  it('should add and delete entity values with relationships', () => {
    const entity = new DefaultEntity({name: 'Entity', aspectModelUrn: 'urn:test#Entity', metaModelVersion: '2.2.0'});
    const ev = new DefaultEntityInstance({name: 'EV1', aspectModelUrn: 'urn:test#EV1', type: entity, metaModelVersion: '2.2.0'});
    const parent = new DefaultAspect({name: 'Aspect', aspectModelUrn: 'urn:test#Aspect', metaModelVersion: '2.2.0'});

    service.testAddNewEntityValues([ev], parent);
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.resolveInstance).toHaveBeenCalledWith(ev);

    service.testDeleteEntityValue(ev, parent);
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#EV1');
  });
});
