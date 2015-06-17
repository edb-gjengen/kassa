
$(function(){
    var urls =  {
        save_document: '/api/document/',
        update_document: '/api/document/{pk}/'
    };
    var _dom = {
        document_table: $('.document-table'),
        progress_bar: $("#progress .bar"),
    };
    var csrf_token = $.cookie('csrftoken');

    /* inplace edit */
    _dom.document_table.on('click', "[data-model-field]", function() {
        var input_field = $(this).siblings("input");
        if($(this).siblings("input").length) {
            input_field.val($(this).text()).css('display', 'inline-block');
        } else {
            $(this).after('<input type="text" data-editable-field class="in-place" value="'+ $(this).text() +'" />');
            input_field = $(this).siblings("input");
        }
        input_field.css('width', $(this).width() + 30);
        $(this).hide();
        $("[data-editable-field]").focus();
    });

    /* save on blur and <enter> */
    _dom.document_table.on('blur keyup', 'input[type=text]', function(e) {
        if(e.type == 'keyup' && e.keyCode != 13) {
            return;
        }
        /* anything changed ? */
        if( $(this).siblings("[data-model-field]").text() !== $(this).val() ) {
            /* update text */
            $(this).siblings("[data-model-field]").text($(this).val());

            var document_pk = $(this).siblings("[data-model-field]").attr('data-pk');
            var model_field = $(this).siblings("[data-model-field]").attr('data-model-field');
            var field_value = $(this).val();

            var data = {};
            data[model_field] = field_value;

            $.ajax({
                url: urls.update_document.replace('{pk}', document_pk),
                method: 'PATCH',
                dataType: 'json',
                data: data,
                headers: {
                    'X-CSRFToken': csrf_token
                },
                success: function(response, newValue) {
                    console.log('Field '+model_field+' updated with value "'+field_value+'".');
                }
            });
        }
        /* Back to original view */
        $("[data-model-field]").show();
        $(this).hide();
    });

    /* Document file upload */
    $('.upload-document').fileupload({
        dataType: 'json', // TODO: why no JSON?
        url: urls.save_document,
        done: function(e, data) {
            _dom.progress_bar.fadeOut('slow');
            var result = data.result;
            /* insert document row */

            var filename = result.filename.slice(0, 40);
            console.log(result);

            $('.document-table').prepend('<tr><td><span data-model-field="name" data-pk="'+ result.pk +'">'+ result.name +'</span></td><td><i class="icon-file"></i> '+ filename +'</td><td><span class="label secondary radius" data-type="text" data-model-field="category" data-pk="'+ result.pk +'"></span></td><td>'+ result.updated +'</td><td><a href="'+ result.file +'" class="btn packed"><i class="icon-download-alt"></i></a></td><td><a href="/document/'+ result.pk +'/remove/" class="btn packed"><i class="icon-remove"></i></a></td></tr>');
        },
        fail: function(e, data) {
            console.log("Failed uploading file: ",e, data);
        },
        headers: {
            'X-CSRFToken': csrf_token,
            'cache-control': 'no-cache'
        },
        send: function(e, data) {
            _dom.progress_bar.css('width', '0%');
            _dom.progress_bar.show();
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            _dom.progress_bar.css(
                'width',
                progress + '%'
            );
        }
    });
});
