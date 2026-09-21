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

import {Locator, Page, expect} from '@playwright/test';
import {setUpDefaultRoutes} from './api-mocks';
import {
  FIELD_name,
  SELECTOR_editorCancelButton,
  SELECTOR_editorSaveButton,
  SELECTOR_propertiesCancelButton,
  SELECTOR_tbConnectButton,
  SIDEBAR_CLOSE_BUTTON,
} from './constants';

export class AppHelper {
  constructor(public page: Page) {}

  async visitDefault(setupRoutes = true): Promise<void> {
    if (setupRoutes) {
      await setUpDefaultRoutes(this.page);
    }
    await this.page.goto('/editor?e2e=true');
    await this.page
      .locator('ame-loading-screen')
      .waitFor({state: 'detached', timeout: 20000})
      .catch(() => {});
    await expect(this.page.locator('#graph')).toBeVisible({timeout: 20000});
  }

  getHTMLCell(name: string): Locator {
    return this.page.locator(`[data-cell-id="${name}"], [data-cell-name="${name}"]`).first();
  }

  async dbClickShape(name: string): Promise<Locator> {
    await this.clickShape(name);
    await this.page.evaluate(shapeName => {
      const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
      const graph = maxgraphAttributeService?.graph;
      if (!graph) return;
      const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
      const found = cells.find(
        (c: any) =>
          c &&
          (c.id === shapeName ||
            c.getAttribute?.('name') === shapeName ||
            c.value?.getAttribute?.('name') === shapeName ||
            c.getMetaModelElement?.()?.element?.name === shapeName),
      );
      if (!found) return;
      graph.getSelectionModel().setCell(found);
      graph.fireEvent({
        name: 'doubleClick',
        getName: () => 'doubleClick',
        getProperty: (key: string) => (key === 'cell' ? found : undefined),
        isConsumed: () => false,
      });
    }, name);
    await this.forceChangeDetection();

    const cell = this.getHTMLCell(name);
    if (await cell.isVisible().catch(() => false)) {
      await cell.dblclick({force: true}).catch(() => {});
    }
    await expect(this.page.locator(SELECTOR_editorSaveButton)).toBeVisible();
    return cell;
  }

  async clickShape(name: string, multiSelect = false): Promise<void> {
    await this.page.evaluate(
      ({shapeName, multi}) => {
        const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
        const graph = maxgraphAttributeService?.graph;
        if (!graph) throw new Error('Graph not available');
        const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
        const found = cells.find(
          (c: any) =>
            c &&
            (c.id === shapeName ||
              c.getAttribute?.('name') === shapeName ||
              c.value?.getAttribute?.('name') === shapeName ||
              c.getMetaModelElement?.()?.element?.name === shapeName),
        );
        if (!found) throw new Error(`Shape ${shapeName} not found`);
        if (multi) {
          graph.getSelectionModel().addCell(found);
        } else {
          graph.getSelectionModel().setCell(found);
        }
      },
      {shapeName: name, multi: multiSelect},
    );
    await this.forceChangeDetection();
  }

  async clickConnectShapes(sourceName: string, targetName: string): Promise<void> {
    await this.clickShape(sourceName);
    await this.clickShape(targetName, true);
    await this.page.locator(SELECTOR_tbConnectButton).click({force: true});
  }

  async clickSaveButton(): Promise<void> {
    await this.forceChangeDetection();
    const saveBtn = this.page.locator(SELECTOR_editorSaveButton);
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await this.page.waitForTimeout(200);
    await this.forceChangeDetection();
  }

  async clickPropertiesCancelButton(): Promise<void> {
    await this.forceChangeDetection();
    const cancelBtn = this.page.locator(`${SELECTOR_editorCancelButton}, ${SELECTOR_propertiesCancelButton}`).first();
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toBeEnabled();
    await cancelBtn.click({force: true});
  }

  async renameElement(oldName: string, newName: string): Promise<void> {
    await this.dbClickShape(oldName);
    const nameInput = this.page.locator(FIELD_name);
    await nameInput.fill(newName);
    await this.clickSaveButton();
  }

  async closeSidebar(): Promise<void> {
    const closeBtn = this.page.locator(SIDEBAR_CLOSE_BUTTON);
    if (await closeBtn.isVisible()) {
      await closeBtn.click({force: true});
    }
  }

  async forceChangeDetection(): Promise<void> {
    await this.page.evaluate(() => {
      const ng = (window as any)['ng'];
      const doc = document;
      if (ng && doc) {
        const app = ng.getComponent(doc.querySelector('ame-root'));
        if (app) ng.applyChanges(app);
      }
    });
  }

  async loadModel(rdfString: string): Promise<void> {
    await this.page.evaluate(rdf => {
      return new Promise((resolve, reject) => {
        const fileHandlingService = (window as any)['angular.fileHandlingService'];
        if (!fileHandlingService) {
          reject(new Error('fileHandlingService not available on window'));
          return;
        }
        fileHandlingService.loadModel(rdf).subscribe({
          next: () => resolve(true),
          error: (err: any) => reject(err),
          complete: () => resolve(true),
        });
      });
    }, rdfString);

    await this.page
      .locator('ame-loading-screen')
      .waitFor({state: 'detached', timeout: 20000})
      .catch(() => {});
    await expect(this.page.locator('#graph')).toBeVisible({timeout: 20000});
  }

  async getUpdatedRDF(): Promise<string> {
    return this.page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const modelService = (window as any)['angular.modelService'];
        if (!modelService) return resolve('');
        modelService.synchronizeModelToRdf().subscribe({
          next: () => {
            const loadedFilesService = (window as any)['angular.LoadedFilesService'];
            const rdfService = (window as any)['angular.rdfService'];
            const modelContent = loadedFilesService?.currentLoadedFile?.rdfModel;
            if (rdfService && modelContent) {
              resolve(rdfService.serializeModel(modelContent));
            } else {
              resolve('');
            }
          },
          error: (err: any) => reject(err),
        });
      });
    });
  }

  async getAspect(): Promise<any> {
    return this.page.evaluate(() => {
      const loadedFilesService = (window as any)['angular.LoadedFilesService'];
      const file = loadedFilesService?.currentLoadedFile;
      if (!file) return null;
      const aspect = file.aspect;
      if (!aspect) return null;

      const serialize = (obj: any, seen = new WeakSet()): any => {
        if (!obj || typeof obj !== 'object') return obj;
        if (seen.has(obj)) return {name: obj.name, aspectModelUrn: obj.aspectModelUrn};
        seen.add(obj);

        if (Array.isArray(obj)) {
          return obj.map(item => serialize(item, seen));
        }

        const res: any = {};
        if (obj.name !== undefined) res.name = obj.name;
        if (obj.aspectModelUrn !== undefined) res.aspectModelUrn = obj.aspectModelUrn;
        if (typeof obj.getPreferredName === 'function') {
          res.preferredName = obj.getPreferredName('en') || obj.preferredName;
        } else if (obj.preferredName !== undefined) {
          res.preferredName = obj.preferredName;
        }
        if (typeof obj.getDescription === 'function') {
          res.description = obj.getDescription('en') || obj.description;
        } else if (obj.description !== undefined) {
          res.description = obj.description;
        }
        if (typeof obj.getPreferredNames === 'function') {
          res.preferredNames = obj.getPreferredNames();
        } else if (obj.preferredNames !== undefined) {
          res.preferredNames = obj.preferredNames;
        }
        if (typeof obj.getDescriptions === 'function') {
          res.descriptions = obj.getDescriptions();
        } else if (obj.descriptions !== undefined) {
          res.descriptions = obj.descriptions;
        }

        if (obj.properties) res.properties = serialize(obj.properties, seen);
        if (obj.characteristic) res.characteristic = serialize(obj.characteristic, seen);
        if (obj.dataType) res.dataType = serialize(obj.dataType, seen);
        if (obj.baseCharacteristic) res.baseCharacteristic = serialize(obj.baseCharacteristic, seen);
        if (obj.elementCharacteristic) res.elementCharacteristic = serialize(obj.elementCharacteristic, seen);
        if (obj.constraints) res.constraints = serialize(obj.constraints, seen);
        if (obj.operations) res.operations = serialize(obj.operations, seen);
        if (obj.events) res.events = serialize(obj.events, seen);
        if (obj.input) res.input = serialize(obj.input, seen);
        if (obj.output) res.output = serialize(obj.output, seen);
        if (obj.parameters) res.parameters = serialize(obj.parameters, seen);
        if (obj.left) res.left = serialize(obj.left, seen);
        if (obj.right) res.right = serialize(obj.right, seen);
        if (obj.unit) res.unit = serialize(obj.unit, seen);
        if (obj.values) res.values = serialize(obj.values, seen);
        if (obj.value) res.value = serialize(obj.value, seen);
        if (obj.defaultValue) res.defaultValue = serialize(obj.defaultValue, seen);
        if (typeof obj.isAnonymous === 'function') res.isAnonymous = obj.isAnonymous();

        return res;
      };

      return serialize(aspect);
    });
  }

  async shapeExists(name: string, shouldExist = true): Promise<void> {
    const cell = this.getHTMLCell(name);
    if (shouldExist) {
      await expect(cell).toBeAttached({timeout: 10000});
    } else {
      await expect(cell).toHaveCount(0, {timeout: 10000});
    }
  }

  async clickAddShapePlusIcon(name: string): Promise<void> {
    await this.page.evaluate(shapeName => {
      const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
      const graph = maxgraphAttributeService?.graph;
      if (!graph) throw new Error('Graph not available');
      const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
      const found = cells.find(
        (c: any) =>
          c &&
          (c.id === shapeName ||
            c.getAttribute?.('name') === shapeName ||
            c.value?.getAttribute?.('name') === shapeName ||
            c.getMetaModelElement?.()?.element?.name === shapeName),
      );
      if (!found) throw new Error(`Shape ${shapeName} not found`);
      graph.selectCellForEvent(found, new MouseEvent('click'));
      const plusIcon = found.overlays?.find((o: any) => o.verticalAlign === 'bottom' && !o.offset?.x);
      if (!plusIcon) throw new Error('Add Shape Overlay not found');
      plusIcon.fireEvent({name: 'click', isConsumed: () => false, getName: () => 'click'});
    }, name);
  }

  async clickAddInputShapeIcon(name: string): Promise<void> {
    await this.page.evaluate(shapeName => {
      const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
      const graph = maxgraphAttributeService?.graph;
      const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
      const found = cells.find(
        (c: any) =>
          c &&
          (c.id === shapeName ||
            c.getAttribute?.('name') === shapeName ||
            c.value?.getAttribute?.('name') === shapeName ||
            c.getMetaModelElement?.()?.element?.name === shapeName),
      );
      if (!found) throw new Error(`Shape ${shapeName} not found`);
      graph.selectCellForEvent(found, new MouseEvent('click'));
      const icon = found.overlays?.find((o: any) => o.tooltip === 'Add Input Property');
      if (!icon) throw new Error('Add Input Shape Overlay not found');
      icon.fireEvent({name: 'click', isConsumed: () => false, getName: () => 'click'});
    }, name);
  }

  async clickAddOutputShapeIcon(name: string): Promise<void> {
    await this.page.evaluate(shapeName => {
      const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
      const graph = maxgraphAttributeService?.graph;
      const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
      const found = cells.find(
        (c: any) =>
          c &&
          (c.id === shapeName ||
            c.getAttribute?.('name') === shapeName ||
            c.value?.getAttribute?.('name') === shapeName ||
            c.getMetaModelElement?.()?.element?.name === shapeName),
      );
      if (!found) throw new Error(`Shape ${shapeName} not found`);
      graph.selectCellForEvent(found, new MouseEvent('click'));
      const icon = found.overlays?.find((o: any) => o.tooltip === 'Add Output Property');
      if (!icon) throw new Error('Add Output Shape Overlay not found');
      icon.fireEvent({name: 'click', isConsumed: () => false, getName: () => 'click'});
    }, name);
  }

  async clickAddLeftShapeIcon(name: string): Promise<void> {
    await this.page.evaluate(shapeName => {
      const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
      const graph = maxgraphAttributeService?.graph;
      const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
      const found = cells.find(
        (c: any) =>
          c &&
          (c.id === shapeName ||
            c.getAttribute?.('name') === shapeName ||
            c.value?.getAttribute?.('name') === shapeName ||
            c.getMetaModelElement?.()?.element?.name === shapeName),
      );
      if (!found) throw new Error(`Shape ${shapeName} not found`);
      graph.selectCellForEvent(found, new MouseEvent('click'));
      const icon = found.overlays?.find((o: any) => o.tooltip === 'Add Right Characteristic');
      if (!icon) throw new Error('Add Left Shape Overlay not found');
      icon.fireEvent({name: 'click', isConsumed: () => false, getName: () => 'click'});
    }, name);
  }

  async clickAddRightShapeIcon(name: string): Promise<void> {
    await this.page.evaluate(shapeName => {
      const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
      const graph = maxgraphAttributeService?.graph;
      const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
      const found = cells.find(
        (c: any) =>
          c &&
          (c.id === shapeName ||
            c.getAttribute?.('name') === shapeName ||
            c.value?.getAttribute?.('name') === shapeName ||
            c.getMetaModelElement?.()?.element?.name === shapeName),
      );
      if (!found) throw new Error(`Shape ${shapeName} not found`);
      graph.selectCellForEvent(found, new MouseEvent('click'));
      const icon = found.overlays?.find((o: any) => o.tooltip === 'Add Left Characteristic');
      if (!icon) throw new Error('Add Right Shape Overlay not found');
      icon.fireEvent({name: 'click', isConsumed: () => false, getName: () => 'click'});
    }, name);
  }

  async clickAddTraitPlusIcon(characteristicName: string): Promise<void> {
    await this.page.evaluate(shapeName => {
      const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
      const graph = maxgraphAttributeService?.graph;
      const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
      const found = cells.find(
        (c: any) =>
          c &&
          (c.id === shapeName ||
            c.getAttribute?.('name') === shapeName ||
            c.value?.getAttribute?.('name') === shapeName ||
            c.getMetaModelElement?.()?.element?.name === shapeName),
      );
      if (!found) throw new Error(`Shape ${shapeName} not found`);
      graph.selectCellForEvent(found, new MouseEvent('click'));
      const icon = found.overlays?.find((o: any) => o.verticalAlign === 'top' && o.offset?.x > 0);
      if (!icon) throw new Error('Add Constraint Overlay not found');
      icon.fireEvent({name: 'click', isConsumed: () => false, getName: () => 'click'});
    }, characteristicName);
  }

  async shapesConnected(sourceShapeName: string, targetShapeName: string): Promise<boolean> {
    return this.page.evaluate(
      ({source, target}) => {
        const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
        const graph = maxgraphAttributeService?.graph;
        if (!graph) return false;
        const cells = graph.getChildCells(graph.getDefaultParent(), true, false);
        const sourceCell = cells.find((c: any) => c && (c.id === source || c.getAttribute?.('name') === source));
        const targetCell = cells.find((c: any) => c && (c.id === target || c.getAttribute?.('name') === target));
        if (!sourceCell || !targetCell) return false;
        return graph.getOutgoingEdges(sourceCell, null).some((edge: any) => edge.target === targetCell);
      },
      {source: sourceShapeName, target: targetShapeName},
    );
  }

  async startModelling(setupRoutes = true): Promise<void> {
    await this.visitDefault(setupRoutes);
    // Load default aspect model
    await this.page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const fileHandlingService = (window as any)['angular.fileHandlingService'];
        const defaultModel = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.2.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#> .

:AspectDefault a samm:Aspect ;
    samm:preferredName "AspectDefault"@en ;
    samm:description "AspectDefault"@en ;
    samm:properties ( :property1 ) ;
    samm:operations () ;
    samm:events () .

:property1 a samm:Property ;
    samm:preferredName "Property1"@en ;
    samm:description "Property1"@en ;
    samm:characteristic :Characteristic1 .

:Characteristic1 a samm:Characteristic ;
    samm:preferredName "Characteristic1"@en ;
    samm:description "Characteristic1"@en ;
    samm:dataType xsd:string .`;
        fileHandlingService.loadModel(defaultModel).subscribe({
          next: () => resolve(true),
          error: (err: any) => reject(err),
          complete: () => resolve(true),
        });
      });
    });
    await this.page
      .locator('ame-loading-screen')
      .waitFor({state: 'detached', timeout: 20000})
      .catch(() => {});
    await expect(this.page.locator('#graph')).toBeVisible({timeout: 20000});
  }

  async selectDropdown(triggerSelector: string | Locator, optionText: string): Promise<void> {
    const trigger = typeof triggerSelector === 'string' ? this.page.locator(triggerSelector) : triggerSelector;
    await trigger.click({force: true});
    const option = this.page.locator('mat-option').filter({hasText: optionText}).first();
    await expect(option).toBeVisible();
    await option.click({force: true});
    await this.page
      .locator('mat-option')
      .waitFor({state: 'detached'})
      .catch(() => {});
  }

  async selectAutocomplete(inputSelector: string | Locator, textToType: string, optionText?: string): Promise<void> {
    const input = typeof inputSelector === 'string' ? this.page.locator(inputSelector) : inputSelector;
    await input.click({force: true});
    await input.fill('');
    await input.pressSequentially(textToType, {delay: 30});
    const targetText = optionText || textToType;
    const option = this.page.locator('mat-option').filter({hasText: targetText}).first();
    await expect(option).toBeVisible();
    await option.click({force: true});
    await this.page
      .locator('mat-option')
      .waitFor({state: 'detached'})
      .catch(() => {});
  }

  async openSettings(nodeRegexOrText?: RegExp | string): Promise<void> {
    const {SELECTOR_settingsButton} = await import('./constants');
    await this.page.locator(SELECTOR_settingsButton).click({force: true});
    await expect(this.page.locator('mat-dialog-container')).toBeVisible();
    if (nodeRegexOrText) {
      const node = this.page.locator('.settings__node').filter({hasText: nodeRegexOrText}).first();
      await expect(node).toBeVisible();
      await node.click({force: true});
    }
  }

  async closeDialog(buttonSelector?: string | Locator): Promise<void> {
    if (buttonSelector) {
      const btn = typeof buttonSelector === 'string' ? this.page.locator(buttonSelector) : buttonSelector;
      await btn.click({force: true});
    }
    await expect(this.page.locator('mat-dialog-container')).toHaveCount(0);
  }
}
