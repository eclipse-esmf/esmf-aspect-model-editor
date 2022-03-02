import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuredValueComponent } from './structured-value.component';

describe('StructuredValueComponent', () => {
  let component: StructuredValueComponent;
  let fixture: ComponentFixture<StructuredValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructuredValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuredValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
