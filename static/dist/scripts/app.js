function format_results(results) {
    return nunjucks.render('search_results.html', {'results':results});
}

$(document).ready(function(){
    var _dom = {
        results: $('.results-wrap'),
        query: $('#id_query'),
        phoneNumber: $('#id_phone_number'),
        cardNumber: $('#id_card_number')
    };
    var urls = {
        insideUserApi: '/inside/user/'
    };

    /* Saerch as you type */
    _dom.query.on('keyup', function() {
        var val = _dom.query.val();
        $.getJSON(urls.insideUserApi, {q: val}, function(data) {
            //console.log(data);
            if(data.results && data.results.length > 0) {
                _dom.results.html(format_results(data.results));
            } else {
                _dom.results.html('No existing user with that phone number');
            }
        });
    });

    /* Click search result */
    _dom.results.on('click', '.search-result input', function(e){
        var label = $(this).parent();
        var number = label.attr('data-phone-number');
        $('.search-result').removeClass('selected');
        label.toggleClass('selected');
        _dom.phoneNumber.val(number);
    });
});