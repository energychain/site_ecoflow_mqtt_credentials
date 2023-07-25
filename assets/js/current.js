const _randomString = function() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomString = '';
	for (let i = 0; i < 20; i++) {
	  const randomIndex = Math.floor(Math.random() * chars.length);
	  randomString += chars.charAt(randomIndex);
	}
	return randomString;
}

const getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};


$(document).ready(function() {
    const errorDisplay = function(txt) {
        $('#errorText').html(txt);
        $('#alertMsg').show();
    }

   $('#appCredentials').submit(function(e) {
        $.ajax({
            url:"https://api.ecoflow.com/auth/login",
            method: "POST",
            data: JSON.stringify({
                "os": "linux",
                "scene": "IOT_APP",
                "appVersion": "1.0.0",
                "osVersion": "5.15.90.1-kali-fake",
                "password": btoa($('#password').val()),
                "oauth": {
                "bundleId": "com.ef.EcoFlow"
                },
                "email": $('#email').val(),
                "userType": "ECOFLOW"
            }),
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            'dataType': 'json',
            success: function(tokenResponse) {
                if(tokenResponse.message !== 'Success') {
                    errorDisplay("Retrieve Token: "+tokenResponse.message);
                } else {
                    $.ajax({
                        url:"https://api.ecoflow.com/iot-auth/app/certification",
                        method: "GET",
                        headers: { 
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            "Authorization":"Bearer "+tokenResponse.data.token 
                        },
                        success: function(infoResponse) {
                            const widgetId = _randomString();

                            const connection = {
                                "connectionName":"Ecoflow MQTT",
                                "host":infoResponse.data.url,
                                "port":infoResponse.data.port,
                                "protocol":"mqtts",
                                "username":infoResponse.data.certificateAccount,
                                "password":infoResponse.data.certificatePassword,
                                "clientId":"ANDROID_"+Math.round(Math.random()*1000000000)+"_"+tokenResponse.data.user.userId,
                                "protocolId":"MQIsdp",
                                "protocolVersion":3,
                                "connectionId":widgetId,
                                "uiid":widgetId,
                                "basePath":"/app/device/property/"+$('#serial').val()
                            }
                            let settings = {};
                            settings['connections'] = [connection];
                            settings['topics'] = [
                                {
                                    "topic":"/app/device/property/"+$('#serial').val(),
                                    "renderer":"jsonpath:$.params['pd.soc']",
                                    "alias":"% Charged",
                                    "id":_randomString(),
                                    "colorize":"1"
                                },
                                {
                                    "topic":"/app/device/property/"+$('#serial').val(),
                                    "renderer":"jsonpath:$.params['pd.wattsOutSum']",
                                    "alias":"W Out",
                                    "id":_randomString(),
                                    "colorize":"1"
                                },
                                {
                                    "topic":"/app/device/property/"+$('#serial').val(),
                                    "renderer":"jsonpath:$.params['pd.wattsInSum']",
                                    "alias":"W In",
                                    "id":_randomString(),
                                    "colorize":"1"
                                }
                            ];

                            $.ajax({
                                type: "POST",
                                url: "https://api.corrently.io/v2.0/tydids/bucket/intercom",
                                data: "&value=" + encodeURIComponent(JSON.stringify(settings)),
                                success: function(data) {
                                    $('#gtpShareId').show();
                                    $('#shareId').val(data.id);
                    
                                    $.getJSON("https://api.corrently.io/v2.0/util/qr?data="+data.id,function(d) {
                                        $('#qrImage').attr('src',d);
                                    });
                    
                                    $('#shareId').attr('disabled','disabled');
                                    $(e.currentTarget).removeAttr('disabled');
                                    if(getUrlParameter("returnUrl")) {
                                        location.href=getUrlParameter("returnUrl") + "?import="+data.id;
                                    }
                                }
                            })
                        }
                    });
                }
            },
            fail: function(e) {
                errorDisplay(e);
            }
        })
        e.preventDefault();
   });

   $('#backReturn').on('click',function(e) {
    if(getUrlParameter("returnUrl")) {
        location.href=getUrlParameter("returnUrl");
    }
   });
});