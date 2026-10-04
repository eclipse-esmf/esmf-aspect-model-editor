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

import {firstValueFrom} from 'rxjs';
import {describe, expect, it} from 'vitest';
import {RdfLoader} from './rdf-loader';
import {SerializationMetadata} from './serialization-metadata';

describe('SerializationMetadata', () => {
  describe('extractHeaderComments', () => {
    it('should extract the leading comment block including the separating blank line', () => {
      const content =
        '# Copyright (c) 2026\n#\n# SPDX-License-Identifier: MPL-2.0\n\n@prefix : <urn:samm:a:1.0.0#> .\n# not part of the header\n';
      expect(SerializationMetadata.extractHeaderComments(content)).toEqual([
        '# Copyright (c) 2026',
        '#',
        '# SPDX-License-Identifier: MPL-2.0',
        '',
      ]);
    });

    it('should keep blank lines inside the header and collapse trailing ones', () => {
      expect(SerializationMetadata.extractHeaderComments('# A\n\n# B\n\n\n\n@prefix : <urn:samm:a:1.0.0#> .')).toEqual([
        '# A',
        '',
        '# B',
        '',
      ]);
    });

    it('should handle windows line endings and files without header', () => {
      expect(SerializationMetadata.extractHeaderComments('# A\r\n@prefix : <urn:samm:a:1.0.0#> .\r\n')).toEqual(['# A']);
      expect(SerializationMetadata.extractHeaderComments('\n@prefix : <urn:samm:a:1.0.0#> .\n# B')).toEqual([]);
      expect(SerializationMetadata.extractHeaderComments('')).toEqual([]);
    });
  });

  describe('applyHeader', () => {
    it('should prepend the header with the original separator', () => {
      expect(SerializationMetadata.applyHeader('@prefix x.\n', ['# A', ''])).toBe('# A\n\n@prefix x.\n');
      expect(SerializationMetadata.applyHeader('@prefix x.\n', ['# A'])).toBe('# A\n@prefix x.\n');
    });

    it('should not duplicate a header which is already part of the content', () => {
      expect(SerializationMetadata.applyHeader('# A\n\n@prefix x.\n', ['# A', ''])).toBe('# A\n\n@prefix x.\n');
    });

    it('should return the content unchanged for an empty header', () => {
      expect(SerializationMetadata.applyHeader('@prefix x.\n', [])).toBe('@prefix x.\n');
      expect(SerializationMetadata.applyHeader('@prefix x.\n', [''])).toBe('@prefix x.\n');
    });
  });

  it('should track explicit prefixes', () => {
    const metadata = new SerializationMetadata();
    metadata.markPrefixExplicit('ex');
    expect(metadata.isExplicitPrefix('ex')).toBe(true);

    metadata.renameExplicitPrefix('ex', 'example');
    expect(metadata.isExplicitPrefix('ex')).toBe(false);
    expect(metadata.isExplicitPrefix('example')).toBe(true);

    metadata.unmarkPrefixExplicit('example');
    expect(metadata.isExplicitPrefix('example')).toBe(false);
  });

  it('should be filled by the RdfLoader from the source file', async () => {
    const content = [
      '# Copyright header',
      '',
      '@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .',
      '@prefix ex: <http://example.com#> .',
      '@prefix : <urn:samm:org.example:1.0.0#> .',
      '',
      ':MyAspect a samm:Aspect .',
    ].join('\n');

    const rdfModel = await firstValueFrom(new RdfLoader().loadModel([{rdfAspectModel: content, sourceLocation: 'file:///A.ttl'}]));

    expect(rdfModel.serializationMetadata.headerComments).toEqual(['# Copyright header', '']);
    expect(rdfModel.getPrefixes()['ex']).toBe('http://example.com#');
    expect(rdfModel.serializationMetadata.isExplicitPrefix('ex')).toBe(true);
    expect(rdfModel.serializationMetadata.isExplicitPrefix('samm-c')).toBe(false);
  });

  it('should record the subjects in the order of the source file', async () => {
    const content = [
      '@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .',
      '@prefix : <urn:samm:org.example:1.0.0#> .',
      '',
      ':zeta a samm:Property .',
      ':MyAspect a samm:Aspect ; samm:properties ( :zeta :alpha ) .',
      ':alpha a samm:Property .',
      ':zeta samm:preferredName "Zeta"@en .',
    ].join('\n');

    const rdfModel = await firstValueFrom(new RdfLoader().loadModel([{rdfAspectModel: content, sourceLocation: 'file:///A.ttl'}]));

    const ns = 'urn:samm:org.example:1.0.0#';
    expect(rdfModel.serializationMetadata.getSubjectOrder()).toEqual([`${ns}zeta`, `${ns}MyAspect`, `${ns}alpha`]);
  });

  describe('subject order', () => {
    it('should follow renamed elements', () => {
      const metadata = new SerializationMetadata();
      const element = {aspectModelUrn: 'urn:x#a'};
      ['urn:x#a', 'urn:x#b'].forEach(iri => metadata.recordSubject(iri));
      metadata.recordSubject('urn:x#a');
      metadata.bindElements(iri => (iri === 'urn:x#a' ? element : undefined));

      element.aspectModelUrn = 'urn:x#renamed';

      expect(metadata.hasSubjectOrder()).toBe(true);
      expect(metadata.getSubjectOrder()).toEqual(['urn:x#renamed', 'urn:x#b']);
    });

    it('should keep element references when the order is replaced', () => {
      const metadata = new SerializationMetadata();
      const element = {aspectModelUrn: 'urn:x#a'};
      metadata.recordSubject('urn:x#a');
      metadata.bindElements(() => element);

      const newElement = {aspectModelUrn: 'urn:x#c'};
      metadata.setSubjectOrder(['urn:x#c', 'urn:x#a', 'urn:x#c'], iri => (iri === 'urn:x#c' ? newElement : undefined));
      element.aspectModelUrn = 'urn:x#a2';
      newElement.aspectModelUrn = 'urn:x#c2';

      expect(metadata.getSubjectOrder()).toEqual(['urn:x#c2', 'urn:x#a2']);
    });
  });
});
