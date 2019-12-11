import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FilterspopComponent } from "../filterspop/filterspop.component";
import { FiltersService } from "../filters.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";
import { NameenterpopComponent } from "../nameenterpop/nameenterpop.component";
import { PullDataService } from "../pull-data.service";
import * as cloneDeep from "lodash/cloneDeep";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { KeyValue } from "@angular/common";

@Component({
  selector: "app-filter-bar",
  templateUrl: "./filter-bar.component.html",
  styleUrls: ["./filter-bar.component.css"]
})
export class FilterBarComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public filterService: FiltersService,
    public pullData: PullDataService,
    public cdref: ChangeDetectorRef,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  //VARIABLES
  location = "Folder";
  playCount = "0";
  noFolderAlert = false;
  folderSelected = false;
  filterOpen = false;

  ngOnInit() {}
  ngAfterInit() {
    // this.cdref.detectChanges;
  }
  //OPENS ENTIRE FILTER PAGE CLEAN
  openFilterPage(selected: string) {
    if (!this.filterOpen) {
      this.filterService.setPlayers();
      //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "100vw";
      dialogConfig.maxWidth = "100vw";
      dialogConfig.autoFocus = true;
      dialogConfig.position = { top: "102px", left: "200px" };
      dialogConfig.id = "FilterPopUp";
      dialogConfig.data = {
        title: "Filters:",
        category: "",
        filterItem: "",
        selected: selected
      };

      //SET BOOL FOR OPEN FILTER TO  TRUE
      this.filterOpen = true;

      //OPEN THE DIALOG AND UPON CLOSE RESET BOOL
      const dialogRef = this.dialog.open(FilterspopComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        this.filterOpen = false;
        if (
          this.router.url.includes("club") ||
          this.router.url.includes("player") ||
          this.router.url.includes("cash")
        ) {
          this.filterService.pushQueryToActiveFilter("0");
        } else {
          this.filterService.pushQueryToActiveFilter("0", false);
        }
      });
    } else {
      this.filterService.changelevel2(selected);
      // this.filterService.attributeSelected(String(Number(selected) * -100));
      // this.filterService.level1Selected = selected;
    }
  }

  //check if one fid in a bin
  checkKeys(key: any) {
    return Object.keys(key.value).length == 1;
  }

  getNavElLabel(element: any) {
    return this.filterService.pullNavigationElement[element]["Label"];
  }

  //Check if the explicits are empty

  //THIS OPENS A SINGLE QUERY IN THE FILTER PAGE
  //INPUTS-
  //  FID- the FID number as a string
  //  QUERY- the dictionary of Atributes to selected values (all strings)
  singleOpen(fid: string, query: any) {
    //SET WORKING DICTIONARY, WORKINGBIN, AND WORKINGFID
    var bin = cloneDeep(this.filterService.newFIDBID[fid]);
    var old = document.getElementById(
      "tier1Tab" + cloneDeep(this.filterService.level1Selected)
    );
    this.filterService.level1Selected = bin;
    for (let id in this.filterService.newWorkingQuery[bin]) {
      this.filterService.form.controls[id].setValue(null);
    }
    this.filterService.newWorkingQuery[bin] = cloneDeep(query);
    this.filterService.workingBin = cloneDeep(bin);
    this.filterService.newWorkingFID[bin] = cloneDeep(fid);

    //SET THE FORM CONTROL
    for (let id in this.filterService.newWorkingQuery[bin]) {
      this.filterService.form.controls[id].setValue(
        this.filterService.newWorkingQuery[bin][id]
      );
    }

    //IF FILTER PAGE IS OPEN ALREADY SWITCH THE DISPLAY
    if (this.filterOpen) {
      old.setAttribute(
        "style",
        "background-color: white;border-bottom: 4px solid white"
      );

      this.filterService.level1Selected = bin;
      var newTab = document.getElementById("tier1Tab" + bin);

      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    }
    this.openFilterPage(bin);
    this.filterService.show = "";
  }

  singleOpenExp(fid: any, query: any, bin: any) {
    if (this.filterOpen) {
      this.filterService.changelevel2(String(bin));
      for (let id in this.filterService.newWorkingQuery[bin]) {
        this.filterService.form.controls[id].setValue(null);
      }
      this.filterService.newWorkingQuery[bin] = cloneDeep(query);
      this.filterService.workingBin = cloneDeep(bin);
      this.filterService.newWorkingFID[bin] = cloneDeep(fid);

      //SET THE FORM CONTROL
      for (let id in this.filterService.newWorkingQuery[bin]) {
        this.filterService.form.controls[id].setValue(
          this.filterService.newWorkingQuery[bin][id]
        );
      }
    } else {
      this.singleOpen(fid, query);
    }
  }
  //OPEN SINGLE PANEL
  singleOpenAtt(fid: any, query: any, att: any, bin: any) {
    if (this.filterOpen) {
      for (let id in this.filterService.newWorkingQuery[bin]) {
        this.filterService.form.controls[id].setValue(null);
      }
      this.filterService.newWorkingQuery[bin] = cloneDeep(query);
      this.filterService.workingBin = cloneDeep(bin);
      this.filterService.newWorkingFID[bin] = cloneDeep(fid);

      //SET THE FORM CONTROL
      for (let id in this.filterService.newWorkingQuery[bin]) {
        this.filterService.form.controls[id].setValue(
          this.filterService.newWorkingQuery[bin][id]
        );
      }
    } else {
      this.singleOpen(fid, query);
    }
    this.filterService.navigateToAttribute(bin, String(att));
  }

  //OPEN DIALOG FOR SELECTING THE FOLDER TO SAVE AN XOS EDIT
  selectFolderXos() {
    //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(60%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "100px" };
    dialogConfig.data = {};
    //OPEN DIALOG FOR SELECTING
    //AFTER CLOSING SET THE FOLDER SELECTED TO DISPLAY
    const dialogRef = this.dialog.open(FolderselectpopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
        this.location = data.folderID;
        this.folderSelected = true;

        document.getElementById("xosIco").className = "fa fa-close space";
      }
    });
  }

  //IMPORT A FILTER POP UP MODAL
  selectSavedFilter() {
    //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(80%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "150px" };
    dialogConfig.data = {};

    //OPEN WINDOW
    const dialogRef = this.dialog.open(SavedfilterspopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
        // this.location = data.folderID;
        // this.folderSelected = true;
        // document.getElementById("xosIco").className = "fa fa-close space";
      }
    });
  }

  //SEND THE FOLDER ID TO EXPORT
  //IF NO FOLDER SELECTED SHOW THE ERROR MESSAGE (RELATIVE POSITION)
  XOSExport() {
    if (!this.folderSelected) {
      this.noFolderAlert = true;
      setTimeout(() => {
        this.noFolderAlert = false;
      }, 2000);
    } else {
      this.filterService.XOSExport(this.location);
    }
  }

  //CLEAR ALL QUERIES
  clearAll() {
    this.filterService.clearAll();
  }

  //SAVE FILTER / OPEN UP NAME POP UP MODAL
  saveFilter() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "auto";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "175px" };
    dialogConfig.data = { previousName: this.filterService.getName() };

    const dialogRef = this.dialog.open(NameenterpopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      // if (data != undefined) {
      //   this.filterService.saveFilter(data.name);
      //   this.filterService.setName(data.name);
      // }
    });
  }

  //THIS CREATES THE DISPLAY STRING
  //RESTRICTS MAX LENGTH TO 100 CHARS
  //WIDTH OF THE ITEM SET BY THE CSS OF THE ELEMENT
  //MAY HAVE TO TAILER THIS FOR EACH PKID
  //RIGHT NOW IT SHOWS PKID's AND ATTRIBUTES OF NON PKID's
  createFilterDisplayString(fid: string, value: any) {
    if (!this.filterService.newFIDBID[fid]) {
      setTimeout(() => {
        this.createFilterDisplayString(fid, value);
      }, 100);
    } else {
      var BID = this.filterService.newFIDBID[fid];
      var dispName = "";
      var tempFilter = { ...value };
      try {
        if (value[String(Number(BID) * -1)]) {
          for (let val in value[String(Number(BID) * -1)]) {
            dispName +=
              ", " +
              this.returnlabel(
                this.filterService.pullValueMap[String(Number(BID) * -1)][
                  value[String(Number(BID) * -1)][val]
                ]
              );
            if (dispName.length > 100) {
              break;
            }
          }
        }
        if (dispName.charAt(0) == ",") {
          dispName = dispName.substr(1);
        }
        delete tempFilter[String(Number(BID) * -1)];

        for (let att in tempFilter) {
          dispName +=
            ", " + this.returnlabel(this.filterService.pullAttribute[att]);
          if (dispName.length > 100) {
            break;
          }
        }
        while (dispName.charAt(0) == ",") {
          dispName = dispName.substr(2);
        }
      } catch (e) {
        null;
      }
      return dispName;
    }
  }

  createFilterTopDisplayString(fid: string, value: any) {
    //MULTIPLE CASE
    var BID = this.filterService.newFIDBID[fid];
    return (
      String(this.filterService.pullNavigationElement[BID]["Label"]) +
      " : " +
      String(fid)
    );
  }

  //Return the panel to att mapping for a single query in a bin
  createSingleQueryPanelAttributeMap(attsMap: any) {
    var panelMap = {};
    try {
      for (let att in attsMap) {
        var panel = this.filterService.pullNavigation[att]["ParentItemID"];
        if (panelMap[panel]) {
          panelMap[panel] = panelMap[panel].concat([att]);
        } else {
          panelMap[panel] = [att];
        }
      }
    } catch (e) {}
    return panelMap;
  }

  //GET EXPLICIT VALUES String Labels
  getExplicitValues(values: any, bin: any) {
    var dispName = "";
    try {
      var att = String(Number(bin) * -1);
      for (let val in values) {
        dispName +=
          ", " + this.filterService.pullValueMap[att][values[val]]["Label"];
        if (dispName.length > 100) {
          break;
        }
      }
      while (dispName.charAt(0) == ",") {
        dispName = dispName.substr(2);
      }
    } catch (e) {}
    return dispName;
  }

  //GET NON EXPLICIT VALUES String Labels, panels or Atts
  getAttOrPanelStringsValues(values: any) {
    var dispName = "";
    try {
      for (let val in values) {
        dispName +=
          ", " + this.filterService.pullNavigationElement[values[val]]["Label"];
        if (dispName.length > 100) {
          break;
        }
      }
      while (dispName.charAt(0) == ",") {
        dispName = dispName.substr(2);
      }
    } catch (e) {}
    return dispName;
  }

  getMultipleQueryBottomString(fid: any, contents: any) {
    var dispName = "";
    try {
      if (contents[0].length != 0) {
        dispName = this.getExplicitValues(
          contents[0],
          this.filterService.newFIDBID[fid]
        );
      }
      var potentialAdd = this.getAttOrPanelStringsValues(
        Object.keys(contents[1])
      );
      if (String(potentialAdd) != "") {
        dispName += ", " + potentialAdd;
      }
      while (dispName.charAt(0) == ",") {
        dispName = dispName.substr(2);
      }
    } catch (e) {}
    return dispName;
  }

  //RETURN THE STRING LABEL OF THE OBJECT PASSED IN
  //ONLY USED BECAUSE OF BINDING ACCESS OF STRING EVALUATION
  returnlabel(obj: any) {
    return obj["Label"];
  }
  //REMOVE A SINGLE QUERY BY HITTING X
  removeQuery(fid: string) {
    this.filterService.removeQuery(fid);
  }

  //ORDER SIDE BUTTONS ON THEIR ORDER ID
  valueOrderFIDs = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    var bin = this.filterService.newFIDBID[a.key];
    return this.filterService.newFIDOrder[bin].indexOf(a.key) <
      this.filterService.newFIDOrder[bin].indexOf(b.key)
      ? -1
      : this.filterService.newFIDOrder[bin].indexOf(b.key) <
        this.filterService.newFIDOrder[bin].indexOf(a.key)
      ? 1
      : 0;
  };
}
