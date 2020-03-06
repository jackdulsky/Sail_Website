import { Injectable } from "@angular/core";
import { Observable, of, BehaviorSubject } from "rxjs";
import { PullDataService } from "./pull-data.service";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { colours } from "./constants";
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { KeyValue } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class FiltersService {
  //variable to only perform bulk import once
  bulkImported = false;

  //sentToDBYet
  filterInDB = false;

  //This is the db format to check if no other edits were made after a timeout to send up the data.
  tryingToSendDBFormat: string;

  //This is used to get the players after an appropriate amount of time has passed.
  tryingToSetPlayersTime: number;

  //mapping of FID's to Bin ID's
  FIDBID: { [FID: string]: string } = {};

  //mapping of FID to mapping of attribute ID's to list of values selected
  FIDs: { [FID: string]: {} } = {};

  // This is the format that will be transfered to the database and back
  //combining FID's and their bin mapping is how this variable is created and edited.
  // { BID : { FID : [ [ ExplicitID ], { AttributeID : [ values ] } , [ FID Array Placeholder ] }
  DBFormat: { [bid: string]: {} } = {};

  // Staged queries when fitlerspop component is up
  //maps bin to object of attribute id's to list of values selected
  //{ BID :  { AttributeID : [ values ] } }
  workingQuery = {};

  //Maps bins to working FID or "" if no working fid
  //allows you to edit a Filter once uploaded
  workingFID = {};

  // orders the fid's in each bin for labels
  //{ BID :  [ FID's ] } }
  FIDCreationOrder = {};

  //The clicked on panel to know which attributes to show in the gui area
  show: string = "";

  //list of panels in order to show from the filter structure.
  panels: string[] = [];

  //This variable is a list of attrbiute ID's to display in the gui Area
  //from the filter structure attributes either go into
  // the panel to be displayed or in the gui area
  selectingAttributes: string[] = [];

  //String to keep track of the filter bin selected
  filterBinSelected: string;

  //Theses are the main (but not all) data structures from the database
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
  teams; //raw array from DB
  teamsMap; //extracted SailTeamID

  //Data for reports Structure
  //Determines which goes where how to link to them
  reportTabs;
  reportTabLocation;
  reportReportsStructure;
  reportReportsOnly;
  reportURL;

  //These are the data structures for constructing the positional select drop down information
  positionHierarchy; // mapped parents positions to children positions {parent:[children]}
  positionHItem; // {filterID: filter object}

  //Data for the top information bar in the club and player portals
  clubSpecifics;
  playerSpecifics;

  //Data for FA-Hypo
  faHypo; //players list with information
  faHypoBins; //bin information
  faHypoScenarios; // saved scenarios to upload

  // label variables to access object info in html easier
  OrderID = "OrderID";
  Label = "Label";

  // for radial slider to know which side to be on
  conferenceSelections = { "2": "AFC", "400": "AFC" };

  //count of plays based on filter to show in filter bar
  //not functional (would get number from db)
  playCount = "0";

  //keeps track of filter name on save
  //logic for saving over and saving as not implemented
  filterName: string = "";
  namePresent: boolean = false;
  modified: boolean = false; //boolean for if db format has been modified

  //default player club information
  //might make sense to move this to a flag in the teams seciton passed down
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

  //imported static map for name to hex
  colours = colours;

  //refers to which of the reports List is selected on the left body panel.
  //also functions as which report list tab is clicked on inside portals
  //The reorts in the body component on the left side function the same as report list tabs in portals
  //These are imported from the database
  //different than portal selected even though they are on the same sidebar
  selected: string;
  portalSelected = "";

  //THIS SECTION IS COMMENTED OUT AND WILL BE THE EVENTUAL CODE IN PRODUCTION
  //AFTER THE NETWORK ISSUE IS RESOLVED
  // viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
  //   "https://sailreports.raiders.com/"
  // );
  viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
    "http://oakcmsreports01.raiders.com/"
  );

  //Stores years selected from list of possible years to display
  //portalYearsOnly is the variable that will be added to DBFormat and sent to the DB
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
  portalYearUpdated = false; //check if year updated to save and send

  fullScreenMode = false;

  //Stores list of players to display that are generated from the DB
  playersToDisplay: any[] = [];

  //Showing the search suggestions from top search (right now we just automatically go to the first result)
  globalSearchShowSuggestions = false;

  //give players to image urls
  playerImageURLs = {};

  //temp variable to store results from global search, is depricated
  globalSearchResults: any = {};

  //attribute to values selected list, for filter selection
  form = this.fb.group({});
  formCash = this.fb.group({}); //specific to cash page

  //for creating the structures of which filters to display in the cash tab top bar
  //look in cash.component.ts for structure of these
  fidCashMap = {};
  fidCashMapFIDtoID = {};

  //for settings menu in top right
  menuOpen = false;

  //THESE ARE OBSERVABLE DATA OBJECTS THAT ARE STRINGS
  //YOU CAN SUBSCRIBE TO CHANGES IN THEM FOR TRIGGERING
  //THIS VARIABLE IS FOR TIME THE FILTERS WERE LAST SENT
  timeLastSent = new BehaviorSubject<string>("");

  constructor(
    //imported packages and components initialized
    public sanitizer: DomSanitizer,
    public pullData: PullDataService,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  /**
   * This function returns the list of reports based on the location id
   * @param location the location that the report tabs exist in
   */
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

  /**
   * RETURN IF A NAME EXISTS
   */
  getNamePresent() {
    return this.namePresent;
  }

  /**
   * CHANGE THE NAME OF THE FILTER SET, set that the name is present
   * @param name string to become name
   */
  setName(name: string) {
    this.namePresent = true;
    this.filterName = name;
  }

  /**
   * RETURN THE FILTER NAME
   */
  getName() {
    return this.filterName;
  }

  /**
   * RESET THE NAME (AND ID)
   */
  clearName() {
    this.modified = false;
    this.filterName = null;
    this.namePresent = false;
  }

  /**
   * TURN AN ARRAY OF DICTIONARIES INTO A DICTIONARY WITH KEY AS IDSTRING SPECIFIED THROUGH PULLING IT OUT TO BE THE KEY
   *
   * @param data Array of objects returned from database
   * @param idString the property of the object to make the key
   * @param insertDict where to insert the new dicitonary
   * @param keep optional param to indicate whether to delete the key from the object as well
   */
  extractID(data, idString: string, insertDict, keep: number = 0) {
    for (let b in data) {
      var id = String(data[b][idString]);
      if (keep == 0) {
        delete data[b][idString];
      }

      insertDict[id] = data[b];
    }
  }

  /**
   *
   * extract key value only to create mapping instead of array of dictionary
   *
   * @param data Array of objects returned from database
   * @param key string of property to become the key
   * @param value string of the property to become the value
   * @param insertDict object to place the pair
   */
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

  /**
   * RECURSIVELY GO THROUGH THE FILTER STRUCTURE TO CONVER TO THE DICTIONARY FORMAT REQUIRED
   *
   * the property has "l" before the level (database specification)
   *
   * returned is a nested mapping for levels
   *
   * @param row the data object
   * @param idString string of the object to become the key
   * @param level recursion level
   */
  recursiveExtractLevel(row, idString: string, level: number) {
    var id = String(row[idString]);
    var element = {};
    delete row[idString];
    //if there is a next level proceed otherwise the value will be empty dictionary
    if (row["l" + String(level)]) {
      var next = {};
      //iterate through the sub level
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

    //add each item of the filter structure to the form control.
    this.form.addControl(id, new FormControl());
    this.form.addControl(id + "search", new FormControl());

    element[id] = next;
    return element;
  }

  /**
   * Return the mapping of parents to children.
   *
   * @param data array of objects that have attributes for parent and id
   * @param idCol string of attribute id
   * @param parentCol string of parent id
   */
  hierarchyTableToMap(data, idCol, parentCol) {
    var tempMap = {};
    for (let row in data) {
      if (!tempMap[data[row][parentCol]]) {
        tempMap[data[row][parentCol]] = [data[row][idCol]];
      } else {
        tempMap[data[row][parentCol]].push(data[row][idCol]);
      }
    }
    return tempMap;
  }

  /**
   * Through the database get the list of players to display. Does not automatically take in the DBFormat
   * Because you may want to add some other values selected (Such as name text entered) without actually putting
   * That in the filter structure
   *
   * @param sendString string in format of DB style JSON to send to DB to get return list of players
   */
  setPlayers(sendString: string = JSON.stringify(this.DBFormat)) {
    var curTime = cloneDeep(Date.now());
    this.tryingToSetPlayersTime = curTime;
    setTimeout(() => {
      console.log("LOOP 16");
      if (Date.now() - this.tryingToSetPlayersTime > 349) {
        this.pullData.pullPlayersToDisplay(sendString).subscribe(data => {
          var players = this.pullValueMap["3"]; //all players to get objects from SailID
          var arrPlayers = {};

          //Add in players from returned query
          for (let row in data) {
            if (players[data[row]["SailID"]]) {
              arrPlayers[data[row]["SailID"]] = players[data[row]["SailID"]];
            }
          }

          //add in any players selected in the form in the staged section (i.e. if in working query)
          for (let item in this.form.value["3"]) {
            if (players[item]) {
              arrPlayers[item] = players[item];
            }
          }
          //Add in any players currently selected
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

  /**
   * Add keys to form
   * This is not used in production, but is used for testing to initialize the form variables
   *
   * @param structure list of keys of attributes to select
   */
  initForm(structure: any) {
    structure.forEach(element => {
      this.form.addControl(element, new FormControl());
      this.form.addControl(element + "search", new FormControl());
    });
  }

  /**
   * THIS IS THE FUNCTION CALLED BY THE TOP BAR RENDER TO IMPORT ALL THE DATA ON WEBSITE START UP
   * ONLY CALLED ONCE (when top bar loads)
   */
  getBulkImport() {
    if (!this.bulkImported) {
      this.pullData.setGUID(); //set guid
      this.pullData.constructAndSendFilters({
        "-4": { "4": [["2019"], {}, []] }
      });

      //Pull structure (1 is for NFL)
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
      });

      //Data type information
      this.pullData.pullDataType().subscribe(data => {
        this.pullDataType = {};
        this.extractID(data, "DataTypeID", this.pullDataType);
      });

      //Players
      this.pullData.pullPlayers().subscribe(data => {
        this.pullPlayers = {};
        this.extractID(data, "SailID", this.pullPlayers);
      });

      //Bin information
      this.pullData.pullBin().subscribe(data => {
        this.pullBin = {};
        this.extractID(data, "BinID", this.pullBin);
        for (let binKey in this.pullBin) {
          this.workingQuery[binKey] = {};

          this.workingFID[binKey] = "";
          this.FIDCreationOrder[binKey] = [];
        }
      });

      //Overall navigation info
      this.pullData.pullNavigation().subscribe(data => {
        this.pullNavigation = {};
        this.extractID(data, "ItemID", this.pullNavigation);
      });

      //Player Information
      this.pullData.pullPlayerURL().subscribe(data => {
        this.extractkeyValue(
          data,
          "SailID",
          "PlayerImageUrl",
          this.playerImageURLs
        );
      });

      //Navigation Information On where attributes go
      this.pullData.pullNavigationElement().subscribe(data => {
        this.pullNavigationElement = {};
        this.extractID(data, "ItemID", this.pullNavigationElement);
      });

      //Attribute Type information
      this.pullData.pullAttributeType().subscribe(data => {
        this.pullAttributeType = {};
        this.extractID(data, "AttributeTypeID", this.pullAttributeType);
      });

      //Attribute Info
      this.pullData.pullAttribute().subscribe(data => {
        this.pullAttribute = {};
        this.extractID(data, "AttributeID", this.pullAttribute);
      });

      // UI Type information
      this.pullData.pullUIType().subscribe(data => {
        this.pullUIType = {};
        this.extractID(data, "UITypeID", this.pullUIType);
      });

      //get value map and overall order array
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
      });
      //get sail Teams
      this.pullData.getTeams().subscribe(data => {
        this.teams = cloneDeep(data);
        this.teamsMap = {};
        this.extractID(data, "SailTeamID", this.teamsMap, 1);
      });

      // Report Tabs list
      this.pullData.pullReportTabs().subscribe(data => {
        this.reportTabs = {};
        this.extractID(data, "TabID", this.reportTabs);
      });

      //Report Tab Infomation Location
      this.pullData.pullReportTabLocation().subscribe(data => {
        this.reportTabLocation = {};
        this.extractID(data, "LocationID", this.reportTabLocation);
      });

      //Report information
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
      });

      //Report URLs
      this.pullData.pullReportURL().subscribe(data => {
        this.reportURL = {};
        this.extractID(data, "ViewID", this.reportURL);
      });

      //Positional Information for the Attribute selection
      this.pullData.pullPositionHierarchy().subscribe(data => {
        this.positionHierarchy = {};
        this.positionHItem = {};
        this.positionHierarchy = this.hierarchyTableToMap(
          cloneDeep(data),
          "FilterPosID",
          "ParentPosID"
        );
        this.extractID(data, "FilterPosID", this.positionHItem);

        //THESE 4 add in the position menu, Offense, Defense, Specials that are not positions but needed for the positional hierarchy.
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
      });

      //FA HYPO PLAYERS INITALIZE
      this.pullData.pullHypoPlayers().subscribe(data => {
        this.faHypo = data;
      });

      //FA HYPO BINS
      this.pullData.pullHypoBins().subscribe(data => {
        this.faHypoBins = data;
      });
    }
    this.bulkImported = true;
    return true;
  }

  //Check if all variables are uploaded from db
  checkUploadComplete() {
    if (
      this.faHypoBins != null &&
      this.faHypo != null &&
      this.positionHierarchy != null &&
      this.positionHItem != null &&
      this.pullDataType != null &&
      this.pullBin != null &&
      this.pullNavigation != null &&
      this.pullNavigationElement != null &&
      this.pullAttributeType != null &&
      this.pullAttribute != null &&
      this.pullUIType != null &&
      this.pullValue != null &&
      this.pullValueMap != null &&
      this.pullStructure != null &&
      this.pullOrderMap != null &&
      this.pullPlayers != null &&
      this.teams != null &&
      this.teamsMap != null &&
      this.reportTabs != null &&
      this.reportTabLocation != null &&
      this.reportReportsStructure != null &&
      this.reportReportsOnly != null &&
      this.reportURL != null
    ) {
      return true;
    }
    return false;
  }

  /**
   * Save DBFormat to DB with name and description
   * Takes current instance of DBFormat
   *
   * @param name string name of filter set
   * @param description string descritption of filter set
   */
  saveFilter(name: string, description: string) {
    if (Object.keys(this.DBFormat).length > 0) {
      this.pullData
        .saveFilter(name, this.DBFormat, description)
        .subscribe(data => {
          console.log("SAVED!");
        });
    }
  }

  /**
   * RETURN IF THE FILTER QUERY SET HAS BEEN MODIFIED AT ALL SINCE SAVED
   */
  modifiedStatus() {
    return this.modified && this.getNamePresent();
  }

  //
  /**
   * TURN ITEM TO STRING FOR HTML WORKAROUND SINCE YOU CANT PUT STRING() IN HTML
   * @param item
   */
  turnString(item: any) {
    return String(item);
  }

  /**
   * DELETE A QUERY BASED ON FID
   *
   * @param fid Filter ID to be deleted from DB format and existing query if applicable
   */
  removeQuery(fid: string) {
    var oldBID = this.FIDBID[fid];

    //if its in the cash portal top filter delete from there
    if (Object.keys(this.fidCashMapFIDtoID).indexOf(fid) != -1) {
      var id = this.fidCashMapFIDtoID[fid];
      this.formCash.controls[id].setValue(null);
    }

    //go through the attribute ID's and delete them
    for (let id in this.FIDs[fid]) {
      this.clearSingleIDWorking(id, this.FIDBID[fid]);
    }

    //delete from everywhere
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

  /**
   *   THIS IS THE GENERIC CHANGE FUNCTION
   * TAKES IN THE FORMKEY (ATT OR PKID), AND ITS VALUES
   * AND WILL PUT THE CHANGES IN THE COMBINED VARIABLE
   * STAGED FOR PUTTIN INTO THE WORKING QUERY
   * RESET VARIABLES APPROPRIATELY
   *
   *
   *
   * @param formKey Attribute ID
   * @param formVals Value ID's or similar (i.e. numbers or string depending on type of input)
   * @param bid BIN ID
   */
  type0change(formKey, formVals, bid) {
    var values = cloneDeep(formVals);

    //CHECK IF A DELETE NEEDS TO OCCUR CAUSE VALUE IS EMPTY
    if (values != null && values.length == 0) {
      delete this.workingQuery[bid][formKey];
      this.form.controls[formKey].setValue(null);

      //Also make change in DB Format if there is a FID being modified
      if (this.workingFID[bid] != "") {
        this.pushBIDActiveFIDToActiveFilter(bid, false);
      }

      if (Object.keys(this.workingQuery[bid]).length == 0) {
        delete this.FIDs[this.workingFID[bid]];
        this.workingFID[bid] = "";
      }
    } else {
      //Set active player ID and object if pushing a player
      if (String(formKey) == "3" && String(bid) == "-3") {
        this.playerPortalActivePlayerID = formVals[0];
        this.playerPortalSelected = this.pullValueMap["3"][
          this.playerPortalActivePlayerID
        ];
      }
      this.workingQuery[bid][formKey] = formVals;
    }
    // If its not a bin or team is changed then update players
    //IF team selected changed then players to display change
    if (Number(formKey) > 14 || Number(formKey) == 2) {
      this.setPlayers(this.combinedJSONstring());
    }
  }

  /**
   * REMOVE FROM THE WORKING QUERY AND
   * DELETING A SINGLE SELECTION ON THE FILTERS POP PAGE
   *
   *
   * @param id Attribute ID
   * @param BID Bin ID associated with attribute (if not passed in can be figured out through variables)
   * @param input boolean whether or not the active working should be cleared
   */
  clearSingleIDWorking(id: string, BID: string, input: boolean = true) {
    delete this.workingQuery[BID][id];

    //update filters if editing a FID
    if (this.workingFID[BID] != "") {
      this.pushQueryToActiveFilter(BID, input);
    }
    //Reset the form
    if (this.form.value[String(id) + "search"] != null) {
      this.form.controls[String(id) + "search"].setValue(null);
    }
    this.form.controls[id].setValue(null);
    // If its not a bin or team is changed then update players
    //IF team selected changed then players to display change
    if (Number(id) > 14 || Number(id) == 2) {
      this.setPlayers(this.combinedJSONstring());
    }
  }

  /**
   * IS TWO OBJECTS EQUAL CONTENTS NOT MEMORY POINTERS
   *
   *
   * @param a Object A
   * @param b Object B
   */
  isEqualObjectsContents(a, b) {
    var aProps = Object.getOwnPropertyNames(a).sort();
    var bProps = Object.getOwnPropertyNames(b).sort();
    //check if same length of keys then if keys are the same
    if (
      aProps.length != bProps.length ||
      !(
        JSON.stringify(aProps).toLowerCase() ===
        JSON.stringify(bProps).toLowerCase()
      )
    ) {
      return false;
    }
    // go through values if keys are identical
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

  /**
   * PUT THE STAGED CHANGES FROM THE FILTERSPOP DISPLAY AND PUT INTO THE WORKING FID OR CREATE A NEW ONE
   *
   *
   * @param BID Bin ID
   * @param clearWorking Boolean to decide whether to clear it from the working query
   */
  pushQueryToActiveFilter(BID: string, clearWorking: boolean = true) {
    if (JSON.stringify(this.workingFID) == "{}") {
      setTimeout(() => {
        this.pushQueryToActiveFilter(BID, clearWorking);
      }, 100);
    } else {
      var oldDB = cloneDeep(this.DBFormat);
      //only allow one club or player if on that portal
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

  /**
   *  Push specific Bin ID's active FID to DB Format
   * @param BID
   * @param clearWorking
   */
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

  /**
   * CREATE THE FAKE JSON DB FORMAT AS IS PUSH QUERY
   * HAS OCCURED TO SEND TO DATABASE WITH STAGED CHANGES
   *
   *
   */
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

  /**
   * SEND THE FILTERS TO THE DB
   * Add in years variable as the "-4" bin
   * Set the order of FID's and make sure none are missed
   * the DB will not be inserted into until 500 ms has passed after the last call to this function
   *
   */
  saveAndSend() {
    var dbFormatWithAddedHiddenYears = cloneDeep(this.DBFormat);
    //set the Order of FIDs by double checking against what is sent to DB

    if (this.checkUploadComplete()) {
      for (let bin in dbFormatWithAddedHiddenYears) {
        var activeFIDs = [];
        //Add in FID's if they still exist in the order they were pushed
        for (let fid in this.FIDCreationOrder[bin]) {
          if (
            Object.keys(dbFormatWithAddedHiddenYears[bin]).indexOf(
              this.FIDCreationOrder[bin][fid]
            ) != -1
          ) {
            activeFIDs = activeFIDs.concat([this.FIDCreationOrder[bin][fid]]);
          }
        }

        //Go through the added FID's in DBFormat to add in any missed FID's
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

      //Global Variable holding the JSON string of what to send to the DB
      //Will be overridden if the function is call again
      this.tryingToSendDBFormat = JSON.stringify(dbFormatWithAddedHiddenYears);

      setTimeout(() => {
        console.log("LOOP 17");
        //If the function has not been called within 500 millisecond then send up the JSON string
        //implicitly the time out and the global variable will allow for the check to occur

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
              this.filterInDB = true;
            });
          this.setActiveClub();
          this.setActivePlayer();
          this.updateRDURL();
          setTimeout(() => {
            //wait for the DB to take and insert to make the call
            console.log("LOOP 12");
            this.setPlayers();
          }, 200);
        }
      }, 500);
    } else {
      setTimeout(() => {
        this.saveAndSend();
      }, 100);
    }
  }

  /**
   * Set variables added in what was sent to the DB to the cash tab instances
   * This allows you to open the cash tab and it appear as if everything is one variable set
   */
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

  /**
   * CHECK IF TWO DB FORMAT's ARE THE SAME
   * return outcome
   * @param structure1 Object 1
   * @param structure2 Object 2
   */
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

  /**
   * Clear all staged filters added in the working query variable
   * Clears a FID if the FID was being edited
   */
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

  /**
   * HARD RESET OF ALL VARIABLES CALLED FROM THE FILTER BAR
   * Clear everything relating to filters selected
   */
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

  /**
   * This function clears a single value from the newWorking query, if a
   * Working FID is set it pushes the updates
   *
   *
   * @param bin Bin from which value is being cleared
   * @param att Attribute from which value is being cleared
   * @param val value being cleared
   * @param input
   */
  clearSingleValuePop(bin: any, att: any, val: any) {
    //check if its a special value for min max or string to clear entire attribute
    if (
      JSON.stringify(this.workingQuery[bin][att]) ==
        JSON.stringify([String(val)]) ||
      JSON.stringify(this.workingQuery[bin][att]) ==
        JSON.stringify([val, null]) ||
      JSON.stringify(this.workingQuery[bin][att]) == JSON.stringify([null, val])
    ) {
      this.clearSingleIDWorking(att, bin, false);
    } else {
      //remove it from filter set and from form
      this.workingQuery[bin][att] = this.workingQuery[bin][att].filter(
        x => x != String(val)
      );
      var oldValue = this.form.value[att];

      this.form.controls[att].setValue(oldValue.filter(x => x != String(val)));
      if (this.workingFID[bin] != "") {
        this.pushQueryToActiveFilter(bin, false);
      }
    }

    //get new players
    if (Number(att) > 14 || Number(att) == 2) {
      this.setPlayers(this.combinedJSONstring());
    }
  }

  /**
   * SETTING CSS OF THE LEAGUE ICONS SINCE THE IMAGES ARE DIF SIZES
   * @param leagueID NFL or NCAA
   * @param id Attribute ID
   */
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

  /**
   * GET IMG URL FOR LEAGUE GUI
   *
   *
   * @param league 'NCAA' or 'NFL'
   */

  createLeagueImages(league: string) {
    return (
      "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos/" +
      league +
      ".png"
    );
  }

  /**
   * CHANGE A LEAGUES STATUS IN THE FORM FOR LEAGUE SELECT GUI
   * CHANGE THE CSS AND INSERT/REMOVE
   * SPECIFIC TO THE LEAGUE GUI TYPE
   *
   * @param attID Attribute ID
   * @param value Value to set for attribute
   * @param bin BIN ID for attribute
   */
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

  /**
   * SELECT OR DESELECT ALL FROM THE TYPE 0 INPUT
   *
   * @param id Attribute ID
   * @param toLabel Value to put in for toggle
   * @param remove boolean if the toggle is placed in the middle
   * @param bin BIN ID the Attribute ID is associated with
   */
  changeToggleValue(id: string, toLabel: any, remove: boolean, bin: string) {
    if (remove) {
      this.form.controls[id].setValue(null);
      this.type0change(id, [], bin); //will delete the filter
    } else {
      this.form.controls[id].setValue([String(toLabel)]);
      this.type0change(id, [String(toLabel)], bin);
    }
  }

  /**
   * RETURN STARTING POSITION OF THE SLIDER
   * check in form (i.e. filters selected) if the position should be true for the label
   * Also set the color of the slider from green to red if appropriate
   *
   * @param id Attribute ID of slider filter
   * @param Label Value of the position
   */
  checkType3ToggleChecked(id: string, Label: any) {
    var switchType3 = document.getElementById("type3Switch" + id);
    if (switchType3 != null) {
      try {
        //For if none is selected
        if (this.form.value[id] == null) {
          if (Label == "na") {
            switchType3.style.backgroundColor = "var(--raiders-gray)";
            return "checked";
          } else {
            return "";
          }
        }

        //if label is on either way set color and reutrn appropriately
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
      return "";
    }
  }

  /**
   * RETURN SLIDER STARTING POS FOR THE TOGGEL OF CONFERENCE
   * @param id attribute ID
   * @param Label 'AFC' or 'NFC'
   */
  checkType2ConfChecked(id: string, Label: string) {
    if (this.conferenceSelections[id] == Label) {
      return "checked";
    } else {
      return "";
    }
  }

  /**
   * CHANGE THE SLIDER TOGGLE OF CONFERENCE IN TEAM SELECT GUI
   * @param num Attribute ID
   * @param newConf 'NFC' or 'AFC'
   */
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

  /**
   * RETURN THE TEAM LOGO URL FOR TEAM SELECT GUI
   * @param team the club object for getting the url
   */
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

  /**
   * RETURN THE TEAMS THAT SHOULD BE DISPLAYED For the Ordering of the Team select gui
   * @param id key string values array ex.  ['Conference', 'Division']
   * @param key string array of what those values should be
   */
  getDisplayTeams(id: string[], key: any) {
    return this.teams.filter(x => x[id[0]] == key[0] && x[id[1]] == key[1]);
  }

  /**
   * RETURN IF SOMETHING IS NOT IN THE ARRAY
   * @param arr Array of string numbers
   * @param numb number in array
   */
  checkNotInArray(arr: String[], numb: any) {
    return arr.indexOf(String(numb)) !== -1;
  }

  /**
   * TOGGLE A TEAMS STATUS IN THE TEAM SELECT GUI
   * @param teamI Team object to toggle in filter structure
   * @param attID Attribute ID
   * @param bin  Bin ID
   */
  toggleTeam(teamI: any, attID: string, bin: string) {
    var team = document.getElementById("teamGUI" + String(teamI["SailTeamID"]));
    //values must be passed into type0change so we are starting with an array
    var oldValue = this.form.value[attID];
    if (oldValue == null) {
      oldValue = [];
    }

    //If selection is from club menu dropdown, change css and array of values selected appropriately
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

    //check if deleting or inserting based on css of team logo
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
    this.type0change(attID, this.form.value[attID], bin);
  }

  /**
   * This Function will allow for the coloring of the filter based on the BIN it falls under
   * uses the color scheme and fact of the pattern color for determine color for each output
   * first color is the outer, and second one is the inside one
   * @param BID BIN ID
   * @param pos position number for background (essentiall first and third css is same but middle is white)
   */
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

  /**
   * PANEL SECTION FOR FILTERPOP
   * ALTER THE SELECTION VIEW OF TEH WORKING QUERY BASED ON THE
   * TIER 1 TAB THAT WAS SELECTED
   * @param id Bin ID to change the top selection to
   */
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

  /**
   * THIS OPENS UP NEW PANELS AND CONTROLS CLOSING OLD ONES UPON A CLICK
   *
   * @param att Atrtribute selected in the panel
   */
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

    if (this.pullNavigationElement[att]["IsAttribute"] != true) {
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

  /**
   * This function navigates the panels and displays where the
   * Attribute was selected from if its clicked on the right area of the staged filters
   * It works back through the parent child structure of the attributes to put together the panels
   * @param bin
   * @param att
   */
  navigateToAttribute(bin: any, att: any) {
    this.changelevel2(bin);
    this.show = String(this.pullNavigation[att]["ParentItemID"]);
    var newPanels = [];
    var atRoot = false;
    var startAtt = att;
    //keep navigating back until you hit the top
    while (!atRoot) {
      var adding = this.pullNavigation[startAtt]["ParentItemID"];
      newPanels.push(String(adding));
      if (Number(adding) <= 0) {
        atRoot = true;
      }
      startAtt = adding;
    }

    //get the attributes to put in the GUI area
    this.selectingAttributes = Object.keys(
      this.getPanelOptions(newPanels[0], cloneDeep(newPanels).reverse())
    ).filter(x => this.pullNavigationElement[x]["IsAttribute"]);

    //remove last panel if its empty
    if (
      JSON.stringify(
        this.getPanelOptions(newPanels[0], cloneDeep(newPanels).reverse())
      ) == "{}"
    ) {
      newPanels = newPanels.slice(1);
    }
    this.panels = cloneDeep(newPanels.reverse());
  }

  /**
   * GET COLOR FOR PANELS and Attributes
   * @param id Attribute
   */
  buttonContainerColor(id: any) {
    if (this.panels.concat([String(this.show)]).indexOf(String(id)) != -1) {
      return {
        borderLeft: "4px solid lightskyblue"
      };
    } else {
      return { borderLeft: "4px solid white" };
    }
  }

  /**
   * GET PANEL OPTIONS OF THE PANEL INPUT
   * @param att Attribute ID
   * @param p panels (can have it be defualt showing or if calculating can pass in dif set of panels)
   */
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

  /**
   * This function creates and stores the RD URL
   * @param id Report ID
   * @param count How many times its tried to create the viewing url
   */
  createRDURL(id: any, count: any = 0) {
    if (this.filterInDB == false) {
      this.pullData
        .constructAndSendFilters({ "-4": { "4": [["2019"], {}, []] } })
        .subscribe(() => {
          this.filterInDB = true;
        });
    }
    //Below is part of network issue
    this.viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      "http://oakcmsreports01.raiders.com/"
    );
    // this.viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
    //   "https://sailreports.raiders.com/"
    // );
    if (Number(id) < 0) {
      return this.viewingURL;
    }

    if (this.checkUploadComplete() && this.filterInDB == true) {
      //If Report is an excel file:
      //add this to the end of it
      var excelEnding =
        "&action=embedview&wdAllowInteractivity=True&wdbipreview=True&wdDownloadButton=True";
      try {
        var baseURL = this.reportURL[id]["ViewURL"];

        //Based on how your accessing the website this will edit the url appropriately
        if (document.location.hostname.includes("sail.raiders.com")) {
          baseURL = baseURL.replace(
            "http://oakcmsreports01.raiders.com",
            "https://sailreports.raiders.com"
          );
        } else {
          baseURL = baseURL.replace(
            "https://sailreports.raiders.com",
            "http://oakcmsreports01.raiders.com"
          );
        }
        this.viewingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
          baseURL.replace("[GUID]", this.pullData.GUID.toUpperCase())
        );
        return cloneDeep(this.viewingURL);
      } catch (e) {}
    } else {
      if (count <= 40) {
        setTimeout(() => {
          console.log("LOOP 13");
          return this.createRDURL(id, count + 1);
        }, 250);
      }
    }
  }

  /**
   * Since rock daisy will only refresh its view and what it pulls from the DB if the view is changed
   * we temporarily set the viewing url to empty and then reset it so that it will reload the Rock Daisy report
   * With the new updated information.
   */
  updateRDURL() {
    var old = cloneDeep(this.viewingURL);
    this.viewingURL = "";
    this.viewingURL = old;
  }

  /**
   * convert the db format variable to the other ones for display
   * SET THE ACTIVE PORTAL VARIABLES AND EXTRACT OUT THE YEARS TO THEIR OWN VARIABLE
   * @param DBFormat The object to inject as the new DB format
   */
  pushDBFormat(DBFormat: any) {
    this.clearAll();
    this.DBFormat = cloneDeep(DBFormat);
    if (JSON.stringify(DBFormat) == JSON.stringify({})) {
      this.saveAndSend();
      return;
    }
    if (!this.checkUploadComplete()) {
      setTimeout(() => {
        console.log("LOOP 14");
        this.pushDBFormat(DBFormat);
      }, 200);
    } else {
      for (let bin in this.DBFormat) {
        for (let fid in this.DBFormat[bin]) {
          //take out years
          if (Number(bin) == -4) {
            this.portalYearsSelected = cloneDeep(this.DBFormat[bin][fid][0]);
            this.portalYearsOnly = cloneDeep(this.DBFormat[bin][fid][0]);
            delete this.DBFormat[bin];
          } else {
            var currentFid = cloneDeep(this.DBFormat[bin][fid][1]);
            this.FIDBID[fid] = bin;
            try {
              this.FIDCreationOrder[bin] = this.FIDCreationOrder[bin].concat([
                fid
              ]);
            } catch (e) {}
            if (this.DBFormat[bin][fid][0].length > 0) {
              currentFid[String(-1 * Number(bin))] = this.DBFormat[bin][fid][0];
              //club handeling
              if (String(bin) == "-2") {
                this.teamPortalActiveClubID = cloneDeep(
                  this.DBFormat[bin][fid][0][0]
                );

                this.teamPortalSelected = this.teamsMap[
                  this.teamPortalActiveClubID
                ];
              }
              //player handeling
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
        if (this.checkUploadComplete()) {
          this.updateRDURL();
        } else {
          setTimeout(() => {
            console.log("LOOP 15");
            this.updateRDURL();
          }, 500);
        }
      } catch (e) {}

      this.saveAndSend();
    }
    return true;
  }

  /**
   * THIS FUNCTION WILL TAKE IN A JSON OF:
   * [BIN, ATT ID, [VALUES]]
   * removes content of a bin if a filter is being added
   * removes filter content if the value is empty ex. ["-11","10092",[]]
   *  sample input [["-2","2",["1024","1026"]],["-11","10092",["10000001"]]]
   *
   * adds filter to staged working query then pushes
   *
   * @param filters Array of filters and values to insert into the strucutre
   */
  loadJSON(filters: any) {
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
            // check if PKID
            if (Number(add[1]) * -1 == Number(add[0])) {
              this.removeExplicit(active, add[0]);
            } else {
              this.removeAttributes(active, add[0], [add[1]]);
            }
          }
        }
      }
      //Year handeling
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

  /**
   * CLEAN Up filters for single club
   * go through active filters and delete if in club bin and replace with last selected club
   */
  reduceFiltersSingleClub() {
    var tempDict = {};
    if (this.workingQuery["-2"]) {
      tempDict = cloneDeep(this.workingQuery["-2"]);
    }

    tempDict["2"] = [cloneDeep(this.teamPortalActiveClubID)];
    var add = this.removeExplicitFilters("-2", this.teamPortalActiveClubID);
    if (add) {
      this.workingQuery["-2"] = tempDict;
      console.log();
    }
  }

  /**
   * WHEN CLICKING ON PLAYER PAGE TAKE OUT ALL OTHER PLAYERS
   */
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

  /**
   * REMOVE AN EXPLICIT BASED ON THE INPUT BIN
   * @param bin BIN ID
   * @param keepExplicit Which value to keep
   */
  removeExplicitFilters(bin: any, keepExplicit: any) {
    if (!this.DBFormat[bin]) {
      return true;
    }
    var returnBool = true;
    var alteredDBFormat = cloneDeep(this.DBFormat);
    for (let fid in alteredDBFormat[bin]) {
      //going through each fid in the bin check if the keep explicit is there and then delete or modify
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

    //copy old working and FID to push it back onto the variables so they dont get cleared if filtes pop is open
    var oldWorkingQuery = cloneDeep(this.workingQuery);
    var oldWorkingFID = cloneDeep(this.workingFID);
    var oldForm = cloneDeep(this.form);
    //push modified db format to the active filters
    if (!this.checkDBFormats(alteredDBFormat, cloneDeep(this.DBFormat))) {
      this.pushDBFormat(alteredDBFormat);
    }

    this.workingQuery = oldWorkingQuery;
    this.workingFID = oldWorkingFID;
    this.form = oldForm;
    return returnBool;
  }

  /**
   * REMOVE EXPLICITS FROM THE ACTIVE FILTERS based on FID and BIN
   * @param fid Filter ID
   * @param bin BIN ID
   */
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
    //delete from working query if its being edited as well
    if (String(this.workingFID[bin]) == String(fid)) {
      oldWorkingFID[bin] = "";
      delete oldWorkingQuery[bin][String(Number(bin) * -1)];
      this.form.controls[String(Number(bin) * -1)].setValue(null);
    }
    //push changes and reset the staged variables after being edited
    this.pushDBFormat(alteredDBFormat);
    this.workingQuery = oldWorkingQuery;
    this.workingFID = oldWorkingFID;
    this.form = oldForm;
  }

  /**
   * remove given attributes from a FID give the bin
   * @param fid Filter ID
   * @param bin Bin ID
   * @param atts List of attribute ID's to delete
   */
  removeAttributes(fid: any, bin: any, atts: any[]) {
    if (Object.keys(this.fidCashMapFIDtoID).indexOf(fid) != -1) {
      //perform delete from cash variables if needed
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
    //reset attributes from working query
    for (let att of atts) {
      delete this.workingQuery[bin][att];
      if (this.form.value[String(att) + "search"] != null) {
        this.form.controls[String(att) + "search"].setValue(null);
      }
      this.form.controls[String(att)].setValue(null);
    }
  }

  /**
   * SET THE ACTIVE CLUB ID AND OBJECT BY SEARCHING THE FID's
   */
  setActiveClub() {
    var notFound = true;
    try {
      for (let activeFID in this.FIDBID) {
        if (String(this.FIDBID[activeFID]) == "-2") {
          //if BIN IS RIGHT
          if ("2" in this.FIDs[activeFID] || 2 in this.FIDs[activeFID]) {
            //IF ATTRIBUTE IS RIGHT
            try {
              this.teamPortalActiveClubID = this.FIDs[activeFID]["2"][0];
            } catch (e) {
              this.teamPortalActiveClubID = this.FIDs[activeFID][2][0];
            }
            this.teamPortalSelected = this.teamsMap[
              this.teamPortalActiveClubID
            ];
            notFound = false;
          }
        }
      }
      //default
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
    } catch (e) {}
  }

  /**
   * SET THE ACTIVE PLAYER ID AND OBJECT BY SEARCHING THE FID's
   */
  setActivePlayer() {
    try {
      var notFound = true;
      for (let activeFID in this.FIDBID) {
        if (String(this.FIDBID[activeFID]) == "-3") {
          //if BIN IS RIGHT
          if ("3" in this.FIDs[activeFID] || 3 in this.FIDs[activeFID]) {
            //IF ATTRIBUTE IS RIGHT
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
      //DEFAULT
      if (notFound) {
        this.playerPortalActivePlayerID = "";
        this.playerPortalSelected = {
          Label: "Player Select"
        };
      } else {
      }
    } catch (e) {}
  }

  /**
   * Return the string to be displayed in the html containing the years selected
   * only does range of years
   * gets min and max
   * ex. selecting 2019,2020,2021 will display 2019 - 2021
   */
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

  /**
   * Set highlighting of the year based on selected or not
   * @param year
   */
  setStyleYearSelect(year: any) {
    let styles =
      this.portalYearsOnly.indexOf(year) != -1
        ? {
            backgroundColor: "rgb(80, 80, 80)",
            color: "white"
          }
        : {
            backgroundColor: "white",
            color: "black"
          };
    return styles;
  }

  /**
   * ON CLOSE OF THE YEAR SELECT SEND UP
   * IF the years have changed then update the fitlers through save and send
   */
  portalYearDisplayClose() {
    if (this.portalYearUpdated) {
      this.saveAndSend();
      this.portalYearUpdated = false;
    }
  }

  /**
   * Toggle the years selected in the portals
   * Sort the years so the display function works
   * @param year year being toggled
   */
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

  /**
   * CHANGE THE TYPE 4 (MIN MAX) INPUT
   * minMax True = min, false = max
   * value is number input
   * @param attribute Attribute ID
   * @param value Value to put in
   * @param minMax If its inserted into min or max slot
   */
  changeType4Input(attribute: any, value: any, minMax: boolean) {
    var bin = this.pullAttribute[attribute]["BinID"];
    var previous = [null, null];
    var tempValue = null;
    var returnArr;
    if (JSON.stringify(value) != "") {
      tempValue = cloneDeep(value);
    }

    //get previous
    if (this.workingQuery[bin][attribute]) {
      var previous = cloneDeep(this.workingQuery[bin][attribute]);
    }
    //place in correct spot
    if (minMax) {
      returnArr = [tempValue, previous[1]];
    } else {
      returnArr = [previous[0], tempValue];
    }
    //make sure its nulls and not empty strings
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

  /**
   * CHANGE THE TYPE 8 (Start End) Date INPUT
   * minMax True = first date, false = last date
   * value is date input
   * for calendar select so time adjustments are made for consistency
   * operates like max and min
   * @param attribute
   * @param value
   * @param minMax
   */
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

  /**
   * Handel text inpur converting to a date format usable in the DB
   * @param attribute Attribute ID
   * @param value value to change
   * @param minMax bool to pass through for which selection it is
   */
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

  /**
   * change type7 basic input
   * @param attribute Attribute ID
   * @param value Value to put in
   */
  changeType7Input(attribute: any, value: any) {
    var bin = this.pullAttribute[attribute]["BinID"];
    if (value == "") {
      this.clearSingleIDWorking(attribute, bin);
    } else {
      this.form.controls[attribute].setValue([value]);
      this.type0change(attribute, [value], bin);
    }
  }

  /**
   * Take a hex color and percent change and returns new hex color
   * @param color HEx color to alter
   * @param percentInput Percent to alter hex color
   */
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

  /**
   * Change a color based on hue value shading
   * @param color HUE color  form hsl(222,22%,50%)
   * @param valuechange Percent to change along the hue
   */
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

  /**
   * Convert color name to hex
   * @param colour color name string
   */
  colorNameToHex(colour) {
    if (typeof colours[colour.toLowerCase()] != "undefined")
      return colours[colour.toLowerCase()];

    return false;
  }

  /**
   * Initiates full screen mode
   */
  fullScreenOn() {
    try {
      document.getElementById("iframe").className = "fullScreen";
      this.fullScreenMode = true;
      this.updateRDURL();
    } catch (e) {}
  }

  /**
   * Exits full screen mode
   */
  fullScreenOff() {
    document.getElementById("iframe").className = "";
    this.fullScreenMode = false;
    this.updateRDURL();
  }

  /**
   * Get spinner position for top club bar information (offset is based on order they are to be displayed)
   * @param input Object for spinner on club top bar
   */
  setStyleSpinner(input: any) {
    var offset = (Number(input["OrderID"]) - 1) * 68;
    let styles = {
      position: "fixed",
      "margin-left": String(offset) + "px"
    };
    return styles;
  }

  /**
   * RETURN CLUB SPECIFICS OR NULL
   * @param location location ID for the portal bar
   */
  getClubSpecifics(location) {
    try {
      return this.clubSpecifics[String(location)];
    } catch (e) {
      return [];
    }
  }
  /**
   * RETURN PLAYER SPECIFICS OR NULL
   * @param location location ID for the portal bar
   */
  getPlayerSpecifics(location) {
    try {
      return this.playerSpecifics[String(location)];
    } catch (e) {
      return [];
    }
  }

  /**
   * Pull updated club info based on active club id
   * construct mapping correctly of club specifics {Location:[DataObjects]}
   */
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

  /**
   * Pull updated player info based on active player id
   * construct mapping correctly of player specifics {Location:[DataObjects]}
   */
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

  /**
   * To return an attribute value from an object
   * @param obj Object
   * @param text attribute to get
   */
  getLabel(obj: any, text: string) {
    try {
      return obj[text];
    } catch (e) {
      return "";
    }
  }

  /**
   * Set the color of an object for NgStyle
   * @param obj Object (must have attribute 'Color' otherwise color is black)
   */
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

  /**
   * Set the color style and the style of the box
   *
   * @param obj Portal Bar object
   */
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

  /**
   * Return text name from "first last" to "last, first"
   * @param text name in from of "John Smith"
   */
  transformName(text: string) {
    if (text.includes(" ")) {
      var split = text.split(" ");
      return split[1] + ", " + split[0];
    } else {
      return null;
    }
  }

  /**
   * Get the options for an attribute type
   * Special case for id == "3" (players)
   * @param id Attribute ID
   */
  type0Options(id: any) {
    if (String(id) == "3") {
      return this.playersToDisplay;
    } else {
      return this.pullValueMap[String(id)];
    }
  }

  /**
   * Open or go to a link
   * @param url Url string for either new tab or current tab depending on the code commented out below
   */
  goToLink(url: string) {
    //catch for network issue and how the application is being accessed
    if (document.location.hostname.includes("sail.raiders.com")) {
      url = url.replace(
        "http://oakcmsreports01.raiders.com:88",
        "https://sail.raiders.com"
      );
    } else {
      url = url.replace(
        "https://sail.raiders.com",
        "http://oakcmsreports01.raiders.com:88"
      );
    }

    this.globalSearchShowSuggestions = false;

    //for new window uncomment this line below
    var newWindow = window.open(url);

    //for same window uncomment this code section below
    // var urlAltered = url.split(".raiders.com:88")[1]; //may need to change this line depending on routing
    // urlAltered = urlAltered.split("%5B").join("[");
    // urlAltered = urlAltered.split("%5D").join("]");
    // urlAltered = urlAltered.split("%22").join('"');
    // urlAltered = urlAltered.split("%2C").join(",");
    //this.router.navigate([urlAltered]);
  }

  /**
   * For KeyValue pipe to order pairs
   * This case they are orderd by Label (i.e. alphabetical)
   */
  labelOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["Label"] < b.value["Label"]
      ? -1
      : b.value["Label"] < a.value["Label"]
      ? 1
      : 0;
  };

  /**
   * Toggle open/close settings menu in top bar
   */
  toggleTopMenuDropDown() {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * From settings menu route to the report uploader page
   */
  routeReportUploader() {
    this.router.navigate(["report-upload"]);
    for (let category in this.getReportHeaders(1)) {
      document.getElementById(
        category.toString() + "reportHighlightid"
      ).className = "sidebutton";
    }
    var portals = ["club", "player", "cash", "fa-hypo"];

    for (let port in portals) {
      document.getElementById(portals[port] + "id").className = "sidebutton";
    }
    this.toggleTopMenuDropDown();
  }

  /**
   * Pipe input function to return the item in the reverse order specified by the attribute "OrderID"
   */
  reverseKeyOrder = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    return a.value["OrderID"] > b.value["OrderID"]
      ? -1
      : b.value["OrderID"] > a.value["OrderID"]
      ? 1
      : 0;
  };

  /**
   * Pipe input function to return the item in the order specified by the attribute "OrderID"
   */
  valueOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["OrderID"] < b.value["OrderID"]
      ? -1
      : b.value["OrderID"] < a.value["OrderID"]
      ? 1
      : 0;
  };
}
