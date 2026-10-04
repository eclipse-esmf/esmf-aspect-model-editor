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

// Editor toolbar
export const SELECTOR_tbDeleteButton = '[data-testid="tbDeleteButton"]';
export const SELECTOR_tbConnectButton = '[data-testid="tbConnectButton"]';
export const SELECTOR_tbCollapseToggle = '[data-testid="collapseExpandToggle"]';
export const SELECTOR_tbValidateButton = '[data-testid="tbValidateButton"]';
export const SELECTOR_overrideNamespace = '[data-testid="overrideNamespace"]';

// Workspace (sidebar)
export const SIDEBAR_CLOSE_BUTTON = '[data-testid="sidebar-close"]';
export const SELECTOR_elementBtn = '[data-testid="elementsBtn"]';
export const SELECTOR_workspaceBtn = '[data-testid="workspaceBtn"]';
export const SELECTOR_searchElementsInp = '[data-testid="searchElements"]';
export const SELECTOR_workspaceSearchInput = '[data-testid="workspaceSearchInput"]';
export const SELECTOR_workspaceToggleFold = '[data-testid="workspaceToggleFold"]';
export const SELECTOR_workspaceRefreshButton = '[data-testid="workspaceRefreshButton"]';
export const SELECTOR_openFileMenu = '[data-testid="openFileMenu"]';
export const SELECTOR_fileMenuDeleteButton = '[data-testid="fileMenuDeleteButton"]';
export const SELECTOR_fileMenuLoadAspectModelButton = '[data-testid="fileMenuLoadAspectModelButton"]';
export const SELECTOR_fileMenuFindElements = '[data-testid="fileMenuFindElements"]';
export const SELECTOR_fileMenuCopyToClipboardButton = '[data-testid="fileMenuCopyToClipboardButton"]';

// Settings -> Namespace
export const SELECTOR_namespaceTabValueInput = '[data-testid="namespaceTabValueInput"]';
export const SELECTOR_namespaceTabVersionInput = '[data-testid="namespaceTabVersionInput"]';
export const SELECTOR_addEntityValue = '[data-testid="addNewEntityValueButton"]';
export const SELECTOR_clearEntityValueButton = '[data-testid="clear-entityValue-button"]';
export const SELECTOR_clearLanguageButton = '[data-testid="clear-language-button"]';
export const SELECTOR_clearLeftCharacteristicButton = '[data-testid="clear-left-button"]';
export const SELECTOR_entitySaveButton = '[data-testid="entitySaveButton"]';
export const SELECTOR_openNamespacesButton = '.content > span';
export const SELECTOR_settingsButton = '[data-testid="settingsBtn"]';
export const SELECTOR_notificationsBtn = '[data-testid="notificationsBtn"]';

// Export namespace
export const SELECTOR_enNamespaceList = '[data-testid="enNamespaceList"]';

// Notifications
export const SELECTOR_notificationsDialogCloseButton = '[data-testid="close-notifications"]';
export const SELECTOR_notificationsClearButton = '[data-testid="clear-notifications"]';

// Alert dialog
export const SELECTOR_alertRightButton = '[data-testid="alert-right-btn"]';

// Declare name of element library (model without an Aspect) modal
export const FIELD_renameModelInput = '[data-testid="file-rename"]';
export const BUTTON_renameModelConfirm = '[data-testid="file-rename-confirm"]';

// Edit model
export const SELECTOR_editorSaveButton = '[data-testid="editorSaveButton"]';
export const SELECTOR_propertiesCancelButton = '[data-testid="propertiesCancelButton"]';
export const SELECTOR_editorCancelButton = '[data-testid="editorCancelButton"]';
export const SELECTOR_anonymousToggle = '[data-testid="anonymousToggle"]';
export const FIELD_name = '[data-testid="name"]';
export const FIELD_value = '[data-testid="valueElement"]';
export const FIELD_entityValueName = '[data-testid="entityValueName"]';
export const FIELD_dataType = '[data-testid="dataType"]';
export const FIELD_extends = '[data-testid="extendsValue"]';
export const FIELD_dataTypeOption = '[data-testid="dataTypeOption"]';
export const FIELD_clearDataTypeBtn = '[data-testid="clear-dataType-button"]';
export const FIELD_chipIcon = '[data-testid=chipIcon]';
export const FIELD_elementCharacteristic = '[data-testid="elementCharacteristic"]';
export const FIELD_see = '[data-testid="see"]';
export const FIELD_addSee = '[data-testid="add-see"]';
export const FIELD_removeSee = '[data-testid="remove-see"]';
export const FIELD_exampleValue = '[data-testid="exampleValue"]';
export const FIELD_unit = '[data-testid="unit"]';
export const BUTTON_propConfig = '.properties-button > p > span';
export const FIELD_inputValues = '[data-testid="inputValues"]';
export const FIELD_left = '[data-testid="left"]';
export const FIELD_right = '[data-testid="right"]';
export const FIELD_output = '[data-testid="output"]';
export const FIELD_preferredName = '[data-testid="preferredName"]';
export const FIELD_preferredNameen = '[data-testid="preferredName"]';
export const FIELD_description = '[data-testid="description"]';
export const FIELD_descriptionen = '[data-testid="description"]';
export const FIELD_characteristicName = '[data-testid="characteristicName"]';
export const FIELD_constraintName = '[data-testid="constraintName"]';
export const FIELD_encodingValue = '[data-testid="encodingValue"]';
export const FIELD_upperBoundDefinition = '[data-testid="upperBoundDefinition"]';
export const FIELD_lowerBoundDefinition = '[data-testid="lowerBoundDefinition"]';
export const FIELD_minValue = '[data-testid="minValue"]';
export const FIELD_maxValue = '[data-testid="maxValue"]';
export const FIELD_scale = '[data-testid="scale"]';
export const FIELD_integer = '[data-testid="integer"]';
export const FIELD_valueConstraint = '[data-testid="value"]';
export const FIELD_localeCode = '[data-testid="localeCode"]';
export const FIELD_languageCode = '[data-testid="languageCode"]';
export const FIELD_values = '[data-testid="values"]';
export const FIELD_defaultValue = '[data-testid="defaultValue"]';
export const FIELD_payloadName = 'payloadName';
export const FIELD_optional = 'optional';
export const FIELD_notInPayload = 'notInPayload';
export const FIELD_propertyValueNotComplex = '[data-testid="propertyValueNotComplex"]';
export const FIELD_propertyValueComplex = '[data-testid="propertyValueComplex"]';
export const FIELD_propertyLanguageValue = '[data-testid="propertyLanguageValue"]';
export const FIELD_removeEntityValue = '[data-testid="remove-entity-value"]';
export const FIELD_deconstructionRuleInput = '[data-testid="deconstruction-rule-input"]';
export const FIELD_deconstructionRuleSelect = '[data-testid="deconstruction-rule-select"]';
export const FIELD_elementsModalButton = '[data-testid="elements-modal-button"]';
export const SELECTOR_removeEntityValue = '[data-testid="remove-entity-value"]';
export const PROP_configuration = '.properties-button > p > span';
export const SELECTOR_configureProp = '[data-testid="properties-modal-button"]';
export const FIELD_error = '.mat-mdc-form-field-error-wrapper';
export const SELECTOR_resizeGutter = '[data-testid="properties-modal-button"]';
export const SELECTOR_saveProperties = '[data-testid="propertiesSaveButton"]';
export const SELECTOR_configuredProperty = ':nth-child(2) > .cdk-column-name > span';
export const SELECTOR_configuredPropertyCheckBox = '#mat-mdc-checkbox-1-input';
export const SELECTOR_configuredPropertyPayload = '#mat-input-42';
export const SELECTOR_dataLayerContent = '[data-layer="Content"]';
export const SELECTOR_exampleProperty =
  'ame-example-value-input-field > .mat-mdc-form-field > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix';

// Additional field helpers
export const FIELD_characteristic = '[data-testid="characteristic"]';
export const FIELD_state = '[data-testid="state"]';
export const FIELD_default = '[data-testid="default"]';
export const FIELD_datatype = '[data-testid="datatype"]';
export const FIELD_enumeration = '[data-testid="enumeration"]';
export const FIELD_collection = '[data-testid="collection"]';
export const FIELD_either = '[data-testid="either"]';
export const FIELD_trait = '[data-testid="trait"]';
export const FIELD_timeseries = '[data-testid="timeSeries"]';
export const FIELD_singleEntity = '[data-testid="singleEntity"]';
export const FIELD_code = '[data-testid="code"]';
export const FIELD_min = '[data-testid="min"]';
export const FIELD_max = '[data-testid="max"]';
export const FIELD_pattern = '[data-testid="pattern"]';
export const FIELD_format = '[data-testid="format"]';
export const FIELD_length = '[data-testid="length"]';
export const FIELD_language = '[data-testid="language"]';
export const FIELD_encoding = '[data-testid="encoding"]';
export const FIELD_locale = '[data-testid="locale"]';
export const FIELD_elements = '[data-testid="elements"]';
export const FIELD_filter = '[data-testid="filter"]';
export const FIELD_input = '[data-testid="input"]';
export const FIELD_event = '[data-testid="event"]';
export const FIELD_operation = '[data-testid="operation"]';
export const FIELD_structuredValue = '[data-testid="structuredValue"]';
export const FIELD_quantifiable = '[data-testid="quantifiable"]';
export const FIELD_scalar = '[data-testid="scalar"]';
export const FIELD_measurement = '[data-testid="measurement"]';
export const FIELD_duration = '[data-testid="duration"]';

// Search model
export const SELECTOR_searchInputField = '[data-testid="searchInputField"]';
export const SELECTOR_searchEntityValueInputField = '[data-testid="searchEntityValueInputField"]';

// Editor canvas
export const SELECTOR_ecAspect = '[data-type="aspect"]';
export const SELECTOR_ecProperty = '[data-type="property"]';
export const SELECTOR_ecAbstractProperty = '[data-type="abstract-property"]';
export const SELECTOR_ecValue = '[data-type="value"]';
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
  autoValidateInput = '[data-testid="autoValidateTime"]',
  autoValidateToggle = '[data-testid="autoValidateToggle"]',
  settingsDialogApplyButton = '[data-testid="settingsDialogApplyButton"]',
  settingsDialogOkButton = '[data-testid="settingsDialogOkButton"]',
  settingsDialogCancelButton = '[data-testid="settingsDialogCancelButton"]',
}

// Generation
export const GENERATION_tbGenerateOpenApiButton = '[data-testid="tbGenerateOpenApiButton"]';
export const GENERATION_tbGenerateAsyncApiButton = '[data-testid="tbGenerateAsyncApiButton"]';
export const GENERATION_tbOutputButton = '[data-testid="tbOutputButton"]';
export const GENERATION_tbOutputButton_YAML = '[data-testid="tbOutputButton-yaml"]';
export const GENERATION_tbOutputButton_JSON = '[data-testid="tbOutputButton-json"]';
export const GENERATION_tbOutputButton_AASX = '[data-testid="tbOutputButton-aasx"]';
export const GENERATION_tbOutputButton_XML = '[data-testid="tbOutputButton-xml"]';
export const GENERATION_tbBaseUrlInput = '[data-testid="tbBaseUrlInput"]';
export const GENERATION_tbBaseUrlInputError = '[data-testid="tbBaseUrlInputError"]';
export const GENERATION_tbApplicationIdInput = '[data-testid="tbApplicationIdInput"]';
export const GENERATION_tbChannelAddressInput = '[data-testid="tbChannelAddressInput"]';
export const GENERATION_activateResourcePathCheckbox = '[data-testid="activateResourcePathCheckbox"]';
export const GENERATION_writeSeparateFilesCheckbox = '[data-testid="writeSeparateFilesCheckbox"]';
export const GENERATION_resourcePathTitle = '[data-testid="resourcePathTitle"]';
export const GENERATION_resourcePathInput = '[data-testid="resourcePathInput"]';
export const GENERATION_resourcePathRequiredError = '[data-testid="resourcePathRequiredError"]';
export const GENERATION_resourcePathPatternError = '[data-testid="resourcePathPatternError"]';
export const GENERATION_uploadTitle = '[data-testid="uploadTitle"]';
export const GENERATION_uploadFileTitle = '[data-testid="uploadFileTitle"]';
export const GENERATION_uploadContent = '[data-testid="uploadContent"]';
export const GENERATION_uploadContentFileInput = '[data-testid="uploadContentFileInput"]';
export const GENERATION_uploadFileRequireError = '[data-testid="uploadFileRequireError"]';
export const GENERATION_accordionTitle = '[data-testid="accordionTitle"]';
export const GENERATION_removeUploadFile = '[data-testid="removeUploadFile"]';
export const GENERATION_tbDownloadDoc = '[data-testid="tbDownloadDoc"]';
export const GENERATION_downloadFileButton = '[data-testid="downloadFileButton"]';

// Confirmation dialog
export const CANCEL_dialogButton = '[data-testid="cancelBtn"]';
export const ACTION_dialogButton = '[data-testid="actionBtn"]';
export const OK_dialogButton = '[data-testid="okBtn"]';

// Generics
export const SELECTOR_dialog = 'mat-dialog-container';
export const SELECTOR_dialogClose = '[data-testid="dialog-close"]';
export const SELECTOR_toast = '.toast';
export const SELECTOR_toastClose = '.toast-close-button';
export const SELECTOR_contextMenu = '.mxPopupMenu';
