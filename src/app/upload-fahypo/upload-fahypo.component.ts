import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup } from "@angular/forms";
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
  constructor(
    public filterService: FiltersService,
    public pullData: PullDataService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<UploadFAHYPOComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Init the form and pull the most recent scenarios saved
   */
  ngOnInit() {
    this.form = this.fb.group({});
    this.pullSavedList();
  }

  /**
   * pull saved scenarios
   */
  pullSavedList() {
    this.pullData.pullHypoScenario().subscribe(data => {
      this.filterService.faHypoScenarios = cloneDeep(data);
      this.savedOptions = cloneDeep(data);
    });
  }
  /**
   * close the pop up
   */
  close() {
    this.dialogRef.close({ scenario: 0 });
  }
  /**
   * close the pop up
   */
  save() {
    this.dialogRef.close({ scenario: 0 });
  }

  /**
   * Selecting a scenario will call this function to set the name and description of currently editing.
   * @param item Object scenario to upload
   */
  pushScenario(item: any) {
    this.dialogRef.close({
      scenario: item.ScenarioID,
      name: item.Label,
      desc: item.ScenarioDesc,
      Budget_Target: Number(item.Budget_Target),
      Budget_Signings: Number(item.Budget_Signings),
      Budget_Replacements: Number(item.Budget_Replacements),
      Budget_PSquad: Number(item.Budget_PSquad)
    });
  }
  /**
   * Change DB data string to nice visible format
   * @param date utc string
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
