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

import {Graph} from '@maxgraph/core';

export type CellStyle = Record<string, unknown>;
export type StyleName = string;

export class GraphStyleBuilder {
  get sheet() {
    return this.graph.getStylesheet();
  }

  constructor(public graph: Graph) {}

  defaultEdge(style: CellStyle): this {
    this.sheet.putDefaultEdgeStyle(style);
    return this;
  }

  style(name: StyleName, style: CellStyle): this {
    this.sheet.putCellStyle(name, style);
    return this;
  }

  styles(names: StyleName[], style: CellStyle): this {
    names.forEach(n => this.graph.getStylesheet().putCellStyle(n, style));
    return this;
  }

  variants(base: CellStyle, defs: Record<StyleName, CellStyle>): this {
    Object.entries(defs).forEach(([name, override]) => {
      this.sheet.putCellStyle(name, {...base, ...override});
    });
    return this;
  }
}
