/* Extend jquery */
(function ( $ ) {
    $.fn.graph = function(action, options) {
        // These are the defaults
        var settings = $.extend({
            width: undefined,  
            height: undefined,
            animation_duration: 1000  // ms
        }, options );
        /* The slug of each Graph object map to a function in the graphs object */
        var graphs = {
            treatment: function(element) {
                $(element).highcharts({
                    chart: {
                        type: 'column',
                        width: settings.width,
                        height: settings.height,
                        animation: {
                            duration: settings.animation_duration
                        }
                    },
                    title: {
                        text: 'Antall behandlinger'
                    },
                    xAxis: {
                        title: {
                            text: 'År'
                        },
                        minRange : 30 * 24 * 3600 * 1000, //
                        minTickInterval: 12 * 30 * 24 * 3600 * 1000, // A year
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {
                            text: 'Antall behandlinger'
                        }

                    },
                    series: [{
                        name: 'Antall behandlinger',
                        data: [
                            [Date.UTC(2007, 1), 35000],
                            [Date.UTC(2008, 1), 40000],
                            [Date.UTC(2009, 1), 60000],
                            [Date.UTC(2010, 1), 67000],
                            [Date.UTC(2011, 1), 70000],
                            [Date.UTC(2012, 1), 78000],
                            [Date.UTC(2013, 1), 97000],
                            [Date.UTC(2014, 1), 109000]],
                        enabled: false

                    }],
                    legend: {
                        enabled: false
                    }
                });
            },
            treatment_distribution: function(element) {
                var last_year = new Date().getFullYear() - 1;
                $(element).highcharts({
                    chart: {
                        type: 'column',
                        width: settings.width,
                        height: settings.height,
                        animation: {
                            duration: settings.animation_duration
                        }
                    },
                    title: {
                        text: 'Fordeling behandlinger'
                    },
                    xAxis: {
                        title: {
                            text: 'Måned'
                        },
                        minRange : 30 * 24 * 3600 * 1000, //
                        minTickInterval: 12 * 30 * 24 * 3600 * 1000, // A year
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {
                            text: 'Fordeling'
                        }

                    },
                    series: [{
                        name: 'Preeksisterende',
                        data: [
                            [Date.UTC(last_year, 0), 2],
                            [Date.UTC(last_year, 1), 5],
                            [Date.UTC(last_year, 2), 10],
                            [Date.UTC(last_year, 3), 20],
                            [Date.UTC(last_year, 4), 40],
                            [Date.UTC(last_year, 5), 70],
                            [Date.UTC(last_year, 6), 40],
                            [Date.UTC(last_year, 7), 40],
                            [Date.UTC(last_year, 8), 40]]
                    },
                    {
                        name: 'Nye lidelser',
                        data: [
                            [Date.UTC(last_year, 0), 8],
                            [Date.UTC(last_year, 1), 10],
                            [Date.UTC(last_year, 2), 15],
                            [Date.UTC(last_year, 3), 18],
                            [Date.UTC(last_year, 4), 20],
                            [Date.UTC(last_year, 5), 30],
                            [Date.UTC(last_year, 6), 40],
                            [Date.UTC(last_year, 7), 40],
                            [Date.UTC(last_year, 8), 40]]
                    }],
                    plotOptions: {
                        column: {
                            stacking: 'normal'
                        }
                    }
                });
            },
            num_insured: function(element) {
                $(element).highcharts({
                    chart: {
                        type: 'column',
                        width: settings.width,
                        height: settings.height,
                        animation: {
                            duration: settings.animation_duration
                        }
                    },
                    title: {
                        text: 'Antall forsikrede (behandlingsforsikring) per 30. juni 2003-2014'
                    },
                    xAxis: {
                        title: {
                            text: 'År'
                        },
                        tickInterval: Date.UTC(1902, 0, 1) - Date.UTC(1901, 0, 1), // A year
                        year: '%Y',
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {
                            text: 'Antall forsikrede'
                        }

                    },
                    series: [{
                        name: 'Antall forsikrede',
                        data: [
                            [Date.UTC(2003, 0), 14587],
                            [Date.UTC(2004, 0), 20634],
                            [Date.UTC(2005, 0), 35418],
                            [Date.UTC(2006, 0), 42073],
                            [Date.UTC(2007, 0), 74435],
                            [Date.UTC(2008, 0), 97661],
                            [Date.UTC(2009, 0), 115651],
                            [Date.UTC(2010, 0), 141742],
                            [Date.UTC(2011, 0), 233739],
                            [Date.UTC(2012, 0), 357468],
                            [Date.UTC(2013, 0), 404320],
                            [Date.UTC(2014, 0), 437137]],
                        enabled: false

                    }],
                    legend: {
                        enabled: false
                    }
                });
            }
        };

        /* What do do? */
        if(action == 'load') {
            /* For each element get attr and load appropriate graph */
            return this.each(function() {
                var slug = $(this).attr('data-graph-slug');
                // Create a graphs[slug] of this.
                graphs[slug](this);
            });
        } else if(action == 'get') {
            /* Not used
            return Highcharts.charts[loaded_graphs[slug].data('highchartsChart')];
            */
        }
    };

}( jQuery ));
