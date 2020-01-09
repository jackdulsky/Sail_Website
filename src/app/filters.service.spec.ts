import { TestBed } from "@angular/core/testing";
import { AppRoutingModule } from "./app-routing.module";

import { FiltersService } from "./filters.service";
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "./pull-data.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
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
} from "./testVariables";
describe("FiltersService", () => {
  const fakeActivatedRoute = {
    snapshot: { data: {} }
  } as ActivatedRoute;
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        PullDataService,
        { provide: Router },
        { provide: ActivatedRoute, useValue: AppRoutingModule },
        { provide: MatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
  );

  it("should be created", () => {
    const service: FiltersService = TestBed.get(FiltersService);
    service.pullStructure = pullStructure;
    service.pullDataType = pullDataType;
    service.pullBin = pullBin;
    service.pullNavigation = pullNavigation;
    service.pullNavigationElement = pullNavigationElement;
    service.pullAttributeType = pullAttributeType;
    service.pullAttribute = pullAttribute;
    service.pullUIType = pullUIType;
    service.reportTabs = reportTabs;
    service.playerImageURLs = playerImageURLs;
    service.teamsMap = teamsMap;
    service.reportTabLocation = reportTabLocation;
    service.pullValueMap = pullValueMap;
    service.pullOrderMap = pullOrderMap;
    service.reportURL = reportURL;
    service.reportReportsOnly = reportReportsOnly;
    service.reportReportsStructure = reportReportsStructure;
    service.positionHItem = positionHItem;
    service.positionHierarchy = positionHierarchy;
    service.pullPlayers = pullPlayers;
    expect(service).toBeTruthy();
  });
});
