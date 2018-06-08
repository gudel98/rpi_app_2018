function initialize() {
  gapi.client.setApiKey("AIzaSyAynu4A9roKHeuHnvnR1ioxyVcEVuwxun4");
  gapi.client.load("youtube", "v3", function() {});
}

function parse_response(data, response_arr) {
  res = data;
  for(var n = 0; n < response_arr.length; n++) {
    res = res.replace(/\{\{(.*?)\}\}/g, function(data, r) { return response_arr[n][r] } )
  }
  return res;
}

function get_response(results_arr) {
  array_new = results_arr.slice(n, n + slice_size);
  array_new.forEach(function(item) {
    ajax("templates/item.html", function(data) {
      document.querySelector("#results").innerHTML += parse_response(data, [{
          "title":item.snippet.title, 
          "videoid":item.id.videoId,
          "description":item.snippet.description,
          "author":item.snippet.channelTitle
      }]);
    });
  });
  n = n + slice_size;
}

function ajax(url, callback){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      callback(xmlhttp.responseText);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

var results_arr, n = 0, slice_size = 6;
var form = document.querySelector('form')
var container = document.querySelector(".container");

var request_func = function(e) {
  e.preventDefault();
  var request = gapi.client.youtube.search.list({
      q: encodeURIComponent(document.querySelector("#search").value).replace(/%20/g, "+"),
      part: "snippet",
      type: "video",
      maxResults: 50,
      order: "viewCount"
  }); 
  request.execute(function(response) {
    var results = response.result;
    document.querySelector("#results").innerHTML;
    n = 0;
    results_arr = results.items;
    get_response(results_arr);
  });
}

var handler = function() {
  var lastDiv = document.querySelectorAll(".item");
  var lastLeft = lastDiv[lastDiv.length - 1].getBoundingClientRect().left;
  var containerWidth = document.querySelector(".container").getBoundingClientRect().width;

  if(lastLeft < containerWidth) {
    loading = true;
    get_response(results_arr);
  }
};

container.addEventListener("scroll", handler);
form.addEventListener("submit", request_func)
