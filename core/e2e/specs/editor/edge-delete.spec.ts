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
import {SELECTOR_tbDeleteButton} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

interface EdgeInfo {
  id: string;
  x: number;
  y: number;
  points: string;
}

/** Returns the page coordinates of the middle of the first segment of the edge between the two named shapes. */
async function getEdge(page: Page, sourceName: string, targetName: string): Promise<EdgeInfo> {
  return page.evaluate(
    ({source, target}) => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const nameOf = (cell: any) => cell?.getMetaModelElement?.()?.element?.name;
      const edge = graph
        .getChildCells(graph.getDefaultParent(), false, true)
        .find((cell: any) => nameOf(cell.source) === source && nameOf(cell.target) === target);
      if (!edge) throw new Error(`Edge ${source} -> ${target} not found`);

      const state = graph.view.getState(edge);
      const [p0, p1] = state.absolutePoints;
      const rect = graph.container.getBoundingClientRect();
      return {
        id: edge.id,
        x: rect.left + (p0.x + p1.x) / 2 - graph.container.scrollLeft,
        y: rect.top + (p0.y + p1.y) / 2 - graph.container.scrollTop,
        points: JSON.stringify(state.absolutePoints.map((p: any) => [Math.round(p.x), Math.round(p.y)])),
      };
    },
    {source: sourceName, target: targetName},
  );
}

async function edgeExists(page: Page, edgeId: string): Promise<boolean> {
  return page.evaluate(id => {
    const graph = (window as any)['angular.maxgraphAttributeService'].graph;
    return !!graph.getDataModel().getCell(id);
  }, edgeId);
}

async function selectedEdgeIds(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const graph = (window as any)['angular.maxgraphAttributeService'].graph;
    return graph
      .getSelectionCells()
      .filter((cell: any) => cell.isEdge())
      .map((cell: any) => cell.id);
  });
}

test.describe('Editor - remove connections (edges)', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await app.shapeExists('property1');
  });

  test('an edge can be selected by clicking it and deleted with the Delete key', async ({page}) => {
    const edge = await getEdge(page, 'AspectDefault', 'property1');

    await page.mouse.click(edge.x, edge.y);
    await expect.poll(() => selectedEdgeIds(page)).toEqual([edge.id]);
    await expect(page.locator(SELECTOR_tbDeleteButton)).not.toHaveClass(/disabled/);

    await page.keyboard.press('Delete');

    await expect.poll(() => edgeExists(page, edge.id)).toBe(false);
    // Both elements stay in the model, only the relation is gone.
    await app.shapeExists('AspectDefault');
    await app.shapeExists('property1');
    await app.shapeExists('Characteristic1');
    const aspect = await app.getAspect();
    expect(aspect.properties ?? []).toHaveLength(0);
  });

  test('dragging an edge neither moves it nor its connected elements', async ({page}) => {
    const edge = await getEdge(page, 'property1', 'Characteristic1');

    await page.mouse.move(edge.x, edge.y);
    await page.mouse.down();
    await page.mouse.move(edge.x + 120, edge.y + 80, {steps: 10});
    await page.mouse.up();

    expect(await selectedEdgeIds(page)).toEqual([edge.id]);
    const after = await getEdge(page, 'property1', 'Characteristic1');
    expect(after.points).toBe(edge.points);
    expect(after.id).toBe(edge.id);
    // No terminal/bend handles are shown for a selected edge.
    const visibleHandles = await page.evaluate(() => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const handler = graph.getPlugin('SelectionCellsHandler').getHandler(graph.getSelectionCell());
      if (!handler) throw new Error('No edge handler');
      return [...(handler.bends ?? []), ...(handler.virtualBends ?? []), handler.labelShape].filter(
        (shape: any) => shape?.node && shape.node.style.display !== 'none',
      ).length;
    });
    expect(visibleHandles).toBe(0);
  });

  test('the context menu of an edge offers "Delete connection"', async ({page}) => {
    const edge = await getEdge(page, 'property1', 'Characteristic1');

    await page.mouse.click(edge.x, edge.y, {button: 'right'});
    const deleteConnection = page.locator('.mxPopupMenu').getByText('Delete connection');
    await expect(deleteConnection).toBeVisible();
    await deleteConnection.click();

    await expect.poll(() => edgeExists(page, edge.id)).toBe(false);
    await app.shapeExists('property1');
    await app.shapeExists('Characteristic1');
    const aspect = await app.getAspect();
    expect(aspect.properties[0].characteristic ?? null).toBeNull();
  });
});
