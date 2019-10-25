import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";

@Component({
  selector: "app-club",
  templateUrl: "./club.component.html",
  styleUrls: ["./club.component.css"]
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
  teamSelected;
  ClubCityName = "ClubCityName";
  ClubNickName = "ClubNickName";
  showList = false;
  id;
  teamsDict = {};
  clubTabSelected;
  private sub: any;

  ngOnInit() {
    // this.filterService.teamsMap.subscribe(teamsMap => {
    //   this.teamSelected = teamsMap[this.id];
    //   console.log(this.teamSelected);
    //   console.log("teamsMAp", this.filterService.teamsMap);
    // });
    this.body.portalHighlight("club");
    this.clubTabSelected = Object.keys(
      this.filterService.getReportHeaders(1)
    )[0];
    if (this.router.url.includes("/report")) {
      this.clubTabSelected = this.router.url.split("/report/")[1];
    }
    if (this.router.url.includes("/base-reports")) {
      this.clubTabSelected = this.router.url.split("/base-reports/")[1];
    }

    setTimeout(() => {
      this.subRoute(this.clubTabSelected);
    }, 1);
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  ngAfterViewInit() {
    this.sub = this.route.params.subscribe(params => {
      this.filterService.teamPortalActiveClubID = String(params["clubid"]); // (+) converts string 'id' to a number
      if (this.filterService.teamsMap) {
        this.filterService.teamPortalSelected = this.filterService.teamsMap[
          this.filterService.teamPortalActiveClubID
        ];
        this.initTeam(this.filterService.teamPortalSelected);
      } else {
        setTimeout(() => {
          this.filterService.teamPortalSelected = this.filterService.teamsMap[
            this.filterService.teamPortalActiveClubID
          ];
          this.initTeam(this.filterService.teamPortalSelected);
        }, 800);
      }
      console.log("ID", this.filterService.teamPortalActiveClubID);
      this.cdref.detectChanges();
      // In a real app: dispatch action to load the details here.
    });
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
    console.log("START CHANGE", this.showList);
    if (!onOff) {
      this.showList = true;
    } else {
      this.showList = false;
    }
    console.log("AFTER CHANGE", this.showList);
  }

  //This function changes the team selected
  changeTeam(team: any) {
    this.displayTeams(1);

    this.teamSelected = team;
    var newRoute = this.router.url.replace(
      String(this.filterService.teamPortalActiveClubID),
      String(team["SailTeamID"])
    );

    this.filterService.teamPortalActiveClubID = team["SailTeamID"];
    this.filterService.teamPortalSelected = team;
    this.router.navigate([newRoute]);
    this.filterService.updateRDURL();
  }
  initTeam(team: any) {
    //FID is -2
    //BIN is -2
    //ATT is 2

    //remove other team filters that are applied
    for (let query in this.filterService.newFIDBID) {
      console.log(
        "CHECKING",
        query,
        this.filterService.newFIDBID[query],
        Number(this.filterService.newFIDBID[query]) == -2
      );
      // if (Number(this.filterService.newFIDBID[query]) == -2) {
      this.filterService.removeQuery(query);
      // }
    }
    this.filterService.newFIDBID["-2"] = "-2";
    this.filterService.newFIDs["-2"] = { "2": [String(team["SailTeamID"])] };
    this.filterService.newDBFormat["-2"] = {
      "-2": [[String(team["SailTeamID"])], {}, []]
    };
    console.log("SENDING ");
    this.pullData.constructAndSendFilters(this.filterService.newDBFormat);
    this.filterService.testSendFilters2();
  }

  //This function will route to reprots page or display the report
  subRoute(name: any) {
    //Get rid of old
    var old = document.getElementById(
      String(this.clubTabSelected) + "clubBarHighlightid"
    );
    old.style.backgroundColor = "white";
    old.style.borderBottom = "4px solid white";

    this.clubTabSelected = name;

    //color new
    var newTab = document.getElementById(name + "clubBarHighlightid");
    newTab.style.backgroundColor = "#f2f2f2";
    newTab.style.borderBottom = "4px solid var(--lighter-blue)";

    //Route Appropriately
    if (this.filterService.lor[name]["List"] == 0) {
      var newRoute = this.router.url.split("/base-report")[0];
      newRoute = newRoute.split("/report")[0];
      this.router.navigate([newRoute + "/report/" + String(name)]);
    } else {
      this.filterService.selected = name;
      var newRoute = this.router.url.split("/report")[0];
      newRoute = newRoute.split("/base-report")[0];
      this.router.navigate([newRoute + "/base-reports/" + String(name)]);
    }
  }
}
