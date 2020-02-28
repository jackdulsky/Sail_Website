import { Component, OnInit, Inject, ɵConsole, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup } from "@angular/forms";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import { DomSanitizer } from "@angular/platform-browser";
import { KeyValue } from "@angular/common";
import * as cloneDeep from "lodash/cloneDeep";
import { MatMenuTrigger } from "@angular/material";
import { ChangeDetectorRef } from "@angular/core";

import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";

@Component({
  selector: "app-filterspop",
  templateUrl: "./filterspop.component.html",
  styleUrls: ["./filterspop.component.css"]
})
export class FilterspopComponent implements OnInit {
  //VARIABLES
  public form: FormGroup;
  public formG: FormGroup;
  title: string;
  gamesLevel2From1: number[] = [100, 200, 300, 400, 500];
  years = ["2019", "2018", "2017", "2016", "2015"];
  weeks = {
    PRE: ["1", "2", "3", "4", "5"],
    REG: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17"
    ],
    POST: ["1", "2", "3", "4"]
  };
  positionLevel1 = { 101: "Offense", 102: "Defense", 103: "Specials" };
  public selected: any[] = [];
  yearsSelected: string[] = [];
  highlighting: boolean = false;
  showSuggestions: boolean = false;
  searchGlobalText: string = "";
  Label = "Label";
  selectedPath;
  show: string = "";
  panels: string[] = [];
  posHTML = "";

  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;
  constructor(
    public pullData: PullDataService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<FilterspopComponent>,
    public filterService: FiltersService,
    public dialog: MatDialog,
    public sanitizer: DomSanitizer,
    public cdref: ChangeDetectorRef,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.filterService.filterBinSelected = data.selected;
  }

  ngOnInit() {
    this.filterService.setPlayers(); // get the players to display
    //This function below will need to be run on a change to the position hierarchy
    // this.createPosMenus();
    this.cdref.detectChanges();
    this.filterService.conferenceSelections["2"] = "AFC"; //initial conference to show on the team select gui
    setTimeout(() => {
      //wait till the elements are rendered then navigate to the bin selected
      console.log("LOOP 24");
      this.changeLevel2(this.filterService.filterBinSelected);
    }, 1);

    //init panel
    this.filterService.panels = [
      cloneDeep(this.filterService.filterBinSelected)
    ];
    this.cdref.detectChanges();
  }

  /**
   * RETURN LABEL OF OBJECT
   * @param obj Object with "Label" as an attribute
   */
  returnlabel(obj: any) {
    return obj["Label"];
  }

  /**
   * SEND TYPE0CHANGE TO FILTER SERVICE WITH VALUES OF SET AND filterBinSelected
   * @param formKey attribute ID
   * @param bin bin ID
   */
  type0change(formKey, bin) {
    this.filterService.type0change(
      formKey,
      this.filterService.form.value[formKey],
      bin
    );
  }

  /**
   * CLEAR A SINGLE FILTER IN THE WORKING QUERY
   * @param id attribute ID
   * @param bin Bin ID
   */
  clearSingle(id: string, bin: string) {
    this.filterService.clearSingleIDWorking(id, bin);
  }

  /**
   * DELETE ENTIRE WORKING QUERY
   */
  clearWorkingQuery() {
    this.filterService.clearWorking();
  }

  /**
   * SEND THE WORKING QUERY TO THE FILTER TOP BAR
   */
  pushWorkingQuery() {
    this.filterService.pushQueryToActiveFilter(
      this.filterService.filterBinSelected
    );
  }

  //FUNCTION TO SORT THE TIER 1 BUTTONS BY THE ORDER SENT IN
  /**
   * Value order for tier 1 bins
   * This is needed instead of using filterservice.value order
   * since we do not have the entire objects in the filters structure
   * since its just ID's
   */
  valueOrderT1 = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    return this.filterService.pullBin[a.key]["OrderID"] <
      this.filterService.pullBin[b.key]["OrderID"]
      ? -1
      : this.filterService.pullBin[b.key]["OrderID"] <
        this.filterService.pullBin[a.key]["OrderID"]
      ? 1
      : 0;
  };

  /**
   * Order the panel side buttons by their order ID
   */
  valueOrderSideButtons = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    // //console.log("ORDER VALUE", a.key, b.key);
    return this.filterService.pullNavigation[a.key]["OrderID"] <
      this.filterService.pullNavigation[b.key]["OrderID"]
      ? -1
      : this.filterService.pullNavigation[b.key]["OrderID"] <
        this.filterService.pullNavigation[a.key]["OrderID"]
      ? 1
      : 0;
  };

  /**
   * Close the dialog pop up
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * TOGGLE THE SHOW SELECTIONS IF THE GLOBAL SEARCH BOX IS NOT NULL
   * Outcome is nothing from this since the variable is not attached to anything
   * and nothing is performed on the input
   * @param input string from search box
   */
  searching(input: string) {
    if (input.length > 0) {
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }

    this.searchGlobalText = input;
  }

  /**
   * TOGGLE ALL FILTER SELECTIONS THEN CALL TYPE0CHANGE ON THE FORM VALUES
   * @param id Attribute ID
   * @param tf bool whether to select or deselect all
   * @param bin Bin ID
   */
  toggleAllSelections(id: string, tf: boolean, bin: string) {
    if (tf) {
      this.filterService.form.controls[id].setValue(
        Object.keys(this.filterService.pullValueMap[id])
      );
    } else {
      this.filterService.form.controls[id].setValue(null);
    }
    this.type0change(id, bin);
  }

  /**
   * GET INIT VALUES MIN MAX
   * @param id Attribte ID
   * @param minmax number Min is 0, max is 1
   */
  getInitValuesMinMax(id: any, minmax: any) {
    if (this.filterService.form.value[id] != null) {
      return cloneDeep(this.filterService.form.value[id][minmax]);
    } else {
      return null;
    }
  }

  /**
   * Get init values Type7 Basic Input
   * @param id attribute ID
   */
  getInitValuesType7(id: any) {
    if (this.filterService.form.value[id] != null) {
      return cloneDeep(this.filterService.form.value[id][0]);
    } else {
      return null;
    }
  }
  /**
   * Get init values Type 8 Input
   * @param id Attirbute ID
   * @param startEnd 0 for beginning date and 1 for end
   */
  getInitValuesType8StartEnd(id: any, startEnd: any) {
    if (
      this.filterService.form.value[id] != null &&
      this.filterService.form.value[id][startEnd] != null
    ) {
      return this.displayType8(
        cloneDeep(this.filterService.form.value[id][startEnd])
      );
    } else {
      return "";
    }
  }

  /**
   * return init string for where slide will go
   * @param val number 0 off, 1 on
   */
  getType3Display(val: any) {
    if (String(val) == "0") {
      return "OFF";
    }
    if (String(val) == "1") {
      return "ON";
    }
  }
  /**
   * trigger for hover over drop down position
   */
  openMyMenu() {
    this.trigger.toggleMenu();
  }
  /**
   * trigger for closing pos drop down
   */
  closeMyMenu() {
    this.trigger.closeMenu();
  }

  /**
   * This function will create the html string to insert into the position type
   * UI for the menus
   * I tried creating this to be automatic but because of the package it was not taking
   * copy this output and past into the html file and then in cash html
   */
  createPosMenus() {
    var template01 = "<mat-menu #"; //menuname
    var template02 = '="matMenu">';
    var template11 = '<button mat-menu-item (click)="toggleNestedSelect(id,'; //child id
    var template12 = ')"[matMenuTriggerFor]="'; //childmenu
    var template13 = '">'; //display name
    var template14 = "</button>";
    var template21 = '<button mat-menu-item (click)="toggleNestedSelect(id,'; //child id
    var template22 = ')">'; //display name
    var template23 = "</button>";
    var template30 = "</mat-menu>";
    var overallString = "";
    for (let menuName in this.filterService.positionHierarchy) {
      overallString +=
        template01 +
        String(this.filterService.positionHItem[menuName]["PosAbbr"]) +
        template02;
      for (let child of this.filterService.positionHierarchy[menuName]) {
        if (this.filterService.positionHierarchy[child]) {
          overallString +=
            template11 +
            String(child) +
            template12 +
            String(this.filterService.positionHItem[child]["PosAbbr"]) +
            template13 +
            String(this.filterService.positionHItem[child]["PosAbbr"]) +
            template14;
        } else {
          overallString +=
            template21 +
            String(child) +
            template22 +
            String(this.filterService.positionHItem[child]["PosAbbr"]) +
            template23;
        }
      }
      overallString += template30;
    }
    console.log("OVR STRING", overallString);
  }

  /**
   * Toggle on off for a position ID
   * @param id attribute ID
   * @param key Value ID
   */
  toggleNestedSelect(id: any, key: any) {
    var oldValue: String[] = cloneDeep(this.filterService.form.value[id]);
    if (oldValue == null) {
      this.filterService.form.controls[id].setValue([String(key)]);
    } else {
      if (
        this.filterService.form.value[id] != null &&
        this.filterService.form.value[id].indexOf(String(key)) != -1
      ) {
        this.filterService.form.controls[id].setValue(
          oldValue.filter(x => x != String(key))
        );
      } else {
        this.filterService.form.controls[id].setValue(
          oldValue.concat([String(key)])
        );
      }
    }
    this.filterService.type0change(
      id,
      this.filterService.form.value[id],
      this.filterService.filterBinSelected
    );
  }

  /**
   * InsertDate in normal readable format
   * @param time time in utc
   */
  displayType8(time: any) {
    var date = new Date(time * 1000);
    var f =
      String(Number(date.getMonth()) + 1) +
      "/" +
      date.getDate() +
      "/" +
      date.getFullYear();
    return f;
  }

  /**
   * Select an item in the panel and open up next level
   * @param itemID Panel Item ID
   */
  changeLevel2(itemID: string) {
    this.filterService.changelevel2(itemID);
  }

  /**
   * Clicking on the save button (with icon that looks like a folder)
   * Will open module to select saved filters
   */
  selectSavedFilter() {
    //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(80%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "160px", left: "15%" };
    dialogConfig.data = {};

    //OPEN WINDOW
    const dialogRef = this.dialog.open(SavedfilterspopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
      }
    });
  }
}
