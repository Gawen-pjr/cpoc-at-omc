// Fonctionnalités comunes du POC

var _omc =
{
    MATERIAL_DB_URL: 'data/materials.json',
	KV_ATTRIBUTES: [ 'Module_young', 'Resistance_traction', 'Limite_elastique2', 'Durete', 'Allongement', 'Cout_operation', 'Soudabilite', 'Traitement_surface', 'Indice_outillage', 'Usinabilite', 'Prix_tonne' ],
	JS_ATTRIBUTES: [ 'e', 'rm', 'rp', 'hb', 'a', 'pi', 's', 'ts', 'iTool', 'u', 'pricePerTon' ],

    kvoweb: undefined,
    materialDB: undefined,
    userMaterial: undefined,
    toleranceIntervals: undefined,
    defaultIntervals: undefined,
    matchingMaterials: undefined,
	matchingMaterialsCallbacks: [],

    init: function()
    {
        _omc.kvoweb = window.kvoweb;
        
        var cachedDB = window.localStorage.getItem("omc.materialDB");
        _omc.materialDB = cachedDB ? JSON.parse(cachedDB) : undefined;
        
        if(!_omc.materialDB)
        {
            _omc.reloadMaterialDB();
        }

        // Restauration de session
        var sessionGrade = window.localStorage.getItem("omc.userMaterial");
        _omc.userMaterial = sessionGrade ? JSON.parse(sessionGrade) : undefined;

        var sessionIntervals = window.localStorage.getItem("omc.toleranceIntervals");
        _omc.toleranceIntervals = sessionIntervals ? JSON.parse(sessionIntervals) : undefined;

        var defIntervals = window.localStorage.getItem("omc.defaultIntervals");
        _omc.defaultIntervals = defIntervals ? JSON.parse(defIntervals) : undefined;

        var sessionMatches = window.localStorage.getItem("omc.matchingMaterials");
        _omc.matchingMaterials = sessionMatches ? JSON.parse(sessionMatches) : undefined;
    },

    reloadMaterialDB: function()
    {
        // Requête asynchrone
        $.getJSON(_omc.MATERIAL_DB_URL, null, function(json)
        {
            console.debug('OMC', 'material DB loaded from server');
            _omc.materialDB = json;
            window.localStorage.setItem("omc.materialDB", JSON.stringify(_omc.materialDB));
        });
    },

    withMaterialDB: function(callback)
    {
        if(_omc.materialDB)
        {
            callback(_omc.materialDB);
        }
        else
        {
            setTimeout(() => _omc.withMaterialDB(callback), 250);
        }
    },

    saveUserMaterial: function(grade)
    {
        _omc.userMaterial = grade;
        window.localStorage.setItem("omc.userMaterial", JSON.stringify(grade));
    },

    deleteUserMaterial: function()
    {
        _omc.userMaterial = undefined;
        window.localStorage.removeItem("omc.userMaterial");
    },

    saveToleranceIntervals: function(intervals)
    {
        _omc.toleranceIntervals = intervals;
        window.localStorage.setItem("omc.toleranceIntervals", JSON.stringify(intervals));
    },

    deleteToleranceIntervals: function()
    {
        _omc.toleranceIntervals = undefined;
        window.localStorage.removeItem("omc.toleranceIntervals");
    },

    saveDefaultIntervals: function(intervals)
    {
        _omc.defaultIntervals = intervals;
        window.localStorage.setItem("omc.defaultIntervals", JSON.stringify(intervals));
    },

    deleteDefaultIntervals: function()
    {
        _omc.defaultIntervals = undefined;
        window.localStorage.removeItem("omc.defaultIntervals");
    },

    addMatchingMaterial: function(material)
    {
		if(typeof _omc.matchingMaterials === "undefined")
		{
			_omc.matchingMaterials = {};
		}
        _omc.matchingMaterials[material.name] = material;
		window.localStorage.setItem("omc.matchingMaterials", JSON.stringify(_omc.matchingMaterials));
    },
	
	deleteMatchingMaterials: function()
    {
        _omc.matchingMaterials = undefined;
        window.localStorage.removeItem("omc.matchingMaterials");
    },

    computeMatchingMaterials: function()
	{
		function setAttributeInterval(index, object, characteristics, callback)
		{
			if(index >= _omc.JS_ATTRIBUTES.length)
			{
				callback();
				return;
			}

			var interval = characteristics[_omc.JS_ATTRIBUTES[index]];
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
			_omc.kvoweb.setAttributeValue(object, _omc.KV_ATTRIBUTES[index], kvValue, () => setAttributeInterval(index + 1, object, characteristics, callback));
		}

		function sendMaterialCharacteristics(object, characteristics, callback)
		{
			setAttributeInterval(0, object, characteristics, callback);
		}

		function sendToleranceIntervals(callback)
		{
			var intervals = _omc.toleranceIntervals || _omc.defaultIntervals;
			if(!intervals)
			{
				return;
			}
			sendMaterialCharacteristics('mat', intervals, callback);
		}

		function prepareM0Grade(callback)
		{
			if(!_omc.userMaterial)
			{
				return;
			}
			sendMaterialCharacteristics('mat_m0', _omc.userMaterial.characteristics, callback);
		}

		function sendMatchingGrade(grades, index)
		{
			if(index >= grades.length)
			{
				_omc.matchingMaterialsCallbacks = [];
				return;
			}

			_omc.kvoweb.setAttributeValue('mat', 'Nuance', grades[index], () => {

				sendMatchingGrade(grades, index + 1);

				var kvMat = _omc.kvoweb.session.activeObjects.mat;
				var mat = {
					characteristics: {},
					name: grades[index],
				};

				for(var i = 0; i < _omc.KV_ATTRIBUTES.length; i++)
				{
					mat.characteristics[_omc.JS_ATTRIBUTES[i]] = kvMat.attributes[_omc.KV_ATTRIBUTES[i]].value;
				}

				var intervals = _omc.toleranceIntervals || _omc.defaultIntervals;
				if(!intervals || ((mat.characteristics.pi >= intervals.pi[0]) && (mat.characteristics.pi <= intervals.pi[1])))
				{
					_omc.addMatchingMaterial(mat);
					_omc.matchingMaterialsCallbacks.forEach(callback => callback(mat));
				}
			});
		}

		function sendMatchingGrades(grades)
		{
			sendMatchingGrade(grades, 0);
		}

		function processFilteredGrades()
		{
			var grades = _omc.kvoweb.session.activeObjects.mat.attributes.Nuance.value.split('\n').filter(g => (g != 'Inconnue') && (g != _omc.userMaterial.name));
			console.debug('OMC', grades);
			
			kvoweb.restartSession();
			kvoweb.withSession(() => prepareM0Grade(() => sendMatchingGrades(grades)));
		}
		
		alert('Please wait while suggestions are being calculated.\nClick "Ok" to go on.');
		window.localStorage.removeItem("kvoweb.session");
		_omc.kvoweb.init();
		_omc.kvoweb.withSession(() => prepareM0Grade(() => sendToleranceIntervals(processFilteredGrades)));
	},

	withMatchingMaterials: function(callback)
	{
		_omc.matchingMaterialsCallbacks.push(callback);
		
		if(typeof _omc.matchingMaterials !== 'undefined')
		{
			for(key in _omc.matchingMaterials)
			{
				callback(_omc.matchingMaterials[key]);
			}
		}
		else
		{
			_omc.deleteMatchingMaterials();
			_omc.matchingMaterials = {};
			_omc.computeMatchingMaterials();
		}
	},

    resetStudy: function()
    {
        _omc.deleteUserMaterial();
        _omc.deleteToleranceIntervals();
        _omc.deleteDefaultIntervals();
        _omc.deleteMatchingMaterials();
    },
};

window.omc = _omc;
