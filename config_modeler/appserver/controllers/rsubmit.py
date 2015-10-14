
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

#
# API used as a proxy to submit request to remote deployment server
# This is to avoid cross site scripting issues.
#

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
import urllib
import urllib2
import json

# SPLUNK IMPORTS
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route

def request(url, data=None, timeout=None):
    """
    :param url: string, http(s)://
    :param data:
    :param timeout:
    :return:
    """
    url_encode = urllib.urlencode(data) if data else None
    connection = urllib2.Request(url, data=url_encode)
    response = urllib2.urlopen(connection, timeout=timeout)
    response = dict(code=response.getcode(), msg=response.read(), headers=response.info())
    return response


def setup_logger(level):
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
vmodule = os.path.basename(__file__).split(".")[-1].upper().replace('>', '')

class ConfigModelerController(controllers.BaseController):
    @expose_page(must_login=False, methods=['POST'])
    @route('/', methods=['POST'])
    def rsubmit(self, **kwargs):
        data = cherrypy.request.params
        logger.info("%s %s" % (vmodule, json.dumps(data)))
        dsserver = data.pop("dsserver")
        logger.info("%s %s" % (vmodule, dsserver))
        if "apps[]" in data:
            data["apps[]"] = json.dumps(data["apps[]"])
        if "app" in data:
            data["apps[]"] = json.dumps(data["apps"])
        try:
            response = request(dsserver, data=data)
            logger.info("%s reponse=%s" % (vmodule, response['code']))
            return response['msg']
        except Exception as e:
            logger.info("%s %s" % (vmodule, e))




