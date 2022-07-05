/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {DataFactory, NamedNode, Prefixes, Quad, Quad_Object, Quad_Subject, Store, Util, Writer} from 'n3';
import * as locale from 'locale-codes';
import {InstantiatorListElement} from './rdf-model.types';
import {DataTypeService} from '@ame/shared';
import {Bamm, Bammc, Bamme, Bammu} from '@ame/vocabulary';

export class RdfModel {
  private metaModelVersion;
  private metaModelIdentifier;

  private readonly bamm: Bamm;
  private readonly bammc: Bammc;
  private readonly bamme: Bamme;
  private readonly bammu: Bammu;

  private _isExternalRef = false;
  private _aspectModelFileName: string;

  private defaultAspectModelAlias = '';

  get isExternalRef(): boolean {
    return this._isExternalRef;
  }

  set isExternalRef(value: boolean) {
    this._isExternalRef = value;
  }

  get aspectModelFileName(): string {
    return this._aspectModelFileName;
  }

  set aspectModelFileName(value: string) {
    this._aspectModelFileName = value.split(':')[2];
  }

  constructor(public store: Store, public dataTypeService: DataTypeService, private prefixes: Prefixes) {
    this.resolveMetaModelVersion();
    this.bamm = new Bamm(this.metaModelVersion, this.metaModelIdentifier);
    this.bammc = new Bammc(this.bamm);
    this.bamme = new Bamme(this.bamm);
    this.bammu = new Bammu(this.bamm);
    this.setDefaultAspectModelAlias();
  }

  getMetaModelVersion(): string {
    return this.metaModelVersion;
  }

  getNamespaces(): Prefixes<any> {
    return this.prefixes;
  }

  getPrefixes(): Prefixes<any> {
    return this.prefixes;
  }

  getAspectModelUrn(): string {
    return this.getNamespaces()[this.defaultAspectModelAlias];
  }

  addPrefix(alias: string, namespace: any): void {
    const inPrefixes = Object.values(this.prefixes).some(value => value === namespace);
    if (alias === '' && !inPrefixes) {
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

  getAliasByNamespace(namespace: string) {
    return Object.keys(this.prefixes).find(alias => (this.prefixes[alias] as any) === namespace);
  }

  hasNamespace(namespace: string) {
    return Object.values(this.prefixes).some(localNamespace => (localNamespace as any) === namespace);
  }

  getLocale(quad: Quad) {
    return quad ? locale.getByTag(quad.object['language']).tag : null;
  }

  getAbsoluteAspectModelFileName() {
    const aspect = this.store.getSubjects(null, this.BAMM().Aspect(), null)?.[0];

    if (aspect) {
      return aspect.value.replace('urn:bamm:', '').replace('#', ':') + '.ttl';
    }

    return `${this.getAspectModelUrn().replace('urn:bamm:', '').replace('#', ':')}${this.aspectModelFileName}`;
  }

  public resolveRecursiveBlankNodes(uri: string, writer: Writer): Quad[] {
    const quads: Quad[] = this.store.getQuads(DataFactory.blankNode(uri), null, null, null);
    const blankNodes = [];

    for (const quad of quads) {
      if (Util.isBlankNode(quad.subject) && Util.isBlankNode(quad.object)) {
        const currentBlankNodes = this.resolveRecursiveBlankNodes(quad.object.value, writer);

        if (currentBlankNodes.every(({predicate}) => predicate.value.startsWith(Bamm.RDF_URI))) {
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

      if (!quad.object.value.startsWith(Bamm.RDF_URI)) {
        blankNodes.push(DataFactory.quad(quad.subject, quad.predicate, quad.object));
      }
    }

    return blankNodes;
  }

  public resolveBlankNodes(uri: string, resolvedNodes: Array<Quad> = []): Array<Quad> {
    this.store.getQuads(DataFactory.blankNode(uri), null, null, null).forEach(value => {
      if (Util.isBlankNode(value.object)) {
        this.resolveBlankNodes(value.object.value, resolvedNodes);
      } else if (!value.object.value.startsWith(Bamm.RDF_URI)) {
        resolvedNodes.push(DataFactory.quad(value.subject, value.predicate, value.object));
      }
    });

    return resolvedNodes;
  }

  public getListElements(list: Quad_Object): InstantiatorListElement[] {
    const elements: InstantiatorListElement[] = [];
    const quads: Quad[] = this.store.getQuads(list, null, null, null);
    for (const quad of quads) {
      const isRdfFirst = this.bamm.isRdfFirst(quad.predicate.value);

      if (isRdfFirst && Util.isBlankNode(quad.object)) {
        const blankNodeElements = this.store.getQuads(quad.object, null, null, null);
        elements.push({
          blankNode: true,
          optional: blankNodeElements.find(e => e.predicate.value === this.bamm.OptionalProperty().value)?.object,
          notInPayload: blankNodeElements.find(e => e.predicate.value === this.bamm.NotInPayloadProperty().value)?.object,
          payloadName: blankNodeElements.find(e => e.predicate.value === this.bamm.payloadNameProperty().value)?.object,
          quad: blankNodeElements.find(e => e.predicate.value === this.bamm.PropertyProperty().value)?.object || quad.subject,
          extends: blankNodeElements.find(e => e.predicate.value === this.bamm.ExtendsProperty().value)?.object,
        });
        continue;
      }

      if (isRdfFirst) {
        elements.push({quad: quad.object, blankNode: false});
        continue;
      }

      if (this.bamm.isRdfRest(quad.predicate.value) && !this.bamm.isRdfNill(quad.object.value)) {
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

  private resolveMetaModelVersion(): void {
    const metaModelPrefix =
      this.store.getQuads(null, null, null, null).find(quad => quad.object.value.startsWith('urn:bamm:io.openmanufacturing:meta-model:'))
        ?.object?.value ||
      this.store.getQuads(null, null, null, null).find(quad => quad.predicate.value.startsWith('urn:bamm:io.openmanufacturing:meta-model:'))
        ?.predicate?.value;

    if (metaModelPrefix) {
      const prefixPart = metaModelPrefix.split(':');
      this.metaModelVersion = prefixPart[prefixPart.length - 1].split('#')[0];
      return;
    }

    this.metaModelVersion = 'unknown';
    this.metaModelIdentifier = 'unknown';
  }

  private setDefaultAspectModelAlias() {
    const subject = this.store.getSubjects(this.bamm.RdfType(), null, null);
    this.defaultAspectModelAlias = this.getAliasByNamespace(`${subject[0].value.split('#')[0]}#`);
  }

  BAMM(): Bamm {
    return this.bamm;
  }

  BAMMC(): Bammc {
    return this.bammc;
  }

  BAMME(): Bamme {
    return this.bamme;
  }

  BAMMU(): Bammu {
    return this.bammu;
  }
}
