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

import {CacheUtils, LoadedFilesService} from '@ame/cache';
import {ConfirmDialogService, EntityInstanceUtil} from '@ame/editor';
import {MxGraphHelper} from '@ame/mx-graph';
import {NotificationsService, config} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, DefaultProperty, Entity, Value} from '@esmf/aspect-model-loader';
import {ConfirmDialogEnum} from '../../../../models/confirm-dialog.enum';

@Injectable({
  providedIn: 'root',
})
export class EntityInstanceService {
  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private notifications: NotificationsService,
    private loadedFiles: LoadedFilesService,
  ) {}

  onPropertyRemove(property: DefaultProperty, acceptCallback: Function) {
    const entityValues = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntityInstance).filter(eInstance => {
      eInstance.getTuples().some(([propertyUrn]) => property.aspectModelUrn === propertyUrn);
    });

    if (!entityValues.length) {
      acceptCallback?.();
      return;
    }

    const title = `Remove ${property.name} from ${entityValues[0].type.name}?`;
    const phrases = [
      `${entityValues[0].type.name} has ${entityValues.length} instances.`,
      `If you remove the property ${property.name} from this entity all the entity instances will lose this property!`,
      'Do you want to continue?',
    ];

    this.confirmDialogService.open({title, phrases, closeButtonText: 'No', okButtonText: 'Yes'}).subscribe(confirm => {
      if (confirm !== ConfirmDialogEnum.cancel) {
        for (const entityValue of entityValues) {
          entityValue.getAssertion(property.aspectModelUrn).forEach(value => entityValue.removeAssertion(property.aspectModelUrn, value));
        }
        acceptCallback?.();
      }
    });
  }

  onNewProperty(property: DefaultProperty, entity: Entity) {
    const entityValues = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntityInstance).filter(
      entityValue => entityValue.type.name === entity.name,
    );

    if (!entityValues.length) {
      return;
    }

    // TODO see if the entity instances should be created on a deeper level
    for (const entityValue of entityValues) {
      const shouldBeEntityInstance = property.characteristic?.dataType instanceof DefaultEntity;
      const newValue = shouldBeEntityInstance
        ? new DefaultEntityInstance({
            name: `${property.name}Value`,
            aspectModelUrn: `${this.loadedFiles.currentLoadedFile.namespace}#${property.name}Value`,
            metaModelVersion: config.currentSammVersion,
            type: property.characteristic?.dataType as DefaultEntity,
          })
        : new Value('', property.characteristic?.dataType, EntityInstanceUtil.isDefaultPropertyWithLangString(property) ? '' : undefined);
      entityValue.setAssertion(property.aspectModelUrn, newValue);

      MxGraphHelper.establishRelation(entityValue, entity);
    }

    MxGraphHelper.establishRelation(entity, property);
    this.notifications.warning({
      title: `Property ${property.name} was added to ${entity.name} instances. Make sure to add a value to them!`,
      timeout: 5000,
    });
  }

  onEntityRemove(entity: DefaultEntity, acceptCallback: Function) {
    const entityValues = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntityInstance).filter(
      entityValue => entityValue.type.name === entity.name,
    );

    if (!entityValues.length) {
      acceptCallback?.();
      return;
    }

    const title = `Remove ${entity.name}?`;
    const phrases = [
      `If you remove entity ${entity.name} all the entity instances created from ${entity.name} will be removed.`,
      'Do you want to continue?',
    ];

    this.confirmDialogService.open({title, phrases, closeButtonText: 'No', okButtonText: 'Yes'}).subscribe(confirm => {
      if (confirm !== ConfirmDialogEnum.cancel) {
        for (const entityValue of entityValues) {
          this.currentCachedFile.removeElement(entityValue.aspectModelUrn);
        }
        acceptCallback?.();
      }
    });
  }

  onEntityDisconnect(characteristic: DefaultEnumeration, entity: DefaultEntity, acceptCallback: Function) {
    const entityValues = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntityInstance)
      .filter(entityValue => entityValue.type.name === entity.name)
      .filter(entityValue => entityValue.parents.some(parent => parent.aspectModelUrn === characteristic.aspectModelUrn));

    if (!entityValues.length) {
      acceptCallback?.();
      return;
    }

    const title = `Remove dataType ${entity.name} from ${characteristic.name}?`;
    const phrases = [
      `If you remove entity ${entity.name} from ${characteristic.name}
      all the entity instances from ${characteristic.name} will be removed.`,
      'Do you want to continue?',
    ];

    this.confirmDialogService.open({title, phrases, closeButtonText: 'No', okButtonText: 'Yes'}).subscribe(confirm => {
      if (confirm === ConfirmDialogEnum.cancel) {
        return;
      }

      this.removeEntityValuesFromCharacteristic(characteristic);
      acceptCallback?.();
    });
  }

  onCharacteristicRemove(characteristic: DefaultEnumeration, acceptCallback: Function) {
    this.removeEntityValuesFromCharacteristic(characteristic);
    acceptCallback?.();
  }

  private removeEntityValuesFromCharacteristic(characteristic: DefaultEnumeration) {
    if (this.loadedFiles.isElementExtern(characteristic)) {
      return;
    }

    const characteristicEntityValues = characteristic.values as DefaultEntityInstance[];
    for (const entityValue of characteristicEntityValues) {
      entityValue.removeParent(characteristic);

      // if the instance is not used by another characteristic, remove it
      if (entityValue.parents.length <= 0) {
        this.currentCachedFile.removeElement(entityValue.aspectModelUrn);
      }
    }

    characteristic.values = [];
  }
}
