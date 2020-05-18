import { Component, OnInit } from "@angular/core";
import { TradeToolComponent } from "../trade-tool/trade-tool.component";
import { fadeInItems } from "@angular/material";
import { FiltersService } from "../filters.service";
import { DraftComponent } from "../draft/draft.component";

@Component({
  selector: "app-trade-history",
  templateUrl: "./trade-history.component.html",
  styleUrls: ["./trade-history.component.css"],
  providers: [TradeToolComponent]
})
export class TradeHistoryComponent implements OnInit {
  constructor(
    public tradeTool: TradeToolComponent,
    public filterService: FiltersService,
    public draft: DraftComponent
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
  firstFalseReload = false;
  ngOnInit() {
    this.highTrade = this.defaultCounter;
    this.mediumTrade = this.defaultCounter;
    this.lowTrade = this.defaultCounter;
    this.draft.currentOffers.subscribe(value => {
      if (value != "") {
        console.log("OFFERS LOADED");
        if (this.firstFalseReload == true) {
          this.pullOffersAndNeogiations(true);
        } else {
          this.firstFalseReload = true;
          this.pullOffersAndNeogiations();
        }
      }
    });
  }

  pullOffersAndNeogiations(reload = false) {
    this.filterService.pullData.pullDraftOffers().subscribe(data => {
      this.offers = data;
      this.offersMap = {};
      this.offers.forEach(element => {
        element["OrderID"] = element["OfferID"];
        this.offersMap[element["OfferID"]] = element;
      });
      if (reload) {
        this.selectNegotiation(this.clickedNegotiation);
      }
    });
    this.filterService.pullData.pullDraftNegotiations().subscribe(data => {
      this.negotiations = data;
      this.negotiationsMap = {};
      this.negotiations.forEach(element => {
        this.negotiationsMap[element["NegotiationID"]] = element;
      });
    });
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
      try {
        Object.keys(this.offersMap).forEach(offerID => {
          if (
            this.offersMap[offerID].OfferCode > 0 &&
            this.offersMap[offerID].NegotiationID == negotiation &&
            this.offersMap[offerID].OfferID > offer.OfferID
          ) {
            offer = this.offersMap[offerID];
          }
        });
      } catch (e) {}

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
   * @offer offer object
   */
  getActiveBackground(active: boolean, offer) {
    if (active) {
      return offer["OfferClubID"] != 13
        ? this.getNegotiationBackground(this.clickedNegotiation)
        : { backgroundColor: "#333333" };
    } else {
      return { backgroundColor: "#a09e9e" };
    }
  }

  /**
   * if active do checking
   * @param active bool if active offer
   */
  getOfferTextColor(active) {
    if (active) {
      return { color: "white" };
      // return this.getNegotiationTextColor(this.clickedNegotiation);
    } else {
      return { color: "black" };
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

    styles["filter"] = "invert(1)";

    return styles;
  }

  /**
   * Return the color of the team if selected
   * @param negotiation
   */
  getNegotiationBackground(negotiation: number) {
    var styles = {};
    if (negotiation < 0) {
      return { backgroundColor: "#F0F2F5" };
    }
    try {
      if (negotiation == this.clickedNegotiation) {
        var bgCol = this.negotiationsMap[this.clickedNegotiation].ClubColor1;
        styles["backgroundColor"] = bgCol;
      }
    } catch (e) {
      return { backgroundColor: "#F0F2F5" };
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
      styles["filter"] = "invert(1)";
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
    try {
      keys.forEach(key => {
        if (
          this.offersMap[key].NegotiationID == this.clickedNegotiation &&
          this.offersMap[key].OfferCode == option
        ) {
          offer = this.offersMap[key];
        }
      });
    } catch (e) {}
    return offer;
  }

  /**
   * get the text and its correct direction for the title bar top right
   *  for main pick direction
   */
  getTextForTitleBar() {
    if (!this.firstSelectionMade) {
      return "";
    }
    try {
      var direction = "";
      var raidersPickText = this.negotiationsMap[this.clickedNegotiation][
        "LVPickText"
      ];
      var tradePickText = this.negotiationsMap[this.clickedNegotiation][
        "TradeClubPickText"
      ];

      var direction =
        this.negotiationsMap[this.clickedNegotiation]["TradeDirection"] == 1
          ? "up"
          : "down";

      return raidersPickText + " " + direction + " to " + tradePickText;
    } catch (e) {
      return "";
    }
  }
}
