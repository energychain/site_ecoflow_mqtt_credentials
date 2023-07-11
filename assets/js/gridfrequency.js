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
            let settings = {};
            settings['connection_CorrentlyCommons'] = {
                "connectionName":"Corrently Commons",
                "host":"mqtt.corrently.cloud",
                "port":8883,"protocol":"mqtts",
                "protocolId":"MQIsdp",
                "protocolVersion":3,
                "connectionId":"CorrentlyCommons",
                "uiid":"CorrentlyCommons"
            };
            settings['topics_CorrentlyCommons'] = [
                {
                    "topic":"corrently/commons/netzfrequenz/EM_freq",
                    "renderer":"auto",
                    "alias":"Hz (Location 1)",
                    "id":"mainsFrequency1",
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
        e.preventDefault();
   });
});