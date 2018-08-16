var chosenBdd = "";

jQuery($ => {

    $.getJSON("poc.json", meta =>
        $('#versionning').text("v" + meta.version + " du " + meta.release_date)
    );

    $('#bdd_select').blur(() =>
    {
    	chosenBdd = $('#bdd_select option:selected').val();
    	var form = document.getElementById('submit_form');
		form.action = "https://alpenbox.kad-office.com/cxf/omc/material-db/" + chosenBdd + "/csv";
        omc.MATERIAL_DB_URL = form.action;
    });
});
