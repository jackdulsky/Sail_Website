import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FolderselectpopComponent } from "./folderselectpop.component";

describe("SettingspopComponent", () => {
  let component: FolderselectpopComponent;
  let fixture: ComponentFixture<FolderselectpopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FolderselectpopComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderselectpopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
