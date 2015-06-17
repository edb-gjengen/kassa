function get_offset(col, grid_height, min_widget_height) {
    var num_slides = $('.slide[data-col="'+ col +'"]').length;
    return (grid_height - (num_slides * min_widget_height)) * -1;
}

/* Push add buttons up x px, close to the lowest slide in its section */
function reposition_add_buttons(min_widget_height) {
    var max_rows = _.max($(".slide"), function(slide){ return parseInt($(slide).attr('data-row')); });
    var grid_height = $(max_rows).attr('data-row') * min_widget_height;

    $(".slide-add").each(function() {
        var offset = get_offset($(this).attr('data-col'), grid_height, min_widget_height);
        $(this).css({ top: offset });
    });
}
$(function(){
    // TODO: on document ready, to load: loading icon
    var margin_x = 8;
    var margin_y = 4;
    var csrf_token = $.cookie('csrftoken');
    var grid = $(".gridster ul").gridster({
        widget_selector: "li.slide",
        widget_margins: [margin_x, margin_y],
        widget_base_dimensions: [113, 80],
        min_cols: 6,
        serialize_params: function($w, wgd) {
            return {
                slide: $w.attr('data-slide'),
                section: $('.sections li[data-col="'+ wgd.col +'"]').attr('data-section'),
                order: wgd.row
            };
        },
        draggable: {
            // https://github.com/ducksboard/gridster.js/issues/161
            handle: 'img', // FIXME: Edit link is not working on touch
            stop: function() {
                /* reposition add buttons */
                reposition_add_buttons(this.min_widget_height);

                /* Save grid order */
                var grid = this.serialize_changed();

                var slides = [];
                for(var i in grid ) {
                    slides.push({ name: "slide-order-"+grid[i].slide, value: grid[i].order });
                    slides.push({ name: "slide-section-"+grid[i].slide, value: grid[i].section });
                }
                /* Prepare data */
                var data = $("#presentation-form").serializeArray();
                data = data.concat(slides);
                /* http post json */
                var url = $("#presentation").attr('data-save-url');
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    async: false,  // FIXME: Make async
                    headers: {
                        'X-CSRFToken': csrf_token
                    },
                    success: function (result,l,o) {
                        if(result !== undefined && result.success) {
                            /* redirect to edit url */
                            window.location = "/slideshow/" + result.presentation_id + "/edit/";
                        } else {
                            //console.log("Saved"); //FIXME notify
                        }
                    },
                    error: function (request, text_status, error_thrown) {
                        console.log("uffda..."); //FIXME notify
                    }
                });
            }
        }
    });
    /* Note: gridster api add, remove, serialize */
    var gridster = grid.data('gridster');

    /* reposition add buttons */
    reposition_add_buttons(gridster.min_widget_height);

    /* Datepicker */
    $("#id_datetime").datepicker({
        dateFormat: "yy-mm-dd"
    });
    /* Disable slide controls */
    $(".slide-toggle").on('click', function(e) {
        /* Set slide.active=false */
        var that = $(this);
        var current_slide = $(this).parent().parent(); 
        var new_state = current_slide.hasClass("disabled");
        var url = $(this).attr('data-save-url');
        $.ajax({
            type: "PATCH",
            url: url,
            data: {
                active: new_state
            },
            headers: {
                'X-CSRFToken': csrf_token
            },
            success: function (result,l,o) {

                /* toggle 'disabled' class */
                current_slide.toggleClass("disabled");
                /* switch icons class */
                var icon = that.find("i");
                if(icon.hasClass("fa-square-o")) {
                    icon.removeClass("fa-square-o").addClass("fa-check-square-o");
                } else {
                    icon.removeClass("fa-check-square-o").addClass("fa-square-o");
                }
            },
            error: function (request, text_status, error_thrown) {
                console.log("uffda..."); //FIXME notify
            }
        });

    });

});