
var KV_ATTRIBUTES = [ 'Module_young', 'Resistance_traction', 'Limite_elastique2', 'Durete', 'Allongement', 'Cout_operation', 'Soudabilite', 'Traitement_surface', 'Indice_outillage', 'Usinabilite', 'Prix_tonne' ];
var JS_ATTRIBUTES = [ 'e', 'rm', 'rp', 'hb', 'a', 'pi', 's', 'ts', 'iTool', 'u', 'pricePerTon' ];
var extremeIntervals = JSON.parse(localStorage.getItem("omc.extremeIntervals"));
var matchingMaterials = {};
var $clientFavoriteColor = localStorage.getItem("omc.clientFavoriteColor");


function setAttributeInterval(index, object, characteristics, callback)
{
    if(index >= JS_ATTRIBUTES.length)
    {
        callback();
        return;
    }

    var interval = characteristics[JS_ATTRIBUTES[index]];
    if(typeof interval === "undefined")
    {
        setAttributeInterval(index + 1, object, characteristics, callback);
        return;
    }
    
    if(typeof interval !== "object")
    {
        interval = [interval];
    }

    var kvValue = ((interval.length > 1) && (interval[0] != interval[1])) ? ('[ ' + interval[0] + ' ; ' + interval[1] + ' ]') : interval[0];
    kvoweb.setAttributeValue(object, KV_ATTRIBUTES[index], kvValue, () => setAttributeInterval(index + 1, object, characteristics, callback));
}

function sendMaterialCharacteristics(object, characteristics, callback)
{
    setAttributeInterval(0, object, characteristics, callback);
}

function sendToleranceIntervals(callback)
{
    var intervals = omc.toleranceIntervals || omc.defaultIntervals;
    if(!intervals)
    {
        return;
    }
    sendMaterialCharacteristics('mat', intervals, callback);
}

function prepareM0Grade(callback)
{
    if(!omc.userMaterial)
    {
        return;
    }
    sendMaterialCharacteristics('mat_m0', omc.userMaterial.characteristics, callback);
}

function sendMatchingGrade(grades, index, callback)
{
    if(index >= grades.length)
    {
        return;
    }

    kvoweb.setAttributeValue('mat', 'Nuance', grades[index], () => {

        sendMatchingGrade(grades, index + 1, callback);

        var kvMat = kvoweb.session.activeObjects.mat;
        var mat = {
            characteristics: {},
            name: grades[index],
        };

        for(var i = 0; i < KV_ATTRIBUTES.length; i++)
        {
            mat.characteristics[JS_ATTRIBUTES[i]] = kvMat.attributes[KV_ATTRIBUTES[i]].value;
        }

        var intervals = omc.toleranceIntervals || omc.defaultIntervals;
        if(!intervals || ((mat.characteristics.pi >= intervals.pi[0]) && (mat.characteristics.pi <= intervals.pi[1])))
        {
                callback(mat);
        }
    });
}

function sendMatchingGrades(grades, callback)
{
    sendMatchingGrade(grades, 0, callback);
}

function processFilteredGrades()
{
    var grades = kvoweb.session.activeObjects.mat.attributes.Nuance.value.split('\n').filter(g => (g != 'Inconnue') && (g != omc.userMaterial.name));
    console.debug('OMC', grades);
    
    kvoweb.restartSession();
    kvoweb.withSession(() => prepareM0Grade(() => sendMatchingGrades(grades, mat => selectMatchingMaterial(mat, $('#performance_index_select option:selected').val()))));
}

function selectMatchingMaterial(material, displayCharacteristic)
{
    console.debug('OMC', material);

    var x0 = omc.userMaterial.characteristics[displayCharacteristic];
    var xAmp = Math.max(x0 - extremeIntervals[displayCharacteristic][0], extremeIntervals[displayCharacteristic][1] - x0);
    // var xAmp = Math.max(x0 - 360.0, 1200.0 - x0);

    var y0 = omc.userMaterial.characteristics.pricePerTon;
    var yAmp = Math.max(y0 - 750.0, 4600.0 - y0);
    
    var pi = Number(material.characteristics.pi);

    var intervals = omc.toleranceIntervals || omc.defaultIntervals;
    if(intervals)
    {
        xAmp = Math.max(x0 - intervals[displayCharacteristic][0], intervals[displayCharacteristic][1] - x0);
    }

    var x = Number(material.characteristics[displayCharacteristic]);
    var y = Number(material.characteristics.pricePerTon);
    var xs = (x - x0) * (350.0 / xAmp);
    var ys = (y - y0) * (350.0 / yAmp);
    var title = material.name + ' (' + $('#performance_index_select option:selected').text() + '= ' + x.toFixed(0) + ' Mpa, Price per ton = ' + y.toFixed(0) + ', Price index = ' + pi.toFixed(0) + ')';
    mireFactory.create('#axe_abscisses', 'mire_' + material.name, 350 + xs, -5 - ys, (pi <= 100) ? '#008800' : '#EAA60C').attr('title', title);
    
    // Stockage des données matériaux dans l'objet global
    matchingMaterials[material.name] = {};
    matchingMaterials[material.name]["xs"] = xs;
    matchingMaterials[material.name]["ys"] = ys;
    matchingMaterials[material.name]["pi"] = pi;
    matchingMaterials[material.name]["title"] = title;

    localStorage.setItem("omc.matchingMaterials", JSON.stringify(matchingMaterials));
}

window.localStorage.removeItem("kvoweb.session");
omc.init();
kvoweb.init();

kvoweb.withSession(() => prepareM0Grade(() => sendToleranceIntervals(processFilteredGrades)));


// Affichage matériau M0
// var x0 = omc.userMaterial.characteristics[displayCharacteristic];
// var y0 = omc.userMaterial.characteristics.pricePerTon;
// var title = omc.userMaterial.name + ' (Rm = ' + x0 + ' Mpa, Raw material price index = ' + y0 + ')';
// window.mireFactory.create('#axe_abscisses', 'mire_M0', 350, -5, $clientFavoriteColor).attr('title', 'MO material');

jQuery($ => {
    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => window.location = 'material_characteristics.html');

    // Event fieldset
    $('#performance_index_select').change(() => $('#label_abscisses').text($('#performance_index_select option:selected').text()));
    $('#apply_button').button().click(() => kvoweb.withSession(() => prepareM0Grade(() => sendToleranceIntervals(processFilteredGrades))));

    // Récupération des données clients
    $('#client_part_description').append(localStorage.getItem("omc.clientPartDescription"));
    $('#client_file_number').append(localStorage.getItem("omc.clientFileNumber"));
});


