/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BciSharedModule} from '@bci-web-core/core';
import {FooterComponent} from './footer.component';
import {CorporateInformationDialogComponent} from './corporate-information-dialog/corporate-information-dialog.component';
import {LegalNoticeDialogComponent} from './legal-notice-dialog/legal-notice-dialog.component';

@NgModule({
  imports: [CommonModule, BciSharedModule],
  exports: [FooterComponent],
  declarations: [FooterComponent, CorporateInformationDialogComponent, LegalNoticeDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FooterModule {}
