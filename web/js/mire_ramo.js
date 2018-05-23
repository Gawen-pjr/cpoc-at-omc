
var clientFavoriteColor = localStorage.getItem("omc.clientFavoriteColor");

function displayMatchingMaterial(material)
{
	var displayCharacteristic = $('#performance_index_select option:selected').val();

    console.debug('OMC', material);
    console.debug('OMC', displayCharacteristic);

    var x0 = omc.userMaterial.characteristics[displayCharacteristic];
    var xAmp = Math.max(x0 - 360.0, 1200.0 - x0);

    var y0 = omc.userMaterial.characteristics.pricePerTon;
    var yAmp = Math.max(y0 - 750.0, 4600.0 - y0);

    var pi = Number(material.characteristics.pi);

    var intervals = omc.toleranceIntervals || omc.defaultIntervals;
    if(intervals)
    {
        xAmp = Math.max(x0 - intervals[displayCharacteristic][0], intervals[displayCharacteristic][1] - x0);
    }

    var x = Number(material.characteristics[displayCharacteristic]);
    var y = Number(material.characteristics.pricePerTon);
    var xs = (x - x0) * (350.0 / xAmp);
    var ys = (y - y0) * (350.0 / yAmp);
    var title = material.name + ' (' + $('#performance_index_select option:selected').text() + '= ' + x.toFixed(0) + ', Price per ton = ' + y.toFixed(0) + ', Price index = ' + pi.toFixed(0) + ')';

	var color = (material.name == omc.userMaterial.name) ? clientFavoriteColor : (pi <= 100) ? '#008800' : '#EAA60C';
	var mireId = ('mire_' + material.name).replace(/[^A-Za-z0-9_]+/gm,'_');
	$('#' + mireId).remove();
	mireFactory.create('#axe_abscisses', mireId, 352 + xs, -3 - ys, color).attr('title', title);
}

omc.init();

jQuery($ => {

	$('#label_abscisses').text($('#performance_index_select option:selected').text());
	localStorage.setItem("omc.chosenParameter", $('#performance_index_select option:selected').val());
    localStorage.setItem("omc.chosenParameterText", $('#performance_index_select option:selected').text());
    displayMatchingMaterial(omc.userMaterial);
	omc.withMatchingMaterials(displayMatchingMaterial);

    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => window.location = 'material_characteristics.html');
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');

    // Récupération des données clients
    $('#client_part_description').append(localStorage.getItem("omc.clientPartDescription"));
    $('#client_file_number').append(localStorage.getItem("omc.clientFileNumber"));

    // Event fieldset
    $('#performance_index_select').change(() => {
		$('#label_abscisses').text($('#performance_index_select option:selected').text());
		localStorage.setItem("omc.chosenParameter", $('#performance_index_select option:selected').val());
        localStorage.setItem("omc.chosenParameterText", $('#performance_index_select option:selected').text());
        displayMatchingMaterial(omc.userMaterial);
		omc.withMatchingMaterials(displayMatchingMaterial);
	});
});
