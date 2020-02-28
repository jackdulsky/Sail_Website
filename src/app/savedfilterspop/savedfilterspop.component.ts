import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup } from "@angular/forms";
import { PullDataService } from "../pull-data.service";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-savedfilterspop",
  templateUrl: "./savedfilterspop.component.html",
  styleUrls: ["./savedfilterspop.component.css"]
})
export class SavedfilterspopComponent implements OnInit {
  public form: FormGroup;
  savedOptions;
  justSelected: string;
  constructor(
    public filterService: FiltersService,
    public pullData: PullDataService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<SavedfilterspopComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Init filters that are saved and the form
   */
  ngOnInit() {
    this.form = this.fb.group({});
    this.pullSavedList();
  }
  /**
   * Get the most recent saved filters
   */
  pullSavedList() {
    this.pullData.getSavedFilters().subscribe(data => {
      this.savedOptions = data;
    });
  }

  /**
   * CLOSE WITH SELECTED PASSED BACK
   */
  close() {
    this.dialogRef.close({ folderID: this.justSelected });
  }

  /**
   * Upload the filters to the current filter set
   * @param filter JSON string in dbformat structure
   */
  pushDBFormat(filter: string) {
    this.filterService.pushDBFormat(JSON.parse(filter));
    this.dialogRef.close();
  }
  /**
   * Convert UTC string to dispaly string
   * @param date date in UTC string form
   */
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
