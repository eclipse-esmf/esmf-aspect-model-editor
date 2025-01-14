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

import {LanguageTranslateModule} from '@ame/translation';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ElementIconComponent} from '../../../../shared/src/lib/components/element/element.component';
import {CounterPipe} from '../../../../shared/src/lib/pipes/counter.pipe';
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
import {
  EntityInstanceComponent,
  EntityInstanceModalComponent,
  EntityInstanceModalTableComponent,
  EntityInstanceSearchBarComponent,
  EntityInstanceTableComponent,
  EntityInstanceViewComponent,
} from './components/entity-instance';
import {SharedSettingsTitleComponent} from './components/shape-settings/shared-settings-title/shared-settings-title.component';
import {EditorModelService} from './editor-model.service';
import {EntityInstancePipe} from './pipes';

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
    ModelElementParserPipe,
    EntityInstancePipe,
  ],
  declarations: [
    AspectComponent,
    AbstractPropertyComponent,
    AbstractEntityComponent,
    CharacteristicComponent,
    ConstraintComponent,
    ShapeSettingsComponent,
    EntityComponent,
    EntityInstanceModalComponent,
    EntityInstanceModalTableComponent,
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
    LocateElementComponent,
    SharedSettingsTitleComponent,
  ],
  exports: [ShapeSettingsComponent],
})
export class EditorDialogModule {}
