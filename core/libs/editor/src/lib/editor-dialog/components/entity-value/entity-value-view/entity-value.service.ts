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
import {DefaultEntity, DefaultEntityValue, DefaultEnumeration, DefaultProperty, OverWrittenProperty} from '@ame/meta-model';
import {ConfirmDialogService} from '@ame/editor';
import {NamespacesCacheService} from '@ame/cache';
import {NotificationsService} from '@ame/shared';

@Injectable({
  providedIn: 'root',
})
export class EntityValueService {
  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  constructor(
    private namespacesCacheService: NamespacesCacheService,
    private confirmDialogService: ConfirmDialogService,
    private notifications: NotificationsService
  ) {}

  onPropertyRemove(property: DefaultProperty, acceptCallback: Function) {
    const entityValues = this.currentCachedFile
      .getCachedEntityValues()
      .filter(({properties}) => properties.some(({key}) => key.property.name === property.name));

    if (!entityValues.length) {
      acceptCallback?.();
      return;
    }

    const title = `Remove ${property.name} from ${entityValues[0].entity.name}?`;
    const phrases = [
      `${entityValues[0].entity.name} has ${entityValues.length} instances.`,
      `If you remove the property ${property.name} from this entity all the entity instances will lose this property!`,
      'Do you want to continue?',
    ];

    this.confirmDialogService.open({title, phrases, closeButtonText: 'No', okButtonText: 'Yes'}).subscribe(result => {
      if (result) {
        for (const entityValue of entityValues) {
          entityValue.removeProperty(property);
        }
        acceptCallback?.();
      }
    });
  }

  onNewProperty(property: OverWrittenProperty<DefaultProperty>, entity: DefaultEntity) {
    const entityValues = this.currentCachedFile.getCachedEntityValues().filter(entityValue => entityValue.entity.name === entity.name);
    if (!entityValues.length) {
      return;
    }

    for (const entityValue of entityValues) {
      entityValue.addProperty(property);
    }

    this.notifications.warning({
      title: `Property ${property.property.name} was added to ${entity.name} instances. Make sure to add a value to them!`,
      timeout: 5000,
    });
  }

  onEntityRemove(entity: DefaultEntity, acceptCallback: Function) {
    const entityValues = this.currentCachedFile.getCachedEntityValues().filter(entityValue => entityValue.entity.name === entity.name);

    if (!entityValues.length) {
      acceptCallback?.();
      return;
    }

    const title = `Remove ${entity.name}?`;
    const phrases = [
      `If you remove entity ${entity.name} all the entity instances created from ${entity.name} will be removed.`,
      'Do you want to continue?',
    ];

    this.confirmDialogService.open({title, phrases, closeButtonText: 'No', okButtonText: 'Yes'}).subscribe(result => {
      if (result) {
        for (const entityValue of entityValues) {
          this.currentCachedFile.removeCachedElement(entityValue.aspectModelUrn);
        }
        acceptCallback?.();
      }
    });
  }

  onEntityDisconnect(characteristic: DefaultEnumeration, entity: DefaultEntity, acceptCallback: Function) {
    const entityValues = this.currentCachedFile
      .getCachedEntityValues()
      .filter(entityValue => entityValue.entity.name === entity.name)
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

    this.confirmDialogService.open({title, phrases, closeButtonText: 'No', okButtonText: 'Yes'}).subscribe(result => {
      if (!result) {
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
    if (characteristic.isExternalReference()) {
      return;
    }

    const characteristicEntityValues = characteristic.values as DefaultEntityValue[];
    for (const entityValue of characteristicEntityValues) {
      entityValue.removeParent(characteristic);

      // if the instance is not used by another characteristic, remove it
      if (entityValue.parents.length <= 0) {
        this.currentCachedFile.removeCachedElement(entityValue.aspectModelUrn);
      }
    }

    characteristic.values = [];
  }
}
