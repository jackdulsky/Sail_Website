import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ComponentFactoryResolver
} from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";
import { KeyValue } from "@angular/common";
import { MatMenuTrigger } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-cash",
  templateUrl: "./cash.component.html",
  styleUrls: ["./cash.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class CashComponent implements OnInit {
  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;

  constructor(
    public ReportListService: ReportListService,
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public pullData: PullDataService,
    public router: Router,
    public body: BodyComponent,
    public cdref: ChangeDetectorRef,
    public fb: FormBuilder
  ) {}
  cashTabSelected;
  showYear = false;
  Label = "Label";
  positonFilterID;
  agentFilterID;
  companyFilterID;
  showFilters;

  ngOnInit() {
    this.initFunction();
  }
  initFunction() {
    this.body.portalHighlight("cash");
    if (
      this.filterService.reportTabs &&
      this.filterService.reportReportsOnly &&
      this.filterService.getReportHeaders(4) &&
      this.filterService.pullStructure &&
      this.filterService.pullAttribute &&
      this.filterService.pullValueMap &&
      this.filterService.form
    ) {
      for (let att in this.filterService.pullStructure["-3"]["300"]) {
        try {
          if (this.filterService.pullAttribute[att]["Label"] == "Position") {
            this.positonFilterID = att;
          }
          if (this.filterService.pullAttribute[att]["Label"] == "Agent") {
            this.agentFilterID = att;
          }
          if (this.filterService.pullAttribute[att]["Label"] == "Company") {
            this.companyFilterID = att;
          }
        } catch (e) {}
        this.filterService.formCash.addControl(att, new FormControl());
        this.filterService.formCash.addControl(
          att + "search",
          new FormControl()
        );
      }
      this.showFilters = [
        this.positonFilterID,
        this.agentFilterID,
        this.companyFilterID
      ];
      if (!this.filterService.fidCashMap[this.positonFilterID]) {
        this.filterService.fidCashMap[this.positonFilterID] = "-301";
        this.filterService.fidCashMapFIDtoID["-301"] = this.positonFilterID;
      }
      if (!this.filterService.fidCashMap[this.agentFilterID]) {
        this.filterService.fidCashMap[this.agentFilterID] = "-302";
        this.filterService.fidCashMapFIDtoID["-302"] = this.agentFilterID;
      }
      if (!this.filterService.fidCashMap[this.companyFilterID]) {
        this.filterService.fidCashMapFIDtoID["-303"] = this.companyFilterID;
        this.filterService.fidCashMap[this.companyFilterID] = "-303";
      }

      var tabs = this.filterService.getReportHeaders(4);
      this.cashTabSelected = Object.keys(tabs).sort(function(a, b) {
        return tabs[a]["OrderID"] < tabs[b]["OrderID"]
          ? -1
          : tabs[b]["OrderID"] < tabs[a]["OrderID"]
          ? 1
          : 0;
      })[0];
      try {
        if (this.router.url.includes("/report")) {
          document.getElementById("fullScreenButton").className = "fullScreen";

          this.cashTabSelected = this.filterService.reportReportsOnly[
            this.router.url.split("/report/")[1]
          ]["TabID"];
        }
        if (this.router.url.includes("/base-reports")) {
          this.cashTabSelected = this.router.url.split("/base-reports/")[1];
        }
      } catch (e) {}
    } else {
      setTimeout(() => {
        console.log("LOOP 8");
        this.initFunction();
      }, 200);
    }
    this.performHighlightOrSubRoute();
  }

  //get first order value
  getFirstTab() {
    var tabs = this.filterService.getReportHeaders(4);
  }

  //timeout Recursive method
  performHighlightOrSubRoute() {
    if (this.filterService.getReportHeaders(4)) {
      if (
        Object.keys(this.filterService.getReportHeaders(4)).indexOf(
          String(this.cashTabSelected)
        ) != -1 &&
        this.router.url.includes("base")
      ) {
        this.subRoute(this.cashTabSelected);
      } else {
        this.justHighlight(this.cashTabSelected);
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 9");
        this.performHighlightOrSubRoute();
      }, 200);
    }
  }

  //HIGHLIGHT A TAB, USED FOR INIT ON REPORT
  justHighlight(name: any) {
    if (document.getElementById(name + "cashBarHighlightid")) {
      var newTab = document.getElementById(name + "cashBarHighlightid");
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    } else {
      setTimeout(() => {
        console.log("LOOP 10");
        this.justHighlight(this.cashTabSelected);
      }, 100);
    }
  }

  //This function will route to reports page or display the report
  //This function will route to reports page or display the report
  subRoute(name: any) {
    //Get rid of old
    try {
      var old = document.getElementById(
        String(this.cashTabSelected) + "cashBarHighlightid"
      );
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
    } catch (e) {}

    this.cashTabSelected = name;
    //color new
    setTimeout(() => {
      console.log("LOOP 7");
      try {
        var newTab = document.getElementById(name + "cashBarHighlightid");
        newTab.style.backgroundColor = "#f2f2f2";
        newTab.style.borderBottom = "4px solid lightskyblue";
      } catch (e) {}
    }, 1);

    //Route Appropriately

    try {
      if (this.filterService.reportTabs[name]["IsList"] == 0) {
        var newRoute = this.router.url.split("/base-report")[0];
        newRoute = newRoute.split("/report")[0];
        var reportID = Object.keys(
          this.filterService.reportReportsStructure[name]
        )[0];
        this.router.navigate(["./report", String(reportID)], {
          relativeTo: this.route
        });
        document.getElementById("fullScreenButton").className = "fullScreen";
      } else {
        this.filterService.selected = name;
        var newRoute = this.router.url.split("/report")[0];
        newRoute = newRoute.split("/base-report")[0];

        this.router.navigate(["./base-reports", String(name)], {
          relativeTo: this.route
        });
        document.getElementById("fullScreenButton").className =
          "fullScreenInactive";
        // this.router.navigate([newRoute + "../base-reports/" + String(name)]);
      }
    } catch (e) {}
  }

  //Show The list of years to select
  showYearList() {
    this.showYear = !this.showYear;
    if (!this.showYear) {
      this.filterService.portalYearDisplayClose();
    }
  }

  //RETURN THE ITEMS IN THE ORDER SPECIFIED
  //FOR LABEL OF VALUES
  valueOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["OrderID"] < b.value["OrderID"]
      ? -1
      : b.value["OrderID"] < a.value["OrderID"]
      ? 1
      : 0;
  };

  openMyMenu() {
    this.trigger.toggleMenu();
  }
  closeMyMenu() {
    this.trigger.closeMenu();
  }

  //Position is -301
  //Agent is -302
  //Company is -303

  type0change(formKey, bin) {
    // var oldWorking = cloneDeep(this.filterService.newWorkingQuery);
    // this.filterService.newWorkingQuery["-3"][formKey] = [
    //   this.filterService.formCash.value[formKey]
    // ];
    // this.filterService.setPlayers(this.filterService.combinedJSONstring());
    // this.filterService.newWorkingQuery = oldWorking;
    var newFIDNumber = this.filterService.fidCashMap[formKey];
    if (
      this.filterService.formCash.value[formKey] == null ||
      JSON.stringify(this.filterService.formCash.value[formKey]) == "[]"
    ) {
      this.filterService.removeQuery(newFIDNumber);
    } else {
      var map = {};
      map[formKey] = this.filterService.formCash.value[formKey];
      var oldDB = cloneDeep(this.filterService.newDBFormat);

      this.filterService.newFIDOrder[bin] = this.filterService.newFIDOrder[
        bin
      ].concat([newFIDNumber]);

      var pkID = [];
      this.filterService.newFIDs[newFIDNumber] = Object.assign(
        {},
        cloneDeep(map)
      );
      this.filterService.newFIDBID[newFIDNumber] = bin;
      if (!this.filterService.newDBFormat[bin]) {
        this.filterService.newDBFormat[bin] = {};
      }
      var att = cloneDeep(map);
      var FID = [];
      this.filterService.newDBFormat[bin][newFIDNumber] = [pkID, att, FID];
      if (
        !this.filterService.checkDBFormats(
          oldDB,
          cloneDeep(this.filterService.newDBFormat)
        )
      ) {
        this.filterService.saveAndSend();
        this.filterService.updateRDURL();
      }
    }
  }
  //Toggle for UI TYPE 5
  toggleNestedSelect(id: any, key: any) {
    var oldValue: String[] = cloneDeep(this.filterService.formCash.value[id]);
    if (oldValue == null) {
      this.filterService.formCash.controls[id].setValue([String(key)]);
    } else {
      if (
        this.filterService.formCash.value[id] != null &&
        this.filterService.formCash.value[id].indexOf(String(key)) != -1
      ) {
        this.filterService.formCash.controls[id].setValue(
          oldValue.filter(x => x != String(key))
        );
      } else {
        this.filterService.formCash.controls[id].setValue(
          oldValue.concat([String(key)])
        );
      }
    }
    this.type0change(id, "-3");
  }

  //   var oldWorking = cloneDeep(this.filterService.newWorkingQuery);
  //   if (input.length > 3) {
  //     this.filterService.newWorkingQuery["-3"][this.playerNameInput] = [
  //       String(input)
  //     ];
  //     this.filterService.setPlayers(this.filterService.combinedJSONstring());
  //     this.filterService.newWorkingQuery = oldWorking;
  //   } else {
  //     delete this.filterService.newWorkingQuery["-3"][this.playerNameInput];
  //     this.filterService.setPlayers(this.filterService.combinedJSONstring());
  //   }
  // }
}
