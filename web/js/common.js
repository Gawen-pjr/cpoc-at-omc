// Fonctionnalités comunes du POC

var _omc =
{
    MATERIAL_DB_URL: undefined,
	KV_ATTRIBUTES: [ 'Module_young', 'Resistance_traction', 'Limite_elastique2', 'Durete', 'Allongement', 'Cout_operation', 'Soudabilite', 'Traitement_surface', 'Indice_outillage', 'Usinabilite', 'Prix_tonne' ],
	JS_ATTRIBUTES: [ 'e', 'rm', 'rp', 'hb', 'a', 'pi', 's', 'ts', 'iTool', 'u', 'pricePerTonMin', 'pricePerTon', 'pricePerTonMax' ],
	ATTR_MULT: { 'e':1.0, 'rm':1.0, 'rp':1.0, 'hb':1.0, 'a':100.0, 'pi':1.0, 's':1.0, 'ts':1.0, 'iTool':1.0, 'u':1.0, 'pricePerTonMin':1.0, 'pricePerTon':1.0, 'pricePerTonMax':1.0 },
	ATTR_AMP: { 'e':250.0, 'rm':1200.0, 'rp':1200.0, 'hb':500.0, 'a':0.5, 'pi':200.0, 's':3.0, 'ts':3.0, 'iTool':0.15, 'u':100.0, 'pricePerTonMin':5000.0, 'pricePerTon':5000.0, 'pricePerTonMax':5000.0 },

    materialDB: undefined,
    userMaterial: undefined,
    toleranceIntervals: undefined,
    defaultIntervals: undefined,
    matchingMaterials: undefined,
	matchingMaterialsCallbacks: [],
	clientFileNumber: undefined,
	clientPartDescription: undefined,
	matToken: 0,
    matchingGradesComputationListener: [],

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

			json.subfamilies = {};
			Object.values(json.families).forEach(f => {
				Object.values(f.subfamilies).forEach(sf => {
					json.subfamilies[sf.id] = sf;
					sf.family = f.id;
				});
			});

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

    saveFileNumber: function(number)
    {
        _omc.clientFileNumber = number;
        window.localStorage.setItem("omc.clientFileNumber", number);
    },

    deleteFileNumber: function()
    {
        _omc.clientFileNumber = undefined;
        window.localStorage.removeItem("omc.clientFileNumber");
    },

    savePartDescription: function(description)
    {
        _omc.clientPartDescription = description;
        window.localStorage.setItem("omc.clientPartDescription", description);
    },

    deletePartDescription: function()
    {
        _omc.clientPartDescription = undefined;
        window.localStorage.removeItem("omc.clientPartDescription");
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

    resetMatToken: function()
    {
    	_omc.matToken = 0;
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

    testMatchingMaterial(material)
    {
        if(typeof _omc.matchingMaterials === "undefined")
        {
            _omc.matchingMaterials = {};
        }

        var matTest = true;
        
        for (charac in material.keys())
        {
            if (material[charac] < omc.toleranceIntervals[charac][0] || material[charac] > omc.toleranceIntervals[charac][1])
            {
                matTest = false;
            }
        }

        if (matTest)
        {
            addMatchingMaterial(material);
        }
    }

    resetStudy: function()
    {
        _omc.deleteUserMaterial();
        _omc.deleteToleranceIntervals();
        _omc.deleteDefaultIntervals();
        _omc.deleteMatchingMaterials();
        _omc.deletePartDescription();
        _omc.deleteFileNumber();
    },
};

var _user =
{
	userFavoriteColor: undefined,
	displayCharacteristic: undefined,
    displayPriceIndex: undefined,

	init: function()
    {
        var sessionColor = window.localStorage.getItem("user.userFavoriteColor");
        _user.userFavoriteColor = sessionColor ? sessionColor : undefined;
    
        var sessionCharacteristic = window.localStorage.getItem("user.displayCharacteristic");
        _user.displayCharacteristic = sessionCharacteristic ? sessionCharacteristic : undefined;
        
        var sessionPriceIndex = window.localStorage.getItem("user.displayPriceIndex");
        _user.displayPriceIndex = sessionPriceIndex ? sessionPriceIndex : undefined;
    },

	saveFavoriteColor: function(color)
	{
		_user.userFavoriteColor = color;
        window.localStorage.setItem("user.userFavoriteColor", color);
    },

    saveDisplayCharacteristic: function(characteristic)
    {
    	_user.displayCharacteristic = characteristic;
        window.localStorage.setItem("user.displayCharacteristic", characteristic);
    },

    saveDisplayPriceIndex: function(index)
    {
        _user.displayPriceIndex = index;
        window.localStorage.setItem("user.displayPriceIndex", index);
    },
}

window.omc = _omc;
window.user = _user;
