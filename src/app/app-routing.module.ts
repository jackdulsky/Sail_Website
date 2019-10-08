import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BodyComponent } from "./body/body.component";
import { SettingComponent } from "./setting/setting.component";
import { FilterBarComponent } from "./filter-bar/filter-bar.component";
import { ReportComponent } from "./report/report.component";

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
    redirectTo: "/home",
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
