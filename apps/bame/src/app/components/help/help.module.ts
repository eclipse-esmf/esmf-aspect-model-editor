import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DocumentComponent} from './document.component';
import {HelpRoutingModule} from './help-routing.module';
import {BciSharedModule} from '@bci-web-core/core';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [DocumentComponent],
  imports: [CommonModule, BciSharedModule, HelpRoutingModule, MatDialogModule],
  exports: [DocumentComponent],
})
export class HelpModule {}
