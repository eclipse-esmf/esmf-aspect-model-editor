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
import {LanguageTranslationService} from '@ame/translation';
import {Injectable} from '@angular/core';
import {RdfModel, RdfModelUtil, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Quad, Util, Writer} from 'n3';

@Injectable({
  providedIn: 'root',
})
export class RdfSerializerService {
  private _namedNode = DataFactory.namedNode;

  constructor(private translation: LanguageTranslationService) {}

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
      null,
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
      this.writeBlankNodes(quad, rdfModel, writer, rdfModel.sammC.getMetaModelNames(false));
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
    } else if (quad.object.id.includes(`${Samm.RDF_URI}#langString`) && rdfModel.samm.isExampleValueProperty(quad.predicate.value)) {
      writer.addQuad(this.createLangStringQuad(quad));
    } else if (quad.object.value.startsWith(rdfModel.samm.getNamespace())) {
      writer.addQuad(this.createQuadWithReplacedNamespace(quad, rdfModel.samm.getNamespace(), `${rdfModel.samm.getAlias()}:`));
    } else if (quad.object.value === rdfModel.samm.RdfNil().value) {
      writer.addQuad(this._namedNode(quad.subject.value), this._namedNode(quad.predicate.value), writer.list([]));
    } else {
      writer.addQuad(quad);
    }
  }

  private createLangStringQuad(quad: Quad): Quad {
    const currentLang = this.translation.translateService.currentLang;
    return DataFactory.quad(quad.subject, quad.predicate, DataFactory.literal(quad.object.value, currentLang));
  }

  private createQuadWithReplacedNamespace(quad: Quad, originalNamespace: string, newNamespace: string): Quad {
    return DataFactory.quad(
      quad.subject,
      quad.predicate,
      DataFactory.namedNode(quad.object.value.replace(originalNamespace, newNamespace)),
    );
  }

  private writeBlankNodes(quad: Quad, rdfModel: RdfModel, writer: Writer, metaModelNames: string[]): void {
    const blankNodes = RdfModelUtil.resolveRecursiveBlankNodes(rdfModel, quad.object.value, writer);
    const isBlankNode = blankNodes.some(({object}) => metaModelNames.includes(object.value));

    if (isBlankNode) {
      writer.addQuad(this._namedNode(quad.subject.value), this._namedNode(quad.predicate.value), writer.blank(blankNodes));
      return;
    }

    writer.addQuad(
      this._namedNode(quad.subject.value),
      this._namedNode(quad.predicate.value),
      writer.list(blankNodes.map(({object}) => object)),
    );
  }
}
