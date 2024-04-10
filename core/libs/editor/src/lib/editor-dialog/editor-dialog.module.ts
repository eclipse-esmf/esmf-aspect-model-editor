/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {EditorModelService} from './editor-model.service';
import {MatChipsModule} from '@angular/material/chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {RenameModelComponent} from '../rename-model/rename-model.component';
import {EntityInstancePipe} from './pipes';
import {
  AbstractEntityComponent,
  AbstractPropertyComponent,
  AspectComponent,
  BaseInputComponent,
  CharacteristicComponent,
  CharacteristicNameDropdownFieldComponent,
  CodeInputFieldComponent,
  ConstraintComponent,
  ConstraintNameDropdownFieldComponent,
  ConversionFactorInputFieldComponent,
  DataTypeInputFieldComponent,
  DefaultValueEntityInputFieldComponent,
  DefaultValueInputFieldComponent,
  DescriptionInputFieldComponent,
  ElementCharacteristicInputFieldComponent,
  ElementListComponent,
  EncodingInputFieldComponent,
  EntityComponent,
  EntityExtendsFieldComponent,
  EventComponent,
  ExampleValueInputFieldComponent,
  InputChiplistFieldComponent,
  IntegerInputFieldComponent,
  LanguageCodeInputFieldComponent,
  LeftInputFieldComponent,
  LocaleCodeInputFieldComponent,
  LocateElementComponent,
  LowerBoundInputFieldComponent,
  MaxLengthInputFieldComponent,
  MaxValueInputFieldComponent,
  MinLengthInputFieldComponent,
  MinValueInputFieldComponent,
  ModelElementParserPipe,
  NameInputFieldComponent,
  NumericConversionFactorInputFieldComponent,
  OperationComponent,
  OutputInputFieldComponent,
  PreferredNameInputFieldComponent,
  PropertiesButtonComponent,
  PropertiesModalComponent,
  PropertyComponent,
  QuantityKindsInputFieldComponent,
  ReferenceUnitInputFieldComponent,
  RegularExpressionValueInputFieldComponent,
  RightInputFieldComponent,
  ScaleInputFieldComponent,
  SeeInputFieldComponent,
  ShapeSettingsComponent,
  StateCharacteristicComponent,
  StructuredValueComponent,
  StructuredValuePropertiesComponent,
  StructuredValuePropertyFieldComponent,
  SymbolInputFieldComponent,
  TraitCharacteristicComponent,
  UnitComponent,
  UnitInputFieldComponent,
  UpperBoundInputFieldComponent,
  ValuesInputFieldComponent,
} from './components';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {CounterPipe} from '../../../../shared/src/lib/pipes/counter.pipe';
import {SaveModelDialogComponent} from '../save-model-dialog/save-model-dialog.component';
import {LargeFileWarningComponent} from '../large-file-warning-dialog/large-file-warning-dialog';
import {SharedSettingsTitleComponent} from './components/shape-settings/shared-settings-title/shared-settings-title.component';
import {LanguageTranslateModule} from '@ame/translation';
import {ElementIconComponent} from '../../../../shared/src/lib/components/element/element.component';
import {MatDividerModule} from '@angular/material/divider';
import {
  EntityInstanceComponent,
  EntityInstanceModalComponent,
  EntityInstanceModalTableComponent,
  EntityInstanceSearchBarComponent,
  EntityInstanceTableComponent,
  EntityInstanceViewComponent,
} from './components/entity-instance';

@NgModule({
  providers: [EditorModelService],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule,
    CounterPipe,
    LanguageTranslateModule,
    ElementIconComponent,
    MatDividerModule,
  ],
  declarations: [
    AspectComponent,
    AbstractPropertyComponent,
    AbstractEntityComponent,
    CharacteristicComponent,
    ConfirmDialogComponent,
    RenameModelComponent,
    ConstraintComponent,
    ShapeSettingsComponent,
    EntityComponent,
    EntityInstanceModalComponent,
    EntityInstanceModalTableComponent,
    EntityInstancePipe,
    EntityInstanceSearchBarComponent,
    EntityInstanceTableComponent,
    EntityInstanceViewComponent,
    EventComponent,
    PropertiesButtonComponent,
    PropertiesModalComponent,
    PropertyComponent,
    OperationComponent,
    StateCharacteristicComponent,
    UnitComponent,
    NameInputFieldComponent,
    PreferredNameInputFieldComponent,
    DescriptionInputFieldComponent,
    SeeInputFieldComponent,
    DataTypeInputFieldComponent,
    ElementCharacteristicInputFieldComponent,
    ValuesInputFieldComponent,
    BaseInputComponent,
    UnitInputFieldComponent,
    LeftInputFieldComponent,
    RightInputFieldComponent,
    DefaultValueEntityInputFieldComponent,
    DefaultValueInputFieldComponent,
    MinValueInputFieldComponent,
    MaxValueInputFieldComponent,
    LowerBoundInputFieldComponent,
    UpperBoundInputFieldComponent,
    RegularExpressionValueInputFieldComponent,
    LocaleCodeInputFieldComponent,
    MinLengthInputFieldComponent,
    MaxLengthInputFieldComponent,
    LanguageCodeInputFieldComponent,
    IntegerInputFieldComponent,
    ScaleInputFieldComponent,
    EncodingInputFieldComponent,
    ExampleValueInputFieldComponent,
    OutputInputFieldComponent,
    InputChiplistFieldComponent,
    SymbolInputFieldComponent,
    ReferenceUnitInputFieldComponent,
    ConversionFactorInputFieldComponent,
    NumericConversionFactorInputFieldComponent,
    QuantityKindsInputFieldComponent,
    CodeInputFieldComponent,
    TraitCharacteristicComponent,
    CharacteristicNameDropdownFieldComponent,
    ConstraintNameDropdownFieldComponent,
    EntityInstanceComponent,
    EntityInstanceModalTableComponent,
    StructuredValueComponent,
    StructuredValuePropertyFieldComponent,
    StructuredValuePropertiesComponent,
    EntityExtendsFieldComponent,
    ElementListComponent,
    ModelElementParserPipe,
    LocateElementComponent,
    SaveModelDialogComponent,
    LargeFileWarningComponent,
    SharedSettingsTitleComponent,
  ],
  exports: [ShapeSettingsComponent, ModelElementParserPipe],
})
export class EditorDialogModule {}
