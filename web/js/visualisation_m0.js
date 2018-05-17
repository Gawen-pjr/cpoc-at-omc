// Code-behind du repère M0

omc.init();

var $clientFavoriteColor = localStorage.getItem("omc.clientFavoriteColor");
var matchingMaterials = JSON.parse(localStorage.getItem("omc.matchingMaterials"));

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

function displayMatchingMaterials(matchingMaterials)
{
    if(typeof matchingMaterials === "undefined")
    {
        console.log("Les solutions n'ont pas encore été calculées.");
    }

    if(matchingMaterials)
    {
        for (var materiau in matchingMaterials)
        {
            mireFactory.create('#repère', 'mire_' + materiau, 350 + materiau["xs"], -5 - materiau["ys"], (materiau["pi"] <= 100) ? '#008800' : '#EAA60C').attr('title', materiau["title"]);
        }
    }
}

jQuery($ => {
    $('#back_button').button().click(() => window.location = 'material_characteristics.html');
    $('#ramo_button').button().click(() => window.location = 'mire_ramo.html')

    if (window.location.search.indexOf('easterEgg') > 0)
    {
        easterEgg();
        return;
    }

    if (omc.userMaterial)
    {
        var x0 = omc.userMaterial.characteristics.rm;
        var y0 = omc.userMaterial.characteristics.pricePerTon;
        var x = (800.0 * x0) / 1200.0;
        var y = (500.0 * y0) / 5000.0;
        var title = omc.userMaterial.name + ' (Rm = ' + x0 + ' Mpa, Raw material price index = ' + y0 + ')';
        mireFactory.create('#repere', 'm0_material', x, 500 - y, $clientFavoriteColor).attr('title', title);
    }
});
