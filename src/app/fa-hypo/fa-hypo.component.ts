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

@Component({
  selector: "app-fa-hypo",
  templateUrl: "./fa-hypo.component.html",
  styleUrls: ["./fa-hypo.component.css"]
})
export class FaHypoComponent implements OnInit {
  groups = {
    EDGE: ["EDGE"],
    WR: ["OWR", "SWR", "WR"],
    CB: ["CB", "LCB", "RCB", "OCB", "NCB", "ICB"],
    RB: ["RB", "HB", "FB"],
    QB: ["QB"],
    OL: ["OL", "T", "C", "G", "OG", "OT", "LT", "RT", "LG", "RG"],
    ST: ["LS", "ST", "P", "K"],
    TE: ["TE"],
    DL: ["DT", "NT"],
    DB: ["FS", "SS", "DB"],
    LB: ["MLB", "OLB", "WLB"]
  };
  ufaGroups = {};
  positionGroups = [];
  ufaPositionGroups = [];

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
  connectedPositionLists = [];
  math;
  allBins = [];

  ufaViewing = -1;
  cashSums = {};
  emptySums = {};
  cap = 0;
  logOfMoves = {};

  constructor(
    public filterService: FiltersService,
    private sanitizer: DomSanitizer
  ) {
    this.math = Math;
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
      // for (let player of this.filterService.faHypo) {
      //   this.calcTest += player["SailID"];
      // }

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
  // initUFABoard() {
  //   if (this.filterService.ufaBorad) {
  //     this.ufaGroups = {};
  //     this.ufaPositionGroups = [];
  //     for (let player of this.filterService.ufaBorad) {
  //       if (-1 == ["P", "K", "LS", "FB"].indexOf(player["PosBucket"])) {
  //         if (!("UFA" + player["PosBucket"] in this.ufaGroups)) {
  //           this.ufaGroups[player["PosBucket"]] = [String(player["PosBucket"])];
  //         }
  //       }
  //     }
  //     for (let group in this.ufaGroups) {
  //       if (-1 == ["P", "K", "LS", "FB"].indexOf(group)) {
  //         this.ufaPositionGroups.push({
  //           id: "UFA" + group,
  //           players: this.filterPlayers(
  //             this.filterService.ufaBorad,
  //             this.ufaGroups[group],
  //             "PosBucket"
  //           )
  //         });
  //         this.connectedPositionLists.push("UFA" + group);
  //       }
  //     }
  //   } else {
  //     setTimeout(() => {
  //       this.initUFABoard();
  //     }, 100);
  //   }
  // }

  update(lists: any[], ids: any[]) {
    for (let index = 0; index < lists.length; index++) {
      var pos = lists[index];
      for (let i = 0; i < pos.length; i++) {
        pos[i]["OrderID"] = i + 1;
        pos[i]["BinID"] = ids[index];
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
    console.log("event", event);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.update([event.container.data], [event.container.id]);
    } else {
      console.log("event", event);
      var previousID = event.previousContainer.id;
      var newID = event.container.id;
      var dataItem = event.previousContainer.data[event.previousIndex];
      console.log(previousID, newID, dataItem);
      var lenMoves = Object.keys(this.logOfMoves).length;
      if (Number(previousID) < 0 && Number(newID) > 0) {
        if (
          this.logOfMoves[dataItem["SailID"]] &&
          this.logOfMoves[dataItem["SailID"]].type == 0
        ) {
          delete this.logOfMoves[dataItem["SailID"]];
        } else {
          this.logOfMoves[dataItem["SailID"]] = {
            item: dataItem,
            type: 1,
            OrderID: lenMoves + 1
          };
        }
      }
      if (Number(previousID) > 0 && Number(newID) == 0) {
        if (
          this.logOfMoves[dataItem["SailID"]] &&
          this.logOfMoves[dataItem["SailID"]].type == 1
        ) {
          delete this.logOfMoves[dataItem["SailID"]];
        } else {
          this.logOfMoves[dataItem["SailID"]] = {
            item: dataItem,
            type: 0,
            OrderID: lenMoves + 1
          };
        }
      }
      if (Number(previousID) == 0 && Number(newID) > 0) {
        if (this.logOfMoves[dataItem["SailID"]]) {
          delete this.logOfMoves[dataItem["SailID"]];
        }
      }

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
