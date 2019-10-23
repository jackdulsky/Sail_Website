import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubCashComponent } from './club-cash.component';

describe('ClubCashComponent', () => {
  let component: ClubCashComponent;
  let fixture: ComponentFixture<ClubCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClubCashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
