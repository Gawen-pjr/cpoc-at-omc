
var KV_ATTRIBUTES = [ 'Module_young', 'Resistance_traction', 'Limite_elastique2', 'Durete', 'Allongement', 'Cout_operation', 'Soudabilite', 'Traitement_surface', 'Indice_outillage', 'Usinabilite', 'Prix_tonne' ];
var JS_ATTRIBUTES = [ 'e', 'rm', 'rp', 'hb', 'a', 'pi', 's', 'ts', 'iTool', 'u', 'pricePerTon' ];

// // On récupère les text nodes correspondant aux input clients de la part designation
// var client_file_number = material_characteristics.getElementsByClassName("ui-widget")[0].lastChild;
// var client_part_designation = material_characteristics.getElementsByClassName("ui-widget")[1].lastChild;


// function setPartDescription(client_file_number,client_part_designation) 
// {
//     // Prend en entrée des text nodes contenant les inputs client et les affiche dans les cases
//     var project_number = document.createElement('a');
//     var part_designation = document.createElement('a');
//     var contener = document.getElementsByClassName("ui-widget");

//     project_number.appendChild(client_file_number);
//     part_designation.appendChild(client_part_designation);

//     contener[0].appendChild(project_number);
//     contener[1].appendChild(part_designation);

// }

// setPartDescription()


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
    kvoweb.withSession(() => prepareM0Grade(() => sendMatchingGrades(grades,displayMatchingMaterial)));
}

function displayMatchingMaterial(material)
{
    console.debug('OMC', material);

    var x0 = omc.userMaterial.characteristics.rm;
    var xAmp = Math.max(x0 - 360.0, 1200.0 - x0);

    var y0 = omc.userMaterial.characteristics.pricePerTon;
    var yAmp = Math.max(y0 - 750.0, 4600.0 - y0);
    
    var pi = Number(material.characteristics.pi);

    var intervals = omc.toleranceIntervals || omc.defaultIntervals;
    if(intervals)
    {
        xAmp = Math.max(x0 - intervals.rm[0], intervals.rm[1] - x0);
    }

    var x = Number(material.characteristics.rm); // TODO pouvoir choisir l'axe y
    var y = Number(material.characteristics.pricePerTon);
    var xs = (x - x0) * (350.0 / xAmp);
    var ys = (y - y0) * (350.0 / yAmp);
    var title = material.name + ' (Rm = ' + x.toFixed(0) + ' Mpa, Price per ton = ' + y.toFixed(0) + ', Price index = ' + pi.toFixed(0) + ')';
    mireFactory.create('#axe_abscisses', 'mire_' + material.name, 350 + xs, -5 - ys, (pi <= 100) ? '#008800' : '#EAA60C').attr('title', title);
}

// function setPartDescription() 
// {
//     // Prend en entrée des text nodes contenant les inputs client et les affiche dans les cases
//     var project_number = document.createElement('a');
//     var part_designation = document.createElement('a');
//     var contener = document.getElementsByClassName("ui-widget");

//     project_number.appendChild(document.createTextNode($clientFileNumber));
//     part_designation.appendChild(document.createTextNode($partDesignation));

//     contener[0].appendChild(project_number);
//     contener[1].appendChild(part_designation);

// }

window.localStorage.removeItem("kvoweb.session");
omc.init();
kvoweb.init();

kvoweb.withSession(() => prepareM0Grade(() => sendToleranceIntervals(processFilteredGrades)));

jQuery($ => {
    $( "#performance_index_select" ).selectmenu().attr('disabled',true);
    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => window.location = 'material_characteristics.html');

    // Récupération des données clients
    $('#client_part_description').append(localStorage.getItem("omc.clientPartDescription"));
    $('#client_file_number').append(localStorage.getItem("omc.clientFileNumber"));

});


