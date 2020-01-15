import {
  async,
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync
} from "@angular/core/testing";

import { ClubComponent } from "./club.component";
import { SortPipe } from "../sort.pipe";
import { RouterModule } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { AppRoutingModule } from "../app-routing.module";
import { BodyComponent } from "../body/body.component";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatFormFieldModule, MatSelectModule } from "@angular/material";
import { FilterPipe2 } from "../filter2.pipe";
import { MatMenuModule } from "@angular/material/menu";
import { NgCircleProgressModule } from "ng-circle-progress";
import { routes } from "../app-routing.module";
import { PullDataService } from "../pull-data.service";
import { FiltersService } from "../filters.service";
import { Location } from "@angular/common";
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
  pullPlayers,
  teams
} from "../testVariables";
import { ChangeDetectorRef } from "@angular/core";
import { fromEventPattern } from "rxjs";
import { SettingComponent } from "../setting/setting.component";
import { FilterBarComponent } from "../filter-bar/filter-bar.component";
import { ReportComponent } from "../report/report.component";
import { BaseReportsComponent } from "../base-reports/base-reports.component";
import { LoadingComponent } from "../loading/loading.component";
import { ReportUploadComponent } from "../report-upload/report-upload.component";
import { CashComponent } from "../cash/cash.component";
import { HomeComponent } from "../home/home.component";
import { NewpageComponent } from "../newpage/newpage.component";
import { ExtraOptions } from "@angular/router";
import { ExcelComponent } from "../excel/excel.component";
import { By } from "@angular/platform-browser";

describe("ClubComponent", () => {
  let component: ClubComponent;
  let fixture: ComponentFixture<ClubComponent>;
  let router: Router;
  let location: Location;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule,
        ReactiveFormsModule,
        MatDialogModule,
        NgxMatSelectSearchModule,
        RouterTestingModule.withRoutes([
          {
            path: "club",
            component: ClubComponent,
            children: [
              { path: "report/:reportid", component: ReportComponent },
              {
                path: "base-reports/:base-reportsid",
                component: BaseReportsComponent
              },
              {
                path: "",
                redirectTo: "report/2679",
                pathMatch: "full"
              }
            ]
          }
        ]),
        MatSelectModule,
        MatMenuModule,
        NgCircleProgressModule
      ],
      declarations: [
        ReportComponent,
        BaseReportsComponent,
        ClubComponent,
        BodyComponent,
        SortPipe,
        FilterPipe2
      ],
      providers: [
        ChangeDetectorRef,
        BodyComponent,
        { provide: Router, useValue: { url: "/club" } },
        { provide: ActivatedRoute, useValue: AppRoutingModule }
      ]
      // files: ["../../styles.css"]
    }).compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    fixture = TestBed.createComponent(ClubComponent);
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
    component.filterService.teams = teams;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("check tab default highlight", () => {
    let highlihgtedTab = document.getElementById(
      component.clubTabSelected + "clubBarHighlightid"
    );
    //check the tab is correct
    expect(component.clubTabSelected).toBe("4");

    //check that the text is main
    expect(highlihgtedTab.textContent).toContain("Main");

    //check that the tab has appropriate css
    expect(highlihgtedTab.style.backgroundColor).toBe("rgb(242, 242, 242)");
    expect(highlihgtedTab.style.borderBottom).toBe("4px solid lightskyblue");
  });

  it("check tab 5 click", () => {
    document.getElementById("5clubBarHighlightid").click();
    //check the tab is correct
    expect(component.clubTabSelected).toBe("5");

    let highlihgtedTab = document.getElementById(
      component.clubTabSelected + "clubBarHighlightid"
    );
    //check that the text is main
    expect(highlihgtedTab.textContent).toContain(reportTabs["5"]["Label"]);

    //check that the tab has appropriate css
    setTimeout(() => {
      expect(highlihgtedTab.style.backgroundColor).toBe("rgb(242, 242, 242)");
      expect(highlihgtedTab.style.borderBottom).toBe("4px solid lightskyblue");
    }, 100);
  });

  it("clicking year box variable Changed", async(() => {
    //Checking Year box and checking if the variable was turned to true to show the years
    let yearBox: HTMLElement = document.getElementsByClassName(
      "yearBox"
    )[0] as HTMLElement;
    expect(component.showYear).toBe(false);
    yearBox.click();
    expect(component.showYear).toBe(true);
  }));
  it("clicking year box called function", async(() => {
    spyOn(component, "showYearList");
    //Checking Year box and checking if the  method to change the variable was called
    let yearBox: HTMLElement = document.getElementsByClassName(
      "yearBox"
    )[0] as HTMLElement;
    yearBox.click();
    expect(component.showYearList).toHaveBeenCalled();
  }));

  it("clicking team name open List function called", async(() => {
    var spyedMethod = spyOn(component, "displayTeams");
    //Checking Year box and checking if the method to change the variable was called
    let nameBoxClub: HTMLElement = document.getElementsByClassName(
      "g-profile__name clubPointer"
    )[0] as HTMLElement;

    nameBoxClub.click();
    expect(spyedMethod).toHaveBeenCalledWith(component.showList);
  }));
  it("clicking team name variable Changed", async(() => {
    //Checking Year box and checking if the variable was turned to true to show the years
    let nameBoxClub: HTMLElement = document.getElementsByClassName(
      "g-profile__name clubPointer"
    )[0] as HTMLElement;
    expect(component.showList).toBe(false);
    nameBoxClub.click();
    expect(component.showList).toBe(true);
  }));
});
