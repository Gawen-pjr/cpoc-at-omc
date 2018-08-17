// Fonctionnalités comunes du POC

var _omc =
{
	MATERIAL_DB_BASE_URL: "https://alpenbox.kad-office.com/cxf/omc/material-db/",
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
	dbName: undefined,

    init: function(dbName)
    {
        var chosenDb = window.localStorage.getItem("omc.dbName");
        _omc.dbName = dbName ? dbName : chosenDb;

        _omc.reloadMaterialDB();

        // Restauration de session
        var sessionGrade = window.localStorage.getItem("omc.userMaterial." + _omc.dbName);
        _omc.userMaterial = sessionGrade ? JSON.parse(sessionGrade) : undefined;

        var sessionIntervals = window.localStorage.getItem("omc.toleranceIntervals." + _omc.dbName);
        _omc.toleranceIntervals = sessionIntervals ? JSON.parse(sessionIntervals) : undefined;

        var defIntervals = window.localStorage.getItem("omc.defaultIntervals." + _omc.dbName);
        _omc.defaultIntervals = defIntervals ? JSON.parse(defIntervals) : undefined;

        var sessionMatches = window.localStorage.getItem("omc.matchingMaterials." + _omc.dbName);
        _omc.matchingMaterials = sessionMatches ? JSON.parse(sessionMatches) : undefined;
    },

    reloadMaterialDB: function()
    {
        // Requête asynchrone
        $.getJSON(_omc.MATERIAL_DB_BASE_URL + _omc.dbName, null, function(json)
        {
            console.debug('OMC', 'material DB ' + _omc.dbName + ' loaded from server');

            _omc.materialDB = json;
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
        window.localStorage.setItem("omc.userMaterial." + _omc.dbName, JSON.stringify(grade));
    },

    deleteUserMaterial: function()
    {
        _omc.userMaterial = undefined;
        window.localStorage.removeItem("omc.userMaterial." + _omc.dbName);
    },

    saveToleranceIntervals: function(intervals)
    {
        _omc.toleranceIntervals = intervals;
        window.localStorage.setItem("omc.toleranceIntervals." + _omc.dbName, JSON.stringify(intervals));
    },

    deleteToleranceIntervals: function()
    {
        _omc.toleranceIntervals = undefined;
        window.localStorage.removeItem("omc.toleranceIntervals." + _omc.dbName);
    },

    saveFileNumber: function(number)
    {
        _omc.clientFileNumber = number;
        window.localStorage.setItem("omc.clientFileNumber." + _omc.dbName, number);
    },

    deleteFileNumber: function()
    {
        _omc.clientFileNumber = undefined;
        window.localStorage.removeItem("omc.clientFileNumber." + _omc.dbName);
    },

    savePartDescription: function(description)
    {
        _omc.clientPartDescription = description;
        window.localStorage.setItem("omc.clientPartDescription." + _omc.dbName, description);
    },

    deletePartDescription: function()
    {
        _omc.clientPartDescription = undefined;
        window.localStorage.removeItem("omc.clientPartDescription." + _omc.dbName);
    },

    saveDefaultIntervals: function(intervals)
    {
        _omc.defaultIntervals = intervals;
        window.localStorage.setItem("omc.defaultIntervals." + _omc.dbName, JSON.stringify(intervals));
    },

    deleteDefaultIntervals: function()
    {
        _omc.defaultIntervals = undefined;
        window.localStorage.removeItem("omc.defaultIntervals." + _omc.dbName);
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
		window.localStorage.setItem("omc.matchingMaterials." + _omc.dbName, JSON.stringify(_omc.matchingMaterials));
    },
	
	deleteMatchingMaterials: function()
    {
        _omc.matchingMaterials = undefined;
        window.localStorage.removeItem("omc.matchingMaterials." + _omc.dbName);
    },

	getMatchingMaterials: function()
    {
		function computeOperationPriceIndex(material)
		{
			if(!_omc.userMaterial)
			{
				return;
			}

			m0characs = _omc.userMaterial.characteristics;
			characs = material.characteristics;
			characs.pi = 100 * (characs.iTool / characs.u) * (m0characs.u / m0characs.iTool);

			// XXX
			characs.pi = 100;
		}

		function testCandidateMaterial(material)
		{
			var characs = material.characteristics;
			for (charac in characs)
			{
				if(_omc.toleranceIntervals[charac] && (charac!="a")) // XXX
				{
					if ((characs[charac] < _omc.toleranceIntervals[charac][0]) || (characs[charac] > _omc.toleranceIntervals[charac][1]))
					{
						return false;
					}
				}
			}
			return true;
		}

		function findMatchingMaterials()
		{
			for (grade in _omc.materialDB.grades)
			{
				var mat = _omc.materialDB.grades[grade];
				computeOperationPriceIndex(mat);
				if (testCandidateMaterial(mat))
				{
					_omc.addMatchingMaterial(mat);
				}
			}
		}
		
		if(!_omc.userMaterial || !_omc.materialDB)
		{
			return undefined;
		}
		
        if(typeof _omc.matchingMaterials === "undefined")
		{
			findMatchingMaterials();
		}
		
		return _omc.matchingMaterials;
    },

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
