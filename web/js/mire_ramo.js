
function displayMatchingMaterial(material)
{
    var $displayCharacteristic = $('#performance_index_select option:selected');
    user.saveDisplayCharacteristic($displayCharacteristic.val());

    console.debug('OMC', material);
    console.debug('OMC', user.displayCharacteristic);

    var x0 = omc.userMaterial.characteristics[user.displayCharacteristic];
    var xAmp = Math.max(x0, omc.ATTR_AMP[user.displayCharacteristic] - x0);

    var y0 = omc.userMaterial.characteristics.pricePerTon;
    var yAmp = Math.max(y0 - 750.0, 4600.0 - y0);

    var pi = Number(material.characteristics.pi || 100);

    var intervals = omc.toleranceIntervals || omc.defaultIntervals;
    if(intervals)
    {
        xAmp = Math.max(x0 - intervals[user.displayCharacteristic][0], intervals[user.displayCharacteristic][1] - x0);
    }

    var x = Number(material.characteristics[user.displayCharacteristic]);
    var y = Number(material.characteristics.pricePerTon);
    var xs = (x - x0) * (350.0 / xAmp);
    var ys = (y - y0) * (350.0 / yAmp);
	
	var tooltipValue = $displayCharacteristic.attr("data-shortname") + " = " + (x * omc.ATTR_MULT[user.displayCharacteristic]).toFixed(0) + $displayCharacteristic.attr("data-unit");
    var title = material.name + ' (' + tooltipValue + ', Price per ton = ' + y.toFixed(0) + ', Price index = ' + pi.toFixed(0) + ')';

	var color = (material.name == omc.userMaterial.name) ? user.userFavoriteColor : (pi <= 100) ? '#008800' : '#EAA60C';
	var mireId = ('mire_' + material.name).replace(/[^A-Za-z0-9_]+/gm,'_');
	$('#' + mireId).remove();
	mireFactory.create('#axe_abscisses', mireId, 352 + xs, -3 - ys, color).attr('title', title);
}

function displayAll(param)
{
    var $selectedChar = $('#performance_index_select option:selected');
    $('#label_abscisses').text($selectedChar.text());
    $('.mire_container').remove();

    displayMatchingMaterial(omc.userMaterial);
	omc.withMatchingMaterials(displayMatchingMaterial);
}

omc.init();
user.init();

jQuery($ => {

    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => window.location = 'material_characteristics.html');
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');

    $('#client_part_description').append(localStorage["omc.clientPartDescription"]);
    $('#client_file_number').append(localStorage["omc.clientFileNumber"]);

    var displayCharacteristic = user.displayCharacteristic || 'rm';
    $("#performance_index_select").val(displayCharacteristic);
    
	displayAll(displayCharacteristic);

    $('#performance_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayCharacteristic(ui.item.value);
        displayAll(ui.item.value);
	}});
});
