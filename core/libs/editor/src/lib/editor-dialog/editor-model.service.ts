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
import {LoadedFilesService} from '@ame/cache';
import {ModelService} from '@ame/rdf/services';
import {Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditorModelService {
  protected metaModelElement: NamedElement;
  protected dataChangedEventQueue = [];
  private metaModelElementSubject = new BehaviorSubject<NamedElement>(null);
  private saveButtonEnabled = true;
  public originalMetaModel: NamedElement;

  constructor(
    private modelService: ModelService,
    private loadedFiles: LoadedFilesService,
  ) {
    this.metaModelElementSubject.subscribe(newMetaModelElement => {
      if (this.originalMetaModel && !newMetaModelElement) {
        this.originalMetaModel = null;
      }

      if (!this.originalMetaModel && newMetaModelElement) {
        this.originalMetaModel = newMetaModelElement;
      }
      this.metaModelElement = newMetaModelElement;
    });
  }

  getAspectModelUrn(): string {
    return this.loadedFiles.currentLoadedFile?.rdfModel?.getAspectModelUrn();
  }

  isSaveButtonEnabled() {
    return this.saveButtonEnabled;
  }

  isReadOnly(): boolean {
    return this.metaModelElement?.isPredefined || this.loadedFiles.isElementExtern(this.metaModelElement);
  }

  getMetaModelElement(): Observable<NamedElement> {
    return this.metaModelElementSubject.asObservable();
  }

  updateMetaModelElement(metaModelElement: NamedElement): void {
    if (metaModelElement === null) {
      this.metaModelElementSubject.next(metaModelElement);
      return;
    }

    this.dataChangedEventQueue = [];
    this.saveButtonEnabled = true;
    this.metaModelElementSubject.next(metaModelElement);
  }
}
