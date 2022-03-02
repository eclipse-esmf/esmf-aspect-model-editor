import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingDialogComponent} from './components/settings-dialog/setting-dialog.component';
import {BciSharedModule} from '@bci-web-core/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ConfigurationComponent, LanguageSettingsComponent, NamespaceComponent, NamespaceConfirmationModalComponent} from './components';

@NgModule({
  declarations: [
    SettingDialogComponent,
    LanguageSettingsComponent,
    NamespaceComponent,
    ConfigurationComponent,
    NamespaceConfirmationModalComponent,
  ],
  imports: [
    CommonModule,
    BciSharedModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  exports: [SettingDialogComponent],
  entryComponents: [SettingDialogComponent],
})
export class SettingDialogModule {}
