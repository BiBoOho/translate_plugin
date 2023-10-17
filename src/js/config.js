jQuery.noConflict();

(function ($, Swal10, PLUGIN_ID) {
  "use strict";

  let langList = window.language_pack();
  let confirmButton = $("#save");
  let translate_url = $("#tran_url");
  let header_1 = $("#header_1");
  let header_2 = $("#header_2");
  let header_3 = $("#header_3");

  let CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
  console.log("🚀 ~ file: config.js:14 ~ CONF:", CONF)
  
  // check row to hide remove row button if its has one row
  const checkRowNumber = () => {
    if ($("#table_language_list tbody > tr").length === 2) {
      $("#table_language_list tbody > tr .removeList").eq(1).hide();
    } else {
      $(".removeList").show();
    }
  };

  // check row to hide remove row button if its has one row
  const checkRowSpace = () => {
    if ($("#table_translate_field tbody > tr").length === 2) {
      $("#table_translate_field tbody > tr .removeList_1").hide();
    } else {
      $(".removeList_1").show();
    }
  };

  // create config to set plugin config and export to json file
  checkRowNumber();
  checkRowSpace();

  $(document).ready(function () {
    //events user chabge angine
    let currentEngine = '';
    let languageListForUse = langList.google_tran_api;
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

    function checkEngine() {
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
    $(document).on("change", "input[name='engine']", checkEngine);

    //check engine are match or not match
    function createLanguageSelectionList(engine) {
      let dataLength = engine.length;
      let languageNotMatch = [];
      let tableLanguageLength = $("#table_language_list tbody tr");
      let previous_value;

      //loop value to have from the language list
      for (let i = 0; i < tableLanguageLength.length; i++) {
        let tr = $(`#table_language_list tbody tr:eq(${i})> td select[name='language-selection'] option:selected`).val();
        //condition when tr does not match with engine language
        let l;
        for (l = dataLength - 1; l >= 0 && engine[l].language !== tr; l--);
        // condition when value match
        if (l >= 0 || tr === "-----") {
          previous_value = $("#table_language_list tbody tr:eq("+ i +")> td select[name='language-selection'] option:selected").val();

          // condition when value dose not match
        } else if (l < 0 && tr !== "-----") {
          languageNotMatch.push(i);
          previous_value = "-----";
        }

        $("#table_language_list tbody tr:eq("+ i +")> td select[name='language-selection'] > option").remove();
        $("#table_language_list tbody tr:eq(" + i +")> td select[name='language-selection']").append(new Option("-----", "-----"));

        //append new engine langueges list
        for (let j = 0; j < engine.length; j++) {
          let language = engine[j].language;
          $("#table_language_list tbody tr:eq("+ i +")> td select[name='language-selection']").append(new Option(language, language));
        }
        //set default value
        $("#table_language_list tbody tr:eq("+ i +")> td select[name='language-selection']").val(previous_value).change();
      }

      //set border red for
      if (languageNotMatch.length > 0) {
        languageNotMatch.sort((a, b) => b - a); // sort data to be ASD
        for (let index = 0; index < languageNotMatch.length; index++) {
          const element = languageNotMatch[index];
          $("#table_language_list tbody tr select[name='language-selection']").eq(element).parent().addClass("set-border");
        }
      }

    }

    //when change language List
    $("#table_language_list tbody tr select[name='language-selection']").change(function () {
        $(this).parent().removeClass("set-border");
      }
    );

    //set default when not have config value
    function setInitiative() {
      if (jQuery.isEmptyObject(CONF)) {
        for (let k = 0; k < languageListForUse.length; k++) {
          let language = languageListForUse[k].language;
          $("select[name='language-selection']").append(
            new Option(language, language)
          );
        }

        $("#table_language_list > tbody > tr").eq(0).clone(true).insertAfter($("#table_language_list > tbody > tr")).eq(0);
        $("#table_translate_field > tbody > tr").eq(0).clone(true).insertAfter($("#table_translate_field > tbody > tr")).eq(0);
        checkRowNumber();
        checkRowSpace();
      }
    }

    // set dropdown to select SPACE field
    async function setFieldSpace() {
      const param = { app: kintone.app.getId() };
      const fields = await kintone.api("/k/v1/preview/app/form/layout","GET",param);
      fields.layout.forEach((getSpaceFields) => {
        getSpaceFields.fields.forEach((getSpaceFieldCode) => {
          if (getSpaceFieldCode.type === "SPACER") {
            $("#table_translate_field tbody tr:eq(0) > td select[name='select_field_space']").append(new Option(getSpaceFieldCode.elementId, getSpaceFieldCode.elementId));
          }
        });
      });
      setInitiative();
      return;
    }

    // set dropdown to select SINGLE_LINE_TEXT, RICH_TEXT, SUBTABLE, MULTI_LINE_TEXT field
    async function setFieldList() {
      const param = { app: kintone.app.getId() };
      const fields = await kintone.api("/k/v1/preview/form", "GET", param);
      let fieldName = [];
      let concatenateName = "";
      fields.properties.forEach((field) => {
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
              value: field.label + " (" + field.code + "," + column.code + ")",
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
    $(document).on("click", ".addList", function () {
      // clone the row without its data
      let $newRow = $("#table_language_list tbody > tr").eq(0).clone(true);
      $(this).parent().parent().after($newRow);
      checkRowNumber();
    });

    $(document).on("click", ".addList_1", function () {
      let $newRowSpace = $("#table_translate_field > tbody > tr").eq(0).clone(true);
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
      checkRowSpace();
    });

    //when change language
    $(document).on("change","#table_language_list tbody > tr > td select[name='language-selection']", function () {
        let selectedLanguage = $(this).val();
        let rowIndex;
        if (selectedLanguage == "-----") {
           rowIndex = $(this).parents("tr").index() + 1;
          $(`#table_language_list tbody > tr:nth-child(${rowIndex}) > td:nth-child(3) input[name='code_iso']`).val("");
        } else {
          let languageList = languageListForUse.filter(function (index) {
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
      checkRowNumber();
    });

    $("#table_language_list tbody > tr").on("dragend", function () {
      $(this).removeClass("dragging");
    });


    let foundDuplicate = false;
    //to do reflection function
    async function reflection() {
      //check when have the same language
      let lang_list_count = $("#table_language_list tbody > tr").length;
      $("#table_language_list tbody > tr > td select[name='language-selection'] option:selected").each(function (index) {
        // Target value to check
        let targetValue = $("#table_language_list tbody > tr:eq("+ index +") > td select[name='language-selection'] option:selected").val();
        let targetIndex = index;

        // Flag to indicate if the value is found
        for (let i = 2; i <= lang_list_count; i++) {
          let targetValueCheck = $("#table_language_list tbody > tr:eq("+ i +") > td select[name='language-selection'] option:selected").val();
          if (targetIndex === i) {
            continue;
          } else if (targetValue === targetValueCheck) {
            Swal10.fire({
              icon: "error",
              title: "Oops...",
              text: "Your language list choices have the same language.!!",
            });
            foundDuplicate = true;
            return false;
          } else {
            foundDuplicate = false;
          }
        }
      });

      if (!foundDuplicate) {
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

          if (trValLang == "-----") {
            continue;
          } else {
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
        $("#table_translate_field tbody>tr")
          .append(`<td style="display: flex;" class="kintoneplugin-table-td-operation">
              <button type="button" class="kintoneplugin-button-add-row-image addList_1" title="Add row"></button>
              <button type="button" class="kintoneplugin-button-remove-row-image removeList_1" title="Delete this row"></button>
          </td>`);
        checkRowSpace();
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

        let header = {
          app: kintone.app.getId(),
        };
        const getFields = await kintone.api('/k/v1/preview/form', 'GET', header);
        const data = getFields.properties;
  
          //validate when have the same Item
          let textInputs = $("#table_translate_field").find('input[type="text"]');
          let space_length = $(`#table_translate_field tbody tr`).length;
  
          let conditionForCheck = false;
          for (let k = 1; k < space_length; k++) {
            const space_index = k;
            textInputs.slice(1).each(function (index) {
              let index_check = k - 1;
              let inputValue = $(this).val();
  
              // Do something with the input value
              if ($(`#table_translate_field tbody tr:eq(${space_index})> td input[type="text"]`).val() === "") {
                conditionForCheck = true;
                invalidFieldExisted = true;
                Swal10.fire({
                  icon: "error",
                  title: "Oops...",
                  html: `Please Input all of Item!!`,
                });
                return false;
              } else if (
                index_check != index &&
                inputValue == $(`#table_translate_field tbody tr:eq(${space_index})> td input[type="text"]`).val()
              ) {
                invalidFieldExisted = true;
                conditionForCheck = true;
                Swal10.fire({
                  icon: "error",
                  title: "Oops...",
                  html: `Have the same Item "${$(`#table_translate_field tbody tr:eq(${space_index})> td input[type="text"]`).val()}"!!`,
                });
                return false;
              }
            });
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

                for await (let item of data) {
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

    //todo setDefault from config function
    async function setDefault() {
      const languageList = JSON.parse(CONF.language_list);
      const translateEngine = JSON.parse(CONF.translate_engine);
      const translateFields = JSON.parse(CONF.translate_fields);
      $(translate_url).val(translateEngine.url);
      $(header_1).val(translateEngine.headers[0].header);
      $(header_2).val(translateEngine.headers[1].header);
      $(header_3).val(translateEngine.headers[2].header);

      $(`input[name='engine'][value='${translateEngine.type}']`).prop("checked",true);
      $(`input[name='tran_direction'][value='${CONF.translate_direction}']`).attr("checked", true);
      $(`input[name='tran_direction'][value='${CONF.translate_direction}']`).prop("checked", true);
      tran_direction = CONF.translate_direction;

      //check current engine
      checkEngine();

      for (let i = 1; i <= languageList.length; i++) {
        $("#table_language_list tbody > tr").eq(0).clone(true).insertAfter($("#table_language_list tbody > tr").eq(i - 1));

        //set value from config to setting
        $(`#table_language_list tbody tr:eq(${i})> td select[name='language-selection']`).val(languageList[i - 1].language);
        $(`#table_language_list tbody tr:eq(${i})> td input[name='button_label']`).val(languageList[i - 1].button_label);
        $(`#table_language_list tbody tr:eq(${i})> td input[name='lang_code']`).val(languageList[i - 1].lang_code);
        $(`#table_language_list tbody tr:eq(${i})> td input[name='code_iso']`).val(languageList[i - 1].iso);
      }

      //set value to default language and translate fields column
      await setFieldSpace();
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

  if (!jQuery.isEmptyObject(CONF)) return setDefault();
    setFieldSpace();
  });
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);
