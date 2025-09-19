/**
 * GLTFLoader for Three.js
 * Simple loader for GLTF/GLB models
 */

THREE.GLTFLoader = function () {
    this.manager = THREE.DefaultLoadingManager;
    this.path = '';
};

THREE.GLTFLoader.prototype = {
    constructor: THREE.GLTFLoader,

    load: function (url, onLoad, onProgress, onError) {
        var scope = this;
        var loader = new THREE.FileLoader(scope.manager);
        loader.setPath(scope.path);
        loader.setResponseType('arraybuffer');

        loader.load(url, function (data) {
            try {
                scope.parse(data, onLoad, onError);
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    console.error(e);
                }
            }
        }, onProgress, onError);
    },

    setPath: function (value) {
        this.path = value;
        return this;
    },

    parse: function (data, onLoad, onError) {
        // Simple GLB parser - for demo purposes
        // In a real implementation, this would parse the GLB format

        // Create a simple tyre geometry as fallback
        var geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        var material = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 30
        });

        var mesh = new THREE.Mesh(geometry, material);

        var scene = new THREE.Group();
        scene.add(mesh);

        var gltf = {
            scene: scene,
            scenes: [scene],
            asset: {
                version: '2.0',
                generator: 'TyreHero Simple Loader'
            }
        };

        if (onLoad) {
            onLoad(gltf);
        }
    }
};