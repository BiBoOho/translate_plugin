// jQuery.noConflict();

// (function($, PLUGIN_ID) {
//   'use strict';

//   var $form = $('.js-submit-settings');
//   var $cancelButton = $('.js-cancel-button');
//   var $message = $('.js-text-message');
//   if (!($form.length > 0 && $cancelButton.length > 0 && $message.length > 0)) {
//     throw new Error('Required elements do not exist.');
//   }
//   var config = kintone.plugin.app.getConfig(PLUGIN_ID);

//   if (config.message) {
//     $message.val(config.message);
//   }
//   $form.on('submit', function(e) {
//     e.preventDefault();
//     kintone.plugin.app.setConfig({message: $message.val()}, function() {
//       alert('The plug-in settings have been saved. Please update the app!');
//       window.location.href = '../../flow?app=' + kintone.app.getId();
//     });
//   });
//   $cancelButton.on('click', function() {
//     window.location.href = '../../' + kintone.app.getId() + '/plugin/';
//   });
// })(jQuery, kintone.$PLUGIN_ID);

// config------------------------------------------------------------------
// let config = {
//   display_language:"en",
//   language_list:[
//       {
//           language: "",
//           lang_code: ""
//       },
//       {
//           language: "",
//           lang_code: ""
//       },
//       {
//           language: "",
//           lang_code: ""
//       }
//   ],
//   item_group:[
//       {
//           item_code: "",
//           space_element: "",
//           lang_type:[
//               "",
//               "",
//               ""
//           ]
//       },
//       {
//           item_code: "",
//           space_element: "",
//           lang_type:[
//               "",
//               "",
//               ""
//           ]
//       }
//   ],
//   translate_direction:"from", // from || to
//   translate_engine: {
//       type: 'mymemories || google api || deep trans',
//       url: 'https://api.mymemory.translated.net/get',
//       token: '',
//       apiKey: ''
//   }
// }
// ----------------------------------------
jQuery.noConflict();

(function ($, Swal10, PLUGIN_ID) {
  "use strict";

  let langList = window.language_pack();

  var configJSON = {};
  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  var fieldList = [];

  // check row to hide remove row button if its has one row
  const checkRowNumber = () => {
    console.log($("#table_lang tbody>tr"));
    if ($("#table_lang tbody>tr").length === 2) {
      $("#table_lang tbody>tr .removeList").eq(1).hide();
    } else {
      $(".removeList").show();
    }
  };

  // check row to hide remove row button if its has one row
  const checkRowSpace = () => {
    console.log($("#table_spaces tbody>tr"));
    if ($("#table_spaces tbody>tr").length === 2) {
      $("#table_spaces tbody>tr .removeList_1").hide();
    } else {
      $(".removeList_1").show();
    }
  };

  const createNewRowSpace = (type, row) => {
    // select the table row to clone
    var $rowToClone = $("#table_spaces tbody>tr:last");

    // clone the row without its data
    var $newRow = $rowToClone.clone(false);

    // clone row after click row if add new row
    if (type === "new") {
      row.parent().parent().after($newRow);
    }
    // clone row if set from config data
    if (type === "config") {
      $rowToClone.after($newRow);
    }
    return;
  };

  // create config to set plugin config and export to json file
  checkRowNumber();
  checkRowSpace();
  $(document).ready(function () {

    //events user chabge angine
    let currentEngine;
    let langListForUes = langList.google_tran_api;
    let defalult_engine = $("input[name='engin']:checked").val();
    $(document).on('change', "input[name='engin']", function () {
      
      //check current engine
        currentEngine = $("input[name='engin']:checked").val();
          if(currentEngine == "google_tran_api"){
              langListForUes = langList.google_tran_api;
              whenChangeEngine(langListForUes);
          } else if(currentEngine == "deepl_api"){
              langListForUes = langList.deepl_api;
              whenChangeEngine(langListForUes);
          }else if(currentEngine == "my_memory_api"){
              langListForUes = langList.my_memory_api;
              whenChangeEngine(langListForUes);
          }
    });

    function setLanguageEngineDefault(confirm,engineDefaults) {
      let confirmVal = confirm;
      console.log("🚀 ~ file: config.js:151 ~ setLanguageEngineDefault ~ confirmVal:", confirmVal)
      let engineDefault;
      console.log(engineDefaults);
            if(engineDefaults == "google_tran_api"){
              engineDefault = langList.google_tran_api;
              langListForUes = langList.google_tran_api;
          } else if(engineDefaults == "deepl_api"){
            engineDefault = langList.deepl_api;
            langListForUes = langList.deepl_api;
          }else if(engineDefaults == "my_memory_api"){
            engineDefault = langList.my_memory_api;
            langListForUes = langList.my_memory_api;
          }
          console.log(engineDefault);
          console.log("langListForUes"+ langListForUes);
          
          console.log("🚀 ~ file: config.js:161 ~ setLanguageEngineDefault ~ engineDefault:", engineDefault.code3)
      
                $("#table_lang tbody tr:eq("+0+")> td #country-selection > option").remove();
                $("#table_lang tbody tr:eq("+0+")> td #country-selection").append(new Option('-----', '-----'));
      
                    //append new engine langueges list
                    for (let j = 0; j < engineDefault.length; j++){
                      let country = engineDefault[j].language;
                      $("#table_lang tbody tr:eq("+0+")> td #country-selection").append(new Option(country, country));
                    }
              
          }

    //when changing engine
    function whenChangeEngine(engine) {

      let dataLength = engine.length;
      let languageNotMatch = [];
      let table = $("#table_lang tbody tr");

      //loop value to have from the language list 
          for(let i = 0; i < table.length; i++) {
                let tr = $(`#table_lang tbody tr:eq(${i})> td #country-selection option:selected`).val();
              //condition when tr does not match with engine language
              let l;
              for (l = dataLength - 1; l >= 0 && engine[l].language !== tr; l--);

              // condition when tr match
              if(l >= 0){
                  $("#table_lang tbody tr:eq("+i+")> td #country-selection > option").remove();
                  $("#table_lang tbody tr:eq("+i+")> td #country-selection").append(new Option('-----', '-----'));

                      //append new engine langueges list
                      for (let j = 0; j < engine.length; j++){
                        let country = engine[j].language;
                        $("#table_lang tbody tr:eq("+i+")> td #country-selection").append(new Option(country, country));
                      }
                      //set default value
                      $("#table_lang tbody tr:eq("+i+")> td #country-selection").val(engine[l].language).change();

              // condition when tr does not match
              } else if ( tr === '-----' || i === 0){
                $("#table_lang tbody tr:eq("+i+")> td #country-selection > option").remove();
                            $("#table_lang tbody tr:eq("+i+")> td #country-selection").append(new Option('-----', '-----'));
            
                              //append new engine langueges list
                              for (let j = 0; j < engine.length; j++){
                                let country = engine[j].language;
                                $("#table_lang tbody tr:eq("+i+")> td #country-selection").append(new Option(country, country));
                              }
                         
              }else if(l < 0 && tr !== '-----') {
                languageNotMatch.push(i);
                }
            }

            //popup sweent alert when tr does not match
            if (languageNotMatch.length > 0) {
                  Swal10.fire({
                    title: 'Are you sure?',
                    text: "Have "+languageNotMatch.length+" language not match",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
              }).then((result) => {
                if (result.isConfirmed) {
                      setCurrentEngine();
                      languageNotMatch.sort((a, b) => b - a); // sort data to be ASD

                      for (let index = 0; index < languageNotMatch.length; index++) {
                        const element = languageNotMatch[index];
                        $("#table_lang tbody tr").eq(element).remove();
                      }

                      if($("#table_lang tbody tr").length == 1) {
                        $("#kintoneplugin-setting-tbody > tr").eq(0).clone(true).insertAfter($("#kintoneplugin-setting-tbody > tr")).eq(0);
                      }

                      Swal10.fire(
                        'Deleted!',
                        'Your language has been deleted.',
                        'success'
                      )

                }else if(result.isDismissed){
                  $("input[name='engin'][value="+defalult_engine+"]").prop("checked", true);
                  console.log(defalult_engine);
                  setLanguageEngineDefault("No",defalult_engine)
                }

              });
            }

    }

    //update value of engine
    function setCurrentEngine() {
      defalult_engine = $("input[name='engin']:checked").val();
    }

    //
    function setDefaultfunction() {
      let checkConfig = 0;
      if (checkConfig == 0) {
        for (let k = 0; k < langListForUes.length; k++){
            let country = langListForUes[k].language;
            $("#country-selection").append(new Option(country, country));
        }

        $("#kintoneplugin-setting-tbody > tr").eq(0).clone(true).insertAfter($("#kintoneplugin-setting-tbody > tr")).eq(0);
        $("#table_spaces > tbody > tr").eq(0).clone(true).insertAfter($("#table_spaces > tbody > tr")).eq(0);
        checkRowNumber();
        checkRowSpace();
      }
    }

  // set dropdown to select SPACE field  
  async function setFieldSpace() {

    const param = { app: kintone.app.getId() };
    const field = await kintone.api('/k/v1/preview/app/form/layout', 'GET', param);
      field.layout.forEach((item) => {
        item.fields.forEach((item2) => {
          if(item2.type === 'SPACER'){
            $('#table_spaces tbody tr:eq(0) #select_field_space').append(new Option(item2.elementId, item2.elementId));
          }
        });
      })
    setDefaultfunction();
    return;
  }

  async function setFieldList() {

    const param = { app: kintone.app.getId() };
    const field = await kintone.api('/k/v1/preview/app/form/layout', 'GET', param);
      field.layout.forEach((item) => {
        item.fields.forEach((item2) => {
          
          if(item2.type === 'SINGLE_LINE_TEXT' || item2.type === 'RICH_TEXT'){
            for(let k = 0; k < $('#table_spaces tbody tr').length; k++){
              $('#table_spaces tbody tr:eq('+k+') #select_field_translate').append(new Option(item2.code, item2.code));
            }
          }
        });
      })
    return;
  }

  

    // add new row in table setting
    $(document).on("click", ".addList", function () {
      // clone the row without its data
      let $newRow = $("#kintoneplugin-setting-tbody > tr").eq(0).clone(true);
      $(this).parent().parent().after($newRow);
      checkRowNumber();
    });

    $(document).on("click", ".addList_1", function () {

      let $newRowSpace = $("#table_spaces > tbody > tr").eq(0).clone(true);
      $(this).parent().parent().after($newRowSpace);
      checkRowSpace();
    });

    // remove selected row in table setting
    $(document).on("click", ".removeList", function () {
      $(this).parent("td").parent("tr").remove();
      checkRowNumber();
    });

    // remove selected row in table setting
    $(document).on("click", ".removeList_1", function () {
      $(this).parent("td").parent("tr").remove();
      console.log($("#table_spaces tbody>tr"));
      checkRowSpace();
    });

    $(document).on("change", "#kintoneplugin-setting-tbody > tr > td #country-selection", function () {
      let currentVal = $(this).val();
      if(currentVal == '-----') {
  
        let trLength = $(this).parents('tr').index() + 1;
        $('#kintoneplugin-setting-tbody > tr:nth-child('+trLength+') > td:nth-child(3) #suffix_field_column').val('');
      } else {
        let countryList = langListForUes.filter(function(index) {
          return index.language === currentVal;
        });
        let setCode3 = countryList[0].code3;
        let setCode = countryList[0].code;

        let trLength = $(this).parents('tr').index() + 1;
        $('#kintoneplugin-setting-tbody > tr:nth-child('+trLength+') > td #suffix_field_column').val(setCode3.toUpperCase());
        $('#kintoneplugin-setting-tbody > tr:nth-child('+trLength+') > td #code_iso').val(setCode);
      }  
    });
    

    // reset btn.
    $(document).on("click", ".reset-btn", function () {
      // clone the row without its data
      let lang_list_count = $("#kintoneplugin-setting-tbody > tr").length;
      $("#field-selection > option").remove();
      $("#table_spaces > thead > tr > th:nth-child(n+3)").remove();
      $("#table_spaces > tbody > tr:nth-child(n+1) > td:nth-child(n+3)").remove();
      $("#field-selection").append(new Option("-----", "-----"));

      for (let i = 2; i <= lang_list_count; i++) {
        let trValCode = $("#kintoneplugin-setting-tbody > tr:nth-child(" + i + ") #suffix_field_column").val();
        let trValLang = $("#kintoneplugin-setting-tbody > tr:nth-child(" + i + ") #country-selection").val();
        let concatenatedOption = trValLang+'('+trValCode.toUpperCase()+')';

        if (!trValCode && !trValLang || trValLang == "-----") {
          continue;
        } else {
          $("#field-selection").append(new Option(concatenatedOption, trValCode));
          $("#table_spaces > thead > tr").append(`<th class="kintoneplugin-table-th"><span class="title">${trValLang}</span></th>`);
          // createSpaceSec(trVal);
          $("#table_spaces > tbody > tr").append(`<td>
              <div class="kintoneplugin-table-td-control">
                <div class="kintoneplugin-table-td-control-value">
                  <div class="kintoneplugin-input-outer">
                    <div class="kintoneplugin-select">
                      <select name="field_dropdown_column" id="select_field_translate" class="cf-column1">
                        <option value="">-----</option>
                        <option value="SP_NAME">SP_NAME</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </td>`);
        }
      }
      setFieldList()
        $("#table_spaces tbody>tr").append(`<td style="display: flex;" class="kintoneplugin-table-td-operation cf-operation-column">
            <button type="button" class="kintoneplugin-button-add-row-image addList_1" title="Add row"></button>
            <button type="button" class="kintoneplugin-button-remove-row-image removeList_1" title="Delete this row"></button>
        </td>`);
      checkRowSpace();
    }) ;
    
    // Drag and Drop
    $('#kintoneplugin-setting-tbody > tr').on('dragstart', function (event) {
      $(this).addClass('dragging');
      event.originalEvent.dataTransfer.setData('text/plain', '');
    });

    $('#kintoneplugin-setting-tbody > tr').on('dragend', function () {
      $(this).removeClass('dragging');
    });
    let element = document.getElementById('kintoneplugin-setting-tbody');
    console.log(element);
    $('#kintoneplugin-setting-tbody').on('dragover', function (event) {
      event.preventDefault();
      $(this).addClass('dragover');
    });

    $('#kintoneplugin-setting-tbody > tr').on('dragleave', function () {
      $(this).removeClass('dragover');
    });

    $('#kintoneplugin-setting-tbody > tr').on('drop', function (event) {
      event.preventDefault();
      $(this).removeClass('dragover');
      const draggedRow = $('.dragging');
      const targetRow = $(this);

      if (draggedRow.index() < targetRow.index()) {
        draggedRow.insertAfter(targetRow);
      } else {
        draggedRow.insertBefore(targetRow);
      }
      checkRowNumber();
    });

    $('#kintoneplugin-setting-tbody > tr').on('dragend', function () {
      $(this).removeClass('dragging');
    });

    setFieldSpace()
    setCurrentEngine();
  });

})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);
