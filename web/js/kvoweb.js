// Liaison entre le formulaire et Kadviser

var _kvoweb =
{
    KVOWEB_BASE_URL : 'https://alpenbox.kad-office.com/kvoweb/api/v1.0',
    USER : 'toto',
    PASS : 'titi',

    userToken : undefined,
    session : undefined,

    apiCall : function(endpoint, method, data, callback, errorHandler)
    {
        $.ajax(_kvoweb.KVOWEB_BASE_URL + endpoint, {
            method : method,
            headers :
            {
                'X-User-Token' : _kvoweb.userToken
            },
            data : data,
            success: callback,
            error: errorHandler,
        });
    },

    apiGet : function(endpoint, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'GET', undefined, callback, errorHandler);
    },

    apiPost : function(endpoint, data, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'POST', data, callback, errorHandler);
    },

    apiDelete : function(endpoint, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'DELETE', undefined, callback, errorHandler);
    },

    apiPatch : function(endpoint, data, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'PATCH', data, callback, errorHandler);
    },

    apiPut : function(endpoint, data, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'PUT', data, callback, errorHandler);
    },

    login : function(callback)
    {
        var data =
        {
            login : _kvoweb.USER,
            password : _kvoweb.PASS
        };

        _kvoweb.apiPost('/user/login', data, resp => {
            console.debug('OMC', 'User token: ' + resp.token);
            _kvoweb.userToken = resp.token;
            callback();
        });
    },

    init : function()
    {
        _kvoweb.login(() => {
            var lastSession = window.localStorage.getItem("kvoweb.session");
            if (lastSession)
            {
                _kvoweb.apiGet('/session/' + JSON.parse(lastSession).id, session => {
                    _kvoweb.session = session;
                    console.info('OMC', 'Retrieved session #' + _kvoweb.session.id);
                },() => {
                    console.info('OMC', 'Session deleted on server. Creating a new one');
                    _kvoweb.createAndActivateSession();
                    // TODO restaurer la session avec les valeurs en cache
                });
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
        window.localStorage.removeItem("kvoweb.session");
        if (_kvoweb.session)
        {
            var id = _kvoweb.session.id;
            _kvoweb.session = undefined;
            _kvoweb.apiDelete('/session/' + id, _kvoweb.createAndActivateSession, _kvoweb.createAndActivateSession);
        }
    },

    setAttributeValue : function(object, attribute, value, callback)
    {
        if (!_kvoweb.session)
        {
            console.warn('OMC',"No Kvoweb active session");
            return;
        }

        _kvoweb.apiPatch('/session/' + _kvoweb.session.id + '/object/' + object + '/attribute/' + attribute, '"' + value  + '"', session => {
            _kvoweb.session = session;
            callback(session);
        });
    },

    createAndActivateSession : function()
    {
        var data =
        {
            name : 'POC AT-OMC',
            amiId : 1
        };

        _kvoweb.apiPost('/session', data, session => {
            _kvoweb.apiPost('/session/' + session.id + '/activate', undefined, activatedSession => {
                _kvoweb.session = activatedSession;
                window.localStorage.setItem("kvoweb.session", JSON.stringify(activatedSession));
                console.info('OMC', 'Activated session #' + activatedSession.id);
            });
        });
    },
};

window.kvoweb = _kvoweb;
