/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {DataFactory, NamedNode, Prefixes, Quad, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject, Store, Util, Writer} from 'n3';
import * as locale from 'locale-codes';
import {InstantiatorListElement} from '@ame/rdf/models';
import {Samm, SammC, SammE, SammU} from '@ame/vocabulary';
import {RdfModelUtil} from '@ame/rdf/utils/rdf-model-util';
import {config} from '@ame/shared';

interface QuadComponents {
  subject?: Quad_Subject;
  predicate?: Quad_Predicate;
  object?: Quad_Object;
  graph?: Quad_Graph;
}

export class RdfModel {
  private _store: Store;
  private _prefixes: Prefixes;
  private _isExternalRef = false;
  private _absoluteAspectModelFileName: string = null;
  private _metaModelVersion: string;
  private _defaultAspectModelAlias = '';

  public samm: Samm;
  public sammC: SammC;
  public sammE: SammE;
  public sammU: SammU;

  public hasErrors = false;
  public originalAbsoluteFileName = null;
  public loadedFromWorkspace = false;
  public aspect: Quad_Subject;

  get store(): Store {
    return this._store;
  }

  get prefixes(): Prefixes {
    return this._prefixes;
  }

  get isExternalRef(): boolean {
    return this._isExternalRef;
  }

  set isExternalRef(value: boolean) {
    this._isExternalRef = value;
  }

  get aspectUrn(): string {
    return this.aspect?.value || this.getAspectModelUrn();
  }

  private get nameBasedOnAspect() {
    return this.aspect ? this.aspect.value.replace('urn:samm:', '').replace('#', ':') + '.ttl' : null;
  }

  set absoluteAspectModelFileName(absoluteFileName: string) {
    this._absoluteAspectModelFileName = absoluteFileName.replace('urn:samm:', '').replace('#', ':');
  }

  get absoluteAspectModelFileName(): string {
    if (this._absoluteAspectModelFileName) {
      return this._absoluteAspectModelFileName;
    }

    if (this.aspect) {
      return this.nameBasedOnAspect;
    }

    return null;
  }

  get aspectModelFileName(): string {
    return this._absoluteAspectModelFileName.split(':')[2];
  }

  get isNamespaceChanged(): boolean {
    return this.isNamespaceNameChanged || this.isNamespaceVersionChanged;
  }

  get isNamespaceNameChanged(): boolean {
    if (!this.originalAbsoluteFileName || !this.absoluteAspectModelFileName) return false;
    return (
      RdfModelUtil.getNamespaceNameFromRdf(this.originalAbsoluteFileName) !==
      RdfModelUtil.getNamespaceNameFromRdf(this.absoluteAspectModelFileName)
    );
  }

  get isNamespaceVersionChanged(): boolean {
    if (!this.originalAbsoluteFileName || !this.absoluteAspectModelFileName) return false;
    return (
      RdfModelUtil.getNamespaceVersionFromRdf(this.originalAbsoluteFileName) !==
      RdfModelUtil.getNamespaceVersionFromRdf(this.absoluteAspectModelFileName)
    );
  }

  public initRdfModel(store: Store, prefixes: Prefixes, mode: 'empty' | 'loaded' = 'loaded'): RdfModel {
    this._store = store;
    this._prefixes = prefixes;

    if (mode === 'loaded') {
      this.generateFromFile();
    } else {
      // create environment for empty file
      this.generateEmptyModel();
    }

    return this;
  }

  private generateFromFile() {
    this.resolveMetaModelVersion();
    this.setSamm();
    this.setDefaultAspectModelAlias();
    const aspect = this._store.getSubjects(this.samm.RdfType(), this.samm.Aspect(), null)[0];
    this.setAspect(aspect?.value);

    return this;
  }

  private generateEmptyModel() {
    this._metaModelVersion = config.currentSammVersion;
    this.setSamm();
    this.addPrefix('samm', this.samm.getUri() + '#');
    this.addPrefix('samm-c', this.sammC.getUri() + '#');
    this.addPrefix('samm-e', this.sammE.getUri() + '#');
    this.addPrefix('samm-u', this.sammU.getUri() + '#');
    this.addPrefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    this.addPrefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');
    this.addPrefix('xsd', 'http://www.w3.org/2001/XMLSchema#');
    this._defaultAspectModelAlias = '';
    this.setAspect(null);
  }

  private setSamm() {
    this.samm = new Samm(this._metaModelVersion);
    this.sammC = new SammC(this.samm);
    this.sammE = new SammE(this.samm);
    this.sammU = new SammU(this.samm);
  }

  setAspect(aspectUrn: string): void {
    this.aspect = aspectUrn ? DataFactory.namedNode(aspectUrn) : null;
  }

  updateAspectVersion(oldVersion: string, newVersion: string): void {
    if (this.aspect) {
      this.aspect = DataFactory.namedNode(this.aspect.id.replace(oldVersion, newVersion));
    }
  }

  removeAspectFromStore(): void {
    this.aspect = null;
  }

  getMetaModelVersion(): string {
    return this._metaModelVersion;
  }

  getNamespaces(): Prefixes<any> {
    return this.prefixes;
  }

  getPrefixes(): Prefixes<any> {
    return this.prefixes;
  }

  getAspectModelUrn(): string {
    return this.getNamespaces()[this._defaultAspectModelAlias];
  }

  addPrefix(alias: string, namespace: any): void {
    const inPrefixes = Object.values(this.prefixes).some(value => value === namespace);
    if ((alias === '' || alias === undefined) && !inPrefixes) {
      const matched = namespace.match(/[a-zA-Z]+/gi); //NOSONAR
      if (matched.length) {
        let newAlias = `ext-${matched[matched.length - 1]}`;
        if (this.prefixes[newAlias]) {
          let count = 2;
          newAlias = `ext-${matched[matched.length - 1]}${count}`;
          while (this.prefixes[newAlias]) {
            count++;
          }
        }
        this.prefixes[newAlias] = namespace;
        return;
      }
    }

    if (inPrefixes) {
      return;
    }

    if (this.prefixes[alias]) {
      let count = 1;
      while (this.prefixes[`${alias}${count}`]) {
        count++;
      }
      this.prefixes[`${alias}${count}`] = namespace;
      return;
    }

    this.prefixes[alias] = namespace;
  }

  updatePrefix(alias: string, oldValue: string, newValue: string): void {
    const prefix: any = this.prefixes[alias];
    const newPrefix = prefix.replace(oldValue, newValue);
    this.prefixes[alias] = newPrefix as any;
  }

  removePrefix(shortPrefixName: string): void {
    delete this.prefixes[shortPrefixName];
  }

  getAliasByNamespace(namespace: string): string {
    return Object.keys(this.prefixes).find(alias => (this.prefixes[alias] as any) === namespace);
  }

  hasNamespace(namespace: string): boolean {
    return Object.values(this.prefixes).some(localNamespace => (localNamespace as any) === namespace);
  }

  hasLocalTag(quad: Quad): boolean {
    return quad?.object.termType === 'Literal' && Boolean(quad?.object['language']);
  }

  getLocale(quad: Quad): string {
    return quad?.object?.['language'] ? locale.getByTag(quad.object['language']).tag : null;
  }

  public resolveRecursiveBlankNodes(uri: string, writer: Writer): Quad[] {
    const quads: Quad[] = this.store.getQuads(DataFactory.blankNode(uri), null, null, null);
    const blankNodes = [];

    for (const quad of quads) {
      if (Util.isBlankNode(quad.subject) && Util.isBlankNode(quad.object)) {
        const currentBlankNodes = this.resolveRecursiveBlankNodes(quad.object.value, writer);

        if (currentBlankNodes.every(({predicate}) => predicate.value.startsWith(Samm.RDF_URI))) {
          blankNodes.push(...currentBlankNodes);
          continue;
        }

        blankNodes.push(DataFactory.quad(quad.subject, quad.predicate, writer.blank(currentBlankNodes)));
        continue;
      }

      if (Util.isBlankNode(quad.object)) {
        const currentBlankNodes = this.resolveRecursiveBlankNodes(quad.object.value, writer);

        blankNodes.push(...currentBlankNodes);
        continue;
      }

      if (!quad.object.value.startsWith(Samm.RDF_URI)) {
        blankNodes.push(DataFactory.quad(quad.subject, quad.predicate, quad.object));
      }
    }

    return blankNodes;
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

  public getListElements(list: Quad_Object): InstantiatorListElement[] {
    const elements: InstantiatorListElement[] = [];
    const quads: Quad[] = this.store.getQuads(list, null, null, null);
    for (const quad of quads) {
      const isRdfFirst = this.samm.isRdfFirst(quad.predicate.value);

      if (isRdfFirst && Util.isBlankNode(quad.object)) {
        const blankNodeElements = this.store.getQuads(quad.object, null, null, null);
        elements.push({
          blankNode: true,
          optional: blankNodeElements.find(e => e.predicate.value === this.samm.OptionalProperty().value)?.object,
          notInPayload: blankNodeElements.find(e => e.predicate.value === this.samm.NotInPayloadProperty().value)?.object,
          payloadName: blankNodeElements.find(e => e.predicate.value === this.samm.payloadNameProperty().value)?.object,
          quad: blankNodeElements.find(e => e.predicate.value === this.samm.PropertyProperty().value)?.object || quad.subject,
          extends: blankNodeElements.find(e => e.predicate.value === this.samm.ExtendsProperty().value)?.object,
        });
        continue;
      }

      if (isRdfFirst) {
        elements.push({quad: quad.object, blankNode: false});
        continue;
      }

      if (this.samm.isRdfRest(quad.predicate.value) && !this.samm.isRdfNill(quad.object.value)) {
        elements.push(...this.getListElements(quad.object));
      }
    }

    return elements;
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

  findAnyProperty(quad: Quad_Subject | Quad_Object | Quad | NamedNode): Array<Quad> {
    if (quad instanceof Quad) {
      return this.store.getQuads(quad.object, null, null, null);
    } else {
      return this.store.getQuads(quad, null, null, null);
    }
  }

  updateQuads(query: QuadComponents, replacement: QuadComponents): number {
    const quads: Quad[] = this.getQuads(query);
    return quads.reduce((counter, quad) => {
      this.modifyQuad(replacement, quad);
      return ++counter;
    }, 0);
  }

  getQuads(query: QuadComponents): Quad[] {
    return this.store.getQuads(query.subject || null, query.predicate || null, query.object || null, query.graph || null);
  }

  modifyQuad(replacement: QuadComponents, quad: Quad): void {
    const updatedQuad: [Quad_Subject, Quad_Predicate, Quad_Object, Quad_Graph] = [
      replacement.subject || quad.subject,
      replacement.predicate || quad.predicate,
      replacement.object || quad.object,
      replacement.graph || quad.graph,
    ];
    this.store.addQuad(...updatedQuad);
    this.store.removeQuad(quad);
  }

  updateAbsoluteFileName(newNamespace: string, newVersion: string): void {
    if (!this.originalAbsoluteFileName) this.originalAbsoluteFileName = this.absoluteAspectModelFileName;
    if (this.originalAbsoluteFileName !== this.absoluteAspectModelFileName)
      this.originalAbsoluteFileName = this.absoluteAspectModelFileName;

    const fileName = RdfModelUtil.getFileNameFromRdf(this.absoluteAspectModelFileName);
    this.absoluteAspectModelFileName = RdfModelUtil.buildAbsoluteFileName(newNamespace, newVersion, fileName);
  }

  isSameFile(absoluteFileName: string): boolean {
    return this.loadedFromWorkspace && this.absoluteAspectModelFileName === absoluteFileName;
  }

  private resolveMetaModelVersion(): void {
    const metaModelPrefix =
      this.store.getQuads(null, null, null, null).find(quad => quad.object.value.startsWith('urn:samm:org.eclipse.esmf.samm:meta-model:'))
        ?.object?.value ||
      this.store
        .getQuads(null, null, null, null)
        .find(quad => quad.predicate.value.startsWith('urn:samm:org.eclipse.esmf.samm:meta-model:'))?.predicate?.value;

    if (metaModelPrefix) {
      const prefixPart = metaModelPrefix.split(':');
      this._metaModelVersion = prefixPart[prefixPart.length - 1].split('#')[0];
      return;
    }

    this._metaModelVersion = 'unknown';
  }

  private setDefaultAspectModelAlias() {
    const subject = this.store.getSubjects(this.samm.RdfType(), null, null);
    const namespace = `${subject[0]?.value.split('#')[0]}#`;

    this._defaultAspectModelAlias = this.getAliasByNamespace(namespace);

    // Special case when aspect models are defined manually without prefix.
    if (this._defaultAspectModelAlias === undefined) {
      this.addPrefix('default', namespace);
      this._defaultAspectModelAlias = this.getAliasByNamespace(namespace);
    }
  }

  SAMM(): Samm {
    return this.samm;
  }

  SAMMC(): SammC {
    return this.sammC;
  }

  SAMME(): SammE {
    return this.sammE;
  }

  SAMMU(): SammU {
    return this.sammU;
  }
}
