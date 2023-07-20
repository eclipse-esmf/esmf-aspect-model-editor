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

import {BaseMetaModelElement, DefaultAspect, DefaultCharacteristic, DefaultEntity, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {provideMockObject} from 'jest-helpers';
import {mxgraph} from 'mxgraph-factory';
import {ConnectWithDialogComponent} from './connect-with-dialog.component';

type Cell = Partial<mxgraph.mxCell & {getMetaModelElement: () => {element: BaseMetaModelElement}}>;

const cell: Cell = {
  getMetaModelElement: () => new DefaultAspect('aspect', 'aspect', 'aspect', [], []) as any,
  style: 'aspect',
};
const cells: Cell[] = [
  {style: 'property', getMetaModelElement: () => ({element: new DefaultProperty('property', 'property', 'property', null)} as any)},
  {
    style: 'characteristic',
    getMetaModelElement: () => ({element: new DefaultCharacteristic('characteristic', 'characteristic', 'characteristic')} as any),
  },
  {style: 'entity', getMetaModelElement: () => ({element: new DefaultEntity('entity', 'entity', 'entity', [])} as any)},
];

describe('RdfNodeService', () => {
  let component: ConnectWithDialogComponent;
  let fixture: ComponentFixture<ConnectWithDialogComponent>;
  let mxGraphService: MxGraphService;
  let dialogRef: MatDialogRef<ConnectWithDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectWithDialogComponent],
      imports: [CommonModule, BrowserAnimationsModule, MatDialogModule, MatFormFieldModule, MatInputModule],
      providers: [
        {
          provide: MxGraphService,
          useValue: provideMockObject(MxGraphService),
        },
        {
          provide: MatDialogRef,
          useValue: provideMockObject(MatDialogRef),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: cell,
        },
      ],
    });

    mxGraphService = TestBed.inject(MxGraphService);
    mxGraphService.getAllCells = jest.fn(() => cells as any[]);

    dialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(ConnectWithDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('getClass', () => {
    it('should return property', () => {
      expect(component.getClass(cells[0].getMetaModelElement().element)).toBe('property');
    });

    it('should return characteristic', () => {
      expect(component.getClass(cells[1].getMetaModelElement().element)).toBe('characteristic');
    });

    it('should return entity', () => {
      expect(component.getClass(cells[2].getMetaModelElement().element)).toBe('entity');
    });
  });

  describe('getFirstLetter', () => {
    it('should return P', () => {
      expect(component.getFirstLetter(cells[0].getMetaModelElement().element)).toBe('P');
    });

    it('should return C', () => {
      expect(component.getFirstLetter(cells[1].getMetaModelElement().element)).toBe('C');
    });

    it('should return E', () => {
      expect(component.getFirstLetter(cells[2].getMetaModelElement().element)).toBe('E');
    });
  });

  describe('isFiltered', () => {
    it('should return true', () => {
      const result = component.isFiltered(
        {
          model: new DefaultProperty('property', 'property', 'property', null),
          cell: {} as any,
        },
        'property'
      );
      expect(result).toBe(true);
    });

    it('should return true', () => {
      const result = component.isFiltered(
        {
          model: new DefaultProperty('property', 'property', 'property', null),
          cell: {} as any,
        },
        'aspect'
      );
      expect(result).toBe(false);
    });
  });

  describe('isSelected', () => {
    it('should return false', () => {
      component.selectedElement = {
        model: new DefaultProperty('property', 'property', 'property', null),
        cell: {} as any,
      };
      const result = component.isSelected({
        model: new DefaultProperty('non-property', 'non-property', 'non-property', null),
        cell: {} as any,
      });
      expect(result).toBe(false);
    });

    it('should return true', () => {
      component.selectedElement = {
        model: new DefaultProperty('property', 'property', 'property', null),
        cell: {} as any,
      };
      const result = component.isSelected(component.selectedElement);
      expect(result).toBe(true);
    });
  });

  describe('connect', () => {
    it('should not call close', () => {
      component.connect();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should call close', () => {
      component.selectedElement = {
        model: new DefaultProperty('property', 'property', 'property', null),
        cell: {} as any,
      };
      component.connect();
      expect(dialogRef.close).toHaveBeenCalledWith({
        model: new DefaultProperty('property', 'property', 'property', null),
        cell: {} as any,
      });
    });
  });
});
