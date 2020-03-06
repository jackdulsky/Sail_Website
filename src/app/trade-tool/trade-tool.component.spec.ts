import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeToolComponent } from './trade-tool.component';

describe('TradeToolComponent', () => {
  let component: TradeToolComponent;
  let fixture: ComponentFixture<TradeToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
