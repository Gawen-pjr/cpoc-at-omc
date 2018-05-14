// Fonctionnalités comunes du POC

var _omc =
{
    MATERIAL_DB_URL: 'data/materials.json',

    kvoweb: undefined,
    materialDB: undefined,
    userMaterial: undefined,
    toleranceIntervals: undefined,
    defaultIntervals: undefined,

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

    saveDefaultIntervals: function(intervals)
    {
        _omc.defaultIntervals = intervals;
        window.localStorage.setItem("omc.defaultIntervals", JSON.stringify(intervals));
    },

    deleteToleranceIntervals: function()
    {
        _omc.toleranceIntervals = undefined;
        window.localStorage.removeItem("omc.toleranceIntervals");
    },

    resetStudy: function()
    {
        _omc.userMaterial = undefined;
        _omc.toleranceIntervals = undefined;
        _omc.kvoweb.restartSession();
        window.localStorage.removeItem("omc.userMaterial");
        window.localStorage.removeItem("omc.toleranceIntervals");
    },
};

window.omc = _omc;
