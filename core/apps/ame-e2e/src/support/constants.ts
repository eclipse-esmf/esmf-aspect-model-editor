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

// Editor toolbar
export const SELECTOR_tbDeleteButton = '[data-cy="tbDeleteButton"]';
export const SELECTOR_tbConnectButton = '[data-cy="tbConnectButton"]';
export const SELECTOR_tbCollapseToggle = '[data-cy="collapseExpandToggle"]';
export const SELECTOR_overrideNamespace = '[data-cy="overrideNamespace"]';

// Workspace (sidebar)
export const SIDEBAR_CLOSE_BUTTON = '[data-cy="sidebar-close"]';
export const SELECTOR_elementBtn = '[data-cy="elementsBtn"]';
export const SELECTOR_workspaceBtn = '[data-cy="workspaceBtn"]';
export const SELECTOR_searchElementsInp = '[data-cy="searchElements"]';

// Settings -> Namespace
export const SELECTOR_namespaceTabValueInput = '[data-cy="namespaceTabValueInput"]';
export const SELECTOR_namespaceTabVersionInput = '[data-cy="namespaceTabVersionInput"]';
export const SELECTOR_addEntityValue = '[data-cy="addNewEntityValueButton"]';
export const SELECTOR_clearEntityValueButton = '[data-cy="clear-entityValue-button"]';
export const SELECTOR_clearLanguageButton = '[data-cy="clear-language-button"]';
export const SELECTOR_clearLeftCharacteristicButton = '[data-cy="clear-left-button"]';
export const SELECTOR_entitySaveButton = '[data-cy="entitySaveButton"]';
export const SELECTOR_openNamespacesButton = '.content > span';
export const SELECTOR_settingsButton = '[data-cy="settingsBtn"]';
export const SELECTOR_notificationsBtn = '[data-cy="notificationsBtn"]';

// Export namespace
export const SELECTOR_enNamespaceList = '[data-cy="enNamespaceList"]';

// Notifications
export const SELECTOR_notificationsDialogCloseButton = '[data-cy="close-notifications"]';
export const SELECTOR_notificationsClearButton = '[data-cy="clear-notifications"]';

// Alert dialog
export const SELECTOR_alertRightButton = '[data-cy="alert-right-btn"]';

// Rename shared model Modal
export const FIELD_renameModelInput = '[data-cy="file-rename"]';
export const BUTTON_renameModelConfirm = '[data-cy="file-rename-confirm"]';

// Edit model
export const SELECTOR_editorSaveButton = '[data-cy="editorSaveButton"]';
export const SELECTOR_propertiesCancelButton = '[data-cy="propertiesCancelButton"]';
export const SELECTOR_editorCancelButton = '[data-cy="editorCancelButton"]';
export const FIELD_name = '[data-cy="name"]';
export const FIELD_entityValueName = '[data-cy="entityValueName"]';
export const FIELD_dataType = '[data-cy="dataType"]';
export const FIELD_extends = '[data-cy="extendsValue"]';
export const FIELD_dataTypeOption = '[data-cy="dataTypeOption"]';
export const FIELD_clearDataTypeBtn = '[data-cy="clear-dataType-button"]';
export const FIELD_chipIcon = '[data-cy=chipIcon]';
export const FIELD_elementCharacteristic = '[data-cy="elementCharacteristic"]';
export const FIELD_see = '[data-cy="see"]';
export const FIELD_unit = '[data-cy="unit"]';
export const BUTTON_propConfig = '.properties-button > p > span';
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
export const FIELD_propertyLanguageValue = '[data-cy="propertyLanguageValue"]';
export const FIELD_removeEntityValue = '[data-cy="remove-entity-value"]';
export const FIELD_deconstructionRuleInput = '[data-cy="deconstruction-rule-input"]';
export const FIELD_deconstructionRuleSelect = '[data-cy="deconstruction-rule-select"]';
export const FIELD_elementsModalButton = '[data-cy="elements-modal-button"]';
export const SELECTOR_removeEntityValue = '[data-cy="remove-entity-value"]';
export const PROP_configuration = '.properties-button > p > span';
export const SELECTOR_configureProp = '[data-cy="properties-modal-button"]';
export const FIELD_error = '.mat-mdc-form-field-error-wrapper';
export const SELECTOR_resizeGutter = '[data-cy="properties-modal-button"]';
export const SELECTOR_saveProperties = '[data-cy="propertiesSaveButton"]';
export const SELECTOR_configuredProperty = ':nth-child(2) > .cdk-column-name > span';
export const SELECTOR_configuredPropertyCheckBox = '#mat-mdc-checkbox-1-input';
export const SELECTOR_configuredPropertyPayload = '#mat-input-42';
export const SELECTOR_dataLayerContent = '[data-layer="Content"]';
export const SELECTOR_exampleProperty =
  'ame-example-value-input-field > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix';

// Search model
export const SELECTOR_searchInputField = '[data-cy="searchInputField"]';
export const SELECTOR_searchEntityValueInputField = '[data-cy="searchEntityValueInputField"]';

// Editor canvas
export const SELECTOR_ecAspect = '[data-type="aspect"]';
export const SELECTOR_ecProperty = '[data-type="property"]';
export const SELECTOR_ecAbstractProperty = '[data-type="abstract-property"]';
export const SELECTOR_ecOperation = '[data-type="operation"]';
export const SELECTOR_ecCharacteristic = '[data-type="characteristic"]';
export const SELECTOR_ecConstraint = '[data-type="constraint"]';
export const SELECTOR_ecEntity = '[data-type="entity"]';
export const SELECTOR_ecAbstractEntity = '[data-type="abstract-entity"]';
export const SELECTOR_ecTrait = '[data-type="trait"]';
export const SELECTOR_ecEvent = '[data-type="event"]';

// MetaModel Element
export const META_MODEL_preferredName = 'preferredName';
export const META_MODEL_description = 'description';
export const META_MODEL_see = 'see';
export const META_MODEL_dataType = 'dataType';
export const META_MODEL_scale = 'scale';
export const META_MODEL_value = 'value';
export const META_MODEL_values = 'values';
export const META_MODEL_minValue = 'minValue';
export const META_MODEL_maxValue = 'maxValue';
export const META_MODEL_localeCode = 'localeCode';
export const META_MODEL_languageCode = 'languageCode';

// Settings Dialog
export enum SettingsDialogSelectors {
  autoValidateInput = '[data-cy="autoValidateTime"]',
  autoValidateToggle = '[data-cy="autoValidateToggle"]',
  settingsDialogApplyButton = '[data-cy="settingsDialogApplyButton"]',
  settingsDialogOkButton = '[data-cy="settingsDialogOkButton"]',
  settingsDialogCancelButton = '[data-cy="settingsDialogCancelButton"]',
}

// Generation
export const GENERATION_tbGenerateOpenApiButton = '[data-cy="tbGenerateOpenApiButton"]';
export const GENERATION_tbGenerateAsyncApiButton = '[data-cy="tbGenerateAsyncApiButton"]';
export const GENERATION_tbOutputButton = '[data-cy="tbOutputButton"]';
export const GENERATION_tbOutputButton_YAML = '[data-cy="tbOutputButton-yaml"]';
export const GENERATION_tbOutputButton_JSON = '[data-cy="tbOutputButton-json"]';
export const GENERATION_tbBaseUrlInput = '[data-cy="tbBaseUrlInput"]';
export const GENERATION_tbBaseUrlInputError = '[data-cy="tbBaseUrlInputError"]';
export const GENERATION_tbApplicationIdInput = '[data-cy="tbApplicationIdInput"]';
export const GENERATION_tbChannelAddressInput = '[data-cy="tbChannelAddressInput"]';
export const GENERATION_activateResourcePathCheckbox = '[data-cy="activateResourcePathCheckbox"]';
export const GENERATION_writeSeparateFilesCheckbox = '[data-cy="writeSeparateFilesCheckbox"]';
export const GENERATION_resourcePathTitle = '[data-cy="resourcePathTitle"]';
export const GENERATION_resourcePathInput = '[data-cy="resourcePathInput"]';
export const GENERATION_resourcePathRequiredError = '[data-cy="resourcePathRequiredError"]';
export const GENERATION_resourcePathPatternError = '[data-cy="resourcePathPatternError"]';
export const GENERATION_uploadTitle = '[data-cy="uploadTitle"]';
export const GENERATION_uploadFileTitle = '[data-cy="uploadFileTitle"]';
export const GENERATION_uploadContent = '[data-cy="uploadContent"]';
export const GENERATION_uploadContentFileInput = '[data-cy="uploadContentFileInput"]';
export const GENERATION_uploadFileRequireError = '[data-cy="uploadFileRequireError"]';
export const GENERATION_accordionTitle = '[data-cy="accordionTitle"]';
export const GENERATION_removeUploadFile = '[data-cy="removeUploadFile"]';
export const GENERATION_tbDownloadDoc = '[data-cy="tbDownloadDoc"]';
export const GENERATION_downloadFileButton = '[data-cy="downloadFileButton"]';

// Confirmation dialog
export const CANCEL_dialogButton = '[data-cy="cancelBtn"]';
export const ACTION_dialogButton = '[data-cy="actionBtn"]';
export const OK_dialogButton = '[data-cy="okBtn"]';
