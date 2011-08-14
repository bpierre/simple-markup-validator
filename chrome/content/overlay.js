var smv = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("smv-strings");
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                       .getService(Components.interfaces.nsIPrefService)
                                       .getBranch("extensions.smv.");
    
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this.prefs.addObserver("", smv.prefObserver, false);
    
    smv.updateMenuItem();
  },

  updateMenuItem: function() {
    Firebug.Console.log(document.getElementById("menu_ToolsPopup"));
    Firebug.Console.log(this.prefs.getBoolPref("showInTools"));
    document.getElementById("smv-menuitem").hidden = !(this.prefs.getBoolPref("showInTools"));
  },

  prefObserver: {
    observe: function(subject, topic, data) {
      if (topic === "nsPref:changed" && data === "showInTools") {
        smv.updateMenuItem();
      }
    },
  },

  onMenuItemCommand: function(e) {
    var prefs = {
        showOutline: this.prefs.getBoolPref("showOutline"),
        showParseTree: this.prefs.getBoolPref("showParseTree"),
        showSource: this.prefs.getBoolPref("showSource")
      },
      validateMessage = this.strings.getString("validateMessage"),
      wdValidator = new SmvWebDeveloperValidateHTML(prefs, validateMessage);
    wdValidator.validateHTML(getBrowser().currentURI);
  },

  onToolbarButtonCommand: function(e) {
    // just reuse the function above
    smv.onMenuItemCommand(e);
  }
};

window.addEventListener("load", function () { smv.onLoad(); }, false);
