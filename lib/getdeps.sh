#!/bin/sh

mkdir -p download tmp

# I need the _super() function (in jquery.ui.widget.js) from 1.9
curl --location -o "download/jquery-ui-1.9m6.tar.gz" "https://github.com/jquery/jquery-ui/tarball/1.9m6"  
tar zxvf download/jquery-ui-1.9m6.tar.gz -C tmp
# minification just takes too long => don't do it
ant -file tmp/jquery-jquery-ui-ae119ce/build/build.xml copy concatenate
mv tmp/jquery-jquery-ui-ae119ce/build/dist/jquery-ui-1.9m6/ jquery

# Get OpenLayers
curl -o "download/OpenLayers-2.12.tar.gz" "http://openlayers.org/download/OpenLayers-2.12.tar.gz"  
mkdir openlayers
tar zxvf download/OpenLayers-2.12.tar.gz --strip 1 -C openlayers

# Get jQuery-tmpl
curl -o "download/jquery.tmpl.js" "http://ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl.js"  
mv download/jquery.tmpl.js jquery/

# Cleanup
rm -Rf download
rm -Rf tmp
