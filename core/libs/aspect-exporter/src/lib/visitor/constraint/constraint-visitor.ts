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

import {Injectable} from '@angular/core';
import {
  DefaultConstraint,
  DefaultRangeConstraint,
  DefaultFixedPointConstraint,
  DefaultLengthConstraint,
  DefaultLanguageConstraint,
  DefaultEncodingConstraint,
  DefaultRegularExpressionConstraint,
  DefaultLocaleConstraint,
  DefaultTrait,
  Trait,
  Type,
} from '@ame/meta-model';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {Bammc} from '@ame/vocabulary';
import {mxgraph} from 'mxgraph-factory';
import {DataFactory, NamedNode, Store} from 'n3';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class ConstraintVisitor extends BaseVisitor<DefaultConstraint> {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  private get bammc(): Bammc {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.BAMMC();
  }

  private readonly constraintCallbacks = {
    DefaultRangeConstraint: (constraint: DefaultRangeConstraint, characteristicType: Type) =>
      this.updateRange(constraint, characteristicType),
    DefaultFixedPointConstraint: (constraint: DefaultFixedPointConstraint) => this.updateFixedPoint(constraint),
    DefaultLengthConstraint: (constraint: DefaultLengthConstraint) => this.updateLength(constraint),
    DefaultLanguageConstraint: (constraint: DefaultLanguageConstraint) => this.updateLanguage(constraint),
    DefaultEncodingConstraint: (constraint: DefaultEncodingConstraint) => this.updateEncoding(constraint),
    DefaultRegularExpressionConstraint: (constraint: DefaultRegularExpressionConstraint) => this.updateRegularExpression(constraint),
    DefaultLocaleConstraint: (constraint: DefaultLocaleConstraint) => this.updateLocale(constraint),
  };

  constructor(public rdfNodeService: RdfNodeService, public mxGraphService: MxGraphService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultConstraint {
    const constraint = MxGraphHelper.getModelElement<DefaultConstraint>(cell);
    this.setPrefix(constraint.aspectModelUrn);
    this.updateParents(cell);
    this.updateProperties(constraint);

    let defaultTrait: DefaultTrait;
    if (cell.edges?.[0]?.source) {
      defaultTrait = MxGraphHelper.getModelElement<DefaultTrait>(cell.edges[0].source);
    }

    if (constraint instanceof DefaultRangeConstraint && defaultTrait) {
      this.constraintCallbacks[constraint.className]?.(constraint, defaultTrait.baseCharacteristic?.dataType);
    } else {
      this.constraintCallbacks[constraint.className]?.(constraint);
    }
    return constraint;
  }

  private updateProperties(constraint: DefaultConstraint) {
    this.rdfNodeService.update(constraint, {
      preferredName: constraint.getAllLocalesPreferredNames()?.map(language => ({
        language,
        value: constraint.getPreferredName(language),
      })),
      description: constraint.getAllLocalesDescriptions()?.map(language => ({
        language,
        value: constraint.getDescription(language),
      })),
      see: constraint.getSeeReferences() || [],
    });
  }

  private updateRange(constraint: DefaultRangeConstraint, characteristicType: Type) {
    this.rdfNodeService.update(constraint, {
      characteristicType: characteristicType,
      minValue: constraint.minValue,
      maxValue: constraint.maxValue,
      lowerBoundDefinition: constraint.lowerBoundDefinition,
      upperBoundDefinition: constraint.upperBoundDefinition,
    });
  }

  private updateFixedPoint(constraint: DefaultFixedPointConstraint) {
    this.rdfNodeService.update(constraint, {
      scale: constraint.scale,
      integer: constraint.integer,
    });
  }

  private updateLength(constraint: DefaultLengthConstraint) {
    this.rdfNodeService.update(constraint, {
      maxValue: constraint.maxValue,
      minValue: constraint.minValue,
    });
  }

  private updateLanguage(constraint: DefaultLanguageConstraint) {
    this.rdfNodeService.update(constraint, {
      languageCode: constraint.languageCode,
    });
  }

  private updateEncoding(constraint: DefaultEncodingConstraint) {
    this.rdfNodeService.update(constraint, {
      value: constraint.value,
    });
  }

  private updateRegularExpression(constraint: DefaultRegularExpressionConstraint) {
    this.rdfNodeService.update(constraint, {value: constraint.value});
  }

  private updateLocale(constraint: DefaultLocaleConstraint) {
    this.rdfNodeService.update(constraint, {localeCode: constraint.localeCode});
  }

  private updateParents(cell: mxgraph.mxCell) {
    const constraint = MxGraphHelper.getModelElement<DefaultConstraint>(cell);

    const parents = this.mxGraphService.resolveParents(cell)?.map((parent: mxgraph.mxCell) => MxGraphHelper.getModelElement<Trait>(parent));

    parents?.forEach(parent => {
      this.replaceConstraints(
        DataFactory.namedNode(parent.aspectModelUrn),
        this.bammc.ConstraintProperty(),
        DataFactory.namedNode(constraint.aspectModelUrn),
        DataFactory.namedNode(constraint.aspectModelUrn)
      );
    });
  }

  private replaceConstraints(subject: NamedNode, predicate: NamedNode, oldObject: NamedNode, newObject: NamedNode) {
    const existingQuads = this.store.getQuads(subject, predicate, oldObject, null);
    if (!existingQuads?.length) {
      this.store.addQuad(DataFactory.triple(subject, predicate, newObject));
      return;
    }
    this.store.removeQuads(existingQuads);
    existingQuads.forEach(quad => this.store.addQuad(DataFactory.triple(quad.subject, quad.predicate, newObject)));
  }
}
