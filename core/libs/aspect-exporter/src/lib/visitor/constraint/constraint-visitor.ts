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

import {LoadedFilesService} from '@ame/cache';
import {MxGraphService} from '@ame/mx-graph';
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
  DefaultTrait,
  SammC,
} from '@esmf/aspect-model-loader';
import {ComplexType} from 'libs/aspect-model-loader/src/lib/aspect-meta-model/complex-type';
import {Store} from 'n3';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class ConstraintVisitor extends BaseVisitor<DefaultConstraint> {
  private get store(): Store {
    return this.loadedFilesService.currentLoadedFile.rdfModel.store;
  }

  private get sammC(): SammC {
    return this.loadedFilesService.currentLoadedFile.rdfModel.sammC;
  }

  private readonly constraintCallbacks = {
    DefaultRangeConstraint: (constraint: DefaultRangeConstraint, characteristicType: ComplexType) =>
      this.updateRange(constraint, characteristicType),
    DefaultFixedPointConstraint: (constraint: DefaultFixedPointConstraint) => this.updateFixedPoint(constraint),
    DefaultLengthConstraint: (constraint: DefaultLengthConstraint) => this.updateLength(constraint),
    DefaultLanguageConstraint: (constraint: DefaultLanguageConstraint) => this.updateLanguage(constraint),
    DefaultEncodingConstraint: (constraint: DefaultEncodingConstraint) => this.updateEncoding(constraint),
    DefaultRegularExpressionConstraint: (constraint: DefaultRegularExpressionConstraint) => this.updateRegularExpression(constraint),
    DefaultLocaleConstraint: (constraint: DefaultLocaleConstraint) => this.updateLocale(constraint),
  };

  constructor(
    public rdfNodeService: RdfNodeService,
    public mxGraphService: MxGraphService,
    private loadedFilesService: LoadedFilesService,
    loadedFiles: LoadedFilesService,
  ) {
    super(loadedFiles);
  }

  visit(constraint: DefaultConstraint): DefaultConstraint {
    this.setPrefix(constraint.aspectModelUrn);
    this.updateProperties(constraint);

    const defaultTrait: DefaultTrait = constraint.parents.find(e => e instanceof DefaultTrait) as DefaultTrait;

    if (constraint instanceof DefaultRangeConstraint && defaultTrait) {
      this.constraintCallbacks[constraint.className]?.(constraint, defaultTrait.baseCharacteristic?.dataType);
    } else {
      this.constraintCallbacks[constraint.className]?.(constraint);
    }
    return constraint;
  }

  private updateProperties(constraint: DefaultConstraint) {
    this.rdfNodeService.update(constraint, {
      preferredName: getPreferredNamesLocales(constraint)?.map(language => ({
        language,
        value: constraint.getPreferredName(language),
      })),
      description: getDescriptionsLocales(constraint)?.map(language => ({
        language,
        value: constraint.getDescription(language),
      })),
      see: constraint.getSee() || [],
    });
  }

  private updateRange(constraint: DefaultRangeConstraint, characteristicType: ComplexType) {
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
}
