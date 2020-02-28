import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-saving-fahypo",
  templateUrl: "./saving-fahypo.component.html",
  styleUrls: ["./saving-fahypo.component.css"]
})
export class SavingFAHYPOComponent implements OnInit {
  public form: FormGroup;
  constructor(
    public filterService: FiltersService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<SavingFAHYPOComponent>,
    //take in any data passed to dialog as variable called data
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Init form parts and import a name if it exists
   */
  ngOnInit() {
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
