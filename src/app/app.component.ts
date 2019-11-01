import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { OAuthService } from "angular-oauth2-oidc";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  cookieValue = "UNKOWN";
  title = "WEBSITE";
  private async ConfigureAuth(): Promise<void> {
    this.oauthService.loginUrl = "";
    this.oauthService.clientId = "";
    this.oauthService.resource = "";
    this.oauthService.logoutUrl = "";
    this.oauthService.redirectUri = window.location.origin + "/";
    this.oauthService.scope = "openid";
    this.oauthService.oidc = true;
    this.oauthService.setStorage(sessionStorage);
  }

  constructor(
    private cookieService: CookieService,
    private oauthService: OAuthService
  ) {}
  async ngOnInit() {
    this.cookieService.set("Test", "Hello World");
    this.cookieValue = this.cookieService.get("Test");
    // await this.ConfigureAuth();
    // this.oauthService.tryLogin({});
    // if (!this.oauthService.getAccessToken()) {
    //   await this.oauthService.initImplicitFlow();
    // }
  }
}
