Configuration Modeler - A Graphical display of btool
======================

Configuration Modeler is a Splunk App which mimics btool, but allows users to select apps within the deployment server.  The user can select any combination of apps and graphically see the final configuration.  This tool does not use btool, but instead uses a custom cherrypy endpoint.

This app uses Splunk rest search command to discover the Deployment server.


##Supports:

* Distributed Deployment Supported


Requirements
-----------
* This version has been test on Splunk 6.x

* App works on all OS supported by Splunk

* Modern browser capable of rendering svg and D3 objects.
 
 
Prerequisites
----------------

* Splunk Deployment Server

* Splunk version 6.x or higher

* Deployment Server is a search peer of the DMC



Installation instructions
-----------------

##Stand Alone instance
1) copy repo into $SPLUNK_HOME/etc/apps/ on deployment server.  This assume deployment server webserver enabled.


##Distributed environment
This requires the use of Distributed Managment Console (DMC).
1)  copy repo into $SPLUNK_HOME/etc/apps/ to both the deployment server and DMC.

Note: if you are using an Splunk 6.2.x or earlier you will need to config the override settings within config_modeler.xml. Within the view are comments and descriptions

Debugging
-----------

##Using jconsole or firebug

1.  Open Config Modeler App within Splunk web.  /en-US/app/config_modeler/config_modeler
2.  In your browser open jconsole.
3.  Enter the following:
 var mvc = require("splunkjs/mvc");  // LOADS splunkjs module view controller
 var tokens = mvc.Components.get("default");  //GET ALL FORM TOKENS
 console.log("Deployment Server Name: " + tokens.get("dsserver"));  // Name of deployment server
 console.log("Deployment Server port: " + tokens.get("port")); // Web port 
 console.log("Deployment Server protocol: " + tokens.get("protocol")); // http or https protocol
 console.log("Deployment Server API URL: " + tokens.get("dsurl")); // deployment server url
 
 If any of the values are not populated Config modeler will not work, and probably a bug. You can specify token values from config.modeler.xml
 
 ##Testing Auto detect searches
 
 Note: replace $dsserver$ with the name of your deployment server
 
 1. Used to find which server is the depoyment server.  Verify if event is returned.
 |rest /services/server/info | mvexpand server_roles | where server_roles=="deployment_server"
 2. Finds all apps and serverclasses
 | rest splunk_server=$dsserver$ /services/deployment/server/applications | eval serverclasses=if(isnull(serverclasses), "NA", serverclasses) | stats count by serverclasses title | fields serverclasses title
 3. Finds httpport of webserver
 | rest splunk_server=$dsserver$ /services/properties/web/settings/httpport
 4. Determines if SSL is enabled on web server
 | rest splunk_server=$dsserver$ /services/properties/web/settings/enableSplunkWebSSL
 


BUG/ ISSUES REPORT
------------------

Visit: https://github.com/httpstergeek/config-modeler/issues