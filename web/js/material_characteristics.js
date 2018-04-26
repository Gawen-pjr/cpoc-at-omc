// Liaison entre le formulaire et Kadviser

var KVOWEB_BASE_URL          = 'https://alpenbox.kad-office.com/kvoweb/api/v1.0';
var KVOWEB_USER_TOKEN_HEADER = 'X-User-Token';

var kvowebUserToken;
var kvowebSession;
var materialDB;

jQuery(function($)
{
    function startSession()
    {
        var sessionActivatedCallback = function(data)
        {
            console.debug('OMC', 'Active session: ' + JSON.stringify(data));
            kvowebSession = data;
        }; 

        var sessionCreatedCallback = function(data)
        {
            console.debug('OMC', 'Session: ' + JSON.stringify(data));
            var sessionId = data.id;

            $.ajax(
                KVOWEB_BASE_URL + '/session/' + sessionId + '/activate',
                {
                    method  : 'POST',
                    headers : { [KVOWEB_USER_TOKEN_HEADER] : kvowebUserToken }
                } 
            ).done(sessionActivatedCallback);
        };

        var userLoggedCallback = function(data)
        {
            console.debug('OMC', 'Token: ' + JSON.stringify(data));
            kvowebUserToken = data.token;

            $.ajax(
                KVOWEB_BASE_URL + '/session',
                {
                    method  : 'POST',
                    headers : { [KVOWEB_USER_TOKEN_HEADER] : kvowebUserToken },
                    data    : { name : 'POC AT-OMC' , amiId : 1 }
                } 
            ).done(sessionCreatedCallback);
        };

        $.ajax(
            KVOWEB_BASE_URL + '/user/login',
            {
                method  : 'POST',
                data    : { login : 'toto' , password : 'titi' }
            } 
        ).done(userLoggedCallback);
    }

    startSession();

    // Configuration du champs 'project number'
    $( "#client_file_number" ).autocomplete({
        source: ['1111', '2222', '1234', '156']
    });

    // Configuration du champs 'part designation/part number'
    $( "#part_number" ).autocomplete({
        source: ['10101-1250', '10101-1729', '10101-3981']
    });

    // Configuration des champs 'family' et 'grade' à partir de la base de données JSON
    $.getJSON("data/materials.json", null, function(json) 
    {
        console.debug('OMC', 'materials.json loaded');
        materialDB = json;

        var $sel = $("#material_family");
        materialDB.families.forEach(function(f) {
            var $optGroup = $("<optgroup />").attr("label", f.name);
            $optGroup.appendTo($sel);

            f.subfamilies.forEach(function(sf) {
                $("<option />").attr({value: sf.id, id: sf.id}).text(sf.name).appendTo($optGroup);
            });
        });

        $sel.selectmenu();


        var $sel2 = document.getElementById("#material_grade");
        console.log($sel2)
        var name_grade = json.grades;
        console.log(name_grade);


    });

});


$( function materialGrade() {
    var grade = [
        '16CrNi4SPb',
        '100Cr6',
        '11SMn30 (s250)',
        '11SMn30Pb (s250Pb)',
        '11SMn30Pb+',
        '11SMn37 (s300)',
        '11SMn37Pb',
        '15SMn13',
        '16MnCr5',
        '16MnCrS5',
        '20MnCr5',
        '20NiCrMo2-2',
        '34CrMo4',
        '36SMnPb14',
        '38SMn28',
        '40SMnSi30',
        '44SMn28',
        '51CrV4',
        'C22',
        'C35E (+H)',
        'C40',
        'C45Pb',
        'C60E',

    ];
    $( "#material_grade" ).autocomplete({
      source: grade //changement valeur sélection de famille. On connait famille à l'instant t. 
    });
  } );

$( function materialPricePerTon() {
    var pricePerTon = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#material_price_per_ton" ).autocomplete({
      source: pricePerTon
    });
  } );

$( function unitarianPartPrice() {
    var partPrice = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#part_price" ).autocomplete({
      source: partPrice
    });
  } );

$( function materialTensileStregth() {
    var tensileStregth = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#material_tensile_stregth" ).autocomplete({
      source: tensileStregth
    });
  } );

$( function materialProofStress() {
    var proofStress = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#material_proof_stress" ).autocomplete({
      source: proofStress
    });
  } );

$( function materialHardness() {
    var hardness = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#material_hardness" ).autocomplete({
      source: hardness
    });
  } );

$( function materialElongation() {
    var elongation = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#material_elongation" ).autocomplete({
      source: elongation
    });
  } );

$( function materialWeldability() {
    var weldability = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#weldability" ).autocomplete({
      source: weldability
    });
  } );

$( function heatTreatability() {
    var treatability = [
        '1111',
        '2222',
        '1234',
        '156'
    ];
    $( "#heat_treatability" ).autocomplete({
      source: treatability
    });
  } );