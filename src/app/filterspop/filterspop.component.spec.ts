import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterspopComponent } from './filterspop.component';

describe('FilterspopComponent', () => {
  let component: FilterspopComponent;
  let fixture: ComponentFixture<FilterspopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterspopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterspopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
