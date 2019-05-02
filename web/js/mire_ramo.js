var nbDisplayedMaterials = 0;
var selectedMaterials = [];
var textualData = {
    "s": {
        "1": "Easily weldable",
        "2": "Weldable with heating",
        "3": "Unweldable"
    },
    "ts": {
        "1": "Easily treatable",
        "2": "Treatable with specific conditions",
        "3": "Not easily treatable"
    },
    "co": {
        "1": "High resistance",
        "2": "Good resistance",
        "3": "Poor resistance"
    }
};

var invertedComparisonCharacs = ['s', 'ts', 'co', 'a', 'pi', 'pricePerTonMin', 'pricePerTon', 'pricePerTonMax'];

function populateMaterialTable(material, position)
{
	$('[data-attr=name_' + position + ']').text(material.name);

	omc.withMaterialDB(db => {
        var materialFamily = {name: omc.dbName};
		var materialSubfamily = db.families[material.family];
		$('[data-attr=family_' + position + ']').text(materialFamily.name);
		$('[data-attr=subfamily_' + position + ']').text(materialSubfamily.name);
	});

    $('#table_material_' + position).text('M' + material.nb);

    for (key in material.characteristics)
    {
		var characValue = Number(material.characteristics[key]);
		var $cell = $('[data-attr='+ key + '_' + position + ']');

		switch (key)
		{
			case 's':
			case 'ts':
			case 'co':
				$cell.text(textualData[key][characValue]);
				break;
			case 'a':
				$cell.text((characValue*100).toFixed(0));
				break;
			default:
				$cell.text(characValue.toFixed(2));
		}

		if(position == 0)
		{
			continue;
		}

		var m0Value = Number(omc.userMaterial.characteristics[key]);
		var color;
		
		if (invertedComparisonCharacs.includes(key))
		{
			color = (characValue > m0Value) ? 'red' : (characValue < m0Value) ? 'green' : 'unset';
		}
		else
		{
			color = (characValue > m0Value) ? 'green' : (characValue < m0Value) ? 'red' : 'unset';
		}
		$cell.css('color', color);
    }
}

function clearMaterialTable()
{
	var $variableCells = $('.table_characteristique.variable');
	$variableCells.text('');
	$variableCells.css('color', '');
}

function refreshMaterialTable()
{
	clearMaterialTable();
	if(selectedMaterials.length > 0)
	{
		populateMaterialTable(selectedMaterials[0], 1);
		
		if(selectedMaterials.length > 1)
		{
			populateMaterialTable(selectedMaterials[1], 2);
		}
        else
        {
            $('#table_material_2').text("-");
        }
	}
    else
    {
        $('#table_material_1').text("M-");
        $('#table_material_2').text("M-");
    }
}

function mireClickHandler($mire, material)
{
	var selectionPos = selectedMaterials.indexOf(material);
	if(selectionPos < 0)
	{
		if(selectedMaterials.length > 1)
		{
			return;
		}

		$mire.css("background-color", "rgb(128, 128, 128)");
		selectedMaterials.push(material);
	}
	else
	{
		$mire.css("background-color", "");
		selectedMaterials.splice(selectionPos, 1);
	}
	
	refreshMaterialTable();
}

function displayMatchingMaterial(material)
{
    var $displayCharacteristic = $('#performance_index_select option:selected');
    user.saveDisplayCharacteristic($displayCharacteristic.val());
    var $displayPriceIndex = $('#price_index_select option:selected');
    user.saveDisplayPriceIndex($displayPriceIndex.val());

    var nb = material.nb;
    nbDisplayedMaterials = (nbDisplayedMaterials < nb) ? nb : nbDisplayedMaterials; 

    console.debug('OMC', material);
    console.debug('OMC', user.displayCharacteristic);
    console.debug('OMC', user.displayPriceIndex);

    var x0 = omc.userMaterial.characteristics[user.displayCharacteristic];
    var xAmp = Math.max(x0, omc.ATTR_AMP[user.displayCharacteristic] - x0);

    var y0 = omc.userMaterial.characteristics[user.displayPriceIndex] || 100;
    var yAmp = Math.max(y0, omc.ATTR_AMP[user.displayPriceIndex] - y0);

    var pi = Number(material.characteristics.pi || 100);
    var pricePerTon = Number(material.characteristics.pricePerTon);

    var intervals = omc.toleranceIntervals || omc.defaultIntervals;
    if(intervals)
    {
        xAmp = Math.max(x0 - intervals[user.displayCharacteristic][0], intervals[user.displayCharacteristic][1] - x0);
    }

    var x = Number(material.characteristics[user.displayCharacteristic]);
    var y = Number(material.characteristics[user.displayPriceIndex]) || y0;

    if (material === omc.userMaterial)
    {
        var xs = 0;
    }
    else 
    {
        var xs = (x - x0) * (350.0 / xAmp);
    }
    var ys = (y - y0) * (350.0 / yAmp);

        
    function toInt(x)
    {
        return ((typeof x) === "undefined") ? 'undef' : x.toFixed(0);
    }

    var tooltipValue = $displayCharacteristic.attr("data-shortname") + " = " + toInt(x * omc.ATTR_MULT[user.displayCharacteristic]) + $displayCharacteristic.attr("data-unit");
	
    switch (user.displayPriceIndex)
    {
        case "pi":
            var title = 'M' + nb + ' : ' + material.name + ' (' + tooltipValue + ', Price per ton = ' + toInt(material.characteristics.pricePerTon) + ', Operation price index = ' + toInt(pi) + ')';
            break;
        default:
            var title = 'M' + nb + ' : ' + material.name + ' (' + tooltipValue + ', ' + $('#price_index_select option:selected').text() + ' = ' + toInt(material.characteristics[user.displayPriceIndex]) + ', Operation price index = ' + toInt(pi) + ')';
    }

    var color = (material.name == omc.userMaterial.name) ? user.userFavoriteColor : (pi <= 100) ? '#008800' : '#EAA60C';
    var mireId = ('mire_' + material.name).replace(/[^A-Za-z0-9_]+/gm,'_');
    $('#' + mireId).remove();
    var $mire = mireFactory.create('#axe_abscisses', mireId, 352 + xs, -3 - ys, color).attr('title', title);

    if (nbDisplayedMaterials != 0)
    {
        $('#nb_material').text(nbDisplayedMaterials + " matching materials out of " + Object.keys(omc.materialDB.grades).length + " materials in Alpen'Tech's database.");
    }

    $mire.click(() => mireClickHandler($mire, material));

    if (selectedMaterials != [])
    {
        for (i=0; i < selectedMaterials.length; i++)
        {
            if (material.name == selectedMaterials[i].name)
            {
                $mire.css("background-color", "rgb(128, 128, 128)");
            }
        }
    }
}

function displayAll()
{
    var $selectedChar = $('#performance_index_select option:selected');
    $('#label_abscisses').text($selectedChar.text());
    var $selectedPriceIndex = $('#price_index_select option:selected');
    $('#label_ordonnées').text($selectedPriceIndex.text());
    $('.mire_container').remove();

    nbDisplayedMaterials = 0;
    omc.userMaterial.nb = 0;
    displayMatchingMaterial(omc.userMaterial);

	var matchingMaterials = omc.getMatchingMaterials();
    for (mat in matchingMaterials)
    {
        if (mat != omc.userMaterial.name)
        {
            nbDisplayedMaterials++;
            matchingMaterials[mat].nb = nbDisplayedMaterials;
            displayMatchingMaterial(matchingMaterials[mat]);
        }
    }

    if (nbDisplayedMaterials == 0)
    {
        $('#nb_material').text("No matching materials in Alpen'Tech's database.");
    }
}

omc.init();
user.init();

jQuery($ => {

    $.getJSON("poc.json", meta =>
        $('#versionning').text("v" + meta.version + " du " + meta.release_date)
    );

    $('[data=name_0]').text(omc.userMaterial.name);
    $('[data=family_0]').text(omc.userMaterial.family.split('_').join(' '));
    $('[data=pi_0]').text("100.00");

    omc.userMaterial.nb = 0;
	omc.userMaterial.characteristics.pi = 100;
	populateMaterialTable(omc.userMaterial, 0);

    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => window.location = 'material_characteristics.html');
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');

    $('#client_part_description').append(localStorage["omc.clientPartDescription." + omc.dbName]);
    $('#client_file_number').append(localStorage["omc.clientFileNumber." + omc.dbName]);

    var displayCharacteristic = user.displayCharacteristic || 'rm';
    $("#performance_index_select").val(displayCharacteristic);

    var displayPriceIndex = user.displayPriceIndex || 'pricePerTon';
    $("#price_index_select").val(displayPriceIndex);

    omc.withMaterialDB(db => displayAll());

    $('#performance_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayCharacteristic(ui.item.value);
        displayAll(ui.item.value);
    }});

    $('#price_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayPriceIndex(ui.item.value);
        displayAll(ui.item.value);
    }});
});
