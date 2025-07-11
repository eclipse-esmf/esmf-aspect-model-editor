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

const xsdDataTypes = {
  anyURI: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#anyURI', description: 'Absolute or relative URIs and IRIs'},
  base64Binary: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#base64Binary',
    description: 'Base64-encoded binary data',
  },
  boolean: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#boolean', description: 'true, false'},
  byte: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#byte', description: '-128…+127 (8 bit)'},
  curie: {
    isDefinedBy: `urn:samm:org.eclipse.esmf.samm:meta-model:MODEL_VERSION#curie`,
    description: 'Compact URI/IRI (well-known prefix + element name)',
  },
  date: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#date',
    description: 'Dates (yyyy-mm-dd) with or without timezone',
  },
  dateTime: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#dateTime',
    description: 'Date and time with or without timezone',
  },
  decimal: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#decimal',
    description: 'Arbitrary-precision decimal numbers',
  },
  dataTimeStamp: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#dataTimeStamp',
    description: 'Date and time with required timezone',
  },
  dayTimeDuration: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#dayTimeDuration',
    description: 'Duration of time (days, hours, minutes, seconds only)',
  },
  double: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#double',
    description: '64-bit floating point numbers incl. ±Inf, ±0, NaN',
  },
  duration: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#duration', description: 'Duration of time'},
  float: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#float',
    description: '32-bit floating point numbers incl. ±Inf, ±0, NaN',
  },
  gDay: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#gDay', description: 'Gregorian calendar day of the month'},
  gMonth: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#gMonth', description: 'Gregorian calendar month'},
  gMonthDay: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#gMonthDay',
    description: 'Gregorian calendar month and day',
  },
  gYearMonth: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#gYearMonth',
    description: 'Gregorian calendar year and month',
  },
  hexBinary: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#hexBinary', description: 'Hex-encoded binary data'},
  integer: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#integer', description: 'Arbitrary-size integer numbers'},
  int: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#int', description: '2147483648…+2147483647 (32 bit)'},
  positiveInteger: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#positiveInteger',
    description: 'Integer numbers >0',
  },
  langString: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#langString', description: 'Strings with language tags'},
  long: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#long',
    description: '-9223372036854775808…+9223372036854775807 (64 bit)',
  },
  negativeInteger: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#negativeInteger',
    description: 'Integer numbers <0',
  },
  nonPositiveInteger: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger',
    description: 'Integer numbers ≥0',
  },
  nonNegativeInteger: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger',
    description: 'Integer numbers ≤0',
  },
  short: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#short', description: '-32768…+32767 (16 bit)'},
  string: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#string', description: 'Character strings'},
  time: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#time',
    description: 'Times (hh:mm:ss.sss…) with or without timezone',
  },
  unsignedInt: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#unsignedInt', description: '0…4294967295 (32 bit)'},
  unsignedByte: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#unsignedByte', description: '0…255 (8 bit)'},
  unsignedLong: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#unsignedLong',
    description: '0…18446744073709551615 (64 bit)',
  },
  unsignedShort: {isDefinedBy: 'http://www.w3.org/2001/XMLSchema#unsignedShort', description: '0…65535 (16 bit)'},
  yearMonthDuration: {
    isDefinedBy: 'http://www.w3.org/2001/XMLSchema#yearMonthDuration',
    description: 'Duration of time (months and years only)',
  },
};

export class XsdDataTypes {
  constructor(private modelVersion: string) {
    xsdDataTypes['curie'].isDefinedBy = (<string>xsdDataTypes['curie'].isDefinedBy).replace('MODEL_VERSION', modelVersion);
  }

  getDataTypes(): any {
    return xsdDataTypes;
  }

  getDataType(key: string): any {
    return xsdDataTypes[key];
  }
}
