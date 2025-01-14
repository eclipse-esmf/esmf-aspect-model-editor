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

import {Property} from './default-property';

export abstract class HasProperties {
  properties: Property[];

  /**
   * @return the {@link Property}(ies) defined in the scope of this element.
   */
  getProperties() {
    return this.properties;
  }

  /**
   * Get a property by name
   * @param name name of the property
   * @return Property or undefined if no property with the name exists
   */
  getProperty(name: string): Property {
    return this.properties.find(property => property.name === name);
  }
}
