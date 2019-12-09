import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-menu-item",
  templateUrl: "./menu-item.component.html",
  styleUrls: ["./menu-item.component.css"]
})
export class MenuItemComponent implements OnInit {
  @Input() items: any[];
  @ViewChild("childMenu", { static: false }) public childMenu;
  constructor(public filterService: FiltersService) {}

  ngOnInit() {
    //console.log("INIT MENU - ITEM", this.items);
  }
}
