/*
Photoshop Composition Composer (modified)

Based on:
photoshopCompositionComposer v0.1
by Mateusz Zawartka
https://github.com/mechanicious/photoshopCompositionComposer

Refactored and extended by:
Qosua, 2026

License: MIT
*/

app.displayDialogs = DialogModes.ALL;
app.displayDialogs = DialogModes.NO;

function artLayersVisible(artlayersArr, flag) {

	for(var i = 0; i < artlayersArr.length; i++)
		artlayersArr[i].visible = flag;

}

function setsVisible(sets, flag) {

	for(var i = 0; i < sets.length; i++) {

		sets[i].visible = flag

		if (sets[i].layerSets.length > 0) 
			setsVisible(sets[i].layerSets, flag);

	}
}

function setsAndLayersVisible(sets, flag) {

	for(var i = 0; i < sets.length; i++) {

		sets[i].visible = flag

		for(var z = 0; z < sets[i].artLayers.length; z++) 
			sets[i].artLayers[z].visible = flag;

		if (sets[i].layerSets.length > 0) 
			setsAndLayersVisible(sets[i].layerSets, flag);

	}
}

function getArtLayersCollection(sets) {

	var resultArr = [];

	for(var i = 0; i < sets.length; i++) {

		for(var z = 0; z < sets[i].artLayers.length; z++) {

			if(sets[i].name.indexOf('__') !== 0)
				resultArr.push(sets[i].artLayers[z]);

		}

		if (sets[i].layerSets.length > 0 && 
			sets[i].name.indexOf('__') !== 0) {

			var inner = getArtLayersCollection(sets[i].layerSets);

			for (var j = 0; j < inner.length; j++)
				resultArr.push(inner[j]);
			
		}
	}

	return resultArr;
}

function addArtLayers(artLayers, resultArr) {

	for(var i = 0; i < artLayers.length; i++) 
		resultArr.push(artLayers[i]);

	return resultArr;
}

function getLayerPath(layer) {
	var parts = [];
	var current = layer;

	while (current && current.typename !== "Document") {
		parts.push(current.name);
		current = current.parent;
	}

	parts.reverse();
	return parts.join("_");
}

function process() {

	var artLayerCollection; 
	artLayerCollection = getArtLayersCollection(app.activeDocument.layerSets);
	artLayerCollection = addArtLayers(app.activeDocument.artLayers, artLayerCollection);

	if(!artLayerCollection.length) 
		return alert('Script has aborted. No combinations found. Please make sure no empty groups are present.');

	var continueConfirmation;
	continueConfirmation = confirm(artLayerCollection.length + " layers found. Would you like to continue?");

	if(!continueConfirmation) 
		return alert('Script has been aborted.');

	var savePath = Folder.selectDialog("Select an output folder");

	var includePSDFiles = confirm('Would you like to include corresponding PSD documents?');

	setsAndLayersVisible(app.activeDocument.layerSets, false);
	setsVisible(app.activeDocument.layerSets, true);

	for(var i = 0; i < artLayerCollection.length; i++) {
			
		artLayersVisible(artLayerCollection, false);

		artLayerCollection[i].visible = true;
		
		saveDocumentAsPNG(savePath + '/' + getLayerPath(artLayerCollection[i]));

		if(includePSDFiles) 
			saveDocumentAsPSD(savePath + '/' + getLayerPath(artLayerCollection[i]));
		
	}
}

function saveDocumentAsPNG(path) {
    var opts = new PNGSaveOptions();

    opts.compression = 7;        
    opts.interlaced = false;

    app.activeDocument.saveAs(new File(path), opts, true);
}

function saveDocumentAsPSD(path) {
	app.activeDocument.saveAs(new File(path), new PhotoshopSaveOptions());
}


var userDisplayDialogsPref = app.displayDialogs;

process();

app.displayDialogs = userDisplayDialogsPref;