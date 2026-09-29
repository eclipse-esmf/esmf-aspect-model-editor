import {LoadedFilesService, ModelApiService, ModelService, RdfService} from '@ame/infrastructure';
import {setElementNode, TitleService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {SidebarStatePort} from '../../ports/sidebar-state.port';
import {AspectModelService} from './aspect-model.service';

describe('AspectModelService', () => {
  let service: AspectModelService;
  let mockGraphAdapter: Partial<GraphAdapterPort>;
  let mockTitleService: any;
  let mockSidebarStateService: any;
  let mockLoadedFilesService: any;

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

    mockGraphAdapter = {
      updateCell: vi.fn(),
      deleteAspectCell: vi.fn(),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      getIncomingEdges: vi.fn().mockReturnValue([]),
      removeCells: vi.fn(),
    };
    mockTitleService = {updateTitle: vi.fn()};
    mockSidebarStateService = {workspace: {refresh: vi.fn()}};

    TestBed.configureTestingModule({
      providers: [
        AspectModelService,
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
        {provide: TitleService, useValue: mockTitleService},
        {provide: SidebarStatePort, useValue: mockSidebarStateService},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
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

    const cell: any = {};
    setElementNode(cell, {element: aspect});

    const form = {
      name: 'UpdatedAspect',
      editedProperties: {
        'urn:test#prop': {notInPayload: true, optional: false, payloadName: 'p'},
      },
    };

    service.update(cell, form);

    expect(aspect.propertiesPayload['urn:test#prop'].notInPayload).toBe(true);
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
    expect(mockTitleService.updateTitle).toHaveBeenCalled();
    expect(mockSidebarStateService.workspace.refresh).toHaveBeenCalled();
  });

  it('should delete aspect and trigger graphAdapter.deleteAspectCell', () => {
    const aspect = new DefaultAspect({name: 'A', aspectModelUrn: 'urn:test#A', metaModelVersion: '2.2.0'});
    const cell: any = {};
    setElementNode(cell, {element: aspect});

    service.delete(cell);
    expect(mockGraphAdapter.deleteAspectCell).toHaveBeenCalledWith(cell);
  });
});
