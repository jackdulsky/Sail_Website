import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { BodyComponent } from "../body/body.component";
import { SlideInOutAnimation } from "../animations";

@Component({
  selector: "app-club",
  templateUrl: "./club.component.html",
  styleUrls: ["./club.component.css"],
  animations: [SlideInOutAnimation],
  encapsulation: ViewEncapsulation.None
})
export class ClubComponent implements OnInit {
  constructor(
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public pullData: PullDataService,
    public router: Router,
    public body: BodyComponent,
    public cdref: ChangeDetectorRef
  ) {
    document.addEventListener("click", e => this.onClick(e));
  }

  //html work around definition
  ClubCityName = "ClubCityName";
  ClubNickName = "ClubNickName";

  //number for tab selected
  clubTabSelected;

  //bools to show dropdowns
  showList = false;
  showYear = false;

  //transition states for club and year drop downs
  yearListAnimationState = "out";
  teamListAnimationState = "out";

  /**
   * This function will take in an click event and
   * check its target and close the drop down menus if clicked outside of it
   *
   *
   *
   * @param event click event
   */
  onClick(event) {
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var value;
    if (idAttr) {
      value = idAttr.nodeValue;
    } else {
      value = "";
    }
    if (this.showYear && !value.includes("year")) {
      this.showYearList();
    }
    if (this.showList && !value.includes("team")) {
      this.displayTeams(this.showList);
    }
  }

  /**
   * Init function!
   */
  ngOnInit() {
    this.cdref.detectChanges();

    this.initFunction();
  }

  /**
   * After init function view, call the loopable function
   */
  ngAfterViewInit() {
    this.afterInitFunction();
    this.cdref.detectChanges();
  }
  /**
   * Change the active team object to the one selected and init the team
   */
  afterInitFunction() {
    if (this.filterService.checkUploadComplete()) {
      this.filterService.teamPortalSelected = this.filterService.teamsMap[
        this.filterService.teamPortalActiveClubID
      ];

      this.initTeam();
    } else {
      setTimeout(() => {
        console.log("LOOP 19");
        this.afterInitFunction();
      }, 200);
    }
  }

  /**
   * Get initial tab to highlight and reroute for the router outlet to display appropriately
   * Then highlight or subroute appropriately
   */
  initFunction() {
    if (this.filterService.checkUploadComplete()) {
      try {
        this.body.portalHighlight("club");
      } catch (e) {}
      var tabs = this.filterService.getReportHeaders(2);
      this.clubTabSelected = Object.keys(tabs).sort(function(a, b) {
        return tabs[a]["OrderID"] < tabs[b]["OrderID"]
          ? -1
          : tabs[b]["OrderID"] < tabs[a]["OrderID"]
          ? 1
          : 0;
      })[0];
      try {
        if (this.router.url.includes("/report")) {
          document.getElementById("fullScreenButton").className = "fullScreen";
          this.clubTabSelected = this.filterService.reportReportsOnly[
            this.router.url.split("/report/")[1]
          ]["TabID"];
        }
        if (this.router.url.includes("/base-reports")) {
          this.clubTabSelected = this.router.url.split("/base-reports/")[1];
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
        Object.keys(this.filterService.getReportHeaders(2)).indexOf(
          String(this.clubTabSelected)
        ) != -1 &&
        this.router.url.includes("base")
      ) {
        this.subRoute(this.clubTabSelected);
      } else {
        this.justHighlight(this.clubTabSelected);
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
    if (document.getElementById(name + "clubBarHighlightid")) {
      var newTab = document.getElementById(name + "clubBarHighlightid");
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    } else {
      setTimeout(() => {
        console.log("LOOP 22", this.clubTabSelected, this.router.url);
        this.justHighlight(this.clubTabSelected);
      }, 100);
    }
  }

  /**
   * Returns the logo src url to the club selection display, handel the weird cases for multiteam cities
   * and cities with two names
   *
   * @param team Team Object to return the logo
   */
  getActiveLogo(team: any) {
    try {
      var citySplit = team["ClubCityName"].split(" ");
      var city;
      if (citySplit.length > 1) {
        city = citySplit[0] + citySplit[1];
      } else {
        city = citySplit[0];
      }
      var nick = team["ClubNickName"];
      return (
        "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos_Transparent/" +
        city +
        "_" +
        nick +
        ".png?"
      );
    } catch (e) {
      return "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos_Transparent/NFL_.png";
    }
  }

  /**
   * Retuns proper city name
   * @param team Team Object
   */
  getCityName(team: any) {
    var citySplit = team["ClubCityName"].split(" ");
    if (citySplit.length > 1) {
      return citySplit[0] + " " + citySplit[1];
    } else {
      return citySplit[0];
    }
  }

  /**
   * Toggle Display of Teams Selection
   * @param onOff Current status of the team display toggle
   */
  displayTeams(onOff: any) {
    this.toggleShowDiv("teamList");
    if (!onOff) {
      this.showList = true;
    } else {
      this.showList = false;
    }
  }

  /**
   * This function changes the team selected and updates the rock daisy url
   * @param team Team Object
   */
  changeTeam(team: any) {
    this.displayTeams(1);
    this.filterService.teamPortalActiveClubID = String(team["SailTeamID"]);
    this.filterService.teamPortalSelected = team;
    this.initTeam();
    this.filterService.updateRDURL();
  }

  /**
   * push changes to the database
   * by changing the active id and object in the filterservice variables
   * they will be put in the filter strucutre through the case of url having "club"
   */
  initTeam() {
    this.filterService.pushQueryToActiveFilter("0");
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
        String(this.clubTabSelected) + "clubBarHighlightid"
      );
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
    } catch (e) {}

    this.clubTabSelected = name;

    //color new
    setTimeout(() => {
      var newTab = document.getElementById(name + "clubBarHighlightid");
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
        document.getElementById("fullScreenButton").className = "fullScreen";
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

  /**
   * Open/close the year dropdown slect
   */
  showYearList() {
    this.showYear = !this.showYear;
    this.toggleShowDiv("yearList");
    if (!this.showYear) {
      this.filterService.portalYearDisplayClose();
    }
  }

  /**
   * Change animation state
   * @param divName string to match up for changing animation state
   */
  toggleShowDiv(divName: string) {
    if (divName === "yearList") {
      this.yearListAnimationState =
        this.yearListAnimationState === "out" ? "in" : "out";
    }
    if (divName === "teamList") {
      this.teamListAnimationState =
        this.teamListAnimationState === "out" ? "in" : "out";
    }
  }
}
