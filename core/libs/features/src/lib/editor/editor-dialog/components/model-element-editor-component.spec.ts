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

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../editor-model.service';
import {ModelElementEditorComponent} from './model-element-editor-component';

@Component({
  selector: 'ame-test-model-element-editor',
  template: '',
  imports: [],
})
class TestModelElementEditorComponent extends ModelElementEditorComponent<DefaultProperty> {}

describe('ModelElementEditorComponent', () => {
  let component: TestModelElementEditorComponent;
  let fixture: ComponentFixture<TestModelElementEditorComponent>;
  let editorModelService: EditorModelService;

  const sampleProperty = new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#testProp',
    name: 'testProp',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModelElementEditorComponent],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(sampleProperty)),
        }),
      ],
    });

    editorModelService = TestBed.inject(EditorModelService);
    fixture = TestBed.createComponent(TestModelElementEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create and inject EditorModelService', () => {
    expect(component).toBeTruthy();
    expect(component.metaModelDialogService).toBe(editorModelService);
  });

  it('should strip urn definition prefix via getValueWithoutUrnDefinition', () => {
    expect(component.getValueWithoutUrnDefinition('urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#string')).toBe('string');
    expect(component.getValueWithoutUrnDefinition('simpleValue')).toBe('simpleValue');
  });

  it('should retrieve and set metaModelElement from service', () => {
    component.getMetaModelData().subscribe(element => {
      expect(element).toBe(sampleProperty);
      expect(component.metaModelElement).toBe(sampleProperty);
    });
  });
});
