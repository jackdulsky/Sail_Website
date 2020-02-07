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
        if (-1 == ["ST", "P", "K", "LS", "FB"].indexOf(player["PosBucket"])) {
          if (!("UFA" + player["PosBucket"] in this.ufaGroups)) {
            this.ufaGroups[player["PosBucket"]] = [String(player["PosBucket"])];
          }
        }
      }
      for (let group in this.ufaGroups) {
        if (-1 == ["ST", "P", "K", "LS", "FB"].indexOf(group)) {
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
  reducedUFAPosition(groups: any) {
    var toDisplay = [];
    for (let group of groups) {
      if (group.id == this.ufaViewing) {
        toDisplay.push(group);
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
      return { backgroundColor: "cornflowerblue" };
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

  updateOrders(lists: any[]) {
    for (let pos of lists) {
      for (let i = 0; i < pos.length; i++) {
        pos[i]["OrderID"] = i;
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.updateOrders([event.container.data]);
    } else {
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
