/**
 *  @file main.js
 *  @brief Creates the axon global object. Used with Loader.js
 */
if (typeof axon == "undefined"){
	// In case multiple patterns match in the manifest.json
	var axon = new Axon();
}
