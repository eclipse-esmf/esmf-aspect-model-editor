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
import {ModelDocumentService} from '@ame/domain';
import {LanguageTranslationService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {RdfModel, RdfModelUtil, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Quad, Util, Writer} from 'n3';

/**
 * Tracks written statements by value. The n3 store creates new quad objects on every read,
 * so an identity based set would let statements read twice be written twice.
 */
class ProcessedQuads extends Set<Quad> {
  private readonly quadKeys = new Set<string>();

  private static key(quad: Quad): string {
    return `${quad.subject.id}\u0000${quad.predicate.id}\u0000${quad.object.id}\u0000${quad.graph.id}`;
  }

  override add(quad: Quad): this {
    this.quadKeys?.add(ProcessedQuads.key(quad));
    return this;
  }

  override has(quad: Quad): boolean {
    return this.quadKeys.has(ProcessedQuads.key(quad));
  }
}

@Injectable({providedIn: 'root'})
export class RdfSerializerService {
  private static readonly NATIVE_XSD_DATATYPES = new Set([
    `${Samm.XSD_URI}#string`,
    `${Samm.XSD_URI}#boolean`,
    `${Samm.XSD_URI}#integer`,
    `${Samm.XSD_URI}#decimal`,
    `${Samm.XSD_URI}#double`,
  ]);

  /** Attribute order inside an element, aligned with the formatter of the ESMF SDK. */
  private static readonly PREDICATE_ORDER = [
    'extends',
    'preferredName',
    'description',
    'see',
    'characteristic',
    'properties',
    'operations',
    'events',
    'input',
    'output',
    'dataType',
    'exampleValue',
    'value',
    'property',
    'optional',
    'baseCharacteristic',
    'languageCode',
    'localeCode',
    'left',
    'right',
    'minValue',
    'maxValue',
    'lowerBoundDefinition',
    'upperBoundDefinition',
    'defaultValue',
    'unit',
    'deconstructionRule',
    'elements',
    'values',
    'integer',
    'scale',
  ];

  private readonly translation = inject(LanguageTranslationService, {optional: true});
  private readonly modelDocumentService = inject(ModelDocumentService, {optional: true});

  private readonly _namedNode = DataFactory.namedNode;

  serializeModel(rdfModel: RdfModel): string {
    if (!rdfModel?.store) {
      return '';
    }
    const writer = this.initializeWriter(rdfModel);
    if (!writer) return '';

    const processedQuads = new ProcessedQuads();
    // the elements are written in the order of the source file, remaining statements follow in store order
    for (const subject of this.modelDocumentService?.resolveSubjectOrder(rdfModel) ?? []) {
      const quads = rdfModel.store.getQuads(subject, null, null, null).sort((a, b) => this.comparePredicates(a, b, rdfModel));
      for (const quad of quads) {
        if (!this.shouldSkipQuad(quad, processedQuads)) {
          this.processQuad(quad, rdfModel, writer, processedQuads);
        }
      }
    }

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
        prefixes: this.getUsedPrefixes(rdfModel),
        end: false,
      });
    } catch {
      return null;
    }
  }

  private getUsedPrefixes(rdfModel: RdfModel): Record<string, string> {
    const allPrefixes: Record<string, string> = {
      xsd: rdfModel?.samm?.getXSDNameSpace?.() ?? `${Samm.XSD_URI}#`,
      rdf: rdfModel?.samm?.getRdfSyntaxNameSpace?.() ?? `${Samm.RDF_URI}#`,
      rdfs: `${Samm.RDFS_URI}#`,
      ...(rdfModel?.getPrefixes?.() ?? {}),
    };
    if (rdfModel?.samm?.getAlias?.() && rdfModel?.samm?.getNamespace?.()) {
      allPrefixes[rdfModel.samm.getAlias()] = rdfModel.samm.getNamespace();
    }
    if (rdfModel?.sammU?.getAlias?.() && rdfModel?.sammU?.getNamespace?.()) {
      allPrefixes[rdfModel.sammU.getAlias()] = rdfModel.sammU.getNamespace();
    }
    if (rdfModel?.sammC?.getAlias?.() && rdfModel?.sammC?.getNamespace?.()) {
      allPrefixes[rdfModel.sammC.getAlias()] = rdfModel.sammC.getNamespace();
    }
    if (rdfModel?.sammE?.getAlias?.() && rdfModel?.sammE?.getNamespace?.()) {
      allPrefixes[rdfModel.sammE.getAlias()] = rdfModel.sammE.getNamespace();
    }

    const usedPrefixes: Record<string, string> = {};

    if (allPrefixes[''] !== undefined) {
      usedPrefixes[''] = allPrefixes[''];
    }
    if (rdfModel?.samm?.getAlias?.() && rdfModel?.samm?.getNamespace?.()) {
      usedPrefixes[rdfModel.samm.getAlias()] = rdfModel.samm.getNamespace();
    }

    // Prefixes declared in the source file or added by the user are kept even if no statement uses them (anymore).
    const metadata = rdfModel?.serializationMetadata;
    for (const [alias, uri] of Object.entries(rdfModel?.getPrefixes?.() ?? {})) {
      if (alias !== '' && metadata?.isExplicitPrefix(alias)) {
        usedPrefixes[alias] = uri;
      }
    }

    const prefixEntries = Object.entries(allPrefixes).filter(([alias]) => alias !== '');

    rdfModel?.store?.forEach(
      quad => {
        for (const [alias, uri] of prefixEntries) {
          if (usedPrefixes[alias]) continue;

          if (this.isPrefixReferencedInQuad(alias, uri, quad)) {
            usedPrefixes[alias] = uri;
          }
        }
      },
      null,
      null,
      null,
      null,
    );

    return usedPrefixes;
  }

  private isPrefixReferencedInQuad(alias: string, uri: string, quad: Quad): boolean {
    if (quad.subject?.value?.startsWith(uri)) {
      return true;
    }

    if (quad.predicate?.value?.startsWith(uri)) {
      if (alias === 'rdf') {
        const isSyntheticRdfPredicate =
          quad.predicate.value === `${Samm.RDF_URI}#type` ||
          quad.predicate.value === `${Samm.RDF_URI}#first` ||
          quad.predicate.value === `${Samm.RDF_URI}#rest`;
        if (isSyntheticRdfPredicate) {
          return false;
        }
      }
      return true;
    }

    if (quad.object?.termType === 'NamedNode') {
      if (alias === 'rdf' && quad.object.value === `${Samm.RDF_URI}#nil`) {
        return false;
      }
      return quad.object.value.startsWith(uri);
    }

    if (quad.object?.termType === 'Literal') {
      if (alias === 'rdf') {
        return !quad.object.language && Boolean(quad.object.datatype?.value?.startsWith(uri));
      }
      if (alias === 'xsd') {
        const datatypeValue = quad.object.datatype?.value;
        return Boolean(datatypeValue?.startsWith(uri) && !RdfSerializerService.NATIVE_XSD_DATATYPES.has(datatypeValue));
      }
      return Boolean(quad.object.datatype?.value?.startsWith(uri));
    }

    return false;
  }

  private comparePredicates(a: Quad, b: Quad, rdfModel: RdfModel): number {
    return this.predicateRank(a, rdfModel) - this.predicateRank(b, rdfModel);
  }

  private predicateRank(quad: Quad, rdfModel: RdfModel): number {
    const predicate = quad.predicate.value;
    if (predicate === `${Samm.RDF_URI}#type`) {
      return -1;
    }
    const isSammPredicate = [rdfModel.samm, rdfModel.sammC].some(vocabulary => {
      const namespace = vocabulary?.getNamespace?.();
      return !!namespace && predicate.startsWith(namespace);
    });
    const rank = isSammPredicate ? RdfSerializerService.PREDICATE_ORDER.indexOf(predicate.slice(predicate.indexOf('#') + 1)) : -1;
    return rank < 0 ? RdfSerializerService.PREDICATE_ORDER.length : rank;
  }

  private shouldSkipQuad(quad: Quad, processedQuads: Set<Quad>): boolean {
    return processedQuads.has(quad) || (Util.isBlankNode(quad.object) && Util.isBlankNode(quad.subject));
  }

  private processQuad(quad: Quad, rdfModel: RdfModel, writer: Writer, processedQuads: Set<Quad>): void {
    if (Util.isBlankNode(quad.object)) {
      this.writeBlankNodes(quad, rdfModel, writer, processedQuads);
    } else if (Util.isBlankNode(quad.subject)) {
      const resolvedQuads = (rdfModel.resolveBlankNodes?.(quad.subject.value) ?? []).map(resolvedQuad => {
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
    } else if (quad.object.id.includes(`${Samm.RDF_URI}#langString`) && rdfModel.samm?.isExampleValueProperty(quad.predicate.value)) {
      writer.addQuad(this.createLangStringQuad(quad));
    } else if (quad.object.value.startsWith(rdfModel.samm?.getNamespace())) {
      writer.addQuad(this.createQuadWithReplacedNamespace(quad, rdfModel.samm.getNamespace(), `${rdfModel.samm.getAlias()}:`));
    } else if (quad.object.value === rdfModel.samm?.RdfNil().value) {
      writer.addQuad(this._namedNode(quad.subject.value), this._namedNode(quad.predicate.value), writer.list([]));
    } else {
      writer.addQuad(quad);
    }
  }

  private createLangStringQuad(quad: Quad): Quad {
    const currentLang = this.translation?.translateService?.getActiveLang?.() ?? 'en';
    return DataFactory.quad(quad.subject, quad.predicate, DataFactory.literal(quad.object.value, currentLang));
  }

  private createQuadWithReplacedNamespace(quad: Quad, originalNamespace: string, newNamespace: string): Quad {
    return DataFactory.quad(
      quad.subject,
      quad.predicate,
      DataFactory.namedNode(quad.object.value.replace(originalNamespace, newNamespace)),
    );
  }

  private writeBlankNodes(quad: Quad, rdfModel: RdfModel, writer: Writer, processedQuads?: Set<Quad>): void {
    const isRdfList =
      rdfModel.store.getQuads(DataFactory.blankNode(quad.object.value), DataFactory.namedNode(`${Samm.RDF_URI}#first`), null, null).length >
        0 ||
      rdfModel.store.getQuads(DataFactory.blankNode(quad.object.value), DataFactory.namedNode(`${Samm.RDF_URI}#rest`), null, null).length >
        0;
    const blankNodes = RdfModelUtil.resolveRecursiveBlankNodes(rdfModel, quad.object.value, writer, processedQuads);

    if (!isRdfList) {
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
