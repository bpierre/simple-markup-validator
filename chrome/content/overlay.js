var smv = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("smv-strings");
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                       .getService(Components.interfaces.nsIPrefService)
                                       .getBranch("extensions.smv.");
  },

  onMenuItemCommand: function(e) {
    
    var wdValidator = new WebDeveloperValidateHTML({
      showOutline: this.prefs.getBoolPref("showOutline"),
      showParseTree: this.prefs.getBoolPref("showParseTree"),
      showSource: this.prefs.getBoolPref("showSource")
    });
    wdValidator.validateHTML(getBrowser().currentURI);
  },

  onToolbarButtonCommand: function(e) {
    // just reuse the function above
    smv.onMenuItemCommand(e);
  }
};

window.addEventListener("load", function () { smv.onLoad(); }, false);
