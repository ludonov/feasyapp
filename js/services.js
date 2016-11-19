angular.module('app.services', [])

  .service('UserService', function () {

    // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
    var setUser = function (user_data) {
      window.localStorage.setItem("user", JSON.stringify(user_data));
    };

    var getUser = function () {
      try {

        var _current_user = Backendless.UserService.getCurrentUser();
        if (_current_user != null)
          return _current_user;
        //else
        //  return {};

        var _user = JSON.parse(window.localStorage.getItem("user") || '{}');
        if (_user.email == undefined || _user.password == undefined) {
          return {};
        }
        var backend_user = Backendless.UserService.login(_user.email, _user.password, true);
        //var lists = null;
        //updateLists(backend_user);
        return backend_user;
      } catch (e) {
        return {};
      }
    };

    var updateLists = function (user) {
      try {
        //lists = Backendless.Persistence.of(window.Classes.ShoppingList).find();
        //if (lists != null && lists.data != null && lists.data.length > 0)
        //  user.lists = lists.data;
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

  .service('DataExchange', function () {

  })
