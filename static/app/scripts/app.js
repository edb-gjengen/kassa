function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function format_results(results) {
    return nunjucks.render('search_results.html', {'results':results});
}
function render_selected_user(user_data) {
    user_data.checked = true;
    var selected_user_html = nunjucks.render('search_result.html', user_data);
    _dom.selectedUserWrap.html(selected_user_html);
}
function set_selected_user(user, update_search_result) {
    selectedUser = user;
    var new_val = '';
    if(user) {
        new_val = user.id;
    }
    _dom.userIdField.val(new_val).trigger('change');
    if(update_search_result) {
        var stale_search_result = _dom.results.find('.search-result').removeClass('selected');
        stale_search_result.find('input').prop('checked', false);
        /* User is still in search result, mark selected */
        if( user && _.findWhere(users, {id:user.id}) ) {
            var search_result = _dom.results.find('[data-user-id="'+ user.id +'"]').toggleClass('selected');
            search_result.find('input').prop('checked', true);
        }
    }
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

function validatePhoneNumber(val) {
    if(val.length === 0) {
        return 'Phonenumber number should not be empty.';
    }

    return '';
}

function validateCardNumber(val) {
    if(val.length === 0) {
        return 'Card number should not be empty.';
    }
    if(val.length > 0 && val[0] != "1") {
        return 'Card number should start with 1.';
}
    if(val.length !== 9) {
        return 'Card number should be 9 digits long';
    }

    return '';
}

function getFormData(formElement) {
    var formData = formElement.serializeArray();
    formData = _.object(_.map(formData, function (x) {
        return [x.name, x.value];
    }));

    return formData;
}
function validateCardForm() {
    var formData = getFormData(_dom.registerCardForm);
    var errors = [];
    /* TODO
       - phonenumber should be valid (python-phonenumbers)
       - userid exists (optional)
    */
    /* Card number */
    var cardno_invalid = validateCardNumber(formData.card_number);
    if(cardno_invalid) {
        set_field_state(_dom.cardNumberField, 'error', cardno_invalid);
        errors.push(cardno_invalid);
    }
    /* Phone number */
    var phone_number_invalid = validatePhoneNumber(formData.phone_number);
    if(phone_number_invalid) {
        set_field_state(_dom.phoneNumberField, 'error', phone_number_invalid);
        errors.push(phone_number_invalid);
    }
    console.log("Errors: ", errors);

    if(errors.length === 0) {
        _dom.registerButton.removeAttr('disabled');
        return true;
    }
    _dom.registerButton.attr('disabled','disabled');
    return false;
}


var _dom;
var register_form_fields = ['user_id', 'phone_number', 'card_number'];
var users;
var selectedUser;


$(document).ready(function(){
    _dom = {
        results: $('.results-wrap'),
        query: $('#id_query'),
        phoneNumberLabel: $('[for=id_phone_number]'),
        phoneNumberField: $('#id_phone_number'),
        cardNumberField: $('#id_card_number'),
        registerCardForm: $('.register-card-form'),
        registerButton: $('#register-submit-btn'),
        usernameField: $('#id_username'),
        userIdField: $('#id_user_id'),
        selectedUserWrap: $('.register-card-form--selected-user-wrap')
    };
    var urls = {
        insideUserApi: '/inside/user/',
        insidePhoneNumberApi: '/inside/phonenumber/',
        insideCardNumber: '/inside/cardnumber/',
        insideRegister: '/inside/register/'
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
                users = data.results;
            }
            else if(data.error) {
                _dom.results.html(data.error);
            }
            else {
                if(val === "") {
                    _dom.results.html('');
                } else {
                    _dom.results.html("Found no existing user with search param: '"+ val +"'");
                }
            }
        });
    });

    /* Phone number as you type */
    _dom.phoneNumberField.on('input', function() {
        if( !validateCardForm() ) {
            return;
        }
        var val = _dom.phoneNumberField.val().trim();
        $.getJSON(urls.insidePhoneNumberApi, {q: val}, function(data) {
            if(data.meta && data.meta.num_results == 1) {
                set_field_state(_dom.phoneNumberField, 'success');
                set_selected_user(data.results[0], true);
            } else {
                set_field_state(_dom.phoneNumberField, '');
                set_selected_user('', true);
            }
        });

    });
    /* Card number as you type */
    _dom.cardNumberField.on('input', function() {
        /* Card number should exist in the database and not tied to existing user */
        if( !validateCardForm() ) {
            return;
        }
        var val = _dom.cardNumberField.val().trim();
        $.getJSON(urls.insideCardNumber, {card_number: val}, function(data) {
            if(data.error) {
                set_field_state(_dom.cardNumberField, 'error', data.error);
                return;
            }
            if(!data.valid) {
                set_field_state(_dom.cardNumberField, 'error', 'Cannot find card number in database.');
            }
            else if(data.user !== null && data.valid) {
                var user = data.user[0];
                set_field_state(_dom.cardNumberField, 'error', 'Card number belongs to existing user: '+ user.firstname +' '+ user.lastname +' ('+user.id+').');
            }
            else if(data.user === null && data.valid) {
                set_field_state(_dom.cardNumberField, 'success');
            } else {
                set_field_state(_dom.cardNumberField, '');
            }
        });
    });

    /* On search result click */
    _dom.results.on('click', '.search-result input', function(e){
        var label = $(this).parent();
        var number = label.attr('data-phone-number');
        var user_id = label.attr('data-user-id');

        /* Update selected state */
        $('.search-result').removeClass('selected');
        label.toggleClass('selected');

        set_selected_user(_.findWhere(users, {id: user_id}));

        /* Update phone number field */
        if(number === '-') {
            number = '';
        }
        _dom.phoneNumberField.val(number);
    });

    _dom.registerButton.on('click', function(e) {
        e.preventDefault();
        // TODO on error output validation status
        // TODO on success:
        //  - print what action was performed and suggest steps
        //  - show new user below form (hide/show after 10s)
        //  - clear form

        if( !validateCardForm() ) {
            // ERROR
            return;
        }
        var url = urls.insideRegister;
        var payload = getFormData(_dom.registerCardForm);

        /* Just updating card number? */
        if(payload.user_id && payload.card_number && selectedUser.is_member === "1") {
            url = urls.insideCardNumber;
        }
        $.ajax(url, {
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            headers: {'X-CSRFToken': getCookie('csrftoken')}
        }).success(function(data){
            console.log("success", data);

        }).fail(function(data) {
            console.log("failed", data);
        });
    });

    /* On user id change  */
    _dom.userIdField.on('change', function() {
        /* Render selected user in search form */
        console.log("try updating selected user ", selectedUser);
        if(selectedUser) {
            render_selected_user({res: selectedUser});
            return;
        }
        render_selected_user({placeholder: true});
    });

    /* Ninja add some icons to bootstrap form */
    var inputGroup = '<div class="input-group">';
    var iconMobile = '<span class="input-group-addon"><span class="glyphicon glyphicon-phone"></span></span>';
    _dom.phoneNumberField.wrap(inputGroup);
    _dom.phoneNumberField.before(iconMobile);

    /* Initial focus */
    if(_dom.usernameField) {
        _dom.usernameField.focus();
    }
    if(_dom.phoneNumberField) {
        _dom.phoneNumberField.focus();
    }
    /* Initial submit button state disabled */
    _dom.registerButton.attr('disabled','disabled');

    /* Load query params */
    /* FIXME: does not trigger validation and selected user preview */
    if( getParameterByName('user_id') ) {
        _dom.userIdField.val(getParameterByName('user_id')).trigger('change');
    }
    if( getParameterByName('phone_number') ) {
        _dom.phoneNumberField.val(getParameterByName('phone_number'));
    }
    if( getParameterByName('card_number') ) {
        _dom.cardNumberField.val(getParameterByName('card_number'));
    }
});