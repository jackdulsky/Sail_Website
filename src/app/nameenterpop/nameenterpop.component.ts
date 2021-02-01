import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-nameenterpop",
  templateUrl: "./nameenterpop.component.html",
  styleUrls: ["./nameenterpop.component.css"]
})
export class NameenterpopComponent implements OnInit {
  public form: FormGroup;
  constructor(
    public filterService: FiltersService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<NameenterpopComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  /**
   * Init form parts and import a name if it exists
   */
  ngOnInit() {
    // this.filterService.getBulkImport();

    this.form = this.fb.group({});
    this.form.addControl("name", new FormControl());

    this.form.addControl("description", new FormControl());
    //SET EXISTING NAME IF EXISTS
    if (this.data.previousName != "") {
      this.form.controls["name"].setValue(this.data.previousName);

      this.form.controls["description"].setValue(this.data.previousName);
    }
  }

  /**
   * Close Module
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * Return name and description on save & close
   */
  save() {
    this.dialogRef.close({
      name: this.form.value.name,
      description: this.form.value.description
    });
  }
}
