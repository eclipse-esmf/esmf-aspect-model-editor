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

import {Page, expect} from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {API_BASE_URL, MODELS_API_ROUTE, NAMESPACES_URL, SAMM_VERSION_ACTUAL} from './api-mocks';
import {AppHelper} from './app-helper';
import {SELECTOR_openNamespacesButton, SELECTOR_searchElementsInp, SELECTOR_workspaceBtn} from './constants';

export interface ExternalReferenceOptions {
  fileName: string;
  elementName: string;
  elementSelector: string;
  isSameNamespace?: boolean;
  namespace?: string;
  hasChildren?: boolean;
  searchTerm?: string;
  x?: number;
  y?: number;
  version?: string;
  modelVersion?: string;
  prefixDialog?: ReferencePrefixDialogAction;
  /** The model into which the element is dropped (default: AspectDefault). */
  baseModel?: string;
}

/**
 * What to do with the namespace prefix dialog which is opened when an element of a namespace without prefix is dropped:
 * confirm the suggested prefix, use the automatic prefix (ext-<namespace>, default) or leave the dialog open (to test it).
 */
export type ReferencePrefixDialogAction = 'confirm' | 'skip' | 'keep-open';

export const SELECTOR_referencePrefixDialog = 'ame-namespace-prefix-dialog';

export async function handleReferencePrefixDialog(page: Page, action: ReferencePrefixDialogAction = 'skip'): Promise<void> {
  if (action === 'keep-open') return;
  const dialog = page.locator(SELECTOR_referencePrefixDialog);
  // the dialog only opens for namespaces which have no prefix yet
  const opened = await dialog
    .waitFor({state: 'visible', timeout: 1500})
    .then(() => true)
    .catch(() => false);
  if (!opened) return;
  await dialog.getByTestId(action === 'confirm' ? 'reference-prefix-confirm' : 'reference-prefix-skip').click();
  await expect(dialog).toBeHidden();
}

export function readFixture(relativePath: string): string {
  // First try the local e2e/fixtures directory
  const localFixturePath = path.resolve(__dirname, '../fixtures', relativePath);
  if (fs.existsSync(localFixturePath)) {
    return fs.readFileSync(localFixturePath, 'utf-8');
  }
  if (fs.existsSync(`${localFixturePath}.txt`)) {
    return fs.readFileSync(`${localFixturePath}.txt`, 'utf-8');
  }

  throw new Error(`Fixture not found for path: ${relativePath}`);
}

export async function setupExternalReference(
  page: Page,
  options: {
    fileName: string;
    elementName: string;
    isSameNamespace?: boolean;
    namespace?: string;
    hasChildren?: boolean;
    version?: string;
    modelVersion?: string;
  },
): Promise<void> {
  const isSame = options.isSameNamespace !== false;
  const namespace = options.namespace ?? (isSame ? 'org.eclipse.examples.aspect' : 'org.eclipse.different');
  const version = options.version ?? '1.0.0';
  const modelVersion = options.modelVersion ?? SAMM_VERSION_ACTUAL;
  const urn = `urn:samm:${namespace}:${version}#${options.elementName}`;
  const nsFolder = isSame ? 'same-namespace' : 'different-namespace';
  const batchFixturePath = `external-reference/${nsFolder}/without-childrens/${options.fileName}`;
  const modelsFixturePath = options.hasChildren
    ? `external-reference/${nsFolder}/with-childrens/${options.fileName}`
    : `external-reference/${nsFolder}/without-childrens/${options.fileName}`;

  const batchFixtureContent = readFixture(batchFixturePath);
  const modelsFixtureContent = readFixture(modelsFixturePath);

  await page.route(NAMESPACES_URL, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        [namespace]: [
          {
            version,
            models: [
              {
                name: options.fileName,
                model: options.fileName,
                aspectModelUrn: urn,
                version: SAMM_VERSION_ACTUAL,
                existing: true,
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route(`${API_BASE_URL}/models/batch*`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          aspectModelUrn: urn,
          aspectModel: batchFixtureContent,
          absoluteName: `${namespace}:${version}:${options.fileName}`,
          fileName: options.fileName,
          modelVersion,
        },
      ]),
    });
  });

  await page.route(MODELS_API_ROUTE, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: modelsFixtureContent,
        sourceLocation: `file:/path/to/${options.fileName}`,
      }),
    });
  });
}

export async function dragElementToGraph(
  page: Page,
  selector: string,
  x: number,
  y: number,
  prefixDialog: ReferencePrefixDialogAction = 'skip',
): Promise<void> {
  const sourceElement = page.locator(selector).first();
  await expect(sourceElement).toBeVisible();

  await page.evaluate(
    ({sel, posX, posY}) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (!el) throw new Error(`Element ${sel} not found`);
      const draggable = (
        el.tagName.toLowerCase() === 'ame-draggable-element' ? el : el.closest('ame-draggable-element') || el
      ) as HTMLElement;
      const type = draggable.dataset['type'] || el.dataset['type'] || '';
      const urn = draggable.dataset['urn'] || el.dataset['urn'] || '';
      const editorService = (window as any)['angular.editorService'];
      if (editorService) {
        editorService.createElement(posX, posY, type, urn);
      }
    },
    {sel: selector, posX: x, posY: y},
  );
  await page.waitForTimeout(300);
  await handleReferencePrefixDialog(page, prefixDialog);
}

export async function dragExternalElementFromWorkspace(
  helper: AppHelper,
  options: {
    fileName: string;
    searchTerm?: string;
    elementSelector: string;
    x?: number;
    y?: number;
    hasChildren?: boolean;
    prefixDialog?: ReferencePrefixDialogAction;
    baseModel?: string;
  },
): Promise<void> {
  const page = helper.page;
  await helper.loadModel(options.baseModel ?? readFixture('default-models/aspect-default.txt'));

  await page.locator(SELECTOR_workspaceBtn).click();
  await expect(page.locator('ame-workspace-file-list')).toBeVisible({timeout: 15000});

  const fileItem = page.locator(SELECTOR_openNamespacesButton).filter({hasText: options.fileName});
  await fileItem.click();

  const searchTerm = options.searchTerm ?? options.fileName;
  if (searchTerm) {
    await page.locator(SELECTOR_searchElementsInp).fill(searchTerm);
  }

  const selector = options.hasChildren ? `:nth-child(1) > ${options.elementSelector}` : options.elementSelector;

  await dragElementToGraph(page, selector, options.x ?? 100, options.y ?? 300, options.prefixDialog);
}

export async function setupAndDragExternalReference(helper: AppHelper, options: ExternalReferenceOptions): Promise<void> {
  await setupExternalReference(helper.page, options);
  await dragExternalElementFromWorkspace(helper, options);
}

export function checkAspectAndChildrenEntity(aspect: any): void {
  expect(aspect.name).toBe('AspectDefault');
  expect(aspect.properties).toHaveLength(1);
  expect(aspect.properties[0].name).toBe('property1');
  expect(aspect.properties[0].characteristic.name).toBe('Characteristic1');
  expect(aspect.properties[0].characteristic.dataType.name).toBe('ExternalEntity');
}

export function checkAspectAndChildrenConstraint(aspect: any): void {
  expect(aspect.name).toBe('AspectDefault');
  expect(aspect.properties).toHaveLength(1);
  expect(aspect.properties[0].name).toBe('property1');
  expect(aspect.properties[0].characteristic.name).toBe('Trait1');
  expect(aspect.properties[0].characteristic.baseCharacteristic.name).toBe('Characteristic2');
  expect(aspect.properties[0].characteristic.constraints[0].name).toBe('EncodingConstraint1');
  expect(aspect.properties[0].characteristic.constraints[1].name).toBe('ExternalConstraint');
}

export function checkAspect(aspect: any): void {
  expect(aspect.name).toBe('AspectDefault');
  expect(aspect.properties).toHaveLength(1);
  expect(aspect.properties[0].name).toBe('property1');
  expect(aspect.properties[0].characteristic.name).toBe('ExternalCharacteristic');
}

export function checkRelationParentChild(parentModel: any, parent: string, child: string): void {
  expect(parentModel.name).toBe(parent);
  expect(parentModel.properties).toHaveLength(2);
  expect(parentModel.properties[1].name).toBe(child);
}

export function checkAspectTree(aspect: any): void {
  expect(aspect.name).toBe('AspectDefault');
  expect(aspect.properties).toHaveLength(2);
  expect(aspect.properties[0].name).toBe('property1');
  expect(aspect.properties[0].characteristic.name).toBe('Characteristic1');
  expect(aspect.properties[1].name).toBe('externalPropertyWithChildren');
  expect(aspect.properties[1].characteristic.name).toBe('ChildrenCharacteristic1');

  const entity = aspect.properties[1].characteristic.dataType;
  expect(entity.name).toBe('ChildrenEntity1');
  expect(entity.properties).toHaveLength(2);
  expect(entity.properties[0].name).toBe('childrenProperty1');
  expect(entity.properties[1].name).toBe('childrenProperty2');
  expect(entity.properties[0].characteristic.name).toBe('ChildrenCharacteristic2');
  expect(entity.properties[0].characteristic.dataType.name).toBe('ChildrenEntity2');
  expect(entity.properties[1].characteristic.name).toBe('Boolean');
}
