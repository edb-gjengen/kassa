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


function format_phone_number(str) {
    if(!str || str.length <= 1) {
        return 'No phone number';
    }
    if(str.length == 11) {
        return str.slice(0, 3) + " " + str.slice(3, 6) + " " + str.slice(6, 8) + " " + str.slice(8);
    }

    return str;
}

function sort_search_results(results) {
    return _.sortBy(results, function (x) {
        if (x.last_membership) {
            if (x.last_membership.end_date) {
                return 0 - moment(x.last_membership.end_date).unix();
            }
            return 0 - moment(x.last_membership.start_date).unix();
        }
        return 0;
    });
}

function format_results(results) {
    return nunjucksEnv.render('search_results.html', {'results': results});
}
function render_selected_user(user_data) {
    var context;
    if (!user_data) {
        context = {placeholder: true};  // dummy card
    } else {
        context = {res: user_data, checked: true, no_user_actions: true};
    }
    var selected_user_html = nunjucksEnv.render('search_result.html', context);
    _dom.selectedEntityWrap.html(selected_user_html);
}
function render_selected_order(order) {
    if (!order) { return; }
    var context = {order: order, checked: true, no_user_actions: true};
    var selected_order_html = nunjucksEnv.render('selected_order.html', context);
    _dom.selectedEntityWrap.html(selected_order_html);
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
    updateMemberShipButton(user, null);

    _dom.userIdField.val((user && user.id) || '').trigger('change');
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
function set_selected_order(order) {
    membershipOrder = order;
    if (order) {
        updateMemberShipButton(null, order);        
    }
    _dom.orderUuidField.val((order && order.uuid) || '').trigger('change');
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
    membershipOrder = null;
    _dom.userIdField.val('').trigger('change');
    _dom.membershipTrialCheckBox.prop('checked', false);

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
function updateMemberShipButton(user, order) {
    var today_plus_thirty_days = moment().add(30, 'days').format('YYYY-MM-DD');
    /* User with valid membership */
    if (user && user.is_member) {
        /* ...which is lifelong cannot renew */
        if (user.last_membership.membership_type == 'lifelong') {
            _dom.membershipSubmitButton.prop('disabled', true);
        } 
        /* ...or expiring soon and the user has a card */
        //else if (user.last_membership.end_date <= today_plus_thirty_days && user.active_member_card) {
        /* ...with a membership that expires soon can renew */
        else if (user.last_membership.end_date <= today_plus_thirty_days) {
            _dom.membershipSubmitButton.prop('disable', false);
        }
    }
    /* User with expired membership can renew */
    // else if (user && !user.is_member && user.active_member_card) {
    else if (user && !user.is_member) {
        _dom.membershipSubmitButton.prop('disabled', false);
    }
    /* Order */
    else if (order) {
        /* If the membership has expired it can be renewed */
        if (!order.product.is_valid && order.product.end_date <= today_plus_thirty_days) {
            _dom.membershipSubmitButton.prop('disabled', false);
        }
    }
    else {
        _dom.membershipSubmitButton.prop('disabled', true);
    }
}
function validatePhoneNumber(val) {
    if(val.length === 0) {
        cardForm.fields.phoneNumber = false;
        update_submit_button();
        return 'Phone number should not be empty.';
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
        return 'Card number should be 9 digits long.';
    }
    cardForm.fields.cardNumber = true;
    update_submit_button();
    return '';
}

function getFormData(formElement) {
    var formData = formElement.serializeArray();
    formData = _.object(_.map(formData, function (x) {
        return [x.name, x.value || null];
    }));
    /* no need for radio button state */
    delete formData.user;

    return formData;
}

/* Phone number as you type */
function checkPhoneNumber() {
    var val = _dom.phoneNumberField.val().trim();
    $.getJSON(urls.checkPhoneNumber, {phone_number: val}, function(data) {
        /* Invalid phone number?*/
        if(data.error) {
            set_selected_user(null, true);
            set_selected_order(null);
            set_field_state(_dom.phoneNumberField, 'error', data.error);
            cardForm.fields.phoneNumber = false;
            update_submit_button();
            return;
        }

        var user = data.user;
        var order = data.order;
        var message = '';

        /* Has valid card membership */
        if (!user && order && order.member_card && order.product.is_valid) {
            message = 'Phone number is already tied to card '+ order.member_card + ' and is valid until '+ order.product.end_date +'.';
            set_field_state(_dom.phoneNumberField, 'error', message);
            cardForm.fields.phoneNumber = false;
            set_selected_order(order);
            update_submit_button();
            return;
        }

        if (user) {
            /* Existing user */
            message = 'Phone number belongs to existing user.';
            set_field_state(_dom.phoneNumberField, 'success', message);
            set_selected_user(user, true);
            set_selected_order(null);
            cardForm.fields.phoneNumber = true;
            update_submit_button();
        } else if (order) {
            set_selected_order(order);
            /* Valid membership, no card associated */
            if (order.product.is_valid) {
                message = 'Phone number has a valid membership.';
            } else {
                message = 'Phone number has an expired membership.';
            }
        } else {
            /* Valid phone number associated user or order */
            set_selected_order(null);
            set_selected_user(null);
        }

        set_field_state(_dom.phoneNumberField, 'success', message);
        cardForm.fields.phoneNumber = true;
        update_submit_button();
    });
}

/* Init and global vars */
var _dom;
var users;
var searching; /* search ajax request */
var selectedUser;
var membershipOrder; /* selected order object */
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
    userSearch: '/user-search/',
    checkPhoneNumber: '/check-phone-number/',
    checkCard: '/check-card/',
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
        orderUuidField: $('#id_order_uuid'),
        selectedEntityWrap: $('.register-card-form--selected-entity-wrap'),
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
        if (validation_msg !== '') {
            set_field_state(_dom.cardNumberField, 'error', validation_msg);
            return;
        }
        $.getJSON(urls.checkCard, {card_number: val}, function(data) {
            if (data.error) {
                update_submit_button();
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', data.error);
                return;
            }

            var card = data;
            var user = data.user;
            var order = data.order;
            var today_plus_thirty_days = moment().add(30, 'days');

            if (!card) {
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', 
                    'Cannot find card number in database.');
            }
            else if (card && card.registered !== null && user === null && order && !order.product.is_valid) {
                /* An already registered card (with no user) can repurchase membership if expired */
                set_selected_order(order);
                cardForm.fields.cardNumber = true;
                set_field_state(_dom.cardNumberField, 'success',
                    'Card number is in use (not activated) and belongs to ' + format_phone_number(order.phone_number) + '.');
            }
            else if (card && card.registered !== null) {
                var owner_string = '???';
                if (user) {
                    owner_string = 'existing user: ' + user.first_name + ' ' + user.last_name + ' (' + format_phone_number(user.phone_number) + ')';
                } else {
                    set_selected_order(order);
                    owner_string = 'phone number: '+ format_phone_number(order.phone_number);
                }
                cardForm.fields.cardNumber = false;
                set_field_state(_dom.cardNumberField, 'error', 
                    'Card number is in use and belongs to '+ owner_string +'.');
            }
            else if (card && user === null) {
                cardForm.fields.cardNumber = true;
                set_field_state(_dom.cardNumberField, 'success');
            } else {
                cardForm.fields.cardNumber = true;
                set_field_state(_dom.cardNumberField, '');
            }
            update_submit_button();
        }).fail(function(data) {
            cardForm.fields.cardNumber = false;
            set_field_state(_dom.cardNumberField, 'error', 
                'Cannot find card number in database.');
        });
    });

    /* User search as you type */
    _dom.query.on('input', function() {
        var val = _dom.query.val().trim();
        if(val.length <= 2) {
            _dom.results.html('');
            return;
        }
        if (searching) {
            searching.abort();
        }
        searching = $.getJSON(urls.userSearch, {search: val}, function(data) {
            if (data.results && data.results.length > 0) {
                sorted_results = sort_search_results(data.results);
                _dom.results.html(format_results(sorted_results));
                users = data.results;
            }
            else if (data.error) {
                _dom.results.html(data.error);
            }
            else {
                if(val !== "") {
                    _dom.results.html("Found no user matching: '"+ val +"'");
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
        if (number === '-') {
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
        if (selectedUser === null && membershipOrder === null) {
            payload.action = 'new_card_membership';
        } else if (selectedUser === null && membershipOrder !== null) {
            payload.action = 'sms_card_notify';
            payload.order_uuid = membershipOrder.uuid;
        } else {
            if (selectedUser.is_member) {
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
        }).done(function(data) {
            var success_message = 'New card registered ' + payload.card_number;
            if (payload.action === 'add_or_renew') {
                var full_name = selectedUser.first_name + ' ' + selectedUser.last_name;
                success_message = 'New membership and card number '+ payload.card_number + ' registered to ' + full_name + ' ';
            }
            else if (payload.action ==='new_card_membership') {
                success_message = 'New membership and card registered to ' + format_phone_number(payload.phone_number) + '. Activation SMS sent ';
            }
            else if (payload.action === 'sms_card_notify') {
                success_message = 'New card registered to ' + format_phone_number(payload.phone_number) + '. Membership already paid '+ membershipOrder.product.start_date +'. Activation SMS sent ';
            }
            set_toast(success_message + ' :-)', 'success');
            resetCardForm(true);

        }).fail(function(data) {
            console.log("failed", data);
            var error_text = data.responseText;
            if (data.responseJSON) {
                if (data.responseJSON.non_field_errors) {
                    error_text = data.responseJSON.non_field_errors.join('<br>');
                } else {
                    error_text = 'Not sure why. :-(';
                }
            }
            set_toast('Failed! '+ error_text, 'error');
        });
    });

    /* Membership renewal button */
    _dom.membershipSubmitButton.on('click', function(e) {
        e.preventDefault();
        if (!selectedUser && !membershipOrder) {
            set_toast('Computer says no.', 'error');
            return;
        }

        var payload = getFormData(_dom.registerCardForm);

        /* If order, make sure to bring along both card number and phone number */
        if (membershipOrder) {
            payload.card_number = membershipOrder.member_card;
            payload.phone_number = membershipOrder.phone_number;
        }

        $.ajax(urls.renewMembership, {
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            headers: {'X-CSRFToken': getCookie('csrftoken')}
        }).done(function(data) {
            var name = 'unknown';
            if (data.user) {
                name = selectedUser.first_name + ' ' + selectedUser.last_name;
            } else {
                name = 'phone number ' + data.phone_number;
            }
            var success_message = 'Membership renewed for ' + name + ' :-)';
            set_toast(success_message, 'success');
            resetCardForm(true);
        }).fail(function(data) {
            console.log("failed", data);
            var error_text = data.responseText;
            if (data.responseJSON) {
                if (data.responseJSON.non_field_errors) {
                    error_text = data.responseJSON.non_field_errors.join('<br>');
                } else {
                    error_text = 'Not sure why. :-(';
                }
            }
            set_toast('Failed! '+ error_text, 'error');
        });
    });

    /* On user id change */
    _dom.userIdField.on('change', function() {
        /* Render selected user in search form */
        render_selected_user(selectedUser);
    });
    /* On order uuid change */
    _dom.orderUuidField.on('change', function() {
        /* Render selected order */
        render_selected_order(membershipOrder);
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
    _dom.selectedEntityWrap.html(selected_user_html);

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

    $('[data-toggle="popover"]').popover({
        html: true,
        trigger: 'click'
    });
});