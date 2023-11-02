jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';
  
  kintone.events.on('app.record.index.show', function() {
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);

    var spaceElement = kintone.app.getHeaderSpaceElement();
    if (spaceElement === null) {
      throw new Error('The header element is unavailable on this page');
    }
    var fragment = document.createDocumentFragment();
    var headingEl = document.createElement('h3');
    var messageEl = document.createElement('p');

    messageEl.classList.add('plugin-space-message');
    messageEl.textContent = config.message;
    headingEl.classList.add('plugin-space-heading');
    headingEl.textContent = 'Hello kintone plugin!!!!!!!';

    fragment.appendChild(headingEl);
    fragment.appendChild(messageEl);
    spaceElement.appendChild(fragment);
  });

  kintone.events.on(['app.record.detail.show'], function(event) {
    var record = event.record;
  
      let language = 'lo';
    console.log('successfully');

      var body = {
        app: kintone.app.getId(),
        record: kintone.app.record.getId()
      };


      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, function(resp) {
        // success
        console.log(resp.records);
        let records = resp.records;
        let resLength = records.length

        console.log(resLength);

        for (let  i = 0;  i < resLength;  i++) {
          const element = records[i];
          console.log(element);
        }

        let array = $.map(records[0], function(value, index) {
          return [index];
        });

        console.log('array:::::::', array.length);

        let getType;
        for(let k = 0; k <  array.length; k++) {
          //  console.log(array[k]);
           kintone.app.record.setFieldShown(array[k], false);

           if (array[k].split("_")[array[k].split("_").length - 1] == language) {
            kintone.app.record.setFieldShown(array[k], true);
           }
        }

      }, function(error) {
        // error
        console.log(error);
      });


      // kintone.app.record.setFieldShown(invoice_id, false);
      
  
  });

  kintone.events.on(['app.record.edit.show'], async function(event) {
    // Get data the data from Read DB App by using RsComAPI function
    console.log(event);
    // let dataLength = getData.length;

    // Get the field on the records
    // let array = $.map(records[0], function(value, index) {
    //   return [index];
    // });

    // Get the field on the records index 0
    // let getType = array[0];
    // let fields = kintone.app.getFieldElements(getType);
  });

        
})(jQuery, kintone.$PLUGIN_ID);
