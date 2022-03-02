import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipUploaderComponent } from './zip-uploader.component';

describe('ZipUploaderComponent', () => {
  let component: ZipUploaderComponent;
  let fixture: ComponentFixture<ZipUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZipUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZipUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
