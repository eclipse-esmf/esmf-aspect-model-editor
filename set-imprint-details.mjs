/*
 *  Copyright (C) 2022 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {createWriteStream} from "fs";

const targetPath = `./apps/bame/src/assets/imprint-details.json`;
const template = ` {
  "name": "Aspect Model Editor",
  "version": "${process.env.ameVersion} (based on BAMM 1.0.0)",
  "contactAtBosch": "Nexeed Helpdesk",
  "contactMail": "Nexeed.Helpdesk@de.bosch.com",
  "address": {
    "name": "Robert Bosch Manufacturing Solutions GmbH",
      "street": "Wernerstraße 51",
      "city": "70469 Stuttgart",
      "country": "GERMANY"
  },
  "boardOfManagement": "Günter Krenz, Dierk Göckel, Sven Hamann, Johannes Ardenne"
}`;

const writeStream = createWriteStream(targetPath, {encoding: 'utf-8', flags: 'w', autoClose: true});
writeStream.write(template);
writeStream.end();
writeStream.close();
