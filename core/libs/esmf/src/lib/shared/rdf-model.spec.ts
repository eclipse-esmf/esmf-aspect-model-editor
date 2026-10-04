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

import {DataFactory, Store} from 'n3';
import {describe, expect, it} from 'vitest';
import {RdfModel} from './rdf-model';
import {RdfModelUtil} from './rdf-model-util';

describe('RdfModel', () => {
  it('should initialize with default vocabularies and prefixes', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    expect(rdfModel.getMetaModelVersion()).toBe('2.0.0');
    expect(rdfModel.samm).toBeDefined();
    expect(rdfModel.sammC).toBeDefined();
    expect(rdfModel.sammE).toBeDefined();
    expect(rdfModel.sammU).toBeDefined();
    expect(rdfModel.hasDependency(rdfModel.samm.getNamespace())).toBe(true);
  });

  it('should set and retrieve prefixes', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    rdfModel.addPrefix('custom', 'urn:custom:namespace#');
    expect(rdfModel.hasDependency('urn:custom:namespace#')).toBe(true);
    expect(rdfModel.getAliasByDependency('urn:custom:namespace#')).toBe('custom');
  });

  it('should resolve blank nodes recursively', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    const blankNode1 = DataFactory.blankNode('b1');
    const blankNode2 = DataFactory.blankNode('b2');
    const firstPredicate = rdfModel.samm.RdfFirst();
    const restPredicate = rdfModel.samm.RdfRest();

    store.addQuad(blankNode1, firstPredicate, DataFactory.namedNode('urn:test#val1'));
    store.addQuad(blankNode1, restPredicate, blankNode2);
    store.addQuad(blankNode2, firstPredicate, DataFactory.namedNode('urn:test#val2'));
    store.addQuad(blankNode2, restPredicate, rdfModel.samm.RdfNil());

    const resolved = rdfModel.resolveBlankNodes('b1');
    expect(resolved.length).toBe(2);
    expect(resolved[0].object.value).toBe('urn:test#val1');
    expect(resolved[1].object.value).toBe('urn:test#val2');
  });

  it('should resolve locale from quad language or literal tag', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    const quadWithLang = DataFactory.quad(
      DataFactory.namedNode('urn:test#el'),
      rdfModel.samm.PreferredNameProperty(),
      DataFactory.literal('Test Element', 'de'),
    );

    expect(rdfModel.getLocale(quadWithLang)).toBe('de');
  });

  it('should resolve recursive blank nodes including RDF lists', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0');
    const writer = {
      list: (elements: unknown[]) => ({termType: 'List', elements}),
      blank: (elements: unknown[]) => ({termType: 'Blank', elements}),
    } as any;

    const b0 = DataFactory.blankNode('b0');
    const bList1 = DataFactory.blankNode('bList1');
    const bList2 = DataFactory.blankNode('bList2');

    store.addQuad(b0, rdfModel.samm.RdfType(), rdfModel.sammC.EnumerationCharacteristic());
    store.addQuad(b0, rdfModel.sammC.ValuesProperty(), bList1);
    store.addQuad(bList1, rdfModel.samm.RdfFirst(), DataFactory.literal('DD'));
    store.addQuad(bList1, rdfModel.samm.RdfRest(), bList2);
    store.addQuad(bList2, rdfModel.samm.RdfFirst(), DataFactory.literal('gege'));
    store.addQuad(bList2, rdfModel.samm.RdfRest(), rdfModel.samm.RdfNil());

    const result = RdfModelUtil.resolveRecursiveBlankNodes(rdfModel, 'b0', writer);
    expect(result.length).toBe(2);

    const typeQuad = result.find(q => q.predicate.value === rdfModel.samm.RdfType().value);
    expect(typeQuad?.object.value).toBe(rdfModel.sammC.EnumerationCharacteristic().value);

    const valuesQuad = result.find(q => q.predicate.value === rdfModel.sammC.ValuesProperty().value);
    expect(valuesQuad).toBeDefined();
    expect((valuesQuad?.object as any).termType).toBe('List');
    expect((valuesQuad?.object as any).elements.length).toBe(2);
  });

  describe('prefix management', () => {
    const MODEL_NS = 'urn:samm:org.example:1.0.0#';
    const EX = 'http://example.com#';
    const createModel = () => new RdfModel(new Store(), '2.2.0', 'urn:samm:org.example:1.0.0');

    it('should reuse the alias of a namespace which already has a prefix', () => {
      const rdfModel = createModel();
      rdfModel.addPrefix('battery', 'https://example.org/battery#');

      expect(rdfModel.addPrefix('bp', 'https://example.org/battery#')).toBe('battery');
      expect(Object.values(rdfModel.getPrefixes()).filter(ns => ns === 'https://example.org/battery#')).toHaveLength(1);
    });

    it('should never map two namespaces to the same alias', () => {
      const rdfModel = createModel();
      rdfModel.addPrefix('ex', EX);

      expect(rdfModel.addPrefix('ex', 'http://another-example.com#')).toBe('ex2');
      expect(rdfModel.addPrefix('ex', 'http://third-example.com#')).toBe('ex3');
      expect(rdfModel.getPrefixes()['ex']).toBe(EX);
    });

    it('should generate unique ext- aliases without hanging', () => {
      const rdfModel = createModel();

      expect(rdfModel.addPrefix(undefined as unknown as string, 'urn:samm:org.other.battery:1.0.0#')).toBe('ext-battery');
      expect(rdfModel.addPrefix('', 'urn:samm:org.third.battery:1.0.0#')).toBe('ext-battery2');
      expect(rdfModel.addPrefix('', 'urn:samm:org.fourth.battery:1.0.0#')).toBe('ext-battery3');
      expect(rdfModel.addPrefix('', 'urn:1:2#')).toBe('ext-ns');
    });

    it('should define prefixes chosen by the user as explicit', () => {
      const rdfModel = createModel();

      expect(rdfModel.definePrefix('bp', 'https://example.org/battery#')).toBeNull();
      expect(rdfModel.serializationMetadata.isExplicitPrefix('bp')).toBe(true);
      expect(rdfModel.definePrefix('bp', 'https://example.org/other#')).toBe('aliasInUse');
      expect(rdfModel.definePrefix('battery', 'https://example.org/battery#')).toBe('namespaceInUse');
      expect(rdfModel.definePrefix('1x', 'https://example.org/x#')).toBe('invalidAlias');
      expect(rdfModel.definePrefix('x', 'not a namespace')).toBe('invalidNamespace');
    });

    it('should only change the notation when a prefix is renamed', () => {
      const rdfModel = createModel();
      rdfModel.definePrefix('ex', EX);
      const property = DataFactory.namedNode(`${EX}MyProperty`);
      rdfModel.store.addQuad(property, rdfModel.samm.PreferredNameProperty(), DataFactory.literal('My property', 'en'));
      const aliasesBefore = Object.keys(rdfModel.getPrefixes());

      expect(rdfModel.renamePrefix('ex', 'example')).toBeNull();

      expect(rdfModel.getPrefixes()['example']).toBe(EX);
      expect(rdfModel.getPrefixes()['ex']).toBeUndefined();
      expect(Object.keys(rdfModel.getPrefixes())).toEqual(aliasesBefore.map(alias => (alias === 'ex' ? 'example' : alias)));
      expect(rdfModel.store.getQuads(`${EX}MyProperty`, null, null, null)).toHaveLength(1);
      expect(rdfModel.serializationMetadata.isExplicitPrefix('example')).toBe(true);
      expect(rdfModel.serializationMetadata.isExplicitPrefix('ex')).toBe(false);
    });

    it('should reject invalid renames', () => {
      const rdfModel = createModel();
      rdfModel.definePrefix('ex', EX);
      rdfModel.definePrefix('other', 'http://other.com#');

      expect(rdfModel.renamePrefix('ex', 'other')).toBe('aliasInUse');
      expect(rdfModel.renamePrefix('ex', 'in valid')).toBe('invalidAlias');
      expect(rdfModel.renamePrefix('samm', 'meta')).toBe('protectedAlias');
      expect(rdfModel.renamePrefix('', 'model')).toBe('protectedAlias');
      expect(rdfModel.renamePrefix('missing', 'x')).toBe('unknownAlias');
      expect(rdfModel.getPrefixes()['']).toBe(MODEL_NS);
    });

    it('should only delete prefixes which are not used', () => {
      const rdfModel = createModel();
      rdfModel.definePrefix('ex', EX);
      rdfModel.definePrefix('unit2', 'http://units.com#');
      rdfModel.store.addQuad(
        DataFactory.namedNode(`${MODEL_NS}value`),
        rdfModel.samm.ExampleValueProperty(),
        DataFactory.literal('1', DataFactory.namedNode('http://units.com#type')),
      );
      rdfModel.store.addQuad(DataFactory.namedNode(`${MODEL_NS}a`), rdfModel.samm.SeeProperty(), DataFactory.namedNode(`${EX}x`));

      expect(rdfModel.isPrefixUsed('ex')).toBe(true);
      expect(rdfModel.isPrefixUsed('unit2')).toBe(true);
      expect(rdfModel.deletePrefix('ex')).toBe('prefixInUse');
      expect(rdfModel.deletePrefix('samm-c')).toBe('protectedAlias');

      rdfModel.store.removeQuads(rdfModel.store.getQuads(null, null, `${EX}x`, null));
      expect(rdfModel.deletePrefix('ex')).toBeNull();
      expect(rdfModel.getPrefixes()['ex']).toBeUndefined();
      expect(rdfModel.serializationMetadata.isExplicitPrefix('ex')).toBe(false);
    });

    it('should suggest aliases for referenced namespaces', () => {
      const rdfModel = createModel();

      expect(rdfModel.suggestPrefixAlias('https://example.org/battery#')).toBe('battery');
      expect(rdfModel.suggestPrefixAlias('urn:samm:io.catenax.battery.battery_pass:6.0.0#')).toBe('battery_pass');
      expect(rdfModel.suggestPrefixAlias('https://example.org/battery#', 'bp')).toBe('bp');
      expect(rdfModel.suggestPrefixAlias(MODEL_NS)).toBe('');

      rdfModel.definePrefix('battery', 'https://example.org/battery#');
      expect(rdfModel.suggestPrefixAlias('https://example.org/battery#', 'bp')).toBe('battery');
      expect(rdfModel.suggestPrefixAlias('https://other.org/v2/battery#', 'battery')).toBe('battery2');
      expect(rdfModel.suggestPrefixAlias('urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#x', 'samm-c')).not.toBe('samm-c');
    });
  });
});
