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
  highTrade = "";
  mediumTrade = "";
  lowTrade = "";
  pickOrderToPickID;
  firstSelectionMade = false;
  ngOnInit() {
    this.filterService.pullData.pullDraftOffers().subscribe(data => {
      this.offers = data;
    });
    this.filterService.pullData.pullDraftNegotiations().subscribe(data => {
      this.negotiations = data;
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
        element["OfferTeamID"] = this.tradeTool.clubIDToSailID[
          element["OfferClubID"]
        ];
        element["OrderID"] = element["OfferID"];

        this.offersMap[element["OfferID"]] = element;
      });
      this.negotiations.forEach(element => {
        element["TradeTeamID"] = this.tradeTool.clubIDToSailID[
          element["TradeClub"]
        ];
        element["Main_Pick_Raiders"] = element["LVPick"];
        element["Main_Pick_Trade"] = element["TradeClubPick"];
        element["OrderID"] = element["NegotiationID"];
        if (element.TradeClub != null) {
          var active = this.getActiveOffer(element["NegotiationID"]);
          element["ActiveOfferID"] =
            active.OfferCode != 0 ? active["OfferID"] : 0;
          console.log("TradeText", active.TradeText);
          this.negotiationsMap[element["NegotiationID"]] = element;
        }
      });
    }
    // console.log("offers", this.offersMap);
    // console.log("negotiations", this.negotiationsMap);
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
    this.clickedNegotiation = negotiation;
    this.filterService.teamPortalSelected = this.filterService.teamsMap[
      this.negotiationsMap[negotiation].TradeTeamID
    ];
    this.filterService.teamPortalActiveClubID = this.negotiationsMap[
      negotiation
    ].TradeTeamID;
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
      return { backgroundColor: "#5fb1e3" };
    } else {
      return { backgroundColor: "#e1e1e1" };
    }
  }
  /**
   * Return the offer color for which one is active
   * @param active 1 == on 0 == off
   */
  getNegotiationBackground(negotiation: number) {
    if (negotiation == this.clickedNegotiation) {
      return { backgroundColor: "#71d28d" };
    } else {
      return {};
    }
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
    var text = "";
    keys.forEach(key => {
      if (
        this.offersMap[key].NegotiationID == this.clickedNegotiation &&
        this.offersMap[key].OfferCode == option
      ) {
        text = this.offersMap[key].TradeText;
      }
    });
    return text;
  }

  /**
   * get the background color based on index for the
   */
}
