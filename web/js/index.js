user.init()

jQuery($ => {

	$('#start_button').button().click(() => window.location = 'material_characteristics.html');

    // Sauvegarde données client
    $('#client_society_name').change(() => localStorage.setItem('client_society_name', $('#client_society_name').val()));
    $('#client_trigramme').change(() => localStorage.setItem('client_trigramme', $('#client_trigramme').val()));
    $('#colorpicker').change(() => user.saveFavoriteColor($('#colorpicker').val()));


	// Configuration données
    if (user.userFavoriteColor != undefined)
    {
        $('#colorpicker').val(user.userFavoriteColor);
    }
    else
    {
        user.saveFavoriteColor($('#colorpicker').val());
    }

    if (localStorage.getItem('client_society_name') != undefined)
    {
        $('#client_society_name').val(localStorage.getItem('client_society_name'));
    }
    else
    {
        localStorage.setItem('client_society_name', $('#client_society_name').val());
    }

    if (localStorage.getItem('client_trigramme') != undefined)
    {
        $('#client_trigramme').val(localStorage.getItem('client_trigramme'));
    }
    else
    {
        localStorage.setItem('client_trigramme', $('#client_trigramme').val());
    }

    $('#logo_alpentech').click(() => window.location = 'http://www.alpen-tech.com/');

    // Changement de langue
    $('#french_icon').click(() => window.location = '/index.html');
    $('#english_icon').click(() => window.location = '/index_en.html');
});