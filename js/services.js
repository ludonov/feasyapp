angular.module('app.services', [])

  .factory('BlankFactory', [function () {

  }])

  .run(function () {

  })

  .service('UserService', function ($cordovaFile) {
    // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
    var setUser = function (user_data) {
      window.localStorage.setItem("user", JSON.stringify(user_data));
    };

    var getUser = function () {
      try {

        var _user = JSON.parse(window.localStorage.getItem("user") || '{}');
        if (_user.email == undefined || _user.password == undefined) {
          return {};
        }
        var backend_user = Backendless.UserService.login(_user.email, _user.password);
        var lists = null;
        updateLists(backend_user);
        return backend_user;
      } catch (e) {
        return {};
      }
    };

    var updateLists = function (user) {
      try {
        lists = Backendless.Persistence.of(window.Classes.ShoppingList).find();
        if (lists != null && lists.data != null && lists.data.length > 0)
          user.lists = lists.data;
      } catch (e) {
      }
      return user;
    }

    var logout = function () {
      window.localStorage.removeItem("user");
    };

    return {
      getUser: getUser,
      setUser: setUser,
      updateLists: updateLists,
      logout: logout
    };

  })

  .service('DataExchange', function ($cordovaFile, $q) {

    var _current_user = {};

    var _update_current_user = function(new_current_user, callback) {

      // using $q to fake async data grab
      return $q.when(new_current_user)
        .then(function(data) {
          // this is the magic
          angular.copy(data, _current_user);
          if (callback |= null)
            callback(_current_user);
        });
    };

    return {
      current_user: _current_user,
      update_current_user: _update_current_user
    };

  })
