import { Component, OnInit, Inject, ɵConsole } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import { KeyValue } from "@angular/common";

@Component({
  selector: "app-attribute-selection",
  templateUrl: "./attribute-selection.component.html",
  styleUrls: ["./attribute-selection.component.css"]
})
export class AttributeSelectionComponent implements OnInit {
  constructor(
    public pullData: PullDataService,
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
    this.panels = [this.bid];
  }

  close() {
    this.dialogRef.close();
  }

  //RETURNS LABEL
  returnlabel(obj: any) {
    return obj["Label"];
  }

  //THIS OPENS UP NEW PANELS AND CONTROLS CLOSING OLD ONES UPON A CLICK
  attributeSelected(att: string) {
    var newPanels = [];
    var first = this.panels[0];
    var level = this.filterService.pullStructure[first];

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
      document.getElementById("selectKey" + turnoff).style.visibility =
        "hidden";

      document.getElementById("buttonContainer" + turnoff).style.borderLeft =
        "4px solid white";
      document.getElementById(
        "buttonContainer" + turnoff
      ).style.backgroundColor = "white";
    }

    //ADD TO PANEL OR SHOW THE SELECTION FORM
    if (this.filterService.pullNavigationElement[att]["IsAttribute"] == true) {
      this.show = att;
    } else {
      newPanels.push(att);
      this.show = "";
    }
    //RECONSTRUCT THE PANELS THROUGH ADDING THE BIN PANEL BACK AT THE BEGINNING
    this.panels = [first].concat(newPanels);

    //DONT SET THE NEW PANEL TO NEW PANEL NECESSARILY BUT CHANGE CSS TO SELECTED
    if (document.getElementById("selectKey" + att)) {
      document.getElementById("selectKey" + att).style.visibility = "visible";
      document.getElementById("buttonContainer" + att).style.backgroundColor =
        "#f2f2f2";
      document.getElementById("buttonContainer" + att).style.borderLeft =
        "4px solid lightskyblue";
    }
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

  //TOGGLE ALL FILTER SELECTIONS THEN CALL TYPE0CHANGE ON THE FORM VALUES
  toggleAllSelections(id: string, tf: boolean) {
    if (tf) {
      this.filterService.form.controls[id].setValue(
        Object.keys(this.filterService.pullValueMap[id])
      );
    } else {
      this.filterService.form.controls[id].setValue(null);
    }
    this.type0change(id);
  }

  //ORDER SIDE BUTTONS ON THEIR ORDER ID
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

  //ORDER OPTIONS
  //***NOT IMPLEMENTED IN THE HTML PIPE YET *****/
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

  ///Type 0 INPUT
  //ALSO FUNCTIONS AS THE GENERIC SAVING FILTER FORMS OF OTHER TYPES
  //ONCE THE FORM VALUE IS SET APPROPRIATELY
  type0change(formKey) {
    this.filterService.type0change(
      formKey,
      this.filterService.form.value[formKey],
      this.bid
    );
  }

  //CLOSES THE POP UP AND PUSHES WORKING QUERY TO ACTIVE
  save() {
    this.filterService.addWorkingQuery(this.bid);
    this.close();
  }
}
