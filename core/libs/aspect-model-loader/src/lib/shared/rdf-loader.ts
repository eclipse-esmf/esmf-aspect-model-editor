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

import {Parser, Prefixes, Store} from 'n3';
import {Observable, Subject} from 'rxjs';
import {RdfModel} from './rdf-model';

export class RdfLoader {
  /**
   * Loads the model based on the provided RDF content
   * @param rdfContent array of RDF content each from a different ttl files
   */
  public loadModel(rdfContent: string[]): Observable<RdfModel> {
    const subject = new Subject<RdfModel>();
    const store: Store = new Store();
    let rdfModel: RdfModel = null;
    const parsedRdf = [];

    rdfContent.forEach(rdf => {
      new Parser().parse(rdf, (error, quad, prefixes: Prefixes<any>) => {
        if (error) {
          subject.error(error);
          subject.complete();
          return;
        }

        if (quad) {
          store.addQuad(quad);
        } else if (prefixes) {
          // content is parsed at that point. push rdf to parsed array
          if (!rdfModel) {
            rdfModel = new RdfModel(store);
            rdfModel.setPrefixes(prefixes);
          }

          for (const [key, value] of Object.entries(prefixes)) {
            // Because the original model should be always first, we take as the main urn the first one
            if (key === '' && rdfModel.getPrefixes()[key]) continue;
            rdfModel.addPrefix(key, value);
          }
          parsedRdf.push(rdf);
        }

        // complete and push result to the caller using the subject
        if (parsedRdf.length === rdfContent.length) {
          subject.next(rdfModel);
          subject.complete();
        }
      });
    });

    return subject;
  }
}
