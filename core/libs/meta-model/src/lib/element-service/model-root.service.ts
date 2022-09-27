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
import {PredefinedEntities, PredefinedProperties} from '@ame/vocabulary';
import {Injectable, Injector, ProviderToken} from '@angular/core';
import {BaseMetaModelElement} from '../aspect-meta-model';
import {AbstractEntityModelService} from './abstract-entity-model.service';
import {AbstractPropertyModelService} from './abstract-property-model.service';
import {AspectModelService} from './aspect-model.service';
import {BaseModelService} from './base-model-service';
import {CharacteristicModelService} from './characteristic-model.service';
import {ConstraintModelService} from './constraint-model.service';
import {EntityModelService} from './entity-model.service';
import {EntityValueModelService} from './entity-value-model.service';
import {EventModelService} from './event-model.service';
import {OperationModelService} from './operation-model.service';
import {PropertyModelService} from './property-model.service';
import {TraitModelService} from './trait-model.service';
import {UnitModelService} from './unit-model.service';
import {TimeSeriesEntityRemoveService, Point3dRemoveService, FileResourceRemoveService} from './predefined-elements';

const predefinedModels = {
  [PredefinedEntities.TimeSeriesEntity]: TimeSeriesEntityRemoveService,
  [PredefinedProperties.value]: TimeSeriesEntityRemoveService,
  [PredefinedProperties.timestamp]: TimeSeriesEntityRemoveService,
  ['Timestamp']: TimeSeriesEntityRemoveService,
  [PredefinedProperties.x]: Point3dRemoveService,
  [PredefinedProperties.y]: Point3dRemoveService,
  [PredefinedProperties.z]: Point3dRemoveService,
  [PredefinedEntities.Point3d]: Point3dRemoveService,
  [PredefinedProperties.resource]: FileResourceRemoveService,
  [PredefinedProperties.mimeType]: FileResourceRemoveService,
  [PredefinedEntities.FileResource]: FileResourceRemoveService,
  ['ResourcePath']: FileResourceRemoveService,
  ['MimeType']: FileResourceRemoveService,
};

@Injectable({
  providedIn: 'root',
})
export class ModelRootService {
  constructor(private injector: Injector) {}

  public getElementModelService(modelElement: BaseMetaModelElement): BaseModelService {
    // Order is important
    const elementServices: any[] = [
      AbstractEntityModelService,
      AbstractPropertyModelService,
      AspectModelService,
      TraitModelService,
      CharacteristicModelService,
      ConstraintModelService,
      EntityModelService,
      EntityValueModelService,
      EventModelService,
      OperationModelService,
      PropertyModelService,
      UnitModelService,
    ];

    // choose the applicable model service
    for (const serviceClass of elementServices) {
      const elementModelService = this.injector.get(serviceClass as ProviderToken<BaseModelService>);
      if (elementModelService.isApplicable(modelElement)) {
        return elementModelService;
      }
    }
    return null;
  }

  public isPredefined(modelElement: BaseMetaModelElement) {
    return (modelElement as any)?.isPredefined?.() && predefinedModels[modelElement.name];
  }

  public getPredefinedService(modelElement: BaseMetaModelElement) {
    if (!this.isPredefined(modelElement)) {
      return;
    }

    return this.injector.get(predefinedModels[modelElement.name]);
  }
}
