import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SavedfilterspopComponent } from "./savedfilterspop.component";

describe("SavedfilterspopComponent", () => {
  let component: SavedfilterspopComponent;
  let fixture: ComponentFixture<SavedfilterspopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavedfilterspopComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedfilterspopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
