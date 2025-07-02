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

const path = require('path');

function inDevMode() {
  return process.argv.includes('--dev');
}

function inProdMode() {
  return !inDevMode();
}

const iconsPath = inDevMode()
  ? path.join('.', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'app-menu')
  : path.join(__dirname, '..', '..', '..', 'app-menu');

const disabledIconsPath = `${iconsPath}${path.sep}disabled`;
const enabledIconsPath = `${iconsPath}${path.sep}enabled`;

const modelsPath = inDevMode()
  ? path.join('.', 'apps', 'ame', 'src', 'assets', 'aspect-models', 'com.examples', '1.0.0')
  : path.join(__dirname, '..', '..', '..', 'default-models');

paths = {
  icons: {
    disabled: disabledIconsPath,
    enabled: enabledIconsPath,
  },
  models: modelsPath,
};

icons = {
  MENU_NEW: {
    disabled: `${disabledIconsPath}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
  },
  NEW_EMPTY_MODEL: {
    disabled: `${disabledIconsPath}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_FILE: {
    disabled: `${disabledIconsPath}${path.sep}upload_file_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}upload_file_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_FROM_TEXT: {
    disabled: `${disabledIconsPath}${path.sep}edit_note_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}edit_note_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_DEFAULT_EXAMPLE: {
    disabled: `${disabledIconsPath}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_MOVEMENT_EXAMPLE: {
    disabled: `${disabledIconsPath}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
  },
  NEW_WINDOW: {
    disabled: `${disabledIconsPath}${path.sep}note_add_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}note_add_FILL0_wght400_GRAD0_opsz24.png`,
  },
  IMPORT_MODEL: {
    disabled: `${disabledIconsPath}${path.sep}open_in_new_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}open_in_new_FILL0_wght400_GRAD0_opsz24.png`,
  },
  IMPORT_PACKAGE: {
    disabled: `${disabledIconsPath}${path.sep}folder_zip_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}folder_zip_FILL0_wght400_GRAD0_opsz24.png`,
  },
  COPY_TO_CLIPBOARD: {
    disabled: `${disabledIconsPath}${path.sep}content_copy_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}content_copy_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SAVE_TO_WORKSPACE: {
    disabled: `${disabledIconsPath}${path.sep}save_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}save_FILL0_wght400_GRAD0_opsz24.png`,
  },
  EXPORT_MODEL: {
    disabled: `${disabledIconsPath}${path.sep}download_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}download_FILL0_wght400_GRAD0_opsz24.png`,
  },
  EXPORT_PACKAGE: {
    disabled: `${disabledIconsPath}${path.sep}download_2_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}download_2_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SHOW_HIDE_TOOLBAR: {
    disabled: `${disabledIconsPath}${path.sep}build_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}build_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SHOW_HIDE_MINIMAP: {
    disabled: `${disabledIconsPath}${path.sep}map_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}map_FILL0_wght400_GRAD0_opsz24.png`,
  },
  MENU_FILTER_MODEL_BY: {
    disabled: `${disabledIconsPath}${path.sep}filter_list_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}filter_list_FILL0_wght400_GRAD0_opsz24.png`,
  },
  FILTER_MODEL_BY_NONE: {
    disabled: `${disabledIconsPath}${path.sep}filter_alt_off_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}filter_alt_off_FILL0_wght400_GRAD0_opsz24.png`,
  },
  FILTER_MODEL_BY_PROPERTIES: {
    disabled: `${disabledIconsPath}${path.sep}property_logo.png`,
    enabled: `${enabledIconsPath}${path.sep}property_logo.png`,
  },
  ZOOM_IN: {
    disabled: `${disabledIconsPath}${path.sep}zoom_in_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}zoom_in_FILL0_wght400_GRAD0_opsz24.png`,
  },
  ZOOM_OUT: {
    disabled: `${disabledIconsPath}${path.sep}zoom_out_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}zoom_out_FILL0_wght400_GRAD0_opsz24.png`,
  },
  ZOOM_TO_FIT: {
    disabled: `${disabledIconsPath}${path.sep}fit_screen_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}fit_screen_FILL0_wght400_GRAD0_opsz24.png`,
  },
  ZOOM_TO_ACTUAL: {
    disabled: `${disabledIconsPath}${path.sep}pageless_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}pageless_FILL0_wght400_GRAD0_opsz24.png`,
  },
  OPEN_SELECTED_ELEMENT: {
    disabled: `${disabledIconsPath}${path.sep}jump_to_element_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}jump_to_element_FILL0_wght400_GRAD0_opsz24.png`,
  },
  REMOVE_SELECTED_ELEMENT: {
    disabled: `${disabledIconsPath}${path.sep}delete_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}delete_FILL0_wght400_GRAD0_opsz24.png`,
  },
  COLLAPSE_EXPAND_MODEL: {
    disabled: `${disabledIconsPath}${path.sep}collapse_content_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}collapse_content_FILL0_wght400_GRAD0_opsz24.png`,
  },
  FORMAT_MODEL: {
    disabled: `${disabledIconsPath}${path.sep}schema_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}schema_FILL0_wght400_GRAD0_opsz24.png`,
  },
  CONNECT_ELEMENTS: {
    disabled: `${disabledIconsPath}${path.sep}commit_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}commit_FILL0_wght400_GRAD0_opsz24.png`,
  },
  VALIDATE_MODEL: {
    disabled: `${disabledIconsPath}${path.sep}fact_check_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}fact_check_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_HTML_DOCUMENTATION: {
    disabled: `${disabledIconsPath}${path.sep}html_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}html_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_OPEN_API_SPECIFICATION: {
    disabled: `${disabledIconsPath}${path.sep}api_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}api_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_ASYNC_API_SPECIFICATION: {
    disabled: `${disabledIconsPath}${path.sep}async_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}async_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_AASX_XML: {
    disabled: `${disabledIconsPath}${path.sep}data_array_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}data_array_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_JSON_PAYLOAD: {
    disabled: `${disabledIconsPath}${path.sep}description_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}description_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_JSON_SCHEMA: {
    disabled: `${disabledIconsPath}${path.sep}data_object_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}data_object_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SEARCH_ELEMENTS: {
    disabled: `${disabledIconsPath}${path.sep}view_comfy_alt_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}view_comfy_alt_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SEARCH_FILES: {
    disabled: `${disabledIconsPath}${path.sep}topic_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabledIconsPath}${path.sep}topic_FILL0_wght400_GRAD0_opsz24.png`,
  },
};

module.exports = {inDevMode, inProdMode, icons, paths};
