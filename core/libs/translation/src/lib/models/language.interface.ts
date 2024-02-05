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

export interface Translation {
  START_LOAD_MODAL: StartLoadModal;
  SAVE_MODAL_DIALOG: SaveModalDialog;
  SAMM_MIGRATION: SammMigration;
  NOTIFICATION_SERVICE: NotificationService;
  TOOLBAR: Toolbar;
  SIDEBAR: Sidebar;
  SETTINGS_DIALOG: SettingsDialog;
  ELEMENT_MODEL_DESCRIPTION: ElementModelDescription;
  EDITOR_CANVAS: EditorCanvas;
  FOOTER: Footer;
  CONFIRM_DIALOG: ConfirmDialog;
  LOADING_SCREEN_DIALOG: LoadingScreenDialog;
}

export interface StartLoadModal {
  TITLE: string;
  CONTENT: string;
  LOAD_BUTTON: string;
  DISMISS_BUTTON: string;
}

export interface SaveModalDialog {
  TITLE: string;
  CONTENT: string;
  CONTINUE_BUTTON: string;
  DISCARD_BUTTON: string;
  SAVE_BUTTON: string;
}

export interface SammMigration {
  CHECK_WORKSPACE: string;
  MIGRATE_TO_SAMM: string;
  AWAITING_STATUS: string;
  CHECKED: string;
  MIGRATED: string;
  MIGRATE_WORKSPACE_DIALOG: MigrateWorkspaceDialog;
  MIGRATION_STATUS_DIALOG: MigrationStatusDialog;
  WORKSPACE_MIGRATION_DIALOG: MigrateWorkspaceToSammDialog;
  MIGRATION_SUCCESS_DIALOG: MigrationSuccessDialog;
  INCREASE_VERSION_DIALOG: IncreaseVersionDialog;
}

export interface MigrateWorkspaceDialog {
  MIGRATE_WORKSPACE: string;
  AWAITING_STATUS: string;
}

export interface MigrationStatusDialog {
  TITLE: string;
  ERROR: string;
  SUCCESS: string;
  CLOSE: string;
  VERSION: string;
}

export interface MigrateWorkspaceToSammDialog {
  TITLE: string;
  FILE_VERSION_WARNING: string;
  MIGRATION_NEEDED: string;
  MIGRATE_INSTRUCTION: string;
  VERSION_AUTO_UPGRADE: string;
  UPGRADE_EFFECT: string;
  CANCEL: string;
  MIGRATE: string;
}

export interface MigrationSuccessDialog {
  TITLE: string;
  CONTENT: string;
  CLOSE: string;
}

export interface IncreaseVersionDialog {
  TITLE: string;
  LOADING_NAMESPACES: string;
}

export interface NotificationService {
  RECURSIVE_ELEMENTS: string;
  CIRCULAR_CONNECTION_MESSAGE: string;
  MISSING_PARENT_ENTITY: string;
  ABSTRACT_PROPERTY_PARENT_REQUIREMENT: string;
  ILLEGAL_OPERATION_MESSAGE: string;
  PROPERTY_EXTENSION_CONFLICT: string;
  MODEL_EMPTY_MESSAGE: string;
  MODEL_MINIMUM_ELEMENT_REQUIREMENT: string;
  NAMESPACE_EXPORT_FAILURE: string;
  INTERNAL_EXPORT_ERROR: string;
  SUMMARY_CLIPBOARD_SUCCESS: string;
  SUMMARY_CLIPBOARD_FAILURE: string;
  CHILD_FOR_PREDEFINED_ELEMENT_ERROR: string;
}

export interface Toolbar {
  NEW_LOAD: string;
  SAVE: string;
  ADD_FILE_TO_NAMESPACE: string;
  EDIT_HIGHLIGHTED_CELL: string;
  DELETE: string;
  COLLAPSE_ALL: string;
  EXPAND_ALL: string;
  SEARCH: string;
  REMOVE_FILTER_MODE: string;
  FILTER_WAIT: string;
  FORMAT: string;
  CONNECT: string;
  VALIDATE: string;
  GENERATING_POSSIBLE: string;
  GENERATE_DOCUMENT: string;
  GENERATE_SCHEMA: string;
  HIDE_MAP: string;
  SHOW_MAP: string;
  HIDE_NAVIGATION: string;
  SHOW_NAVIGATION: string;
  MODEL_UNFILTERED: string;
  MODEL_FILTERED_BY_PROPERTIES: string;
  SETTINGS: string;
  NOTIFICATIONS: string;
  HELP: string;
  LOAD_MENU: LoadMenu;
  SAVE_MENU: SaveMenu;
  GENERATE_DOCUMENT_MENU: GenerateDocumentMenu;
  DOWNLOAD_JSON_MENU: DownloadJsonMenu;
  FILTER_MENU: FilterMenu;
  DECLARE_NAME_DIALOG: DeclareNameDialog;
  SELECT_LANGUAGE_TO_JSON_SCHEMA_DIALOG: SelectLanguageToJsonSchemaDialog;
  GENERATE_AASX_DIALOG: GenerateAasxDialog;
  LOAD_MODEL_DIALOG: LoadModelDialog;
  EXPORT_NAMESPACE_DIALOG: ExportNamespaceDialog;
  VALIDATION_RESULT_DIALOG: ValidationResultDialog;
  NOTIFICATION_DIALOG: NotificationDialog;
  HELP_DIALOG: HelpDialog;
  NOTIFICATIONS_TABLE_DIALOG: NotificationsTableDialog;
  WORKSPACE_SUMMARY: WorkspaceSummary;
  GENERATE_HTML_DOC_DIALOG: GenerateHtmlDocDialog;
  GENERATE_OPENAPI_SPEC_DIALOG: GenerateOpenapiSpecDialog;
  GENERATE_HANDLING: GenerateHandling;
  PREVIEW_DIALOG: PreviewDialog;
}

export interface LoadMenu {
  NEW_WINDOW: string;
  CREATE_UPLOAD_ASPECT_MODEL: string;
  IMPORT_PACKAGE: string;
}

export interface SaveMenu {
  EXPORT_ASPECT_MODEL: string;
  EXPORT_NAMESPACE: string;
  COPY_TO_CLIPBOARD: string;
  SAVE_TO_WORKSPACE: string;
}

export interface GenerateDocumentMenu {
  GENERATE_HTML_DOCUMENT: string;
  GENERATE_OPENAPI_SPECIFICATION: string;
  GENERATE_AASX_XML: string;
}

export interface DownloadJsonMenu {
  GENERATE_SAMPLE_JSON_PAYLOAD: string;
  GENERATE_JSON_SCHEMA: string;
}

export interface FilterMenu {
  DISPLAY_ENTIRE_MODEL: string;
  NONE: string;
  FILTERS_BY_PROPERTIES: string;
  BY_PROPERTIES: string;
}

export interface DeclareNameDialog {
  TITLE: string;
  INFO_CONTENT: string;
  REQUIRED_ERROR: string;
  CHARACTERS_ERROR: string;
  EXIST_ERROR: string;
  REMOVE_ASPECT: string;
  CANCEL: string;
}

export interface SelectLanguageToJsonSchemaDialog {
  TITLE: string;
  LANGUAGE: string;
  SELECT_BUTTON: string;
}

export interface GenerateAasxDialog {
  TITLE: string;
  OUTPUT_FILE_FORMAT: string;
  GENERATING: string;
  CANCEL: string;
  GENERATE: string;
}

export interface LoadModelDialog {
  TITLE: string;
  INFO_CONTENT: string;
  OPTIONS_MESSAGE: string;
  FIRST_OPTION: string;
  SECOND_OPTION: string;
  THIRD_OPTION: string;
  MODIFY_MANUALLY_CONTENT: string;
  TEXT_FIELD_PLACEHOLDER: string;
  BUTTON: Button;
}

export interface Button {
  MODELS: string;
  DEFAULT_ASPECT_MODEL: string;
  MOVEMENT_EXAMPLE: string;
  LOAD_FROM_FILE: string;
  START_MODELING: string;
}

export interface ExportNamespaceDialog {
  TITLE: string;
  INFO_CONTENT: string;
  CANCEL: string;
  NEXT: string;
}

export interface ValidationResultDialog {
  TITLE: string;
  HAVE_VALIDATED: string;
  CAN_BE_EXPORTED: string;
  CAN_NOT_EXPORTED: string;
  MISSING_FILES: string;
  DISMISS_BUTTON: string;
  EXPORT: string;
  CLIP_BUTTON: ClipButton;
}

export interface ClipButton {
  COPY_CLIP: string;
  TOOLTIP: string;
}

export interface NotificationDialog {
  LOADING: string;
  CONTENT: string;
  VALIDATING: string;
  SAVING: string;
  GENERATE_HTML: string;
  GENERATE_JSON_PAYLOAD: string;
  GENERATE_JSON_SCHEMA: string;
  GENERATE_API_SPEC: string;
  WAIT_ACTION: string;
  FORMAT: string;
  WAIT_FORMAT: string;
}

export interface HelpDialog {
  INFO_CONTENT: string;
  PLEASE_REFER: string;
  REGARD_USAGE_EDITOR: string;
  REGARD_DIGITAL_TWIN_SYSTEM: string;
  VERSION: string;
}

export interface NotificationsTableDialog {
  NOTIFICATIONS: string;
  CLEAR_TABLE: string;
  DATE: string;
  TYPE: string;
  MESSAGE: string;
  OPTIONS: string;
  NO_NOTIFICATIONS: string;
  GO: string;
  CLEAR: string;
}

export interface WorkspaceSummary {
  SELECT_TO_VALIDATE: string;
  VALIDATED_SUCCESSFULLY: string;
  FILES_NOT_IMPORTED: string;
}

export interface GenerateHtmlDocDialog {
  TITLE: string;
  LANGUAGE: string;
  BUTTON: Button2;
}

export interface Button2 {
  CANCEL: string;
  OPEN_DOC: string;
  DOWNLOAD_DOC: string;
}

export interface GenerateOpenapiSpecDialog {
  TITLE: string;
  CONFIGURATION: string;
  LANGUAGE: string;
  OUTPUT_FILE_FORMAT: string;
  BASEURL: string;
  PLEASE_ADD_VALID_URL: string;
  INCLUDE_QUERY_API_TOOLTIP: string;
  INCLUDE_QUERY_API: string;
  USE_SEMANTIC_VERSION: string;
  USE_SEMANTIC_VERSION_TOOLTIP: string;
  PAGING_TYPE_OPTION: string;
  NO_PAGING: string;
  CURSOR_BASED_PAGING: string;
  OFFSET_BASED_PAGING: string;
  TIME_BASED_PAGING: string;
  BUTTON: Button3;
}

export interface Button3 {
  CANCEL: string;
  GENERATE: string;
}

export interface GenerateHandling {
  FAIL_GENERATE_OPENAPI_SPEC: string;
  INVALID_MODEL: string;
  FAIL_GENERATE_JSON_SAMPLE: string;
  JSON_PAYLOAD_PREVIEW: string;
  FAIL_GENERATE_JSON_SCHEMA: string;
  JSON_SCHEMA_PREVIEW: string;
}

export interface PreviewDialog {
  RESET_CONTENT: string;
  COPY_TO_CLIPBOARD: string;
  DOWNLOAD_FILE: string;
}

export interface Sidebar {
  ELEMENT_ALREADY_IMPORTED: string;
  DRAG_TO_RIGHT_TO_ADD: string;
  OPEN_WORKSPACE: string;
  THE_ROOT_OF_AVAILABLE_NAMESPACES: string;
  WORKSPACE_TIP: string;
}

export interface SettingsDialog {
  SETTINGS: string;
  NODE: Node;
  SUB_NODE: SubNode;
  CONFIGURATION: Configuration;
  LANGUAGES: Languages;
  NAMESPACES: Namespaces;
}

export interface Node {
  SYSTEM_CONFIGURATION: string;
  MODEL_CONFIGURATION: string;
}

export interface SubNode {
  AUTOMATED_WORKFLOW: string;
  EDITOR: string;
  LANGUAGES: string;
  NAMESPACES: string;
  COPYRIGHT: string;
}

export interface Configuration {
  AUTO_SAVE: string;
  WAITING_PERIOD: string;
  SECONDS: string;
  AUTO_VALIDATION: string;
  AUTO_FORMATTING: string;
  USING_HIERARCHICAL_LAYOUT: string;
  DISPLAY_ENTITY_VALUE_ENTITY: string;
  DISPLAY_PROPERTY_ABSTRACT_PROPERTY: string;
  DISPLAY_DISAMBIGUATION_LABEL: string;
  AUTO_VALIDATION_TOOLTIP: string;
  AUTO_FORMATTING_TOOLTIP: string;
  DISPLAY_DISAMBIGUATION_LABEL_TOOLTIP: string;
}

export interface Languages {
  USER_INTERFACE: string;
  CHOOSE_LANGUAGE: string;
  ENGLISH: string;
  CHINESE: string;
  SAVE: string;
  CANCEL: string;
  ADD_LANGUAGE: string;
  SELECT_LANGUAGE: string;
  START_TYPE: string;
}

export interface Namespaces {
  VALUE: string;
  VERSION: string;
  NAME: string;
  SAMM_VERSION: string;
  APPLY: string;
  PREDEFINED_NAMESPACES: string;
  ASPECT_NAMESPACE_TOOLTIP: string;
}

export interface ElementModelDescription {
  ASPECT: string;
  ABSTRACT_PROPERTY: string;
  PROPERTY: string;
  CHARACTERISTIC: string;
  ABSTRACT_ENTITY: string;
  ENTITY: string;
  UNIT: string;
  CONSTRAINT: string;
  TRAIT: string;
  OPERATION: string;
  EVENT: string;
}

export interface EditorCanvas {
  FITTING_PROGRESS: string;
  RESET: string;
  ZOOM_IN_PROGRESS: string;
  ZOOM_OUT_PROGRESS: string;
  GRAPH_SETUP: GraphSetup;
  SHAPE_SETTING: ShapeSetting;
}

export interface GraphSetup {
  OPEN_IN: string;
  CONNECT: string;
  CONNECT_WITH: string;
  SELECT_ALL_REFERENCES: string;
  FORMAT: string;
  DELETE: string;
  COPY_TO_CLIPBOARD: string;
}

export interface ShapeSetting {
  SAVE: string;
  CANCEL: string;
  EDIT: string;
  LOCATE_ELEMENT: string;
  PROPERTIES_CONFIGURATION: string;
  CONFIGURE: string;
  PROPERTIES_MODAL: PropertiesModal;
  FIELD: Field;
  AME_ELEMENT_LIST_LABEL: AmeElementListLabel;
  AME_ELEMENT_LIST_BUTTON: AmeElementListButton;
}

export interface PropertiesModal {
  NAME: string;
  OPTIONAL: string;
  PAYLOAD_NAME: string;
  NOT_IN_PAYLOAD: string;
  SAVE: string;
  CANCEL: string;
}

export interface Field {
  NAME: Name;
  UNIT: Unit;
  SEE_INPUT: SeeInput;
}

export interface Name {
  PLEASE_DEFINE: string;
  PLEASE_START_WITH_UPPER_CASE: string;
  PLEASE_START_WITH_A_LOWER_CASE: string;
  PLEASE_SELECT_DIFFERENT_NAME: string;
  PLEASE_SELECT_DIFFERENT_NAME_NAMESPACE: string;
  NO_CONTAIN_WHITESPACES: string;
}

export interface Unit {
  SELECT_DIFFERENT_NAME_TYPE: string;
  SELECT_DIFFERENT_NAME_NAMESPACE: string;
  CREATE: string;
  FIELD_REQUIRED: string;
}

export interface SeeInput {
  TYPE_TO_SEARCH: string;
}

export interface AmeElementListLabel {
  INCOMING_EDGES: string;
  OUTGOING_EDGES: string;
}

export interface AmeElementListButton {
  LOCATE_ELEMENT: string;
  OPEN_ELEMENT: string;
  OPEN_ELEMENT_IN_NEW_WINDOW: string;
}

export interface Footer {
  UNSAVED_CHANGES: string;
  CHANGES_SAVED: string;
  LAST_AUTOSAVE_INFO: string;
}

export interface ConfirmDialog {
  CREATE_ASPECT: CreateAspect;
  DELETE_SELECTED_ELEMENTS: DeleteSelectedElements;
  RELOAD_CONFIRMATION: ReloadConfirmation;
}

export interface CreateAspect {
  ASPECT_CREATION_WARNING: string;
  NAME_REPLACEMENT_NOTICE: string;
  TITLE: string;
  CLOSE_BUTTON: string;
  OK_BUTTON: string;
}

export interface DeleteSelectedElements {
  TITLE: string;
  DELETE_DEPENDENT_REFERENCES_WARNING: string;
}

export interface ReloadConfirmation {
  VERSION_CHANGE_NOTICE: string;
  WORKSPACE_LOAD_NOTICE: string;
  RELOAD_WARNING: string;
  TITLE: string;
  CLOSE_BUTTON: string;
  OK_BUTTON: string;
}

export interface LoadingScreenDialog {
  MODEL_GENERATION: string;
  GENERAL_WAIT_MESSAGE: string;
  ZOOM_IN_PROGRESS: string;
  ZOOM_IN_WAIT: string;
  ZOOM_OUT_PROGRESS: string;
  FITTING_PROGRESS: string;
  FITTING_WAIT: string;
  FIT_TO_VIEW_PROGRESS: string;
  MODEL_LOADING: string;
  MODEL_LOADING_WAIT: string;
  ASPECT_MODEL_LOADING: string;
  WORKSPACE_IMPORT: string;
  MODEL_VALIDATION: string;
  VALIDATION_WAIT: string;
  FILTER_CHANGE: string;
  FILTER_WAIT: string;
}