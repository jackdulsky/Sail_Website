import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "minusSignToParens"
})

/**
 * This pipe will turn a negative number into a display number with parens around it.
 * Used for the FA-Hypo tab, it does not change the text color however.
 */
export class MinusSignToParensPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.charAt(0) === "-"
      ? "(" + value.substring(1, value.length) + ")"
      : value;
  }
}
