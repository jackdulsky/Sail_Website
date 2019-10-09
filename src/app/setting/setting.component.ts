import { Component, OnInit } from "@angular/core";
import { PullDataService } from "../pull-data.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.css"]
})
export class SettingComponent implements OnInit {
  data = null;
  data1 = null;
  constructor(private dbconn: PullDataService, private http: HttpClient) {}

  ngOnInit(): void {}
  Check() {}
}
