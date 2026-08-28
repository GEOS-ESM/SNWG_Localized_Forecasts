// manager
// deps

(function(global) {
    'use strict';

    // projections
    function registerProjections() {
        if (typeof proj4 === 'undefined') {
            console.warn('proj4 not loaded');
            return;
        }

        const projections = {
            'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs',
            'EPSG:4269': '+proj=longlat +datum=NAD83 +no_defs',
            'EPSG:4267': '+proj=longlat +datum=NAD27 +no_defs',
            
            'EPSG:3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs',
            'EPSG:900913': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs',
            'EPSG:102100': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs',
            
            'EPSG:32662': '+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
            'EPSG:32663': '+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
            'EPSG:54001': '+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
            
            'SR-ORG:6974': '+proj=sinu +lon_0=0 +x_0=0 +y_0=0 +a=6371007.181 +b=6371007.181 +units=m +no_defs',
            'EPSG:54008': '+proj=sinu +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
            
            'EPSG:102004': '+proj=lcc +lat_1=33 +lat_2=45 +lat_0=39 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
            
            'EPSG:32601': '+proj=utm +zone=1 +datum=WGS84 +units=m +no_defs',
            'EPSG:32610': '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs',
            'EPSG:32611': '+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs',
            'EPSG:32618': '+proj=utm +zone=18 +datum=WGS84 +units=m +no_defs',
            'EPSG:32619': '+proj=utm +zone=19 +datum=WGS84 +units=m +no_defs',
            
            'CRS:84': '+proj=longlat +datum=WGS84 +no_defs',
            'OGC:CRS84': '+proj=longlat +datum=WGS84 +no_defs'
        };
        
        // register
        Object.entries(projections).forEach(([code, def]) => {
            try {
                // guard
                if (!proj4.defs(code)) {
                    proj4.defs(code, def);
                }
            } catch (e) {
                console.warn(`Could not register ${code}:`, e);
            }
        });
        
        console.log('Proj4 projections registered');
    }

    // Config
    const CONFIG = {
        // paths
        pmtilesPath: 'https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/pmtiles_output/',
        geotiffPath: 'https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/pmtiles_output/',
        
        // layer
        defaultLayer: null,
        defaultLayerName: null,
        loadDefaultOnInit: false,
        
        // opacity
        defaultOpacity: 0.7,
        defaultResolution: 256,
        
        // colors
        colorScales: {
            no2: [
                // viridis
                { value: 0, color: [68, 1, 84, 180] },      // purple
                { value: 50, color: [59, 82, 139, 180] },   // blue
                { value: 100, color: [33, 145, 140, 180] }, // teal
                { value: 150, color: [94, 201, 98, 180] },  // green
                { value: 200, color: [253, 231, 37, 180] }, // yellow
                { value: 300, color: [253, 231, 37, 180] }  // max
            ],
            pm25: [
                { value: 0, color: [0, 228, 0, 180] },      // good
                { value: 12, color: [255, 255, 0, 180] },   // moderate
                { value: 35.4, color: [255, 126, 0, 180] }, // sensitive
                { value: 55.4, color: [255, 0, 0, 180] },   // unhealthy
                { value: 150.4, color: [143, 63, 151, 180] }, // vunhealthy
                { value: 250.4, color: [126, 0, 35, 180] }  // hazardous
            ],
            o3: [
                // viridis
                { value: 0, color: [68, 1, 84, 180] },      // purple
                { value: 40, color: [59, 82, 139, 180] },   // blue
                { value: 70, color: [33, 145, 140, 180] },  // teal
                { value: 100, color: [94, 201, 98, 180] },  // green
                { value: 150, color: [253, 231, 37, 180] }, // yellow
                { value: 200, color: [253, 231, 37, 180] }  // max
            ],
            co: [
                // viridis
                { value: 0, color: [68, 1, 84, 180] },      // purple
                { value: 2, color: [59, 82, 139, 180] },    // blue
                { value: 4, color: [33, 145, 140, 180] },   // teal
                { value: 6, color: [94, 201, 98, 180] },    // green
                { value: 10, color: [253, 231, 37, 180] },  // yellow
                { value: 30, color: [253, 231, 37, 180] }   // max
            ],
            so2: [
                // viridis
                { value: 0, color: [68, 1, 84, 180] },      // purple
                { value: 40, color: [59, 82, 139, 180] },   // blue
                { value: 100, color: [33, 145, 140, 180] }, // teal
                { value: 350, color: [94, 201, 98, 180] },  // green
                { value: 500, color: [253, 231, 37, 180] }, // yellow
                { value: 1000, color: [253, 231, 37, 180] } // max
            ],
            default: [
                { value: 0, color: [68, 1, 84, 180] },      // viridis
                { value: 0.2, color: [59, 82, 139, 180] },
                { value: 0.4, color: [33, 145, 140, 180] },
                { value: 0.6, color: [94, 201, 98, 180] },
                { value: 0.8, color: [253, 231, 37, 180] },
                { value: 1.0, color: [253, 231, 37, 180] }
            ],
            // molmol
            // range
            molmol: [
                { value: 0,    color: [68,  1,  84, 180] },
                { value: 2e-9, color: [59, 82, 139, 180] },
                { value: 1e-8, color: [33,145, 140, 180] },
                { value: 5e-8, color: [94,201,  98, 180] },
                { value: 1e-7, color: [253,231,  37, 180] },
                { value: 3e-7, color: [253,231,  37, 180] }
            ],

            // ── Perceptual colormaps (0–1 normalized stops) ──────────────────
            viridis: [
                { value: 0.00, color: [ 68,   1,  84, 200] },
                { value: 0.10, color: [ 72,  35, 116, 200] },
                { value: 0.20, color: [ 64,  67, 135, 200] },
                { value: 0.30, color: [ 52,  94, 141, 200] },
                { value: 0.40, color: [ 41, 120, 142, 200] },
                { value: 0.50, color: [ 32, 144, 140, 200] },
                { value: 0.60, color: [ 34, 167, 132, 200] },
                { value: 0.70, color: [ 64, 190, 115, 200] },
                { value: 0.80, color: [121, 209,  81, 200] },
                { value: 0.90, color: [189, 222,  38, 200] },
                { value: 1.00, color: [253, 231,  37, 200] }
            ],
            plasma: [
                { value: 0.00, color: [ 13,   8, 135, 200] },
                { value: 0.10, color: [ 75,   3, 161, 200] },
                { value: 0.20, color: [125,   3, 168, 200] },
                { value: 0.30, color: [168,  34, 150, 200] },
                { value: 0.40, color: [203,  70, 121, 200] },
                { value: 0.50, color: [229, 107,  93, 200] },
                { value: 0.60, color: [248, 148,  65, 200] },
                { value: 0.70, color: [253, 187,  48, 200] },
                { value: 0.80, color: [244, 223,  54, 200] },
                { value: 0.90, color: [234, 248,  97, 200] },
                { value: 1.00, color: [240, 249,  33, 200] }
            ],
            magma: [
                { value: 0.00, color: [  0,   0,   4, 200] },
                { value: 0.10, color: [ 28,  16,  68, 200] },
                { value: 0.20, color: [ 79,  18, 123, 200] },
                { value: 0.30, color: [129,  37, 129, 200] },
                { value: 0.40, color: [181,  54, 122, 200] },
                { value: 0.50, color: [229,  80, 100, 200] },
                { value: 0.60, color: [251, 135,  97, 200] },
                { value: 0.70, color: [254, 194, 135, 200] },
                { value: 0.80, color: [252, 233, 191, 200] },
                { value: 0.90, color: [251, 252, 191, 200] },
                { value: 1.00, color: [252, 253, 191, 200] }
            ],
            inferno: [
                { value: 0.00, color: [  0,   0,   4, 200] },
                { value: 0.10, color: [ 31,  12,  72, 200] },
                { value: 0.20, color: [ 85,  15, 109, 200] },
                { value: 0.30, color: [139,  34,  82, 200] },
                { value: 0.40, color: [185,  57,  52, 200] },
                { value: 0.50, color: [221,  94,  32, 200] },
                { value: 0.60, color: [244, 136,  25, 200] },
                { value: 0.70, color: [252, 182,  48, 200] },
                { value: 0.80, color: [249, 228, 106, 200] },
                { value: 0.90, color: [247, 252, 126, 200] },
                { value: 1.00, color: [252, 255, 164, 200] }
            ],
            turbo: [
                { value: 0.00, color: [ 48,  18,  59, 200] },
                { value: 0.10, color: [ 50, 104, 200, 200] },
                { value: 0.20, color: [ 28, 163, 228, 200] },
                { value: 0.30, color: [ 30, 206, 183, 200] },
                { value: 0.40, color: [ 80, 226, 107, 200] },
                { value: 0.50, color: [167, 228,  68, 200] },
                { value: 0.60, color: [224, 200,  55, 200] },
                { value: 0.70, color: [251, 154,  37, 200] },
                { value: 0.80, color: [236,  92,  26, 200] },
                { value: 0.90, color: [196,  37,  18, 200] },
                { value: 1.00, color: [122,   4,   3, 200] }
            ],
            coolwarm: [
                { value: 0.00, color: [ 59,  76, 192, 200] },
                { value: 0.20, color: [106, 137, 247, 200] },
                { value: 0.40, color: [169, 193, 254, 200] },
                { value: 0.50, color: [221, 221, 221, 200] },
                { value: 0.60, color: [254, 178, 153, 200] },
                { value: 0.80, color: [237,  96,  83, 200] },
                { value: 1.00, color: [180,   4,  38, 200] }
            ],
            aqi: [
                { value: 0.00, color: [  0, 228,   0, 200] }, // Good
                { value: 0.17, color: [255, 255,   0, 200] }, // Moderate
                { value: 0.33, color: [255, 126,   0, 200] }, // Unhealthy for sensitive
                { value: 0.50, color: [255,   0,   0, 200] }, // Unhealthy
                { value: 0.67, color: [143,  63, 151, 200] }, // Very unhealthy
                { value: 0.83, color: [126,   0,  35, 200] }, // Hazardous
                { value: 1.00, color: [ 80,   0,  20, 200] }  // Extreme
            ]
        },
        
        // pmtiles
        availableLayers: []
    };

    // State
    const state = {
        currentLayer: null,
        currentLayerName: null,
        georaster: null,
        isLoading: false,
        layerOpacity: CONFIG.defaultOpacity,
        isVisible: true,
        legendVisible: true,
        availableLayers: [],
        activeColormap: null,
        activeBasemap:  'satellite',
        allAddedLayers: []
    };

    // Basemap tile sources — all keyless / free to use (Esri ArcGIS Online
    // public services + OpenStreetMap). CARTO and Stamen were removed because
    // they now require an API key.
    const BASEMAPS = {
        voyager:   { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',            opts: { attribution: 'Tiles &copy; Esri', maxZoom: 19 } },
        dark:      { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', opts: { attribution: 'Tiles &copy; Esri', maxZoom: 16 } },
        positron:  { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',opts: { attribution: 'Tiles &copy; Esri', maxZoom: 16 } },
        osm:       { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                         opts: { attribution: '&copy; OpenStreetMap contributors', subdomains: 'abc', maxZoom: 19 } },
        satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',              opts: { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community', maxZoom: 19 } },
        topo:      { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',             opts: { attribution: 'Tiles &copy; Esri', maxZoom: 19 } },
        none:      { url: null, opts: {} }
    };


    function interpolateColor(value, colorScale, minValue, maxValue) {
        // normalize
        const normalizedValue = (value - minValue) / (maxValue - minValue);
        
        let lowerColor = colorScale[0];
        let upperColor = colorScale[colorScale.length - 1];
        
        for (let i = 0; i < colorScale.length - 1; i++) {
            const lowerThreshold = colorScale[i].value / maxValue;
            const upperThreshold = colorScale[i + 1].value / maxValue;
            
            if (normalizedValue >= lowerThreshold && normalizedValue <= upperThreshold) {
                lowerColor = colorScale[i];
                upperColor = colorScale[i + 1];

                // factor
                const range = upperThreshold - lowerThreshold;
                const factor = range > 0 ? (normalizedValue - lowerThreshold) / range : 0;
                
                // interpolate
                return [
                    Math.round(lowerColor.color[0] + (upperColor.color[0] - lowerColor.color[0]) * factor),
                    Math.round(lowerColor.color[1] + (upperColor.color[1] - lowerColor.color[1]) * factor),
                    Math.round(lowerColor.color[2] + (upperColor.color[2] - lowerColor.color[2]) * factor),
                    Math.round(lowerColor.color[3] + (upperColor.color[3] - lowerColor.color[3]) * factor)
                ];
            }
        }
        
        return upperColor.color;
    }

    function getColorScale(pollutant, unit) {
        // Colormap override takes priority
        if (state.activeColormap && CONFIG.colorScales[state.activeColormap]) {
            const cs = CONFIG.colorScales[state.activeColormap];
            // Re-express stops as absolute values using georaster min/max if available
            if (state.georaster) {
                const mn = state.georaster.mins[0];
                const mx = state.georaster.maxs[0];
                return cs.map(s => ({ value: mn + s.value * (mx - mn), color: s.color }));
            }
            return cs;
        }
        const isMolMol = unit && (unit.toLowerCase().includes('mol/mol') || unit.toLowerCase() === 'mol mol-1');
        if (isMolMol && (pollutant === 'no2' || pollutant === 'o3' || pollutant === 'co' || pollutant === 'so2')) {
            return CONFIG.colorScales.molmol;
        }
        const key = (pollutant || 'default').toLowerCase();
        return CONFIG.colorScales[key] || CONFIG.colorScales.default;
    }

    // Rebuild current layer with a new colormap
    function setColormap(name) {
        state.activeColormap = name || null;
        if (state.currentLayer && state.georaster) {
            const pollutant = state.currentLayerName ? 
                (state.currentLayerName.match(/no2|pm25|o3|co|so2/i) || ['no2'])[0].toLowerCase() : 'no2';
            const colorScale = getColorScale(pollutant, null);
            state.currentLayer.colorScale = colorScale;
            state.currentLayer.minValue   = state.georaster.mins[0];
            state.currentLayer.maxValue   = state.georaster.maxs[0];
            state.currentLayer._buildDataCanvas();
            state.currentLayer._redraw();
        }
        // Sync all colormap selectors
        ['geotiff-colormap-select', 'geotiff-floating-colormap'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = name || '';
        });
    }

    function showLoading(message = 'Loading GEOS-CF ...') {
        state.isLoading = true;
        
        let loadingDiv = document.getElementById('geotiff-loading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'geotiff-loading';
            loadingDiv.className = 'geotiff-loading';
            loadingDiv.innerHTML = `
                <div class="geotiff-loading-spinner"></div>
                <span class="geotiff-loading-text">${message}</span>
                <span class="geotiff-loading-source">Source: NASA GMAO</span>
            `;
            document.body.appendChild(loadingDiv);
        } else {
            loadingDiv.querySelector('.geotiff-loading-text').textContent = message;
        }
        
        loadingDiv.style.display = 'flex';
    }

    function hideLoading() {
        state.isLoading = false;
        const loadingDiv = document.getElementById('geotiff-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    function showNotification(message, type = 'info') {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`[GeoTIFF ${type}]: ${message}`);
        }
        
        // loading
        const loadingDiv = document.getElementById('geotiff-loading');
        if (loadingDiv) {
            const spinner = loadingDiv.querySelector('.geotiff-loading-spinner');
            const textSpan = loadingDiv.querySelector('.geotiff-loading-text');
            const sourceSpan = loadingDiv.querySelector('.geotiff-loading-source');
            
            if (type === 'error') {
                loadingDiv.style.background = 'rgba(239, 68, 68, 0.9)';
                if (spinner) spinner.style.display = 'none';
            } else if (type === 'success') {
                loadingDiv.style.background = 'rgba(34, 197, 94, 0.9)';
                if (spinner) spinner.style.display = 'none';
            } else {
                loadingDiv.style.background = 'rgba(0, 0, 0, 0.8)';
                if (spinner) spinner.style.display = 'block';
            }
            
            if (textSpan) textSpan.textContent = message;
            
            loadingDiv.style.display = 'flex';
            
            // autohide
            if (type === 'error' || type === 'success') {
                setTimeout(() => {
                    loadingDiv.style.display = 'none';
                    loadingDiv.style.background = 'rgba(0, 0, 0, 0.8)';
                    if (spinner) spinner.style.display = 'block';
                }, 3000);
            }
        }
    }

    const POLLUTANT_UNITS = {
        no2: 'ppb',
        o3: 'ppb',
        co: 'ppm',
        so2: 'ppb',
        pm25: 'μg/m³',
        default: 'ppb'
    };


    async function discoverAvailableLayers() {
        const layers = [];

        // range
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 5);
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 5);

        // dates
        const dateList = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dateList.push(`${year}${month}${day}`);
        }

        // files
        dateList.forEach(dateStr => {
            // daily
            const displayDate = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
            
            layers.push({
                name: `GEOS-CF PM2.5 (RH35) ${displayDate}`,
                file: `geos_cf_PM25_RH35_${dateStr}_09z.tif`,
                type: 'geotiff',
                pollutant: 'pm25',
                date: displayDate,
                unit: 'μg/m³',
                path: CONFIG.pmtilesPath + `geos_cf_PM25_RH35_${dateStr}_09z.tif`
            });
        });

        state.availableLayers = layers;
        CONFIG.availableLayers = layers;

        console.log(`Created ${layers.length} layer options`);
        return layers;
    }



    const CanvasGeoTIFFLayer = L.Layer.extend({

        initialize: function(options) {
            L.setOptions(this, options);
            this.georaster  = options.georaster;
            this.colorScale = options.colorScale || [];
            this.minValue   = options.minValue   || 0;
            this.maxValue   = options.maxValue   || 100;
            this.opacity    = options.opacity    !== undefined ? options.opacity : 1;
            this._dataCanvas = null;
        },

        onAdd: function(map) {
            this._map = map;

            const pane = map.getPane(this.options.pane || 'overlayPane');
            this._canvas = L.DomUtil.create('canvas', 'leaflet-geotiff-canvas', pane);
            this._canvas.style.cssText = 'position:absolute;pointer-events:none;';
            this._ctx = this._canvas.getContext('2d', { alpha: true });

            map.on('moveend zoomend resize', this._redraw, this);
            if (map.options.zoomAnimation && L.Browser.any3d) {
                map.on('zoomanim', this._animateZoom, this);
            }

            // Build the offscreen buffer once, then draw
            this._buildDataCanvas();
            this._redraw();
        },

        onRemove: function(map) {
            L.DomUtil.remove(this._canvas);
            map.off('moveend zoomend resize', this._redraw, this);
            if (map.options.zoomAnimation && L.Browser.any3d) {
                map.off('zoomanim', this._animateZoom, this);
            }
            this._map = null;
        },

      
        _animateZoom: function(e) {
            if (!this._map || !this._rasterBounds) return;
            const scale  = this._map.getZoomScale(e.zoom);
          
            const offset = this._map._latLngBoundsToNewLayerBounds(
                this._rasterBounds, e.zoom, e.center
            ).min;
            L.DomUtil.setTransform(this._canvas, offset, scale);
        },


        _redraw: function() {
            if (!this._map || !this._canvas) return;

            const size    = this._map.getSize();
            const topLeft = this._map.containerPointToLayerPoint([0, 0]);

            L.DomUtil.setTransform(this._canvas, topLeft, 1);

            this._canvas.width  = size.x;
            this._canvas.height = size.y;
            const gr = this.georaster;
            this._rasterBounds = L.latLngBounds(
                [Math.max(-85.051128, gr.ymin), gr.xmin],
                [Math.min( 85.051128, gr.ymax), gr.xmax]
            );

            this._draw();
        },


        _draw: function() {
            if (!this._dataCanvas || !this._map) return;

            const ctx = this._ctx;
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

            const safeYMax = Math.min(85.051128, this.georaster.ymax);
            const safeYMin = Math.max(-85.051128, this.georaster.ymin);
            const nw = this._map.latLngToContainerPoint(L.latLng(safeYMax, this.georaster.xmin));
            const se = this._map.latLngToContainerPoint(L.latLng(safeYMin, this.georaster.xmax));

            const w = se.x - nw.x;
            const h = se.y - nw.y;
            if (w <= 0 || h <= 0) return;

            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(this._dataCanvas, nw.x, nw.y, w, h);
            ctx.restore();
        },

        _buildDataCanvas: function() {
            const gr = this.georaster;
            if (!gr) return;

            try {
                const srcW = gr.width;
                const srcH = gr.height;

                let raw = null;
                let isFlat = false;
                if (gr.data   && gr.data[0])   { raw = gr.data[0];   isFlat = true; }
                else if (gr.values && gr.values[0]) { raw = gr.values[0]; }
                if (!raw) { console.warn('CanvasGeoTIFFLayer: no band data found'); return; }

                const flat = new Float32Array(srcW * srcH);
                if (isFlat) {
                    flat.set(raw);
                } else {
                    let i = 0;
                    for (let y = 0; y < srcH; y++) {
                        const row = raw[y];
                        for (let x = 0; x < srcW; x++) flat[i++] = row ? row[x] : NaN;
                    }
                }

                const noData   = gr.noDataValue;
                const srcRGBA  = new Uint8ClampedArray(srcW * srcH * 4);
                for (let i = 0; i < flat.length; i++) {
                    const v = flat[i];
                    if (v === noData || isNaN(v)) { srcRGBA[i*4+3] = 0; continue; }
                    const c = this._colorAt(v);
                    srcRGBA[i*4]   = c[0];
                    srcRGBA[i*4+1] = c[1];
                    srcRGBA[i*4+2] = c[2];
                    srcRGBA[i*4+3] = c[3];
                }


                const safeYMax = Math.min(85.051128, gr.ymax);
                const safeYMin = Math.max(-85.051128, gr.ymin);
                const proj     = L.Projection.SphericalMercator;
                const pNW      = proj.project(L.latLng(safeYMax, gr.xmin));
                const pSE      = proj.project(L.latLng(safeYMin, gr.xmax));
                const mercW    = pSE.x - pNW.x;   
                const mercH    = pNW.y - pSE.y;  


                const dstW = srcW;
                const dstH = Math.max(1, Math.min(4096, Math.round(dstW * mercH / mercW)));

                const offscreen = document.createElement('canvas');
                offscreen.width  = dstW;
                offscreen.height = dstH;
                const octx = offscreen.getContext('2d');
                const img  = octx.createImageData(dstW, dstH);
                const dst  = img.data;


                for (let dy = 0; dy < dstH; dy++) {

                    const mY  = pNW.y - (dy / dstH) * mercH;
                    const lat = proj.unproject(L.point(0, mY)).lat;

                    const syF = ((gr.ymax - lat) / (gr.ymax - gr.ymin)) * srcH - 0.5;
                    const sy0 = Math.floor(syF);
                    const sy1 = Math.min(sy0 + 1, srcH - 1);
                    if (sy0 < 0 || sy0 >= srcH) continue;
                    const fy  = syF - sy0;

                    for (let dx = 0; dx < dstW; dx++) {
                        const sxF = (dx / dstW) * srcW - 0.5;
                        const sx0 = Math.floor(sxF);
                        const sx1 = Math.min(sx0 + 1, srcW - 1);
                        if (sx0 < 0 || sx0 >= srcW) continue;
                        const fx  = sxF - sx0;

                        const di   = (dy * dstW + dx) * 4;
                        const i00  = (sy0 * srcW + sx0) * 4;
                        const i10  = (sy0 * srcW + sx1) * 4;
                        const i01  = (sy1 * srcW + sx0) * 4;
                        const i11  = (sy1 * srcW + sx1) * 4;

                        // Bilinear blend
                        for (let c = 0; c < 4; c++) {
                            const top = srcRGBA[i00+c] * (1-fx) + srcRGBA[i10+c] * fx;
                            const bot = srcRGBA[i01+c] * (1-fx) + srcRGBA[i11+c] * fx;
                            dst[di+c] = top * (1-fy) + bot * fy;
                        }
                    }
                }

                octx.putImageData(img, 0, 0);
                this._dataCanvas = offscreen;
                console.log(`CanvasGeoTIFFLayer: buffer ready ${dstW}×${dstH}`);

            } catch(e) {
                console.error('CanvasGeoTIFFLayer._buildDataCanvas error:', e);
            }
        },

        // ------------------------------------------------------------------
        _colorAt: function(value) {
            const cs  = this.colorScale;
            const mn  = this.minValue;
            const mx  = this.maxValue;
            if (!cs || cs.length === 0) return [128, 128, 128, 180];
            const t = Math.max(0, Math.min(1, (value - mn) / (mx - mn)));
            for (let i = 0; i < cs.length - 1; i++) {
                const a  = cs[i],   b  = cs[i+1];
                const ta = (a.value - mn) / (mx - mn);
                const tb = (b.value - mn) / (mx - mn);
                if (t >= ta && t <= tb) {
                    const f = (t - ta) / (tb - ta);
                    return [
                        Math.round(a.color[0] * (1-f) + b.color[0] * f),
                        Math.round(a.color[1] * (1-f) + b.color[1] * f),
                        Math.round(a.color[2] * (1-f) + b.color[2] * f),
                        Math.round(a.color[3] * (1-f) + b.color[3] * f)
                    ];
                }
            }
            return cs[cs.length - 1].color;
        },

        // ------------------------------------------------------------------
        setOpacity: function(opacity) {
            this.opacity = opacity;
            this._draw();
        },

        render: function() {
            this._redraw();
        },

        getBounds: function() {
            if (!this.georaster) return null;
            return L.latLngBounds(
                [this.georaster.ymin, this.georaster.xmin],
                [this.georaster.ymax, this.georaster.xmax]
            );
        }
    });

    async function loadGeoTIFF(filePath, options = {}) {
        const map = window.currentMap;
        if (!map) {
            console.error('Map not initialized. Please ensure the map is created first.');
            return null;
        }


        if (typeof parseGeoraster === 'undefined') {
            console.error('georaster library not loaded. Please include georaster.min.js');
            showNotification('GeoTIFF library not loaded', 'error');
            return null;
        }

        const {
            pollutant = 'no2',
            opacity = state.layerOpacity,
            resolution = CONFIG.defaultResolution,
            addToMap = true,
            name = null,
            unit = null
        } = options;


        removeCurrentLayer();
        

        if (state.allAddedLayers && state.allAddedLayers.length > 0) {
            state.allAddedLayers.forEach(layer => {
                try {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                    if (layer._container) layer._container.remove();
                    if (layer._image) layer._image.remove();
                } catch (e) {}
            });
            state.allAddedLayers = [];
        }

        showLoading('Loading GeoTIFF...');

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                hideLoading();
                showNotification(`File not found or not accessible: ${response.status}`, 'error');
                console.warn(`GeoTIFF file not found: ${filePath}`);
                return null;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            
            showLoading('Parsing raster data...');
            
            const georaster = await parseGeoraster(arrayBuffer);
            state.georaster = georaster;

            console.log('GeoTIFF loaded:', {
                height: georaster.height,
                width: georaster.width,
                numberOfRasters: georaster.numberOfRasters,
                mins: georaster.mins,
                maxs: georaster.maxs,
                projection: georaster.projection
            });
            

            if (typeof proj4 !== 'undefined') {
                try {
                    const projectionRaw = georaster.projection;
                    console.log('GeoTIFF projection value:', projectionRaw, 'type:', typeof projectionRaw);
                    

                    const projectionStr = projectionRaw !== null && projectionRaw !== undefined 
                        ? String(projectionRaw) 
                        : null;
                    
                    let epsgCode = null;
                    

                    if (typeof projectionRaw === 'number') {

                        if (projectionRaw === 32767) {
                            console.log('GeoTIFF has user-defined projection (32767), inferring from bounds...');
                            if (georaster.xmin >= -180 && georaster.xmax <= 180 && 
                                georaster.ymin >= -90 && georaster.ymax <= 90) {
                                epsgCode = 'EPSG:4326';
                                console.log('Bounds suggest EPSG:4326 (geographic coordinates)');
                            }
                        } else if (projectionRaw >= 1 && projectionRaw <= 32766) {

                            epsgCode = `EPSG:${projectionRaw}`;
                        }
                    } else if (projectionStr) {
                        const epsgPatterns = [
                            /EPSG[:\s]*(\d+)/i,
                            /AUTHORITY\["EPSG",\s*"?(\d+)"?\]/i,
                            /"EPSG",\s*(\d+)/i,
                            /urn:ogc:def:crs:EPSG::(\d+)/i
                        ];
                        
                        for (const pattern of epsgPatterns) {
                            const match = projectionStr.match(pattern);
                            if (match) {
                                epsgCode = `EPSG:${match[1]}`;
                                break;
                            }
                        }
                        

                        if (!epsgCode) {
                            if (projectionStr.includes('WGS 84') || projectionStr.includes('WGS84') || projectionStr.includes('WGS_1984')) {
                                epsgCode = 'EPSG:4326';
                            } else if (projectionStr.includes('Web Mercator') || projectionStr.includes('Pseudo-Mercator')) {
                                epsgCode = 'EPSG:3857';
                            }
                        }
                    }
                    

                    if (!epsgCode) {
                        console.log('GeoTIFF bounds:', {
                            xmin: georaster.xmin,
                            xmax: georaster.xmax,
                            ymin: georaster.ymin,
                            ymax: georaster.ymax
                        });
                        
                        if (georaster.xmin >= -180 && georaster.xmax <= 180 && 
                            georaster.ymin >= -90 && georaster.ymax <= 90) {
                            epsgCode = 'EPSG:4326';
                            console.log('Assuming EPSG:4326 based on geographic bounds');
                        }
                    }
                    
                    if (epsgCode) {
                        console.log(`Using projection: ${epsgCode}`);
                        // guard
                        if (!proj4.defs(epsgCode)) {
                            const projDefs = {
                                'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs',
                                'EPSG:3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs',
                                'EPSG:32662': '+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
                            };
                            if (projDefs[epsgCode]) {
                                proj4.defs(epsgCode, projDefs[epsgCode]);
                                console.log(`Registered projection: ${epsgCode}`);
                            }
                        }
                    } else {
                        console.warn('Could not determine projection, layer may not display correctly');
                    }
                } catch (projError) {
                    console.warn('Could not parse projection:', projError);
                }
            }

            showLoading('Rendering layer...');

            // patch
            if (georaster.projection === 32767 || !georaster.projection) {
                if (georaster.xmin >= -180.5 && georaster.xmax <= 180.5 && 
                    georaster.ymin >= -90.5 && georaster.ymax <= 90.5) {
                    console.log('Patching georaster projection to EPSG:4326');
                    georaster.projection = 4326;
                }
            }

            const colorScale = getColorScale(pollutant, unit);
            const minValue = georaster.mins[0];
            const maxValue = georaster.maxs[0];
            
            if (!map.getPane('geotiffPane')) {
                map.createPane('geotiffPane');
                map.getPane('geotiffPane').style.zIndex = 450;
                map.getPane('geotiffPane').style.pointerEvents = 'none';
            }

            // layer
            const layer = new CanvasGeoTIFFLayer({
                georaster: georaster,
                opacity: opacity,
                colorScale: colorScale,
                minValue: minValue,
                maxValue: maxValue,
                pane: 'geotiffPane'
            });

            if (addToMap) {
                state.currentLayer = layer;
                state.currentLayerName = name || filePath;
                
                // track
                state.allAddedLayers.push(layer);
                
                layer.addTo(map);
                
                // refresh
                if (typeof map.invalidateSize === 'function') {
                    map.invalidateSize();
                }
                
                // markers
                if (window.currentMarkers && typeof window.currentMarkers.bringToFront === 'function') {
                    window.currentMarkers.bringToFront();
                } else if (window.currentMarkers && typeof window.currentMarkers.eachLayer === 'function') {
                    // group
                    window.currentMarkers.eachLayer(function(layer) {
                        if (typeof layer.bringToFront === 'function') {
                            layer.bringToFront();
                        }
                    });
                }
            }

            hideLoading();
            showNotification('GeoTIFF layer loaded successfully', 'success');
            
            // legend
            updateLegend(pollutant, minValue, maxValue, unit);
            
            return layer;

        } catch (error) {
            hideLoading();
            console.error('Error loading GeoTIFF:', error);
            showNotification(`Failed to load GeoTIFF: ${error.message}`, 'error');
            return null;
        }
    }


    async function loadPMTiles(filePath, options = {}) {
        const map = window.currentMap;
        if (!map) {
            console.error('Map not initialized');
            return null;
        }


        if (typeof protomapsL === 'undefined') {
            console.warn('protomaps-leaflet library not loaded. PMTiles support unavailable.');
            showNotification('PMTiles library not loaded', 'error');
            return null;
        }

        const {
            pollutant = 'no2',
            opacity = state.layerOpacity,
            name = null
        } = options;

        showLoading('Loading PMTiles...');

        try {
            const layer = protomapsL.leafletLayer({
                url: filePath,
                opacity: opacity
            });

            removeCurrentLayer();
            state.currentLayer = layer;
            state.currentLayerName = name || filePath;
            

            state.allAddedLayers.push(layer);
            
            layer.addTo(map);

            if (window.currentMarkers && typeof window.currentMarkers.bringToFront === 'function') {
                window.currentMarkers.bringToFront();
            } else if (window.currentMarkers && typeof window.currentMarkers.eachLayer === 'function') {

                window.currentMarkers.eachLayer(function(layer) {
                    if (typeof layer.bringToFront === 'function') {
                        layer.bringToFront();
                    }
                });
            }

            hideLoading();
            showNotification('PMTiles layer loaded successfully', 'success');
            
            return layer;

        } catch (error) {
            hideLoading();
            console.error('Error loading PMTiles:', error);
            showNotification(`Failed to load PMTiles: ${error.message}`, 'error');
            return null;
        }
    }

    // remove
    function removeCurrentLayer() {
        const map = window.currentMap;
        if (!map) return;

        if (state.allAddedLayers && state.allAddedLayers.length > 0) {
            state.allAddedLayers.forEach(layer => {
                try {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                    // container
                    if (layer._container) {
                        layer._container.remove();
                    }
                    if (layer._image) {
                        layer._image.remove();
                    }
                } catch (e) {
                    console.warn('Error removing layer:', e);
                }
            });
            // clear
            state.allAddedLayers = [];
        }
        
        // explicit
        if (state.currentLayer) {
            try {
                if (map.hasLayer(state.currentLayer)) {
                    map.removeLayer(state.currentLayer);
                }
                if (state.currentLayer._container) {
                    state.currentLayer._container.remove();
                }
                if (state.currentLayer._image) {
                    state.currentLayer._image.remove();
                }
            } catch (e) {
                console.warn('Error removing current layer:', e);
            }
        }
        
 
        map.eachLayer(function(layer) {
            if (layer.options && layer.options.georaster) {
                try {
                    map.removeLayer(layer);
                    if (layer._container) layer._container.remove();
                } catch (e) {}
            }
        });
        
        // redraw
        if (typeof map.invalidateSize === 'function') {
            map.invalidateSize();
        }
        
        state.currentLayer = null;
        state.currentLayerName = null;
        state.georaster = null;
    }


    function toggleLayerVisibility() {
        if (!state.currentLayer) return;
        
        state.isVisible = !state.isVisible;
        
        if (state.isVisible) {
            if (window.currentMap && !window.currentMap.hasLayer(state.currentLayer)) {
                window.currentMap.addLayer(state.currentLayer);
            }
        } else {
            if (window.currentMap && window.currentMap.hasLayer(state.currentLayer)) {
                window.currentMap.removeLayer(state.currentLayer);
            }
        }
        
        return state.isVisible;
    }


    function setLayerOpacity(opacity) {
        state.layerOpacity = Math.max(0, Math.min(1, opacity));
        
        if (state.currentLayer && typeof state.currentLayer.setOpacity === 'function') {
            state.currentLayer.setOpacity(state.layerOpacity);
        }
        
        return state.layerOpacity;
    }

    function getCurrentLayerInfo() {
        return {
            name: state.currentLayerName,
            isLoaded: state.currentLayer !== null,
            isVisible: state.isVisible,
            opacity: state.layerOpacity,
            georaster: state.georaster ? {
                width: state.georaster.width,
                height: state.georaster.height,
                mins: state.georaster.mins,
                maxs: state.georaster.maxs
            } : null
        };
    }

    // legend
    function updateLegend(pollutant, minValue, maxValue, unit) {
        // guard
        const isHomePage = document.body.classList.contains('home-page');
        
        let legend = document.getElementById('geotiff-legend');
        
        // hide
        if (!isHomePage) {
            if (legend) {
                legend.style.display = 'none';
            }
            console.log('Legend only displays on home page');
            return;
        }
        
        if (!legend) {
            legend = document.createElement('div');
            legend.id = 'geotiff-legend';
            legend.className = 'geotiff-legend';
            document.body.appendChild(legend);
        }

        // date
        let displayDate = "";
        if (state.currentLayerName) {
            const dateMatch = state.currentLayerName.match(/\d{8}/);
            if (dateMatch) {
                const d = dateMatch[0];
                displayDate = `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`;
            } else {
                displayDate = new Date().toISOString().split('T')[0];
            }
        }

        legend.innerHTML = `
            <div class="aqi-legend-wrapper">
            <div class="aqi-category good">Good</div>
            <div class="aqi-category moderate">Moderate</div>
            <div class="aqi-category usg">Unhealthy for sensitive groups</div>
            <div class="aqi-category unhealthy">Unhealthy</div>
            <div class="aqi-category vunhealthy">Very unhealthy</div>
            <div class="aqi-category hazardous">Hazardous</div>
            <div class="aqi-legend-footer">
                <span class="legend-footer-item">Data Sources: <strong>NASA GEOS‑CF</strong> <span class="legend-meta">Daily · Global, Site Specific</span></span>
                <span class="legend-footer-sep">·</span>
                <span class="legend-footer-item"><strong>NASA GEOS‑FP + CNN</strong> <span class="legend-meta">3h · Site Specific</span></span>
                <span class="legend-footer-sep">·</span>
                <span class="legend-footer-item"><strong>NASA/ ESA Pandora</strong> <span class="legend-meta">Historical, Real-time · Site Specific
</span></span>
                <span class="legend-footer-sep">|</span>
                <span class="legend-footer-item legend-footer-date-item">
                    <strong>Date</strong> <span id="legend-current-date">${displayDate}</span>
                    <button class="legend-layers-btn" title="Open Layers Panel"><i class="bi bi-layers-fill"></i></button>
                </span>
            </div>
            </div>
        `;

        // Layers
        const lLayersBtn = legend.querySelector('.legend-layers-btn');
        if (lLayersBtn) {
            lLayersBtn.addEventListener('click', () => {
                let panel = document.getElementById('geotiff-floating-panel');
                if (!panel) {
                    createFloatingPanel();
                } else {
                    panel.style.display = 'flex';
                }
                setTimeout(() => {
                    const layersTab = document.querySelector('.fp-tab[data-tab="layers"]');
                    if (layersTab) layersTab.click();
                }, 50);
                const quickBtn = document.getElementById('geotiff-quick-btn');
                if (quickBtn) quickBtn.style.display = 'none';
            });
        }

        legend.style.display = state.legendVisible ? 'block' : 'none';
    }

    // toggle
    function toggleLegend() {
        state.legendVisible = !state.legendVisible;
        const legend = document.getElementById('geotiff-legend');
        if (legend) {
            legend.style.display = state.legendVisible ? 'block' : 'none';
        }
        return state.legendVisible;
    }

    // hide
    function hideLegend() {
        state.legendVisible = false;
        const legend = document.getElementById('geotiff-legend');
        if (legend) {
            legend.style.display = 'none';
        }
    }


    const AnimationController = {
        frames:         [],
        currentIdx:     0,
        playing:        false,
        _timer:         null,
        speed:          800,
        _pollutant:     null,
        _lastSyncedDate: null,


        _buildFrameList: function(pollutant) {
            const pool = state.availableLayers
                .filter(l => l.pollutant === pollutant && l.type === 'geotiff')
                .sort((a, b) => a.date.localeCompare(b.date));

            if (pool.length === 0) return [];

            const today   = new Date().toISOString().split('T')[0];
            const cutFrom = new Date(today); cutFrom.setDate(cutFrom.getDate() - 3);
            const cutTo   = new Date(today); cutTo.setDate(cutTo.getDate()   + 4);
            const fmt = d => d.toISOString().split('T')[0];

            return pool.filter(l => l.date >= fmt(cutFrom) && l.date <= fmt(cutTo));
        },

        preload: async function(pollutant) {
            if (this.playing) this.pause();
            this.frames     = [];
            this.currentIdx = 0;
            this._pollutant = pollutant;

            const list = this._buildFrameList(pollutant);
            if (list.length === 0) {
                showNotification('No frames found for animation', 'error');
                return false;
            }

            this._setProgress(0, list.length);
            this._updateUI('loading');

            const colorScale = getColorScale(pollutant, null);

            // Fetch + parse all in parallel, then build canvases
            const results = await Promise.allSettled(
                list.map(async (meta, i) => {
                    const resp = await fetch(meta.path);
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const buf  = await resp.arrayBuffer();
                    const gr   = await parseGeoraster(buf);

                    // Fix projection
                    if ((gr.projection === 32767 || !gr.projection) &&
                        gr.xmin >= -180.5 && gr.xmax <= 180.5) {
                        gr.projection = 4326;
                    }

                    // Build offscreen buffer using a temporary layer instance
                    const tmpLayer = new CanvasGeoTIFFLayer({
                        georaster:  gr,
                        colorScale: colorScale,
                        minValue:   gr.mins[0],
                        maxValue:   gr.maxs[0],
                        opacity:    state.layerOpacity
                    });
                    // Attach map so CRS projection works
                    tmpLayer._map = window.currentMap;
                    tmpLayer._buildDataCanvas();

                    this._setProgress(i + 1, list.length);
                    return { meta, _dataCanvas: tmpLayer._dataCanvas, georaster: gr };
                })
            );

            this.frames = results
                .filter(r => r.status === 'fulfilled' && r.value._dataCanvas)
                .map(r => r.value);

            if (this.frames.length === 0) {
                showNotification('Failed to preload animation frames', 'error');
                this._updateUI('idle');
                return false;
            }

            console.log(`AnimationController: ${this.frames.length} frames ready`);
            this._updateUI('ready');
            this._renderFrame(0);
            return true;
        },

        _renderFrame: function(idx) {
            if (!this.frames[idx]) return;
            this.currentIdx = idx;
            const frame = this.frames[idx];

            if (state.currentLayer) {
                // Ensure the layer's georaster min/max matches this frame
                state.currentLayer.minValue   = frame.georaster.mins[0];
                state.currentLayer.maxValue   = frame.georaster.maxs[0];
                state.currentLayer._dataCanvas = frame._dataCanvas;
                state.currentLayer._draw();
            }

            this._showDateLabel(frame.meta.date);

            const scrubber = document.getElementById('anim-scrubber');
            if (scrubber) scrubber.value = idx;

            const dateEl = document.getElementById('anim-date-label');
            if (dateEl) dateEl.textContent = frame.meta.date;

            const legendDate = document.getElementById('legend-current-date');
            if (legendDate) legendDate.textContent = frame.meta.date;

            _patchURLParam('dt', frame.meta.date);

            ['geotiff-floating-select', 'geotiff-layer-select'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = frame.meta.path;
            });

            this._syncForecastsToDate(frame.meta.date);
        },

        play: function() {
            if (this.frames.length === 0) return;
            this.playing = true;
            this._updateUI('playing');
            this._timer = setInterval(() => {
                const next = (this.currentIdx + 1) % this.frames.length;
                this._renderFrame(next);
            }, this.speed);
        },

        pause: function() {
            this.playing = false;
            clearInterval(this._timer);
            this._timer = null;
            this._updateUI('paused');
        },

        step: function(delta) {
            if (this.playing) this.pause();
            const next = Math.max(0, Math.min(this.frames.length - 1, this.currentIdx + delta));
            this._renderFrame(next);
        },

        setSpeed: function(ms) {
            this.speed = ms;
            if (this.playing) { this.pause(); this.play(); }
        },

        setFrame: function(idx) {
            if (this.playing) this.pause();
            this._renderFrame(idx);
        },

        _syncMarkersAndBanners: function(sitesData) {
            if (typeof sitesArrayToGeoJSON === 'function' && typeof updateMapMarkers === 'function') {
                try {
                    window.__geotiffAnimating = true;
                    updateMapMarkers(sitesArrayToGeoJSON(sitesData));
                } catch(e) {}
                finally { window.__geotiffAnimating = false; }
            }
            sitesData.forEach(site => {
                const forecast = site.current_forecast;
                if (!forecast) return;
                const raw = forecast.overall_aqi != null ? forecast.overall_aqi
                          : (typeof getAqiFromForecast === 'function' ? getAqiFromForecast(forecast, site.species) : null);
                if (raw == null || raw === 'N/A') return;
                const aqi = parseInt(raw);
                if (isNaN(aqi)) return;
                const cls = aqi <= 50 ? 'good' : aqi <= 100 ? 'moderate' :
                            aqi <= 150 ? 'unhealthy-sensitive' : aqi <= 200 ? 'unhealthy' :
                            aqi <= 300 ? 'very-unhealthy' : 'hazardous';
                const nameAttr = site.location_name.replace(/ /g, '-');
                const $card = $(`.ticker-card[location_name="${nameAttr}"]`);
                if ($card.length) {
                    $card.find('.ticker-card-aqi').text(aqi).attr('class', `ticker-card-aqi ${cls}`);
                    if (forecast.local_time) {
                        $card.find('.ticker-card-meta span:first').text(forecast.local_time.substring(11, 16));
                    }
                }
            });
        },

        _syncForecastsToDate: async function(dateStr) {
            if (!window.currentForecastData || !window.currentForecastData.length) return;
            if (this._lastSyncedDate === dateStr) return;
            this._lastSyncedDate = dateStr;

            const [year, month, day] = dateStr.split('-');

            const hasFullSeries = window.currentForecastData.every(site => {
                const f = Array.isArray(site.precomputed_forecasts) ? site.precomputed_forecasts : [];
                return f.length > 2;
            });

            if (hasFullSeries) {
                const updatedSites = window.currentForecastData.map(site => {
                    const forecasts = site.precomputed_forecasts;
                    let best = null, bestDiff = Infinity;
                    for (const f of forecasts) {
                        if (!f.local_time || !f.local_time.startsWith(dateStr)) continue;
                        const h = parseInt(f.local_time.substring(11, 13));
                        const d = Math.abs(h - 12);
                        if (d < bestDiff) { bestDiff = d; best = f; }
                    }
                    return best ? { ...site, current_forecast: best } : site;
                });
                this._syncMarkersAndBanners(updatedSites);
                return;
            }

            const cacheKey = `__anim_snap_${year}${month}${day}09__`;
            let snapshot = window[cacheKey];
            if (!snapshot) {
                try {
                    const url = `https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/hourly_forecasts/${year}-${month}-${day}_09.json`;
                    const resp = await fetch(url);
                    if (resp.ok) { snapshot = await resp.json(); window[cacheKey] = snapshot; }
                } catch(e) { /* ignore — keep current markers */ }
            }
            if (!snapshot || !snapshot.sites) return;

            const snapMap = {};
            snapshot.sites.forEach(s => { snapMap[s.location_name] = s; });

            const updatedSites = window.currentForecastData.map(site => {
                const s = snapMap[site.location_name];
                return s ? { ...site, current_forecast: s } : site;
            });
            this._syncMarkersAndBanners(updatedSites);
        },

        _showDateLabel: function(dateStr) {
            let el = document.getElementById('map-anim-date');
            if (!el) {
                el = document.createElement('div');
                el.id = 'map-anim-date';
                el.className = 'map-anim-date';
                const mapEl = document.getElementById('map');
                if (mapEl) mapEl.appendChild(el);
            }
            const today = new Date().toISOString().split('T')[0];
            el.className = 'map-anim-date ' + (dateStr > today ? 'forecast' : dateStr === today ? 'today' : 'past');
            el.textContent = dateStr;
            el.style.display = 'block';
        },

        _hideDateLabel: function() {
            const el = document.getElementById('map-anim-date');
            if (el) el.style.display = 'none';
        },

        _setProgress: function(done, total) {
            const bar  = document.getElementById('anim-progress-bar');
            const text = document.getElementById('anim-progress-text');
            if (bar)  bar.style.width  = `${Math.round((done / total) * 100)}%`;
            if (text) text.textContent = done < total ? `Loading ${done}/${total}…` : `${total} frames ready`;
        },

        _updateUI: function(mode) {
            const playBtn  = document.getElementById('anim-play-btn');
            const loadBtn  = document.getElementById('anim-load-btn');
            const controls = document.getElementById('anim-controls');
            const progress = document.getElementById('anim-progress');
            if (!playBtn) return;

            if (mode === 'loading') {
                if (loadBtn)  loadBtn.disabled = true;
                if (controls) controls.style.display = 'none';
                if (progress) progress.style.display = 'block';
            } else if (mode === 'ready' || mode === 'paused') {
                if (loadBtn)  loadBtn.disabled = false;
                if (controls) controls.style.display = 'flex';
                if (progress) progress.style.display = 'none';
                if (playBtn)  playBtn.innerHTML = '&#9654;';
                const scrubber = document.getElementById('anim-scrubber');
                if (scrubber) {
                    scrubber.max   = this.frames.length - 1;
                    scrubber.value = this.currentIdx;
                }
            } else if (mode === 'playing') {
                if (playBtn) playBtn.innerHTML = '&#9646;&#9646;';
            } else if (mode === 'idle') {
                if (loadBtn)  loadBtn.disabled = false;
                if (controls) controls.style.display = 'none';
                if (progress) progress.style.display = 'none';
            }
        },

        stop: function() {
            this.pause();
            this.frames     = [];
            this.currentIdx = 0;
            this._lastSyncedDate = null;
            this._hideDateLabel();
            this._updateUI('idle');
            const text = document.getElementById('anim-progress-text');
            if (text) text.textContent = '';
            _patchURLParam('dt', null);
            if (window.currentForecastData && typeof sitesArrayToGeoJSON === 'function' && typeof updateMapMarkers === 'function') {
                try { updateMapMarkers(sitesArrayToGeoJSON(window.currentForecastData)); } catch(e) {}
            }
        }
    };

    function createControlPanel(containerId = 'geotiff-controls-container') {
        console.log('Creating GeoTIFF control panel...');
        
        let container = document.getElementById(containerId);
        

        if (!container) {
            console.log('Container not found by ID, trying fallbacks...');
            
            const mapControls = document.querySelector('#map-controls-overlay .controls-body');
            if (mapControls) {
                container = document.createElement('div');
                container.id = containerId;
                mapControls.appendChild(container);
                console.log('Created container inside map controls panel');
            } else {
                console.warn('Could not find suitable container for GeoTIFF controls');
                return false;
            }
        }
        
        console.log('GeoTIFF controls container found:', container);

        // utc
        const now = new Date();
        const utcDateStr = now.toISOString().split('T')[0]; // date
        const utcTimeStr = now.toISOString().split('T')[1].substring(0, 5); // time

        container.innerHTML = `
            <div class="control-section geotiff-control-section">
                <h4><i class="bi bi-layers"></i> Layers</h4>
                <div class="geotiff-meta-info">
                    <span><i class="bi bi-calendar3"></i> ${utcDateStr} ${utcTimeStr} UTC</span>
                    <span><i class="bi bi-database"></i> Source: NASA GMAO</span>
                </div>
                
                <div class="control-group">
                    <label for="geotiff-layer-select">Layer:</label>
                    <select id="geotiff-layer-select" class="control-select">
                        <option value="">-- Select Layer --</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label for="geotiff-colormap-select">Colormap:</label>
                    <select id="geotiff-colormap-select" class="control-select">
                        <option value="">── Pollutant Default ──</option>
                        <option value="aqi">AQI (Green → Red)</option>
                        <option value="viridis">Viridis</option>
                        <option value="plasma">Plasma</option>
                        <option value="magma">Magma</option>
                        <option value="inferno">Inferno</option>
                        <option value="turbo">Turbo</option>
                        <option value="coolwarm">Cool–Warm</option>
                    </select>
                </div>

                <div class="control-group">
                    <label class="control-label">
                        <input type="checkbox" id="geotiff-visibility" checked>
                        <span>Show Raster Layer</span>
                    </label>
                </div>
                
                <div class="control-group">
                    <label class="control-label">
                        <input type="checkbox" id="geotiff-legend-visibility" checked>
                        <span>Show Legend</span>
                    </label>
                </div>
                
                <div class="control-group">
                    <label for="geotiff-opacity">Opacity:</label>
                    <input type="range" id="geotiff-opacity" min="0" max="1" step="0.1" value="${state.layerOpacity}" class="control-range">
                    <span id="geotiff-opacity-value" class="range-value">${state.layerOpacity}</span>
                </div>
                
                <div class="control-group">
                    <button id="geotiff-remove-layer" class="control-btn">
                        <i class="bi bi-trash"></i> Remove Layer
                    </button>
                </div>
            </div>
        `;

        console.log('GeoTIFF control panel HTML inserted');
        
        // populate
        populateLayerDropdown();
        
        // bind
        bindControlEvents();
        
        console.log('GeoTIFF control panel created successfully');
        return true;
    }

    // dropdown
    async function populateLayerDropdown() {
        const select = document.getElementById('geotiff-layer-select');
        if (!select) {
            console.warn('GeoTIFF layer select dropdown not found');
            return;
        }
        
        console.log('Populating GeoTIFF layer dropdown...');

        // discover
        if (state.availableLayers.length === 0) {
            await discoverAvailableLayers();
        }

        // clear
        while (select.options.length > 1) {
            select.remove(1);
        }

        // add
        state.availableLayers.forEach(layer => {
            const option = document.createElement('option');
            option.value = layer.path;
            option.textContent = layer.name;
            option.dataset.type = layer.type;
            option.dataset.pollutant = layer.pollutant;
            option.dataset.unit = layer.unit || POLLUTANT_UNITS[layer.pollutant] || POLLUTANT_UNITS.default;
            select.appendChild(option);
        });
        
        console.log(`Added ${state.availableLayers.length} layers to dropdown`);
    }

    function bindControlEvents() {
        // select
        const layerSelect = document.getElementById('geotiff-layer-select');
        if (layerSelect) {
            layerSelect.addEventListener('change', async function() {
                const selectedOption = this.options[this.selectedIndex];
                const path = this.value;
                
                if (!path) {
                    removeCurrentLayer();
                    hideLegend();
                    return;
                }
                
                const type = selectedOption.dataset.type;
                const pollutant = selectedOption.dataset.pollutant;
                const unit = selectedOption.dataset.unit;
                const name = selectedOption.textContent;
                
                if (type === 'geotiff' || type === 'tiff') {
                    await loadGeoTIFF(path, { pollutant, name, unit });
                    // url
                    updateURLParams(path, window.currentMap ? {
                        lat: window.currentMap.getCenter().lat,
                        lng: window.currentMap.getCenter().lng,
                        zoom: window.currentMap.getZoom()
                    } : null);
                } else if (type === 'pmtiles') {
                    await loadPMTiles(path, { pollutant, name });
                    // url
                    updateURLParams(path, window.currentMap ? {
                        lat: window.currentMap.getCenter().lat,
                        lng: window.currentMap.getCenter().lng,
                        zoom: window.currentMap.getZoom()
                    } : null);
                }
            });
        }

        // colormap
        const colormapSelect = document.getElementById('geotiff-colormap-select');
        if (colormapSelect) {
            colormapSelect.value = state.activeColormap || '';
            colormapSelect.addEventListener('change', function() {
                setColormap(this.value || null);
            });
        }

        // visibility
        const visibilityCheckbox = document.getElementById('geotiff-visibility');
        if (visibilityCheckbox) {
            visibilityCheckbox.addEventListener('change', function() {
                if (this.checked && !state.isVisible) {
                    toggleLayerVisibility();
                } else if (!this.checked && state.isVisible) {
                    toggleLayerVisibility();
                }
            });
        }

        // legend
        const legendCheckbox = document.getElementById('geotiff-legend-visibility');
        if (legendCheckbox) {
            legendCheckbox.addEventListener('change', function() {
                if (this.checked !== state.legendVisible) {
                    toggleLegend();
                }
            });
        }

        // opacity
        const opacitySlider = document.getElementById('geotiff-opacity');
        const opacityValue = document.getElementById('geotiff-opacity-value');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', function() {
                const opacity = parseFloat(this.value);
                setLayerOpacity(opacity);
                if (opacityValue) {
                    opacityValue.textContent = opacity.toFixed(1);
                }
            });
        }

        // remove
        const removeBtn = document.getElementById('geotiff-remove-layer');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                removeCurrentLayer();
                hideLegend();
                
                // reset
                const select = document.getElementById('geotiff-layer-select');
                if (select) select.value = '';
                
                showNotification('Layer removed', 'info');
            });
        }
    }

    // persistence
    function getURLParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            r:   params.get('r'),
            lt:  params.get('lt'),
            lg:  params.get('lg'),
            z:   params.get('z'),
            cm:  params.get('cm'),   // colormap id ('' = default)
            bm:  params.get('bm'),   // basemap id
            op:  params.get('op'),   // opacity 0-1
            vis: params.get('vis'),  // layer visibility '0'|'1'
            leg: params.get('leg'),  // legend visibility '0'|'1'
            dt:  params.get('dt'),   // animation date YYYY-MM-DD
        };
    }

    function updateURLParams(tifPath, mapState, settings) {
        const params = new URLSearchParams(window.location.search);

        if (tifPath) {
            const m = tifPath.match(/geos_cf_([A-Z0-9]+)_RH35_(\d{4})(\d{2})(\d{2})/) ||
                      tifPath.match(/geos_cf_([A-Z0-9]+)_(\d{4})(\d{2})(\d{2})/);
            if (m) {
                const pollutant = m[1].toLowerCase();
                const yy = m[2].slice(2);
                params.set('r', `${pollutant}_${yy}${m[3]}${m[4]}`);
            } else {
                params.set('r', tifPath);
            }
        }

        if (mapState) {
            if (mapState.lat  !== undefined) params.set('lt', mapState.lat.toFixed(4));
            if (mapState.lng  !== undefined) params.set('lg', mapState.lng.toFixed(4));
            if (mapState.zoom !== undefined) params.set('z',  mapState.zoom);
        }

        // settings snapshot (always pull from live state when not supplied)
        const s = settings || {};
        const cm = 'cm' in s ? s.cm : (state.activeColormap || '');
        const bm = 'bm' in s ? s.bm : (state.activeBasemap  || 'satellite');
        const op = 'op' in s ? s.op : state.layerOpacity;
        const vis = 'vis' in s ? s.vis : (state.isVisible     ? '1' : '0');
        const leg = 'leg' in s ? s.leg : (state.legendVisible ? '1' : '0');

        if (cm)  params.set('cm',  cm);  else params.delete('cm');
        params.set('bm',  bm);
        params.set('op',  parseFloat(op).toFixed(2));
        params.set('vis', vis);
        params.set('leg', leg);

        const newURL = window.location.pathname + '?' + params.toString();
        window.history.replaceState({ path: newURL }, '', newURL);
    }

    // Persist a single setting key without touching others
    function _patchURLParam(key, value) {
        const params = new URLSearchParams(window.location.search);
        if (value === null || value === undefined) params.delete(key);
        else params.set(key, value);
        const newURL = window.location.pathname + '?' + params.toString();
        window.history.replaceState({ path: newURL }, '', newURL);
    }

    function restoreMapState(map) {
        const params = getURLParams();
        
        if (params.lt && params.lg && params.z) {
            const lat = parseFloat(params.lt);
            const lng = parseFloat(params.lg);
            const zoom = parseInt(params.z);
            
            if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
                map.setView([lat, lng], zoom);
                console.log(`Restored map state: lat=${lat}, lng=${lng}, zoom=${zoom}`);
                return;
            }
        }

        // Default view when no URL params
        map.setView([0.0104, -9.3164], 3);
    }


    // Restore colormap / basemap / opacity / visibility / legend from URL
    function restoreSettings() {
        const p = getURLParams();

        // ── Opacity ───────────────────────────────────────────────────────────
        if (p.op !== null) {
            const op = parseFloat(p.op);
            if (!isNaN(op)) {
                state.layerOpacity = Math.max(0, Math.min(1, op));
                const sl = document.getElementById('geotiff-floating-opacity');
                const vl = document.getElementById('geotiff-floating-opacity-val');
                if (sl) sl.value = state.layerOpacity;
                if (vl) vl.textContent = state.layerOpacity.toFixed(2);
            }
        }

        // ── Colormap ──────────────────────────────────────────────────────────
        if (p.cm !== null) {
            setColormap(p.cm || null);
        }

        // ── Visibility ────────────────────────────────────────────────────────
        if (p.vis === '0' && state.isVisible) {
            toggleLayerVisibility();
            const cb = document.getElementById('fp-visibility');
            if (cb) cb.checked = false;
        }

        // ── Legend ────────────────────────────────────────────────────────────
        if (p.leg === '0' && state.legendVisible) {
            toggleLegend();
            const cb = document.getElementById('fp-legend-visibility');
            if (cb) cb.checked = false;
        }

        // ── Basemap ───────────────────────────────────────────────────────────
        if (p.bm) {
            state.activeBasemap = p.bm;
            const def = BASEMAPS[p.bm];
            const map = window.currentMap;
            if (def && map) {
                if (window.currentTileLayer) map.removeLayer(window.currentTileLayer);
                if (def.url) window.currentTileLayer = L.tileLayer(def.url, def.opts).addTo(map);
                else window.currentTileLayer = null;
            }
            // Sync panel cards 
            document.querySelectorAll('.bm-card').forEach(c => {
                c.classList.toggle('active', c.dataset.id === p.bm);
            });
        }
    }

    function selectDefaultLayer(pollutant) {
        const todayUTC = new Date().toISOString().split('T')[0]; // date
        const pool = state.availableLayers.filter(l => l.pollutant === pollutant);

        if (pool.length === 0) return null;

        // 1. Today
        const todayLayer = pool.find(l => !l.test && l.date === todayUTC);
        if (todayLayer) return todayLayer;

        // recent
        const nonTest = pool.filter(l => !l.test && l.date).sort((a, b) => b.date.localeCompare(a.date));
        if (nonTest.length > 0) return nonTest[0];

        // 3. Fallback
        const sorted = pool.filter(l => l.date).sort((a, b) => b.date.localeCompare(a.date));
        return sorted.length > 0 ? sorted[0] : pool[0];
    }

    // filter
    function pollutantForFilter(filterValue) {
        if (!filterValue) return null;
        const v = filterValue.toLowerCase();
        if (v === 'dos_missions') return 'pm25';
        if (v === 'pandora')      return 'no2';
        return null;
    }

    // autoload
    async function loadDefaultForFilter(filterValue) {
        const pollutant = pollutantForFilter(filterValue);
        if (!pollutant) return;

        const layer = selectDefaultLayer(pollutant);
        if (!layer) {
            console.log(`No ${pollutant} layer available for filter "${filterValue}"`);
            return;
        }

        const todayUTC = new Date().toISOString().split('T')[0];
        const label = layer.date === todayUTC ? "today's" : `most-recent (${layer.date})`;
        console.log(`Auto-loading ${label} ${pollutant.toUpperCase()} layer: ${layer.name}`);

        await loadGeoTIFF(layer.path, { pollutant: layer.pollutant, name: layer.name, unit: layer.unit });

        // sync
        ['geotiff-layer-select', 'geotiff-floating-select'].forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            for (let i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value === layer.path) {
                    sel.selectedIndex = i;
                    break;
                }
            }
        });
    }

    // init
    async function init(options = {}) {
        const {
            autoCreateControls = true,
            controlsContainer = null
        } = options;

        console.log('Initializing GeoTIFF Manager...');
        
        // reset
        state.currentLayer = null;
        state.currentLayerName = null;
        state.georaster = null;
        state.isLoading = false;
        state.isVisible = true;
        state.legendVisible = true;
        state.allAddedLayers = [];
        
        // register
        registerProjections();

        // discover
        await discoverAvailableLayers();
        console.log(`Found ${state.availableLayers.length} available layers`);
        
        if (window.currentMap) {
            let redrawTimeout = null;
            const debouncedRedraw = function() {
                if (redrawTimeout) clearTimeout(redrawTimeout);
                redrawTimeout = setTimeout(function() {
                    if (state.currentLayer) {
                        if (typeof state.currentLayer.redraw === 'function') {
                            state.currentLayer.redraw();
                        }
                        if (window.currentMap && typeof window.currentMap.invalidateSize === 'function') {
                            window.currentMap.invalidateSize({ pan: false });
                        }
                    }
                }, 100);
            };
            
            window.currentMap.on('moveend', debouncedRedraw);
            window.currentMap.on('zoomend', debouncedRedraw);
            window.currentMap.on('resize', debouncedRedraw);
        }

        if (autoCreateControls) {

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    createControlPanel(controlsContainer);
                });
            } else {
                const result = createControlPanel(controlsContainer);
                if (!result) {
                    // retry
                    console.log('Retrying control panel creation in 500ms...');
                    setTimeout(() => createControlPanel(controlsContainer), 500);
                }
            }
        }


        injectStyles();
        

        createFloatingButton();

        console.log('GeoTIFF Manager initialized');

        // restore
        if (window.currentMap) {
            restoreMapState(window.currentMap);
            restoreSettings();   // colormap, basemap, opacity, visibility, legend

            // debounce map-move → URL
            let urlUpdateTimeout = null;
            const updateURLOnMapChange = () => {
                if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
                urlUpdateTimeout = setTimeout(() => {
                    updateURLParams(
                        state.currentLayer ? (state.currentLayer.path || state.currentLayerName) : null,
                        {
                            lat:  window.currentMap.getCenter().lat,
                            lng:  window.currentMap.getCenter().lng,
                            zoom: window.currentMap.getZoom()
                        }
                    );
                }, 300);
            };

            window.currentMap.on('moveend', updateURLOnMapChange);
            window.currentMap.on('zoomend', updateURLOnMapChange);
        }

        // url
        const urlParams = getURLParams();
        if (window.currentMap && urlParams.r) {
            console.log('Loading TIF from URL parameters:', urlParams.r);
            setTimeout(async () => {
                const rm = urlParams.r.match(/^([a-z0-9]+)_(\d{2})(\d{2})(\d{2})$/);
                const fullDate = rm ? `20${rm[2]}${rm[3]}${rm[4]}` : null;
                // find
                const layer = fullDate
                    ? state.availableLayers.find(l => l.path.includes(fullDate))
                    : state.availableLayers.find(l => l.path === urlParams.r);
                if (layer) {
                    // select
                    const select = document.getElementById('geotiff-layer-select');
                    if (select) {
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].value === layer.path) {
                                select.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    // load
                    await loadGeoTIFF(layer.path, { 
                        pollutant: layer.pollutant, 
                        name: layer.name, 
                        unit: layer.unit 
                    });
                } else {
                    console.log('TIF from URL not found in available layers, loading first layer');
                    // fallback
                    if (state.availableLayers.length > 0) {
                        const firstLayer = state.availableLayers[0];
                        await loadGeoTIFF(firstLayer.path, { 
                            pollutant: firstLayer.pollutant, 
                            name: firstLayer.name, 
                            unit: firstLayer.unit 
                        });
                    }
                }
            }, 500);
        } else if (window.currentMap && state.availableLayers.length > 0) {
            // default
            console.log('No TIF in URL, auto-loading first discovered layer...');
            setTimeout(async () => {
                const firstLayer = state.availableLayers[0];
                await loadGeoTIFF(firstLayer.path, { 
                    pollutant: firstLayer.pollutant, 
                    name: firstLayer.name, 
                    unit: firstLayer.unit 
                });
            }, 500);
        }
        
        if (CONFIG.loadDefaultOnInit && window.currentMap) {
            console.log('Auto-loading default layer based on active filter...');
            setTimeout(async () => {
                // filter
                const filterEl = document.getElementById('species-filter');
                const filterValue = filterEl ? filterEl.value : 'dos_missions';
                await loadDefaultForFilter(filterValue);

                // listener
                if (filterEl && !filterEl._geotiffListenerAttached) {
                    filterEl._geotiffListenerAttached = true;
                    filterEl.addEventListener('change', function() {
                        loadDefaultForFilter(this.value);
                    });
                }
            }, 500);
        }
        
        return {
            availableLayers: state.availableLayers
        };
    }
    
    // floating
    function createFloatingButton() {
        if (!document.body.classList.contains('home-page')) return;
        if (document.getElementById('geotiff-quick-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'geotiff-quick-btn';
        btn.className = 'geotiff-quick-btn';
        btn.title = 'Map Layers';
        btn.innerHTML = '<i class="bi bi-layers"></i>';

        btn.addEventListener('click', () => {
            let panel = document.getElementById('geotiff-floating-panel');
            if (panel) {
                panel.style.display = 'flex';
                btn.style.display = 'none';
            } else {
                createFloatingPanel();
                btn.style.display = 'none';
            }
        });

        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.parentElement.appendChild(btn);
        } else {
            document.body.appendChild(btn);
        }
    }
    

    function createFloatingPanel() {
        const panel = document.createElement('div');
        panel.id = 'geotiff-floating-panel';
        panel.className = 'geotiff-floating-panel';

        let layerOptions = '<option value="">── Select Layer ──</option>';
        state.availableLayers.forEach(layer => {
            layerOptions += `<option value="${layer.path}" data-type="${layer.type}" data-pollutant="${layer.pollutant}" data-unit="${layer.unit || ''}">${layer.name}</option>`;
        });

        const colormaps = [
            { id: '', name: 'Pollutant Default', gradient: 'linear-gradient(to right,#440154,#3b5289,#21908c,#5dc962,#fde725)' },
            { id: 'aqi', name: 'AQI', gradient: 'linear-gradient(to right,#00e400,#ffff00,#ff7e00,#ff0000,#8f3f97,#7e0023)' },
            { id: 'viridis', name: 'Viridis', gradient: 'linear-gradient(to right,#440154,#31688e,#21908c,#35b779,#fde725)' },
            { id: 'plasma', name: 'Plasma', gradient: 'linear-gradient(to right,#0d0887,#b12a90,#e16462,#fca636,#f0f921)' },
            { id: 'magma', name: 'Magma', gradient: 'linear-gradient(to right,#000004,#4f127b,#b5367a,#fc8961,#fcfdbf)' },
            { id: 'inferno', name: 'Inferno', gradient: 'linear-gradient(to right,#000004,#550f6d,#ba3655,#f98c09,#fcffa4)' },
            { id: 'turbo', name: 'Turbo', gradient: 'linear-gradient(to right,#30123b,#3261d3,#1ecbb7,#a7e444,#fb9a25,#7a0403)' },
            { id: 'coolwarm', name: 'Cool–Warm', gradient: 'linear-gradient(to right,#3b4cc0,#a9c1fe,#dddddd,#fdb2a1,#b40426)' },
        ];

        const basemaps = [
            { id: 'satellite', name: 'Satellite',     abbr: 'SAT' },
            { id: 'voyager',   name: 'Streets',       abbr: 'STR' },
            { id: 'positron',  name: 'Light Gray',    abbr: 'LGT' },
            { id: 'dark',      name: 'Dark Gray',     abbr: 'DRK' },
            { id: 'topo',      name: 'Topographic',   abbr: 'TOP' },
            { id: 'osm',       name: 'OpenStreetMap', abbr: 'OSM' },
            { id: 'none',      name: 'No Basemap',    abbr: 'OFF' },
        ];

        const colormapHTML = colormaps.map(cm => `
            <div class="cm-swatch fp-row ${cm.id === (state.activeColormap || '') ? 'active' : ''}" data-id="${cm.id}">
                <div class="cm-bar" style="background:${cm.gradient}"></div>
                <span class="fp-row-title" style="flex:1;padding-left:10px;font-size:13px;">${cm.name}</span>
                <span class="cm-check fp-row-value">${cm.id === (state.activeColormap || '') ? '\u2713' : ''}</span>
            </div>`).join('');

        const _activeBm = state.activeBasemap || 'satellite';
        const basemapHTML = basemaps.map((bm) => `
            <div class="bm-card fp-row ${bm.id === _activeBm ? 'active' : ''}" data-id="${bm.id}">
                <span class="bm-abbr">${bm.abbr}</span>
                <span class="fp-row-title" style="flex:1;padding-left:10px;font-size:13px;">${bm.name}</span>
                <span class="bm-check fp-row-value">${bm.id === _activeBm ? '\u2713' : ''}</span>
            </div>`).join('');
        
        panel.innerHTML = `
            <div class="fp-header">
                <span class="fp-header-title">Map Layers</span>
                <button class="fp-close" id="fp-close-btn" title="Close">&times;</button>
            </div>
            <div class="fp-tabs">
                <button class="fp-tab active" data-tab="layers">Layers</button>
                <button class="fp-tab" data-tab="colors">Colors</button>
                <button class="fp-tab" data-tab="animate">Animate</button>
                <button class="fp-tab" data-tab="basemap">Basemap</button>
            </div>
            <div class="fp-body">

                <!-- LAYERS -->
                <div class="fp-section active" id="fp-tab-layers">

                    <p class="fp-group-label">DATA LAYER</p>
                    <div class="fp-card">
                        <div class="fp-row">
                            <div class="fp-row-text">
                                <span class="fp-row-title">Layer</span>
                            </div>
                        </div>
                        <div class="fp-row fp-row-select">
                            <select id="geotiff-floating-select" class="fp-select">${layerOptions}</select>
                        </div>
                    </div>

                    <p class="fp-group-label">DISPLAY</p>
                    <div class="fp-card">
                        <div class="fp-row">
                            <div class="fp-row-text">
                                <span class="fp-row-title">Show Layer</span>
                            </div>
                            <label class="fp-ios-toggle">
                                <input type="checkbox" id="fp-visibility" checked>
                                <span class="fp-ios-track"></span>
                            </label>
                        </div>
                        <div class="fp-row">
                            <div class="fp-row-text">
                                <span class="fp-row-title">Show Legend</span>
                            </div>
                            <label class="fp-ios-toggle">
                                <input type="checkbox" id="fp-legend-visibility" checked>
                                <span class="fp-ios-track"></span>
                            </label>
                        </div>
                        <div class="fp-row">
                            <div class="fp-row-text">
                                <span class="fp-row-title">Opacity</span>
                                <span class="fp-row-sub">Layer transparency</span>
                            </div>
                            <span id="geotiff-floating-opacity-val" class="fp-row-badge">${state.layerOpacity}</span>
                        </div>
                        <div class="fp-row fp-row-slider">
                            <input type="range" id="geotiff-floating-opacity" class="fp-slider" min="0" max="1" step="0.05" value="${state.layerOpacity}">
                        </div>
                    </div>

                    <p class="fp-group-label">SOURCE</p>
                    <div class="fp-card">
                        <div class="fp-row">
                            <div class="fp-row-text">
                                <span class="fp-row-title">NASA GEOS-CF</span>
                                <span class="fp-row-sub">Global Modeling and Assimilation Office</span>
                            </div>
                        </div>
                        <div class="fp-row">
                            <div class="fp-row-text">
                                <span class="fp-row-title">Coverage</span>
                                <span class="fp-row-sub">Global &middot; Daily</span>
                            </div>
                            <span class="fp-row-value">&minus;3 to +4 days</span>
                        </div>
                    </div>

                    <button id="geotiff-floating-remove" class="fp-btn-danger">Remove Layer</button>
                </div>

                <!-- COLORS -->
                <div class="fp-section" id="fp-tab-colors">
                    <p class="fp-group-label">COLORMAP</p>
                    <div class="fp-card" id="fp-cm-grid">${colormapHTML}</div>
                    <p class="fp-group-label">QUICK SELECT</p>
                    <div class="fp-card">
                        <div class="fp-row fp-row-select">
                            <select id="geotiff-floating-colormap" class="fp-select">
                                ${colormaps.map(cm => `<option value="${cm.id}">${cm.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- ANIMATE -->
                <div class="fp-section" id="fp-tab-animate">
                    <p class="fp-group-label">TIME SERIES</p>
                    <div class="fp-card">
                        <div class="fp-row">
                            <div class="fp-row-text">
                                <span class="fp-row-title">GEOS-CF Forecast</span>
                                <span class="fp-row-sub">GEOS-CF Forecast</span>
                            </div>
                            <span id="anim-date-label" class="fp-row-badge"></span>
                        </div>
                    </div>
                    <div id="anim-progress" style="display:none; margin-bottom:12px;">
                        <div class="anim-progress-track"><div id="anim-progress-bar" class="anim-progress-bar"></div></div>
                        <span id="anim-progress-text" class="anim-progress-text"></span>
                    </div>
                    <button id="anim-load-btn" class="fp-btn-primary">Animate</button>
                    <div id="anim-controls" style="display:none; flex-direction:column; gap:14px; margin-top:16px;">
                        <div class="fp-card" style="padding:4px 4px;">
                            <div class="anim-transport">
                                <button id="anim-prev-btn" class="anim-btn" title="Step back">&#9664;&#9664;</button>
                                <button id="anim-play-btn" class="anim-btn anim-btn-main" title="Play / Pause">&#9654;</button>
                                <button id="anim-next-btn" class="anim-btn" title="Step forward">&#9654;&#9654;</button>
                                <button id="anim-stop-btn" class="anim-btn anim-btn-stop" title="Stop">&#9632;</button>
                            </div>
                        </div>
                        <div class="fp-card" style="padding:12px 16px;">
                            <div class="fp-row">
                                <span class="fp-row-title" style="font-size:13px;">Scrub</span>
                            </div>
                            <input type="range" id="anim-scrubber" class="fp-slider" min="0" max="6" value="0" step="1">
                        </div>
                        <p class="fp-group-label">PLAYBACK SPEED</p>
                        <div class="fp-card">
                            <div class="fp-row">
                                <div class="fp-seg" id="anim-speed-group">
                                    <button class="fp-seg-btn" data-ms="1600">Slow</button>
                                    <button class="fp-seg-btn active" data-ms="800">Med</button>
                                    <button class="fp-seg-btn" data-ms="350">Fast</button>
                                    <button class="fp-seg-btn" data-ms="140">Max</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BASEMAP -->
                <div class="fp-section" id="fp-tab-basemap">
                    <p class="fp-group-label">BASE MAP</p>
                    <div class="fp-card" id="fp-bm-grid">${basemapHTML}</div>
                </div>

            </div>
        `;
        
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.parentElement.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }

        // ── Tab switching ──
        panel.querySelectorAll('.fp-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                panel.querySelectorAll('.fp-tab').forEach(t => t.classList.remove('active'));
                panel.querySelectorAll('.fp-section').forEach(s => s.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('fp-tab-' + this.dataset.tab).classList.add('active');
            });
        });

        // ── Close ──
        document.getElementById('fp-close-btn').addEventListener('click', () => {
            panel.style.display = 'none';
            const btn = document.getElementById('geotiff-quick-btn');
            if (btn) btn.style.display = 'flex';
        });

        // ── Layer select ──
        const floatingSelect = document.getElementById('geotiff-floating-select');
        floatingSelect.addEventListener('change', async function() {
            const selectedOption = this.options[this.selectedIndex];
            const path = this.value;
            if (!path) { removeCurrentLayer(); hideLegend(); return; }
            const type = selectedOption.dataset.type;
            const pollutant = selectedOption.dataset.pollutant;
            const unit = selectedOption.dataset.unit;
            const name = selectedOption.textContent;
            if (type === 'geotiff' || type === 'tiff') {
                await loadGeoTIFF(path, { pollutant, name, unit });
            } else if (type === 'pmtiles') {
                await loadPMTiles(path, { pollutant, name });
            }
        });

        // ── Opacity ──
        const floatingOpacity = document.getElementById('geotiff-floating-opacity');
        const floatingOpacityVal = document.getElementById('geotiff-floating-opacity-val');
        floatingOpacity.addEventListener('input', function() {
            const opacity = parseFloat(this.value);
            setLayerOpacity(opacity);
            floatingOpacityVal.textContent = opacity.toFixed(2);
            _patchURLParam('op', opacity.toFixed(2));
        });

        // ── Visibility toggles ──
        document.getElementById('fp-visibility').addEventListener('change', function() {
            if (this.checked !== state.isVisible) toggleLayerVisibility();
            _patchURLParam('vis', state.isVisible ? '1' : '0');
        });
        document.getElementById('fp-legend-visibility').addEventListener('change', function() {
            if (this.checked !== state.legendVisible) toggleLegend();
            _patchURLParam('leg', state.legendVisible ? '1' : '0');
        });

        // ── Remove ──
        document.getElementById('geotiff-floating-remove').addEventListener('click', function() {
            AnimationController.stop();
            removeCurrentLayer();
            hideLegend();
            floatingSelect.value = '';
        });

        // ── Colormap swatches ──
        panel.querySelectorAll('.cm-swatch').forEach(swatch => {
            swatch.addEventListener('click', function() {
                panel.querySelectorAll('.cm-swatch').forEach(s => s.classList.remove('active'));
                this.classList.add('active');
                const id = this.dataset.id;
                setColormap(id || null);
                const sel = document.getElementById('geotiff-floating-colormap');
                if (sel) sel.value = id;
                _patchURLParam('cm', id || null);
            });
        });

        // ── Colormap dropdown ──
        const floatingColormap = document.getElementById('geotiff-floating-colormap');
        if (floatingColormap) {
            floatingColormap.value = state.activeColormap || '';
            floatingColormap.addEventListener('change', function() {
                setColormap(this.value || null);
                panel.querySelectorAll('.cm-swatch').forEach(s => {
                    s.classList.toggle('active', s.dataset.id === (this.value || ''));
                });
                _patchURLParam('cm', this.value || null);
            });
        }

        // ── Basemap cards ──
        panel.querySelectorAll('.bm-card').forEach(card => {
            card.addEventListener('click', function() {
                panel.querySelectorAll('.bm-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const bmId = this.dataset.id;
                state.activeBasemap = bmId;
                const def = BASEMAPS[bmId];
                if (!def) return;
                const map = window.currentMap;
                if (!map) return;
                if (window.currentTileLayer) map.removeLayer(window.currentTileLayer);
                if (def.url) {
                    window.currentTileLayer = L.tileLayer(def.url, def.opts).addTo(map);
                } else {
                    window.currentTileLayer = null;
                }
                _patchURLParam('bm', bmId);
            });
        });

        // ── Animation controls ──
        document.getElementById('anim-load-btn').addEventListener('click', async function() {
            const pollutant = state.currentLayerName ?
                (state.currentLayerName.match(/no2|pm25|o3|co|so2/i) || ['pm25'])[0].toLowerCase() : 'pm25';
            const ok = await AnimationController.preload(pollutant);
            if (ok) showNotification(`Animation ready: ${AnimationController.frames.length} frames`, 'success');
        });
        document.getElementById('anim-play-btn').addEventListener('click', function() {
            if (AnimationController.playing) AnimationController.pause();
            else AnimationController.play();
        });
        document.getElementById('anim-prev-btn').addEventListener('click', () => AnimationController.step(-1));
        document.getElementById('anim-next-btn').addEventListener('click', () => AnimationController.step(1));
        document.getElementById('anim-stop-btn').addEventListener('click', () => AnimationController.stop());
        document.getElementById('anim-scrubber').addEventListener('input', function() {
            AnimationController.setFrame(parseInt(this.value));
        });
        panel.querySelectorAll('.fp-seg-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                panel.querySelectorAll('.fp-seg-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                AnimationController.setSpeed(parseInt(this.dataset.ms));
            });
        });
    }

    function injectStyles() {
        if (document.getElementById('geotiff-manager-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'geotiff-manager-styles';
        styles.textContent = `
            /* loading */
            .geotiff-loading {
                position: fixed;
                left: 50%;
                transform: translateX(-50%);
                bottom: 140px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                z-index: 999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                width: 100%;
                font-size: 10px;
            }
            
            .geotiff-loading-spinner {
                width: 12px;
                height: 12px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: #1da1f2;
                border-radius: 50%;
                animation: geotiff-spin 1s linear infinite;
            }
            
            .geotiff-loading-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
                text-align: center;
            }
            
            .geotiff-loading-source {
                font-size: 9px;
                opacity: 0.7;
                margin-left: 8px;
                white-space: nowrap;
            }
            
            @keyframes geotiff-spin {
                to { transform: rotate(360deg); }
            }
            
            /* legend */
            .geotiff-legend {
                position: fixed;
                left: 50%;
                transform: translateX(-50%);
                bottom: 140px;
                background: transparent;
                border-radius: 0;
                padding: 0;
                box-shadow: none;
                z-index: 999;
                max-width: 100vw;
                display: none !important;
                width: 100%;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            }
            
            /* guard */
            body.home-page .geotiff-legend {
                display: block !important;
            }
            
            /* wrapper */
            .aqi-legend-wrapper {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: stretch;
                gap: 0;
                padding: 0;
                background: transparent;
                width: 100%;
            }
            
            /* categories */
            .aqi-category {
                flex: 1;
                min-width: 60px;
                max-width: 150px;
                padding: 6px 8px;
                font-size: 11px;
                font-weight: 600;
                color: white;
                text-align: center;
                border: none;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .aqi-category.good {
                background-color: #00E400;
                color: #333;
            }
            
            .aqi-category.moderate {
                background-color: #FFFF00;
                color: #333;
            }
            
            .aqi-category.usg {
                background-color: #FF7E00;
                color: white;
            }
            
            .aqi-category.unhealthy {
                background-color: #FF0000;
                color: white;
            }
            
            .aqi-category.vunhealthy {
                background-color: #8F3F97;
                color: white;
            }
            
            .aqi-category.hazardous {
                background-color: #7E0023;
                color: white;
            }
            
            /* footer */
            .aqi-legend-footer {
                width: 100%;
                background: rgba(0, 0, 0, 0.75);
                color: rgba(255,255,255,0.85);
                font-size: 10px;
                padding: 5px 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                flex-wrap: wrap;
                letter-spacing: 0.2px;
            }
            .legend-footer-item {
                white-space: nowrap;
            }
            .legend-footer-item strong {
                color: #fff;
                font-weight: 600;
                margin-right: 3px;
            }
            .legend-footer-sep {
                color: rgba(255,255,255,0.35);
                font-size: 11px;
            }
            .legend-meta {
                color: rgba(255,255,255,0.65);
                font-size: 9px;
                margin-left: 4px;
            }
            .legend-footer-date-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .legend-layers-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border: 1px solid rgba(255,255,255,0.25);
                border-radius: 4px;
                background: rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.85);
                font-size: 11px;
                cursor: pointer;
                padding: 0;
                transition: background 0.15s, border-color 0.15s;
                vertical-align: middle;
            }
            .legend-layers-btn:hover {
                background: rgba(255,255,255,0.22);
                border-color: rgba(255,255,255,0.5);
                color: #fff;
            }

            
            /* section */
            .geotiff-control-section {
                border-top: 1px solid rgba(255, 255, 255, 0.15);
                padding-top: 16px;
                margin-top: 16px;
            }
            
            .geotiff-control-section h4 {
                color: #fff;
                font-size: 14px;
                margin-bottom: 12px;
                font-weight: 600;
                letter-spacing: 0.3px;
                display: flex;
                align-items: center;
            }
            
            .geotiff-control-section h4 i {
                margin-right: 8px;
                font-size: 16px;
                opacity: 0.9;
            }
            
            /* meta */
            .geotiff-meta-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: 14px;
                padding: 8px 10px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .geotiff-meta-info span {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .geotiff-meta-info i {
                font-size: 12px;
                opacity: 0.8;
            }
            
            /* inputs */
            .geotiff-control-section .control-select {
                width: 100%;
                padding: 10px 12px;
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.25);
                background: rgba(0, 0, 0, 0.4);
                color: #fff;
                font-size: 13px;
                margin-top: 6px;
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .geotiff-control-section .control-select:hover {
                border-color: rgba(255, 255, 255, 0.4);
                background: rgba(0, 0, 0, 0.5);
            }
            
            .geotiff-control-section .control-select:focus {
                outline: none;
                border-color: rgba(29, 161, 242, 0.8);
                background: rgba(0, 0, 0, 0.5);
                box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.1);
            }
            
            .geotiff-control-section .control-select option {
                background: #1a1a2e;
                color: #fff;
            }
            
            .geotiff-control-section .control-range {
                width: 100%;
                margin-top: 6px;
                cursor: pointer;
            }
            
            .geotiff-control-section .control-range::-webkit-slider-thumb {
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #1da1f2;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .geotiff-control-section .control-range::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #1da1f2;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .geotiff-control-section .control-label {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #fff;
                font-size: 13px;
                cursor: pointer;
                margin: 10px 0;
                user-select: none;
                transition: opacity 0.2s;
            }
            
            .geotiff-control-section .control-label:hover {
                opacity: 0.9;
            }
            
            .geotiff-control-section .control-label input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: #1da1f2;
            }
            
            .geotiff-control-section .control-btn {
                width: 100%;
                padding: 10px 14px;
                border: none;
                border-radius: 6px;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
                letter-spacing: 0.3px;
            }
            
            .geotiff-control-section .control-btn:hover {
                background: linear-gradient(135deg, rgba(239, 68, 68, 1), rgba(220, 38, 38, 1));
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
            
            .geotiff-control-section .control-btn:active {
                transform: translateY(0);
            }
            
            .geotiff-control-section .range-value {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                margin-left: 8px;
                font-weight: 500;
            }
            
            .geotiff-control-section .control-group {
                margin-bottom: 14px;
            }
            
            .geotiff-control-section .control-group > label:first-child {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                display: block;
                margin-bottom: 6px;
                font-weight: 500;
                letter-spacing: 0.2px;
            }
            
            /* ── Toggle button (matches map-controls-toggle-btn) ── */
            .geotiff-quick-btn {
                position: absolute;
                top: 181px;
                left: 8px;
                width: 44px;
                height: 44px;
                background: rgba(30, 30, 30, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                padding: 0;
            }
            .geotiff-quick-btn:hover { background: rgba(40, 40, 40, 0.95); transform: scale(1.05); }

            /* ── Panel shell ── */
            .geotiff-floating-panel {
                position: absolute;
                top: 0; left: 0;
                width: 30%;
                min-width: 300px;
                max-width: 420px;
                height: 100%;
                background: #f5f6fa;
                z-index: 1001;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
                box-shadow: 4px 0 24px rgba(0,0,0,0.12);
                overflow: hidden;
                color: #1a1a2e;
            }

            /* header */
            .fp-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 18px 20px 16px;
                background: #fff;
                border-bottom: 1px solid #e5e7eb;
                flex-shrink: 0;
            }
            .fp-header-title {
                font-size: 18px;
                font-weight: 700;
                color: #1a1a2e;
                letter-spacing: -0.3px;
            }
            .fp-close {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: none;
                background: #e5e7eb;
                color: #6b7280;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
                transition: background 0.15s, color 0.15s;
                padding: 0;
            }
            .fp-close:hover { background: #d1d5db; color: #1a1a2e; }

            /* tabs */
            .fp-tabs {
                display: flex;
                background: #fff;
                border-bottom: 1px solid #e5e7eb;
                flex-shrink: 0;
            }
            .fp-tab {
                flex: 1;
                padding: 12px 4px 10px;
                border: none;
                border-bottom: 2px solid transparent;
                background: transparent;
                color: #9ca3af;
                font-family: inherit;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
            }
            .fp-tab:hover { color: #374151; }
            .fp-tab.active { color: #1e3a5f; border-bottom-color: #1e3a5f; }

            /* scrollable body */
            .fp-body {
                flex: 1;
                overflow-y: auto;
                padding: 16px 14px;
                scrollbar-width: thin;
                scrollbar-color: #d1d5db #f5f6fa;
            }
            .fp-body::-webkit-scrollbar { width: 4px; }
            .fp-body::-webkit-scrollbar-track { background: transparent; }
            .fp-body::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

            /* sections */
            .fp-section { display: none; flex-direction: column; }
            .fp-section.active { display: flex; }

            /* group label (like "DISPLAY", "APPEARANCE & THEME") */
            .fp-group-label {
                font-size: 11px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                margin: 16px 4px 6px;
                padding: 0;
            }
            .fp-group-label:first-child { margin-top: 0; }

            /* card (white grouped section) */
            .fp-card {
                background: #fff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }

            /* row inside card */
            .fp-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 13px 16px;
                border-bottom: 1px solid #f0f0f5;
                min-height: 52px;
            }
            .fp-row:last-child { border-bottom: none; }
            .fp-row-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
            }
            .fp-row-title {
                font-size: 15px;
                font-weight: 500;
                color: #1a1a2e;
                line-height: 1.3;
            }
            .fp-row-sub {
                font-size: 12px;
                color: #9ca3af;
                font-weight: 400;
                margin-top: 1px;
            }
            .fp-row-value {
                font-size: 13px;
                color: #9ca3af;
                font-weight: 500;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .fp-row-badge {
                background: #f0f0f5;
                color: #374151;
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .fp-row-select { padding: 8px 12px; min-height: auto; }
            .fp-row-slider { padding: 4px 16px 12px; min-height: auto; border-bottom: none; }

            /* iOS toggle */
            .fp-ios-toggle { cursor: pointer; flex-shrink: 0; }
            .fp-ios-toggle input { display: none; }
            .fp-ios-track {
                display: block;
                width: 51px;
                height: 31px;
                border-radius: 16px;
                background: #d1d5db;
                position: relative;
                transition: background 0.2s;
            }
            .fp-ios-track::after {
                content: '';
                position: absolute;
                width: 27px;
                height: 27px;
                border-radius: 50%;
                background: #fff;
                top: 2px;
                left: 2px;
                transition: transform 0.2s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .fp-ios-toggle input:checked + .fp-ios-track { background: #1e3a5f; }
            .fp-ios-toggle input:checked + .fp-ios-track::after { transform: translateX(20px); }

            /* select */
            .fp-select {
                width: 100%;
                padding: 9px 32px 9px 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #f5f6fa;
                color: #1a1a2e;
                font-family: inherit;
                font-size: 13px;
                cursor: pointer;
                transition: border-color 0.15s;
                appearance: none;
                -webkit-appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 10px center;
                background-color: #f5f6fa;
            }
            .fp-select:hover { border-color: #9ca3af; }
            .fp-select:focus { outline: 2px solid #1e3a5f; outline-offset: 0; border-color: #1e3a5f; }
            .fp-select option { background: #fff; color: #1a1a2e; }

            /* slider */
            .fp-slider {
                width: 100%;
                accent-color: #1e3a5f;
                cursor: pointer;
                height: 4px;
                margin-top: 4px;
            }

            /* segmented control (speed buttons) */
            .fp-seg {
                display: flex;
                flex: 1;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
                background: #f5f6fa;
            }
            .fp-seg-btn {
                flex: 1;
                padding: 8px 4px;
                border: none;
                border-right: 1px solid #e5e7eb;
                background: transparent;
                color: #6b7280;
                font-family: inherit;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.12s;
            }
            .fp-seg-btn:last-child { border-right: none; }
            .fp-seg-btn:hover { background: #e5e7eb; color: #374151; }
            .fp-seg-btn.active { background: #1e3a5f; color: #fff; }

            /* primary button */
            .fp-btn-primary {
                width: 100%;
                padding: 13px 16px;
                border: none;
                border-radius: 12px;
                background: #1e3a5f;
                color: #fff;
                font-family: inherit;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s;
                margin-top: 16px;
            }
            .fp-btn-primary:hover { background: #162d4a; }
            .fp-btn-primary:disabled { background: #d1d5db; cursor: default; }

            /* danger button */
            .fp-btn-danger {
                width: 100%;
                padding: 13px 16px;
                border: 1.5px solid #ef4444;
                border-radius: 12px;
                background: transparent;
                color: #ef4444;
                font-family: inherit;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                margin-top: 16px;
            }
            .fp-btn-danger:hover { background: #ef4444; color: #fff; }

            /* colormap rows */
            .cm-swatch { cursor: pointer; }
            .cm-swatch.active { background: #eef2ff; }
            .cm-swatch .cm-bar {
                width: 48px;
                height: 24px;
                border-radius: 4px;
                flex-shrink: 0;
            }
            .cm-swatch .cm-check { color: #1e3a5f; font-weight: 700; }

            /* basemap rows */
            .bm-card { cursor: pointer; }
            .bm-card.active { background: #eef2ff; }
            .bm-abbr {
                width: 40px;
                height: 28px;
                border-radius: 6px;
                background: #f0f0f5;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 0.5px;
                color: #6b7280;
                font-family: 'SF Mono', 'Courier New', monospace;
                flex-shrink: 0;
                border: 1px solid #e5e7eb;
            }
            .bm-card.active .bm-abbr { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
            .bm-card .bm-check { color: #1e3a5f; font-weight: 700; }

            /* animation controls */
            .anim-progress-track {
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                margin-bottom: 6px;
            }
            .anim-progress-bar {
                height: 100%;
                background: #1e3a5f;
                width: 0%;
                border-radius: 2px;
                transition: width 0.25s;
            }
            .anim-progress-text {
                font-size: 11px;
                color: #9ca3af;
                display: block;
                text-align: center;
                margin-bottom: 8px;
            }
            .anim-transport {
                display: flex;
                gap: 6px;
                padding: 8px;
            }
            .anim-btn {
                height: 42px;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                background: #f5f6fa;
                color: #374151;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 12px;
                transition: all 0.12s;
                font-family: inherit;
            }
            .anim-btn:hover { background: #e5e7eb; color: #1a1a2e; }
            .anim-btn-main {
                flex: 1;
                background: #1e3a5f;
                border-color: #1e3a5f;
                color: #fff;
                font-size: 16px;
                border-radius: 10px;
            }
            .anim-btn-main:hover { background: #162d4a; }
            .anim-btn-stop {
                background: #fff5f5;
                border-color: #fca5a5;
                color: #ef4444;
            }
            .anim-btn-stop:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
            .anim-scrubber { width: 100%; accent-color: #1e3a5f; cursor: pointer; }

            /* map date overlay */
            .map-anim-date {
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                padding: 6px 18px;
                border-radius: 20px;
                font-family: inherit;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 0.3px;
                z-index: 800;
                pointer-events: none;
                background: #1e3a5f;
                color: #fff;
                display: none;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            .map-anim-date.today    { background: #1e3a5f; }
            .map-anim-date.forecast { background: #ef4444; }
            .map-anim-date.past     { background: #6b7280; }


            /* mobile */
            @media (max-width: 768px) {
                .geotiff-legend {
                    bottom: 130px;
                }
                
                .geotiff-loading {
                    bottom: 130px;
                }
                
                .aqi-category {
                    min-width: 50px;
                    max-width: 100px;
                    padding: 5px 6px;
                    font-size: 10px;
                }
                
                .aqi-legend-footer {
                    font-size: 9px;
                    padding: 3px 6px;
                }
                
                .geotiff-loading-spinner {
                    width: 11px;
                    height: 11px;
                    border: 1.5px solid rgba(255, 255, 255, 0.3);
                }
                
                .geotiff-loading-text {
                    font-size: 9px;
                }
            }
            
            @media (max-width: 480px) {
                .geotiff-legend {
                    bottom: 125px;
                }
                
                .geotiff-loading {
                    bottom: 125px;
                }
                
                .aqi-category {
                    min-width: 40px;
                    max-width: 80px;
                    padding: 4px 4px;
                    font-size: 9px;
                }
                
                .aqi-legend-footer {
                    font-size: 8px;
                    padding: 2px 4px;
                }
                
                .geotiff-loading-spinner {
                    width: 10px;
                    height: 10px;
                    border: 1.5px solid rgba(255, 255, 255, 0.3);
                }
                
                .geotiff-loading-text {
                    font-size: 8px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    const GeoTIFFManager = {
        // init
        init,
        
        // loading
        loadGeoTIFF,
        loadPMTiles,
        discoverAvailableLayers,

        selectDefaultLayer,
        loadDefaultForFilter,
        
        // controls
        removeCurrentLayer,
        toggleLayerVisibility,
        setLayerOpacity,
        getCurrentLayerInfo,
        
        // Legend
        updateLegend,
        toggleLegend,
        hideLegend,
        
        // UI
        createControlPanel,
        populateLayerDropdown,
        
        // state
        getState: () => ({ ...state }),
        getConfig: () => ({ ...CONFIG }),
        
        // utils
        getColorScale,
        interpolateColor,
        setColormap,

        // animation
        animation: AnimationController
    };

    // export
    global.GeoTIFFManager = GeoTIFFManager;

})(typeof window !== 'undefined' ? window : this);
