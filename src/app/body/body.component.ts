import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import { MatDialog} from "@angular/material";
import { PullDataService } from "../pull-data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ChangeDetectorRef } from "@angular/core";


@Component({
  selector: "app-body",
  templateUrl: "./body.component.html",
  styleUrls: ["./body.component.css"]
})
export class BodyComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public filterService: FiltersService,
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router,
    public cdref: ChangeDetectorRef
  ) {}

  //portals to list on the left side, you can be dveloping a tab and its still accessible through the 
  //top route but will not be navigatable to from the website
  portals = ["club", "player", "cash", "fa-hypo"]; //, "excel"];


  ngOnInit() {
    //ON INIT SET THE SELECTED TAB ON THE LEFT TO GENERAL / CHANGE CSS
    this.filterService.selected = "0";

    this.initCalled();
  }

  /**
   * Detect changes after view init occurs
   */
  ngAfterViewInit() {
    this.cdref.detectChanges();
  }

  /**
   * Init function called for loop timing based on dom life cycle loading
   */
  initCalled() {
    //If the tab to select is not loaded or there is no portal selcted then loop until
    if (
      document.getElementById(
        this.filterService.selected + "reportHighlightid"
      ) ||
      this.filterService.portalSelected != ""
    ) {
      //Handel if its a report list clicked (portal highlighting taken care in those components)
      if (this.filterService.portalSelected == "") {
        try {
          document.getElementById(
            this.filterService.selected + "reportHighlightid"
          ).className = "sidebutton sidebuttonclicked";
        } catch (e) {
          console.log("ERROR", e);
        }
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 5");
        this.initCalled();
      }, 100);
    }
  }

  
  /**
   * THIS UPDATES THE REPORT TO VIEW FROM CLICK on base-reports
   * 
   * @param newNumb Report number to view
   */
  changeReportType(newNumb: number) {
    var comp = this.router.url.split("/base-reports/")[0].split("/");
    if (this.portals.indexOf(comp[comp.length - 1]) != -1) {
      this.router.navigate(["report", String(newNumb)], {
        relativeTo: this.route.firstChild.firstChild
      });
    } else {
      this.router.navigate(["./report", +String(newNumb)], {
        relativeTo: this.route
      });
    }
    this.filterService.menuOpen = false;
  }


  /**
   * CHANGE DISPLAY REPORTS BASED ON CLICKED REPORT
   * ALTER CSS APPROPRIATELY
   * @param name number refering to the list of the reports selected (0<= name <= 3)
   */
  toggleContents(name: any) {
    //HAVE ALL TURN OFF
    if (document.getElementById("exitFiltersPop")) {
      document.getElementById("exitFiltersPop").click();
    }
    for (let category in this.filterService.getReportHeaders(1)) {
      document.getElementById(
        category.toString() + "reportHighlightid"
      ).className = "sidebutton";
    }

    //Turn off Portals

    for (let port in this.portals) {
      document.getElementById(this.portals[port] + "id").className =
        "sidebutton";
    }

    //set report selected to be the input
    this.filterService.selected = name;

    //TURN SELECTED ONE ON and change the router outlet appropriately through the routing
    document.getElementById(name + "reportHighlightid").className =
      "sidebutton sidebuttonclicked";
    if (this.filterService.reportTabs[name]["IsList"] == 0) {
      var reportID = Object.keys(
        this.filterService.reportReportsStructure[name]
      )[0];

      this.router.navigate(["./report", String(reportID)], {
        relativeTo: this.route
      });
    } else {
      this.router.navigate(["./base-reports", String(name)], {
        relativeTo: this.route
      });
    }
    //close the menu if its open
    this.filterService.menuOpen = false;
  }


  
  /**
   * Highlight the portal selected and unhighlight the reports
   * @param name string of the portal name selected (limited to the variables in portals)
   */
  portalHighlight(name: any) {
    if (document.getElementById("exitFiltersPop")) {
      document.getElementById("exitFiltersPop").click();
    }
    for (let category in this.filterService.getReportHeaders(1)) {
      document.getElementById(
        category.toString() + "reportHighlightid"
      ).className = "sidebutton";
    }
    try {
      for (let port in this.portals) {
        document.getElementById(this.portals[port] + "id").className =
          "sidebutton";
      }
      document.getElementById(name + "id").className =
        "sidebutton sidebuttonclicked";
    } catch (e) {}
    //Route to the new portal
    this.filterService.portalSelected = name;
    if (!this.router.url.includes(name)) {
      this.router.navigate(["./" + name], {
        relativeTo: this.route //reference to the level in the routing
      });
    }
    
    //close the menu if its open
    this.filterService.menuOpen = false;
  }




 
  


}
