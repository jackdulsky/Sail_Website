import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FilterBarComponent } from "./filter-bar.component";
import { RouterModule } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { AppRoutingModule } from "../app-routing.module";
import { BodyComponent } from "../body/body.component";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatFormFieldModule, MatSelectModule } from "@angular/material";
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";

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

describe("FilterBarComponent", () => {
  let component: FilterBarComponent;
  let fixture: ComponentFixture<FilterBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule,
        ReactiveFormsModule,
        MatDialogModule,
        NgxMatSelectSearchModule,
        RouterTestingModule
      ],
      declarations: [FilterBarComponent],
      providers: [
        { provide: MatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBarComponent);
    component = fixture.componentInstance;

    component.filterService.pullData.GUID = "0001";
    component.filterService.pullStructure = pullStructure;
    component.filterService.pullDataType = pullDataType;
    component.filterService.pullBin = pullBin;
    component.filterService.pullNavigation = pullNavigation;
    component.filterService.pullNavigationElement = pullNavigationElement;
    component.filterService.pullAttributeType = pullAttributeType;
    component.filterService.pullAttribute = pullAttribute;
    component.filterService.pullUIType = pullUIType;
    component.filterService.reportTabs = reportTabs;
    component.filterService.playerImageURLs = playerImageURLs;
    component.filterService.teamsMap = teamsMap;
    component.filterService.reportTabLocation = reportTabLocation;
    component.filterService.pullValueMap = pullValueMap;
    component.filterService.pullOrderMap = pullOrderMap;
    component.filterService.reportURL = reportURL;
    component.filterService.reportReportsOnly = reportReportsOnly;
    component.filterService.reportReportsStructure = reportReportsStructure;
    component.filterService.positionHItem = positionHItem;
    component.filterService.positionHierarchy = positionHierarchy;
    component.filterService.pullPlayers = pullPlayers;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
