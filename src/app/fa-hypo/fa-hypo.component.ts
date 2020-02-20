import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import * as cloneDeep from "lodash/cloneDeep";
import { PullDataService } from "../pull-data.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { SavingFAHYPOComponent } from "../saving-fahypo/saving-fahypo.component";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { BodyComponent } from "../body/body.component";

import { UploadFAHYPOComponent } from "../upload-fahypo/upload-fahypo.component";
import { KeyValue } from "@angular/common";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import {
  DomSanitizer,
  SafeUrl,
  ɵELEMENT_PROBE_PROVIDERS__POST_R3__
} from "@angular/platform-browser";

@Component({
  selector: "app-fa-hypo",
  templateUrl: "./fa-hypo.component.html",
  styleUrls: ["./fa-hypo.component.css"]
})
export class FaHypoComponent implements OnInit {
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

  math;
  number;
  connectedPositionLists = [];
  allBins = [];
  uploadingScenario = true;
  ufaViewing = -1;
  cashSums = {};
  emptySums = {};
  cap = 0;
  logOfMoves = {};
  connectedBinMapping = {};
  originalBinMapping = {};
  originalOrderMapping = {};
  originalValueMapping = {};
  editValueDisplay = false;
  editingValue = "0.0";
  editingPlayer;
  editCapInfoDisplay = false;
  editingCapInfo = "0.0";
  editingCap: string;
  capInfoOriginal = { CT: 230000000, PTCS: 12500000, IRRIM: 12500000 };
  initMappings = false;
  name: string;
  description: string;
  scenarioID: any = null;
  playerCount = 0;
  draftp5 = 0;
  draftsb = 0;
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
    document.addEventListener("keypress", e => this.onKeyPress(e));
    document.addEventListener("click", e => this.onClick(e));
    this.number = Number;
    this.math = Math;
  }
  onClick(event) {
    if (this.editValueDisplay && event.target.id == "") {
      this.clearPlayerValue();
    }
    if (this.editCapInfoDisplay && event.target.id == "") {
      this.clearEditCap();
    }
  }
  onKeyPress(event) {
    if (event.key == "Enter" && this.editValueDisplay) {
      this.clearPlayerValue();
    }
    if (event.key == "Enter" && this.editCapInfoDisplay) {
      this.clearEditCap();
    }
  }
  clearEditCap() {
    this.editCapInfoDisplay = false;
    this.editingCap = null;
    this.editingCapInfo = "0.0";
  }
  clearPlayerValue() {
    this.editValueDisplay = false;
    this.editingPlayer = null;
    this.editingValue = "0.0";
  }

  ngOnInit() {
    //This commented code will perform the function on a change to the data
    // this.filterService.timeLastUFAPull.subscribe(data => {
    //   console.log("CHANGE", data);
    //   this.initUFABoard();
    // });

    this.body.portalHighlight("fa-hypo");
    this.initArraysRaiders();
  }

  initArraysRaiders() {
    if (this.filterService.faHypo && this.filterService.faHypoBins) {
      this.connectedPositionLists = [];
      this.allBins = [];

      this.ufaViewing = -1;
      this.cashSums = {};
      this.emptySums = {};
      this.cap = 0;
      this.logOfMoves = {};
      this.editValueDisplay = false;
      this.editingValue = "0.0";
      this.editingPlayer = null;

      this.createBinMappings();

      for (let group of this.filterService.faHypoBins) {
        if (group["BinID"] >= 0) {
          this.cashSums[group["BinID"]] = {
            label: group["BinLabel"],
            total: 0
          };
        }

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
  createBinMappings() {
    if (this.initMappings) {
      return null;
    } else {
      for (let group of this.filterService.faHypoBins) {
        this.connectedBinMapping[group["BinID"]] == [];
        if (group["BinID"] >= 0) {
          for (let group2 of this.filterService.faHypoBins) {
            if (group2["BinID"] >= 0) {
              this.connectedBinMapping[group["BinID"]] += [group2["BinID"]];
            }
          }
        }
        if (group["BinID"] < 0) {
          for (let group2 of this.filterService.faHypoBins) {
            if (group2["BinID"] > 0) {
              this.connectedBinMapping[group["BinID"]] += [group2["BinID"]];
            }
          }
        }
      }
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
  performCalculations() {
    this.cashSums = cloneDeep(this.emptySums);

    this.calculationsValues["CTZ"].Value = 0;
    var sumAdd = 0;
    this.playerCount = Object.keys(this.draftPicks).length;
    var DeadMoney = 0;
    for (let bin of this.allBins) {
      var binAdd = 0;

      for (let player of bin["players"]) {
        if (bin.id > 0) {
          binAdd += this.calcValueToUseAndDisplay(player);
          sumAdd += this.calcValueToUseAndDisplay(player);
          this.playerCount += 1;
        }
        if (bin.id == 0) {
          binAdd += this.math.max(
            this.calcValueToUseAndDisplay(player) - player.DeadMoney,
            0
          );
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
    this.calculationsValues["CTZ"].Value = sumAdd;
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
  sumDraft() {
    for (let pick in this.draftPicks) {
      this.draftp5 += this.draftPicks[pick].p5;
      this.draftsb += this.draftPicks[pick].signing;
    }
    // console.log(this.draftp5, this.draftsb);
  }

  update(lists: any[], ids: any[]) {
    for (let index = 0; index < lists.length; index++) {
      var pos = lists[index];
      var bin = ids[index];

      for (let i = 0; i < pos.length; i++) {
        var lenMoves = Object.keys(this.logOfMoves).length;

        pos[i]["OrderID"] = 1 + i;

        pos[i]["BinID"] = Number(ids[index]);
        var player = cloneDeep(pos[i]);
        var SailID = player["PlayerID"];
        if (
          (player["OrderID"] != this.originalOrderMapping[SailID] ||
            player["BinID"] != this.originalBinMapping[SailID]) &&
          player["BinID"] >= 0
        ) {
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

    this.performCalculations();
  }
  compareOrders(a, b) {
    if (a.OrderID < b.OrderID) {
      return -1;
    }
    if (a.OrderID > b.OrderID) {
      return 1;
    }
    return 0;
  }

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
  depthLocationStyle(binID: number) {
    // areaWidth: height: calc(100vh - 128px);
    // width: 64%
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
  changeView(newPos: number) {
    this.ufaViewing = newPos;
  }

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

  //RETURN THE ITEMS IN THE ORDER SPECIFIED

  valueOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["OrderID"] < b.value["OrderID"]
      ? -1
      : b.value["OrderID"] < a.value["OrderID"]
      ? 1
      : 0;
  };

  //RETURN THE ITEMS IN THE REVERSE OF THE ORDER SdPECIFIED

  reverseValueOrder = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    return a.value["OrderID"] > b.value["OrderID"]
      ? -1
      : b.value["OrderID"] > a.value["OrderID"]
      ? 1
      : 0;
  };

  drop(event: CdkDragDrop<string[]>) {
    var previousID = Number(event.previousContainer.id);
    var newID = Number(event.container.id);
    var sailID = event.previousContainer.data[event.previousIndex]["PlayerID"];
    var newIndex = event.currentIndex;

    if (event.previousContainer === event.container) {
      if (13 <= newID && newID <= 24) {
        newIndex = event.container.data.length - 1 - event.currentIndex;
      }
      moveItemInArray(event.container.data, event.previousIndex, newIndex);

      this.update([event.container.data], [event.container.id]);
    } else {
      if (
        (newID == 0 && this.originalBinMapping[sailID] > 0) ||
        newID > 0 ||
        (newID < 0 && this.originalBinMapping[sailID] < 0)
      ) {
        if (13 <= newID && newID <= 24) {
          newIndex = event.container.data.length - event.currentIndex;
        }
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
  editValue(event: any, pos: any, player: any) {
    this.editValueDisplay = true;
    this.editingPlayer = player;

    this.editingValue = String(this.calcValueToUseAndDisplay(player) / 1000000);
    setTimeout(() => {
      var box = <HTMLInputElement>document.getElementById("editValueBox");
      box.style.left =
        String(this.math.min(event.clientX, window.innerWidth - 262)) + "px";
      box.style.top = String(event.clientY - 36) + "px";
      document.getElementById("editValueInput").focus();
    }, 1);
  }
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
  overrideValue(newVal: any) {
    this.editingPlayer.CustomAmt = Number(newVal) * 1000000;
    this.performCalculations();
  }

  overrideCapInfo(newVal: any) {
    // this.editingCapInfo.CustomAmt = Number(newVal) * 1000000;
    this.calculationsValues[this.editingCap].Value = Number(newVal) * 1000000;
    this.performCalculations();
  }

  save() {
    var savingList = [];
    for (let bin of this.allBins) {
      for (let player in bin.players) {
        var returnPlayer = cloneDeep(bin.players[player]);
        savingList.push({
          BinID: returnPlayer.BinID,
          OrderID: returnPlayer.OrderID,
          PlayerID: returnPlayer.PlayerID,
          CustomAmt: returnPlayer.CustomAmt
        });
      }
    }

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

    // });
  }
  //SAVE FILTER / OPEN UP NAME POP UP MODAL
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
  //IMPORT A Scenario POP UP MODAL
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

  //Reset to original starting scenario
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

  //change player to stop using input value
  resetInputValueNull() {
    this.editingPlayer.CustomAmt = null;
    this.performCalculations();
  }
  resetInputCapInfoNull() {
    this.calculationsValues[this.editingCap].Value = this.capInfoOriginal[
      this.editingCap
    ];
    this.performCalculations();
  }

  //Return the value of the player
  calcValueToUseAndDisplay(player) {
    if (player.CustomAmt != null) {
      return player.CustomAmt;
    }
    if (player.Amt != null) {
      return player.Amt;
    }
    return 0;
  }
  createUFAHTML(player) {
    var inner;
  }
  UFAPlayerStyle(player: any) {
    return {
      backgroundColor: String(player.HexColor),
      color: String(player.TextColor)
    };
  }
  CUTPlayerStyle(player: any) {
    return {
      backgroundColor: "lightgrey",
      color: "black"
    };
  }
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
  depthBorderInsideBottom(player: any) {
    return {
      borderRight: "1px solid white"
    };
  }
  depthBorderOutside(player: any) {
    return {
      // borderLeft: "1px solid black",
      // borderTop: "1px solid black"
    };
  }
  depthBorderOutsideBottom(player: any) {
    return {
      // borderBottom: "1px solid black",
      // borderLeft: "1px solid black"
    };
  }
  depthBorderRightBlack(player: any) {
    return {
      borderRight: "1px solid black"
    };
  }
  depthBorderRightBlackBottomColor(player: any) {
    return {
      borderRight: "1px solid black",
      borderBottom: "1px solid white",
      overflowX: "hidden"
    };
  }
  DepthPlayerStyleTop(player: any) {
    if (this.originalBinMapping[player.PlayerID] >= 0) {
      // return { backgroundColor: "#868287" };
      return { backgroundColor: "white", color: "black" };
      // return { backgroundColor: "#EOEOEO", color: "black" };
    }
    return { backgroundColor: "#179c25" };
  }
  DepthPlayerStyleBottom(player: any) {
    if (this.originalBinMapping[player.PlayerID] >= 0) {
      // return { backgroundColor: "#5E5B5E" };
      return { backgroundColor: "#EAEAEA", color: "black" };
      // return { backgroundColor: "#9C9C9C" };
    }
    return { backgroundColor: "#6CDE77", color: "black" };
  }
  depthOrientationStyle(bin) {
    // return {
    //   position: "fixed",
    //   top: String(this.locationDepth[binID].Top + 103) + "px",
    //   left:
    //     "calc((" +
    //     String(this.locationDepth[binID].Left / 1104) +
    //     " * .64 * (100vw - 200px)) + 200px)"
    // };
    if (13 <= bin.id && bin.id <= 24) {
      return {
        flexDirection: "column-reverse",
        position: "absolute",
        bottom: "0",
        width: "100%"
      };
    }
    return {
      flexDirection: "column"
      // borderBottom: "1px solid black"
    };
  }
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
  colorTextRedIfNegative(val: Number) {
    if (val < 0) {
      return { color: "Red" };
    }
  }
}
