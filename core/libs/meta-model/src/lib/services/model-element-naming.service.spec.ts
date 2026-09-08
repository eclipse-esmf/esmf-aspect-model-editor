import {LoadedFilesService} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it} from 'vitest';
import {ModelElementNamingService} from './model-element-naming.service';

describe('ModelElementNamingService', () => {
  let service: ModelElementNamingService;
  let mockLoadedFilesService: Partial<LoadedFilesService>;

  beforeEach(() => {
    const cachedElements = new Map<string, any>();
    mockLoadedFilesService = {
      externalFiles: [],
      currentLoadedFile: {
        namespace: 'org.eclipse.esmf.test',
        rdfModel: {
          samm: {version: '2.2.0'},
          getAspectModelUrn: () => 'urn:samm:org.eclipse.esmf.test:1.0.0#',
        } as any,
        cachedFile: {
          get: (urn: string) => cachedElements.get(urn),
          resolveInstance: (el: any) => {
            cachedElements.set(el.aspectModelUrn, el);
            return el;
          },
        } as any,
      } as any,
    };

    TestBed.configureTestingModule({
      providers: [ModelElementNamingService, {provide: LoadedFilesService, useValue: mockLoadedFilesService}],
    });

    service = TestBed.inject(ModelElementNamingService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should resolve element naming with default counter if name exists', () => {
    const prop1 = new DefaultProperty({name: 'testProp', aspectModelUrn: '', metaModelVersion: '2.2.0'});
    const resolvedProp1 = service.resolveElementNaming(prop1);

    expect(resolvedProp1.name).toBe('testProp1');
    expect(resolvedProp1.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test#testProp1');
    expect(resolvedProp1.metaModelVersion).toBe('2.2.0');

    mockLoadedFilesService.currentLoadedFile.cachedFile.resolveInstance(resolvedProp1);

    const prop2 = new DefaultProperty({name: 'testProp', aspectModelUrn: '', metaModelVersion: '2.2.0'});
    const resolvedProp2 = service.resolveElementNaming(prop2);
    expect(resolvedProp2.name).toBe('testProp2');
  });

  it('should resolve element naming with parentName prefix', () => {
    const prop = new DefaultProperty({name: 'Prop', aspectModelUrn: '', metaModelVersion: '2.2.0'});
    const resolved = service.resolveElementNaming(prop, 'Parent');

    expect(resolved.name).toBe('ParentProp');
    expect(resolved.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test#ParentProp');
  });

  it('should return null if rdfModel is not available', () => {
    mockLoadedFilesService.currentLoadedFile.rdfModel = null;
    const prop = new DefaultProperty({name: 'test', aspectModelUrn: '', metaModelVersion: '2.2.0'});
    expect(service.resolveElementNaming(prop)).toBeNull();
  });

  it('should resolve metaModelElement and its children', () => {
    const childProp = new DefaultProperty({name: 'childProp', aspectModelUrn: '', metaModelVersion: '2.2.0'});
    const aspect = new DefaultAspect({name: 'TestAspect', aspectModelUrn: '', metaModelVersion: '2.2.0', properties: [childProp]});

    const result = service.resolveMetaModelElement(aspect, true);
    expect(result.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test#TestAspect1');
    expect(childProp.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test#childProp1');
  });
});
