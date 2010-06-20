var sys = require('sys'),
    SpriteSheet = require('./SpriteSheet').SpriteSheet;
    Sprite = require('./Sprite').Sprite;
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('./TMXOrientation').TMXOrientationIso,
    ccp    = require('geometry').ccp,
    Node = require('./Node').Node;

var TMXLayer = SpriteSheet.extend({
    layerSize: null,
    layerName: '',
    tiles: null,
    tilset: null,
    layerOrientation: 0,
    mapTileSize: null,
    properties: null,

    init: function(opts) {
        var tilesetInfo = opts['tilesetInfo'],
            layerInfo = opts['layerInfo'],
            mapInfo = opts['mapInfo'];

        var size = layerInfo.get('layerSize'),
            totalNumberOfTiles = size.width * size.height;

        var tex = null;
        if (tilesetInfo) {
            tex = tilesetInfo.sourceImage;
        }

        @super({file: tex});

        this.layerName = layerInfo.get('name');
        this.layerSize = layerInfo.get('layerSize');
        this.tiles = layerInfo.get('tiles');
        this.minGID = layerInfo.get('minGID');
        this.maxGID = layerInfo.get('maxGID');
        this.opacity = layerInfo.get('opacity');
        this.properties = sys.copy(layerInfo.properties);

        this.tileset = tilesetInfo;
        this.mapTileSize = mapInfo.get('tileSize');
        this.layerOrientation = mapInfo.get('orientation');

        var offset = this.calculateLayerOffset(layerInfo.get('offset'));
        this.set('position', offset);

        this.set('contentSize', {width: this.layerSize.width * this.mapTileSize.width, height: this.layerSize.height * this.mapTileSize.height});
    },

    calculateLayerOffset: function(pos) {
        var ret = ccp(0, 0);

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = ccp(pos.x * this.mapTileSize.width, pos.y * this.mapTileSize.height);
            break;
        case TMXOrientationIso:
            // TODO
            break;
        case TMXOrientationHex:
            // TODO
            break;
        }

        return ret;
    },

    setupTiles: function() {
        this.tileset.set('imageSize', this.get('texture.contentSize'));


        for (var y=0; y < this.layerSize.height; y++) {
            for (var x=0; x < this.layerSize.width; x++) {
                
                var pos = x + this.layerSize.width * y,
                    gid = this.tiles[pos];
                
                if (gid != 0) {
                    this.appendTile({gid:gid, position:ccp(x,y)});
                    
                    // Optimization: update min and max GID rendered by the layer
                    this.minGID = Math.min(gid, this.minGID);
                    this.maxGID = Math.max(gid, this.maxGID);
                }
            }
        }
        
    },
    appendTile: function(opts) {
        var gid = opts['gid'],
            pos = opts['position'];

        var z = pos.x + pos.y * this.layerSize.width;
            
        
        var rect = this.tileset.rectForGID(gid);
        var tile = Sprite.create({rect: rect});
        tile.set('position', this.positionAt(pos));
        tile.set('anchorPoint', ccp(0, 0));
        tile.set('opacity', this.get('opacity'));
        this.addChild(tile);
    },
    positionAt: function(pos) {
        return ccp(1, 1);
    }
});

exports.TMXLayer = TMXLayer;