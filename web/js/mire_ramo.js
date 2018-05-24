
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

omc.init();
user.init();

jQuery($ => {

    if (window.localStorage["user.displayCharacteristicText"] != undefined)
    {
        $("#performance_index_select option:selected").removeAttr("selected");
        $("#performance_index_select option[value='"+ localStorage["user.displayCharacteristic"] +"']").attr('selected', 'selected');
    }
    else
    {
        user.saveDisplayCharacteristic($('#performance_index_select option:selected').val());
        user.saveDisplayCharacteristicText($('#performance_index_select option:selected').text());
    }

    $('#label_abscisses').text($('#performance_index_select option:selected').text());
    displayMatchingMaterial(omc.userMaterial);
	omc.withMatchingMaterials(displayMatchingMaterial);

    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => {
        omc.resetStudy();
        window.location = 'material_characteristics.html';
    });
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');

    // Récupération des données clients
    $('#client_part_description').append(localStorage["omc.clientPartDescription"]);
    $('#client_file_number').append(localStorage["omc.clientFileNumber"]);

    // Event fieldset
    $('#performance_index_select').change(() => {
		$('#label_abscisses').text($('#performance_index_select option:selected').text());
		localStorage.setItem("user.displayCharacteristic", $('#performance_index_select option:selected').val());
        localStorage.setItem("user.displayCharacteristicText", $('#performance_index_select option:selected').text());
        displayMatchingMaterial(omc.userMaterial);
		omc.withMatchingMaterials(displayMatchingMaterial);
	});
});
