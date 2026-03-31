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

import * as path from 'path';
import {paths} from './paths';

const disabled = paths.icons.disabled;
const enabled = paths.icons.enabled;

export const icons = {
  MENU_NEW: {
    disabled: `${disabled}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
  },
  NEW_EMPTY_MODEL: {
    disabled: `${disabled}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}add_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_FILE: {
    disabled: `${disabled}${path.sep}upload_file_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}upload_file_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_FROM_TEXT: {
    disabled: `${disabled}${path.sep}edit_note_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}edit_note_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_DEFAULT_EXAMPLE: {
    disabled: `${disabled}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
  },
  LOAD_MOVEMENT_EXAMPLE: {
    disabled: `${disabled}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}draft_FILL0_wght400_GRAD0_opsz24.png`,
  },
  NEW_WINDOW: {
    disabled: `${disabled}${path.sep}note_add_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}note_add_FILL0_wght400_GRAD0_opsz24.png`,
  },
  IMPORT_MODEL: {
    disabled: `${disabled}${path.sep}open_in_new_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}open_in_new_FILL0_wght400_GRAD0_opsz24.png`,
  },
  IMPORT_PACKAGE: {
    disabled: `${disabled}${path.sep}folder_zip_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}folder_zip_FILL0_wght400_GRAD0_opsz24.png`,
  },
  COPY_TO_CLIPBOARD: {
    disabled: `${disabled}${path.sep}content_copy_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}content_copy_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SAVE_TO_WORKSPACE: {
    disabled: `${disabled}${path.sep}save_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}save_FILL0_wght400_GRAD0_opsz24.png`,
  },
  EXPORT_MODEL: {
    disabled: `${disabled}${path.sep}download_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}download_FILL0_wght400_GRAD0_opsz24.png`,
  },
  EXPORT_PACKAGE: {
    disabled: `${disabled}${path.sep}download_2_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}download_2_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SHOW_HIDE_TOOLBAR: {
    disabled: `${disabled}${path.sep}build_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}build_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SHOW_HIDE_MINIMAP: {
    disabled: `${disabled}${path.sep}map_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}map_FILL0_wght400_GRAD0_opsz24.png`,
  },
  MENU_FILTER_MODEL_BY: {
    disabled: `${disabled}${path.sep}filter_list_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}filter_list_FILL0_wght400_GRAD0_opsz24.png`,
  },
  FILTER_MODEL_BY_NONE: {
    disabled: `${disabled}${path.sep}filter_alt_off_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}filter_alt_off_FILL0_wght400_GRAD0_opsz24.png`,
  },
  FILTER_MODEL_BY_PROPERTIES: {
    disabled: `${disabled}${path.sep}property_logo.png`,
    enabled: `${enabled}${path.sep}property_logo.png`,
  },
  ZOOM_IN: {
    disabled: `${disabled}${path.sep}zoom_in_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}zoom_in_FILL0_wght400_GRAD0_opsz24.png`,
  },
  ZOOM_OUT: {
    disabled: `${disabled}${path.sep}zoom_out_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}zoom_out_FILL0_wght400_GRAD0_opsz24.png`,
  },
  ZOOM_TO_FIT: {
    disabled: `${disabled}${path.sep}fit_screen_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}fit_screen_FILL0_wght400_GRAD0_opsz24.png`,
  },
  ZOOM_TO_ACTUAL: {
    disabled: `${disabled}${path.sep}pageless_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}pageless_FILL0_wght400_GRAD0_opsz24.png`,
  },
  OPEN_SELECTED_ELEMENT: {
    disabled: `${disabled}${path.sep}jump_to_element_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}jump_to_element_FILL0_wght400_GRAD0_opsz24.png`,
  },
  REMOVE_SELECTED_ELEMENT: {
    disabled: `${disabled}${path.sep}delete_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}delete_FILL0_wght400_GRAD0_opsz24.png`,
  },
  COLLAPSE_EXPAND_MODEL: {
    disabled: `${disabled}${path.sep}collapse_content_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}collapse_content_FILL0_wght400_GRAD0_opsz24.png`,
  },
  FORMAT_MODEL: {
    disabled: `${disabled}${path.sep}schema_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}schema_FILL0_wght400_GRAD0_opsz24.png`,
  },
  CONNECT_ELEMENTS: {
    disabled: `${disabled}${path.sep}commit_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}commit_FILL0_wght400_GRAD0_opsz24.png`,
  },
  VALIDATE_MODEL: {
    disabled: `${disabled}${path.sep}fact_check_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}fact_check_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_HTML_DOCUMENTATION: {
    disabled: `${disabled}${path.sep}html_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}html_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_OPEN_API_SPECIFICATION: {
    disabled: `${disabled}${path.sep}api_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}api_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_ASYNC_API_SPECIFICATION: {
    disabled: `${disabled}${path.sep}async_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}async_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_AASX_XML: {
    disabled: `${disabled}${path.sep}data_array_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}data_array_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_JSON_PAYLOAD: {
    disabled: `${disabled}${path.sep}description_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}description_FILL0_wght400_GRAD0_opsz24.png`,
  },
  GENERATE_JSON_SCHEMA: {
    disabled: `${disabled}${path.sep}data_object_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}data_object_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SEARCH_ELEMENTS: {
    disabled: `${disabled}${path.sep}view_comfy_alt_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}view_comfy_alt_FILL0_wght400_GRAD0_opsz24.png`,
  },
  SEARCH_FILES: {
    disabled: `${disabled}${path.sep}topic_FILL0_wght400_GRAD0_opsz24.png`,
    enabled: `${enabled}${path.sep}topic_FILL0_wght400_GRAD0_opsz24.png`,
  },
};
