// Liaison entre le formulaire et Kadviser

var _kvoweb =
{
    KVOWEB_BASE_URL : 'https://alpenbox.kad-office.com/kvoweb/api/v1.0',
    USER : 'toto',
    PASS : 'titi',

    userToken : undefined,
    session : undefined,

    apiCall : function(endpoint, method, data, callback)
    {
        $.ajax(_kvoweb.KVOWEB_BASE_URL + endpoint,
        {
            method : method,
            headers :
            {
                'X-User-Token' : _kvoweb.userToken
            },
            data : data
        }).done(callback);
    },

    apiGet : function(endpoint, callback)
    {
        _kvoweb.apiCall(endpoint, 'GET', undefined, callback);
    },

    apiPost : function(endpoint, data, callback)
    {
        _kvoweb.apiCall(endpoint, 'POST', data, callback);
    },

    apiDelete : function(endpoint, callback)
    {
        _kvoweb.apiCall(endpoint, 'DELETE', undefined, callback);
    },

    apiPatch : function(endpoint, data, callback)
    {
        _kvoweb.apiCall(endpoint, 'PATCH', data, callback);
    },

    apiPut : function(endpoint, data, callback)
    {
        _kvoweb.apiCall(endpoint, 'PUT', data, callback);
    },

    login : function(callback)
    {
        var data =
        {
            login : _kvoweb.USER,
            password : _kvoweb.PASS
        };

        _kvoweb.apiPost('/user/login', data, function(data)
        {
            console.debug('OMC', 'User token: ' + data.token);
            _kvoweb.userToken = data.token;
            callback();
        });
    },

    init : function()
    {
        _kvoweb.login(function()
        {
            var lastSession = window.localStorage.getItem("kvoweb.session");

            if (lastSession)
            {
                _kvoweb.session = JSON.parse(lastSession);
                console.info('OMC', 'Retrieved session #' + _kvoweb.session.id);
            }
            else
            {
                _kvoweb.createAndActivateSession();
            }
        });
    },

    saveSession : function()
    {
    // TODO à implémenter
    },

    deleteOldSessions : function()
    {
        _kvoweb.apiDelete('/session');
    },

    restartSession : function()
    {
        if (_kvoweb.session)
        {
            _kvoweb.apiDelete('/session/' + _kvoweb.session.id, _kvoweb.createAndActivateSession);
        }
        else
        {
            _kvoweb.createAndActivateSession()
        }
    },

    createAndActivateSession : function()
    {
        var data =
        {
            name : 'POC AT-OMC',
            amiId : 1
        };

        _kvoweb.apiPost('/session', data, function(data)
        {
            _kvoweb.apiPost('/session/' + data.id + '/activate', undefined, function(data)
            {
                _kvoweb.session = data;
                window.localStorage.setItem("kvoweb.session", JSON.stringify(data));
                console.info('OMC', 'Activated session #' + data.id);
            });
        });
    },
};

window.kvoweb = _kvoweb;
