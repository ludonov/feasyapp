angular.module('app.routes', [])

.config(function ($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


		.state('tabsController', {
		  url: '/Menu',
		  abstract: true,
		  templateUrl: 'templates/tabsController.html'
		})

		.state('Startup', {
		  url: '/Startup',
		  templateUrl: '0_loading.html',
      controller: 'StartupCtrl'
		})


    .state('Login', {

      url: '/Login',
      templateUrl: '1_login.html',
      controller: 'LoginCtrl'

    })

    .state('RecoverPass', {

      url: '/RecoverPass',
      templateUrl: '2_password_dimenticata.html',
      controller: 'RecoverPassCtrl'

    })

    .state('Signup', {

      url: '/Signup',
      templateUrl: '3_iscriviti.html',
      controller: 'SignupCtrl'

    })

    .state('CreateAccount', {

      url: '/CreateAccount',
      templateUrl: '4_crea_account.html',
      controller: 'CreateAccountCtrl'

    })

    .state('tabsController.Home', { /**/

      url: '/Home',
      views: {
        'tab_home': {
          templateUrl: '5_home.html',
          controller: 'HomeCtrl'
        }
      }
    })

    .state('tabsController.MyListsToCommission', { /**/

      url: '/MyListsToCommission',
      views: {
        'tab_liste': {
          templateUrl: '6_liste.html',
          controller: 'MyListsToCommissionCtrl'
        }
      }
    })

    .state('tabsController.ListView', { /**/

      url: '/ListView',
      views: {
        'tab_liste': {
          templateUrl: '7_lista.html',
          controller: 'ListViewCtrl'
        }
      }
    })

    .state('tabsController.NewListElement', { /**/

      url: '/NewListElement',
      views: {
        'tab_liste': {
          templateUrl: '8_inserisci_nuovo_elemento.html',
          controller: 'NewListElementCtrl'
        }
      }

    })

    .state('tabsController.PublicateList', { /**/

      url: '/PublicateList',
      views: {
        'tab_liste': {
          templateUrl: '9_pubblica_lista.html',
          controller: 'PublicateListCtrl'
        }
      }

    })

    .state('tabsController.PublicatedList', { /**/

      url: '/PublicatedList',
      views: {
        'tab_liste': {
          templateUrl: '10_lista_pubblicata_senza_spesario.html',
          controller: 'PublicatedListCtrl'
        }
      }
    })

    .state('tabsController.ConfirmedList', { /**/

      url: '/ConfirmedList',
      views: {
        'tab_liste': {
          templateUrl: '11_lista_pubblicata_con_spesario.html',
          controller: 'ConfirmedListCtrl'
        }
      }
    })

    .state('tabsController.ProductsPublicatedList', { /**/

      url: '/ProductsPublicatedList',
      views: {
        'tab_liste': {
          templateUrl: '12_lista_prodotti_gia_pubblicata.html',
          controller: 'ProductsPublicatedListCtrl'
        }
      }
    })

    .state('tabsController.ElementDetails', { /**/

      url: '/ElementDetails/:ProductId',
      views: {
        'tab_liste': {
          templateUrl: '13_prodotto_specifico.html',
          controller: 'ElementDetailsCtrl'
        }
      }
    })

    .state('tabsController.CandidateList', { /**/

      url: '/CandidateList',
      views: {
        'tab_liste': {
          templateUrl: '14_lista_dei_candidati.html',
          controller: 'CandidateListCtrl'
        }
      }
    })

    .state('tabsController.PublicatedListDetails', { /**/

      url: '/PublicatedListDetails',
      views: {
        'tab_liste': {
          templateUrl: '15_dettagli_spesa_pubblicata_e_confermata.html',
          controller: 'PublicatedListDetailsCtrl'
        }
      }
    })

    .state('tabsController.CandidateInfo', { /**/

      url: '/CandidateInfo/:CandidateId',
      views: {
        'tab_liste': {
          templateUrl: '16_info_candidato_non_ancora_accettato.html',
          controller: 'CandidateInfoCtrl'
        }
      }
    })

    .state('CandidateProfile', {
      url: '/CandidateProfile/:CandidateId',
      templateUrl: '17B_profilo_candidati.html',
      controller: 'CandidateProfileCtrl'
    })

    .state('UserProfile', {

      url: '/Home/UserProfile',
      templateUrl: '17A_profilo_utente.html',
      controller: 'UserProfileCtrl'

    })

    .state('tabsController.FindListOnMap', { /**/

      url: '/FindListOnMap',
      views: {
        'tab_trova': {
          templateUrl: '18A_fai_la_spesa.html',
          controller: 'FindListOnMapCtrl'
        }
      }
    })

    .state('tabsController.MyListsToDo', { /**/

      url: '/MyListsToDo',
      views: {
        'tab_trova': {
          templateUrl: '18B_fai_la_spesa.html',
          controller: 'MyListsToDoCtrl'
        }
      }
    })

    .state('tabsController.FilterListOnMap', { /**/

      url: '/FilterListOnMap',
      views: {
        'tab_trova': {
          templateUrl: '18C_fai_la_spesa_filtri.html',
          controller: 'FilterListOnMapCtrl'
        }
      }
    })

    .state('tabsController.ChatList', { /**/

      url: '/ChatList',
      views: {
        'tab_chat': {
          templateUrl: '19_lista_chat.html',
          controller: 'ChatListCtrl'
        }
      }
    })

    .state('Chat', {

      url: '/Chat',
      templateUrl: '20_chat.html',
      controller: 'ChatCtrl'

    })

    .state('Wallet', {

      url: '/Wallet',
      templateUrl: '21_portafoglio.html',
      controller: 'WalletCtrl'

    })

    .state('History', {

      url: '/History',
      templateUrl: '22_cronologia.html',
      controller: 'HistoryCtrl'

    })

    .state('Settings', {

      url: '/Home/Settings',
      templateUrl: '23_impostazioni.html',
      controller: 'SettingsCtrl'

    })

    .state('EditProfile', {

      url: '/EditProfile',
      templateUrl: '24A_modifica_profilo.html',
      controller: 'EditProfileCtrl'

    })

    .state('ResetPassword', {

      url: '/ResetPassword',
      templateUrl: '25_reimposta_password.html',
      controller: 'ResetPasswordCtrl'

    })

    .state('TermsAndConditions', {

      url: '/TermsAndConditions',
      templateUrl: '26_termini_e_condizioni.html',
      controller: 'TermsAndConditionsCtrl'

    })

    .state('ListInfoFromMap', {

      url: '/ListInfoFromMap',
      templateUrl: '27_spesa_selezionata_da_mappa.html',
      controller: 'ListInfoFromMapCtrl'

    });

  $urlRouterProvider.otherwise('/Startup');

});
