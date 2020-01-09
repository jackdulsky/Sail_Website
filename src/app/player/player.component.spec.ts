import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { SortPipe } from "../sort.pipe";
import { PlayerComponent } from "./player.component";
import { RouterModule } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { AppRoutingModule } from "../app-routing.module";
import { BodyComponent } from "../body/body.component";
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
import { ChangeDetectorRef } from "@angular/core";
import { Location } from "@angular/common";
import { routes } from "../app-routing.module";
import { SettingComponent } from "../setting/setting.component";
import { FilterBarComponent } from "../filter-bar/filter-bar.component";
import { ReportComponent } from "../report/report.component";
import { BaseReportsComponent } from "../base-reports/base-reports.component";
import { ClubComponent } from "../club/club.component";
import { LoadingComponent } from "../loading/loading.component";
import { ReportUploadComponent } from "../report-upload/report-upload.component";
import { CashComponent } from "../cash/cash.component";
import { HomeComponent } from "../home/home.component";
import { NewpageComponent } from "../newpage/newpage.component";
import { ExtraOptions } from "@angular/router";
import { ExcelComponent } from "../excel/excel.component";

describe("PlayerComponent", () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;
  let router: Router;
  let location: Location;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule,
        ReactiveFormsModule,
        MatDialogModule,
        RouterTestingModule.withRoutes([
          {
            path: "player",
            component: PlayerComponent,
            children: [
              { path: "report/:reportid", component: ReportComponent },
              {
                path: "base-reports/:base-reportsid",
                component: BaseReportsComponent
              },
              {
                path: "",
                redirectTo: "base-reports/7",
                pathMatch: "full"
              }
            ]
          }
        ])
      ],
      declarations: [
        ReportComponent,
        BaseReportsComponent,
        PlayerComponent,
        SortPipe
      ],
      providers: [
        ChangeDetectorRef,
        BodyComponent,
        { provide: Router, useValue: { url: "/player/report/2680" } },
        { provide: ActivatedRoute, useValue: AppRoutingModule }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    fixture = TestBed.createComponent(PlayerComponent);
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
