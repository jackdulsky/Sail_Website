import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NewpageComponent } from "./newpage.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { Observable, of } from "rxjs";
import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import {
  pullStructure,
  pullDataType,
  pullBin,
  pullNavigation,
  pullNavigationElement,
  pullAttributeType,
  pullAttribute,
  pullUIType,
  reportTabs,
  playerImageURLs,
  teamsMap,
  reportTabLocation,
  pullValueMap,
  pullOrderMap,
  reportURL,
  reportReportsOnly,
  reportReportsStructure,
  positionHItem,
  positionHierarchy,
  pullPlayers
} from "../testVariables";
describe("NewpageComponent", () => {
  let component: NewpageComponent;
  let fixture: ComponentFixture<NewpageComponent>;
  const router = jasmine.createSpyObj("Router", ["navigate"]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule,
        RouterTestingModule.withRoutes([])
      ],
      declarations: [NewpageComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ user: "00000000000001" }) }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewpageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
