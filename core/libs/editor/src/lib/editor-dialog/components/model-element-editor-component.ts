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
import {RdfModelUtil} from '@ame/rdf/utils';
import {Directive, inject} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {filter, tap} from 'rxjs/operators';
import {EditorModelService} from '../editor-model.service';

@Directive()
export abstract class ModelElementEditorComponent<T extends NamedElement> {
  public metaModelDialogService = inject(EditorModelService);
  public metaModelElement: T;

  getValueWithoutUrnDefinition(value: string): string {
    return RdfModelUtil.getValueWithoutUrnDefinition(value);
  }

  getMetaModelData() {
    return this.metaModelDialogService.getMetaModelElement().pipe(
      filter((metaModelElement): metaModelElement is T => Boolean(metaModelElement)),
      tap(metaModelElement => {
        this.metaModelElement = <T>metaModelElement;
      }),
    );
  }
}
