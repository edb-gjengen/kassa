import * as $ from 'jquery';
import moment from 'moment';
import nunjucks from 'nunjucks';
import debounce from 'lodash.debounce';
import sortBy from 'lodash.sortby';
import fromPairs from 'lodash.frompairs';

import 'bootstrap-sass/assets/javascripts/bootstrap/tooltip';
import 'bootstrap-sass/assets/javascripts/bootstrap/popover';

import './templates';
import './index.scss';

/* Init and global vars */
let _dom;
let users;
let searching; /* search ajax request */
let selectedUser = null;
let membershipOrder = null; /* selected order object */
const cardForm = {
  fields: {
    cardNumber: false,
    phoneNumber: false
  }
};
const STATE_ICON = {
  success: 'ok',
  warning: 'warning-sign',
  error: 'remove'
};
// TODO: replace with lodash template
const nunjucksEnv = new nunjucks.Environment();

const urls = {
  userSearch: '/user-search/',
  checkPhoneNumber: '/check-phone-number/',
  checkCard: '/check-card/',
  registerCardAndMembership: '/register-card-membership/',
  renewMembership: '/renew-membership/'
};

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = $.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function getParameterByName(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function formatPhoneNumber(str) {
  if (!str || str.length <= 1) {
    return 'No phone number';
  }
  if (str.length === 11) {
    return `${str.slice(0, 3)} ${str.slice(3, 6)} ${str.slice(6, 8)} ${str.slice(8)}`;
  }

  return str;
}

function sortSearchResults(results) {
  return sortBy(results, (x) => {
    if (x.last_membership) {
      if (x.last_membership.end_date) {
        return 0 - moment(x.last_membership.end_date).unix();
      }
      return 0 - moment(x.last_membership.start_date).unix();
    }
    return 0;
  });
}

function formatResults(results) {
  return nunjucksEnv.render('search_results.html', { results });
}

function renderSelectedUser(userData) {
  let context;
  if (!userData) {
    context = { placeholder: true }; // dummy card
  } else {
    context = { res: userData, checked: true, no_user_actions: true };
  }
  const selectedUserHtml = nunjucksEnv.render('search_result.html', context);
  _dom.selectedEntityWrap.html(selectedUserHtml);
}

function renderSelectedOrder(order) {
  if (!order) {
    return;
  }
  const context = { order, checked: true, no_user_actions: true };
  const selectedOrderHtml = nunjucksEnv.render('selected_order.html', context);
  _dom.selectedEntityWrap.html(selectedOrderHtml);
}

function setToast(message, messageType) {
  const context = {
    message,
    message_type: messageType,
    icon: STATE_ICON[messageType]
  };
  const html = nunjucksEnv.render('toast.html', context);
  _dom.toastWrap.html(html);
  _dom.toastWrap.addClass('visible');
  setTimeout(() => {
    _dom.toastWrap.removeClass('visible');
  }, 5000);
}

function updateMemberShipButton(user, order) {
  const todayPlusThirtyDays = moment()
    .add(30, 'days')
    .format('YYYY-MM-DD');
  /* User with valid membership */
  if (user && user.is_member) {
    /* ...which is lifelong cannot renew */
    if (user.last_membership.membership_type === 'lifelong') {
      _dom.membershipSubmitButton.prop('disabled', true);
    }
    /* ...or expiring soon and the user has a card */
    // else if (user.last_membership.end_date <= todayPlusThirtyDays && user.active_member_card) {

    // FIXME: ponas workaround 2019-12-17, block below commented out
    _dom.membershipSubmitButton.prop('disabled', false);

    /* ...with a membership that expires soon can renew */
    // else if (user.last_membership.end_date <= todayPlusThirtyDays) {
    //   _dom.membershipSubmitButton.prop('disabled', false);
    // }
  }
  /* User with expired membership can renew */
  // else if (user && !user.is_member && user.active_member_card) {
  else if (user && !user.is_member) {
    _dom.membershipSubmitButton.prop('disabled', false);
  } else if (order) {
    // FIXME: ponas workaround 2019-12-17, block below commented out
    _dom.membershipSubmitButton.prop('disabled', false);

    /* Order */
    /* If the membership has expired it can be renewed */
    // if (!order.product.is_valid && order.product.end_date <= todayPlusThirtyDays) {
    //   _dom.membershipSubmitButton.prop('disabled', false);
    // }
  } else {
    _dom.membershipSubmitButton.prop('disabled', true);
  }
}

function setSelectedUser(user, updateSearchResult) {
  selectedUser = user;
  updateMemberShipButton(user, null);

  _dom.userIdField.val((user && user.id) || '').trigger('change');
  if (updateSearchResult) {
    const staleSearchResult = _dom.results.find('.search-result').removeClass('selected');
    staleSearchResult.find('input').prop('checked', false);
    /* User is still in search result, mark selected */
    if (user && users && users.find(({ id }) => id === user.id)) {
      const searchResult = _dom.results.find(`[data-user-id="${user.id}"]`).toggleClass('selected');
      searchResult.find('input').prop('checked', true);
    }
  }
}

function setSelectedOrder(order) {
  membershipOrder = order;
  if (order) {
    updateMemberShipButton(null, order);
  }
  _dom.orderUuidField.val((order && order.uuid) || '').trigger('change');
}

function setFieldState(fieldElement, state, helpText) {
  if (!helpText) {
    helpText = '';
  }
  const helpSpan = `<span class="help-block ">${helpText}</span>`;
  const feedbackSpan = `<span class="glyphicon glyphicon-${STATE_ICON[state]} form-control-feedback" aria-hidden="true"></span>`;
  const cssClass = `has-${state}`;
  const formGroup = fieldElement.parent().parent();
  formGroup.removeClass('has-success has-warning has-error has-feedback'); // reset
  if (['success', 'warning', 'error'].indexOf(state) !== -1) {
    formGroup.addClass(`${cssClass} has-feedback`);
    /* Feedback icon */
    const feedbackEl = formGroup.find('.form-control-feedback');
    if (!feedbackEl.length) {
      // add
      formGroup.append(feedbackSpan);
    } else {
      // Update
      feedbackEl.removeClass('glyphicon-ok glypicon-warning-sign glyphicon-remove');
      feedbackEl.addClass(`glyphicon-${STATE_ICON[state]}`);
    }
    /* Help text */
    const helpTextEl = formGroup.find('.help-block');
    if (!helpTextEl.length) {
      formGroup.append(helpSpan);
    } else {
      helpTextEl.text(helpText);
    }
  } else {
    formGroup.find('.form-control-feedback').remove();
    formGroup.find('.help-block').remove();
  }
}
function resetCardForm(resetNative) {
  if (resetNative) {
    _dom.registerCardForm.get(0).reset();
  }
  /* Clear field states */
  setFieldState(_dom.phoneNumberField, '');
  cardForm.fields.phoneNumber = false;
  setFieldState(_dom.cardNumberField, '');
  cardForm.fields.cardNumber = false;
  selectedUser = null;
  membershipOrder = null;
  _dom.userIdField.val('').trigger('change');
  _dom.membershipTrialCheckBox.prop('checked', false);

  /* Disable submit buttons */
  _dom.registerSubmitButton.prop('disabled', true);
  _dom.membershipSubmitButton.prop('disabled', true);
}
function resetSearchForm(resetNative) {
  if (resetNative) {
    _dom.searchResetButton.get(0).reset();
  }
  /* Clear search results */
  users = null;
  _dom.results.html('');
}

function cardFormIsValid() {
  return Object.values(cardForm.fields).every((v) => v);
}

function updateSubmitButton() {
  if (cardFormIsValid()) {
    _dom.registerSubmitButton.prop('disabled', false);
    return;
  }
  _dom.registerSubmitButton.prop('disabled', true);
}
function validatePhoneNumber(val) {
  if (val.length === 0) {
    cardForm.fields.phoneNumber = false;
    updateSubmitButton();
    return 'Phone number should not be empty.';
  }
  cardForm.fields.phoneNumber = true;
  updateSubmitButton();
  return '';
}

function validateCardNumber(val) {
  if (val.length === 0) {
    cardForm.fields.cardNumber = false;
    updateSubmitButton();
    return 'Card number should not be empty.';
  }
  if (val.length > 0 && val[0] !== '1') {
    cardForm.fields.cardNumber = false;
    updateSubmitButton();
    return 'Card number should start with 1.';
  }
  if (val.length !== 9) {
    cardForm.fields.cardNumber = false;
    updateSubmitButton();
    return 'Card number should be 9 digits long.';
  }
  cardForm.fields.cardNumber = true;
  updateSubmitButton();
  return '';
}

function getFormData(formElement) {
  let formData = formElement.serializeArray();
  formData = fromPairs(
    formData.map((x) => {
      return [x.name, x.value || null];
    })
  );
  /* no need for radio button state */
  delete formData.user;

  return formData;
}

/* Phone number as you type */
function checkPhoneNumber() {
  const val = _dom.phoneNumberField.val().trim();
  $.getJSON(urls.checkPhoneNumber, { phone_number: val }, (data) => {
    /* Invalid phone number? */
    if (data.error) {
      setSelectedUser(null, true);
      setSelectedOrder(null);
      setFieldState(_dom.phoneNumberField, 'error', data.error);
      cardForm.fields.phoneNumber = false;
      updateSubmitButton();
      return;
    }

    const { user } = data;
    const { order } = data;
    let message = '';

    /* Has valid card membership */
    if (!user && order && order.member_card && order.product.is_valid) {
      message = `Phone number is already tied to card ${order.member_card} and is valid until ${order.product.end_date}.`;
      setFieldState(_dom.phoneNumberField, 'error', message);
      cardForm.fields.phoneNumber = false;
      setSelectedOrder(order);
      updateSubmitButton();
      return;
    }

    if (user) {
      /* Existing user */
      message = 'Phone number belongs to existing user.';
      setFieldState(_dom.phoneNumberField, 'success', message);
      setSelectedUser(user, true);
      setSelectedOrder(null);
      cardForm.fields.phoneNumber = true;
      updateSubmitButton();
    } else if (order) {
      setSelectedOrder(order);
      /* Valid membership, no card associated */
      if (order.product.is_valid) {
        message = 'Phone number has a valid membership.';
      } else {
        message = 'Phone number has an expired membership.';
      }
    } else {
      /* Valid phone number associated user or order */
      setSelectedOrder(null);
      setSelectedUser(null);
    }

    setFieldState(_dom.phoneNumberField, 'success', message);
    cardForm.fields.phoneNumber = true;
    updateSubmitButton();
  });
}

/* Add filter |phoneNumber */
nunjucksEnv.addFilter('phoneNumber', formatPhoneNumber);

/* On document ready */
$(document).ready(function() {
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

  const lazyCheckPhoneNumber = debounce(checkPhoneNumber, 250);
  _dom.phoneNumberField.on('input', (e) => {
    const val = e.target.value.trim();
    const validationMsg = validatePhoneNumber(val);
    if (validationMsg !== '') {
      setSelectedUser(null, true);
      setFieldState(_dom.phoneNumberField, 'error', validationMsg);
      return;
    }
    lazyCheckPhoneNumber();
  });
  /* Card number as you type */
  _dom.cardNumberField.on('input', (e) => {
    /* Card number should exist in the database and not tied to existing user */
    const val = e.target.value.trim();
    const validationMsg = validateCardNumber(val);
    if (validationMsg !== '') {
      setFieldState(_dom.cardNumberField, 'error', validationMsg);
      return;
    }
    $.getJSON(urls.checkCard, { card_number: val }, (data) => {
      if (data.error) {
        updateSubmitButton();
        cardForm.fields.cardNumber = false;
        setFieldState(_dom.cardNumberField, 'error', data.error);
        return;
      }

      const card = data;
      const { user } = data;
      const { order } = data;
      // const todayPlusThirtyDays = moment().add(30, 'days');

      if (!card) {
        cardForm.fields.cardNumber = false;
        setFieldState(_dom.cardNumberField, 'error', 'Cannot find card number in database.');
      } else if (card && card.registered !== null && user === null && order && !order.product.is_valid) {
        /* An already registered card (with no user) can repurchase membership if expired */
        setSelectedOrder(order);
        cardForm.fields.cardNumber = true;
        setFieldState(
          _dom.cardNumberField,
          'success',
          `Card number is in use (not activated) and belongs to ${formatPhoneNumber(order.phone_number)}.`
        );
      } else if (card && card.registered !== null) {
        let ownerString = '???';
        if (user) {
          ownerString = `existing user: ${user.first_name} ${user.last_name} (${formatPhoneNumber(user.phone_number)})`;
        } else {
          setSelectedOrder(order);
          ownerString = `phone number: ${formatPhoneNumber(order.phone_number)}`;
        }
        cardForm.fields.cardNumber = false;
        setFieldState(_dom.cardNumberField, 'error', `Card number is in use and belongs to ${ownerString}.`);
      } else if (card && user === null) {
        cardForm.fields.cardNumber = true;
        setFieldState(_dom.cardNumberField, 'success');
      } else {
        cardForm.fields.cardNumber = true;
        setFieldState(_dom.cardNumberField, '');
      }
      updateSubmitButton();
    }).fail(() => {
      cardForm.fields.cardNumber = false;
      setFieldState(_dom.cardNumberField, 'error', 'Cannot find card number in database.');
    });
  });

  /* User search as you type */
  _dom.query.on('input', () => {
    const val = _dom.query.val().trim();
    if (val.length <= 2) {
      _dom.results.html('');
      return;
    }
    if (searching) {
      searching.abort();
    }
    searching = $.getJSON(urls.userSearch, { search: val }, (data) => {
      if (data.results && data.results.length > 0) {
        const sortedResults = sortSearchResults(data.results);
        _dom.results.html(formatResults(sortedResults));
        users = data.results;
      } else if (data.error) {
        _dom.results.html(data.error);
      } else if (val !== '') {
        _dom.results.html(`Found no user matching: '${val}'`);
      } else {
        _dom.results.html('');
      }
    });
  });

  /* On search result click */
  _dom.results.on('click', '.search-result input', () => {
    const label = $(this).parent();
    let number = label.attr('data-phone-number');
    const userId = label.attr('data-user-id');

    /* Update selected state */
    $('.search-result').removeClass('selected');
    label.toggleClass('selected');

    setSelectedUser(users.find(({ id }) => id === userId));

    /* Update phone number field */
    if (number === '-') {
      number = '';
    }
    _dom.phoneNumberField.val(number).trigger('input');
  });
  /* On submit button click */
  _dom.registerSubmitButton.on('click', (e) => {
    e.preventDefault();

    if (!cardFormIsValid()) {
      setToast('Either phone number or card number is not valid', 'error');
      return;
    }
    const payload = getFormData(_dom.registerCardForm);

    /* Register type */
    // FIXME: get from form
    // action: 'new_card_membership', 'update_card', 'add_or_renew', 'sms_card_notify'
    if (selectedUser === null && membershipOrder === null) {
      // Unknown phone / card, new membership
      payload.action = 'new_card_membership';
    } else if (selectedUser === null && membershipOrder !== null) {
      if (membershipOrder.member_card === null && membershipOrder.product.is_valid) {
        // Associate member card with a valid membership order
        payload.action = 'sms_card_notify';
        payload.order_uuid = membershipOrder.uuid;
      } else {
        // New card for expired order -- treat as new card membership
        payload.action = 'new_card_membership';
      }
    } else if (selectedUser !== null && selectedUser.is_member) {
      // Add member card to a user
      payload.action = 'update_card';
    } else {
      // New order for user
      payload.action = 'add_or_renew'; // Note: could also update card number
    }
    $.ajax(urls.registerCardAndMembership, {
      data: JSON.stringify(payload),
      contentType: 'application/json',
      dataType: 'json',
      type: 'post',
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
      .done(() => {
        let successMessage = `New card registered ${payload.card_number}`;
        if (payload.action === 'add_or_renew') {
          const fullName = `${selectedUser.first_name} ${selectedUser.last_name}`;
          successMessage = `New membership and card number ${payload.card_number} registered to ${fullName} `;
        } else if (payload.action === 'new_card_membership') {
          successMessage = `New membership and card registered to ${formatPhoneNumber(
            payload.phone_number
          )}. Activation SMS sent `;
        } else if (payload.action === 'sms_card_notify') {
          successMessage = `New card registered to ${formatPhoneNumber(
            payload.phone_number
          )}. Membership already paid ${membershipOrder.product.start_date}. Activation SMS sent `;
        }
        setToast(`${successMessage} :-)`, 'success');
        resetCardForm(true);
      })
      .fail((data) => {
        console.log('failed', data);
        let errorText = data.responseText;
        if (data.responseJSON) {
          if (data.responseJSON.non_field_errors) {
            errorText = data.responseJSON.non_field_errors.join('<br>');
          } else {
            errorText = 'Not sure why. :-(';
          }
        }
        setToast(`Failed! ${errorText}`, 'error');
      });
  });

  /* Membership renewal button */
  _dom.membershipSubmitButton.on('click', (e) => {
    e.preventDefault();
    if (!selectedUser && !membershipOrder) {
      setToast('Computer says no.', 'error');
      return;
    }

    const payload = getFormData(_dom.registerCardForm);

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
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
      .done((data) => {
        let name = 'unknown';
        if (data.user) {
          name = `${selectedUser.first_name} ${selectedUser.last_name}`;
        } else {
          name = `phone number ${data.phone_number}`;
        }
        const successMessage = `Membership renewed for ${name} :-)`;
        setToast(successMessage, 'success');
        resetCardForm(true);
      })
      .fail((data) => {
        console.log('failed', data);
        let errorText = data.responseText;
        if (data.responseJSON) {
          if (data.responseJSON.non_field_errors) {
            errorText = data.responseJSON.non_field_errors.join('<br>');
          } else {
            errorText = 'Not sure why. :-(';
          }
        }
        setToast(`Failed! ${errorText}`, 'error');
      });
  });

  /* On user id change */
  _dom.userIdField.on('change', function() {
    /* Render selected user in search form */
    renderSelectedUser(selectedUser);
  });
  /* On order uuid change */
  _dom.orderUuidField.on('change', function() {
    /* Render selected order */
    renderSelectedOrder(membershipOrder);
  });
  /* Reset buttons */
  _dom.registerResetButton.on('click', function() {
    resetCardForm();
  });
  _dom.searchResetButton.on('click', function() {
    resetSearchForm();
  });

  /* Ninja add some icons to bootstrap form */
  const iconMobile =
    '<span class="input-group-addon"><span class="glyphicon glyphicon-phone glyphicon-phone-large"></span></span>';
  _dom.phoneNumberField.parent().addClass('input-group');
  _dom.phoneNumberField.before(iconMobile);

  /* Render initial placeholder user */
  const selectedUserHtml = nunjucksEnv.render('search_result.html', { placeholder: true });
  _dom.selectedEntityWrap.html(selectedUserHtml);

  /* Initial focus */
  if (_dom.usernameField) {
    _dom.usernameField.focus();
  }

  /* Load query params */
  if (getParameterByName('user_id')) {
    _dom.userIdField.val(getParameterByName('user_id')).trigger('change');
  }
  if (getParameterByName('phone_number')) {
    _dom.phoneNumberField.val(getParameterByName('phone_number')).trigger('input');
  }
  if (getParameterByName('card_number')) {
    _dom.cardNumberField.val(getParameterByName('card_number')).trigger('input');
  }

  $('[data-toggle="popover"]').popover({
    html: true,
    trigger: 'click'
  });
});
