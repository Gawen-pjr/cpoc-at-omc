
kvoweb.init();


//Yield stregh slider
    $(function()
    {
        $("#slider-range").slider(
        {
            range : true,
            min : 0,
            max : 1200,
            values : [ 300, 600 ],
            slide : function(event, ui)
            {
                $("#amount").val(ui.values[0] + " MPa" + " - " + ui.values[1] + " MPa");
            }
        });
        $("#amount").val(
                $("#slider-range").slider("values", 0) + " MPa" + " - " + $("#slider-range").slider("values", 1)
                        + " MPa");
    });

//Ultimate stregh slider
    $(function()
    {
        $("#slider-range2").slider(
        {
            range : true,
            min : 0,
            max : 1200,
            values : [ 550, 700 ],
            slide : function(event, ui)
            {
                $("#amount2").val(ui.values[0] + " MPa" + " - " + ui.values[1] + " MPa");
            }
        });
        $("#amount2").val(
                $("#slider-range2").slider("values", 0) + " MPa" + " - " + $("#slider-range2").slider("values", 1)
                        + " MPa");
    });

//Elongation percentage slider
    $(function()
    {
        $("#slider-range3").slider(
        {
            range : true,
            min : 0,
            max : 30,
            values : [ 10, 15 ],
            slide : function(event, ui)
            {
                $("#amount3").val(ui.values[0] + " %" + " - " + ui.values[1] + " %");
            }
        });
        $("#amount3")
                .val(
                        $("#slider-range3").slider("values", 0) + " %" + " - "
                                + $("#slider-range3").slider("values", 1) + " %");
    });

//Hardness slider
    $(function()
    {
        $("#slider-range4").slider(
        {
            range : true,
            min : 0,
            max : 500,
            values : [ 150, 200 ],
            slide : function(event, ui)
            {
                $("#amount4").val(ui.values[0] + " HB" + " - " + ui.values[1] + " HB");
            }
        });
        $("#amount4").val(
                $("#slider-range4").slider("values", 0) + " HB" + " - " + $("#slider-range4").slider("values", 1)
                        + " HB");
    });

//Slider prix pièce
    $(function()
    {
        $("#slider-range5").slider(
        {
            range : true,
            min : 0,
            max : 200,
            values : [ 75, 115 ],
            slide : function(event, ui)
            {
                $("#amount5").val(Math.round((ui.values[0])) + " - " + Math.round((ui.values[1])));
            }
        });
        $("#amount5").val($("#slider-range5").slider("values", 0) + " - " + $("#slider-range5").slider("values", 1));
    });

jQuery(function($)
{
//Radiobox
    $(function()
    {
        $("input[type='radio']").checkboxradio(); // inupt.classe_des_radioboutons
        $("fieldset").controlgroup();
    });

    $('#calculation_button').button().click(function()
      {
          window.location = 'mire_ramo.html';
      });

    $('#return_button').button().click(function()
      {
          window.location = 'material_characteristics.html';
      });
});
