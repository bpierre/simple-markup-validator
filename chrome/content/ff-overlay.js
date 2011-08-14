smv.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ smv.showFirefoxContextMenu(e); }, false);
};

smv.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-smv").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { smv.onFirefoxLoad(); }, false);
