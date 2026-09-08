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

import {inject, Injectable} from '@angular/core';

import {LoadedFilesService} from '@ame/cache';
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
} from '@esmf/aspect-model-loader';
import {ComplexType} from 'libs/aspect-model-loader/src/lib/aspect-meta-model/complex-type';
import {Quad_Subject} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {BaseVisitor} from '../base-visitor';

@Injectable({providedIn: 'root'})
export class ConstraintVisitor extends BaseVisitor<DefaultConstraint> {
  public rdfNodeService = inject(RdfNodeService);
  public rdfListService = inject(RdfListService);
  public loadedFilesService = inject(LoadedFilesService);

  private readonly constraintCallbacks = {
    DefaultRangeConstraint: (constraint: DefaultRangeConstraint, characteristicType: ComplexType, subject?: Quad_Subject) =>
      this.updateRange(constraint, characteristicType, subject),
    DefaultFixedPointConstraint: (constraint: DefaultFixedPointConstraint, subject?: Quad_Subject) =>
      this.updateFixedPoint(constraint, subject),
    DefaultLengthConstraint: (constraint: DefaultLengthConstraint, subject?: Quad_Subject) => this.updateLength(constraint, subject),
    DefaultLanguageConstraint: (constraint: DefaultLanguageConstraint, subject?: Quad_Subject) => this.updateLanguage(constraint, subject),
    DefaultEncodingConstraint: (constraint: DefaultEncodingConstraint, subject?: Quad_Subject) => this.updateEncoding(constraint, subject),
    DefaultRegularExpressionConstraint: (constraint: DefaultRegularExpressionConstraint, subject?: Quad_Subject) =>
      this.updateRegularExpression(constraint, subject),
    DefaultLocaleConstraint: (constraint: DefaultLocaleConstraint, subject?: Quad_Subject) => this.updateLocale(constraint, subject),
  };

  visit(constraint: DefaultConstraint, parentDataType?: any, customSubject?: Quad_Subject): DefaultConstraint {
    if (!customSubject && constraint.isAnonymous?.()) {
      return constraint;
    }

    if (!customSubject) {
      this.setPrefix(constraint.aspectModelUrn);
    }
    this.updateProperties(constraint, customSubject);

    const defaultTrait: DefaultTrait = constraint.parents?.find(e => e instanceof DefaultTrait) as DefaultTrait;
    const dataType = parentDataType || defaultTrait?.baseCharacteristic?.dataType;

    if (constraint instanceof DefaultRangeConstraint) {
      this.constraintCallbacks[constraint.className]?.(constraint, dataType, customSubject);
    } else {
      this.constraintCallbacks[constraint.className]?.(constraint, customSubject);
    }
    return constraint;
  }

  private updateProperties(constraint: DefaultConstraint, subject?: Quad_Subject) {
    const properties = {
      preferredName: getPreferredNamesLocales(constraint)?.map(language => ({
        language,
        value: constraint.getPreferredName(language),
      })),
      description: getDescriptionsLocales(constraint)?.map(language => ({
        language,
        value: constraint.getDescription(language),
      })),
      see: constraint.getSee() || [],
    };
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }

  private updateRange(constraint: DefaultRangeConstraint, characteristicType: ComplexType, subject?: Quad_Subject) {
    const properties = {
      characteristicType: characteristicType,
      minValue: constraint.minValue,
      maxValue: constraint.maxValue,
      lowerBoundDefinition: constraint.lowerBoundDefinition,
      upperBoundDefinition: constraint.upperBoundDefinition,
    };
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }

  private updateFixedPoint(constraint: DefaultFixedPointConstraint, subject?: Quad_Subject) {
    const properties = {
      scale: constraint.scale,
      integer: constraint.integer,
    };
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }

  private updateLength(constraint: DefaultLengthConstraint, subject?: Quad_Subject) {
    const properties = {
      maxValue: constraint.maxValue,
      minValue: constraint.minValue,
    };
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }

  private updateLanguage(constraint: DefaultLanguageConstraint, subject?: Quad_Subject) {
    const properties = {
      languageCode: constraint.languageCode,
    };
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }

  private updateEncoding(constraint: DefaultEncodingConstraint, subject?: Quad_Subject) {
    const properties = {
      value: constraint.value,
    };
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }

  private updateRegularExpression(constraint: DefaultRegularExpressionConstraint, subject?: Quad_Subject) {
    const properties = {value: constraint.value};
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }

  private updateLocale(constraint: DefaultLocaleConstraint, subject?: Quad_Subject) {
    const properties = {localeCode: constraint.localeCode};
    if (subject) {
      this.rdfNodeService.update(constraint, properties, subject);
    } else {
      this.rdfNodeService.update(constraint, properties);
    }
  }
}
