user.init()

jQuery($ => {

	$('#start_button').button().click(() => window.location = 'material_characteristics.html');

	// Configuration color picker
    $('#colorpicker').change(() => user.saveFavoriteColor($('#colorpicker').val()));

    if (user.userFavoriteColor != undefined)
    {
        $('#colorpicker').val(user.userFavoriteColor);
    }
    else
    {
        user.saveFavoriteColor($('#colorpicker').val());
    }
});