$(document).ready( function() {
    var all_icons = $("[data-section-icon]").map(function() {
        return $(this).attr('data-section-icon');
    }).get();
    all_icons = _.uniq(all_icons).join(" ");

    function update_title_bar( event ) {
        if($(event.currentSlide).is('[data-section-title-hidden]') ) {
            $(".title-bar").css('opacity', '0');
        } else {
            $(".title-bar").css('opacity', '1');
        }
        // event.previousSlide, event.currentSlide, event.indexh, event.indexv
        var title = $(event.currentSlide).attr('data-section-title') || "";
        /* Only update when title has changed */
        if($(".title-bar .title span:first").text() !== title) {
            $("<span>"+title+"</span>").hide().appendTo(".title-bar .title").fadeIn("normal"); 
            $(".title-bar .title span:not(:last)").fadeOut("normal", function() {
                $(this).remove();
            });
        }

        var edit_url = $(event.currentSlide).attr('data-edit-url');
        $(".title-bar a.title").attr('href', edit_url);  // Only update if a is found

        var icon = $(event.currentSlide).attr('data-section-icon') || "";
        if( !$(".title-bar .title i").hasClass(icon) ) {
            $(".title-bar .title i")
                .removeClass(all_icons)
                .addClass(icon);
         }
    }
    /* Slides: with "wheel" */
    function wheel_toggle_slides(el) {
        $("[data-wheel-order]").removeClass('active');
        $(el).addClass('active');
        var order = $(el).attr('data-wheel-order');
        var related = $('[data-wheel-order="' + order +'"]').not('.wheel-image');
        related.addClass('active');
        $('.wheel-text [data-type="wysihtml5"]').hide();
        related.show();
    }
    $(".top-bar .links a").click(function() {
        $(".top-bar.expanded .toggle-topbar").trigger("click.fndtn.topbar");
    });

    /* Presentation? */
    if( $('.page-presentation-play').length) {
        /* Initialize reveal.js */
        Reveal.initialize({
            // Display controls in the bottom right corner
            controls: true,
            // Display a presentation progress bar
            progress: true,
            // Push each slide change to the browser history
            history: true,
            // Enable keyboard shortcuts for navigation
            keyboard: true,
            // Enable the slide overview mode
            overview: false,
            // Vertical centering of slides
            center: false,
            // Enables touch navigation on devices with touch input
            touch: true,
            // Loop the presentation
            loop: false,
            // Change the presentation direction to be RTL
            rtl: false,
            // Number of milliseconds between automatically proceeding to the
            // next slide, disabled when set to 0, this value can be overwritten
            // by using a data-autoslide attribute on your slides
            autoSlide: 0,
            // Enable slide navigation via mouse wheel
            mouseWheel: false,
            // Apply a 3D roll to links on hover
            rollingLinks: false,
            // Transition style
            transition: 'linear', // default/cube/page/concave/zoom/linear/fade/none
            // Factor of the display size that should remain empty around the content
            margin: 0.15,
            // The "normal" size of the presentation, aspect ratio will be preserved
            // when the presentation is scaled to fit different resolutions. Can be
            // specified using percentage units.
            //width: 960,
            //height: 700,
            width: 768, // Note: Could set this to 100% and make presentation content responsive instead of using zoom;
            height: 576,
            minScale: 0.2,
            maxScale: 1
            // FIXME: use user agent / device width ?
        });


        Reveal.addEventListener( 'ready', function(event) {
            /* On small screen? disable transitions */
            var small_screen = $(window).width() < 480;
            if( small_screen ) {
                Reveal.configure({ transition: 'none' });
            }

            update_title_bar(event);

            /* Load chart if one exists on current slide (animate) */
            if( $(event.currentSlide).find('[class^="graph-"]').length) {
                $(event.currentSlide).find('[class^="graph-"]').graph('load');
            }

        });

        Reveal.addEventListener( 'slidechanged', function( event ) {

            /* Update title bar */
            update_title_bar(event);

            /* Chart slide - Wait until it is current to load (animate) */
            if( $(event.currentSlide).find('[class^="graph-"]').length) {
                $(event.currentSlide).find('[class^="graph-"]').graph('load');
            }

            /* Disable touch on specific slides*/
            if( $(event.currentSlide).find("[data-swipe-disable]").length ) {
                Reveal.configure({ touch: false });
            } else {
                Reveal.configure({ touch: true });
            }

            /* Search previous slide for video elements and pause them */
            $(event.previousSlide).find("video").each(function(i, el) {
                el.pause();
            });

            /* Setup/Reset wheel state on wheel-slide enter */
            if( $(event.currentSlide).find('.wheel').length) {
                $('.wheel-text [data-wheel-order]').hide();
                $('[data-wheel-order]').removeClass('active');
                $('[data-wheel-order="1"]').addClass('active').show();
            }
        } );


        $(".wheel-images .wheel-image .trigger, .wheel-head .trigger").on('mousedown', function(e) {
            wheel_toggle_slides(this);
        });
        /* Hover fix for touch: Only bind on hover for non-touch devices */
        $(".no-touch .wheel-images .wheel-image .trigger, .no-touch .wheel-head .trigger").on('mouseenter', function(e) {
            wheel_toggle_slides(this);
        });
    }

    /* Swipebox */
    $('a.fancybox').swipebox();

    /* Video */
    $('video').mediaelementplayer({
        success: function (mediaElement, domObject) {
            /* Track video plays */
            mediaElement.addEventListener(
                'play',
                function(e) {
                    mixpanel.track("Played video.");
                },
                false);
        }
    });

    /* Skip home if you are on the play-slide */
    $("[data-goto-first-slide]").on('click', function(e) {
        e.preventDefault();
        $(".top-bar.expanded .toggle-topbar").trigger("click.fndtn.topbar");
        Reveal.slide(0, 0);
    });


    /* Slide: Sick cost calculator */
    function get_salary() {
        var industry_pk = parseInt($("#id_calc_industry").val(), 10);
        /* Note: stb_industries is defined in the calculator.html-template */
        var industry = _.findWhere(stb_industries, {pk: industry_pk});

        if(industry === undefined) {
            return 0;
        }
        return industry.fields.yearly_salary;
    }
    function calc_cost(sick_rate, num_staff) {
        var salary = get_salary();
        sick_rate = sick_rate / 100.0; // percent
        return sick_rate * num_staff * salary;
    }
    /* Format norwegian */
    function format_number_norwegian(num) {
        num = num.toString();
        var formatted_str = "";
        /* Add spaces backwards every third char */
        for(var i=0; i< num.length; i++){
            if(i % 3 === 0) {
                formatted_str += " ";
            }
            formatted_str += num.charAt(num.length-i-1);
        }
        /* reverse the string */
        return formatted_str.split("").reverse().join("");
    }
    function calc_savings(sick_rate, goal_sick_rate, num_staff) {
        var current = calc_cost(sick_rate, num_staff);
        var goal = calc_cost(goal_sick_rate, num_staff);
        return current - goal; //total savings per year
    }
    function recalc() {
        /* Get data */
        var num_staff = parseInt($(".num-staff").slider('value'), 10);
        var sick_rate = $(".sick-rate").slider('value');
        var sick_rate_float = parseFloat(sick_rate);
        var goal_sick_rate = $(".goal-sick-rate").slider('value');
        var goal_sick_rate_float = parseFloat(goal_sick_rate);
        /* Calculate */
        var cost = calc_cost(sick_rate_float, num_staff);
        cost = parseInt(Math.round( cost / 100), 10) * 100;
        var savings = calc_savings(sick_rate_float, goal_sick_rate, num_staff);
        savings = parseInt(Math.round( savings / 1000), 10) * 1000;
        /* Output data */
        $("[data-calc-staff]").text(num_staff);
        $("[data-calc-rate]").text(Math.round(sick_rate_float * 10) / 10);
        $("[data-calc-goal-rate]").text(Math.round(goal_sick_rate_float * 10) / 10);
        $("[data-calc-savings]").text(format_number_norwegian(savings));
        $("[data-calc-savings-employee]").text(format_number_norwegian(Math.round(savings / num_staff)));
        /* cost */
        $("[data-calc-cost]").text(format_number_norwegian(cost));
        $("[data-calc-cost-employee]").text(format_number_norwegian(Math.round(cost / num_staff)));
        
    }
    if($(".sick-cost-calculator").length) {
        $( ".num-staff" ).slider({
            animate: "fast",
            value: 600,
            min: 1,
            max: 2000,
            step: 1,
            stop: recalc,
            slide: recalc
        });
        $( ".sick-rate" ).slider({
            animate: "fast",
            value: 10.2,
            min: 1,
            max: 15,
            step: 0.2,
            stop: recalc,
            slide: recalc
        });
        $( ".goal-sick-rate" ).slider({
            animate: "fast",
            value: 5,
            min: 1,
            max: 15,
            step: 0.2,
            stop: recalc,
            slide: recalc
        });
        $(".sick-cost-industry-form").on('change', function(e) {
            recalc();
        });

        recalc(); // Initial calc

        /* Workaround for slider not working on touch devices 
         * Click/touch and change */
        $("[data-calc-staff], [data-calc-rate], [data-calc-goal-rate]").on('click', function(e) {
            $(".set-value-modal").attr('data-updating', $(this).attr('data-updating'));
            var old_value = $(this).text();
            $("input[name=set-value]").val(old_value);
            $(".set-value-modal").foundation('reveal', 'open');
        });
        $(".set-value-button").on('click', function(e) {
            var new_value = $("input[name=set-value]").val();
            var key = "#" + $(".set-value-modal").attr('data-updating');
            $( key ).slider({ value: parseFloat(new_value)});
            $(".set-value-modal").foundation('reveal', 'close');
            recalc();
        });
    }

    /* Slide: Public treatment comparison */
    if($(".public-treatment-comparison").length) {
        var options = {
            valueNames: [ 'region', 'hospital', 'city', 'diagnose', 'waittime' ]
        };

        var featureList = new List('treatment-list', options);
        featureList.sort('waittime', { asc: false });

        $('.filter-region, .filter-diagnose').change(function() {
            featureList.filter(function(item) {
                var diagnose = $('.filter-diagnose').val();
                var region = $(".filter-region").val();
                return (item.values().region == region || region == "Alle") && item.values().diagnose == diagnose;
            });
            return false;
        });
        $('.filter-none').click(function() {
            featureList.filter();
            return false;
        });
        $(".filter-diagnose").trigger('change');
    }

    function init_treatment_map() {
        // mapbox.com: nikolaik.map-hyrf1sef
        var tile_url = 'http://{s}.tiles.mapbox.com/v3/nikolaik.map-hyrf1sef/{z}/{x}/{y}.png';
        var tiles = L.tileLayer(tile_url, {maxZoom: 17, minZoom: 4});
        var latlng = L.latLng(65.57, 12.56);

        var map = L.map('treament-network-map', {center: latlng, zoom: 4, layers: [tiles]});

        var markers = L.markerClusterGroup({ showCoverageOnHover: false});
        /* Marker icon style */
        var static_url = $('meta[name="x-django-static-url"]').attr('content');
        var icon = L.icon({
            iconUrl: static_url + 'dist/images/storebrand_map_marker.png',
            iconSize: new L.Point(35, 35),
            iconAnchor: new L.Point(35, 35),
            popupAnchor: new L.Point(-17.5, -35),
            shadowUrl: '',
            shadowSize: new L.Point(0, 0),
        });

        /* Add specialist markers */
        var _url = 'http://zeppelin.brill.no/blifrisk/data/no.json';
        $.getJSON(_url, function(data) {
            _.each(data.specialists, function(s, i) {
                if(s.position) {
                    var marker = L.marker(new L.LatLng(s.position.lat, s.position.lng), { title: s.name, icon: icon });
                    marker.bindPopup("<h3>"+ s.name +"</h3><p>"+ s.address +"<br /> "+ s.postalCode +" "+ s.city +"</p>");
                    markers.addLayer(marker);
                }
            });
            map.addLayer(markers);
        });
    }
    /* Slide: Treatment locations map */
    if($(".treament-network-map").length) {

        /* Load the treatment map when the slide comes in to view when in presentation mode */
        if (window.Reveal && !$(".page-slide-edit").length) {
            var handler = function(event) {
                if($(event.currentSlide).find(".treament-network-map").length) {
                    init_treatment_map();
                    Reveal.removeEventListener( 'slidechanged', handler, false); // run only once 
                }
            };
            Reveal.addEventListener( 'slidechanged', handler);
            Reveal.addEventListener( 'ready', function(event) {
                if($(event.currentSlide).find(".treament-network-map").length) {
                    /* Load map */
                    init_treatment_map();
                }
            });
        } else {
            init_treatment_map();
        }

    }
    /* Placeholder polyfill for IE9 */
    placeholderSupport = ("placeholder" in document.createElement("input"));
    if(!placeholderSupport){
        //This browser does not support the placeholder attribute
        //use javascript instead
        $('[placeholder]').focus(function() {
            var input = $(this);
            if (input.val() === input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function() {
            var input = $(this);
            if (input.val() === '' || input.val() === input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur().parents('form').submit(function() {
            $(this).find('[placeholder]').each(function() {
                var input = $(this);
                if (input.val() === input.attr('placeholder')) {
                    input.val('');
                }
            });
        });
    }
    /* Highcarts graph theme */
    Highcharts.theme = {
        colors: ['#da291c', '#425563', '#ed786f'],
        chart: {
            backgroundColor: null
        },
        credits: {
            enabled: false
        },
        title: {
            style: {
                color: '#1e394d',
                font: 'bold 16px "SignaColumn", Helvetica, Arial, sans-serif'
            }
        },
        subtitle: {
            style: {
                color: '#425563',
                font: 'bold 12px "SignaColumn", Helvetica, Arial, sans-serif'
            }
        },
        yAxis: {
            title: {
                style: {
                    color: 'gray'
                }
            }
        },
        xAxis: {
            title: {
                style: {
                    color: 'gray'
                }
            }
        },
        legend: {
            itemStyle: {
                font: '9pt "SignaColumn", Helvetica, Arial, sans-serif',
                color: 'black'
            },
            itemHoverStyle:{
                color: 'gray'
            }
        },
        exporting: {
            enabled: false
        }
    };

    // Apply the theme
    Highcharts.setOptions(Highcharts.theme);
});
