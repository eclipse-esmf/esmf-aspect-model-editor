import {LoadedFilesService} from '@ame/cache';
import {ConfirmDialogEnum, ConfirmDialogService, RenameModelDialogService} from '@ame/editor';
import {MaxGraphHelper, MaxGraphService, ThemeService} from '@ame/max-graph';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultCharacteristic, DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelElementNamingService} from '../services/model-element-naming.service';
import {CharacteristicModelService} from './characteristic-model.service';
import {ElementModelService} from './element-model.service';
import {ModelRootService} from './model-root.service';

describe('ElementModelService', () => {
  let service: ElementModelService;
  let mockMaxgraphService: any;
  let mockModelRootService: any;
  let mockNotificationService: any;
  let mockLoadedFilesService: any;
  let mockConfirmDialogService: any;
  let mockNamingService: any;

  beforeEach(() => {
    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
      setCellStyle: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      getAllCells: vi.fn().mockReturnValue([new Cell(), new Cell()]),
      removeCells: vi.fn(),
      resolveParents: vi.fn().mockReturnValue([]),
      resolveCellByModelElement: vi.fn(),
      formatCell: vi.fn(),
      formatShapes: vi.fn(),
      updateEnumerationsWithEntityValue: vi.fn(),
      updateEntityValuesWithCellReference: vi.fn(),
    };

    const mockElementModelService = {
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockModelRootService = {
      getElementModelService: vi.fn().mockReturnValue(mockElementModelService),
      isPredefined: vi.fn().mockReturnValue(false),
      getPredefinedService: vi.fn().mockReturnValue(null),
    };

    mockNotificationService = {warning: vi.fn()};
    mockConfirmDialogService = {open: vi.fn()};
    mockNamingService = {
      resolveElementNaming: vi.fn((el: any) => {
        el.aspectModelUrn = `urn:samm:org.eclipse.esmf.test#${el.name}`;
        return el;
      }),
    };

    mockLoadedFilesService = {
      isElementExtern: vi.fn().mockReturnValue(false),
      isElementInCurrentFile: vi.fn().mockReturnValue(true),
      currentLoadedFile: {
        namespace: 'org.eclipse.esmf.test',
        cachedFile: {
          removeElement: vi.fn(),
          updateElementKey: vi.fn(),
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        ElementModelService,
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: ModelRootService, useValue: mockModelRootService},
        {provide: NotificationsService, useValue: mockNotificationService},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: TitleService, useValue: {updateTitle: vi.fn()}},
        {provide: ModelService, useValue: {removeAspect: vi.fn()}},
        {provide: RenameModelDialogService, useValue: {open: vi.fn()}},
        {provide: ConfirmDialogService, useValue: mockConfirmDialogService},
        {provide: ModelElementNamingService, useValue: mockNamingService},
        {provide: SammLanguageSettingsService, useValue: {setSammLanguageCodes: vi.fn()}},
        {provide: ThemeService, useValue: {generateThemeStyle: vi.fn().mockReturnValue({})}},
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {
              notificationService: {
                modelEmptyMessage: 'Empty',
                modelMinimumElementRequirement: 'Min 1',
                cannotDeleteEdgeTitle: 'Cannot remove connection',
                cannotDeleteEdgeMessage:
                  'It is not possible to remove connections directly. Please remove or reconnect the elements accordingly.',
              },
              confirmDialog: {
                deleteAnonymousElement: {
                  title: 'Delete Element with Anonymous Children',
                  phrase2: 'Do you want to delete them, convert them to named elements first, or cancel?',
                  deleteWithAnonymousBtn: 'Delete All',
                  convertToNamedBtn: 'Convert to Named Elements',
                  cancelBtn: 'Cancel',
                },
              },
            },
            translateService: {
              translate: vi.fn().mockReturnValue('Contains anonymous elements.'),
            },
          },
        },
        {provide: CharacteristicModelService, useValue: mockElementModelService},
      ],
    });

    service = TestBed.inject(ElementModelService);
  });

  it('should update element through its model service', () => {
    const char = new DefaultCharacteristic({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: char} as any);

    service.updateElement(cell, {name: 'C2'});
    expect(mockModelRootService.getElementModelService).toHaveBeenCalledWith(char);
  });

  it('should prevent delete if only 1 cell remains in graph', () => {
    mockMaxgraphService.getAllCells.mockReturnValue([new Cell()]);
    const cell = new Cell();
    service.deleteElement(cell);
    expect(mockNotificationService.warning).toHaveBeenCalled();
  });

  it('should delete element data and format shapes when more than 1 cell exists', () => {
    const prop = new DefaultProperty({name: 'p', aspectModelUrn: 'urn:test#p', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    service.deleteElement(cell);
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#p');
    expect(mockMaxgraphService.formatShapes).toHaveBeenCalledWith(true);
  });

  it('should prevent edge delete and show warning notification instead', () => {
    const edge = new Cell();
    edge.edge = true;

    service.deleteElement(edge);
    expect(mockNotificationService.warning).toHaveBeenCalledWith({
      title: 'Cannot remove connection',
      message: 'It is not possible to remove connections directly. Please remove or reconnect the elements accordingly.',
      timeout: 5000,
    });
    expect(mockMaxgraphService.removeCells).not.toHaveBeenCalled();
  });

  it('should prompt confirmation dialog when parent has anonymous children and delete all when user confirms', () => {
    const anonChar = new DefaultCharacteristic({
      name: '[Characteristic]',
      aspectModelUrn: 'anonymous:Characteristic:b0',
      metaModelVersion: '2.2.0',
      isAnonymous: true,
    });
    const prop = new DefaultProperty({
      name: 'p',
      aspectModelUrn: 'urn:test#p',
      metaModelVersion: '2.2.0',
      characteristic: anonChar,
    });
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    const anonCell = new Cell();
    MaxGraphHelper.setElementNode(anonCell, {element: anonChar} as any);
    mockMaxgraphService.resolveCellByModelElement.mockReturnValue(anonCell);

    mockConfirmDialogService.open.mockReturnValue(of(ConfirmDialogEnum.ok));

    service.deleteElement(cell);

    expect(mockConfirmDialogService.open).toHaveBeenCalled();
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('anonymous:Characteristic:b0');
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#p');
  });

  it('should prompt confirmation dialog and convert anonymous children to named when user chooses action', () => {
    const anonChar = new DefaultCharacteristic({
      name: '[Characteristic]',
      aspectModelUrn: 'anonymous:Characteristic:b0',
      metaModelVersion: '2.2.0',
      isAnonymous: true,
    });
    const prop = new DefaultProperty({
      name: 'p',
      aspectModelUrn: 'urn:test#p',
      metaModelVersion: '2.2.0',
      characteristic: anonChar,
    });
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    const anonCell = new Cell();
    MaxGraphHelper.setElementNode(anonCell, {element: anonChar} as any);
    mockMaxgraphService.resolveCellByModelElement.mockReturnValue(anonCell);

    mockConfirmDialogService.open.mockReturnValue(of(ConfirmDialogEnum.action));

    service.deleteElement(cell);

    expect(mockConfirmDialogService.open).toHaveBeenCalled();
    expect(anonChar.isAnonymous()).toBe(false);
    expect(mockNamingService.resolveElementNaming).toHaveBeenCalledWith(anonChar);
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#p');
  });

  it('should abort deletion when user cancels confirmation dialog', () => {
    const anonChar = new DefaultCharacteristic({
      name: '[Characteristic]',
      aspectModelUrn: 'anonymous:Characteristic:b0',
      metaModelVersion: '2.2.0',
      isAnonymous: true,
    });
    const prop = new DefaultProperty({
      name: 'p',
      aspectModelUrn: 'urn:test#p',
      metaModelVersion: '2.2.0',
      characteristic: anonChar,
    });
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    mockConfirmDialogService.open.mockReturnValue(of(ConfirmDialogEnum.cancel));

    service.deleteElement(cell);

    expect(mockConfirmDialogService.open).toHaveBeenCalled();
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).not.toHaveBeenCalled();
  });

  it('should not show confirmation dialog if anonymous child still has another parent remaining', () => {
    const anonChar = new DefaultCharacteristic({
      name: '[Characteristic]',
      aspectModelUrn: 'anonymous:Characteristic:b0',
      metaModelVersion: '2.2.0',
      isAnonymous: true,
    });
    const prop1 = new DefaultProperty({
      name: 'p1',
      aspectModelUrn: 'urn:test#p1',
      metaModelVersion: '2.2.0',
      characteristic: anonChar,
    });
    const prop2 = new DefaultProperty({
      name: 'p2',
      aspectModelUrn: 'urn:test#p2',
      metaModelVersion: '2.2.0',
      characteristic: anonChar,
    });
    anonChar.parents = [prop1, prop2] as any;

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop1} as any);

    service.deleteElement(cell);

    expect(mockConfirmDialogService.open).not.toHaveBeenCalled();
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#p1');
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.removeElement).not.toHaveBeenCalledWith('anonymous:Characteristic:b0');
  });
});
