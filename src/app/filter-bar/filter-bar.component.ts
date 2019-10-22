import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FilterspopComponent } from "../filterspop/filterspop.component";
import { FiltersService } from "../filters.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";
import { NameenterpopComponent } from "../nameenterpop/nameenterpop.component";
import { PullDataService } from "../pull-data.service";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-filter-bar",
  templateUrl: "./filter-bar.component.html",
  styleUrls: ["./filter-bar.component.css"]
})
export class FilterBarComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public filterService: FiltersService,
    public pullData: PullDataService
  ) {}

  //VARIABLES
  location = "Folder";
  playCount = "0";
  noFolderAlert = false;
  folderSelected = false;
  filterOpen = false;

  ngOnInit() {}

  //OPENS ENTIRE FILTER PAGE CLEAN
  openFilterPage(selected: string) {
    console.log("TRING TO OPEN FILTERS", selected, this.filterOpen);
    if (!this.filterOpen) {
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
      });
    }
  }

  //THIS OPENS A SINGLE QUERY IN THE FILTER PAGE
  //INPUTS-
  //  FID- the FID number as a string
  //  QUERY- the dictionary of Atributes to selected values (all strings)
  singleOpen(fid: string, query: any) {
    //SET WORKING DICTIONARY, WORKINGBIN, AND WORKINGFID
    var bin = cloneDeep(this.filterService.newFIDBID[fid]);
    this.filterService.level1Selected = bin;
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
      var old = document.getElementById(
        "tier1Tab" + this.filterService.level1Selected
      );
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
      this.filterService.level1Selected = bin;
      var newTab = document.getElementById("tier1Tab" + bin);
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid var(--lighter-blue)";
    }
    this.openFilterPage(bin);
    //this.filterService.changelevel2(bin);
    this.filterService.show = "";
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
    var BID = this.filterService.newFIDBID[fid];
    var dispName = "";
    var tempFilter = { ...value };

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
    if (dispName.charAt(0) == ",") {
      dispName = dispName.substr(2);
    }
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
}
