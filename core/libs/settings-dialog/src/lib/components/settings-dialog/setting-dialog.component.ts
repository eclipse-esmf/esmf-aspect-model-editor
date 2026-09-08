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
import {LoadedFilesService} from '@ame/cache';
import {MaxGraphService, ShapeLanguageRemover} from '@ame/max-graph';
import {AlertService, LoadingScreenService, TitleService} from '@ame/shared';
import {FlatTreeControl} from '@angular/cdk/tree';
import {NgClass} from '@angular/common';
import {Component, inject} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatTree, MatTreeFlatDataSource, MatTreeFlattener, MatTreeNode, MatTreeNodeDef, MatTreeNodeToggle} from '@angular/material/tree';
import {RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import * as locale from 'locale-codes';
import {NamespaceConfiguration} from '../../model';
import {SammLanguageSettingsService, SettingsFormService} from '../../services';
import {LanguageSettingsComponent} from '../model-configuration/language-settings/language-settings.component';
import {NamespaceSettingsComponent} from '../model-configuration/namespace-settings/namespace-settings.component';
import {AutomatedWorkflowComponent} from '../system-configuration/automated-workflow/automated-workflow.component';
import {EditorConfigurationComponent} from '../system-configuration/editor-configuration/editor-configuration.component';
import {HeaderCopyrightComponent} from '../system-configuration/header-copyright/header-copyright.component';

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
    name: 'settingsDialog.node.systemConfiguration',
    type: NodeNames.CONFIGURATION,
    id: 'systemConfiguration',
    children: [
      {
        name: 'settingsDialog.subNode.automatedWorkflow',
        type: NodeNames.AUTOMATED_WORKFLOW,
        id: 'automatedWorkflow',
      },
      {
        name: 'settingsDialog.subNode.editor',
        type: NodeNames.EDITOR,
        id: 'editorConfiguration',
      },
    ],
  },
  {
    name: 'settingsDialog.node.modelConfiguration',
    type: NodeNames.MODEL_CONFIGURATION,
    id: 'modelConfiguration',
    children: [
      {
        name: 'settingsDialog.subNode.languages',
        type: NodeNames.LANGUAGES,
        id: 'languageConfiguration',
      },
      {
        name: 'settingsDialog.subNode.namespaces',
        type: NodeNames.NAMESPACES,
        id: 'namespaceConfiguration',
      },
      {
        name: 'settingsDialog.subNode.copyright',
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
  imports: [
    MatDialogTitle,
    MatDialogClose,
    MatIconButton,
    MatIconModule,
    MatDialogContent,
    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    NgClass,
    AutomatedWorkflowComponent,
    EditorConfigurationComponent,
    LanguageSettingsComponent,
    NamespaceSettingsComponent,
    HeaderCopyrightComponent,
    MatDialogActions,
    MatButton,
    MatTooltip,
    MatTreeNodeToggle,
    TranslocoDirective,
  ],
})
export class SettingDialogComponent {
  private readonly settingDialogComponentMatDialogRef = inject(MatDialogRef<SettingDialogComponent>);
  private readonly formService = inject(SettingsFormService);
  private readonly alertService = inject(AlertService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly sammLangService = inject(SammLanguageSettingsService);
  private readonly shapeLanguageRemover = inject(ShapeLanguageRemover);
  private readonly loadingScreen = inject(LoadingScreenService);
  private readonly titleService = inject(TitleService);
  private readonly loadedFilesService = inject(LoadedFilesService);

  public readonly NodeNames = NodeNames;

  private readonly _transformer = (node: ConfigurationNode, level: number): ConfigurationFlatNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      type: node.type,
      id: node.id,
      level: level,
    };
  };

  readonly treeControl = new FlatTreeControl<ConfigurationFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  readonly treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  readonly dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  selectedNodeType: string | null = NodeNames.AUTOMATED_WORKFLOW;

  get settingsForm() {
    return this.formService.settingsForm;
  }

  get currentLoadedFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor() {
    this.initializeComponent();
  }

  initializeComponent(): void {
    this.dataSource.data = TREE_DATA;
    this.treeControl.expandAll();
    this.formService.initializeForm();
    this.formService.clearLanguagesToRemove();
  }

  hasChild = (_: number, node: ConfigurationFlatNode): boolean => node.expandable;

  onNodeSelected(type: string): void {
    const typeMappings: Record<string, string> = {
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

    this.updateNamespacesIfNeeded(namespaceConfig);
    this.updateNamespaceAndVersion(namespaceConfig);
    this.updateTitleIfNeeded();
  }

  private updateNamespacesIfNeeded(namespaceConfig: NamespaceConfiguration): void {
    const {oldNamespace, newNamespace, rdfModel, oldVersion, newVersion} = namespaceConfig;

    if (oldNamespace !== newNamespace) {
      this.updateAllNamespacesFromCurrentCachedFile(oldNamespace, newNamespace, rdfModel);
    }

    if (oldVersion !== newVersion) {
      this.updateAllNamespacesFromCurrentCachedFile(oldVersion, newVersion, rdfModel);
    }
  }

  private updateAllNamespacesFromCurrentCachedFile(oldValue: string, newValue: string, rdfModel: RdfModel): void {
    const currentCachedFile = this.currentLoadedFile.cachedFile;

    currentCachedFile.updateElementsNamespace(oldValue, newValue);
    const [, version] = this.currentLoadedFile.namespace.split(':');
    this.currentLoadedFile.namespace = `${newValue}:${version}`;
    rdfModel.updatePrefix('', oldValue, newValue);
  }

  private updateNamespaceAndVersion(namespaceConfig: NamespaceConfiguration): void {
    const {newNamespace, newVersion} = namespaceConfig;

    this.updateNamespaceKey(newNamespace, newVersion);
    this.formService.setNamespace(newNamespace);
    this.formService.setVersion(newVersion);
  }

  private updateNamespaceKey(newNamespace: string, newVersion: string): void {
    this.currentLoadedFile.namespace = `${newNamespace}:${newVersion}`;
  }

  private updateTitleIfNeeded(): void {
    this.titleService.updateTitle(this.loadedFilesService.currentLoadedFile.absoluteName);
  }

  openConfirmBox(): void {
    const removedLanguages = this.formService.getLanguagesToBeRemove();

    this.alertService.open({
      data: {
        title: 'Deleting all language related information',
        content: `Click 'Continue' to remove the language${removedLanguages.length > 1 ? 's' : ''} "${removedLanguages
          .map((entry: string) => `${locale.getByTag(entry)?.name || entry} (${locale.getByTag(entry)?.tag || entry})`)
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
    if (this.loadedFilesService.currentLoadedFile?.aspect) {
      const loadingScreen = this.loadingScreen.open({
        title: 'Saving changes',
        content: 'Changing the SAMM languages in application',
      });

      const aspectModelLanguages = this.formService
        .settingsModel()
        .languageConfiguration.aspectModel.map(entry =>
          typeof entry.language === 'object' && entry.language ? entry.language.tag : String(entry.language || ''),
        )
        .filter(Boolean);

      try {
        this.maxgraphService.updateGraph((): void => {
          const languagesToRemove = this.formService.getLanguagesToBeRemove().map((entry: string) => entry);
          this.shapeLanguageRemover.removeUnnecessaryLanguages(languagesToRemove);
        });
      } finally {
        this.sammLangService.setSammLanguageCodes(aspectModelLanguages);
        this.maxgraphService.formatShapes();
        loadingScreen.close();
      }
    }
  }

  isNodeInvalid(node: ConfigurationFlatNode): boolean {
    switch (node.id) {
      case 'automatedWorkflow':
        return this.settingsForm.automatedWorkflow().invalid();
      case 'editorConfiguration':
        return this.settingsForm.editorConfiguration().invalid();
      case 'languageConfiguration':
        return this.settingsForm.languageConfiguration().invalid();
      case 'namespaceConfiguration':
        return this.settingsForm.namespaceConfiguration().invalid();
      case 'copyrightHeaderConfiguration':
        return this.settingsForm.copyrightHeaderConfiguration().invalid();
      case 'systemConfiguration':
        return this.settingsForm.automatedWorkflow().invalid() || this.settingsForm.editorConfiguration().invalid();
      case 'modelConfiguration':
        return (
          this.settingsForm.languageConfiguration().invalid() ||
          this.settingsForm.namespaceConfiguration().invalid() ||
          this.settingsForm.copyrightHeaderConfiguration().invalid()
        );
      default:
        return false;
    }
  }
}
