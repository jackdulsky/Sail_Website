import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { BodyComponent } from "../body/body.component";
import { SlideInOutAnimation } from "../animations";

@Component({
  selector: "app-draft",
  templateUrl: "./draft.component.html",
  styleUrls: ["./draft.component.css"]
})
export class DraftComponent implements OnInit {
  constructor(
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public pullData: PullDataService,
    public router: Router,
    public body: BodyComponent,
    public cdref: ChangeDetectorRef
  ) {}

  //number for tab selected
  draftTabSelected;

  /**
   * Init function!
   */
  ngOnInit() {
    this.cdref.detectChanges();

    this.initFunction();
  }

  /**
   * After init function
   */
  ngAfterViewInit() {
    this.cdref.detectChanges();
  }

  /**
   * Get initial tab to highlight and reroute for the router outlet to display appropriately
   * Then highlight or subroute appropriately
   */
  initFunction() {
    if (this.filterService.checkUploadComplete()) {
      try {
        this.body.portalHighlight("draft");
      } catch (e) {}
      var tabs = this.filterService.getReportHeaders(2);
      this.draftTabSelected = Object.keys(tabs).sort(function(a, b) {
        return tabs[a]["OrderID"] < tabs[b]["OrderID"]
          ? -1
          : tabs[b]["OrderID"] < tabs[a]["OrderID"]
          ? 1
          : 0;
      })[0];
      try {
        if (this.router.url.includes("/report")) {
          if (Number(name) > 0) {
            document.getElementById("fullScreenButton").className =
              "fullScreen";
          }
          this.draftTabSelected = this.filterService.reportReportsOnly[
            this.router.url.split("/report/")[1]
          ]["TabID"];
        }
        if (this.router.url.includes("/base-reports")) {
          this.draftTabSelected = this.router.url.split("/base-reports/")[1];
        }
      } catch (e) {}
      this.performHighlightOrSubRoute();
    } else {
      setTimeout(() => {
        console.log("LOOP 20");
        this.initFunction();
      }, 200);
    }
  }
  /**
   * Time out recursive method to highlight the correct tab being displayed
   * Highlight is called if its showing a report
   * If it has base in url then must reroute to base report to display properly
   */
  performHighlightOrSubRoute() {
    if (this.filterService.checkUploadComplete()) {
      if (
        Object.keys(this.filterService.getReportHeaders(5)).indexOf(
          String(this.draftTabSelected)
        ) != -1 &&
        this.router.url.includes("base")
      ) {
        this.subRoute(this.draftTabSelected);
      } else {
        this.justHighlight(this.draftTabSelected);
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 21");
        this.performHighlightOrSubRoute();
      }, 200);
    }
  }

  /**
   * HIGHLIGHT A TAB, USED FOR INIT ON REPORT
   * @param name tab number to highlight
   */
  justHighlight(name: any) {
    if (document.getElementById(name + "draftBarHighlightid")) {
      var newTab = document.getElementById(name + "draftBarHighlightid");
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    } else {
      setTimeout(() => {
        console.log("LOOP 22", this.draftTabSelected, this.router.url);
        this.justHighlight(this.draftTabSelected);
      }, 100);
    }
  }

  /**
   * This function will route to reports page or display the report
   * Case on what to do whether it is a list of reports or a report tab
   *
   * @param name tab number to route to
   */
  subRoute(name: any) {
    //Get rid of old
    try {
      var old = document.getElementById(
        String(this.draftTabSelected) + "draftBarHighlightid"
      );
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
    } catch (e) {}

    this.draftTabSelected = name;

    //color new
    setTimeout(() => {
      var newTab = document.getElementById(name + "draftBarHighlightid");
      try {
        newTab.style.backgroundColor = "#f2f2f2";
        newTab.style.borderBottom = "4px solid lightskyblue";
      } catch (e) {}
    }, 1);

    //Route Appropriately

    try {
      if (this.filterService.reportTabs[name]["IsList"] == 0) {
        var reportID = Object.keys(
          this.filterService.reportReportsStructure[name]
        )[0];

        this.router.navigate(["./report", String(reportID)], {
          relativeTo: this.route
        });
        if (Number(name) > 0) {
          document.getElementById("fullScreenButton").className = "fullScreen";
        }
        // this.router.navigate([newRoute + "/report/" + String(reportID)]);
      } else {
        this.filterService.selected = name;

        this.router.navigate(["./base-reports", String(name)], {
          relativeTo: this.route
        });

        document.getElementById("fullScreenButton").className =
          "fullScreenInactive";

        // this.router.navigate([newRoute + "/base-reports/" + String(name)]);
      }
    } catch (e) {}
  }
  /**
   * If control is held during click then open new tab otherwise reroute
   * @param e click event
   * @param name tab number clicked
   */
  tabClicked(e: any, name: any) {
    if (e.ctrlKey) {
      var url = this.router.url.split("/");
      var number = name;
      var base = "";
      if (this.filterService.reportTabs[name]["IsList"] == 0) {
        number = Object.keys(
          this.filterService.reportReportsStructure[name]
        )[0];
        base = "report";
      } else {
        base = "base-reports";
      }
      this.filterService.goToLink(
        "http://oakcmsreports01.raiders.com:88" +
          "/" +
          url[1] +
          "/" +
          url[2] +
          "/" +
          url[3] +
          "/" +
          base +
          "/" +
          number
      );
    } else {
      this.subRoute(name);
    }
  }
}
