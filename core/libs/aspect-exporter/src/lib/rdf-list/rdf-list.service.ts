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

import {Injectable} from '@angular/core';
import {RdfModel} from '@ame/rdf/utils';
import {simpleDataTypes} from '@ame/shared';
import {Samm} from '@ame/vocabulary';
import {BlankNode, DataFactory, NamedNode, Quad, Quad_Object, Store, Triple, Util} from 'n3';
import {RdfListHelper} from './rdf-list-helper';
import {RdfListConstants} from './rdf-list.constants';
import {
  CreateEmptyRdfList,
  EmptyRdfList,
  ListElement,
  ListElementType,
  ListProperties,
  OverWrittenListElement,
  SourceElementType,
  StoreListReferences,
} from './rdf-list.types';
import {RdfNodeService} from '../rdf-node';
import {ModelService} from '@ame/rdf/services';
import {environment} from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RdfListService implements CreateEmptyRdfList, EmptyRdfList {
  private get rdfModel(): RdfModel {
    return this.modelService.getLoadedAspectModel().rdfModel;
  }

  private get store(): Store {
    return this.rdfModel.store;
  }

  private get samm(): Samm {
    return this.rdfModel.SAMM();
  }

  constructor(private nodeService: RdfNodeService, private modelService: ModelService) {
    if (!environment.production) {
      window['angular.rdfListService'] = this;
    }
  }

  push(source: SourceElementType, ...elements: ListElementType[]) {
    const preparedList = this.getFilteredElements(source, elements);
    if (preparedList === null) {
      return this;
    }

    const {list, filteredList, filterDuplicates} = preparedList;
    const listElements = this.getListElements(list);
    const elementsToBeAdded = RdfListHelper.resolveNewElements(
      source,
      filterDuplicates ? RdfListHelper.filterDuplicates(filteredList, listElements) : filteredList
    );

    if (!elementsToBeAdded.listElements.length) {
      return this;
    }

    this.remove(source, ...elements);
    this.recreateList(list, [...listElements.map(({node}) => node), ...elementsToBeAdded.listElements]);
    this.createOverWrittenElements(elementsToBeAdded.overWrittenListElements);
    return this;
  }

  remove(source: SourceElementType, ...elements: ListElementType[]) {
    const preparedList = this.getFilteredElements(source, elements);
    if (preparedList === null || preparedList.created) {
      return this;
    }

    const {list} = preparedList;
    const {elementsToKeep, blankNodesToRemove} = this.getListElements(list).reduce(
      (acc, {node, name}) => {
        // push elements we don't want to remove
        if (!elements.some(e => RdfListHelper.getElementValue(e) === (name ? name : node.value))) {
          acc.elementsToKeep.push(node);

          // push blank nodes information to be removed
        } else if (Util.isBlankNode(node)) {
          acc.blankNodesToRemove.push(...this.store.getQuads(node, null, null, null));
        }

        return acc;
      },
      {
        elementsToKeep: [],
        blankNodesToRemove: [],
      }
    );

    this.store.removeQuads([...this.getQuads(list), ...blankNodesToRemove]);
    this.recreateList(list, elementsToKeep);
    return this;
  }

  createEmpty(source: SourceElementType, property: ListProperties) {
    this.emptyList(source, property);
    this.createNewList(
      DataFactory.namedNode(source.aspectModelUrn),
      RdfListConstants.getPredicateByKey(property, this.samm, this.rdfModel.SAMMC())
    );
  }

  emptyList(source: SourceElementType, property: ListProperties) {
    const predicate = RdfListConstants.getPredicateByKey(property, this.samm, this.rdfModel.SAMMC());
    const subject = DataFactory.namedNode(source.aspectModelUrn);
    const list = this.store.getQuads(subject, predicate, null, null)?.[0]?.object;

    if (list && !this.samm.isRdfNill(list.value)) {
      this.store.removeQuads([...this.getQuads(list), ...this.store.getQuads(subject, predicate, null, null)]);
      this.store.addQuad(DataFactory.triple(subject, predicate, this.samm.RdfNil()));
    }
  }

  getQuads(node: Quad_Object): Quad[] {
    const quads: Quad[] = [...this.store.getQuads(node, null, null, null)];

    for (const quad of quads) {
      if (this.samm.isRdfRest(quad?.predicate.value) && !this.samm.isRdfNill(quad?.object.value)) {
        quads.push(...this.getQuads(quad.object as BlankNode));
      }
    }

    return quads;
  }

  private createOverWrittenElements(elements: OverWrittenListElement[]) {
    for (const element of elements) {
      const model = element.metaModelElement?.property;
      if (model?.extendedElement) {
        this.nodeService.updateBlankNode(element.blankNode, model, {
          extends: model?.extendedElement?.aspectModelUrn,
          characteristic: model.characteristic?.aspectModelUrn,
        });
        continue;
      }

      this.store.addQuad(
        element.blankNode,
        this.samm.PropertyProperty(),
        DataFactory.namedNode(element.metaModelElement.property.aspectModelUrn)
      );

      if (element.metaModelElement.keys.optional) {
        this.store.addQuad(
          element.blankNode,
          this.samm.OptionalProperty(),
          DataFactory.literal(`${element.metaModelElement.keys.optional}`, DataFactory.namedNode(simpleDataTypes.boolean.isDefinedBy))
        );
      }

      if (element.metaModelElement.keys.notInPayload) {
        this.store.addQuad(
          element.blankNode,
          this.samm.NotInPayloadProperty(),
          DataFactory.literal(`${element.metaModelElement.keys.notInPayload}`, DataFactory.namedNode(simpleDataTypes.boolean.isDefinedBy))
        );
      }

      if (element.metaModelElement.keys.payloadName) {
        this.store.addQuad(
          element.blankNode,
          this.samm.payloadNameProperty(),
          DataFactory.literal(`${element.metaModelElement.keys.payloadName}`, DataFactory.namedNode(simpleDataTypes.string.isDefinedBy))
        );
      }
    }
  }

  private getListElements(node: Quad_Object): ListElement[] {
    const listElement: ListElement[] = [];

    const quads = this.store.getQuads(node, null, null, null);
    for (const quad of quads) {
      if (this.samm.isRdfFirst(quad?.predicate.value)) {
        if (!Util.isBlankNode(quad.object)) {
          listElement.push({node: quad.object});
          continue;
        }

        const resolvedQuad = this.rdfModel
          .resolveBlankNodes(quad.object.value)
          .filter(quad => this.samm.isPropertyProperty(quad.predicate.value))[0];
        listElement.push({node: resolvedQuad.object});
      }

      if (this.samm.isRdfRest(quad?.predicate.value) && !this.samm.isRdfNill(quad?.object.value)) {
        listElement.push(...this.getListElements(quad.object as BlankNode));
      }
    }

    return listElement;
  }

  private getFilteredElements(source: SourceElementType, elements: ListElementType[]): StoreListReferences {
    const relations = RdfListConstants.getRelations(this.samm, this.rdfModel.SAMMC());
    const children = relations.find(({source: sourceType}) => source instanceof sourceType).children;
    const types = children.map(child => child.type).filter(type => type);

    const filteredList = elements.filter(e => {
      const canPass = !types.length || types.some(type => e instanceof type || e?.property instanceof type);
      return (
        canPass && (e?.aspectModelUrn || e?.property?.aspectModelUrn || e?.value || ['string', 'number', 'boolean'].includes(typeof e))
      );
    });

    if (!filteredList.length) {
      return null;
    }

    const subject = DataFactory.namedNode(source.aspectModelUrn);
    const predicate = this.resolvePredicate(source, filteredList[0]?.property || filteredList[0]);
    const {list, created} = this.getListOrCreateNew(subject, predicate);

    return {
      filteredList,
      list,
      created,
      predicate,
      subject,
      // if there is no types for list (which means the list has string, number, boolean)
      // we should not filter duplicates
      filterDuplicates: !!types?.[0],
    };
  }

  private resolvePredicate(source: SourceElementType, element: ListElementType) {
    const relations = RdfListConstants.getRelations(this.samm, this.rdfModel.SAMMC());
    for (const {source: sourceType, children} of relations) {
      if (!(source instanceof sourceType)) {
        continue;
      }

      for (const {type, predicate: childPredicate} of children) {
        if (!type || element instanceof type) {
          return childPredicate;
        }
      }
    }

    return null;
  }

  private createNewList(subject: NamedNode, predicate: NamedNode) {
    const list = DataFactory.blankNode();
    this.store.removeQuads(this.store.getQuads(subject, predicate, this.samm.RdfNil(), null));
    this.store.addQuad(DataFactory.triple(subject, predicate, list));
    this.store.addQuad(DataFactory.triple(list, this.samm.RdfRest(), this.samm.RdfNil()));
    return list;
  }

  private getListOrCreateNew(subject: NamedNode, predicate: NamedNode): {list: Quad_Object; created: boolean} {
    const quad = this.store.getQuads(subject, predicate, null, null)?.[0];
    return quad && !this.samm.isRdfNill(quad.object.value)
      ? {list: quad.object, created: false}
      : {list: this.createNewList(subject, predicate), created: true};
  }

  private recreateList(list: Quad_Object, nodes: Quad_Object[]) {
    const quads: Triple[] = [];
    let previousParent: BlankNode | NamedNode = list as BlankNode;

    nodes.forEach((node, index) => {
      const nextParent = index === nodes.length - 1 ? this.samm.RdfNil() : DataFactory.blankNode();
      quads.push(
        DataFactory.triple(previousParent, this.samm.RdfFirst(), node),
        DataFactory.triple(previousParent, this.samm.RdfRest(), nextParent)
      );
      previousParent = nextParent;
    });

    this.store.addQuads(quads);
  }
}
