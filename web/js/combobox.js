// Définition de la combobox

$.widget( "custom.combobox", {
    _create: function() {
        this.wrapper = $("<span>")
            .addClass("custom-combobox")
            .insertAfter(this.element);

        this.sourceFunction = this.options.sourceFunction;

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
    },

    _createAutocomplete: function() {
        this.input = $("<input>")
            .appendTo(this.wrapper)
            .attr("title","")
            .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
            .autocomplete({
                delay: 0,
                minLength: 0,
                source: $.proxy(this, "_source")
            })
            .tooltip({
                classes: {
                    "ui-tooltip": "ui-state-highlight"
                }
            });

        this._on(this.input, {
            autocompleteselect: (event, ui) => {
                ui.item.option.selected = true;
                this._trigger("select", event, {
                    item: ui.item.option
                });
            },
            autocompletechange: "_removeIfInvalid"
        });
    },

    _createShowAllButton: function() {
        var input = this.input,
            wasOpen = false;

        $("<a>")
            .attr("tabIndex", -1)
            .attr("title", "Show All Items")
            .tooltip()
            .appendTo(this.wrapper)
            .button({
                icons: {
                    primary: "ui-icon-triangle-1-s"
                },
                text: false
            })
            .removeClass("ui-corner-all")
            .addClass("custom-combobox-toggle ui-corner-right")
            .on("mousedown", () => {
                wasOpen = input.autocomplete("widget").is(":visible");
            })
            .on("click", () => {
                input.trigger("focus");

            // Close if already visible
            if ( wasOpen ) {
                return;
            }

            // Pass empty string as value to search for, displaying all results
            input.autocomplete("search", "");
        });
    },

    _source: function(request, response) {
        var candidates = this.sourceFunction();
        var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
        response(candidates
            .filter(item => (!request.term || matcher.test(item)))
            .map( item => {
               return {
                    label: item,
                    value: item,
                    option: this
                };
            })
        );
    },

    _removeIfInvalid: function(event, ui) {

        // Selected an item, nothing to do
        if (ui.item) {
            this.element.val(ui.item.value);
            this.element.change();
            return;
        }

        // Search for a match
        var value = this.input.val();
        var valueLowerCase = value.toLowerCase();
        var candidates = this.sourceFunction();
        var valid = false;
        candidates.forEach(candidate => {
            if(candidate.toLowerCase() == valueLowerCase)
            {
                valid = true;
                this.input.val(candidate);
                this.element.val(candidate);
                this.element.change();
            }
        });

        if (valid) {
            return;
        }

        // Remove invalid value
        this.input
            .val("")
            .attr("title", value + " didn't match any item")
            .tooltip("open");

        this.element.val("");
        this.element.change();

        this._delay(function() {
            this.input.tooltip("close").attr("title", "");
        }, 2500);
        this.input.autocomplete("instance").term = "";
    },

    _destroy: function() {
        this.wrapper.remove();
        this.element.show();
    },

    refresh : function()
    {
        var value = this.element.val()
        this.input.val("");
        this.element.val("");

        // Search for a match
        var valueLowerCase = value.toLowerCase();
        var candidates = this.sourceFunction();
        candidates.forEach(candidate => {
            if(candidate.toLowerCase() == valueLowerCase)
            {
                this.input.val(candidate);
                this.element.val(candidate);
                return;
            }
        });
    },
});
