
function format_results(results) {
    return nunjucks.render('search_results.html', {'results':results});
}

function set_field_state(field_element, state, help_text) {
    if(!help_text) {
        help_text = '';
    }
    var help_span = '<span class="help-block ">'+ help_text +'</span>';
    var state_to_icon = {
        success: 'ok',
        warning: 'warning-sign',
        error: 'remove'
    };
    var feedback_span = '<span class="glyphicon glyphicon-'+ state_to_icon[state] +' form-control-feedback" aria-hidden="true"></span>';
    var css_class = 'has-'+state;
    var form_group = field_element.parent();
    form_group.removeClass('has-success has-warning has-error has-feedback'); // reset
    if(['success', 'warning', 'error'].indexOf(state) !== -1) {
        form_group.addClass(css_class +' has-feedback');
        /* Feedback icon */
        var feedback_el = form_group.find('.form-control-feedback');
        if (!feedback_el.length) {
             // add
            form_group.append(feedback_span);
        } else {
            // Update
            feedback_el.removeClass('glyphicon-ok glypicon-warning-sign glyphicon-remove');
            feedback_el.addClass('glyphicon-'+state_to_icon[state]);
        }
        /* Help text */
        var help_text_el = form_group.find('.help-block');
        if(!help_text_el.length) {
            form_group.append(help_span);
        } else {
            help_text_el.text(help_text);
        }
    }
    else {
        form_group.find('.form-control-feedback').remove();
        form_group.find('.help-block').remove();
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
        set_field_state(_dom.cardNumber, 'error', cardno_invalid);
        errors.push(cardno_invalid);
    }

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
        usernameField: $('#id_username'),
        userId: $('#id_user_id')
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

    /* Phone number as you type */
    _dom.phoneNumber.on('keyup', function() {
        var val = _dom.phoneNumber.val().trim();
        if(val.length === 0) {
            set_field_state(_dom.phoneNumber, '');
            return 'Phonenumber number should not be empty.';
        }
        $.getJSON(urls.insidePhoneNumberApi, {q: val}, function(data) {
            if(data.meta && data.meta.num_results == 1) {
                set_field_state(_dom.phoneNumber, 'success');
                _dom.userId.val(data.results[0].id);
            } else {
                set_field_state(_dom.phoneNumber, '');
                _dom.userId.val('');
            }
        });
    });
    /* Card number as you type */
    _dom.cardNumber.on('keyup', function() {
        if(!validate_form('cardNumber')) {
            return;
        }
        /* Card number should exist in the database and not tied to existing user */
        var val = _dom.cardNumber.val().trim();
        $.getJSON(urls.insideCardNumber, {q: val}, function(data) {
            if(data.error) {
                set_field_state(_dom.cardNumber, 'error', data.error);
                return;
            }
            if(!data.valid) {
                set_field_state(_dom.cardNumber, 'error', 'Cannot find card number in database.');
            }
            else if(data.user !== null && data.valid) {
                set_field_state(_dom.cardNumber, 'error', 'Card number belongs to existing user: '+ data.user.firstname +''+ data.user.lastname +'('+data.user.id+').');
            }
            else if(data.user === null && data.valid) {
                set_field_state(_dom.cardNumber, 'success');
            } else {
                set_field_state(_dom.cardNumber, '');
            }
        });
    });

    /* On search result click */
    _dom.results.on('click', '.search-result input', function(e){
        var label = $(this).parent();
        var number = label.attr('data-phone-number');
        var user_id = label.attr('data-user-id');
        $('.search-result').removeClass('selected');
        label.toggleClass('selected');
        _dom.userId.val(user_id);
        if(number === '-') {
            number = '';
        }
        _dom.phoneNumber.val(number);
    });

    /* Initial state disabled */
    _dom.registerButton.attr('disabled','disabled');

    /* Initial focus */
    if(_dom.usernameField) {
        _dom.usernameField.focus();
    }
    if(_dom.phoneNumber) {
        _dom.phoneNumber.focus();
    }
});