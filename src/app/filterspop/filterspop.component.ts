import { Component, OnInit, Inject, ɵConsole } from "@angular/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import { Options } from "selenium-webdriver/safari";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { SafeHtmlPipe } from "../safe.pipe";
import { SmartFilterPipe } from "../smartFilter.pipe";
import { TEMPORARY_NAME } from "@angular/compiler/src/render3/view/util";
import { KeyValue } from "@angular/common";
import * as cloneDeep from "lodash/cloneDeep";

// import { AdalService } from 'adal-angular4';
import { MsAdalAngular6Module } from "microsoft-adal-angular6";

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
  public selected: any[] = [];
  yearsSelected: string[] = [];
  highlighting: boolean = false;
  showSuggestions: boolean = false;
  searchGlobalText: string = "";
  Label = "Label";
  selectedPath;
  show: string = "";
  panels: string[] = [];

  constructor(
    public pullData: PullDataService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<FilterspopComponent>,
    public filterService: FiltersService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.filterService.level1Selected = data.selected;
  }

  ngOnInit() {
    this.form = this.fb.group({});
    this.formG = this.fb.group({});
    this.filterService.conferenceSelections["2"] = "AFC";
    setTimeout(() => {
      this.filterService.changelevel2(this.filterService.level1Selected);
    }, 1);
    this.filterService.panels = [this.filterService.level1Selected];
  }
  //RETURN LABEL OF OBJECT
  returnlabel(obj: any) {
    return obj["Label"];
  }

  //SEND TYPE0CHANGE TO FILTER SERVICE WITH VALUES OF SET AND LEVEL1SELECTED
  type0change(formKey, bin) {
    this.filterService.type0change(
      formKey,
      this.filterService.form.value[formKey],
      bin
    );
  }

  //CLEAR A SINGLE FILTER IN THE WORKING QUERY
  clearSingle(id: string, bin: string) {
    this.filterService.clearSingleIDWorking(id, bin);
  }

  //DELETE ENTIRE WORKING QUERY
  clearWorkingQuery() {
    this.filterService.clearWorking();
  }

  //SEND THE WORKING QUERY TO THE FILTER TOP BAR
  pushWorkingQuery() {
    this.filterService.pushQueryToActiveFilter(
      this.filterService.level1Selected
    );
  }

  //FUNCTION TO SORT THE TIER 1 BUTTONS BY THE ORDER SENT IN
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

  //ORDER OPTIONS
  //***NOT IMPLEMENTED IN THE HTML PIPE YET *****/
  valueOrderOptions = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    return this.filterService.pullValueMap[a.key]["OrderID"] <
      this.filterService.pullValueMap[b.key]["OrderID"]
      ? -1
      : this.filterService.pullValueMap[b.key]["OrderID"] <
        this.filterService.pullValueMap[a.key]["OrderID"]
      ? 1
      : 0;
  };

  //ORDER SIDE BUTTONS ON THEIR ORDER ID
  valueOrderSideButtons = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    // console.log("ORDER VALUE", a.key, b.key);
    return this.filterService.pullNavigation[a.key]["OrderID"] <
      this.filterService.pullNavigation[b.key]["OrderID"]
      ? -1
      : this.filterService.pullNavigation[b.key]["OrderID"] <
        this.filterService.pullNavigation[a.key]["OrderID"]
      ? 1
      : 0;
  };

  //CLOSE THE DIALOG
  close() {
    this.dialogRef.close();
  }

  //CLOSE THE DIALOG
  save() {
    this.close();
  }

  //TOGGLE THE SHOW SELECTIONS IF THE GLOBAL SEARCH BOX IS NOT NULL
  searching(input: string) {
    if (input.length > 0) {
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }

    this.searchGlobalText = input;
  }
  //TOGGLE ALL FILTER SELECTIONS THEN CALL TYPE0CHANGE ON THE FORM VALUES
  toggleAllSelections(id: string, tf: boolean, bin: string) {
    if (tf && String(id) != "3") {
      this.filterService.form.controls[id].setValue(
        Object.keys(this.filterService.pullValueMap[id])
      );
    } else {
      this.filterService.form.controls[id].setValue(null);
    }
    this.type0change(id, bin);
  }

  //This function navigates the panels and displays where the
  //Attribute was selected from if its clicked on the right area
  navigateToAttribute(bin: any, att: any) {
    this.filterService.changelevel2(bin);
    var newPanels = [];
    var atRoot = false;
    var startAtt = att;
    while (!atRoot) {
      var adding = this.filterService.pullNavigation[startAtt]["ParentItemID"];
      newPanels.push(adding);
      if (Number(adding) <= 0) {
        atRoot = true;
      }
      startAtt = adding;
    }

    this.filterService.selectingAttributes = Object.keys(
      this.filterService.getPanelOptions(
        newPanels[0],
        cloneDeep(newPanels).reverse()
      )
    ).filter(x => this.filterService.pullNavigationElement[x]["IsAttribute"]);
    if (
      JSON.stringify(
        this.filterService.getPanelOptions(
          newPanels[0],
          cloneDeep(newPanels).reverse()
        )
      ) == "{}"
    ) {
      newPanels = newPanels.slice(1);
    }
    this.filterService.panels = newPanels.reverse();
  }

  //GET INIT VALUES MIN MAX
  getInitValuesMinMax(id: any, minmax: any) {
    if (this.filterService.form.value[id] != null) {
      return cloneDeep(this.filterService.form.value[id][minmax]);
    } else {
      return null;
    }
  }

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  toggleWeek(type: string, week: string, event: any) {
    // var id = type + week;
    // if (event.buttons == 1) {
    //   //toggle
    //   if (
    //     document.getElementById(id).style.backgroundColor != "gray" &&
    //     this.highlighting &&
    //     this.yearsSelected.length > 0
    //   ) {
    //     document.getElementById(id).style.backgroundColor = "gray";
    //     for (let i = 0; i < this.yearsSelected.length; i++) {
    //       this.filterService.testSetSeasonWeek(
    //         "200",
    //         this.yearsSelected[i],
    //         type,
    //         week
    //       );
    //     }
    //   } else {
    //     if (
    //       !this.highlighting &&
    //       document.getElementById(id).style.backgroundColor == "gray"
    //     ) {
    //       document.getElementById(id).style.backgroundColor = "white";
    //       for (let i = 0; i < this.yearsSelected.length; i++) {
    //         this.filterService.testRemoveSeasonWeek(
    //           "200",
    //           this.yearsSelected[i],
    //           type,
    //           week
    //         );
    //       }
    //     }
    //   }
    // }
  }

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  toggleWeekHighlight(type: string, week: string) {
    // var id = type + week;
    // if (
    //   document.getElementById(id).style.backgroundColor != "gray" &&
    //   this.yearsSelected.length > 0
    // ) {
    //   this.highlighting = true;
    //   document.getElementById(id).style.backgroundColor = "gray";
    //   for (let i = 0; i < this.yearsSelected.length; i++) {
    //     this.filterService.testSetSeasonWeek(
    //       "200",
    //       this.yearsSelected[i],
    //       type,
    //       week
    //     );
    //   }
    // } else {
    //   this.highlighting = false;
    //   document.getElementById(id).style.backgroundColor = "white";
    //   for (let i = 0; i < this.yearsSelected.length; i++) {
    //     this.filterService.testRemoveSeasonWeek(
    //       "200",
    //       this.yearsSelected[i],
    //       type,
    //       week
    //     );
    //   }
    // }
  }

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  toggleYear(year: string, event: any) {
    // if (event.buttons == 1) {
    //   //toggle
    //   if (
    //     document.getElementById(year).style.backgroundColor != "gray" &&
    //     this.highlighting
    //   ) {
    //     document.getElementById(year).style.backgroundColor = "gray";
    //     if (this.yearsSelected.indexOf(year) == -1) {
    //       this.yearsSelected.push(year);
    //     }
    //   } else {
    //     if (
    //       !this.highlighting &&
    //       document.getElementById(year).style.backgroundColor == "gray"
    //     ) {
    //       document.getElementById(year).style.backgroundColor = "white";
    //       this.yearsSelected = this.yearsSelected.filter(x => x != year);
    //     }
    //   }
    // }
  }

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  toggleYearHighlight(year: string) {
    // if (document.getElementById(year).style.backgroundColor != "gray") {
    //   this.highlighting = true;
    //   document.getElementById(year).style.backgroundColor = "gray";
    //   if (this.yearsSelected.indexOf(year) == -1) {
    //     this.yearsSelected.push(year);
    //   }
    // } else {
    //   this.highlighting = false;
    //   document.getElementById(year).style.backgroundColor = "white";
    //   this.yearsSelected = this.yearsSelected.filter(x => x != year);
    // }
  }

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  checkIfSelected(type: string, week: string) {
    // for (let i = 0; i < this.yearsSelected.length; i++) {
    //   try {
    //     if (
    //       !this.filterService.testFilters["200"][this.yearsSelected[i]][
    //         type
    //       ].some(x => x === week)
    //     ) {
    //       return false;
    //     }
    //   } catch {
    //     return false;
    //   }
    // }
    // if (this.yearsSelected.length == 0) {
    //   return false;
    // }
    // return true;
  }

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  selectAllSeasonWeek(yearOrWeekSet: string) {
    // if (yearOrWeekSet == "year") {
    //   if (this.years.length == this.yearsSelected.length) {
    //     for (let year of this.years) {
    //       this.highlighting = false;
    //       document.getElementById(year).style.backgroundColor = "white";
    //       this.yearsSelected = this.yearsSelected.filter(x => x != year);
    //     }
    //   } else {
    //     for (let year of this.years) {
    //       this.highlighting = true;
    //       document.getElementById(year).style.backgroundColor = "gray";
    //       if (this.yearsSelected.indexOf(year) == -1) {
    //         this.yearsSelected.push(year);
    //       }
    //     }
    //   }
    // } else {
    //   var toToggle = this.weeks[yearOrWeekSet];
    //   var turned = true;
    //   for (let week of toToggle) {
    //     if (
    //       document.getElementById(yearOrWeekSet + week).style.backgroundColor ==
    //       "white"
    //     ) {
    //       turned = false;
    //       document.getElementById(yearOrWeekSet + week).style.backgroundColor =
    //         "gray";
    //       this.highlighting = true;
    //       for (let i = 0; i < this.yearsSelected.length; i++) {
    //         this.filterService.testSetSeasonWeek(
    //           "200",
    //           this.yearsSelected[i],
    //           yearOrWeekSet,
    //           week
    //         );
    //       }
    //     }
    //   }
    //   if (turned) {
    //     this.highlighting = false;
    //     for (let week of toToggle) {
    //       document.getElementById(yearOrWeekSet + week).style.backgroundColor =
    //         "white";
    //       for (let i = 0; i < this.yearsSelected.length; i++) {
    //         this.filterService.testRemoveSeasonWeek(
    //           "200",
    //           this.yearsSelected[i],
    //           yearOrWeekSet,
    //           week
    //         );
    //       }
    //     }
    //   }
    // }
  }

  //THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE
  //UPON SELECTING AN ITEM FROM THE GLOBAL SEARCH LIST PULL IT UP
  resultSelected(id: any) {
    // var path = this.reverse[Number(id.key)];
    // this.changelevel2(String(path[0]));
    // if (path.length >= 2) {
    //   this.changelevel3(String(path[1]));
    //   if (path.length >= 3) {
    //   }
    // } else {
    //   this.level2Selected = Number(id.key);
    // }
    // (<HTMLInputElement>document.getElementById("searchGlobalText")).value = "";
    // this.showSuggestions = false;
  }

  //THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE
  //INPUT THE TEXT FOR AN ATTRIBUTTE AND SAVE THAT AS THE VALUE
  enterInput(id: string, condition: string) {
    // if (condition != "") {
    //   this.form.controls[Number(id)].setValue([condition]);
    //   this.filterService.testSet(id, this.form.value[id]);
    // } else {
    //   this.form.controls[Number(id)].setValue([]);
    //   this.filterService.testDelete(id);
    // }
  }
}
