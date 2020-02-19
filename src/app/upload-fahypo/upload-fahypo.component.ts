import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { PullDataService } from "../pull-data.service";
import { FiltersService } from "../filters.service";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-upload-fahypo",
  templateUrl: "./upload-fahypo.component.html",
  styleUrls: ["./upload-fahypo.component.css"]
})
export class UploadFAHYPOComponent implements OnInit {
  public form: FormGroup;
  savedOptions;
  options: { [name: string]: string } = {};
  visible: { [name: string]: boolean } = { USERS: true };

  constructor(
    public filterService: FiltersService,
    public pullData: PullDataService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<UploadFAHYPOComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.form = this.fb.group({});
    this.pullSavedList();
  }

  pullSavedList() {
    this.pullData.pullHypoScenario().subscribe(data => {
      this.filterService.faHypoScenarios = cloneDeep(data);
      this.savedOptions = cloneDeep(data);
      console.log(this.savedOptions);
    });
  }
  close() {
    this.dialogRef.close({ scenario: 0 });
  }
  save() {
    this.dialogRef.close({ scenario: 0 });
  }

  //NO RECURSIVE DATA STRUCTURE

  pushScenario(item: any) {
    this.dialogRef.close({
      scenario: item.ScenarioID,
      name: item.Label,
      desc: item.ScenarioDesc,
      Budget_Target: item.Budget_Target,
      Budget_Signings: item.Budget_Signings,
      Budget_Replacements: item.Budget_Replacements
    });
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
