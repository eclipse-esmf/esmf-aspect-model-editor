/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BciSharedModule} from '@bci-web-core/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {LoadModelDialogComponent} from './load-model-dialog.component';

@NgModule({
  imports: [CommonModule, BciSharedModule, MatDialogModule, MatInputModule],
  declarations: [LoadModelDialogComponent],
  exports: [LoadModelDialogComponent],
})
export class LoadModelDialogModule {}
