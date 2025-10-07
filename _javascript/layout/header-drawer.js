import Drawer from "./../components/drawer";
import DrawerAnimation from "./../animations/drawer";
import IconHamburger from "./../animations/icons/hamburger";

export default class HeaderDrawer {
  static initialize() {
    const drawerEl = document.getElementById("header-drawer");
    const animationController = new DrawerAnimation(drawerEl);

    Drawer.init(animationController);

    // Init hamburger icon
    new IconHamburger(Drawer.toggleButton);
  }
}
