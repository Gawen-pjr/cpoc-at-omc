var nbDisplayedMaterials = 0;
var targetDataPositions = [];
var textualDatas = {
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
        "1": "High resistance to corrosion",
        "2": "Good resistance to corrosion",
        "3": "Poor resistance to corrosion"
    }
};

function targetClickHandler($mire, material) {

    if (!$mire.data("selection_nb") && (targetDataPositions.length < 2))
    {
        $mire.css("background-color", "rgb(128, 128, 128)");

        if (targetDataPositions.length > 0) {
            if (targetDataPositions[0] == 1) {
                selectionNb = 2;
            }

            else if (targetDataPositions[0] == 2) {
                selectionNb = 1;
            }
        }

        else {
            selectionNb = 1;
        }

        $mire.data("selection_nb", selectionNb);
        targetDataPositions.push(selectionNb);

        var selectedMaterial = $mire.attr("id").split('_')[1];
        $('[data=name_' + selectionNb + ']').text(selectedMaterial);

        for (key in material.characteristics)
        {
            // Affichage des paramètres dans le tableau

            if (key == "s" || key =="ts" || key == "co")
            {
                var characValue = Number((Number(material.characteristics[key])).toFixed(1));
                $('[data='+ key + '_' + selectionNb + ']').text(textualDatas[key][selectionNb]);
            }

            else if (key == "a")
            {
                var characValue = Number((Number(material.characteristics[key])).toFixed(2));

                $('[data='+ key + '_' + selectionNb + ']').text((characValue*100).toFixed(0));
            }

            else
            {
                var characValue = Number((Number(material.characteristics[key])).toFixed(1));

                $('[data='+ key + '_' + selectionNb + ']').text(characValue.toFixed(2));
            }

            // Comparaison à M0
            if (key == "s" || key == "ts")
            {
                var m0Value = Number(Number(material.characteristics[key]).toFixed(1));
            }

            else if (key == "a")
            {
                var m0Value = Number(Number(material.characteristics[key]).toFixed(2));
            }

            else
            {
                var m0Value = Number(Number($('[data=' + key + '_0]').text()).toFixed(1));  
            }

            if (key == "pi" || key == "pricePerTon" || key == "s" || key == "ts")
            {
               if (characValue < m0Value)
                {
                    $('[data='+ key + '_' + selectionNb + ']').css('color', 'green');
                }

                else if (characValue > m0Value)
                {
                    $('[data='+ key + '_' + selectionNb + ']').css('color', 'red');
                }

                else
                {
                    $('[data='+ key + '_' + selectionNb + ']').css('color', 'black');
                }
            }

            else
            {
                if (characValue > m0Value)
                {
                    $('[data='+ key + '_' + selectionNb + ']').css('color', 'green');
                }

                else if (characValue < m0Value)
                {
                    $('[data='+ key + '_' + selectionNb + ']').css('color', 'red');
                }

                else
                {
                    $('[data='+ key + '_' + selectionNb + ']').css('color', 'black');
                }
            }
        }
    }

    else if ($mire.data("selection_nb"))
    {
        $mire.css("background-color", "");

        var selectionNb = $mire.data("selection_nb");

        var selectedMaterial = $mire.attr("id").split('_')[1];
        $('[data=name_' + selectionNb + ']').text('');

        for (key in material.characteristics)
        {
            $('[data='+ key + '_' + selectionNb + ']').text('');
        }

        for (i = 0; i = targetDataPositions.length - 1; i++) {
            if(targetDataPositions[i] === selectionNb) {
               targetDataPositions.splice(i, 1);
            }
        }

        $mire.removeData("selection_nb");
    }
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

    var tooltipValue = $displayCharacteristic.attr("data-shortname") + " = " + (x * omc.ATTR_MULT[user.displayCharacteristic]).toFixed(0) + $displayCharacteristic.attr("data-unit");
    var title = 'M' + nb + ' : ' + material.name + ' (' + tooltipValue + ', Price per ton = ' + pricePerTon.toFixed(0) + ', Operation price index = ' + pi.toFixed(0) + ')';

    var color = (material.name == omc.userMaterial.name) ? user.userFavoriteColor : (pi <= 100) ? '#008800' : '#EAA60C';
    var mireId = ('mire_' + material.name).replace(/[^A-Za-z0-9_]+/gm,'_');
    $('#' + mireId).remove();
    $mire = mireFactory.create('#axe_abscisses', mireId, 352 + xs, -3 - ys, color).attr('title', title);

    if (nbDisplayedMaterials != 0)
    {
        $('#nb_material').text(nbDisplayedMaterials + " matching materials out of " + omc.materialDB.grades.length + " materials in Alpen'Tech's database.");
    }

    $mire.click(() => targetClickHandler($mire, material));
}

function displayAll()
{
    var $selectedChar = $('#performance_index_select option:selected');
    $('#label_abscisses').text($selectedChar.text());
    var $selectedPriceIndex = $('#price_index_select option:selected');
    $('#label_ordonnées').text($selectedPriceIndex.text());
    $('.mire_container').remove();

    omc.matchingGradesComputationListener.push(() => {
        if (omc.matToken == 0)
        {
            $('#nb_material').text("No matching materials in Alpen'Tech's database.")
        }
        else
        {
            $('#nb_material').text("Solutions loaded : " + nbDisplayedMaterials + " matching materials out of " + omc.materialDB.grades.length + " materials in Alpen'Tech's database.")
        }
    });

    omc.userMaterial.nb = 0;
    displayMatchingMaterial(omc.userMaterial);
    omc.withMatchingMaterials(displayMatchingMaterial);
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

    for (key in omc.userMaterial.characteristics)
    {
        var characValue = omc.userMaterial.characteristics[key];

        if (key == "s")
        {
            if (characValue.toFixed(0) == "1")
            {
                $('[data='+ key + '_0]').text("Easily weldable");
            }

            else if (characValue.toFixed(0) == "2")
            {
                $('[data='+ key + '_0]').text("Weldable with heating");
            }

            else if (characValue.toFixed(0) == "3")
            {
                $('[data='+ key + '_0]').text("Unweldable");
            }
        }

        else if (key == "ts")
        {
            if (characValue.toFixed(0) == "1")
            {
                $('[data='+ key + '_0]').text("Easily treatable");
            }

            else if (characValue.toFixed(0) == "2")
            {
                $('[data='+ key + '_0]').text("Treatable with specific conditions");
            }

            else if (characValue.toFixed(0) == "3")
            {
                $('[data='+ key + '_0]').text("Not easily treatable");
            }
        }

        else if (key == "a")
        {
            $('[data='+ key + '_0]').text(Number(characValue*100).toFixed(0));
        }

        else
        {
            $('[data='+ key + '_0]').text(Number(characValue).toFixed(2));
        }
    }

    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => window.location = 'material_characteristics.html');
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');

    $('#client_part_description').append(localStorage["omc.clientPartDescription"]);
    $('#client_file_number').append(localStorage["omc.clientFileNumber"]);

    var displayCharacteristic = user.displayCharacteristic || 'rm';
    $("#performance_index_select").val(displayCharacteristic);

    var displayPriceIndex = user.displayPriceIndex || 'pricePerTon';
    $("#price_index_select").val(displayPriceIndex);

    displayAll();

    $('#performance_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayCharacteristic(ui.item.value);
        displayAll(ui.item.value);
    }});

    $('#price_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayPriceIndex(ui.item.value);
        displayAll(ui.item.value);
    }});
});
