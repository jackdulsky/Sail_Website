import { Component, OnInit } from "@angular/core";
import { TradeToolComponent } from "../trade-tool/trade-tool.component";
import { fadeInItems } from "@angular/material";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-trade-history",
  templateUrl: "./trade-history.component.html",
  styleUrls: ["./trade-history.component.css"],
  providers: [TradeToolComponent]
})
export class TradeHistoryComponent implements OnInit {
  constructor(
    public tradeTool: TradeToolComponent,
    public filterService: FiltersService
  ) {
    this.tradeTool.ngOnInit();
  }

  offers;
  offersMap = {};
  negotiations;
  negotiationsMap = {};
  displayingOffers = {};
  clickedNegotiation = -1;
  highTrade;
  mediumTrade;
  lowTrade;
  defaultCounter = { TradeText: "", PointDiff: "" };
  pickOrderToPickID;
  firstSelectionMade = false;
  ngOnInit() {
    this.highTrade = this.defaultCounter;
    this.mediumTrade = this.defaultCounter;
    this.lowTrade = this.defaultCounter;
    this.filterService.pullData.pullDraftOffers().subscribe(data => {
      this.offers = data;
    });
    this.filterService.pullData.pullDraftNegotiations().subscribe(data => {
      this.negotiations = data;
      // console.log("RAW", data);
    });
    this.init();
  }
  init() {
    if (
      this.tradeTool.uploadingPicks ||
      this.negotiations == null ||
      this.offers == null
    ) {
      setTimeout(() => {
        console.log("LOOP 52");
        this.init();
      }, 100);
    } else {
      this.offers.forEach(element => {
        element["OrderID"] = element["OfferID"];
        element["OfferedClubURL"] =
          element["OfferClubID"] == 13
            ? this.tradeTool.raiders.ClubImageURL
            : element.ClubImageURL;
        this.offersMap[element["OfferID"]] = element;
      });
      this.negotiations.forEach(element => {
        element["OrderID"] = element["OfferID"];
        this.negotiationsMap[element["NegotiationID"]] = element;
      });
    }
  }

  /**
   * Get the offer ID of the active offer
   * @param negotiation
   */
  getActiveOffer(negotiation: number) {
    if (
      this.tradeTool.uploadingPicks &&
      this.negotiations == null &&
      this.offers == null
    ) {
      setTimeout(() => {
        console.log("LOOP 51");
        this.getActiveOffer(negotiation);
      }, 100);
    } else {
      var offer = { OfferCode: 0, TradeText: "", OfferID: 0 };
      Object.keys(this.offersMap).forEach(offerID => {
        if (
          this.offersMap[offerID].OfferCode > 0 &&
          this.offersMap[offerID].NegotiationID == negotiation &&
          this.offersMap[offerID].OfferID > offer.OfferID
        ) {
          offer = this.offersMap[offerID];
        }
      });

      return offer;
    }
  }

  /**
   * set active negotiation
   * set active offer
   * @param negotiation Negotiation ID number
   * @param offerID Offer ID number
   */
  selectNegotiation(negotiation: number) {
    this.highTrade = this.defaultCounter;
    this.mediumTrade = this.defaultCounter;
    this.lowTrade = this.defaultCounter;
    this.clickedNegotiation = negotiation;

    this.highTrade = this.getCounters(-3);
    this.mediumTrade = this.getCounters(-2);
    this.lowTrade = this.getCounters(-1);
    this.displayingOffers = this.getOffers(this.clickedNegotiation);
    this.firstSelectionMade = true;
  }

  /**
   * Return the offer color for which one is active
   * @param active 1 == on 0 == off
   */
  getActiveBackground(active: boolean) {
    if (active) {
      return this.getNegotiationBackground(this.clickedNegotiation);
    } else {
      return { backgroundColor: "grey" };
    }
  }

  /**
   * if active do checking
   * @param active bool if active offer
   */
  getOfferTextColor(active) {
    if (active) {
      return this.getNegotiationTextColor(this.clickedNegotiation);
    } else {
      return { color: "white" };
    }
  }

  getBG(team) {
    try {
      return { backgroundColor: team.ClubColor1 };
    } catch (e) {
      return {};
    }
  }

  getTextInvert(team) {
    var styles = {};
    try {
      var bgCol = team.ClubColor1;

      var c = bgCol.substring(1); // strip #
      var rgb = parseInt(c, 16); // convert rrggbb to decimal
      var r = (rgb >> 16) & 0xff; // extract red
      var g = (rgb >> 8) & 0xff; // extract green
      var b = (rgb >> 0) & 0xff; // extract blue

      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
      if (luma < 65) {
        //Threshold of 65 was chosen, you cn see how otehr cutoffs work by playing around on the report uploader where its the same threshold
        // pick a different colour
        styles["filter"] = "invert(1)";
      }
    } catch (e) {}
    return styles;
  }

  /**
   * Return the color of the team if selected
   * @param negotiation
   */
  getNegotiationBackground(negotiation: number) {
    var styles = {};
    if (negotiation == this.clickedNegotiation) {
      var bgCol = this.negotiationsMap[this.clickedNegotiation].ClubColor1;
      styles["backgroundColor"] = bgCol;
    }

    return styles;
  }

  /**
   * invert text color if needed
   * @param negotiation negotiation ID
   */
  getNegotiationTextColor(negotiation: number) {
    var styles = {};
    if (negotiation == this.clickedNegotiation) {
      var bgCol = this.negotiationsMap[this.clickedNegotiation].ClubColor1;

      var c = bgCol.substring(1); // strip #
      var rgb = parseInt(c, 16); // convert rrggbb to decimal
      var r = (rgb >> 16) & 0xff; // extract red
      var g = (rgb >> 8) & 0xff; // extract green
      var b = (rgb >> 0) & 0xff; // extract blue

      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
      if (luma < 65) {
        //Threshold of 65 was chosen, you cn see how otehr cutoffs work by playing around on the report uploader where its the same threshold
        // pick a different colour
        styles["filter"] = "invert(1)";
      }
    }
    return styles;
  }

  /**
   * get offers from clicked negotiation
   */
  getOffers(negotiation) {
    var offers = {};
    var keys = Object.keys(this.offersMap);
    if (keys.length == 0) {
      return {};
    }
    keys.forEach(key => {
      if (
        this.offersMap[key].NegotiationID == negotiation &&
        this.offersMap[key].OfferCode > 0
      ) {
        offers[key] = this.offersMap[key];
      }
    });
    return offers;
  }

  /**
   * get high medium and low offers
   */
  getCounters(option: number) {
    var keys = Object.keys(this.offersMap);
    if (keys.length == 0) {
      return "";
    }
    var offer = { TradeText: "", PointDiff: "" };
    keys.forEach(key => {
      if (
        this.offersMap[key].NegotiationID == this.clickedNegotiation &&
        this.offersMap[key].OfferCode == option
      ) {
        offer = this.offersMap[key];
      }
    });
    return offer;
  }

  /**
   * get the background color based on index for the
   */
}
