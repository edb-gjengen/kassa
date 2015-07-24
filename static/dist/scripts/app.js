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
function update_user_with_card_details(user) {
    /* Cards with a number lower than this is legacy as of 2015-08 */
    var legacy_card_limit = 100000000;
    if(user.cards === '') {
        return user;
    }

    for(var j=0; j<user.cards.length; j++) {
        if(parseInt(user.cards[j].card_number, 10) < legacy_card_limit) {
            user.cards[j].is_legacy = "1";
        }
        if(user.cards[j].is_active == "1") {
            user.card_number_active = user.cards[j].card_number;
        }
    }
    return user;
}
function format_results(results) {
    results = _.map(results, update_user_with_card_details);
    return nunjucksEnv.render('search_results.html', {'results': results});
}
function render_selected_user(user_data) {
    var context;
    if(user_data === undefined) {
        context = {placeholder: true};  // dummy card
    } else {
        user_data = update_user_with_card_details(user_data);
        context = {res: user_data, checked: true, no_user_actions: true};
    }
    var selected_user_html = nunjucksEnv.render('search_result.html', context);
    _dom.selectedUserWrap.html(selected_user_html);
}
function set_toast(message, message_type) {
    var context = {
        message: message,
        message_type: message_type,
        icon: state_to_icon[message_type]
    };
    var html = nunjucksEnv.render('toast.html', context);
    _dom.toastWrap.html(html);
    _dom.toastWrap.addClass('visible');
    setTimeout(function() {
        _dom.toastWrap.removeClass('visible');
    }, 4000);
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
    var feedback_span = '<span class="glyphicon glyphicon-'+ state_to_icon[state] +' form-control-feedback" aria-hidden="true"></span>';
    var css_class = 'has-'+state;
    var form_group = field_element.parent().parent();
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
function resetCardForm(reset_native) {
    if(reset_native) {
        _dom.registerCardForm.get(0).reset();
    }
    /* Clear field states */
    set_field_state(_dom.phoneNumberField, '');
    cardForm.fields.phoneNumber = false;
    set_field_state(_dom.cardNumberField, '');
    cardForm.fields.cardNumber = false;
    selectedUser = null;
    _dom.userIdField.val('').trigger('change');

    /* Disable submit button */
    _dom.registerSubmitButton.prop('disabled', true);
}
function resetSearchForm(reset_native) {
    if(reset_native) {
        _dom.searchResetButton.get(0).reset();
    }
    /* Clear search results */
    users = null;
    _dom.results.html('');
}

function cardFormIsValid() {
    return _.all(_.values(cardForm.fields));
}

function update_submit_button() {
    if( cardFormIsValid() ) {
        _dom.registerSubmitButton.prop('disabled', false);
        return;
    }
    _dom.registerSubmitButton.prop('disabled', true);
}
function validatePhoneNumber(val) {
    if(val.length === 0) {
        cardForm.fields.phoneNumber = false;
        update_submit_button();
        return 'Phonenumber number should not be empty.';
    }
    cardForm.fields.phoneNumber = true;
    update_submit_button();
    return '';
}

function validateCardNumber(val) {
    if(val.length === 0) {
        cardForm.fields.cardNumber = false;
        update_submit_button();
        return 'Card number should not be empty.';
    }
    if(val.length > 0 && val[0] != "1") {
        cardForm.fields.cardNumber = false;
        update_submit_button();
        return 'Card number should start with 1.';
}
    if(val.length !== 9) {
        cardForm.fields.cardNumber = false;
        update_submit_button();
        return 'Card number should be 9 digits long';
    }
    cardForm.fields.cardNumber = true;
    update_submit_button();
    return '';
}

function getFormData(formElement) {
    var formData = formElement.serializeArray();
    formData = _.object(_.map(formData, function (x) {
        return [x.name, x.value];
    }));

    return formData;
}

/* Init and global vars */
var _dom;
var users;
var selectedUser;
var cardForm = {
    fields: {
        cardNumber: false,
        phoneNumber: false
    }
};
var state_to_icon = {
    success: 'ok',
    warning: 'warning-sign',
    error: 'remove'
};
var nunjucksEnv = new nunjucks.Environment();



$(document).ready(function(){
    _dom = {
        results: $('.results-wrap'),
        query: $('#id_query'),
        phoneNumberLabel: $('[for=id_phone_number]'),
        phoneNumberField: $('#id_phone_number'),
        cardNumberField: $('#id_card_number'),
        registerCardForm: $('.register-card-form'),
        registerSubmitButton: $('#register-submit-btn'),
        usernameField: $('#id_username'),
        userIdField: $('#id_user_id'),
        selectedUserWrap: $('.register-card-form--selected-user-wrap'),
        toastWrap: $('.toast-wrap'),
        registerResetButton: $('.register-reset-btn'),
        searchResetButton: $('.search-reset-btn')
    };
    var urls = {
        insideUserApi: '/inside/user/',
        insidePhoneNumberApi: '/inside/phonenumber/',
        insideCardNumber: '/inside/cardnumber/',
        insideRegister: '/inside/register/'
    };
    /* Add filter |phoneNumber */
    nunjucksEnv.addFilter('phoneNumber', function(str) {
        if(!str || str.length <= 1) {
            return 'No phone number';
        }
        if(str.length == 11) {
            return str.slice(0, 3) + " " + str.slice(3, 6) + " " + str.slice(6, 8) + " " + str.slice(8);
        }

        return str;
    });

    /* Phone number as you type */
    _dom.phoneNumberField.on('input', function() {
        var val = _dom.phoneNumberField.val().trim();
        var validation_msg = validatePhoneNumber(val);
        if( validation_msg !== '') {
            set_field_state(_dom.phoneNumberField, 'error', validation_msg);
            return;
        }
        $.getJSON(urls.insidePhoneNumberApi, {q: val}, function(data) {
            if(data.meta && data.meta.num_results == 1) {
                set_field_state(_dom.phoneNumberField, 'success');
                set_selected_user(data.results[0], true);
            } else {
                set_field_state(_dom.phoneNumberField, '');
                set_selected_user(null, true);
            }
            cardForm.fields.phoneNumber = true;
            update_submit_button();
        });

    });
    /* Card number as you type */
    _dom.cardNumberField.on('input', function() {
        /* Card number should exist in the database and not tied to existing user */
        var val = _dom.cardNumberField.val().trim();
        var validation_msg = validateCardNumber(val);
        if( validation_msg !== '' ) {
            set_field_state(_dom.cardNumberField, 'error', validation_msg);
            return;
        }
        $.getJSON(urls.insideCardNumber, {card_number: val}, function(data) {
            if(data.error) {
                update_submit_button();
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', data.error);
                return;
            }
            if(!data.valid) {
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', 'Cannot find card number in database.');
            }
            else if(data.user !== null && data.valid) {
                var _user = data.user[0];
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', 'Card number is in use and belongs to existing user: '+ _user.firstname +' '+ _user.lastname +' ('+_user.id+').');
            }
            else if(data.user === null && data.valid) {
                cardForm.fields.cardNumber = true;
                set_field_state(_dom.cardNumberField, 'success');
            } else {
                cardForm.fields.cardNumber = true;
                set_field_state(_dom.cardNumberField, '');
            }
            update_submit_button();
        });
    });

    /* User search as you type */
    _dom.query.on('input', function() {
        var val = _dom.query.val().trim();
        if(val.length <= 2) {
            _dom.results.html('');
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
                if(val !== "") {
                    _dom.results.html("Found no existing user with search param: '"+ val +"'");
                } else {
                    _dom.results.html('');
                }
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
        _dom.phoneNumberField.val(number).trigger('input');
    });

    _dom.registerSubmitButton.on('click', function(e) {
        e.preventDefault();
        // TODO on error output validation status
        // TODO on success:
        //  - print what action was performed and suggest steps
        //  - show new user below form (hide/show after 10s)
        //  - clear form

        if( !cardFormIsValid() ) {
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
            set_toast('Success :-)', 'success');
            resetCardForm(true);

        }).fail(function(data) {
            console.log("failed", data);
            set_toast('Failed!'+ data.error, 'error');
        });
    });

    /* On user id change */
    _dom.userIdField.on('change', function() {
        /* Render selected user in search form */
        if(selectedUser) {
            render_selected_user(selectedUser);
            return;
        }
        render_selected_user();
    });
    /* Reset buttons */
    _dom.registerResetButton.on('click', function() {
        resetCardForm();
    });
    _dom.searchResetButton.on('click', function() {
        resetSearchForm();
    });

    /* Ninja add some icons to bootstrap form */
    var iconMobile = '<span class="input-group-addon"><span class="glyphicon glyphicon-phone glyphicon-phone-large"></span></span>';
    _dom.phoneNumberField.parent().addClass('input-group');
    _dom.phoneNumberField.before(iconMobile);

    /* Render initial placeholder user */
    var selected_user_html = nunjucksEnv.render('search_result.html', {placeholder: true});
    _dom.selectedUserWrap.html(selected_user_html);

    /* Initial focus */
    if(_dom.usernameField) {
        _dom.usernameField.focus();
    }
    if(_dom.phoneNumberField) {
        _dom.phoneNumberField.focus();
    }

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