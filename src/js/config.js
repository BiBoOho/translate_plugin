jQuery.noConflict();

(async function ($, Swal10, PLUGIN_ID) {
  "use strict";

  let langList = window.language_pack();
  let confirmButton = $("#save");
  let translate_url = $("#tran_url");
  let header_1 = $("#header_1");
  let header_2 = $("#header_2");
  let header_3 = $("#header_3");

  let CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

  let FIELDS;
  try {
    let param = { app: kintone.app.getId() };
    FIELDS = await kintone.api("/k/v1/preview/form", "GET", param);
  } catch (error) {
    alert(error)
  }
  

    // check if the table has only one row, hide remove button
    const setActionBtnForLangList = () => {
    if ($("#table_language_list tbody > tr").length === 2) {
      $("#table_language_list tbody > tr .removeRowLanguageList").eq(1).hide();
    } else {
      $(".removeRowLanguageList").show();
    }
  };

  // check row to hide remove row button if its has one row
  const setActionBtnForTranslateFields = () => {
    if ($("#table_translate_field tbody > tr").length === 2) {
      $("#table_translate_field tbody > tr .removeRowTranslateField").hide();
    } else {
      $(".removeRowTranslateField").show();
    }
  };

  
  $(document).ready(function () {
    //events user chabge angine
    let currentEngine = '';
    let previous_engine = $("input[name='engine']:checked").val(); 
    let suporttedLangs = langList.google_tran_api;
    let tran_direction = $("input[name='tran_direction']:checked").val();

    //wheen change the translate direction
    $(document).on("change", "input[name='tran_direction']", function () {
      //remove all checked current translation direction
      $("input[name='tran_direction']").each(function() {
        $(this).removeAttr("checked");
      });
      $(this).attr("checked", true);
      $(this).prop("checked", true);
      tran_direction = $("input[name='tran_direction']:checked").val();
    });

    //change supported langauge engine list
    function checkEngine(getEngine) {
      currentEngine = getEngine;
      if (currentEngine == "google_tran_api") {
        suporttedLangs = langList.google_tran_api;
      } else if (currentEngine == "deepl_api") {
        suporttedLangs = langList.deepl_api;
      } else if (currentEngine == "my_memory_api") {
        suporttedLangs = langList.my_memory_api;
      } else {
        suporttedLangs = [];
      }
      return suporttedLangs
    }

    //when changing engine
    $(document).on("change", "input[name='engine']", async function () {
      let engineSelected = $(this).val();
      let getCurrentEngine =  await checkEngine(engineSelected);
      createLanguageSelectionList(getCurrentEngine)
    });

    //check engine are match or not match
    function createLanguageSelectionList(engine) {
      let dataLength = engine.length;
      let languageMatch = []
      let languageNotMatch = [];
      let tableLanguageLength = $("#table_language_list tbody tr");
      let isMatch = true;
      //loop value to have from the language list
      for (let i = 0; i < tableLanguageLength.length; i++) {
        let selectedLang = $(`#table_language_list tbody tr:eq(${i})> td select[name='language-selection'] option:selected`).val();
        //condition when tr does not match with engine language
        let l;
        for (l = dataLength - 1; l >= 0 && engine[l].language !== selectedLang; l--);
        // condition when value match
        if (l >= 0 || selectedLang === "-----") {
            languageMatch.push(i);
       
        // condition when value dose not match    
        }else if(l < 0 && selectedLang !== '-----') {
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
              let rowLanguageIndex; //comment change to use languageMatch 
              for (let i = 0; i < languageMatch.length; i++){
                    rowLanguageIndex = languageMatch[i];
                    let previous_value = $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection'] option:selected").val()
                    $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection'] > option").remove();
                    $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection']").append(new Option('-----', '-----'));
      
                    //append new engine langueges list
                    for (let j = 0; j < engine.length; j++){
                      let language = engine[j].language;
                      $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection']").append(new Option(language, language));
                    }
                    //set default value
                    $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection']").val(previous_value).change();
              }

              setPreviousEngine();
              languageNotMatch.sort((a, b) => b - a); // sort data to be ASD

              for (let index = 0; index < languageNotMatch.length; index++) {
                const element = languageNotMatch[index];
                $("#table_language_list tbody tr").eq(element).remove();
              }

              if($("#table_language_list tbody tr").length == 1) {
                $("#table_language_list tbody > tr").eq(0).clone(true).insertAfter($("#kintoneplugin-setting-tbody > tr")).eq(0);
                setActionBtnForLangList();
              }

              Swal10.fire(
                'Deleted!',
                'Your language has been deleted.',
                'success'
              );

          }else if(result.isDismissed){
            checkEngine(previous_engine);
            $("input[name='engine'][value="+previous_engine+"]").prop("checked", true);
          }
        });

      }else if (languageMatch.length > 0) {
          let rowLanguageIndex = languageMatch;
          for (let i = 0; i < languageMatch.length; i++){
                rowLanguageIndex = languageMatch[i];
                let previous_value = $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection'] option:selected").val()
                $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection'] > option").remove();
                $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection']").append(new Option('-----', '-----'));

                    //append new engine langueges list
                    for (let j = 0; j < engine.length; j++){
                      let language = engine[j].language;
                      $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection']").append(new Option(language, language));
                    }
                    //set default value
                    $("#table_language_list tbody tr:eq("+rowLanguageIndex+")> td select[name='language-selection']").val(previous_value).change();
          }
          setPreviousEngine();
      }
    }

    function setPreviousEngine() {
      previous_engine = $("input[name='engine']:checked").val();
    }
    
    //set default when not have config value
   async function setInitiative() {
        try {
            //create a option to select space for Transacte fields
            const param = { app: kintone.app.getId() };
            const fields = await kintone.api("/k/v1/preview/app/form/layout","GET",param); // comment use try catch
            fields.layout.forEach((getSpaceFields) => {
              getSpaceFields.fields.forEach((getSpaceFieldCode) => {
                if (getSpaceFieldCode.type === "SPACER") {
                  $("#table_translate_field tbody tr:eq(0) > td select[name='select_field_space']").append(new Option(getSpaceFieldCode.elementId, getSpaceFieldCode.elementId));
                }
              });
            });

            //check if have been or not config
            if (jQuery.isEmptyObject(CONF)) {
              for (let k = 0; k < suporttedLangs.length; k++) {
                let language = suporttedLangs[k].language;
                $("select[name='language-selection']").append(new Option(language, language));
              }

              $("#table_language_list > tbody > tr").eq(0).clone(true).insertAfter($("#table_language_list > tbody > tr")).eq(0);
              $("#table_translate_field > tbody > tr").eq(0).clone(true).insertAfter($("#table_translate_field > tbody > tr")).eq(0);
              setActionBtnForLangList();
              setActionBtnForTranslateFields();

            } else {

              //todo setDefault from config function
              const languageList = JSON.parse(CONF.language_list);
              const translateEngine = JSON.parse(CONF.translate_engine);
              const translateFields = JSON.parse(CONF.translate_fields);
              $(translate_url).val(translateEngine.url);
              $(header_1).val(translateEngine.headers[0].header);
              $(header_2).val(translateEngine.headers[1].header);
              $(header_3).val(translateEngine.headers[2].header);
          
              currentEngine = translateEngine.type
              $(`input[name='tran_direction'][value='${CONF.translate_direction}']`).attr("checked", true);
              $(`input[name='tran_direction'][value='${CONF.translate_direction}']`).prop("checked", true);
              tran_direction = CONF.translate_direction;
              setPreviousEngine();
          
              //check current engine
              let getCurrentEngine = await checkEngine(currentEngine);
              createLanguageSelectionList(getCurrentEngine)
          
              for (let i = 1; i <= languageList.length; i++) {
                $("#table_language_list tbody > tr").eq(0).clone(true).insertAfter($("#table_language_list tbody > tr").eq(i - 1));
          
                //set value from config to setting
                $(`#table_language_list tbody tr:eq(${i})> td select[name='language-selection']`).val(languageList[i - 1].language);
                $(`#table_language_list tbody tr:eq(${i})> td input[name='button_label']`).val(languageList[i - 1].button_label);
                $(`#table_language_list tbody tr:eq(${i})> td input[name='lang_code']`).val(languageList[i - 1].lang_code);
                $(`#table_language_list tbody tr:eq(${i})> td input[name='code_iso']`).val(languageList[i - 1].iso);
              }
          
              //set value to default language and translate fields column
              await reflection();
              //set default language
              $(`select[name='default_lang']`).val(CONF.default_language);
          
              //set value to translate fields
              for (let i = 1; i <= translateFields.length; i++) {$("#table_translate_field > tbody > tr").eq(0).clone(true).insertAfter($("#table_translate_field > tbody > tr").eq(i - 1));
          
                $(`#table_translate_field tbody tr:eq(${i})> td input[name='item_code']`).val(translateFields[i - 1].item_code);
                $(`#table_translate_field tbody tr:eq(${i})> td select[name='select_field_space']`).val(translateFields[i - 1].space_element);
          
                //set value to translate fields table
                $(`#table_translate_field tbody tr:eq(${i})> td select[name='select_field_translate']`).each(function (index, field) {
                  let optionVar = translateFields[i - 1].target_fields[index].field;
                  $(field).val(optionVar).change();
                });
              }
            }
        } catch (error) {
            alert(error);
        }
    }

    // set dropdown to select SINGLE_LINE_TEXT, RICH_TEXT, SUBTABLE, MULTI_LINE_TEXT field
    async function setFieldList() {
      let fieldName = [];
      let concatenateName = "";
      FIELDS.properties.forEach((field) => {
        if (
          field.type === "SINGLE_LINE_TEXT" ||
          field.type === "RICH_TEXT" ||
          field.type === "MULTI_LINE_TEXT"
        ) {
          concatenateName = {
            key: field.code,
            value: field.label + " (" + field.code + ")",
          };
          fieldName.push(concatenateName);
        } else if (field.type === "SUBTABLE") {
          field.fields.forEach((column) => {
            concatenateName = {
              key: column.code,
              value: field.label + " (" + field.code + "." + column.code + ")",
            };
            fieldName.push(concatenateName);
          });
        }
      });

      //after get fieldName and then sort fields
      let fieldSort = fieldName.sort((a, b) =>
        a.value.localeCompare(b.value)
      );

      //addpend options for translate fields
      for (let k = 0; k < $("#table_translate_field tbody tr").length; k++) {
        $.each(fieldSort, function (index, value) {
          let fieldCode = value.key;
          let displayTitle = value.value;
          $(`#table_translate_field tbody tr:eq(${k}) select[name='select_field_translate']`).append(new Option(displayTitle, fieldCode));
        });
      }
    }

    // Create config to save in plugin config setting
    const setConfig = () => {
      let tranDirectionSet = {
        type: currentEngine,
        url: $(translate_url).val(),
        headers: [
          {
            header: $(header_1).val() || '',
          },
          {
            header: $(header_2).val() || '',
          },
          {
            header: $(header_3).val() || '',
          },
        ],
      };

      let languageListSet = [];
      $("#table_language_list > tbody tr").each(function (index) {
        if (index !== 0) {
          languageListSet.push({
            language: $(`#table_language_list tbody tr:eq(${index})> td select[name='language-selection'] option:selected`).val(),
            button_label: $(`#table_language_list tbody tr:eq(${index})> td input[name='button_label']`).val(),
            lang_code: $(`#table_language_list tbody tr:eq(${index})> td input[name='lang_code']`).val(),
            iso: $(`#table_language_list tbody tr:eq(${index})> td input[name='code_iso']`).val(),
          });
        }
      });

      let translateFields = [];
      $("#table_translate_field tbody tr").each(function (index) {
        if (index !== 0) {
          let selectedTranField = [];
          $(`#table_translate_field tbody tr:eq(${index})> td select[name='select_field_translate']`).each(function (i) {
            let selectTranColumn = {
              iso: $(`#table_language_list tbody tr:eq(${i + 1})> td input[name='code_iso']`).val(),
              field: $(this).val(),
            };
            selectedTranField.push(selectTranColumn);
          });

          translateFields.push({
            item_code: $(`#table_translate_field tbody tr:eq(${index})> td input[name='item_code']`).val(),
            space_element: $(`#table_translate_field tbody tr:eq(${index})> td select[name='select_field_space'] option:selected`).val(),
            target_fields: selectedTranField,
          });
        }
      });

      let configuration = {
        translate_direction: tran_direction,
        translate_engine: JSON.stringify(tranDirectionSet),
        language_list: JSON.stringify(languageListSet),
        default_language: $(`select[name='default_lang'] option:selected`).val(),
        translate_fields: JSON.stringify(translateFields),
      };
      return configuration;
    };

    // add new row in table setting
    $(document).on("click", ".addRowLanguageList", function () {// comment change addList ==> tabel
      // clone the row without its data
      let $newRow = $("#table_language_list tbody > tr").eq(0).clone(true);
      $(this).parent().parent().after($newRow);
      setActionBtnForLangList();
    });

    $(document).on("click", ".addRowTranslateField", function () {// comment change addList_1 ==> tabel
      let $newRowSpace = $("#table_translate_field > tbody > tr").eq(0).clone(true);
      $(this).parent().parent().after($newRowSpace);
      setActionBtnForTranslateFields();
    });

    // remove selected row in table setting
    $(document).on("click", ".removeRowLanguageList", function () {// comment change removeList ==> tabel
      $(this).parent("td").parent("tr").remove();
      setActionBtnForLangList();
    });

    // remove selected row in table setting
    $(document).on("click", ".removeRowTranslateField", function () {// comment change removeRowTranslateField ==> tabel
      $(this).parent("td").parent("tr").remove();
      setActionBtnForTranslateFields();
    });

    //when change language list
    $(document).on("change","#table_language_list tbody > tr > td select[name='language-selection']", function () {
        let selectedLanguage = $(this).val();
        let rowIndex;
        if (selectedLanguage == "-----") {
           rowIndex = $(this).parents("tr").index() + 1;
          $(`#table_language_list tbody > tr:nth-child(${rowIndex}) > td:nth-child(3) input[name='code_iso']`).val("");
        } else {
          let languageList = suporttedLangs.filter(function (index) {
            return index.language === selectedLanguage;
          });
          let setLanguageIso = languageList[0].code3;
          let setLanguageCode = languageList[0].code;

          rowIndex = $(this).parents("tr").index() + 1;
          $(`#table_language_list tbody > tr:nth-child(${rowIndex}) > td input[name='code_iso']`).val(setLanguageIso.toUpperCase());
          $(`#table_language_list tbody > tr:nth-child(${rowIndex}) > td input[name='lang_code']`).val(setLanguageCode);
        }
      }
    );

    
    // Drag and Drop language list
    $("#table_language_list tbody > tr").on("dragstart", function (event) {
      $(this).addClass("dragging");
      event.originalEvent.dataTransfer.setData("text/plain", "");
    });

    $("#table_language_list tbody > tr").on("dragend", function () {
      $(this).removeClass("dragging");
    });

    $("#table_language_list tbody").on("dragover", function (event) {
      event.preventDefault();
      $(this).addClass("dragover");
    });

    $("#table_language_list tbody > tr").on("dragleave", function () {
      $(this).removeClass("dragover");
    });

    $("#table_language_list tbody > tr").on("drop", function (event) {
      event.preventDefault();
      $(this).removeClass("dragover");
      const draggedRow = $(".dragging");
      const targetRow = $(this);

      if (draggedRow.index() < targetRow.index()) {
        draggedRow.insertAfter(targetRow);
      } else {
        draggedRow.insertBefore(targetRow);
      }
      setActionBtnForLangList();
    });

    $("#table_language_list tbody > tr").on("dragend", function () {
      $(this).removeClass("dragging");
    });


    //to do reflection function
    async function reflection() {
      let foundDuplicate = false;

      //comment check language duplicated  the process is too complicated 
      let targetValueCheck = [];
      let lang_list_count = $("#table_language_list tbody > tr").length;
      for (let j = 2; j <= lang_list_count; j++) {
        if ($("#table_language_list tbody > tr:nth-child("+ j +") input[name='button_label']").val() == "") {
          Swal10.fire({
            icon: "error",
            title: "Oops...",
            text: "Please enter the Button label!!",
          });
          foundDuplicate = true; // change to use return
        }
      }

      $("#table_language_list tbody > tr > td select[name='language-selection'] option:selected").each(function () {
        // Target value to check
        let targetValue = $(this).val();
        if(targetValueCheck.includes(targetValue)){
          Swal10.fire({
            icon: "error",
            title: "Oops...",
            text: "Your language list choices have the same language.!!",
          });
          foundDuplicate = true; // change to use return
        }
        else{
          targetValueCheck.push(targetValue);
        }
      });

      if (!foundDuplicate) { // change to use return
        // clone the row without its data
        $("select[name='default_lang'] > option").remove();
        $("#table_translate_field > thead > tr > th:nth-child(n+3)").remove();
        $("#table_translate_field > tbody > tr:nth-child(n+1) > td:nth-child(n+3)").remove();
        $("select[name='default_lang']").append(new Option("-----", "-----"));

        for (let i = 2; i <= lang_list_count; i++) {
          let trValCode = $("#table_language_list tbody > tr:nth-child("+ i +") input[name='code_iso']").val();
          let trValLang = $("#table_language_list tbody > tr:nth-child("+ i +") select[name='language-selection']").val();
          let btnLabel = $("#table_language_list tbody > tr:nth-child("+ i +") input[name='button_label']").val();
          let concatenatedOption = trValLang + "(" + trValCode.toUpperCase() + ")";

          if (trValLang !== "-----") {
            $("select[name='default_lang']").append("<option value="+ trValCode + " value-for-check=" + trValLang + ">" + concatenatedOption + "</option>");
            $("#table_translate_field > thead > tr").append(`<th class="kintoneplugin-table-th"><span class="title">${btnLabel}</span></th>`);
            $("#table_translate_field > tbody > tr").append(`<td>
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
        await setFieldList();
        $("#table_translate_field tbody>tr").append(`<td style="display: flex;" class="kintoneplugin-table-td-operation">
              <button type="button" class="kintoneplugin-button-add-row-image addRowTranslateField" title="Add row"></button>
              <button type="button" class="kintoneplugin-button-remove-row-image removeRowTranslateField" title="Delete this row"></button>
          </td>`);
        setActionBtnForTranslateFields();
      }
    }

    // reflection btn.
    $(document).on("click", ".reset-btn", reflection);

    //when save button click
    confirmButton.on("click", async function () {
      let invalidFieldExisted = false;
      if ($(translate_url).val() == "") {
        Swal10.fire({
          icon: "error",
          title: "Oops...",
          html: `Please enter URL engine!!!`,
        });
        return false;
      } 

        //validation the default language and language list
        let languageListRow = $("#table_language_list tbody tr");
        if (languageListRow.length <= 2 && $(`#table_language_list tbody tr:eq(${1})> td select[name='language-selection'] option:selected`).val() === "-----") {
          Swal10.fire({
            icon: "error",
            title: "Oops...",
            html: `Please select language list!`,
          });
          return false;
        } else if ($(`#table_language_list tbody tr:eq(${1})> td select[name='language-selection'] option:selected`).val() !== "-----" && 
                    $("select[name='default_lang'] option").length == 1) 
        {
          Swal10.fire({
            icon: "error",
            title: "Oops...",
            html: `Language list and Lnaguage default not match!<br>Plase click Reflection button!`,
          });
          return false;
        } else if ( $("select[name='default_lang'] option").length == languageListRow.length) {
          $("select[name='default_lang'] option").slice(1).each(function (index) {
              let optionValue = $(this).val();
              let operationIndex = index;

              //check Option match with code iso
              if ($(`#table_language_list tbody tr:eq(${ operationIndex + 1 })> td input[name='code_iso']`).val() !== optionValue) {
                invalidFieldExisted = true;
                Swal10.fire({
                  icon: "error",
                  title: "Oops...",
                  html: `Language list and Lnaguage default not match!<br>Plase click Reflection button!`,
                });
                return false;
              }
            });
        } else if (
          $("select[name='default_lang'] option").length != languageListRow.length
        ) {
          invalidFieldExisted = true;
          Swal10.fire({
            icon: "error",
            title: "Oops...",
            html: `Language list and Lnaguage default not match!<br>Plase click Reflection button!`,
          });
          return false;
        }
  
          //validate when have the same Item
          let space_length = $(`#table_translate_field tbody tr`).length;
  
          let conditionForCheck = false;
          let ItemValueCheck = [];
          for (let k = 1; k < space_length; k++) {
            // const space_index = k;
            const rowItemValue = $(`#table_translate_field tbody tr:eq(${k})> td input[type="text"]`).val();
  
              // Do check for null values or have the same value
              if (rowItemValue === "") {
                conditionForCheck = true;
                invalidFieldExisted = true;
                Swal10.fire({
                  icon: "error",
                  title: "Oops...",
                  html: `Please Input all of Item!!`,
                });
                return false;
              } else if (ItemValueCheck.includes(rowItemValue)){
                invalidFieldExisted = true;
                conditionForCheck = true;
                Swal10.fire({
                  icon: "error",
                  title: "Oops...",
                  html: `Have the same Item "${rowItemValue}"!!`,
                });
                return false;
              }
              else{
                ItemValueCheck.push(rowItemValue);
              }
        }

          if (!conditionForCheck) {
            for (let k = 1; k < space_length; k++) {
              const space_fields = k;
              let emptyValCheck = 2;
              let subTableCheck = false;
              let notSubTableCheck = false;
              for await (const option of $(`#table_translate_field > tbody > tr:eq(${space_fields}) > td select[name='select_field_translate'] option:selected`)) {
                let selectedFieldVal = $(option).val();

                // if have selected field
                if (selectedFieldVal) {
                  emptyValCheck-- 
                }

                for await (let item of FIELDS.properties) {
                  const checkValname = item;
                  if (checkValname.type === "SUBTABLE") {
                    checkValname.fields.forEach(function (fieldsIntable) {
                      let fieldsIntableVal = fieldsIntable.code;
                      if (selectedFieldVal == fieldsIntableVal) {
                        subTableCheck = true;
                      }
                    });
                  } else if (selectedFieldVal == checkValname.code) {
                    notSubTableCheck = true;
                  }
                }
  
                if (subTableCheck && notSubTableCheck) {
                  Swal10.fire({
                    icon: "error",
                    title: "Oops...",
                    html: `If a subtable is selected in any of the other options, it must be a subtable.!!`,
                  });
                  return;
                }
              }

              // Check if the selected less than 2
              if (emptyValCheck > 0) {
                Swal10.fire({
                  icon: "error",
                  title: "Oops...",
                  html: `Each row of translate field must be selected more than 1 field `,
                });
                return;
              }
            }
          }

      //Confirmed through every check. 
      if (!invalidFieldExisted) {
        let config = setConfig();
      await kintone.plugin.app.setConfig(config, function () {
        Swal10.fire("Complete", "successfully", "success").then(
          function () {
            return window.location.href = '../../flow?app=' + kintone.app.getId() + '#section=settings';
          }
        );
      });
      }
      
    });

    setInitiative();
  });
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);
