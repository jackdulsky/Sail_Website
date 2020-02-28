import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FilterspopComponent } from "../filterspop/filterspop.component";
import { FiltersService } from "../filters.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { NameenterpopComponent } from "../nameenterpop/nameenterpop.component";
import { PullDataService } from "../pull-data.service";
import * as cloneDeep from "lodash/cloneDeep";
import { Router, ActivatedRoute } from "@angular/router";
import { KeyValue } from "@angular/common";

@Component({
  selector: "app-filter-bar",
  templateUrl: "./filter-bar.component.html",
  styleUrls: ["./filter-bar.component.css"]
})
export class FilterBarComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public filterService: FiltersService,
    public pullData: PullDataService,
    public cdref: ChangeDetectorRef,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  playCount = "0"; //non funcitonal count of plays (eventually on save and send the db returns play count)

  location = "Folder";
  noFolderAlert = false; //for XOS Saving
  folderSelected = false; //for XOS saving

  filterOpen = false; //is filters pop open bool

  ngOnInit() {
    this.filterService.getBulkImport();
  }
  ngAfterInit() {}

  /**
   * Open entire filter page (if open then change bin)
   * @param selected selected is bin to open up the filters pop with
   */
  openFilterPage(selected: string) {
    if (!this.filterOpen) {
      this.filterService.setPlayers();
      //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "100vw";
      dialogConfig.maxWidth = "100vw";
      dialogConfig.autoFocus = true;
      dialogConfig.position = { top: "104px", left: "200px" };
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

        this.filterService.pushQueryToActiveFilter("0");
      });
    } else {
      //change the bin selected
      this.filterService.changelevel2(selected);
    }
  }

  /**
   * used to check if one fid in a bin for how to display the filter
   * @param key check if there is only one key
   */
  checkKeys(key: any) {
    return Object.keys(key.value).length == 1;
  }

  /**
   *
   * @param element id of attribute to get the label of
   */
  getNavElLabel(element: any) {
    if (this.filterService.checkUploadComplete()) {
      try {
        return this.filterService.pullNavigationElement[element]["Label"];
      } catch (e) {}
    } else {
      setTimeout(() => {
        console.log("LOOP 50");
        return this.getNavElLabel(element);
      }, 200);
    }
  }

  /**
   * THIS OPENS A SINGLE QUERY IN THE FILTER PAGE
   *
   * @param fid  FID number as a string
   * @param query the dictionary of attributes to selected values (all strings)
   */
  singleOpen(fid: string, query: any) {
    //SET WORKING DICTIONARY, WORKINGBIN, AND WORKINGFID
    var bin = cloneDeep(this.filterService.FIDBID[fid]);
    var old = document.getElementById(
      "tier1Tab" + cloneDeep(this.filterService.filterBinSelected)
    );
    this.filterService.filterBinSelected = bin;
    for (let id in this.filterService.workingQuery[bin]) {
      this.filterService.form.controls[id].setValue(null);
    }
    this.filterService.workingQuery[bin] = cloneDeep(query);
    this.filterService.workingFID[bin] = cloneDeep(fid);

    //SET THE FORM CONTROL
    for (let id in this.filterService.workingQuery[bin]) {
      this.filterService.form.controls[id].setValue(
        this.filterService.workingQuery[bin][id]
      );
    }

    //IF FILTER PAGE IS OPEN ALREADY SWITCH THE DISPLAY
    if (this.filterOpen) {
      old.setAttribute(
        "style",
        "background-color: white;border-bottom: 4px solid white"
      );

      this.filterService.filterBinSelected = bin;
      var newTab = document.getElementById("tier1Tab" + bin);

      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    }
    this.openFilterPage(bin);
    this.filterService.show = "";
    this.filterService.setPlayers(this.filterService.combinedJSONstring());
  }

  /**
   * This is for clicking on an explicit filter in the top bar
   * It will load the fid and navigate to it appropriately
   * @param fid Filter ID
   * @param query clicking on exlicit opens filters pop
   * @param bin Bin ID
   */
  singleOpenExp(fid: any, query: any, bin: any) {
    if (this.filterOpen) {
      this.filterService.changelevel2(String(bin));
      for (let id in this.filterService.workingQuery[bin]) {
        this.filterService.form.controls[id].setValue(null);
      }
      this.filterService.workingQuery[bin] = cloneDeep(query);

      this.filterService.workingFID[bin] = cloneDeep(fid);

      //SET THE FORM CONTROL
      for (let id in this.filterService.workingQuery[bin]) {
        this.filterService.form.controls[id].setValue(
          this.filterService.workingQuery[bin][id]
        );
      }
      this.filterService.setPlayers(this.filterService.combinedJSONstring());
    } else {
      this.singleOpen(fid, query);
    }
  }

  /**
   * OPEN SINGLE PANEL
   * @param fid Filter ID
   * @param query query to be added to working
   * @param att attribute ID
   * @param bin Bin ID
   */
  singleOpenAtt(fid: any, query: any, att: any, bin: any) {
    if (this.filterOpen) {
      for (let id in this.filterService.workingQuery[bin]) {
        this.filterService.form.controls[id].setValue(null);
      }
      this.filterService.workingQuery[bin] = cloneDeep(query);

      this.filterService.workingFID[bin] = cloneDeep(fid);

      //SET THE FORM CONTROL
      for (let id in this.filterService.workingQuery[bin]) {
        this.filterService.form.controls[id].setValue(
          this.filterService.workingQuery[bin][id]
        );
      }
      this.filterService.setPlayers(this.filterService.combinedJSONstring());
    } else {
      this.singleOpen(fid, query);
    }
    this.filterService.navigateToAttribute(bin, String(att));
  }

  /**
   * Function for opening the select xos folder pop up module
   * This is not fully implemented yet and there currently exists not call to this function
   * this call will open the module correctly yet the selecting in the pop up is not 100% working
   */
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

  /**
   * Clear all filter information and queries
   */
  clearAll() {
    this.filterService.clearAll();
  }

  /**
   * SAVE FILTER / OPEN UP NAME POP UP MODAL
   * After close will save the filter to DB with name and desc
   * will set active name being used now
   */
  saveFilter() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "auto";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "175px", left: "15%" };
    dialogConfig.data = {
      previousName: this.filterService.getName(),
      previousDescription: null
    };

    const dialogRef = this.dialog.open(NameenterpopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
        console.log("Saving", data.name, data.description);
        this.filterService.saveFilter(data.name, data.description);
        this.filterService.setName(data.name);
      }
    });
  }

  /**
   * Return the panel to att mapping for a single query in a bin
   * this way we can show panels on top with attributes in the middle when only one fid in a bin
   * @param attsMap mapping of attributes to value list
   */
  createSingleQueryPanelAttributeMap(attsMap: any) {
    var panelMap = {};
    try {
      for (let att in attsMap) {
        var panel = this.filterService.pullNavigation[att]["ParentItemID"];
        if (panelMap[panel]) {
          panelMap[panel] = panelMap[panel].concat([att]);
        } else {
          panelMap[panel] = [att];
        }
      }
    } catch (e) {}
    return panelMap;
  }

  /**
   * GET EXPLICIT VALUES String Labels
   * limit length 100,
   * @param values list of explicit ID's
   * @param bin Bin ID
   */
  getExplicitValues(values: any, bin: any) {
    var dispName = "";
    try {
      var att = String(Number(bin) * -1);
      for (let val in values) {
        dispName +=
          ", " + this.filterService.pullValueMap[att][values[val]]["Label"];
        if (dispName.length > 100) {
          break;
        }
      }
      while (dispName.charAt(0) == ",") {
        dispName = dispName.substr(2);
      }
    } catch (e) {}
    return dispName;
  }

  /**
   * GET NON EXPLICIT VALUES String Labels, panels or Atts
   * return label of navigation elements
   * @param values list of id's in the filter strucutre that are panels or attributes
   */
  getAttOrPanelStringsValues(values: any) {
    var dispName = "";
    try {
      for (let val in values) {
        dispName +=
          ", " + this.filterService.pullNavigationElement[values[val]]["Label"];
        if (dispName.length > 100) {
          break;
        }
      }
      while (dispName.charAt(0) == ",") {
        dispName = dispName.substr(2);
      }
    } catch (e) {}
    return dispName;
  }

  /**
   * Get bottom of combined explicit labels and panels/attributes
   * @param fid Filter ID
   * @param contents mapping of attributes to values (comes from db format {bin:{fid: content}})
   */
  getMultipleQueryBottomString(fid: any, contents: any) {
    var dispName = "";
    try {
      if (contents[0].length != 0) {
        dispName = this.getExplicitValues(
          contents[0],
          this.filterService.FIDBID[fid]
        );
      }
      var potentialAdd = this.getAttOrPanelStringsValues(
        Object.keys(contents[1])
      );
      if (String(potentialAdd) != "") {
        dispName += ", " + potentialAdd;
      }
      while (dispName.charAt(0) == ",") {
        dispName = dispName.substr(2);
      }
    } catch (e) {}
    return dispName;
  }

  /**
   * RETURN THE STRING LABEL OF THE OBJECT PASSED IN
   * ONLY USED BECAUSE OF BINDING ACCESS OF STRING EVALUATION
   *
   * @param obj Object with Label attribute
   */
  returnlabel(obj: any) {
    return obj["Label"];
  }

  /**
   * REMOVE A SINGLE QUERY BY HITTING X
   * @param fid Filter ID
   */
  removeQuery(fid: string) {
    this.filterService.removeQuery(fid);
  }

  /**
   * ORDER SIDE BUTTONS ON THEIR ORDER ID
   * Use fid creation order
   */
  valueOrderFIDs = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    var bin = this.filterService.FIDBID[a.key];
    return this.filterService.FIDCreationOrder[bin].indexOf(a.key) <
      this.filterService.FIDCreationOrder[bin].indexOf(b.key)
      ? -1
      : this.filterService.FIDCreationOrder[bin].indexOf(b.key) <
        this.filterService.FIDCreationOrder[bin].indexOf(a.key)
      ? 1
      : 0;
  };
}
