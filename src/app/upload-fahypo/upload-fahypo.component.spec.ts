import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFAHYPOComponent } from './upload-fahypo.component';

describe('UploadFAHYPOComponent', () => {
  let component: UploadFAHYPOComponent;
  let fixture: ComponentFixture<UploadFAHYPOComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadFAHYPOComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFAHYPOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
