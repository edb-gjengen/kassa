var _dom;
function format_results(results) {
    return nunjucks.render('search_results.html', {'results':results});
}
function validate_form() {
    var errors = [];
    /* TODO
       - cardnumber should start with 1 and be 9 digits long
       - cardnumber should not be empty
       - cardnumber should be in the database
       - phonenumber should be valid (python-phonenumbers)
       - userid exists (optional)
    */

    if(errors.length === 0) {
        _dom.registerButton.removeAttr('disabled');
        return true;
    } else {
        _dom.registerButton.attr('disabled','disabled');
    }
}

$(document).ready(function(){
    _dom = {
        results: $('.results-wrap'),
        query: $('#id_query'),
        phoneNumber: $('#id_phone_number'),
        cardNumber: $('#id_card_number'),
        registerButton: $('#register-submit-btn')
    };
    var urls = {
        insideUserApi: '/inside/user/'
    };

    /* Saerch as you type */
    _dom.query.on('keyup', function() {
        var val = _dom.query.val();
        $.getJSON(urls.insideUserApi, {q: val}, function(data) {
            console.log(data);
            if(data.results && data.results.length > 0) {
                _dom.results.html(format_results(data.results));
            } else {
                if(val === "") {
                    _dom.results.html('');
                } else {
                    _dom.results.html('No existing user with that phone number');
                }
            }
        });
    });

    /* On search result click */
    _dom.results.on('click', '.search-result input', function(e){
        var label = $(this).parent();
        var number = label.attr('data-phone-number');
        $('.search-result').removeClass('selected');
        label.toggleClass('selected');
        _dom.phoneNumber.val(number);
    });

    /* Default state disabled */
    _dom.registerButton.attr('disabled','disabled');
});