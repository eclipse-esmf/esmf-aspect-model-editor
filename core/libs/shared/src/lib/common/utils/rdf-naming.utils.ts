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

export class RdfNamingUtil {
  static splitRdfIntoChunks(fileName: string): [string, string, string] {
    const chunks: string[] = fileName.split(':');
    if (chunks.length !== 3) {
      throw new Error(`Unable to extract namespace name from "${fileName}": it should match "x:y:z" pattern`);
    }
    return chunks as [string, string, string];
  }

  static getFileNameFromRdf(fileName: string): string {
    return this.splitRdfIntoChunks(fileName)[2];
  }

  static getNamespaceNameFromRdf(fileName: string): string {
    return this.splitRdfIntoChunks(fileName)[0];
  }

  static getNamespaceVersionFromRdf(fileName: string): string {
    return this.splitRdfIntoChunks(fileName)[1];
  }

  static getNamespaceFromRdf(fileName: string): string {
    return `${this.getNamespaceNameFromRdf(fileName)}:${this.getNamespaceVersionFromRdf(fileName)}`;
  }

  static getUrnFromFileName(fileName: string): string {
    return `urn:samm:${this.getNamespaceFromRdf(fileName)}`;
  }

  static buildAbsoluteFileName(namespace: string, namespaceVersion: string, fileName: string): string {
    return `${namespace}:${namespaceVersion}:${fileName}`;
  }

  static splitAspectModelUrnIntoChunks(aspectModelUrn: string): [string, string, string, string, string] {
    const chunks: string[] = aspectModelUrn.split(/[:#]/);
    if (chunks.length !== 5) {
      throw new Error(`Unable to extract namespace from "${aspectModelUrn}": expected format "urn:samm:namespace:version:element"`);
    }
    return chunks as [string, string, string, string, string];
  }
}
