(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search_result.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
if(!runtime.contextOrFrameLookup(context, frame, "placeholder")) {
output += "\n    ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"card_number_active", env.opts.autoescape)) {
output += "\n        <label for=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"id", env.opts.autoescape), env.opts.autoescape);
output += "\" data-phone-number=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"number", env.opts.autoescape), env.opts.autoescape);
output += "\" data-user-id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"id", env.opts.autoescape), env.opts.autoescape);
output += "\" class=\"list-group-item search-result can-register-card";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_member", env.opts.autoescape) == "1") {
output += " member";
;
}
else {
output += " not-member";
;
}
output += "\">\n    ";
;
}
else {
output += "\n        <!-- Has card -->\n        <div class=\"list-group-item search-result has-card";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_member", env.opts.autoescape)) {
output += " member";
;
}
else {
output += "not-member";
;
}
output += "\">\n    ";
;
}
output += "\n    <div class=\"name\">\n        ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"card_number_active", env.opts.autoescape)) {
output += "\n            <input type=\"radio\" name=\"user\" id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"id", env.opts.autoescape), env.opts.autoescape);
output += "\"";
if(runtime.contextOrFrameLookup(context, frame, "checked")) {
output += " checked";
;
}
output += ">\n        ";
;
}
output += "\n        <!-- Name -->\n        <span class=\"glyphicon glyphicon-user\"></span> ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"firstname", env.opts.autoescape), env.opts.autoescape);
output += " ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"lastname", env.opts.autoescape), env.opts.autoescape);
output += "\n    </div>\n    <!-- Phone number -->\n    <div class=\"phone-number\"><span class=\"glyphicon glyphicon-phone\"></span> ";
output += runtime.suppressValue(env.getFilter("phoneNumber").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"number", env.opts.autoescape)), env.opts.autoescape);
output += "</div>\n    <div class=\"labels\">\n        <!-- Membership -->\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_member", env.opts.autoescape) == "1") {
output += "\n            <span class=\"label label-success\">Member: ";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"expires", env.opts.autoescape),"Lifelong"), env.opts.autoescape);
output += "</span>\n        ";
;
}
else {
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"expires", env.opts.autoescape) == "0000-00-00") {
output += "\n            <span class=\"label label-default\">Registered</span>\n        ";
;
}
else {
output += "\n            <span class=\"label label-warning\">Expired: ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"expires", env.opts.autoescape), env.opts.autoescape);
output += "</span>\n        ";
;
}
;
}
output += "\n        <!-- Card -->\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"card_number_active", env.opts.autoescape) && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"card_is_legacy", env.opts.autoescape) != "") {
output += "\n            <span class=\"label label-card label-card-yes\"><span class=\"glyphicon glyphicon-ok\"></span> ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"card_number_active", env.opts.autoescape), env.opts.autoescape);
output += "</span>\n        ";
;
}
else {
output += "\n            <span class=\"label label-card label-card-no\"><span class=\"glyphicon glyphicon-remove\"></span> No card</span>\n        ";
;
}
output += "\n        <!-- Is active -->\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"is_active", env.opts.autoescape) == "1") {
output += "\n            <span class=\"label label-is-active\">Active</span>\n        ";
;
}
output += "\n    </div>\n    ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "res")),"card_number_active", env.opts.autoescape)) {
output += "\n        <div class=\"selected-icon\"><span class=\"glyphicon glyphicon-ok\"></span></div>\n        </label>\n    ";
;
}
else {
output += "\n        </div>\n    ";
;
}
output += "\n";
;
}
else {
output += "\n    <!-- Placeholder -->\n    <div class=\"list-group-item search-result placeholder\">\n        <input type=\"radio\" name=\"user\" checked>\n        <span class=\"glyphicon glyphicon-user\"></span> <em>New member</em>\n        <div class=\"phone-number\"><span class=\"glyphicon glyphicon-phone\"></span> ";
output += runtime.suppressValue(env.getFilter("phoneNumber").call(context, runtime.contextOrFrameLookup(context, frame, "number")), env.opts.autoescape);
output += "</div>\n        <div class=\"labels\">\n            <span class=\"label label-card\">New card</span>\n        </div>\n    </div>\n";
;
}
cb(null, output);
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

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["search_results.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"list-group\">\n    ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
if(t_3) {var t_2 = t_3.length;
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
env.getTemplate("search_result.html", false, "search_results.html", function(t_7,t_5) {
if(t_7) { cb(t_7); return; }
t_5.render(context.getVariables(), frame.push(), function(t_8,t_6) {
if(t_8) { cb(t_8); return; }
output += t_6
output += "\n    ";
})});
}
}
frame = frame.pop();
output += "\n</div>";
cb(null, output);
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

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["toast.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<span class=\"toast-";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "message_type"), env.opts.autoescape);
output += "\"><span class=\"glyphicon glyphicon-";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "icon"), env.opts.autoescape);
output += "\"></span> ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "message"), env.opts.autoescape);
output += "</span>";
cb(null, output);
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
