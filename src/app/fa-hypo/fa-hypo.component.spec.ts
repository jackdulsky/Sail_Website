import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaHypoComponent } from './fa-hypo.component';

describe('FaHypoComponent', () => {
  let component: FaHypoComponent;
  let fixture: ComponentFixture<FaHypoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaHypoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaHypoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
