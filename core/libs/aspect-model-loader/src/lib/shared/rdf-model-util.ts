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

import {DataFactory, Quad, Util, Writer} from 'n3';
import {DefaultEntity, Entity} from '../aspect-meta-model/default-entity';
import {Samm} from '../vocabulary/samm';
import {SammC} from '../vocabulary/samm-c';
import {SammE} from '../vocabulary/samm-e';
import {SammU} from '../vocabulary/samm-u';
import {KnownVersion} from './known-version';
import {RdfModel} from './rdf-model';

export class RdfModelUtil {
  static readonly defaultAspectModelAlias = '';

  static resolveNamespaceAlias(namespace: string, metaModelVersion: string): string {
    const samm = new Samm(metaModelVersion);
    const sammC = new SammC(samm);
    const sammE = new SammE(samm);
    const sammU = new SammU(samm);

    if (namespace.startsWith(samm.getNamespace())) {
      return samm.getAlias();
    }

    if (namespace.startsWith(sammC.getNamespace())) {
      return sammC.getAlias();
    }

    if (namespace.startsWith(sammE.getNamespace())) {
      return sammE.getAlias();
    }

    if (namespace.startsWith(sammU.getNamespace())) {
      return sammU.getAlias();
    }

    if (namespace.startsWith(Samm.XSD_URI)) {
      return 'xsd';
    }

    if (namespace.startsWith(Samm.RDF_URI)) {
      return 'rdf';
    }

    if (namespace.startsWith(Samm.RDFS_URI)) {
      return 'rdfs';
    }

    return this.defaultAspectModelAlias;
  }

  static isSammDefinition(urn: string, samm: Samm): boolean {
    return urn && urn.includes(samm.getNamespace());
  }

  static isSammCDefinition(urn: string, sammC: SammC): boolean {
    return urn && urn.includes(sammC.getNamespace());
  }

  static isSammUDefinition(urn: string, sammU: SammU): boolean {
    return urn && urn.includes(sammU.getNamespace());
  }

  static isCharacteristicInstance(urn: string, sammC: SammC): boolean {
    return urn && urn.includes(sammC.getNamespace());
  }

  static isUnitInstance(urn: string, sammU: SammU): boolean {
    return urn && urn.includes(sammU.getNamespace());
  }

  static isAspectModelDefinition(urn: string, rdfModel: RdfModel) {
    return urn && urn.includes(rdfModel.getAspectModelUrn());
  }

  static getValueWithoutUrnDefinition(value: any): string {
    if (value && (`${value}`.startsWith('urn:samm') || `${value}`.startsWith(Samm.XSD_URI) || `${value}`.startsWith(Samm.RDF_URI))) {
      return `${value}`.split('#').pop();
    }
    return value === null ? '' : `${value}`;
  }

  static getValuesWithoutUrnDefinition(values: Array<Entity | string | number>): string {
    return values
      .map(value => {
        return value instanceof DefaultEntity ? value.name : RdfModelUtil.getValueWithoutUrnDefinition(value);
      })
      .join(', ');
  }

  static appendLocale(value: string, locale: string): string {
    return `${value} ${locale ? `@${locale}` : ''}`;
  }

  static throwErrorIfUnsupportedVersion(rdfModel: RdfModel): void {
    if (rdfModel && KnownVersion.isVersionSupported(rdfModel.getMetaModelVersion()) === false) {
      throw Error(
        `SAMM ${rdfModel.getMetaModelVersion()} is not supported. Supported versions are: ${KnownVersion.getSupportedVersions().join()}`,
      );
    }
  }

  static isRdfList(rdfModel: RdfModel, node: Quad['object']): boolean {
    if (!Util.isBlankNode(node)) {
      return false;
    }
    return (
      rdfModel.store.getQuads(node, DataFactory.namedNode(`${Samm.RDF_URI}#first`), null, null).length > 0 ||
      rdfModel.store.getQuads(node, DataFactory.namedNode(`${Samm.RDF_URI}#rest`), null, null).length > 0
    );
  }

  static resolveRdfListElements(rdfModel: RdfModel, head: Quad['object'], writer: Writer, processedQuads?: Set<Quad>): Quad['object'][] {
    const elements: Quad['object'][] = [];
    let current: Quad['object'] = head;
    const nilUri = `${Samm.RDF_URI}#nil`;
    const firstPred = DataFactory.namedNode(`${Samm.RDF_URI}#first`);
    const restPred = DataFactory.namedNode(`${Samm.RDF_URI}#rest`);

    while (current && current.value !== nilUri) {
      const firstQuads = rdfModel.store.getQuads(current, firstPred, null, null);
      if (firstQuads.length > 0) {
        processedQuads?.add(firstQuads[0]);
        const obj = firstQuads[0].object;
        if (Util.isBlankNode(obj)) {
          const itemBlankNodes = RdfModelUtil.resolveRecursiveBlankNodes(rdfModel, obj.value, writer, processedQuads);
          elements.push(writer.blank(itemBlankNodes));
        } else {
          elements.push(obj);
        }
      }
      const restQuads = rdfModel.store.getQuads(current, restPred, null, null);
      if (restQuads.length > 0) {
        processedQuads?.add(restQuads[0]);
        current = restQuads[0].object;
      } else {
        break;
      }
    }
    return elements;
  }

  static resolveRecursiveBlankNodes(rdfModel: RdfModel, uri: string, writer: Writer, processedQuads?: Set<Quad>): Quad[] {
    const blankNode = DataFactory.blankNode(uri);
    if (RdfModelUtil.isRdfList(rdfModel, blankNode)) {
      const listElements = RdfModelUtil.resolveRdfListElements(rdfModel, blankNode, writer, processedQuads);
      return listElements.map(el => DataFactory.quad(blankNode, DataFactory.namedNode(`${Samm.RDF_URI}#first`), el));
    }

    const quads: Quad[] = rdfModel.store.getQuads(blankNode, null, null, null);
    const blankNodes = [];

    for (const quad of quads) {
      processedQuads?.add(quad);

      if (quad.object.value === `${Samm.RDF_URI}#nil`) {
        blankNodes.push(DataFactory.quad(quad.subject, quad.predicate, writer.list([]) as unknown as Quad['object']));
        continue;
      }

      if (RdfModelUtil.isRdfList(rdfModel, quad.object)) {
        const listElements = RdfModelUtil.resolveRdfListElements(rdfModel, quad.object, writer, processedQuads);
        blankNodes.push(DataFactory.quad(quad.subject, quad.predicate, writer.list(listElements) as unknown as Quad['object']));
        continue;
      }

      if (Util.isBlankNode(quad.object)) {
        const currentBlankNodes = RdfModelUtil.resolveRecursiveBlankNodes(rdfModel, quad.object.value, writer, processedQuads);
        blankNodes.push(DataFactory.quad(quad.subject, quad.predicate, writer.blank(currentBlankNodes)));
        continue;
      }

      blankNodes.push(DataFactory.quad(quad.subject, quad.predicate, quad.object));
    }

    return blankNodes;
  }
}
