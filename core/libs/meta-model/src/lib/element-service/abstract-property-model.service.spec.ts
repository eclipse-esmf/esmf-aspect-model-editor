import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {AbstractPropertyRenderService, MaxGraphAttributeService, MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AbstractPropertyModelService} from './abstract-property-model.service';

describe('AbstractPropertyModelService', () => {
  let service: AbstractPropertyModelService;
  let mockMaxgraphService: any;
  let mockAbstractPropertyRenderer: any;
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

    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
      resolveParents: vi.fn().mockReturnValue([]),
    };
    mockAbstractPropertyRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        AbstractPropertyModelService,
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: AbstractPropertyRenderService, useValue: mockAbstractPropertyRenderer},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: SammLanguageSettingsService, useValue: {}},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
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

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    const form = {
      name: 'updatedProp',
      extends: parentAbstractProp,
      exampleValue: '42',
    };

    service.update(cell, form);

    expect(prop.exampleValue).toBe('42');
    expect(prop.extends_).toBe(parentAbstractProp);
    expect(mockAbstractPropertyRenderer.update).toHaveBeenCalledWith({cell});
  });

  it('should delete abstract property cell', () => {
    const prop = new DefaultProperty({name: 'prop', aspectModelUrn: 'urn:test#prop', metaModelVersion: '2.2.0', isAbstract: true});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
