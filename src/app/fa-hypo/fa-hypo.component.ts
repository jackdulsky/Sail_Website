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
  connectedPositionLists = [];
  ufaViewing = "UFAQB";
  calcTest = 0;
  calcTestDifference;
  logOfMoves = {};

  constructor(
    public filterService: FiltersService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.filterService.timeLastUFAPull.subscribe(data => {
      console.log("CHANGE", data);
      this.initUFABoard();
    });
    this.initArraysRaiders();
  }

  initArraysRaiders() {
    if (this.filterService.faHypo) {
      for (let player of this.filterService.faHypo) {
        this.calcTest += player["SailID"];
      }
      for (let group in this.groups) {
        this.positionGroups.push({
          id: "Depth" + group,
          players: this.filterPlayers(
            this.filterService.faHypo,
            this.groups[group],
            "Pos"
          )
        });

        this.connectedPositionLists.push("Depth" + group);
      }
    } else {
      setTimeout(() => {
        this.initArraysRaiders();
      }, 100);
    }
  }
  initUFABoard() {
    if (this.filterService.ufaBorad) {
      this.ufaGroups = {};
      this.ufaPositionGroups = [];
      for (let player of this.filterService.ufaBorad) {
        if (-1 == ["P", "K", "LS", "FB"].indexOf(player["PosBucket"])) {
          if (!("UFA" + player["PosBucket"] in this.ufaGroups)) {
            this.ufaGroups[player["PosBucket"]] = [String(player["PosBucket"])];
          }
        }
      }
      for (let group in this.ufaGroups) {
        if (-1 == ["P", "K", "LS", "FB"].indexOf(group)) {
          this.ufaPositionGroups.push({
            id: "UFA" + group,
            players: this.filterPlayers(
              this.filterService.ufaBorad,
              this.ufaGroups[group],
              "PosBucket"
            )
          });
          this.connectedPositionLists.push("UFA" + group);
        }
      }
    } else {
      setTimeout(() => {
        this.initUFABoard();
      }, 100);
    }
  }

  updateOrders(lists: any[]) {
    for (let pos of lists) {
      for (let i = 0; i < pos.length; i++) {
        pos[i]["OrderID"] = i;
      }
    }
  }

  filterPlayers(data: any, position: string[], id: string) {
    try {
      var returnPlayer = [];
      if (position.length < 1) {
        return returnPlayer;
      }
      for (let player of data) {
        if (-1 != position.indexOf(player[id])) {
          returnPlayer.push(player);
        }
      }
      return returnPlayer;
    } catch (e) {}
  }

  changeView(newPos: string) {
    this.ufaViewing = "UFA" + newPos;
  }

  highlightOrNot(name: string) {
    if ("UFA" + name == this.ufaViewing) {
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

      this.updateOrders([event.container.data]);
    } else {
      console.log("event", event);
      var previousID = event.previousContainer.id;
      var newID = event.container.id;
      var dataItem = event.previousContainer.data[event.previousIndex];
      console.log(dataItem);
      if (previousID[0] == "U" && newID[0] == "D") {
        this.calcTest += dataItem["SailID"];
        this.calcTestDifference = "(+" + String(dataItem["SailID"]) + ")";
        if (
          this.logOfMoves[dataItem["SailID"]] &&
          this.logOfMoves[dataItem["SailID"]].type == 0
        ) {
          delete this.logOfMoves[dataItem["SailID"]];
        } else {
          this.logOfMoves[dataItem["SailID"]] = { item: dataItem, type: 1 };
        }
      }
      if (previousID[0] == "D" && newID[0] == "U") {
        this.calcTest -= dataItem["SailID"];
        this.calcTestDifference = "(-" + String(dataItem["SailID"]) + ")";
        if (
          this.logOfMoves[dataItem["SailID"]] &&
          this.logOfMoves[dataItem["SailID"]].type == 1
        ) {
          delete this.logOfMoves[dataItem["SailID"]];
        } else {
          this.logOfMoves[dataItem["SailID"]] = { item: dataItem, type: 0 };
        }
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updateOrders([event.previousContainer.data, event.container.data]);
    }
  }
}
