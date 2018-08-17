// Code-behind pour le formulaire material_characteristics

omc.init();
user.init();

function clearMaterialFields()
{
    $('#material_price_per_ton').val('-');
    $('#material_price_per_ton_min').val('-');
    $('#material_price_per_ton_max').val('-');
    $('#part_price').val('-');
    $('#material_tensile_strength').val('-');
    $('#material_proof_stress').val('-');
    $('#material_hardness').val('-');
    $('#material_elongation').val('-');
    $('#material_weldability').val('-');
    $('#material_heat_treatability').val('-');
    $('#material_corrosion_resistance').val('-');
}

function setMaterialFields(grade)
{
    $('#material_price_per_ton').val(grade.characteristics.pricePerTon);
    $('#material_price_per_ton_min').val(grade.characteristics.pricePerTonMin);
    $('#material_price_per_ton_max').val(grade.characteristics.pricePerTonMax);
    $('#part_price').val(100);
    $('#material_tensile_strength').val(grade.characteristics.rm);
    $('#material_proof_stress').val(grade.characteristics.rp);
    $('#material_hardness').val(grade.characteristics.hb);
    $('#material_elongation').val(Number(grade.characteristics.a * 100).toFixed(2));
    $('#material_weldability').val(omc.materialDB.messages['weldability_' + grade.characteristics.s]);
    $('#material_heat_treatability').val(omc.materialDB.messages['heat_treatability_' + grade.characteristics.ts]);
    // if (grade.family == "stainless_steel")
    // {
    //     $('#material_corrosion_resistance').val(omc.materialDB.messages['corrosion_resistance_' + grade.characteristics.co]);
    // }
}

jQuery($ => {

    $.getJSON("poc.json", meta =>
        $('#versionning').text("v" + meta.version + " du " + meta.release_date)
    );

    var $gradeInput = $('#material_grade');
    var $familySelect = $('#material_family');
    
    function gradeChanged(gradeName)
    {
        var grade = Object.values(omc.materialDB.grades).find(g => g.name == gradeName);

        if (grade)
        {
            $familySelect.val(grade.family);
            omc.saveUserMaterial(grade);
            setMaterialFields(grade);
        }
        else
        {
            if (omc.userMaterial)
            {
                grade = omc.userMaterial;
                $familySelect.val(omc.userMaterial.family);
                $gradeInput.val(omc.userMaterial.name);
                setMaterialFields(omc.userMaterial);
            }
            else
            {
                omc.deleteUserMaterial();
                clearMaterialFields();
            }
        }

        $familySelect.selectmenu('refresh');
        $gradeInput.combobox('refresh');
        console.debug('OMC', grade);
    }

    function gradeFamilyChanged()
    {
        var family = $familySelect.val();
        if(family == "-")
        {
            family = undefined;
        }

        if (!omc.userMaterial || (family != omc.userMaterial.family))
        {
            $gradeInput.val('');
            $gradeInput.combobox('refresh');
            clearMaterialFields();
        }
    }

    function getFilteredGrades()
    {
        var family = $familySelect.val();
        if(family == "-")
        {
            family = undefined;
        }
       
        return Object.values(omc.materialDB.grades)
            .filter(grade => !family || (grade.family == family))
            .map(grade => grade.name);
    }

    $('<option value="-">-</option>').appendTo($familySelect);
    $familySelect.selectmenu({"select": gradeFamilyChanged});

    $gradeInput
        .combobox({sourceFunction: getFilteredGrades})
        .change(() => gradeChanged($gradeInput.val()));

    omc.withMaterialDB(db => {
        Object.values(db.families).forEach(f => $('<option />').val(f.id).text(f.name).appendTo($familySelect));
        gradeChanged();
    });

    // Configuration du champs 'part number'
    $("#client_file_number").autocomplete({
        source : [ '1111', '2222', '1234', '156' ]
    });

    // Configuration du champs 'part description'
    $("#client_part_description").autocomplete({
        source : [ '10101-1250', '10101-1729', '10101-3981' ]
    });

    $("#client_file_number").change(() => omc.saveFileNumber($("#client_file_number").val()));
    $("#client_part_description").change(() => omc.savePartDescription($("#client_part_description").val()));
    
    // Affichage des données user si déjà entrées
    if (window.localStorage["omc.clientFileNumber." + omc.dbName] != undefined)
    {
        $('#client_file_number').val(window.localStorage["omc.clientFileNumber." + omc.dbName]);
    }

    if (window.localStorage["omc.clientPartDescription." + omc.dbName] != undefined)
    {
        $('#client_part_description').val(window.localStorage["omc.clientPartDescription." + omc.dbName]);
    }

    $('#restart_session_button').button().click(() => {
        omc.resetStudy();
        $("#client_file_number").val(null);
        $("#client_part_description").val(null);
        $familySelect.val('-');
        $gradeInput.val('');
        $familySelect.selectmenu('refresh');
    });

    // Configuration des boutons de navigation
    $('#check_button').button();
    $('#upload_button').button();
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');
    $('#next_step_button').button().click(() => window.location = 'codesign_space.html');
});
