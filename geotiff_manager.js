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
                { value: 0,    color: [68,  1,  84, 180] },   // purple
                { value: 2e-9, color: [59, 82, 139, 180] },   // background
                { value: 1e-8, color: [33,145, 140, 180] },   // urban
                { value: 5e-8, color: [94,201,  98, 180] },   // moderate
                { value: 1e-7, color: [253,231,  37, 180] },  // high
                { value: 3e-7, color: [253,231,  37, 180] }   // max
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

        allAddedLayers: []
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
        // unit
        // scale
        const isMolMol = unit && (unit.toLowerCase().includes('mol/mol') || unit.toLowerCase() === 'mol mol-1');
        if (isMolMol && (pollutant === 'no2' || pollutant === 'o3' || pollutant === 'co' || pollutant === 'so2')) {
            return CONFIG.colorScales.molmol;
        }
        const key = (pollutant || 'default').toLowerCase();
        return CONFIG.colorScales[key] || CONFIG.colorScales.default;
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
            const layerOptions = {
                georaster: georaster,
                opacity: opacity,
                resolution: 256,
                pane: 'geotiffPane',
                debugLevel: 0,
                pixelValuesToColorFn: function(values) {

                    if (values.length >= 3) {

                        const r = values[0];
                        const g = values[1];
                        const b = values[2];
                        const a = values.length >= 4 ? values[3] / 255 : 1;
                        
                        if ((r === null || r === undefined) || (g === null || g === undefined) || (b === null || b === undefined)) {
                            return null; 
                        }
                        
                        return `rgba(${r}, ${g}, ${b}, ${a})`;
                    } else {

                        const value = values[0];
                        

                        if (value === null || value === undefined || isNaN(value) || value === georaster.noDataValue) {
                            return null; 
                        }
                        
                        const color = interpolateColor(value, colorScale, minValue, maxValue);
                        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
                    }
                }
            };
            

            if (typeof proj4 !== 'undefined' && georaster.projection !== 4326 && georaster.projection !== '4326') {
                console.log('Adding proj4 to layer options (projection is not 4326)');
                layerOptions.proj4 = proj4;
            } else if (georaster.projection === 4326 || georaster.projection === '4326') {
                console.log('Skipping proj4 for EPSG:4326 data (native Leaflet projection)');
            }
            
            const layer = new GeoRasterLayer(layerOptions);

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
                <span>Data provenance: GEOS‑CF; NASA Pandora. Display date: ${displayDate}. Reported values correspond to global daily averages or site-specific hourly means as indicated. GEOS‑FP CNN outputs are presented as 3‑hour running averages. Interpret concentrations in the context of the pollutant units shown.</span>
            </div>
            </div>
        `;

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
                <h4><i class="bi bi-layers"></i> Raster Layers</h4>
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
            tif: params.get('tif'),
            lat: params.get('lat'),
            lng: params.get('lng'),
            zoom: params.get('zoom')
        };
    }

    function updateURLParams(tifPath, mapState) {
        const params = new URLSearchParams(window.location.search);
        
        if (tifPath) {
            params.set('tif', tifPath);
        }
        
        if (mapState) {
            if (mapState.lat !== undefined) params.set('lat', mapState.lat.toFixed(6));
            if (mapState.lng !== undefined) params.set('lng', mapState.lng.toFixed(6));
            if (mapState.zoom !== undefined) params.set('zoom', mapState.zoom);
        }
        
        const newURL = window.location.pathname + '?' + params.toString();
        window.history.replaceState({ path: newURL }, '', newURL);
    }

    function restoreMapState(map) {
        const params = getURLParams();
        
        if (params.lat && params.lng && params.zoom) {
            const lat = parseFloat(params.lat);
            const lng = parseFloat(params.lng);
            const zoom = parseInt(params.zoom);
            
            if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
                map.setView([lat, lng], zoom);
                console.log(`Restored map state: lat=${lat}, lng=${lng}, zoom=${zoom}`);
            }
        }
    }


    function selectDefaultLayer(pollutant) {
        const todayUTC = new Date().toISOString().split('T')[0]; // date
        const pool = state.availableLayers.filter(l => l.pollutant === pollutant);

        if (pool.length === 0) return null;

        // 1. Today, non-test
        const todayLayer = pool.find(l => !l.test && l.date === todayUTC);
        if (todayLayer) return todayLayer;

        // 2. Most-recent non-test 
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
            
            // debounce
            let urlUpdateTimeout = null;
            const updateURLOnMapChange = () => {
                if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
                urlUpdateTimeout = setTimeout(() => {
                    if (state.currentLayer) {
                        updateURLParams(state.currentLayer.path || state.currentLayerName, {
                            lat: window.currentMap.getCenter().lat,
                            lng: window.currentMap.getCenter().lng,
                            zoom: window.currentMap.getZoom()
                        });
                    }
                }, 300);
            };
            
            // update
            window.currentMap.on('moveend', updateURLOnMapChange);
            window.currentMap.on('zoomend', updateURLOnMapChange);
        }

        // url
        const urlParams = getURLParams();
        if (window.currentMap && urlParams.tif) {
            console.log('Loading TIF from URL parameters:', urlParams.tif);
            setTimeout(async () => {
                // find
                const layer = state.availableLayers.find(l => l.path === urlParams.tif);
                if (layer) {
                    // select
                    const select = document.getElementById('geotiff-layer-select');
                    if (select) {
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].value === urlParams.tif) {
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
        if (document.getElementById('geotiff-quick-btn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'geotiff-quick-btn';
        btn.className = 'geotiff-quick-btn';
        btn.title = 'Raster Layers';
        btn.innerHTML = '<i class="bi bi-layers-half"></i>';
        
        btn.addEventListener('click', () => {
            // toggle
            let panel = document.getElementById('geotiff-floating-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            } else {
                createFloatingPanel();
            }
        });
        
        // container
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
        
        let layerOptions = '<option value="">-- Select Layer --</option>';
        state.availableLayers.forEach(layer => {
            layerOptions += `<option value="${layer.path}" data-type="${layer.type}" data-pollutant="${layer.pollutant}" data-unit="${layer.unit || ''}">${layer.name}</option>`;
        });
        
        panel.innerHTML = `
            <div class="floating-panel-header">
                <span><i class="bi bi-layers-half"></i> Raster Layers</span>
                <button class="floating-panel-close" onclick="document.getElementById('geotiff-floating-panel').style.display='none'">×</button>
            </div>
            <div class="floating-panel-body">
                <select id="geotiff-floating-select" class="floating-select">
                    ${layerOptions}
                </select>
                <div class="floating-controls">
                    <label>
                        <span>Opacity:</span>
                        <input type="range" id="geotiff-floating-opacity" min="0" max="1" step="0.1" value="${state.layerOpacity}">
                        <span id="geotiff-floating-opacity-val">${state.layerOpacity}</span>
                    </label>
                </div>
                <button id="geotiff-floating-remove" class="floating-remove-btn">
                    <i class="bi bi-x-circle"></i> Remove Layer
                </button>
            </div>
        `;
        
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.parentElement.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }
        
        // events
        const floatingSelect = document.getElementById('geotiff-floating-select');
        floatingSelect.addEventListener('change', async function() {
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
            } else if (type === 'pmtiles') {
                await loadPMTiles(path, { pollutant, name });
            }
        });
        
        const floatingOpacity = document.getElementById('geotiff-floating-opacity');
        const floatingOpacityVal = document.getElementById('geotiff-floating-opacity-val');
        floatingOpacity.addEventListener('input', function() {
            const opacity = parseFloat(this.value);
            setLayerOpacity(opacity);
            floatingOpacityVal.textContent = opacity.toFixed(1);
        });
        
        const floatingRemove = document.getElementById('geotiff-floating-remove');
        floatingRemove.addEventListener('click', function() {
            removeCurrentLayer();
            hideLegend();
            floatingSelect.value = '';
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
                background: rgba(0, 0, 0, 0.8);
                color: white;
                font-size: 10px;
                padding: 4px 8px;
                text-align: center;
                font-weight: 500;
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
            
            /* button */
            .geotiff-quick-btn {
                position: absolute;
                top: 180px;
                left: 10px;
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: rgba(29, 161, 242, 0.9);
                border: none;
                color: #fff;
                font-size: 18px;
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
            }
            
            .geotiff-quick-btn:hover {
                background: rgba(29, 161, 242, 1);
                transform: scale(1.05);
            }
            
            /* panel */
            .geotiff-floating-panel {
                position: absolute;
                top: 230px;
                left: 10px;
                width: 280px;
                background: rgba(26, 26, 46, 0.95);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                z-index: 1001;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .floating-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(29, 161, 242, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                font-weight: 600;
                font-size: 14px;
            }
            
            .floating-panel-header i {
                margin-right: 8px;
            }
            
            .floating-panel-close {
                background: none;
                border: none;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                opacity: 0.7;
            }
            
            .floating-panel-close:hover {
                opacity: 1;
            }
            
            .floating-panel-body {
                padding: 15px;
            }
            
            .floating-select {
                width: 100%;
                padding: 10px;
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: rgba(0, 0, 0, 0.3);
                color: #fff;
                font-size: 13px;
                margin-bottom: 12px;
            }
            
            .floating-select option {
                background: #1a1a2e;
                color: #fff;
            }
            
            .floating-controls {
                margin-bottom: 12px;
            }
            
            .floating-controls label {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #9ca3af;
                font-size: 13px;
            }
            
            .floating-controls input[type="range"] {
                flex: 1;
            }
            
            .floating-remove-btn {
                width: 100%;
                padding: 10px;
                border: none;
                border-radius: 6px;
                background: rgba(239, 68, 68, 0.8);
                color: #fff;
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: background 0.2s;
            }
            
            .floating-remove-btn:hover {
                background: rgba(239, 68, 68, 1);
            }
            
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
        interpolateColor
    };

    // export
    global.GeoTIFFManager = GeoTIFFManager;

})(typeof window !== 'undefined' ? window : this);
