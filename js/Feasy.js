
var APPLICATION_ID = 'B4A6E251-561B-FEC4-FFFE-5BD9A26DB600';
var SECRET_KEY = '7146EA6D-CE63-970D-FF6D-9DBBF2EEED00';
var VERSION = 'v1';
Backendless.serverURL = "https://api.backendless.com";

Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);

var $rootScope = window;


function cleanPrivateRelations(data) {
  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  if (data.hasOwnProperty('_private_relations') && data['_private_relations'].length > 0) {
    data['_private_relations'].forEach(function (relation) {
      if (data.hasOwnProperty(relation) && isObject(data[relation])) {
        if (Array.isArray(data[relation])) {
          data[relation].forEach(function (elem) {
            if (isObject(elem)) {
              cleanPrivateRelations(elem);
            }
          });
        } else {
          cleanPrivateRelations(data[relation]);
        }
      }
    });
  }

  if (isObject(data)) {
    delete data['_private_relations'];
    delete data['_private_geoRelations'];
    delete data['_private_dates'];
  }
}

$rootScope.Classes = {
  CandidateInfo: function CandidateInfo(args) {
    args = args || {};

    this.full_name = args.full_name || null;
    this.accomplished_tasks = args.accomplished_tasks || null;
    this.gender = args.gender || null;
    this.conditions_max_value = args.conditions_max_value || null;
    this.nationality = args.nationality || null;
    this.conditions_weight = args.conditions_weight || null;
    this.birthday = args.birthday || null;
    this.created = args.created || null;
    this.updated = args.updated || null;
    this.profile_pic_url = args.profile_pic_url || null;
    this.objectId = args.objectId || null;
    this.last_name = args.last_name || null;
    this.list_id = args.list_id || null;
    this.conditions_reward = args.conditions_reward || null;
    this.ownerId = args.ownerId || null;
    this.rating = args.rating || null;
    this.requested_tasks = args.requested_tasks || null;
    this.accepted_tasks = args.accepted_tasks || null;
    this.conditions_shops = args.conditions_shops || null;
    this.first_name = args.first_name || null;

    this._private_relations = [];
    this._private_geoRelations = [];
    this._private_dates = [
    "created",
    "updated"];
    this.___class = "CandidateInfo";


    var storage = Backendless.Persistence.of(CandidateInfo);

    this.save = function (async) {
      cleanPrivateRelations(this);
      storage.save(this, async);
    };

    this.remove = function (async) {
      var result = storage.remove(this, async);
      this.objectId = null;
      return result;
    };

    this._private_describeClass = function () {
      return Backendless.Persistence.describe(this.___class);
    };


  }, ShoppingList: function ShoppingList(args) {
    args = args || {};

    this.comments = args.comments || null;
    this.max_value = args.max_value || null;
    this.delivery_hours = args.delivery_hours || null;
    this.ownerId = args.ownerId || null;
    this.objectId = args.objectId || null;
    this.reward = args.reward || null;
    this.estimated_weight = args.estimated_weight || null;
    this.preferred_shops = args.preferred_shops || null;
    this.active = args.active || null;
    this.name = args.name || null;
    this.updated = args.updated || null;
    this.created = args.created || null;
    this.estimated_value = args.estimated_value || null;

    this._private_relations = [
    "candidates",
    "chosen_candidate",
    "items"];
    this._private_geoRelations = [
    "delivery_addresses"];
    this._private_dates = [
    "updated",
    "created"];
    this.___class = "ShoppingList";


    this.candidates = args.candidates || null;

    this.chosen_candidate = args.chosen_candidate || null;

    this.items = args.items || null;

    var storage = Backendless.Persistence.of(ShoppingList);

    this.save = function (async) {
      cleanPrivateRelations(this);
      storage.save(this, async);
    };

    this.remove = function (async) {
      var result = storage.remove(this, async);
      this.objectId = null;
      return result;
    };

    this._private_describeClass = function () {
      return Backendless.Persistence.describe(this.___class);
    };


    this.addItemToCandidates = function (item) {
      if (this.candidates == null)
        this.candidates = [];

      this.candidates.push(item);
      return this.candidates;
    };

    this.removeItemFromCandidates = function (item, async) {
      if (this.candidates == null)
        storage.loadRelations(this, ['candidates']);

      for (var j = 0; j < this.candidates.length; j++) {
        if (this.candidates[j].objectId === item.objectId) {
          this.candidates.splice(j, j + 1);
          this.save(async);
          break;
        }
      }
    };
    this.removeAllCandidates = function (async) {
      this.candidates = null;
      this.save(async);
    };

    this.getCandidates = function () {
      if (this.candidates == null)
        storage.loadRelations(this, ['candidates']);

      return this.candidates;
    };

    this.getChosen_candidate = function () {
      if (this.chosen_candidate == null)
        storage.loadRelations(this, ['chosen_candidate']);

      return this.chosen_candidate;
    };

    this.addItemToItems = function (item) {
      if (this.items == null)
        this.items = [];

      this.items.push(item);
      return this.items;
    };

    this.removeItemFromItems = function (item, async) {
      if (this.items == null)
        storage.loadRelations(this, ['items']);

      for (var j = 0; j < this.items.length; j++) {
        if (this.items[j].objectId === item.objectId) {
          this.items.splice(j, j + 1);
          this.save(async);
          break;
        }
      }
    };
    this.removeAllItems = function (async) {
      this.items = null;
      this.save(async);
    };

    this.getItems = function () {
      if (this.items == null)
        storage.loadRelations(this, ['items']);

      return this.items;
    };

  }, PaymentInfo: function PaymentInfo(args) {
    args = args || {};

    this.created = args.created || null;
    this.cvv = args.cvv || null;
    this.type = args.type || null;
    this.updated = args.updated || null;
    this.holder_name = args.holder_name || null;
    this.card_number = args.card_number || null;
    this.sub_type = args.sub_type || null;
    this.expiry_date = args.expiry_date || null;
    this.ownerId = args.ownerId || null;
    this.objectId = args.objectId || null;

    this._private_relations = [];
    this._private_geoRelations = [];
    this._private_dates = [
    "created",
    "updated"];
    this.___class = "PaymentInfo";


    var storage = Backendless.Persistence.of(PaymentInfo);

    this.save = function (async) {
      cleanPrivateRelations(this);
      storage.save(this, async);
    };

    this.remove = function (async) {
      var result = storage.remove(this, async);
      this.objectId = null;
      return result;
    };

    this._private_describeClass = function () {
      return Backendless.Persistence.describe(this.___class);
    };


  }, ShoppingItem: function ShoppingItem(args) {
    args = args || {};

    this.ownerId = args.ownerId || null;
    this.updated = args.updated || null;
    this.brand = args.brand || null;
    this.objectId = args.objectId || null;
    this.name = args.name || null;
    this.qty = args.qty || null;
    this.price_range = args.price_range || null;
    this.created = args.created || null;
    this.other = args.other || null;

    this._private_relations = [
    "unit"];
    this._private_geoRelations = [];
    this._private_dates = [
    "updated",
    "created"];
    this.___class = "ShoppingItem";


    this.unit = args.unit || null;

    var storage = Backendless.Persistence.of(ShoppingItem);

    this.save = function (async) {
      cleanPrivateRelations(this);
      storage.save(this, async);
    };

    this.remove = function (async) {
      var result = storage.remove(this, async);
      this.objectId = null;
      return result;
    };

    this._private_describeClass = function () {
      return Backendless.Persistence.describe(this.___class);
    };


    this.getUnit = function () {
      if (this.unit == null)
        storage.loadRelations(this, ['unit']);

      return this.unit;
    };

  }, MeasureUnits: function MeasureUnits(args) {
    args = args || {};

    this.updated = args.updated || null;
    this.ownerId = args.ownerId || null;
    this.unit_name = args.unit_name || null;
    this.objectId = args.objectId || null;
    this.created = args.created || null;

    this._private_relations = [];
    this._private_geoRelations = [];
    this._private_dates = [
    "updated",
    "created"];
    this.___class = "MeasureUnits";


    var storage = Backendless.Persistence.of(MeasureUnits);

    this.save = function (async) {
      cleanPrivateRelations(this);
      storage.save(this, async);
    };

    this.remove = function (async) {
      var result = storage.remove(this, async);
      this.objectId = null;
      return result;
    };

    this._private_describeClass = function () {
      return Backendless.Persistence.describe(this.___class);
    };


  }
}
