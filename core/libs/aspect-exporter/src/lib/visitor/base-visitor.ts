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
import {NamedElement} from '@esmf/aspect-model-loader';
import {DataFactory} from 'n3';

export abstract class BaseVisitor<T> {
  constructor(protected loadedFiles: LoadedFilesService) {}

  abstract visit(element: NamedElement): T;

  protected setPrefix(aspectModelUrn: string) {
    const namespace = `${aspectModelUrn.split('#')[0]}#`;
    if (this.loadedFiles.currentLoadedFile.rdfModel.hasDependency(namespace)) {
      return;
    }

    const externalFile = this.loadedFiles.externalFiles.find(
      file => file.rdfModel.store.getQuads(DataFactory.namedNode(aspectModelUrn), null, null, null).length > 0,
    );
    const alias = externalFile?.rdfModel?.getAliasByDependency(namespace);
    this.loadedFiles.currentLoadedFile.rdfModel.addPrefix(alias, namespace);
  }
}
