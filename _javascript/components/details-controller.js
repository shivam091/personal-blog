import IconPlus from "./../animations/icons/plus";
import DetailsAnimator from "./../animations/details-animator";

export default class DetailsController {
  static initialize() {
    document.querySelectorAll("details").forEach(details => {
      new IconPlus(details);
      new DetailsAnimator(details);
    });
  }
}
