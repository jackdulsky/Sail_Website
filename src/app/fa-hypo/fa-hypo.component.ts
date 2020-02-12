import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import * as cloneDeep from "lodash/cloneDeep";
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
    10: { BinLabel: "SWR", Top: 585, Left: 87.5 },
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
    25: { BinLabel: "ST", Top: 750, Left: 10 }
  };

  connectedPositionLists = [];
  math;
  allBins = [];

  ufaViewing = -1;
  cashSums = {};
  emptySums = {};
  cap = 0;
  logOfMoves = {};
  connectedBinMapping = {};
  originalBinMapping = {};
  originalOrderMapping = {};
  editValueDisplay = false;
  editingValue = "0.0";
  editingPlayer;

  constructor(
    public filterService: FiltersService,
    private sanitizer: DomSanitizer
  ) {
    document.addEventListener("keypress", e => this.onKeyPress(e));
    // document.addEventListener("click", e => this.onClick(e));

    this.math = Math;
  }
  onClick(event) {
    console.log(event);
    if (
      this.editValueDisplay &&
      event.target.id != "editValueBox" &&
      event.target.id != "editValueInput"
    ) {
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
    this.initArraysRaiders();
  }

  initArraysRaiders() {
    if (this.filterService.faHypo && this.filterService.faHypoBins) {
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
    } else {
      setTimeout(() => {
        this.initArraysRaiders();
      }, 100);
    }
  }
  createBinMappings() {
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
      this.originalBinMapping[player["SailID"]] = cloneDeep(player["BinID"]);
      this.originalOrderMapping[player["SailID"]] = cloneDeep(
        player["OrderID"]
      );
    }
    console.log(
      "HERE ",
      this.originalBinMapping[1007137],
      this.originalOrderMapping[1007137]
    );
  }
  performCalculations() {
    this.cashSums = cloneDeep(this.emptySums);
    this.cap = 0;
    var sumAdd = 0;
    for (let bin of this.allBins) {
      var binAdd = 0;
      if (bin.id > 0) {
        for (let player of bin["players"]) {
          if (player["CashValue"] == null) {
            binAdd += player["SailID"];
            sumAdd += player["SailID"];
          } else {
            binAdd += player["CashValue"];
            sumAdd += player["CashValue"];
          }
        }
      } else {
        for (let player of bin["players"]) {
          if (player["CashValue"] == null) {
            binAdd += player["SailID"];
          } else {
            binAdd += player["CashValue"];
          }
        }
      }
      if (bin.id >= 0) {
        this.cashSums[bin.id]["total"] += binAdd;
      }
    }
    this.cap += sumAdd;
  }

  update(lists: any[], ids: any[]) {
    for (let index = 0; index < lists.length; index++) {
      var pos = lists[index];
      for (let i = 0; i < pos.length; i++) {
        pos[i]["OrderID"] = i + 1;
        pos[i]["BinID"] = Number(ids[index]);
      }
    }
    this.performCalculations();
  }

  filterPlayers(data: any, position: number) {
    // if (position == 0) {
    //   return [cloneDeep(data[0])];
    // }
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
        //backgroundColor: "cornflowerblue" ,
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
    var lenMoves = Object.keys(this.logOfMoves).length;
    var sailID = event.previousContainer.data[event.previousIndex]["SailID"];

    console.log("event", previousID, newID, sailID);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.update([event.container.data], [event.container.id]);
      var dataItem = cloneDeep(event.container.data[event.currentIndex]);

      if (this.logOfMoves[dataItem["SailID"]]) {
        var old = this.logOfMoves[dataItem["SailID"]];

        if (
          old["originalBin"] == newID &&
          old["originalOrder"] == Number(event.currentIndex) + 1
        ) {
          delete this.logOfMoves[dataItem["SailID"]];
        } else {
          old["item"] = dataItem;
          this.logOfMoves[dataItem["SailID"]] = old;
        }
      } else {
        if (dataItem.BinID > 0) {
          this.logOfMoves[dataItem["SailID"]] = {
            item: dataItem,
            newBin: newID,
            originalBin: this.originalBinMapping[dataItem["SailID"]],
            originalOrder: this.originalOrderMapping[dataItem["SailID"]],
            type: this.getType(
              this.originalBinMapping[dataItem["SailID"]],
              Number(newID)
            ),
            OrderID: lenMoves + 1
          };
        }
      }
      console.log("MOVES", cloneDeep(this.logOfMoves));
    } else {
      if (
        (newID == 0 && this.originalBinMapping[sailID] > 0) ||
        newID > 0 ||
        (newID < 0 && this.originalBinMapping[sailID] < 0)
      ) {
        console.log("event", event);

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
        var dataItem = cloneDeep(event.container.data[event.currentIndex]);
        console.log(previousID, newID, dataItem);

        // log of moves = {Item, original bin, new bin, type, orderdisplayed}
        if (this.logOfMoves[dataItem["SailID"]]) {
          var old = this.logOfMoves[dataItem["SailID"]];
          console.log("HERE");
          console.log(cloneDeep(old["originalBin"]));
          console.log(cloneDeep(newID));
          console.log(cloneDeep(old["originalOrder"]));
          console.log(cloneDeep(dataItem["OrderID"]));
          if (newID < 0) {
            delete this.logOfMoves[dataItem["SailID"]];
          } else {
            if (old["originalBin"] == newID) {
              if (
                old["originalBin"] < 0 ||
                old["originalOrder"] == dataItem["OrderID"]
              ) {
                delete this.logOfMoves[dataItem["SailID"]];
              } else {
                old["item"] = dataItem;
                old["newBin"] = Number(newID);
                old["type"] = this.getType(old["originalBin"], Number(newID));
                this.logOfMoves[dataItem["SailID"]] = old;
              }
            } else {
              old["item"] = dataItem;
              old["newBin"] = Number(newID);
              old["type"] = this.getType(old["originalBin"], Number(newID));
              this.logOfMoves[dataItem["SailID"]] = old;
            }
          }
        } else {
          this.logOfMoves[dataItem["SailID"]] = {
            item: dataItem,
            newBin: Number(newID),
            originalBin: this.originalBinMapping[dataItem["SailID"]],
            originalOrder: this.originalOrderMapping[dataItem["SailID"]],
            type: this.getType(
              this.originalBinMapping[dataItem["SailID"]],
              Number(newID)
            ),
            OrderID: lenMoves + 1
          };
        }

        console.log("MOVES", this.logOfMoves);
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
    console.log("CLICK", pos, player);
    console.log("Value", player["CashValue"]);
    console.log("event", event);
    this.editingPlayer = player;
    this.editingValue = player["CashValue"];
    setTimeout(() => {
      var box = <HTMLInputElement>document.getElementById("editValueBox");
      box.style.left = String(event.clientX) + "px";
      box.style.top = String(event.clientY - 42) + "px";
    }, 1);
  }
  overrideValue(newVal: any) {
    console.log("newValue", newVal);
    this.editingPlayer.CashValue = Number(newVal);
  }
}
