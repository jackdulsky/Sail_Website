import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";
import { IDropdownSettings } from "ng-multiselect-dropdown";

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
  ) {}

  dropdownList = [2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];
  selectedItems = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    // idField: "item_id",
    // textField: "item_text",
    allowSearchFilter: false,

    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 4,
    maxHeight: 400
  };
  teamSelected;
  ClubCityName = "ClubCityName";
  showList = false;
  id;
  teamsDict = {};
  clubTabSelected;
  private sub: any;

  ngOnInit() {
    this.body.portalHighlight("club");
    if (this.filterService.reportTabs) {
      this.clubTabSelected = Object.keys(
        this.filterService.getReportHeaders(2)
      )[0];
      if (this.router.url.includes("/report")) {
        this.clubTabSelected = this.router.url.split("/report/")[1];
      }
      if (this.router.url.includes("/base-reports")) {
        this.clubTabSelected = this.router.url.split("/base-reports/")[1];
      }
      this.subRoute(this.clubTabSelected);
    } else {
      setTimeout(() => {
        this.clubTabSelected = Object.keys(
          this.filterService.getReportHeaders(2)
        )[0];
        if (this.router.url.includes("/report")) {
          this.clubTabSelected = this.router.url.split("/report/")[1];
        }
        if (this.router.url.includes("/base-reports")) {
          this.clubTabSelected = this.router.url.split("/base-reports/")[1];
        }
        this.subRoute(this.clubTabSelected);
      }, 800);
    }

    setTimeout(() => {
      this.subRoute(this.clubTabSelected);
    }, 1);
  }
  ngOnDestroy() {}
  ngAfterViewInit() {
    setTimeout(() => {
      this.filterService.teamPortalSelected = this.filterService.teamsMap[
        this.filterService.teamPortalActiveClubID
      ];

      this.initTeam(this.filterService.teamPortalSelected);
    }, 800);
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
  displayTeams(onOff: number) {
    if (!onOff) {
      this.showList = true;
    } else {
      this.showList = false;
    }
  }

  //This function changes the team selected
  changeTeam(team: any) {
    this.displayTeams(1);

    this.teamSelected = team;
    this.filterService.teamPortalActiveClubID = team["SailTeamID"];
    this.filterService.teamPortalSelected = team;
    this.initTeam(this.filterService.teamPortalSelected);
    this.filterService.updateRDURL();
  }
  initTeam(team: any) {
    //FID is -2
    //ATT is 2
    this.filterService.pushQueryToActiveFilter("0");
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
        this.router.navigate([newRoute + "/report/" + String(name)]);
      } else {
        this.filterService.selected = name;
        var newRoute = this.router.url.split("/report")[0];
        newRoute = newRoute.split("/base-report")[0];
        this.router.navigate([newRoute + "/base-reports/" + String(name)]);
      }
    } catch (e) {}
  }
}
