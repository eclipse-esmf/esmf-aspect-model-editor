/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

// Editor toolbar
export const SELECTOR_tbDeleteButton = '[data-cy="tbDeleteButton"]';
export const SELECTOR_tbConnectButton = '[data-cy="tbConnectButton"]';
export const SELECTOR_tbLoadButton = '[data-cy="tbLoadButton"]';
export const SELECTOR_tbValidateButton = '[data-cy="tbValidateButton"]';
export const SELECTOR_tbPrintButton = '[data-cy="tbPrintButton"]';
export const SELECTOR_tbCollapseToggle = '[data-cy="collapseExpandToggle"]';

export const SELECTOR_addEntityValue = '[data-cy="addNewEntityValueButton"]';
export const SELECTOR_clearEntityValueButton = '[data-cy="clear-entityValue-button"]';
export const SELECTOR_clearElementCharacteristicButton = '[data-cy="clear-element-characteristic-button"]';
export const SELECTOR_clearLeftCharacteristicButton = '[data-cy="clear-left-button"]';
export const SELECTOR_clearRightCharacteristicButton = '[data-cy="clear-right-button"]';
export const SELECTOR_entitySaveButton = '[data-cy="entitySaveButton"]';
export const SELECTOR_openNamespacesButton = '[data-cy="open-namespaces"]';
export const SELECTOR_closeSidebarButton = '[data-cy="sidebar-close"]';

// Navbar
export const SELECTOR_nbNotificationsButton = '#notifications';

// Notifications
export const SELECTOR_notificationsDialogCloseButton = '.dialog-header .close-button';
export const SELECTOR_notificationsClearButton = '.delete-all-btn';

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

// Search model
export const SELECTOR_searchInputField = '[data-cy="searchInputField"]';
export const SELECTOR_searchEntityValueInputField = '[data-cy="searchEntityValueInputField"]';
// Editor canvas
export const SELECTOR_ecProperty = '[data-cy="dragDropProperty"]';
export const SELECTOR_ecOperation = '[data-cy="dragDropOperation"]';
export const SELECTOR_ecCharacteristic = '[data-cy="dragDropCharacteristic"]';
export const SELECTOR_ecConstraint = '[data-cy="dragDropConstraint"]';
export const SELECTOR_ecEntity = '[data-cy="dragDropEntity"]';
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
