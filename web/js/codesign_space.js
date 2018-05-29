
omc.init();
var extremeIntervals = {};

jQuery($ => {
    if(!omc.userMaterial)
    {
        $('#price-index-section').css('display','none');
    }

    var currentState = omc.toleranceIntervals || {};
    var defaultIntervals = {};

    // Configuration des slidebars
    $('.slidebar').each((index, container) => {
        var $container = $(container);
        var $tooltipImage = $('img.info_logo', container);
        var $textInput = $('input', container);
        var $slider = $('div.slider-range', container);
        var $valueBar = $('div.value-bar', container);
        var $valueHint = $('div.value-hint', container);

        var characteristic = $container.attr('data-characteristic');
        var min = Number($container.attr('data-min')) || 0;
        var max = Number($container.attr('data-max')) || 10000;
        var unit = $container.attr('data-unit') || '';
        var multiplier = Number($container.attr('data-multiplier')) || 1;
        var delta = 0.1 * (max - min);

        extremeIntervals[characteristic] = [min, max];

        $tooltipImage.attr('title',$tooltipImage.attr('title') + ' [' + min + unit + '; ' + max + unit + ']');
        
        function updateText(v1, v2)
        {
            $textInput.val(v1.toFixed(0) + unit + " - " + v2.toFixed(0) + unit);
        }
        
        var val = Number($valueHint.text());
        if(omc.userMaterial && omc.userMaterial.characteristics[characteristic])
        {
            val = omc.userMaterial.characteristics[characteristic] * multiplier;
        }

        if(val)
        {
            console.debug('OMC',characteristic + ' = ' + val);

            var v1Init = Math.floor(Math.max(min, val - delta));
            var v2Init = Math.ceil(Math.min(max, val + delta));

            var relativePosition = (val - min) / (max - min) * 100;
            $valueBar.css('left',relativePosition + '%');
            $valueHint.css('left',relativePosition + '%');
            $valueHint.text(val.toFixed(0) + unit);
        }
        else
        {
            var middle = (min + max) / 2;
            var v1Init = Math.floor(middle - delta);
            var v2Init = Math.ceil(middle + delta);
            $valueBar.css('display','none');
            $valueHint.css('display','none');
        }

        defaultIntervals[characteristic] = [v1Init / multiplier, v2Init / multiplier];

        if(currentState && currentState[characteristic])
        {
            v1Init = Math.min(val || max,currentState[characteristic][0] * multiplier);
            v2Init = Math.max(val || min,currentState[characteristic][1] * multiplier);
        }
        else
        {
            currentState[characteristic] = [v1Init, v2Init];
        }

        updateText(v1Init, v2Init);

        $slider.slider(
        {
            animate: "fast",
            range : true,
            min : min,
            max : max,
            values : [ v1Init, v2Init ],
            slide : (event, ui) => {
                var v1 = ui.values[0];
                var v2 = ui.values[1];
                var centralValueReached = false;

                if(val && (v1 > val))
                {
                    v1 = val;
                    $slider.slider("values", 0, v1);
                    centralValueReached = true;
                }

                if(val && (v2 < val))
                {
                    v2 = val;
                    $slider.slider("values", 1, v2);
                    centralValueReached = true;
                }

                updateText(v1, v2);
                return !centralValueReached;
            },
            change: (event, ui) => {
                currentState[characteristic] = ui.values.map(v => v / multiplier);
                omc.saveToleranceIntervals(currentState);
                omc.deleteMatchingMaterials();
            },
        });
    });

    omc.saveDefaultIntervals(defaultIntervals);

    // Configuration des radio buttons
    $('.radiobutton').each((index, container) => {
        var $fieldset = $('fieldset', container);
        var $inputs = $('input[type="radio"]', container);
        var $labels = $('label', container);
        
        var characteristic = $(container).attr('data-characteristic');

        if(currentState[characteristic])
        {
            $('input[value="' + currentState[characteristic][1] + '"]',container).prop("checked", true);
        }
        else if(omc.userMaterial)
        {
            var val = omc.userMaterial.characteristics[characteristic];
            $('input[value="' + val + '"]',container).prop("checked", true);
            currentState[characteristic] = [1, val];
        }

        omc.withMaterialDB(db => $labels.each((index,label) => {
            var $l = $(label);
            if(!$l.text())
            {
                $l.text(db.messages[$l.attr('for')]);
            }
        }));
        $fieldset.controlgroup();
        
        $inputs.change(event => {
            if(event.target.checked)
            {
                var $input = $(event.target);
                currentState[characteristic] = [1,Number($input.attr('value'))];
                omc.saveToleranceIntervals(currentState);
                omc.deleteMatchingMaterials();
            }
        })
    });

    // Configuration des boutons de navigation
    $('#calculation_button').button().click(() => window.location = 'mire_ramo.html');
    $('#return_button').button().click(() => window.location = 'material_characteristics.html');
    $('#about').click(() => window.location = "https://alpenbox.kad-office.com/w/D%C3%A9finition_du_POC_AT-OMC_pour_le_choix_optimal_de_mat%C3%A9riau_recommand%C3%A9_au_client");
    $('#back_benco').click(() => window.location = 'index.html');


    // Stockage en localStorage des intervalles extrêmes
    localStorage.setItem("omc.extremeIntervals", JSON.stringify(extremeIntervals));
});
