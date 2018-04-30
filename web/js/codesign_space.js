
kvoweb.init();

var sessionGrade = window.localStorage.getItem("omc.referenceGrade");
var currentGrade = sessionGrade ? JSON.parse(sessionGrade) : undefined;

jQuery(function($)
{
    $('.slidebar').each(function()
    {
        var $container = $(this);
        
        var characteristic = $container.attr('data-characteristic');
        var min = Number($container.attr('data-min')) || 0;
        var max = Number($container.attr('data-max')) || 10000;
        var unit = $container.attr('data-unit') || '';
        var multiplier = Number($container.attr('data-multiplier')) || 1;
        
        var $tooltipImage = $('img.info_logo', $container);
        var $textInput = $('input', $container);
        var $slider = $('div.slider-range', $container);
        var $valueBar = $('div.value-bar', $container);
        var $valueHint = $('div.value-hint', $container);
        
        $tooltipImage.attr('title',$tooltipImage.attr('title') + ' [' + min + unit + '; ' + max + unit + ']');
        
        function updateText(v1, v2)
        {
            $textInput.val(v1.toFixed(0) + unit + " - " + v2.toFixed(0) + unit);
        }
        
        var val = Number($valueHint.text());
        if(currentGrade && currentGrade.characteristics[characteristic])
        {
            val = currentGrade.characteristics[characteristic] * multiplier;
        }
        if(!val)
        {
            val = (min + max) / 2;
        }

        console.debug('OMC',characteristic + ' = ' + val);

        var delta = 0.1 * (max - min);
        var v1Init = Math.floor(Math.max(min, val - delta));
        var v2Init = Math.ceil(Math.min(max, val + delta));

        var relativePosition = (val - min) / (max - min) * 100;
        $valueBar.css('left',relativePosition + '%');
        $valueHint.css('left',relativePosition + '%');
        $valueHint.text(val + unit);
        updateText(v1Init, v2Init);

        $slider.slider(
        {
            animate: "fast",
            range : true,
            min : min,
            max : max,
            values : [ v1Init, v2Init ],
            slide : function(event, ui)
            {
                var v1 = ui.values[0];
                var v2 = ui.values[1];
                var centralValueReached = false;
                
                if(v1 > val)
                {
                    v1 = val;
                    $slider.slider("values", 0, v1);
                    centralValueReached = true;
                }

                if(v2 < val)
                {
                    v2 = val;
                    $slider.slider("values", 1, v2);
                    centralValueReached = true;
                }
                
                updateText(v1, v2);
                return !centralValueReached;
            }
        });
    });

    //Radiobox
    $("input[type='radio']").checkboxradio(); // inupt.classe_des_radioboutons
    $("fieldset").controlgroup();

    $('#calculation_button').button().click(function()
    {
        window.location = 'mire_ramo.html';
    });

    $('#return_button').button().click(function()
    {
        window.location = 'material_characteristics.html';
    });
});
