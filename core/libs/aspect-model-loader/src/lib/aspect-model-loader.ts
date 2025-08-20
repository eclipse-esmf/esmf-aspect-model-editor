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

import {map, Observable, Subject} from 'rxjs';
import {Aspect} from './aspect-meta-model';
import {BaseModelLoader} from './base-model-loader';
import {aspectFactory} from './instantiator/aspect-instantiator';
import {BaseInitProps} from './shared/base-init-props';
import {ModelElementCache} from './shared/model-element-cache.service';
import {RdfLoader} from './shared/rdf-loader';
import {RdfModel} from './shared/rdf-model';
import {RdfModelUtil} from './shared/rdf-model-util';

type InstantiatorResult = {
  aspect: Aspect;
  initProps: BaseInitProps;
};

export class AspectModelLoader extends BaseModelLoader {
  constructor() {
    super();
  }
  /**
   * Load and instantiate an Aspect Model based on an RDF/Turtle. Related imports are not resolved.
   *
   * @param rdfContent RDF/Turtle representation to load
   */
  public loadSelfContainedModel(rdfContent: string): Observable<InstantiatorResult> {
    return this.load('', rdfContent);
  }

  /**
   * Load and instantiate an Aspect Model based on an RDF/Turtle
   *
   * @param modelAspectUrn URN of the Aspect Model to load and instantiate
   *
   * @param rdfContent List of all RDF/Turtle representation to load, including
   *                   all referenced models imports. The default SAMM related imports
   *                   e.g. with prefixes "samm", "samm-c", "samm-e", "unit" and "xsd"
   *                   are already provided. No needs to provided that(content) is not
   *                   required.
   *
   * @return Observable<Aspect> Aspect including all information from the given RDF
   */
  public load(modelAspectUrn: string, ...rdfContent: string[]): Observable<InstantiatorResult> {
    const subject = new Subject<InstantiatorResult>();
    const initProps: BaseInitProps = {rdfModel: null, cache: null};

    new RdfLoader().loadModel(rdfContent).subscribe({
      next: (rdfModel: RdfModel) => {
        initProps.rdfModel = rdfModel;
        initProps.cache = new ModelElementCache();
        this.cacheService = initProps.cache;

        try {
          RdfModelUtil.throwErrorIfUnsupportedVersion(rdfModel);
          subject.next({
            aspect: aspectFactory(initProps)(modelAspectUrn),
            initProps,
          });
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

export function loadAspectModel(model: {filesContent: string[]; aspectModelUrn?: string}) {
  const aspectModelLoader = new AspectModelLoader();

  return aspectModelLoader.load(model.aspectModelUrn || '', ...model.filesContent).pipe(
    map(({aspect, initProps}) => ({
      aspect,
      rdfModel: initProps.rdfModel,
      store: initProps.rdfModel.store,
      cachedElements: initProps.cache,
    })),
  );
}
