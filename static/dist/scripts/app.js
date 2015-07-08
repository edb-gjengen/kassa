function format_results(results) {
    var html = '<div class="list-group">';
    for(var i=0; i< results.length; i++) {
        var res = results[i];

        var label = '';
        var is_member = res.is_member && res.is_member === "1";
        var add_to_button = '';
        var css_classes = 'list-group-item search-result';
        var expires = res.expires;

        if(is_member) {
            label = ' <span class="label label-success">Member</span> ';
            css_classes += ' member';
        } else if(expires === '0000-00-00') {
            add_to_button = '<input type="radio" name="random" id="'+res.id+'"> ';
            label = ' <span class="label label-default">Registered</span> ';
            css_classes += ' registered';
        } else {
            add_to_button = '<input type="radio" name="random" id="'+res.id+'"> ';
            label = ' <span class="label label-warning">Expired: '+ expires +'</span> ';
            css_classes += ' expired';
        }

        if(is_member) {
            html += '<div class="'+css_classes+'">' + add_to_button + res.firstname + ' ' + res.lastname + label + '</div>';
        } else {
            html += '<label for="'+ res.id +'" data-phone-number="'+ res.number +'" class="'+css_classes+'">' + add_to_button + res.firstname + ' ' + res.lastname + label + '</label>';
        }
    }
    return html + '</div>';
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