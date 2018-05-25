// Code-behind du repère M0

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

function displayMaterial(material, param, color)
{
    var x0 = material.characteristics[param];
    var unit = $('#performance_index_select option:selected').attr('data-unit');
    
    var y0 = material.characteristics.pricePerTon;
    var x = (800.0 * x0) / omc.ATTR_AMP[param];
    var y = (500.0 * y0) / omc.ATTR_AMP.pricePerTon;

    var shortName = $('#performance_index_select option:selected').attr('data-shortname');
    var tooltipValue = shortName + " = " + (x0 * omc.ATTR_MULT[param]).toFixed(0) + unit;
    var title = material.name + ' (' + tooltipValue + ', Raw material price index = ' + y0 + ')';

    mireFactory.create('#repere', 'm0_material', x, 500 - y, color).attr('title', title);
}

function displayUserMaterial(param)
{
    displayMaterial(omc.userMaterial,param,user.userFavoriteColor || '#000000');
}

function displayMatchingMaterials(param)
{
    if(typeof omc.matchingMaterials === "undefined")
    {
        console.log("Les solutions n'ont pas encore été calculées.");
        return;
    }

    for (var key in omc.matchingMaterials)
    {
        var material = omc.matchingMaterials[key];
        displayMaterial(material,param,(material.characteristics.pi <= 100) ? '#008800' : '#EAA60C');
    }
}

function displayAll(param, displayAllMaterials)
{
    var $selectedChar = $('#performance_index_select option:selected');
    $('#label_abscisses').text($selectedChar.text());
    $('.mire_container').remove();

    if (omc.userMaterial)
    {
        displayUserMaterial(param);
    }

    if (displayAllMaterials)
    {
        displayMatchingMaterials(param);
    }
}

omc.init();
user.init();

jQuery($ => {

    var displayAllMaterials = document.referrer.endsWith("mire_ramo.html");

    if (displayAllMaterials)
    {
        $('#back_button').css("display","none");
        $('#ramo_button').button().click(() => window.location = 'mire_ramo.html');
    }
    else
    {
        $('#ramo_button').css("display","none")
        $('#back_button').button().click(() => window.location = 'material_characteristics.html');
    }

    if (window.location.search.indexOf('easterEgg') > 0)
    {
        easterEgg();
        return;
    }

    var displayCharacteristic = user.displayCharacteristic || 'rm';
    $("#performance_index_select").val(displayCharacteristic);

    displayAll(displayCharacteristic, displayAllMaterials);

    $('#performance_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayCharacteristic(ui.item.value);
        displayAll(ui.item.value, displayAllMaterials);
    }});
});
