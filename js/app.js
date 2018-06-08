function initialize() {
  gapi.client.setApiKey("AIzaSyAynu4A9roKHeuHnvnR1ioxyVcEVuwxun4");
  gapi.client.load("youtube", "v3", function() {});
}

$(function() {
  $("form").on("submit", request_func);
});

function parse_response(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

var results_arr, n = 0, slice_size = 6;

request_func = function(e) {
  e.preventDefault();
  var request = gapi.client.youtube.search.list({
      q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
      part: "snippet",
      type: "video",
      maxResults: 50,
      order: "viewCount"
  }); 
  request.execute(function(response) {
    var results = response.result;
    $("#results").html("");
    n = 0;
    results_arr = results.items
    $.each(results.items.slice(n, n + slice_size), function(index, item) {
      $.get("templates/item.html", function(data) {
        $("#results").append(parse_response(data, [{
            "title":item.snippet.title, 
            "videoid":item.id.videoId,
            "description":item.snippet.description,
            "author":item.snippet.channelTitle
        }]));
      });
    });
    n = n + slice_size;
  });
}

$(".container").on('scroll', function(e) {
  var lastDiv = $('.item').last();
  var lastLeft = lastDiv[0].getBoundingClientRect().left;
  var containerWidth = $(".container").width();

  if(lastLeft < containerWidth) {
    loading = true;
    $.each(results_arr.slice(n, n + slice_size), function(index, item) {
      $.get("templates/item.html", function(data) {
        $("#results").append(parse_response(data, [{
            "title":item.snippet.title, 
            "videoid":item.id.videoId,
            "description":item.snippet.description,
            "author":item.snippet.channelTitle
        }]));
      });
    });
    n = n + slice_size;
  }
});
