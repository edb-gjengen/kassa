
function format_results(results) {
    return nunjucks.render('search_results.html', {'results':results});
}

function set_field_state(field_element, state) {
    var ok_span = '<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>';
    var form_group = field_element.parent();
    if(state === 'valid') {
        form_group.addClass('has-success has-feedback');
        if(!form_group.find('.form-control-feedback').length) {
            form_group.append(ok_span); // Only add once
        }
    } else {
        form_group.removeClass('has-success has-feedback');
        form_group.find('.form-control-feedback').remove();
    }
}

function validate_cardnumber(val) {
    if(val.length === 0) {
        return 'Card number should not be empty.';
    }
    if(val.length > 0 && val[0] != "1") {
        return 'Card number should start with 1.';
}
    if(val.length !== 9) {
        return 'Card Number should be 9 digits long';
    }

    return '';
}

function validate_form() {
    var errors = [];
    /* TODO
       - phonenumber should be valid (python-phonenumbers)
       - userid exists (optional)
    */
    /* Check each fields validation state */
    /* Checkout multifield validation state */
    var cardno_val = _dom.cardNumber.val();
    var cardno_invalid = validate_cardnumber(cardno_val);
    if(cardno_invalid) {
        errors.push(cardno_invalid);
    }
    console.log(cardno_invalid);

    if(errors.length === 0) {
        _dom.registerButton.removeAttr('disabled');
        return true;
    }
    _dom.registerButton.attr('disabled','disabled');
    return false;
}


var _dom;


$(document).ready(function(){
    _dom = {
        results: $('.results-wrap'),
        query: $('#id_query'),
        phoneNumber: $('#id_phone_number'),
        cardNumber: $('#id_card_number'),
        registerButton: $('#register-submit-btn'),
        usernameField: $('#id_username')
    };
    var urls = {
        insideUserApi: '/inside/user/',
        insidePhoneNumberApi: '/inside/phonenumber/',
        insideCardNumber: '/inside/cardnumber/'
    };

    /* User search as you type */
    _dom.query.on('keyup', function() {
        var val = _dom.query.val().trim();
        if(val === '') {
            return;
        }
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
    /* Phonenumber as you type */

    _dom.phoneNumber.on('keyup', function() {
        var val = _dom.phoneNumber.val().trim();
        if(val.length === 0) {
            set_field_state(_dom.phoneNumber, '');
            return 'Phonenumber number should not be empty.';
        }
        $.getJSON(urls.insidePhoneNumberApi, {q: val}, function(data) {
            if(data.meta && data.meta.num_results == 1) {
                set_field_state(_dom.phoneNumber, 'valid');
            } else {
                set_field_state(_dom.phoneNumber, '');
            }
        });
    });
    _dom.cardNumber.on('keyup', function() {
        if(!validate_form('cardNumber')) {
            return;
        }
        /* cardnumber should be in the database */
        var val = _dom.cardNumber.val().trim();
        $.getJSON(urls.insideCardNumber, {q: val}, function(data) {
            if(data.result === 'valid') {
                set_field_state(_dom.cardNumber, 'valid');
            } else {
                set_field_state(_dom.cardNumber, '');
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

    /* Focus */
    if(_dom.usernameField) {
        _dom.usernameField.focus();
    }
    if(_dom.phoneNumber) {
        _dom.phoneNumber.focus();
    }
});