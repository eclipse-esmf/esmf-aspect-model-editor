/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultEntity, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {beforeEach, describe, expect, it} from 'vitest';
import {LoadedFilePayload, LoadedFilesService, NamespaceFile} from './loaded-files.service';

describe('LoadedFilesService & NamespaceFile', () => {
  let service: LoadedFilesService;
  let rdfModel: RdfModel;
  let cachedFile: ModelElementCache;
  let aspect: DefaultAspect;

  const createDummyRdfModel = (urn = 'urn:samm:org.eclipse.esmf.samm:test:1.0.0') => {
    const store = new Store();
    return new RdfModel(store, '2.0.0', urn);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadedFilesService],
    });
    service = TestBed.inject(LoadedFilesService);

    rdfModel = createDummyRdfModel();
    cachedFile = new ModelElementCache();
    aspect = new DefaultAspect({
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:test:1.0.0#TestAspect',
      name: 'TestAspect',
      metaModelVersion: '2.0.0',
      properties: [],
      operations: [],
      events: [],
    });
    cachedFile.addElement(aspect.aspectModelUrn, aspect);
  });

  describe('NamespaceFile', () => {
    it('should compute absoluteName correctly with aspect', () => {
      const file = new NamespaceFile(rdfModel, cachedFile, aspect);
      expect(file.name).toBe('TestAspect.ttl');
      expect(file.namespace).toBe('org.eclipse.esmf.samm:test:1.0.0');
      expect(file.absoluteName).toBe('org.eclipse.esmf.samm:test:1.0.0:TestAspect.ttl');
    });

    it('should compute default name for shared file without aspect', () => {
      const file = new NamespaceFile(rdfModel, cachedFile, null);
      expect(file.name).toBe('shared-file.ttl');
    });

    it('should detect name and namespace changes', () => {
      const file = new NamespaceFile(rdfModel, cachedFile, aspect);
      file.originalName = 'TestAspect.ttl';
      file.originalNamespace = 'org.eclipse.esmf.samm:test:1.0.0';

      expect(file.isNameChanged).toBe(false);
      expect(file.isNamespaceChanged).toBe(false);

      file.name = 'RenamedAspect.ttl';
      expect(file.isNameChanged).toBe(true);

      file.namespace = 'org.eclipse.esmf.samm:test:2.0.0';
      expect(file.isNamespaceChanged).toBe(true);

      file.resetOriginalUrn();
      expect(file.isNameChanged).toBe(false);
      expect(file.isNamespaceChanged).toBe(false);
    });

    it('should mark file as existing in workspace', () => {
      const file = new NamespaceFile(rdfModel, cachedFile, aspect);
      expect(file.fromWorkspace).toBe(false);
      file.setExistsInWorkspace();
      expect(file.fromWorkspace).toBe(true);
    });
  });

  describe('LoadedFilesService file management', () => {
    it('should add file and access current loaded file signal', () => {
      const payload: LoadedFilePayload = {
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:TestAspect.ttl',
        rendered: true,
      };

      const added = service.addFile(payload);
      expect(added).toBeDefined();
      expect(service.filesAsList.length).toBe(1);
      expect(service.currentLoadedFile).toBe(added);
      expect(service.hasAspect()).toBe(true);
    });

    it('should separate current file and external files', () => {
      const mainPayload: LoadedFilePayload = {
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:Main.ttl',
        rendered: true,
      };

      const extRdfModel = createDummyRdfModel('urn:samm:org.eclipse.esmf.samm:ext:1.0.0');
      const extCache = new ModelElementCache();
      const extPayload: LoadedFilePayload = {
        rdfModel: extRdfModel,
        cachedFile: extCache,
        aspect: null,
        absoluteName: 'org.eclipse.esmf.samm:ext:1.0.0:Shared.ttl',
        rendered: false,
      };

      service.addFiles([mainPayload, extPayload]);

      expect(service.filesAsList.length).toBe(2);
      expect(service.currentLoadedFile?.absoluteName).toBe('org.eclipse.esmf.samm:test:1.0.0:Main.ttl');
      expect(service.externalFiles.length).toBe(1);
      expect(service.externalFiles[0].absoluteName).toBe('org.eclipse.esmf.samm:ext:1.0.0:Shared.ttl');
    });

    it('should check if an element is in current file', () => {
      const propInCurrent = new DefaultProperty({
        aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:test:1.0.0#propInCurrent',
        name: 'propInCurrent',
        metaModelVersion: '2.0.0',
      });
      cachedFile.addElement(propInCurrent.aspectModelUrn, propInCurrent);

      service.addFile({
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:Main.ttl',
        rendered: true,
      });

      expect(service.isElementInCurrentFile(propInCurrent)).toBe(true);

      const foreignProp = new DefaultProperty({
        aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:foreign:1.0.0#foreignProp',
        name: 'foreignProp',
        metaModelVersion: '2.0.0',
      });
      expect(service.isElementInCurrentFile(foreignProp)).toBe(false);
    });

    it('should check if an element is external', () => {
      const propInCurrent = new DefaultProperty({
        aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:test:1.0.0#propInCurrent',
        name: 'propInCurrent',
        metaModelVersion: '2.0.0',
      });
      cachedFile.addElement(propInCurrent.aspectModelUrn, propInCurrent);

      const extCache = new ModelElementCache();
      const extProp = new DefaultProperty({
        aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:ext:1.0.0#extProp',
        name: 'extProp',
        metaModelVersion: '2.0.0',
      });
      extCache.addElement(extProp.aspectModelUrn, extProp);

      service.addFile({
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:Main.ttl',
        rendered: true,
      });

      service.addFile({
        rdfModel: createDummyRdfModel('urn:samm:org.eclipse.esmf.samm:ext:1.0.0'),
        cachedFile: extCache,
        aspect: null,
        absoluteName: 'org.eclipse.esmf.samm:ext:1.0.0:Shared.ttl',
        rendered: false,
      });

      expect(service.isElementExtern(propInCurrent)).toBe(false);
      expect(service.isElementExtern(extProp)).toBe(true);
    });

    it('should find element across external references', () => {
      const extCache = new ModelElementCache();
      const extEntity = new DefaultEntity({
        aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:ext:1.0.0#ExtEntity',
        name: 'ExtEntity',
        metaModelVersion: '2.0.0',
      });
      extCache.addElement(extEntity.aspectModelUrn, extEntity);

      service.addFile({
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:Main.ttl',
        rendered: true,
      });

      service.addFile({
        rdfModel: createDummyRdfModel('urn:samm:org.eclipse.esmf.samm:ext:1.0.0'),
        cachedFile: extCache,
        aspect: null,
        absoluteName: 'org.eclipse.esmf.samm:ext:1.0.0:Shared.ttl',
        rendered: false,
      });

      const found = service.findElementOnExtReferences<DefaultEntity>('urn:samm:org.eclipse.esmf.samm:ext:1.0.0#ExtEntity');
      expect(found).toBe(extEntity);
    });

    it('should remove a single file and remove all files', () => {
      const added = service.addFile({
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:Main.ttl',
        rendered: true,
      });

      expect(service.filesAsList.length).toBe(1);

      service.removeFile(added.absoluteName);
      expect(service.filesAsList.length).toBe(0);

      service.addFile({
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:Main.ttl',
        rendered: true,
      });
      service.removeAll();
      expect(service.filesAsList.length).toBe(0);
    });

    it('should update file absolute name', () => {
      const added = service.addFile({
        rdfModel,
        cachedFile,
        aspect,
        absoluteName: 'org.eclipse.esmf.samm:test:1.0.0:Main.ttl',
        rendered: true,
      });

      const oldName = added.absoluteName;
      service.updateAbsoluteName(oldName, 'org.eclipse.esmf.samm:test:2.0.0:MainV2.ttl');

      expect(service.getFile(oldName)).toBeUndefined();
      const updated = service.getFile('org.eclipse.esmf.samm:test:2.0.0:MainV2.ttl');
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('MainV2.ttl');
      expect(updated?.namespace).toBe('org.eclipse.esmf.samm:test:2.0.0');
    });
  });
});
