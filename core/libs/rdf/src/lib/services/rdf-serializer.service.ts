/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {RdfModel} from '@ame/rdf/utils';
import {DataFactory, Quad, Util, Writer} from 'n3';
import {Samm} from '@ame/vocabulary';

export class RdfSerializerService {
  private _namedNode = DataFactory.namedNode;

  serializeModel(rdfModel: RdfModel): string {
    const writer = this.initializeWriter(rdfModel);
    if (!writer) return '';

    const processedQuads = new Set<Quad>();
    rdfModel.store.forEach(
      quad => {
        if (this.shouldSkipQuad(quad, processedQuads)) return;

        this.processQuad(quad, rdfModel, writer, processedQuads);
      },
      null,
      null,
      null,
      null
    );

    let rdfContent = '';
    writer.end((error, rdf) => (rdfContent = rdf || ''));
    return rdfContent;
  }

  private initializeWriter(rdfModel: RdfModel): Writer | null {
    try {
      return new Writer({
        contentType: 'text/turtle',
        prefixes: {...rdfModel.getPrefixes()},
        end: false,
      });
    } catch {
      return null;
    }
  }

  private shouldSkipQuad(quad: Quad, processedQuads: Set<Quad>): boolean {
    return processedQuads.has(quad) || (Util.isBlankNode(quad.object) && Util.isBlankNode(quad.subject));
  }

  private processQuad(quad: Quad, rdfModel: RdfModel, writer: Writer, processedQuads: Set<Quad>): void {
    if (Util.isBlankNode(quad.object)) {
      this.writeBlankNodes(quad, rdfModel, writer, rdfModel.SAMMC().getMetaModelNames(false));
    } else if (Util.isBlankNode(quad.subject)) {
      const resolvedQuads = rdfModel.resolveBlankNodes(quad.subject.value).map(resolvedQuad => {
        processedQuads.add(resolvedQuad);
        return {predicate: resolvedQuad.predicate, object: resolvedQuad.object};
      });
      writer.blank(resolvedQuads);
    } else {
      this.handleNonBlankNodes(quad, rdfModel, writer);
    }
    processedQuads.add(quad);
  }

  private handleNonBlankNodes(quad: Quad, rdfModel: RdfModel, writer: Writer): void {
    if (quad.object.value.startsWith(Samm.XSD_URI)) {
      writer.addQuad(this.createQuadWithReplacedNamespace(quad, `${Samm.XSD_URI}#`, 'xsd:'));
    } else if (quad.object.value === `${Samm.RDF_URI}#langString`) {
      writer.addQuad(this.createQuadWithReplacedNamespace(quad, `${Samm.RDF_URI}#`, 'rdf:'));
    } else if (quad.object.value.startsWith(rdfModel.SAMM().getNamespace())) {
      writer.addQuad(this.createQuadWithReplacedNamespace(quad, rdfModel.SAMM().getNamespace(), `${rdfModel.SAMM().getAlias()}:`));
    } else if (quad.object.value === rdfModel.SAMM().RdfNil().value) {
      writer.addQuad(this._namedNode(quad.subject.value), this._namedNode(quad.predicate.value), writer.list([]));
    } else {
      writer.addQuad(quad);
    }
  }

  private createQuadWithReplacedNamespace(quad: Quad, originalNamespace: string, newNamespace: string): Quad {
    return DataFactory.quad(
      quad.subject,
      quad.predicate,
      DataFactory.namedNode(quad.object.value.replace(originalNamespace, newNamespace))
    );
  }

  private writeBlankNodes(quad: Quad, rdfModel: RdfModel, writer: Writer, metaModelNames: string[]): void {
    const blankNodes = rdfModel.resolveRecursiveBlankNodes(quad.object.value, writer);
    const isBlankNode = blankNodes.some(({object}) => metaModelNames.includes(object.value));

    if (isBlankNode) {
      writer.addQuad(this._namedNode(quad.subject.value), this._namedNode(quad.predicate.value), writer.blank(blankNodes));
      return;
    }

    writer.addQuad(
      this._namedNode(quad.subject.value),
      this._namedNode(quad.predicate.value),
      writer.list(blankNodes.map(({object}) => object))
    );
  }
}
