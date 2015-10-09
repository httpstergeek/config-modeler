# encoding: utf-8
# Author: Bernardo Macias <bmacias@httpstergeek.com>
#
#
# All rights reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

__author__ = 'Bernardo Macias '
__credits__ = ['Bernardo Macias']
__license__ = "ASF"
__version__ = "2.0"
__maintainer__ = "Bernardo Macias"
__email__ = 'bmacias@httpstergeek.com'
__status__ = 'Production'

import os
import cherrypy
import logging
import logging.handlers
import json

# SPLUNK IMPORTS
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.clilib import cli_common as cli


def setup_logger(level):
    #appname = os.path.dirname(os.path.realpath(__file__)).split('/')[-2]
    appname = "config_modeler"
    logger = logging.getLogger(appname)
    logger.propagate = False  # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(level)
    file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(os.environ.get("SPLUNK_HOME"), 'var', 'log', 'splunk', appname + '.log'), maxBytes=25000000,
        backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

logger = setup_logger(logging.INFO)
deploymentapps = os.path.join(os.environ['SPLUNK_HOME'], 'etc', 'deployment-apps')

def conflist(dir):
    filelist = []
    for filename in os.listdir(dir):
        if os.path.isfile(os.path.join(dir, filename)) and filename.endswith('.conf') and "app.conf" not in filename:
            filelist.append(filename)
    return filelist


class ConfigModelerController(controllers.BaseController):
    @expose_page(must_login=False, methods=['GET', 'POST'])
    @route('/', methods=['GET', 'POST'])
    def configmodel(self, **kwargs):
        method = cherrypy.request.method

        if method == 'GET':
            applist = next(os.walk(deploymentapps))[1]
            applist.remove('users')
            return json.dumps(applist)

        if method == 'POST':
            data = cherrypy.request.params
            if not data:
                logger.info('no data received')
                logger.info(json.dumps(data))
                return ''
            else:
                data = data['data[]']

            applist = []
            confsettings = []
            mergedconfs = {}
            logger.info('app config requests: %s' % json.dumps(data))

            if not isinstance(data, list):
                applist.append(data)
            else:
                applist = data
            logger.info('this app config requests: %s' % json.dumps(applist))
            #  Iterates through each app
            for app in applist:
                logger.info('retrieving configs for %s' % app)
                apppath = os.path.join(deploymentapps, app)
                mergedfiles = {}
                mergedconfs ={}
                default = 'default'
                local = 'local'
                appdefaultpath = os.path.join(apppath, default)
                applocalpath = os.path.join(apppath, local)
                defaultconffiles = conflist(appdefaultpath) if os.path.exists(appdefaultpath) else []
                localconffiles = conflist(applocalpath) if os.path.exists(applocalpath) else []
                conffiles = list(set(defaultconffiles + localconffiles))

                # Merges default and local for app
                for conffile in conffiles:
                    defaultfile = os.path.join(appdefaultpath, conffile)
                    localfile = os.path.join(applocalpath, conffile)
                    defaultconf = cli.readConfFile(defaultfile) if os.path.exists(defaultfile) else {}
                    localconf = cli.readConfFile(localfile) if os.path.exists(localfile) else {}
                    if defaultconf:
                        for stanza, settings in defaultconf.items():
                            for key, value in settings.items():
                                defaultconf[stanza][key] = ["%s/%s" % (app, default), value]
                    if localconf:
                        for stanza, settings in localconf.items():
                            for key, value in settings.items():
                                settings[key] = ["%s/%s" % (app, local), value]
                            if stanza in defaultconf:
                                defaultconf[stanza].update(settings)
                            else:
                                defaultconf[stanza] = settings
                    mergedfiles[conffile] = defaultconf
                confsettings.append({app: mergedfiles})

            # Iterates through each configuration file found in all select apps.
            for conffile in conffiles:
                mergedconfs[conffile] = {}
                for app in confsettings:
                    for appname, conf in app.items():
                        if conffile in conf:
                            for stanza, settings in conf[conffile].items():
                                if stanza in mergedconfs[conffile]:
                                    mergedconfs[conffile][stanza].update(settings)
                                else:
                                    mergedconfs[conffile][stanza] = settings

            return json.dumps(mergedconfs)