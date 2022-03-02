import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuredValuePropertyFieldComponent } from './structured-value-property-field.component';

describe('StructuredValuePropertyFieldComponent', () => {
  let component: StructuredValuePropertyFieldComponent;
  let fixture: ComponentFixture<StructuredValuePropertyFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructuredValuePropertyFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuredValuePropertyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
