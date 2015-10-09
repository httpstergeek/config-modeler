Configuration Modeler - A Graphical display of btool
======================

Configuration Modeler is a Splunk App which mimics btool, but allows users to select apps within the deployment server.  The user can select any combination of apps and graphically see the final configuration.  This tool does not use btool, but instead uses a custom cherrypy endpoint.


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



Installation instructions
-----------------

##Stand Alone instance
1) copy repo into $SPLUNK_HOME/etc/apps/

2) Open view for config_modeler.xml directly or through Splunk UI. Edit data-host and data-port with dns entry and port used by splunk web.

##Distributed environment
1)  copy repo into $SPLUNK_HOME/etc/apps/ to both the deployment server and search heads.

2) Open view for config_modeler.xml directly or through Splunk UI on your search heads. Edit data-host and data-port with dns entry and port used by splunk web.

