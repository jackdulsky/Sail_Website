import { Component, OnInit } from "@angular/core";
import { PullDataService } from "../pull-data.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: "app-newpage",
  templateUrl: "./newpage.component.html",
  styleUrls: ["./newpage.component.css"]
})
export class NewpageComponent implements OnInit {
  constructor(
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    var guid = this.pullData.GUID;
    console.log("BEFORE", String(guid), this.router.url);
    this.router.navigate(["/home/" + String(guid) + this.router.url]);
    console.log("AFTER", String(guid), this.router.url);
  }
}
