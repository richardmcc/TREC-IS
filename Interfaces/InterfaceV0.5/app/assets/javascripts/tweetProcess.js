var ws;

function openWebSocketConnection() {
    
    var wsURL = document.getElementById("myBody").getAttribute("wsdata"); 
    
	//alert("Looking up ".concat(wsURL));

    
    ws = new WebSocket(wsURL);
    ws.onmessage = function(event) {
      var message;
      message = JSON.parse(event.data);
      switch (message.type) {
        case "timelineupdate":
          //alert(messagie.json);
          var jsontweet = JSON.parse(message.json);
	  var tweettext = jsontweet.text;
	  var tweetid = jsontweet.id_str;
	  var username = jsontweet.user.name;
	  var profile_image_url_https = jsontweet.user.profile_image_url_https;
	  var retweet_count = jsontweet.retweet_count;
	  var tweettime = jsontweet.created_at;
	  var mediaURL = message.media;

	  var htmlInsert = "<article class=\"white-panel\"><img src=\"".concat(mediaURL).concat("\" alt=\"\">");
          htmlInsert = htmlInsert.concat("<h4><a href=\"#\">").concat(username).concat("</a></h4>");
          htmlInsert = htmlInsert.concat("<p>").concat(tweettext).concat("</p>");
	  htmlInsert.concat("</article>");
	
	  //alert(htmlInsert);

          var fragment = create(htmlInsert);
	  
	  document.getElementById("pinBoot").insertBefore(fragment, document.getElementById("pinBoot").childNodes[0]);		

          break;
        default:
          return console.log(message);
      }
    };
}

function tryStreamStart() {

  var fileURL = document.getElementById("tweetFileURL").value;
  
  //alert(fileURL);

  ws.send(JSON.stringify({
        symbol: "START",
        URL: fileURL
    }));

  //alert("Get url");

	

}

function tryStreamStop() {
  
  //alert(fileURL);

  ws.send(JSON.stringify({
        symbol: "STOP"
    }));

  //alert("Get url");

	

}



function create(htmlStr) {
   var frag = document.createDocumentFragment();

    temp = document.createElement('div');
        
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

$(document).ready(function() {
$('#pinBoot').pinterest_grid({
no_columns: 4,
padding_x: 10,
padding_y: 10,
margin_bottom: 50,
single_column_breakpoint: 700
});
});

/*
 * Ref:
 * Thanks to:
 * http://www.jqueryscript.net/layout/Simple-jQuery-Plugin-To-Create-Pinterest-Style-Grid-Layout-Pinterest-Grid.html
 * */


/*
 *     Pinterest Grid Plugin
 *         Copyright 2014 Mediademons
 *             @author smm 16/04/2014
 *
 *                 usage:
 *
 *                      $(document).ready(function() {
 *
 *                              $('#blog-landing').pinterest_grid({
 *                                          no_columns: 4
 *                                                  });
 *
 *                                                      });
 *
 *
 *                                                      */
;(function ($, window, document, undefined) {
    var pluginName = 'pinterest_grid',
        defaults = {
            padding_x: 10,
            padding_y: 10,
            no_columns: 3,
            margin_bottom: 50,
            single_column_breakpoint: 700
        },
        columns,
        $article,
        article_width;

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype.init = function () {
        var self = this,
            resize_finish;

        $(window).resize(function() {
            clearTimeout(resize_finish);
            resize_finish = setTimeout( function () {
                self.make_layout_change(self);
            }, 11);
        });

        self.make_layout_change(self);

        setTimeout(function() {
            $(window).resize();
        }, 500);
    };

    Plugin.prototype.calculate = function (single_column_mode) {
        var self = this,
            tallest = 0,
            row = 0,
            $container = $(this.element),
            container_width = $container.width();
            $article = $(this.element).children();

        if(single_column_mode === true) {
            article_width = $container.width() - self.options.padding_x;
        } else {
            article_width = ($container.width() - self.options.padding_x * self.options.no_columns) / self.options.no_columns;
        }

        $article.each(function() {
            $(this).css('width', article_width);
        });

        columns = self.options.no_columns;

        $article.each(function(index) {
            var current_column,
                left_out = 0,
                top = 0,
                $this = $(this),
                prevAll = $this.prevAll(),
                tallest = 0;

            if(single_column_mode === false) {
                current_column = (index % columns);
            } else {
                current_column = 0;
            }

            for(var t = 0; t < columns; t++) {
                $this.removeClass('c'+t);
            }

            if(index % columns === 0) {
                row++;
            }

            $this.addClass('c' + current_column);
            $this.addClass('r' + row);

            prevAll.each(function(index) {
                if($(this).hasClass('c' + current_column)) {
                    top += $(this).outerHeight() + self.options.padding_y;
                }
            });

            if(single_column_mode === true) {
                left_out = 0;
            } else {
                left_out = (index % columns) * (article_width + self.options.padding_x);
            }

            $this.css({
                'left': left_out,
                'top' : top
            });
        });

        this.tallest($container);
        $(window).resize();
    };

    Plugin.prototype.tallest = function (_container) {
        var column_heights = [],
            largest = 0;

        for(var z = 0; z < columns; z++) {
            var temp_height = 0;
            _container.find('.c'+z).each(function() {
                temp_height += $(this).outerHeight();
            });
            column_heights[z] = temp_height;
        }

        largest = Math.max.apply(Math, column_heights);
        _container.css('height', largest + (this.options.padding_y + this.options.margin_bottom));
    };

    Plugin.prototype.make_layout_change = function (_self) {
        if($(window).width() < _self.options.single_column_breakpoint) {
            _self.calculate(true);
        } else {
            _self.calculate(false);
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Plugin(this, options));
            }
        });
    }

})(jQuery, window, document);

