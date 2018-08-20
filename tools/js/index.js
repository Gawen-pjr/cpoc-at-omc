var chosenBdd = $('#bdd_select option:selected').val();

jQuery($ => {

    $.getJSON("poc.json", meta =>
        $('#versionning').text("v" + meta.version + " du " + meta.release_date)
    );

    formAction = localStorage.getItem("formAction");

    if (formAction)
    {
        var currentBdd = localStorage.getItem("chosenBdd");
        $('#bdd_select option[value=' + currentBdd + ']').attr('selected','selected');
        var form = document.getElementById('submit_form');
        form.action = formAction;
    }
    else
    {
        var form = document.getElementById('submit_form');
        form.action = "https://alpenbox.kad-office.com/cxf/omc/material-db/bdd-steels/csv";
    }

    $('#bdd_select').blur(() =>
    {
    	chosenBdd = $('#bdd_select option:selected').val();
        localStorage.setItem("chosenBdd", chosenBdd);

    	var form = document.getElementById('submit_form');
		form.action = "https://alpenbox.kad-office.com/cxf/omc/material-db/" + chosenBdd + "/csv";
        localStorage.setItem("formAction", form.action);
        omc.MATERIAL_DB_URL = form.action;
    });
});
