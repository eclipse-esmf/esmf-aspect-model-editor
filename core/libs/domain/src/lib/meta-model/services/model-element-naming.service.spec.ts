import {LoadedFilesService, ModelApiService} from '@ame/infrastructure';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultCharacteristic, DefaultProperty} from '@esmf/aspect-model-loader';
import {firstValueFrom, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelElementNamingService} from './model-element-naming.service';

describe('ModelElementNamingService', () => {
  let service: ModelElementNamingService;
  let mockLoadedFilesService: Partial<LoadedFilesService>;
  let mockModelApiService: {checkElementExists: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    const cachedElements = new Map<string, any>();
    const currentFile = {
      name: 'test.ttl',
      namespace: 'org.eclipse.esmf.test',
      rdfModel: {
        samm: {version: '2.2.0'},
        getAspectModelUrn: () => 'urn:samm:org.eclipse.esmf.test:1.0.0#',
        store: {
          getSubjects: () => [],
        },
      } as any,
      cachedFile: {
        get: (urn: string) => cachedElements.get(urn),
        getKeys: () => Array.from(cachedElements.keys()),
        resolveInstance: (el: any) => {
          cachedElements.set(el.aspectModelUrn, el);
          return el;
        },
        removeElement: (urn: string) => {
          cachedElements.delete(urn);
        },
      } as any,
    };

    mockLoadedFilesService = {
      externalFiles: [],
      filesAsList: [currentFile as any],
      currentLoadedFile: currentFile as any,
    };

    mockModelApiService = {
      checkElementExists: vi.fn().mockReturnValue(of(false)),
    };

    TestBed.configureTestingModule({
      providers: [
        ModelElementNamingService,
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: ModelApiService, useValue: mockModelApiService},
      ],
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

    // Resolving an already-numbered name when testProp2 exists should increment to testProp3, not testProp21
    mockLoadedFilesService.currentLoadedFile.cachedFile.resolveInstance(resolvedProp2);
    const prop3 = new DefaultProperty({name: 'testProp2', aspectModelUrn: '', metaModelVersion: '2.2.0'});
    const resolvedProp3 = service.resolveElementNaming(prop3);
    expect(resolvedProp3.name).toBe('testProp3');
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

  it('should resolve element naming asynchronously via RxJS when backend has duplicate element', async () => {
    mockModelApiService.checkElementExists.mockImplementation((urn: string) => {
      if (urn === 'urn:samm:org.eclipse.esmf.test#Characteristic1') {
        return of(true);
      }
      return of(false);
    });

    const prop = new DefaultProperty({name: 'Characteristic', aspectModelUrn: '', metaModelVersion: '2.2.0'});
    const resolved = await firstValueFrom(service.resolveElementNaming$(prop));

    expect(resolved.name).toBe('Characteristic2');
    expect(resolved.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test#Characteristic2');
  });

  it('should resolve property and its child characteristic via RxJS when characteristic exists in backend', async () => {
    const characteristic = new DefaultCharacteristic({
      name: 'Characteristic',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.test#Characteristic',
      metaModelVersion: '2.2.0',
    });
    const prop = new DefaultProperty({
      name: 'property',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.test#property',
      characteristic,
      metaModelVersion: '2.2.0',
    });

    mockModelApiService.checkElementExists.mockImplementation((urn: string) => {
      if (urn === 'urn:samm:org.eclipse.esmf.test#Characteristic1') {
        return of(true);
      }
      if (urn === 'urn:samm:org.eclipse.esmf.test#property1') {
        return of(true);
      }
      return of(false);
    });

    const resolved = await firstValueFrom(service.resolveMetaModelElement$(prop));

    expect(resolved.name).toBe('property2');
    expect(resolved.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test#property2');
    expect(prop.characteristic.name).toBe('Characteristic2');
    expect(prop.characteristic.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.test#Characteristic2');
  });
});
