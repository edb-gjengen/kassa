$(document).ready( function() {
    /* Slide: Product calculator */
    /*
     * TODO: set discount based on url or user/session data
     *
     * */
    function set_progress(percent) {
        if( percent < 1 || percent > 100 ) {
            return;
        }
        $(".stb-progress .meter").css('width', percent+"%");
    }
    function product_select(products, treatments, counceling) {
        /* Searches products and returns the correct price */
        //console.log(products, treatments, counceling);
        var selected = products;
        if(counceling !== undefined) {
            selected = _.filter(selected, function(product) {
                return product.counceling_service == counceling;
            });
        }
        if(selected.length == 1) {
            return selected[0];
        }
        if(treatments !== undefined) {
            selected = _.filter(selected, function(product) {
                return product.treatments == treatments;
            });
        }
        if(selected.length == 1) {
            return selected[0];
        }
        //console.log("Fant ingen produkter, returnerer siste");
        return products[products.length-1];
    }
    //function filter_product_risk(documents, product_order) {
    //    /* filter based on product risk variables */
    //    var product_risk_variable_attrs = [
    //        'eligible_industry_discount',
    //        'has_existing_insurance',
    //        'employees',
    //        'addon_psychiatric_treatment'];

    //    /* which variables are set? */
    //    var product_risk_variables = _.filter(product_risk_variable_attrs, function(attr) {
    //        return product_order[attr] !== undefined;
    //    });
    //    //console.log("product risk variables: ", product_risk_variables);

    //    /* filter based on vars in product_risk_variables and product_order
    //     * all must match */
    //    documents = _.filter(documents, function(doc){
    //        //console.log("looking at: ", doc.name, "(", doc.id, ")");
    //        // filter when not specified
    //        if(!doc.product_risk_variables.length) {
    //            return false;
    //        }

    //        /* Loop over the product_risks attached to this document */
    //        var doc_matches = _.map(doc.product_risk_variables, function(variables, index, list) {
    //            /* Loop over each variable in the list of risks */
    //            var var_matches = _.map(product_risk_variables, function(element) {
    //                //console.log("looping document risk vars: ", element, product_order[element], variables[element], variables);
    //                // num employees special case 
    //                if(element == 'employees' && (product_order[element] > variables['employees_max'] || product_order[element] < variables['employees_min'])) {
    //                    return false
    //                }
    //                else if(product_order[element] != variables[element] && element != 'employees') {
    //                    return false; // drop document
    //                }
    //                return true;
    //            });
    //            // All attributes in the product_order must match with variables
    //            return _.every(var_matches);
    //        });
    //        // Need just one match to keep the document
    //        return _.some(doc_matches);
    //    });
    //    return documents;
    //}
    //function filter_individual_risk(documents, product_order) {
    //    //console.log("individual risk variables: ", product_order.individual_term_employees);
    //    /* Filter based on age ranges */
    //    var ages = _.map(product_order.individual_term_employees, function(employee) {
    //        return employee.age;
    //    });
    //    /* Filter documents not referencing at least one individual risk variable matching the specified ages */
    //    documents = _.filter(documents, function(doc) {
    //        // filter when not specified
    //        // Note: Unsure if this is correct
    //        if(!doc.employee_risk_variables.length) { 
    //            return false;
    //        }
    //        var matches = _.map(doc.employee_risk_variables, function(variables, index, list) {
    //            var age_matches = _.map(ages, function(age) {
    //                return age >= variables.age_min && age <= variables.age_max;
    //            });
    //            return _.some(age_matches); // matching at least one age
    //        });
    //        return _.some(matches); //matching at least one risk variable
    //    });
    //    return documents;
    //}
    //function filter_documents(documents, product_order) {
    //    /* Filter based on product selection
    //     * Note: only filters by product if below 100 employees */
    //    if(product_order.employees < 100) { 
    //        var documents = _.filter(documents, function(doc){
    //            var product_ids = _.map(doc.products, function(product) { return product.id; });
    //            return _.contains(product_ids, product_order.product.id);
    //        });

    //        if(product_order.employees >=1 && product_order.employees <= 4 && !product_order.eligible_industry_discount) {
    //            documents = filter_individual_risk(documents, product_order);
    //        }
    //        else {
    //            documents = filter_product_risk(documents, product_order);
    //        }
    //    } else {
    //        /* Filter based on dummy no-product */
    //        documents = _.filter(documents, function(doc){
    //            var product_slugs = _.map(doc.products, function(product) { return product.slug; });
    //            return _.contains(product_slugs, 'no-product');
    //        });
    //        
    //    }
    //    return documents;
    //    
    //}
    //function update_document_list(documents) {
    //    if(documents.length == 0) {
    //        $(".product-calculator .documents-table").html("Fillern, det er ingen dokumenter knyttet til dette produktet og valgte variable :'(");
    //        return;
    //    }
    //    var html = "<table><thead><tr><th>Navn</th><th>Type</th></tr></thead><tbody>";
    //    _.each(documents, function(doc) {
    //        html += '<tr><td><a href="'+ doc.url +'"><i class="icon-download-alt"></i> '+ doc.name +'</a></td><td>'+ doc.category +'</td></tr>';
    //    });
    //    html += "</tbody></table>";
    //    $(".product-calculator .documents-table").html(html);
    //}
    function get_price_individual(product, product_order) {
        /* Need a valid product */
        if(product === undefined || product.employee_risk_variables.length === 0) {
            return -1;
        }
        /* Invidual risk */
        var has_existing_insurance = false;
        if( product_order.has_existing_insurance !== undefined) {
            has_existing_insurance = product_order.has_existing_insurance;
        }
        /* Get list of prices for each employee */
        var prices = _.map(product_order.individual_term_employees, function(employee) {
            /* Filter by employee-age */
            var variation = _.find(product.employee_risk_variables, function(variation) {
                if(employee.age >= variation.age_min && employee.age <= variation.age_max) {
                    return true;
                }
                return false;
            });
            return variation.price;
        });
        return prices;
    }

    function get_price(product, product_order) {
        /* Group risk */
        var price = 0;
        var has_existing_insurance = false;
        if( product_order.has_existing_insurance !== undefined) {
            has_existing_insurance = product_order.has_existing_insurance;
        }

        /* Filter by boolean values */
        var variations = _.where(product.product_risk_variables, {
            eligible_industry_discount: product_order.eligible_industry_discount,
            has_existing_insurance: has_existing_insurance,
        });
        /* Filter by num employees */
        variation = _.filter(variations, function(variation) {
            if(variation.employees_max == product_order.employees ) {
                return true;
            }
        });
        if(variation.length >= 1) {
            price = parseInt(variation[0].price);
        } else {
            /* Error: Missing product data in db */
            price = -1;
        }
        /* include price for psychiatric treatment addon */
        // FIXME price is static.
        if(product_order.addon_psychiatric_treatment !== undefined && product_order.addon_psychiatric_treatment) {
            price += 204;
        }
        
        return price;
    }
    function product_recalc(products, product_order) {
        var product = product_select(
                products,
                product_order.treatments,
                product_order.counceling);

        /* calculate price based in product and current risk data */
        var price_formatted;

        if(product_order.employees <= 4 && ! product_order.eligible_industry_discount) {
            var prices = get_price_individual(product, product_order);
            var sum = _.reduce(prices, function(memo, num) { return memo + parseInt(num); }, 0);
            if(sum === 0) {
                price_formatted = "Prøv andre valg, ingen pris funnet.";
            } else {
                if(prices.length == 1) {
                    price_formatted = "NOK " + sum + ",- per måned";
                } else {
                    price_formatted = prices.join(" + ")+" = NOK " + sum + ",- per måned";
                }
            }
        } else {
            price = get_price(product, product_order);
            if(price == -1) {
                price_formatted = "Prøv andre valg, ingen pris funnet.";
            } else {
                price_formatted = "NOK " + price + ",- per år";
            }
        }
        product_order.product = product;
        $("[data-prodcalc-product]").text(product.name);
        $("[data-prodcalc-product-price]").text(price_formatted);
    }
    //function update_relevant_documents(product_order) {

    //    var url = $(".product-calculator[data-documents-url]").attr('data-documents-url');
    //    $.ajax({
    //        url: url,
    //        method: 'GET',
    //        dataType: 'json',
    //        headers: {
    //            'X-CSRFToken': $("[name=csrfmiddlewaretoken]").val()
    //        },
    //        success: function(documents) {
    //            /* Present only the right documents, ordered by category */
    //            //console.log("fetched the following documents:", documents);
    //            //console.log("filtering based on product_order", product_order);

    //            var less_documents = filter_documents(documents, product_order);
    //            //console.log("returned these documents:", less_documents);
    //            update_document_list(less_documents);
    //        }
    //    });
    //}

    if($(".product-calculator").length) {
        /* product_order stores the state of the order */
        var product_order = {};
        var product_order_steps = {};
        var num_product_order_steps = 6;

        /* Is the industry discount disabled? */
        if ( $('.product-calculator[data-disable-industry-discount]').length ) {
            product_order.eligible_industry_discount = false;
            $("[data-key=treatments][data-value=5]").show();
        }

        /* General layout of steps when user interacts with page:
         * - update product_order state
         * - update progress based on state 
         * - update the dom with the correct display state (button state, step description)
         * - find product based on selection
         * - calculate price based on discounts, selection and product
         */
   
        $.getJSON('/products.json', function(products) {
            /* Attach to buttons and fields */

            /* On every answer change */
            $("[data-answer]").on('click', function(e) {
                var key = $(this).attr('data-key');
                var value = $(this).attr('data-value');

                /* to_javascript */
                if (value == "no") {
                    value = false;
                }
                else if(value == "yes") {
                    value = true;
                }
                if(key == "treatments" || key == "employees") {
                    value = parseInt(value);
                }

                /* limit options and change display */
                /* based on employees */
                if(key == "employees") {
                    if( value >= 20) {
                        if(product_order.has_exisiting_insurance === undefined) {
                            $(".modal-has-existing-insurance").foundation('reveal', 'open');
                        }
                    } else {
                        /* Reset answer */
                        delete product_order.has_exisiting_insurance;
                        $(".modal-has-existing-insurance button").removeClass("selected disabled");
                    }

                    var min_value = $(this).attr('data-min');
                    /* if between 1 and 4 then.. */
                    if( value <= 4 && min_value >= 1 && !product_order.eligible_industry_discount) {
                        /* display individual employee risk container */
                        $(".individual-pricing-container").fadeIn('fast');
                        /* Note: Fetching employee ages before anyone have been selected */
                        update_employee_ages();
                    } else {
                        $(".individual-pricing-container").fadeOut('fast');
                        $("[data-key=treatments][data-value=12]").show();
                    }
                    /* Next button */
                    $("[data-goto-part=part-two]").fadeIn('fast');
                }
                /* based on industry deal */
                if(key == "eligible_industry_discount") {
                    if(value) {
                        /* limit num treatments*/
                        $("[data-key=treatments][data-value=5]").hide();
                    } else {
                        $("[data-key=treatments][data-value=5]").show();
                    }
                    if( !value && product_order.employees <= 4 && product_order.employees >= 1) {
                        $(".individual-pricing-container").fadeIn('fast');
                    } else {
                        $(".individual-pricing-container").fadeOut('fast');
                    }

                    $(".prod-num-staff").fadeIn('fast');
                    $(".part-one-zero").fadeOut('fast');
                    setTimeout(function() {
                        $(".part-one-one").fadeIn('fast');
                    }, 400);
                }
                /* based on counceling */
                if(key == "counceling") {
                    $(".prod-num-treatments").fadeIn('fast');
                    $(".about-num-treatments").fadeIn('fast');
                    if(value) {
                        /* limit num treatments and auto-select 24 */
                        $("[data-key=treatments][data-value=5], [data-key=treatments][data-value=0]").hide();
                        product_order.treatments = 24;
                        product_order_steps.treatments = 24;
                        $("[data-key=treatments]").removeClass("selected disabled");
                        $("[data-key=treatments][data-value=24]").addClass("selected");
                        /* update coverage */
                        $(".coverage-treatments").text(product_order.treatments);
                        $(".selected-coverage .topp, .selected-coverage .treatments").fadeIn('fast');
                    } else {
                        /* show all treatments, except 0 if industry deal */
                        if( !product_order.eligible_industry_discount ) {
                            $("[data-key=treatments][data-value=5]").show();
                        }
                        // FIXME: missing pricing data, just hide this option for now
                        if(product_order.employees <= 4) {
                            $("[data-key=treatments][data-value=0]").hide();
                        } else {
                            $("[data-key=treatments][data-value=0]").show();
                        }
                        $(".selected-coverage .topp").fadeOut('fast');
                    }
                }
                /* based on addon_psychiatric_treatment */
                if(key == "addon_psychiatric_treatment") {
                    $(".prod-num-treatments").fadeIn('fast');
                    $(".about-num-treatments").fadeIn('fast');
                    $(".selected-coverage .counceling").fadeOut('fast');
                    if(value) {
                        /* limit num treatments and auto-select 24 */
                        $("[data-key=treatments][data-value=0]").hide();
                        product_order.treatments = 24;
                        product_order_steps.treatments = 24;
                        $("[data-key=treatments]").removeClass("selected disabled");
                        $("[data-key=treatments][data-value=24]").addClass("selected");
                        /* update coverage */
                        $(".coverage-treatments").text(product_order.treatments);
                        $("[data-prodcalc-addon]").text("med psykologi");
                        $(".selected-coverage .treatments").fadeIn('fast');
                        $(".selected-coverage .topp, .selected-coverage .psychology").fadeIn('fast');
                    } else {
                        $(".selected-coverage .topp").fadeOut('fast');
                        $("[data-prodcalc-addon]").text("");
                        $("[data-key=treatments][data-value=0]").show();
                    }
                }
                /* based on num treatments */
                if(key == "treatments") {
                    /* update coverage */
                    if(value > 0) {
                        $(".selected-coverage .treatments").fadeIn('fast');
                        $(".coverage-treatments").text(value);
                    } else if(value === 0) {
                        $(".selected-coverage .topp").fadeOut('fast');
                        $(".selected-coverage .treatments").fadeOut('fast');
                        $(".coverage-treatments").text(value);
                    } else {
                        $(".selected-coverage .treatments:visible").fadeOut('fast');
                    }
                }
                
                /* Update current answers.
                 * ie. industry discount, number of treatments, counceling and addon_psychiatric_treatment
                 */
                product_order[key] = value;
                product_order_steps[key] = value;

                $(this).addClass("selected").removeClass("disabled");
                $("[data-key="+ key +"]").not(this).removeClass("selected").addClass("disabled");
                product_recalc(products, product_order);
                /* total questions by number by answered questions */
                var current_progress =  _.size(product_order_steps) / parseFloat(num_product_order_steps) * 100;
                set_progress(current_progress);
            });

            /* Go on to the section after this one */
            $("[data-goto-part]").on('click', function(e) {
                product_recalc(products, product_order);
                var part = $(this).attr('data-goto-part');


                /* Product tailoring */
                if(part == 'part-two' && product_order.employees < 100) {
                    //console.log(product_order);
                    $(".part-zero, .part-one-right-container").fadeOut('fast');
                    setTimeout(function() {
                        if(product_order.eligible_industry_discount) {
                            /* Don't ask for counceling, and set it to false */
                            product_order.counceling = false;
                            $(".addon_psychiatric_treatment").fadeIn('fast');
                            $(".about-addon-psychiatric-treatment").fadeIn('fast');
                            $(".about-counceling").hide();
                        } else {
                            $(".part-two .counceling").fadeIn('fast');
                            // FIXME remove this if business rules are valid
                            //if(product_order.employees >= 20 && product_order.employees <= 99) {
                            //    $(".about-num-treatments").fadeIn('fast');
                            //    $(".prod-num-treatments").fadeIn('fast');
                            //} else {
                            //    $(".part-two .counceling").fadeIn('fast');
                            //}
                        }
                        $(".part-two-and-a-half-container").fadeIn('fast');
                        $(".part-two").fadeIn('fast');
                        if(product_order.has_exisiting_insurance) {
                            $(".part-two-right .need-stats").show();
                        } else {
                            $(".part-two-right .need-stats").hide();
                        }
                    }, 500);
                }
                /* Skip product tailoring */
                if( part == 'part-two' && product_order.employees >= 100) {
                    set_progress(100);
                    /* Get relevant product documents */
                    //update_relevant_documents(product_order);
                    /* Show documents tab */
                    $(".part-zero, .part-one-right-container").fadeOut('fast');
                    setTimeout(function() {
                        if(product_order.has_exisiting_insurance) {
                            $(".part-three-special .need-stats").show();
                        } else {
                            $(".part-three-special .need-stats").hide();
                        }
                        $(".part-three-special").fadeIn('fast');
                    }, 500);
                }


                /* "We recommend the product..." */
                if(part == 'part-two-and-a-half') {
                    $(".part-two-right").fadeOut('fast');
                    $(".select-product-btn").fadeIn('fast');
                    setTimeout(function() {
                        $(".part-two-and-a-half").fadeIn('fast');
                    }, 500);
                }



                /* Document "checkout" - fancy schmancy */
                if( part == 'part-three') {
                    set_progress(100);
                    /* Get relevant product documents */
                    //update_relevant_documents(product_order);

                    /* Show documents tab */
                    $(".part-two, .part-one").fadeOut('fast');
                    setTimeout(function() {
                        $(".part-two-and-a-half").parent().removeClass("small-7").addClass("small-12");
                        $(".eula-container").removeClass("small-7").addClass("small-4");
                        $(".product-description-inner").removeClass("small-5").addClass("small-3");
                        $(".part-three").fadeIn('fast');
                    }, 300);
                    $('[data-goto-part="part-three"]').fadeOut('fast');
                }
            });

            /* Update the product_order with individual employee ages */
            function update_employee_ages() {
                var employees = [];
                var i = 1;
                $(".individual-pricing-container select.age-select-dropdown:visible").each(function(j, el) {
                    age = parseInt($(el).val().split(" -")[0]);
                    employees.push({ id: i, age: age });
                    i++;
                });
                product_order.individual_term_employees = employees;
            }
            $(".individual-pricing-container select.age-select-dropdown").on('change', update_employee_ages);

             /* add html for individual employee risk */
            $(".individual-pricing-container").on('click', "[data-add-new-employee]", function(e) {
                e.preventDefault();
                /* No more than set amount */
                if( $(".person:visible").length == 4) {
                    return;
                }
                $(this).parent().next().fadeIn({ complete: update_employee_ages });
            });
             /* remove html for individual employee risk */
           $(".individual-pricing-container").on('click', "[data-remove-employee]", function(e) {
                e.preventDefault();
                /* At least 1 */
                if( $(".person:visible").length == 1) {
                    return;
                }
                $(this).parent().fadeOut({ complete: update_employee_ages });
            });

            /* Close modal on answer */
            $('[data-key="has_exisiting_insurance"]').on('click', function() {
                $("#modal-has-existing-insurance").foundation('reveal', 'close');
            });
        });
    }
});
