/*
This file is part of Web Developer by Chris Pederick (http://chrispederick.com/).

Web Developer is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Web Developer is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with Web Developer.  If not, see <http://www.gnu.org/licenses/>.
*/

/*global  window, Components, XMLHttpRequest, getBrowser, getWebNavigation */

(function() {

// Returns the document body element
webdeveloper_getDocumentBodyElement = function(contentDocument)
{
    // If there is a body element
    if(contentDocument.body)
    {
        return contentDocument.body;
    }
    else
    {
        var bodyElementList = contentDocument.getElementsByTagName("body");

        // If there is a body element
        if(bodyElementList.length > 0)
        {
            return bodyElementList[0];
        }
    }

    return contentDocument.documentElement;
}

// Generates a document in a new tab or window
function webdeveloper_generateDocument(url)
{
    var generatedPage = null;
    var request       = new XMLHttpRequest();

    getBrowser().selectedTab = getBrowser().addTab(url);
    generatedPage = window;

    // This must be done to make generated content render
    request.open("get", "about:blank", false);
    request.send(null);

    return generatedPage.content.document;
}

// Constructs a validate HTML object
function WebDeveloperValidateHTML(prefs, validateMessage)
{
    this.file              = null;
    this.fileElement       = null;
    this.formElement       = null;
    this.validationRequest = null;
    this.prefs = prefs;
    this.validateMessage = validateMessage;
}

// Cleans up
WebDeveloperValidateHTML.prototype.cleanUp = function()
{
    // If the file is set
    if(this.file)
    {
        // Try to delete the file
        try
        {
            this.file.remove(false);
        }
        catch(exception)
        {
            // Do nothing
        }

        this.file = null;
    }

    // If the validation request is set
    if(this.validationRequest)
    {
        this.validationRequest.abort();
    }
};

// Creates a source file
WebDeveloperValidateHTML.prototype.createSourceFile = function(uri)
{
    var temporaryDirectory = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);

    // If the temporary directory exists, is a directory and is writable
    if(temporaryDirectory.exists() && temporaryDirectory.isDirectory() && temporaryDirectory.isWritable())
    {
        var fileName   = "";
        var sourceFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

        // Try to get the host
        try
        {
            fileName = uri.host;
        }
        catch(exception)
        {
            // Do nothing
        }

        temporaryDirectory.append("smv-" + fileName + "-" + new Date().getTime() + ".html");
        sourceFile.initWithPath(temporaryDirectory.path);

        return sourceFile;
    }
    else
    {
        // Error
        return null;
    }
};

// Returns the post data
WebDeveloperValidateHTML.prototype.getPostData = function()
{
    // Try to get the post data
    try
    {
        var sessionHistory = getWebNavigation().sessionHistory;
        var entry          = sessionHistory.getEntryAtIndex(sessionHistory.index, false).QueryInterface(Components.interfaces.nsISHEntry);

        return entry.postData;
    }
    catch(exception)
    {
        return null;
    }
};

// Saves the HTML
WebDeveloperValidateHTML.prototype.saveHTML = function(uri)
{
    var webBrowserPersistInterface = Components.interfaces.nsIWebBrowserPersist;
    var webBrowserPersist          = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(webBrowserPersistInterface);

    webBrowserPersist.persistFlags     = webBrowserPersistInterface.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION | webBrowserPersistInterface.PERSIST_FLAGS_FROM_CACHE | webBrowserPersistInterface.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
    webBrowserPersist.progressListener = this;

    webBrowserPersist.saveURI(uri, null, uri, this.getPostData(), null, this.file);
};

// Submits the form to validate the HTML
WebDeveloperValidateHTML.prototype.submitForm = function()
{
    this.fileElement.value = this.file.path;

    this.formElement.submit();
};

// Validate the HTML from the given URI in the background
WebDeveloperValidateHTML.prototype.validateBackgroundHTML = function(uri)
{
    this.file = this.createSourceFile(uri);

    // If the validation request is not set
    if(!this.validationRequest)
    {
        this.validationRequest = new XMLHttpRequest();
    }

    this.saveHTML(uri);
};

// Validate the HTML from the given URI
WebDeveloperValidateHTML.prototype.validateHTML = function(uri)
{
    var oldTab            = getBrowser().selectedTab;
    var oldURL            = getBrowser().currentURI.spec;
    var generatedDocument = webdeveloper_generateDocument("");
    var bodyElement       = webdeveloper_getDocumentBodyElement(generatedDocument);
    var inputElement      = null;
    var titleStr = this.validateMessage;
    var titleElement = generatedDocument.createElement("h1");
    
    generatedDocument.title = titleElement.innerHTML = titleStr;
    bodyElement.appendChild(titleElement);
    
    this.file               = this.createSourceFile(uri);
    this.formElement        = generatedDocument.createElement("form");

    this.formElement.setAttribute("action", "http://validator.w3.org/check");
    this.formElement.setAttribute("enctype", "multipart/form-data");
    this.formElement.setAttribute("method", "post");
    this.formElement.setAttribute("style", "display: none");

    // If the show outline preference is set
    if(this.prefs.showOutline)
    {
        inputElement = generatedDocument.createElement("input");

        inputElement.setAttribute("name", "outline");
        inputElement.setAttribute("type", "hidden");
        inputElement.setAttribute("value", "1");
        this.formElement.appendChild(inputElement);
    }

    // If the show parse tree preference is set
    if(this.prefs.showParseTree)
    {
        inputElement = generatedDocument.createElement("input");

        inputElement.setAttribute("name", "sp");
        inputElement.setAttribute("type", "hidden");
        inputElement.setAttribute("value", "1");
        this.formElement.appendChild(inputElement);
    }

    // If the show source preference is set
    if(this.prefs.showSource)
    {
        inputElement = generatedDocument.createElement("input");

        inputElement.setAttribute("name", "ss");
        inputElement.setAttribute("type", "hidden");
        inputElement.setAttribute("value", "1");
        this.formElement.appendChild(inputElement);
    }

    inputElement = generatedDocument.createElement("input");

    inputElement.setAttribute("name", "verbose");
    inputElement.setAttribute("type", "hidden");
    inputElement.setAttribute("value", "1");
    this.formElement.appendChild(inputElement);

    this.fileElement = generatedDocument.createElement("input");

    this.fileElement.setAttribute("name", "uploaded_file");
    this.fileElement.setAttribute("type", "file");
    this.formElement.appendChild(this.fileElement);
    bodyElement.appendChild(this.formElement);

    this.saveHTML(uri);
};

// Called when the progress state changes
WebDeveloperValidateHTML.prototype.onStateChange = function(webProgress, request, stateFlags, status)
{
    // If the progress has stopped
    if(stateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP)
    {
        // If the file is set and exists
        if(this.file && this.file.exists())
        {
            this.submitForm();
        }
    }
};

// Indicates the interfaces this object supports
WebDeveloperValidateHTML.prototype.QueryInterface = function(id)
{
    // If the query is for a supported interface
    if(id.equals(Components.interfaces.nsISupports) || id.equals(Components.interfaces.nsIWebProgressListener))
    {
        return this;
    }

    throw Components.results.NS_NOINTERFACE;
};

// Dummy methods requiring implementations
WebDeveloperValidateHTML.prototype.onLocationChange = function(webProgress, request, location) {};
WebDeveloperValidateHTML.prototype.onProgressChange = function(webProgress, request, currentSelfProgress, maximumSelfProgress, currentTotalProgress, maximumTotalProgress) {};
WebDeveloperValidateHTML.prototype.onSecurityChange = function(webProgress, request, state) {};
WebDeveloperValidateHTML.prototype.onStatusChange   = function(webProgress, request, status, message) {};

// Export WebDeveloperValidateHTML
window.SmvWebDeveloperValidateHTML = WebDeveloperValidateHTML;

})();