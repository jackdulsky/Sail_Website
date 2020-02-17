import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import * as cloneDeep from "lodash/cloneDeep";
import { PullDataService } from "../pull-data.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { SavingFAHYPOComponent } from "../saving-fahypo/saving-fahypo.component";

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
import { catchError } from "rxjs/operators";
import { type } from "os";
import { getRtlScrollAxisType } from "@angular/cdk/platform";
import { ConstantPool } from "@angular/compiler";

@Component({
  selector: "app-fa-hypo",
  templateUrl: "./fa-hypo.component.html",
  styleUrls: ["./fa-hypo.component.css"]
})
export class FaHypoComponent implements OnInit {
  locationDepth = {
    1: { BinLabel: "QB", Top: 625, Left: 475 },
    2: { BinLabel: "LT", Top: 400, Left: 165 },
    3: { BinLabel: "LG", Top: 400, Left: 320 },
    4: { BinLabel: "C", Top: 400, Left: 475 },
    5: { BinLabel: "RG", Top: 400, Left: 630 },
    6: { BinLabel: "RT", Top: 400, Left: 785 },
    7: { BinLabel: "TE", Top: 400, Left: 940 },
    8: { BinLabel: "FB", Top: 585, Left: 630 },
    9: { BinLabel: "RB", Top: 625, Left: 320 },
    10: { BinLabel: "SWR", Top: 585, Left: 164 },
    11: { BinLabel: "XWR", Top: 400, Left: 10 },
    12: { BinLabel: "ZWR", Top: 585, Left: 940 },
    13: { BinLabel: "NT", Top: 10, Left: 554.5 },
    14: { BinLabel: "3T", Top: 10, Left: 393.5 },
    15: { BinLabel: "LDE", Top: 10, Left: 232.5 },
    16: { BinLabel: "RDE", Top: 10, Left: 715.5 },
    17: { BinLabel: "MLB", Top: 195, Left: 456 },
    18: { BinLabel: "WLB", Top: 195, Left: 617 },
    19: { BinLabel: "SLB", Top: 195, Left: 134 },
    20: { BinLabel: "SS", Top: 235, Left: 295 },
    21: { BinLabel: "FS", Top: 235, Left: 778 },
    22: { BinLabel: "NCB", Top: 195, Left: 940 },
    23: { BinLabel: "RCB", Top: 10, Left: 940 },
    24: { BinLabel: "LCB", Top: 10, Left: 10 },
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
    // CCCR: {
    //   Label: "Current Count 51 Cap Room",
    //   Value: 37827146,
    //   calc: 0,
    //   display: 0
    // },
    CTSC: {
      Label: "Cash Target (Salary Cap)",
      Value: 198500000,
      calc: 0,
      display: 1
    },
    CTZ: {
      Label: "Contracts and Tenders (ERFA, RFA)",
      Value: 0,
      calc: 1,
      display: 1
    },
    IRRIM: {
      Label: "IR Replacements, Incentives, Misc",
      Value: 12500000,
      calc: 0,
      display: 0
    },
    PTCS: {
      Label: "Pre Training Camp Signing",
      Value: 10000000,
      calc: 0,
      display: 1
    },
    PSOM: {
      Label: "Practice Squad Over Minimum",
      Value: 500000,
      calc: 0,
      display: 1
    },
    DS: {
      Label: "2020 Draft Selections",
      Value: 27030000,
      calc: 1,
      display: 1
    },
    RC: {
      Label: "Roster to 53 Credit",
      Value: 0,
      calc: 1,
      display: 1
    },
    PA: {
      Label: "Potential Adjustments (Cuts)",
      Value: 0,
      calc: 1,
      display: 1
    },
    SAWOA: {
      Label: "Spending Available",
      Value: 0,
      calc: 1,
      display: 1
    }
  };

  constructor(
    public filterService: FiltersService,
    private sanitizer: DomSanitizer,
    public pullData: PullDataService,
    public dialog: MatDialog
  ) {
    document.addEventListener("keypress", e => this.onKeyPress(e));
    document.addEventListener("click", e => this.onClick(e));
    this.number = Number;
    this.math = Math;
  }
  onClick(event) {
    if (this.editValueDisplay && event.target.id == "") {
      this.editValueDisplay = false;
      this.editingPlayer = null;
      this.editingValue = "0.0";
    }
  }
  onKeyPress(event) {
    if (event.key == "Enter" && this.editValueDisplay) {
      this.editValueDisplay = false;
      this.editingPlayer = null;
      this.editingValue = "0.0";
    }
  }

  ngOnInit() {
    // this.filterService.timeLastUFAPull.subscribe(data => {
    //   console.log("CHANGE", data);
    //   this.initUFABoard();
    // });

    // this.sumDraft();
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
    for (let bin of this.allBins) {
      var binAdd = 0;

      for (let player of bin["players"]) {
        binAdd += this.calcValueToUseAndDisplay(player);
        if (bin.id > 0) {
          sumAdd += this.calcValueToUseAndDisplay(player);
          this.playerCount += 1;
        }
        if (bin.id == 0) {
          binAdd -= player.DeadMoney;
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
    this.calculationsValues.PA.Value = this.cashSums[0].total;
    this.calculationsValues["CTZ"].Value = sumAdd;
    this.calculationsValues.SAWOA.Value =
      this.calculationsValues.CTSC.Value -
      this.calculationsValues.CTZ.Value -
      this.calculationsValues.IRRIM.Value -
      this.calculationsValues.PTCS.Value -
      this.calculationsValues.PSOM.Value -
      this.calculationsValues.DS.Value -
      this.calculationsValues.RC.Value;
  }
  sumDraft() {
    for (let pick in this.draftPicks) {
      this.draftp5 += this.draftPicks[pick].p5;
      this.draftsb += this.draftPicks[pick].signing;
    }
    console.log(this.draftp5, this.draftsb);
  }

  update(lists: any[], ids: any[]) {
    for (let index = 0; index < lists.length; index++) {
      var pos = lists[index];
      for (let i = 0; i < pos.length; i++) {
        var lenMoves = Object.keys(this.logOfMoves).length;
        pos[i]["OrderID"] = i + 1;
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
        " * .64 * (100vw - 200px)) + 200px)"
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
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.update([event.container.data], [event.container.id]);
    } else {
      if (
        (newID == 0 && this.originalBinMapping[sailID] > 0) ||
        newID > 0 ||
        (newID < 0 && this.originalBinMapping[sailID] < 0)
      ) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
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
  overrideValue(newVal: any) {
    this.editingPlayer.CustomAmt = Number(newVal) * 1000000;
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
          data: savingList
        })
      )
      .subscribe(data => {
        try {
          this.scenarioID = data[0][""];
        } catch (e) {}
      });

    setTimeout(() => {
      this.filterService.pullHypoScenario;
    }, 150);
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
  //IMPORT A FILTER POP UP MODAL
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
      this.initArraysRaiders();
    });
  }

  //change player to stop using input value
  resetInputValueNull() {
    this.editingPlayer.CustomAmt = null;
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
  depthBorderInsideTop(player: any) {
    return {
      borderBottom: "1px solid white", // + String(player.TextColor),
      borderRight: "1px solid white" // + String(player.TextColor)
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
      borderBottom: "1px solid white"
    };
  }
  DepthPlayerStyleTop(player: any) {
    if (this.originalBinMapping[player.PlayerID] >= 0) {
      return { backgroundColor: "#868287" };
      // return { backgroundColor: "#EOEOEO", color: "black" };
    }
    return { backgroundColor: "#179c25" };
  }
  DepthPlayerStyleBottom(player: any) {
    if (this.originalBinMapping[player.PlayerID] >= 0) {
      return { backgroundColor: "#5E5B5E" };
      // return { backgroundColor: "#9C9C9C" };
    }
    return { backgroundColor: "#116D1A" };
  }
}
