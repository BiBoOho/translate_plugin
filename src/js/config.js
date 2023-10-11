jQuery.noConflict();

(function ($, Swal10, PLUGIN_ID) {
  "use strict";

  let langList = window.language_pack();
  let confirmButton = $('#save');
  let translate_url = $('#tran_url');
  let header_1 = $('#header_1');
  let header_2 = $('#header_2');
  let header_3 = $('#header_3');

  let CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
  console.log("🚀 ~ file: config.js:14 ~ CONF:", CONF)

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
    // let previous_engine = $("input[name='engine']:checked").val();
    let tran_direction = $("input[name='tran_direction']:checked").val();

    $(document).on('change', "input[name='tran_direction']", function () {
      //check current translation direction
      tran_direction = $("input[name='tran_direction']:checked").val();
    });

    function checkEngine(){
      //check current engine
      currentEngine = $("input[name='engine']:checked").val();
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

    //when changing engine
    $(document).on('change', "input[name='engine']", checkEngine);

    //check engine are match or not match
    function createLanguageSelectionList(engine) {

      let dataLength = engine.length;
      let languageNotMatch = [];
      let languageMatch = [];
      let table = $("#table_lang tbody tr");
      let previous_value;

      //loop value to have from the language list 
      for(let i = 0; i < table.length; i++) {
            let tr = $(`#table_lang tbody tr:eq(${i})> td select[name='country-selection'] option:selected`).val();
            //condition when tr does not match with engine language
            let l;
            for (l = dataLength - 1; l >= 0 && engine[l].language !== tr; l--);
            console.log(l);
            // condition when value match
            if(l >= 0 || tr === '-----'){
                  languageMatch.push(i);
                  previous_value = $("#table_lang tbody tr:eq("+i+")> td select[name='country-selection'] option:selected").val()
             
              // condition when value dose not match    
              }else if(l < 0 && tr !== '-----') {
                  languageNotMatch.push(i);
                  previous_value = "-----";
              }

              $("#table_lang tbody tr:eq("+i+")> td select[name='country-selection'] > option").remove();
              $("#table_lang tbody tr:eq("+i+")> td select[name='country-selection']").append(new Option('-----', '-----'));

                  //append new engine langueges list
                  for (let j = 0; j < engine.length; j++){
                    let country = engine[j].language;
                    $("#table_lang tbody tr:eq("+i+")> td select[name='country-selection']").append(new Option(country, country));
                  }
                  //set default value
                  $("#table_lang tbody tr:eq("+i+")> td select[name='country-selection']").val(previous_value).change();
            }

            //set border red for 
            if (languageNotMatch.length > 0) {
                    languageNotMatch.sort((a, b) => b - a); // sort data to be ASD
              
                    for (let index = 0; index < languageNotMatch.length; index++) {
                          const element = languageNotMatch[index];
                          $("#table_lang tbody tr select[name='country-selection']").eq(element).parent().addClass("set-border");
                        }
            }
    }


    $("#table_lang tbody tr select[name='country-selection']").change(function(){
        $(this).parent().removeClass("set-border");
    });

    //set default when not have config value
    function setDefaultfunction() {
      if (CONF) {
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

  // set dropdown to select SINGLE_LINE_TEXT, RICH_TEXT, SUBTABLE, MULTI_LINE_TEXT field  
  async function setFieldList() {

    const param = { app: kintone.app.getId() };
    const field = await kintone.api('/k/v1/preview/form', 'GET', param);
    let fields_title = [];
    let concatenateName
      field.properties.forEach((item) => {
          if(item.type === 'SINGLE_LINE_TEXT' || item.type === 'RICH_TEXT' || item.type === 'MULTI_LINE_TEXT'){
            concatenateName = {key : item.code , value : item.label + ' (' + item.code + ')'}
            fields_title.push(concatenateName);
          }else if(item.type === 'SUBTABLE') {
            item.fields.forEach((item2) => {
            concatenateName = {key : item.code , value : item.label + ' (' + item.code + ',' + item2.code +')'}
              fields_title.push(concatenateName);
            });
          }
        });

      let fields_sort = fields_title.sort((a, b) => a.value.localeCompare(b.value));
      for(let k = 0; k < $('#table_spaces tbody tr').length; k++){
        $.each(fields_sort, function(index, value) {
          // Perform actions on each element
          let key = value.key;
          let title = value.value;
          $(`#table_spaces tbody tr:eq(${k}) select[name='select_field_translate']`).append(new Option(title, key));
        });
      }

  }

    // when change the selected fields to type Subtable
  $(document).on("change", "#table_spaces tbody tr > td select[name='select_field_translate']", function () {
    let thisElementRow = $(this);
    let selectedRowIndex = $(this).parents("tr").index();
    console.log("🚀 ~ file: config.js:191 ~ selectedRowIndex:", selectedRowIndex)

    let header = {
      'app': kintone.app.getId()
    }

    kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', header, function (resp) {
      let data = resp.properties;
      let subTableRowCheck = false;
      let notSubTableRowCheck = false;

      $("#table_spaces > tbody > tr:eq("+selectedRowIndex+") > td select[name='select_field_translate'] option:selected").each(async function() {
          let thisOptionValue = $(this).val();

          for (let index = 0; index < data.length; index++) {
            const checkValCode = data[index];
            if (thisOptionValue == checkValCode.code) {
              if(checkValCode.type !== 'SUBTABLE') {
                notSubTableRowCheck = true;
              }else if (checkValCode.type === 'SUBTABLE') {
                subTableRowCheck = true;
              }
            }

            //check if all of selected options are 'SUBTABLE' type
            if (subTableRowCheck && notSubTableRowCheck) {
              $(thisElementRow).parents("tr").find("select[name='select_field_space']").attr('disabled', false);
            }else if (subTableRowCheck && !notSubTableRowCheck){
              $(thisElementRow).parents("tr").find("select[name='select_field_space']").val('-----').change();
              $(thisElementRow).parents("tr").find("select[name='select_field_space']").attr('disabled', true);
            }else if(!subTableRowCheck && notSubTableRowCheck) {
              $(thisElementRow).parents("tr").find("select[name='select_field_space']").attr('disabled', false);
            }
          }
        });
      });
    });

    // Create config to save in plugin config setting
    const setConfig = () => {

        let tran_direction_set = {
          type: currentEngine,
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
              iso: $(`#table_lang tbody tr:eq(${index})> td input[name='code_iso']`).val()
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

    //when change language 
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
                text: 'Your language list choices have the same language.!!',
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
            $("select[name='default_lang']").append("<option value="+trValCode+" value-for-check="+trValLang+">"+concatenatedOption+"</option>");
            $("#table_spaces > thead > tr").append(`<th class="kintoneplugin-table-th"><span class="title">${btnLabel}</span></th>`);
            $("#table_spaces > tbody > tr").append(`<td>
                <div class="kintoneplugin-table-td-control">
                  <div class="kintoneplugin-table-td-control-value">
                    <div class="kintoneplugin-input-outer">
                      <div class="kintoneplugin-select">
                        <select name="select_field_translate" class="select_field_translate">
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

      if ($(translate_url).val() == '' && !checkList) {
        checkList = true;
        Swal10.fire({
          icon: 'error',
          title: 'Oops...',
          html: `Please enter URL engine!!!`,
        });
      }else{
        checkList = false;
      }

      if (!checkList) {
      //validation the default language and language list
      let table = $("#table_lang tbody tr");
      if (table.length <= 2 && $(`#table_lang tbody tr:eq(${1})> td select[name='country-selection'] option:selected`).val() === '-----') {
              checkList = true;
              Swal10.fire({
                  icon: 'error',
                  title: 'Oops...',
                  html: `Please select language list!!!`,
                });
      }else if($(`#table_lang tbody tr:eq(${1})> td select[name='country-selection'] option:selected`).val() !== '-----' && $("select[name='default_lang'] option").length == 1) {

              Swal10.fire({
                icon: 'error',
                title: 'Oops...',
                html: `Language list and Lnaguage default not match!<br>Plase click Reflection button!`,
              });
      }else if($("select[name='default_lang'] option").length == table.length) {
              $("select[name='default_lang'] option").slice(1).each(function(index) {
                let optionValue = $(this).val();
                let operationIndex = index;

                //check Option match with code iso
                    if ($(`#table_lang tbody tr:eq(${operationIndex+1})> td input[name='code_iso']`).val() !== optionValue) {
                      checkList = true;
                      Swal10.fire({
                          icon: 'error',
                          title: 'Oops...',
                          html: `Language list and Lnaguage default not match!<br>Plase click Reflection button!`,
                        });
                    }else{
                      checkList = false;
                    }
              });
            } else {
              checkList = true;
                  Swal10.fire({
                      icon: 'error',
                      title: 'Oops...',
                      html: `Language list and Lnaguage default not match!<br>Plase click Reflection button!`,
                    });
            }   
      
    }

      if (!checkList) {
        //validate when have the same Item
      // Select all input elements of type text within the table
      let textInputs = $('#table_spaces').find('input[type="text"]');
      let space_length = $(`#table_spaces tbody tr`).length;

      for (let k = 1; k < space_length; k++) {
        const space_index = k;
        let check_item = false;
        textInputs.slice(1).each(function(index) {
          let index_check = k - 1;
          let inputValue = $(this).val();
          
          // Do something with the input value
          if ($(`#table_spaces tbody tr:eq(${space_index})> td input[type="text"]`).val() === '') {
                  Swal10.fire({
                    icon: 'error',
                    title: 'Oops...',
                    html: `Please Input all of Item!!`,
                  });
                  check_item = true;
          }else if (index_check != index && inputValue == $(`#table_spaces tbody tr:eq(${space_index})> td input[type="text"]`).val()) {
                  Swal10.fire({
                    icon: 'error',
                    title: 'Oops...',
                    html: `Have the same Item "${$(`#table_spaces tbody tr:eq(${space_index})> td input[type="text"]`).val()}" !!`,
                  });
                  check_item = true;
                  return false;
          } else {
            check_item = false;
          }
        });

        if (!check_item) {

          let header = {
            'app': kintone.app.getId()
          }

          kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', header, function (resp) {
            let data = resp.properties;
            let subTableCheck = false;
            let notSubTableCheck = false;
            $(`#table_spaces > tbody > tr:eq(${space_index}) > td select[name='select_field_translate'] option:selected`).each(async function() {
              let value = $(this).val();

              
              for (let index = 0; index < data.length; index++) {
                const checkValname = data[index];
                if (value == checkValname.code) {
                  if(checkValname.type !== 'SUBTABLE') {
                    // notSubTableCheck.push(checkValname);
                    subTableCheck = true;
                  }
                  if (checkValname.type === 'SUBTABLE') {
                    // subTableCheck.push(checkValname);
                    notSubTableCheck = true;
                  }
                }

                 if (subTableCheck && notSubTableCheck) {
                  checkList = true;
                  Swal10.fire({
                    icon: 'error',
                    title: 'Oops...',
                    html: `subtable to select not match!!`,
                  });
                  return;
                }else {
                  checkList = false;
                } 
              }
            });
          });
        }
      }
        
      }

      
      // Loop through the selected inputs
      // if (!checkList) {
      //   let config = setConfig();
      //       kintone.plugin.app.setConfig(config, function () {
      //         Swal10.fire(
      //           'Complete',          
      //           'successfully',
      //           'success'
      //         ).then(function () {
      //           window.location.href = '../../flow?app=' + kintone.app.getId() + '#section=settings';
      //         });
      //       });
      // }

    });

    setFieldSpace();
  });

})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);
