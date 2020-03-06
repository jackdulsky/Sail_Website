import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BodyComponent } from "./body/body.component";
import { FilterBarComponent } from "./filter-bar/filter-bar.component";
import { ReportComponent } from "./report/report.component";
import { BaseReportsComponent } from "./base-reports/base-reports.component";
import { ClubComponent } from "./club/club.component";
import { LoadingComponent } from "./loading/loading.component";
import { ReportUploadComponent } from "./report-upload/report-upload.component";
import { PlayerComponent } from "./player/player.component";
import { CashComponent } from "./cash/cash.component";
import { HomeComponent } from "./home/home.component";
import { NewpageComponent } from "./newpage/newpage.component";
import { ExtraOptions } from "@angular/router";
import { ExcelComponent } from "./excel/excel.component";
import { FaHypoComponent } from "./fa-hypo/fa-hypo.component";
import { DraftComponent } from "./draft/draft.component";
import { TradeToolComponent } from "./trade-tool/trade-tool.component";
export const routingConfiguration: ExtraOptions = {
  paramsInheritanceStrategy: "always"
};

export const routes: Routes = [
  {
    path: "",
    component: NewpageComponent,
    pathMatch: "full"
  },

  {
    path: "home/:user",
    component: HomeComponent,
    children: [
      {
        path: "",
        redirectTo: "cash",
        pathMatch: "full"
      },

      {
        path: "report/:reportid",
        component: ReportComponent,
        pathMatch: "full"
      },
      {
        path: "filters",
        component: FilterBarComponent
      },

      {
        //base-reportid is the variable for which list of reports is viewed
        path: "base-reports/:base-reportsid",
        component: BaseReportsComponent,
        pathMatch: "full"
      },
      {
        path: "base-reports",
        redirectTo: "base-reports/0",
        pathMatch: "full"
      },
      {
        path: "club",
        component: ClubComponent,
        children: [
          { path: "report/:reportid", component: ReportComponent },
          {
            path: "base-reports/:base-reportsid",
            component: BaseReportsComponent
          },
          {
            path: "",
            // 2679 is the default club home main page report view ID for Rockdaisy
            redirectTo: "report/2679",
            pathMatch: "full"
          }
        ]
      },
      {
        path: "draft",
        component: DraftComponent,
        children: [
          { path: "report/:reportid", component: ReportComponent },
          {
            path: "base-reports/:base-reportsid",
            component: BaseReportsComponent
          },
          {
            path: "trade-tool",
            component: TradeToolComponent
          },
          {
            path: "",
            // 2679 is the default club home main page report view ID for Rockdaisy
            redirectTo: "base-reports/17",
            pathMatch: "full"
          }
        ]
      },
      {
        path: "player",
        component: PlayerComponent,
        children: [
          { path: "report/:reportid", component: ReportComponent },
          {
            path: "base-reports/:base-reportsid",
            component: BaseReportsComponent
          },
          {
            path: "",
            // 2680 is the default player home main page report view ID for Rockdaisy
            redirectTo: "report/2680",
            pathMatch: "full"
          }
        ]
      },
      {
        path: "excel",
        component: ExcelComponent
      },
      {
        path: "fa-hypo",
        component: FaHypoComponent
      },
      {
        path: "cash",
        component: CashComponent,
        children: [
          { path: "report/:reportid", component: ReportComponent },
          {
            path: "base-reports/:base-reportsid",
            component: BaseReportsComponent
          },
          {
            path: "",
            redirectTo: "report/2702",
            pathMatch: "full"
          }
        ]
      },
      //These next three routes are for the ability to load a route that doesnt have a destination or a filterJSON to add
      {
        path: "loading/:guid/:filterjson/:destination",
        component: LoadingComponent
      },
      {
        path: "loading/:guid/:filterjson",
        component: LoadingComponent
      },
      {
        path: "loading/:guid",
        component: LoadingComponent
      },
      {
        path: "report-upload",
        component: ReportUploadComponent
      },
      {
        //** means invalid url from the parent correct */

        path: "**",
        redirectTo: "club"
      }
    ]
  },
  {
    //** means invalid url from the parent correct */
    path: "**",
    component: NewpageComponent,
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routingConfiguration)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
