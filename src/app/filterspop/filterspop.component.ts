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
import { AttributeSelectionComponent } from "../attribute-selection/attribute-selection.component";
import { KeyValue } from "@angular/common";

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
  level1Selected;
  level2Selected;
  showSuggestions: boolean = false;
  searchGlobalText: string = "";

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
  Label = "Label";

  ngOnInit() {
    this.form = this.fb.group({});
    this.formG = this.fb.group({});
    setTimeout(() => {
      this.changelevel2(this.filterService.level1Selected);
    }, 1);
  }
  //RETURN LABEL OF OBJECT
  returnlabel(obj: any) {
    return obj["Label"];
  }

  //SEND TYPE0CHANGE TO FILTER SERVICE WITH VALUES OF SET AND LEVEL1SELECTED
  type0change(formKey) {
    this.filterService.type0change(
      formKey,
      this.filterService.form.value[formKey],
      this.filterService.level1Selected
    );
  }

  //CLEAR A SINGLE FILTER IN THE WORKING QUERY
  clearSingle(id: string) {
    this.filterService.clearSingleIDWorking(
      id,
      this.filterService.level1Selected
    );
  }

  //DELETE ENTIRE WORKING QUERY
  clearWorkingQuery() {
    this.filterService.clearWorking(this.filterService.level1Selected);
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

  //ALTER THE SELECTION VIEW OF TEH WORKING QUERY BASED ON THE
  //TIER 1 TAB THAT WAS SELECTED
  changelevel2(id: string) {
    //CHANGE OLD CSS
    var old = document.getElementById(
      "tier1Tab" + this.filterService.level1Selected
    );
    old.style.backgroundColor = "white";
    old.style.borderBottom = "4px solid white";

    //SET THE LEVEL SELECTED
    this.filterService.level1Selected = id;

    //CHANGE NEW CSS
    var newTab = document.getElementById("tier1Tab" + id);
    newTab.style.backgroundColor = "#f2f2f2";
    newTab.style.borderBottom = "4px solid var(--lighter-blue)";
  }

  //WHEN THE ADD BUTTON IS CLICKED OPEN THE ATTRIBUTE SELECTION
  //FOR THE LEVEL 1 SELECTED
  openAttributeSelection() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80vw";
    dialogConfig.maxWidth = "80vw";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "187px" };
    console.log("OPENING FORM", this.filterService.form.value);
    dialogConfig.data = {
      title:
        this.returnlabel(
          this.filterService.pullBin[this.filterService.level1Selected]
        ) + " Selection",
      bid: this.filterService.level1Selected
    };
    const dialogRef = this.dialog.open(
      AttributeSelectionComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe(data => {});
  }

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

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  toggleWeek(type: string, week: string, event: any) {
    // var id = type + week;
    // if (event.buttons == 1) {
    //   //toggle
    //   if (
    //     document.getElementById(id).style.backgroundColor != "grey" &&
    //     this.highlighting &&
    //     this.yearsSelected.length > 0
    //   ) {
    //     document.getElementById(id).style.backgroundColor = "grey";
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
    //       document.getElementById(id).style.backgroundColor == "grey"
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
    //   document.getElementById(id).style.backgroundColor != "grey" &&
    //   this.yearsSelected.length > 0
    // ) {
    //   this.highlighting = true;
    //   document.getElementById(id).style.backgroundColor = "grey";
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
    //     document.getElementById(year).style.backgroundColor != "grey" &&
    //     this.highlighting
    //   ) {
    //     document.getElementById(year).style.backgroundColor = "grey";
    //     if (this.yearsSelected.indexOf(year) == -1) {
    //       this.yearsSelected.push(year);
    //     }
    //   } else {
    //     if (
    //       !this.highlighting &&
    //       document.getElementById(year).style.backgroundColor == "grey"
    //     ) {
    //       document.getElementById(year).style.backgroundColor = "white";
    //       this.yearsSelected = this.yearsSelected.filter(x => x != year);
    //     }
    //   }
    // }
  }

  //*******THIS NEEDS TO BE MOVED TO THE FILTERSERVICE FILE*********
  toggleYearHighlight(year: string) {
    // if (document.getElementById(year).style.backgroundColor != "grey") {
    //   this.highlighting = true;
    //   document.getElementById(year).style.backgroundColor = "grey";
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
    //       document.getElementById(year).style.backgroundColor = "grey";
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
    //         "grey";
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
