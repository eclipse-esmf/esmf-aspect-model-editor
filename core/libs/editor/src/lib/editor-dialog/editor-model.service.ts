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
import {BehaviorSubject, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {BaseMetaModelElement} from '@ame/meta-model';
import {BammCharacteristicInstantiator, MetaModelElementInstantiator} from '@ame/instantiator';
import {ModelService} from '@ame/rdf/services';

@Injectable({
  providedIn: 'root',
})
export class EditorModelService {
  protected metaModelElement: BaseMetaModelElement;
  protected dataChangedEventQueue = [];
  private metaModelElementSubject = new BehaviorSubject<BaseMetaModelElement>(null);
  private readOnly = false;
  private saveButtonEnabled = true;
  private bammCharacteristicInstantiator: BammCharacteristicInstantiator;

  constructor(private modelService: ModelService) {
    this.metaModelElementSubject.asObservable().subscribe(newMetaModelElement => {
      this.metaModelElement = newMetaModelElement;
    });
  }

  setMetaModelElement(metaModelElement: BaseMetaModelElement) {
    this.metaModelElement = metaModelElement;
  }

  getAspectModelUrn(): string {
    return this.modelService.getLoadedAspectModel().rdfModel.getAspectModelUrn();
  }

  isSaveButtonEnabled() {
    return this.saveButtonEnabled;
  }

  isReadOnly(): boolean {
    return this.readOnly;
  }

  getMetaModelElement(): Observable<BaseMetaModelElement> {
    return this.metaModelElementSubject.asObservable();
  }

  _updateMetaModelElement(metaModelElement: BaseMetaModelElement): void {
    if (!this.bammCharacteristicInstantiator) {
      this.bammCharacteristicInstantiator = new BammCharacteristicInstantiator(
        new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, null)
      );
    }

    this.dataChangedEventQueue = [];
    this.readOnly = typeof metaModelElement?.['isPredefined'] === 'function' && metaModelElement?.['isPredefined']();
    this.saveButtonEnabled = true;
    this.metaModelElementSubject.next(metaModelElement);
  }
}
