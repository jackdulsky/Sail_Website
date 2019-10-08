import { Component, OnInit, Inject, ɵConsole } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FiltersService } from "../filters.service";
import { PullDataTestService } from "../pull-data-test.service";
import { KeyValue } from "@angular/common";

@Component({
  selector: "app-attribute-selection",
  templateUrl: "./attribute-selection.component.html",
  styleUrls: ["./attribute-selection.component.css"]
})
export class AttributeSelectionComponent implements OnInit {
  constructor(
    public pullData: PullDataTestService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<AttributeSelectionComponent>,
    public filterService: FiltersService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.bid = data.bid;
  }

  //////VARIABLES
  title;
  bid;
  newAttributeStructure;
  newValueMap;
  newAttribute;
  newGroup;
  form;
  formG;
  Label = "Label";
  selectedPath;
  show: string = "";
  panels: string[] = [];
  pkID: string[] = [];
  attributes: { [id: string]: string[] } = {};

  //////LIFE CYCLE HOOKS
  ngOnInit() {
    //this.form = this.fb.group({});
    //this.formG = this.fb.group({});
    this.panels = [this.bid];
    this.getNewContents();
    console.log("PANELS1", this.panels);
  }

  close() {
    this.dialogRef.close();
  }

  //////FUNCTIONS

  //pull in filter meta data
  getNewContents() {}

  //Returns label (hack around passing in strings to html evaluation)
  returnlabel(obj: any) {
    return obj["Label"];
  }

  attributeSelected(att: string) {
    // var old = this.panels[this.panels.length - 1];
    // console.log("old", old, this.panels);
    // if (old != this.bid && old != att && old != "") {
    //   if (document.getElementById("selectKey" + old)) {
    //     document.getElementById("selectKey" + old).style.visibility = "hidden";
    //     document.getElementById("firstname" + old).style.borderLeft = "";
    //     document.getElementById("buttonContainer" + old).style.backgroundColor =
    //       "white";
    //   }
    // }
    var newPanels = [];
    //var level = this.newAttributeStructure;
    var first = this.panels[0];
    var level = this.filterService.pullStructure[first];

    var toTurnOff = [];
    var addtoOff = false;
    console.log("START PANELS", this.panels);
    console.log("ATT", att);
    console.log("SHOW", this.show);

    for (let panel of this.panels.slice(1).concat([this.show])) {
      console.log("LEVEL", level, level.hasOwnProperty(panel), panel);
      if (level.hasOwnProperty(panel) || addtoOff) {
        addtoOff = true;
        if (panel != "") {
          console.log("TURNING OFF ADD", panel);
          toTurnOff.push(panel);
        }
      } else {
        if (panel != "") {
          console.log("TURNING ON ADD", panel);
          newPanels.push(panel);
        }
      }
      level = level[panel];
    }
    console.log(toTurnOff, this.panels, [first].concat(newPanels));
    for (let turnoff of toTurnOff) {
      document.getElementById("selectKey" + turnoff).style.visibility =
        "hidden";

      document.getElementById("buttonContainer" + turnoff).style.borderLeft =
        "4px solid white";
      document.getElementById(
        "buttonContainer" + turnoff
      ).style.backgroundColor = "white";
    }
    if (this.filterService.pullNavigationElement[att]["IsAttribute"] == true) {
      this.openSelection(att);
    } else {
      newPanels.push(att);
      this.show = "";
    }
    this.panels = [first].concat(newPanels);
    if (document.getElementById("selectKey" + att)) {
      document.getElementById("selectKey" + att).style.visibility = "visible";
      document.getElementById("buttonContainer" + att).style.backgroundColor =
        "#f2f2f2";
      document.getElementById("buttonContainer" + att).style.borderLeft =
        "4px solid lightskyblue";
    }
    console.log("End Panels", this.panels);
  }

  //open up the selection gui, query data if necessary
  openSelection(att: string) {
    this.show = att;
    //add to the form
  }
  getPanelOptions(att: string) {
    var disp = this.filterService.pullStructure;
    for (let level of this.panels.slice(0, -1)) {
      if (level == att) {
        break;
      }
      disp = disp[level];
    }
    disp = disp[att];
    return disp;
  }
  updateSingleFilter(category: string) {}

  //for the select filter toggle all options available
  toggleAllSelections(id: string, tf: boolean) {
    console.log(
      "TOGGLE ALL",
      id,
      tf,
      Object.keys(this.filterService.pullValueMap[id])
    );
    if (tf) {
      this.filterService.form.controls[id].setValue(
        Object.keys(this.filterService.pullValueMap[id])
      );
    } else {
      this.filterService.form.controls[id].setValue(null);
      //this.filterService.testDelete(id);
    }
    console.log(this.filterService.form.value);
    this.type0change(id);
  }
  valueOrderSideButtons = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    console.log(
      this.filterService.pullAttribute[a.key]["OrderID"],
      this.filterService.pullAttribute[b.key]["OrderID"]
    );
    return this.filterService.pullAttribute[a.key]["OrderID"] <
      this.filterService.pullAttribute[b.key]["OrderID"]
      ? -1
      : this.filterService.pullAttribute[b.key]["OrderID"] <
        this.filterService.pullAttribute[a.key]["OrderID"]
      ? 1
      : 0;
  };
  valueOrderOptions = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    console.log(
      this.filterService.pullValueMap[a.key]["OrderID"],
      this.filterService.pullValueMap[b.key]["OrderID"]
    );
    return this.filterService.pullValueMap[a.key]["OrderID"] <
      this.filterService.pullValueMap[b.key]["OrderID"]
      ? -1
      : this.filterService.pullValueMap[b.key]["OrderID"] <
        this.filterService.pullValueMap[a.key]["OrderID"]
      ? 1
      : 0;
  };

  //locally save / remove  a filter into query as it is being built
  //not for FID's
  // localNormalAdd(att: string, value: string) {
  //   if (this.newAttribute[att]["pkid"] == "1") {
  //     if (this.pkID.indexOf(value) == -1) {
  //       this.pkID.push(value);
  //     }
  //   } else {
  //     if (this.attributes[att]) {
  //       if (this.attributes[att].indexOf(value) == -1) {
  //         this.attributes[att] = this.attributes[att].concat([value]);
  //       }
  //     } else {
  //       this.attributes[att] = [value];
  //     }
  //   }
  //   console.log(this.pkID);
  //   console.log(this.attributes);
  // }
  // localNormalRemove(att: string, value: string) {
  //   if (this.newAttribute[att]["pkid"] == "1") {
  //     this.pkID = this.pkID.filter(id => id != value);
  //   } else {
  //     if (this.attributes[att] && this.attributes[att].indexOf(value) == 1) {
  //       this.attributes[att] = this.attributes[att].filter(id => id != value);
  //     }
  //     if (this.attributes[att] == []) {
  //       delete this.attributes[att];
  //     }
  //   }
  // }

  /////EVERY TYPE OF INPUT HAS A SPECIAL ADD LOCALLY
  ///
  ///
  ///Type 0: normal search select
  type0change(formKey) {
    console.log(
      "CLICKED ON SELECT ",
      formKey,
      this.filterService.form.value[formKey]
    );
    this.filterService.type0change(
      formKey,
      this.filterService.form.value[formKey],
      this.bid
    );
  }

  //this will save a single query (or filter set)
  save() {
    ///
    ///code to add the query to overall filters
    ///
    this.filterService.addWorkingQuery(this.bid);
    console.log("DONE ADDING WORKING QUERY");
    //this.filterService.addQuery(this.bid, this.pkID, this.attributes, []);
    this.close();
  }

  createLeagueImages(league: string) {
    console.log();
    return (
      "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos/" +
      league +
      ".png"
    );
  }
}
