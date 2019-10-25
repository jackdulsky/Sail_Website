import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { PullDataService } from "./pull-data.service";
import { filter } from "minimatch";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { NonNullAssert, ThrowStmt } from "@angular/compiler";
import { lor, reportsNew, views } from "./allReports";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { ReplaceSource } from "webpack-sources";

@Injectable({
  providedIn: "root"
})
export class FiltersService {
  newFilter: { [bid: string]: {} } = {};
  newFIDBID: { [FID: string]: string } = {};
  newFIDs: { [FID: string]: {} } = {};
  newDBFormat: { [bid: string]: {} } = {};
  workingQuery = {};
  newWorkingQuery = {};
  newWorkingFID = {};
  reversePaths = {};
  show: string = "";
  panels: string[] = [];
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
  teamsMap;
  playCount = "0";
  playLock;
  filterID: string = null;
  filterName: string = "";
  namePresent: boolean = false;
  modified: boolean = false;
  teamPortalActiveClubID = "1012";
  teamPortalSelected = {
    SailTeamID: "1012",
    TeamCode: "OAK",
    Conference: "AFC",
    Division: "West",
    ClubCityName: "NFL",
    ClubNickName: ""
  };
  lor = lor;
  reportsNew = reportsNew;
  views = views;
  Label = "Label";
  selected: string;
  portalSelected = "";
  viewingURL;

  //This function returns the list of reports based on the location id
  getReportHeaders(location: any) {
    // return _.pickBy(this.lor, function(category) {
    //   return category["Location"] == location;
    // });

    return Object.assign(
      {},
      ...Object.entries(this.lor)
        .filter(([k, v]) => v["Location"] == location)
        .map(([k, v]) => ({ [k]: v }))
    );
    // return Object.fromEntries(Object.entries(this.lor).filter(([k,v]) => v["Location"]== location));
    //return this.lor.filter(x => x.Location == location);
  }

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
  extractID(data, idString: string, insertDict, keep: number = 0) {
    for (let b in data) {
      var id = String(data[b][idString]);
      if (keep == 0) {
        delete data[b][idString];
      }

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
      for (let binKey in this.pullBin) {
        this.newWorkingQuery[binKey] = {};
        this.reversePaths[binKey] = {};
        this.newWorkingFID[binKey] = "";
      }
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
      this.teams = cloneDeep(data);
      this.teamsMap = {};
      this.extractID(data, "SailTeamID", this.teamsMap, 1);
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
    var oldBID = this.newFIDBID[fid];
    for (let id in this.newFIDs[fid]) {
      this.clearSingleIDWorking(id, this.newFIDBID[fid]);
    }

    delete this.newDBFormat[oldBID][fid];

    delete this.newFIDBID[fid];
    delete this.newFIDs[fid];
    if (JSON.stringify(this.newDBFormat[oldBID]) == "{}") {
      delete this.newDBFormat[oldBID];
    }
    this.pullData.constructAndSendFilters(this.newDBFormat);
    this.testSendFilters2();
  }

  //THIS IS THE GENERIC CHANGE FUNCTION
  //TAKES IN THE FORMKEY (ATT OR PKID), AND ITS VALUES
  //AND WILL PUT THE CHANGES IN THE COMBINED VARIABLE
  //STAGED FOR PUTTIN INTO THE WORKING QUERY
  //RESET VARIABLES APPROPRIATELY
  type0change(formKey, formVals, bid) {
    var values = cloneDeep(formVals);
    //CHECK IF A DELETE NEEDS TO OCCUR CAUSE VALUE IS EMPTY

    if (values != null && values.length == 0) {
      delete this.newWorkingQuery[bid][formKey];
      this.form.controls[formKey].setValue(null);
      if (Object.keys(this.workingQuery).length == 0) {
        delete this.newFIDs[this.newWorkingFID[bid]];
        this.newWorkingFID[bid] = "";
      }
      this.pullData.constructAndSendFilters(this.newDBFormat);

      this.testSendFilters2();
    } else {
      this.newWorkingQuery[bid][formKey] = formVals;
    }
  }
  //DELETING A SINGLE SELECTION ON THE FILTERS POP PAGE
  //REMOVE FROM THE WORKING QUERY AND
  clearSingleIDWorking(id: string, BID: string) {
    delete this.newWorkingQuery[BID][id]; //this.workingQuery[id];
    if (this.newWorkingFID[BID] != "") {
      this.pushQueryToActiveFilter(BID);
    }
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
  pushQueryToActiveFilter(BID: string, clearWorking: boolean = true) {
    for (let bin in this.newWorkingQuery) {
      //PUSH EMPTY PERFORM DELETES
      if (Object.keys(this.newWorkingQuery[bin]).length == 0) {
        if (this.newWorkingFID[bin] != "") {
          delete this.newFIDs[this.newWorkingFID[bin]];
          delete this.newFIDBID[this.newWorkingFID[bin]];
          delete this.newDBFormat[bin][this.newWorkingFID[bin]];
          this.newWorkingFID[bin] = "";
        }
        continue;
      }

      //DO NOT DOUBLE PUT IN ITEMS

      for (let key in this.newFIDs) {
        if (
          this.isEqualObjectsContents(
            this.newFIDs[key],
            this.newWorkingQuery[bin]
          )
        ) {
          continue;
        }
      }
      //SET FID TO CURRENT OR GENERATE NEW ONE
      var newFIDNumber;
      if (this.newWorkingFID[bin] != "") {
        newFIDNumber = cloneDeep(this.newWorkingFID[bin]);
      } else {
        newFIDNumber = String(Math.floor(Math.random() * 1000));
      }
      //PUT THE WORKING QUERY IN NEW FIDs
      var pkID = [];
      this.newFIDs[newFIDNumber] = Object.assign(
        {},
        cloneDeep(this.newWorkingQuery[bin])
      );
      var att = cloneDeep(this.newWorkingQuery[bin]);
      //PULL OUT THE PKIDS AND PUT INTO THE FORM TO SEND UP TO THE DATA BASE
      if (att[String(Number(bin) * -1)]) {
        pkID = cloneDeep(att[String(Number(bin) * -1)]);
        delete att[String(Number(bin) * -1)];
      }

      var FID = [];

      //INIT THE NEW DB FORMAT BEFORE ADDING

      this.newFIDBID[newFIDNumber] = bin;
      if (!this.newDBFormat[bin]) {
        this.newDBFormat[bin] = {};
      }
      this.newDBFormat[bin][newFIDNumber] = [pkID, att, FID];

      //RESET
      if (clearWorking) {
        this.newWorkingQuery[bin] = {};
        this.newWorkingFID[bin] = "";
      }
      console.log("PUSHED");
      console.log(this.newFIDBID);
      console.log(this.newFIDs);
      console.log(this.newDBFormat);
    }

    //RESET
    if (clearWorking) {
      this.form.reset();
    }

    //SEND UP TO THE DB

    this.pullData.constructAndSendFilters(this.newDBFormat);
    this.testSendFilters2();
    if (this.router.url.includes("club")) {
      var replacing = this.router.url.split("/club/")[1].split("/")[0];
      var routeClub = this.teamPortalActiveClubID;
      this.router.navigate([this.router.url.replace(replacing, routeClub)]);
      this.updateRDURL();
    }
  }
  //EMPTY THE WORKING QUERY
  clearWorking() {
    for (let bin in this.newWorkingQuery) {
      for (let id in this.newWorkingQuery[bin]) {
        this.clearSingleIDWorking(id, bin);
      }

      if (this.newWorkingFID[bin] != "") {
        this.removeQuery(this.newWorkingFID[bin]);
        this.newWorkingFID[bin] = "";
      }
    }
  }
  //HARD RESET OF ALL VARIABLES CALLED FROM THE FILTER BAR
  clearAll() {
    for (let bin in this.newWorkingQuery) {
      this.newWorkingFID[bin] = "";
      this.newWorkingQuery[bin] = {};
    }
    this.newDBFormat = {};
    this.newFIDs = {};
    this.newFIDBID = {};
    this.form.reset();
    this.pullData.constructAndSendFilters(this.newDBFormat);
  }

  //This function clears a single value from the newWorking query, if a
  //Working FID is set it pushes the updates
  clearSingleValuePop(bin: any, att: any, val: any) {
    console.log("BEGGINNING");
    console.log(this.newFIDs);
    console.log(this.newDBFormat);
    console.log(this.newFIDBID);
    console.log(this.newWorkingQuery);
    console.log(
      "CLEAR SINGLE VALUE",
      bin,
      att,
      val,
      JSON.stringify(this.newWorkingQuery[bin][att]),
      JSON.stringify([String(val)]),
      JSON.stringify(this.newWorkingQuery[bin][att]) ==
        JSON.stringify([String(val)])
    );
    if (
      JSON.stringify(this.newWorkingQuery[bin][att]) ==
      JSON.stringify([String(val)])
    ) {
      this.clearSingleIDWorking(att, bin);
    } else {
      console.log("BEFORE 1", this.newWorkingQuery[bin][att]);
      this.newWorkingQuery[bin][att] = this.newWorkingQuery[bin][att].filter(
        x => x != String(val)
      );
      console.log("AFTER 1", this.newWorkingQuery[bin][att]);

      var oldValue = this.form.value[att];
      console.log(
        "BEFORE 2",
        this.newWorkingQuery[bin][att],
        this.form.value[att]
      );
      this.form.controls[att].setValue(oldValue.filter(x => x != String(val)));
      console.log(
        "AFTER 2",
        this.newWorkingQuery[bin][att],
        this.form.value[att]
      );

      if (this.newWorkingFID[bin] != "") {
        this.pushQueryToActiveFilter(bin, false);
      }
      console.log(
        "AFTER 3",
        this.newWorkingQuery[bin][att],
        this.form.value[att]
      );
    }
    console.log("END");
    console.log(this.newFIDs);
    console.log(this.newDBFormat);
    console.log(this.newFIDBID);
    console.log(this.newWorkingQuery);
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
  toggleLeague(attID: string, value: string, bin: string) {
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

    this.type0change(attID, this.form.value[attID], bin);
  }

  //SELECT OR DESELECT ALL FROM THE TYPE 0 INPUT
  changeToggleValue(id: string, toLabel: string, remove: boolean, bin: string) {
    if (remove) {
      this.form.controls[id].setValue(null);
      this.type0change(id, [], bin);
    } else {
      var toVal;
      for (let choice in this.pullValueMap[id]) {
        if (this.pullValueMap[id][choice]["Label"] == toLabel) {
          toVal = choice;
        }
      }
      this.form.controls[id].setValue([toVal]);
      this.type0change(id, [toVal], bin);
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
  toggleTeam(teamI: any, attID: string, bin: string) {
    this.teamPortalActiveClubID = String(teamI["SailTeamID"]);
    this.teamPortalSelected = teamI;
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
    this.type0change(attID, this.form.value[attID], bin);
  }

  //This Function will allow for the coloring of the filter based on the BIN it falls under
  //uses the color scheme and fact of the pattern color for determine color for each output
  //first color is the outer, and second one is the inside one
  setFilterStyle(BID: string, pos: number) {
    var conversions = {
      "-1": ["Green", "white"],
      "-2": ["Blue", "white"],
      "-3": ["Black", "white"],
      "-8": ["Red", "white"],
      "-14": ["Purple", "white"],
      "-11": ["Orange", "white"]
    };
    let styles = {
      "background-color": conversions[BID][pos % 2],
      color: conversions[BID][(pos + 1) % 2],
      border: "1px solid " + conversions[BID][0]
    };
    return styles;
  }

  //PANEL SECTION FOR FILTERPOP

  //ALTER THE SELECTION VIEW OF TEH WORKING QUERY BASED ON THE
  //TIER 1 TAB THAT WAS SELECTED
  changelevel2(id: string) {
    //CHANGE OLD CSS
    var old = document.getElementById("tier1Tab" + this.level1Selected);
    old.style.backgroundColor = "white";
    old.style.borderBottom = "4px solid white";

    //SET THE LEVEL SELECTED
    this.level1Selected = id;

    // SET PANELS
    this.panels = [id];
    this.show = "";

    //CHANGE NEW CSS
    var newTab = document.getElementById("tier1Tab" + id);
    newTab.style.backgroundColor = "#f2f2f2";
    newTab.style.borderBottom = "4px solid var(--lighter-blue)";
  }

  //THIS OPENS UP NEW PANELS AND CONTROLS CLOSING OLD ONES UPON A CLICK
  attributeSelected(att: string) {
    var newPanels = [];
    var first = this.panels[0];
    var level = this.pullStructure[first];

    var toTurnOff = [];
    var addtoOff = false;

    //ITERATE THROUGH THE PANELS THAT HAVE BEEN OPENED INCLUDING THE
    //POTENTIAL ONE JUST CLICKED.
    //IGNORE THE BIN PANEL.
    //THROUGH EACH ITERATION OF THE PATH HAVE THE STRUCUTRE ITERATE DOWN
    //AS WELL.
    //IF THE PANEL EXISTS IN THE KEYS AT A LEVEL, CLOSE THE REST OF THE
    //OPEN PANELS
    for (let panel of this.panels.slice(1).concat([this.show])) {
      if (level.hasOwnProperty(panel) || addtoOff) {
        addtoOff = true;
        if (panel != "") {
          toTurnOff.push(panel);
        }
      } else {
        if (panel != "") {
          newPanels.push(panel);
        }
      }
      level = level[panel];
    }
    //TURN OFF THE PANELS THROUGH CSS THAT NEED TO BE TURNED OFF
    for (let turnoff of toTurnOff) {
      document.getElementById("buttonContainer" + turnoff).style.borderLeft =
        "4px solid white";
      document.getElementById(
        "buttonContainer" + turnoff
      ).style.backgroundColor = "white";
    }

    //ADD TO PANEL OR SHOW THE SELECTION FORM
    if (this.pullNavigationElement[att]["IsAttribute"] == true) {
      this.show = att;
    } else {
      newPanels.push(att);
      this.show = "";
    }
    //RECONSTRUCT THE PANELS THROUGH ADDING THE BIN PANEL BACK AT THE BEGINNING
    this.panels = [first].concat(newPanels);
    this.reversePaths[this.level1Selected][att] = cloneDeep(this.panels);

    //DONT SET THE NEW PANEL TO NEW PANEL NECESSARILY BUT CHANGE CSS TO SELECTED
    if (document.getElementById("selectKey" + att)) {
      document.getElementById("buttonContainer" + att).style.backgroundColor =
        "#f2f2f2";
      document.getElementById("buttonContainer" + att).style.borderLeft =
        "4px solid lightskyblue";
    }
  }

  //Thisfunction creates and stores the RD URL
  createRDURL(id: any) {
    var newURL = this.views[id];
    this.viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(newURL);
  }

  //THIS FUNCTION UPDATES THE
  //RD URL ON CLUB CHANGE
  //#SNEAKY METHOD
  updateRDURL() {
    var old = cloneDeep(this.viewingURL);
    this.viewingURL = "";
    this.viewingURL = old;
  }

  constructor(
    public sanitizer: DomSanitizer,
    public pullData: PullDataService,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router
  ) {}
}
