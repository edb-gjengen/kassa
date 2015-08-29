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

function format_phone_number(str) {
    if(!str || str.length <= 1) {
        return 'No phone number';
    }
    if(str.length == 11) {
        return str.slice(0, 3) + " " + str.slice(3, 6) + " " + str.slice(6, 8) + " " + str.slice(8);
    }

    return str;
}

function format_results(results) {
    results = _.map(results, update_user_with_card_details);
    return nunjucksEnv.render('search_results.html', {'results': results});
}
function render_selected_user(user_data) {
    var context;
    if(user_data === undefined || user_data === null) {
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
    }, 5000);
}
function set_selected_user(user, update_search_result) {
    selectedUser = user;
    var new_val = '';

    if(user) {
        new_val = user.id;
    }

    updateMemberShipButton(user);

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

    _dom.membershipTrialCheckBox.prop('checked', false);

    pendingSMSMembership = null;

    /* Disable submit buttons */
    _dom.registerSubmitButton.prop('disabled', true);
    _dom.membershipSubmitButton.prop('disabled', true);
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
function updateMemberShipButton(user) {
    var today_plus_one_month = moment().add(1, 'month').format('YYYY-MM-DD');
    /* Existing member with upcoming expiry and card */
    if(user && user.is_member === '1' && user.expires <= today_plus_one_month && user.card_number_active !== '') {
        _dom.membershipSubmitButton.prop('disabled', false);
    }
    /* User with card, but expired membership */
    else if(user && user.is_member !== '1' && user.card_number_active !== '') {
        _dom.membershipSubmitButton.prop('disabled', false);
    } else {
        _dom.membershipSubmitButton.prop('disabled', true);
    }
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

/* Phone number as you type */
function checkPhoneNumber() {
    var val = _dom.phoneNumberField.val().trim();
    $.getJSON(urls.checkPhoneNumber, {phone_number: val}, function(data) {
        /* Invalid phone number?*/
        if(data.error) {
            set_selected_user(null, true);
            set_field_state(_dom.phoneNumberField, 'error', data.error);
            cardForm.fields.phoneNumber = false;
            pendingSMSMembership = null;
            update_submit_button();
            return;
        }
        /* Already has valid card membership? */
        if(data.inside.card && data.inside.card.has_valid_membership) {
            var card = data.inside.card;
            var msg = 'Phone number is already tied to card '+ card.card_number + ' and is valid until '+ card.expires +'.';
            set_field_state(_dom.phoneNumberField, 'error', msg);
            cardForm.fields.phoneNumber = false;
            pendingSMSMembership = null;
            update_submit_button();
            return;
        }

        var inside = data.inside;
        var tekstmelding = data.tekstmelding;
        var _user = null;
        var _success_msg = '';

        if(inside.users.length == 1) {
            /* Existing user */
            _user = inside.users[0];
            _success_msg = 'Phone number belongs to existing user.';
            pendingSMSMembership = null;
        } else if(tekstmelding.result !== null) {
            /* Pending SMS membership (not activated yet) */
            _success_msg = 'Phone number has valid membership (paid via SMS). OK to give out card.';
            pendingSMSMembership = tekstmelding.result;
        } else {
            /* Valid phone number with no existing user, card membership or pending SMS membership */
            pendingSMSMembership = null;
        }

        set_field_state(_dom.phoneNumberField, 'success', _success_msg);
        set_selected_user(_user, true);
        cardForm.fields.phoneNumber = true;
        update_submit_button();
    });
}

/* Init and global vars */
var _dom;
var users;
var selectedUser;
var pendingSMSMembership;
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
/* Add filter |phoneNumber */
nunjucksEnv.addFilter('phoneNumber', format_phone_number);

var urls = {
    insideUserApi: '/inside/user/',
    checkPhoneNumber: '/check-phonenumber/',
    insideCard: '/inside/card/',
    registerCardAndMembership: '/register-card-membership/',
    renewMembership: '/renew-membership/'
};



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
        searchResetButton: $('.search-reset-btn'),
        membershipSubmitButton: $('#membership-submit-btn'),
        membershipTrialCheckBox: $('#id_membership_trial')
    };

    var lazyCheckPhoneNumber = _.debounce(checkPhoneNumber, 250);
    _dom.phoneNumberField.on('input', function() {
        var val = _dom.phoneNumberField.val().trim();
        var validation_msg = validatePhoneNumber(val);
        if( validation_msg !== '') {
            set_selected_user(null, true);
            set_field_state(_dom.phoneNumberField, 'error', validation_msg);
            return;
        }
        lazyCheckPhoneNumber();
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
        $.getJSON(urls.insideCard, {card_number: val}, function(data) {
            if(data.error) {
                update_submit_button();
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', data.error);
                return;
            }
            var card = data.card;
            var user = data.user;
            if(!card) {
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', 'Cannot find card number in database.');
            }
            else if(card && card.registered !== "") {
                var owner_string = 'phone number: '+ format_phone_number(card.owner_phone_number);
                if(user) {
                    owner_string = 'existing user: ' + user.firstname + ' ' + user.lastname + ' (' + format_phone_number(user.number) + ')';
                }
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', 'Card number is in use and belongs to '+ owner_string +'.');
            }
            else if(data.user === null && data.card) {
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
    /* On submit button click */
    _dom.registerSubmitButton.on('click', function(e) {
        e.preventDefault();

        if( !cardFormIsValid() ) {
            set_toast('Either phone number or card number is not valid', 'error');
            return;
        }
        var payload = getFormData(_dom.registerCardForm);

        /* Register type */
        // FIXME: get from form
        // action: 'new_card_membership', 'update_card', 'add_or_renew', 'sms_card_notify'
        if(selectedUser === null && pendingSMSMembership === null) {
            payload.action = 'new_card_membership';
        } else if(selectedUser === null && pendingSMSMembership !== null) {
            payload.action = 'sms_card_notify';
            payload.purchased = pendingSMSMembership.purchase_date;
        } else {
            if(selectedUser.is_member === '1') {
                payload.action = 'update_card';
            } else {
                payload.action = 'add_or_renew'; // Note: could also update card number
            }
        }

        $.ajax(urls.registerCardAndMembership, {
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            headers: {'X-CSRFToken': getCookie('csrftoken')}
        }).success(function(data){
            var phone_number;
            var success_message = 'New card registered ' + payload.card_number;
            if(payload.action === 'add_or_renew') {
                var full_name =  data.user[0].firstname + ' ' + data.user[0].lastname;
                success_message = 'New membership and card number '+ payload.card_number + ' registered to ' + full_name + ' ';
            }
            else if(payload.action ==='new_card_membership') {
                phone_number = data.card.owner_phone_number;
                success_message = 'New membership and card registered to ' + format_phone_number(phone_number) + '. Activation SMS sent ';
            }
            else if(payload.action === 'sms_card_notify') {
                phone_number = data.card.owner_phone_number;
                success_message = 'New card registered to ' + format_phone_number(phone_number) + '. Membership already paid by SMS ('+ pendingSMSMembership.purchase_date +'). Activation SMS sent ';
            }
            set_toast(success_message + ' :-)', 'success');
            resetCardForm(true);

        }).fail(function(data) {
            console.log("failed", data);
            var error_text = data.responseText;
            if(data.responseJSON) {
                error_text = data.responseJSON.error;
            }
            set_toast('Failed! '+ error_text, 'error');
        });
    });

    /* Membership renewal button */
    _dom.membershipSubmitButton.on('click', function(e) {
        e.preventDefault();
        if(!cardForm.fields.phoneNumber || selectedUser.card_number_active === '') {
            set_toast('Either users phone number is not valid or user does not have a card registered.', 'error');
            return;
        }

        var payload = getFormData(_dom.registerCardForm);
        if( pendingSMSMembership !== null) {
            payload.purchased = pendingSMSMembership.purchase_date;
        } else {
            payload.purchased = selectedUser.expires; // future purchase date
        }
        console.log(payload);
        $.ajax(urls.renewMembership, {
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            headers: {'X-CSRFToken': getCookie('csrftoken')}
        }).success(function(data) {
            var full_name =  data.user[0].firstname + ' ' + data.user[0].lastname;
            var success_message = 'Membership renewed for ' + full_name + ' ';
            set_toast(success_message + ' :-)', 'success');
            resetCardForm(true);

        }).fail(function(data) {
            console.log("failed", data);
            var error_text = data.responseText;
            if(data.responseJSON) {
                error_text = data.responseJSON.error;
            }
            set_toast('Failed! '+ error_text, 'error');
        });
    });

    /* On user id change */
    _dom.userIdField.on('change', function() {
        /* Render selected user in search form */
        render_selected_user(selectedUser);
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

    /* Load query params */
    if( getParameterByName('user_id') ) {
        _dom.userIdField.val(getParameterByName('user_id')).trigger('change');
    }
    if( getParameterByName('phone_number') ) {
        _dom.phoneNumberField.val(getParameterByName('phone_number')).trigger('input');
    }
    if( getParameterByName('card_number') ) {
        _dom.cardNumberField.val(getParameterByName('card_number')).trigger('input');
    }
});