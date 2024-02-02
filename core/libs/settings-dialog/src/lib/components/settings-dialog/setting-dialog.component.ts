/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {Component} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {SammLanguageSettingsService, SettingsFormService} from '../../services';
import * as locale from 'locale-codes';
import {AlertService, LoadingScreenService, LogService} from '@ame/shared';
import {MxGraphAttributeService, MxGraphService, MxGraphShapeSelectorService, ShapeLanguageRemover} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {NamespaceConfirmationModalComponent} from '../model-configuration/namespace-confirmation-modal/namespace-confirmation-modal.component';
import {finalize} from 'rxjs';
import {FormGroup} from '@angular/forms';

enum NodeNames {
  CONFIGURATION = 'System Configuration',
  MODEL_CONFIGURATION = 'Model Configuration',
  AUTOMATED_WORKFLOW = 'Automated Workflow',
  EDITOR = 'Editor',
  COPYRIGHT = 'Header/Copyright',
  LANGUAGES = 'Languages',
  NAMESPACES = 'Namespaces',
}

interface ConfigurationNode {
  id: string;
  name: string;
  type: NodeNames;
  children?: ConfigurationNode[];
}

interface ConfigurationFlatNode {
  id: string;
  expandable: boolean;
  name: string;
  type: string;
  level: number;
}

const TREE_DATA: ConfigurationNode[] = [
  {
    name: 'SETTINGS_DIALOG.NODE.SYSTEM_CONFIGURATION',
    type: NodeNames.CONFIGURATION,
    id: 'systemConfiguration',
    children: [
      {
        name: 'SETTINGS_DIALOG.SUB_NODE.AUTOMATED_WORKFLOW',
        type: NodeNames.AUTOMATED_WORKFLOW,
        id: 'automatedWorkflow',
      },
      {
        name: 'SETTINGS_DIALOG.SUB_NODE.EDITOR',
        type: NodeNames.EDITOR,
        id: 'editorConfiguration',
      },
    ],
  },
  {
    name: 'SETTINGS_DIALOG.NODE.MODEL_CONFIGURATION',
    type: NodeNames.MODEL_CONFIGURATION,
    id: 'modelConfiguration',
    children: [
      {
        name: 'SETTINGS_DIALOG.SUB_NODE.LANGUAGES',
        type: NodeNames.LANGUAGES,
        id: 'languageConfiguration',
      },
      {
        name: 'SETTINGS_DIALOG.SUB_NODE.NAMESPACES',
        type: NodeNames.NAMESPACES,
        id: 'namespaceConfiguration',
      },
      {
        name: 'SETTINGS_DIALOG.SUB_NODE.COPYRIGHT',
        type: NodeNames.COPYRIGHT,
        id: 'copyrightHeaderConfiguration',
      },
    ],
  },
];

@Component({
  selector: 'ame-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.scss'],
})
export class SettingDialogComponent {
  readonly NodeNames = NodeNames;

  private _transformer = (node: ConfigurationNode, level: number): ConfigurationFlatNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      type: node.type,
      id: node.id,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ConfigurationFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  selectedNodeType: string | null = NodeNames.AUTOMATED_WORKFLOW;

  get settingsForm(): FormGroup {
    return this.formService.getForm();
  }

  constructor(
    private matDialog: MatDialog,
    private settingDialogComponentMatDialogRef: MatDialogRef<SettingDialogComponent>,
    private formService: SettingsFormService,
    private alertService: AlertService,
    private logService: LogService,
    private modelService: ModelService,
    private mxGraphService: MxGraphService,
    private sammLangService: SammLanguageSettingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private loadingScreen: LoadingScreenService
  ) {
    this.initializeComponent();
  }

  initializeComponent() {
    this.dataSource.data = TREE_DATA;
    this.treeControl.expandAll();
    this.formService.initializeForm();
    this.formService.clearLanguagesToRemove();
  }

  hasChild = (_: number, node: ConfigurationFlatNode) => node.expandable;

  onNodeSelected(type: string): void {
    const typeMappings = {
      [NodeNames.CONFIGURATION]: NodeNames.AUTOMATED_WORKFLOW,
      [NodeNames.MODEL_CONFIGURATION]: NodeNames.LANGUAGES,
    };

    this.selectedNodeType = typeMappings[type] || type;
  }

  onClose(): void {
    this.settingDialogComponentMatDialogRef.close();
  }

  onOk(): void {
    this.applySettings();
    this.onClose();
  }

  onCancel(): void {
    this.onClose();
  }

  applySettings(): void {
    this.formService.updateSettings();
    this.handleLanguageRemoval();
    this.handleNamespaceChange();
  }

  handleLanguageRemoval(): void {
    if (this.formService.getLanguagesToBeRemove().length > 0) {
      this.openConfirmBox();
    } else {
      this.submitAndCloseDialog();
    }
  }

  handleNamespaceChange(): void {
    if (!this.formService.hasNamespaceChanged()) return;

    const namespaceConfig = this.formService.getNamespaceConfiguration();
    this.matDialog
      .open(NamespaceConfirmationModalComponent, namespaceConfig)
      .afterClosed()
      .pipe(
        finalize(() => {
          this.formService.setNamespace(namespaceConfig.data.newNamespace);
          this.formService.setVersion(namespaceConfig.data.newVersion);
        })
      )
      .subscribe();
  }

  openConfirmBox(): void {
    const removedLanguages = this.formService.getLanguagesToBeRemove();

    this.alertService.open({
      data: {
        title: 'Deleting all language related information',
        content: `Click 'Continue' to remove the language${removedLanguages.length > 1 ? 's' : ''} "${removedLanguages
          .map((entry: string) => `${locale.getByTag(entry).name} (${locale.getByTag(entry).tag})`)
          .join(', ')}" from the settings and delete all preferredNames and descriptions in ${
          removedLanguages.length > 1 ? 'these SAMM languages' : 'this SAMM language'
        }.`,
        rightButtonText: 'Continue',
        leftButtonText: 'Cancel',
        rightButtonAction: () => {
          this.submitAndCloseDialog();
        },
        hasLeftButton: true,
        hasRightButton: true,
      },
    });
  }

  submitAndCloseDialog(): void {
    if (this.modelService.getLoadedAspectModel().aspect !== null) {
      const loadingScreen = this.loadingScreen.open({
        title: 'Saving changes',
        content: 'Changing the SAMM languages in application',
      });

      const aspectModelLanguages = this.formService
        .getForm()
        .get('languageConfiguration')
        .get('aspectModel')
        .value.map(entry => entry.language.tag);

      try {
        this.mxGraphService.updateGraph((): void => {
          new ShapeLanguageRemover(
            this.formService.getLanguagesToBeRemove().map((entry: string) => entry),
            this.mxGraphService,
            this.mxGraphShapeSelectorService,
            this.logService,
            this.mxGraphAttributeService
          ).removeUnnecessaryLanguages();
        });
      } finally {
        this.sammLangService.setSammLanguageCodes(aspectModelLanguages);
        this.mxGraphService.formatShapes();
        loadingScreen.close();
      }
    }
  }

  isNodeInvalid(node: ConfigurationFlatNode): boolean {
    return this.settingsForm.get(node.id)?.invalid || false;
  }
}
