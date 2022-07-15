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

/**
 * Model that shows a list of validation errors of a .ttl file.
 */
export class SemanticError {
  constructor(
    public resultMessage: string,
    public focusNode: string,
    public resultPath: string,
    public resultSeverity: string,
    public value: string
  ) {}
}

export class SyntacticError {
  constructor(public originalExceptionMessage: string, public lineNumber: number, public columnNumber: number) {}
}

export class ProcessingError {
  constructor(public message: string) {}
}
