import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingFAHYPOComponent } from './saving-fahypo.component';

describe('SavingFAHYPOComponent', () => {
  let component: SavingFAHYPOComponent;
  let fixture: ComponentFixture<SavingFAHYPOComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingFAHYPOComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingFAHYPOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
