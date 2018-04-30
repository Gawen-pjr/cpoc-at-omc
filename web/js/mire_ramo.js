
kvoweb.init();

$( function() 
{
    $( "#performance_index" ).selectmenu();
});

jQuery(function($)
{
    $('#back_button').button().click(function()
    {
        window.location = 'codesign_space.html';
    });

    $('#print_button').button().click(function()
    {
        window.location = 'material_characteristics.html';
    });

    $('#homepage_button').button().click(function()
    {
        window.location = 'material_characteristics.html';
    });

});