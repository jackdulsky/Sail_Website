import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";
import * as cloneDeep from "lodash/cloneDeep";
import { SlideInOutAnimation } from "../animations";
@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  animations: [SlideInOutAnimation],
  styleUrls: ["./player.component.css"]
})
export class PlayerComponent implements OnInit {
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
  playerSelected;
  ClubCityName = "ClubCityName";
  showList = false;
  showYear = false;
  id;
  teamsDict = {};
  playerTabSelected;
  yearListAnimationState = "out";
  playerListAnimationState = "out";

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
    if (this.showYear && !value.toLowerCase().includes("year")) {
      this.showYearList();
    }
    if (this.showList && !value.toLowerCase().includes("player")) {
      this.displayPlayers(this.showList);
    }
  }
  //baseURL ="https://nfl-fisa-assets.s3.amazonaws.com/images/headshots/REPLACEME_headshot.jpg";
  baseURL =
    "https://sail-bucket.s3-us-west-2.amazonaws.com/Player_Images/REPLACEME.png";
  playerNameInput;
  ngOnInit() {
    // this.filterService.getBulkImport();
    this.cdref.detectChanges();

    this.initFunction();
  }
  ngOnDestroy() {}
  ngAfterViewInit() {
    this.afterInitFunction();
    this.cdref.detectChanges();
  }

  afterInitFunction() {
    if (this.filterService.pullValueMap) {
      if (this.filterService.playerPortalActivePlayerID != "") {
        this.filterService.playerPortalSelected = this.filterService.pullValueMap[
          "3"
        ][this.filterService.playerPortalActivePlayerID];
        this.initPlayer();
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 29");
        this.afterInitFunction();
      }, 200);
    }
  }
  initFunction() {
    try {
      this.body.portalHighlight("player");
    } catch (e) {}

    if (
      this.filterService.reportTabs &&
      this.filterService.reportReportsOnly &&
      this.filterService.getReportHeaders(3) &&
      this.filterService.pullStructure &&
      this.filterService.pullAttribute
    ) {
      for (let att in this.filterService.pullStructure["-3"]["300"]) {
        try {
          if (this.filterService.pullAttribute[att]["Label"] == "Player Name") {
            this.playerNameInput = att;
          }
        } catch (e) {}
      }
      var tabs = this.filterService.getReportHeaders(3);
      this.playerTabSelected = Object.keys(tabs).sort(function(a, b) {
        return tabs[a]["OrderID"] < tabs[b]["OrderID"]
          ? -1
          : tabs[b]["OrderID"] < tabs[a]["OrderID"]
          ? 1
          : 0;
      })[0];
      try {
        if (this.router.url.includes("/report")) {
          document.getElementById("fullScreenButton").className = "fullScreen";

          this.playerTabSelected = this.filterService.reportReportsOnly[
            this.router.url.split("/report/")[1]
          ]["TabID"];
        }
        if (this.router.url.includes("/base-reports")) {
          this.playerTabSelected = this.router.url.split("/base-reports/")[1];
        }
      } catch (e) {}
      this.performHighlightOrSubRoute();
    } else {
      setTimeout(() => {
        console.log("LOOP 30");
        this.initFunction();
      }, 200);
    }
  }

  //timeout Recursive method
  performHighlightOrSubRoute() {
    if (this.filterService.getReportHeaders(3)) {
      if (
        Object.keys(this.filterService.getReportHeaders(3)).indexOf(
          String(this.playerTabSelected)
        ) != -1 &&
        this.router.url.includes("base")
      ) {
        this.subRoute(this.playerTabSelected);
      } else {
        this.justHighlight(this.playerTabSelected);
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 32");
        this.performHighlightOrSubRoute();
      }, 200);
    }
  }

  //HIGHLIGHT A TAB, USED FOR INIT ON REPORT

  justHighlight(name: any) {
    if (document.getElementById(name + "playerBarHighlightid")) {
      var newTab = document.getElementById(name + "playerBarHighlightid");
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    } else {
      setTimeout(() => {
        console.log("LOOP 31");
        this.justHighlight(this.playerTabSelected);
      }, 100);
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

  //Return the logo url based on a team put in
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

  //GET TEAM ID FROM VALUE
  getTeamID(disp: any) {
    try {
      if (disp["Value"]) {
        return this.filterService.teamsMap[disp["Value"]];
      } else {
        return {
          ClubCityName: "NFL",
          ClubNickName: ""
        };
      }
    } catch (e) {
      setTimeout(() => {
        console.log("LOOP 33");
        // return this.getTeamID(disp);
      }, 300);
    }
  }

  //RETURN LIST OF PLAYERS
  getPlayers(players: any) {
    var returnPlayers = {};
    var i = 0;
    for (let player in players) {
      if (i == 15) {
        break;
      }
      returnPlayers[player] = players[player];
      i += 1;
    }
    return returnPlayers;
  }

  //populate display players
  playerSearching(input: string) {
    var otherNameForm = this.filterService.transformName(input);

    //get player name att ID

    var oldWorking = cloneDeep(this.filterService.workingQuery);
    if (input.length > 3) {
      this.filterService.workingQuery["-3"][this.playerNameInput] = [
        String(input)
      ];
      this.filterService.setPlayers(this.filterService.combinedJSONstring());
      this.filterService.workingQuery = oldWorking;
    } else {
      delete this.filterService.workingQuery["-3"][this.playerNameInput];
      this.filterService.setPlayers(this.filterService.combinedJSONstring());
    }
  }

  //Toggle Display of Player Selection
  displayPlayers(onOff: any) {
    this.toggleShowDiv("playerList");

    if (!onOff) {
      this.showList = true;
    } else {
      this.showList = false;
    }
  }

  //This function changes the team selected
  changePlayer(playerID: any, player: any) {
    this.displayPlayers(1);

    this.playerSelected = player;
    this.filterService.playerPortalActivePlayerIDOLD = this.filterService.playerPortalActivePlayerID;
    this.filterService.playerPortalActivePlayerID = playerID;
    this.filterService.playerPortalSelected = player;

    this.initPlayer();
    this.filterService.updateRDURL();
  }

  initPlayer() {
    //FID is -3
    //ATT is 3
    this.filterService.pushQueryToActiveFilter("0");
  }

  //This function will route to reports page or display the report
  subRoute(name: any) {
    //Get rid of old
    try {
      var old = document.getElementById(
        String(this.playerTabSelected) + "playerBarHighlightid"
      );
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
    } catch (e) {}

    this.playerTabSelected = name;
    //color new
    setTimeout(() => {
      console.log("LOOP 34");
      try {
        var newTab = document.getElementById(name + "playerBarHighlightid");
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
        try {
          document.getElementById("fullScreenButton").className =
            "fullScreenInactive";
        } catch (e) {}
        // this.router.navigate([newRoute + "../base-reports/" + String(name)]);
      }
    } catch (e) {}
  }
  //Show The list of years to select

  showYearList() {
    this.showYear = !this.showYear;
    this.toggleShowDiv("yearList");
    if (!this.showYear) {
      this.filterService.portalYearDisplayClose();
    }
  }
  toggleShowDiv(divName: string) {
    if (divName === "yearList") {
      console.log(this.yearListAnimationState);
      this.yearListAnimationState =
        this.yearListAnimationState === "out" ? "in" : "out";
      console.log(this.yearListAnimationState);
    }
    if (divName === "playerList") {
      console.log(this.playerListAnimationState);
      this.playerListAnimationState =
        this.playerListAnimationState === "out" ? "in" : "out";
      console.log(this.playerListAnimationState);
    }
  }
}
