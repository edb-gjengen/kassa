/* eslint-disable */
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search_result.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
if(!runtime.contextOrFrameLookup(context, frame, "placeholder")) {
output += "\n    <label for=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"id"), env.opts.autoescape);
output += "\" data-phone-number=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"phone_number"), env.opts.autoescape);
output += "\" data-user-id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"id"), env.opts.autoescape);
output += "\" class=\"list-group-item search-result can-register-card";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_member")) {
output += " member";
;
}
else {
output += " not-member";
;
}
output += "\">\n    <input type=\"radio\" name=\"user\" id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"id"), env.opts.autoescape);
output += "\"";
if(runtime.contextOrFrameLookup(context, frame, "checked")) {
output += " checked";
;
}
output += ">\n    <div class=\"name\">\n        <span class=\"glyphicon glyphicon-user\"></span> ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"first_name"), env.opts.autoescape);
output += " ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"last_name"), env.opts.autoescape);
output += "\n    </div>\n    <!-- Phone number -->\n    <div class=\"phone-number\"><span class=\"glyphicon glyphicon-phone\"></span> ";
output += runtime.suppressValue(env.getFilter("phoneNumber").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"phone_number")), env.opts.autoescape);
output += "</div>\n    <div class=\"labels\">\n        <!-- Membership -->\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_member") == true) {
output += "\n            <span class=\"label label-success\">Member: ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"last_membership")),"end_date") || "Lifelong", env.opts.autoescape);
output += "</span>\n        ";
;
}
else {
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"last_membership") == null) {
output += "\n            <span class=\"label label-default\">Registered</span>\n        ";
;
}
else {
output += "\n            <span class=\"label label-warning\">Expired: ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"last_membership")),"end_date"), env.opts.autoescape);
output += "</span>\n        ";
;
}
;
}
output += "\n        <!-- Card -->\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"active_member_card")) {
output += "\n            <span class=\"label label-card label-card-yes\"><span class=\"card-icon\"></span> ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"active_member_card")),"card_number"), env.opts.autoescape);
output += "</span>\n        ";
;
}
else {
output += "\n            <span class=\"label label-card label-card-no\"><span class=\"card-icon\"></span> No card</span>\n        ";
;
}
output += "\n        <!-- Is volunteer -->\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_volunteer")) {
output += "\n            <span class=\"label label-is-volunteer\">Volunteer</span>\n        ";
;
}
output += "\n    </div>\n    ";
if(!runtime.contextOrFrameLookup(context, frame, "no_user_actions")) {
output += "\n        <div class=\"user-actions\">\n            <div class=\"btn-group\">\n                <!--<a href=\"#\" class=\"btn btn-default";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_member") == "1") {
output += " disabled";
;
}
output += "\">Membership</a>\n                <a href=\"#\" class=\"btn btn-default\">Reg. card</a>-->\n                <div class=\"btn-group\" role=\"group\">\n                    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                        <span class=\"glyphicon glyphicon-option-vertical\"></span>\n                    </button>\n                    <ul class=\"dropdown-menu\">\n                        <li><a href=\"https://inside.studentersamfundet.no/index.php?page=display-user&userid=";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"id"), env.opts.autoescape);
output += "\" target=\"_blank\">Edit in Inside</a></li>\n                    </ul>\n              </div>\n            </div>\n        </div>\n    ";
;
}
output += "\n    </label>\n";
;
}
else {
output += "\n    <!-- Placeholder -->\n    <div class=\"list-group-item search-result placeholder\">\n        <div class=\"name\">\n            <input type=\"radio\" name=\"user\" checked>\n            <span class=\"glyphicon glyphicon-user\"></span> <em>New member</em>\n        </div>\n        <div class=\"phone-number\"><span class=\"glyphicon glyphicon-phone\"></span> ";
output += runtime.suppressValue(env.getFilter("phoneNumber").call(context, runtime.contextOrFrameLookup(context, frame, "number")), env.opts.autoescape);
output += "</div>\n        <div class=\"labels\">\n            <span class=\"label label-card\"><span class=\"card-icon\"></span> New card</span>\n        </div>\n    </div>\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search_results.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"list-group\">\n    ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("res", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n        ";
var tasks = [];
tasks.push(
function(callback) {
env.getTemplate("search_result.html", false, "search_results.html", false, function(t_6,t_5) {
if(t_6) { cb(t_6); return; }
callback(null,t_5);});
});
tasks.push(
function(template, callback){
template.render(context.getVariables(), frame, function(t_8,t_7) {
if(t_8) { cb(t_8); return; }
callback(null,t_7);});
});
tasks.push(
function(result, callback){
output += result;
callback(null);
});
env.waterfall(tasks, function(){
output += "\n    ";
});
}
}
frame = frame.pop();
output += "\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["selected_order.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"list-group-item search-result entity-type-order\">\n    <div class=\"name\">\n        <input type=\"radio\" name=\"user\" checked>\n        <span class=\"glyphicon glyphicon-user\"></span> <em>Unregistered member</em>\n    </div>\n    <div class=\"phone-number\"><span class=\"glyphicon glyphicon-phone\"></span> ";
output += runtime.suppressValue(env.getFilter("phoneNumber").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "order")),"phone_number")), env.opts.autoescape);
output += "</div>\n    <div class=\"labels\">\n        <!-- Membership -->\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "order")),"product")),"is_valid") == true) {
output += "\n            <span class=\"label label-success\">Member: ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "order")),"product")),"end_date") || "Lifelong", env.opts.autoescape);
output += "</span>\n        ";
;
}
else {
output += "\n            <span class=\"label label-warning\">Expired: ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "order")),"product")),"end_date"), env.opts.autoescape);
output += "</span>\n        ";
;
}
output += "\n        <!-- Card -->\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "order")),"member_card")) {
output += "\n            <span class=\"label label-card label-card-yes\"><span class=\"card-icon\"></span> ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "order")),"member_card"), env.opts.autoescape);
output += "</span>\n        ";
;
}
else {
output += "\n            <span class=\"label label-card label-card-no\"><span class=\"card-icon\"></span> No card</span>\n        ";
;
}
output += "\n    </div>\n</div>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["toast.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<span class=\"toast-";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "message_type"), env.opts.autoescape);
output += "\"><span class=\"glyphicon glyphicon-";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "icon"), env.opts.autoescape);
output += "\"></span> ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "message"), env.opts.autoescape);
output += "</span>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

