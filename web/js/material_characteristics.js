// Liaison entre le formulaire et Kadviser

var KVOWEB_BASE_URL          = 'https://alpenbox.kad-office.com/kvoweb/api/v1.0';
var KVOWEB_USER_TOKEN_HEADER = 'X-User-Token';

var kvowebUserToken;
var kvowebSession;

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

$(document).ready(startSession);
