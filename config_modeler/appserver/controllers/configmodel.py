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
import sys
import re

# SPLUNK IMPORTS
import splunk, splunk.util
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib import jsonresponse, util, cached


def setup_logger(level):
    appname = os.path.dirname(os.path.realpath(__file__)).split('/')[-2]
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


class ConfigModelerController(controllers.BaseController):
    @expose_page(must_login=False, methods=['GET', 'POST'])
    @route('/', methods=['GET', 'POST'])
    def configmodel(self, **kwargs):
        method = cherrypy.request.method

        if method == 'GET':
            return json.dumps(next(os.walk(deploymentapps))[1])

        if method == 'POST':
            return kwargs.get('data')