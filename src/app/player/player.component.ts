import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { BodyComponent } from "../body/body.component";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
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
  ) {}

  playerSelected;
  ClubCityName = "ClubCityName";
  showList = false;
  id;
  teamsDict = {};
  playerTabSelected;
  //baseURL ="https://nfl-fisa-assets.s3.amazonaws.com/images/headshots/REPLACEME_headshot.jpg";
  baseURL =
    "https://sail-bucket.s3-us-west-2.amazonaws.com/Player_Images/REPLACEME.png";
  ngOnInit() {
    this.body.portalHighlight("player");

    if (this.filterService.reportTabs) {
      this.playerTabSelected = Object.keys(
        this.filterService.getReportHeaders(3)
      )[0];
      if (this.router.url.includes("/report")) {
        this.playerTabSelected = this.router.url.split("/report/")[1];
      }
      if (this.router.url.includes("/base-reports")) {
        this.playerTabSelected = this.router.url.split("/base-reports/")[1];
      }
      this.subRoute(this.playerTabSelected);
    } else {
      console.log("WAITING TO LOAD");

      setTimeout(() => {
        this.playerTabSelected = Object.keys(
          this.filterService.getReportHeaders(3)
        )[0];
        if (this.router.url.includes("/report")) {
          this.playerTabSelected = this.router.url.split("/report/")[1];
        }
        if (this.router.url.includes("/base-reports")) {
          this.playerTabSelected = this.router.url.split("/base-reports/")[1];
        }
        console.log("WAITING TO LOAD", this.playerTabSelected);

        this.subRoute(this.playerTabSelected);
      }, 800);
    }

    setTimeout(() => {
      this.subRoute(this.playerTabSelected);
    }, 1);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.filterService.playerPortalActivePlayerID != "") {
        this.filterService.playerPortalSelected = this.filterService.pullValueMap[
          "3"
        ][this.filterService.playerPortalActivePlayerID];
        this.initPlayer();
      }
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

  //RETURN THE PLAYER IMAGES
  getActivePlayerImage(playerID: any) {
    if (playerID == "") {
      return "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos_Transparent/NFL_.png";
    } else {
      var gsisID = this.filterService.pullPlayers[playerID]["GSISPlayerID"];
      var url = this.baseURL.replace("REPLACEME", gsisID);
      // this.urlExists(url, function(err, exists) {
      //   if (!exists) {
      //     url =
      //       "https://sail-bucket.s3-us-west-2.amazonaws.com/Player_Images/Blank_Player.jpg";
      //   }
      // });

      return url;
    }
    var gsis = this.filterService.pullPlayers[playerID]["GSISID"];
    return this.baseURL.replace("REPLACEME", gsis);
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

  //Toggle Display of Teams Selection
  displayPlayers(onOff: number) {
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
    try {
      var newTab = document.getElementById(name + "playerBarHighlightid");
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
