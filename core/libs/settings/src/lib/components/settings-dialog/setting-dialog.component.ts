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
import {GraphSettingsPort, ModelSessionFacade, SammLanguageSettingsService} from '@ame/domain';
import {AlertService, DialogCloseButtonComponent, DialogCloseRequestHandler, LoadingScreenService, TitleService} from '@ame/shared';
import {Component, computed, ElementRef, inject, signal, viewChildren} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';
import {RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoDirective, TranslocoService} from '@jsverse/transloco';
import * as locale from 'locale-codes';
import {NamespaceConfiguration} from '../../model';
import {SettingsFormService} from '../../services';
import {LanguageSettingsComponent} from '../model-configuration/language-settings/language-settings.component';
import {NamespaceSettingsComponent} from '../model-configuration/namespace-settings/namespace-settings.component';
import {AutomatedWorkflowComponent} from '../system-configuration/automated-workflow/automated-workflow.component';
import {EditorConfigurationComponent} from '../system-configuration/editor-configuration/editor-configuration.component';
import {HeaderCopyrightComponent} from '../system-configuration/header-copyright/header-copyright.component';

export type SettingsSectionId =
  'automatedWorkflow' | 'editorConfiguration' | 'languageConfiguration' | 'namespaceConfiguration' | 'copyrightHeaderConfiguration';

export interface SettingsSection {
  id: SettingsSectionId;
  /** i18n key of the section title. */
  name: string;
  /** i18n key of the short description shown in the section header. */
  description: string;
  /** i18n keys of the labels inside the section; used by the settings search. */
  keywords: string[];
  /** Only meaningful with a loaded model. */
  requiresModel?: boolean;
  /** Offers "Reset to defaults". */
  resettable?: boolean;
}

export interface SettingsGroup {
  id: 'systemConfiguration' | 'modelConfiguration';
  name: string;
  hint: string;
  icon: string;
  sections: SettingsSection[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: 'systemConfiguration',
    name: 'settingsDialog.node.systemConfiguration',
    hint: 'settingsDialog.scope.applicationHint',
    icon: 'tune',
    sections: [
      {
        id: 'automatedWorkflow',
        name: 'settingsDialog.subNode.automatedWorkflow',
        description: 'settingsDialog.description.automatedWorkflow',
        keywords: [
          'settingsDialog.configuration.autoSave',
          'settingsDialog.configuration.waitingPeriod',
          'settingsDialog.configuration.autoValidation',
          'settingsDialog.configuration.autoFormatting',
        ],
        resettable: true,
      },
      {
        id: 'editorConfiguration',
        name: 'settingsDialog.subNode.editor',
        description: 'settingsDialog.description.editor',
        keywords: [
          'settingsDialog.configuration.usingHierarchicalLayout',
          'settingsDialog.configuration.displayDisambiguationLabel',
          'settingsDialog.configuration.darkMode',
          'settingsDialog.configuration.elementOrder',
          'settingsDialog.configuration.restoreSession',
        ],
        resettable: true,
      },
    ],
  },
  {
    id: 'modelConfiguration',
    name: 'settingsDialog.node.modelConfiguration',
    hint: 'settingsDialog.scope.modelHint',
    icon: 'description',
    sections: [
      {
        id: 'languageConfiguration',
        name: 'settingsDialog.subNode.languages',
        description: 'settingsDialog.description.languages',
        keywords: [
          'settingsDialog.languages.userInterface',
          'settingsDialog.languages.aspectModel',
          'settingsDialog.languages.addLanguage',
        ],
      },
      {
        id: 'namespaceConfiguration',
        name: 'settingsDialog.subNode.namespaces',
        description: 'settingsDialog.description.namespaces',
        keywords: [
          'settingsDialog.namespaces.value',
          'settingsDialog.namespaces.version',
          'settingsDialog.namespaces.name',
          'settingsDialog.namespaces.sammVersion',
        ],
        requiresModel: true,
      },
      {
        id: 'copyrightHeaderConfiguration',
        name: 'settingsDialog.subNode.copyright',
        description: 'settingsDialog.description.copyright',
        keywords: [],
      },
    ],
  },
];

const ALL_SECTIONS = SETTINGS_GROUPS.flatMap(group => group.sections);
export const SETTINGS_LAST_SECTION_KEY = 'ame.settings.lastSection';

@Component({
  selector: 'ame-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.scss'],
  imports: [
    DialogCloseButtonComponent,
    MatDialogTitle,
    MatIconButton,
    MatIconModule,
    MatDialogContent,
    MatFormField,
    MatInput,
    MatPrefix,
    MatSuffix,
    AutomatedWorkflowComponent,
    EditorConfigurationComponent,
    LanguageSettingsComponent,
    NamespaceSettingsComponent,
    HeaderCopyrightComponent,
    MatDialogActions,
    MatButton,
    MatTooltip,
    TranslocoDirective,
  ],
})
export class SettingDialogComponent implements DialogCloseRequestHandler {
  private readonly settingDialogComponentMatDialogRef = inject(MatDialogRef<SettingDialogComponent>);
  private readonly formService = inject(SettingsFormService);
  private readonly alertService = inject(AlertService);
  private readonly maxGraphSettingsService = inject(GraphSettingsPort, {optional: true});
  private readonly sammLangService = inject(SammLanguageSettingsService);
  private readonly loadingScreen = inject(LoadingScreenService);
  private readonly titleService = inject(TitleService);
  private readonly loadedFilesService = inject(ModelSessionFacade);
  private readonly transloco = inject(TranslocoService);

  private readonly treeItems = viewChildren<ElementRef<HTMLElement>>('treeItem');

  readonly groups = SETTINGS_GROUPS;
  readonly selectedSectionId = signal<SettingsSectionId>(this.restoreLastSection());
  readonly selectedSection = computed(() => ALL_SECTIONS.find(section => section.id === this.selectedSectionId()) ?? ALL_SECTIONS[0]);
  readonly searchTerm = signal('');

  /** Groups and sections matching the search term (title, description or labels inside the section). */
  readonly visibleGroups = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.groups;

    return this.groups
      .map(group => {
        const groupMatches = this.translate(group.name).toLowerCase().includes(term);
        const sections = groupMatches ? group.sections : group.sections.filter(section => this.sectionMatches(section, term));
        return {...group, sections};
      })
      .filter(group => group.sections.length > 0);
  });

  readonly visibleSections = computed(() => this.visibleGroups().flatMap(group => group.sections));

  get settingsForm() {
    return this.formService.settingsForm;
  }

  get currentLoadedFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  get isDirty(): boolean {
    return this.formService.isDirty();
  }

  get hasLoadedModel(): boolean {
    return this.formService.hasLoadedModel();
  }

  get currentFileName(): string {
    return this.currentLoadedFile?.name || this.currentLoadedFile?.absoluteName?.split(':').pop() || '';
  }

  /** The first section with validation errors, used for the error summary next to the buttons. */
  get firstInvalidSection(): SettingsSection | undefined {
    return ALL_SECTIONS.find(section => this.isSectionInvalid(section.id));
  }

  constructor() {
    this.initializeComponent();
  }

  initializeComponent(): void {
    this.formService.initializeForm();
    this.formService.clearLanguagesToRemove();
  }

  selectSection(id: SettingsSectionId, focus = false): void {
    this.selectedSectionId.set(id);
    try {
      localStorage.setItem(SETTINGS_LAST_SECTION_KEY, id);
    } catch {
      // Storage may be unavailable (e.g. private mode); remembering the section is optional.
    }

    if (focus) {
      queueMicrotask(() =>
        this.treeItems()
          .find(item => item.nativeElement.dataset['sectionId'] === id)
          ?.nativeElement.focus(),
      );
    }
  }

  /** Arrow keys, Home and End move through the visible sections (WAI-ARIA tree pattern). */
  onTreeKeydown(event: KeyboardEvent): void {
    const sections = this.visibleSections();
    if (!sections.length) return;

    const index = Math.max(
      sections.findIndex(section => section.id === this.selectedSectionId()),
      0,
    );
    const target = {
      ArrowDown: sections[Math.min(index + 1, sections.length - 1)],
      ArrowUp: sections[Math.max(index - 1, 0)],
      Home: sections[0],
      End: sections[sections.length - 1],
    }[event.key];

    if (target) {
      event.preventDefault();
      this.selectSection(target.id, true);
    }
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    const sections = this.visibleSections();
    if (sections.length && !sections.some(section => section.id === this.selectedSectionId())) {
      this.selectSection(sections[0].id);
    }
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  resetSelectedSection(): void {
    const id = this.selectedSectionId();
    if (id === 'automatedWorkflow' || id === 'editorConfiguration') {
      this.formService.resetSection(id);
    }
  }

  /** (x) and Escape: ask before unsaved changes get lost. */
  requestClose(): void {
    if (!this.isDirty) {
      this.onClose();
      return;
    }

    this.alertService.open({
      data: {
        title: this.translate('settingsDialog.unsavedChanges.title'),
        content: this.translate('settingsDialog.unsavedChanges.content'),
        leftButtonText: this.translate('settingsDialog.unsavedChanges.keepEditing'),
        rightButtonText: this.translate('settingsDialog.unsavedChanges.discard'),
        rightButtonAction: () => this.onClose(),
        hasLeftButton: true,
        hasRightButton: true,
      },
    });
  }

  onClose(): void {
    this.settingDialogComponentMatDialogRef.close();
  }

  onOk(): void {
    this.applySettings(() => this.onClose());
  }

  /** The Cancel button is an explicit decision to discard the changes. */
  onCancel(): void {
    this.onClose();
  }

  applySettings(onConfirmed?: () => void): void {
    this.formService.updateSettings();
    this.handleLanguageRemoval(onConfirmed);
    this.handleNamespaceChange();
    this.formService.markPristine();
  }

  handleLanguageRemoval(onConfirmed?: () => void): void {
    if (this.formService.getLanguagesToBeRemove().length > 0) {
      this.openConfirmBox(onConfirmed);
    } else {
      this.submitAndCloseDialog();
      onConfirmed?.();
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

  openConfirmBox(onConfirmed?: () => void): void {
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
          onConfirmed?.();
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
        this.maxGraphSettingsService?.updateGraph((): void => {
          const languagesToRemove = this.formService.getLanguagesToBeRemove().map((entry: string) => entry);
          this.maxGraphSettingsService?.removeUnnecessaryLanguages(languagesToRemove);
        });
      } finally {
        this.sammLangService.setSammLanguageCodes(aspectModelLanguages);
        this.maxGraphSettingsService?.formatShapes();
        this.formService.clearLanguagesToRemove();
        loadingScreen.close();
      }
    } else {
      this.formService.clearLanguagesToRemove();
    }
  }

  isSectionInvalid(id: SettingsSectionId): boolean {
    return this.settingsForm[id]().invalid();
  }

  isGroupInvalid(group: SettingsGroup): boolean {
    return group.sections.some(section => this.isSectionInvalid(section.id));
  }

  private sectionMatches(section: SettingsSection, term: string): boolean {
    return [section.name, section.description, ...section.keywords].some(key => this.translate(key).toLowerCase().includes(term));
  }

  private translate(key: string): string {
    return this.transloco.translate(key);
  }

  private restoreLastSection(): SettingsSectionId {
    try {
      const stored = localStorage.getItem(SETTINGS_LAST_SECTION_KEY);
      return ALL_SECTIONS.find(section => section.id === stored)?.id ?? ALL_SECTIONS[0].id;
    } catch {
      return ALL_SECTIONS[0].id;
    }
  }
}
