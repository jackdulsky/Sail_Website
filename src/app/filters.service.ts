import { Injectable } from "@angular/core";
import { Observable, of, BehaviorSubject } from "rxjs";
import { PullDataService } from "./pull-data.service";
import { filter } from "minimatch";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { NonNullAssert, ThrowStmt } from "@angular/compiler";
import { colours } from "./allReports";
import {
  DomSanitizer,
  SafeUrl,
  ɵELEMENT_PROBE_PROVIDERS__POST_R3__
} from "@angular/platform-browser";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { ReplaceSource } from "webpack-sources";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { KeyValue } from "@angular/common";
import { jsonpFactory } from "@angular/http/src/http_module";

@Injectable({
  providedIn: "root"
})
export class FiltersService {
  bulkImported = false;

  tryingToSendDBFormat;
  tryingToSetPlayersTime;

  FIDBID: { [FID: string]: string } = {};
  FIDs: { [FID: string]: {} } = {};
  DBFormat: { [bid: string]: {} } = {};

  workingQuery = {};
  workingFID = {};
  FIDCreationOrder = {};

  show: string = "";
  panels: string[] = [];
  selectingAttributes: string[] = [];
  filterBinSelected;
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
  pullPlayers;
  teams;
  teamsMap;
  playLock;
  clubData;
  playerData;
  reportTabs;
  reportTabLocation;
  reportReportsStructure;
  reportReportsOnly;
  reportURL;
  sub: any;
  positionHierarchy;
  positionHItem;
  clubSpecifics;
  playerSpecifics;
  faHypo;
  faHypoBins;
  faHypoScenarios;
  ufaBorad;
  OrderID = "OrderID";
  conferenceSelected = "AFC";
  conferenceSelectedDEF = "AFC";
  conferenceSelections = { "2": "AFC", "400": "AFC" };
  playCount = "0";
  filterID: string = null;
  filterName: string = "";
  namePresent: boolean = false;
  modified: boolean = false;
  teamPortalActiveClubID = "1012";
  teamPortalSelected = {
    SailTeamID: "1012",
    TeamCode: "LV",
    Conference: "AFC",
    Division: "West",
    ClubCityName: "NFL",
    ClubNickName: ""
  };
  playerPortalSelected = {
    Label: "Player Select"
  };
  playerPortalActivePlayerID = "";
  playerPortalActivePlayerIDOLD = "";
  colours = colours;

  Label = "Label";
  selected: string;
  portalSelected = "";

  viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
    "http://oakcmsreports01.raiders.com/"
  );

  portalYearsSelected: String[] = [];
  portalYearsList = [
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
    "2012",
    "2011"
  ];
  portalYearsOnly: String[] = ["2019"];
  portalYearUpdated = false;
  fullScreenMode = false;
  clickedReport = false;
  displayPlayers = {};
  playersToDisplay: any[] = [];

  globalSearchShowSuggestions = false;
  playerImageURLs = {};
  temp: any = {};
  form = this.fb.group({});
  formCash = this.fb.group({});
  fidCashMap = {};
  fidCashMapFIDtoID = {};
  menuOpen = false;
  timeLastSent = new BehaviorSubject<string>("");
  timeLastUFAPull = new BehaviorSubject<string>("");
  //   "OPTION 1":
  //     "http://oakcmsreports01.raiders.com:88/loading/94A6AFBD-7FAD-8F71-AD16-34930D667AC4/%5B%5B%22-2%22,%222%22,%5B%221024%22,%221026%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/club,report,46",
  //   "OPTION 2":
  //     "oakcmsreports01.raiders.com:88/loading/94A6AFBD-7FAD-8F71-AD16-34930D667AC4/%5B%5B%22-2%22,%222%22,%5B%221024%22,%221026%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/club,report,46",
  //   "OPTION 3":
  //     "/loading/94A6AFBD-7FAD-8F71-AD16-34930D667AC4/%5B%5B%22-2%22,%222%22,%5B%221024%22,%221026%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/club,report,46",
  //   "OPTION 4":
  //     "/loading/94A6AFBD-7FAD-8F71-AD16-34930D667AC4/%5B%5B%22-2%22,%222%22,%5B%221024%22,%221026%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/club,report,46"
  // };
  constructor(
    public sanitizer: DomSanitizer,
    public pullData: PullDataService,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router
  ) {}
  //This function returns the list of reports based on the location id
  getReportHeaders(location: any) {
    var tabs;
    try {
      tabs = Object.assign(
        {},
        ...Object.entries(this.reportTabs)
          .filter(([k, v]) => v["LocationID"] == location)
          .map(([k, v]) => ({ [k]: v }))
      );
    } catch (e) {}
    return tabs;
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

  //extract key value to create mapping instead of array of dictionary
  extractkeyValue(data, key: string, value: string, insertDict) {
    for (let b in data) {
      var id = String(data[b][key]);
      var val = String(data[b][value]);
      if (value == "PlayerImageUrl" && val == "null") {
        val =
          "https://sail-bucket.s3-us-west-2.amazonaws.com/Player_Images/Blank_Player4.png";
      }
      if (val == "null") {
        val = null;
      }
      insertDict[id] = val;
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

  hierarchyTableToMap(data, idCol, parentCol) {
    var tempMap = {};
    for (let row in data) {
      if (!tempMap[data[row][parentCol]]) {
        tempMap[data[row][parentCol]] = [data[row][idCol]];
      } else {
        tempMap[data[row][parentCol]].push(data[row][idCol]);
      }
      // tempMap[data[row][parentCol]][data[row][idCol]] = data[row];
    }
    return tempMap;
  }

  //return players to be displayed limit 15
  getPlayers(players: any) {
    // var returnPlayers = {};
    // var i = 0;
    // for (let player in players) {
    //   if (i == 15) {
    //     break;
    //   }
    //   returnPlayers[player] = players[player];
    //   i += 1;
    // }
    // return returnPlayers;

    return cloneDeep(this.playersToDisplay);
  }
  setPlayers(sendString: string = JSON.stringify(this.DBFormat)) {
    var curTime = cloneDeep(Date.now());
    this.tryingToSetPlayersTime = curTime;
    setTimeout(() => {
      console.log("LOOP 16");
      if (Date.now() - this.tryingToSetPlayersTime > 349) {
        this.pullData.pullPlayersToDisplay(sendString).subscribe(data => {
          var players = this.pullValueMap["3"];
          var arrPlayers = {};
          for (let row in data) {
            if (players[data[row]["SailID"]]) {
              arrPlayers[data[row]["SailID"]] = players[data[row]["SailID"]];
            }
          }
          for (let item in this.form.value["3"]) {
            if (players[item]) {
              arrPlayers[item] = players[item];
            }
          }
          for (let fid in this.DBFormat["-3"]) {
            if (this.DBFormat["-3"][fid][0].length != 0) {
              for (let explicit in this.DBFormat["-3"][fid][0]) {
                if (players[Number(this.DBFormat["-3"][fid][0][explicit])]) {
                  arrPlayers[Number(this.DBFormat["-3"][fid][0][explicit])] =
                    players[Number(this.DBFormat["-3"][fid][0][explicit])];
                }
              }
            }
          }
          this.playersToDisplay = cloneDeep(arrPlayers);
        });
      }
    }, 350);
  }
  //addd keys to From
  initForm(structure: any) {
    structure.forEach(element => {
      this.form.addControl(element, new FormControl());
      this.form.addControl(element + "search", new FormControl());
    });
  }

  //THIS IS THE FUNCTION CALLED BY THE TOP BAR RENDER TO IMPORT ALL THE DATA ON WEBSITE START UP
  getBulkImport() {
    if (!this.bulkImported) {
      ////console.log("IMPORT BULK");

      this.pullData.setGUID();
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
        // console.log("PULLStructure", this.pullStructure);
        // console.log(
        //   "component.filterService.pullStructure = " +
        //     JSON.stringify(this.pullStructure, function(k, v) {
        //       return v === undefined ? null : v;
        //     }) +
        //     ";"
        // );
        // console.log("FORM", this.form);
        // console.log(
        //   "component.filterService.form = " + JSON.stringify(this.form) + ";"
        // );
      });
      this.pullData.pullDataType().subscribe(data => {
        this.pullDataType = {};
        this.extractID(data, "DataTypeID", this.pullDataType);
        // console.log(
        //   "component.filterService.pullDataType = " +
        //     JSON.stringify(this.pullDataType) +
        //     ";"
        // );
      });
      this.pullData.pullPlayers().subscribe(data => {
        this.pullPlayers = {};
        this.extractID(data, "SailID", this.pullPlayers);
        //console.log("PLAYERS", this.pullPlayers);
        // console.log(
        //   "component.filterService.pullPlayers = " +
        //     JSON.stringify(this.pullPlayers) +
        //     ";"
        // );
      });
      this.pullData.pullBin().subscribe(data => {
        this.pullBin = {};
        this.extractID(data, "BinID", this.pullBin);
        for (let binKey in this.pullBin) {
          this.workingQuery[binKey] = {};

          this.workingFID[binKey] = "";
          this.FIDCreationOrder[binKey] = [];
        }
        //console.log("BIN", this.pullBin);
        // console.log(
        //   "component.filterService.pullBin = " +
        //     JSON.stringify(this.pullBin) +
        //     ";"
        // );
      });
      this.pullData.pullNavigation().subscribe(data => {
        this.pullNavigation = {};
        this.extractID(data, "ItemID", this.pullNavigation);
        // console.log("NAV", this.pullNavigation);
        // console.log(
        //   "component.filterService.pullNavigation = " +
        //     JSON.stringify(this.pullNavigation) +
        //     ";"
        // );
      });
      this.pullData.pullPlayerURL().subscribe(data => {
        this.extractkeyValue(
          data,
          "SailID",
          "PlayerImageUrl",
          this.playerImageURLs
        );
        // console.log(
        //   "component.filterService.playerImageURLs = " +
        //     JSON.stringify(this.playerImageURLs) +
        //     ";"
        // );
      });
      this.pullData.pullNavigationElement().subscribe(data => {
        this.pullNavigationElement = {};
        this.extractID(data, "ItemID", this.pullNavigationElement);
        // console.log(
        //   "component.filterService.pullNavigationElement = " +
        //     JSON.stringify(this.pullNavigationElement) +
        //     ";"
        // );
        // console.log("NAVELEM", this.pullNavigationElement);
      });
      this.pullData.pullAttributeType().subscribe(data => {
        this.pullAttributeType = {};
        this.extractID(data, "AttributeTypeID", this.pullAttributeType);
        //console.log("ATT TYPE", this.pullAttributeType);
        // console.log(
        //   "component.filterService.pullAttributeType = " +
        //     JSON.stringify(this.pullAttributeType) +
        //     ";"
        // );
      });
      this.pullData.pullAttribute().subscribe(data => {
        this.pullAttribute = {};
        this.extractID(data, "AttributeID", this.pullAttribute);
        // console.log("PULLATTRIBUTE", this.pullAttribute);
        // console.log(
        //   "component.filterService.pullAttribute = " +
        //     JSON.stringify(this.pullAttribute) +
        //     ";"
        // );
      });
      this.pullData.pullUIType().subscribe(data => {
        this.pullUIType = {};
        this.extractID(data, "UITypeID", this.pullUIType);
        //console.log("PULL UI TYPE", this.pullUIType);
        // console.log(
        //   "component.filterService.pullUIType = " +
        //     JSON.stringify(this.pullUIType) +
        //     ";"
        // );
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
        // console.log("PULLValueMap", this.pullValueMap);
        ////console.log("PULL ORDER MAP", this.pullOrderMap);
        // console.log(
        //   "component.filterService.pullValueMap = " +
        //     JSON.stringify(this.pullValueMap) +
        //     ";"
        // );
        // console.log(
        //   "component.filterService.pullOrderMap = " +
        //     JSON.stringify(this.pullOrderMap) +
        //     ";"
        // );
      });
      this.pullData.getTeams().subscribe(data => {
        this.teams = cloneDeep(data);
        this.teamsMap = {};
        this.extractID(data, "SailTeamID", this.teamsMap, 1);
        // console.log(
        //   "component.filterService.teamsMap = " +
        //     JSON.stringify(this.teamsMap) +
        //     ";"
        // );
        // console.log(
        //   "component.filterService.teams = " + JSON.stringify(this.teams) + ";"
        // );
      });
      this.pullData.pullReportTabs().subscribe(data => {
        this.reportTabs = {};
        this.extractID(data, "TabID", this.reportTabs);
        //  console.log("Pull Tabs", this.reportTabs);
        // console.log(
        //   "component.filterService.reportTabs = " +
        //     JSON.stringify(this.reportTabs) +
        //     ";"
        // );
      });
      this.pullData.pullReportTabLocation().subscribe(data => {
        this.reportTabLocation = {};
        this.extractID(data, "LocationID", this.reportTabLocation);
        // console.log("Pull TabLocations", this.reportTabLocation);
        // console.log(
        //   "component.filterService.reportTabLocation = " +
        //     JSON.stringify(this.reportTabLocation) +
        //     ";"
        // );
      });
      this.pullData.pullReports().subscribe(data => {
        var tempReports = {};
        this.reportReportsStructure = {};
        this.extractID(data, "ViewID", tempReports);
        for (let report in tempReports) {
          if (!this.reportReportsStructure[tempReports[report]["TabID"]]) {
            this.reportReportsStructure[tempReports[report]["TabID"]] = {};
          }
          this.reportReportsStructure[tempReports[report]["TabID"]][report] =
            tempReports[report];
        }
        this.reportReportsOnly = cloneDeep(tempReports);

        // console.log("Pull ReportsOnly", this.reportReportsOnly);
        //  console.log("Pull Reports", this.reportReportsStructure);
        // console.log(
        //   "component.filterService.reportReportsOnly = " +
        //     JSON.stringify(this.reportReportsOnly) +
        //     ";"
        // );
        // console.log(
        //   "component.filterService.reportReportsStructure = " +
        //     JSON.stringify(this.reportReportsStructure) +
        //     ";"
        // );
      });
      this.pullData.pullReportURL().subscribe(data => {
        this.reportURL = {};
        this.extractID(data, "ViewID", this.reportURL);
        //console.log("REPORT URL", this.reportURL);
        // console.log(
        //   "component.filterService.reportURL = " +
        //     JSON.stringify(this.reportURL) +
        //     ";"
        // );
      });

      this.pullData.pullPositionHierarchy().subscribe(data => {
        this.positionHierarchy = {};
        this.positionHItem = {};
        this.positionHierarchy = this.hierarchyTableToMap(
          cloneDeep(data),
          "FilterPosID",
          "ParentPosID"
        );
        this.extractID(data, "FilterPosID", this.positionHItem);
        this.positionHItem[102] = {
          PosName: "Offense",
          PosAbbr: "OFF",
          OrderID: -3,
          FilterPosID: 102,
          ParentPosID: 0
        };
        this.positionHItem[101] = {
          PosName: "Defense",
          PosAbbr: "DEF",
          OrderID: -2,
          FilterPosID: 101,
          ParentPosID: 0
        };
        this.positionHItem[103] = {
          PosName: "Specials",
          PosAbbr: "ST",
          OrderID: -1,
          FilterPosID: 103,
          ParentPosID: 0
        };
        this.positionHItem[0] = {
          PosName: "Position",
          PosAbbr: "Pos",
          OrderID: 0,
          FilterPosID: 0,
          ParentPosID: null
        };
        this.positionHierarchy[0] = [101, 102, 103];

        // console.log("POS ITEMS", this.positionHItem);
        // console.log("POS HIERARCHY", this.positionHierarchy);
        // console.log(
        //   "component.filterService.positionHItem = " +
        //     JSON.stringify(this.positionHItem) +
        //     ";"
        // );
        // console.log(
        //   "component.filterService.positionHierarchy = " +
        //     JSON.stringify(this.positionHierarchy) +
        //     ";"
        // );
      });

      this.pullData.pullHypoPlayers().subscribe(data => {
        this.faHypo = data;

        // console.log("FA HYPO PLAYERS", this.faHypo);
      });
      this.pullHypoScenario();
      this.pullData.pullHypoBins().subscribe(data => {
        this.faHypoBins = data;
        // console.log("FA HYPO Bins", this.faHypoBins);
      });
    }
    this.bulkImported = true;
    return true;
  }

  //pull the scenarios
  pullHypoScenario() {
    this.pullData.pullHypoMaxScenario().subscribe(data => {
      this.faHypoScenarios = data;
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
  saveFilter(name: string, description: string) {
    if (Object.keys(this.DBFormat).length > 0) {
      this.pullData
        .saveFilter(name, this.DBFormat, this.filterID, description)
        .subscribe(data => {
          console.log("SAVED!");
        });
      // this.setID(newID);
      // console.log("OUTPUT", newID);
    }
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
        //console.log(error);
      }
    });
  }

  //TURN NUMBER TO STRING FOR HTML WORKAROUND
  turnString(item: any) {
    return String(item);
  }

  //DELETE A QUERY BASED ON FID
  removeQuery(fid: string) {
    var oldBID = this.FIDBID[fid];

    if (Object.keys(this.fidCashMapFIDtoID).indexOf(fid) != -1) {
      var id = this.fidCashMapFIDtoID[fid];
      this.formCash.controls[id].setValue(null);
    }

    for (let id in this.FIDs[fid]) {
      this.clearSingleIDWorking(id, this.FIDBID[fid]);
    }
    delete this.DBFormat[oldBID][fid];

    delete this.FIDBID[fid];
    delete this.FIDs[fid];
    if (JSON.stringify(this.DBFormat[oldBID]) == "{}") {
      delete this.DBFormat[oldBID];
    }
    if (this.workingFID[oldBID]) {
      this.workingFID[oldBID] = {};
    }
    this.saveAndSend();
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
      delete this.workingQuery[bid][formKey];
      this.form.controls[formKey].setValue(null);

      if (this.workingFID[bid] != "") {
        this.pushBIDActiveFIDToActiveFilter(bid, false);
      }

      if (Object.keys(this.workingQuery[bid]).length == 0) {
        delete this.FIDs[this.workingFID[bid]];
        this.workingFID[bid] = "";
      }
    } else {
      if (String(formKey) == "3" && String(bid) == "-3") {
        this.playerPortalActivePlayerIDOLD = this.playerPortalActivePlayerID;
        this.playerPortalActivePlayerID = formVals[0];
        this.playerPortalSelected = this.pullValueMap["3"][
          this.playerPortalActivePlayerID
        ];
      }
      this.workingQuery[bid][formKey] = formVals;
    }
    if (Number(formKey) > 14 || Number(formKey) == 2) {
      this.setPlayers(this.combinedJSONstring());
    }
  }
  //DELETING A SINGLE SELECTION ON THE FILTERS POP PAGE
  //REMOVE FROM THE WORKING QUERY AND
  clearSingleIDWorking(id: string, BID: string, input: boolean = true) {
    delete this.workingQuery[BID][id];

    if (this.workingFID[BID] != "") {
      this.pushQueryToActiveFilter(BID, input);
    }
    if (this.form.value[String(id) + "search"] != null) {
      this.form.controls[String(id) + "search"].setValue(null);
    }
    this.form.controls[id].setValue(null);
    if (Number(id) > 14 || Number(id) == 2) {
      this.setPlayers(this.combinedJSONstring());
    }
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
    if (JSON.stringify(this.workingFID) == "{}") {
      setTimeout(() => {
        this.pushQueryToActiveFilter(BID, clearWorking);
      }, 100);
    } else {
      var oldDB = cloneDeep(this.DBFormat);
      if (this.router.url.includes("club/")) {
        this.reduceFiltersSingleClub();
      }
      if (
        this.router.url.includes("player/") &&
        this.playerPortalActivePlayerID != ""
      ) {
        this.reduceFiltersSinglePlayer();
      }

      for (let bin in this.workingQuery) {
        //PUSH EMPTY PERFORM DELETES
        if (Object.keys(this.workingQuery[bin]).length == 0) {
          if (this.workingFID[bin] != "") {
            delete this.FIDs[this.workingFID[bin]];
            delete this.FIDBID[this.workingFID[bin]];
            delete this.DBFormat[bin][this.workingFID[bin]];
            this.workingFID[bin] = "";
          }
          continue;
        }

        //DO NOT DOUBLE PUT IN ITEMS

        for (let key in this.FIDs) {
          if (
            this.isEqualObjectsContents(this.FIDs[key], this.workingQuery[bin])
          ) {
            continue;
          }
        }

        //SET FID TO CURRENT OR GENERATE NEW ONE
        var newFIDNumber;

        if (this.workingFID[bin].length >= 1) {
          newFIDNumber = cloneDeep(this.workingFID[bin]);
        } else {
          newFIDNumber = String(Math.floor(Math.random() * 1000));
          this.FIDCreationOrder[bin] = this.FIDCreationOrder[bin].concat([
            newFIDNumber
          ]);
        }
        //PUT THE WORKING QUERY IN NEW FIDs
        var pkID = [];
        this.FIDs[newFIDNumber] = Object.assign(
          {},
          cloneDeep(this.workingQuery[bin])
        );

        var att = cloneDeep(this.workingQuery[bin]);
        //PULL OUT THE PKIDS AND PUT INTO THE FORM TO SEND UP TO THE DATA BASE
        if (att[String(Number(bin) * -1)]) {
          pkID = cloneDeep(att[String(Number(bin) * -1)]);
          delete att[String(Number(bin) * -1)];
        }

        var FID = [];

        //INIT THE NEW DB FORMAT BEFORE ADDING
        this.FIDBID[newFIDNumber] = bin;
        if (!this.DBFormat[bin]) {
          this.DBFormat[bin] = {};
        }
        this.DBFormat[bin][newFIDNumber] = [pkID, att, FID];
        //RESET
        if (clearWorking) {
          this.workingQuery[bin] = {};
          this.workingFID[bin] = "";
        }
      }
      //RESET
      if (clearWorking) {
        this.form.reset();
      }

      //SEND UP TO THE DB

      if (!this.checkDBFormats(oldDB, cloneDeep(this.DBFormat))) {
        this.saveAndSend();

        this.updateRDURL();
      }
    }
  }

  pushBIDActiveFIDToActiveFilter(BID: string, clearWorking: boolean = true) {
    var oldDB = cloneDeep(this.DBFormat);
    if (this.router.url.includes("club/")) {
      this.reduceFiltersSingleClub();
    }

    if (
      this.router.url.includes("player/") &&
      this.playerPortalActivePlayerID != ""
    ) {
      this.reduceFiltersSinglePlayer();
    }
    var bin = BID;
    //PUSH EMPTY PERFORM DELETES
    if (Object.keys(this.workingQuery[bin]).length == 0) {
      if (this.workingFID[bin] != "") {
        delete this.FIDs[this.workingFID[bin]];
        delete this.FIDBID[this.workingFID[bin]];
        delete this.DBFormat[bin][this.workingFID[bin]];
        this.workingFID[bin] = "";
      }
    } else {
      //DO NOT DOUBLE PUT IN ITEMS

      for (let key in this.FIDs) {
        if (
          this.isEqualObjectsContents(this.FIDs[key], this.workingQuery[bin])
        ) {
          continue;
        }
      }

      //SET FID TO CURRENT OR GENERATE NEW ONE
      var newFIDNumber;
      if (this.workingFID[bin] != "") {
        newFIDNumber = cloneDeep(this.workingFID[bin]);
      } else {
        newFIDNumber = String(Math.floor(Math.random() * 1000));
        this.FIDCreationOrder[bin] = this.FIDCreationOrder[bin].concat([
          newFIDNumber
        ]);
      }
      //PUT THE WORKING QUERY IN NEW FIDs
      var pkID = [];
      this.FIDs[newFIDNumber] = Object.assign(
        {},
        cloneDeep(this.workingQuery[bin])
      );
      var att = cloneDeep(this.workingQuery[bin]);
      //PULL OUT THE PKIDS AND PUT INTO THE FORM TO SEND UP TO THE DATA BASE
      if (att[String(Number(bin) * -1)]) {
        pkID = cloneDeep(att[String(Number(bin) * -1)]);
        delete att[String(Number(bin) * -1)];
      }

      var FID = [];

      //INIT THE NEW DB FORMAT BEFORE ADDING

      this.FIDBID[newFIDNumber] = bin;
      if (!this.DBFormat[bin]) {
        this.DBFormat[bin] = {};
      }
      this.DBFormat[bin][newFIDNumber] = [pkID, att, FID];
    }
    //RESET
    if (clearWorking) {
      this.workingQuery[bin] = {};
      this.workingFID[bin] = "";
    }

    //RESET
    if (clearWorking) {
      this.form.reset();
    }

    //SEND UP TO THE DB

    if (!this.checkDBFormats(oldDB, cloneDeep(this.DBFormat))) {
      this.saveAndSend();
      this.updateRDURL();
    }
  }

  //CREATE THE FAKE JSON DB FORMAT AS IS PUSH QUERY
  //HAS OCCURED TO SEND TO DATABASE WITH STAGED CHANGES
  combinedJSONstring() {
    var combinedDB = cloneDeep(this.DBFormat);
    for (let bin in this.workingQuery) {
      //PUSH EMPTY PERFORM DELETES
      if (Object.keys(this.workingQuery[bin]).length == 0) {
        continue;
      }

      //DO NOT DOUBLE PUT IN ITEMS

      for (let key in this.FIDs) {
        if (
          this.isEqualObjectsContents(this.FIDs[key], this.workingQuery[bin])
        ) {
          continue;
        }
      }

      //SET FID TO CURRENT OR GENERATE NEW ONE
      var newFIDNumber;
      if (this.workingFID[bin] != "") {
        newFIDNumber = cloneDeep(this.workingFID[bin]);
      } else {
        newFIDNumber = String(Math.floor(Math.random() * 1000));
      }

      //PUT THE WORKING QUERY IN NEW FIDs
      var pkID = [];
      var att = cloneDeep(this.workingQuery[bin]);
      //PULL OUT THE PKIDS AND PUT INTO THE FORM TO SEND UP TO THE DATA BASE
      if (att[String(Number(bin) * -1)]) {
        pkID = cloneDeep(att[String(Number(bin) * -1)]);
        delete att[String(Number(bin) * -1)];
      }

      var FID = [];

      //INIT THE NEW DB FORMAT BEFORE ADDING
      if (!this.DBFormat[bin]) {
        combinedDB[bin] = {};
      }

      //add
      combinedDB[bin][newFIDNumber] = [pkID, att, FID];
    }
    return JSON.stringify(combinedDB);

    //SEND TO UPDATE PLAYER LIST
  }

  //SAVE LOCAL STORAGE FOR REFRESH AND THEN SEND THE FILTERS TO THE DB
  saveAndSend() {
    var dbFormatWithAddedHiddenYears = cloneDeep(this.DBFormat);
    //set the Order of FIDs by double checking against what is sent to DB

    if (
      this.pullStructure &&
      this.pullAttribute &&
      this.pullValueMap &&
      this.form
    ) {
      for (let bin in dbFormatWithAddedHiddenYears) {
        var activeFIDs = [];
        for (let fid in this.FIDCreationOrder[bin]) {
          if (
            Object.keys(dbFormatWithAddedHiddenYears[bin]).indexOf(
              this.FIDCreationOrder[bin][fid]
            ) != -1
          ) {
            activeFIDs = activeFIDs.concat([this.FIDCreationOrder[bin][fid]]);
          }
        }
        for (let fid in Object.keys(dbFormatWithAddedHiddenYears[bin])) {
          var activeFID = Object.keys(dbFormatWithAddedHiddenYears[bin])[fid];
          if (activeFIDs.indexOf(activeFID) == -1) {
            activeFIDs = activeFIDs.concat([activeFID]);
          }
        }
        this.FIDCreationOrder[bin] = activeFIDs;
      }

      //Add in the years
      if (this.portalYearsOnly.length > 0) {
        dbFormatWithAddedHiddenYears["-4"] = {
          "4": [this.portalYearsOnly, {}, []]
        };
      }
      this.tryingToSendDBFormat = JSON.stringify(dbFormatWithAddedHiddenYears);

      setTimeout(() => {
        console.log("LOOP 17");
        if (
          this.tryingToSendDBFormat ==
          JSON.stringify(dbFormatWithAddedHiddenYears)
        ) {
          this.pullData
            .constructAndSendFilters(dbFormatWithAddedHiddenYears)
            .subscribe(data => {
              this.timeLastSent.next(String(Date.now()));
              this.updatePlayerData();
              this.updateClubData();
              this.updateCashFilters();
            });
          this.testSendFilters2();
          this.setActiveClub();
          this.setActivePlayer();
          this.updateRDURL();
          setTimeout(() => {
            console.log("LOOP 12");
            this.setPlayers();
          }, 200);
        }
      }, 250);
    } else {
      setTimeout(() => {
        this.saveAndSend();
      }, 100);
    }
  }

  //Set parameters for the cash tab filers
  updateCashFilters() {
    for (let fid in this.DBFormat["-3"]) {
      for (let att in this.DBFormat["-3"][fid][1]) {
        if (Object.keys(this.fidCashMap).indexOf(att) != -1) {
          this.formCash.controls[att].setValue(
            cloneDeep(this.DBFormat["-3"][fid][1][att])
          );
          this.fidCashMapFIDtoID[cloneDeep(fid)] = cloneDeep(att);
          this.fidCashMap[cloneDeep(att)] = cloneDeep(fid);
        }
      }
    }
  }

  //CHECK IF TWO DB FORMAT's ARE THE SAME
  checkDBFormats(structure1: any, structure2: any) {
    if (Object.keys(structure1).length != Object.keys(structure2).length) {
      return false;
    }
    for (let bin in structure1) {
      var fids1 = Object.keys(structure1[bin]).sort();
      var fids2 = Object.keys(structure2[bin]).sort();
      if (fids1.length != fids2.length) {
        return false;
      }
      for (let i = 0; i <= fids2.length - 1; i++) {
        if (
          fids1[i] != fids2[i] ||
          JSON.stringify(structure1[bin][fids1[i]]) !=
            JSON.stringify(structure2[bin][fids2[i]])
        ) {
          return false;
        }
      }
    }
    return true;
  }

  //EMPTY THE WORKING QUERY
  clearWorking() {
    for (let bin in this.workingQuery) {
      for (let id in this.workingQuery[bin]) {
        this.clearSingleIDWorking(id, bin);
      }

      if (this.workingFID[bin] != "") {
        this.removeQuery(this.workingFID[bin]);
        this.workingFID[bin] = "";
      }
    }
  }
  //HARD RESET OF ALL VARIABLES CALLED FROM THE FILTER BAR
  clearAll() {
    for (let bin in this.workingQuery) {
      this.workingFID[bin] = "";
      this.workingQuery[bin] = {};
      this.FIDCreationOrder[bin] = [];
    }
    this.DBFormat = {};
    this.FIDs = {};
    this.FIDBID = {};

    this.form.reset();
    this.formCash.reset();

    this.saveAndSend();
  }

  //This function clears a single value from the newWorking query, if a
  //Working FID is set it pushes the updates
  clearSingleValuePop(bin: any, att: any, val: any, input: boolean = true) {
    if (
      JSON.stringify(this.workingQuery[bin][att]) ==
        JSON.stringify([String(val)]) ||
      JSON.stringify(this.workingQuery[bin][att]) ==
        JSON.stringify([val, null]) ||
      JSON.stringify(this.workingQuery[bin][att]) == JSON.stringify([null, val])
    ) {
      // ||
      // Number(this.pullAttribute[att]["UITypeID"]) == 8
      this.clearSingleIDWorking(att, bin, false);
    } else {
      this.workingQuery[bin][att] = this.workingQuery[bin][att].filter(
        x => x != String(val)
      );
      var oldValue = this.form.value[att];

      this.form.controls[att].setValue(oldValue.filter(x => x != String(val)));
      if (this.workingFID[bin] != "") {
        this.pushQueryToActiveFilter(bin, false);
      }
    }
    if (Number(att) > 14 || Number(att) == 2) {
      this.setPlayers(this.combinedJSONstring());
    }
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
    var id = this.pullValueMap[attID][value]["Label"];
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
  changeToggleValue(id: string, toLabel: any, remove: boolean, bin: string) {
    if (remove) {
      this.form.controls[id].setValue(null);
      this.type0change(id, [], bin);
    } else {
      this.form.controls[id].setValue([String(toLabel)]);
      this.type0change(id, [String(toLabel)], bin);
    }
  }

  //SLIDER RETURN STARTING POSITION OF THE SLIDER
  checkType3ToggleChecked(id: string, Label: any) {
    var switchType3 = document.getElementById("type3Switch" + id);
    if (switchType3 != null) {
      try {
        if (this.form.value[id] == null) {
          if (Label == "na") {
            switchType3.style.backgroundColor = "var(--raiders-gray)";
            return "checked";
          } else {
            return "";
          }
        }
        if (this.form.value[id][0] == String(Label)) {
          if (Number(Label) == 1) {
            switchType3.style.backgroundColor = "Green";
          } else {
            switchType3.style.backgroundColor = "Red";
          }
          return "checked";
        } else {
          return "";
        }
      } catch (e) {
        return "";
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 18", id, Label);
        return "";
      }, 50);
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
    var team = document.getElementById("teamGUI" + String(teamI["SailTeamID"]));
    var oldValue = this.form.value[attID];
    if (oldValue == null) {
      oldValue = [];
    }
    if (this.router.url.includes("club")) {
      for (let club of oldValue) {
        if (String(club) != String(teamI["SailTeamID"])) {
          try {
            var oldClub = document.getElementById("teamGUI" + String(club));
            oldClub.className = "singleTeamGUI ng-star-inserted";
          } catch (e) {}

          oldValue = oldValue.filter(x => x != club);
          this.form.controls[attID].setValue(oldValue);
        }
      }
    }

    if (team.className == "singleTeamGUI ng-star-inserted") {
      team.className = "singleTeamGUISelected ng-star-inserted";
      this.form.controls[attID].setValue(
        oldValue.concat([String(teamI["SailTeamID"])])
      );

      this.teamPortalActiveClubID = String(teamI["SailTeamID"]);
      this.teamPortalSelected = teamI;
    } else {
      team.className = "singleTeamGUI ng-star-inserted";
      this.form.controls[attID].setValue(
        oldValue.filter(x => x != String(teamI["SailTeamID"]))
      );
    }
    // if (this.form.value[attID].length == 0){
    //   this.removeExplicit(this.workingFID["-2"],"2");

    // }
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
    var styles = {};
    try {
      styles = {
        "background-color": conversions[BID][pos % 2],
        color: conversions[BID][(pos + 1) % 2],
        border: "1px solid " + conversions[BID][0]
      };
    } catch (e) {}
    return styles;
  }

  //PANEL SECTION FOR FILTERPOP

  //ALTER THE SELECTION VIEW OF TEH WORKING QUERY BASED ON THE
  //TIER 1 TAB THAT WAS SELECTED
  changelevel2(id: string) {
    //CHANGE OLD CSS
    try {
      var old = document.getElementById("tier1Tab" + this.filterBinSelected);
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
    } catch (e) {}

    //SET THE LEVEL SELECTED
    this.filterBinSelected = id;

    // SET PANELS

    this.panels = [cloneDeep(id)];
    this.show = "";
    this.selectingAttributes = [null];

    // this.selectingAttributes = [];

    //CHANGE NEW CSS
    try {
      var newTab = document.getElementById("tier1Tab" + id);
      // newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    } catch (e) {}
    this.attributeSelected(String(Number(id) * -100));
  }

  //THIS OPENS UP NEW PANELS AND CONTROLS CLOSING OLD ONES UPON A CLICK
  attributeSelected(att: string) {
    var newPanels = [];

    var first = cloneDeep(this.panels[0]);
    var level = cloneDeep(this.pullStructure[first]);
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
      if (level.hasOwnProperty(att) || addtoOff) {
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
    }

    //ADD TO PANEL OR SHOW THE SELECTION FORM

    if (this.pullNavigationElement[att]["IsAttribute"] == true) {
      //console.log("ATTRIBUTE IS IN THE PANELS THIS SHOULD NEVER OCCUR");
    } else {
      var old = cloneDeep(newPanels);
      newPanels.push(att);
      this.show = att;

      this.selectingAttributes = Object.keys(
        this.getPanelOptions(att, [first].concat(newPanels))
      ).filter(x => this.pullNavigationElement[x]["IsAttribute"]);

      if (
        JSON.stringify(this.getPanelOptions(att, [first].concat(newPanels))) ==
        "{}"
      ) {
        newPanels = old;
      }
    }

    //RECONSTRUCT THE PANELS THROUGH ADDING THE BIN PANEL BACK AT THE BEGINNING
    if (
      JSON.stringify([first].concat(newPanels)) != JSON.stringify(this.panels)
    ) {
      this.panels = [cloneDeep(first)].concat(cloneDeep(newPanels));
    }
  }

  //This function navigates the panels and displays where the
  //Attribute was selected from if its clicked on the right area
  navigateToAttribute(bin: any, att: any) {
    this.changelevel2(bin);
    this.show = String(this.pullNavigation[att]["ParentItemID"]);
    var newPanels = [];
    var atRoot = false;
    var startAtt = att;
    while (!atRoot) {
      var adding = this.pullNavigation[startAtt]["ParentItemID"];
      newPanels.push(String(adding));
      if (Number(adding) <= 0) {
        atRoot = true;
      }
      startAtt = adding;
    }

    this.selectingAttributes = Object.keys(
      this.getPanelOptions(newPanels[0], cloneDeep(newPanels).reverse())
    ).filter(x => this.pullNavigationElement[x]["IsAttribute"]);

    if (
      JSON.stringify(
        this.getPanelOptions(newPanels[0], cloneDeep(newPanels).reverse())
      ) == "{}"
    ) {
      newPanels = newPanels.slice(1);
    }
    this.panels = cloneDeep(newPanels.reverse());
  }

  //GET COLOR FOR PANELS
  buttonContainerColor(id: any) {
    if (this.panels.concat([String(this.show)]).indexOf(String(id)) != -1) {
      return {
        borderLeft: "4px solid lightskyblue"
      };
    } else {
      return { borderLeft: "4px solid white" };
    }
  }

  //GET PANEL OPTIONS OF THE PANEL INPUT
  getPanelOptions(att: string, p: any = this.panels) {
    var disp = this.pullStructure;
    for (let level of p.slice(0, -1)) {
      level = cloneDeep(level);
      if (level == att) {
        break;
      }
      disp = cloneDeep(disp[level]);
    }
    disp = cloneDeep(disp[att]);
    return disp;
  }

  //Thisfunction creates and stores the RD URL
  createRDURL(id: any, count: any = 0) {
    this.viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      "http://oakcmsreports01.raiders.com/"
    );

    if (this.reportURL) {
      //If Report is an excel file:
      //add this to the end of it
      var excelEnding =
        "&action=embedview&wdAllowInteractivity=True&wdbipreview=True&wdDownloadButton=True";
      try {
        var baseURL = this.reportURL[id]["ViewURL"];
        this.viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
          baseURL.replace("[GUID]", this.pullData.GUID.toUpperCase())
        );
        return cloneDeep(this.viewingURL);
      } catch (e) {}
    } else {
      if (count <= 5) {
        setTimeout(() => {
          console.log("LOOP 13");
          return this.createRDURL(id, count + 1);
        }, 150);
      }
    }
  }

  //THIS FUNCTION UPDATES THE
  //RD URL ON CLUB CHANGE
  //
  updateRDURL() {
    var old = cloneDeep(this.viewingURL);
    this.viewingURL = "";
    this.viewingURL = old;
  }

  //convert the db format variable to the other ones for display
  //SET THE ACTIVE PORTAL VARIABLES AND EXTRACT OUT THE HIDDEN YEARS
  pushDBFormat(DBFormat: any) {
    this.clearAll();
    this.DBFormat = cloneDeep(DBFormat);
    if (JSON.stringify(DBFormat) == JSON.stringify({})) {
      this.saveAndSend();
      return;
    }
    if (!this.teamsMap || !this.pullValueMap || !this.pullAttribute) {
      setTimeout(() => {
        console.log("LOOP 14");
        this.pushDBFormat(DBFormat);
      }, 200);
    } else {
      for (let bin in this.DBFormat) {
        for (let fid in this.DBFormat[bin]) {
          if (Number(bin) == -4) {
            this.portalYearsSelected = cloneDeep(this.DBFormat[bin][fid][0]);
            this.portalYearsOnly = cloneDeep(this.DBFormat[bin][fid][0]);
            delete this.DBFormat[bin];
          } else {
            var currentFid = cloneDeep(this.DBFormat[bin][fid][1]);
            this.FIDBID[fid] = bin;
            this.FIDCreationOrder[bin] = this.FIDCreationOrder[bin].concat([
              fid
            ]);
            if (this.DBFormat[bin][fid][0].length > 0) {
              currentFid[String(-1 * Number(bin))] = this.DBFormat[bin][fid][0];
              if (String(bin) == "-2") {
                this.teamPortalActiveClubID = cloneDeep(
                  this.DBFormat[bin][fid][0][0]
                );

                this.teamPortalSelected = this.teamsMap[
                  this.teamPortalActiveClubID
                ];
              }
              if (String(bin) == "-3") {
                this.playerPortalActivePlayerID = cloneDeep(
                  this.DBFormat[bin][fid][0][0]
                );
                this.playerPortalSelected = this.pullValueMap["3"][
                  this.playerPortalActivePlayerID
                ];
              }
            }

            this.FIDs[fid] = currentFid;
          }
        }
      }

      try {
        this.sub = this.route.params.subscribe(params => {
          if (this.reportReportsOnly && this.reportReportsStructure) {
            this.updateRDURL();
          } else {
            setTimeout(() => {
              console.log("LOOP 15");
              this.updateRDURL();
            }, 500);
          }
        });
      } catch (e) {}

      this.saveAndSend();
    }
  }

  //THIS FUNCTION WILL TAKE IN A JSON OF:
  //[BIN, ATT ID, [VALUES]]
  //removes content of a bin if a filter is being added
  //removes filter content if the value is empty ex. ["-11","10092",[]]
  loadJSON(filters: any) {
    //[["-2","2",["1024","1026"]],["-11","10092",["10000001"]]]
    var tempDict = {};

    for (let add of filters) {
      //check against current bins
      if (!tempDict[add[0]]) {
        tempDict[add[0]] = {};
      }
      for (let active in this.FIDBID) {
        //check if the bin is the same
        if (String(this.FIDBID[active]) == String(add[0])) {
          if (this.FIDs[active][add[1]]) {
            if (Number(add[1]) * -1 == Number(add[0])) {
              this.removeExplicit(active, add[0]);
            } else {
              this.removeAttributes(active, add[0], [add[1]]);
            }
          }

          // check if attribute
          // this.removeQuery(active);
        }
      }
      if (Number(add[0]) == -4) {
        this.portalYearsSelected = cloneDeep(add[2]);
        this.portalYearsOnly = cloneDeep(add[2]);
      } else {
        if (JSON.stringify(add[2]) != "[]") {
          tempDict[add[0]][add[1]] = add[2];
          this.workingQuery[add[0]] = tempDict[add[0]];
        }
      }
    }

    this.pushQueryToActiveFilter("0");
    return true;
  }

  //CLEAN Up filters for single club
  //go through active filters and delete if in club bin and replace with last selected club
  reduceFiltersSingleClub() {
    var tempDict = {};
    if (this.workingQuery["-2"]) {
      tempDict = cloneDeep(this.workingQuery["-2"]);
    }

    tempDict["2"] = [cloneDeep(this.teamPortalActiveClubID)];
    var add = this.removeExplicitFilters("-2", this.teamPortalActiveClubID);
    console.log("HERE 2");
    if (add) {
      console.log("HERE 3");
      this.workingQuery["-2"] = tempDict;
      console.log();
    }
  }

  //WHEN CLICKING ON PLAYER PAGE TAKE OUT ALL OTHER PLAYERS
  reduceFiltersSinglePlayer() {
    var tempDict = {};
    if (this.workingQuery["-3"]) {
      tempDict = cloneDeep(this.workingQuery["-3"]);
    }
    tempDict["3"] = [cloneDeep(this.playerPortalActivePlayerID)];
    var add = this.removeExplicitFilters("-3", this.playerPortalActivePlayerID);

    if (add) {
      this.workingQuery["-3"] = tempDict;
    }
  }

  //REMOVE AN EXPLICIT BASED ON THE INPUT BIN
  removeExplicitFilters(bin: any, keepExplicit: any) {
    if (!this.DBFormat[bin]) {
      return true;
    }
    var returnBool = true;
    var alteredDBFormat = cloneDeep(this.DBFormat);
    for (let fid in alteredDBFormat[bin]) {
      var explicits = cloneDeep(alteredDBFormat[bin][fid][0]);
      if (explicits.indexOf(keepExplicit) != -1) {
        alteredDBFormat[bin][fid][0] = [cloneDeep(keepExplicit)];
        returnBool = false;
      } else {
        alteredDBFormat[bin][fid][0] = [];
        if (
          JSON.stringify(alteredDBFormat[bin][fid]) ==
          JSON.stringify([[], {}, []])
        ) {
          delete alteredDBFormat[bin][fid];

          if (JSON.stringify(alteredDBFormat[bin]) == "{}") {
            delete alteredDBFormat[bin];
          }
        }
      }
    }
    var oldWorkingQuery = cloneDeep(this.workingQuery);
    var oldWorkingFID = cloneDeep(this.workingFID);
    var oldForm = cloneDeep(this.form);
    if (!this.checkDBFormats(alteredDBFormat, cloneDeep(this.DBFormat))) {
      this.pushDBFormat(alteredDBFormat);
    }

    this.workingQuery = oldWorkingQuery;
    this.workingFID = oldWorkingFID;
    this.form = oldForm;
    return returnBool;
  }

  //REMOVE AN EXPLICIT FROM THE FILTER TOP
  removeExplicit(fid: any, bin: any) {
    var alteredDBFormat = cloneDeep(this.DBFormat);
    alteredDBFormat[bin][fid][0] = [];
    var oldWorkingQuery = cloneDeep(this.workingQuery);
    var oldWorkingFID = cloneDeep(this.workingFID);
    var oldForm = cloneDeep(this.form);
    if (
      JSON.stringify(alteredDBFormat[bin][fid]) == JSON.stringify([[], {}, []])
    ) {
      delete alteredDBFormat[bin][fid];

      if (JSON.stringify(alteredDBFormat[bin]) == "{}") {
        delete alteredDBFormat[bin];
      }
    }
    if (String(this.workingFID[bin]) == String(fid)) {
      oldWorkingFID[bin] = "";
      delete oldWorkingQuery[bin][String(Number(bin) * -1)];
      this.form.controls[String(Number(bin) * -1)].setValue(null);
    }
    this.pushDBFormat(alteredDBFormat);
    this.workingQuery = oldWorkingQuery;
    this.workingFID = oldWorkingFID;
    this.form = oldForm;
  }

  removeAttributes(fid: any, bin: any, atts: any[]) {
    if (Object.keys(this.fidCashMapFIDtoID).indexOf(fid) != -1) {
      var id = this.fidCashMapFIDtoID[fid];
      this.formCash.controls[id].setValue(null);
    }

    var alteredDBFormat = cloneDeep(this.DBFormat);
    var removed = cloneDeep(alteredDBFormat[bin][fid][1]);
    for (let att of atts) {
      delete removed[att];
    }
    alteredDBFormat[bin][fid][1] = removed;
    if (
      JSON.stringify(alteredDBFormat[bin][fid]) == JSON.stringify([[], {}, []])
    ) {
      delete alteredDBFormat[bin][fid];
      if (JSON.stringify(alteredDBFormat[bin]) == "{}") {
        delete alteredDBFormat[bin];
      }
    }
    var oldWorkingQuery = cloneDeep(this.workingQuery);
    var oldWorkingFID = cloneDeep(this.workingFID);
    var oldForm = cloneDeep(this.form);
    this.pushDBFormat(alteredDBFormat);
    this.workingQuery = oldWorkingQuery;
    this.workingFID = oldWorkingFID;
    this.form = oldForm;
    for (let att of atts) {
      delete this.workingQuery[bin][att];
      if (this.form.value[String(att) + "search"] != null) {
        this.form.controls[String(att) + "search"].setValue(null);
      }
      this.form.controls[String(att)].setValue(null);
    }
  }

  //SET THE ACTIVE CLUB BY GOING THROUGH THE DB OR SET DEFAULT

  setActiveClub() {
    var notFound = true;

    for (let activeFID in this.FIDBID) {
      if (String(this.FIDBID[activeFID]) == "-2") {
        if ("2" in this.FIDs[activeFID] || 2 in this.FIDs[activeFID]) {
          try {
            this.teamPortalActiveClubID = this.FIDs[activeFID]["2"][0];
          } catch (e) {
            this.teamPortalActiveClubID = this.FIDs[activeFID][2][0];
          }
          this.teamPortalSelected = this.teamsMap[this.teamPortalActiveClubID];
          notFound = false;
        }
      }
    }
    if (notFound) {
      this.teamPortalActiveClubID = "1012";
      this.teamPortalSelected = {
        SailTeamID: "1012",
        TeamCode: "LV",
        Conference: "AFC",
        Division: "West",
        ClubCityName: "NFL",
        ClubNickName: ""
      };
    }
  }

  //SET THE ACTIVE PLAYER BY GOING THROUGH THE DB OR SET DEFAULT
  setActivePlayer() {
    var notFound = true;
    for (let activeFID in this.FIDBID) {
      if (String(this.FIDBID[activeFID]) == "-3") {
        if ("3" in this.FIDs[activeFID] || 3 in this.FIDs[activeFID]) {
          try {
            this.playerPortalActivePlayerID = this.FIDs[activeFID]["3"][0];
          } catch (e) {
            this.playerPortalActivePlayerID = this.FIDs[activeFID][3][0];
          }
          this.playerPortalSelected = this.pullValueMap["3"][
            this.playerPortalActivePlayerID
          ];
        }
        notFound = false;
      }
    }

    if (notFound) {
      this.playerPortalActivePlayerID = "";
      this.playerPortalSelected = {
        Label: "Player Select"
      };
    } else {
    }
  }

  //This function will add add the years selected to the object that will be sent up
  //FOR THE NG_SELECT_DROPDOWN THAT PACKAGE DOESNT WORK
  portalYearDropDownClose() {
    var prior = cloneDeep(this.portalYearsOnly);
    this.portalYearsOnly = [];
    for (let yearItem in this.portalYearsSelected) {
      this.portalYearsOnly.push(this.portalYearsSelected[yearItem]["text"]);
    }
    //Only update and send to DB if new list
    if (JSON.stringify(prior) != JSON.stringify(this.portalYearsOnly)) {
      this.saveAndSend();
    }
  }

  //Return the string to be displayed containing the years selected
  getYearDisplay() {
    if (this.portalYearsOnly.length == 1) {
      return String(this.portalYearsOnly[0]);
    } else {
      return (
        String(this.portalYearsOnly[this.portalYearsOnly.length - 1]) +
        " - " +
        String(this.portalYearsOnly[0])
      );
    }
  }

  //Set highlighting of the year selected
  setStyleYearSelect(year: any) {
    let styles =
      this.portalYearsOnly.indexOf(year) != -1
        ? {
            // backgroundColor: "#92A2AC",
            backgroundColor: "rgb(80, 80, 80)",
            color: "white"
          }
        : {
            backgroundColor: "white",
            color: "black"
          };
    return styles;
  }

  //ON CLOSE OF THE YEAR SELECT SEND UP
  portalYearDisplayClose() {
    if (this.portalYearUpdated) {
      this.saveAndSend();
      this.portalYearUpdated = false;
    }
  }

  //Toggle the years selected in the portals
  toggleYearsSelected(year: any) {
    var item = document.getElementById(String(year) + "yearSelect");
    if (this.portalYearsOnly.indexOf(year) != -1) {
      this.portalYearsOnly = this.portalYearsOnly.filter(
        x => String(x) != String(year)
      );
      item.style.backgroundColor = "white";
    } else {
      this.portalYearsOnly.push(String(year));
      this.portalYearsOnly.sort((a, b) => {
        if (a < b) return 1;
        else if (a > b) return -1;
        else return 0;
      });
      item.style.backgroundColor = "rgba(158, 158, 158, 0.568)";
    }
    this.portalYearUpdated = true;
  }

  //CHANGE THE TYPE 4 (MIN MAX) INPUT
  //minMax True = min, false = max
  //value is number input
  changeType4Input(attribute: any, value: any, minMax: boolean) {
    var bin = this.pullAttribute[attribute]["BinID"];
    var previous = [null, null];
    var tempValue = null;
    var returnArr;
    if (JSON.stringify(value) != "") {
      tempValue = cloneDeep(value);
    }
    if (this.workingQuery[bin][attribute]) {
      var previous = cloneDeep(this.workingQuery[bin][attribute]);
    }
    if (minMax) {
      returnArr = [tempValue, previous[1]];
    } else {
      returnArr = [previous[0], tempValue];
    }
    if (JSON.stringify(returnArr[0]) == JSON.stringify("")) {
      returnArr[0] = null;
    }
    if (JSON.stringify(returnArr[1]) == JSON.stringify("")) {
      returnArr[1] = null;
    }

    if (JSON.stringify(returnArr) == JSON.stringify([null, null])) {
      this.clearSingleIDWorking(attribute, bin);
    } else {
      this.form.controls[attribute].setValue(returnArr);
      this.type0change(attribute, returnArr, bin);
    }
  }

  //CHANGE THE TYPE 8 (Start End) Date INPUT
  //minMax True = min, false = max
  //value is date input
  //for calendar select
  changeType8InputStartEnd(attribute: any, value: any, minMax: boolean) {
    var bin = this.pullAttribute[attribute]["BinID"];
    var previous = [null, null];
    var tempValue = null;
    var returnArr;
    value = String((value.getTime() - value.getMilliseconds()) / 1000);
    if (JSON.stringify(value) != "") {
      tempValue = cloneDeep(value);
    }
    if (this.workingQuery[bin][attribute]) {
      var previous = cloneDeep(this.workingQuery[bin][attribute]);
    }
    if (minMax) {
      returnArr = [tempValue, previous[1]];
    } else {
      returnArr = [previous[0], tempValue];
    }
    if (JSON.stringify(returnArr[0]) == JSON.stringify("")) {
      returnArr[0] = null;
    }
    if (JSON.stringify(returnArr[1]) == JSON.stringify("")) {
      returnArr[1] = null;
    }

    if (JSON.stringify(returnArr) == JSON.stringify([null, null])) {
      this.clearSingleIDWorking(attribute, bin);
    } else {
      this.form.controls[attribute].setValue(returnArr);
      this.type0change(attribute, returnArr, bin);
    }
  }

  //handel text input
  changeType8InputStartEndText(attribute: any, value: any, minMax: boolean) {
    var bin = this.pullAttribute[attribute]["BinID"];

    if (value == "") {
      this.clearSingleIDWorking(attribute, bin);
    } else {
      var split = value.split("/");
      if (split.length > 2 && split[2].length == 4) {
        var mon = split[0] - 1;
        var day = split[1];
        var year = split[2];

        var date = new Date(year, mon, day);
        this.changeType8InputStartEnd(attribute, date, minMax);
      }
    }
  }

  //change type7 basic input
  changeType7Input(attribute: any, value: any) {
    var bin = this.pullAttribute[attribute]["BinID"];
    if (value == "") {
      this.clearSingleIDWorking(attribute, bin);
    } else {
      this.form.controls[attribute].setValue([value]);
      this.type0change(attribute, [value], bin);
    }
  }

  //change type8 date input
  changeType8Input(attribute: any, value: any) {
    var bin = this.pullAttribute[attribute]["BinID"];
    var d = (value.getTime() - value.getMilliseconds()) / 1000;
    if (value == "") {
      this.clearSingleIDWorking(attribute, bin);
    } else {
      // this.form.controls[attribute].setValue([value]);
      this.type0change(attribute, [String(d)], bin);
    }
  }

  //Takes a hex color and percent change and returns new hex color
  shadeColor(color, percentInput) {
    if (!color.includes("#")) {
      try {
        color = this.colorNameToHex(color);
      } catch (e) {}
    }

    var usePound = false;
    if (color[0] == "#") {
      color = color.slice(1);
      usePound = true;
    }

    var num = parseInt(color, 16);

    var r = (num >> 16) + percentInput;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00ff) + percentInput;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000ff) + percentInput;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }

  //changes the hue value shading
  //form hsl(222,22%,50%)
  shadeColorHue(color, valuechange) {
    var split = color.split(",");
    var color1 = Number(split[0].split("(")[1]);
    var color2 = Number(split[1].split("%")[0]);

    var color3 = Number(split[2].split("%")[0]);
    return (
      "hsl(" +
      String(color1) +
      "," +
      String(color2) +
      "%," +
      String(color3 + valuechange) +
      "%)"
    );
  }

  //Convert color name to hex
  colorNameToHex(colour) {
    if (typeof colours[colour.toLowerCase()] != "undefined")
      return colours[colour.toLowerCase()];

    return false;
  }

  //THIS FUNCTION CALLS FULL SCREEN MODE
  fullScreenOn() {
    try {
      document.getElementById("iframe").className = "fullScreen";
      this.fullScreenMode = true;
      this.updateRDURL();
    } catch (e) {}
  }
  //THIS FUNCTION EXITS FULL SCREEN MODE
  fullScreenOff() {
    document.getElementById("iframe").className = "";
    this.fullScreenMode = false;
    this.updateRDURL();
  }

  //GET SPINNER COLOR STYLE
  setStyleSpinner(input: any) {
    var offset = (Number(input["OrderID"]) - 1) * 68;
    let styles = {
      position: "fixed",
      "margin-left": String(offset) + "px"
    };
    return styles;
  }

  //RETURN CLUB SPECIFICS  OR NUL
  getClubSpecifics(location) {
    try {
      return this.clubSpecifics[String(location)];
    } catch (e) {
      return [];
    }
  }
  //RETURN CLUB SPECIFICS  OR NUL
  getPlayerSpecifics(location) {
    try {
      return this.playerSpecifics[String(location)];
    } catch (e) {
      return [];
    }
  }

  //Gets the update club data to be run after save and send
  updateClubData() {
    this.pullData.pullClubData().subscribe(data => {
      this.clubSpecifics = {};
      for (let b in data) {
        var id = String(data[b]["Location"]);
        if (!this.clubSpecifics[id]) {
          this.clubSpecifics[id] = [];
        }
        this.clubSpecifics[id].push(data[b]);
      }
    });
  }

  //Gets the update player data to be run after save and send

  updatePlayerData() {
    if (
      JSON.stringify(this.playerPortalSelected) !=
      JSON.stringify({
        Label: "Player Select"
      })
    ) {
      this.pullData.pullPlayerData().subscribe(data => {
        this.playerSpecifics = {};

        for (let b in data) {
          var id = String(data[b]["Location"]);
          if (!this.playerSpecifics[id]) {
            this.playerSpecifics[id] = [];
          }
          this.playerSpecifics[id].push(data[b]);
        }
      });
    } else {
      this.playerSpecifics = {};
    }
  }

  //RETURN "Label" from obj
  getLabel(obj: any, text: string) {
    try {
      return obj[text];
    } catch (e) {
      return "";
    }
  }

  //Set the color style
  setStyleColor(obj: any) {
    var styles = {};
    try {
      styles = {
        color: obj["Color"]
      };
    } catch (e) {
      styles = {
        color: "Black"
      };
    }
    return styles;
  }

  //Set the color style
  setGradeColor(obj: any) {
    var styles = {};
    try {
      if (obj["SubValue"] != null && obj["SubValue"] != "") {
        styles = {
          color: "White",
          background: obj["Color"],
          display: "inline-block",
          borderRadius: "10px",
          width: "50px",
          height: "24px",
          marginLeft: "3px",
          textAlign: "center",
          lineHeight: "28px",
          fontSize: "18px",
          fontWeight: "bold",
          border: "2px solid " + obj["Color"]
        };
      } else {
        return {};
      }
    } catch (e) {
      styles = {
        color: "Black",
        background: "white"
      };
    }
    return styles;
  }

  //Transform Name
  transformName(text: string) {
    if (text.includes(" ")) {
      var split = text.split(" ");
      return split[1] + ", " + split[0];
    } else {
      return null;
    }
  }

  //return the options for type0
  type0Options(id: any) {
    if (String(id) == "3") {
      return this.playersToDisplay;
    } else {
      return this.pullValueMap[String(id)];
    }
  }

  //link to new window
  goToLink(url: string) {
    this.globalSearchShowSuggestions = false;

    //for new window
    var newWindow = window.open(url);

    //for same window
    // var urlAltered = url.split(".raiders.com:88")[1];
    // urlAltered = urlAltered.split("%5B").join("[");
    // urlAltered = urlAltered.split("%5D").join("]");
    // urlAltered = urlAltered.split("%22").join('"');
    // urlAltered = urlAltered.split("%2C").join(",");
    //this.router.navigate([urlAltered]);
  }

  labelOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["Label"] < b.value["Label"]
      ? -1
      : b.value["Label"] < a.value["Label"]
      ? 1
      : 0;
  };

  //Open/Close Settings menu in top bar
  toggleTopMenuDropDown() {
    this.menuOpen = !this.menuOpen;
  }

  //route to report uploader
  routeReportUploader() {
    this.router.navigate(["report-upload"]);
    for (let category in this.getReportHeaders(1)) {
      document.getElementById(
        category.toString() + "reportHighlightid"
      ).className = "sidebutton";
    }
    var portals = ["club", "player", "cash"];

    for (let port in portals) {
      document.getElementById(portals[port] + "id").className = "sidebutton";
    }
    this.toggleTopMenuDropDown();
  }
}
