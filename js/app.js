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
          "author":item.snippet.channelTitle,
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

var results_arr, prev_page,
    n = 0, slice_size = 7,
    last_position = {};
var form = document.querySelector('form');
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

var scroller_func = function() {
  var lastDiv = document.querySelectorAll(".item");
  var lastLeft = lastDiv[lastDiv.length - 1].getBoundingClientRect().left;
  var containerWidth = container.getBoundingClientRect().width;

  if(lastLeft < containerWidth) {
    loading = true;
    get_response(results_arr);
  }
};

var swipe = function() {
  var deltaX = last_position.x - event.clientX,
      deltaY = last_position.y - event.clientY;
  if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
    document.getElementById("results").scrollLeft += 600;
  } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
    document.getElementById("results").scrollLeft -= 600;
  }
}

var remove_mousemove = function() {
  container.removeEventListener("mousemove", swipe);
}

container.addEventListener("mousedown", function() {
  last_position = {
    x : event.clientX,
    y : event.clientY
  };
  container.addEventListener("mousemove", swipe);
})
container.addEventListener("mouseup", remove_mousemove)
container.addEventListener("mouseout", remove_mousemove)

container.addEventListener("scroll", scroller_func);
form.addEventListener("submit", request_func)
