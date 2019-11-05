import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";

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
    this.body.portalHighlight("cash");
    if (this.filterService.reportTabs) {
      this.cashTabSelected = Object.keys(
        this.filterService.getReportHeaders(2)
      )[0];
      if (this.router.url.includes("/report")) {
        this.cashTabSelected = this.router.url.split("/report/")[1];
      }
      if (this.router.url.includes("/base-reports")) {
        this.cashTabSelected = this.router.url.split("/base-reports/")[1];
      }
      this.subRoute(this.cashTabSelected);
    } else {
      setTimeout(() => {
        this.cashTabSelected = Object.keys(
          this.filterService.getReportHeaders(2)
        )[0];
        if (this.router.url.includes("/report")) {
          this.cashTabSelected = this.router.url.split("/report/")[1];
        }
        if (this.router.url.includes("/base-reports")) {
          this.cashTabSelected = this.router.url.split("/base-reports/")[1];
        }
        this.subRoute(this.cashTabSelected);
      }, 800);
    }

    setTimeout(() => {
      this.subRoute(this.cashTabSelected);
    }, 1);
  }

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
    try {
      var newTab = document.getElementById(name + "cashBarHighlightid");
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid var(--lighter-blue)";
    } catch (e) {}

    //Route Appropriately
    try {
      if (this.filterService.reportTabs[name]["IsList"] == 0) {
        var newRoute = this.router.url.split("/base-report")[0];
        newRoute = newRoute.split("/report")[0];
        this.router.navigate([newRoute + "/report/" + String(name)]);
      } else {
        this.filterService.selected = name;
        var newRoute = this.router.url.split("/report")[0];
        newRoute = newRoute.split("/base-report")[0];
        this.router.navigate([newRoute + "/base-reports/" + String(name)]);
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
