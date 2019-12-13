import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";
import { KeyValue } from "@angular/common";

@Component({
  selector: "app-cash",
  templateUrl: "./cash.component.html",
  styleUrls: ["./cash.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class CashComponent implements OnInit {
  constructor(
    public ReportListService: ReportListService,
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public pullData: PullDataService,
    public router: Router,
    public body: BodyComponent,
    public cdref: ChangeDetectorRef
  ) {}
  cashTabSelected;
  showYear = false;

  ngOnInit() {
    this.initFunction();
  }
  initFunction() {
    this.body.portalHighlight("cash");
    if (
      this.filterService.reportTabs &&
      this.filterService.reportReportsOnly &&
      this.filterService.getReportHeaders(4)
    ) {
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
}
