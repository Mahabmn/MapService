/*******************************************************************************
 * Copyright (c) 2014, 2017 IBM Corporation, Carnegie Mellon University and
 * others
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ******************************************************************************/
window.$hulop || eval('var $hulop={};');

$hulop.editor = function() {

	function i18nMenu(properties) {
		var result = [];
		[ 'en', 'ja', 'es', 'fr', 'ko', 'zh-CN' , 'ar'].forEach(function(lang) {
			result.push('group:I18N_' + lang);
			properties.forEach(function(p) {
				result.push(p + '_' + lang);
				p != 'hulop_content' && lang == 'ja' && result.push(p + '_hira');
			});
		});
		return result;
	}

	var PROPERTY_NAMES = {};

	PROPERTY_NAMES['node'] = [ 'node_id', 'lat', 'lon', 'link1_id', 'link2_id', 'link3_id', 'link4_id', 'link5_id', 'link6_id', 'link7_id', 'link8_id', 'link9_id', 'link10_id', 'floor', 'in_out' ];

	PROPERTY_NAMES['link'] = [ 'group:LAYER1',
		'link_id', 'start_id', 'end_id', 'distance', 'rt_struct', 'route_type', 'direction', 'width', 'vtcl_slope', 'lev_diff', 'tfc_signal', 'tfc_s_type', 'brail_tile', 'elevator', 'roof',
		'group:LAYER2',
		'start_time', 'end_time', 'start_date', 'end_date', 'no_serv_d', 'tfc_restr', 'w_min', 'w_min_lat', 'w_min_lon', 'vSlope_max', 'vSlope_lat', 'vSlope_lon',
		'hSlope_max', 'hSlope_lat', 'hSlope_lon', 'condition', 'levDif_max', 'levDif_lat', 'levDif_lon', 'stair', 'handrail', 'waterway', 'bus_stop', 'bus_s_lat', 'bus_s_lon',
		'facility', 'facil_lat', 'facil_lon', 'elev_lat', 'elev_lon', 'door_type', 'tfc_s_lat', 'tfc_s_lon', 'day_trfc', 'main_user', 'st_name',
		'group:LAYER3',
		'hulop_road_low_priority', 'hulop_road_width', 'hulop_distance_overwrite', 'hulop_elevator_equipments',
		'hulop_business_hours', 'hulop_business_hours_PreHoliday', 'hulop_business_hours_Holiday',
		'hulop_business_hours_Mon', 'hulop_business_hours_Tue', 'hulop_business_hours_Wed', 'hulop_business_hours_Thu', 'hulop_business_hours_Fri', 'hulop_business_hours_Sat','hulop_business_hours_Sun' ]
		.concat(i18nMenu([ 'st_name' ]));

	PROPERTY_NAMES['facility'] = [ 'group:LAYER1',
		'facil_id', 'lat', 'lon', 'facil_type', 'name_ja', 'name_en', 'address', 'tel', 'toilet', 'elevator', 'escalator', 'parking', 'barrier',
		'nursing', 'brail_tile',
		'group:TOILET', 'sex', 'fee',
		'group:HOSPITAL', 'subject', 'close_day',
		'group:EVACUATION', 'evacuation', 'temporary', 'med_dept', 'flood',
		'group:LAYER2',
		'name_hira', 'fax', 'mail', 'start_time', 'end_time', 'no_serv_d', 'info', 'info_board', 'move_floor',
		'group:LAYER3',
		'hulop_building', 'hulop_major_category', 'hulop_sub_category', 'hulop_minor_category', 'hulop_heading', 'hulop_angle', 'hulop_height', 'hulop_long_description', 'hulop_short_description', 'hulop_description', 'hulop_location_description', 'hulop_content', 'hulop_tags', 'hulop_poi_external_category',
		'hulop_business_hours', 'hulop_business_hours_PreHoliday', 'hulop_business_hours_Holiday',
		'hulop_business_hours_Mon', 'hulop_business_hours_Tue', 'hulop_business_hours_Wed', 'hulop_business_hours_Thu', 'hulop_business_hours_Fri', 'hulop_business_hours_Sat','hulop_business_hours_Sun',
		'hulop_show_labels_zoomlevel' ]
		.concat(i18nMenu([ 'name', 'address', 'med_dept', 'hulop_long_description', 'hulop_short_description', 'hulop_description', 'hulop_location_description', 'hulop_content' ]));

	$hulop.area.setPropertyNames(PROPERTY_NAMES);
	console.log(PROPERTY_NAMES);

	var EXTRA_TOILET = {
		'facil_type': 10,
		'toilet': 2,
		'sex': 99,
		'fee': 99
	}, EXTRA_HOSPITAL = {
		'facil_type': 3,
		'subject': 99,
		'close_day': '99'
	}, EXTRA_EVACUATION = {
		'evacuation': 3,
		'temporary': 99,
		'med_dept': '99',
		'flood': 99
	};

	var EDITOR_FILE = 'EDITOR';
	var OPTIONAL_KEYS = /^(link\d+_id)$/;
	var READONLY_KEYS = /^(node_id|lat|lon|link_id|start_id|end_id|distance|facil_id|link\d+_id|ent\d+_lat|ent\d+_lon|ent\d_fl|ent\d_node|geometry)$/;
	var NOCOPY_KEYS = /^(ent\d+_.*)$/;
	var STRING_KEYS = /^(link_id|start_id|end_id|start_time|end_time|start_date|end_date|no_serv_d|st_name(_.+)?|node_id|link\d+_id|facil_id|name(_.+)?|address(_.+)?|tel|fax|mail|close_day|med_dept(_.+)?|ent\d+_n(_.+)?|ent\d+_node|hulop_file|hulop_building|hulop_major_category|hulop_sub_category|hulop_minor_category|hulop_elevator_equipments|hulop_long_description(_.+)?|hulop_short_description(_.+)?|hulop_description(_.+)?|hulop_location_description(_.+)?|hulop_content(_.+)?|hulop_tags|hulop_poi_external_category|hulop_business_hours(_.+)?)$/;
	var MAX_INDEX = 99;
	var downKey, keyState = {}, ADD_KEY = 65, DO_POI_KEY = 68, SPLIT_KEY = 83, COPY_KEY = 67, PASTE_KEY = 86;
	var lastData, map, source, select, modify, callback, start_feature, poi_lines, editingFeature, editingProperty, clipboardFeature;
	var start_point, switch_line, from_feature;
	var selectPoint, dragPoint, pointOffset;

	var args = {};
	location.search.substr(1).split('&').forEach(function(arg) {
		if (arg) {
			var kv = arg.split('=');
			args[kv[0]] = kv.length > 1 ? kv[1] : '';
		}
	});
	console.log(args);

	var defaultLang = $hulop.messages.defaultLang == 'ja' ? 'ja' : 'en';
	var messages = {}, information_items = {};
	$.ajax({
		'type' : 'get',
		// 'async' : false,
		'url' : 'editor/messages_' + defaultLang + '.json',
		'dataType' : 'json',
		'success' : function(data) {
			messages = data.messages || {};
			information_items = data.information_items || {};
			console.log(data);
			traverseTextNode(document.body, function(el) {
				var text = el.nodeValue;
				for (var m; m = text.match(/(\(i18n_([^\)]+)\))/);) {
					text = text.replace(m[1], messages[m[2]]);
				}
				el.nodeValue = text;
			});
		},
		'error' : function(XMLHttpRequest, textStatus, errorThrown) {
			console.error(textStatus + ' (' + XMLHttpRequest.status + '): ' + errorThrown);
		}
	});

	function traverseTextNode(el, callback) {
		switch (el.nodeType) {
		case 1:
			for (var i = 0; i < el.childNodes.length; i++) {
				traverseTextNode(el.childNodes[i], callback);
			}
			break;
		case 3:
			callback(el);
			break;
		}
	}

	function init(cb) {
		callback = cb;
		console.log('Editor running');
		map = $hulop.map.getMap();
		var routeLayer = $hulop.map.getRouteLayer();
		routeLayer.setStyle(getStyle);
		source = routeLayer.getSource();
		$('.ol-rotate').css({
			'cssText' : 'right: .5em !important; left: initial !important;'
		});
		map.addControl(new ol.control.Zoom());

		// Browser event listeners
		$(window).on({
			'keydown' : function(event) {
				keyState = event;
				if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
					return;
				}
				downKey = event.keyCode;
			},
			'keyup' : function(event) {
				keyState = event;
				downKey = null;
				drawMarkers();
				doAlign();
			}
		});

		$('#save_button').on('click', function(event) {
			saveChanges();
		});
		$('#restore_button').on('click', function(event) {
			discardChanges();
		});
		$('#export_button').on('click', function(event) {
			downloadFile(toFeatureCollection(), 'MapData.geojson');
		});
		$('#delete_button').on('click', function(event) {
			source.getFeatures().forEach(function(feature) {
				source.removeFeature(feature);
			});
			$('.modified').show();
			$('#list tbody').empty();
		});
		var fileText;
		$('#import_file').on('change', function(event) {
			fileText = null;
			if (this.files.length > 0) {
				var file = this.files[0];
				if (file) {
					console.log(file);
					var fr = new FileReader();
					fr.addEventListener('load', function(e) {
						fileText = fr.result;
					});
					fr.readAsText(file);
				}
			}
		});
		$('#import_button').on('click', function(event) {
			if (fileText) {
				try {
					var features = JSON.parse(fileText);
					if (features.type == 'FeatureCollection' && features.features) {
						if ($hulop.editor.importV1 && $hulop.editor.importV1(features) != '2018') {
							return;
						}
						var bounds;
						function addCoords(crd) {
							if (typeof (crd[0]) == 'number') {
								var x = crd[0], y = crd[1];
								bounds = bounds ? [ Math.min(bounds[0], x), Math.min(bounds[1], y), Math.max(bounds[2], x), Math.max(bounds[3], y) ] : [ x, y, x, y ];
							} else {
								crd.forEach(addCoords);
							}
						}
						callback(); // clear routes
						showFeatureList();
						resetOriginal();
						features.features.forEach(function(feature) {
							var f = addFeatureList(feature);
							lastData.modified.push(f.getId());
							syncLatlng(f);
							addCoords(feature.geometry.coordinates);
						});
						$('#list tbody tr').css('background-color', 'lightblue');
						$('.modified').show();
						bounds && $hulop.map.getMap().getView().fit(ol.proj.transformExtent(bounds, 'EPSG:4326', 'EPSG:3857'), map.getSize());
						resetExit();
						validate();
					}
				} catch (e) {
					console.error(e);
				}
			}
		});

		// Map event isteners
		map.on('pointermove', function(event) {
			var latLng = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
			// console.log(latLng);
			drawMarkers(latLng);
		});
		map.on('pointerdown', function(event) {
			// console.log(event);
			var feature = getEventFeature(event);
			if (feature) {
				drawPoiLines(feature);
				if (selectPoint == feature) {
					var coord = (dragPoint = feature).getGeometry().getCoordinates();
					pointOffset = [ coord[0] - event.coordinate[0], coord[1] - event.coordinate[1] ];
					return false;
				}
			}
			dragPoint = null;
		});
		map.on('pointerup', function(event) {
			drawPoiLines();
			if (dragPoint) {
				dragPoint = null;
				return false;
			}
		});
		map.on('pointerdrag', function(event) {
			// console.log(event);
			if (dragPoint) {
				var point = ol.coordinate.add(event.coordinate, pointOffset);
				dragPoint.getGeometry().setCoordinates(point);
				return false;
			}
		});

		map.on('click', function(event) {
			// console.log(event);
			var feature = getEventFeature(event);
			if (feature === null) {
				return;
			}
			var latLng = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
			editingFeature && !feature && showProperty();
			var offset = !feature || feature.getGeometry().getType() != 'Point';
			switch (downKey) {
			case ADD_KEY:
				offset && createNode(latLng);
				break;
			case DO_POI_KEY:
				offset && createFacility(latLng);
				break;
			case 70: // F
				offset && createFacility(latLng, EXTRA_HOSPITAL);
				break;
			case 71: // G
				offset && createFacility(latLng, EXTRA_TOILET);
				break;
			case 72: // H
				offset && createFacility(latLng, EXTRA_EVACUATION);
				break;
			case PASTE_KEY:
				clipboardFeature && clipboardFeature.get('facil_id') && createFacility(latLng, clipboardFeature.getProperties());
				break;
			default:
				if (feature) {
					if (feature.get('link_id')) {
						var editable = source.getFeatureById(feature.get('start_id')) && source.getFeatureById(feature.get('end_id'));
						if (keyState.shiftKey && !start_feature) {
							editable && addAlignFeature(feature);
							return false;
						}
						if (!editable) {
							showProperty(feature);
							return false;
						}
					}
					if (align_features.length > 0) {
						return false;
					}
					// console.log(feature.getId());
					if (keyState.altKey && switchMonitor(feature)) {
						return;
					}
					if (keyState.shiftKey) {
						var last_feature = start_feature;
						if (feature.get('node_id') || feature.get('facil_id')) {
							if (start_feature) {
								connectFeatures(start_feature, feature);
							} else {
								start_feature = feature;
							}
						}
						if (last_feature || !start_feature) {
							return;
						}
					}
					var newLink = offset && downKey == SPLIT_KEY && feature.get('link_id') && source.getFeatureById(feature.get('start_id'))
							&& source.getFeatureById(feature.get('end_id')) && splitLink(event);
					newLink && (feature = newLink);
					showProperty(feature);
					downKey == COPY_KEY && (clipboardFeature = feature);
				}
				break;
			}
		});

		// Data layer listeners
		select = new ol.interaction.Select({
			'condition' : ol.events.condition.never,
			'style' : function(feature) {
				if ($hulop.area.getId(feature)) {
					return $hulop.area.getSelectStyle(feature);
				}
				var style = getStyle(feature);
				if (!style) {
					return;
				}
				if (!Array.isArray(style)) {
					style = [style];
				}
				if (feature.getGeometry().getType() == 'LineString') {
					feature.getGeometry().getCoordinates().forEach(function(point, index, array) {
						var edge = index == 0 || index == array.length - 1;
						style.push(new ol.style.Style({
							'geometry' : new ol.geom.Point(point),
							'image' : new ol.style.Circle({
								'radius' : 6,
								'fill' : new ol.style.Fill({
									'color' : edge ? 'white' : 'rgba(255, 255, 255, 0.5)'
								}),
								'stroke' : new ol.style.Stroke({
									'color' : style[0].getStroke().getColor(),
									'width' : 1
								})
							})
						}));
					});
				}
				return style;
			},
			'layers' : [ routeLayer ],
			'multi' : false
		});
		var pointStyle = new ol.style.Style({
			'image' : new ol.style.Circle({
				'radius' : 3 * 2,
				'fill' : new ol.style.Fill({
					'color' : 'rgba(0,153,255,1)'
				}),
				'stroke' : new ol.style.Stroke({
					'color' : 'rgba(255,255,255,1)',
					'width' : 3 / 2
				})
			}),
			'zIndex' : Infinity
		});
		modify = window.modify = new ol.interaction.Modify({
			'style' : function(feature) {
				vertex = feature.getGeometry().getCoordinates();
				return pointStyle;
			},
			'condition' : function(event) {
				if (ol.events.condition.primaryAction(event)) {
					// console.log(event);
					if (select.getFeatures().getLength() > 0) {
						var feature = select.getFeatures().item(0);
						if ($hulop.area.getId(feature)) {
							return $hulop.area.modifyCondition(event, isVertex(feature));
						}
						return feature.getGeometry().getType() != 'LineString' || isVertex(feature, ol.events.condition.altKeyOnly(event));
					}
				}
				return false;
			},
			'deleteCondition' : function(event) {
				if (ol.events.condition.singleClick(event)) {
					if (select.getFeatures().getLength() > 0) {
						var feature = select.getFeatures().item(0);
						if ($hulop.area.getId(feature)) {
							return $hulop.area.deleteCondition(event, isVertex(feature));
						}
						if (feature.getGeometry().getType() == 'LineString') {
							return isVertex(feature) && ol.events.condition.altKeyOnly(event);
						}
					}
				}
				return false;
			},
			'features' : select.getFeatures()
		});

		map.addInteraction(select);
		map.addInteraction(modify);
		console.log(source);

		source.on('addfeature', function(event) {
			var feature = event.feature;
			feature.getGeometry().on('change', function(event) {
				geometryChanged(feature);
			});
			var nodeID = feature.get('node_id');
			feature.on('propertychange', function(event) {
				if (event.key == 'geometry') {
					geometryChanged(feature);
					feature.getGeometry().on('change', function(event) {
						geometryChanged(feature);
					});
				} else {
					if (nodeID && event.key == 'floor') {
						var floor = feature.get('floor');
						getExitValues(nodeID).forEach(function(exit) {
							var facil = source.getFeatureById(exit.facil_id);
							if (facil) {
								if (isNaN(floor)) {
									facil.unset('ent' + exit.ent_index + '_fl');
								} else {
									facil.set('ent' + exit.ent_index + '_fl', floor);
								}
							}
						});
					}
					feature == editingFeature && feature.get(event.key) != event.oldValue && !editingProperty && showProperty(feature);
				}
				setModified(feature)
			});
		});
		initData();
	}

	var vertex;
	function isVertex(feature, others) {
		if (vertex) {
			var type = feature.getGeometry().getType();
			var coords = feature.getGeometry().getCoordinates();
			for (var i = 0; i < coords.length; i++) {
				if (type == 'Polygon') {
					for (var j = 0; j < coords[i].length; j++) {
						if (isEqual(coords[i][j], vertex)) {
							return true;
						}
					}
				} else if (isEqual(coords[i], vertex)) {
					return i > 0 && i < coords.length - 1;
				}
			}
			return others;
		}
	}

	function getEventFeature(event) {
		var candidate;
		return map.forEachFeatureAtPixel(event.pixel, function(feature) {
			candidate = candidate || null;
			if (feature.getId()) {
				if (!feature.getGeometry().getArea) {
					return feature;
				} else if (!candidate || feature.getGeometry().getArea() < candidate.getGeometry().getArea()) {
					candidate = feature;
				}
			}
		}) || candidate;
	}

	function splitLink(event) {
		var feature = getEventFeature(event);
		if (feature && feature.get('link_id')) {
			var coordinates = feature.getGeometry().getCoordinates();
			if (coordinates.length == 2) {
				var nodes = [ 'start_id', 'end_id' ].map(function(key) {
					var nodeID = feature.get(key);
					return nodeID && source.getFeatureById(nodeID);
				});
				if (nodes[0] && nodes[1]) {
					event.coordinate = new ol.geom.LineString(coordinates).getClosestPoint(event.coordinate);
					var latLng = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
					var newNode = createNode(latLng);
					reconnectLink(feature, nodes[1], newNode);
					var newLink = createLink(newNode, nodes[1], feature.getProperties());
					setModified(nodes[0]);
					setModified(nodes[1]);
					setModified(feature);
					return newLink;
				}
			}
		}
	}

	function reconnectLink(link, from, to) {
		var linkId = link.get('link_id');
		var array = link.getGeometry().getCoordinates();
		var fromNode = from.get('node_id');
		var toNode = to.get('node_id');
		var isStart = fromNode == link.get('start_id');
		array[isStart ? 0 : array.length - 1] = to.getGeometry().getCoordinates();
		link.setGeometry(new ol.geom.LineString(array));
		link.set(isStart ? 'start_id' : 'end_id', toNode);
		for (var i = 1; i <= MAX_INDEX; i++) {
			if (from.get('link' + i + '_id') == linkId) {
				from.unset('link' + i + '_id');
				break;
			}
		}
		for (var i = 1; i <= MAX_INDEX; i++) {
			if (!to.get('link' + i + '_id')) {
				to.set('link' + i + '_id', linkId);
				break;
			}
		}
	}

	function prepareData(center, radius) {
		$hulop.route.callService({
			'action' : 'start',
			'cache' : false,
			'lat' : center[1],
			'lng' : center[0],
			'dist' : radius
		}, function() {
			$hulop.route.callService({
				'action' : 'nodemap',
			}, function(nodemap) {
				$hulop.route.callService({
					'action' : 'features',
				}, function(features) {
					console.log(nodemap);
					console.log(features);
					initData(nodemap, features);
				});
			});
		});
	}

	function initData(nodemap, features) {
		lastData = {
			'exit' : {},
			'original' : {},
			'modified' : []
		};
		callback();
		showFeatureList();
		if (nodemap && features) {
			for ( var id in nodemap) {
				addFeatureList(nodemap[id]);
			}
			features.forEach(addFeatureList);
			$('#properties').text(($('#list tr').length - 1) + ' objects');
		}
		resetOriginal();
		resetExit();
		resetModified();
		console.log(lastData);
		$hulop.indoor && $hulop.indoor.setStyle(getStyle);
		validate();
	}

	function resetOriginal() {
		lastData.original = {};
		lastData.modified = [];
		source.getFeatures().forEach(function(feature) {
			var id = feature.getId();
			toGeoJson(feature, function(obj) {
				// console.log(obj);
				lastData.original[id] = JSON.stringify(obj);
			});
		});
	}

	function resetExit() {
		lastData.exit = {};
		source.getFeatures().forEach(function(feature) {
			var facilID = feature.get('facil_id');
			facilID && feature.getKeys().forEach(function(key) {
				var m = /^ent(\d+)_node$/.exec(key);
				if (m) {
					var nodeID = feature.get(key);
					var exit = {
						'facil_id' : facilID,
						'ent_index' : Number(m[1]),
						'node_id' : nodeID
					};
					addExitValue(nodeID, exit);
					addExitValue(facilID, exit);
				}
			});
		});
	}

	function resetModified() {
		$('.modified').hide();
		$('#list tbody tr').removeAttr('style');
	}

	function saveChanges() {
		console.log(lastData);
		var data = {
			'action' : 'editdata',
			'editor' : args.editor,
			'insert' : [],
			'remove' : [],
			'update' : []
		};
		for ( var id in lastData.original) {
			var feature = source.getFeatureById(id);
			if (!feature) {
				data.remove.push(fixDbId({
					'id' : id
				}));
			} else if (lastData.modified.indexOf(id) != -1) {
				toGeoJson(feature, function(obj) {
					data.update.push(fixDbId(obj));
				});
			}
		}
		source.getFeatures().forEach(function(feature) {
			var id = feature.getId();
			if (!lastData.original[id]) {
				toGeoJson(feature, function(obj) {
					data.insert.push(fixDbId(obj));
				});
			}
		});
		resetOriginal();
		resetExit();
		resetModified();
		var org_remove = data.remove;
		data.remove = JSON.stringify(data.remove);
		data.insert = JSON.stringify(data.insert);
		data.update = JSON.stringify(data.update);
		console.log(data);
		$hulop.route.sendData('post', 'api/editor', data, function(result) {
			console.log(result);
			var errors = 0;
			var msg = '';
			result.insert && result.insert.forEach(function(obj) {
				!obj._rev && errors++;
				checkDbResult(obj);
				msg = msg || obj.error;
			});
			result.update && result.update.forEach(function(obj) {
				!obj._rev && errors++;
				checkDbResult(obj);
				msg = msg || obj.error;
			});
			org_remove.forEach(function(obj) {
				checkDbResult({
					'_id' : obj._id
				});
			});
			errors > 0 && alert(errors + ' errors while saving changes. Please reload data.\n\n' + msg);
		});
	}

	function toFeatureCollection() {
		var features = [];
		source.getFeatures().forEach(function(feature) {
			toGeoJson(feature, function(obj) {
				if (obj.id) {
					obj._id = obj.id
					delete obj.id;
				}
				features.push(obj);
			});
		});
		features.sort(function(a, b) {
			if (a._id == b._id) {
				return 0;
			}
			return a._id < b._id ? -1 : 1;
		});
		return JSON.stringify({
			'type' : 'FeatureCollection',
			'features' : features
		}, null, '\t');
	}

	function downloadFile(data, filename) {
		var blob = new Blob([ data ], {
			type : 'text/json;charset=utf-8;'
		});
		if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, filename);
		} else {
			var link = document.createElement('a');
			if (link.download !== undefined) {
				var url = URL.createObjectURL(blob);
				link.setAttribute('href', url);
				link.setAttribute('download', filename);
			} else {
				link.href = 'data:attachment/json,' + data;
			}
			link.style = 'visibility:hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}

	var idRev = {};
	function checkDbResult(obj) {
		if (obj._id) {
			if (obj._rev) {
				idRev[obj._id] = obj._rev;
			} else {
				delete idRev[obj._id];
			}
		}
	}

	function fixDbId(obj) {
		var id = obj.id;
		if (!id) {
			console.error('No id');
			console.error(obj);
			return obj;
		}
		obj._id = id;
		idRev[id] && (obj._rev = idRev[id]);
		delete obj.id;
		return obj;
	}

	function discardChanges() {
		for ( var id in lastData.original) {
			var feature = source.getFeatureById(id);
			if (!feature || lastData.modified.indexOf(id) != -1) {
				var f = format.readFeature(JSON.parse(lastData.original[id]), {
					'featureProjection' : 'EPSG:3857'
				});
				if (feature) {
					feature.setProperties(f.getProperties());
					feature.setGeometry(f.getGeometry());
				} else {
					source.addFeature(f);
				}
			}
		}
		source.getFeatures().forEach(function(feature) {
			var id = feature.getId();
			lastData.original[id] || source.removeFeature(feature);
		});
		$('#list tbody tr').each(function() {
			var id = $(this).find('td:last-child').text();
			lastData.original[id] || $(this).remove();
		});
		lastData.modified = [];
		resetExit();
		resetModified();
		validate();
	}

	function setModified(feature) {
		var id = feature.getId();
		if (lastData.modified.indexOf(id) == -1) {
			lastData.modified.push(id);
			getFeatureRow(id).css('background-color', 'lightblue');
			$('.modified').show();
		}
	}

	function findExit(feature) {
		var nodeID = feature.get('node_id')
		var facilID = feature.get('facil_id');
		return (nodeID && getExitValues(nodeID)) || (facilID && getExitValues(facilID)) || [];
	}

	function hasExit(feature) {
		var exitList = findExit(feature);
		return exitList && exitList.length > 0;
	}

	function getExitValues(key) {
		return (key && lastData.exit[key]) || [];
	}

	function addExitValue(key, value) {
		if (key && value) {
			var nodes = lastData.exit[key] = (lastData.exit[key] || []);
			findExitIndex(nodes, value) < 0 && nodes.push(value) && nodes.sort(function(a,b) {return a.ent_index - b.ent_index;});
		}
	}

	function removeExitValue(key, value) {
		if (key && value) {
			var nodes = lastData.exit[key];
			var pos = nodes && findExitIndex(nodes, value);
			pos >= 0 && nodes.splice(pos, 1);
		}
	}

	function findExitIndex(nodes, exit) {
		for (var i = 0; i<nodes.length; i++) {
			var node = nodes[i];
			if (node.facil_id == exit.facil_id &&
				node.node_id == exit.node_id &&
				node.ent_index == exit.ent_index) {
				return i;
			}
		}
		return -1;
	}

	function canRemoveFeature(feature, ent_index) {
		return ent_index ? canRemoveExit(feature, ent_index) : canRemoveNode(feature) || canRemoveLink(feature) || canRemoveFacility(feature) || canRemoveArea(feature);
	}

	function removeFeature(feature, ent_index) {
		var removed = ent_index ? removeExit(feature, ent_index) : removeNode(feature) || removeLink(feature) || removeFacility(feature) || removeArea(feature);
		removed && $('.modified').show();
		return removed;
	}

	function connectFeatures(f1, f2) {
		if (f1.get('node_id') && f2.get('node_id')) {
			createLink(f1, f2) != false && hideLine();
		} else if (f1.get('node_id') || f2.get('node_id')) {
			createExit(f1, f2) != false && hideLine();
		}
	}

	function createNode(latlng) {
		var floor = getFloor();
		var p = {
			'node_id': newID('node'),
			'floor': floor,
			'in_out': floor == 0 ? 1 : 3
		};
		var feature = newFeature(newGeoJSON(p, latlng));
		showProperty(feature);
		return feature;
	}

	function canRemoveNode(node) {
		var nodeID = node.get('node_id');
		if (!nodeID || hasExit(node)) {
			return false;
		}
		for (var i = 1; i <= MAX_INDEX; i++) {
			var linkId = node.get('link' + i + '_id');
			if (linkId && source.getFeatureById(linkId)) {
				return false;
			}
		}
		return true;
	}

	function removeNode(node) {
		if (!canRemoveNode(node)) {
			return false;
		}
		source.removeFeature(node);
		showProperty();
		return true;
	}

	function createFacility(latlng, extra) {
		var p = {
				'facil_id' : newID('facil'),
				'facil_type': 99,
				'toilet' : 99,
				'elevator' : 99,
				'escalator' : 99,
				'parking' : 99,
				'barrier' : 99,
				'nursing' : 99,
				'brail_tile' : 99
		};
		extra && merge(extra, p);
		var feature = newFeature(newGeoJSON(p, latlng));
		showProperty(feature);
		return feature;
	}

	function canRemoveFacility(facil) {
		var facilID = facil.get('facil_id');
		return facilID && !hasExit(facil);
	}

	function removeFacility(facil) {
		if (!canRemoveFacility(facil)) {
			return false;
		}
		source.removeFeature(facil);
		showProperty();
		return true;
	}

	function createExit(node, facil) {
		if (facil && facil.get('node_id')) {
			facil = [ node, node = facil ][0];
		}
		var nodeLatLng = ol.proj.transform(node.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		var ent_index = 1;
		for (var i = 1; i <= MAX_INDEX; i++) {
			var lat = facil.get('ent' + i + '_lat');
			var lon = facil.get('ent' + i + '_lon');
			if (lat && lon) {
				ent_index = i;
				if (lat == nodeLatLng[1] && lon == nodeLatLng[0]) {
					break;
				}
				ent_index++;
			}
		}

		var nodeID = node.get('node_id');
		var facilID = facil.get('facil_id');
		facil.set('ent' + ent_index + '_lat', nodeLatLng[1]);
		facil.set('ent' + ent_index + '_lon', nodeLatLng[0]);
		facil.set('ent' + ent_index + '_node', nodeID);
		facil.set('ent' + ent_index + '_fl', node.get('floor'));
		facil.set('ent' + ent_index + '_n', '');
		var exit = {
			'facil_id' : facilID,
			'ent_index' : ent_index,
			'node_id' : nodeID
		};
		addExitValue(nodeID, exit);
		addExitValue(facilID, exit);
		showProperty(node);
	}

	function canRemoveExit(feature, ent_index) {
		return true;
	}

	function removeExit(feature, ent_index) {
		var facilID = feature.get('facil_id');
		var nodeID = feature.get('ent' + ent_index + '_node')
		var re = new RegExp('^ent' + ent_index + '_.*$');
		feature.getKeys().forEach(function(key) {
			if (re.exec(key)) {
				console.log(key);
				feature.unset(key);
			}
		});
		if (nodeID) {
			var exit = {
				'facil_id' : facilID,
				'ent_index' : ent_index,
				'node_id' : nodeID
			};
			removeExitValue(facilID, exit);
			removeExitValue(nodeID, exit);
		}
		showProperty(editingFeature);
		return true;
	}

	function canRemoveArea(area) {
		return $hulop.area.getId(area);
	}

	function removeArea(area) {
		if (!canRemoveArea(area)) {
			return false;
		}
		source.removeFeature(area);
		showProperty();
		return true;
	}

	function createLink(node1, node2, extra) {
		if (node1 == node2) {
			return false;
		}
		var linkID = newID('link');
		[ node1, node2 ].forEach(function(node) {
			for (var i = 1; i <= MAX_INDEX; i++) {
				if (!node.get('link' + i + '_id')) {
					node.set('link' + i + '_id', linkID)
					break;
				}
			}
		});
		var p = {
			'link_id': linkID,
			'start_id': node1.get('node_id'),
			'end_id': node2.get('node_id'),
			'rt_struct': node1.get('floor') == 0 && node2.get('floor') == 0 ? 1 : 7,
			'route_type': 1,
			'direction': 1,
			'width': 99,
			'vtcl_slope': 99,
			'lev_diff': 99,
			'tfc_signal': 99,
			'tfc_s_type': 99,
			'brail_tile': 99,
			'elevator': 99,
			'roof': 99
		};
		extra && merge(extra, p);
		var obj = newGeoJSON(p, ol.proj.transform(node1.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326'), ol.proj.transform(node2.getGeometry()
				.getCoordinates(), 'EPSG:3857', 'EPSG:4326'));
		var feature = newFeature(obj);
		showProperty(feature);
		return feature;
	}

	function merge(from, to) {
		for (var name in from) {
			READONLY_KEYS.exec(name) || NOCOPY_KEYS.exec(name) || (to[name] = from[name]) || $hulop.area.isReadOnly(name);
		}
	}

	function canRemoveLink(link) {
		var linkID = link.get('link_id');
		if (linkID) {
			var nodes = [ 'start_id', 'end_id' ].map(function(key) {
				var nodeID = link.get(key);
				return nodeID && source.getFeatureById(nodeID);
			});
			return nodes[0] && nodes[1] && nodes;
		}
	}

	function removeLink(link) {
		var nodes = canRemoveLink(link);
		if (!nodes) {
			return false;
		}
		var linkID = link.get('link_id');
		nodes.forEach(function(node) {
			for (var i = 1; i <= MAX_INDEX; i++) {
				if (node.get('link' + i + '_id') == linkID) {
					node.unset('link' + i + '_id');
					setModified(node);
					break;
				}
			}
		});
		source.removeFeature(link);
		showProperty();
		return true;
	}

	function newFeature(obj) {
		var feature = addFeatureList(obj);
		syncLatlng(feature);
		setModified(feature);
		return feature;
	}

	function newID(type) {
		return EDITOR_FILE + '_' + type + '_' + new Date().getTime();
	}

	function newGeoJSON(properties, p1, p2) {
		properties.hulop_file = EDITOR_FILE;
		return {
			'type' : 'Feature',
			'geometry' : p2 ? {
				'type' : 'LineString',
				'coordinates' : [ [ p1[0], p1[1] ], [ p2[0], p2[1] ] ]
			} : {
				'type' : 'Point',
				'coordinates' : [ p1[0], p1[1] ]
			},
			'properties' : properties
		};
	}

	var styles = {
		'node' : new ol.style.Style({
			'image' : new ol.style.Circle({
				'radius' : 8,
				'fill' : new ol.style.Fill({
					'color' : '#0000ff'
				}),
				'stroke' : new ol.style.Stroke({
					'color' : '#FFFFFF',
					'width' : 2
				})
			}),
			'zIndex' : 1
		}),
		'marker' : new ol.style.Style({
			'image' : new ol.style.Icon({
				'anchor' : [ 0.5, 1 ],
				'scale' : 36 / 25,
				'anchorXUnits' : 'fraction',
				'anchorYUnits' : 'fraction',
				'src' : 'images/map-marker.png'
			})
		}),
		'elevator' : new ol.style.Style({
			'image' : new ol.style.Icon({
				'anchor' : [ 0.5, 1 ],
				'anchorXUnits' : 'fraction',
				'anchorYUnits' : 'fraction',
				'src' : 'images/ev.png'
			})
		}),
		'link' : new ol.style.Style({
			'stroke' : new ol.style.Stroke({
				'color' : '#00B4B4',
				'width' : 10
			})
		})
	};

	var align_features = [], align_edge = [], align_nodes = [];
	function addAlignFeature(feature) {
		if (align_features.indexOf(feature) == -1) {
			align_features.push(feature);
			feature.changed();
			['start_id', 'end_id'].forEach(function(key) {
				var node = source.getFeatureById(feature.get(key));
				var pos = align_edge.indexOf(node);
				if (pos == -1) {
					align_edge.push(node);
				} else {
					align_edge.splice(pos, 1);
					align_nodes.push(node)
				}
			});
		}
	}
	function doAlign() {
		if (align_nodes.length > 0 && align_edge.length == 2) {
			var edge = [align_edge[0].getGeometry().getCoordinates(), align_edge[1].getGeometry().getCoordinates()];
			var line =  new ol.geom.LineString(edge);
			align_nodes.forEach(function(node) {
				setGeometry(node, new ol.geom.Point(line.getClosestPoint(node.getGeometry().getCoordinates())));
			});
		}
		align_edge = [];
		align_nodes = [];
		while (align_features.length > 0) {
			align_features.pop().changed();
		}
	}

	function getStyle(feature) {
		var floor = getFloor();
		if ($hulop.area.getId(feature)) {
			return $hulop.area.getStyle(feature, floor);
		}
		var style, heights = getHeights(feature);
		var odd = heights.length > 0 && Math.round(Math.abs(heights[0])) % 2 == 1;
		if (heights.length > 0 && heights[0] > 0) {
			odd = !odd;
		}
		if (feature.get('node_id')) {
			var exit = hasExit(feature);
			style = new ol.style.Style({
				'image' : new ol.style.Circle({
					'radius' : exit ? 9 : 8,
					'fill' : new ol.style.Fill({
						'color' : odd ? '#0000ff' : '#ff0000'
					}),
					'stroke' : new ol.style.Stroke({
						'color' : exit ? '#00B4B4' : '#FFFFFF',
						'width' : exit ? 3 : 2
					})
				}),
				'zIndex' : floor == heights[0] ? 1.01 : 1
			});
		} else if (feature.get('link_id')) {
			if (feature.get('route_type') == 4) {
				var anchor = [ 0.5, 1 ];
				if (floor != 0 && heights.length == 2 && (heights[0] < floor || heights[1] < floor)) {
					anchor = [ 0, 0 ];
				}
				style = new ol.style.Style({
					'image' : new ol.style.Icon({
						'anchor' : anchor,
						'anchorXUnits' : 'fraction',
						'anchorYUnits' : 'fraction',
						'src' : 'images/ev.png'
					}),
					'stroke' : new ol.style.Stroke({
						'color' : 'black',
						'width' : 6
					})

				});
			} else {
				var b = '#0000ff', r = '#ff0000';
				if (feature.get('hulop_road_low_priority') == 1) {
					b = '#0000A0';
					r = '#A00000';
				}
				if (feature.get('brail_tile') == 2) {
					b = r = '#00A000';
				}
				if (align_features.indexOf(feature) != -1) {
					b = r = '#00B4B4';
				}
				style = [new ol.style.Style({
					'stroke' : new ol.style.Stroke({
						'color' : heights.length == 1 ? odd ? b : r : '#7f007f',
						'width' : feature.get('hulop_road_width') ? 12 : 6
					})
				})];
				var dir = feature.get('direction');

				if (dir == 2 || dir == 3) {
				var geometry = feature.getGeometry();
				  geometry.forEachSegment(function(start, end) {
				    var dx = end[0] - start[0];
				    var dy = end[1] - start[1];
				    var rotation = Math.atan2(dy, dx);
				    // arrows
				    style.push(new ol.style.Style({
				      geometry: new ol.geom.Point((dir==2)?end:start),
				      image: new ol.style.Icon({
				        src: 'images/arrow.png',
				        anchor: [1.5, 0.5],
				        rotateWithView: false,
				        rotation: (dir==2)?-rotation:-rotation+Math.PI
				      })
				    }));
				  });
				}
				var slope = feature.get('vtcl_slope');
				if (slope == 2 || slope == 3) {
					feature.getGeometry().forEachSegment(function(start, end) {
						var rotation = Math.atan2(end[1] - start[1], end[0] - start[0]) - Math.PI / 2;
						style.push(new ol.style.Style({
							'geometry' : new ol.geom.Point([ (start[0] + end[0]) / 2, (start[1] + end[1]) / 2 ]),
							'image' : new ol.style.Icon({
								'src' : 'images/arrow-straight.png',
								'anchor' : [ 0.5, 0.5 ],
								'scale' : 16 / 56,
								'rotateWithView' : false,
								'rotation' : (slope == 2) ? -rotation : -rotation + Math.PI
							})
						}));
					});
				}
			}
		} else if (feature.get('hulop_major_category') == '_nav_poi_') {
			var heading = feature.get('hulop_heading') || 0;
			var angle = feature.get('hulop_angle');
			isNaN(angle) && (angle = 180);
			var fill = "#00CC00", stroke = "#006600";
			if (heading < -180 || heading > 180 || angle < 0 || angle > 180) {
				fill = "#CC00CC";
				stroke = "#660066";
			}
			var path = 'M 20 21.6 L 20 20 ';
			var size = Math.min(20, 12 * Math.sqrt(180 / angle));
			for (var i = -angle; i < angle + 10; i += 10) {
				i = Math.min(i, angle);
				var r = i / 180 * Math.PI;
				var x = 20 + Math.sin(r) * size;
				var y = 20 - Math.cos(r) * size;
				path += 'L ' + x + ' ' + y + ' ';
			}
			path += 'L 20 20 z';

			var src = 'data:image/svg+xml,' + escape('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" width="40px" height="40px">'
					+ '<path stroke="' + stroke + '" stroke-width="2" stroke-opacity="0.75" fill="' + fill + '" fill-opacity="0.75" d="' + path + '"/></svg>');

			style = new ol.style.Style({
				'image' : new ol.style.Icon({
					'src' : src,
					'rotation' : heading * Math.PI / 180.0,
					'rotateWithView' : true,
					'anchor' : [ 0.5, 0.5 ],
					'anchorXUnits' : 'fraction',
					'anchorYUnits' : 'fraction',
					'imgSize' : [ 40, 40 ]
				}),
				'zIndex' : -1
			});
		} else if (feature.get('facil_id')) {
			style = styles.marker;
			if (feature == editingFeature) {
				floor = 0;
			}
		} else {
			console.log(feature);
		}
		if (floor != 0 && heights.length > 0 && style) {
			var visible = heights.filter(function(height) {
				return $hulop.indoor && $hulop.indoor.isVisible(height);
			}).length > 0;
			if (!visible) {
				style = null;
			}
		}
		if (feature.error) {
			if (Array.isArray(style)) {
				style.forEach(function(s) {
					s && s.getStroke() && s.getStroke().setColor('#c0c0c0');
				});
			} else {
				style && style.getStroke() && style.getStroke().setColor('#c0c0c0');
			}
		}
		return style;
	}

	function getHeights(feature) {
		var heights = [];
		function addNode(node) {
			var h = node.get('floor');
			heights.indexOf(h) == -1 && heights.push(h);
		}
		function addLink(link) {
			[ 'start_id', 'end_id' ].forEach(function(key) {
				var node = source.getFeatureById(link.get(key));
				node && addNode(node);
			});
		}
		if (feature.get('node_id')) {
			addNode(feature);
			for (var i = 1; i <= MAX_INDEX; i++) {
				var linkID = feature.get('link' + i + '_id');
				var link = linkID && source.getFeatureById(linkID);
				link && addLink(link);
			}
		} else if (feature.get('link_id')) {
			addLink(feature);
		} else if (feature.get('facil_id')) {
			var h = feature.get('hulop_height');
			h && heights.indexOf(h) == -1 && heights.push(h);
			getExitValues(feature.get('facil_id')).forEach(function(exit) {
				var node = exit.node_id && source.getFeatureById(exit.node_id);
				node && addNode(node);
			});
		}
		return heights;
	}

	var ignoreChange = false;
	window.translateAll = function(deltaX, deltaY) {
		var count = 0;
	    ignoreChange = true;
		try {
		    source.getFeatures().forEach(function(feature) {
		        feature.getGeometry().translate(deltaX, deltaY);
		        count++;
		    });
		} finally {
		    ignoreChange = false;
		}
		return count;
	};

	function geometryChanged(feature) {
		if (ignoreChange) {
			syncLatlng(feature);
			setModified(feature);
			return;
		}
		var nodeID = feature.get('node_id');
		if (nodeID) {
			var nodeCoordinate = feature.getGeometry().getCoordinates();
			var latlng = ol.proj.transform(nodeCoordinate, 'EPSG:3857', 'EPSG:4326');
			for (var i = 1; i <= MAX_INDEX; i++) {
				var linkID = feature.get('link' + i + '_id');
				var link = linkID && source.getFeatureById(linkID);
				if (link && link != dragPoint) {
					var isStart = nodeID == link.get('start_id');
					var geometry = null;
					var linkCoordinates = link.getGeometry().getCoordinates();
					if (isNaN(linkCoordinates[0])) {
						var other = linkCoordinates[isStart ? linkCoordinates.length - 1 : 0];
						var otherLatlng = ol.proj.transform(other, 'EPSG:3857', 'EPSG:4326');
						if (keyState.shiftKey || link.get('route_type') != 4 || $hulop.util.computeDistanceBetween(latlng, otherLatlng) > 1) {
							var array = linkCoordinates;
							array[isStart ? 0 : array.length - 1] = nodeCoordinate;
							geometry = new ol.geom.LineString(array);
						}
					} else if (keyState.shiftKey) {
						geometry = new ol.geom.LineString(isStart ? [ nodeCoordinate, linkCoordinates ] : [ linkCoordinates, nodeCoordinate ]);
					}
					setGeometry(link, geometry || new ol.geom.Point(nodeCoordinate));
				}
			}
			findExit(feature).forEach(function(exit) {
				var facil = source.getFeatureById(exit.facil_id);
				if (facil) {
					facil.set('ent' + exit.ent_index + '_lat', latlng[1]);
					facil.set('ent' + exit.ent_index + '_lon', latlng[0]);
				}
			});
		}
		var linkID = feature.get('link_id');
		var link = linkID && source.getFeatureById(linkID);
		if (link && link.getGeometry().getType() == 'Point') {
			var geometry = link.getGeometry();
			// Fix elevator nodes
			[ 'start_id', 'end_id' ].forEach(function(key) {
				var nodeID = feature.get(key);
				var node = nodeID && source.getFeatureById(nodeID);
				node && setGeometry(node, geometry.clone());
			});
		}
		syncLatlng(feature);
		poi_lines && drawPoiLines(feature);
		setModified(feature);
	}

	function setGeometry(feature, geometry) {
		feature && geometry && !isEqual(feature.getGeometry().getCoordinates(), geometry.getCoordinates()) && feature.setGeometry(geometry);
	}

	function isEqual(coord1, coord2) {
		if (typeof coord1 != 'object' || typeof coord2 != 'object') {
			return coord1 == coord2;
		}
		if (coord1.length != coord2.length) {
			return false;
		}
		for (var i = 0; i < coord1.length; i++) {
			if (!isEqual(coord1[i], coord2[i])) {
				return false;
			}
		}
		return true;
	}

	function syncLatlng(feature) {
		var coordinates = feature.getGeometry().getCoordinates();
		if (feature.get('node_id') || feature.get('facil_id')) {
			var latlng = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
			feature.set('lat', latlng[1]);
			feature.set('lon', latlng[0]);
		} else if (feature.get('link_id')) {
			var geometry = feature.getGeometry();
			if (geometry.getType() == 'LineString') {
				var coords = [];
				geometry.getCoordinates().forEach(function(coord) {
					coords.push(ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326'));
				});
				feature.set('distance', Math.round($hulop.util.computeLength(coords) * 10) / 10);
			} else {
				feature.set('distance', 0);
			}
		}
	}

	var markerStyle = {
		'Circle' : new ol.style.Style({
			'fill' : new ol.style.Fill({
				'color' : 'rgba(0, 180, 180, 0.2)'
			}),
			'stroke' : new ol.style.Stroke({
				'width' : 0.25,
				'color' : 'rgb(0, 180, 180)'
			})
		}),
		'LineString' : new ol.style.Style({
			'stroke' : new ol.style.Stroke({
				'color' : 'rgb(0, 180, 180)',
				'width' : 7
			})
		}),
		'poiLine' : new ol.style.Style({
			'stroke' : new ol.style.Stroke({
				'color' : 'rgba(0, 180, 180, 0.7)',
				'width' : 5
			})
		})
	};
	var markerLayer, circleFeature, lineFeature, switchFeature;
	var circleCenter, circleRadius;
	function drawMarkers(latLng) {
		var map = $hulop.map.getMap();
		if (!map) {
			return;
		}
		var circleProperties = {
			'geometry' : null
		};
		var lineProperties = {
			'geometry' : null
		};
		var switchProperties = {
			'geometry' : null
		};
		if (latLng) {
			if (keyState.ctrlKey && keyState.shiftKey) {
				circleCenter = circleCenter || latLng;
				circleRadius = Math.min($hulop.config.MAX_RADIUS || 500, $hulop.util.computeDistanceBetween(circleCenter, latLng));
				circleProperties.geometry = new ol.geom.Circle(ol.proj.transform(circleCenter, 'EPSG:4326', 'EPSG:3857'), circleRadius);
			}
			if (start_feature) {
				lineProperties.geometry = new ol.geom.LineString([ start_feature.getGeometry().getCoordinates(),
						ol.proj.transform(latLng, 'EPSG:4326', 'EPSG:3857') ]);
			}
			if (start_point) {
				switchProperties.geometry = new ol.geom.LineString([ start_point, ol.proj.transform(latLng, 'EPSG:4326', 'EPSG:3857') ]);
			}
		} else {
			circleCenter && prepareData(circleCenter, circleRadius)
			circleCenter = null;
			start_feature = null;
			start_point = null;
		}
		if (!markerLayer) {
			markerLayer = new ol.layer.Vector({
				'source' : new ol.source.Vector({
					'features' : [ circleFeature = new ol.Feature(circleProperties), lineFeature = new ol.Feature(lineProperties),
							switchFeature = new ol.Feature(lineProperties) ]
				}),
				'style' : function(feature) {
					// console.log(feature);
					return markerStyle[feature.getGeometry().getType()];
				},
				'zIndex' : 103
			});
			map.addLayer(markerLayer);
		} else {
			circleFeature.setProperties(circleProperties);
			lineFeature.setProperties(lineProperties);
			switchFeature.setProperties(switchProperties);
		}
	}

	var poiLineLayer, poiLineFeature;
	function drawPoiLines(feature) {
		var map = $hulop.map.getMap();
		if (!map) {
			return;
		}
		var lineProperties = {
			'geometry' : null
		};
		if (feature) {
			var nodes = findExit(feature);
			if (nodes.length == 0) {
				return;
			}
			var path = [];
			var key = feature.get('node_id') ? 'facil_id' : 'node_id';
			nodes.forEach(function(exit) {
				var target = source.getFeatureById(exit[key]);
				if (target) {
					path.push(feature.getGeometry().getCoordinates());
					path.push(target.getGeometry().getCoordinates());
				}
			});
			lineProperties.geometry = new ol.geom.LineString(path);
		}
		if (!poiLineLayer) {
			poiLineLayer = new ol.layer.Vector({
				'source' : new ol.source.Vector({
					'features' : [ poiLineFeature = new ol.Feature(lineProperties) ]
				}),
				'style' : function(feature) {
					return markerStyle.LineString;
				},
				'updateWhileInteracting' : true,
				'zIndex' : 103
			});
			map.addLayer(poiLineLayer);
		} else {
			poiLineFeature.setProperties(lineProperties);
		}
		poi_lines = lineProperties.geometry;
		// console.log(lineProperties);
		return lineProperties.geometry;
	}

	function transformPath(path, fromProj, toProj) {
		path.forEach(function(coordinate, index) {
			path[index] = ol.proj.transform(coordinate, fromProj, toProj);
		});
	}

	function hideLine(latlng) {
		start_feature = null;
		drawMarkers();
	}

	function hideSwitchLine(latlng) {
		start_point = null;
		drawMarkers();
	}

	function switchMonitor(feature) {
		console.log('switchMonitor ' + (editingFeature && editingFeature.getId()));
		if (editingFeature && editingFeature.getGeometry().getCoordinates) {
			var editLink = editingFeature.get('link_id');
			var clickNode = feature.get('node_id');
			if (editLink && clickNode) {
				var array = editingFeature.getGeometry().getCoordinates();
				if (start_point) {
					var fromNode = from_feature.get('node_id');
					var isStart = fromNode == editingFeature.get('start_id');
					if (editingFeature.get(!isStart ? 'start_id' : 'end_id') == clickNode) {
						return;
					}
					array[isStart ? 0 : array.length - 1] = feature.getGeometry().getCoordinates();
					editingFeature.setGeometry(new ol.geom.LineString(array));
					editingFeature.set(isStart ? 'start_id' : 'end_id', clickNode);
					for (var i = 1; i <= MAX_INDEX; i++) {
						if (from_feature.get('link' + i + '_id') == editLink) {
							from_feature.unset('link' + i + '_id');
							break;
						}
					}
					for (var i = 1; i <= MAX_INDEX; i++) {
						if (!feature.get('link' + i + '_id')) {
							feature.set('link' + i + '_id', editLink);
							break;
						}
					}
					setModified(editingFeature);
					setModified(from_feature);
					setModified(feature);
					hideSwitchLine();
				} else {
					var isStart = clickNode == editingFeature.get('start_id');
					start_point = array[isStart ? 1 : array.length - 2];
					from_feature = feature;
				}
				return true;
			}
		}
	}

	function showFeatureList() {
		$('#list').empty();
		var table = $('<table>').appendTo($('#list'));
		$('<caption>', {
			'text' : M('DATA_LIST')
		}).appendTo(table);
		var thead = $('<thead>').appendTo(table);
		var tbody = $('<tbody>').appendTo(table);
		$('<tr>').append($('<th>', {
			'text' : M('DATA')
		}), $('<th>', {
			'text' : 'ID'
		})).appendTo(thead);
	}

	var format = new ol.format.GeoJSON()
	function toGeoJson(feature, callback) {
		callback(JSON.parse(format.writeFeature(feature, {
			'featureProjection' : 'EPSG:3857'
		})));
	}

	function addFeatureList(obj) {
		var p = obj.properties;
		var id = p['node_id'] || p['link_id'] || p['facil_id'] || $hulop.area.getId(p);
		if (source.getFeatureById(id)) {
			console.error('Duplicated id' + id);
			return;
		}
		if (obj._id && obj._id != id) {
			console.error('Incorrect id ' + id + ', it should ' + obj._id);
			return;
		}
		checkDbResult(obj);
		obj.id = id;

		var feature = format.readFeature(obj, {
			'featureProjection' : 'EPSG:3857'
		});
		source.addFeature(feature);
		var properties
		if (feature.get('route_type') == 4 && feature.get('distance') > 0) {
			console.error('Invalid distance for elevator: ' + feature.get('distance'));
			console.error(obj.properties);
		}
		$('<tr>', {
			'click' : function() {
				showProperty(feature);
			}
		}).append($('<td>', {
			'text' : getDisplayName(feature, true)
		}), $('<td>', {
			'text' : feature.getId()
		})).appendTo('#list tbody');
		return feature;
	}

	function newFeaturteCreated(feature) {
		$('<tr>', {
			'click' : function() {
				showProperty(feature);
			}
		}).append($('<td>', {
			'text' : getDisplayName(feature, true)
		}), $('<td>', {
			'text' : feature.getId()
		})).appendTo('#list tbody');
		setModified(feature);
		showProperty(feature);
	}

	function getFeatureRow(id) {
		var found = false;
		return $('#list tbody tr').filter(function() {
			if (!found) {
				return found = ($(this).find('td:last-child').text() === id);
			}
		});
	}

	function showProperty(feature) {
		// console.log('showProperty ' + (feature && feature.getId()));
		$('#properties').empty();
		editingFeature && editingFeature != feature && editingFeature.changed();
		editingFeature = feature;
		$hulop.editor.editingFeature = feature; // for debug
		var selectFeatures = select.getFeatures();
		var editable;
		if (feature) {
			if (feature.get('link_id')) {
				var start = feature.get('start_id');
				var end = feature.get('end_id');
				editable = start && end && source.getFeatureById(start) && source.getFeatureById(end);
			} else {
				editable = feature.get('node_id') || feature.get('facil_id') || $hulop.area.getId(feature);
			}
			showPropertyTable(feature);
			var exitList = findExit(feature); // Exit informations
			exitList.length == 0 && addRemoveButton(feature);
			exitList.forEach(function(exit) {
				var facility = source.getFeatureById(exit.facil_id);
				showPropertyTable(facility, exit.ent_index);
				addRemoveButton(facility, exit.ent_index);
			});
		}
		if (editable) {
			if (selectFeatures.item(0) != feature) {
				selectFeatures.clear();
				if (feature.getGeometry().getType() == 'Point') {
					selectPoint = feature;
				} else {
					selectPoint = null;
					selectFeatures.push(feature);
				}
			}
		} else {
			selectFeatures.clear();
		}
	}

	function showPropertyTable(feature, ent_index) {
		var table = $('<table>').appendTo($('#properties'));
		$('<caption>', {
			'text' : getDisplayName(feature, false, ent_index)
		}).appendTo(table);
		var thead = $('<thead>').appendTo(table);
		var tbody = $('<tbody>').appendTo(table);
		$('<tr>').append($('<th>', {
			'text' : M('KEY')
		}), $('<th>', {
			'text' : M('VALUE')
		})).appendTo(thead);
		var added = {
			'category' : true,
			'hulop_file' : true
		};
		function appendRow(name, value) {
			if (!added[name]) {
				added[name] = true;
				propertyRow(feature, name, value).appendTo(tbody);
			}
		}

		function appendGroup(name) {
			name = M('GROUP_' + name);
			$('<tr>', {
				'class' : 'group'
			}).append($('<th>', {
				'text' : name,
				'colspan' : 2
			})).appendTo(tbody);
			return true;
		}

		var names;
		if (ent_index) {
			var ent = 'ent' + ent_index;
			names = [ ent + '_lat', ent + '_lon', ent + '_fl', ent + '_n', ent + '_w', ent + '_d', ent + '_brr' ].
			concat(i18nMenu([ ent + '_n' ]));
		} else {
			var category = getCategory(feature);
			names = PROPERTY_NAMES[category];
		}
		(names || []).forEach(function(name) {
			var params = name.split(':');
			if (params.length == 2 && params[0] == 'group' && appendGroup(params[1])) {
				return;
			}
			var value = feature.get(name);
			if (typeof value == 'undefined') {
				if (OPTIONAL_KEYS.exec(name)) {
					return;
				}
				value = '';
			}
			appendRow(name, value);
		});
		if (!ent_index) {
			var appendOthers;
			var properties = feature.getProperties();
			for ( var name in properties) {
				if (/^(geometry|ent\d+_.*)$/.exec(name)) {
					continue;
				}
				if (!appendOthers && !added[name]) {
					appendOthers = appendGroup('OTHERS');
				}
				appendRow(name, properties[name]);
			}
		}

		function expandGroup(tr, expand) {
			if (expand) {
				tr.removeClass('collapsed');
			} else {
				tr.addClass('collapsed');
			}
			for (var next = tr.next(); next.length && !next.hasClass('group'); next = next.next()) {
				expand ? next.show() : next.hide();
			}
		}
		function resetView() {
			var noCollapse = [ M('GROUP_LAYER1') ];
			table.find('tbody tr.group').each(function() {
				var tr = $(this);
				if (noCollapse.indexOf(tr.text()) != -1) {
					expandGroup(tr, true);
					return;
				}
				for (var next = tr.next(); next.length && !next.hasClass('group'); next = next.next()) {
					if (next.find('td:nth-child(2)').text()) {
						expandGroup(tr, true);
						return;
					}
				}
				expandGroup(tr, false);
			});
		}
		table.on('click', 'tbody tr.group', function(e) {
			var tr = $(this);
			expandGroup(tr, tr.hasClass('collapsed'));
		});
		table.on('click', 'thead tr', function(e) {
			resetView();
		});
		resetView();
	}

	function propertyRow(feature, name, value) {
		var info = information_items[getCategory(feature)] || {};
		var editable = !READONLY_KEYS.exec(name) && !$hulop.area.isReadOnly(name);
		if (name.startsWith('_NAVCOG_')) {
			if (value.startsWith('{"')) {
				value = JSON.stringify(JSON.parse(value), null, '\t');
			}
		}
		function objValue(key2, key1, restore) {
			var v = info[key1];
			if (v) {
				return v[key2];
			}
			var m = /^(.+)(\d+)(.+?)$/.exec(key1);
			var num;
			if (m) {
				v = info[m[1] + '#' + m[3]];
				num = m[2];
				if (v) {
					v = v[key2];
					if (v && restore) {
						v = v.replace('#', num);
					}
					return v;
				}
				key1 = m[1] + '#' + m[3];
			}
			m = /^(.+)_(.+?)$/.exec(key1);
			if (m) {
				v = info[m[1]];
				if (v) {
					v = v[key2];
					if (v && restore) {
						if (num) {
							v = v.replace('#', num);
						}
						v += ' (' + m[2] + ')';
					}
				} else if (/^(en|ja|hira|es|fr)$/.exec(m[2])) {
					v = m[1] + ' (' + m[2] + ')';
				}
				return v;
			}
		}

		var isString = STRING_KEYS.exec(name) || typeof feature.get(name) == 'string' || $hulop.area.isString(name);
		return $('<tr>', {
			'class' : editable ? 'editable' : 'read_only'
		}).append($('<td>', {
			'text' : objValue('name', name, true) || name
		}), $('<td>', {
			'title' : objValue('desc', name),
			'on' : {
				'input' : function(event) {
					editingProperty = true;
					var text = $(event.target).text().trim();
					var decoration = 'none';
					if (isString) {
						feature.set(name, text);
					} else {
						if (text == '' || isNaN(text)) {
							feature.unset(name);
							decoration = 'line-through';
						} else {
							feature.set(name, Number(text));
						}
					}
					$(event.target).css('text-decoration', decoration);
					// console.log(name + ' = ' + JSON.stringify(feature.get(name)));
					editingProperty = false;
				}
			},
			'contenteditable' : editable,
			'text' : value
		}));
	}

	function addRemoveButton(feature, ent_index) {
		if (canRemoveFeature(feature, ent_index)) {
			$('<button>', {
				'text' : M('DELETE', getDisplayName(feature, true, ent_index)),
				'click' : function(event) {
					var id = feature.getId();
					if (removeFeature(feature, ent_index)) {
						ent_index || getFeatureRow(id).remove();
					}
				}
			}).appendTo($('#properties'));
		}
	}

	function M() {
		var text;
		for (var i = 0; i < arguments.length; i++) {
			text = (i > 0) ? text.replace('%' + i, arguments[i]) : (messages[arguments[i]] || arguments[i]);
		}
		return text;
	}

	function getDisplayName(feature, short, ent_index) {
		var category = ent_index ? 'entrance' : getCategory(feature);
		var msg = messages[category + (short ? '_SHORT' : '_LONG')] || category;
		return ent_index ? msg.replace('#', ent_index) : msg;
	}

	function getFloor() {
		return $hulop.indoor && $hulop.indoor.getCurrentFloor() || 0;
	}

	function validate() {
		source.getFeatures().forEach(function(feature) {
			feature.error = false;
		});
		source.getFeatures().forEach(function(feature) {
			var errors = [];
			var id = feature.getId();
			var category = getCategory(feature);
			switch (category) {
			case 'node':
				for (var i = 1; i <= MAX_INDEX; i++) {
					var linkId = feature.get('link' + i + '_id');
					if (linkId) {
						var link = source.getFeatureById(linkId);
						if (link) {
							if (id != link.get('start_id') && id != link.get('end_id')) {
								errors.push('connect link ID' + i + ' ' + linkId + ' does not connect to ' + id);
								link.error = true;
							}
						} else {
							errors.push('Missing link ' + linkId);
						}
					}
				}
				break;
			case 'link':
				var node1 = feature.get('start_id'), node2 = feature.get('end_id');
				node1 == node2 && errors.push('Start node = End node ' + node1);
				if (node1) {
					var node = source.getFeatureById(node1);
					node || errors.push('Missing node ' + node1);
				} else {
					errors.push('missing start node id');
				}
				if (node2) {
					var node = source.getFeatureById(node2);
					node || errors.push('Missing node ' + node2);
				} else {
					errors.push('missing end node id');
				}
				break;
			}
			if (errors.length > 0) {
				console.log(id + ': ' + category);
				console.log(feature);
				// console.error(errors);
				feature.error = true;
			}
		});
		source.getFeatures().forEach(function(feature) {
			feature.error && getFeatureRow(feature.getId()).css('background-color', '#c0c0c0');
		});
	}

	function getCategory(feature) {
		if (feature.get('node_id')) {
			return 'node';
		}
		if (feature.get("link_id")) {
			return 'link';
		}
		if (feature.get("facil_id")) {
			return 'facility';
		}
		if ($hulop.area.getId(feature)) {
			return $hulop.area.getCategory(feature);
		}
	}

	function removeSelection(features) {
		var pending = [];
		features.forEach(function(feature) {
			findExit(feature).forEach(function(exit) {
				removeExit(source.getFeatureById(exit.facil_id), exit.ent_index)
			});
			var id = feature.getId();
			removeFeature(feature) ? getFeatureRow(id).remove() : pending.push(feature);
		});
		if (pending.length > 0 && features.length > pending.length) {
			removeSelection(pending);
		}
	}

	return {
		'version' : '2018',
		'findExit' : findExit,
		'showProperty' : showProperty,
		'getHeights' : getHeights,
		'prepareData' : prepareData,
		'newFeature' : newFeature,
		'newFeaturteCreated' : newFeaturteCreated,
		'toFeatureCollection': toFeatureCollection,
		'downloadFile' : downloadFile,
		'removeSelection': removeSelection,
		'init' : init
	};

}();
