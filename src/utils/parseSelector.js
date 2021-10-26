import postCssSelectorParser from "postcss-selector-parser";

export default function(selector, result, node, cb) {
  try {
    postCssSelectorParser(cb).process(selector);
  } catch {
    result.warn("Cannot parse selector", { node });
  }
}
