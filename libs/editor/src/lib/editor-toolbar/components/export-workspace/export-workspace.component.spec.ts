import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportWorkspaceComponent } from './export-workspace.component';

describe('ExportWorkspaceComponent', () => {
  let component: ExportWorkspaceComponent;
  let fixture: ComponentFixture<ExportWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportWorkspaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
