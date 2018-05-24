// Code-behind du repère M0

omc.init();
user.init();

function easterEgg()
{
    function getRandomInt(max)
    {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function getRandomColor()
    {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++)
        {
            color += letters[getRandomInt(16)];
        }
        return color;
    }

    for (var i = 0; i < 100; i++)
    {
        var x = getRandomInt(700);
        var y = getRandomInt(500);
        mireFactory.create('#repere', 'test_mire_' + i, x, 500 - y, getRandomColor());
    }
}

function displayMatchingMaterials(matchingMaterials, param)
{
    if(typeof matchingMaterials === "undefined")
    {
        console.log("Les solutions n'ont pas encore été calculées.");
        return;
    }

    for (var key in matchingMaterials)
    {
        var material = matchingMaterials[key];
        var x = (800.0 * material.characteristics[param]) / omc.ATTR_AMP[param];
        var y = (500.0 * material.characteristics.pricePerTon) / omc.ATTR_AMP.pricePerTon;
        var pi = material.characteristics.pi;
        var tooltipValue = param + " = " + (material.characteristics[param] * omc.ATTR_MULT[param]).toFixed(0); // TODO manque l'unité
        var title = material.name + ' (' + tooltipValue + ', Price per ton = ' + y.toFixed(0) + ', Price index = ' + pi + ')';
        mireFactory.create('#repere', 'mire_' + key, x, 500 - y, (pi <= 100) ? '#008800' : '#EAA60C').attr('title', title);
    }
}

jQuery($ => {
    $('#back_button').button().click(() => window.location = 'material_characteristics.html');
    $('#ramo_button').button().click(() => window.location = 'mire_ramo.html');

    if (window.location.search.indexOf('easterEgg') > 0)
    {
        easterEgg();
        return;
    }

    if (omc.userMaterial)
    {
        if(user.displayCharacteristic)
        {
            var x0 = omc.userMaterial.characteristics[user.displayCharacteristic];
            var tooltipValue = user.displayCharacteristic + " = " + (x0 * omc.ATTR_MULT[user.displayCharacteristic]).toFixed(0); // TODO manque l'unité
			var title = omc.userMaterial.name + ' (' + tooltipValue + ', Raw material price index = ' + y0 + ')';
        }
        else
        {
            var x0 = omc.userMaterial.characteristics.rm;
            var title = omc.userMaterial.name + ' (Rm = ' + x0 + ' MPa, Raw material price index = ' + y0 + ')';
        }
        
        var y0 = omc.userMaterial.characteristics.pricePerTon;
        var x = (800.0 * x0) / omc.ATTR_AMP[user.displayCharacteristic];
        var y = (500.0 * y0) / omc.ATTR_AMP.pricePerTon;

        mireFactory.create('#repere', 'm0_material', x, 500 - y, user.userFavoriteColor).attr('title', title);
    }

    if (document.referrer.endsWith("mire_ramo.html"))
    {
        displayMatchingMaterials(omc.matchingMaterials, localStorage["user.displayCharacteristic"]);
        $('#label_abscisses').text(localStorage["user.displayCharacteristicText"]);
        $('#back_button').css("display","none");
        $("#performance_index_select option:selected").removeAttr("selected");
        $("#performance_index_select option[value='"+ localStorage["user.displayCharacteristic"] +"']").attr('selected', 'selected');
    }
    else
    {
        $('#ramo_button').css("display","none")
    }

    // Event fieldset
    $('#performance_index_select').change(() => {
        $('#label_abscisses').text($('#performance_index_select option:selected').text());
        $('.mire_container').remove();
        localStorage.setItem("user.displayCharacteristic", $('#performance_index_select option:selected').val());
        localStorage.setItem("user.displayCharacteristicText", $('#performance_index_select option:selected').text());

        var x0 = omc.userMaterial.characteristics[user.displayCharacteristic];
        var y0 = omc.userMaterial.characteristics.pricePerTon;
        var x = (800.0 * x0) / omc.ATTR_AMP[localStorage["user.displayCharacteristic"]];
        var y = (500.0 * y0) / omc.ATTR_AMP.pricePerTon;
        var tooltipValue = user.displayCharacteristic + " = " + (x0 * omc.ATTR_MULT[user.displayCharacteristic]).toFixed(0); // TODO manque l'unité
        var title = omc.userMaterial.name + ' (' + tooltipValue + ', Raw material price index = ' + y0 + ')';
        mireFactory.create('#repere', 'm0_material', x, 500 - y, user.userFavoriteColor).attr('title', title);

        displayMatchingMaterials(omc.matchingMaterials, localStorage["user.displayCharacteristic"]);
    });
});
