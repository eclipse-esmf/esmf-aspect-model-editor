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

import {CacheStrategy, RdfModel} from '@esmf/aspect-model-loader';
import {Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject} from 'n3';
import {Observable} from 'rxjs';
import {NamespaceFile} from '../model-session';

export interface QuadComponents {
  subject?: Quad_Subject;
  predicate?: Quad_Predicate;
  object?: Quad_Object;
  graph?: Quad_Graph;
}

/** RDF serialization of aspect models. Implemented by infrastructure. */
export abstract class RdfPort {
  abstract serializeModel(rdfModel: RdfModel): string;
  abstract isSameModelContent(absoluteFileName: string, fileContent: string, fileToCompare: NamespaceFile): Observable<boolean>;
}

/** Low-level RDF quad manipulation. Implemented by infrastructure. */
export abstract class RdfNodePort {
  abstract updateQuads(query: QuadComponents, replacement: QuadComponents, rdfModel: RdfModel): number;
}

/** Instantiates model elements from RDF. Implemented by infrastructure. */
export abstract class ModelInstantiatorPort {
  abstract instantiateRemainingElements(mergedRdfModel: RdfModel, currentRdfModel: RdfModel, cache: CacheStrategy): void;
}
