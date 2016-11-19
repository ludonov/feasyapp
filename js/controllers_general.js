angular.module('app.controllers.general', [])

  .config(function ($ionicConfigProvider) {
    $ionicConfigProvider.form.checkbox("circle");
    $ionicConfigProvider.form.toggle("large");
    $ionicConfigProvider.tabs.style("standard");
    $ionicConfigProvider.tabs.position("bottom");
    $ionicConfigProvider.navBar.alignTitle("center");
    $ionicConfigProvider.navBar.positionPrimaryButtons("left");
    $ionicConfigProvider.navBar.positionSecondaryButtons("right");
  })

  // 0_loading.html
  .controller('StartupCtrl', function ($scope, $ionicPlatform, $rootScope,  $state, $timeout, $ionicHistory, $q, UserService, DataExchange, $ionicLoading, $cordovaFileTransfer, $cordovaFile) {

    root_scope = $rootScope;

    $scope.check_login = function () {
      
      //current_user = UserService.getUser();

      if (current_user.objectId != undefined) {
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });
        $state.go('tabsController.Home');
      } else {
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });
        $state.go('Login');
      }
    }

    start_splash();

    var hide_splash = function () {
      try {
        navigator.splashscreen.hide();
      } catch (e) {
        console.warn("hide splashscreen err: " + e.message);
        //$timeout(hide_splash, 500);
      }
      $timeout($scope.check_login, 3500);
    }

    $timeout(hide_splash, 500);

    geo_localise();

  })

  // 1_login.html
  .controller('LoginCtrl', function ($scope, $rootScope,  $state, $ionicHistory, $q, UserService, DataExchange, $ionicLoading, $cordovaFileTransfer, $cordovaFile) {

    $scope.userdata = {
      email: "",
      password: ""
    };

    $scope.fbUser = new Backendless.User();

    function userRegistered(user) {
      console.log("user has been registered");
      user.password = "facebook";
      $scope.userdata = user;
      $scope.normalSignIn(user);
    }

    function gotErrorRegister(err) { // see more on error handling
      $ionicLoading.hide();
      console.warn("gotErrorRegister error message: " + err.message);
      console.warn("gotErrorRegister error code: " + err.statusCode);
      navigator.notification.alert("Register failed: " + err.message, null, "Oops", "Ok");
    }
    function userUpdated(user) {
      $ionicLoading.hide();
      console.log("user has been updated");
      $scope.userdata = user;
      $scope.normalSignIn($scope.fbUser);
    }

    $scope.forceRegisterAccount = function (usr) {
      try {
        return Backendless.UserService.register(usr, new Backendless.Async(userRegistered,
          function (err) { // see more on error handling
            console.log("error message: " + err.message);
            console.log("error code: " + err.statusCode);
            if (err.statusCode == 409) {

              var temp_user = Backendless.UserService.login(usr.email, usr.password, true);

              temp_user.first_name = usr.first_name;
              temp_user.last_name = usr.last_name;
              temp_user.full_name = usr.full_name;
              temp_user.social_account = usr.social_account;
              temp_user.fb_user_id = usr.fb_user_id;
              temp_user.profile_pic_url = usr.profile_pic_url;

              Backendless.UserService.update(temp_user, new Backendless.Async(userUpdated));

            } else {
              $ionicLoading.hide();
              console.warn("forceRegisterAccount (Backendless.UserService.register) error: " + err.message);
              navigator.notification.alert("Register failed: " + err.message, null, "Oops", "Ok");
            }
          })
        );
      }
      catch (e) {
        $ionicLoading.hide();
        console.warn("forceRegisterAccount error: " + e.message);
        navigator.notification.alert("Registration failed: " + e.message, null, "Oops", "Ok");
      }
    }

    var fbLoginSuccess = function (response) {
      if (!response.authResponse) {
        fbLoginError("Cannot find the authResponse");
        return;
      }

      var authResponse = response.authResponse;

      getFacebookProfileInfo(authResponse)
        .then(function (profileInfo) {

          $scope.fbUser = new Backendless.User();

          $scope.fbUser.first_name = profileInfo.first_name;
          $scope.fbUser.last_name = profileInfo.last_name;
          $scope.fbUser.full_name = profileInfo.name;
          $scope.fbUser.email = profileInfo.email;
          $scope.fbUser.password = "facebook";
          $scope.fbUser.social_account = "FACEBOOK";
          $scope.fbUser.fb_user_id = authResponse.userID;
          $scope.fbUser.profile_pic_url = "http://graph.facebook.com/" + authResponse.userID + "/picture?type=square&width=400&height=400";

          //http://graph.facebook.com/1629347106/picture?type=large
          //download_file("http://graph.facebook.com/" + authResponse.userID + "/picture?type=large", "profile_pic.png", true);

          $scope.forceRegisterAccount($scope.fbUser);

        }, function (fail) {
          // Fail get profile info
          $ionicLoading.hide();
          console.log('profile info fail', fail);
          navigator.notification.alert("Profile info failed", null, "Oops", "Ok");
        });
    };


    // This is the fail callback from the login method
    var fbLoginError = function (error) {
      console.warn('fbLoginError: ' + error);
      $ionicLoading.hide();
      navigator.notification.alert("FB login comunication: " + error.message, null, "Oops", "Ok");
    };

    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
      var info = $q.defer();

      facebookConnectPlugin.api('/me?fields=email,name,first_name,last_name,gender&access_token=' + authResponse.accessToken, null,
        function (response) {
          console.log(response);
          info.resolve(response);
        },
        function (response) {
          console.log(response);
          info.reject(response);
        }
      );
      return info.promise;
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function () {

      $ionicLoading.show({
        template: 'Logging in...'
      });

      facebookConnectPlugin.getLoginStatus(function (success) {
        if (success.status === 'connected') {
          // The user is logged in and has authenticated your app, and response.authResponse supplies
          // the user's ID, a valid access token, a signed request, and the time the access token
          // and signed request each expire
          console.log('getLoginStatus', success.status);

          // Check if we have our user saved
          //var user = UserService.getUser('facebook');
          //var user = null;

          //if(!user.userID){
          getFacebookProfileInfo(success.authResponse)
            .then(function (profileInfo) {

              $scope.fbUser = new Backendless.User();

              $scope.fbUser.first_name = profileInfo.first_name;
              $scope.fbUser.last_name = profileInfo.last_name;
              $scope.fbUser.full_name = profileInfo.name;
              $scope.fbUser.email = profileInfo.email;
              $scope.fbUser.password = "facebook";
              $scope.fbUser.social_account = "FACEBOOK";
              $scope.fbUser.fb_user_id = success.authResponse.userID;
              $scope.fbUser.profile_pic_url = "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=square&width=400&height=400";

              //http://graph.facebook.com/1629347106/picture?type=large

              $scope.forceRegisterAccount($scope.fbUser);

            }, function (fail) {
              // Fail get profile info
              console.warn('profile info fail', fail);
            });
          //}else{
          //  $state.go('tabsController.Home');
          //}
        } else {
          // If (success.status === 'not_authorized') the user is logged in to Facebook,
          // but has not authenticated your app
          // Else the person is not logged into Facebook,
          // so we're not sure if they are logged into this app or not.

          console.log('getLoginStatus', success.status);

          // Ask the permissions you need. You can learn more about
          // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
          facebookConnectPlugin.login(['email', 'public_profile', 'user_hometown', 'user_birthday', 'user_location'], fbLoginSuccess, fbLoginError);
        }
      });
    };

    $scope.normalSignIn = function (user) {
      try {

        $ionicLoading.show({
          template: 'Logging in...'
        });

        current_user = UserStorage().findById(Backendless.UserService.login(user.email, user.password, true).objectId);

        current_user.password = user.password;
        UserService.setUser(current_user);
        delete current_user.password;
        $ionicLoading.hide();
        if (current_user != null || skip_check) {
          $ionicHistory.nextViewOptions({
            disableBack: true,
            historyRoot: true
          });
          $state.go('tabsController.Home');
        } else {
          navigator.notification.alert("Login failed", null, "Oops", "Ok");
        }

        // if (current_user.fb_user_id != null && current_user.fb_user_id != "") {
        //   download_file("http://graph.facebook.com/" + current_user.fb_user_id + "/picture?type=large", "profile_pic.png", true, continue_to_home);
        // } else {
        //   continue_to_home();
        // }

      }
      catch (e) {
        $ionicLoading.hide();
        console.warn("Login failed: " + e.message);
        navigator.notification.alert("Login failed: " + e.message, null, "Oops", "Ok");
      }
    }

    var continue_to_home = function () {
    }

    //document.getElementById("btnLogin").addEventListener("click", $scope.normalSignIn, false);


  })

  // 3_iscriviti.html
  .controller('SignupCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.userdata = new Backendless.User();

    $scope.userdata.first_name = "Baila";
    $scope.userdata.last_name = "Cocco";
    $scope.userdata.email = "baila@cocco.daje";
    $scope.userdata.username = "baila";
    $scope.userdata.password = "cocco";

    function userRegistered(user) {
      try  {
        console.log("user has been registered");
        current_user = UserStorage().findById(Backendless.UserService.login($scope.userdata.email, $scope.userdata.password).objectId);
        $ionicLoading.hide();
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });
        $state.go('tabsController.Home');
      }
      catch (e) {
        $ionicLoading.hide();
        console.warn("Registration succeded, but login failed: " + e.message);
        navigator.notification.alert("Registration succeded, but login failed: " + e.message, null, "Info", "Ok");
      }
    }

    function gotErrorRegister(err) { // see more on error handling
      $ionicLoading.hide();
      console.warn("gotErrorRegister error message: " + err.message);
      console.warn("gotErrorRegister error code: " + err.statusCode);
      navigator.notification.alert("Registration failed: " + err.message, null, "Info", "Ok");
    }

    $scope.registerAccount = function () {
      try {

        if (!document.getElementById('cbLegal').checked) {
          navigator.notification.alert("You must accept the legal conditions to register", null, "Info", "Ok");
        } else {
          $ionicLoading.show({
            template: 'Registering...'
          });
          return Backendless.UserService.register($scope.userdata, new Backendless.Async(userRegistered, gotErrorRegister));
        }
      }
      catch (e) {
        $ionicLoading.hide();
        console.warn("registerAccount Registration failed: " + e.message);
        navigator.notification.alert("Registration failed: " + e.message, null, "Info", "Ok");
      }
    }


    document.getElementById("btnRegister").addEventListener("click", $scope.registerAccount, false);
  })

  // 2_password_dimenticata.html
  .controller('RecoverPassCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  // 4_crea_account.html
  .controller('CreateAccountCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    // QUESTA PAGINA E' INUTILE! VEDI LA 24, MODIFICA ROFILO

  })

  // 5_home.html
  .controller('HomeCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.showLogOutMenu = function () {
      navigator.notification.confirm("Are you sure you want to logout? This app is awsome so I recommend you to stay.",
        function (buttonIndex) {
          if (buttonIndex == 1) {
            console.log("Logging out...");
            $ionicLoading.show({
              template: 'Logging out...'
            });
            // Facebook logout
            facebookConnectPlugin.logout(
              function () {
                $ionicLoading.hide();
                $state.go('Login');
              },
              function (fail) {
                $ionicLoading.hide();
              }
            );
          }
        }, "Welcome!", ["Ok", "Cancel"]
      );
    };

  })

  // 17A_profilo_utente.html
  .controller('UserProfileCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });

    $scope.current_user = current_user;

    $scope.edit_profile = function () {
      $state.go("EditProfile");
    }

    // var image = document.getElementById("profile_image");
    // if (image != null) {
    //   image.src = $scope.current_user.profile_pic_url;
    // }

  })

  // 19_lista_chat.html
  .controller('ChatListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  // 20_chat.html
  .controller('ChatCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  // 21_portafoglio.html
  .controller('WalletCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  // 22_cronologia.html
  .controller('HistoryCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  // 23_impostazioni.html
  .controller('SettingsCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });


    userLoggedOut = function () {
      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });
      $state.go('Login');
    }

    $scope.logout = function () {
      UserService.logout();
      Backendless.UserService.logout(new Backendless.Async(userLoggedOut, userLoggedOut));
    }

    $scope.goBack = function () {
      $ionicHistory.goBack();
    }

  })

  // 24A_modifica_profilo.html
  .controller('EditProfileCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {
    $scope.user = current_user;

    $scope.save_user = function () {

      $ionicLoading.show({
        template: 'Saving...'
      });

      var temp_usr = backendlessify_user($scope.user);
      Backendless.UserService.update(temp_usr, new Backendless.Async(userUpdated, onError));
    }

    onError = function (err) {
      $ionicLoading.hide();
      console.warn("error" + err);
      navigator.notification.alert('Something has gone wrong: ' + err, null, 'Oops', 'Ok');
    }

    userUpdated = function (saved_user) {
      console.log("user updated");
      console.log(saved_user);
      current_user = angular.copy(saved_user);
      $rootScope.lists = current_user.lists;
      $ionicHistory.goBack();
    }
  })

  // 25_reimposta_password.html
  .controller('ResetPasswordCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  // 26_termini_e_condizioni.html
  .controller('TermsAndConditionsCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })


  .run(['UserService', function (UserService) {
    current_user = UserService.getUser();
  }]);

var UserStorage         = function () { return Backendless.Persistence.of(Backendless.User) };
var AddressInfoStorage  = function () { return Backendless.Persistence.of(window.Classes.AddressInfo) };
var PaymentInfoStorage  = function () { return Backendless.Persistence.of(window.Classes.PaymentInfo) };
var ShoppingListStorage = function () { return Backendless.Persistence.of(window.Classes.ShoppingList) };
var ShoppingItemStorage = function () { return Backendless.Persistence.of(window.Classes.ShoppingItem) };
var MeasureUnitsStorage = function () { return Backendless.Persistence.of(window.Classes.MeasureUnits) };

var my_lat = null;
var my_lng = null;