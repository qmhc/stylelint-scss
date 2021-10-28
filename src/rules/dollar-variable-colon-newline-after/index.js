import { isBoolean } from "../../utils/validateTypes";
import { utils } from "stylelint";
import {
  declarationValueIndex,
  isSingleLineString,
  namespace,
  whitespaceChecker
} from "../../utils";

export const ruleName = namespace("dollar-variable-colon-newline-after");

export const messages = utils.ruleMessages(ruleName, {
  expectedAfter: () => 'Expected newline after ":"',
  expectedAfterMultiLine: () =>
    'Expected newline after ":" with a multi-line value'
});

export default function(expectation, options, context) {
  const checker = whitespaceChecker("newline", expectation, messages);

  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      {
        actual: expectation,
        possible: ["always", "always-multi-line"]
      },
      {
        actual: options,
        possible: {
          disableFix: isBoolean
        },
        optional: true
      }
    );

    if (!validOptions) {
      return;
    }

    const shouldFix = context.fix && (!options || options.disableFix !== true);

    root.walkDecls(decl => {
      if (!decl.prop || decl.prop[0] !== "$") {
        return;
      }

      const value = decl.value.trim();
      const startsWithParen = value[0] === "(";
      const endsWithParen = value[value.length - 1] === ")";
      const endsWithDefault = /\)\s*!default$/.test(value);
      const isMultilineVarWithParens =
        startsWithParen &&
        (endsWithParen || endsWithDefault) &&
        !isSingleLineString(value);

      if (isMultilineVarWithParens) {
        return;
      }

      // Get the raw $var, and only that
      const endOfPropIndex =
        declarationValueIndex(decl) + decl.raw("between").length - 1;
      // `$var:`, `$var :`
      const propPlusColon = decl.toString().slice(0, endOfPropIndex);

      for (let i = 0, l = propPlusColon.length; i < l; i++) {
        if (propPlusColon[i] !== ":") {
          continue;
        }

        const indexToCheck =
          propPlusColon.substr(propPlusColon[i], 3) === "/*"
            ? propPlusColon.indexOf("*/", i) + 1
            : i;

        checker.afterOneOnly({
          source: propPlusColon,
          index: indexToCheck,
          lineCheckStr: decl.value,
          err: m => {
            if (shouldFix) {
              const nextLinePrefix =
                expectation === "always"
                  ? decl.raws.before.replace(context.newline, "")
                  : decl.value
                      .split(context.newline)[1]
                      .replace(/^(\s+).*$/, (_, whitespace) => whitespace);

              decl.raws.between = decl.raws.between.replace(
                /:(.*)$/,
                `:${context.newline}${nextLinePrefix}`
              );

              return;
            }

            utils.report({
              message: m,
              node: decl,
              index: indexToCheck,
              result,
              ruleName
            });
          }
        });
        break;
      }
    });
  };
}
