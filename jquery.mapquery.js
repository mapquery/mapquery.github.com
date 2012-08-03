/* Copyright (c) 2011 by MapQuery Contributors (see AUTHORS for
 * full list of contributors). Published under the MIT license.
 * See https://github.com/mapquery/mapquery/blob/master/LICENSE for the
 * full text of the license. */(function(a){a.MapQuery=a.MapQuery||{},a.MapQuery.Map=function(b,c){var d=this;c&&!c.maxResolution&&c.maxExtent&&c.projection&&(c.maxResolution=(c.maxExtent[2]-c.maxExtent[0])/256),this.options=a.extend({},new a.fn.mapQuery.defaults.map,c),this.element=b,this.olMapOptions=a.extend({},this.options),delete this.olMapOptions.layers,delete this.olMapOptions.maxExtent,delete this.olMapOptions.zoomToMaxExtent,delete this.olMapOptions.center,this.maxExtent=this.options.maxExtent,this.olMapOptions.maxExtent=new OpenLayers.Bounds(this.maxExtent[0],this.maxExtent[1],this.maxExtent[2],this.maxExtent[3]),this.projection=this.options.projection,this.displayProjection=this.options.displayProjection,OpenLayers.IMAGE_RELOAD_ATTEMPTS=3,OpenLayers.Util.onImageLoadErrorColor="transparent",this.olMap=new OpenLayers.Map(this.element[0],this.olMapOptions),this.olMap.addLayer(new OpenLayers.Layer("fake",{baseLayer:!0})),this.vectorLayers=[],this.selectFeatureControl=null,this.idCounter=0,b.data("mapQuery",this),this.layersList={},this.events=a({}),this.handlers={simple:function(a){this.trigger(a.type)}},this.olMap.events.on({scope:this,movestart:this.handlers.simple,move:this.handlers.simple,moveend:this.handlers.simple,zoomend:this.handlers.simple}),this.options.layers!==undefined&&(this.layers(this.options.layers),this.options.center!==undefined&&this.center(this.options.center)),this.options.zoomToMaxExtent&&this.options.center===undefined&&this.olMap.zoomToMaxExtent()},a.MapQuery.Map.prototype={layers:function(b){var c=this;switch(arguments.length){case 0:return this._allLayers();case 1:return a.isArray(b)?a.map(b,function(a){return c._addLayer(a)}).reverse():this._addLayer(b);default:throw"wrong argument number"}},_allLayers:function(){var b=[];a.each(this.layersList,function(a,c){var d=[c.position(),c];b.push(d)});var c=b.sort(function(a,b){return a[0]-b[0]}),d=a.map(c,function(a){return a[1]});return d.reverse()},_addLayer:function(b){var c=this._createId(),d=new a.MapQuery.Layer(this,c,b);if(this._triggerReturn("preaddlayer",[d])===!1)return!1;this.olMap.addLayer(d.olLayer),this.layersList[c]=d,d.isVector&&this.vectorLayers.push(c),this._updateSelectFeatureControl(this.vectorLayers),d.trigger("addlayer");return d},_createId:function(){return"mapquery_"+this.idCounter++},_removeLayer:function(b){var c=this.layersList[b];if(this._triggerReturn("preremovelayer",[c])===!1)return!1;this.vectorLayers=a.grep(this.vectorLayers,function(a){return a!=b}),this._updateSelectFeatureControl(this.vectorLayers),this.olMap.removeLayer(c.olLayer),delete this.layersList[b],c.trigger("removelayer");return this},center:function(a){var b,c=new OpenLayers.Projection(this.projection),d=null,e,f;if(a&&a.projection)d=a.projection.CLASS_NAME==="OpenLayers.Projection"?a.projection:new OpenLayers.Projection(a.projection);else{var g=this.displayProjection;g?d=g.CLASS_NAME==="OpenLayers.Projection"?g:new OpenLayers.Projection(g):d=new OpenLayers.Projection("EPSG:4326")}if(arguments.length===0){b=this.olMap.getCenter(),e=this.olMap.getZoom(),f=this.olMap.getExtent(),c.equals(d)||b.transform(c,d),f.transform(c,d),f=f!==null?f.toArray():[];return{position:[b.lon,b.lat],zoom:this.olMap.getZoom(),box:f}}a.box!==undefined?(f=new OpenLayers.Bounds(a.box[0],a.box[1],a.box[2],a.box[3]),c.equals(d)||f.transform(d,c),this.olMap.zoomToExtent(f)):a.position===undefined?this.olMap.zoomTo(a.zoom):(b=new OpenLayers.LonLat(a.position[0],a.position[1]),c.equals(d)||b.transform(d,c),this.olMap.setCenter(b,a.zoom))},_updateSelectFeatureControl:function(b){var c=[],d=this.layersList;this.selectFeatureControl!==null&&(this.selectFeatureControl.deactivate(),this.selectFeatureControl.destroy()),a.each(b,function(){c.push(d[this].olLayer)}),this.selectFeatureControl=new OpenLayers.Control.SelectFeature(c),this.olMap.addControl(this.selectFeatureControl),this.selectFeatureControl.activate()},bind:function(b,c,d){var e=this;if(arguments.length===1){var f={};a.each(b,function(a,b){f[a]=function(){return b.apply(e,arguments)}}),this.events.bind.apply(this.events,[f])}else{var g=[b];if(arguments.length===2)d=c;else{if(!a.isFunction(d))throw"bind: you might have a typo in the function name";g.push(c)}g.push(function(){return d.apply(e,arguments)}),this.events.bind.apply(this.events,g)}return this},trigger:function(){this.events.triggerHandler.apply(this.events,arguments);return this},_triggerReturn:function(){return this.events.triggerHandler.apply(this.events,arguments)},destroy:function(){this.olMap.destroy(),this.element.removeData("mapQuery")}},a.MapQuery.Layer=function(b,c,d){var e=this;this.id=c,this.label=d.label||this.id,this.map=b,this.isVector=!1,this.events=a({}),this.handlers={simple:function(a){this.trigger(a.type)},includeFeature:function(b){var c=new a.MapQuery.Feature(this,{olFeature:b.feature});this.trigger(b.type,[c])},prependLayer:function(a){this.trigger("layer"+a.type)}};var f=a.MapQuery.Layer.types[d.type.toLowerCase()].call(this,d);this.olLayer=f.layer,this.options=f.options,this.olLayer.events.on({scope:this,loadstart:this.handlers.prependLayer,loadend:this.handlers.prependLayer,featureselected:this.handlers.includeFeature,featureunselected:this.handlers.includeFeature,featureremoved:this.handlers.includeFeature}),this.olLayer.mapQueryId=this.id},a.MapQuery.Layer.prototype={down:function(a){a=a||1;var b=this.position();b=b-a,b<0&&(b=0),this.position(b);return this},each:function(){},remove:function(){return this.map._removeLayer(this.id)},position:function(a){if(a===undefined)return this.map.olMap.getLayerIndex(this.olLayer)-1;this.map.olMap.setLayerIndex(this.olLayer,a+1),this.trigger("changelayer",["position"]);return this},up:function(a){a=a||1;var b=this.position();b=b+a,this.position(b);return this},visible:function(a){if(a===undefined)return this.olLayer.getVisibility();this.olLayer.setVisibility(a),this.trigger("changelayer",["visibility"]);return this},opacity:function(a){if(a===undefined){var b=this.olLayer.opacity?this.olLayer.opacity:this.olLayer.getVisibility();return b}this.olLayer.setOpacity(a),this.trigger("changelayer",["opacity"]);return this},bind:function(){this.map.bind.apply(this,arguments);return this},trigger:function(){var a=Array.prototype.slice.call(arguments);this.events.triggerHandler.apply(this.events,a),this._addLayerToArgs(a),this.map.events.triggerHandler.apply(this.map.events,a);return this},_triggerReturn:function(){var a=Array.prototype.slice.call(arguments),b=this.events.triggerHandler.apply(this.events,a);if(b!==undefined)return b;this._addLayerToArgs(a);return this.events.triggerHandler.apply(this.map.events,a)},_addLayerToArgs:function(a){a.length===1?a.push([this]):a[1].unshift(this)},features:function(b){var c=this;switch(arguments.length){case 0:return this._allFeatures();case 1:return a.isArray(b)?a.map(b,function(a){return c._addFeature(a)}):this._addFeature(b);default:throw"wrong argument number"}},_allFeatures:function(){var b=this;return a.map(b.olLayer.features,function(c){return new a.MapQuery.Feature(b,{olFeature:c})})},_addFeature:function(b){var c=new a.MapQuery.Feature(this,b);if(this._triggerReturn("preaddfeature",[c])===!1)return!1;this.olLayer.addFeatures(c.olFeature),this.trigger("addfeature",[c]);return c}},a.MapQuery.Feature=function(b,c){this._id=b.map._createId(),this.layer=b;if(c.olFeature)this.olFeature=c.olFeature;else{var d=new OpenLayers.Format.GeoJSON,e=d.parseGeometry(c.geometry);e.transform(new OpenLayers.Projection(this.layer.map.displaProjection),new OpenLayers.Projection(this.layer.map.projection)),this.olFeature=new OpenLayers.Feature.Vector(e,c.properties)}this.properties=a.extend(!0,{},this.olFeature.attributes),this.geometry=a.parseJSON((new OpenLayers.Format.GeoJSON).write(this.olFeature.geometry));return this},a.MapQuery.Feature.prototype={remove:function(){if(this.layer._triggerReturn("preremovefeature",[this])===!1)return!1;this.layer.olLayer.removeFeatures(this.olFeature);return this.layer},select:function(a){(a===undefined||a===!0)&&this.layer.map.selectFeatureControl.unselectAll(),this.layer.map.selectFeatureControl.select(this.olFeature)},unselect:function(){this.layer.map.selectFeatureControl.unselect(this.olFeature)}},a.fn.mapQuery=function(b){return this.each(function(){var c=a.data(this,"mapQuery");c||a.data(this,"mapQuery",new a.MapQuery.Map(a(this),b))})},a.extend(a.MapQuery.Layer,{types:{bing:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.bing,b),d=c.view;switch(d){case"road":d="Road";break;case"hybrid":d="AerialWithLabels";break;case"satellite":d="Aerial"}return{layer:new OpenLayers.Layer.Bing({type:d,key:c.key}),options:c}},ecwp:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.raster,b);return{layer:new OpenLayers.Layer.ECWP(c.label,c.url,c),options:c}},google:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.google,b),d=c.view;switch(d){case"road":d=google.maps.MapTypeId.ROADMAP;break;case"terrain":d=google.maps.MapTypeId.TERRAIN;break;case"hybrid":d=google.maps.MapTypeId.HYBRID;break;case"satellite":d=google.maps.MapTypeId.SATELLITE}return{layer:new OpenLayers.Layer.Google({type:d}),options:c}},vector:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.vector,b);this.isVector=!0;return{layer:new OpenLayers.Layer.Vector(c.label),options:c}},json:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.vector,b);this.isVector=!0;var d=[];for(var e in c.strategies)if(c.strategies.hasOwnProperty(e))switch(c.strategies[e].toLowerCase()){case"bbox":d.push(new OpenLayers.Strategy.BBOX);break;case"cluster":d.push(new OpenLayers.Strategy.Cluster);break;case"filter":d.push(new OpenLayers.Strategy.Filter);break;case"fixed":d.push(new OpenLayers.Strategy.Fixed);break;case"paging":d.push(new OpenLayers.Strategy.Paging);break;case"refresh":d.push(new OpenLayers.Strategy.Refresh);break;case"save":d.push(new OpenLayers.Strategy.Save)}var f,g={strategies:d,projection:c.projection||"EPSG:4326",styleMap:c.styleMap};c.url&&(c.url.match(/^https?:\/\//)!==null&&!a.MapQuery.util.sameOrigin(c.url)?f="Script":f="HTTP",g.protocol=new OpenLayers.Protocol[f]({url:c.url,format:new OpenLayers.Format.GeoJSON}));var h=new OpenLayers.Layer.Vector(c.label,g);return{layer:h,options:c}},osm:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.osm,b),d=b.label||undefined,e=b.url||undefined;return{layer:new OpenLayers.Layer.OSM(d,e,c),options:c}},tms:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.tms,b),d=b.label||undefined,e=b.url||undefined,f={layername:c.layer,type:c.format};return{layer:new OpenLayers.Layer.TMS(d,e,f),options:c}},wms:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.raster,b),d={layers:c.layers,transparent:c.transparent,format:c.format};typeof c.wms_parameters!="undefined"&&(d=a.extend(d,c.wms_parameters));return{layer:new OpenLayers.Layer.WMS(c.label,c.url,d,c),options:c}},wmts:function(b){var c=a.extend(!0,{},a.fn.mapQuery.defaults.layer.all,a.fn.mapQuery.defaults.layer.wmts);b.sphericalMercator===!0&&a.extend(!0,c,{maxExtent:new OpenLayers.Bounds(-20037508.3392,-20037508.3392,20037508.3392,20037508.3392),maxResolution:156543.0339,numZoomLevels:19,projection:"EPSG:900913",units:"m"}),a.extend(!0,c,b);var d=a.extend(!0,{},c);d.url.charAt(d.url.length-1)==="/"&&(d.url=d.url.slice(0,d.url.length-1));if(c.layer===undefined&&c.matrixSet===undefined&&c.style===undefined){var e=a.MapQuery.util.parseUri(d.url),f=e.path.split("/"),g=f.slice(f.length-3);d.url=e.protocol?e.protocol+"//":"",d.url+=e.authority+f.slice(0,f.length-4).join("/"),d.layer=g[0],d.style=g[1],d.matrixSet=g[2]}return{layer:new OpenLayers.Layer.WMTS(d),options:c}}}}),a.fn.mapQuery.defaults={map:function(){return{allOverlays:!0,controls:[new OpenLayers.Control.Navigation({documentDrag:!0,dragPanOptions:{interval:1,enableKinetic:!0}}),new OpenLayers.Control.ArgParser,new OpenLayers.Control.Attribution,new OpenLayers.Control.KeyboardDefaults],format:"image/png",maxExtent:[-20037508.3392,-20037508.3392,20037508.3392,20037508.3392],maxResolution:156543.0339,numZoomLevels:19,projection:"EPSG:900913",displayProjection:"EPSG:4326",zoomToMaxExtent:!0,units:"m"}},layer:{all:{isBaseLayer:!1,displayOutsideMaxExtent:!1},bing:{transitionEffect:"resize",view:"road",sphericalMercator:!0},google:{transitionEffect:"resize",view:"road",sphericalMercator:!0},osm:{transitionEffect:"resize",sphericalMercator:!0},tms:{transitionEffect:"resize",format:"png"},raster:{transparent:!0},vector:{strategies:["bbox"]},wmts:{format:"image/jpeg",requestEncoding:"REST",sphericalMercator:!1}}},a.MapQuery.util={},a.MapQuery.util.parseUri=function(b){var c=a.MapQuery.util.parseUri.options,d=c.parser[c.strictMode?"strict":"loose"].exec(b),e={},f=14;while(f--)e[c.key[f]]=d[f]||"";e[c.q.name]={},e[c.key[12]].replace(c.q.parser,function(a,b,d){b&&(e[c.q.name][b]=d)});return e},a.MapQuery.util.parseUri.options={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+:))?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+:))?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}},a.MapQuery.util.sameOrigin=function(b){var c=a.MapQuery.util.parseUri(b);c.protocol=c.protocol||"file:",c.port=c.port||"80";var d={domain:document.domain,port:window.location.port,protocol:window.location.protocol};d.port=d.port||"80";return c.protocol===d.protocol&&c.port===d.port&&c.host.match(d.domain+"$")!==null}})(jQuery),function(a,b){a.extend(a.fn.mapQuery.defaults.layer.all,{legend:{url:"",msg:""}}),LEGEND_ERRORS=["E_ZOOMOUT","E_ZOOMIN","E_OUTSIDEBOX"],a.extend(b.Layer.prototype,{legend:function(a){var b=this.map.center();if(arguments.length===0){this._checkZoom(b),this.options.legend.msg==""&&this._checkBox(b);return this.options.legend}if(a.url!==undefined){this.options.legend.url=a.url;return this.options.legend}},_checkBox:function(a){var b=this.options.maxExtent;if(b!==undefined){var c=new OpenLayers.Bounds(a.box[0],a.box[1],a.box[2],a.box[3]),d=new OpenLayers.Bounds(b[0],b[1],b[2],b[3]),e=d.containsBounds(c,!0);this.options.legend.msg=e?"":LEGEND_ERRORS[2]}},_checkZoom:function(a){var b=a.zoom,c=this.options.maxZoom,d=this.options.minZoom;this.options.legend.msg=c!==undefined&&c<b?LEGEND_ERRORS[0]:"",this.options.legend.msg=d!==undefined&&d>b?LEGEND_ERRORS[1]:""}})}(jQuery,$.MapQuery),function(a,b){a.extend(b.Map.prototype,{pixelsFromPosition:function(a,b){var c,d=new OpenLayers.LonLat(a,b),e=this.olMap.getExtent().containsLonLat(d);if(e){c=this.olMap.getViewPortPxFromLonLat(d);return[Math.round(c.x),Math.round(c.y)]}return null},pan:function(a,b){this.olMap.pan(a,b)}}),a.extend(b.Layer.prototype,{zIndex:function(){return this.olLayer.getZIndex()}}),a.extend(b,{getFeaturePosition:function(a){var b=a.olFeature.geometry.getCentroid().getBounds().getCenterLonLat();return[b.lon,b.lat]}})}(jQuery,$.MapQuery),function(a){a.template("mqFeatureInfo",'<div class="mq-featureinfo ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"><span class="ui-dialog-title">${title}</span></div><div" class="ui-dialog-content ui-widget-content">{{html contents}}</div>'),a.widget("mapQuery.mqFeatureInfo",{options:{map:undefined,contents:undefined,title:"Feature information"},_create:function(){var b,c=this,d=this.element;b=a(this.options.map).data("mapQuery"),this.element.addClass("ui-dialog ui-widget ui-widget-content ui-corner-all"),b.bind("featureselected",{widget:c},c._onFeatureselected),b.bind("featureunselected",{widget:c},c._onFeatureunselected)},_destroy:function(){this.element.removeClass("ui-dialog ui-widget ui-widget-content ui-corner-all").empty()},_onFeatureselected:function(b,c,d){var e=b.data.widget,f=e.element,g=e.options.contents.call(e.options,d);f.html(a.tmpl("mqFeatureInfo",{title:e.options.title,contents:g}))},_onFeatureunselected:function(a){var b=a.data.widget;b.element.empty()}})}(jQuery),function(a){a.template("mqLayerControl",'<li id="mq-layercontrol-${id}" class="mq-layercontrol ui-widget-content ui-helper-clearfix ui-corner-all"><span><div class="ui-icon ui-icon-arrowthick-2-n-s"></div><div class="mq-layercontrol-label">${label}</div><button class="mq-layercontrol-delete">Delete</button><input type="checkbox" class="mq-layercontrol-visibility" id="${id}-visibility" checked="${visible}" /><label for="${id}-visibility">Visible</label></span></li>'),a.widget("mapQuery.mqLayerControl",{options:{map:undefined},_create:function(){var b,c=this,d=this.element;b=a(this.options.map).data("mapQuery"),d.append('<ul class=" ui-widget"></ul>');var e=d.children("ul");a.each(b.layers().reverse(),function(){c._add(e,this)}),d.find("button").button(),e.sortable({axis:"y",update:function(b,c){var d=c.item.siblings().andSelf(),e=d.length-1;d.each(function(b){var c=a(this).data("layer"),d=e-b,f=a("span.label",this),g=f.children();c.position(d),f.text(c.label).prepend(g)})}}),d.delegate(".mq-layercontrol-visibility","change",function(){var b=a(this),c=b.parents("li").data("layer"),d=b.attr("checked")?!0:!1;c.visible(d)}),d.delegate("button","click",function(){var b=a(this).parents("li");c._remove(b.data("layer").id)}),b.bind("addlayer",{widget:c,map:b,control:e},c._onLayerAdd),b.bind("removeLayer",{widget:c},c._onLayerRemove)},_destroy:function(){this.element.removeClass("ui-widget ui-helper-clearfix ui-corner-all").empty()},_add:function(b,c){a.tmpl("mqLayerControl",{id:c.id,label:c.label,position:c.position(),visible:c.visible()}).data("layer",c).prependTo(b)},_onLayerAdd:function(a,b){a.data.widget._add(a.data.control,b)},_remove:function(b,c){var d="#mq-layercontrol-"+b,e=a(d);c||e.data("layer").remove(),e.fadeOut(function(){a(this).remove()})},_onLayerRemove:function(a,b){a.data.widget._remove(b,!0)}})}(jQuery),function(a){a.template("mqLayerManager",'<div class="mq-layermanager ui-widget-content  "></div>'),a.template("mqLayerManagerElement",'<div class="mq-layermanager-element ui-widget-content ui-corner-all" id="mq-layermanager-element-${id}"><div class="mq-layermanager-element-header ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"><span class="mq-layermanager-label ui-dialog-title">${label}</span><a class="ui-dialog-titlebar-close ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-closethick">close</span></a></div><div class="mq-layermanager-element-content"><div class="mq-layermanager-element-visibility"><input type="checkbox" class="mq-layermanager-element-vischeckbox" id="${id}-visibility" {{if visible}}checked="${visible}"{{/if}} /><div class="mq-layermanager-element-slider-container"><div class="mq-layermanager-element-slider"></div></div></div><div class="mq-layermanager-element-legend">{{if imgUrl}}<img src="${imgUrl}" style="opacity:${opacity}"/>{{/if}}{{if errMsg}}${errMsg}{{/if}}</div></div></div>'),a.widget("mapQuery.mqLayerManager",{options:{map:undefined,title:"Layer Manager"},_create:function(){var b,c,d,e=this,f=this.element;b=a(this.options.map).data("mapQuery"),this.element.addClass("ui-widget  ui-helper-clearfix ui-corner-all");var g=a.tmpl("mqLayerManager").appendTo(f);f.find(".ui-icon-closethick").button(),g.sortable({axis:"y",handle:".mq-layermanager-element-header",update:function(b,c){var d=c.item.siblings().andSelf(),f=d.length-1;d.each(function(b){var c=a(this).data("layer"),d=f-b;e._position(c,d)})}}),a.each(b.layers().reverse(),function(){e._layerAdded(g,this)}),f.delegate(".mq-layermanager-element-vischeckbox","change",function(){var b=a(this),c=b.parents(".mq-layermanager-element"),d=c.data("layer"),e=c.data("self");e._visible(d,b.is(":checked"))}),f.delegate(".ui-icon-closethick","click",function(){var b=a(this).parents(".mq-layermanager-element");e._remove(b.data("layer"))}),b.bind("addlayer",{widget:e,control:g},e._onLayerAdd),b.bind("removelayer",{widget:e,control:g},e._onLayerRemove),b.bind("changelayer",{widget:e,map:b,control:g},e._onLayerChange),b.bind("moveend",{widget:e,map:b,control:g},e._onMoveEnd)},_destroy:function(){this.element.removeClass(" ui-widget ui-helper-clearfix ui-corner-all").empty()},_add:function(a,b){a.layers(b)},_remove:function(a){a.remove()},_position:function(a,b){a.position(b)},_visible:function(a,b){a.visible(b)},_opacity:function(a,b){a.opacity(b)},_layerAdded:function(b,c){var d=this,e=c.legend().msg,f;switch(e){case"":f=c.legend().url,f==""&&(e="No legend for this layer");break;case"E_ZOOMOUT":e="Please zoom out to see this layer";break;case"E_ZOOMIN":e="Please zoom in to see this layer";break;case"E_OUTSIDEBOX":e="This layer is outside the current view"}var g=a.tmpl("mqLayerManagerElement",{id:c.id,label:c.label,position:c.position(),visible:c.visible(),imgUrl:f,opacity:c.visible()?c.opacity():0,errMsg:e}).data("layer",c).data("self",d).prependTo(b);a(".mq-layermanager-element-slider",g).slider({max:100,step:1,value:c.visible()?c.opacity()*100:0,slide:function(a,b){var c=g.data("layer"),d=g.data("self");d._opacity(c,b.value/100)},change:function(a,b){var c=g.data("layer"),d=g.data("self");b.value>=.01&&(c.visible()||c.visible(!0)),b.value<.01&&c.visible()&&c.visible(!1)}})},_layerRemoved:function(b,c){var d=a("#mq-layermanager-element-"+c);d.fadeOut(function(){a(this).remove()})},_layerPosition:function(b,c){var d=b.element.find(".mq-layermanager-element"),e=d.length-1,f=[];f.length=d.length,d.each(function(){var b=a(this).data("layer"),c=e-b.position();f[c]=this});for(i=0;i<f.length;i++)d.parent().append(f[i])},_layerVisible:function(a,b){var c=a.element.find("#mq-layermanager-element-"+b.id),d=c.find(".mq-layermanager-element-vischeckbox");d[0].checked=b.visible();var e=c.find(".mq-layermanager-element-slider"),f=b.visible()?b.opacity()*100:0;e.slider("value",f),c.find(".mq-layermanager-element-legend img").css({visibility:b.visible()?"visible":"hidden"})},_layerOpacity:function(a,b){var c=a.element.find("#mq-layermanager-element-"+b.id),d=c.find(".mq-layermanager-element-slider");d.slider("value",b.opacity()*100),c.find(".mq-layermanager-element-legend img").css({opacity:b.opacity(),visibility:b.visible()?"visible":"hidden"})},_moveEnd:function(b,c,d){c.empty(),a.each(d.layers().reverse(),function(){b._layerAdded(c,this)})},_onLayerAdd:function(a,b){a.data.widget._layerAdded(a.data.control,b)},_onLayerRemove:function(a,b){a.data.widget._layerRemoved(a.data.control,b.id)},_onLayerChange:function(a,b,c){switch(c){case"opacity":a.data.widget._layerOpacity(a.data.widget,b);break;case"position":a.data.widget._layerPosition(a.data.widget,b);break;case"visibility":a.data.widget._layerVisible(a.data.widget,b)}},_onMoveEnd:function(a){a.data.widget._moveEnd(a.data.widget,a.data.control,a.data.map)}})}(jQuery),function(a){a.template("mqMousePosition",'<div class="mq-mouseposition ui-widget ui-helper-clearfix "><span class="ui-widget-content ui-helper-clearfix ui-corner-all ui-corner-all"><div id="mq-mouseposition-x" class="mq-mouseposition-coordinate"></div><div id="mq-mouseposition-y" class="mq-mouseposition-coordinate"></div></div></span>'),a.widget("mapQuery.mqMousePosition",{options:{map:undefined,precision:2,x:"x",y:"y"},_create:function(){this.map=a(this.options.map).data("mapQuery"),this.map.element.bind("mousemove",{widget:this},this._onMousemove),a.tmpl("mqMousePosition",{}).appendTo(this.element)},_destroy:function(){this.element.removeClass("ui-widget ui-helper-clearfix ui-corner-all").empty()},_onMousemove:function(b){var c=b.data.widget,d=b.pageX,e=b.pageY,f=new OpenLayers.Projection(c.map.projection),g=new OpenLayers.Projection(c.map.displayProjection),h=c.map.olMap.getLonLatFromLayerPx(new OpenLayers.Pixel(d,e));f.equals(c.map.displayProjection)||(h=h.transform(f,g)),a("#mq-mouseposition-x",c.element).html(c.options.x+": "+h.lon.toFixed(c.options.precision)),a("#mq-mouseposition-y",c.element).html(c.options.y+": "+h.lat.toFixed(c.options.precision))}})}(jQuery),function(a){a.template("mqOverviewMap",'<div class="mq-overviewmap-button ui-state-default ui-corner-all"><div class="mq-overviewmap-close ui-icon ui-icon-arrowthick-1-se "></div></div><div id="${id}" class="mq-overviewmap ui-widget "></div>'),a.widget("mapQuery.mqOverviewMap",{options:{map:undefined,title:"Overview map",position:["right","bottom"],width:300,height:200},_create:function(){var b,c=this,d=this.element,e="mqOverviewMap-dialog";b=a(this.options.map).data("mapQuery"),this.element.addClass("ui-widget  ui-helper-clearfix ui-corner-all"),a.tmpl("mqOverviewMap",{id:e}).appendTo(d);var f=a("#"+e).dialog({dialogClass:"mq-overviewmap-dialog",autoOpen:!0,width:this.options.width,height:this.options.height,title:this.options.title,position:this.options.position,resizeStop:function(b,c){a(".olMap",this).width(a(this).width()),a(".olMap",this).height(a(this).height())},close:function(b,c){a(".mq-overviewmap-close").removeClass("mq-overviewmap-close ui-icon-arrowthick-1-se").addClass("mq-overviewmap-open ui-icon-arrowthick-1-nw")}}),g={w:a(f).width(),h:a(f).height()},h=b.olMapOptions;delete h.controls;var i=new OpenLayers.Control.OverviewMap({div:document.getElementById(e),size:g,mapOptions:h,layers:[b.layers().reverse()[0].olLayer.clone()]});b.olMap.addControl(i),a(".olControlOverviewMapElement",f).removeClass("olControlOverviewMapElement"),d.delegate(".mq-overviewmap-close","click",function(){a(this).removeClass("mq-overviewmap-close ui-icon-arrowthick-1-se").addClass("mq-overviewmap-open ui-icon-arrowthick-1-nw"),a("#"+e).dialog("close")}),d.delegate(".mq-overviewmap-open","click",function(){a(this).removeClass("mq-overviewmap-open ui-icon-arrowthick-1-nw").addClass("mq-overviewmap-close ui-icon-arrowthick-1-se"),a("#"+e).dialog("open")})},_destroy:function(){this.element.removeClass(" ui-widget ui-helper-clearfix ui-corner-all").empty()}})}(jQuery),function(a){a.template("mqPopup",'<div class="mq-popup ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"><span class="ui-dialog-title">${title}</span><a class="ui-dialog-titlebar-close ui-corner-all" href="#"><span class="ui-icon ui-icon-closethick">close</span></a></div><div" class="ui-dialog-content ui-widget-content">{{html contents}}</div>'),a.widget("mapQuery.mqPopup",{options:{map:undefined,contents:undefined,title:"Feature Popup",padding:10},_create:function(){var b,c=this;this.element.addClass("ui-dialog ui-widget ui-widget-content ui-corner-all"),b=a(this.options.map).data("mapQuery"),b.bind("featureselected",{widget:c},c._onFeatureselected),b.bind("featureunselected",{widget:c},c._onFeatureunselected),b.bind("move",{widget:c},c._onMove)},_destroy:function(){this.element.removeClass("ui-dialog ui-widget ui-widget-content ui-corner-all").empty()},_onFeatureselected:function(b,c,d){var e=this,f=b.data.widget,g=f.element,h=f.options.contents.call(f.options,d);f.lonLat=a.MapQuery.getFeaturePosition(d),g.html(a.tmpl("mqPopup",{title:f.options.title,contents:h})).find("a.ui-dialog-titlebar-close").bind("click",function(){g.hide(),f.lonLat=null,d.unselect()});var i=e.pixelsFromPosition(f.lonLat[0],f.lonLat[1]);g.show(0,function(){a(this).css("z-index",c.zIndex()+1e3),f._setPosition(e,i)});var j=e.element.outerWidth()-(i[0]+g.outerWidth())-f.options.padding,k=g.outerHeight()-i[1]+f.options.padding;e.pan(j<0?-j:0,k>0?-k:0)},_onFeatureunselected:function(a){var b=a.data.widget;b.element.hide(),b.lonLat=null},_onMove:function(a){var b=this,c=a.data.widget;if(!!c.lonLat){var d=b.pixelsFromPosition(c.lonLat[0],c.lonLat[1]);d!==null?(c.element.show(),c._setPosition(b,d)):c.element.hide()}},_setPosition:function(a,b){this.element.position({my:"left bottom",at:"left top",of:a.element,offset:b[0]+" "+b[1],collision:"none"})}})}(jQuery),function(a){a.template("mqZoomButtons",'<div class="mq-zoombuttons ui-widget ui-helper-clearfix "><div class="ui-state-default ui-corner-all"><div class="mq-zoombuttons-plus ui-icon ui-icon-plusthick "></div></div>{{if home}}<div class="ui-state-default ui-corner-all"><div class="mq-zoombuttons-home ui-icon ui-icon-home"></div></div>{{/if}}<div class="ui-state-default ui-corner-all"><div class="mq-zoombuttons-minus ui-icon ui-icon-minusthick"></div></div></div>'),a.widget("mapQuery.mqZoomButtons",{options:{map:undefined,home:!1},_create:function(){var b,c,d,e=this,f=this.element;b=a(this.options.map).data("mapQuery");var g=b.center();a.tmpl("mqZoomButtons",{home:this.options.home}).appendTo(f),a(".mq-zoombuttons-plus").click(function(){d=b.options.numZoomLevels,c=b.center().zoom,c<d&&b.center({zoom:c+1})}),a(".mq-zoombuttons-home").click(function(){b.center(g)}),a(".mq-zoombuttons-minus").click(function(){c=b.center().zoom,c>0&&b.center({zoom:c-1})})},_destroy:function(){this.element.removeClass(" ui-widget ui-helper-clearfix ui-corner-all").empty()}})}(jQuery),function(a){a.template("mqZoomSlider",'<div class="mq-zoomslider ui-widget ui-helper-clearfix "><div class="mq-zoomslider-slider"></div></div>'),a.widget("mapQuery.mqZoomSlider",{options:{map:undefined},_create:function(){var b,c,d,e=this,f=this.element;b=a(this.options.map).data("mapQuery"),a.tmpl("mqZoomSlider").appendTo(f),d=b.options.numZoomLevels,a(".mq-zoomslider-slider",f).slider({max:d,min:2,orientation:"vertical",step:1,value:d-b.center().zoom,slide:function(a,c){b.center({zoom:d-c.value})},change:function(a,c){b.center({zoom:d-c.value})}}),b.bind("zoomend",{widget:e,map:b,control:f},e._onZoomEnd)},_destroy:function(){this.element.removeClass(" ui-widget ui-helper-clearfix ui-corner-all").empty()},_zoomEnd:function(a,b){var c=a.find(".mq-zoomslider-slider");c.slider("value",b.options.numZoomLevels-b.center().zoom)},_onZoomEnd:function(a){a.data.widget._zoomEnd(a.data.control,a.data.map)}})}(jQuery)