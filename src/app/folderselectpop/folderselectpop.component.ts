import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { PullDataService } from "../pull-data.service";

@Component({
  selector: "app-folderselectpop",
  templateUrl: "./folderselectpop.component.html",
  styleUrls: ["./folderselectpop.component.css"]
})
export class FolderselectpopComponent implements OnInit {
  //map of folder id to visible name
  idToName: { [id: string]: string } = {
    "00000000-0000-0000-0000-000000000000": "root"
  };
  // start of drop down menu
  my_menu: string[] = ["00000000-0000-0000-0000-000000000000"];
  //parent to child map
  options: { [name: string]: string[] } = {};
  //boolean if its visible
  visible: { [name: string]: boolean } = {
    "00000000-0000-0000-0000-000000000000": true
  };
  //last selected folder
  justSelected: string;
  constructor(
    public pullData: PullDataService,

    public dialogRef: MatDialogRef<FolderselectpopComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  /**
   * CLOSE MODULE
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * CLOSE WITH SELECTION AND PASS BACK SELECTED
   */
  save() {
    this.dialogRef.close({ folderID: this.idToName[this.justSelected] });
  }

  /**
   * OPEN NEW LEVEL OF FOLDERS
   * @param name folder id
   */
  expand(name: string) {
    //REMOVE THE HIGHLIGHTING ON THE PREVIOUSLY SELECTED FOLDER
    document.getElementById(name).className = "itemSelected but mat-button";
    document.getElementById(name + "ico").className = "space fa fa-folder-open";

    //TURN OFF OLD ONE
    if (this.justSelected) {
      document.getElementById(this.justSelected).className =
        "mat-button item but";
      document.getElementById(this.justSelected + "ico").className =
        "space fa fa-folder-o";
    }

    //download next tier add to the option

    //IF CHILDREN EXIST ALREADY
    if (name in this.options) {
      //SET CHILDREN TO VISIBLE
      var first;
      for (let nameChild of this.options[name]) {
        first = nameChild;
        break;
      }
      if (this.visible[first]) {
        this.setChildHidden(name);
        document.getElementById(name + "ico").className =
          "space fa fa-folder-o";
      } else {
        for (let nameChild of this.options[name]) {
          this.visible[nameChild] = true;
        }
        document.getElementById(name + "ico").className =
          "space fa fa-folder-open";
        document.getElementById(name).className = "itemSelected but mat-button";
      }
    } else {
      //else if the options is visible and

      if (name != this.justSelected) {
        this.getLevel(name);
      }
    }

    this.justSelected = name;
  }

  /**
   * recursively set the children of a fold to closed
   * @param name
   */
  setChildHidden(name: string) {
    if (name in this.options) {
      for (let nameChild of this.options[name]) {
        this.visible[nameChild] = false;
        this.setChildHidden(nameChild);
      }
    } else {
      this.visible[name] = false;
    }
  }

  /**
   * GET THE NEXT LEVEL OF THE DATA AND INSERT INTO THE LOCAL STRUCUTRES
   * @param name folder ID to get children of
   */
  getLevel(name: string) {
    this.pullData.getSubFolders(name).subscribe(data => {
      var nextLevel = [];
      if (data != []) {
        for (let sub in data) {
          var newID = data[sub].ObjectID;
          nextLevel = nextLevel.concat([newID]);
          this.visible[newID] = true;
          this.idToName[newID] = data[sub].DisplayName;
        }
        this.options[name] = nextLevel;
      } else {
        console.log("NO SUB FOLDERS EXIST");
      }
    });
  }
}
