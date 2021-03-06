import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,

} from "@angular/core";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import { ChangeDetectorRef } from "@angular/core";
import { BodyComponent } from "../body/body.component";
import { MatMenuTrigger } from "@angular/material";
import { FormBuilder, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { SlideInOutAnimation } from "../animations";

@Component({
  selector: "app-cash",
  templateUrl: "./cash.component.html",
  styleUrls: ["./cash.component.css"],
  animations: [SlideInOutAnimation],
  encapsulation: ViewEncapsulation.None
})
export class CashComponent implements OnInit {
  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;

  constructor(
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public pullData: PullDataService,
    public router: Router,
    public body: BodyComponent,
    public cdref: ChangeDetectorRef,
    public fb: FormBuilder
  ) {
    document.addEventListener("click", e => this.onClick(e));
  }


  cashTabSelected;//Which tab is selected


  Label = "Label";

  //The four id's associated with the filters on top
  positionFilterID;
  agentFilterID;
  companyFilterID;
  FAStatusFilterID;
  showFilters;


  yearListAnimationState = "out"; //State variable for transition of opening year drop down
  showYear = false;//if the year selection drop down is open



  /**
   * Init function to get the ID's of the filters to show
   */
  ngOnInit() {
    this.cdref.detectChanges();

    this.initFunction();
  }
  initFunction() {
    try {
      this.body.portalHighlight("cash");
    } catch (e) { }
    if (
      this.filterService.checkUploadComplete()
    ) {
      //find the id's of the filters to show
      //they are hard coded
      for (let att in this.filterService.pullStructure["-3"]["300"]) {
        try {
          if (this.filterService.pullAttribute[att]["Label"] == "Position") {
            this.positionFilterID = att;
          }
          if (this.filterService.pullAttribute[att]["Label"] == "Agent") {
            this.agentFilterID = att;
          }
          if (this.filterService.pullAttribute[att]["Label"] == "Agent Comp.") {
            this.companyFilterID = att;
          }
          if (this.filterService.pullAttribute[att]["Label"] == "FA Status") {
            this.FAStatusFilterID = att;
          }
        } catch (e) { }

        //init the form for the cash tab
        this.filterService.formCash.addControl(att, new FormControl());
        this.filterService.formCash.addControl(
          att + "search",
          new FormControl()
        );
      }

      this.showFilters = [
        this.positionFilterID,
        this.agentFilterID,
        this.companyFilterID,
        this.FAStatusFilterID
      ];

      //initialize the fid mapping if there does not already exist one for these variables
      //essentially we want to edit FID's if they have these filters associated 
      if (!this.filterService.fidCashMap[this.positionFilterID]) {
        this.filterService.fidCashMap[this.positionFilterID] = "-301";
        this.filterService.fidCashMapFIDtoID["-301"] = this.positionFilterID;
      }
      if (!this.filterService.fidCashMap[this.agentFilterID]) {
        this.filterService.fidCashMap[this.agentFilterID] = "-302";
        this.filterService.fidCashMapFIDtoID["-302"] = this.agentFilterID;
      }
      if (!this.filterService.fidCashMap[this.companyFilterID]) {
        this.filterService.fidCashMapFIDtoID["-303"] = this.companyFilterID;
        this.filterService.fidCashMap[this.companyFilterID] = "-303";
      }
      if (!this.filterService.fidCashMap[this.FAStatusFilterID]) {
        this.filterService.fidCashMapFIDtoID["-304"] = this.FAStatusFilterID;
        this.filterService.fidCashMap[this.FAStatusFilterID] = "-304";
      }

      //get tabs and order them by Order ID, then init first one
      var tabs = this.filterService.getReportHeaders(4);
      this.cashTabSelected = Object.keys(tabs).sort(function (a, b) {
        return tabs[a]["OrderID"] < tabs[b]["OrderID"]
          ? -1
          : tabs[b]["OrderID"] < tabs[a]["OrderID"]
            ? 1
            : 0;
      })[0];

      //reroute appropriately
      try {
        if (this.router.url.includes("/report")) {
          document.getElementById("fullScreenButton").className = "fullScreen";

          this.cashTabSelected = this.filterService.reportReportsOnly[
            this.router.url.split("/report/")[1]
          ]["TabID"];
        }
        if (this.router.url.includes("/base-reports")) {
          this.cashTabSelected = this.router.url.split("/base-reports/")[1];
        }
      } catch (e) { }
      this.performHighlightOrSubRoute();
    } else {
      setTimeout(() => {
        console.log("LOOP 8");
        this.initFunction();
      }, 200);
    }
  }


  /**
   * Time out recursive method to highlight the correct tab being displayed
   * Highlight is called if its showing a report
   * If it has base in url then must reroute to base report to display properly
   */
  performHighlightOrSubRoute() {
    if (this.filterService.checkUploadComplete()) {
      if (
        Object.keys(this.filterService.getReportHeaders(4)).indexOf(
          String(this.cashTabSelected)
        ) != -1 &&
        this.router.url.includes("base")
      ) {
        this.subRoute(this.cashTabSelected);
      } else {
        this.justHighlight(this.cashTabSelected);
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 9");
        this.performHighlightOrSubRoute();
      }, 200);
    }
  }


  /**
   * HIGHLIGHT A TAB, USED FOR INIT ON REPORT
   * @param name tab number to highlight 
   */
  justHighlight(name: any) {
    if (document.getElementById(name + "cashBarHighlightid")) {
      var newTab = document.getElementById(name + "cashBarHighlightid");
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid lightskyblue";
    } else {
      setTimeout(() => {
        console.log("LOOP 10", name);
        this.justHighlight(this.cashTabSelected);
      }, 100);
    }
  }


  /**
   * This function will route to reports page or display the report
   * Case on what to do whether it is a list of reports or a report tab
   * 
   * @param name tab number to route to
   */
  subRoute(name: any) {
    //Get rid of old
    try {
      var old = document.getElementById(
        String(this.cashTabSelected) + "cashBarHighlightid"
      );
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
    } catch (e) { }

    this.cashTabSelected = name;
    //color new
    setTimeout(() => {
      try {
        var newTab = document.getElementById(name + "cashBarHighlightid");
        newTab.style.backgroundColor = "#f2f2f2";
        newTab.style.borderBottom = "4px solid lightskyblue";
      } catch (e) { }
    }, 1);

    //Route Appropriately

    try {
      if (this.filterService.reportTabs[name]["IsList"] == 0) {
        var reportID = Object.keys(
          this.filterService.reportReportsStructure[name]
        )[0];
        this.router.navigate(["./report", String(reportID)], {
          relativeTo: this.route
        });
        document.getElementById("fullScreenButton").className = "fullScreen";
      } else {
        this.filterService.selected = name;

        this.router.navigate(["./base-reports", String(name)], {
          relativeTo: this.route
        });
        document.getElementById("fullScreenButton").className =
          "fullScreenInactive";
      }
    } catch (e) { }
  }

  /**
   * If control is held during click then open new tab otherwise reroute
   * @param e click event
   * @param name tab number clicked
   */
  tabClicked(e: any, name: any) {
    if (e.ctrlKey) {
      var url = this.router.url.split("/");
      var number = name;
      var base = "";

      //case for report tab or list tab
      if (this.filterService.reportTabs[name]["IsList"] == 0) {
        number = Object.keys(
          this.filterService.reportReportsStructure[name]
        )[0];
        base = "report";
      } else {
        base = "base-reports";
      }
      this.filterService.goToLink(
        this.filterService.onSiteAccessURL +
        "/" +
        url[1] +
        "/" +
        url[2] +
        "/" +
        url[3] +
        "/" +
        base +
        "/" +
        number
      );
    } else {
      this.subRoute(name);
    }
  }

  /**
   * Open/close the year dropdown slect
   */
  showYearList() {
    this.showYear = !this.showYear;
    this.toggleShowDiv("yearList");
    if (!this.showYear) {
      this.filterService.portalYearDisplayClose();
    }
  }
  /**
   * Change animation state
   * @param divName string to match up for changing animation state
   */
  toggleShowDiv(divName: string) {
    if (divName === "yearList") {
      this.yearListAnimationState =
        this.yearListAnimationState === "out" ? "in" : "out";
    }
  }

  /**
   * This function will take in an click event and 
   * check its target and close the year drop down if clicked out of the year box
   * @param event click event
   */
  onClick(event) {
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var value;
    if (idAttr) {
      value = idAttr.nodeValue;
    } else {
      value = "";
    }
    if (this.showYear && !value.toLowerCase().includes("year")) {
      this.showYearList();
    }
  }

  /**
   * Toggle menu open for hover over Position
   */
  openMyMenu() {
    this.trigger.toggleMenu();
  }
  /**
   * Close menu 
   */
  closeMyMenu() {
    this.trigger.closeMenu();
  }

  //Position is -301
  //Agent is -302
  //Company is -303

  /**
   * Push changes to filters selected to the DBFormat
   * Similar function for filtersService but because of the mirrored filters
   * other operations need to be done
   * @param formKey ID of attribute
   * @param bin Bin ID
   */
  type0change(formKey, bin) {
    var newFIDNumber = this.filterService.fidCashMap[formKey];
    if (
      this.filterService.formCash.value[formKey] == null ||
      JSON.stringify(this.filterService.formCash.value[formKey]) == "[]"
    ) {//if empty delete the fid
      this.filterService.removeQuery(newFIDNumber);
    } else {
      var att = {};
      att[formKey] = this.filterService.formCash.value[formKey];
      var oldDB = cloneDeep(this.filterService.DBFormat);

      //add to order inserted
      this.filterService.FIDCreationOrder[
        bin
      ] = this.filterService.FIDCreationOrder[bin].concat([newFIDNumber]);

      //init dbformat for the bin if need be
      //push to FIDs and FIDBID
      var pkID = [];
      this.filterService.FIDs[newFIDNumber] = Object.assign({}, cloneDeep(att));
      this.filterService.FIDBID[newFIDNumber] = bin;
      if (!this.filterService.DBFormat[bin]) {
        this.filterService.DBFormat[bin] = {};
      }

      var FID = [];
      this.filterService.DBFormat[bin][newFIDNumber] = [pkID, att, FID];

      //IF there was a change then update the filter and then push to DB
      if (
        !this.filterService.checkDBFormats(
          oldDB,
          cloneDeep(this.filterService.DBFormat)
        )
      ) {
        this.filterService.saveAndSend();
        this.filterService.updateRDURL();
      }
    }
  }

  /**
   * Toggle for UI TYPE 5 (Position Select)
   * @param id FIlter Attribute ID
   * @param key value to insert or delete
   */
  toggleNestedSelect(id: any, key: any) {
    var oldValue: String[] = cloneDeep(this.filterService.formCash.value[id]);
    if (oldValue == null) {
      this.filterService.formCash.controls[id].setValue([String(key)]);
    } else {
      if (
        this.filterService.formCash.value[id] != null &&
        this.filterService.formCash.value[id].indexOf(String(key)) != -1
      ) {
        this.filterService.formCash.controls[id].setValue(
          oldValue.filter(x => x != String(key))
        );
      } else {
        this.filterService.formCash.controls[id].setValue(
          oldValue.concat([String(key)])
        );
      }
    }
    this.type0change(id, "-3");
  }
}
