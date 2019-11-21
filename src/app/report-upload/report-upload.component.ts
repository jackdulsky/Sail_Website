import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import {
  DomSanitizer,
  SafeUrl,
  ɵELEMENT_PROBE_PROVIDERS__POST_R3__
} from "@angular/platform-browser";
@Component({
  selector: "app-report-upload",
  templateUrl: "./report-upload.component.html",
  styleUrls: ["./report-upload.component.css"]
})
export class ReportUploadComponent implements OnInit {
  template = {
    Label: "",
    IsTab: 0,
    IsList: 0,
    LocationID: 1,

    ParentTabID: 0,
    ViewID: "",
    IconUrl:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png",
    Color: "#FFFFFF"
  };
  yesnoTab = { 0: "No", 1: "Yes" };
  yesnoList = { 0: "No", 1: "Yes" };

  profileForm = new FormGroup({
    firstName: new FormControl(""),
    lastName: new FormControl("")
  });
  color = "Primary";
  checked = false;

  icons = {
    Cash2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Cash2.png",

    Cash3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Cash3.png",

    Cash4:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Cash4.png",

    Chart1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png",

    Chart2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart2.png",

    Chart5:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart5.png",

    Clock2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Clock2.png",

    Clock3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Clock3.png",

    Database1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Database1.png",

    Database2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Database2.png",

    Excel1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Excel1.jpg",

    Excel2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Excel2.png",

    Line1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Line1.png",

    PDF1: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/PDF1.png",

    PDF2: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/PDF2.ico",

    PDF3: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/PDF3.png",

    Pie1: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Pie1.png",

    Pie2: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Pie2.png",

    Report1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Report1.png",

    Report2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Report2.png",

    Table1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table1.png",

    Table2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table2.png",

    Table3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table3.png",

    Table4:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table4.png",

    Time1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Time1.png",

    XOS1: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/XOS1.png"
  };
  icons2 = [
    "bus_front_view.svg",
    "calendar.svg",
    "call.svg",
    "chart.svg",
    "chess.svg",
    "clock.svg",
    "cloud.svg",
    "clouds.svg",
    "clouds_sun.svg",
    "cloud_down.svg",
    "cloud_up.svg",
    "code.svg",
    "connection_pattern.svg",
    "container.svg",
    "contrast.svg",
    "cunnect.svg",
    "cut_corner.svg",
    "dashboard.svg",
    "database_system.svg",
    "delete.svg",
    "desktop.svg",
    "dice.svg",
    "directory_arrow_down.svg",
    "directory_arrow_up.svg",
    "directory_favorite.svg",
    "directory_image.svg",
    "directory_locked.svg",
    "directory_search.svg",
    "dollar.svg",
    "download.svg",
    "downloader.py",
    "duplicate_round.svg",
    "edit_cover.svg",
    "email.svg",
    "file.svg",
    "fileboard_checklist.svg",
    "file_arrow_down.svg",
    "file_arrow_up.svg",
    "file_doc.svg",
    "file_image.svg",
    "file_pdf.svg",
    "file_player_media.svg",
    "file_svg.svg",
    "file_text_data.svg",
    "file_txt.svg",
    "file_zip.svg",
    "finish_line.svg",
    "gallery_grid_view.svg",
    "game_controller_round.svg",
    "google.svg",
    "grid.svg",
    "grid_system.svg",
    "home.svg",
    "IconList.csv",
    "IconList.xlsx",
    "image_picture.svg",
    "inbox_up_round.svg",
    "key.svg",
    "link_round.svg",
    "list.svg",
    "lock_open_round.svg",
    "map_round.svg",
    "megaphone.svg",
    "message.svg",
    "microphone.svg",
    "microsoft.svg",
    "money_round.svg",
    "moon.svg",
    "mouse.svg",
    "movie_frames.svg",
    "network_3.svg",
    "news_grid.svg",
    "notebook.svg",
    "notification_bell.svg",
    "object_alignment.svg",
    "option_bar_settings.svg",
    "pac-man.svg",
    "pen.svg",
    "pin_sharp_circle.svg",
    "play.svg",
    "plus_circle.svg",
    "printer.svg",
    "profile.svg",
    "profile_image.svg",
    "projector.svg",
    "radio_tower.svg",
    "record.svg",
    "rings.svg",
    "road_round.svg",
    "rss_cover.svg",
    "ruler#1_round.svg",
    "satellite.svg",
    "save_item.svg",
    "script.svg",
    "search_left.svg",
    "settings.svg",
    "share.svg",
    "ship_round.svg",
    "showcase_round.svg",
    "shuffle.svg",
    "shut_down.svg",
    "signal.svg",
    "stairs.svg",
    "star.svg",
    "star_favorite.svg",
    "stats.svg",
    "steering_wheel.svg",
    "swords.svg",
    "syringe.svg",
    "tag_round.svg",
    "target.svg",
    "tetrix.svg",
    "thermometer.svg",
    "toggle_button_round.svg",
    "umbrella_round.svg",
    "video_camera_round.svg",
    "watch_round.svg",
    "youtube.svg",
    "zoom_in.svg"
  ];

  constructor(
    public filterService: FiltersService,
    public sanitizer: DomSanitizer,
    public pullData: PullDataService
  ) {}
  report;
  ngOnInit() {
    this.report = cloneDeep(this.template);
    for (let icon of this.icons2) {
      this.icons[icon.slice(0, icon.length - 4)] =
        "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/" + icon;
    }
  }
  onSubmit() {
    console.log(JSON.stringify(this.report));
    this.pullData.pushNewReport(JSON.stringify(this.report)).subscribe(data => {
    });
  }
  resetForm() {
    this.report = cloneDeep(this.template);
  }

  //Set the view sample icon images and background color
  setSampleStyle() {
    let styles = {
      "background-repeat": "no-repeat,no-repeat",
      "background-position": "center",
      "background-size": "140px 140px,cover",
      "background-image":
        "url(" +
        this.report.IconUrl +
        "), linear-gradient(" +
        this.filterService.shadeColor(this.report.Color, 75) +
        "," +
        this.report.Color +
        ")"
    };
    return styles;
  }
}
