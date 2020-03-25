import { Component, OnInit } from "@angular/core";
import { PullDataService } from "../pull-data.service";
import { FiltersService } from "../filters.service";
import { SlideInOutAnimation } from "../animations";
import { range } from "rxjs";
import * as cloneDeep from "lodash/cloneDeep";
import { ChangeDetectorRef } from "@angular/core";
import { transition } from "@angular/animations";
import { ɵELEMENT_PROBE_PROVIDERS__POST_R3__ } from "@angular/platform-browser";

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

  //picks matrix [value, gain/loss, ispick]
  picks_M;

  //PickLabel
  pickLabel = "Pick Label";

  //need to keep pick order to overall when computing trades
  pickOrderToPickID = [];

  //keep track of which year the pick belongs to
  //0 current year, 1 future year
  pickOrderToYear = [];

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
  tradeTeam = {
    SailTeamID: 1000,
    TeamCode: "ATL",
    Conference: "NFC",
    Division: "South",
    ClubCityName: "Atlanta",
    ClubNickName: "Falcons"
  };

  //Raiders
  raiders = {
    SailTeamID: 1012,
    TeamCode: "LV",
    Conference: "AFC",
    Division: "West",
    ClubCityName: "Las Vegas",
    ClubNickName: "Raiders"
  };

  //mapping of team to array of pickID's
  teamToPickIDs = {};
  //pick ID  to draft object from database
  pickIDToPick = {};
  constructor(
    public pullData: PullDataService,
    public filterService: FiltersService,
    public cdRef: ChangeDetectorRef
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
    this.pullData.pullDraftPicksInfo().subscribe(data => {
      this.draftPicksRaw = data;
      //set the overall picks correctly since there were two nulls
      //Add in sailID to each pick of origin team
      //Create mapping of team to picks
      for (var i = 0; i < this.draftPicksRaw.length; i++) {
        var sailID = this.clubIDToSailID[this.draftPicksRaw[i]["ClubID"]];
        var pickID = this.draftPicksRaw[i]["PickID"];

        if (this.draftPicksRaw[i]["ConditionalPick"] == 1) {
          this.pickInvolved[pickID] = "-1";
        } else {
          this.pickInvolved[pickID] = "0";
        }

        this.cdRef.detectChanges();

        this.draftPicksRaw[i]["SailID"] = sailID;
        this.pickIDToPick[pickID] = this.draftPicksRaw[i];
        if (this.teamToPickIDs[sailID]) {
          this.teamToPickIDs[sailID] = this.teamToPickIDs[sailID].concat([
            pickID
          ]);
        } else {
          this.teamToPickIDs[sailID] = [pickID];
        }
      }

      this.uploadingPicks = false;
    });
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
    console.log(
      "Time to Generate Permutations (Inverted) = ",
      (end - start) / 1000
    );
    this.permutationsAllSaved[n] = cloneDeep(overall);
    this.permutations = overall;
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
    if (this.tradeTeam.SailTeamID != team.SailTeamID) {
      this.tradeTeam = team;
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
      this.picks_M = [];
      this.pickOrderToPickID = [];
      this.permutations = [];
      this.tradeOptions = [];
      this.tradeSendingPicks["raiders"] = [];
      this.tradeSendingPicks["tradeTeam"] = [];
      this.tradeToSend = false;
      this.yearRaiders = cloneDeep(this.year);
      this.yearTrade = cloneDeep(this.year);
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

        this.performTradeGenerations();
      } else {
        this.pickInvolved[pick] = toLabel;
      }
    }
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
  performTradeGenerations() {
    this.picks_M = [];
    this.pickOrderToPickID = [];
    this.tradeOptions = [];

    for (let raidersPick of this.teamToPickIDs[this.raiders["SailTeamID"]]) {
      if (
        (this.pickInvolved[raidersPick] != -1 &&
          this.pickIDToPick[raidersPick]["Season"] == this.year) ||
        this.pickInvolved[raidersPick] == 1
      ) {
        if (this.picks_M.length < 15) {
          this.picks_M.push([
            -1 * this.pickIDToPick[raidersPick]["Points"],
            -1,
            1
          ]);

          this.pickOrderToPickID.push(raidersPick);
        }
      }
    }
    for (let tradeTeamPick of this.teamToPickIDs[
      this.tradeTeam["SailTeamID"]
    ]) {
      if (
        (this.pickInvolved[tradeTeamPick] != -1 &&
          this.pickIDToPick[tradeTeamPick]["Season"] == this.year) ||
        this.pickInvolved[tradeTeamPick] == 1
      ) {
        if (this.picks_M.length < 15) {
          this.picks_M.push([this.pickIDToPick[tradeTeamPick]["Points"], 1, 1]);
          this.pickOrderToPickID.push(tradeTeamPick);
        }
      }
    }
    if (!this.permutationsAllSaved[this.picks_M.length]) {
      this.permutations = [];

      this.genperms2(this.picks_M.length);
    } else {
      this.permutations = this.permutationsAllSaved[this.picks_M.length];
    }
    this.computeTradeOptions();
  }

  /**
   * From the permutations and picks matrix generate the trade package values
   */
  computeTradeOptions() {
    this.tradeOptions = [];
    try {
      //go through permutations and compute the three values for the trades
      //i is the permutation
      //slot is the pick
      //inverted access
      for (var i = 0; i < 2 ** this.picks_M.length; i++) {
        var valid = true;
        var value = 0;
        var pickChange = 0;
        var pickQuantity = 0;
        var count = 0;
        var perm = [];
        for (var slot = 0; slot < this.picks_M.length; slot++) {
          perm.push(this.permutations[slot][i]);
          count += this.permutations[slot][i];

          if (
            this.pickInvolved[this.pickOrderToPickID[slot]] == 1 &&
            this.permutations[slot][i] != 1
          ) {
            valid = false;
            continue;
          }
          if (this.permutations[slot][i]) {
            value += this.picks_M[slot][0];
            pickChange += this.picks_M[slot][1];
            pickQuantity += 1;
          }
        }

        // console.log(perm);
        //Sort on the custom input values
        if (
          valid == true &&
          value >= this.minTradeValueDif &&
          value <= this.maxTradeValueDif &&
          pickChange <= this.maxTradePickDif &&
          pickChange >= this.minTradePickDif &&
          pickQuantity <= this.tradePicksQuantity &&
          pickQuantity >= 2
        ) {
          this.tradeOptions.push([value, pickChange, pickQuantity, perm]);
        }
      }

      //sort based on value, then pick dif, then overall picks
      this.tradeOptions = this.tradeOptions.sort((a, b) => {
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
  }
  /**
   * generate all permuations for given input length
   * @param length number of picks potentially involved
   * @param arrayRep array of permutations being build
   * @param position index in array to recurse on
   */
  generatePermutations2(length: number, arrayRep: any, position: number) {
    this.permutationsAll[position].push(cloneDeep(arrayRep));
    if (position < length) {
      //If the pick is definitely involved dont recurse down the scenario when its not in
      if (this.pickInvolved[this.pickOrderToPickID[position]] != 1) {
        arrayRep.push(0);
        var newArr = cloneDeep(arrayRep);
        this.generatePermutations(length, newArr, position + 1);
      }

      //recurse down scenario if the pick is involved
      arrayRep[position] = 1;
      this.generatePermutations(length, arrayRep, position + 1);
    }
  }
  /**
   * generate all permuations for a single length
   * @param length number of picks potentially involved
   * @param arrayRep array of permutations being build
   * @param position index in array to recurse on
   */
  generatePermutations(length: number, arrayRep: any, position: number) {
    if (position == length) {
      this.permutations.push(arrayRep);
    } else {
      //If the pick is definitely involved dont recurse down the scenario when its not in
      if (this.pickInvolved[this.pickOrderToPickID[position]] != 1) {
        arrayRep.push(0);
        var newArr = cloneDeep(arrayRep);
        this.generatePermutations(length, newArr, position + 1);
      }

      //recurse down scenario if the pick is involved
      arrayRep[position] = 1;
      this.generatePermutations(length, arrayRep, position + 1);
    }
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
      this.teamToPickIDs[this.tradeTeam["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          net += this.pickIDToPick[element]["Points"];
        }
      });
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
      this.teamToPickIDs[this.tradeTeam["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          net += 1;
        }
      });
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
      this.teamToPickIDs[this.tradeTeam["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          net += 1;
        }
      });
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
  checkConditional(value: number) {
    if (value == 1) {
      return { opacity: "0.5" };
    } else {
      return {};
    }
  }

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
      this.teamToPickIDs[this.raiders["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          this.tradeSendingPicks["raiders"].push(element);
        }
      });
      this.teamToPickIDs[this.tradeTeam["SailTeamID"]].forEach(element => {
        if (this.pickInvolved[element] == 1) {
          this.tradeSendingPicks["tradeTeam"].push(element);
        }
      });
    } else {
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
            this.teamToPickIDs[this.tradeTeam["SailTeamID"]].indexOf(
              this.pickOrderToPickID[slot]
            ) != -1
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
            String(this.math.min(window.innerHeight - 77, event.clientY - 47)) +
            "px";
        }, 1);
      }, 1);
    } else {
      this.tradeToSend = false;
    }
  }

  /**
   * Function to send list of picks involved in a trade to the DB
   */
  sendTradeToDB() {
    console.log("SENDING Trade");
    console.log(cloneDeep(this.tradeSendingPicks));
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
    for (let pick of picks) {
      if (this.pickInvolved[pick] == 1) {
        count += 1;
      }
    }
    if (count > 4) {
      return { lineHeight: "25px" };
    }
    return { lineHeight: "50px" };
  }
}
