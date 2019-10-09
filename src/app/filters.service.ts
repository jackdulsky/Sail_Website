import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { PullDataService } from "./pull-data.service";
import { filter } from "minimatch";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { NonNullAssert } from "@angular/compiler";

@Injectable({
  providedIn: "root"
})
export class FiltersService {
  newFilter: { [bid: string]: {} } = {};
  newFIDBID: { [FID: string]: string } = {};
  newFIDs: { [FID: string]: {} } = {};
  newDBFormat: { [bid: string]: {} } = {};
  workingQuery = {};
  combined = {};
  workingBin = "";
  workingFID = "";
  level1Selected;
  form;
  pullDataType;
  pullBin;
  pullNavigation;
  pullNavigationElement;
  pullAttributeType;
  pullAttribute;
  pullUIType;
  pullValue;
  pullValueMap;
  pullStructure;
  pullOrderMap;
  OrderID = "OrderID";
  conferenceSelected = "AFC";
  conferenceSelectedDEF = "AFC";
  conferenceSelections = { "2": "AFC", "400": "AFC" };
  teams;
  playCount = "0";
  playLock;
  filterID: string = null;
  filterName: string = "";
  namePresent: boolean = false;
  modified: boolean = false;

  //RETURN TEAMS INFORMATION (NOT A LIST OF NAMES)
  getTeams() {
    return this.teams;
  }
  //RETURN THE NAME OF THE FILTER SET
  getName() {
    return this.filterName;
  }
  //RETURN THE ID ASSOCIATED WITH CURRENT FILTER SET
  //LIKELY WILL BE THE GUID
  getID() {
    return this.filterID;
  }
  //RETURN IF A NAME EXISTS
  getNamePresent() {
    return this.namePresent;
  }
  //CHANGE THE NAME OF THE FILTER SET
  setName(name: string) {
    this.namePresent = true;
    this.filterName = name;
  }

  //CHANGE THE ID ASSOCIATED WITH THE FILTER SET
  setID(id: string) {
    this.filterID = id;
  }
  //RESET THE FILTER SET ID
  clearID() {
    this.filterID = null;
  }

  //RESET THE NAME (AND ID)
  clearName() {
    this.modified = false;
    this.filterName = null;
    this.namePresent = false;
    this.clearID();
  }

  //TURN AN ARRAY OF DICTIONARIES INTO A DICTIONARY WITH KEY AS IDSTRING SPECIFIED THROUGH PULLING IT OUT TO BE THE KEY
  extractID(data, idString: string, insertDict) {
    for (let b in data) {
      var id = String(data[b][idString]);
      delete data[b][idString];
      insertDict[id] = data[b];
    }
  }

  //RECURSIVELY GO THROUGH THE STRUCTURE TO CONVER TO THE DICTIONARY FORMAT REQUIRED
  recursiveExtractLevel(row, idString: string, level: number) {
    var id = String(row[idString]);
    var element = {};
    delete row[idString];
    if (row["l" + String(level)]) {
      var next = {};
      for (let sub in row["l" + String(level)]) {
        next = Object.assign(
          {},
          next,
          this.recursiveExtractLevel(
            row["l" + String(level)][sub],
            "ID",
            level + 1
          )
        );
      }
      delete row["l" + String(level)];
      row["subLevel"] = next;
    }

    this.form.addControl(id, new FormControl());
    this.form.addControl(id + "search", new FormControl());
    element[id] = next;
    return element;
  }
  //THIS IS THE FUNCTION CALLED BY THE TOP BAR RENDER TO IMPORT ALL THE DATA ON WEBSITE START UP
  getBulkImport() {
    this.form = this.fb.group({});
    this.pullData.setGUID();
    this.pullData.pullDataType().subscribe(data => {
      this.pullDataType = {};
      this.extractID(data, "DataTypeID", this.pullDataType);
    });
    this.pullData.pullBin().subscribe(data => {
      this.pullBin = {};
      this.extractID(data, "BinID", this.pullBin);
      console.log("BIN", this.pullBin);
    });
    this.pullData.pullNavigation().subscribe(data => {
      this.pullNavigation = {};
      this.extractID(data, "ItemID", this.pullNavigation);
      console.log("NAV", this.pullNavigation);
    });
    this.pullData.pullNavigationElement().subscribe(data => {
      this.pullNavigationElement = {};
      this.extractID(data, "ItemID", this.pullNavigationElement);
      console.log("NAVELEM", this.pullNavigationElement);
    });
    this.pullData.pullAttributeType().subscribe(data => {
      this.pullAttributeType = {};
      this.extractID(data, "AttributeTypeID", this.pullAttributeType);
      console.log("ATT TYPE", this.pullAttributeType);
    });
    this.pullData.pullAttribute().subscribe(data => {
      this.pullAttribute = {};
      this.extractID(data, "AttributeID", this.pullAttribute);
      console.log("PULLATTRIBUTE", this.pullAttribute);
    });
    this.pullData.pullUIType().subscribe(data => {
      this.pullUIType = {};
      this.extractID(data, "UITypeID", this.pullUIType);
      console.log("PULL UI TYPE", this.pullUIType);
    });
    this.pullData.pullStructure("1").subscribe(data => {
      var d = JSON.parse(data[0][""]);
      this.pullStructure = {};
      for (let b in d) {
        this.pullStructure = Object.assign(
          {},
          this.pullStructure,
          this.recursiveExtractLevel(d[b], "BinID", 2)
        );
      }
      console.log("PULLStructure", this.pullStructure);
    });
    this.pullData.pullValue().subscribe(data => {
      this.pullOrderMap = {};
      this.extractID(cloneDeep(data), "OrderID", this.pullOrderMap);

      this.pullValue = {};
      this.pullValueMap = {};
      for (let b in data) {
        var valID = cloneDeep(String(data[b]["ValueID"]));
        var att = String(data[b]["AttributeID"]);
        delete data[b]["ValueID"];
        if (this.pullValueMap[att]) {
          this.pullValueMap[att][valID] = data[b];
        } else {
          this.pullValueMap[att] = {};
          this.pullValueMap[att][valID] = data[b];
        }

        this.pullValue[valID] = data[b];
      }

      console.log("PULLValueMap", this.pullValueMap);
      console.log("PULL ORDER MAP", this.pullOrderMap);
    });
    this.pullData.getTeams().subscribe(data => {
      this.teams = data;
    });
  }

  //IMPORT A SAVED FILTER
  //NOT FUNCTIONAL
  uploadSavedFilter(filterID: string, name: string, filter: any) {
    //   this.setName(name);
    //   this.setID(filterID);
    //   this.testFilters = filter;
  }

  //NOT FUNCTIONAL
  testSetSeasonWeek(
    filterID: string,
    year: string,
    type: string,
    week: string
  ): void {
    //   this.modified = true;
    //   if (year != null) {
    //     if (!this.testFilters[filterID]) {
    //       this.testFilters[filterID] = {};
    //     }
    //     if (!this.testFilters[filterID][year]) {
    //       this.testFilters[filterID][year] = { POST: [], PRE: [], REG: [] };
    //     }
    //     var old = this.testFilters[filterID][year][type];
    //     if (old.indexOf(week) == -1) {
    //       this.testFilters[filterID][year][type] = old.concat([week]);
    //     }
    //   } else {
    //     this.testDelete(filterID);
    //   }
    //   this.testSendFilters();
  }

  //NOT FUNCTIONAL
  testRemoveSeasonWeek(
    filterID: string,
    year: string,
    type: string,
    week: string
  ): void {
    //   this.testFilters[filterID][year][type] = this.testFilters[filterID][year][
    //     type
    //   ].filter(x => x != week);
    //   if (
    //     this.testFilters[filterID][year]["POST"].length == 0 &&
    //     this.testFilters[filterID][year]["REG"].length == 0 &&
    //     this.testFilters[filterID][year]["PRE"].length == 0
    //   ) {
    //     delete this.testFilters[filterID][year];
    //   }
    //   if (Object.keys(this.testFilters[filterID]).length == 0) {
    //     delete this.testFilters[filterID];
    //   }
    //   this.testSendFilters();
  }

  //NOT FUNCTIONAL
  XOSExport(folder: string) {
    this.pullData.XOSExport(folder, this.filterID, {});
  }

  //NOT FUNCTIONAL
  saveFilter(name: string) {
    // if (Object.keys(this.testFilters).length > 0) {
    //   var newID = this.pullData.saveFilter(
    //     name,
    //     this.testFilters,
    //     this.filterID
    //   );
    //   this.setID(newID);
    // }
    // this.modified = false;
  }

  //NOT FUNCTIONAL
  removeSingleSelection(filterID: string, filter: number) {
    // const index: number = this.testFilters[filterID].indexOf(filter);
    // this.testFilters[filterID] = this.testFilters[filterID].filter(
    //   x => x != filter
    // );
    // if (this.testFilters[filterID].length == 0) {
    //   delete this.testFilters[filterID];
    // }
    // this.testSendFilters();
  }

  //RETURN IF THE FILTER QUERY SET HAS BEEN MODIFIED AT ALL SINCE SAVED
  modifiedStatus() {
    return this.modified && this.getNamePresent();
  }

  //USED FOR TESTING THE PLAY COUNT
  //LOCKS THE WRITING TO THE PLAYCOUNT VARIABLE
  testSendFilters2() {
    var game = Math.floor(Math.random() * 900) + 57000;
    this.playCount = "";
    this.playLock = game;
    this.pullData.testSlowQuery(game).subscribe(data => {
      try {
        if (this.playLock == game) {
          var temp = <any[]>data;
          this.playCount = String(temp.length);
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  //TURN NUMBER TO STRING FOR HTML WORKAROUND
  turnString(item: any) {
    return String(item);
  }

  //DELETE A QUERY BASED ON FID
  removeQuery(fid: string) {
    for (let id in this.newFIDs[fid]) {
      this.clearSingleIDWorking(id, this.newFIDBID[fid]);
    }
    delete this.newDBFormat[this.newFIDBID[fid]][fid];
    delete this.newFIDBID[fid];
    delete this.newFIDs[fid];
    this.testSendFilters2();
  }

  //ADD THE SELECTIONS IN ATTRIBUTE SELCTION TO THE WORKING QUERY
  //COMBINED IS THE SELECTED OPTIONS IN THE ATTRIBUTE SELECTION
  addWorkingQuery(bid: string) {
    if (this.workingBin != bid) {
      this.workingQuery = {};
      this.workingFID = "";
    }
    this.workingBin = cloneDeep(bid);
    this.workingQuery = Object.assign({}, this.workingQuery, this.combined);
    this.combined = {};
  }

  //THIS IS THE GENERIC CHANGE FUNCTION
  //TAKES IN THE FORMKEY (ATT OR PKID), AND ITS VALUES
  //AND WILL PUT THE CHANGES IN THE COMBINED VARIABLE
  //STAGED FOR PUTTIN INTO THE WORKING QUERY
  //RESET VARIABLES APPROPRIATELY
  type0change(formKey, formVals, bid) {
    //IF THE BIN ID AND THE WORKING BIN ARE NOT THE SAME THEN RESET FIRST
    if (bid != this.workingBin) {
      this.workingBin = bid;
      this.workingFID = "";
      this.combined = {};
      this.workingQuery = {};
    }
    var values = cloneDeep(formVals);

    //CHECK IF A DELETE NEEDS TO OCCUR CAUSE VALUE IS EMPTY
    if (values != null && values.length == 0) {
      delete this.workingQuery[formKey];
      delete this.combined[formKey];
      this.form.controls[formKey].setValue(null);
      if (Object.keys(this.workingQuery).length == 0) {
        delete this.newFIDs[this.workingFID];
        this.workingFID = "";
      }
      this.testSendFilters2();
    } else {
      //ADD TO THE COMBINED
      this.combined[formKey] = values;
      if (this.workingQuery[formKey]) {
        this.workingQuery[formKey] = values;
      }
    }
  }
  //DELETING A SINGLE SELECTION ON THE FILTERS POP PAGE
  //REMOVE FROM THE WORKING QUERY AND
  clearSingleIDWorking(id: string, BID: string) {
    delete this.workingQuery[id];

    if (this.form.value[id + "search"] != null) {
      this.form.controls[String(id) + "search"].setValue(null);
    }
    this.form.controls[id].setValue(null);
  }

  //IS TWO OBJECTS EQUAL CONTENTS NOT MEMORY POINTERS
  isEqualObjectsContents(a, b) {
    var aProps = Object.getOwnPropertyNames(a).sort();
    var bProps = Object.getOwnPropertyNames(b).sort();
    if (
      aProps.length != bProps.length ||
      !(
        JSON.stringify(aProps).toLowerCase() ===
        JSON.stringify(bProps).toLowerCase()
      )
    ) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      if (
        !(
          JSON.stringify(a[propName]).toLowerCase() ===
          JSON.stringify(b[propName]).toLowerCase()
        )
      ) {
        return false;
      }
    }
    return true;
  }

  //PUT THE STAGED CHANGES FROM THE FILTERSPOP DISPLAY AND PUT INTO THE WORKING FID OR CREATE A NEW ONE
  pushQueryToActiveFilter(BID: string) {
    //PUSH EMPTY PERFORM DELETES
    if (Object.keys(this.workingQuery).length == 0) {
      if (this.workingFID != "") {
        delete this.newFIDs[this.workingFID];
        delete this.newFIDBID[this.workingFID];
        delete this.newDBFormat[this.workingBin][this.workingFID];
        this.workingFID = "";
      }
      return;
    }
    //DO NOT DOUBLE PUT IN ITEMS
    for (let key in this.newFIDs) {
      if (this.isEqualObjectsContents(this.newFIDs[key], this.workingQuery)) {
        return;
      }
    }

    //SET FID TO CURRENT OR GENERATE NEW ONE
    var newFIDNumber;
    if (this.workingFID != "") {
      newFIDNumber = cloneDeep(this.workingFID);
    } else {
      newFIDNumber = String(Math.floor(Math.random() * 1000));
    }
    //PUT THE WORKING QUERY IN NEW FIDs
    var pkID = [];
    this.newFIDs[newFIDNumber] = Object.assign(
      {},
      cloneDeep(this.workingQuery)
    );

    //RESET
    this.form.reset();

    //PULL OUT THE PKIDS AND PUT INTO THE FORM TO SEND UP TO THE DATA BASE
    if (this.workingQuery[String(Number(BID) * -1)]) {
      pkID = cloneDeep(this.workingQuery[String(Number(BID) * -1)]);
      delete this.workingQuery[String(Number(BID) * -1)];
    }
    var att = cloneDeep(this.workingQuery);
    var FID = [];

    //INIT THE NEW DB FORMAT BEFORE ADDING
    this.newFIDBID[newFIDNumber] = BID;
    if (!this.newDBFormat[BID]) {
      this.newDBFormat[BID] = {};
    }
    this.newDBFormat[BID][newFIDNumber] = [pkID, att, FID];

    //RESET
    this.workingQuery = {};
    this.workingBin = "0";
    this.workingFID = "";

    //SEND UP TO THE DB
    this.pullData.constructAndSendFilters(this.newDBFormat);
    this.testSendFilters2();
  }
  //EMPTY THE WORKING QUERY
  clearWorking(BID: string) {
    if (this.workingBin == BID) {
      for (let id in this.workingQuery) {
        this.clearSingleIDWorking(id, BID);
      }
    }
    if (this.workingFID != "") {
      this.removeQuery(this.workingFID);
      this.workingFID = "";
    }
  }
  //HARD RESET OF ALL VARIABLES CALLED FROM THE FILTER BAR
  clearAll() {
    this.workingFID = "";
    this.workingBin = "0";
    this.newDBFormat = {};
    this.combined = {};
    this.workingQuery = {};
    this.newFIDs = {};
    this.newFIDBID = {};
  }

  //SETTING CSS OF THE LEAGUE ICONS
  setLeagueIconStyle(leagueID: string, id: string) {
    var obj = this.pullValueMap[id][leagueID];

    let styles =
      obj["Label"] == "NFL"
        ? {
            width: "90%",
            height: "100%",
            "margin-top": "0%",
            "margin-left": "5%"
          }
        : {
            width: "100%",
            height: "90%",
            "margin-top": "5%",
            "margin-left": "0%"
          };
    return styles;
  }

  //GET IMG URL FOR LEAGUE GUI
  createLeagueImages(league: string) {
    return (
      "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos/" +
      league +
      ".png"
    );
  }

  //CHANGE A LEAGUES STATUS IN THE FORM FOR LEAGUE SELECT GUI
  //CHANGE THE CSS AND INSERT/REMOVE
  toggleLeague(attID: string, value: string) {
    var id = this.pullValue[value]["Label"];
    var logo = document.getElementById(id);
    var oldValue = this.form.value[attID];
    if (oldValue == null) {
      oldValue = [];
    }
    if (logo.className.includes("Selected")) {
      logo.className = "league";
      this.form.controls[attID].setValue(oldValue.filter(x => x != value));
    } else {
      logo.className = "leagueSelected";
      this.form.controls[attID].setValue(oldValue.concat([value]));
    }
    this.type0change(attID, this.form.value[attID], this.workingBin);
  }

  //SELECT OR DESELECT ALL FROM THE TYPE 0 INPUT
  changeToggleValue(id: string, toLabel: string, remove: boolean) {
    if (remove) {
      this.form.controls[id].setValue(null);
      this.type0change(id, [], this.workingBin);
    } else {
      var toVal;
      for (let choice in this.pullValueMap[id]) {
        if (this.pullValueMap[id][choice]["Label"] == toLabel) {
          toVal = choice;
        }
      }
      this.form.controls[id].setValue([toVal]);
      this.type0change(id, [toVal], this.workingBin);
    }
  }

  //SLIDER RETURN STARTING POSITION OF THE SLIDER
  checkType3ToggleChecked(id: string, Label: string) {
    if (this.form.value[id] == null) {
      if (Label == "na") {
        return "checked";
      } else {
        return "";
      }
    }

    if (this.pullValueMap[id][this.form.value[id][0]]["Label"] == Label) {
      return "checked";
    } else {
      return "";
    }
  }

  //RETURN SLIDER STARTING POS FOR THE TOGGEL OF CONFERENCE
  checkType2ConfChecked(id: string, Label: string) {
    if (this.conferenceSelections[id] == Label) {
      return "checked";
    } else {
      return "";
    }
  }

  //CHANGE THE SLIDER TOGGLE OF CONFERENCE IN TEAM SELECT GUI
  changeConference(num: string, newConf: string) {
    if (newConf == "NFC") {
      document.getElementById("switchConference" + num).style.backgroundColor =
        "Blue";
    } else {
      document.getElementById("switchConference" + num).style.backgroundColor =
        "Red";
    }
    this.conferenceSelections[num] = newConf;
  }

  //RETURN THE TEAM LOGO URL FOR TEAM SELECT GUI
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

  //RETURN THE TEAMS THAT SHOULD BE DISPLAYED
  getDisplayTeams(id: string[], key: any) {
    return this.teams.filter(x => x[id[0]] == key[0] && x[id[1]] == key[1]);
  }

  //RETURN IF SOMETHING IS NOT IN THE ARRAY
  checkNotInArray(arr: String[], numb: number) {
    return arr.indexOf(String(numb)) !== -1;
  }

  //TOGGLE A TEAMS STATUS IN THE TEAM SELECT GUI
  toggleTeam(teamI: any, attID: string) {
    var team = document.getElementById("teamGUI" + String(teamI["SailTeamID"]));
    var oldValue = this.form.value[attID];
    if (oldValue == null) {
      oldValue = [];
    }
    if (team.className == "singleTeamGUI ng-star-inserted") {
      team.className = "singleTeamGUISelected ng-star-inserted";
      this.form.controls[attID].setValue(
        oldValue.concat([String(teamI["SailTeamID"])])
      );
    } else {
      team.className = "singleTeamGUI ng-star-inserted";
      this.form.controls[attID].setValue(
        oldValue.filter(x => x != String(teamI["SailTeamID"]))
      );
    }
    this.type0change(attID, this.form.value[attID], this.workingBin);
  }

  constructor(public pullData: PullDataService, public fb: FormBuilder) {}
}
