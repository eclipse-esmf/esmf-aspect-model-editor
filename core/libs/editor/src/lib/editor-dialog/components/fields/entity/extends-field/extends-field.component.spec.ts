import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendsFieldComponent } from './extends-field.component';

describe('ExtendsFieldComponent', () => {
  let component: ExtendsFieldComponent;
  let fixture: ComponentFixture<ExtendsFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtendsFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
