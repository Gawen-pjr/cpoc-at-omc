// Liaison entre le formulaire et Kadviser

var materialDB;

kvoweb.init();

jQuery(function($)
{
    $('#restart_session_button').button().click(kvoweb.restartSession);

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

    // Configuration des champs 'family' et 'grade' à partir de la base de
    // données JSON
    $.getJSON("data/materials.json", null, function(json)
    {
        console.debug('OMC', 'materials.json loaded');
        materialDB = json;

        var $gradeInput = $('#material_grade');
        var $familySelect = $('#material_family');

        $('<option>-</option>').appendTo($familySelect);

        materialDB.families.forEach(function(f)
        {
            var $optGroup = $('<optgroup />').attr('label', f.name);
            $optGroup.appendTo($familySelect);

            f.subfamilies.forEach(function(sf)
            {
                $('<option />').attr(
                {
                    value : sf.id,
                    id : sf.id
                }).text(sf.name).appendTo($optGroup);
            });
        });

        $familySelect.selectmenu(
        {
            select : function(event, ui)
            {
                var familyGrades = [];
                var selectedFamily = ui.item.value;

                materialDB.grades.forEach(function(grade)
                {
                    if (grade.family == selectedFamily)
                    {
                        familyGrades.push(grade.name);
                    }
                });

                $gradeInput.autocomplete(
                {
                    source : familyGrades
                });
            }
        });
    });
});
