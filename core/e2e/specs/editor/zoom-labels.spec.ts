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

import {expect, Page, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {readFixture} from '../../support/drag-drop-utils';

/**
 * Returns the names of shapes without visible title text.
 * WebKit ignores the zoom of HTML labels using CSS positioning or transforms and paints them somewhere else in the
 * graph. The DOM still reports the correct positions, therefore the rendered pixels are checked.
 */
async function shapesWithoutVisibleTitle(page: Page): Promise<string[]> {
  const titleAreas: {name: string; x: number; y: number; width: number; height: number}[] = await page.evaluate(() => {
    const graph = (window as any)['angular.maxgraphAttributeService'].graph;
    const containerRect = graph.container.getBoundingClientRect();
    const s = graph.view.scale;
    return graph
      .getChildCells(graph.getDefaultParent(), true, false)
      .filter((cell: any) => graph.view.getState(cell)?.text?.node?.querySelector('.cell-label .element-name:not(.simple)'))
      .map((cell: any) => {
        const state = graph.view.getState(cell);
        // The title strip between the top border and the separator line below the name, without the info icons.
        return {
          name: cell.getMetaModelElement?.()?.element?.name,
          x: containerRect.left + state.x - graph.container.scrollLeft + state.width * 0.15,
          y: containerRect.top + state.y - graph.container.scrollTop + 4 * s,
          width: state.width * 0.7,
          height: 18 * s,
        };
      })
      .filter((area: any) => area.x >= 0 && area.y >= 0 && area.x + area.width <= innerWidth && area.y + area.height <= innerHeight);
  });
  expect(titleAreas.length).toBeGreaterThan(0);

  const missing: string[] = [];
  for (const area of titleAreas) {
    const png = await page.screenshot({clip: area});
    const darkPixels = await page.evaluate(async base64 => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) count++;
      }
      return count;
    }, png.toString('base64'));
    if (darkPixels < 10) {
      missing.push(area.name);
    }
  }
  return missing;
}

async function scale(page: Page): Promise<number> {
  return page.evaluate(() => (window as any)['angular.maxgraphAttributeService'].graph.view.scale);
}

test.describe('Graph zoom keeps labels inside their shapes', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    // Contains info icons (abstract elements) next to the element names.
    await app.loadModel(readFixture('abstract-entity.txt'));
    await expect(page.locator('#graph .icons-bar > *').first()).toBeAttached();
  });

  test('zoom in, zoom out and fit', async ({page}) => {
    expect(await shapesWithoutVisibleTitle(page)).toEqual([]);

    await page.locator('ame-bar-item', {has: page.locator('mat-icon', {hasText: /^zoom_in$/})}).click();
    await expect.poll(() => scale(page)).toBeGreaterThan(1);
    expect(await shapesWithoutVisibleTitle(page)).toEqual([]);

    const zoomOut = page.locator('ame-bar-item', {has: page.locator('mat-icon', {hasText: /^zoom_out$/})});
    await zoomOut.click();
    await zoomOut.click();
    await expect.poll(() => scale(page)).toBeLessThan(1);
    expect(await shapesWithoutVisibleTitle(page)).toEqual([]);

    await page.evaluate(() => (window as any)['angular.maxgraphAttributeService'].graph.getPlugin('fit').fit());
    expect(await shapesWithoutVisibleTitle(page)).toEqual([]);
  });
});
