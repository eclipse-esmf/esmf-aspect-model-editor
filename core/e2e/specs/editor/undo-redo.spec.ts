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
import {API_BASE_URL, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {
  FIELD_descriptionen,
  SELECTOR_editorSaveButton,
  SELECTOR_tbCollapseToggle,
  SELECTOR_tbDeleteButton,
  SELECTOR_tbRedoButton,
  SELECTOR_tbUndoButton,
  SettingsDialogSelectors,
} from '../../support/constants';
import {getTextViewText, openGraphView, openTextView, routeShufflingFormatter, subjectOrder} from '../../support/serialization-utils';

const MODEL = `# Copyright header of the user
# kept on undo

@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex: <http://example.com#> .
@prefix : <urn:samm:org.eclipse.examples.history:1.0.0#> .

:HistoryAspect a samm:Aspect ;
    samm:properties ( :zeta :alpha ) ;
    samm:operations () ;
    samm:events () .

:zeta a samm:Property ;
    samm:characteristic :ZetaCharacteristic .

:alpha a samm:Property ;
    samm:characteristic samm-c:Text .

:ZetaCharacteristic a samm:Characteristic ;
    samm:dataType xsd:string .
`;

/** The same model in another namespace, so that it is opened in its own tab. */
const OTHER_MODEL = MODEL.replace('org.eclipse.examples.history', 'org.eclipse.examples.other');

async function edgeExists(page: Page, source: string, target: string): Promise<boolean> {
  return page.evaluate(
    ({source, target}) => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const nameOf = (cell: any) => cell?.getMetaModelElement?.()?.element?.name;
      return graph
        .getChildCells(graph.getDefaultParent(), false, true)
        .some((cell: any) => nameOf(cell.source) === source && nameOf(cell.target) === target);
    },
    {source, target},
  );
}

async function selectEdge(page: Page, source: string, target: string): Promise<void> {
  await page.evaluate(
    ({source, target}) => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const nameOf = (cell: any) => cell?.getMetaModelElement?.()?.element?.name;
      const edge = graph
        .getChildCells(graph.getDefaultParent(), false, true)
        .find((cell: any) => nameOf(cell.source) === source && nameOf(cell.target) === target);
      if (!edge) throw new Error(`Edge ${source} -> ${target} not found`);
      graph.getSelectionModel().setCell(edge);
    },
    {source, target},
  );
}

async function textViewDocument(page: Page): Promise<string> {
  await openTextView(page);
  const text = await getTextViewText(page);
  await openGraphView(page);
  return text;
}

async function shapeNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const graph = (window as any)['angular.maxgraphAttributeService'].graph;
    return graph
      .getChildCells(graph.getDefaultParent(), true, false)
      .map((cell: any) => cell.getMetaModelElement?.()?.element?.name)
      .filter(Boolean)
      .sort();
  });
}

async function shapePosition(page: Page, name: string): Promise<{x: number; y: number}> {
  return page.evaluate(shapeName => {
    const graph = (window as any)['angular.maxgraphAttributeService'].graph;
    const cell = graph
      .getChildCells(graph.getDefaultParent(), true, false)
      .find((c: any) => c.getMetaModelElement?.()?.element?.name === shapeName);
    return {x: cell.geometry.x, y: cell.geometry.y};
  }, name);
}

async function moveShape(page: Page, name: string, dx: number, dy: number): Promise<void> {
  await page.evaluate(
    ({shapeName, dx, dy}) => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const cell = graph
        .getChildCells(graph.getDefaultParent(), true, false)
        .find((c: any) => c.getMetaModelElement?.()?.element?.name === shapeName);
      graph.moveCells([cell], dx, dy);
    },
    {shapeName: name, dx, dy},
  );
}

/** Records the pending changes now instead of after the short delay which merges quick changes into one step. */
async function flushHistory(page: Page): Promise<void> {
  await page.evaluate(() => (window as any)['angular.modelHistoryService'].flush());
}

async function waitForHistory(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => (window as any)['angular.modelHistoryService'].isRestoring())).toBe(false);
}

async function deleteShape(app: AppHelper, page: Page, name: string): Promise<void> {
  await app.clickShape(name);
  await page.locator(SELECTOR_tbDeleteButton).click();
  await app.shapeExists(name, false);
}

/** The tooltip of the toolbar button covers the tabs while the mouse stays on the button. */
async function hideTooltip(page: Page): Promise<void> {
  await page.mouse.move(600, 500);
  await expect(page.locator('.mat-mdc-tooltip-surface')).toHaveCount(0);
}

async function undo(page: Page): Promise<void> {
  await page.locator(SELECTOR_tbUndoButton).click();
  await waitForHistory(page);
  await hideTooltip(page);
}

async function redo(page: Page): Promise<void> {
  await page.locator(SELECTOR_tbRedoButton).click();
  await waitForHistory(page);
  await hideTooltip(page);
}

async function historyState(page: Page): Promise<{tabs: string[]; undo: number; redo: number}> {
  return page.evaluate(() => {
    const store = (window as any)['angular.modelHistoryService'].store;
    return {tabs: Object.keys(store.histories()).sort(), undo: store.undoCount(), redo: store.redoCount()};
  });
}

async function isActiveTabDirty(page: Page): Promise<boolean> {
  return page.evaluate(() => !!(window as any)['angular.TabStateService'].activeTab()?.isDirty);
}

async function saveModel(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise((resolve, reject) =>
        (window as any)['angular.fileHandlingService'].saveAspectModelToWorkspace().subscribe({complete: resolve, error: reject}),
      ),
  );
}

test.describe('Editor - undo/redo', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    // the formatter of the backend changes the order; the editor restores the order of the file
    await routeShufflingFormatter(page);
    await app.loadModel(MODEL);
    await app.shapeExists('zeta');
  });

  test('nothing can be undone or redone after loading a model', async ({page}) => {
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
    await expect(page.locator(SELECTOR_tbRedoButton)).toHaveClass(/disabled/);
  });

  test('undo restores a deleted connection and redo removes it again', async ({page}) => {
    await selectEdge(page, 'zeta', 'ZetaCharacteristic');
    await page.locator(SELECTOR_tbDeleteButton).click();
    await expect.poll(() => edgeExists(page, 'zeta', 'ZetaCharacteristic')).toBe(false);
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);

    await undo(page);
    await expect.poll(() => edgeExists(page, 'zeta', 'ZetaCharacteristic')).toBe(true);
    await expect(page.locator(SELECTOR_tbRedoButton)).not.toHaveClass(/disabled/);

    await redo(page);
    await expect.poll(() => edgeExists(page, 'zeta', 'ZetaCharacteristic')).toBe(false);
  });

  test('undo restores a deleted element with its connections and keeps the file as it was', async ({page}) => {
    const before = await textViewDocument(page);

    await deleteShape(app, page, 'ZetaCharacteristic');
    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    await expect.poll(() => edgeExists(page, 'zeta', 'ZetaCharacteristic')).toBe(true);

    const after = await textViewDocument(page);
    expect(after).toBe(before);
    expect(after.startsWith('# Copyright header of the user\n# kept on undo')).toBe(true);
    // the prefix is not used by any element, it is only kept because it is written in the file
    expect(after).toContain('@prefix ex: <http://example.com#>');

    await redo(page);
    await app.shapeExists('ZetaCharacteristic', false);
    expect(await edgeExists(page, 'zeta', 'ZetaCharacteristic')).toBe(false);
  });

  test('undo removes a new element and redo adds it again', async ({page}) => {
    const before = await shapeNames(page);
    await app.clickAddShapePlusIcon('HistoryAspect');
    await expect.poll(() => shapeNames(page).then(names => names.length)).toBeGreaterThan(before.length);
    const added = await shapeNames(page);

    await undo(page);
    await expect.poll(() => shapeNames(page)).toEqual(before);

    await redo(page);
    await expect.poll(() => shapeNames(page)).toEqual(added);
  });

  test('undo restores the previous connection after connecting other elements', async ({page}) => {
    await expect.poll(() => edgeExists(page, 'alpha', 'Text')).toBe(true);
    await app.clickConnectShapes('alpha', 'ZetaCharacteristic');
    await expect.poll(() => edgeExists(page, 'alpha', 'ZetaCharacteristic')).toBe(true);

    await undo(page);
    await expect.poll(() => edgeExists(page, 'alpha', 'ZetaCharacteristic')).toBe(false);
    expect(await edgeExists(page, 'alpha', 'Text')).toBe(true);
  });

  test('a rename in the edit dialog can be undone and redone', async ({page}) => {
    await app.renameElement('zeta', 'zetaRenamed');
    await app.shapeExists('zetaRenamed');

    await undo(page);
    await app.shapeExists('zeta');
    await app.shapeExists('zetaRenamed', false);
    expect(await edgeExists(page, 'HistoryAspect', 'zeta')).toBe(true);

    await redo(page);
    await app.shapeExists('zetaRenamed');
    await app.shapeExists('zeta', false);
  });

  test('a changed value in the edit dialog can be undone and redone', async ({page}) => {
    await app.dbClickShape('alpha');
    await page.locator(FIELD_descriptionen).first().fill('Changed in the dialog');
    await app.clickSaveButton();
    await expect.poll(() => app.getUpdatedRDF()).toContain('Changed in the dialog');

    await undo(page);
    await expect.poll(() => app.getUpdatedRDF()).not.toContain('Changed in the dialog');

    await redo(page);
    await expect.poll(() => app.getUpdatedRDF()).toContain('Changed in the dialog');
  });

  test('undo closes an open edit dialog because it shows an element of the replaced model', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await app.dbClickShape('alpha');

    await undo(page);
    await expect(page.locator(SELECTOR_editorSaveButton)).toHaveCount(0);
    await app.shapeExists('ZetaCharacteristic');
  });

  test('Cmd/Ctrl+Z undoes and Cmd/Ctrl+Shift+Z redoes', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    // focus the page outside of any text field
    await page.locator('#graph').click({position: {x: 5, y: 5}, force: true});

    await page.keyboard.press('ControlOrMeta+z');
    await waitForHistory(page);
    await app.shapeExists('ZetaCharacteristic');

    await page.keyboard.press('ControlOrMeta+Shift+z');
    await waitForHistory(page);
    await app.shapeExists('ZetaCharacteristic', false);
  });

  test('Cmd/Ctrl+Z in a text field does not undo changes of the graph', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await app.dbClickShape('alpha');
    const description = page.locator(FIELD_descriptionen).first();
    await description.fill('typed');
    await description.focus();

    await page.keyboard.press('ControlOrMeta+z');
    await page.waitForTimeout(500);
    await app.shapeExists('ZetaCharacteristic', false);
    await expect(page.locator(SELECTOR_editorSaveButton)).toBeVisible();
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);
  });

  test('a new change removes the steps which could be redone', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await undo(page);
    await expect(page.locator(SELECTOR_tbRedoButton)).not.toHaveClass(/disabled/);

    await selectEdge(page, 'HistoryAspect', 'alpha');
    await page.locator(SELECTOR_tbDeleteButton).click();
    await expect.poll(() => edgeExists(page, 'HistoryAspect', 'alpha')).toBe(false);
    await expect(page.locator(SELECTOR_tbRedoButton)).toHaveClass(/disabled/);
  });

  test('moving a shape is no step of its own, but undo keeps the new position', async ({page}) => {
    const start = await shapePosition(page, 'alpha');
    await moveShape(page, 'alpha', 60, 40);
    const moved = await shapePosition(page, 'alpha');
    expect(moved).not.toEqual(start);
    await flushHistory(page);
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);

    await deleteShape(app, page, 'ZetaCharacteristic');
    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    // deleting an element arranges the shapes again; undo brings back the position before the deletion
    expect(await shapePosition(page, 'alpha')).toEqual(moved);
  });

  test('undo and redo are not available in the text view', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await undo(page);
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
    await expect(page.locator(SELECTOR_tbRedoButton)).not.toHaveClass(/disabled/);

    await openTextView(page);
    await expect(page.locator(SELECTOR_tbRedoButton)).toHaveClass(/disabled/);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await page.waitForTimeout(400);

    await openGraphView(page);
    await app.shapeExists('ZetaCharacteristic');
    await expect(page.locator(SELECTOR_tbRedoButton)).not.toHaveClass(/disabled/);
  });

  test('loading a model starts a new history', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);

    await app.loadModel(MODEL);
    await app.shapeExists('ZetaCharacteristic');
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
    await expect(page.locator(SELECTOR_tbRedoButton)).toHaveClass(/disabled/);
  });

  test('every tab has its own history', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');

    await page.getByTestId('editor-tab-add').click();
    const tabs = page.getByTestId('editor-tab');
    await expect(tabs).toHaveCount(2);
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);

    await tabs.first().click();
    await expect(tabs.first()).toHaveClass(/active/);
    await app.shapeExists('zeta');
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);

    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
  });

  test('undo and redo several steps one after another', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await flushHistory(page);
    await selectEdge(page, 'HistoryAspect', 'alpha');
    await page.locator(SELECTOR_tbDeleteButton).click();
    await expect.poll(() => edgeExists(page, 'HistoryAspect', 'alpha')).toBe(false);
    await flushHistory(page);
    await app.renameElement('zeta', 'zetaRenamed');
    await app.shapeExists('zetaRenamed');
    await flushHistory(page);
    await expect.poll(() => historyState(page).then(state => state.undo)).toBe(3);

    await undo(page);
    await app.shapeExists('zeta');
    await undo(page);
    await expect.poll(() => edgeExists(page, 'HistoryAspect', 'alpha')).toBe(true);
    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
    expect(await historyState(page)).toEqual(expect.objectContaining({undo: 0, redo: 3}));

    await redo(page);
    await app.shapeExists('ZetaCharacteristic', false);
    await redo(page);
    await expect.poll(() => edgeExists(page, 'HistoryAspect', 'alpha')).toBe(false);
    await redo(page);
    await app.shapeExists('zetaRenamed');
    await expect(page.locator(SELECTOR_tbRedoButton)).toHaveClass(/disabled/);
  });

  test('deleting several selected elements is one step', async ({page}) => {
    await app.clickShape('ZetaCharacteristic');
    await app.clickShape('alpha', true);
    await page.locator(SELECTOR_tbDeleteButton).click();
    await app.shapeExists('ZetaCharacteristic', false);
    await app.shapeExists('alpha', false);

    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    await app.shapeExists('alpha');
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
  });

  test('changes made quickly after each other are one step', async ({page}) => {
    await page.evaluate(() => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const editor = (window as any)['angular.editorService'];
      const byName = (name: string) =>
        graph.getChildCells(graph.getDefaultParent(), true, false).find((c: any) => c.getMetaModelElement?.()?.element?.name === name);
      graph.getSelectionModel().setCell(byName('ZetaCharacteristic'));
      editor.deleteSelectedElements();
      graph.getSelectionModel().setCell(byName('alpha'));
      editor.deleteSelectedElements();
    });
    await app.shapeExists('ZetaCharacteristic', false);
    await app.shapeExists('alpha', false);

    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    await app.shapeExists('alpha');
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
  });

  test('undo restores a deleted aspect', async ({page}) => {
    await app.clickShape('HistoryAspect');
    await page.locator(SELECTOR_tbDeleteButton).click();
    // without the aspect the model becomes an element library which needs a name
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', {name: 'Name'}).fill('HistoryLibrary');
    await dialog.getByRole('button', {name: 'Remove Aspect'}).click();
    await app.shapeExists('HistoryAspect', false);

    await undo(page);
    await app.shapeExists('HistoryAspect');
    await expect.poll(() => edgeExists(page, 'HistoryAspect', 'zeta')).toBe(true);
    await expect.poll(() => edgeExists(page, 'HistoryAspect', 'alpha')).toBe(true);
  });

  test('a cancelled edit dialog is no step', async ({page}) => {
    await app.dbClickShape('alpha');
    await page.locator(FIELD_descriptionen).first().fill('not saved');
    await app.clickPropertiesCancelButton();
    await expect(page.locator(SELECTOR_editorSaveButton)).toHaveCount(0);
    await page.waitForTimeout(400);
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
  });

  test('formatting, collapsing and expanding are no steps', async ({page}) => {
    await page.getByTestId('formatButton').click();
    await page.locator(SELECTOR_tbCollapseToggle).click();
    await page.waitForTimeout(400);
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
    await page.locator(SELECTOR_tbCollapseToggle).click();
    await page.waitForTimeout(400);
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
  });

  test('undo keeps the collapsed mode', async ({page}) => {
    await page.locator(SELECTOR_tbCollapseToggle).click();
    await expect.poll(() => page.evaluate(() => (window as any)['angular.maxgraphAttributeService'].inCollapsedMode)).toBe(true);

    await deleteShape(app, page, 'ZetaCharacteristic');
    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    expect(await page.evaluate(() => (window as any)['angular.maxgraphAttributeService'].inCollapsedMode)).toBe(true);
  });

  test('the shortcuts do nothing while a dialog is open', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await app.openSettings();
    await page.keyboard.press('ControlOrMeta+z');
    await page.waitForTimeout(500);
    await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);
    await app.shapeExists('ZetaCharacteristic', false);
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);
  });

  test('Ctrl+Y redoes on Windows and Linux', async ({page}) => {
    const isMac = await page.evaluate(() => /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
    test.skip(isMac, 'Cmd+Y is no shortcut on macOS');

    await deleteShape(app, page, 'ZetaCharacteristic');
    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    await page.locator('#graph').click({position: {x: 5, y: 5}, force: true});
    await page.keyboard.press('Control+y');
    await waitForHistory(page);
    await app.shapeExists('ZetaCharacteristic', false);
  });

  test('the history is kept after saving and the modified marker follows undo and redo', async ({page}) => {
    await saveModel(page);
    await expect.poll(() => isActiveTabDirty(page)).toBe(false);

    await deleteShape(app, page, 'ZetaCharacteristic');
    await expect.poll(() => isActiveTabDirty(page)).toBe(true);
    await saveModel(page);
    await expect.poll(() => isActiveTabDirty(page)).toBe(false);
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);

    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
    await expect.poll(() => isActiveTabDirty(page)).toBe(true);

    await redo(page);
    await app.shapeExists('ZetaCharacteristic', false);
    await expect.poll(() => isActiveTabDirty(page)).toBe(false);
  });

  test('changing prefixes in the prefix management starts a new history', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);

    await page.getByTestId('tbPrefixesButton').click();
    const dialog = page.locator('ame-prefix-management-dialog');
    await dialog.getByTestId('prefix-row-ex').getByTestId('prefix-rename').click();
    await dialog.getByTestId('prefix-rename-input').fill('example');
    await dialog.getByTestId('prefix-rename-save').click();
    await dialog.getByTestId('prefix-management-close').click();
    await expect(dialog).toHaveCount(0);

    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
    expect((await historyState(page)).undo).toBe(0);
  });

  test('closing a tab removes its history', async ({page}) => {
    await page.getByTestId('editor-tab-add').click();
    const tabs = page.getByTestId('editor-tab');
    await expect(tabs).toHaveCount(2);
    await app.loadModel(OTHER_MODEL);
    await app.shapeExists('zeta');
    await deleteShape(app, page, 'ZetaCharacteristic');
    await expect.poll(() => historyState(page).then(state => state.tabs.length)).toBe(2);

    const closedTab = await page.evaluate(() => (window as any)['angular.TabStateService'].activeTabId());
    expect((await historyState(page)).tabs).toContain(closedTab);
    await tabs.nth(1).getByTestId('editor-tab-close').click();
    await page.getByRole('button', {name: "Don't Save"}).click();
    await expect(tabs).toHaveCount(1);

    await expect.poll(() => historyState(page).then(state => state.tabs)).not.toContain(closedTab);
  });

  test('switching tabs back and forth keeps undo and redo of every tab', async ({page}) => {
    await deleteShape(app, page, 'ZetaCharacteristic');
    await page.getByTestId('editor-tab-add').click();
    const tabs = page.getByTestId('editor-tab');
    await app.loadModel(OTHER_MODEL);
    await app.shapeExists('zeta');
    await deleteShape(app, page, 'alpha');
    await undo(page);
    await app.shapeExists('alpha');

    await tabs.first().click();
    await app.shapeExists('ZetaCharacteristic', false);
    await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);
    await expect(page.locator(SELECTOR_tbRedoButton)).toHaveClass(/disabled/);

    await tabs.nth(1).click();
    await app.shapeExists('ZetaCharacteristic');
    await expect(page.locator(SELECTOR_tbRedoButton)).not.toHaveClass(/disabled/);
    await redo(page);
    await app.shapeExists('alpha', false);

    await tabs.first().click();
    await app.shapeExists('alpha');
    await undo(page);
    await app.shapeExists('ZetaCharacteristic');
  });

  test('keeps at most 25 steps', async ({page}) => {
    test.slow();
    const before = await shapeNames(page);
    for (let i = 0; i < 27; i++) {
      await app.clickAddShapePlusIcon('HistoryAspect');
      await flushHistory(page);
    }
    const all = await shapeNames(page);

    for (let i = 0; i < 25; i++) {
      await expect(page.locator(SELECTOR_tbUndoButton)).not.toHaveClass(/disabled/);
      await undo(page);
    }
    await expect(page.locator(SELECTOR_tbUndoButton)).toHaveClass(/disabled/);
    // the first two of the 27 changes cannot be undone anymore
    const remaining = await shapeNames(page);
    expect(remaining.length).toBeGreaterThan(before.length);
    expect(remaining.length).toBeLessThan(all.length);
    expect(remaining.length - before.length).toBe(((all.length - before.length) / 27) * 2);
  });
});

test.describe('Editor - undo/redo with the element order of the file', () => {
  test('undo keeps the order of the statements in the file', async ({page}) => {
    const app = new AppHelper(page);
    await app.visitDefault();
    await routeShufflingFormatter(page);
    await app.openSettings(/^\s*Editor\s*$/);
    await page.getByTestId('elementOrderSelect').click();
    await page
      .locator('mat-option')
      .filter({hasText: /insert new elements after their parent/i})
      .click();
    await expect(page.locator('mat-option')).toHaveCount(0);
    await expect(page.locator('.cdk-overlay-transparent-backdrop')).toHaveCount(0);
    await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);
    await app.loadModel(MODEL);
    await app.shapeExists('zeta');

    await deleteShape(app, page, 'ZetaCharacteristic');
    await undo(page);
    await app.shapeExists('ZetaCharacteristic');

    const text = await textViewDocument(page);
    expect(subjectOrder(text)).toEqual([':HistoryAspect', ':zeta', ':alpha', ':ZetaCharacteristic']);
  });
});

const MISSING_REFERENCE_MODEL = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix b: <urn:samm:org.b:1.0.0#> .
@prefix : <urn:samm:org.a:1.0.0#> .

:AspectA a samm:Aspect ;
    samm:properties ( b:propB :propA ) ;
    samm:operations ( ) ;
    samm:events ( ) .

:propA a samm:Property ;
    samm:characteristic samm-c:Text .
`;

test.describe('Editor - undo/redo with missing references', () => {
  test('the placeholder of a missing reference stays after undo and the backend is not asked again', async ({page}) => {
    await setUpDefaultRoutes(page);
    const batchRequests: string[] = [];
    // the referenced file does not exist in the workspace
    await page.route(`**${API_BASE_URL}/models/batch**`, async route => {
      batchRequests.push(route.request().url());
      await route.fulfill({json: []});
    });
    const app = new AppHelper(page);
    await app.visitDefault(false);
    await app.loadModel(MISSING_REFERENCE_MODEL);
    await expect(page.getByTestId('unresolvedShapeIcon')).toHaveCount(1);
    const requestsAfterLoading = batchRequests.length;

    await deleteShape(app, page, 'propA');
    await undo(page);
    await app.shapeExists('propA');

    await expect(page.getByTestId('unresolvedShapeIcon')).toHaveCount(1);
    const unresolved = await page.evaluate(() =>
      (window as any)['angular.LoadedFilesService'].filesAsList
        .filter((f: any) => f.unresolved)
        .flatMap((f: any) => f.cachedFile.getKeys()),
    );
    expect(unresolved).toEqual(['urn:samm:org.b:1.0.0#propB']);
    expect(await app.getUpdatedRDF()).toContain('samm:properties (b:propB :propA)');
    expect(batchRequests.length).toBe(requestsAfterLoading);
  });
});
