import {setElementNode} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LoadedFilesService, ModelService} from '../../model-session';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {SammLanguageSettingsService} from '../../state/settings/samm-language-settings.service';
import {AbstractPropertyModelService} from './abstract-property-model.service';

describe('AbstractPropertyModelService', () => {
  let service: AbstractPropertyModelService;
  let mockGraphAdapter: Partial<GraphAdapterPort>;
  let mockLoadedFilesService: any;

  beforeEach(() => {
    mockLoadedFilesService = {
      isElementInCurrentFile: vi.fn().mockReturnValue(true),
      currentLoadedFile: {
        namespace: 'org.eclipse.esmf.test',
        rdfModel: {
          getAspectModelUrn: () => 'urn:samm:org.eclipse.esmf.test:1.0.0#',
        },
        cachedFile: {
          updateElementKey: vi.fn(),
          removeElement: vi.fn(),
          resolveInstance: vi.fn(el => el),
        },
      },
    };

    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      removeCells: vi.fn(),
      resolveParents: vi.fn().mockReturnValue([]),
      resolveCellByModelElement: vi.fn(),
      updateCell: vi.fn(),
      setCellPropertiesLabel: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AbstractPropertyModelService,
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
        {provide: SammLanguageSettingsService, useValue: {addSammLanguageCode: vi.fn(), getSammLanguageCodes: vi.fn(() => [])}},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: ModelService, useValue: {}},
      ],
    });

    service = TestBed.inject(AbstractPropertyModelService);
  });

  it('should identify applicable abstract property', () => {
    const abstractProp = new DefaultProperty({
      name: 'abstractProp',
      aspectModelUrn: 'urn:test#abstractProp',
      metaModelVersion: '2.2.0',
      isAbstract: true,
    });
    const concreteProp = new DefaultProperty({
      name: 'concreteProp',
      aspectModelUrn: 'urn:test#concreteProp',
      metaModelVersion: '2.2.0',
    });

    expect(service.isApplicable(abstractProp)).toBe(true);
    expect(service.isApplicable(concreteProp)).toBe(false);
  });

  it('should update abstract property and its extends_', () => {
    const parentAbstractProp = new DefaultProperty({
      name: 'parentProp',
      aspectModelUrn: 'urn:test#parentProp',
      metaModelVersion: '2.2.0',
      isAbstract: true,
    });
    const prop = new DefaultProperty({
      name: 'prop',
      aspectModelUrn: 'urn:test#prop',
      metaModelVersion: '2.2.0',
      isAbstract: true,
    });

    const cell: any = {};
    setElementNode(cell, {element: prop});

    const form = {
      name: 'updatedProp',
      extends: parentAbstractProp,
      exampleValue: '42',
    };

    service.update(cell, form);

    expect(prop.exampleValue).toBe('42');
    expect(prop.extends_).toBe(parentAbstractProp);
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should delete abstract property cell', () => {
    const prop = new DefaultProperty({name: 'prop', aspectModelUrn: 'urn:test#prop', metaModelVersion: '2.2.0', isAbstract: true});
    const cell: any = {};
    setElementNode(cell, {element: prop});

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
