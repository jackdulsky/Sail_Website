import { Component, OnInit, Inject, ɵConsole } from "@angular/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { FiltersService } from "../filters.service";
import { PullDataTestService } from "../pull-data-test.service";
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
  templateUrl: "./filterspop2.component.html",
  styleUrls: ["./filterspop2.component.css"]
})
export class FilterspopComponent implements OnInit {
  // dialogRef : MatDialogRef<FilterspopComponent>

  public form: FormGroup;
  public formG: FormGroup;
  leaguesOn = [];
  title: string;
  filts;
  activeFilters;
  options: {
    [id: number]: { [id: number]: { [id: number]: number[] } };
  };
  gamesLevel2From1: number[] = [100, 200, 300, 400, 500];
  gamesIDToString: { [id: number]: string } = {
    1: "Games",
    100: "League",
    200: "Season/Weeks",
    300: "Teams-Off",
    400: "Teams-Def",
    500: "Games",
    101: "NFL",
    102: "NCAA"
  };
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
  netIDToString: any;
  teams;
  filterYears: { [year: string]: { [type: string]: string[] } };
  public selected: any[] = [];
  yearsSelected: string[] = [];
  highlighting: boolean = false;
  conferenceSelectedOFF = "AFC";
  conferenceSelectedDEF = "AFC";
  conferenceSelections = { "300": "AFC", "400": "AFC" };
  activeLevel2From1;
  activeLevel3From2;
  level1Selected;
  level2Selected;
  safeHtmlContent: string;
  idToOptions: { [id: number]: number[] } = {};
  idToString: { [id: string]: string } = {};
  reverse: { [id: number]: number[] };
  showSuggestions: boolean = false;
  searchGlobalText: string = "";
  meta;

  constructor(
    public pullData: PullDataTestService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<FilterspopComponent>,
    public filterService: FiltersService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.filterService.level1Selected = data.selected;
  }
  newAttributeStructure;
  newValueMap;
  newAttribute;
  newGroup;
  newValuesOnly;
  Label = "Label";

  ngOnInit() {
    this.form = this.fb.group({});
    this.formG = this.fb.group({});
    this.getNewContents();
    this.netIDToString = Object.assign(
      {},
      this.idToString,
      this.gamesIDToString
    );
  }
  returnlabel(obj: any) {
    return obj["Label"];
  }
  type0change(formKey) {
    this.filterService.type0change(
      formKey,
      this.filterService.form.value[formKey],
      this.filterService.level1Selected
    );
  }
  clearSingle(id: string) {
    console.log(id);
    this.filterService.clearSingleIDWorking(
      id,
      this.filterService.level1Selected
    );
  }
  clearWorkingQuery() {
    this.filterService.clearWorking(this.filterService.level1Selected);
  }
  pushWorkingQuery() {
    this.filterService.pushQueryToActiveFilter(
      this.filterService.level1Selected
    );
  }
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

  getNewContents() {
    setTimeout(() => {
      this.changelevel2(this.filterService.level1Selected);
    }, 1);
  }
  changelevel2(id: string) {
    var old = document.getElementById(
      "tier1Tab" + this.filterService.level1Selected
    );
    old.style.backgroundColor = "white";
    old.style.borderBottom = "4px solid white";
    this.filterService.level1Selected = id;
    var newTab = document.getElementById("tier1Tab" + id);
    newTab.style.backgroundColor = "#f2f2f2";
    newTab.style.borderBottom = "4px solid var(--lighter-blue)";
  }
  printvars() {
    console.log("FORM", this.filterService.form.value);
  }
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
      bid: this.filterService.level1Selected,
      filterItem: ""
    };
    const dialogRef = this.dialog.open(
      AttributeSelectionComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe(data => {
      console.log("FORM AFTER ATT  CLOSE", this.filterService.form.value);
    });
  }

  // new above
  //

  //   older
  ngAfterViewInit() {}

  getTeams(id: string[], key: any) {
    return this.teams.filter(x => x[id[0]] == key[0] && x[id[1]] == key[1]);
  }
  changeConference(num: string, newConf: string) {
    if (newConf == "NFC") {
      document.getElementById(
        "switchConference" + this.level2Selected
      ).style.backgroundColor = "Blue";
    } else {
      document.getElementById(
        "switchConference" + this.level2Selected
      ).style.backgroundColor = "Red";
    }
    this.conferenceSelections[num] = newConf;
  }
  testprint() {
    console.log(this.selected);
  }
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

  showItem(type: string, week: string) {}

  close() {
    this.dialogRef.close();
  }

  save() {
    this.close();
  }

  searching(input: string) {
    if (input.length > 0) {
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }

    this.searchGlobalText = input;
  }
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
  enterInput(id: string, condition: string) {
    // if (condition != "") {
    //   this.form.controls[Number(id)].setValue([condition]);
    //   this.filterService.testSet(id, this.form.value[id]);
    // } else {
    //   this.form.controls[Number(id)].setValue([]);
    //   this.filterService.testDelete(id);
    // }
  }

  checked: boolean = false;

  logo(team: any) {
    var citySplit = team["ClubCityName"].split(" ");
    var city;
    if (citySplit.length > 1) {
      city = citySplit[0] + citySplit[1];
    } else {
      city = citySplit[0];
    }
    var nick = team["ClubNickName"];
    return (
      "https://sail-bucket.s3-us-west-2.amazonaws.com/Button_Team_Logos/" +
      team["TeamCode"] +
      "_logo.png"
    );
  }
  toggleTeam(teamI: any, filter: string) {
    var team = document.getElementById("teamGUI" + teamI["TeamCode"]);
    if (team.className == "singleTeamGUI ng-star-inserted") {
      team.className = "singleTeamGUISelected ng-star-inserted";
      // this.filterService.testSet(filter, [teamI["SailTeamID"]]);
    } else {
      team.className = "singleTeamGUI ng-star-inserted";

      // this.filterService.removeSingleSelection(filter, teamI["SailTeamID"]);
    }
  }
  toggleLeague(elementID: string, num: number) {
    // var logo = document.getElementById(elementID);
    // if (logo.className.includes("Selected")) {
    //   logo.className = "league";
    //   this.filterService.removeSingleSelection("100", num);
    // } else {
    //   logo.className = "leagueSelected";
    //   this.filterService.testSet("100", [num]);
    // }
  }
}
