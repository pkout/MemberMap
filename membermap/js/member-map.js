
var settings = {

	/* Width of the map image. */
	MAP_WIDTH_PIXELS: 900,

	/* Height of the map image. If set to null, height will be set
	automatically to preserve width/height ratio. */
	MAP_HEIGHT_PIXELS: null,

	/* Offset of the profile from the map top. */
	PROFILE_TOP_OFFSET_PIXELS: 10,

	/* Profile width. */
	PROFILE_WIDTH_PIXELS: 400,

	/* Length of the profile slide in effect in milliseconds. */
	PROFILE_ANIMATION_MILLISECS: 400,

	/* Marker fill color. */
	MARKER_FILL_COLOR: '#fff',

	/* Marker stroke color. */
	MARKER_STROKE_COLOR: 'yellow'

}

/* Disable pulsating animation of markers. */
var stopMarkerAnim = false;

/* The console text to display by default. */
var defaultConsoleText = "&copy; " + new Date().getFullYear() + " MemberMap";

var draw = SVG('map-canvas');

var markers = draw.set();

/**
 * Returns true if the marker is on the left side of the map,
 * false otherwise.
 * 
 * @param  int  markerXCoord 	The marker X coordinate.
 * @return boolean  
 */
function isMarkerOnLeft(markerXCoord) {
	return markerXCoord < (settings.MAP_WIDTH_PIXELS / 2);
}

/**
 * Renders the basic HTML and SVG structure.
 */
function renderContent() {
	for (var i = 0; i < markersData.length; i++) {
		var markerId = 'marker-' + i;
		var marker = draw.circle(1).attr({ 
			id: markerId,
			'class': 'marker',
			cx: markersData[i].x, 
			cy: markersData[i].y, 
			fill: settings.MARKER_FILL_COLOR, 
			'fill-opacity': 1,
			stroke: settings.MARKER_STROKE_COLOR, 
			'stroke-width': 2 
		});
		marker.data('data', { 
			id: markerId,
			cx: markersData[i].x
		});
		marker.data('profile', { 
			name: markersData[i].name, 
			picturePath: markersData[i].pic, 
			info: markersData[i].info 
		});
		marker.mouseover(function() {
			toggleMarker(this.data('data').id, 'on');
			toggleMarkerLabel(this.data('data').id, 'on');
			showProfile(
				this.data('profile').name, 
				this.data('profile').picturePath,
				this.data('profile').info,
				isMarkerOnLeft(this.data('data').cx)
			);
		});
		marker.mouseout(function() { 
			toggleMarker(this.data('data').id, 'off'); 
			toggleMarkerLabel(this.data('data').id, 'off');
			hideProfile(isMarkerOnLeft(this.data('data').cx));
		});
		markers.add(marker);
	};
	markers.animate(500).attr({ rx: 3, ry: 3 }).after(function() {
		markers.animate(500).attr({ rx: 1, ry: 1 })
	});
}

/**
 * Initializes the widget.
 */
function init() {
	$("#member-map #map-wrapper #map").width(settings.MAP_WIDTH_PIXELS);
	if (typeof settings.MAP_HEIGHT_PIXELS != 'undefined') 
		$("#member-map #map-wrapper #map").height(settings.MAP_HEIGHT_PIXELS);
	$("#member-map #marker-labels").width(settings.MAP_WIDTH_PIXELS);
	$("#member-map #footer").width(settings.MAP_WIDTH_PIXELS);
	// $("#member-map #map-wrapper #profile").css(
	// 	"left", 
	// 	settings.MAP_WIDTH_PIXELS - settings.PROFILE_WIDTH_PIXELS - 1 + "px"
	// );
	$("#member-map #map-wrapper #profile").css(
		"max-height", 
		$("#member-map #map-wrapper #map").height() * 0.9 + "px"
	);
	// $("#member-map #map-wrapper #profile").css(
	// 	"margin-left", 
	// 	settings.PROFILE_WIDTH_PIXELS + "px"
	// );
	$("#member-map #map-wrapper #profile").css(
		"top", 
		settings.PROFILE_TOP_OFFSET_PIXELS + "px"
	);
	$("#member-map #map-wrapper #profile #profile-content #profile-pic").css(
		"min-width", 
		settings.PROFILE_WIDTH_PIXELS * 0.4 + "px"
	);
	$("#member-map #map-wrapper #profile #profile-content #profile-pic").css(
		"max-width", 
		settings.PROFILE_WIDTH_PIXELS * 0.5 + "px"
	);
}

/**
 * Animates all markers.
 * 
 * @param  draw.set markerSet A set of the marker SVG objects.
 */
function animateMarkers(markerSet) {
	if (!stopMarkerAnim) {
		markerSet.animate(1000).attr({ rx: 3, ry: 3 }).after(function() {
			markers.animate(1000).attr({ rx: 2, ry: 2 })
		});
	}
}

/**
 * Toggles the marker to the highlighted/non-highlighted animation state.
 * 
 * @param  string 	markerId 	ID of the marker.
 * @param  string 	state		'on'/'off'.
 */
function toggleMarker(markerId, state) {
	var marker = SVG.get(markerId);
	if (state == 'on') {
		var audio = $("#audio-" + markerId)[0];
		audio.play();
		stopMarkerAnim = true
		marker.stop();
		marker.animate(100).attr({ rx: 5, ry: 5 });
	}
	else {
		stopMarkerAnim = true
		marker.stop();
		marker.animate(100).attr({ rx: 2, ry: 2 }).after(function() {
			stopMarkerAnim = false;
		});
	}
}

/**
 * Toggles the marker textual label to the highlighted/non-highlighted state.
 * 
 * @param  string 	id    ID of the marker.
 * @param  string 	state 'on'/'off'.
 */
function toggleMarkerLabel(id, state) {
	var markerNameId = 'marker-label-' + 
		id.substring(id.lastIndexOf('-') + 1);
	if (state == 'on') {
		$("#" + markerNameId).addClass("on");
	}
	else {
		$("#" + markerNameId).removeClass("on");
	}
}

/**
 * Renders the marker labels above the map.
 */
function renderMarkerLabels() {
	$.each(markersData, function(i, markerData) {
		$("#member-map #marker-labels #marker-labels-content").append(
			'<a id="marker-label-' + i + '"' + 
				'class="marker-label" ' + 
				'href="#">' + markerData.name + 
			'</a>&nbsp;&nbsp;&nbsp;'
		);
		$("#member-map #marker-labels #marker-labels-content #marker-label-" + i).mouseover(
			function() {
				toggleMarker('marker-' + i, 'on');
				showProfile(markerData.name, 
							markerData.pic,
							markerData.info,
							isMarkerOnLeft(markerData.x));
			}
		);
		$("#member-map #marker-labels #marker-labels-content #marker-label-" + i).mouseout(
			function() {
				toggleMarker('marker-' + i, 'off');
				hideProfile(isMarkerOnLeft(markerData.x));
			}
		);
	});
}

/**
 * Renders the audio tags playing the sounds when mouse moves over a maker
 * or a marker label.
 */
function renderAudioTags() {
	$.each(markersData, function(i) {
		if (i != 0) {
			$("#audio-marker")
				.clone()
				.attr("id", "audio-marker-" + i)
				.appendTo($("#member-map"));
		}
	});
	$("#audio-marker").attr("id", "audio-marker-0");
}

/**
 * Prints out the text on the footer console.
 * 
 * @param  string 	text 	The text to print.
 */
function console(text) {
	$("#member-map #footer #footer-content").html(text);
}

/**
 * Prints the position of the cursors on the map to the console.
 */
function consoleMousePositionOnMap() {
	$('#member-map #map-canvas').mousemove(function(e) {
		var offset = $(this).offset();
		console("x: " + parseInt(e.clientX - offset.left) + 
				", y: " + parseInt(e.clientY - offset.top));
	});
	$('#member-map #map-canvas').mouseout(function(e) {
		console(defaultConsoleText);
	});
}

/**
 * Slides in the marker's profile and fills the profile with data.
 * 
 * @param  string 	name        	The member's full name.
 * @param  string 	picturePath 	The path to the member's picture.
 * @param  string 	details     	The textual details/description of 
 *                              	the member.
 * @param  string 	markerOnLeft 	If true, the marker is on the left side 
 *                               	of the map.
 */
function showProfile(name, picturePath, details, markerOnLeft) {
	$("#profile-pic").attr("src", picturePath);
	$("#profile-content #name").text(name);
	$("#profile-content #text").text(details);
	$("#profile").stop();
	$("#profile").css('width', '0px');
	if (markerOnLeft) {
		$("#profile").css('margin-left', 
						  settings.PROFILE_WIDTH_PIXELS + 'px');
		$("#profile").css('left', 
						  settings.MAP_WIDTH_PIXELS - 
						  settings.PROFILE_WIDTH_PIXELS - 1 + 'px');
	}
	else {
		$("#profile").css('margin-left', '0px');
		$("#profile").css('left', '0px');
	}
	$("#profile").animate({
            'margin-left': '0px',
            'width': settings.PROFILE_WIDTH_PIXELS + 'px'
        }, 
        settings.PROFILE_ANIMATION_MILLISECS,
        function() { }
    );
}

/**
 * Hides the profile that is currently showing.
 * @param  string 	markerOnLeft 	If true, the marker is on the 
 *                               	left side of the map.
 */
function hideProfile(markerOnLeft) {
	var marginLeft = '0px';
	var left = '0px';
	if (markerOnLeft) {
		marginLeft = settings.PROFILE_WIDTH_PIXELS + 'px';
		left = settings.MAP_WIDTH_PIXELS - 
			settings.PROFILE_WIDTH_PIXELS - 1 + 'px';
	}
	$("#profile").stop();
	$("#profile").animate({
        	'left': left,
            'margin-left': marginLeft,
            'width': '0px'
        }, 
        settings.PROFILE_ANIMATION_MILLISECS,
        function() {}
    );
}

window.setInterval("animateMarkers(markers)", 2000);

$(window).load(function() {
	renderContent();
	console(defaultConsoleText);
	consoleMousePositionOnMap();
	init();
	$('#profile').click(
        function() {
            hideProfile(false);
        }
    );

	renderMarkerLabels();
	renderAudioTags();
});
