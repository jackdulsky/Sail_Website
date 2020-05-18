import { Component, OnInit } from "@angular/core";
import { PullDataService } from "../pull-data.service";
import { FiltersService } from "../filters.service";
import { SlideInOutAnimation } from "../animations";
import { range } from "rxjs";
import * as cloneDeep from "lodash/cloneDeep";
import { ChangeDetectorRef } from "@angular/core";
import { transition } from "@angular/animations";
import { ɵELEMENT_PROBE_PROVIDERS__POST_R3__ } from "@angular/platform-browser";
import { Variable } from "@angular/compiler/src/render3/r3_ast";
import { DraftComponent } from "../draft/draft.component";
@Component({
  selector: "app-trade-tool",
  templateUrl: "./trade-tool.component.html",
  styleUrls: ["./trade-tool.component.css"],
  animations: [SlideInOutAnimation]
})
export class TradeToolComponent implements OnInit {
  date = new Date();
  year = this.date.getFullYear();
  yearRaiders = cloneDeep(this.date.getFullYear()); //display year of picks for raiders
  yearTrade = cloneDeep(this.date.getFullYear()); //display year of picks for raiders

  //bool for sending trade offer box
  tradeToSend = false;
  tradeSendingPicks = { raiders: [], tradeTeam: [] };

  //bool for loading screen
  uploadingPicks = true;

  //Thresholds for pick generation

  maxTradeValueDif = 20;
  minTradeValueDif = -20;
  maxTradePickDif = 2;
  minTradePickDif = -2;
  tradePicksQuantity = 6;

  //math
  math;

  //permutations of all possible picks
  permutations;

  //index is n for 2^n from 1 to 25
  permutationsAll = {};
  permutationsAllSaved = {};

  //results matrix
  tradeOptions = [];

  //PickLabel
  pickLabel = "Pick Label";

  //need to keep pick order to overall when computing trades
  pickOrderToPickID = [];

  //pickInvolved? map pick number to yes or no
  pickInvolved = {};

  //bools to show dropdowns
  showList = false;

  //animation start state for club dropdown
  teamListAnimationState = "out";

  //data from database
  draftPicksRaw: any;
  draftValuesRaw;

  //club conversion to sailID
  clubIDToSailID = {
    1: 1000,
    2: 1001,
    3: 1002,
    4: 1003,
    5: 1004,
    6: 1005,
    7: 1006,
    8: 1007,
    9: 1008,
    10: 1009,
    11: 1010,
    12: 1011,
    13: 1012,
    14: 1013,
    15: 1014,
    16: 1015,
    17: 1016,
    18: 1017,
    19: 1018,
    20: 1019,
    21: 1020,
    22: 1021,
    23: 1022,
    24: 1023,
    25: 1024,
    26: 1025,
    27: 1026,
    28: 1027,
    32: 1028,
    33: 1029,
    36: 1030,
    39: 1031
  };

  //team to trade with and show draft picks
  tradeTeamDefault = {
    SailTeamID: "1000",
    GSISClubID: "1",
    GSISClubKey: "5080",
    NCAAID: null,
    Season: "2020",
    TeamCode: "ATL",
    LeagueType: "NFL",
    Conference: "NFC",
    Division: "South",
    ClubCityName: "Atlanta",
    ClubNickName: "Falcons",
    SchemeOffense: null,
    SchemeDefense: "43",
    ClubColor1: "#CA2541",
    ClubColor2: "#000000",
    ClubColor3: "#BBC3CA",
    ClubImageURL:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos_Transparent/Atlanta_Falcons.png?",
    StadiumID: null
  };

  //Raiders
  raiders;

  //mapping of team to array of pickID's
  teamToPickIDs = {};
  //pick ID  to draft object from database
  pickIDToPick = {};

  //tradeSelectedArray
  tradeSelectedArray;

  firstFalseReload = false;
  constructor(
    public pullData: PullDataService,
    public filterService: FiltersService,
    public cdRef: ChangeDetectorRef,
    public draft: DraftComponent
  ) {
    this.math = Math;
    document.addEventListener("click", e => this.onClick(e));
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  /**
   * Init the draft pick information
   */
  ngOnInit() {
    this.raiders = this.filterService.defaultTeam;

    this.draft.currentPick.subscribe(value => {
      if (value != 0) {
        if (this.firstFalseReload == true) {
          console.log("PICK CHANGE TO ", value);
          this.pullData.pullDraftFlushProc().subscribe(data => {
            this.pullDraftPicks(true);
            this.filterService.setNegotiation();
          });
        } else {
          this.firstFalseReload = true;
          this.pullDraftPicks();
        }
      }
    });
  }
  /**
   * pull Draft Picks and init
   * @param reload if its a reload or first time
   */
  pullDraftPicks(reload = false) {
    this.pullData.pullDraftPicksInfo().subscribe(data => {
      this.draftPicksRaw = data;
      this.initDraftPicks(reload);
    });
  }
  initDraftPicks(reload = false) {
    //set the overall picks correctly since there were two nulls
    //Add in sailID to each pick of origin team
    //Create mapping of team to picks
    if (reload) {
      var old_pickInvoled = cloneDeep(this.pickInvolved);
      var old_teamToPickIDs = cloneDeep(this.teamToPickIDs);
    }
    this.pickInvolved = {};
    this.teamToPickIDs = {};

    for (var i = 0; i < this.draftPicksRaw.length; i++) {
      var sailID = this.clubIDToSailID[this.draftPicksRaw[i]["ClubID"]];
      var pickID = this.draftPicksRaw[i]["PickID"];

      if (this.draftPicksRaw[i]["ConditionalPick"] == 1) {
        this.pickInvolved[pickID] = "-1";
      } else {
        this.pickInvolved[pickID] = "0";
      }
      if (
        reload &&
        (old_teamToPickIDs[this.raiders.SailTeamID].includes(pickID) ||
          old_teamToPickIDs[
            this.filterService.teamPortalSelected.SailTeamID
          ].includes(pickID))
      ) {
        this.pickInvolved[pickID] = old_pickInvoled[pickID];
      }

      this.cdRef.detectChanges();

      this.draftPicksRaw[i]["SailID"] = sailID;
      this.pickIDToPick[pickID] = this.draftPicksRaw[i];
      if (this.teamToPickIDs[sailID]) {
        if (!this.teamToPickIDs[sailID].includes(pickID)) {
          this.teamToPickIDs[sailID] = this.teamToPickIDs[sailID].concat([
            pickID
          ]);
        }
      } else {
        this.teamToPickIDs[sailID] = [pickID];
      }
    }

    this.uploadingPicks = false;

    if (
      this.filterService.teamPortalActiveClubID ==
      String(this.raiders.SailTeamID)
    ) {
      this.filterService.teamPortalSelected = this.tradeTeamDefault;
    }
    if (reload == false) {
      this.setParams(-1);
      this.setTeam();
    } else {
      var output = this.performTradeGenerations(
        this.pickInvolved,
        this.minTradeValueDif,
        this.maxTradeValueDif,
        this.maxTradePickDif,
        this.minTradePickDif,
        this.tradePicksQuantity
      );
      this.tradeOptions = output["tradeOptions"];
      this.pickOrderToPickID = output["pickOrderToPickID"];
    }
  }

  /**
   * init the params to their value based off of the negotiation
   */
  setParams(oldNegotiationID, count = 0) {
    if (
      this.filterService.draftActiveNegotiation &&
      this.filterService.draftActiveNegotiation.NegotiationID !=
        oldNegotiationID
    ) {
      this.minTradeValueDif = this.filterService.draftActiveNegotiation.mnValDif;
      this.maxTradeValueDif = this.filterService.draftActiveNegotiation.mxValDif;
      this.minTradePickDif = this.filterService.draftActiveNegotiation.mnPickDif;
      this.maxTradePickDif = this.filterService.draftActiveNegotiation.mxPickDif;
      this.tradePicksQuantity = this.filterService.draftActiveNegotiation.NumPicks;
    } else {
      setTimeout(() => {
        console.log("LOOP 54");
        if (count < 50) {
          this.setParams(oldNegotiationID, count + 1);
        }
      }, 500);
    }
  }

  /**
   * Sets the team in the DB
   * @param team
   */
  setTeam() {
    if (this.filterService.checkUploadComplete()) {
      var oldNegotiationID = this.filterService.draftActiveNegotiation
        ? cloneDeep(this.filterService.draftActiveNegotiation.NegotiationID)
        : -1;

      this.filterService.pushQueryToActiveFilter("0");
      this.setParams(oldNegotiationID);
    } else {
      setTimeout(() => {
        console.log("LOOP 56");
        this.setTeam();
      }, 100);
    }
  }

  /**
   *Fast way to generate the permutations
   it is an n x n^2 2d array (inverted), each entry is a column not a combinations
   * @param n length of picks
   */
  genperms2(n: number) {
    var overall = [];
    //for each row
    var start = Date.now();

    for (var i = 0; i < n; i++) {
      //pattern repeat
      var column = [];
      var repeat = 2 ** i;
      for (var j = 1; j <= repeat; j++) {
        for (var k = 0; k < 2 ** (n - (i + 1)); k++) {
          column.push(0);
        }
        for (var k = 0; k < 2 ** (n - (i + 1)); k++) {
          column.push(1);
        }
      }

      overall.push(column);
    }
    var end = Date.now();
    // console.log(
    //   "Time to Generate Permutations (Inverted) = ",
    //   (end - start) / 1000
    // );
    this.permutationsAllSaved[n] = cloneDeep(overall);
    return overall;
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
    try {
      var citySplit = team["ClubCityName"].split(" ");
      if (citySplit.length > 1) {
        return citySplit[0] + " " + citySplit[1];
      } else {
        return citySplit[0];
      }
    } catch (e) {
      return "";
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
   * Change animation state
   * @param divName string to match up for changing animation state
   */
  toggleShowDiv(divName: string) {
    if (divName === "teamList") {
      this.teamListAnimationState =
        this.teamListAnimationState === "out" ? "in" : "out";
    }
  }

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
    if (this.showList && !value.includes("team")) {
      this.displayTeams(this.showList);
    }

    if (
      this.tradeToSend &&
      !value.toLowerCase().includes("send") &&
      !value.toLowerCase().includes("option")
    ) {
      this.tradeSendingPicks["raiders"] = [];
      this.tradeSendingPicks["tradeTeam"] = [];
      this.tradeToSend = false;
    }
  }

  /**
   * Change the team to trade with, will change which picks are viewed
   * clear potential trades with previous team
   */
  changeTradeTeam(team: any) {
    if (this.filterService.teamPortalActiveClubID != team.SailTeamID) {
      this.filterService.teamPortalSelected = team;
      this.filterService.teamPortalActiveClubID = team.SailTeamID;
      this.displayTeams(this.showList);
      Object.keys(this.pickInvolved).forEach(element => {
        this.pickInvolved[element] = 0;
        if (this.pickIDToPick[element]["ConditionalPick"] == 1) {
          this.pickInvolved[element] = "-1";
        } else {
          this.pickInvolved[element] = "0";
        }
      });
      this.yearTrade = cloneDeep(this.year);
      this.pickOrderToPickID = [];
      this.tradeOptions = [];
      this.tradeSendingPicks["raiders"] = [];
      this.tradeSendingPicks["tradeTeam"] = [];
      this.tradeToSend = false;
      this.yearRaiders = cloneDeep(this.year);
      this.yearTrade = cloneDeep(this.year);
      this.setTeam();
    }
  }

  /**
   * RETURN STARTING POSITION OF THE SLIDER
   * check in form (i.e. filters selected) if the position should be true for the label
   * Also set the color of the slider from green to red if appropriate
   *
   * @param pick overall pick number
   * @param Label Value of the position
   */
  checkTypePickToggleChecked(pick: string, Label: any) {
    var switchType3 = document.getElementById("type3Switch" + pick);
    if (switchType3 != null) {
      try {
        //For if none is selected
        if (this.pickInvolved[pick] == 0) {
          if (Label == 0) {
            switchType3.style.backgroundColor = "var(--raiders-gray)";
            return "checked";
          } else {
            return "";
          }
        }

        //if label is on either way set color and reutrn appropriately
        if (this.pickInvolved[pick] == String(Label)) {
          if (Number(Label) == 1) {
            switchType3.style.backgroundColor = "Green";
          } else {
            switchType3.style.backgroundColor = "Red";
          }
          return "checked";
        } else {
          return "";
        }
      } catch (e) {
        return "";
      }
    } else {
      return "";
    }
  }

  /**
   * SELECT OR DESELECT PICK
   * -1 not involved
   * 0 either way
   * 1 involved
   *
   * @param pick overall pick number
   * @param toLabel Value to put in for toggle

   */
  changeToggleValue(pick: string, toLabel: any) {
    if (this.pickIDToPick[pick]["ConditionalPick"] == 0) {
      if (
        toLabel == 1 ||
        this.pickIDToPick[pick]["Season"] == this.year ||
        this.pickInvolved[pick] == 1
      ) {
        this.pickInvolved[pick] = toLabel;
        //updateTrades

        var output = this.performTradeGenerations(
          this.pickInvolved,
          this.minTradeValueDif,
          this.maxTradeValueDif,
          this.maxTradePickDif,
          this.minTradePickDif,
          this.tradePicksQuantity
        );
        this.tradeOptions = output["tradeOptions"];
        this.pickOrderToPickID = output["pickOrderToPickID"];
      } else {
        this.pickInvolved[pick] = toLabel;
      }
    }
  }

  /**
   * on Param change perform generation
   */
  inputChange() {
    this.clipParamsToBounds();
    var output = this.performTradeGenerations(
      this.pickInvolved,
      this.minTradeValueDif,
      this.maxTradeValueDif,
      this.maxTradePickDif,
      this.minTradePickDif,
      this.tradePicksQuantity
    );
    this.tradeOptions = output["tradeOptions"];
    this.pickOrderToPickID = output["pickOrderToPickID"];
  }

  changeParam(param: string, change: number) {
    if (param == "tradePicksQuantity") {
      this.tradePicksQuantity = Number(this.tradePicksQuantity) + change;
    }
    if (param == "maxTradeValueDif") {
      this.maxTradeValueDif = Math.max(
        Number(this.maxTradeValueDif) + 5 * change,
        this.minTradeValueDif
      );
    }
    if (param == "minTradeValueDif") {
      this.minTradeValueDif = Math.min(
        Number(this.minTradeValueDif) + 5 * change,
        this.maxTradeValueDif
      );
    }
    if (param == "minTradePickDif") {
      this.minTradePickDif = Math.min(
        Number(this.minTradePickDif) + change,
        this.maxTradePickDif
      );
    }
    if (param == "maxTradePickDif") {
      this.maxTradePickDif = Math.max(
        Number(this.maxTradePickDif) + change,
        this.minTradePickDif
      );
    }

    this.inputChange();
  }

  /**
   * Bound the params
   */
  clipParamsToBounds() {
    this.tradePicksQuantity = Number(this.tradePicksQuantity);
    this.maxTradeValueDif = Number(this.maxTradeValueDif);
    this.minTradeValueDif = Number(this.minTradeValueDif);
    this.minTradePickDif = Number(this.minTradePickDif);
    this.maxTradePickDif = Number(this.maxTradePickDif);
    this.tradePicksQuantity = Number.isInteger(this.tradePicksQuantity)
      ? Math.max(2, Math.min(10, this.tradePicksQuantity))
      : this.tradePicksQuantity;
    this.maxTradePickDif = Number.isInteger(this.maxTradePickDif)
      ? Math.max(-3, Math.min(5, this.maxTradePickDif))
      : this.maxTradePickDif;
    this.minTradePickDif = Number.isInteger(this.minTradePickDif)
      ? Math.min(3, Math.max(-5, this.minTradePickDif))
      : this.minTradePickDif;
    this.maxTradeValueDif = Number.isInteger(this.maxTradeValueDif)
      ? Math.max(-1000, Math.min(1000, this.maxTradeValueDif))
      : this.maxTradeValueDif;
    this.minTradeValueDif = Number.isInteger(this.minTradeValueDif)
      ? Math.min(1000, Math.max(-1000, this.minTradeValueDif))
      : this.minTradeValueDif;
  }
  /**
   * This function will generate the pick outcomes
   * Matrix Math:
   *      ( Picks x 3 )^T * (Picks x 2^Picks) = (Combinations x 3)
   *      Picks x 3 =
   *                value, gain or lose pick, row
   *      Picks x 2^Picks =
   *                each column is linear combination of picks
   *      Combinationsx x 3 =
   *                Point differential for value, pick quantity change, simplicity (# picks invovled)
   */
  performTradeGenerations(
    involvedPicks,
    minTradeValueDif,
    maxTradeValueDif,
    maxTradePickDif,
    minTradePickDif,
    tradePicksQuantity
  ) {
    var pMatrix = [];
    var pOrderToPickID = [];
    var tOptions = [];
    var perms;

    for (let raidersPick of this.teamToPickIDs[this.raiders["SailTeamID"]]) {
      if (
        (involvedPicks[raidersPick] != -1 &&
          this.pickIDToPick[raidersPick]["Season"] == this.year) ||
        involvedPicks[raidersPick] == 1
      ) {
        if (pMatrix.length < 10) {
          pMatrix.push([-1 * this.pickIDToPick[raidersPick]["Points"], -1, 1]);
          pOrderToPickID.push(raidersPick);
        }
      }
    }
    for (let tradeTeamPick of this.teamToPickIDs[
      this.filterService.teamPortalActiveClubID
    ]) {
      if (
        (involvedPicks[tradeTeamPick] != -1 &&
          this.pickIDToPick[tradeTeamPick]["Season"] == this.year) ||
        involvedPicks[tradeTeamPick] == 1
      ) {
        if (pMatrix.length < 20) {
          pMatrix.push([this.pickIDToPick[tradeTeamPick]["Points"], 1, 1]);
          pOrderToPickID.push(tradeTeamPick);
        }
      }
    }
    if (!this.permutationsAllSaved[pMatrix.length]) {
      perms = this.genperms2(pMatrix.length);
    } else {
      perms = this.permutationsAllSaved[pMatrix.length];
    }

    tOptions = this.computeTradeOptions(
      pMatrix,
      pOrderToPickID,
      perms,
      involvedPicks,
      minTradeValueDif,
      maxTradeValueDif,
      maxTradePickDif,
      minTradePickDif,
      tradePicksQuantity
    );
    return { pickOrderToPickID: pOrderToPickID, tradeOptions: tOptions };
  }

  /**
   * From the permutations and picks matrix generate the trade package values
   */
  computeTradeOptions(
    pMatrix,
    pOrderToPickID,
    perms,
    involvedPicks,
    minTradeValueDif,
    maxTradeValueDif,
    maxTradePickDif,
    minTradePickDif,
    tradePicksQuantity
  ) {
    var options = [];
    try {
      //go through permutations and compute the three values for the trades
      //i is the permutation
      //slot is the pick
      //inverted access
      for (var i = 0; i < 2 ** pMatrix.length; i++) {
        var valid = true;
        var value = 0;
        var pickChange = 0;
        var pickQuantity = 0;
        var count = 0;
        var perm = [];
        for (var slot = 0; slot < pMatrix.length; slot++) {
          perm.push(perms[slot][i]);
          count += perms[slot][i];

          if (involvedPicks[pOrderToPickID[slot]] == 1 && perms[slot][i] != 1) {
            valid = false;
            continue;
          }
          if (perms[slot][i]) {
            value += pMatrix[slot][0];
            pickChange += pMatrix[slot][1];
            pickQuantity += 1;
          }
        }

        // console.log(perm);
        //Sort on the custom input values
        if (
          valid == true &&
          value >= minTradeValueDif &&
          value <= maxTradeValueDif &&
          pickChange <= maxTradePickDif &&
          pickChange >= minTradePickDif &&
          pickQuantity <= tradePicksQuantity &&
          pickQuantity >= 2
        ) {
          options.push([value, pickChange, pickQuantity, perm]);
        }
      }

      //sort based on value, then pick dif, then overall picks
      options = options.sort((a, b) => {
        if (a[0] < b[0]) return 1;
        else if (a[0] > b[0]) return -1;
        else if (a[1] < b[1]) return 1;
        else if (a[1] > b[1]) return -1;
        else if (a[2] > b[2]) return 1;
        else if (a[2] < b[2]) return -1;
        else return 0;
      });
    } catch (e) {
      console.log(e);
    }
    return options;
  }

  /**
   * Get the exact net value of picks selected
   */
  calcExactVal() {
    var net = 0;
    try {
      this.teamToPickIDs[this.raiders["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          net -= this.pickIDToPick[element]["Points"];
        }
      });
      this.teamToPickIDs[this.filterService.teamPortalActiveClubID].forEach(
        element => {
          if (this.pickInvolved[element] == 1) {
            net += this.pickIDToPick[element]["Points"];
          }
        }
      );
    } catch (e) {}
    return net;
  }
  /**
   * Calculate the pick net differential from what is selected
   */
  calcExactPicksGained() {
    var net = 0;
    try {
      this.teamToPickIDs[this.raiders["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          net -= 1;
        }
      });
      this.teamToPickIDs[this.filterService.teamPortalActiveClubID].forEach(
        element => {
          if (this.pickInvolved[element] == 1) {
            net += 1;
          }
        }
      );
    } catch (e) {}
    return net;
  }
  /**
   * calculate the total picks involved
   */
  calcExactPicksInvolved() {
    var net = 0;
    try {
      this.teamToPickIDs[this.raiders["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          net += 1;
        }
      });
      this.teamToPickIDs[this.filterService.teamPortalActiveClubID].forEach(
        element => {
          if (this.pickInvolved[element] == 1) {
            net += 1;
          }
        }
      );
    } catch (e) {}
    return net;
  }

  /**
   * Get styling of the year tabs for pickDisplay
   * @param year (options, year, year+1, year+2)
   * @param raiders 1 == raiders, 0 == trade team
   */
  highlightOrNot(year: number, raiders: number) {
    if (
      (raiders == 1 && year == this.yearRaiders) ||
      (raiders == 0 && year == this.yearTrade)
    ) {
      return {
        backgroundColor: "white",
        color: "black",
        borderLeft: "0px",
        borderTop: "0px",
        borderRight: "0px",
        borderBottom: "3px solid rgb(66, 197, 245)"
      };
    } else {
      return {};
    }
  }

  /**
   * Returned greyed out opacity filter to put over conditional picks
   * @param value 1 for conditional, 0 for not
   */
  checkConditional(value: number, pick: number) {
    var style = {};
    if (value == 1) {
      style["opacity"] = "0.5";
    }
    if (this.pickInvolved[pick] == 1) {
      style["backgroundColor"] = "#0ad00a";
      style["color"] = "white";
    } else if (this.pickInvolved[pick] == -1) {
      style["backgroundColor"] = "rgb(226, 60, 60)";
      style["color"] = "white";
    }
    return style;
  }

  togglePick(pick) {
    var newState =
      this.pickInvolved[pick] == 1 ? -1 : this.pickInvolved[pick] + 1;
    this.changeToggleValue(pick, newState);
  }

  // background-color: rgb(226, 60, 60);

  /**
   * Change the viewing year
   * @param year (options, year, year+1, year+2)
   * @param raiders 1 == raiders, 0 == trade team
   */
  changeYear(year: number, raiders: number) {
    if (raiders == 1) {
      this.yearRaiders = year;
    } else {
      this.yearTrade = year;
    }
  }

  /**
   *
   * @param event click event
   * @param trade trade object with value, dif, #, and pick linear array
   * @param exact is it the exact trade option or a suggested one? 1 == exact, 0 == suggested
   */
  tradeOptionClicked(event: any, trade: any, exact: number) {
    this.tradeSendingPicks["raiders"] = [];
    this.tradeSendingPicks["tradeTeam"] = [];
    if (exact == 1) {
      this.tradeSelectedArray = [];

      this.teamToPickIDs[this.raiders["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          this.tradeSendingPicks["raiders"].push(element);
          this.tradeSelectedArray.push(element);
        }
      });
      this.teamToPickIDs[this.filterService.teamPortalActiveClubID].forEach(
        element => {
          if (this.pickInvolved[element] == 1) {
            this.tradeSendingPicks["tradeTeam"].push(element);
            this.tradeSelectedArray.push(element);
          }
        }
      );
    } else {
      this.tradeSelectedArray = this.convertPickArrayBinaryToArrayOfPickIDs(
        trade[3],
        this.pickOrderToPickID
      );

      for (var slot = 0; slot < trade[3].length; slot++) {
        if (trade[3][slot] == 1) {
          if (
            this.teamToPickIDs[this.raiders["SailTeamID"]].indexOf(
              this.pickOrderToPickID[slot]
            ) != -1
          ) {
            this.tradeSendingPicks["raiders"].push(
              this.pickOrderToPickID[slot]
            );
          }
          if (
            this.teamToPickIDs[
              this.filterService.teamPortalActiveClubID
            ].indexOf(this.pickOrderToPickID[slot]) != -1
          ) {
            this.tradeSendingPicks["tradeTeam"].push(
              this.pickOrderToPickID[slot]
            );
          }
        }
      }
    }
    if (
      this.tradeSendingPicks["raiders"].length > 0 ||
      this.tradeSendingPicks["tradeTeam"].length > 0
    ) {
      //set time out for click function to go first before showing it
      setTimeout(() => {
        this.tradeToSend = true;
        setTimeout(() => {
          //sets the box offset [262,29] from click
          var box = <HTMLInputElement>(
            document.getElementById("sendingTradeBox")
          );
          box.style.left =
            String(this.math.min(event.clientX, window.innerWidth - 452)) +
            "px";
          box.style.top =
            String(
              this.math.min(window.innerHeight - 186, event.clientY - 47)
            ) + "px";
        }, 1);
      }, 1);
    } else {
      this.tradeToSend = false;
    }
  }

  /**
   * Take 0, 1's array of picks and convert them to a list of Pick ID's to send down
   * @param arr array of only 0's and 1's, 1's correspond to involved in the trade
   */
  convertPickArrayBinaryToArrayOfPickIDs(arr, pickOrderToPickID) {
    var picks = [];
    for (var slot = 0; slot < arr.length; slot++) {
      if (arr[slot] == 1) {
        picks.push(pickOrderToPickID[slot]);
      }
    }
    return picks;
  }

  /**
   * Function to send list of picks involved in a trade to the DB
   * @param whoSent 1 raiders sent, 0 away team sent
   */

  sendTradeToDB(whoSent: Number) {
    var pickInvolved = {};
    Object.keys(this.pickInvolved).forEach(element => {
      if (this.pickIDToPick[element]["ConditionalPick"] == 1) {
        pickInvolved[element] = "-1";
      } else {
        pickInvolved[element] = "0";
      }
    });

    pickInvolved[this.filterService.draftActiveNegotiation["LVPick"]] = "1";
    pickInvolved[this.filterService.draftActiveNegotiation["TradeClubPick"]] =
      "1";
    var output = this.performTradeGenerations(
      pickInvolved,
      this.filterService.draftActiveNegotiation["mnValDif"],
      this.filterService.draftActiveNegotiation["mxValDif"],
      this.filterService.draftActiveNegotiation["mxPickDif"],
      this.filterService.draftActiveNegotiation["mnPickDif"],
      this.filterService.draftActiveNegotiation["NumPicks"]
    );
    var tradeOptions = output["tradeOptions"];
    var pickOrderToPickID = output["pickOrderToPickID"];
    var highTrade = tradeOptions[0];
    var mediumTrade = tradeOptions[Math.floor(tradeOptions.length / 2.0)];
    // if (tradeOptions.length > 0) {
    //   mediumTrade = tradeOptions.reduce(function(prev, curr) {
    //     return Math.abs(prev[0]) < Math.abs(curr[0]) ? prev : curr;
    //   });
    // }
    var lowTrade = tradeOptions[tradeOptions.length - 1];
    var sendingOffer = {
      NegotiationID: this.filterService.draftActiveNegotiation.NegotiationID,
      SailTeamID: this.filterService.teamPortalActiveClubID,
      RaidersOffered: whoSent,
      PickArray: this.tradeSelectedArray,
      High:
        highTrade == null
          ? []
          : this.convertPickArrayBinaryToArrayOfPickIDs(
              highTrade[3],
              pickOrderToPickID
            ),
      Medium:
        mediumTrade == null
          ? []
          : this.convertPickArrayBinaryToArrayOfPickIDs(
              mediumTrade[3],
              pickOrderToPickID
            ),
      Low:
        lowTrade == null
          ? []
          : this.convertPickArrayBinaryToArrayOfPickIDs(
              lowTrade[3],
              pickOrderToPickID
            )
    };
    this.pullData.sendOffer(JSON.stringify(sendingOffer)).subscribe(data => {});

    this.tradeToSend = false;
    this.tradeSendingPicks["raiders"] = [];
    this.tradeSendingPicks["tradeTeam"] = [];
  }

  /**
   * Send an offer to over ride suggestion
   * @param OfferCode High -3, Medium -2, Low -1
   */
  sendTradeToDBSuggestion(OfferCode: Number) {
    var sendingOffer = {
      NegotiationID: this.filterService.draftActiveNegotiation.NegotiationID,
      OfferCode: OfferCode,
      PickArray: this.tradeSelectedArray
    };
    this.pullData
      .pushDraftOfferSuggestion(JSON.stringify(sendingOffer))
      .subscribe(data => {});

    this.tradeToSend = false;
    this.tradeSendingPicks["raiders"] = [];
    this.tradeSendingPicks["tradeTeam"] = [];
  }

  /**
   * Returns appropriate line height of actual trade box if trades are >4
   * @param len number of picks
   */
  lineHeightFromPickNumber(picks: any) {
    var count = 0;
    try {
      for (let pick of picks) {
        if (this.pickInvolved[pick] == 1) {
          count += 1;
        }
      }
    } catch {
      return { lineHeight: "25px" };
    }
    if (count > 4) {
      return { lineHeight: "25px" };
    }
    return { lineHeight: "50px" };
  }

  add;
}
