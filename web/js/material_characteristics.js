// Code-behind pour le formulaire material_characteristics

kvoweb.init();

var materialDB;
var sessionGrade = window.localStorage.getItem("omc.referenceGrade");
var currentGrade = sessionGrade ? JSON.parse(sessionGrade) : undefined;

function clearMaterialFields()
{
    $('#material_price_per_ton').val('-');
    $('#part_price').val('-');
    $('#material_tensile_strength').val('-');
    $('#material_proof_stress').val('-');
    $('#material_hardness').val('-');
    $('#material_elongation').val('-');
    $('#material_weldability').val('-');
    $('#material_heat_treatability').val('-');
}

function setMaterialFields(grade)
{
    $('#material_price_per_ton').val(grade.characteristics.pricePerTon);
    $('#part_price').val(100);
    $('#material_tensile_strength').val(grade.characteristics.rm);
    $('#material_proof_stress').val(grade.characteristics.rp);
    $('#material_hardness').val(grade.characteristics.hb);
    $('#material_elongation').val(Number(grade.characteristics.a * 100).toFixed(2));
    $('#material_weldability').val(materialDB.messages['weldability_' + grade.characteristics.s]);
    $('#material_heat_treatability').val(materialDB.messages['heat_treatability_' + grade.characteristics.ts]);
}

jQuery(function($)
{
    var $gradeInput = $('#material_grade');
    var $familySelect = $('#material_family');

    function setGradeAutocompletion(family)
    {
        var familyGrades = [];

        if (!currentGrade || (family != currentGrade.family))
        {
            $gradeInput.val('');
            clearMaterialFields();
        }

        materialDB.grades.forEach(function(grade)
        {
            if (grade.family == family)
            {
                familyGrades.push(grade.name);
            }
        });

        $gradeInput.autocomplete(
        {
            source : familyGrades
        });
    }

    // Configuration des champs 'family' et 'grade' à partir de la base de
    // données JSON
    $.getJSON("data/materials.json", null, function(json)
    {
        console.debug('OMC', 'materials.json loaded');
        materialDB = json;

        $('<option value="-">-</option>').appendTo($familySelect);

        materialDB.families.forEach(function(f)
        {
            var $optGroup = $('<optgroup />').attr('label', f.name);
            $optGroup.appendTo($familySelect);

            f.subfamilies.forEach(function(sf)
            {
                $('<option />').val(sf.id).text(sf.name).appendTo($optGroup);
            });
        });

        if (currentGrade)
        {
            $familySelect.val(currentGrade.family);
            $gradeInput.val(currentGrade.name);
            setMaterialFields(currentGrade);
            setGradeAutocompletion(currentGrade.family);
        }

        $familySelect.selectmenu('refresh');
    });

    // Configuration du champs 'project number'
    $("#client_file_number").autocomplete(
    {
        source : [ '1111', '2222', '1234', '156' ]
    });

    // Configuration du champs 'part designation/part number'
    $("#part_number").autocomplete(
    {
        source : [ '10101-1250', '10101-1729', '10101-3981' ]
    });

    $familySelect.selectmenu(
    {
        select : function(event, ui)
        {
            setGradeAutocompletion(ui.item.value);
        }
    });

    $gradeInput.change(function()
    {
        var gradeName = $gradeInput.val();
        currentGrade = undefined;
        materialDB.grades.forEach(function(g)
        {
            if (g.name == gradeName)
            {
                currentGrade = g;
            }
        });

        console.debug('OMC', currentGrade);

        if (currentGrade)
        {
            $familySelect.val(currentGrade.family);
            window.localStorage.setItem("omc.referenceGrade", JSON.stringify(currentGrade));
            setMaterialFields(currentGrade);
        }
        else
        {
            if (gradeName != '')
            {
                $familySelect.val('-');
                console.debug('OMC', 'No matching grade');
            }
            window.localStorage.removeItem("omc.referenceGrade");
            clearMaterialFields();
        }

        $familySelect.selectmenu('refresh');
    });

    $('#restart_session_button').button().click(function()
    {
        window.localStorage.removeItem("omc.referenceGrade");
        currentGrade = undefined;
        $familySelect.val('-');
        $gradeInput.val('');
        $familySelect.selectmenu('refresh');
        kvoweb.restartSession();
    });

    $('#check_button').button();
    $('#upload_button').button();

    $('#visualisation_button').button().click(function()
    {
        window.location = 'visualisation_m0.html';
    });

    $('#next_step_button').button().click(function()
    {
        window.location = 'codesign_space.html';
    });
});
