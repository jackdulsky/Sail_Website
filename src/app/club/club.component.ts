import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";

@Component({
  selector: "app-club",
  templateUrl: "./club.component.html",
  styleUrls: ["./club.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class ClubComponent implements OnInit {
  constructor(
    public ReportListService: ReportListService,
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public pullData: PullDataService,
    public router: Router,
    public body: BodyComponent,
    public cdref: ChangeDetectorRef
  ) {
    document.addEventListener("click", e => this.onClick(e));
  }

  teamSelected;
  ClubCityName = "ClubCityName";
  ClubNickName = "ClubNickName";
  showList = false;
  id;
  teamsDict = {};
  clubTabSelected;
  showYear = false;

  //Turn Off the year panel on click outside, runs every click on the component
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
  ngOnInit() {
    this.initFunction();
  }
  ngOnDestroy() {}
  ngAfterViewInit() {
    this.afterInitFunction();
  }
  afterInitFunction() {
    if (this.filterService.teamsMap) {
      this.filterService.teamPortalSelected = this.filterService.teamsMap[
        this.filterService.teamPortalActiveClubID
      ];

      this.initTeam(this.filterService.teamPortalSelected);
    } else {
      setTimeout(() => {
        this.afterInitFunction();
      }, 200);
    }
  }

  initFunction() {
    this.body.portalHighlight("club");
    if (
      this.filterService.reportTabs &&
      this.filterService.reportReportsOnly &&
      this.filterService.getReportHeaders(2)
    ) {
      try {
        this.clubTabSelected = Object.keys(
          this.filterService.getReportHeaders(2)
        )[1];
        if (this.router.url.includes("/report")) {
          this.clubTabSelected = this.filterService.reportReportsOnly[
            this.router.url.split("/report/")[1]
          ]["TabID"];
        }
        if (this.router.url.includes("/base-reports")) {
          this.clubTabSelected = this.router.url.split("/base-reports/")[1];
        }
        setTimeout(() => {
          this.subRoute(this.clubTabSelected);
        }, 1);
      } catch (e) {
        this.clubTabSelected = -1;
      }
    } else {
      setTimeout(() => {
        this.initFunction();
      }, 200);
    }
  }

  //TURN AN ARRAY OF DICTIONARIES INTO A DICTIONARY WITH KEY AS IDSTRING SPECIFIED THROUGH PULLING IT OUT TO BE THE KEY
  extractID(data, idString: string, insertDict, keep: number = 0) {
    for (let b in data) {
      var id = String(data[b][idString]);
      if (keep == 0) {
        delete data[b][idString];
      }

      insertDict[id] = data[b];
    }
  }

  //Returns the logo src url to the club selection display
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

  //Retuns proper city name
  getCityName(team: any) {
    var citySplit = team["ClubCityName"].split(" ");
    if (citySplit.length > 1) {
      return citySplit[0] + " " + citySplit[1];
    } else {
      return citySplit[0];
    }
  }
  //Toggle Display of Teams Selection
  displayTeams(onOff: any) {
    console.log("IN HERE", onOff);
    if (!onOff) {
      this.showList = true;
    } else {
      this.showList = false;
    }
  }

  //This function changes the team selected
  changeTeam(team: any) {
    console.log("TRYING TO DISPLAY", team);
    this.displayTeams(1);
    console.log(
      "before",
      this.filterService.newDBFormat,
      this.filterService.newFIDs
    );

    this.teamSelected = team;
    this.filterService.teamPortalActiveClubID = team["SailTeamID"];
    this.filterService.teamPortalSelected = team;
    this.initTeam(this.filterService.teamPortalSelected);
    console.log(
      "AFTER",
      this.filterService.newDBFormat,
      this.filterService.newFIDs
    );
    this.filterService.updateRDURL();
  }
  initTeam(team: any) {
    //FID is -2
    //ATT is 2
    //  if (JSON.stringify(this.filterService.newDBFormat) != JSON.stringify({})) {
    this.filterService.pushQueryToActiveFilter("0");
    console.log("Spot2", this.filterService.newDBFormat);
    // } else {
    // }
    console.log(
      "AFTER 2",
      this.filterService.newDBFormat,
      this.filterService.newFIDs
    );
  }

  //This function will route to reports page or display the report
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
    try {
      var newTab = document.getElementById(name + "clubBarHighlightid");
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid var(--lighter-blue)";
    } catch (e) {}

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
        // this.router.navigate([newRoute + "/report/" + String(reportID)]);
      } else {
        this.filterService.selected = name;
        var newRoute = this.router.url.split("/report")[0];
        newRoute = newRoute.split("/base-report")[0];
        this.router.navigate(["./base-reports", String(name)], {
          relativeTo: this.route
        });
        // this.router.navigate([newRoute + "/base-reports/" + String(name)]);
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
