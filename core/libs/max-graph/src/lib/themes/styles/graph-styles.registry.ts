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
import {EdgeStyles, ModelStyle} from '../../models';
import {CellStyle, GraphStyleBuilder} from './graph-style-builder';
import {MODEL_NODES, MODEL_PROPERTIES} from './graph-styles.names';
import {COLORS, FONT} from './graph-styles.tokens';

export class GraphStylesRegistry {
  static setupStyles(graph: Graph): void {
    const builder = new GraphStyleBuilder(graph);

    builder.defaultEdge(this.defaultEdgeStyle());
    this.registerEdgeVariants(builder);

    const baseNode = this.baseNodeStyle();
    const baseProperty = this.basePropertyStyle();

    builder.styles([...MODEL_NODES], baseNode);
    builder.styles([...MODEL_PROPERTIES], baseProperty);

    builder.style(ModelStyle.ASPECT_PROP, {...baseProperty, height: 10});
    builder.style(ModelStyle.PROPERTY_PROP, {...baseProperty, fillColor: COLORS.propertyFill});

    builder.style(ModelStyle.ENTITY_VALUE, {...baseNode, rounded: true, fillOpacity: 70});

    const ellipseChip = this.ellipseChipStyle(baseNode);
    builder.styles([ModelStyle.TRAIT, ModelStyle.FILTERED_ENTITY, ModelStyle.FILTERED_EITHER], ellipseChip);
  }

  private static defaultEdgeStyle(): CellStyle {
    return {
      edgeStyle: 'orthogonalEdgeStyle',
      endArrow: 'block',
      fontSize: FONT.edge,
      rounded: true,
      shape: 'connector',
      strokeColor: COLORS.text,
      fontColor: COLORS.text,
      pointerEvents: false,
    };
  }

  private static registerEdgeVariants(b: GraphStyleBuilder): void {
    b.variants(
      {},
      {
        [EdgeStyles.optionalPropertyEdge]: {dashed: true},
        [EdgeStyles.entityValueEntityEdge]: {dashed: true},
        [EdgeStyles.abstractPropertyEdge]: {dashed: true},
        [EdgeStyles.abstractElementEdge]: {endArrow: 'block'},
        [EdgeStyles.defaultEdge]: {},
      },
    );
  }

  private static baseNodeStyle(): CellStyle {
    return {
      fontSize: FONT.node,
      fontColor: COLORS.text,
      shape: 'rectangle',
      align: 'center',
      verticalAlign: 'top',
      spacing: 10,
    };
  }

  private static basePropertyStyle(): CellStyle {
    return {
      fontSize: FONT.node,
      fontColor: COLORS.text,
      shape: 'label',
      align: 'left',
      verticalAlign: 'middle',
      spacing: 5,
      spacingLeft: 5,
      spacingRight: 5,
      whiteSpace: 'wrap',
    };
  }

  private static ellipseChipStyle(baseNode: CellStyle): CellStyle {
    return {
      ...baseNode,
      shape: 'ellipse',
      perimeter: 'ellipsePerimeter',
      verticalAlign: 'middle',
      overflow: 'width',
    };
  }
}
