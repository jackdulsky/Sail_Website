import {
  trigger,
  state,
  style,
  transition,
  animate,
  group,
  query,
  stagger,
  keyframes
} from "@angular/animations";
/**
 * The way animations work are you add a trigger for the name of the animation you want for the class,
 * each item in the array is a different animation
 * state is the label used for identifying the style to apply to the html element
 * you can do this with any property styling such as opacity or size
 * alter the speed of transitions grouped animation transitions section
 */
export const SlideInOutAnimation = [
  trigger("slideInOutYearPortal", [
    state(
      "in",
      style({
        "max-height": "500px",

        visibility: "visible",
        "overflow-y": "hidden"
      })
    ),
    state(
      "out",
      style({
        "max-height": "0px",

        visibility: "hidden",
        "overflow-y": "hidden"
      })
    ),
    transition("in => out", [
      group([
        animate(
          "250ms ease-in-out",
          style({
            "max-height": "0px"
          })
        ),
        animate(
          "250ms ease-in-out",
          style({
            visibility: "hidden"
          })
        )
      ])
    ]),
    transition("out => in", [
      group([
        animate(
          "1ms ease-in-out",
          style({
            visibility: "visible"
          })
        ),
        animate(
          "250ms ease-in-out",
          style({
            "max-height": "500px"
          })
        )
      ])
    ])
  ]),
  trigger("slideInOutTeamListPortal", [
    state(
      "in",
      style({
        "max-height": "500px",

        visibility: "visible"
      })
    ),
    state(
      "out",
      style({
        "max-height": "0px",

        visibility: "hidden"
      })
    ),
    transition("in => out", [
      group([
        animate(
          "250ms ease-in-out",
          style({
            "max-height": "0px"
          })
        ),
        animate(
          "250ms ease-in-out",
          style({
            visibility: "hidden"
          })
        )
      ])
    ]),
    transition("out => in", [
      group([
        animate(
          "1ms ease-in-out",
          style({
            visibility: "visible"
          })
        ),
        animate(
          "250ms ease-in-out",
          style({
            "max-height": "500px"
          })
        )
      ])
    ])
  ])
];
