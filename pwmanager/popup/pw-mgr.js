/* initialise variables */

var inputPw = document.querySelector('.pw-div input');

var prefillBtn = document.querySelector('.prefill');

/*  add event listeners to buttons */

prefillBtn.addEventListener('click', prefill);

function getActiveTab() {
  return browser.tabs.query({currentWindow: true, active: true});
}

var port = browser.runtime.connectNative("pw_man");

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
    var error = response.error;

    getActiveTab().then(tab => {
        if (error) {
            browser.tabs.executeScript(tab[0].id, {
                code: `alert('${error}')`
            });
        } else {
            browser.tabs.executeScript(tab[0].id, {
              code: `
                  try {
                      var login = '${response.login}';
                      var password = '${response.password}';
                      var loginId = '${response.loginId}';
                      loginId = loginId === 'undefined' ? undefined : loginId;
                      password = password === 'undefined' ? undefined : password;
                      login = login === 'undefined' ? undefined : login;

                      var inputs = document.getElementsByTagName('input');
                      var loginField;
                      var pwField;
                      if (loginId) {
                        loginField = document.getElementById(loginId);
                      }
                      for (var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        if (input.type === 'password') {
                          pwField = input;
                          if (!loginField) {
                            for (var j = i - 1; j >= 0; j--) {
                                var input2 = inputs[j];
                                if (input2.type === 'text' || input2.type === 'email') {
                                  loginField = input2;
                                  break;
                                }
                            }
                            break;
                          }
                        }
                      }
                      if (!loginField) {
                          for (var i = 0; i < inputs.length; i++) {
                              var input = inputs[i];
                              if (input.type === 'email') {
                                loginField = input;
                                break;
                              }
                          }
                      }
                      if (loginField) {
                          loginField.value = login;
                      }
                      if (pwField && password) {
                          pwField.value = password;
                      }
                  } catch (err) {
                      console.log(err);
                  }
              `
            });
        }
    });
});

function prefill() {
    getActiveTab().then(tab => {
        try {
          var pw = inputPw.value;
          port.postMessage({ password: pw, url: tab[0].url });
        } catch (err) {
            console.log(err);
        }
    });
}
