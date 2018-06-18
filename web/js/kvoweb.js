// Liaison entre le formulaire et Kadviser

var _kvoweb =
{
    KVOWEB_BASE_URL: 'https://alpenbox.kad-office.com/kvoweb/api/v1.0',
    USER: 'toto',
    PASS: 'titi',

    userToken: undefined,
    session: undefined,

    apiCall: function(endpoint, method, data, contentType, callback, errorHandler)
    {
        $.ajax(_kvoweb.KVOWEB_BASE_URL + endpoint, {
            method : method,
            headers :
            {
                'X-User-Token' : _kvoweb.userToken
            },
            data : data,
            contentType: contentType,
            success: callback,
            error: errorHandler,
        });
    },

    apiGet: function(endpoint, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'GET', undefined, false, callback, errorHandler);
    },

    apiPost: function(endpoint, data, contentType, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'POST', data, contentType, callback, errorHandler);
    },

    apiDelete: function(endpoint, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'DELETE', undefined, false, callback, errorHandler);
    },

    apiPatch: function(endpoint, data, contentType, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'PATCH', data, contentType, callback, errorHandler);
    },

    apiPut: function(endpoint, data, contentType, callback, errorHandler)
    {
        _kvoweb.apiCall(endpoint, 'PUT', data, contentType, callback, errorHandler);
    },

    login: function(callback)
    {
        var data =
        {
            login : _kvoweb.USER,
            password : _kvoweb.PASS
        };

        _kvoweb.apiPost('/user/login', data, 'application/x-www-form-urlencoded; charset=UTF-8', resp => {
            console.debug('OMC', 'User token: ' + resp.token);
            _kvoweb.userToken = resp.token;
            callback();
        });
    },

    init: function()
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

    saveSession: function()
    {
        // TODO à implémenter
    },

    deleteOldSessions : function()
    {
        _kvoweb.apiDelete('/session');
    },

    restartSession: function()
    {
        window.localStorage.removeItem("kvoweb.session");
        if (_kvoweb.session)
        {
            var id = _kvoweb.session.id;
            _kvoweb.session = undefined;
            _kvoweb.apiDelete('/session/' + id, _kvoweb.createAndActivateSession, _kvoweb.createAndActivateSession);
        }
    },

    setAttributeValue: function(object, attribute, value, callback)
    {
        if (!_kvoweb.session)
        {
            console.warn('OMC',"No Kvoweb active session");
            return;
        }

        if(value === "")
        {
            value = " ";
        }
        else
        {
            value = "" + value;
        }

        _kvoweb.apiPatch('/session/' + _kvoweb.session.id + '/object/' + object + '/attribute/' + attribute, value, 'text/plain; charset=UTF-8', session => {
            _kvoweb.session = session;
            callback(session);
        });
    },
	
	setAttributes: function(object, attributes, callback)
    {
        if (!_kvoweb.session)
        {
            console.warn('OMC',"No Kvoweb active session");
            return;
        }

        _kvoweb.apiPatch('/session/' + _kvoweb.session.id + '/object/' + object + '/attribute', JSON.stringify(attributes), 'application/json; charset=UTF-8', session => {
            _kvoweb.session = session;
            callback(session);
        });
    },
    
    withSession: function(callback)
    {
        if(_kvoweb.session)
        {
            callback(_kvoweb.session);
        }
        else
        {
            setTimeout(() => _kvoweb.withSession(callback), 250);
        }
    },

    createAndActivateSession: function()
    {
        var data =
        {
            name : 'POC AT-OMC',
            amiId : 1
        };

        _kvoweb.apiPost('/session', data, 'application/x-www-form-urlencoded; charset=UTF-8', session => {
            _kvoweb.apiPost('/session/' + session.id + '/activate', undefined, false, activatedSession => {
                _kvoweb.session = activatedSession;
                window.localStorage.setItem("kvoweb.session", JSON.stringify(activatedSession));
                console.info('OMC', 'Activated session #' + activatedSession.id);
            });
        });
    },
};

window.kvoweb = _kvoweb;
