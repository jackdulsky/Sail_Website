import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { PullDataTestService } from "./pull-data-test.service";
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

  ///ABOVE HERE IS NEW 9/27

  filterID: string = null;
  filterName: string = "";
  namePresent: boolean = false;
  modified: boolean = false;

  oldFilters: { [id: number]: number[] } = {};
  testScaffolding: {
    [id: number]: { [id: number]: { [id: number]: number[] } };
  } = {};
  testMeta: { [id: number]: {} } = {};
  testIdToString: { [id: number]: string } = {};
  testSidToString: { [id: string]: string } = {};
  testOptions: { [id: number]: number[] } = {};
  testReverse: { [id: number]: number[] } = {};
  testIds: number[] = [];
  teams;
  playCount = "0";
  playLock;

  getTeams() {
    return this.teams;
  }
  getName() {
    return this.filterName;
  }
  getID() {
    return this.filterID;
  }
  getNamePresent() {
    return this.namePresent;
  }
  setName(name: string) {
    this.namePresent = true;
    this.filterName = name;
  }
  setID(id: string) {
    console.log("ID is ", id);
    this.filterID = id;
  }
  clearID() {
    this.filterID = null;
  }
  clearName() {
    this.modified = false;
    this.filterName = null;
    this.namePresent = false;
    this.clearID();
  }

  extractID(data, idString: string, insertDict) {
    for (let b in data) {
      var id = String(data[b][idString]);
      delete data[b][idString];
      insertDict[id] = data[b];
    }
  }
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
  //This is called when the top bar initializes
  getBulkImport() {
    this.form = this.fb.group({});
    this.pullData.setGUID();
    this.pullData.newPullDataType().subscribe(data => {
      this.pullDataType = {};
      this.extractID(data, "DataTypeID", this.pullDataType);
    });
    this.pullData.newPullBin().subscribe(data => {
      this.pullBin = {};
      this.extractID(data, "BinID", this.pullBin);
    });
    this.pullData.newPullNavigation().subscribe(data => {
      this.pullNavigation = {};
      this.extractID(data, "ItemID", this.pullNavigation);
    });
    this.pullData.newPullNavigationElement().subscribe(data => {
      this.pullNavigationElement = {};
      this.extractID(data, "ItemID", this.pullNavigationElement);
      console.log("NAVELEM", this.pullNavigationElement);
    });
    this.pullData.newPullAttributeType().subscribe(data => {
      this.pullAttributeType = {};
      this.extractID(data, "AttributeTypeID", this.pullAttributeType);
    });
    this.pullData.newPullAttribute().subscribe(data => {
      this.pullAttribute = {};
      this.extractID(data, "AttributeID", this.pullAttribute);
      console.log("PULLATTRIBUTE", this.pullAttribute);
    });
    this.pullData.newPullUIType().subscribe(data => {
      this.pullUIType = {};
      this.extractID(data, "UITypeID", this.pullUIType);
    });
    this.pullData.newPullStructure("1").subscribe(data => {
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
    this.pullData.newPullValue().subscribe(data => {
      this.pullOrderMap = {};
      this.extractID(cloneDeep(data), "OrderID", this.pullOrderMap);
      console.log("PULL ORDER MAP", this.pullOrderMap);
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
    });
    this.pullData.getTeams().subscribe(data => {
      this.teams = data;
    });

    ////above is new
    console.log("IMPORT BULK");

    //THIS SECTION IS BID INITIALIZATION:
  }
  uploadSavedFilter(filterID: string, name: string, filter: any) {
    //   this.setName(name);
    //   this.setID(filterID);
    //   this.testFilters = filter;
  }

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

  testClearAll() {
    //   this.clearName();
    //   this.oldFilters = this.testFilters;
    //   this.testFilters = {};
    //   this.playCount = "0";
  }
  testSendFilters() {
    //   this.testSendFilters2();
    //   if (Object.keys(this.testFilters).length > 0 && this.modified) {
    //     this.setID(this.pullData.sendFilters(this.testFilters));
    //     this.modified = false;
    //   }
  }
  testGetOptions() {
    //   return this.testOptions;
  }
  testDelete(filterID: string) {
    //   this.modified = true;
    //   delete this.testFilters[Number(filterID)];
    //   this.testSendFilters();
  }
  XOSExport(folder: string) {
    // this.pullData.XOSExport(folder, this.filterID, this.testFilters);
  }
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
  modifiedStatus() {
    return this.modified && this.getNamePresent();
  }
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

  ///THIS IS THE SECTION OF FUNCTIONS AFTER THE
  ///MODIFICATION TO FILTER STRUCTURE 9/27

  //add query (also performs edit ability)
  // addQuery(bid, pk, att, fid) {
  //   var newFIDNumber = String(Math.floor(Math.random() * 1000));
  //   this.newFIDBID[newFIDNumber] = bid;
  //   this.newFIDs[newFIDNumber] = [pk, att, fid];
  //   this.newFilter[bid][newFIDNumber] = [pk, att, fid];
  // }
  turnString(item: any) {
    return String(item);
  }
  removeQuery(fid: string) {
    for (let id in this.newFIDs[fid]) {
      this.clearSingleIDWorking(id, this.newFIDBID[fid]);
    }
    delete this.newDBFormat[this.newFIDBID[fid]][fid];
    delete this.newFIDBID[fid];
    delete this.newFIDs[fid];
    this.testSendFilters2();
  }
  addWorkingQuery(bid: string) {
    console.log("ADD WORKING", this.workingBin, bid, this.workingBin != bid);
    console.log("COMBINED", this.combined);
    if (this.workingBin != bid) {
      console.log("inside1", this.workingQuery);
      this.workingQuery = {};
      this.workingFID = "";

      console.log("inside2", this.workingQuery);
    }
    console.log("FORM VALUES", this.form.value);
    this.workingBin = cloneDeep(bid);
    this.workingQuery = Object.assign({}, this.workingQuery, this.combined);
    console.log(this.workingBin);
    console.log(this.workingQuery);
    this.combined = {};
  }
  combined = {};
  type0change(formKey, formVals, bid) {
    console.log("FORM VALS", this.form.value);
    if (bid != this.workingBin) {
      this.workingBin = bid;
      this.workingFID = "";
      this.combined = {};
      this.workingQuery = {};
    }
    var values = cloneDeep(formVals);
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
      this.combined[formKey] = values;
      if (this.workingQuery[formKey]) {
        this.workingQuery[formKey] = values;
      }
    }
  }
  clearSingleIDWorking(id: string, BID: string) {
    delete this.workingQuery[id];

    if (this.form.value[id + "search"] != null) {
      this.form.controls[String(id) + "search"].setValue(null);
    }
    this.form.controls[id].setValue(null);
  }
  pushQueryToFilterNoReset() {}
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
  pushQueryToActiveFilter(BID: string) {
    console.log(this.workingQuery);
    if (Object.keys(this.workingQuery).length == 0) {
      if (this.workingFID != "") {
        delete this.newFIDs[this.workingFID];
        delete this.newFIDBID[this.workingFID];
        delete this.newDBFormat[this.workingBin][this.workingFID];
        this.workingFID = "";
      }
      return;
    }
    for (let key in this.newFIDs) {
      if (this.isEqualObjectsContents(this.newFIDs[key], this.workingQuery)) {
        return;
      }
    }
    var newFIDNumber;
    if (this.workingFID != "") {
      newFIDNumber = cloneDeep(this.workingFID);
    } else {
      newFIDNumber = String(Math.floor(Math.random() * 1000));
    }
    var pkID = [];
    this.newFIDs[newFIDNumber] = Object.assign(
      {},
      cloneDeep(this.workingQuery)
    );
    this.form.reset();

    if (this.workingQuery[String(Number(BID) * -1)]) {
      pkID = cloneDeep(this.workingQuery[String(Number(BID) * -1)]);
      delete this.workingQuery[String(Number(BID) * -1)];
    }
    var att = cloneDeep(this.workingQuery);
    var FID = [];

    this.newFIDBID[newFIDNumber] = BID;
    if (!this.newDBFormat[BID]) {
      this.newDBFormat[BID] = {};
    }
    this.newDBFormat[BID][newFIDNumber] = [pkID, att, FID];

    this.workingQuery = {};
    this.workingBin = "0";
    this.workingFID = "";

    this.pullData.newConstructAndSendFilters(this.newDBFormat);
    this.testSendFilters2();
  }
  convertOrderToValIDpkID(pks: String[]) {
    return pks.map(function(item) {
      return this.pullOrderMap[String(item)]["ValueID"];
    }, this);
  }
  convertOrderToValIDAtt(Atts: {}) {
    for (let att of Object.keys(Atts)) {
      Atts[att] = Atts[att].map(function(item) {
        console.log(this.pullOrderMap[String(item)]);
        return this.pullOrderMap[String(item)]["ValueID"];
      }, this);
    }
    return Atts;
  }
  clearWorking(BID: string) {
    if (this.workingBin == BID) {
      for (let id in this.workingQuery) {
        this.clearSingleIDWorking(id, BID);
      }
    }
  }
  clearAll() {
    this.workingFID = "";
    this.workingBin = "0";
    this.newDBFormat = {};
    this.combined = {};
    this.workingQuery = {};
    this.newFIDs = {};
    this.newFIDBID = {};
  }
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
  createLeagueImages(league: string) {
    return (
      "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos/" +
      league +
      ".png"
    );
  }
  toggleLeague(attID: string, value: string) {
    var id = this.pullValue[value]["Label"];
    var logo = document.getElementById(id);
    var oldValue = this.form.value[attID];
    if (oldValue == null) {
      oldValue = [];
    }
    // this.workingBin = ""
    if (logo.className.includes("Selected")) {
      logo.className = "league";
      this.form.controls[attID].setValue(oldValue.filter(x => x != value));
    } else {
      logo.className = "leagueSelected";
      this.form.controls[attID].setValue(oldValue.concat([value]));
    }
    this.type0change(attID, this.form.value[attID], this.workingBin);
  }
  displaystuff(one, two, three) {
    console.log("ONE", one);
    console.log("TWO", two);
    console.log("Three", three);
  }
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
  checkType2ConfChecked(id: string, Label: string) {
    if (this.conferenceSelections[id] == Label) {
      return "checked";
    } else {
      return "";
    }
  }
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
  getDisplayTeams(id: string[], key: any) {
    return this.teams.filter(x => x[id[0]] == key[0] && x[id[1]] == key[1]);
  }
  checkNotInArray(arr: String[], numb: number) {
    return arr.indexOf(String(numb)) !== -1;
  }
  toggleTeam(teamI: any, attID: string) {
    console.log(teamI, attID);
    console.log("teamGUI" + String(teamI["SailTeamID"]));
    var team = document.getElementById("teamGUI" + String(teamI["SailTeamID"]));
    var oldValue = this.form.value[attID];
    console.log(team.className);
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

  constructor(public pullData: PullDataTestService, public fb: FormBuilder) {}
}
