import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { BodyComponent } from "./body/body.component";
// import {MdDialogModule} from '@angular/material/material';
import { FolderselectpopComponent } from "./folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "./savedfilterspop/savedfilterspop.component";

// import {PopupModule} from 'ng2-opd-popup';
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import * as Material from "@angular/material";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FilterBarComponent } from "./filter-bar/filter-bar.component";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TooltipModule } from "ngx-bootstrap/tooltip";

import { ModalModule } from "ngx-bootstrap/modal";
import { FilterspopComponent } from "./filterspop/filterspop.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ReportComponent } from "./report/report.component";
import { PullDataService } from "./pull-data.service";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { MatFormFieldModule, MatSelectModule } from "@angular/material";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { FilterSearchPipe } from "./filterSearch.pipe";
import { FilterReportListsPipe } from "./filterReportLists.pipe";

import { SafeHtmlPipe } from "./safe.pipe";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SortPipe } from "./sort.pipe";

// import { Ng5SliderModule } from "ng5-slider";
import { MatSliderModule } from "@angular/material/slider";
import { MatTabsModule } from "@angular/material/tabs";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatAutocompleteModule, MatInputModule } from "@angular/material";
import { CookieService } from "ngx-cookie-service";
import { MatMenuModule } from "@angular/material/menu";
import { IconImportModule } from "mat-icon-import";
import { NameenterpopComponent } from "./nameenterpop/nameenterpop.component";
import { MsAdalAngular6Module } from "microsoft-adal-angular6";
import { OAuthService, OAuthModule } from "angular-oauth2-oidc";
import { MatButtonToggleModule } from "@angular/material";
import { DragToSelectModule } from "ngx-drag-to-select";
import { BaseReportsComponent } from "./base-reports/base-reports.component";
import { ClubComponent } from "./club/club.component";
import { LoadingComponent } from "./loading/loading.component";
import { ReportUploadComponent } from "./report-upload/report-upload.component";
import { PlayerComponent } from "./player/player.component";
import { CashComponent } from "./cash/cash.component";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { ColorPickerModule } from "ngx-color-picker";
import { HomeComponent } from "./home/home.component";
import { NewpageComponent } from "./newpage/newpage.component";
import { ClickOutsideModule } from "ng-click-outside";
import { NgCircleProgressModule } from "ng-circle-progress";
import { MenuItemComponent } from "./menu-item/menu-item.component";
import { OrderAttributePipe } from "./order-attribute.pipe";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ExcelComponent } from "./excel/excel.component";
import { FaHypoComponent } from "./fa-hypo/fa-hypo.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { SavingFAHYPOComponent } from "./saving-fahypo/saving-fahypo.component";
import { UploadFAHYPOComponent } from "./upload-fahypo/upload-fahypo.component";
import { MinusSignToParensPipe } from "./minus-sign-to-parens.pipe";
/**
 * This is where you will import all your modules, components, pipes and services
 * As long as you know the location of the item you added it will be need to be placed appropriately
 * If you have a pop up component they need to be placed under the entry components as well.
 *
 */
@NgModule({
  declarations: [
    FilterReportListsPipe,
    SortPipe,
    SafeHtmlPipe,
    FilterSearchPipe,
    AppComponent,
    TopbarComponent,
    BodyComponent,
    FolderselectpopComponent,
    FilterBarComponent,
    FilterspopComponent,
    ReportComponent,
    SavedfilterspopComponent,
    NameenterpopComponent,
    BaseReportsComponent,
    ClubComponent,
    LoadingComponent,
    ReportUploadComponent,
    PlayerComponent,
    CashComponent,
    HomeComponent,
    NewpageComponent,
    MenuItemComponent,
    OrderAttributePipe,
    ExcelComponent,
    FaHypoComponent,
    SavingFAHYPOComponent,
    UploadFAHYPOComponent,
    MinusSignToParensPipe
  ],
  imports: [
    NgCircleProgressModule.forRoot({
      // set defaults
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300
    }),
    MatDatepickerModule,
    ClickOutsideModule,
    ColorPickerModule,
    AngularMultiSelectModule,
    DragToSelectModule.forRoot(),
    OAuthModule.forRoot(),
    MatButtonToggleModule,
    IconImportModule,
    MatMenuModule,
    MatInputModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatTabsModule,
    MatSliderModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    SelectDropDownModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    CommonModule,
    Material.MatToolbarModule,
    Material.MatGridListModule,
    Material.MatFormFieldModule,
    Material.MatInputModule,
    Material.MatRadioModule,
    Material.MatSelectModule,
    Material.MatCheckboxModule,
    Material.MatDatepickerModule,
    Material.MatNativeDateModule,
    Material.MatButtonModule,
    Material.MatSnackBarModule,
    Material.MatTableModule,
    Material.MatIconModule,
    Material.MatPaginatorModule,
    Material.MatSortModule,
    Material.MatDialogModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    DragDropModule
  ],
  providers: [
    { provide: MatDialogRef },
    PullDataService,
    CookieService,
    OAuthService
  ],
  bootstrap: [AppComponent],
  exports: [
    MatDatepickerModule,
    MatDialogModule,
    Material.MatToolbarModule,
    Material.MatGridListModule,
    Material.MatFormFieldModule,
    Material.MatInputModule,
    Material.MatRadioModule,
    Material.MatSelectModule,
    Material.MatCheckboxModule,
    Material.MatDatepickerModule,
    Material.MatNativeDateModule,
    Material.MatButtonModule,
    Material.MatSnackBarModule,
    Material.MatTableModule,
    Material.MatIconModule,
    Material.MatPaginatorModule,
    Material.MatSortModule,
    Material.MatDialogModule,
    BsDropdownModule,
    TooltipModule,
    ModalModule
  ],
  entryComponents: [
    NameenterpopComponent,
    SavedfilterspopComponent,
    FolderselectpopComponent,
    FilterspopComponent,
    SavingFAHYPOComponent,
    UploadFAHYPOComponent
  ]
})
export class AppModule {}
