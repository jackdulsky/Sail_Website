import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { KeyValue } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { FilterspopComponent } from "./filterspop.component";
import { RouterModule } from "@angular/router";
import {
  HttpClientTestingModule,
  TestRequest
} from "@angular/common/http/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { AppRoutingModule } from "../app-routing.module";
import { BodyComponent } from "../body/body.component";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { SortPipe } from "../sort.pipe";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { PullDataService } from "../pull-data.service";
import { FiltersService } from "../filters.service";
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
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatFormFieldModule, MatSelectModule } from "@angular/material";
import { FilterPipe2 } from "../filter2.pipe";
import { MatMenuModule } from "@angular/material/menu";
import { OrderAttributePipe } from "../order-attribute.pipe";
import { filter } from "rxjs/operators";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatAutocompleteModule, MatInputModule } from "@angular/material";
import * as cloneDeep from "lodash/cloneDeep";

class MockFilterService extends FiltersService {}

describe("FilterspopComponent", () => {
  let component: FilterspopComponent;
  let fixture: ComponentFixture<FilterspopComponent>;
  let cdref: ChangeDetectorRef;
  let pullData: PullDataService;
  let dialogRef: MatDialogRef<FilterspopComponent>;
  let sanitizer: DomSanitizer;
  let formBuilder: FormBuilder;
  let dialog: MatDialog;
  let filtersService: FiltersService;
  let http: HttpClient;

  // let filterServiceInjectedSpy: jasmine.SpyObj<FiltersService>;
  beforeEach(async(() => {
    // filterServiceInjectedSpy = jasmine.createSpyObj("FilterService", [
    //   "changelevel2"
    // ]);
    // filtersService = new FiltersService();
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule,
        ReactiveFormsModule,
        MatDialogModule,
        NgxMatSelectSearchModule,
        RouterTestingModule,
        MatSelectModule,
        MatMenuModule,
        MatDatepickerModule,
        BrowserAnimationsModule,
        MatInputModule
      ],
      declarations: [
        FilterspopComponent,
        OrderAttributePipe,
        FilterPipe2,
        SortPipe,
        OrderAttributePipe
      ],
      providers: [
        FiltersService,
        { provide: MatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { selected: "-1" } }
      ]
    }).compileComponents();
    // http = new HttpClient();
    // cdref = new ChangeDetectorRef();
    // pullData = new PullDataService();
    // dialogRef = new MatDialogRef<FilterspopComponent>();
    // sanitizer = new DomSanitizer();
    // formBuilder = new FormBuilder();
    // dialog = new MatDialog();
    // filtersService: FiltersService();
    // formBuilder = new FormBuilder();
    // filtersService = new FiltersService();
    // component = new FilterspopComponent(service);
    fixture = TestBed.createComponent(FilterspopComponent);

    component = fixture.componentInstance;

    filtersService = fixture.debugElement.injector.get(FiltersService);
  }));

  beforeEach(() => {
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
    component.filterService.initForm(Object.keys(pullAttribute));
    component.filterService.teams = teams;
    // filterService = TestBed.get(FiltersService);
    // filtersService = fixture.debugElement.injector.get(FiltersService);
    filtersService = TestBed.get(FiltersService);
    //filterService = fixture.debugElement.injector.get(FilterService);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("click on top tabs and change function called", () => {
    var spyedMethod = spyOn(filtersService, "changelevel2");
    Object.keys(component.filterService.pullStructure).forEach((value, key) => {
      let tabClicked = document.getElementById("tier1Tab" + value);
      tabClicked.click();
      expect(spyedMethod).toHaveBeenCalledWith(value);
    });
  });
  it("Panels show up correctly on tab click & default selecting attributes", () => {
    Object.keys(component.filterService.pullStructure).forEach((value, key) => {
      if (String(value) != "-14") {
        let tabClicked = document.getElementById("tier1Tab" + value);
        tabClicked.click();
        expect(component.filterService.panels).toEqual([
          value,
          String(Number(value) * -100)
        ]);
        //As soon as we mix attributes and non attributes on the same level this will break
        expect(component.filterService.selectingAttributes).toEqual(
          Object.keys(
            component.filterService.pullStructure[value][
              String(Number(value) * -100)
            ]
          )
        );
        component.cdref.detectChanges();
        console.log("ATTS", component.filterService.selectingAttributes.length);
        console.log("elemtn", document.getElementsByClassName("guiArea")[0]);
        expect(
          document.getElementsByClassName("guiArea")[0].children.length
        ).toEqual(component.filterService.selectingAttributes.length);
        component.cdref.detectChanges();
      }
    });
  });
  it("Naviage to Attribute ");
});
