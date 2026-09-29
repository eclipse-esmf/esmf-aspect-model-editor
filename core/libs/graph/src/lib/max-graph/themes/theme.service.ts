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

import {Injectable} from '@angular/core';
import {Cell, CellStyle, Graph} from '@maxgraph/core';
import {MaxGraphHelper} from '../helpers';
import {ModelStyleResolver, ThemeColors} from '../models';
import {darkColors} from './dark-theme';
import {lightColors} from './light-theme';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private root: HTMLElement = document.documentElement;
  private graph: Graph;

  public currentColors: ThemeColors = lightColors;
  public currentTheme: 'light' | 'dark' = 'light';

  private static STROKE_WIDTH = 'strokeWidth';
  private static STROKE_Color = 'strokeColor';
  private static FILL_COLOR = 'fillColor';

  get getDefaultShapesColors() {
    return {
      [ThemeService.STROKE_WIDTH]: 2,
      [ThemeService.STROKE_Color]: this.currentColors.border,
      [ThemeService.FILL_COLOR]: this.currentColors.font,
      fontColor: this.currentColors.font,
    };
  }

  get theme() {
    return {
      aspect: {[ThemeService.FILL_COLOR]: this.currentColors.aspect},
      property: {[ThemeService.FILL_COLOR]: this.currentColors.property},
      abstractProperty: {[ThemeService.FILL_COLOR]: this.currentColors.abstractProperty},
      operation: {[ThemeService.FILL_COLOR]: this.currentColors.operation},
      event: {[ThemeService.FILL_COLOR]: this.currentColors.event},
      characteristic: {[ThemeService.FILL_COLOR]: this.currentColors.characteristic},
      abstractEntity: {[ThemeService.FILL_COLOR]: this.currentColors.entityValue},
      entity: {[ThemeService.FILL_COLOR]: this.currentColors.entity},
      constraint: {[ThemeService.FILL_COLOR]: this.currentColors.constraint},
      trait: {[ThemeService.FILL_COLOR]: this.currentColors.trait},
      unit: {[ThemeService.FILL_COLOR]: this.currentColors.unit},
      entityValue: {[ThemeService.FILL_COLOR]: this.currentColors.entityValue},
      filteredProperties_entity: {[ThemeService.FILL_COLOR]: this.currentColors.entity},
      filteredProperties_either: {[ThemeService.FILL_COLOR]: this.currentColors.characteristic},
      value: {[ThemeService.FILL_COLOR]: this.currentColors.value},
    };
  }

  setGraph(graph: Graph) {
    this.graph = graph;
    if (this.graph) {
      this.applyTheme(this.currentTheme);
    }
  }

  applyTheme(theme: string) {
    this.setCssVars(theme);
    if (!this.graph) return;

    this.graph.batchUpdate(() => {
      const defaultEdgeStyle = this.graph.getStylesheet()?.getDefaultEdgeStyle();
      if (defaultEdgeStyle) {
        defaultEdgeStyle.strokeColor = this.currentColors.border;
        defaultEdgeStyle.fontColor = this.currentColors.font;
      }
      const defaultVertexStyle = this.graph.getStylesheet()?.getDefaultVertexStyle();
      if (defaultVertexStyle) {
        defaultVertexStyle.strokeColor = this.currentColors.border;
        defaultVertexStyle.fontColor = this.currentColors.font;
      }

      this.graph.getChildCells(this.graph.getDefaultParent(), true, true).forEach((cell: Cell) => {
        if (cell.isEdge()) {
          this.graph.setCellStyles('strokeColor', this.currentColors.border, [cell]);
          this.graph.setCellStyles('fontColor', this.currentColors.font, [cell]);
        } else if (cell.isVertex()) {
          const modelElement = MaxGraphHelper.getModelElement(cell);
          const styleName = (cell.style?.baseStyleNames?.[0] as string) || (modelElement ? ModelStyleResolver.resolve(modelElement) : '');
          const style = this.generateThemeStyle(styleName);
          if (modelElement?.isAnonymous?.()) {
            style.dashed = true;
            style.dashPattern = '4 4';
          }
          this.graph.setCellStyle(style, [cell]);
        }
      });
    });

    this.graph.refresh();
  }

  generateThemeStyle(styleName: string): CellStyle {
    if (!styleName) {
      return {} as CellStyle;
    }

    return {
      baseStyleNames: [styleName],
      fontColor: this.currentColors.font,
      strokeColor: this.currentColors.border,
      strokeWidth: 2,
      ...(this.theme[styleName] || {}),
    } as CellStyle;
  }

  setCssVars(theme: string) {
    this.currentTheme = theme === 'dark' ? 'dark' : 'light';
    this.currentColors = this.currentTheme === 'dark' ? darkColors : lightColors;

    if (this.currentTheme === 'dark') {
      this.root.classList.add('dark-theme');
      document.body?.classList.add('dark-theme');
      this.root.setAttribute('data-theme', 'dark');
    } else {
      this.root.classList.remove('dark-theme');
      document.body?.classList.remove('dark-theme');
      this.root.removeAttribute('data-theme');
    }

    Object.entries(this.currentColors).forEach(([key, color]: any) => this.root.style.setProperty(`--ame-${key}`, color));
  }
}
