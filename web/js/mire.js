// Code JS d'installation d'une mire en (x,y)

var _mireFactory =
{
    HTML : '\
      <div class="mire_container">\
        <div class="mire"> \
          <div class="grand_cercle"> \
            <div class="arc_haut_1"> \
              <div class="arc_haut_2"> \
                <div class="arc_haut_3"></div> \
              </div> \
            </div> \
            <div class="arc_bas_1"> \
              <div class="arc_bas_2"> \
                <div class="arc_bas_3"></div> \
              </div> \
            </div> \
          </div> \
          <div class="petit_cercle"></div> \
          <div class="axe_abscisses"></div> \
          <div class="axe_ordonnees"></div> \
        </div> \
      </div>',

    create : function(targetSelector, id, x, y, color)
    {
        color = color || '#000000';
        x -= 18.75;
        y -= 18.75;

        $target = $(targetSelector);
        $target.css('position', 'relative');

        $mire = $(_mireFactory.HTML).css('left', x + 'px').css('top', y + 'px').attr('id', id);
        $('div', $mire).css('border-color', color);
        $mire.appendTo($target);

        return $mire;
    },
};

window.mireFactory = _mireFactory;
