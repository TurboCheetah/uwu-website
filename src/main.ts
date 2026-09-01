import { asciiLogo } from "./logo";
import "./style.css";

const mark = document.querySelector("#c");
if (mark instanceof HTMLElement) {
  const [before, after] = asciiLogo.split("«uwu»");
  mark.replaceChildren();
  mark.append(before ?? "");
  const highlight = document.createElement("span");
  highlight.textContent = "«uwu»";
  mark.append(highlight);
  mark.append(after ?? "");
}
