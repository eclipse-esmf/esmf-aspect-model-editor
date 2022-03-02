import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {BciSharedModule} from '@bci-web-core/core';
import {HelpRoutingModule} from '../help/help-routing.module';
import {NotificationsComponent} from './notifications.component';

@NgModule({
  declarations: [NotificationsComponent],
  imports: [CommonModule, BciSharedModule, HelpRoutingModule, MatDialogModule, MatTableModule],
  exports: [NotificationsComponent],
})
export class NotificationsModule {}
