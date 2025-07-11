/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Observable, Subject} from 'rxjs';
import {NamedElement} from './aspect-meta-model/named-element';
import {BaseModelLoader} from './base-model-loader';
import {namespaceFactory} from './instantiator';
import {BaseInitProps} from './shared/base-init-props';
import {ModelElementCache} from './shared/model-element-cache.service';
import {RdfLoader} from './shared/rdf-loader';
import {RdfModel} from './shared/rdf-model';
import {RdfModelUtil} from './shared/rdf-model-util';

export class NamespaceLoader extends BaseModelLoader {
  constructor() {
    super();
  }
  /**
   * Loads RDF content and returns an Observable that emits a map of namespaces as keys and an array of corresponding NamedElement objects.
   *
   * @param {string[]} rdfContent The RDF content to load.
   * @return {Observable<Map<string, Array<NamedElement>>>} An Observable that emits a map of namespace keys to arrays of NamedElement objects.
   */
  public load(...rdfContent: string[]): Observable<Map<string, Array<NamedElement>>> {
    const subject = new Subject<Map<string, Array<NamedElement>>>();
    const initProps: BaseInitProps = {rdfModel: null, cache: null};

    new RdfLoader().loadModel(rdfContent).subscribe({
      next: (rdfModel: RdfModel) => {
        initProps.rdfModel = rdfModel;
        initProps.cache = new ModelElementCache();
        this.cacheService = initProps.cache;

        try {
          RdfModelUtil.throwErrorIfUnsupportedVersion(rdfModel);
          subject.next(Object.freeze(namespaceFactory(initProps)()));
        } catch (error: any) {
          subject.error(error);
        } finally {
          subject.complete();
        }
      },
      error: error => {
        subject.error(error);
      },
    });

    return subject;
  }
}
