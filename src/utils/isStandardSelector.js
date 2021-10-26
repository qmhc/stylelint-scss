import isStandardSyntaxSelector from "./isStandardSyntaxSelector";
import hasInterpolation from "./hasInterpolation";
/**
 * Check whether a selector is standard
 *
 * @param {string} selector
 * @return {boolean} If `true`, the selector is standard
 */
export default function(selector) {
  const standardSyntaxSelector = isStandardSyntaxSelector(selector);

  // SCSS placeholder selectors
  if (
    !standardSyntaxSelector &&
    selector.startsWith("%") &&
    !hasInterpolation(selector)
  ) {
    return true;
  }

  return standardSyntaxSelector;
}
