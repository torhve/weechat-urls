//
// Adapted from Explore App by Livefront
//
// 
//
var slideshow;
//(function ($) {

  // Explore app config options.
  //
  var Config = {
    // If a touch event lasts longer than this threshold (in ms), then it's not considered
    // a swipe.
    slideshowSwipeDurationThreshold: 300,

    // Swipe gestures must be 40 pixels or less on the x-axis.
    slideshowSwipeDistanceThreshold: 40,

    // How long it takes to complete a swipe animation after a swipe is detected.
    slideshowTransitionDuration: 200,

    // localStorage key for photo data.
    localStoragePhotoDataKey: 'photoData',

    // localStorage key for the splash image.
    localStorageSplashImageKey: 'splashImage',

    // localStorage key for the map image.
    localStorageMapImageKey: 'mapImage',

    // URL for the splash image.
    localStorageSplashImagePath: 'static/bg.jpg',

    // URL for the map image.
    localStorageMapImagePath: 'images/backgrounds/bg-map.png',

    // Indicates whether or not this browser has localStorage available. Borrowed from
    // Modernizr.
    hasLocalStorage: (function () {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch(e) {
        return false;
      }
    })(),

    // Artificial delay when the app first starts to simulate loading images from a remote
    // API.
    loadPhotosDelay: 3000,

    // Padding around map markers to make their touch surface larger.
    markerPadding: 12
  };

  // Hard-coded photo data for demonstration purposes. This data would probably be loaded
  // via a remote API in a production application.
  //
  /*
  var PhotoData = [
    {
      name: 'Bolivia',
      details: 'Salar de Uyuni',
      location: '20.1338° S, 67.4891° W',
      position: { x: 587, y: 870 },
      url: 'images/photos/bolivia.jpg'
    },
    {
      name: 'British Virgin Islands',
      details: 'Tortola',
      location: '605,640 - 18.4167° N, 64.5833° W',
      position: { x: 605, y: 640 },
      url: 'images/photos/british-virgin-islands.jpg'
    },
    {
      name: 'Egypt',
      details: 'Pyramids',
      location: '29.9792° N, 31.1342° E',
      position: { x: 1143, y: 574 },
      url: 'images/photos/egypt.jpg'
    },
    {
      name: 'Israel',
      details: 'Ceasarea',
      location: '32.5000° N, 34.8997° E',
      position: { x: 1165, y: 546 },
      url: 'images/photos/israel.jpg'
    },
    {
      name: 'Jordan',
      details: 'Petra',
      location: '30.3286° N, 35.4419° E',
      position: { x: 1181, y: 566 },
      url: 'images/photos/jordan.jpg'
    },
    {
      name: 'Malawi',
      details: 'Liwonde Natl Park',
      location: '14.8333° S, 35.3333° E',
      position: { x: 1165, y: 828 },
      url: 'images/photos/malawi.jpg'
    },
    {
      name: 'Mexico',
      details: 'Copper Canyon',
      location: '27.5161° N, 107.7658° W',
      position: { x: 375, y: 578 },
      url: 'images/photos/mexico.jpg'
    },
    {
      name: 'Peru',
      details: 'Inca Trail',
      location: '13.1631° S, 72.5456° W',
      position: { x: 553, y: 830 },
      url: 'images/photos/peru.jpg'
    },
    {
      name: 'Rwanda',
      details: 'Jungle',
      location: '2.0241° S, 29.6695° E',
      position: { x: 1137, y: 764 },
      url: 'images/photos/rwanda.jpg'
    },
    {
      name: 'South Africa',
      details: 'Inyati Game Lodge',
      location: '24.0110° S, 31.4850° E',
      position: { x: 1127, y: 926 },
      url: 'images/photos/south-africa.jpg'
    },
    {
      name: 'Spain',
      details: 'Santiago de Compostela',
      location: '42.8833° N, 8.5333° W',
      position: { x: 943, y: 482 },
      url: 'images/photos/spain.jpg'
    },
    {
      name: 'Tanzania',
      details: 'Katavi Natl Park',
      location: '6.8333° S, 31.2500° E',
      position: { x: 1169, y: 796 },
      url: 'images/photos/tanzania.jpg'
    },
    {
      name: 'Thailand',
      details: 'Ko Chung',
      location: '12.2417° N, 102.5125° E',
      position: { x: 1575, y: 672 },
      url: 'images/photos/thailand.jpg'
    },
    {
      name: 'Turkey',
      details: 'Cappadocia',
      location: '38.6706° N, 34.8392° E',
      position: { x: 1147, y: 504 },
      url: 'images/photos/turkey.jpg'
    }
  ];*/

  // This object handles displaying the world map, displaying map markers, and animating
  // the slideshow in and out of view when markers are selected.
  //
  // ==== Parameters
  //
  // [selector]
  //   The selector for the world map element in the DOM.
  //
  var WorldMap = function (selector) {
    var container = $(selector);
    var mapElement = container.find('#map');
    var slideshow = new Slideshow('#photos');
    var markers = [];
    var currentMarker = null;

    mapElement.click(function (e) {
      mapElement.css('-webkit-transition', 'all 600ms ease-in-out');
      mapElement.css('-webkit-transform', 'translate3d(0, 0, 0)');
      slideshow.hide();
      currentMarker = null;

      for (var index = 0; index < markers.length; index++) {
        markers[index].show();
      }
    });

    slideshow.onShowPhoto(function (photoIndex) {
      var marker = markers[photoIndex];
      if (currentMarker != marker) {
        moveToMarker(marker);
      }
    });

    $(window).resize(function () {
      if (currentMarker !== null) {
        setTimeout(function () {
          moveToMarker(currentMarker, 0);
        }, 0);
      }
    });

    function moveToMarker(marker, duration) {
      duration = typeof duration == 'undefined' ? 1000 : 0;

      for (var index = 0; index < markers.length; index++) {
        markers[index].hide();
      }

      currentMarker = marker;
      marker.select();

      var markerLeft = marker.element().position().left;
      var mapSliverWidth = $(window).width() - slideshow.width();
      var maxTranslateX = mapElement.width() - mapSliverWidth;
      var mapLeft = mapElement.position().left;
      var translateX = markerLeft - mapSliverWidth / 2.0 - mapLeft;

      if (translateX < 0) {
        translateX = 0;
      } else if (translateX > maxTranslateX) {
        translateX = maxTranslateX;
      }

      mapElement.css('-webkit-transition', 'all ' + duration + 'ms ease-in-out');
      mapElement.css('-webkit-transform', 'translate3d(-' + translateX + 'px, 0, 0)');
    }

    this.displayCurrentLocation = function () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var lat = position.coords.latitude.toString();
          var lng = position.coords.longitude.toString();
          lat = lat.substring(0, lat.indexOf('.') + 6);
          lng = lng.substring(0, lng.indexOf('.') + 6);
          $('#location').html('<span><strong>Your Location:</strong> ' + lat + ', ' + lng + '</span>');
        });
      }
    };

    this.height = function () {
      return mapElement.height();
    };

    this.setPhotos = function (photos) {
      slideshow.setPhotos(photos);
      markers = [];
      /*for (var index = 0; index < photos.length; index++) {
        var photo = photos[index];
        photo.aspectRatio = photo.position.x / photo.position.y;
        var marker = new Marker(this, photo);
        mapElement.append(marker.element());
        markers.push(marker);
        marker.reposition();
        marker.click((function (marker, photoIndex) {
          return function (e) {
            if (currentMarker === null) {
              e.stopPropagation();
              moveToMarker(marker);
              slideshow.showPhoto(photoIndex);
            }
          }
        })(marker, index));
      }*/
    };

    this.show = function (callback) {
      var duration = 600;
      container.css('-webkit-transition', 'all ' + duration + 'ms ease-in-out');
      container.css('-webkit-transform', 'translate3d(0, 0, 0)');
      if ($.isFunction(callback)) {
        setTimeout(callback, duration);
      }
    };

    this.width = function () {
      return mapElement.width();
    };
  };

  WorldMap.width = 2027; // Width of the map image for calculating marker positions.
  WorldMap.height = 1178; // Height of the map image for calculating marker positions.
  WorldMap.aspectRatio = WorldMap.width / WorldMap.height;

  // The Slideshow object manages the slideshow, responds to touch events, and detects
  // swipes to allow the user to navigate back and forth.
  //
  // ==== Parameters
  //
  // [selector]
  //   The selector for slideshow element in the DOM.
  //
  var Slideshow = function(selector) {
    var container = $(selector);
    var slides = container.find('#slides-container')
    var slideDivs = slides.find('.slide');
    var leftSlide = slideDivs.eq(0);
    var centerSlide = slideDivs.eq(1);
    var rightSlide = slideDivs.eq(2);
    var slideInfo = container.find('#slide-info');
    var slideTitle = slideInfo.find('h1');
    var slideDetails = slideInfo.find('p:first');
    var slideLocation = slideInfo.find('p.location');

    var photos = [];
    var currentPhotoIndex = null;

    // This application is intended for tablets, but allow testing the site with the mouse.
    var hasTouch = 'ontouchstart' in document.documentElement;
    var touchstart = hasTouch ? 'touchstart' : 'mousedown';
    var touchmove = hasTouch ? 'touchmove' : 'mousemove';
    var touchend = hasTouch ? 'touchend' : 'mouseup';
    var touchId = null;
    var touchStartedAt = null;
    var touchEndedAt = null;
    var initialX = null;
    var startX = null;
    var transitionDuration = Config.slideshowTransitionDuration;

    var onShowPhoto = null;

    $(window).resize(function () {
      snapBack();
    });

    function touchStart(x) {
      touchStartedAt = new Date();
      initialX = slides.position().left;
      startX = x;
    }

    function touchMove(x) {
      var offset = initialX - (startX - x);
      animateSlides(0, offset);
    }

    function touchEnd(x) {
      touchEndedAt = new Date();
      var touchDuration = touchEndedAt - touchStartedAt;
      var deltaX = initialX - (startX - x) + container.width();
      var direction = deltaX > 0 ? 'backward' : 'forward';
      var threshold = container.width() / 2.0;

      if (Math.abs(deltaX) > threshold) {
        swipe(direction);
      } else if (Math.abs(deltaX) > Config.slideshowSwipeDistanceThreshold
          && touchDuration < Config.slideshowSwipeDurationThreshold) {
        swipe(direction);
      } else {
        snapBack();
      }
    }

    function swipe(direction) {
      var offset = direction == 'forward' ? -(container.width() * 2.0) : 0;
      animateSlides(transitionDuration, offset);
      animateDetails();
      setTimeout(function () {
        showPhoto(nextPhotoIndex(direction));
        finish();
      }, transitionDuration);
    }

    function snapBack() {
      animateSlides(transitionDuration, -container.width());
      setTimeout(finish, transitionDuration);
    }

    function finish() {
      animateSlides(0, -container.width());
      touchId = null;
      touchStartedAt = null;
      touchEndedAt = null;
      initialX = null;
      startX = null;
    }

    function animateSlides(duration, offset) {
      slides.css('-webkit-transition', 'all ' + duration + 'ms ease-in-out');
      slides.css('-webkit-transform', 'translate3d(' + offset + 'px, 0, 0)');
    }

    function animateDetails() {
      slideInfo.addClass('hidden');
    }

    function nextPhotoIndex(direction) {
      if (currentPhotoIndex === null) {
        return 0;
      } else if (direction == 'forward') {
        return (currentPhotoIndex == photos.length - 1) ? 0 : currentPhotoIndex + 1;
      } else {
        return (currentPhotoIndex == 0) ? photos.length - 1 : currentPhotoIndex - 1;
      }
    }

    function showPhoto(photoIndex) {
      currentPhotoIndex = photoIndex;
      container.addClass('show');
      var photo = photos[photoIndex];

      var photoIndexes = [
        nextPhotoIndex('backward'),
        photoIndex,
        nextPhotoIndex('forward')
      ];

      for (var n = 0; n < photoIndexes.length; n++) {
        var index = photoIndexes[n];
        var slide = slideDivs.eq(n);

        if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
          slide.css('background-image', 'url(' + photos[index].url + ')');
        } else {
          slide.children().remove();
          slide.append($('<img />').attr('src', photos[index].url));
        }
      }

      if ($.isFunction(onShowPhoto)) {
        onShowPhoto(photoIndex);
      }

      /*
      slideTitle.text(photo.name);
      slideDetails.text(photo.details);
      slideLocation.text(photo.location);
      slideInfo.removeClass('hidden');
      */
      slideTitle.text(photo.nick)
      slideDetails.text(photo.message);
      slideLocation.text(photo.buffer_name);
      slideInfo.removeClass('hidden');
    }

    slides.bind(touchstart, function (e) {
      if (touchId !== null) {
        e.stopPropagation();
        e.preventDefault();
      } else {
        if (hasTouch) {
          var touch = e.originalEvent.touches[0];
          touchId = touch.identifier;
          touchStart(touch.clientX);
        } else {
          touchId = 1
          touchStart(e.clientX);
        }
      }
    });

    slides.bind(touchmove, function (e) {
      if (touchId !== null && touchEndedAt === null) {
        if (hasTouch) {
          var touch = e.originalEvent.touches[0];
          if (touch.identifier == touchId) {
            touchMove(touch.clientX);
          }
        } else {
          touchMove(e.clientX);
        }
      }
    });

    slides.bind(touchend, function (e) {
      if (hasTouch) {
        var touch = e.originalEvent.changedTouches[0];
        if (touch.identifier == touchId) {
          touchEnd(touch.clientX);
        }
      } else {
        touchEnd(e.clientX);
      }
    });

    this.hide = function () {
      container.removeClass('show');
    };

    this.onShowPhoto = function (callback) {
      onShowPhoto = callback;
    };

    this.setPhotos = function(newPhotos) {
      photos = newPhotos;
    };

    this.showPhoto = function (photoIndex) {
      showPhoto(photoIndex);
    };

    this.width = function () {
      return container.width();
    };
  };

  // Encapsulates a marker on the map. When the marker is tapped, the photo for this
  // marker is animated into view. The marker is automatically repositioned when the
  // window is resized to account for different device orientations.
  //
  // ==== Parameters
  //
  // [map]
  //   The map to add a marker to.
  //
  // [photo]
  //   The photo to create a marker for.
  //
  var Marker = function (map, photo) {
    var marker = $('<a class="marker" href="#"></a>');

    marker.click(function (e) {
      e.preventDefault();
    });

    function reposition() {
      var currentAspectRatio = map.width() / map.height();
      var x = photo.position.x - Config.markerPadding / 2.0;
      var y = photo.position.y - Config.markerPadding / 2.0;

      if (currentAspectRatio < WorldMap.aspectRatio) {
        var dh = map.height() - map.width() / WorldMap.aspectRatio;
        var ratio = map.width() / WorldMap.width;
        x =  x * ratio;
        y = x / photo.aspectRatio + (dh / 2.0);
      } else {
        var dw = map.width() - map.height() * WorldMap.aspectRatio;
        var ratio = map.height() / WorldMap.height;
        y = y * ratio;
        x = y * photo.aspectRatio + (dw / 2.0);
      }

      marker.css({
        left: x + 'px',
        top: y + 'px'
      });
    }

    $(window).resize(reposition);

    this.click = function(clickHandler) {
      marker.click(clickHandler)
    };

    this.element = function () {
      return marker;
    };

    this.hide = function () {
      marker.addClass('hidden');
      marker.removeClass('selected');
    };

    this.reposition = function () {
      reposition();
    };

    this.select = function () {
      marker.removeClass('hidden');
      marker.addClass('selected');
    };

    this.show = function () {
      marker.removeClass('hidden');
      marker.removeClass('selected');
    };
  };

  // Implements a basic "quick button" tappable object. Click events are delayed on touch
  // devices to detect double-click events. You can avoid the ~300ms delay by using touch
  // events vs. click events.
  //
  // For more information, see: http://code.google.com/mobile/articles/fast_buttons.html
  //
  // ==== Parameters
  //
  // [element]
  //   The HTML element that will respond to taps.
  //
  // [handler]
  //   Callback function to invoke when the element is tapped.
  //
  var Tappable = function (element, handler) {
    this.element = element;
    this.handler = handler;
    element.addEventListener('touchstart', this, false);
    element.addEventListener('click', this, false);
  };

  Tappable.prototype.handleEvent = function (e) {
    switch (e.type) {
      case 'touchstart': this.touchStart(e); break;
      case 'touchend': this.touchEnd(e); break;
      case 'click': this.touchEnd(e); break;
    }
  };

  Tappable.prototype.touchStart = function (e) {
    e.preventDefault();
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.element.addEventListener('touchend', this, false);
  };

  Tappable.prototype.touchEnd = function (e) {
    this.element.removeEventListener('touchend', this, false);
    if (e.type == 'touchend') {
      if (Math.abs(e.changedTouches[0].clientX - this.startX) < 10
          && Math.abs(e.changedTouches[0].clientY - this.startY) < 10) {
        this.handler(e);
      }
    } else {
      this.handler(e);
    }
  };

  // Detect iPad and Android browsers. All other browsers will receive a warning message
  // that this app is optimized for WebKit and tablets.
  //
  function checkBrowserSupport() {
    var unsupported = $('#unsupported-browser');
    var title = null;
    var message = null;

    unsupported.find('a').click(function (e) {
      e.preventDefault();
      unsupported.fadeOut();
    });

    if (!navigator.userAgent.match(/webkit/i)) {
      title = 'This App is optimized for WebKit.';
      message = 'This app is only compatible with WebKit browsers.';
    }
    else if (!navigator.userAgent.match(/iPad|Android/i)) {
      title = 'This app is optimized for tablets.';
      message = 'This app is optimized for iOS and Android tablets. For best results, view this app on an iPad or Android tablet.';
    }

    if (title !== null) {
      unsupported.find('h1').text(title);
      unsupported.find('p.message').text(message);
      unsupported.show();
    }
  }

  // Loads photos from a remote API. Note that photo data is hard-coded in this function
  // for the purposes of the demo. This method also load the splash image and map image
  // and caches them in localStorage to speed up subsequent app sessions.
  //
  // ==== Parameters
  //
  // [photosHandler()]
  //   Callback function to process photos after they're loaded.
  //
  function loadPhotos(photosHandler) {
    function loadCachedImage(localStorageKey, url, contentType, callback) {
      var localStorageImageString = null;

      if (Config.hasLocalStorage) {
        localStorageImageString = localStorage.getItem(localStorageKey);
      }

      if (localStorageImageString === null) {
        var image = new Image();

        image.addEventListener('load', function () {
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, image.width, image.height);
          localStorageImageString = canvas.toDataURL(contentType)
          if (Config.hasLocalStorage) {
            localStorage.setItem(localStorageKey, localStorageImageString);
          }
          callback(localStorageImageString);
        });

        image.src = url;
      } else {
        callback(localStorageImageString);
      }
    }

    function loadSplashImage() {
      loadCachedImage(
        Config.localStorageSplashImageKey,
        Config.localStorageSplashImagePath,
        'image/jpeg',
        function (imageData) {
          $('#splash-image').css('background-image', 'url(' + imageData + ')');
        }
      );
    }

    function loadMapImage() {
      loadCachedImage(
        Config.localStorageMapImageKey,
        Config.localStorageMapImagePath,
        'image/png',
        function (imageData) {
          $('#map').css('background-image', 'url(' + imageData + ')');
        }
      );
    }

    function loadPhotoData() {
      // Preload photos. Note this preloads all of the photos for demo purposes only. If
      // you were loading lots of images from a remote API, then you should only preload
      // images you know will be displayed.
      for (var index = 0; index < PhotoData.length; index++) {
        console.log('Preloading photo ', PhotoData[index].url);
        (new Image()).src = PhotoData[index].url;
      }

      var localStoragePhotoData = null;

      if (Config.hasLocalStorage) {
        localStoragePhotoData = localStorage.getItem(Config.localStoragePhotoDataKey);
      }

      if (localStoragePhotoData === null) {
        // If this is the first load, use an artificial delay to simulate photos being
        // loaded from a remote API.
        setTimeout(function () {
          if (Config.hasLocalStorage) {
            // Save photo data to localStorage.
            var photoDataString = JSON.stringify(PhotoData);
            localStorage.setItem(Config.localStoragePhotoDataKey, photoDataString);
          }
          photosHandler(PhotoData);
        }, Config.loadPhotosDelay);
      } else {
        // Use photo data cached in localStorage.
        var photoDataObject = JSON.parse(localStoragePhotoData);
        photosHandler(photoDataObject);
      }
    }

    loadSplashImage();
    //loadMapImage();
    //loadPhotoData();
  }

  // Disable vertical bounce in Mobile Safari.
  //
  $(document).bind('touchmove', function(event){
    event.preventDefault();
  });

  // Load photos and initialize the map when the DOM is ready.
  //
  $(document).ready(function () {
    checkBrowserSupport();

    var spinner = $('#spinner');
    var splash = $('#splash');
    var splashImage = $('#splash-image');
    slideshow = new Slideshow('#photos');
    var photos = PhotoData;
    slideshow.setPhotos(photos);
    //splash.hide();
    //slideshow.showPhoto(0);
    //var map = new WorldMap('#content');
        splash.hide();
        var container = $('#content');
        var duration = 600;                                                          
        container.css('-webkit-transition', 'all ' + duration + 'ms ease-in-out');   
        container.css('-webkit-transform', 'translate3d(0, 0, 0)');                  
        slideshow.showPhoto(0);
      new Tappable(splash.get(0), function () {
        //map.show(function () {
        //  splash.hide();
        //});
        splash.hide();
        var container = $('#content');
        var duration = 600;                                                          
        container.css('-webkit-transition', 'all ' + duration + 'ms ease-in-out');   
        container.css('-webkit-transform', 'translate3d(0, 0, 0)');                  
        slideshow.showPhoto(0);
      });
    /*
    loadPhotos(function (photos) {
      spinner.css('opacity', 0);
      splash.find('h1').css('opacity', 1);
      //map.displayCurrentLocation();
      //map.setPhotos(photos);
      //map.slideshow.showPhoto(0);
      new Tappable(splash.get(0), function () {
        //map.show(function () {
        //  splash.hide();
        //});
        splash.hide();
        slideshow.showPhoto(0);
      });
    });*/
  });
//})(jQuery);
