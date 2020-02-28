import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import * as cloneDeep from "lodash/cloneDeep";
import { PullDataService } from "../pull-data.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { SavingFAHYPOComponent } from "../saving-fahypo/saving-fahypo.component";
import { Router, ActivatedRoute } from "@angular/router";
import { BodyComponent } from "../body/body.component";

import { UploadFAHYPOComponent } from "../upload-fahypo/upload-fahypo.component";
import { KeyValue } from "@angular/common";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";

@Component({
  selector: "app-fa-hypo",
  templateUrl: "./fa-hypo.component.html",
  styleUrls: ["./fa-hypo.component.css"]
})
export class FaHypoComponent implements OnInit {
  //location in the div to put them (based of a div area that is 1104px wide)
  locationDepth = {
    1: { BinLabel: "QB", Top: 625, Left: 475 },
    2: { BinLabel: "LT", Top: 400, Left: 205 },
    3: { BinLabel: "LG", Top: 400, Left: 340 },
    4: { BinLabel: "C", Top: 400, Left: 475 },
    5: { BinLabel: "RG", Top: 400, Left: 610 },
    6: { BinLabel: "RT", Top: 400, Left: 745 },
    7: { BinLabel: "TE", Top: 400, Left: 940 },
    8: { BinLabel: "FB", Top: 585, Left: 630 },
    9: { BinLabel: "RB", Top: 625, Left: 320 },
    10: { BinLabel: "SWR", Top: 585, Left: 164 },
    11: { BinLabel: "XWR", Top: 400, Left: 10 },
    12: { BinLabel: "ZWR", Top: 585, Left: 940 },
    13: { BinLabel: "NT", Top: 210, Left: 410 },
    14: { BinLabel: "3T", Top: 210, Left: 620.5 },
    15: { BinLabel: "LDE", Top: 210, Left: 773 },
    16: { BinLabel: "RDE", Top: 210, Left: 185 },
    17: { BinLabel: "MLB", Top: 30, Left: 536 },
    18: { BinLabel: "WLB", Top: 30, Left: 355 },
    19: { BinLabel: "SLB", Top: 30, Left: 854 },
    20: { BinLabel: "SS", Top: 0, Left: 687 },
    21: { BinLabel: "FS", Top: 0, Left: 164 },
    22: { BinLabel: "NCB", Top: 30, Left: 8 },
    23: { BinLabel: "RCB", Top: 210, Left: 8 },
    24: { BinLabel: "LCB", Top: 210, Left: 940 },
    25: { BinLabel: "ST", Top: 662, Left: 10 }
  };

  math; //for built in math class
  number; //for built in number class

  connectedPositionLists = []; //list of names of bins to connect for cdkdragdrop package
  allBins = []; //structure for bins

  uploadingScenario = true; //bool for showing grey loading circle overlay

  ufaViewing = -1; //default view QB's in ufa's, indicates which ufa bin to view

  cashSums = {}; // sum of every bin except for UFA (i.e. bin >= 0)
  emptySums = {}; //structure with total set to 0 so perform calculations can reset all the totals

  logOfMoves = {};

  //Original bin and order in default mapping to check if difference in current location
  originalBinMapping = {};
  originalOrderMapping = {};

  //Variables for editing pop up div
  editValueDisplay = false; //editing or not
  editingValue = "0.0"; //val to change
  editingPlayer; //item to edit
  editCapInfoDisplay = false; //editing or not
  editingCapInfo = "0.0"; //val to change
  editingCap: string; //item name to edit

  //the editable numbers for the spending (and the default values)
  capInfoOriginal = { CT: 230000000, PTCS: 12500000, IRRIM: 12500000 };

  //boolean to make sure the original mappings are only created once
  initMappings = false;

  //name and description and scenario ID of what we are currently editing
  name: string;
  description: string;
  scenarioID: any = null;
  playerCount = 0;

  //Draft pick data structure in case want to play around with less or more draft picks / cash
  draftPicks = {
    1: {
      signing: 11000000,
      p5: 510000,
      rount: 1,
      pick: 12,
      origin: "OAK"
    },
    2: {
      signing: 8000000,
      p5: 510000,
      rount: 1,
      pick: 19,
      origin: "CHI"
    },
    3: {
      signing: 1200000,
      p5: 510000,
      rount: 3,
      pick: 12,
      origin: "OAK"
    },
    4: {
      signing: 1100000,
      p5: 510000,
      rount: 3,
      pick: 19,
      origin: "CHI"
    },
    5: {
      signing: 1000000,
      p5: 510000,
      rount: 3,
      pick: 26,
      origin: "SEA"
    },
    6: {
      signing: 815000,
      p5: 510000,
      rount: 4,
      pick: 12,
      origin: "OAK"
    },
    7: {
      signing: 345000,
      p5: 510000,
      rount: 5,
      pick: 12,
      origin: "OAK"
    }
  };
  draftp5 = 0;
  draftsb = 0;

  //These are the numbers seen in the top right, and the numbers we care about for spending
  calculationsValues = {
    CT: {
      Label: "Cash Target:",
      Value: 230000000,
      calc: 0,
      display: 1,
      OrderID: 1
    },
    CTZ: {
      Label: "Contracts and Tenders:",
      Value: 0,
      calc: 1,
      display: 1,
      OrderID: 5
    },
    IRRIM: {
      Label: "IR Replacements, Incentives, Misc:",
      Value: 12500000,
      calc: 0,
      display: 1,
      OrderID: 3
    },
    GAP: {
      Label: "",
      Value: null,
      calc: 1,
      display: 1,
      OrderID: 4
    },
    PTCS: {
      Label: "Pre Training Camp Signing:",
      Value: 12500000,
      calc: 0,
      display: 1,
      OrderID: 2
    },
    PSOM: {
      Label: "Practice Squad Over Minimum:",
      Value: 500000,
      calc: 1,
      display: 1,
      OrderID: 7
    },
    DS: {
      Label: "2020 Draft Selections:",
      Value: 27030000,
      calc: 1,
      display: 1,
      OrderID: 6
    },
    RC: {
      Label: "Roster to 53 Credit:",
      Value: 0,
      calc: 1,
      display: 1,
      OrderID: 8
    },
    PA: {
      Label: "Released Players:",
      Value: 0,
      calc: 1,
      display: 1,
      OrderID: 9
    },
    SAWOA: {
      Label: "Spending Available:",
      Value: 0,
      calc: 1,
      display: 0,
      OrderID: 1
    }
  };

  constructor(
    public filterService: FiltersService,
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router,
    public body: BodyComponent,
    public dialog: MatDialog
  ) {
    //Add listeners for clicks and keypress
    document.addEventListener("keypress", e => this.onKeyPress(e));
    document.addEventListener("click", e => this.onClick(e));
    this.number = Number;
    this.math = Math;
  }
  /**
   * If clicked not on editing box then close it (for cap and market editing)
   * @param event click event
   */
  onClick(event) {
    if (this.editValueDisplay && event.target.id == "") {
      this.clearPlayerValue();
    }
    if (this.editCapInfoDisplay && event.target.id == "") {
      this.clearEditCap();
    }
  }
  /**
   * pressing enter will close the editing boxes if they are open
   * @param event keypress event
   */
  onKeyPress(event) {
    if (event.key == "Enter" && this.editValueDisplay) {
      this.clearPlayerValue();
    }
    if (event.key == "Enter" && this.editCapInfoDisplay) {
      this.clearEditCap();
    }
  }

  /**
   * Reset the editing info
   */
  clearEditCap() {
    this.editCapInfoDisplay = false;
    this.editingCap = null;
    this.editingCapInfo = "0.0";
  }
  /**
   * Reset the editing info
   */
  clearPlayerValue() {
    this.editValueDisplay = false;
    this.editingPlayer = null;
    this.editingValue = "0.0";
  }

  ngOnInit() {
    //This commented code will perform the function on a change to the variable subscribed to
    // this.filterService.timeLastUFAPull.subscribe(data => {
    //   this.initUFABoard();
    // });

    this.body.portalHighlight("fa-hypo");
    this.initArraysRaiders();
  }
  /**
   * Initial function when new data or portal open occurs
   */
  initArraysRaiders() {
    if (this.filterService.checkUploadComplete()) {
      //Reset all the variables
      this.connectedPositionLists = [];
      this.allBins = [];
      this.ufaViewing = -1;
      this.cashSums = {};
      this.emptySums = {};
      this.logOfMoves = {};
      this.clearEditCap();
      this.clearPlayerValue();
      //create bin mappings
      this.createBinMappings();

      for (let group of this.filterService.faHypoBins) {
        //go through the bins and create the cash sum with 0 total to become empty sums
        if (group["BinID"] >= 0) {
          this.cashSums[group["BinID"]] = {
            label: group["BinLabel"],
            total: 0
          };
        }
        //add the list object to the bins variable structure with the correct players
        this.allBins.push({
          id: group["BinID"],
          label: group["BinLabel"],
          players: this.filterPlayers(this.filterService.faHypo, group["BinID"])
        });

        this.connectedPositionLists.push(String(group["BinID"]));
      }
      this.emptySums = cloneDeep(this.cashSums);
      this.performCalculations();
      // DONE UPLOADING
      this.uploadingScenario = false;
    } else {
      setTimeout(() => {
        this.initArraysRaiders();
      }, 100);
    }
  }

  /**
   * Get the original bin location and order for each player
   * Only run once
   */
  createBinMappings() {
    if (this.initMappings) {
      return null;
    } else {
      //run through players make original bin and order mappings
      for (let player of this.filterService.faHypo) {
        this.originalBinMapping[player["PlayerID"]] = cloneDeep(
          player["BinID"]
        );

        this.originalOrderMapping[player["PlayerID"]] = cloneDeep(
          player["OrderID"]
        );
      }
      this.initMappings = true;
    }
  }

  /**
   * Run through each bin and add up the players
   * Then perform the calculations on the cash spending
   */
  performCalculations() {
    this.cashSums = cloneDeep(this.emptySums);

    this.calculationsValues["CTZ"].Value = 0;
    var sumAdd = 0; //total value of contracts and tenders of players in the depth
    this.playerCount = Object.keys(this.draftPicks).length; //base player count is draft picks
    var DeadMoney = 0; //dead money for players in bin 0 (aka cut)
    for (let bin of this.allBins) {
      var binAdd = 0;

      for (let player of bin["players"]) {
        if (bin.id > 0) {
          binAdd += this.calcValueToUseAndDisplay(player);
          sumAdd += this.calcValueToUseAndDisplay(player);
          this.playerCount += 1;
        }
        if (bin.id == 0) {
          binAdd += this.calcValueToUseAndDisplay(player) - player.DeadMoney;
          DeadMoney += player.DeadMoney;
        }
      }

      if (bin.id >= 0) {
        this.cashSums[bin.id]["total"] += binAdd;
      }
    }

    this.calculationsValues.RC.Value =
      (this.playerCount <= 53,
      1000000 * (53 - this.playerCount),
      510000 * (53 - this.playerCount));
    this.calculationsValues.PA.Value = -1 * this.cashSums[0].total;
    this.calculationsValues["CTZ"].Value = sumAdd; //Contracts and Tenders

    //Formula given
    //must subtract dead money (which is negative) to tie out
    this.calculationsValues.SAWOA.Value =
      this.calculationsValues.CT.Value -
      this.calculationsValues.CTZ.Value -
      this.calculationsValues.IRRIM.Value -
      this.calculationsValues.PTCS.Value -
      this.calculationsValues.PSOM.Value -
      this.calculationsValues.DS.Value -
      this.calculationsValues.RC.Value -
      DeadMoney;
  }

  /**
   * This will sum the draft pick info
   * currently unused because of the choice to not allow draft picks to be edited
   */
  sumDraft() {
    for (let pick in this.draftPicks) {
      this.draftp5 += this.draftPicks[pick].p5;
      this.draftsb += this.draftPicks[pick].signing;
    }
  }

  /**
   * Go through the lists that were altered and then update the orderID varibale accordingly
   * Track the move
   * index of the two lists correspond
   * @param lists list of player objects
   * @param ids list of bin ID's
   */
  update(lists: any[], ids: any[]) {
    for (let index = 0; index < lists.length; index++) {
      var pos = lists[index];
      var bin = Number(ids[index]);

      for (let i = 0; i < pos.length; i++) {
        //for each player
        var lenMoves = Object.keys(this.logOfMoves).length; //get length of moves to add to next one if change

        pos[i]["OrderID"] = 1 + i; //indexing from 0

        pos[i]["BinID"] = bin;
        var player = cloneDeep(pos[i]);
        var SailID = player["PlayerID"];
        if (
          (player["OrderID"] != this.originalOrderMapping[SailID] ||
            player["BinID"] != this.originalBinMapping[SailID]) &&
          player["BinID"] >= 0
        ) {
          //change so add to moves log
          this.logOfMoves[SailID] = {
            item: player,
            newBin: player["BinID"],
            originalBin: this.originalBinMapping[SailID],
            originalOrder: this.originalOrderMapping[SailID],
            type: this.getType(
              this.originalBinMapping[SailID],
              player["BinID"]
            ),
            OrderID: lenMoves + 1
          };
        } else {
          if (this.logOfMoves[SailID]) {
            delete this.logOfMoves[SailID];
          }
        }
      }
    }
    //update calculations
    this.performCalculations();
  }

  /**
   * return a list of player objects that have the bin number
   *
   * @param data list of player object
   * @param position bin number
   */
  filterPlayers(data: any, position: number) {
    try {
      var returnPlayer = [];
      if (data.length < 1) {
        return returnPlayer;
      }
      for (let player of data) {
        if (position == player["BinID"]) {
          returnPlayer.push(cloneDeep(player));
        }
      }
      return returnPlayer;
    } catch (e) {
      return [];
    }
  }

  /**
   * Based on which input positon bin, determine position styling
   * from the locationsDepth variable
   *
   * @param binID position Bin ID, binID >0
   */
  depthLocationStyle(binID: number) {
    // areaWidth: height: calc(100vh - 128px);
    // width: 64% of fa-hypo div area
    // based off 1104
    return {
      position: "fixed",
      top: String(this.locationDepth[binID].Top + 103) + "px",
      left:
        "calc((" +
        String(this.locationDepth[binID].Left / 1104) +
        " * .64 * (100vw - 200px)) + 200px)",
      border: "1px solid #ececec"
    };
  }

  /**
   * Clicking a position tab will use this to change which list of players is viewed
   * @param newPos binID to view UFA's in, newPos <0
   */
  changeView(newPos: number) {
    this.ufaViewing = newPos;
  }

  /**
   * Get sttyling of the bin tab for UFA's
   * @param id binID (id <0)
   */
  highlightOrNot(id: number) {
    if (id == this.ufaViewing) {
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
   * Take the event of a drop
   * check if its putting in a new list or not
   * Condition if its allowed based on original bins of the item and target bin
   * @param event drop event for cdkdragdrop lists
   */
  drop(event: CdkDragDrop<string[]>) {
    var previousID = Number(event.previousContainer.id);
    var newID = Number(event.container.id);
    var sailID = event.previousContainer.data[event.previousIndex]["PlayerID"];
    var newIndex = event.currentIndex;

    //same list depth change
    if (event.previousContainer === event.container) {
      //Flip the coordinate of change based on inverted defense position or not
      if (13 <= newID && newID <= 24) {
        newIndex = event.container.data.length - 1 - event.currentIndex;
      }
      moveItemInArray(event.container.data, event.previousIndex, newIndex);

      this.update([event.container.data], [event.container.id]);
    } else {
      //between lists
      if (
        (newID == 0 && this.originalBinMapping[sailID] > 0) ||
        newID > 0 ||
        (newID < 0 && this.originalBinMapping[sailID] < 0)
      ) {
        if (13 <= newID && newID <= 24) {
          //update index if inverted
          newIndex = event.container.data.length - event.currentIndex;
        }
        //built in function of package
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          newIndex
        );
        this.update(
          [event.previousContainer.data, event.container.data],
          [previousID, newID]
        );
      }
    }
  }
  /**
   * Based on bins determine signing
   * @param originalID Bin ID
   * @param newID Bin ID
   */
  getType(originalID: Number, newID: number) {
    //cut 0
    //sign 1
    //move 2
    //Depth change 3
    if (originalID == newID) {
      return 3;
    } else if (originalID > 0 && newID == 0) {
      return 0;
    } else if (originalID > 0 && newID > 0) {
      return 2;
    } else if (originalID < 0 && newID > 0) {
      return 1;
    }
    //invalid move
    return -1;
  }
  /**
   *
   * @param event click event
   * @param player player object to alter
   */
  editValue(event: any, player: any) {
    this.editValueDisplay = true;
    this.editingPlayer = player;

    //convert to millions from raw
    this.editingValue = String(this.calcValueToUseAndDisplay(player) / 1000000);

    //let it render first
    setTimeout(() => {
      //sets the box offset [262,36] from click
      var box = <HTMLInputElement>document.getElementById("editValueBox");
      box.style.left =
        String(this.math.min(event.clientX, window.innerWidth - 262)) + "px";
      box.style.top = String(event.clientY - 36) + "px";
      document.getElementById("editValueInput").focus();
    }, 1);
  }
  /**
   * open box and init values and location
   * @param event click even
   * @param category string name of editing value
   */
  editCapInfo(event: any, category: string) {
    this.editCapInfoDisplay = true;

    this.editingCap = category;
    this.editingCapInfo = String(
      this.calculationsValues[category].Value / 1000000
    );

    setTimeout(() => {
      var box = <HTMLInputElement>document.getElementById("editCapInfoBox");
      box.style.left =
        String(this.math.min(event.clientX, window.innerWidth - 262)) + "px";
      box.style.top = String(event.clientY - 36) + "px";
      document.getElementById("editCapInfoInput").focus();
    }, 1);
  }

  /**
   * value to override market value
   * @param newVal number in millions
   */
  overrideValue(newVal: any) {
    this.editingPlayer.CustomAmt = Number(newVal) * 1000000;
    this.performCalculations();
  }

  /**
   * Number to override cap info
   * @param newVal number in millions
   */
  overrideCapInfo(newVal: any) {
    this.calculationsValues[this.editingCap].Value = Number(newVal) * 1000000;
    this.performCalculations();
  }

  /**
   * Generate the sending up format of a combines list of players
   *
   */
  save() {
    var savingList = [];
    for (let bin of this.allBins) {
      for (let player in bin.players) {
        var returnPlayer = cloneDeep(bin.players[player]);
        //only add info that could change
        savingList.push({
          BinID: returnPlayer.BinID,
          OrderID: returnPlayer.OrderID,
          PlayerID: returnPlayer.PlayerID,
          CustomAmt: returnPlayer.CustomAmt
        });
      }
    }

    //send down names, description,data, and cap numbers that could change
    this.pullData
      .insertHypoScenarioData(
        JSON.stringify({
          ScenarioID: this.scenarioID,
          Label: this.name,
          ScenarioDesc: this.description,
          data: savingList,
          Budget_Target: this.calculationsValues["CT"].Value,
          Budget_Signings: this.calculationsValues["PTCS"].Value,
          Budget_Replacements: this.calculationsValues["IRRIM"].Value
        })
      )
      .subscribe(data => {
        try {
          this.scenarioID = data[0][""];
        } catch (e) {}
      });
  }

  /**
   * SAVE FILTER OR OPEN UP NAME POP UP MODAL TO SAVE IF NEW SCENARIO
   * @param saveAs number indicating which button was clicked (1 is saveas, 0 is save)
   */
  saveScenario(saveAs: number = 1) {
    if (saveAs == 0 && this.scenarioID != null) {
      this.save();
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "80%";
      dialogConfig.height = "auto";
      dialogConfig.autoFocus = true;
      dialogConfig.position = { top: "175px", left: "15%" };
      dialogConfig.data = { previousName: this.filterService.getName() };

      const dialogRef = this.dialog.open(SavingFAHYPOComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(data => {
        this.scenarioID = null;
        if (data != undefined) {
          this.name = data.name;
          this.description = data.description;
          this.save();
        }
      });
    }
  }

  /**
   * Open up upload scenario pop up
   * on close then initialize based on new data for players and cap info
   */
  uploadScenario() {
    //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(80%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "160px", left: "15%" };
    dialogConfig.data = {};

    //OPEN WINDOW
    const dialogRef = this.dialog.open(UploadFAHYPOComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      try {
        if (data.scenario != undefined && data.scenario > 0) {
          this.scenarioID = data.scenario;
          this.uploadingScenario = true;
          this.pullData
            .pullHypoPlayers(data.scenario)
            .subscribe(dataPlayers => {
              this.filterService.faHypo = dataPlayers;
              this.name = data.name;
              this.description = data.desc;
              this.calculationsValues["CT"].Value = data.Budget_Target;

              this.calculationsValues["IRRIM"].Value = data.Budget_Replacements;
              this.calculationsValues["PTCS"].Value = data.Budget_Signings;
              this.initArraysRaiders();
            });
        }
      } catch (e) {}
    });
  }

  /**
   * Reset to original starting scenario
   */
  resetScenario() {
    this.uploadingScenario = true;
    this.pullData.pullHypoPlayers(0).subscribe(dataPlayers => {
      this.filterService.faHypo = dataPlayers;
      this.scenarioID = null;
      this.name = null;
      this.description = null;
      this.calculationsValues["CT"].Value = this.capInfoOriginal.CT;

      this.calculationsValues["IRRIM"].Value = this.capInfoOriginal.IRRIM;
      this.calculationsValues["PTCS"].Value = this.capInfoOriginal.PTCS;
      this.initArraysRaiders();
    });
  }

  /**
   * change player to stop using input value and go back to market value
   */
  resetInputValueNull() {
    this.editingPlayer.CustomAmt = null;
    this.performCalculations();
  }
  /**
   * Reset the cap info if it was changed
   */
  resetInputCapInfoNull() {
    this.calculationsValues[this.editingCap].Value = this.capInfoOriginal[
      this.editingCap
    ];
    this.performCalculations();
  }

  /**
   * Return the value of the player
   * It is the custom input or market value if not
   * @param player player object
   */
  calcValueToUseAndDisplay(player) {
    if (player.CustomAmt != null) {
      return player.CustomAmt;
    }
    if (player.Amt != null) {
      return player.Amt;
    }
    return 0;
  }
  /**
   * UFA styling
   * @param player playerObject
   */
  UFAPlayerStyle(player: any) {
    return {
      backgroundColor: String(player.HexColor),
      color: String(player.TextColor)
    };
  }
  /**
   * Cut styling
   * @param player playerObject
   */
  CUTPlayerStyle(player: any) {
    return {
      backgroundColor: "lightgrey",
      color: "black"
    };
  }
  /**
   * player card styling for value
   * @param player playerObject
   */
  depthBorderInsideTop(player: any) {
    if (this.originalBinMapping[player.PlayerID] < 0) {
      return {
        borderBottom: "1px solid white", // + String(player.TextColor),
        borderRight: "1px solid white", // + String(player.TextColor)
        backgroundColor: "white",
        color: "black",
        fontWeight: "bold",
        marginLeft: "-2px"
      };
    }
    return {
      borderBottom: "1px solid white", // + String(player.TextColor),
      borderRight: "1px solid white", // + String(player.TextColor)
      backgroundColor: "black",
      color: "white",
      fontWeight: "bold",
      marginLeft: "-2px"
    };
  }

  /**
   * for bottom left dead money styling
   * @param player playerObject
   */
  depthBorderInsideBottom(player: any) {
    return {
      borderRight: "1px solid white"
    };
  }

  /**
   * for bottom right corner styling
   * @param player playerObject
   */
  depthBorderRightBlack(player: any) {
    return {
      borderRight: "1px solid black"
    };
  }
  /**
   * for name styling
   * @param player playerObject
   */
  depthBorderRightBlackBottomColor(player: any) {
    return {
      borderRight: "1px solid black",
      borderBottom: "1px solid white",
      overflowX: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis"
    };
  }
  /**
   * top half styling
   * condition based on if signing or not

   * @param player playerObject
   */
  DepthPlayerStyleTop(player: any) {
    if (this.originalBinMapping[player.PlayerID] >= 0) {
      return { backgroundColor: "white", color: "black" };
    }
    return { backgroundColor: "#179c25" };
  }
  /**
   * for bottom half styling
   * condition based on if signing or not
   * @param player playerObject
   */
  DepthPlayerStyleBottom(player: any) {
    if (this.originalBinMapping[player.PlayerID] >= 0) {
      return { backgroundColor: "#EAEAEA", color: "black" };
    }
    return { backgroundColor: "#6CDE77", color: "black" };
  }

  /**
   * Flip orientation if its defense
   * @param bin Bin ID
   */
  depthOrientationStyle(bin) {
    if (13 <= bin.id && bin.id <= 24) {
      return {
        flexDirection: "column-reverse",
        position: "absolute",
        bottom: "0",
        width: "100%",
        minHeight: "150px"
      };
    }
    return {
      flexDirection: "column",
      minHeight: "150px"
    };
  }

  /**
   * flip header position if its defense
   * @param bin bin ID
   */
  depthHeaderOrientationStyle(bin) {
    if (13 <= bin.id && bin.id <= 24) {
      return {
        position: "absolute",
        bottom: "-21px",
        width: "98%",
        borderTopLeftRadius: "0px",
        borderTopRightRadius: "0px",
        borderBottomLeftRadius: "7px",
        borderBottomRightRadius: "7px",
        zIndex: "100"
      };
    }
    return { marginBottom: "3px" };
  }

  /**
   * return red color style if number is negative
   * @param val
   */
  colorTextRedIfNegative(val: Number) {
    if (val < 0) {
      return { color: "Red" };
    }
  }
}
