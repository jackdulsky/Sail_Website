import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";
import { filter } from "minimatch";

@Pipe({ name: "SmartFilter" })
export class SmartFilterPipe implements PipeTransform {
  constructor(public filt: FiltersService) {}

  transform(items: any[], actives: { [id: number]: number[] }): any[] {
    return [];
    //   if (!items) return [];
    //   if (!actives) return items;

    //   return items.filter(it => {
    //     if (typeof it === "string" || it instanceof String) {
    //       var excluded = this.filt.testMeta[Number(it)]["exclusions"];
    //     } else {
    //       var excluded = this.filt.testMeta[it.key]["exclusions"];
    //     }

    //     var vali = true;
    //     excluded.forEach(element => {
    //       Object.keys(actives).forEach(element2 => {
    //         try {
    //           if (
    //             String(element) == String(element2) ||
    //             actives[element2].indexOf(String(element)) !== -1
    //           ) {
    //             vali = false;
    //           }
    //         } catch {}
    //       });
    //     });
    //     return vali;
    //   });
  }
}
