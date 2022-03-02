import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuredValuePropertiesComponent } from './structured-value-properties.component';

describe('StructuredValuePropertiesComponent', () => {
  let component: StructuredValuePropertiesComponent;
  let fixture: ComponentFixture<StructuredValuePropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructuredValuePropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuredValuePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
