import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { PullDataService } from "../pull-data.service";
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
  ) {}

  ngOnInit() {
    this.form = this.fb.group({});
    this.form.addControl("enter", new FormControl());
    //SET EXISTING NAME IF EXISTS
    if (this.data.previousName != "") {
      this.form.controls["enter"].setValue(this.data.previousName);
    }
  }
  //CLOSE MODULE
  close() {
    this.dialogRef.close();
  }
  //RETURN NAME ON CLOSE
  save() {
    this.dialogRef.close({ name: this.form.value.enter });
  }
}
