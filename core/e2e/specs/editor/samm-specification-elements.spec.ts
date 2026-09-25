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

import {expect, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';

const MODEL_WITH_SAMM_UNITS = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.units:1.0.0#> .

:SensorAspect a samm:Aspect ;
   samm:properties ( :temperature :operatingDuration :batteryLevel ) ;
   samm:operations () ;
   samm:events () .

:temperature a samm:Property ;
   samm:characteristic :TemperatureMeasurement .

:TemperatureMeasurement a samm-c:Measurement ;
   samm:dataType xsd:float ;
   samm-c:unit unit:degreeCelsius .

:operatingDuration a samm:Property ;
   samm:characteristic :OperatingDuration .

:OperatingDuration a samm-c:Duration ;
   samm:dataType xsd:float ;
   samm-c:unit unit:hour .

:batteryLevel a samm:Property ;
   samm:characteristic :BatteryLevel .

:BatteryLevel a samm-c:Quantifiable ;
   samm:dataType xsd:float ;
   samm-c:unit unit:percent .
`;

const MODEL_WITH_CONSTRAINTS = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.constraints:1.0.0#> .

:VehicleAspect a samm:Aspect ;
   samm:properties ( :speed :serialNumber :pinCode ) ;
   samm:operations () ;
   samm:events () .

:speed a samm:Property ;
   samm:characteristic :SpeedTrait .

:SpeedTrait a samm-c:Trait ;
   samm-c:baseCharacteristic :SpeedBase ;
   samm-c:constraint :SpeedRange .

:SpeedBase a samm:Characteristic ;
   samm:dataType xsd:integer .

:SpeedRange a samm-c:RangeConstraint ;
   samm-c:minValue 0 ;
   samm-c:maxValue 300 ;
   samm-c:lowerBoundDefinition samm-c:AT_LEAST ;
   samm-c:upperBoundDefinition samm-c:AT_MOST .

:serialNumber a samm:Property ;
   samm:characteristic :SerialTrait .

:SerialTrait a samm-c:Trait ;
   samm-c:baseCharacteristic :SerialBase ;
   samm-c:constraint :SerialRegex .

:SerialBase a samm:Characteristic ;
   samm:dataType xsd:string .

:SerialRegex a samm-c:RegularExpressionConstraint ;
   samm:value "^[A-Z]{3}-[0-9]{4}$" .

:pinCode a samm:Property ;
   samm:characteristic :PinTrait .

:PinTrait a samm-c:Trait ;
   samm-c:baseCharacteristic :SerialBase ;
   samm-c:constraint :PinLength .

:PinLength a samm-c:LengthConstraint ;
   samm-c:minValue 4 ;
   samm-c:maxValue 6 .
`;

const MODEL_WITH_STATE_CHARACTERISTIC = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.states:1.0.0#> .

:DeviceAspect a samm:Aspect ;
   samm:properties ( :deviceState ) ;
   samm:operations () ;
   samm:events () .

:deviceState a samm:Property ;
   samm:characteristic :DeviceStateCharacteristic .

:DeviceStateCharacteristic a samm-c:State ;
   samm:dataType xsd:string ;
   samm-c:defaultValue :Standby ;
   samm-c:values ( :Off :Standby :Active ) .

:Off a samm:Value ;
   samm:name "Off" .

:Standby a samm:Value ;
   samm:name "Standby" .

:Active a samm:Value ;
   samm:name "Active" .
`;

test.describe('SAMM Specification - Advanced Meta-Model Elements', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should load and render Measurement, Duration, and Quantifiable characteristics with units', async () => {
    await app.loadModel(MODEL_WITH_SAMM_UNITS);

    // Shapes should exist on canvas
    await app.shapeExists('SensorAspect', true);
    await app.shapeExists('temperature', true);
    await app.shapeExists('TemperatureMeasurement', true);
    await app.shapeExists('operatingDuration', true);
    await app.shapeExists('OperatingDuration', true);
    await app.shapeExists('batteryLevel', true);
    await app.shapeExists('BatteryLevel', true);

    const aspect = await app.getAspect();
    expect(aspect.name).toBe('SensorAspect');
    expect(aspect.properties).toHaveLength(3);

    // Verify unit bindings in RDF output
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm-c:Measurement');
    expect(rdf).toContain('samm-c:unit unit:degreeCelsius');
    expect(rdf).toContain('samm-c:Duration');
    expect(rdf).toContain('samm-c:unit unit:hour');
    expect(rdf).toContain('samm-c:Quantifiable');
    expect(rdf).toContain('samm-c:unit unit:percent');
  });

  test('should load and render RangeConstraint, RegularExpressionConstraint, and LengthConstraint', async () => {
    await app.loadModel(MODEL_WITH_CONSTRAINTS);

    await app.shapeExists('VehicleAspect', true);
    await app.shapeExists('speed', true);
    await app.shapeExists('SpeedTrait', true);
    await app.shapeExists('serialNumber', true);
    await app.shapeExists('SerialTrait', true);
    await app.shapeExists('pinCode', true);
    await app.shapeExists('PinTrait', true);

    const aspect = await app.getAspect();
    expect(aspect.name).toBe('VehicleAspect');
    expect(aspect.properties).toHaveLength(3);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm-c:RangeConstraint');
    expect(rdf).toContain('samm-c:minValue');
    expect(rdf).toContain('samm-c:maxValue');
    expect(rdf).toContain('samm-c:lowerBoundDefinition samm-c:AT_LEAST');
    expect(rdf).toContain('samm-c:upperBoundDefinition samm-c:AT_MOST');
    expect(rdf).toContain('samm-c:RegularExpressionConstraint');
    expect(rdf).toContain('^[A-Z]{3}-[0-9]{4}$');
    expect(rdf).toContain('samm-c:LengthConstraint');
  });

  test('should load and render State characteristic with default value and enumeration values', async () => {
    await app.loadModel(MODEL_WITH_STATE_CHARACTERISTIC);

    await app.shapeExists('DeviceAspect', true);
    await app.shapeExists('deviceState', true);
    await app.shapeExists('DeviceStateCharacteristic', true);

    const aspect = await app.getAspect();
    expect(aspect.name).toBe('DeviceAspect');
    expect(aspect.properties).toHaveLength(1);

    const stateChar = aspect.properties[0].characteristic;
    expect(stateChar.name).toBe('DeviceStateCharacteristic');

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm-c:State');
    expect(rdf).toContain('samm-c:defaultValue :Standby');
    expect(rdf).toMatch(/samm-c:values\s*\(\s*:Off\s+:Standby\s+:Active\s*\)/);
  });
});
