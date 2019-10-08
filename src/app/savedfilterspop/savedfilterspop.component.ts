import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { PullDataTestService } from "../pull-data-test.service";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-savedfilterspop",
  templateUrl: "./savedfilterspop.component.html",
  styleUrls: ["./savedfilterspop.component.css"]
})
export class SavedfilterspopComponent implements OnInit {
  public form: FormGroup;
  my_menu: string[] = ["USERS"];
  savedOptions: { [name: string]: {} };
  options: { [name: string]: string[] } = {};
  visible: { [name: string]: boolean } = { USERS: true };
  justSelected: string;
  constructor(
    private filterService: FiltersService,
    public pullData: PullDataTestService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<SavedfilterspopComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.form = this.fb.group({});
    this.savedOptions = this.pullData.getSavedFilters();
    this.my_menu = Object.keys(this.savedOptions);
  }

  close() {
    this.dialogRef.close({ folderID: this.justSelected });
  }
  save() {
    this.filterService.uploadSavedFilter(
      this.justSelected,
      this.savedOptions[this.justSelected]["name"],
      this.savedOptions[this.justSelected]["filters"]
    );

    this.dialogRef.close({ folderID: this.justSelected });
  }
  selectFilter(name: string) {
    this.justSelected = name;
    document.getElementById(name).className = "itemSelected but mat-button";
    document.getElementById(name + "ico").className = "space fa fa-folder-open";
  }
}
