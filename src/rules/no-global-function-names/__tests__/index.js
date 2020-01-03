import rule, { ruleName, messages } from "..";

testRule(rule, {
  ruleName,
  config: [true],
  syntax: "scss",

  accept: [
    {
      code: `
      color.adjust(#6b717f, $red: 15);
    `,
      description: "Accepts a global function that is using the module system"
    }
  ],

  reject: [
    {
      code: `
      adjust-color(#6b717f, $red: 15);
    `,
      line: 2,
      message: messages.rejected("adjust-color"),
      description: "A function that is not using the module system"
    }
  ]
});
