import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BodyComponent } from "./body/body.component";
import { SettingComponent } from "./setting/setting.component";
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

export const routingConfiguration: ExtraOptions = {
  paramsInheritanceStrategy: "always"
};

const routes: Routes = [
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
        redirectTo: "base-reports/0",
        pathMatch: "full"
      },

      {
        path: "setting",
        component: SettingComponent
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
        path: "",
        component: FilterBarComponent,
        outlet: "filterSection"
      },

      {
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
            redirectTo: "base-reports/4",
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
            redirectTo: "base-reports/7",
            pathMatch: "full"
          }
        ]
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
            redirectTo: "base-reports/10",
            pathMatch: "full"
          }
        ]
      },
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
        path: "**",
        redirectTo: "base-reports/0"
      }
    ]
  },
  {
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
// {
//   path: "",
//   redirectTo: "base-reports/0",
//   pathMatch: "full"
// },

// {
//   path: "setting",
//   component: SettingComponent
// },
// {
//   path: "report/:reportid",
//   component: ReportComponent,
//   pathMatch: "full"
// },
// {
//   path: "report",
//   redirectTo: "base-reports/0"
// },
// {
//   path: "filters",
//   component: FilterBarComponent
// },
// {
//   path: "",
//   component: FilterBarComponent,
//   outlet: "filterSection"
// },

// {
//   path: "base-reports/:base-reportsid",
//   component: BaseReportsComponent,
//   pathMatch: "full"
// },
// {
//   path: "base-reports",
//   redirectTo: "base-reports/0",
//   pathMatch: "full"
// },
// {
//   path: "club",
//   component: ClubComponent,
//   children: [
//     { path: "report/:reportid", component: ReportComponent },
//     {
//       path: "base-reports/:base-reportsid",
//       component: BaseReportsComponent
//     },
//     {
//       path: "",
//       redirectTo: "base-reports/4",
//       pathMatch: "full"
//     }
//   ]
// },
// {
//   path: "player",
//   component: PlayerComponent,
//   children: [
//     { path: "report/:reportid", component: ReportComponent },
//     {
//       path: "base-reports/:base-reportsid",
//       component: BaseReportsComponent
//     },
//     {
//       path: "",
//       redirectTo: "base-reports/7",
//       pathMatch: "full"
//     }
//   ]
// },
// {
//   path: "cash",
//   component: CashComponent,
//   children: [
//     { path: "report/:reportid", component: ReportComponent },
//     {
//       path: "base-reports/:base-reportsid",
//       component: BaseReportsComponent
//     },
//     {
//       path: "",
//       redirectTo: "base-reports/10",
//       pathMatch: "full"
//     }
//   ]
// },
// {
//   path: "loading/:guid/:filterjson/:destination",
//   component: LoadingComponent
// },
// {
//   path: "loading/:guid/:filterjson",
//   component: LoadingComponent
// },
// {
//   path: "loading/:guid",
//   component: LoadingComponent
// },
// {
//   path: "report-upload",
//   component: ReportUploadComponent
// },
// {
//   path: "**",
//   redirectTo: "base-reports/0"
// }
// ]
// }
