/**
 * Created by berniem on 10/5/15.
 */
require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "splunkjs/mvc/simplexml",
    "splunkjs/mvc/headerview",
    "splunkjs/mvc/footerview",
    "splunkjs/mvc/simplexml/dashboardview",
    "splunkjs/mvc/simplexml/dashboard/panelref",
    "splunkjs/mvc/simplexml/element/chart",
    "splunkjs/mvc/simplexml/element/event",
    "splunkjs/mvc/simplexml/element/html",
    "splunkjs/mvc/simplexml/element/list",
    "splunkjs/mvc/simplexml/element/map",
    "splunkjs/mvc/simplexml/element/single",
    "splunkjs/mvc/simplexml/element/table",
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/simplexml/eventhandler",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/radiogroup",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/checkboxgroup",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/timerange",
    "splunkjs/mvc/simpleform/input/submit",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/textinputview",
    "splunkjs/mvc/radiogroupview",
    "splunkjs/mvc/multidropdownview",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/savedsearchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/simplexml/urltokenmodel"
    // Add comma-separated libraries and modules manually here, for example:
    // ..."splunkjs/mvc/simplexml/urltokenmodel",
    // "splunkjs/mvc/checkboxview"
  ],
  function(
    mvc,
    utils,
    TokenUtils,
    _,
    $,
    DashboardController,
    HeaderView,
    FooterView,
    Dashboard,
    PanelRef,
    ChartElement,
    EventElement,
    HtmlElement,
    ListElement,
    MapElement,
    SingleElement,
    TableElement,
    FormUtils,
    EventHandler,
    DropdownInput,
    RadioGroupInput,
    MultiSelectInput,
    CheckboxGroupInput,
    TextInput,
    TimeRangeInput,
    SubmitButton,
    SearchBarView,
    TableView,
    TextInputView,
    RadioGroupView,
    MultiDropdownView,
    SearchManager) {
    (function() {
      // get multiselect instance
      var multiSelect = mvc.Components.getInstance("multi");

      // Populates Mulitselect with App on Deployment server
      $.get("http://localhost:8000/en-US/custom/config_modeler/configmodel", function(data, status) {
        var appList = JSON.parse(data);
        var choices = _.map(appList, function(app){return {label: app, value: app}})
        multiSelect.settings.set("choices", choices)
      });

      // on change/ update of multiselect query api for merged config
      multiSelect.on("change", function(){
        console.log(this.settings.get("value"));
        $.post("http://localhost:8000/en-US/custom/config_modeler/configmodel", this.settings.get("value"));

      });

    })();
  });