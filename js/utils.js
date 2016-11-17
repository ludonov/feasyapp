/**
 * Created by Ludwig on 12/09/2016.
 */

var GoogleApiKey = "AIzaSyCkCAGEfkSWp3mWjtq8fIj9vGaMglpbsXE";

function backendlessify_user(not_backendless_obj) {
  not_backendless_obj = angular.fromJson(angular.toJson(not_backendless_obj))
  var new_usr = new Backendless.User();
  for (var k in not_backendless_obj) {
    //if (!k.startsWith("_") || k == "___class")
    new_usr[k] = not_backendless_obj[k];
  }

  new_usr.lists = [];
  if (not_backendless_obj.lists != null)
    not_backendless_obj.lists.forEach(function (list) {
      new_usr.lists.push(backendlessify_shopping_list(list));
    });

  new_usr.accepted_lists = [];
  if (not_backendless_obj.accepted_lists != null)
    not_backendless_obj.accepted_lists.forEach(function (list) {
      new_usr.accepted_lists.push(backendlessify_shopping_list(list));
    });

  // new_usr.addresses = [];
  // if (not_backendless_obj.addresses != null)
  //   not_backendless_obj.addresses.forEach(function (address) {
  //     new_usr.addresses.push(backendlessify_address_info(address));
  //   });

  cleanPrivateRelations(new_usr);
  return new_usr;
}

function backendlessify_shopping_list(not_backendless_obj) {
  not_backendless_obj = angular.fromJson(angular.toJson(not_backendless_obj))
  var new_list = new window.Classes.ShoppingList();
  for (var k in not_backendless_obj) {
    //if (!k.startsWith("_") || k == "___class")
    new_list[k] = not_backendless_obj[k];
  }

  // new_list.delivery_addresses = [];
  // if (not_backendless_obj.delivery_addresses != null)
  //   not_backendless_obj.delivery_addresses.forEach(function (addr) {
  //     new_list.delivery_addresses.push(backendlessify_address_info(addr));
  //   });

  new_list.items = [];
  if (not_backendless_obj.items != null)
    not_backendless_obj.items.forEach(function (item) {
      new_list.items.push(backendlessify_shopping_item(item));
    });

  new_list.active = new_list.active || false;
  //new_list.updated = new Date();
  cleanPrivateRelations(new_list);
  return new_list;
}

// function backendlessify_address_info(not_backendless_obj) {
//   not_backendless_obj = angular.fromJson(angular.toJson(not_backendless_obj))
//   var new_obj = new window.Classes.AddressInfo();
//   for (var k in not_backendless_obj) {
//     //if (!k.startsWith("_") || k == "___class")
//     new_obj[k] = not_backendless_obj[k];
//   }
//   cleanPrivateRelations(new_obj);
//   return new_obj;
// }

function backendlessify_shopping_item(not_backendless_obj) {
  not_backendless_obj = angular.fromJson(angular.toJson(not_backendless_obj))
  var new_obj = new window.Classes.ShoppingItem();
  for (var k in not_backendless_obj) {
    //if (!k.startsWith("_") || k == "___class")
    new_obj[k] = not_backendless_obj[k];
  }
  if (new_obj.unit != undefined && new_obj.unit.objectId == undefined) {
    delete new_obj.unit;
  }
  cleanPrivateRelations(new_obj);
  return new_obj;
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
	if (myArray == null || myArray == undefined)
		return -1;
  for (var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}

function getUnitsAndId() {
  return {
    "Grammi": "166B599D-267B-1A68-FF5D-86B35EE16F00",
    "Ettogrammi": "58B4450E-8729-765B-FF22-7983D8657D00",
    "Kilogrammi": "86693053-DED9-9D73-FFB7-D10B3D2EF800",
    "Pezzi": "622EF75C-0B77-61AA-FF7B-9F9884EC4400",
    "Litri": "22180B4A-CABC-3572-FF81-0567E8793800"
  };
}
function getUnitsNames() {
  return getKeys(getUnitsAndId());
}

function getUnitIdFromName(name) {
  return getUnitsAndId()[name];
}

function getUnitObject(name) {
  var unit = new window.Classes.MeasureUnits({ unit_name: name, objectId: getUnitIdFromName(name) });
  return unit;
}

function getKeys(obj) {
  var keys = [];
  for (var k in obj) keys.push(k);
  return keys;
}

download_file = function (url, filename, upload, callback) {

  var blob = null;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
  xhr.onload = function () {
    console.log("file blob downloaded: " + filename);
    blob = xhr.response;//xhr.response is now a blob object
    blob.lastModifiedDate = new Date();
    blob.name = filename;

    var myReader = new FileReader();
    myReader.onloadend = function (e) {
      console.log("read data bytes" + e);
      var arrayBuffer = e.target.result;
      var bytes = new Uint8Array(arrayBuffer);

      if (upload == true) {
        // upload file
        upload_file(filename, blob);
      }

      // save file locally
      writeBytesToFile(filename, bytes, callback);
    }
    myReader.readAsArrayBuffer(blob);

  }
  xhr.send();
}

upload_file = function (file_name, file_blob) {

  if (current_user == null || current_user.objectId == null) {
    console.log("cannot upload anonymous files..")
    return false;
  }

  var callback = {};
  callback.success = function (result) {
    console.log("File successfully uploaded. Path to download: " + result.fileURL);
  }
  callback.fault = function (result) {
    console.log("ERROR UPLOAD: " + result);
  }
  try {
    console.log("uploading: " + file_name);
    file_blob.name = file_name;
    Backendless.Files.upload(file_blob, "UserData/User_" + current_user.objectId, true, callback);
  } catch (e) {
    alert('Add some files to upload');
  }
}


function readFromFile(fileName, cb) {
  var pathToFile = cordova.file.dataDirectory + fileName;
  window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {
    fileEntry.file(function (file) {
      var reader = new FileReader();

      reader.onloadend = function (e) {
        cb(JSON.parse(this.result));
      };

      reader.readAsText(file);
    }, function (e) {
      console.log("readFromFile error: " + e);
    });
  }, function (e) {
    console.log("readFromFile error: " + e);
  });
}

function writeBytesToFile(fileName, data, cback) {
  window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
    directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
      fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function (e) {
          // for real-world usage, you might consider passing a success callback
          console.log('Write of file "' + fileName + '"" completed.');
          cback(true, e);
        };

        fileWriter.onerror = function (e) {
          // you could hook this up with our global error handler, or pass in an error callback
          console.log('Write failed: ' + e.toString());
          cback(false, e);
        };

        var blob = new Blob([data], { type: "application/octet-stream" });
        fileWriter.write(blob);
      }, function (e) {
        console.log("writeBytesToFile error: " + e);
      });
    }, function (e) {
      console.log("writeBytesToFile error: " + e);
    });
  }, function (e) {
    console.log("writeBytesToFile error: " + e);
  });
}

function writeStringToFile(fileName, data) {
  data = JSON.stringify(data, null, '\t');
  window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
    directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
      fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function (e) {
          // for real-world usage, you might consider passing a success callback
          console.log('Write of file "' + fileName + '"" completed.');
        };

        fileWriter.onerror = function (e) {
          // you could hook this up with our global error handler, or pass in an error callback
          console.log('Write failed: ' + e.toString());
        };

        var blob = new Blob([data], { type: 'text/plain' });
        fileWriter.write(blob);
      }, function (e) {
        console.log("writeStringToFile error: " + e);
      });
    }, function (e) {
      console.log("writeStringToFile error: " + e);
    });
  }, function (e) {
    console.log("writeStringToFile error: " + e);
  });
}

function get_unknown_man_pic() {
  return Backendless.serverURL + "/AF27BD78-71F2-8608-FFE8-B321A0083F00/v1/files/images%5Cunknown_man_pic.png";
}

function get_unknown_woman_pic() {
  return Backendless.serverURL + "/AF27BD78-71F2-8608-FFE8-B321A0083F00/v1/files/images%5Cunknown_woman_pic.png";
}

function get_profile_pic_url() {
  if (current_user == null || current_user.profile_pic_url == null || current_user.profile_pic_url == "") {
    if (current_user.gender == "female")
      return get_unknown_woman_pic();
    else
      return get_unknown_man_pic();
  } else {
    return current_user.profile_pic_url;
  }
}

function check_token() {

  if (!Backendless.UserService.isValidLogin()){
    $ionicPopup.alert({
      title: "Invalid login",
      template: "Il login è invalido, forse hai effettuato l'accesso da un altro dispositivo. Si prega di rieffettuare il login."
    });
    return false;
  } else {
    return true;
  }
}

function httpGetAsync(theUrl, callback)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

function get_current_city(callback) {
  httpGetAsync("http://www.geoplugin.net/xml.gp?ip=")
}

function get_ip_data_and_position(callback, err) {
  $.getJSON('http://ip-api.com/json', function (data) {
    callback(data);
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("get_ip_data_and_position error: " + textStatus);
    if (err != null) err("get_ip_data_and_position error: " + textStatus, jqXHR, errorThrown);
  });
}

function geodecode_address(address, callback, err) {

  var geocoder = new google.maps.Geocoder();

  // Geocode the address
  geocoder.geocode({'address': address}, function(results, status){
    try {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results.length == 1) {
          if (results[0].geometry.location.lat() == null || results[0].geometry.location.lng() == null) {
            console.log("geodecode_address error: lat or lng is null, but status OK");
            if (err != null) err("geodecode_address error: lat or lng is null, but status OK");
          } else {
            callback({ status: status, results: results });
          }
        } else {
          callback({ status: status, results: results });
        }
      }
      else {
        console.log("geodecode_address error: status not OK, but " + status);
        if (err != null) err("geodecode_address error: status not OK, but " + status);
      }
    } catch (errdata) {
      console.log("geodecode_address catch error: " + errdata);
      if (err != null) err("geodecode_address catch error: " + errdata);
    }
  });

  // $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?key=' + GoogleApiKey + '&address=' + encodeURI(address), function (data) {
  //   try {
  //     if (data.status.toLowerCase() != "ok" ) {
  //       err(data);
  //     } else {
  //       callback(data);
  //     }
  //   } catch (errdat) {
  //     err(errdat)
  //   }
  // }).fail(function (errdata) {
  //   console.log("Error geodecoding address: " + address);
  //   err(errdata);
  // });
}

function geodecode_geopoint(point, callback, err) {
  geodecode_address(geopoint_to_string(point), callback, err);
}

var getJSON = function(url, success, err) {
  return new Promise(function(ok, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        success(xhr.response);
      } else {
        err(status);
      }
    };
    xhr.send();
  });
};


var add_to_array = function(obj, arr) {
  if( arr == null )
    arr = [];
  arr.push(obj);
  return arr;
}

var geopoint_to_string = function(p) {
  var street_name = p.metadata.street_name ? p.metadata.street_name + ", " : "";
  var post_code = p.metadata.post_code ? p.metadata.post_code + " " : "";
  var city = p.metadata.city ? p.metadata.city + ", " : "";
  var nation = p.metadata.nation ? p.metadata.nation : "";
  return street_name + post_code + city + nation;
}

var create_blank_geopoint = function() {
  return new Backendless.GeoPoint({categories : ["lists"], metadata : {street_name : null, post_code : null, city : null, nation : null, time_from : null, time_to : null, formatted_address : null}});
}

var add_list_to_geopoint_metadata = function (geopoint_metadata, list) {
  if (geopoint_metadata == null)
    geopoint_metadata = {};
  //if (geopoint_metadata.list == null)
  //  geopoint_metadata.list = {};
  for (var property in list) {
    if (list.hasOwnProperty(property) && (typeof list[property]) != 'function' && (!property.startsWith("_")) && !property.startsWith("$") && property != "chosen_candidate" && property != "candidates" && property != "delivery_addresses" && property != "created" && property != "updated") {
      if (property == "items") {
        geopoint_metadata.items = [];
        for (var i = 0; i < list.items.length; i++) {
          var item = list.items[i];
          var new_item = {};
          for (var item_property in item) {
            if (item.hasOwnProperty(item_property) && (typeof item[item_property]) != 'function' && (!item_property.startsWith("_") || item_property == "___class") && !item_property.startsWith("$") && item_property != "created" && item_property != "updated" && item_property != "ownerId") {
              if (item_property == "unit") {
                if (item["unit"] != null) {
                  new_item["unit"] = item["unit"];
                  delete new_item.unit.created;
                  delete new_item.unit.updated;
                }
              } else {
                new_item[item_property] = item[item_property];
              }
            }
          }
          geopoint_metadata.items.push(new_item);
        }
      } else {
        geopoint_metadata[property] = list[property];
      }
    }
  }
  return geopoint_metadata;
}
