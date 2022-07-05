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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {mxConstants} from '../providers';
import {darkColors} from './dark-theme';
import {lightColors} from './light-theme';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private root: HTMLElement = document.documentElement;
  private graph: mxgraph.mxGraph;

  public currentColors: any = lightColors;

  get getDefaultShapesColors() {
    return {
      [mxConstants.STYLE_STROKEWIDTH]: 2,
      [mxConstants.STYLE_STROKECOLOR]: this.currentColors.border,
      [mxConstants.STYLE_FONTCOLOR]: this.currentColors.font,
    };
  }

  get theme() {
    return {
      aspect: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.aspect},
      property: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.property},
      abstractProperty: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.abstractProperty},
      operation: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.operation},
      event: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.event},
      characteristic: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.characteristic},
      abstractEntity: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.entityValue},
      entity: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.entity},
      constraint: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.constraint},
      trait: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.trait},
      unit: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.unit},
      entityValue: {[mxConstants.STYLE_FILLCOLOR]: this.currentColors.entityValue},
    };
  }

  setGraph(graph: mxgraph.mxGraph) {
    this.graph = graph;
  }

  applyTheme(theme: string) {
    this.setCssVars(theme);
    this.graph.getChildVertices(this.graph.getDefaultParent()).forEach((shape: mxgraph.mxCell) => {
      this.applyShapeStyle(shape);
    });
  }

  applyShapeStyle(shape: mxgraph.mxCell) {
    const shapeStyle = this.graph.getModel().getStyle(shape).split(';')[0];
    const style = [...Object.entries(this.theme[shapeStyle]), ...Object.entries(this.getDefaultShapesColors)].reduce(
      (acc, [key, value]) => `${acc};${key}=${value}`,
      ''
    );
    this.graph.setCellStyle(`${shapeStyle}${style}`, [shape]);
  }

  setCssVars(theme: string) {
    this.currentColors = theme === 'light' ? lightColors : darkColors;
    Object.entries(this.currentColors).forEach(([key, color]: any) => this.root.style.setProperty(`--ame-${key}`, color));
  }
}
