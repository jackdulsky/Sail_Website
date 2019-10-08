import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { PullDataTestService } from "../pull-data-test.service";

@Component({
  selector: "app-folderselectpop",
  templateUrl: "./folderselectpop.component.html",
  styleUrls: ["./folderselectpop.component.css"]
})
export class FolderselectpopComponent implements OnInit {
  public form: FormGroup;
  idToName: { [id: string]: string } = {
    "00000000-0000-0000-0000-000000000000": "root"
  };
  my_menu: string[] = ["00000000-0000-0000-0000-000000000000"];
  // options: { [name: string]: string[] } = {
  //   vertebrates: ["2a"],
  //   invertebrates: ["2b", "2b"],
  //   "2a": ["3a", "3a"],
  //   "2b": ["3b", "3b"]
  // };
  options: { [name: string]: string[] } = {};
  visible: { [name: string]: boolean } = {
    "00000000-0000-0000-0000-000000000000": true
  };
  justSelected: string;
  constructor(
    public pullData: PullDataTestService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<FolderselectpopComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.form = this.fb.group({});
  }

  close() {
    this.dialogRef.close();
  }
  save() {
    this.dialogRef.close({ folderID: this.idToName[this.justSelected] });
  }
  expand(name: string) {
    //remove the highlighting on the previously selected
    document.getElementById(name).className = "itemSelected but mat-button";
    document.getElementById(name + "ico").className = "space fa fa-folder-open";

    if (this.justSelected) {
      document.getElementById(this.justSelected).className =
        "mat-button item but";
      document.getElementById(this.justSelected + "ico").className =
        "space fa fa-folder-o";
    }

    //download next tier add to the option

    //if the subfolders exist
    if (name in this.options) {
      //set childrent to visible
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
    //change selection highlighting

    this.justSelected = name;
  }
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
        console.log("no exist");
      }
    });
  }
}
