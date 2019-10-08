import { Component, OnInit } from "@angular/core";
import { PullDataTestService } from "../pull-data-test.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.css"]
})
export class SettingComponent implements OnInit {
  data = null;
  data1 = null;
  constructor(private dbconn: PullDataTestService, private http: HttpClient) {}

  ngOnInit(): void {
    // this.dbconn.getTest().subscribe(res => this.data = res)
    // this.data = new Map(Object.entries(this.dbconn.getTest1()));
    //this.data = dat.substring(1, dat.length - 1).split(",");
    //console.log(this.data1, typeof this.data1);
    //this.data = this.data.substring(1,this.data.length-1);
    //    this.data = this.dbconn.getTest1();
  }
  Check() {
    console.log(this.data[0].playerID, typeof this.data[0].playerID);
  }
}
