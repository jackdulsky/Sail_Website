import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
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
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public pullData: PullDataService,
    public router: Router,
    public body: BodyComponent,
    public cdref: ChangeDetectorRef
  ) {
    document.addEventListener("click", e => this.onClick(e));
  }
  //player image url
  baseURL =
    "https://sail-bucket.s3-us-west-2.amazonaws.com/Player_Images/REPLACEME.png";
  //Attribute ID for player name text input
  playerNameInput;

  //bools to show dropdowns
  showList = false;
  showYear = false;

  playerTabSelected; //number for tab selected

  //transition states for club and year drop downs
  yearListAnimationState = "out";
  playerListAnimationState = "out";

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
    if (this.showYear && !value.toLowerCase().includes("year")) {
      this.showYearList();
    }
    if (this.showList && !value.toLowerCase().includes("player")) {
      this.displayPlayers(this.showList);
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
   * Change the active player object to the one selected and init the player
   */
  afterInitFunction() {
    if (this.filterService.checkUploadComplete()) {
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

  /**
   * Get initial tab to highlight and reroute for the router outlet to display appropriately
   * Then highlight or subroute appropriately
   */
  initFunction() {
    try {
      this.body.portalHighlight("player");
    } catch (e) {}

    if (this.filterService.checkUploadComplete()) {
      //get player name input Attribute ID
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

  /**
   * Time out recursive method to highlight the correct tab being displayed
   * Highlight is called if its showing a report
   * If it has base in url then must reroute to base report to display properly
   */
  performHighlightOrSubRoute() {
    if (this.filterService.checkUploadComplete()) {
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

  /**
   * HIGHLIGHT A TAB, USED FOR INIT ON REPORT
   * @param name tab number to highlight
   */
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

  /**
   * Returns the logo src url to the player selection display, handel the weird cases for multiteam cities
   * and cities with two names
   *
   * @param team Team Object to return the logo
   */
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

  /**
   * Get Team Object from ID
   * @param disp object that the "Value" is the sailTeamID
   */
  getTeamID(disp: any) {
    if (disp["Value"]) {
      return this.filterService.teamsMap[disp["Value"]];
    } else {
      return {
        ClubCityName: "NFL",
        ClubNickName: ""
      };
    }
  }

  /**
   * Populate players based on name text search
   * @param input string of player name text to load players of
   */
  playerSearching(input: string) {
    var otherNameForm = this.filterService.transformName(input); //incase you ever want to implement search for "john smith" and "smith, john"

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

  /**
   * Toggle Display of Player Selection
   * @param onOff Current status of the player display toggle
   */
  displayPlayers(onOff: any) {
    this.toggleShowDiv("playerList");

    if (!onOff) {
      this.showList = true;
    } else {
      this.showList = false;
    }
  }

  /**
   * This function changes the player selected and updates the rock daisy url
   * @param playerID player sailID
   * @param player player object
   */
  changePlayer(playerID: any, player: any) {
    this.displayPlayers(1);

    this.filterService.playerPortalActivePlayerID = playerID;
    this.filterService.playerPortalSelected = player;

    this.initPlayer();
    this.filterService.updateRDURL();
  }
  /**
   * push changes to the database
   * by changing the active id and object in the filterservice variables
   * they will be put in the filter strucutre through the case of url having "player"
   */
  initPlayer() {
    //FID is -3
    //ATT is 3
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
        var reportID = Object.keys(
          this.filterService.reportReportsStructure[name]
        )[0];
        this.router.navigate(["./report", String(reportID)], {
          relativeTo: this.route
        });
        document.getElementById("fullScreenButton").className = "fullScreen";
      } else {
        this.filterService.selected = name;
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
    if (divName === "playerList") {
      this.playerListAnimationState =
        this.playerListAnimationState === "out" ? "in" : "out";
    }
  }
}
