import { DomSanitizer } from "@angular/platform-browser";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "safehtml" })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    //Will allow for external html content to be safely and unalteredly put in the project
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
