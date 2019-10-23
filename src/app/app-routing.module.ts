import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BodyComponent } from "./body/body.component";
import { SettingComponent } from "./setting/setting.component";
import { FilterBarComponent } from "./filter-bar/filter-bar.component";
import { ReportComponent } from "./report/report.component";
import { BaseReportsComponent } from "./base-reports/base-reports.component";
import { ClubComponent } from "./club/club.component";
import { ClubCashComponent } from "./club-cash/club-cash.component";
import { ClubHomeComponent } from "./club-home/club-home.component";
const routes: Routes = [
  // {
  //     path: 'home',
  //     component: HomeComponent
  // },
  // {
  //     path: 'about',
  //     component: AboutComponent
  // },
  // {
  //     path: 'courses',
  //     component: CoursesComponent
  // },
  // {
  //     path: '',
  //     redirectTo: '/home',
  //     pathMatch: 'full'
  // },
  {
    path: "",
    redirectTo: "base-reports",
    pathMatch: "full"
  },
  {
    path: "home",
    component: BodyComponent
  },
  {
    path: "setting",
    component: SettingComponent
  },
  {
    path: "report",
    component: ReportComponent
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
    path: "base-reports",
    component: BaseReportsComponent
  },
  {
    path: "club",
    component: ClubComponent,
    children: [
      { path: "cash", component: ClubCashComponent },
      { path: "home", component: ClubHomeComponent },
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
