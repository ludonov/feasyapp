angular.module('app.controllers.demander', [])

  // 6_liste.html
  .controller('MyListsToCommissionCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {


    $scope.$on("$ionicView.enter", function (event, data) {
      console.log("Aggiornate liste attive e passive");
      $rootScope.no_active_list = arrayObjectIndexOf(current_user.lists, true, "active") == -1;
      $rootScope.no_passive_list = arrayObjectIndexOf(current_user.lists, false, "active") == -1;

      $rootScope.list_id = null;
      $rootScope.list_idx = null;
      $rootScope.list = null;

      $rootScope.lists = (current_user.lists);

      $scope.userinput = {};
    });

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

      var onPrompt = function onPrompt(results) {
        if (results.buttonIndex == 1)
          after_prompt(results.input1);
      }

      navigator.notification.prompt(
          'Inserisci il nome della lista',
          onPrompt,
          'Nuova lista',
          ['Ok', 'Cancel'],
          ''
      );

      var after_prompt = function (res) {
        if (!check_token())
          return;
        if (res == undefined || res == null || res == "")
          return;
        console.log('New list name: ', res);
        $ionicLoading.show({
          template: 'Please wait...'
        });
        var list = new window.Classes.ShoppingList({ updated: new Date(), created: new Date(), name: res });
        var temp_usr = angular.copy(current_user);
        if (temp_usr.lists == null)
          temp_usr.lists = [];
        temp_usr.lists.push(list);
        var temp_usr = backendlessify_user(temp_usr);
        Backendless.UserService.update(temp_usr, new Backendless.Async(userUpdated, onError));
      }

      onError = function (err) {
        $ionicLoading.hide();
        console.warn("error" + err);
        navigator.notification.alert('Something has gone wrong: ' + err, null, 'Oops', 'Ok');
      }

      userUpdated = function (saved_user) {
        $ionicLoading.hide();
        $scope.userinput = {};
        console.log("user updated, list added");
        console.log(saved_user);
        current_user.lists = saved_user.lists;
        $rootScope.lists = current_user.lists;
        $scope.goto_list(current_user.lists[current_user.lists.length - 1].objectId);
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
  
  // 7_lista.html
  .controller('ListViewCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.publicate = function () {

      if ($rootScope.list.items == null || $rootScope.list.items.length == 0) {
        navigator.notification.alert("Inserire almeno un elemento nella lista", null, "Info", "Ok");
        return;
      }

      $state.go('tabsController.PublicateList');
    }

    $scope.delete_list = function () {

      if (!check_token())
        return;

      navigator.notification.confirm('Sei sicuro di voler eliminare questa lista?',
        function (buttonIndex) {
          if (buttonIndex == 1) {
            console.log("user wants to delete list: " + $rootScope.list.objectId);
            $ionicLoading.show({
              template: 'Please wait...'
            });
            $rootScope.list.remove(new Backendless.Async(listRemoved, onError));
          }
        }, "Conferma", ["Sì", "No"]
      );

    }

    onError = function (err) {
      $ionicLoading.hide();
      console.warn("error" + err);
      navigator.notification.alert('Something has gone wrong: ' + err, null, 'Oops', 'Ok');
    }

    listRemoved = function (removed_list) {
      console.log("list <" + $rootScope.list.name + "> removed");
      $rootScope.lists.splice($rootScope.list_idx, 1);
      //current_user.lists = ShoppingListStorage().find().data;
      current_user.lists = $rootScope.lists;
      $ionicLoading.hide();
      $rootScope.$apply();
      $ionicHistory.goBack();
    }

  })

  // 9_pubblica_lista.html
  .controller('PublicateListCtrl', function ($scope, $rootScope, $state, $ionicPopup, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

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
      console.warn("error" + err);
      navigator.notification.alert('Something has gone wrong: ' + err, null, 'Oops', 'Ok');
    }

    listUpdated = function (saved_list) {
      console.log("list updated");
      console.log(saved_list);
      current_user.lists[$rootScope.list_idx] = (saved_list);
      $rootScope.list = (saved_list);
      $rootScope.lists = current_user.lists;
      //$rootScope.no_active_list = arrayObjectIndexOf(current_user.lists, true, "active") == -1;
      //$rootScope.no_passive_list = arrayObjectIndexOf(current_user.lists, false, "active") == -1;
      $rootScope.$apply();
      $ionicLoading.hide();
      $ionicHistory.goBack(-2);
    }

    var update_list_from_google = function (result) {
      $scope.modal_address.latitude = result.geometry.location.lat();
      $scope.modal_address.longitude = result.geometry.location.lng();
      $scope.modal_address.metadata.formatted_address = result.formatted_address;
      //$scope.modal_address.metadata.linked_list_id = $rootScope.list.objectId;
      //$scope.modal_address.metadata.number_of_pieces = $rootScope.list.items.length;
      //$scope.modal_address.metadata.reward = $rootScope.list.reward;
      //$scope.modal_address.metadata.preferred_shops = $rootScope.list.preferred_shops;
      //$scope.modal_address.metadata.estimated_weight = $rootScope.list.estimated_weight;
      for (var j = 0; j < result.address_components.length; j++) {
        if (result.address_components[j].types[0] == "route")
          $scope.modal_address.metadata.street_name = result.address_components[j].short_name;
        else if (result.address_components[j].types[0] == "locality")
          $scope.modal_address.metadata.city = result.address_components[j].short_name;
        else if (result.address_components[j].types[0] == "country")
          $scope.modal_address.metadata.nation = result.address_components[j].long_name;
        else if (result.address_components[j].types[0] == "postal_code")
          $scope.modal_address.metadata.post_code = result.address_components[j].short_name;
      }
    }

    $scope.close_addr_modal = function (result) {
      update_list_from_google(result);
      if (arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.metadata, "metadata") == -1) {
        $rootScope.list.delivery_addresses = add_to_array($scope.modal_address, $rootScope.list.delivery_addresses);
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
            title: 'Scegli un indirizzo',
            scope: $scope,
            buttons: [{ text: 'Cancel' }]
          });

        } else {
          if (data.results[0].partial_match) {
            navigator.notification.confirm("Forse intendevi: " + data.results[0].formatted_address + " ?",
              function (buttonIndex) {
                if (buttonIndex == 1) {
                  update_list_from_google(data.results[0]);
                  if (arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.metadata, "metadata") == -1) {
                    $rootScope.list.delivery_addresses = add_to_array($scope.modal_address, $rootScope.list.delivery_addresses);
                  }
                  $scope.modal.hide();
                }
              }, 'Indirizzo incompleto', ["Sì", "No"]
            );
          } else {
            update_list_from_google(data.results[0]);
            if (arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.metadata, "metadata") == -1) {
              $rootScope.list.delivery_addresses = add_to_array($scope.modal_address, $rootScope.list.delivery_addresses);
            }
            $scope.modal.hide();
          }
        }
      }, function (errdata) {
        $ionicLoading.hide();
        navigator.notification.alert(errdata.status ? errdata.status : errdata, null, "Indirizzo non valido", 'Ok');
      });
    }

    $scope.delete_address = function () {
      var idx = $scope.modal_address.metadata;
      var index = arrayObjectIndexOf($rootScope.list.delivery_addresses, idx, "metadata");
      if (index != -1) {
        $rootScope.list.delivery_addresses.splice(index, 1);
        $scope.closeAddressModal();
      } else {
        navigator.notification.alert("Problem while deleting the address: cannot find the address.",
          function () {
            $scope.closeAddressModal();
          }, "Info", 'Ok'
        );
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
        navigator.notification.alert("Inserire il nome della lista è essenziale per gestire facilmente le tue liste!", null, "Info", 'Ok');
        return;
      }
      if ($rootScope.list.delivery_addresses == null || $rootScope.list.delivery_addresses.length == 0) {
        navigator.notification.alert("Inserire almeno un indirizzo di consegna.", null, "Info", 'Ok');
        return;
      }
      if ($rootScope.list.reward == null || $rootScope.list.reward == "0" || $rootScope.list.reward == "") {
        navigator.notification.alert("Inserire la mancia", null, "Info", 'Ok');
        return;
      }
      $ionicLoading.show({
        template: 'Please wait...'
      });
      $rootScope.list.active = true;
      $rootScope.list.updated = new Date();
      for (var i = 0; i < $rootScope.list.delivery_addresses.length; i++) {
        $rootScope.list.delivery_addresses[i].metadata = add_list_to_geopoint_metadata($rootScope.list.delivery_addresses[i].metadata, $rootScope.list);
      }
      $rootScope.list = backendlessify_shopping_list($rootScope.list);
      $rootScope.list.save(new Backendless.Async(listUpdated, onError));
    }

    $scope.is_new_address = function () {
      if ($scope.modal_address == undefined)
        return true;
      return arrayObjectIndexOf($rootScope.list.delivery_addresses, $scope.modal_address.objectId, "objectId") == -1;
    }

  })

  // 10_lista_pubblicata_senza_spesario.html
  .controller('PublicatedListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.view_candidates = function () {
      $state.go("tabsController.CandidateList");
    }

    $scope.view_products = function () {
      $state.go("tabsController.ProductsPublicatedListDemander");
    }

    $scope.delete_list = function () {

      if (!check_token())
        return;

      navigator.notification.confirm('Sei sicuro di voler eliminare questa lista?',
        function (buttonIndex) {
          if (buttonIndex == 1) {
            console.log("user wants to delete list: " + $rootScope.list.objectId);
            $ionicLoading.show({
              template: 'Please wait...'
            });
            $rootScope.list.remove(new Backendless.Async(listRemoved, onError));
          }
        }, "Conferma", ["Sì", "No"]
      );

    }

    onError = function (err) {
      $ionicLoading.hide();
      console.warn("error" + err);
      navigator.notification.alert('Something has gone wrong: ' + err, null, 'Oops', 'Ok');
    }

    listRemoved = function (removed_list) {
      console.log("list <" + $rootScope.list.name + "> removed");
      $rootScope.lists.splice($rootScope.list_idx, 1);
      //current_user.lists = ShoppingListStorage().find().data;
      current_user.lists = $rootScope.lists;
      $ionicLoading.hide();
      $rootScope.$apply();
      $ionicHistory.goBack();
    }

  })

  // 11_lista_pubblicata_con_spesario.html
  .controller('ConfirmedListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {


  })

  // 12_lista_prodotti_gia_pubblicata.html
  .controller('ProductsPublicatedListDemanderCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.list = $rootScope.list;

    $scope.view_product_details = function (product) {
      $state.go('tabsController.ElementDetailsDemander', { ProductId: product.objectId });
    }

  })

  // 13_prodotto_specifico_demander.html
  .controller('ElementDetailsDemanderCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.product = { unit: {} };

    $scope.product_idx = arrayObjectIndexOf($rootScope.list.items, $state.params.ProductId, "objectId");
    $scope.units = getUnitsNames();

    $scope.is_new_product = ($scope.product_idx == -1);

    if ($scope.is_new_product) {
      $scope.product = backendlessify_shopping_item(new window.Classes.ShoppingItem({ updated: new Date(), created: new Date(), unit: {} }));
    } else {
      $scope.product = angular.copy($rootScope.list.items[$scope.product_idx]);
      if ($scope.product.unit == null)
        $scope.product.unit = {};
    }

    onError = function (err) {
      $ionicLoading.hide();
      console.warn("error" + err);
      navigator.notification.alert('Something has gone wrong: ' + err, null, 'Oops', 'Ok');
    }

    itemRemoved = function (item_removed) {
      $ionicLoading.hide();
      console.log("item removed");
      //$rootScope.list = backendlessify_shopping_list(ShoppingListStorage().findById($rootScope.list_id));
      $rootScope.list.items.splice($scope.product_idx, 1);
      $rootScope.lists[$rootScope.list_idx] = $rootScope.list;
      current_user.lists = $rootScope.lists;
      $rootScope.$apply();
      $ionicHistory.goBack();
    }

    $scope.delete_product = function () {

      if (!check_token())
        return;

      if ($scope.is_new_product)
        return;

      $ionicLoading.show({
        template: 'Please wait...'
      });
      ShoppingItemStorage().remove($scope.product, new Backendless.Async(itemRemoved, onError));

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

      if ($scope.product.name == null || $scope.product.name.length == 0) {
        navigator.notification.alert("Inserisci il nome del prodotto", null, "Info", 'Ok');
        return;
      }
      if ($scope.product.qty == null || $scope.product.qty.length == 0) {
        navigator.notification.alert("Inserisci la quantità", null, "Info", 'Ok');
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

      if ($scope.is_new_product) {
        $rootScope.list.addItemToItems(backendlessify_shopping_item($scope.product));
      } else {
        $rootScope.list.items[$scope.product_idx] = $scope.product;
      }
      $rootScope.list = backendlessify_shopping_list($rootScope.list);
      $rootScope.list.save(new Backendless.Async(listUpdated, onError));
    }

  })

  // 14_lista_dei_candidati.html
  .controller('CandidateListCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.view_candidate_info = function (candidate) {
      $state.go('tabsController.CandidateInfo', { CandidateId: candidate.objectId });
    }

  })

  // 15_dettagli_spesa_pubblicata_e_confermata.html
  .controller('PublicatedListDetailsCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {


  })

  // 16_info_candidato_non_ancora_accettato.html
  .controller('CandidateInfoCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.candidate_idx = arrayObjectIndexOf($rootScope.list.candidates, $state.params.CandidateId, "objectId");
    if ($scope.candidate_idx > -1) {
      $scope.candidate = $rootScope.list.candidates[$scope.candidate_idx];
    } else {
      navigator.notification.alert("Impossibile trovare il candidato", function () {
        $ionicHistory.goBack();
      }, "Oops", 'Ok');
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
      console.warn("error" + err);
      navigator.notification.alert('Something has gone wrong: ' + err, null, 'Oops', 'Ok');
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

  // 17B_profilo_candidati.html
  .controller('CandidateProfileCtrl', function ($scope, $rootScope, $state, UserService, DataExchange, $ionicModal, $ionicActionSheet, $ionicLoading, $ionicHistory) {

    $scope.candidate_idx = arrayObjectIndexOf($rootScope.list.candidates, $state.params.CandidateId, "objectId");
    if ($scope.candidate_idx > -1) {
      $scope.candidate = $rootScope.list.candidates[$scope.candidate_idx];
    } else {
      navigator.notification.alert("Impossibile trovare il candidato", function () {
        $ionicHistory.goBack();
      }, "Oops", 'Ok');
    }

  })