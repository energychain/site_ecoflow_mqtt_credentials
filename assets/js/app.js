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
                            let html = '<table class="table table-condensed" style="margin-top:25px;">';
                            html += '<tr><td><strong>MQTT Protocoll</strong></td><td>'+infoResponse.data.protocol+'</td></tr>';
                            html += '<tr><td><strong>MQTT Host</strong></td><td>'+infoResponse.data.url+'</td></tr>';
                            html += '<tr><td><strong>MQTT Port</strong></td><td>'+infoResponse.data.port+'</td></tr>';
                            html += '<tr><td><strong>MQTT User</strong></td><td>'+infoResponse.data.certificateAccount+'</td></tr>';
                            html += '<tr><td><strong>MQTT User</strong></td><td>'+infoResponse.data.certificatePassword+'</td></tr>';
                            html += '<tr><td><strong>MQTT Client ID (sample)</strong></td><td>'+"ANDROID_"+Math.round(Math.random()*1000000000)+"_"+tokenResponse.data.user.userId+'</td></tr>';
                            html += '</table>';
                            let serial = $('#serial').val();
                            if(serial.length < 10) serial = "Your_Device_Serial";
                            html += '<h4 style="margin-top:25px">Sample MQTT Topics:</h4>';
                            html += '<ul>';
                            html += "<li><code>/app/device/property/"+serial+"</code> (Status Information)</li>";
                            html += "<li><code>/app/"+tokenResponse.data.user.userId+"/"+serial+"/set</code> (Set Configuration)</li>";
                            html += "<li><code>/app/"+tokenResponse.data.user.userId+"/"+serial+"/get</code> (Get Configuration)</li>";
                            html += '</ul>';


                            $('#result').html(html);
                            console.log(infoResponse);
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
});