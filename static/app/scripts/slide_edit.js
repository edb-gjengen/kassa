$(function() {
    /* Save part urls
     * Ref: urls.py */
    var urls = {
        slide_part_save: '/api/slide/part/',
        slide_title_save: '/api/slide/{slide_id}/title/',
        slide_part_update: '/api/slide/part/{part_id}/',
        slide_part_remove: '/api/slide/part/{part_id}/',
        image_save: '/api/image/'
    };
    var slide_id = $("#slide").attr('data-slide-id');
    var csrf_token = $.cookie('csrftoken');

    /* Editor fields */
    var elements = document.querySelectorAll('[data-type="text"], [data-type="html"], [data-type="wysihtml5"]');
    var mediumOptions = {
        buttons: ['bold', 'italic', 'header1', 'header2', 'quote', 'anchor', 'unorderedlist', 'orderedlist', 'removeFormat']
    };
    var editor = new MediumEditor(elements, mediumOptions);
    editor.subscribe('blur', function(event, el) {
        var type = $(el).attr('data-type');
        var name = $(el).attr('data-name');
        var url = $(el).attr('data-url');
        var pk = $(el).attr('data-pk');
        var method = 'POST';

        if (pk.length > 0 && name != 'slide-title') {
            url = urls.slide_part_update.replace('{part_id}', pk);
            method = 'PUT';
        }

        var value = el.innerHTML;
        if(type == 'text') {
            value = el.textContent;
        }
        var data = {
            slide_id: slide_id,
            pk: pk,
            name: name,
            value: value
        };
        $.ajax({
            method: method,
            headers: {
                'X-CSRFToken': csrf_token
            },
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            contentType : 'application/json'
        }).done(function() {
           // TODO set pk on part
           // $('[data-name="part-' + response.part_created_name + '"]').attr('data-pk', response.part_created_pk);
        }).fail(function() {
            console.log("boo");
        });

    });
    $('[data-type="dynamic"]').on('changed', function(e) {
        /* Delete part */
        if($(this).attr('data-part-remove')) {
            var that = this;
            $.ajax({
                url: urls.slide_part_remove.replace('{part_id}', $(this).attr('data-pk')),
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrf_token
                },
                success: function(response, newValue) {
                    $(that).removeAttr('data-part-remove');
                    $(that).attr('data-pk', '');
                }
            });
            return;
        }
        /* Create or update part */
        var value = '';
        var type = '';
        
        if($(this).find('img').length) {
            value = $($(this).find('img')[0]).attr('data-pk');
            type = 'image';
        }
        else if($(this).find('[data-graph-pk]').length) {
            value = $($(this).find('[data-graph-pk]')[0]).attr('data-graph-pk');
            type = 'graph';
        }
        else {
            console.log("Could not determine Part-type.");
            return;
        }

        var slide_pk = $(this).attr('data-pk');
        var url = urls.slide_part_save;
        var method = 'POST';

        if (slide_pk.length > 0) {
            url = urls.slide_part_update.replace('{part_id}', slide_pk);
            method = 'PUT';
        }

        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            data: {
                name: $(this).attr('data-name'),
                value: value,
                type: type,
                slide_id: $("#slide").attr('data-slide-id'),
                href: $(this).find('a').attr('href')
            },
            headers: {
                'X-CSRFToken': csrf_token
            },
            success: function(response, newValue) {
                if(response !== undefined && response.part_name && response.part_pk) {
                    $('[data-name="part-' + response.part_name + '"]').attr('data-pk', response.part_pk);
                }
            }
        });
    });

    /* 
     * Gallery
     */
     // Ref: https://github.com/blueimp/jQuery-File-Upload
     // https://github.com/blueimp/jQuery-File-Upload/wiki/Options
    $('#id_file').fileupload({
        dataType: 'json',
        url: urls.image_save,
        done: function(e, data) {
            // add image in gallery
            $(".gallery ul").prepend('<li class="image-select"><img src="' + data.result.thumbnail_url + '" data-pk="' + data.result.pk + '" data-url="'+ data.result.url +'" /><span class="name">'+ data.result.name +'</span></li>');
            // click event
            $(".gallery ul li:first-child").click(function (e) {
                $(this).siblings().removeClass("selected");
                $(this).toggleClass("selected");
            });
            $("#progress .bar").fadeOut('slow');
        },
        fail: function(e, data) {
            console.log("Failed uploading file: ",e, data);
        },
        headers: {
            'X-CSRFToken': csrf_token,
            'cache-control': 'no-cache'
        },
        send: function(e, data) {
            $('#progress .bar').css('width', '0%');
            $("#progress .bar").show();
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .bar').css(
                'width',
                progress + '%'
            );
        }
    });
    /* Green select */
    $(".image-select").not(".placeholder").click(function (e) {
        $(this).siblings().removeClass("selected");
        $(this).toggleClass("selected");

    });
    /* Insert image */
   $('[data-type="dynamic"]').each(function(i, el) {
        /* Insert image-button */
        var button_area = '<div class="dynamic-buttons" data-buttons-for="'+ $(el).attr('data-name') +'"></div>';
        var image_button = '<a class="btn packed" data-reveal-id="gallery-modal" data-replace="'+ $(el).attr('data-name') +'"><i class="fa fa-picture-o"></i></a>';
        $(el).wrap('<div class="dynamic-wrapper" />');
        $(el).after(button_area);
        $('[data-buttons-for="'+ $(el).attr('data-name') +'"]').append(image_button);
    }); 

    $('[data-reveal-id="gallery-modal"]').click( function(e) {
        /* Store where to but the image from the modal in the modal */
        var replacing = $(this).attr('data-replace');
        $(".image-insert-btn").attr('data-replacing', replacing);
    });
    $(".image-insert-btn").click(function(e) {
        var img = $(".gallery .selected img");
        if(!img.length) {
            // nothing selected
            return;
        }
        var replacing = $(this).attr('data-replacing');
        var part = $('[data-name="'+ replacing +'"]');
        part.html('<img src="'+ img.attr('data-url') + '" />');
        part.find('img').attr('data-pk', img.attr('data-pk'));
        part.trigger('changed');
        $("#gallery-modal").foundation('reveal', 'close');
        $('.image-select').removeClass("selected");
    });
    /* DELETE image part */
    $("[data-remove-image]").click(function(e) {
        var replacing = $('.image-insert-btn').attr('data-replacing');
        var part = $('[data-name="'+ replacing +'"]');
        part.attr('data-part-remove','1');
        part.html('');
        part.trigger('changed');
        $('.image-select').removeClass("selected");
        $("#gallery-modal").foundation('reveal', 'close');
    });

    /* Link between slides */
    /* ...for "dynamic" areas */
    $('[data-type="dynamic"]').each(function(i, el) {
        /* Insert link-button on images */
        var last_button = $(el).siblings().find("a:last-child");
        last_button.after('<a class="btn packed" data-url-target="'+ $(el).attr('data-name') +'" data-reveal-id="link-modal"><i class="fa fa-link"></i></a>');
    });

    /* Set element target on modal */
    $('[data-url-target]').click( function(e) {
        var target = $(this).attr('data-url-target');
        if(!$('[data-name="' + target + '"]').find('img').length) {
            /* if there is no image, dont link to nothing */
            e.stopPropagation();
            return;
        }
        $(".modal-links").attr('data-wrapping', target);
    });

    $("[data-is-slide-link]").click(function(e) {
        e.preventDefault();
        if($(this).attr('data-get-value-from-id')) {
            /* Insert own link via input-field */
            var input_id = $(this).attr('data-get-value-from-id');
            $(this).attr('href', $("#"+input_id).val());
        }
        var link = $(this).attr('href');
        var wrapping = $(".modal-links").attr('data-wrapping');
        var el_target = $('[data-name="'+ wrapping +'"]');
        // replace href in targets children if it exists
        var potential_link = el_target.children();
        if(potential_link.is('a')) {
            potential_link.attr('href',link);
        } else {
            el_target.find('img').wrap('<a href="'+ link +'" />');
        }
        el_target.trigger('changed');
        $(".modal-links").foundation('reveal', 'close');
    });

    /* Graphs - sticks in divs with data-type=dynamic */
    $('[data-type="dynamic"]').each(function(i, el) {
        /* Insert link-button on images */
        var last_button = $(el).siblings().find("a:last-child");
        last_button.after('<a class="btn packed" data-target="'+ $(el).attr('data-name') +'" data-reveal-id="graph-modal"><i class="fa fa-bar-chart"></i></a>');

        /* Set element target on modal */
        $('[data-target="'+ $(el).attr('data-name') +'"]').click( function(e) {
            var target = $(this).attr('data-target');
            $(".modal-graph").attr('data-graph-target', target);
        });
    });

    $("[data-is-graph] a").click(function(e) {
        e.preventDefault();
        var part_name = $('[data-graph-target]').attr('data-graph-target');
        var graph = $(this).parent();
        var part = $('[data-name="'+ part_name +'"]');
        var html = graph.find('[data-graph-html-copy]')[0].outerHTML;
        part.html(html);
        part.find('[data-graph-slug]').graph('load');
        part.trigger('changed');
        $(".modal-graph").foundation('reveal', 'close');
    }); 

    /* Load graphs initially */
    $('.template [data-graph-slug]').graph('load');
    $('.modal-graph [data-graph-slug]').graph('load', {width: 300, height: 200});

});
