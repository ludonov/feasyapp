angular.module('app.controllers', [])

  .controller('LoginCtrl', function ($scope, $rootScope,  $state, $ionicPopup, $ionicHistory, $q, UserService, DataExchange, $ionicLoading, $cordovaFileTransfer, $cordovaFile) {

    ionic_Popup = $ionicPopup;
    root_scope = $rootScope;

    $ionicLoading.show({
      template: 'Please wait...'
    });

    $scope.userdata = {
      email: "info@feasyapp.com",
      password: "prova"
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
      console.log("error message - " + err.message);
      console.log("error code - " + err.statusCode);
      $ionicPopup.alert({
        title: "Register failed",
        template: err.message
      });
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
            console.log("error message - " + err.message);
            console.log("error code - " + err.statusCode);
            if (err.statusCode == 409) {

              var temp_user = Backendless.UserService.login(usr.email, usr.password);

              temp_user.first_name = usr.first_name;
              temp_user.last_name = usr.last_name;
              temp_user.full_name = usr.full_name;
              temp_user.social_account = usr.social_account;
              temp_user.fb_user_id = usr.fb_user_id;
              temp_user.profile_pic_url = usr.profile_pic_url;

              Backendless.UserService.update(temp_user, new Backendless.Async(userUpdated));

            } else {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: "Register failed",
                template: err.message
              });
            }
          })
        );
      }
      catch (e) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "Registration failed",
          template: e.message
        });
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
          $ionicPopup.alert({
            title: "Error",
            template: "profile info fail"
          });
        });
    };


    // This is the fail callback from the login method
    var fbLoginError = function (error) {
      console.log('fbLoginError', error);
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: "Error",
        template: error.message
      });
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
              console.log('profile info fail', fail);
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

    $scope.check_login = function () {
      current_user = UserService.getUser();
      $ionicLoading.hide();
      if (current_user.objectId != undefined) {
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });
        $state.go('tabsController.Home');
      }
    }

    $scope.normalSignIn = function (user) {
      try {

        $ionicLoading.show({
          template: 'Logging in...'
        });

        var skip_check = false;

        if ($scope.userdata.name == "a")
          skip_check = true;

        if (!skip_check) {

          // var facebookFieldsMapping = {
          //   birthday: "birthday",
          //   email: "email",
          //   first_name: "first_name",
          //   gender: "gender",
          //   hometown: "hometown",
          //   last_name: "last_name",
          //   location: "currentlocation"
          // };

          current_user = UserStorage.findById(Backendless.UserService.login(user.email, user.password).objectId);
        }

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
          $ionicPopup.alert({
            title: 'Info',
            template: 'Login failed'
          });
        }

        // if (current_user.fb_user_id != null && current_user.fb_user_id != "") {
        //   download_file("http://graph.facebook.com/" + current_user.fb_user_id + "/picture?type=large", "profile_pic.png", true, continue_to_home);
        // } else {
        //   continue_to_home();
        // }

      }
      catch (e) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "Login failed",
          template: e.message
        });
      }
    }

    var continue_to_home = function () {
    }

    //document.getElementById("btnLogin").addEventListener("click", $scope.normalSignIn, false);

    $scope.check_login();

  })

  .controller('SignupCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.userdata = new Backendless.User();

    $scope.userdata.first_name = "Baila";
    $scope.userdata.last_name = "Cocco";
    $scope.userdata.email = "baila@cocco.daje";
    $scope.userdata.username = "baila";
    $scope.userdata.password = "cocco";

    function userRegistered(user) {
      try  {
        console.log("user has been registered");
        current_user = UserStorage.findById(Backendless.UserService.login($scope.userdata.email, $scope.userdata.password).objectId);
        $ionicLoading.hide();
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });
        $state.go('tabsController.Home');
      }
      catch (e) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "Info",
          template: "Register ok but login failed: " + e.message
        });
      }
    }

    function gotErrorRegister(err) { // see more on error handling
      $ionicLoading.hide();
      console.log("error message - " + err.message);
      console.log("error code - " + err.statusCode);
      $ionicPopup.alert({
        title: "Register failed",
        template: err.message
      });
    }

    $scope.registerAccount = function () {
      try {

        if (!document.getElementById('cbLegal').checked) {
          $ionicPopup.alert({
            title: "Wait",
            template: "You must accept the legal conditions to register"
          });
        } else {

          $ionicLoading.show({
            template: 'Registering...'
          });

          return Backendless.UserService.register($scope.userdata, new Backendless.Async(userRegistered, gotErrorRegister));
        }
      }
      catch (e) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "Registration failed",
          template: e.message
        });
      }
    }


    document.getElementById("btnRegister").addEventListener("click", $scope.registerAccount, false);
  })

  .controller('RecoverPassCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('CreateAccountCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    // QUESTA PAGINA E' INUTILE! VEDI LA 24, MODIFICA ROFILO

  })

  .controller('HomeCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    try {
      if (Backendless.Users.getCurrentUser() != null) {
        $ionicPopup.alert({
          title: "Login",
          template: "Welcome, " + Backendless.Users.getCurrentUser().first_name + "!"
        });
      }
    }
    catch (e) {
      $ionicPopup.alert({
        title: "Info",
        template: e.message
      });
    }

    $scope.showLogOutMenu = function () {
      var hideSheet = $ionicActionSheet.show({
        destructiveText: 'Logout',
        titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
        cancelText: 'Cancel',
        cancel: function () { },
        buttonClicked: function (index) {
          return true;
        },
        destructiveButtonClicked: function () {
          $ionicLoading.show({
            template: 'Logging out...'
          });

          // Facebook logout
          facebookConnectPlugin.logout(function () {
            $ionicLoading.hide();
            $state.go('Login');
          },
            function (fail) {
              $ionicLoading.hide();
            });
        }
      });
    };

    $scope.goto_mylists = function () {
      $state.go("tabsController.MyListsToCommission");
    }

    $scope.goto_find_lists = function () {
      $state.go("tabsController.FindListOnMap");
    }

  })

  .controller('MyListsToCommissionCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $rootScope.lists = (current_user.lists);

    $scope.userinput = {};

    $rootScope.no_active_list = arrayObjectIndexOf(current_user.lists, true, "active") == -1;
    $rootScope.no_passive_list = arrayObjectIndexOf(current_user.lists, false, "active") == -1;

    // $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    //   viewData.enableBack = true;
    // });

    $scope.goto_list = function (listId) {
      $rootScope.list_id = listId;
      $rootScope.list_idx = arrayObjectIndexOf(current_user.lists, listId, "objectId");
      $rootScope.list = backendlessify_shopping_list(current_user.lists[$rootScope.list_idx]);
      $ionicLoading.hide();
      if ($rootScope.list.active) {
        if ($rootScope.list.chosen_candidate == undefined || $rootScope.list.chosen_candidate.objectId == undefined) {
          $state.go('tabsController.PublicatedList');
        } else {
          $state.go('tabsController.ConfirmedList');
        }
      } else {
        $state.go('tabsController.ListView');
      }
    }

    $scope.add_list = function () {
      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="userinput.listname">',
        title: 'Inserisci il nome della lista',
        subTitle: '(ex. spesa per le cena, spesa generica, spesa per festa, ...)',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Salva</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.userinput.listname) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.userinput.listname;
              }
            }
          }
        ]
      });

      myPopup.then(function (res) {
        if (!check_token())
          return;
        if (res == undefined || res == null || res == "")
          return;
        console.log('Tapped!', res);
        $ionicLoading.show({
          template: 'Please wait...'
        });
        var list = new window.Classes.ShoppingList({ updated: new Date(), created: new Date(), name: res });
        var temp_usr = angular.copy(current_user);
        temp_usr.lists.push(list);
        var temp_usr = backendlessify_user(temp_usr);
        UserStorage.save(temp_usr, new Backendless.Async(userUpdated, onError));
      });

      onError = function (err) {
        $ionicLoading.hide();
        console.log("error");
        console.log(err);
        $ionicPopup.alert({
          title: "Error",
          template: err.message
        });
      }

      userUpdated = function (saved_user) {
        $scope.userinput = {};
        console.log("user updated, list added");
        console.log(saved_user);
        current_user = angular.copy(saved_user);
        $rootScope.no_active_list = arrayObjectIndexOf(current_user.lists, true, "active") == -1;
        $rootScope.no_passive_list = arrayObjectIndexOf(current_user.lists, false, "active") == -1;
        $rootScope.lists = current_user.lists;
        $scope.goto_list(current_user.lists[current_user.lists.length-1].objectId);
      }

      //$timeout(function() {
      //  myPopup.close(); //close the popup after 3 seconds for some reason
      //}, 3000);
    }

    $scope.filterByActive = function (list) {
      return list.active != undefined && list.active;
    }

    $scope.filterByNotActive = function (list) {
      return !(list.active != undefined && list.active);
    }

  })

  .controller('ListViewCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.goto_item_detail = function (productId) {
      $state.go('tabsController.ElementDetails', { ProductId: productId });
    }

    $scope.add_item = function () {
      $state.go('tabsController.ElementDetails');
    }

    $scope.publicate = function () {

      if ($rootScope.list.items == null || $rootScope.list.items.length == 0) {
        $ionicPopup.alert({
          title: "Info",
          template: "Inserire almeno un elemento nella lista"
        });
        return;
      }

      $state.go('tabsController.PublicateList');
    }

    $scope.delete_list = function () {

      if (!check_token())
        return;

      // A confirm dialog
      var confirmPopup = $ionicPopup.confirm({
        title: 'Conferma',
        template: 'Sei sicuro di voler eliminare questa lista?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log("user wants to delete list: " + $rootScope.list.objectId);
          $ionicLoading.show({
            template: 'Please wait...'
          });
          $rootScope.list.remove(new Backendless.Async(listRemoved, onError));
        } else {
          console.log("user doesn't wants to delete list");
        }
      });
    }

    onError = function (err) {
      $ionicLoading.hide();
      console.log("error");
      console.log(err);
      $ionicPopup.alert({
        title: "Error",
        template: err.message
      });
    }

    listRemoved = function (removed_list) {
      console.log("list removed");
      current_user.lists = ShoppingListStorage.find().data;
      $rootScope.lists = current_user.lists;
      $rootScope.no_active_list = arrayObjectIndexOf(current_user.lists, true, "active") == -1;
      $rootScope.no_passive_list = arrayObjectIndexOf(current_user.lists, false, "active") == -1;
      $ionicLoading.hide();
      $rootScope.$apply();
      $ionicHistory.goBack();
    }

  })

  .controller('NewListElementCtrl', function ($scope, $rootScope, $state, $ionicPopup, UserService, DataExchange, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    // QUESTA PAGINA E' INUTILE !!!!


    //$scope.product = backendlessify_shopping_item(new window.Classes.ShoppingItem({ updated: new Date(), created: new Date() }));
    //$scope.units = getUnitsNames();
    //$scope.unitname = {};

    //onError = function (err) {
    //  $ionicLoading.hide();
    //  console.log("error");
    //  console.log(err);
    //  $ionicPopup.alert({
    //    title: "Error",
    //    template: err.message
    //  });
    //}

    //listUpdated = function (saved_list) {
    //  console.log("list updated");
    //  console.log(saved_list);
    //  $rootScope.list = saved_list;
    //  Backendless.Users.getCurrentUser().lists[$rootScope.list_idx] = $rootScope.list;
    //  $rootScope.$apply();
    //  $ionicLoading.hide();
    //  $ionicHistory.goBack();
    //}

    //$scope.save = function () {
    //  if ($scope.product.name == null) {
    //    $ionicPopup.alert({
    //      title: "Info",
    //      template: "Inserisci il nome del prodotto"
    //    });
    //    return;
    //  }
    //  if ($scope.product.qty == null) {
    //    $ionicPopup.alert({
    //      title: "Info",
    //      template: "Inserisci la quantità"
    //    });
    //    return;
    //  }
    //  if ($scope.unitname.name != null) {
    //    $scope.product.unit = getUnitObject($scope.unitname.name);
    //  }
    //  $ionicLoading.show({
    //    template: 'Please wait...'
    //  });
    //  $rootScope.list.addItemToItems(backendlessify_shopping_item($scope.product));
    //  $rootScope.list = backendlessify_shopping_list($rootScope.list);
    //  $rootScope.list.save(new Backendless.Async(listUpdated, onError));
    //}

  })

  .controller('PublicateListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.modal_address = create_blank_geopoint();
    $scope.modal_address_old = null;
    $scope.address_clicked_idx = -1;
    $scope.AddressPopup = null;

    $ionicModal.fromTemplateUrl('templates/AddressModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.openAddressModal = function () {
      $scope.modal.show();
    };
    $scope.closeAddressModal = function () {
      if ($scope.modal_address != undefined) {
        var index = arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.metadata, "metadata");
        if (index != -1) {
          $rootScope.list.delivery_addresses[index] = $scope.modal_address_old;
        }
      }
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
      $scope.modal_address = create_blank_geopoint();
      $scope.address_clicked_idx = -1;
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
      // Execute action
    });


    onError = function (err) {
      $ionicLoading.hide();
      console.log("error");
      console.log(err);
      $ionicPopup.alert({
        title: "Error",
        template: err.message
      });
    }

    listUpdated = function (saved_list) {
      console.log("list updated");
      console.log(saved_list);
      current_user.lists[$rootScope.list_idx] = (saved_list);
      $rootScope.list = (saved_list);
      $rootScope.lists = current_user.lists;
      $rootScope.no_active_list = arrayObjectIndexOf(current_user.lists, true, "active") == -1;
      $rootScope.no_passive_list = arrayObjectIndexOf(current_user.lists, false, "active") == -1;
      $rootScope.$apply();
      $ionicLoading.hide();
      $ionicHistory.goBack(-2);
    }

    $scope.close_addr_modal =  function (result) {
      $scope.modal_address.latitude = result.geometry.location.lat;
      $scope.modal_address.longitude = result.geometry.location.lng;
      $scope.modal_address.metadata.formatted_address = result.formatted_address;
			for (var j = 0; j<result.address_components.length; j++) {
				if (result.address_components[j].types[0] == "route")
					$scope.modal_address.metadata.street_name = result.address_components[j].short_name;
				else if (result.address_components[j].types[0] == "locality")
					$scope.modal_address.metadata.city = result.address_components[j].short_name;
				else if (result.address_components[j].types[0] == "country")
					$scope.modal_address.metadata.nation = result.address_components[j].long_name;
				else if (result.address_components[j].types[0] == "postal_code")
					$scope.modal_address.metadata.post_code = result.address_components[j].short_name;
			}
      if (arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.metadata, "metadata") == -1) {
        add_to_array($scope.modal_address, $rootScope.list.delivery_addresses);
      }
      $scope.modal.hide();
      $scope.AddressPopup.close();
    }

    $scope.save_address = function () {

      $ionicLoading.show({
        template: 'Please wait...'
      });

      geodecode_geopoint($scope.modal_address, function (data) {
        $ionicLoading.hide();
        if (data.results.length > 1) {
          $scope.addresses_found = data.results;
          $scope.AddressPopup = $ionicPopup.show({
            template: '<button ng-repeat-start="addr in addresses_found" class="button button-light" ng-click="close_addr_modal(addr)"> {{addr.formatted_address}}</button><br><br ng-repeat-end>',
            title: 'Sono stati trovati più indirizzi',
            scope: $scope,
            buttons: [{ text: 'Cancel' }]
          });

        } else {
          if (data.results[0].partial_match) {
            var confirmPopup = $ionicPopup.confirm({
              title: 'Indirizzo incompleto',
              template: 'Forse intendevi: ' + data.results[0].formatted_address + " ?"
            });

            confirmPopup.then(function(res) {
              if(res) {
                $scope.modal_address.latitude = data.results[0].geometry.location.lat;
                $scope.modal_address.longitude = data.results[0].geometry.location.lng;
                $scope.modal_address.metadata.formatted_address = data.results[0].formatted_address;
								for (var j = 0; j<data.results[0].address_components.length; j++) {
									if (data.results[0].address_components[j].types[0] == "route")
										$scope.modal_address.metadata.street_name = data.results[0].address_components[j].short_name;
									else if (data.results[0].address_components[j].types[0] == "locality")
										$scope.modal_address.metadata.city = data.results[0].address_components[j].short_name;
									else if (data.results[0].address_components[j].types[0] == "country")
										$scope.modal_address.metadata.nation = data.results[0].address_components[j].long_name;
									else if (data.results[0].address_components[j].types[0] == "postal_code")
										$scope.modal_address.metadata.post_code = data.results[0].address_components[j].short_name;
								}

                if (arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.metadata, "metadata") == -1) {
                  add_to_array($scope.modal_address, $rootScope.list.delivery_addresses);
                }
                $scope.modal.hide();
              }
            });
          } else {
            $scope.modal_address.latitude = data.results[0].geometry.location.lat;
            $scope.modal_address.longitude = data.results[0].geometry.location.lng;
            $scope.modal_address.metadata.formatted_address = data.results[0].formatted_address;

            if (arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.metadata, "metadata") == -1) {
              add_to_array($scope.modal_address, $rootScope.list.delivery_addresses);
            }
            $scope.modal.hide();
          }
        }
      }, function (errdata) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: "Indirizzo non valido",
          template: errdata.status ? errdata.status : errdata
        });
      });
    }

    $scope.delete_address = function () {
      var idx = $scope.modal_address.metadata;
      var index = arrayObjectIndexOf($rootScope.list.delivery_addresses, idx, "metadata");
      if (index != -1) {
        $rootScope.list.delivery_addresses.splice(index, 1);
        $scope.closeAddressModal();
      } else {
        $ionicPopup.alert({
          title: "Info",
          template: "Problem while deleting: cannot find the address."
        }).then(function () {
          $scope.closeAddressModal();
        });
      }
    }

    $scope.view_address = function (address) {
      $scope.modal_address_old = angular.copy(address);
      $scope.modal_address = address;
      $scope.openAddressModal();
    }

    $scope.publicate_list = function () {

      if (!check_token())
        return;

      if ($rootScope.list.name == null || $rootScope.list.name == "") {
        $ionicPopup.alert({
          title: "Info",
          template: "Inserire il nome della lista è essenziale per gestire facilmente le tue liste!"
        });
        return;
      }
      if ($rootScope.list.delivery_addresses == null || $rootScope.list.delivery_addresses.length == 0) {
        $ionicPopup.alert({
          title: "Info",
          template: "Inserire almeno un indirizzo di consegna."
        });
        return;
      }
      if ($rootScope.list.reward == null || $rootScope.list.reward == "0" || $rootScope.list.reward == "") {
        $ionicPopup.alert({
          title: "Info",
          template: "Inserire la mancia."
        });
        return;
      }
      $ionicLoading.show({
        template: 'Please wait...'
      });
      $rootScope.list.active = true;
      $rootScope.list.updated = new Date();
      $rootScope.list = backendlessify_shopping_list($rootScope.list);
      $rootScope.list.save(new Backendless.Async(listUpdated, onError));
    }

    $scope.is_new_address = function () {
      if ($scope.modal_address == undefined)
        return true;
      return arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.objectId, "objectId") == -1;
    }

  })

  .controller('PublicatedListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.view_candidates = function () {
      $state.go("tabsController.CandidateList");
    }

    $scope.view_products = function () {
      $state.go("tabsController.ProductsPublicatedList");
    }

  })

  .controller('ConfirmedListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {


  })

  .controller('ProductsPublicatedListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.view_product_details = function (product) {
      $state.go('tabsController.ElementDetails', { ProductId: product.objectId });
    }

  })

  .controller('ElementDetailsCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.product_idx = arrayObjectIndexOf($rootScope.list.items, $state.params.ProductId, "objectId");
    $scope.units = getUnitsNames();

    $scope.is_new_product = function () {
      return $scope.product_idx == -1;
    }

    if ($scope.is_new_product()) {
      $scope.product = backendlessify_shopping_item(new window.Classes.ShoppingItem({ updated: new Date(), created: new Date(), unit: {} }));
    } else {
      $scope.product = angular.copy($rootScope.list.items[$scope.product_idx]);
      if ($scope.product.unit == null)
        $scope.product.unit = {};
    }

    var idx = $rootScope.list_idx;

    onError = function (err) {
      $ionicLoading.hide();
      console.log("error");
      console.log(err);
      $ionicPopup.alert({
        title: "Error",
        template: err.message
      });
    }

    itemRemoved = function (item_removed) {
      $ionicLoading.hide();
      console.log("item removed");
      $rootScope.list = backendlessify_shopping_list(ShoppingListStorage.findById($rootScope.list_id));
      $rootScope.lists[$rootScope.list_idx] = $rootScope.list;
      $rootScope.$apply();
      $ionicHistory.goBack();
    }

    $scope.delete_product = function () {

      if (!check_token())
        return;

      var index = arrayObjectIndexOf($rootScope.list.items, $scope.product.objectId, "objectId");
      if (index != -1) {
        $ionicLoading.show({
          template: 'Please wait...'
        });
        $scope.product.remove(new Backendless.Async(itemRemoved, onError));
      } else {
        $ionicPopup.alert({
          title: "Info",
          template: "Problem while deleting: cannot find the product."
        }).then(function () {
          $ionicHistory.goBack();
        });
      }
    }

    listUpdated = function (saved_list) {
      console.log("list updated");
      console.log(saved_list);
      $rootScope.list = saved_list;
      $rootScope.lists[$rootScope.list_idx] = $rootScope.list;
      $rootScope.$apply();
      $ionicLoading.hide();
      $ionicHistory.goBack();
    }

    $scope.save_product = function () {

      if (!check_token())
        return;

      if ($scope.product.name == null) {
        $ionicPopup.alert({
          title: "Info",
          template: "Inserisci il nome del prodotto"
        });
        return;
      }
      if ($scope.product.qty == null) {
        $ionicPopup.alert({
          title: "Info",
          template: "Inserisci la quantità"
        });
        return;
      }

      if ($scope.product.unit != undefined && $scope.product.unit.unit_name != null) {
        $scope.product.unit = getUnitObject($scope.product.unit.unit_name);
      } else {
        delete $scope.product.unit;
      }

      $ionicLoading.show({
        template: 'Please wait...'
      });

      if ($scope.is_new_product()) {
        $rootScope.list.addItemToItems(backendlessify_shopping_item($scope.product));
      } else {
        $rootScope.list.items[$scope.product_idx] = $scope.product;
      }
      $rootScope.list = backendlessify_shopping_list($rootScope.list);
      $rootScope.list.save(new Backendless.Async(listUpdated, onError));
    }

  })

  .controller('CandidateListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.view_candidate_info = function (candidate) {
      $state.go('tabsController.CandidateInfo', { CandidateId: candidate.objectId });
    }

  })

  .controller('PublicatedListDetailsCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('CandidateInfoCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.candidate_idx = arrayObjectIndexOf($rootScope.list.candidates, $state.params.CandidateId, "objectId");
    if ($scope.candidate_idx > -1 ){
      $scope.candidate = $rootScope.list.candidates[$scope.candidate_idx];
    } else {
      $ionicPopup.alert({
        title: "Info",
        template: "Impossibile trovare il candidato"
      }).then(function () {
        $ionicHistory.goBack();
      });
    }

    $scope.view_candidate_profile = function () {
      $state.go('tabsController.CandidateInfo', { CandidateId: candidate.objectId });
    }

    $scope.accept_candidate = function () {

      if (!check_token())
        return;

      $ionicLoading.show({
        template: 'Please wait...'
      });

      $rootScope.list.chosen_candidate = $scope.candidate;
      $rootScope.list = backendlessify_shopping_list($rootScope.list);
      $rootScope.list.save(new Backendless.Async(listUpdated, onError));
    }

    onError = function (err) {
      $ionicLoading.hide();
      console.log("error");
      console.log(err);
      $ionicPopup.alert({
        title: "Error",
        template: err.message
      });
    }

    listUpdated = function (saved_list) {
      console.log("list updated");
      console.log(saved_list);
      $rootScope.list = saved_list;
      $rootScope.lists[$rootScope.list_idx] = $rootScope.list;
      $rootScope.$apply();
      $ionicLoading.hide();
      $ionicHistory.goBack(-3);
    }

  })

  .controller('CandidateProfileCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.candidate_idx = arrayObjectIndexOf($rootScope.list.candidates, $state.params.CandidateId, "objectId");
    if ($scope.candidate_idx > -1 ){
      $scope.candidate = $rootScope.list.candidates[$scope.candidate_idx];
    } else {
      $ionicPopup.alert({
        title: "Info",
        template: "Impossibile trovare il candidato"
      }).then(function () {
        $ionicHistory.goBack();
      });
    }

  })

  .controller('UserProfileCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.current_user = current_user;

    $scope.edit_profile = function () {
      $state.go("EditProfile");
    }

    // var image = document.getElementById("profile_image");
    // if (image != null) {
    //   image.src = $scope.current_user.profile_pic_url;
    // }

  })

  .controller('FindListOnMapCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory, $cordovaGeolocation) {

    var options = { timeout: 10000, enableHighAccuracy: true };

    $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    var definitive_err = function () {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: "Info",
        template: "Impossibile trovare la posizione attuale"
      });
      $ionicHistory.goBack();
    }

    var position_err = function () {
      get_ip_data_and_position(function (data) {
        geodecode_address(data.city, function (geodata) {
          $ionicLoading.hide();
          //if (data == null || data.loc == null) {
          //  definitive_err();
          //  return;
          //}
          //var parts = data.loc.split(",");
          //if (parts.length != 2) {
          //  definitive_err();
          //  return;
          //}
          create_map(geodata.results[0].geometry.location.lat, geodata.results[0].geometry.location.lng);
        });
      });
    }

    var create_map = function (lat, long) {
      $ionicLoading.hide();

      var latLng = new google.maps.LatLng(lat, long);

      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //Wait until the map is loaded
      google.maps.event.addListenerOnce($scope.map, 'idle', function () {

        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: latLng
        });

        var infoWindow = new google.maps.InfoWindow({
          content: "Here I am!"
          /*Per il DB: Cosa facciamo vedere nella window: Nome, mancia, peso stimato, Negozio in cui viene fatta la spesa (anche forse nome in vista).
           Quando schiacci su window vai su pagina della spesa e poi se schiacci sul suo nome vai sul suo profilo*/
        });

        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
        }, function (error) {
          console.log("Could not get location");
        });
      });
    }

    //if (cordova.plugins != null && cordova.plugins.diagnostic != null) {
    //  cordova.plugins.diagnostic.isLocationAvailable(function () {
    //    navigator.geolocation.getCurrentPosition(function (position) {

    //      create_map(position.coords.latitude, position.coords.longitude);

    //    }, function (err) {
    //      position_err();
    //    });
    //  }, position_err);
    //} else {


      navigator.geolocation.getCurrentPosition(function (position) {

        create_map(position.coords.latitude, position.coords.longitude);

      }, function (err) {
        position_err();
      });

    //}


  })

  .controller('MyListsToDoCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('FilterListOnMapCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('ChatListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('ChatCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('WalletCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('HistoryCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('SettingsCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

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

  })

  .controller('EditProfileCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {
    $scope.user = current_user;

    $scope.save_user = function () {

      $ionicLoading.show({
        template: 'Saving...'
      });

      var temp_usr = backendlessify_user($scope.user);
      UserStorage.save(temp_usr, new Backendless.Async(userUpdated, onError));
    }

    onError = function (err) {
      $ionicLoading.hide();
      console.log("error");
      console.log(err);
      $ionicPopup.alert({
        title: "Error",
        template: err.message
      });
    }

    userUpdated = function (saved_user) {
      console.log("user updated");
      console.log(saved_user);
      current_user = angular.copy(saved_user);
      $rootScope.no_active_list = arrayObjectIndexOf(current_user.lists, true, "active") == -1;
      $rootScope.no_passive_list = arrayObjectIndexOf(current_user.lists, false, "active") == -1;
      $rootScope.lists = current_user.lists;
      $ionicHistory.goBack();
    }
  })

  .controller('ResetPasswordCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('TermsAndConditionsCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

  .controller('ListInfoFromMapCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicPopup, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

  })

var UserStorage = Backendless.Persistence.of(Backendless.User);
var AddressInfoStorage = Backendless.Persistence.of(window.Classes.AddressInfo);
var PaymentInfoStorage = Backendless.Persistence.of(window.Classes.PaymentInfo);
var ShoppingListStorage = Backendless.Persistence.of(window.Classes.ShoppingList);
var ShoppingItemStorage = Backendless.Persistence.of(window.Classes.ShoppingItem);
var MeasureUnitsStorage = Backendless.Persistence.of(window.Classes.MeasureUnits);


var ionic_Popup;
var ciao = {name: "aaa"};
var current_user;
