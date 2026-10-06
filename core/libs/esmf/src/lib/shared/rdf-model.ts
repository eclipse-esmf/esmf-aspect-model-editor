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

import * as locale from 'locale-codes';
import {DataFactory, NamedNode, Prefixes, Quad, Store, Util} from 'n3';
import {Samm, SammC, SammE, SammU} from '../vocabulary';
import {KnownVersion, SammVersion} from './known-version';
import {RdfModelUtil} from './rdf-model-util';
import {SerializationMetadata} from './serialization-metadata';
import {XsdDataTypes} from './xsd-datatypes';

/** Reasons why a prefix can not be added, renamed or removed. */
export type PrefixChangeError =
  'invalidAlias' | 'invalidNamespace' | 'aliasInUse' | 'namespaceInUse' | 'unknownAlias' | 'protectedAlias' | 'prefixInUse';

export class RdfModel {
  private prefixes: Prefixes<string> = {};
  private metaModelVersion: string;
  private sourceLocation: string;

  public readonly samm: Samm;
  public readonly sammC: SammC;
  public readonly sammE: SammE;
  public readonly sammU: SammU;
  public xsdDataTypes: XsdDataTypes;
  public readonly serializationMetadata = new SerializationMetadata();

  constructor(
    public store: Store,
    metaModelVersion?: string,
    aspectModelUrn?: string,
  ) {
    if (metaModelVersion) {
      this.metaModelVersion = metaModelVersion;
    } else {
      this.resolveMetaModelVersion();
    }
    this.xsdDataTypes = new XsdDataTypes(this.metaModelVersion);
    this.samm = new Samm(this.metaModelVersion);
    this.sammC = new SammC(this.samm);
    this.sammE = new SammE(this.samm);
    this.sammU = new SammU(this.samm);
    if (aspectModelUrn) {
      this.addPrefix('', `${aspectModelUrn}#`);
    }
    this.addPrefix('xsd', this.samm.getXSDNameSpace());
    this.addPrefix('rdf', this.samm.getRdfSyntaxNameSpace());
    this.addPrefix('rdfs', `${Samm.RDFS_URI}#`);
    this.addPrefix(this.samm.getAlias(), this.samm.getNamespace());
    this.addPrefix(this.sammU.getAlias(), this.sammU.getNamespace());
    this.addPrefix(this.sammC.getAlias(), this.sammC.getNamespace());
    this.addPrefix(this.sammE.getAlias(), this.sammE.getNamespace());
    this.resolveNamespaces();
  }

  public getMetaModelVersion(): SammVersion | undefined {
    return KnownVersion.fromVersionString(this.metaModelVersion) || undefined;
  }

  public getNamespaces(): string[] {
    return Object.keys(this.prefixes).map(key => this.prefixes[key]);
  }

  public hasDependency(namespace: string): boolean {
    return this.getNamespaces().includes(namespace);
  }

  public getAliasByDependency(namespace: string): string {
    return Object.keys(this.prefixes).find(key => this.prefixes[key] === namespace);
  }

  public getAliasByNamespace(namespace: string): string {
    return Object.keys(this.prefixes).find(alias => (this.prefixes[alias] as any) === namespace);
  }

  public getPrefixes(): Prefixes<string> {
    return this.prefixes;
  }

  public getSourceLocation(): string {
    return this.sourceLocation;
  }

  public updatePrefix(alias: string, oldValue: string, newValue: string): void {
    const prefix: any = this.prefixes[alias];
    const newPrefix = prefix.replace(oldValue, newValue);
    this.prefixes[alias] = newPrefix as any;
  }

  public removePrefix(shortPrefixName: string): void {
    delete this.prefixes[shortPrefixName];
    this.serializationMetadata.unmarkPrefixExplicit(shortPrefixName);
  }

  public getAspectModelUrn(): string {
    return this.getPrefixes()[RdfModelUtil.defaultAspectModelAlias];
  }

  /**
   * Adds a prefix for a namespace and returns the alias which is used for it.
   * A namespace which already has a prefix keeps it. Without alias, an `ext-` alias is derived from the namespace.
   * If the alias is used for another namespace, a number is appended (e.g. `ex2`), the existing mapping is never changed.
   */
  public addPrefix(alias: string, namespace: string): string {
    if (alias === '' && this.prefixes[alias] === undefined) {
      this.prefixes[alias] = namespace;
      return alias;
    }

    const existingAlias = this.getAliasByNamespace(namespace);
    if (existingAlias !== undefined) {
      return existingAlias;
    }

    const baseAlias = alias ? alias : `ext-${RdfModel.namespaceWords(namespace).pop() ?? 'ns'}`;
    const newAlias = this.findFreeAlias(baseAlias);
    this.prefixes[newAlias] = namespace;
    return newAlias;
  }

  /** Whether the alias can be used in a Turtle prefix declaration (PN_PREFIX). */
  public static isValidPrefixAlias(alias: string): boolean {
    return /^[A-Za-z]([\w.-]*[\w-])?$/.test(alias ?? '');
  }

  /** The default prefix of the model and the prefixes of the SAMM and RDF vocabularies can not be changed. */
  public isProtectedPrefix(alias: string): boolean {
    return (
      alias === '' ||
      ['xsd', 'rdf', 'rdfs', this.samm.getAlias(), this.sammC.getAlias(), this.sammE.getAlias(), this.sammU.getAlias()].includes(alias)
    );
  }

  /** Whether any statement of the model uses an IRI of the namespace of the prefix. */
  public isPrefixUsed(alias: string): boolean {
    const namespace = this.prefixes[alias];
    if (!namespace) {
      return false;
    }
    const usesNamespace = (term: any) =>
      (term?.termType === 'NamedNode' && term.value.startsWith(namespace)) ||
      (term?.termType === 'Literal' && Boolean(term.datatype?.value?.startsWith(namespace)));
    return this.store.some(
      quad => usesNamespace(quad.subject) || usesNamespace(quad.predicate) || usesNamespace(quad.object),
      null,
      null,
      null,
      null,
    );
  }

  /**
   * Defines a prefix chosen by the user. The prefix is written to the file even when it is not used.
   * Returns an error code when the prefix can not be defined.
   */
  public definePrefix(alias: string, namespace: string): PrefixChangeError | null {
    if (!RdfModel.isValidPrefixAlias(alias)) return 'invalidAlias';
    if (!RdfModel.isValidNamespace(namespace)) return 'invalidNamespace';
    if (this.prefixes[alias] !== undefined) return this.prefixes[alias] === namespace ? null : 'aliasInUse';
    if (this.getAliasByNamespace(namespace) !== undefined) return 'namespaceInUse';

    this.prefixes[alias] = namespace;
    this.serializationMetadata.markPrefixExplicit(alias);
    return null;
  }

  /**
   * Changes only the alias of a namespace. The IRIs of the model are not touched, so only the notation in the file changes
   * (e.g. `ex:MyProperty` becomes `example:MyProperty`, both meaning `http://example.com#MyProperty`).
   */
  public renamePrefix(oldAlias: string, newAlias: string): PrefixChangeError | null {
    if (this.prefixes[oldAlias] === undefined) return 'unknownAlias';
    if (oldAlias === newAlias) return null;
    if (this.isProtectedPrefix(oldAlias)) return 'protectedAlias';
    if (!RdfModel.isValidPrefixAlias(newAlias)) return 'invalidAlias';
    if (this.prefixes[newAlias] !== undefined) return 'aliasInUse';

    // keep the position of the prefix in the declaration order
    this.prefixes = Object.fromEntries(
      Object.entries(this.prefixes).map(([alias, namespace]) => [alias === oldAlias ? newAlias : alias, namespace]),
    ) as Prefixes<string>;
    this.serializationMetadata.renameExplicitPrefix(oldAlias, newAlias);
    this.serializationMetadata.markPrefixExplicit(newAlias);
    return null;
  }

  /** Removes a prefix which is not used by any statement. */
  public deletePrefix(alias: string): PrefixChangeError | null {
    if (this.prefixes[alias] === undefined) return 'unknownAlias';
    if (this.isProtectedPrefix(alias)) return 'protectedAlias';
    if (this.isPrefixUsed(alias)) return 'prefixInUse';

    this.removePrefix(alias);
    return null;
  }

  /**
   * Suggests an alias for a namespace: the preferred alias (e.g. the one of the referenced file) if it is free,
   * otherwise a name derived from the namespace. A number is appended when the alias is already taken.
   */
  public suggestPrefixAlias(namespace: string, preferredAlias?: string): string {
    const existingAlias = this.getAliasByNamespace(namespace);
    if (existingAlias !== undefined) {
      return existingAlias;
    }

    const candidates = [preferredAlias, RdfModel.namespaceWords(namespace).pop()].filter(
      (candidate): candidate is string => !!candidate && RdfModel.isValidPrefixAlias(candidate) && !this.isProtectedPrefix(candidate),
    );
    const free = candidates.find(candidate => this.prefixes[candidate] === undefined);
    return free ?? this.findFreeAlias(candidates[0] ?? 'ns');
  }

  private findFreeAlias(alias: string): string {
    if (this.prefixes[alias] === undefined) {
      return alias;
    }
    let count = 2;
    while (this.prefixes[`${alias}${count}`] !== undefined) {
      count++;
    }
    return `${alias}${count}`;
  }

  private static isValidNamespace(namespace: string): boolean {
    return /^[A-Za-z][\w+.-]*:[^\s<>"{}|^`\\]*$/.test(namespace ?? '');
  }

  /** Meaningful words of a namespace, e.g. `urn:samm:org.example.battery:1.0.0#` -> [..., 'example', 'battery']. */
  private static namespaceWords(namespace: string): string[] {
    return (namespace ?? '')
      .replace(/^[a-z][\w+.-]*:(\/\/)?/i, '')
      .split(/[/#:.]+/)
      .filter(part => /^[A-Za-z][\w-]*$/.test(part) && !/^(urn|samm|www|http|https|com|org|net|de|io|v\d+)$/i.test(part));
  }

  public setPrefixes(prefixes: Record<string, string>) {
    this.prefixes = {
      xsd: this.samm.getXSDNameSpace(),
      rdf: this.samm.getRdfSyntaxNameSpace(),
      rdfs: `${Samm.RDFS_URI}#`,
      [this.samm.getAlias()]: this.samm.getNamespace(),
      [this.sammU.getAlias()]: this.sammU.getNamespace(),
      [this.sammC.getAlias()]: this.sammC.getNamespace(),
      [this.sammE.getAlias()]: this.sammE.getNamespace(),
      ...prefixes,
    };
  }

  public setSourceLocation(sourceLocation: string) {
    this.sourceLocation = sourceLocation;
  }

  public getLocale(quad: Quad) {
    if (quad && quad.object['language']) {
      return locale.getByTag(quad.object['language']).tag;
    }
    return null;
  }

  public resolveBlankNodes(uri: string, resolvedNodes: Array<Quad> = []): Array<Quad> {
    this.store.getQuads(DataFactory.blankNode(uri), null, null, null).forEach(value => {
      if (Util.isBlankNode(value.object)) {
        this.resolveBlankNodes(value.object.value, resolvedNodes);
      } else if (!value.object.value.startsWith(Samm.RDF_URI)) {
        resolvedNodes.push(DataFactory.quad(value.subject, value.predicate, value.object));
      }
    });

    return resolvedNodes;
  }

  public resolveParent(quad: Quad): Quad {
    let parentQuad = quad;
    if (Util.isBlankNode(quad.subject)) {
      parentQuad = this.store.getQuads(null, null, quad.subject.id, null)[0];
      if (parentQuad === undefined) {
        return quad;
      } else if (Util.isBlankNode(parentQuad.object)) {
        parentQuad = this.resolveParent(parentQuad);
      }
    }
    return parentQuad;
  }

  public findAnyProperty(quad: Quad | NamedNode): Array<Quad> {
    if (quad instanceof Quad) {
      return this.store.getQuads(quad.object, null, null, null);
    } else {
      return this.store.getQuads(quad, null, null, null);
    }
  }

  private resolveMetaModelVersion(): void {
    const metaModelPrefix = this.store
      .getQuads(null, null, null, null)
      .find(quad => quad.object.value.startsWith('urn:samm:org.eclipse.esmf.samm:meta-model:'));
    if (metaModelPrefix) {
      const prefixPart = metaModelPrefix.object.value.split(':');
      this.metaModelVersion = prefixPart[prefixPart.length - 1].split('#')[0];
    } else {
      this.metaModelVersion = 'unknown';
    }
  }

  private resolveNamespaces(): void {
    this.store
      .getQuads(null, null, null, null)
      .filter(quad => !Util.isBlankNode(quad.subject) && !Util.isBlankNode(quad.object))
      .filter(quad => quad.object.value.includes('urn:samm:org.eclipse.esmf.samm:meta-model:'))
      .filter(quad => quad.object.value.startsWith('urn') || quad.object.value.startsWith('http://www.w3.org/2001/XMLSchema'))
      .forEach(quad => {
        const namespace = quad.object.value.split('#')[0] + '#';
        this.addPrefix(RdfModelUtil.resolveNamespaceAlias(namespace, this.metaModelVersion || ''), namespace);
      });
  }
}
