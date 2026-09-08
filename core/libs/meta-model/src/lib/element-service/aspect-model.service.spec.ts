import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {AspectRenderService, MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TitleService} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AspectModelService} from './aspect-model.service';

describe('AspectModelService', () => {
  let service: AspectModelService;
  let mockAspectRenderer: any;
  let mockTitleService: any;
  let mockSidebarStateService: any;
  let mockLoadedFilesService: any;
  let mockMaxgraphService: any;

  beforeEach(() => {
    mockLoadedFilesService = {
      isElementInCurrentFile: vi.fn().mockReturnValue(true),
      updateAbsoluteName: vi.fn(),
      currentLoadedFile: {
        namespace: 'org.eclipse.esmf.test',
        absoluteName: 'test.ttl',
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
    };
    mockAspectRenderer = {update: vi.fn(), delete: vi.fn()};
    mockTitleService = {updateTitle: vi.fn()};
    mockSidebarStateService = {workspace: {refresh: vi.fn()}};

    TestBed.configureTestingModule({
      providers: [
        AspectModelService,
        {provide: AspectRenderService, useValue: mockAspectRenderer},
        {provide: TitleService, useValue: mockTitleService},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: SidebarStateService, useValue: mockSidebarStateService},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(AspectModelService);
  });

  it('should identify applicable DefaultAspect', () => {
    const aspect = new DefaultAspect({name: 'A', aspectModelUrn: 'urn:test#A', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(aspect)).toBe(true);
  });

  it('should update aspect and propertiesPayload', () => {
    const prop = new DefaultProperty({name: 'prop', aspectModelUrn: 'urn:test#prop', metaModelVersion: '2.2.0'});
    const aspect = new DefaultAspect({
      name: 'TestAspect',
      aspectModelUrn: 'urn:test#TestAspect',
      metaModelVersion: '2.2.0',
      properties: [prop],
    });

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: aspect} as any);

    const form = {
      name: 'UpdatedAspect',
      editedProperties: {
        'urn:test#prop': {notInPayload: true, optional: false, payloadName: 'p'},
      },
    };

    service.update(cell, form);

    expect(aspect.propertiesPayload['urn:test#prop'].notInPayload).toBe(true);
    expect(mockAspectRenderer.update).toHaveBeenCalledWith({cell});
    expect(mockTitleService.updateTitle).toHaveBeenCalled();
    expect(mockSidebarStateService.workspace.refresh).toHaveBeenCalled();
  });

  it('should delete aspect and trigger aspectRenderer.delete', () => {
    const aspect = new DefaultAspect({name: 'A', aspectModelUrn: 'urn:test#A', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: aspect} as any);

    service.delete(cell);
    expect(mockAspectRenderer.delete).toHaveBeenCalledWith(cell);
  });
});
