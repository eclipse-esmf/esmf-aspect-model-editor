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
import {Injectable, Injector, ProviderToken} from '@angular/core';
import {NamedElement, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
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
import {FileResourceRemoveService, Point3dRemoveService, PredefinedRemove, TimeSeriesEntityRemoveService} from './predefined-elements';
import {PropertyModelService} from './property-model.service';
import {TraitModelService} from './trait-model.service';
import {UnitModelService} from './unit-model.service';

@Injectable({
  providedIn: 'root',
})
export class ModelRootService {
  private readonly predefinedModels: {[key: string]: ProviderToken<PredefinedRemove>} = {};
  constructor(private injector: Injector) {
    this.predefinedModels = {
      [PredefinedEntitiesEnum.TimeSeriesEntity]: TimeSeriesEntityRemoveService,
      [PredefinedPropertiesEnum.value]: TimeSeriesEntityRemoveService,
      [PredefinedPropertiesEnum.timestamp]: TimeSeriesEntityRemoveService,
      ['Timestamp']: TimeSeriesEntityRemoveService,
      [PredefinedPropertiesEnum.x]: Point3dRemoveService,
      [PredefinedPropertiesEnum.y]: Point3dRemoveService,
      [PredefinedPropertiesEnum.z]: Point3dRemoveService,
      [PredefinedEntitiesEnum.Point3d]: Point3dRemoveService,
      [PredefinedPropertiesEnum.resource]: FileResourceRemoveService,
      [PredefinedPropertiesEnum.mimeType]: FileResourceRemoveService,
      [PredefinedEntitiesEnum.FileResource]: FileResourceRemoveService,
      ['ResourcePath']: FileResourceRemoveService,
      ['MimeType']: FileResourceRemoveService,
    };
  }

  public getElementModelService(modelElement: NamedElement): BaseModelService {
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

  public isPredefined(modelElement: NamedElement) {
    return modelElement?.isPredefined && this.predefinedModels[modelElement.name];
  }

  public getPredefinedService(modelElement: NamedElement) {
    if (!this.isPredefined(modelElement)) {
      return null;
    }

    return this.injector.get(this.predefinedModels[modelElement.name]);
  }
}
