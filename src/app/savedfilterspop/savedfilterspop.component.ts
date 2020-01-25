import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { PullDataService } from "../pull-data.service";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-savedfilterspop",
  templateUrl: "./savedfilterspop.component.html",
  styleUrls: ["./savedfilterspop.component.css"]
})
export class SavedfilterspopComponent implements OnInit {
  public form: FormGroup;
  my_menu: string[] = ["USERS"];
  savedOptions;
  options: { [name: string]: string } = {};
  visible: { [name: string]: boolean } = { USERS: true };
  justSelected: string;
  constructor(
    public filterService: FiltersService,
    public pullData: PullDataService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<SavedfilterspopComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // this.filterService.getBulkImport();

    this.form = this.fb.group({});
    this.pullSavedList();
    // this.my_menu = Object.keys(this.savedOptions);
  }
  pullSavedList() {
    this.pullData.getSavedFilters().subscribe(data => {
      console.log("SAVED IMPORT", data);
      this.savedOptions = data;
    });
  }

  //CLOSE WITH SELECTED PASSED BACK
  close() {
    this.dialogRef.close({ folderID: this.justSelected });
  }

  //CLOSE THE DIALOG BUT UPLOAD THE SAVED FILTERS SELECTED
  //uploadSavedFilter IS NOT FUNCTIONAL
  save() {
    // this.filterService.uploadSavedFilter(
    //   this.justSelected,
    //   this.savedOptions[this.justSelected]["name"],
    //   this.savedOptions[this.justSelected]["filters"]
    // );

    this.dialogRef.close();
  }

  //NO RECURSIVE DATA STRUCTURE
  selectFilter(name: string) {
    this.justSelected = name;
    document.getElementById(name).className = "itemSelected but mat-button";
    document.getElementById(name + "ico").className = "space fa fa-folder-open";
  }

  pushDBFormat(filter: string) {
    this.filterService.pushDBFormat(JSON.parse(filter));
    this.dialogRef.close();
  }
  convertSQLDateStringtoDisplayFormat(date: string) {
    if (date == null) {
      return "";
    }
    var year = date.substring(0, 4);
    var month = date.substring(5, 7);
    var day = date.substring(8, 10);
    var dispalyed = month + "/" + day + "/" + year;
    return dispalyed;
  }
}
