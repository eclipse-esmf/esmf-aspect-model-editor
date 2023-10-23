/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

// Editor toolbar
export const SELECTOR_tbDeleteButton = '[data-cy="tbDeleteButton"]';
export const SELECTOR_tbConnectButton = '[data-cy="tbConnectButton"]';
export const SELECTOR_modalsDropdown = '[data-cy="models-drop-down"]';
export const SELECTOR_tbLoadButton = '[data-cy="tbLoadButton"]';
export const SELECTOR_tbSaveButton = '[data-cy="tbSaveButton"]';
export const SELECTOR_tbValidateButton = '[data-cy="tbValidateButton"]';
export const SELECTOR_tbGenerateDocumentButton = '[data-cy="tbGenerateDocumentButton"]';
export const SELECTOR_tbPrintButton = '[data-cy="tbPrintButton"]';
export const SELECTOR_tbOpenApiButton = '[data-cy="tbOpenApiButton"]';
export const SELECTOR_tbCollapseToggle = '[data-cy="collapseExpandToggle"]';

// Editor toolbar "save" menu
export const SELECTOR_tbSaveMenuExportAspectModelButton = '[data-cy="tbSaveMenuExportAspectModelButton"]';
export const SELECTOR_tbSaveMenuExportNamespaceButton = '[data-cy="tbSaveMenuExportNamespaceButton"]';
export const SELECTOR_tbSaveMenuCopyToClipboardButton = '[data-cy="tbSaveMenuCopyToClipboardButton"]';
export const SELECTOR_tbSaveMenuSaveToWorkspaceButton = '[data-cy="tbSaveMenuSaveToWorkspaceButton"]';

// Workspace (sidebar)
export const SELECTOR_namespace = '[data-cy="namespace"]';
export const SELECTOR_namespaceName = '[data-cy="namespaceName"]';
export const SELECTOR_namespaceFile = '[data-cy="namespaceFile"]';
export const SELECTOR_namespaceFileName = '[data-cy="namespaceFileName"]';
export const SELECTOR_namespaceFileMenuButton = '[data-cy="namespaceFileMenuButton"]';
export const SELECTOR_fileMenuFindElements = '[data-cy="fileMenuFindElements"]';
export const SELECTOR_fileMenuDeleteButton = '[data-cy="fileMenuDeleteButton"]';
export const SELECTOR_fileMenuLoadAspectModelButton = '[data-cy="fileMenuLoadAspectModelButton"]';
export const SELECTOR_fileMenuCopyToClipboardButton = '[data-cy="fileMenuCopyToClipboardButton"]';

// Settings modal
export const SELECTOR_settingsModalCloseButton = '[data-cy="settingsModalCloseButton"]';

// Settings -> Namespace
export const SELECTOR_namespaceTabValueInput = '[data-cy="namespaceTabValueInput"]';
export const SELECTOR_namespaceTabVersionInput = '[data-cy="namespaceTabVersionInput"]';
export const SELECTOR_namespaceTabFileNameInput = '[data-cy="namespaceTabFileNameInput"]';
export const SELECTOR_namespaceTabSammVersionInput = '[data-cy="namespaceTabSammVersionInput"]';
export const SELECTOR_namespaceTabSaveButton = '[data-cy="namespaceTabSaveButton"]';

export const SELECTOR_addEntityValue = '[data-cy="addNewEntityValueButton"]';
export const SELECTOR_clearEntityValueButton = '[data-cy="clear-entityValue-button"]';
export const SELECTOR_clearElementCharacteristicButton = '[data-cy="clear-element-characteristic-button"]';
export const SELECTOR_clearLeftCharacteristicButton = '[data-cy="clear-left-button"]';
export const SELECTOR_clearRightCharacteristicButton = '[data-cy="clear-right-button"]';
export const SELECTOR_entitySaveButton = '[data-cy="entitySaveButton"]';
export const SELECTOR_openNamespacesButton = '[data-cy="open-namespaces"]';
export const SELECTOR_closeSidebarButton = '[data-cy="sidebar-close"]';

export const SELECTOR_settingsButton = '[data-cy="settings-button"]';
export const SELECTOR_notificationsButton = '[data-cy="notifications-button"]';
export const SELECTOR_helpButton = '[data-cy="help-button"]';

// Export namespace
export const SELECTOR_enNamespaceList = '[data-cy="enNamespaceList"]';

// Notifications
export const SELECTOR_notificationsDialogCloseButton = '[data-cy="close-notifications"]';
export const SELECTOR_notificationsClearButton = '[data-cy="clear-notifications"]';

// Alert dialog
export const SELECTOR_alertRightButton = '[data-cy="alert-right-btn"]';
export const SELECTOR_alertLeftButton = '[data-cy="alert-left-btn"]';

// Rename shared model Modal
export const FIELD_renameModelInput = '[data-cy="file-rename"]';
export const BUTTON_renameModelConfirm = '[data-cy="file-rename-confirm"]';

// Loading screen
export const SELECTOR_loadingCloseButton = '[data-cy="close-loading-modal"]';

// Load model dialog
export const SELECTOR_dialogStartButton = '[data-cy="dialogStartButton"]';
export const SELECTOR_dialogDefaultAspectButton = '[data-cy="dialogDefaultAspectButton"]';
export const SELECTOR_dialogMovementExampleAspectButton = '[data-cy="dialogMovementExampleAspectButton"]';
export const SELECTOR_dialogInputModel = '[data-cy="dialogInputModel"]';

// Edit model
export const SELECTOR_editorSaveButton = '[data-cy="editorSaveButton"]';
export const SELECTOR_editorCancelButton = '[data-cy="editorCancelButton"]';
export const FIELD_name = '[data-cy="name"]';
export const FIELD_entityValueName = '[data-cy="entityValueName"]';
export const FIELD_dataType = '[data-cy="dataType"]';
export const FIELD_extends = '[data-cy="extendsValue"]';
export const FIELD_dataTypeOption = '[data-cy="dataTypeOption"]';
export const FIELD_chipIcon = '[data-cy=chipIcon]';
export const FIELD_elementCharacteristic = '[data-cy="elementCharacteristic"]';
export const FIELD_see = '[data-cy="see"]';
export const FIELD_unit = '[data-cy="unit"]';
export const FIELD_inputValues = '[data-cy="inputValues"]';
export const FIELD_left = '[data-cy="left"]';
export const FIELD_right = '[data-cy="right"]';
export const FIELD_output = '[data-cy="output"]';
export const FIELD_preferredNameen = '[data-cy="preferredName"]';
export const FIELD_descriptionen = '[data-cy="description"]';
export const FIELD_characteristicName = '[data-cy="characteristicName"]';
export const FIELD_constraintName = '[data-cy="constraintName"]';
export const FIELD_localeCode = '[data-cy="localeCode"]';
export const FIELD_languageCode = '[data-cy="languageCode"]';
export const FIELD_values = '[data-cy="values"]';
export const FIELD_defaultValue = '[data-cy="defaultValue"]';
export const FIELD_payloadName = 'payloadName';
export const FIELD_optional = 'optional';
export const FIELD_notInPayload = 'notInPayload';
export const FIELD_propertyValueNotComplex = '[data-cy="propertyValueNotComplex"]';
export const FIELD_propertyValueComplex = '[data-cy="propertyValueComplex"]';
export const FIELD_deconstructionRuleInput = '[data-cy="deconstruction-rule-input"]';
export const FIELD_deconstructionRuleSelect = '[data-cy="deconstruction-rule-select"]';
export const FIELD_elementsModalButton = '[data-cy="elements-modal-button"]';
export const SELECTOR_removeEntityValue = '[data-cy="remove-entity-value"]';
export const PROP_configuration = '.properties-button > p > span';
export const SELECTOR_configureProp = '[data-cy="properties-modal-button"]';
export const SELECTOR_outgoingEdges = '.mat-expansion-panel-header-title > h3';
export const FIELD_error = '.mat-mdc-form-field-error-wrapper';
export const SELECTOR_resizeWindow = '.as-split-gutter-icon';
export const SELECTOR_saveProperties = '[data-cy="propertiesSaveButton"]';
export const SELECTOR_locateElement = '[data-cy="locateElement"]';
export const SELECTOR_configuredProperty = ':nth-child(2) > .cdk-column-name > span';
export const SELECTOR_configuredPropertyCheckBox = '#mat-mdc-checkbox-1-input';
export const SELECTOR_configuredPropertyPayload = '#mat-input-42';
export const SELECTOR_exampleProperty =
  'ame-example-value-input-field > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix';

// Search model
export const SELECTOR_searchInputField = '[data-cy="searchInputField"]';
export const SELECTOR_searchEntityValueInputField = '[data-cy="searchEntityValueInputField"]';
// Editor canvas
export const SELECTOR_ecAspect = '[data-cy="dragDropAspect"]';

export const SELECTOR_ecProperty = '[data-cy="dragDropProperty"]';
export const SELECTOR_ecAbstractProperty = '[data-cy="dragDropAbstractProperty"]';
export const SELECTOR_ecOperation = '[data-cy="dragDropOperation"]';
export const SELECTOR_ecCharacteristic = '[data-cy="dragDropCharacteristic"]';
export const SELECTOR_ecConstraint = '[data-cy="dragDropConstraint"]';
export const SELECTOR_ecEntity = '[data-cy="dragDropEntity"]';
export const SELECTOR_ecAbstractEntity = '[data-cy="dragDropAbstractEntity"]';
export const SELECTOR_ecTrait = '[data-cy="dragDropTrait"]';
export const SELECTOR_ecEvent = '[data-cy="dragDropEvent"]';

// MetaModel Element
export const META_MODEL_preferredName = 'preferredName';
export const META_MODEL_description = 'description';
export const META_MODEL_see = 'see';
export const META_MODEL_dataType = 'dataType';
export const META_MODEL_scale = 'scale';
export const META_MODEL_integer = 'integer';
export const META_MODEL_value = 'value';
export const META_MODEL_values = 'values';
export const META_MODEL_minValue = 'minValue';
export const META_MODEL_maxValue = 'maxValue';
export const META_MODEL_localeCode = 'localeCode';
export const META_MODEL_languageCode = 'languageCode';
export const META_MODEL_exampleValue = 'exampleValue';

// Settings Dialog
export enum SettingsDialogSelectors {
  autoSaveInput = '[name="autosaveTime"]',
  autoSaveToggle = '[data-cy="autoSaveToggle"]',
  autoValidateInput = '[name="autoValidateTime"]',
  autoValidateToggle = '[data-cy="autoValidateToggle"]',
}

// Snack bar
export const SNACK_BAR = '.ngx-toastr';

// Sidebar
export const SIDEBAR_CLOSE_BUTTON = '[data-cy="sidebar-close"]';

// Generation
export const GENERATION_tbGenerateOpenApiButton = '[data-cy="tbGenerateOpenApiButton"]';
export const GENERATION_tbOutputButton = '[data-cy="tbOutputButton"]';
export const GENERATION_tbOutputButton_JSON = '[data-cy="tbOutputButton-json"]';
export const GENERATION_tbOutputButton_YAML = '[data-cy="tbOutputButton-yaml"]';
export const GENERATION_tbOpenDoc = '[data-cy="tbOpenDoc"]';
export const GENERATION_tbDownloadDoc = '[data-cy="tbDownloadDoc"]';
