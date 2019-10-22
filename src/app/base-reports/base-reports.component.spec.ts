import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseReportsComponent } from './base-reports.component';

describe('BaseReportsComponent', () => {
  let component: BaseReportsComponent;
  let fixture: ComponentFixture<BaseReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
