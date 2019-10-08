import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NameenterpopComponent } from "./nameenterpop.component";

describe("NameenterspopComponent", () => {
  let component: NameenterpopComponent;
  let fixture: ComponentFixture<NameenterpopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NameenterpopComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameenterpopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
