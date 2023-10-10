jQuery.noConflict();

(function ($, Swal10, PLUGIN_ID) {
  "use strict";

  let langList = window.language_pack();
  let confirmButton = $('#save');
  let translate_url = $('#tran_url');
  let header_1 = $('#header_1');
  let header_2 = $('#header_2');
  let header_3 = $('#header_3');

  var config = kintone.plugin.app.getConfig(PLUGIN_ID);

  console.log(config);

  // check row to hide remove row button if its has one row
  const checkRowNumber = () => {
    if ($("#table_lang tbody>tr").length === 2) {
      $("#table_lang tbody>tr .removeList").eq(1).hide();
    } else {
      $(".removeList").show();
    }
  };

  // check row to hide remove row button if its has one row
  const checkRowSpace = () => {
    if ($("#table_spaces tbody>tr").length === 2) {
      $("#table_spaces tbody>tr .removeList_1").hide();
    } else {
      $(".removeList_1").show();
    }
  };

  // create config to set plugin config and export to json file
  checkRowNumber();
  checkRowSpace();

  $(document).ready(function () {

    //events user chabge angine
    let currentEngine;
    let languageListForUse = langList.google_tran_api;
    let previous_engine = $("input[name='engine']:checked").val();
    let tran_direction = $("input[name='tran_direction']:checked").val();

    $(document).on('change', "input[name='tran_direction']", function () {
      //check current translation direction
      tran_direction = $("input[name='tran_direction']:checked").val();
    });

    function checkEngine(e){
      //check current engine
      currentEngine = $("input[name='engine']:checked").val();
      console.log("🚀 ~ file: config.js:55 ~ checkEngine ~ currentEngine:", currentEngine)
      if (currentEngine == "google_tran_api") {
        languageListForUse = langList.google_tran_api;
      } else if (currentEngine == "deepl_api") {
        languageListForUse = langList.deepl_api;
      } else if (currentEngine == "my_memory_api") {
        languageListForUse = langList.my_memory_api;
      } else {
        languageListForUse = [];
      }
      
      createLanguageSelectionList(languageListForUse);
    }

    $(document).on('change', "input[name='engine']", checkEngine);

    //when changing engine
    function createLanguageSelectionList(engine) {

      let dataLength = engine.length;
      let languageNotMatch = [];
      let languageMatch = [];
      let table = $("#table_lang tbody tr");

      //loop value to have from the language list 
      for(let i = 0; i < table.length; i++) {
            let tr = $(`#table_lang tbody tr:eq(${i})> td select[name='country-selection'] option:selected`).val();
            //condition when tr does not match with engine language
            let l;
            for (l = dataLength - 1; l >= 0 && engine[l].language !== tr; l--);

            // condition when value match
            if(l >= 0 || tr === '-----'){
                  languageMatch.push(i);
            // condition when value = -----
             
              // condition when value dose not match    
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
                      );

                }else if(result.isDismissed){
                  $("input[name='engine'][value="+previous_engine+"]").prop("checked", true);
                  return;
                }
              });
            }else if (languageMatch.length > 0) {
                let tbRow = languageMatch;
              for (let i = 0; i < languageMatch.length; i++){
                    tbRow = languageMatch[i];
                    let previous_value = $("#table_lang tbody tr:eq("+tbRow+")> td select[name='country-selection'] option:selected").val()
                    console.log("🚀 ~ file: config.js:178 ~ createLanguageSelectionList ~ previous_value:", previous_value)
                    $("#table_lang tbody tr:eq("+tbRow+")> td select[name='country-selection'] > option").remove();
                    $("#table_lang tbody tr:eq("+tbRow+")> td select[name='country-selection']").append(new Option('-----', '-----'));

                        //append new engine langueges list
                        for (let j = 0; j < engine.length; j++){
                          let country = engine[j].language;
                          $("#table_lang tbody tr:eq("+tbRow+")> td select[name='country-selection']").append(new Option(country, country));
                        }
                        //set default value
                        $("#table_lang tbody tr:eq("+tbRow+")> td select[name='country-selection']").val(previous_value).change();
              }

              
            
            }else {
              setCurrentEngine();
            }

    }

    // update value of engine
    function setCurrentEngine() {
      previous_engine = $("input[name='engine']:checked").val();
      // console.log("🚀 ~ file: config.js:163 ~ setCurrentEngine ~ previous_engine:", previous_engine)
    }

    //
    function setDefaultfunction() {
      let checkConfig = 0;
      if (checkConfig == 0) {
        for (let k = 0; k < languageListForUse.length; k++){
            let country = languageListForUse[k].language;
            $("select[name='country-selection']").append(new Option(country, country));
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
            $("#table_spaces tbody tr:eq(0) > td select[name='select_field_space']").append(new Option(item2.elementId, item2.elementId));
          }
        });
      })
    setDefaultfunction();
    return;
  }

  async function setFieldList() {

    const param = { app: kintone.app.getId() };
    const field = await kintone.api('/k/v1/preview/app/form/layout', 'GET', param);
    let fields_code = [];
      field.layout.forEach((item) => {
        item.fields.forEach((item2) => {
          if(item2.type === 'SINGLE_LINE_TEXT' || item2.type === 'RICH_TEXT'){
            fields_code.push(item2.code); 
          }
        });
      });

      console.log(fields_code.sort());
      let fields_sort = fields_code.sort();
      for(let k = 0; k < $('#table_spaces tbody tr').length; k++){
        fields_sort
        $.each(fields_sort, function(index, value) {
          // Perform actions on each element
          console.log("Element " + index + ": " + value);
          $(`#table_spaces tbody tr:eq(${k}) select[name='select_field_translate']`).append(new Option(value, value));
        });
        
      }


    return;
  }

  // Create config to save in plugin config setting
  const setConfig = () => {

      let tran_direction_set = {
        type: previous_engine,
        url: $(translate_url).val(),
        headers: [
          {
            header: $(header_1).val(), 
          },
          {
            header: $(header_2).val(),
          },
          {
            header: $(header_3).val(),
          }
        ]
      }

      let lang_list_set = [];
      $('#table_lang tbody tr').each(function(index) {
        if (index !== 0) {
          lang_list_set.push({
            language: $(`#table_lang tbody tr:eq(${index})> td select[name='country-selection'] option:selected`).val(),
            button_label: $(`#table_lang tbody tr:eq(${index})> td input[name='button_label']`).val(),
            lang_code: $(`#table_lang tbody tr:eq(${index})> td input[name='lang_code']`).val(),
            lang_iso: $(`#table_lang tbody tr:eq(${index})> td input[name='code_iso']`).val()
          });
        }
      });

      let translate_fields = [];
      $('#table_spaces tbody tr').each(function(index) {
        if (index !== 0) {

          let field_translate_length = [];
          $(`#table_spaces tbody tr:eq(${index})> td select[name='select_field_translate']`).each(function(i) {
            let field_translate_obj = {iso : $(`#table_lang tbody tr:eq(${i+1})> td input[name='code_iso']`).val(), field: $(this).val()}
            field_translate_length.push(field_translate_obj);
          });
          
          translate_fields.push({
            item_code: $(`#table_spaces tbody tr:eq(${index})> td input[name='item_code']`).val(),
            space_element: $(`#table_spaces tbody tr:eq(${index})> td select[name='select_field_space'] option:selected`).val(),
            target_fields: field_translate_length
          });

        }
      });

    let configuration = {
      translate_direction: tran_direction,
      translate_engine:  JSON.stringify(tran_direction_set), 
      language_list:  JSON.stringify(lang_list_set), 
      default_language: $(`select[name='default_lang'] option:selected`).val(),
      translate_fields: JSON.stringify(translate_fields),
    };
    return configuration;
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

    $(document).on("change", "#kintoneplugin-setting-tbody > tr > td select[name='country-selection']", function () {
      let currentVal = $(this).val();
      if(currentVal == '-----') {
  
        let trLength = $(this).parents('tr').index() + 1;
        $(`#kintoneplugin-setting-tbody > tr:nth-child(${trLength}) > td:nth-child(3) input[name='code_iso']`).val('');
      } else {
        let countryList = languageListForUse.filter(function(index) {
          return index.language === currentVal;
        });
        let setCode3 = countryList[0].code3;
        let setCode = countryList[0].code;

        let trLength = $(this).parents('tr').index() + 1;
        $(`#kintoneplugin-setting-tbody > tr:nth-child(${trLength}) > td input[name='code_iso']`).val(setCode3.toUpperCase());
        $(`#kintoneplugin-setting-tbody > tr:nth-child(${trLength}) > td input[name='lang_code']`).val(setCode);
      }  
    });
    
    let found = false;
    // reflection btn.
    $(document).on("click", ".reset-btn", function () {
      //check when have the same language
      let lang_list_count = $("#kintoneplugin-setting-tbody > tr").length;
      $("#kintoneplugin-setting-tbody > tr > td select[name='country-selection'] option:selected").each(function (index) {

          // Target value to check
          var targetValue = $("#kintoneplugin-setting-tbody > tr:eq("+index+") > td select[name='country-selection'] option:selected").val();
          var targetIndex = index;

          // Flag to indicate if the value is found
          for (let i = 2; i <= lang_list_count; i++) {
            let targetValueCheck = $("#kintoneplugin-setting-tbody > tr:eq("+i+") > td select[name='country-selection'] option:selected").val();
            if (targetIndex === i) {
                  continue;
            } else if (targetValue === targetValueCheck) {
              
              Swal10.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
              });
              found = true;
              return false;
            } else {
              found = false;
            }
          }
      });

      if (!found) {
        // clone the row without its data     
        $("select[name='default_lang'] > option").remove();
        $("#table_spaces > thead > tr > th:nth-child(n+3)").remove();
        $("#table_spaces > tbody > tr:nth-child(n+1) > td:nth-child(n+3)").remove();
        $("select[name='default_lang']").append(new Option("-----", "-----"));
  
        for (let i = 2; i <= lang_list_count; i++) {
          let trValCode = $("#kintoneplugin-setting-tbody > tr:nth-child(" + i + ") input[name='code_iso']").val();
          let trValLang = $("#kintoneplugin-setting-tbody > tr:nth-child(" + i + ") select[name='country-selection']").val();
          let btnLabel = $("#kintoneplugin-setting-tbody > tr:nth-child(" + i + ") input[name='button_label']").val();
          let concatenatedOption = trValLang+'('+trValCode.toUpperCase()+')';
  
          if (!trValCode && !trValLang || trValLang == "-----") {
            continue;
          } else {
            $("select[name='default_lang']").append(new Option(concatenatedOption, trValLang));
            $("#table_spaces > thead > tr").append(`<th class="kintoneplugin-table-th"><span class="title">${btnLabel}</span></th>`);
            $("#table_spaces > tbody > tr").append(`<td>
                <div class="kintoneplugin-table-td-control">
                  <div class="kintoneplugin-table-td-control-value">
                    <div class="kintoneplugin-input-outer">
                      <div class="kintoneplugin-select">
                        <select name="select_field_translate">
                          <option value="">-----</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </td>`);
          }
        }
        setFieldList()
          $("#table_spaces tbody>tr").append(`<td style="display: flex;" class="kintoneplugin-table-td-operation">
              <button type="button" class="kintoneplugin-button-add-row-image addList_1" title="Add row"></button>
              <button type="button" class="kintoneplugin-button-remove-row-image removeList_1" title="Delete this row"></button>
          </td>`);
        checkRowSpace();
      }
    });
    
    // Drag and Drop
    $('#kintoneplugin-setting-tbody > tr').on('dragstart', function (event) {
      $(this).addClass('dragging');
      event.originalEvent.dataTransfer.setData('text/plain', '');
    });

    $('#kintoneplugin-setting-tbody > tr').on('dragend', function () {
      $(this).removeClass('dragging');
    });
    let element = document.getElementById('kintoneplugin-setting-tbody');
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

    confirmButton.on('click', function () {

      let checkList = false;
      //validation the default language and language list
      let table = $("#table_lang tbody tr");
      if (table.length != $("select[name='default_lang'] option").length) {
              checkList = true;
              Swal10.fire({
                  icon: 'error',
                  title: 'Oops...',
                  html: `language list and Lnaguage default not match!<br>Plase click Reflection button!`,
                });
      }else{

        $("select[name='default_lang'] option").slice(1).each(function() {
          let optionValue = $(this).val();
          
          // Do something with the option value and text
            let l;
            for (l = table.length; l >= 0 && $(`#table_lang tbody tr:eq(${l+1})> td select[name='country-selection'] option:selected`).val() !== optionValue; l--);

            if (l < 0) {
              checkList = true;
              Swal10.fire({
                  icon: 'error',
                  title: 'Oops...',
                  html: `language list and Lnaguage default not match!<br>Plase click Reflection button!`,
                });
                return false;
            }else{
              checkList = false;
            }
        });

      }

      //validate when have the same Item
      // Select all input elements of type text within the table
      let textInputs = $('#table_spaces').find('input[type="text"]');
      let space_length = $(`#table_spaces tbody tr`).length;

      for (let k = 1; k < space_length; k++) {
        const space_index = k;
        textInputs.slice(1).each(function(index) {
          let index_check = k - 1;
          var inputValue = $(this).val();
          
          // Do something with the input value
          if (index_check != index && inputValue == $(`#table_spaces tbody tr:eq(${space_index})> td input[type="text"]`).val()) {
            Swal10.fire({
              icon: 'error',
              title: 'Oops...',
              html: `Have the same Item "${$(`#table_spaces tbody tr:eq(${space_index})> td input[type="text"]`).val()}" !!`,
            });
            return false;
          }
        });
      }



      // Loop through the selected inputs
      if (!checkList) {
        let config = setConfig();
            kintone.plugin.app.setConfig(config, function () {
              Swal10.fire(
                'Complete',          
                'プラグインの設定が完了しました、アプリを更新してください！',
                'success'
              ).then(function () {
                window.location.href = '../../flow?app=' + kintone.app.getId() + '#section=settings';
              });
            });
      }

    });

    setFieldSpace()
    setCurrentEngine();
  });

})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);
