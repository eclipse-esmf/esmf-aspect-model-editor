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

import {ElementOrderStrategy} from '@ame/shared';
import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {RdfLoader, RdfModel} from '@esmf/aspect-model-loader';
import {DataFactory} from 'n3';
import {firstValueFrom} from 'rxjs';
import {beforeEach, describe, expect, it} from 'vitest';
import {ConfigurationService} from '../../state/settings/configuration.service';
import {LoadedFilesService} from '../loaded-files.service';
import {ModelDocumentService} from './model-document.service';

const NS = 'urn:samm:org.example:1.0.0#';
const SAMM = 'urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#';
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

const SOURCE = [
  '# Header',
  '',
  `@prefix samm: <${SAMM}> .`,
  `@prefix : <${NS}> .`,
  '',
  ':zeta a samm:Property .',
  ':Aspect a samm:Aspect ; samm:properties ( :zeta :alpha ) .',
  ':alpha a samm:Property .',
].join('\n');

/** What the formatter returns: alphabetical, without header. */
const formatted = (names: string[]) =>
  [`@prefix samm: <${SAMM}> .`, `@prefix : <${NS}> .`, '', ...names.map(name => `:${name} a samm:Element .\n`)].join('\n');

describe('ModelDocumentService', () => {
  let service: ModelDocumentService;
  let strategy: ElementOrderStrategy;
  let rdfModel: RdfModel;
  let elements: Map<string, {aspectModelUrn: string}>;

  beforeEach(async () => {
    strategy = 'keepOrderAfterParent';
    rdfModel = await firstValueFrom(new RdfLoader().loadModel([{rdfAspectModel: SOURCE, sourceLocation: 'file:///A.ttl'}]));
    elements = new Map(['zeta', 'Aspect', 'alpha'].map(name => [`${NS}${name}`, {aspectModelUrn: `${NS}${name}`}]));
    const cachedFile = {get: (iri: string) => elements.get(iri) ?? [...elements.values()].find(e => e.aspectModelUrn === iri)};

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {provide: ConfigurationService, useValue: {getSettings: () => ({elementOrderStrategy: strategy, copyrightHeader: ['# Default']})}},
        {provide: LoadedFilesService, useValue: {filesAsList: [{rdfModel, cachedFile}]}},
      ],
    });
    service = TestBed.inject(ModelDocumentService);
  });

  it('should restore the order and the header of the source file', () => {
    const document = service.toDocument(formatted(['Aspect', 'alpha', 'zeta']), rdfModel);

    expect(document.startsWith('# Header\n\n@prefix samm:')).toBe(true);
    expect(document.indexOf(':zeta')).toBeLessThan(document.indexOf(':Aspect'));
    expect(document.indexOf(':Aspect')).toBeLessThan(document.indexOf(':alpha'));
  });

  it('should keep the position of renamed elements', () => {
    service.bindElements(rdfModel);
    const store = rdfModel.store;
    store.removeQuads(store.getQuads(`${NS}zeta`, null, null, null));
    store.addQuad(
      DataFactory.quad(DataFactory.namedNode(`${NS}omega`), DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(`${SAMM}Property`)),
    );
    (elements.get(`${NS}zeta`) as {aspectModelUrn: string}).aspectModelUrn = `${NS}omega`;

    expect(service.resolveSubjectOrder(rdfModel)).toEqual([`${NS}omega`, `${NS}Aspect`, `${NS}alpha`]);
  });

  it('should leave the order to the formatter when configured', () => {
    strategy = 'formatterDefault';
    const text = formatted(['Aspect', 'alpha', 'zeta']);

    expect(service.resolveSubjectOrder(rdfModel)).toBeNull();
    expect(service.toDocument(text, rdfModel)).toBe(`# Header\n\n${text}`);
  });

  it('should use the order of the formatter when no strategy is configured', () => {
    strategy = undefined as unknown as ElementOrderStrategy;
    const text = formatted(['Aspect', 'alpha', 'zeta']);

    expect(service.strategy).toBe('formatterDefault');
    expect(service.toDocument(text, rdfModel)).toBe(`# Header\n\n${text}`);
  });

  it('should keep an alphabetical order once it was applied', () => {
    service.sortAlphabetically(rdfModel);

    expect(service.resolveSubjectOrder(rdfModel)).toEqual([`${NS}Aspect`, `${NS}alpha`, `${NS}zeta`]);
    const document = service.toDocument(formatted(['zeta', 'alpha', 'Aspect']), rdfModel);
    expect(document.indexOf(':Aspect')).toBeLessThan(document.indexOf(':alpha'));
    expect(document.indexOf(':alpha')).toBeLessThan(document.indexOf(':zeta'));
  });
});
