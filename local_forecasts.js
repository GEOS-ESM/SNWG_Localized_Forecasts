// LF-V1.1
if (!window.performanceUtils) {
window.performanceUtils = {
    requestCache: new Map(),
    
    // Debounce
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    cachedFetch: async function(url, options = {}, ttl = 300000) {
        const cacheKey = url;
        const cached = this.requestCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < ttl)) {
            return cached.data;
        }
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            this.requestCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            if (this.requestCache.size > 100) {
                const firstKey = this.requestCache.keys().next().value;
                this.requestCache.delete(firstKey);
            }
            
            return data;
        } catch (error) {
            if (cached) return cached.data;
            throw error;
        }
    },
    
    clearCache: function() {
        this.requestCache.clear();
    }
};
} // end performanceUtils guard

$(document).ready(function() {
    $('body').on('click', '.nl_wave_routing', function(e) {
        e.preventDefault(); 

        const page = $(this).attr('href');
        const $loadingDiv = $(".loading_div");
        const $forecastsContainer = $(".forecasts_container");

        showLoadingToast();
        $loadingDiv.addClass('show');

        $forecastsContainer.load("vues/" + page, function() {
            $forecastsContainer.fadeOut(10, function() {
                $(this).fadeIn(10).addClass("noussair_animations zoom_in");
            });
            
            if (page === 'home.html') {
                $('body').removeClass('about-page').addClass('home-page');
                $('body, html').css({
                    'overflow': 'hidden',
                    'height': '100vh'
                });
                
                setTimeout(() => {
                    if (window.currentMap) {
                        window.currentMap.invalidateSize();
                    }
                }, 100);
            } else if (page === 'about.html') {
                $('body').removeClass('home-page').addClass('about-page');
                $('body, html').css({
                    'overflow': 'auto',
                    'height': 'auto'
                });
            } else {
                $('body').removeClass('home-page').addClass('about-page');
                $('body, html').css({
                    'overflow': 'auto',
                    'height': 'auto'
                });
            }
            
            setTimeout(() => {
                $loadingDiv.removeClass('show');
                showToast('Page loaded successfully', 'success');
            }, 300);
        });
    });
});

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const container = document.querySelector('.toast-notifications');
    if (container) {
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

function showLoadingToast() {
    showToast('Loading data...', 'info');
}


// Leaflet

var deltaDegrees = 25;

function easing(t) {
    return t * (2 - t);
}


function pollutant_details(code, format = "full") {
    const pollutants = {
        no2:  { 
            name: "Nitrogen Dioxide", 
            abbr: "NO<sub>2</sub>", 
            id: 1,
            desc: `NO<sub>2</sub> is a gas emitted from burning fossil fuels, e.g., by vehicles or power plants (<a href="https://www.epa.gov/no2-pollution/basic-information-about-no2" target="_blank">click to learn more</a>).`
        },
        "1":  { 
            name: "Nitrogen Dioxide", 
            abbr: "NO<sub>2</sub>", 
            id: 1,
            desc: `NO<sub>2</sub> is a gas emitted from burning fossil fuels, e.g., by vehicles or power plants (<a href="https://www.epa.gov/no2-pollution/basic-information-about-no2" target="_blank">click to learn more</a>).`
        },
        so2:  { 
            name: "Sulfur Dioxide",   
            abbr: "SO<sub>2</sub>", 
            id: 2,
            desc: `SO<sub>2</sub> is a gas produced by volcanic eruptions and industrial processes (<a href="https://www.epa.gov/so2-pollution/sulfur-dioxide-basics" target="_blank">click to learn more</a>).`
        },
        "2":  { 
            name: "Sulfur Dioxide",   
            abbr: "SO<sub>2</sub>", 
            id: 2,
            desc: `SO<sub>2</sub> is a gas produced by volcanic eruptions and industrial processes (<a href="https://www.epa.gov/so2-pollution/sulfur-dioxide-basics" target="_blank">click to learn more</a>).`
        },
        pm25: { 
            name: "Particulate Matter", 
            abbr: "PM<sub>2.5</sub>", 
            id: 3,
            desc: `PM<sub>2.5</sub> is a mix of tiny particles such as dust, soot, dirt, and smoke (<a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics" target="_blank">click to learn more</a>).`
        },
        "3":  { 
            name: "Particulate Matter", 
            abbr: "PM<sub>2.5</sub>", 
            id: 3,
            desc: `PM<sub>2.5</sub> is a mix of tiny particles such as dust, soot, dirt, and smoke (<a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics" target="_blank">click to learn more</a>).`
        },
        o3:   { 
            name: "Ozone",            
            abbr: "O<sub>3</sub>", 
            id: 4,
            desc: `Ozone at ground-level is harmful, and forms from reactions of other pollutants (<a href="https://www.epa.gov/ozone-pollution/ground-level-ozone-basics" target="_blank">click to learn more</a>).`
        },
        "4":  { 
            name: "Ozone",            
            abbr: "O<sub>3</sub>", 
            id: 4,
            desc: `Ozone at ground-level is harmful, and forms from reactions of other pollutants (<a href="https://www.epa.gov/ozone-pollution/ground-level-ozone-basics" target="_blank">click to learn more</a>).`
        },
        overall: {
            name: "US Air Quality Index",
            abbr: "US AQI",
            id: 5,
            desc: `The US AQI is a composite index reflecting the air quality based on NO₂, PM₂.₅, and O₃ concentrations, following EPA standards (<a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank">click to learn more</a>).`
        },
        "5": {
            name: "US Air Quality Index",
            abbr: "US AQI",
            id: 5,
            desc: `The US AQI is a composite index reflecting the air quality based on NO₂, PM₂.₅, and O₃ concentrations, following EPA standards (<a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank">click to learn more</a>).`
        }
    };
    const p = pollutants[code?.toString().toLowerCase()];
    if (!p) {
        if (format === "both") return { name: "Unknown", abbr: "N/A", desc: "No description available." };
        if (format === "desc") return "No description available.";
        return "N/A";
    }
    if (format === "abbr") return p.abbr;
    if (format === "full") return `${p.name} (${p.abbr})`;
    if (format === "desc") return p.desc;
    if (format === "both") return { name: p.name, abbr: p.abbr, id: p.id, desc: p.desc };
    return "N/A";
}

function rewritePercentage(percentage) {
    var roundedPercentage = parseFloat(percentage).toFixed(2);
  
    var rewrittenPercentage = roundedPercentage.toString() + '%';
  
    return rewrittenPercentage;
  }

  function get_current_hour_forecasts(dataset) {
    

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    const currentHour = currentDate.getHours();
    const lastYearDateString = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()).toISOString().split('T')[0];
    const indices = {
        current: -1,
        next: -1,
        previous: -1,
        lastYear: -1
    };
    for (let i = 0; i < dataset.master_datetime.length; i++) {
        const dateParts = dataset.master_datetime[i].split(' ');
        if (dateParts[0] === currentDateString && parseInt(dateParts[1].split(':')[0]) === currentHour) {
        indices.current = i;
        } else if (dateParts[0] === currentDateString && parseInt(dateParts[1].split(':')[0]) === currentHour + 1) {
        indices.next = i;
        } else if (dateParts[0] === currentDateString && parseInt(dateParts[1].split(':')[0]) === currentHour - 1) {
        indices.previous = i;
        } else if (dateParts[0] === lastYearDateString) {
        indices.lastYear = i;
        }
    }
    return {
        current_fcst: dataset.master_localized[indices.current],
        next_fcst: dataset.master_localized[indices.next],
        previous_fcst: dataset.master_localized[indices.previous],
        last_yea_fcst: dataset.master_localized[indices.lastYear]
    };
    }

  function calculateDifferenceAndPercentage(num1, num2) {
    var difference = num2 - num1;
    var percentageChange = ((num2 - num1) / num1) * 100;
    return [difference, percentageChange];
  }

  function rewriteUnits(text) {
    text = text.replace(/ugm-3/g, 'μg/m³');
    text = text.replace(/ppb/g, 'μg/m³');
    text = text.replace(/ppbv/g, 'PPBV');
    return text;
  }

  function cleanText(text) {
    text = text.replace(/-/g, ' '); 
    return text.trim(); 
  }
  
  function rewrite_number(number) {
    if (number === undefined || isNaN(number)) {
      return 'N/A';
    } else {
      return number.toFixed(2);
    }
  }


function filter_data_set_by_date(master_data, start, end, enableFilter = false) {
    if (!enableFilter) {
        return master_data;
    }

    var filteredMasterData = {};
    var currentDate = new Date();


    var startDate = new Date();
    startDate.setDate(currentDate.getDate() - start);

    var endDate = new Date();
    endDate.setDate(currentDate.getDate() + end);


    var filteredDatetimeData = master_data.master_datetime.filter(function(dateString) {
        var date = new Date(dateString);
        return date >= startDate && date <= endDate;
    });


    var filteredDatetimeIndices = filteredDatetimeData.map(function(dateString) {
        return master_data.master_datetime.indexOf(dateString);
    });

    var filteredLocalizedData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_localized[index];
    });

    var filteredUncorrectedData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_uncorrected[index];
    });

    var filteredObservationData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_observation[index];
    });

    var filteredObservationSourceData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_observation_source ? master_data.master_observation_source[index] : null;
    });

    var filteredObservationPandoraData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_observation_pandora ? master_data.master_observation_pandora[index] : null;
    });

    var filteredObservationCorrectedData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_observation_corrected ? master_data.master_observation_corrected[index] : null;
    });

    var filteredPandoraNo2L1ColData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_pandora_no2_l1col[index];
    });

    filteredMasterData.master_datetime = filteredDatetimeData;
    filteredMasterData.master_observation = filteredObservationData;
    filteredMasterData.master_observation_source = filteredObservationSourceData;
    filteredMasterData.master_observation_pandora = filteredObservationPandoraData;
    filteredMasterData.master_observation_corrected = filteredObservationCorrectedData;
    filteredMasterData.master_localized = filteredLocalizedData;
    filteredMasterData.master_uncorrected = filteredUncorrectedData;
    filteredMasterData.master_pandora_no2_l1col = filteredPandoraNo2L1ColData;

    return filteredMasterData;
}

function add_marker(map, lat, long, open_aq_id, param, site) {

    console.warn('add_marker is deprecated, use Leaflet GeoJSON layers instead');
}




function get_forecasts(sites) {
    sites.forEach((element) => {
        add_marker(map, 30.417130, -9.599250, "739");
    });
}

function get_obeservation(openaq_id) {
    fetch('https://r6datuje8k.us-east-1.awsapprunner.com/noussair.lazrak/api/read_openaq_test', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:8888',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers ': 'Origin, Content-Type, Accept',
                'Content-Type': 'application/json',
                'x-api-key': 'Al7sQWDKzXh3VK19eJ0f3s5Ed40'
            },
            body: JSON.stringify({
                "url": "https://api.openaq.org/v2//measurements?date_from=2019-01-01T00%3A00%3A00%2B00%3A00&date_to=2022-02-01T00%3A00%3A00%2B00%3A00&limit=10000&page=1&offset=0&sort=asc&radius=1000&location_id=10812&parameter=pm25&order_by=datetime"
            })
        }).then(res => res.json())
        .then(res => console.log(res));
}

function get_open_aq_observations(site_id, param) {
    var openaq = {};
    openaq.site_data = [];
    openaq.site_data.openaq_id = "";
    openaq.site_data.location = "";
    openaq.site_data.latitude = "";
    openaq.site_data.longitude = "";
    openaq.site_data.status = 'active';
    openaq.meta_data = "";
    openaq.latest_update = "";
    openaq.latest_n02 = "";
    openaq.latest_03 = "";
    openaq.latest_SO2 = "";
    openaq.latest_pm25 = "";
    openaq.latest_measurments = [];
    $.ajax({
        async: false,
        type: 'GET',
        url: 'https://api.openaq.org/v2/latest?limit=100&page=1&offset=0&sort=desc&radius=1000&order_by=lastUpdated&dumpRaw=false&location_id=' + site_id + '',

        success: function(data) {


            openaq.site_data.openaq_id = site_id;
            openaq.site_data.location = data.results[0].location;
            openaq.site_data.latitude = data.results[0].coordinates.latitude;
            openaq.site_data.longitude = data.results[0].coordinates.longitude;
            openaq.site_data.status = 'active';
            openaq.meta_data = "data is now updated";
            openaq.latest_n02 = data.results[0].measurements.longitude;
            openaq.latest_03 = "";
            openaq.latest_SO2 = "";
            openaq.latest_pm25 = "";
            openaq.latest_measurments = data.results[0].measurements;




        },
        error: function(data) {
            console.log(data);

        },
    });
    return Promise.resolve(openaq);
}

function create_map(sites, param) {

    let map = window.currentMap;
    const mapContainer = document.getElementById('map');
    
    const needsRecreate = !map || !mapContainer || (map._container !== mapContainer);
    
    if (needsRecreate) {
        if (window.currentMap) {
            try {
                window.currentMap.remove();
            } catch (e) {
                console.warn('Error removing old map:', e);
            }
            window.currentMap = null;
        }
        
        if (window.currentMarkers) {
            window.currentMarkers = null;
        }
        
        $('#map').html('');
        
        var center_point = [0.0104, -9.3164];
        
        map = L.map('map', {
            center: center_point,
            zoom: 3,
            minZoom: 1,
            maxZoom: 10,
            worldCopyJump: false,
            maxBounds: [[-85, -180], [85, 180]],
            maxBoundsViscosity: 1.0
        });
        
        // Esri World Imagery — keyless. (CARTO basemaps now require an API key.)
        window.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
            maxZoom: 19,
            noWrap: false
        }).addTo(map);
        
        window.currentMap = map;
        window.currentMarkers = L.layerGroup();
        map.addLayer(window.currentMarkers);
        
        window.hoverDiv = document.getElementById('map-hover-info');
        
        console.log('Map created/recreated successfully');
    } else {
        map.invalidateSize();
    }

    var mapVisible = true;

    $(document).on('click', '#global-view', function() {
        if (mapVisible) {
            map.fitBounds([[-90, -180], [90, 180]], {
                duration: 0.02,
                padding: [0, 0]
            });

            $('#replay-animation').css({
                'opacity': 0.7
            }).fadeIn('fast');
        } else {
            $('#replay-animation').fadeOut('fast');
        }
        
        mapVisible = !mapVisible;
    });

    if (sites && sites.features && sites.features.length > 0) {
        updateLeafletMarkers(map, sites);
    }

    return map;
}
function sitesArrayToGeoJSON(sites, selectedSource = "no2") {
    return {
        type: "FeatureCollection",
        features: sites
            .map((site, index) => {
                const matchingForecast = site.current_forecast || {};
                const selected = (site.species || "no2").toLowerCase();
                const isPm25 = selected === "pm25" || selected === "pm2.5";

                let aqi = "--";

                // overall
                if (matchingForecast && typeof matchingForecast === "object") {
                    if (matchingForecast.overall_aqi !== undefined && matchingForecast.overall_aqi !== null && !isNaN(matchingForecast.overall_aqi)) {
                        aqi = matchingForecast.overall_aqi;
                    } else if (site.forecasted_value !== undefined && site.forecasted_value !== null && site.forecasted_value !== "N/A") {
                        aqi = site.forecasted_value;
                    }
                } else if (site.forecasted_value !== undefined && site.forecasted_value !== null && site.forecasted_value !== "N/A") {
                    aqi = site.forecasted_value;
                }

                const aqiLevel = aqi === "--" || aqi === "N/A"
                    ? { color: '#000000', level: 'No Data' }
                    : getAqiLevel(aqi, selected);

                let coordinates = [site.lon, site.lat];

                return {
                    type: "Feature",
                    id: index,
                    properties: {
                        location_id: site.location_id || "unknown_id",
                        location_name: site.location_name || "Unknown Location",
                        time_zone: site.timezone,
                        forecasted_value: aqi,
                        aqi_value: (aqi === "--" || aqi === "N/A" || aqi === null || isNaN(aqi)) ? "--" : parseInt(aqi),
                        aqi_color: aqiLevel.color,
                        status: "active",
                        observation_source: site.observation_source || "NASA",
                        parameter: selected,
                        obs_options: JSON.stringify(matchingForecast),
                        precomputed_forecasts: JSON.stringify([matchingForecast])
                    },
                    geometry: {
                        type: "Point",
                        coordinates: coordinates
                    }
                };
            })
    };
}
   
function generateSmallAqiBox(aqiValue, pollutant) {
    if (aqiValue === 'N/A' || aqiValue === undefined || aqiValue === null || isNaN(aqiValue) || aqiValue === '--') return '';

    const aqi = Number(aqiValue);
    if (isNaN(aqi)) return '';

    const aqiLevel = getAqiLevel(aqi);


    const segments = [
        { min: 0,   max: 50  },
        { min: 51,  max: 100 },
        { min: 101, max: 150 },
        { min: 151, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 500 }
    ];
    const segmentWidth = 100 / segments.length; // 16.666...%
    let arrowPos = 0;
    for (let i = 0; i < segments.length; i++) {
        const { min, max } = segments[i];
        if (aqi <= max || i === segments.length - 1) {
            const clampedAqi = Math.min(Math.max(aqi, min), max);
            arrowPos = i * segmentWidth + ((clampedAqi - min) / (max - min)) * segmentWidth;
            break;
        }
    }
    arrowPos = Math.min(Math.max(arrowPos, 0), 100);

    return `
        <div style="padding:6px 10px; min-width:120px; background:#fff; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.12); font-size:13px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:28px;height:28px;border-radius:50%;background:${aqiLevel.color};display:flex;align-items:center;justify-content:center;font-weight:bold;color:#222;">
                    ${aqi}
                </div>
                <div>
                    <div style="font-size:12px;font-weight:600;">AQI (${pollutant.toUpperCase()})</div>
                    <div style="font-size:11px;">${aqiLevel.level}</div>
                </div>
            </div>
            <div style="margin-top:6px;display:flex;height:6px;">
                <div style="flex:1;background:#4CAF50;"></div>
                <div style="flex:1;background:#FFEB3B;"></div>
                <div style="flex:1;background:#FF9800;"></div>
                <div style="flex:1;background:#F44336;"></div>
                <div style="flex:1;background:#9C27B0;"></div>
                <div style="flex:1;background:#7E0023;"></div>
            </div>
            <div style="position:relative;height:8px;">
                <div style="position:absolute;top:0;left:${arrowPos}%;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:7px solid #222;transform:translateX(-50%);"></div>
            </div>
        </div>
    `;
}

window.siteDataCache = window.siteDataCache || {};

/**
 * Load forecast data
 */
async function loadSiteForecasts(locationName, filename) {
    const cacheKey = filename;
    const cacheEntry = window.siteDataCache[cacheKey];
    
    if (cacheEntry && (Date.now() - cacheEntry.timestamp < 300000)) {
        return cacheEntry.data;
    }
    
    try {
        const response = await fetch(`https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/all_dts/${filename}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to load ${filename}`);
        
        const text = await response.text();
        const sanitizedText = text.replace(/NaN/g, "null");
        const data = JSON.parse(sanitizedText);
        
        window.siteDataCache[cacheKey] = {
            data: data,
            timestamp: Date.now()
        };
        
        const cacheKeys = Object.keys(window.siteDataCache);
        if (cacheKeys.length > 50) {
            const oldestKey = cacheKeys.reduce((oldest, key) => {
                const entry = window.siteDataCache[key];
                const oldestEntry = window.siteDataCache[oldest];
                return entry.timestamp < oldestEntry.timestamp ? key : oldest;
            });
            delete window.siteDataCache[oldestKey];
        }
        
        return data;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        if (cacheEntry) return cacheEntry.data;
        return null;
    }
}

function getCurrentForecast(siteData, timezone) {
    if (!siteData || !siteData.forecasts || siteData.forecasts.length === 0) {
        console.warn("No forecasts available for site");
        return null;
    }
    const now = new Date();
    
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const partMap = {};
    parts.forEach(p => {
        partMap[p.type] = p.value;
    });
    
    const currentHour = parseInt(partMap.hour);
    
    const isDosMissionPm25 = siteData.species === 'pm25' && 
                             !siteData.observation_source &&
                             siteData.forecasts.some(f => {
                                 const forecastHour = parseInt(f.local_time.substring(11, 13));
                                 return forecastHour % 3 === 0;
                             });
    
    let bestMatch = null;
    let bestDiff = Infinity;
    
    if (isDosMissionPm25) {

        const windowEnd = Math.ceil(currentHour / 3) * 3;
        const targetHour = String(windowEnd % 24).padStart(2, '0');
        const targetTimeStr = `${partMap.year}-${partMap.month}-${partMap.day} ${targetHour}:00:00`;
        

        for (const forecast of siteData.forecasts) {
            if (!forecast.local_time) continue;
            if (forecast.local_time === targetTimeStr) {
                return forecast;
            }
        }
        
        for (const forecast of siteData.forecasts) {
            if (!forecast.local_time) continue;
            const forecastHour = parseInt(forecast.local_time.substring(11, 13));
            const diff = Math.abs(forecastHour - currentHour);
            
            if (diff < bestDiff) {
                bestMatch = forecast;
                bestDiff = diff;
            }
        }
    } else {
        const currentLocalHour = `${partMap.year}-${partMap.month}-${partMap.day} ${String(currentHour).padStart(2, '0')}:00:00`;
        
        for (const forecast of siteData.forecasts) {
            if (!forecast.local_time) continue;
            if (forecast.local_time.substring(0, 13) + ':00:00' === currentLocalHour) {
                return forecast;
            }
        }
        
        for (const forecast of siteData.forecasts) {
            if (!forecast.local_time) continue;
            const forecastHour = parseInt(forecast.local_time.substring(11, 13));
            const diff = Math.abs(forecastHour - currentHour);
            
            if (diff < bestDiff) {
                bestMatch = forecast;
                bestDiff = diff;
            }
        }
    }
    
    return bestMatch || siteData.forecasts[0] || null;
}


function readCompressedJsonAndAddBanners(fileUrl, selectedSource) {
    if (window.currentForecastData) window.currentForecastData = null;
    showLoadingDiv();

    const indexCacheKey = '__sites_index_cache__';
    const cachedIndex = window[indexCacheKey];
    const indexPromise = (cachedIndex && (Date.now() - cachedIndex.ts < 300000))
        ? Promise.resolve(cachedIndex.data)
        : fetch('precomputed/sites_index.json')
            .then(r => { if (!r.ok) throw new Error('Failed to fetch sites index'); return r.json(); })
            .then(data => { window[indexCacheKey] = { data, ts: Date.now() }; return data; });

    indexPromise
        .then(siteIndex => {
            console.log("Selected source:", selectedSource);
            
            const filteredIndices = siteIndex.filter(site => {
                if (!Array.isArray(site.sources)) return false;
                const siteSources = site.sources.map(s => s.toLowerCase());
                const selectedSourceLower = (selectedSource || "").toLowerCase();
                return siteSources.includes(selectedSourceLower);
            }).sort((a, b) => {
                const nameA = (a.location_name || '').toLowerCase();
                const nameB = (b.location_name || '').toLowerCase();
                return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
            });

            console.log(`Found ${filteredIndices.length} sites for source: ${selectedSource}`);
            
            $(".ticker-track").empty();
            
            const skeletonCount = Math.min(12, filteredIndices.length);
            for (let i = 0; i < skeletonCount; i++) {
                const skeleton = `
                    <div class="ticker-card ticker-loading">
                        <div class="skeleton-shimmer" style="width: 80px; height: 14px; margin-bottom: 8px;"></div>
                        <div class="skeleton-shimmer" style="width: 60px; height: 24px;"></div>
                    </div>
                `;
                $(".ticker-track").append(skeleton);
            }

            const now = new Date();
            const attemptHourlyLoad = async () => {
                for (let hoursBack = 0; hoursBack <= 6; hoursBack++) {
                    const attemptDate = new Date(now);
                    attemptDate.setHours(attemptDate.getHours() - hoursBack);
                    
                    const year = attemptDate.getUTCFullYear();
                    const month = String(attemptDate.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(attemptDate.getUTCDate()).padStart(2, '0');
                    const hour = String(attemptDate.getUTCHours()).padStart(2, '0');
                    
                    const snapshotPath = `https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/hourly_forecasts/${year}-${month}-${day}_${hour}.json?version=${new Date().getTime()}`;
                    
                    try {
                        const response = await fetch(snapshotPath);
                        if (response.ok) {
                            const hourlySnapshot = await response.json();
                            console.log(`Loaded hourly forecast from ${hoursBack} hours ago`);
                            processHourlySnapshot(hourlySnapshot, filteredIndices);
                            return;
                        }
                    } catch (error) {
                        continue;
                    }
                }
                
                console.log('No recent hourly forecasts available, loading individual sites...');
                loadIndividualSites(filteredIndices);
            };
            
            attemptHourlyLoad();
        })
        .catch(error => {
            hideLoadingDiv();
            console.error("Error loading sites index:", error);
            showToast('Failed to load forecasts', 'error');
        });
}

function readCompressedJsonAndAddBannersOptimized(fileUrl, selectedSource) {
    if (window.currentForecastData) window.currentForecastData = null;
    window.__currentSelectedSource = selectedSource;
    showLoadingDiv();

    const indexCacheKey = '__sites_index_cache__';
    const cachedIndex = window[indexCacheKey];
    const indexPromise = (cachedIndex && (Date.now() - cachedIndex.ts < 300000))
        ? Promise.resolve(cachedIndex.data)
        : fetch('precomputed/sites_index.json', { headers: { 'Accept': 'application/json' } })
            .then(r => { if (!r.ok) throw new Error('Failed to fetch sites index'); return r.json(); })
            .then(data => { window[indexCacheKey] = { data, ts: Date.now() }; return data; });

    indexPromise
        .then(siteIndex => {
            const filteredIndices = siteIndex.filter(site => {
                if (!Array.isArray(site.sources)) return false;
                const siteSources = site.sources.map(s => s.toLowerCase());
                const selectedSourceLower = (selectedSource || '').toLowerCase();
                return siteSources.includes(selectedSourceLower);
            }).sort((a, b) => {
                const nameA = (a.location_name || '').toLowerCase();
                const nameB = (b.location_name || '').toLowerCase();
                return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
            });

            console.log(`Found ${filteredIndices.length} sites for source: ${selectedSource}`);

            $('.ticker-track').empty();
            const skeletonCount = Math.min(12, filteredIndices.length);
            for (let i = 0; i < skeletonCount; i++) {
                $('.ticker-track').append(`
                    <div class="ticker-card ticker-loading">
                        <div class="skeleton-shimmer" style="width:80px;height:14px;margin-bottom:8px;"></div>
                        <div class="skeleton-shimmer" style="width:60px;height:24px;"></div>
                    </div>`);
            }

            const now = new Date();
            const tryHourlySnapshot = async () => {
                for (let hoursBack = 0; hoursBack <= 6; hoursBack++) {
                    const t = new Date(now);
                    t.setHours(t.getHours() - hoursBack);
                    const y = t.getUTCFullYear();
                    const mo = String(t.getUTCMonth() + 1).padStart(2, '0');
                    const d  = String(t.getUTCDate()).padStart(2, '0');
                    const h  = String(t.getUTCHours()).padStart(2, '0');
                    const snapshotUrl = `https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/hourly_forecasts/${y}-${mo}-${d}_${h}.json`;
                    try {
                        const snapshotCacheKey = '__hourly_snapshot_' + `${y}${mo}${d}${h}` + '__';
                        let snapshot = window[snapshotCacheKey];
                        if (!snapshot) {
                            const resp = await fetch(snapshotUrl);
                            if (!resp.ok) continue;
                            snapshot = await resp.json();
                            window[snapshotCacheKey] = snapshot;
                        }
                        console.log(`[Optimized] Loaded hourly snapshot (${hoursBack}h ago) — processing all sites at once`);
                        processHourlySnapshotOptimized(snapshot, filteredIndices);
                        return;
                    } catch (e) { /* try next */ }
                }
                console.log('[Optimized] No hourly snapshot available, falling back to individual site loads');
                loadIndividualSitesOptimized(filteredIndices, selectedSource);
            };

            tryHourlySnapshot();
        })
        .catch(error => {
            hideLoadingDiv();
            console.error('Error loading sites index:', error);
            showToast('Failed to load forecasts', 'error');
        });
}


function getAqiFromForecast(forecast, selected) {
    if (!forecast) return "N/A";

    if (forecast.overall_aqi != null && !isNaN(forecast.overall_aqi)) return forecast.overall_aqi;

    const isPm25 = selected === "pm25" || selected === "pm2.5";
    let v = null;
    if (selected === "no2") {
        v = forecast.no2_aqi ?? forecast.NO2_AQI ?? null;
        if (v === null && forecast.no2 != null) v = calculateAqiForNo2(forecast.no2);
    } else if (isPm25) {
        v = forecast.pm25_aqi ?? forecast.PM25_NowCast_AQI ?? null;
        if (v === null || isNaN(v)) {
            const conc = forecast.pm25_conc_cnn ?? forecast.pm25 ?? null;
            if (conc !== null) v = calculateAqiForPm25(conc);
        }
    } else if (selected === "o3") {
        v = forecast.o3_aqi ?? forecast.O3_AQI ?? null;
    }
    return (v !== null && v !== undefined && !isNaN(v)) ? v : "N/A";
}

function processHourlySnapshotOptimized(hourlySnapshot, filteredIndices) {
    const snapshotMap = {};
    hourlySnapshot.sites.forEach(site => {
        snapshotMap[site.location_name] = site;
    });
    
    const isPandora = (window.__currentSelectedSource || '').toLowerCase() === 'pandora';
    const filteredSites = [];
    let skeletonsRemoved = 0;
    
    for (const indexEntry of filteredIndices) {
        try {
            const snapshotData = snapshotMap[indexEntry.location_name];
            if (!snapshotData) continue;

            const selected = isPandora ? 'pandora' : (indexEntry.species || snapshotData.species || 'no2').toLowerCase();
            const isPm25 = selected === 'pm25' || selected === 'pm2.5';
            
            let forecasted_value = getAqiFromForecast(snapshotData, selected);
            
            if (forecasted_value !== "N/A") {
                const no2AqiVal  = snapshotData.no2_aqi  ?? snapshotData.NO2_AQI;
                const o3AqiVal   = snapshotData.o3_aqi   ?? snapshotData.O3_AQI;
                const pm25AqiVal = snapshotData.pm25_aqi ?? snapshotData.PM25_NowCast_AQI;
                const obsOptions = {
                    no2: { unit: "μg/m³", value: snapshotData.no2 || "N/A" },
                    no2_aqi: { unit: "AQI", value: no2AqiVal || "N/A" },
                    o3: { unit: "μg/m³", value: snapshotData.o3 || "N/A" },
                    o3_aqi: { unit: "AQI", value: o3AqiVal || "N/A" },
                    pm25: { unit: "μg/m³", value: (snapshotData.pm25_conc_cnn ?? snapshotData.pm25) || "N/A" },
                    pm25_aqi: { unit: "AQI", value: pm25AqiVal || "N/A" },
                    t10m: { unit: "K", value: snapshotData.t10m || "N/A" },
                    rh: { unit: "%", value: snapshotData.rh || "N/A" },
                    wind_speed: { unit: "m/s", value: snapshotData.wind_speed || "N/A" }
                };

                const siteDisplayData = {
                    location_name: indexEntry.location_name,
                    observation_source: snapshotData.observation_source || "NASA",
                    forecasted_value: parseInt(forecasted_value),
                    status: "active",
                    latitude: indexEntry.lat,
                    longitude: indexEntry.lon,
                    timezone: snapshotData.timezone,
                    precomputed_forecasts: JSON.stringify([snapshotData]),
                    obs_options: JSON.stringify(obsOptions),
                };

                add_the_banner(siteDisplayData, selected);
                
                if (skeletonsRemoved < 12) {
                    $(".ticker-track .ticker-loading").eq(0).remove();
                    skeletonsRemoved++;
                }
                
                filteredSites.push({
                    location_id: indexEntry.location_id,
                    location_name: indexEntry.location_name,
                    lat: indexEntry.lat,
                    lon: indexEntry.lon,
                    timezone: snapshotData.timezone,
                    species: selected,
                    observation_source: snapshotData.observation_source,
                    forecasted_value: parseInt(forecasted_value),
                    precomputed_forecasts: [snapshotData],
                    current_forecast: snapshotData,
                    sources: snapshotData.sources || indexEntry.sources
                });
            }
        } catch (error) {
            console.error(`Error processing site ${indexEntry.location_name}:`, error);
        }
    }
    
    if (filteredSites.length === 0) {
        console.log('[Optimized] Snapshot had no matching sites, falling back to individual loads');
        loadIndividualSitesOptimized(filteredIndices, window.__currentSelectedSource);
        return;
    }
    
    finalizeSitesLoadingOptimized(filteredSites);
}

/**
 * Optimized loading
 */
function loadIndividualSitesOptimized(filteredIndices, selectedSource) {
    const isPandora = (selectedSource || '').toLowerCase() === 'pandora';
    const batchSize = 4;
    const filteredSites = [];
    let processed = 0;
    let skeletonsRemoved = 0;
    
    const loadSiteData = () => {
        const batch = filteredIndices.slice(processed, processed + batchSize);
        if (batch.length === 0) {
            finalizeSitesLoadingOptimized(filteredSites);
            return;
        }
        
        Promise.all(batch.map(indexEntry => {
            const cacheKey = `${indexEntry.location_name}.json`;
            const cached = window.siteDataCache[cacheKey];
            if (cached && (Date.now() - cached.timestamp < 300000)) {
                return Promise.resolve({...indexEntry, data: cached.data});
            }
            
            return fetch(`https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/all_dts/${indexEntry.location_name}.json`, {
                headers: { 'Accept': 'application/json' }
            })
                .then(r => r.text())
                .then(text => {
                    const sanitizedText = text.replace(/NaN/g, 'null');
                    const data = JSON.parse(sanitizedText);
                    window.siteDataCache[cacheKey] = {
                        data: data,
                        timestamp: Date.now()
                    };
                    return data;
                })
                .then(data => ({...indexEntry, data}))
                .catch(() => null);
        }))
        .then(results => {
            results.forEach(result => {
                if (result && result.data && result.data.forecasts) {
                    const selected = isPandora ? 'pandora' : (result.data.species || result.species || 'no2').toLowerCase();
                    const isPm25 = selected === 'pm25' || selected === 'pm2.5';
                    const currentForecast = getCurrentForecast(result.data, result.data.timezone);
                    if (!currentForecast) return;
                    
                    let forecasted_value = getAqiFromForecast(currentForecast, selected);
                    
                    if (forecasted_value !== "N/A") {
                        const obsOptions = {};
                        Object.keys(currentForecast).forEach(key => {
                            if (key !== "time") {
                                obsOptions[key] = {
                                    unit: getUnitForParameter(key),
                                    value: currentForecast[key] || "N/A"
                                };
                            }
                        });

                        const siteDisplayData = {
                            location_name: result.location_name,
                            observation_source: result.data.observation_source || "NASA",
                            forecasted_value: parseInt(forecasted_value),
                            status: "active",
                            latitude: result.lat,
                            longitude: result.lon,
                            timezone: result.data.timezone,
                            precomputed_forecasts: JSON.stringify([currentForecast]),
                            obs_options: JSON.stringify(obsOptions),
                        };

                        add_the_banner(siteDisplayData, selected);
                        
                        if (skeletonsRemoved < 12) {
                            $(".ticker-track .ticker-loading").eq(0).remove();
                            skeletonsRemoved++;
                        }
                        
                        filteredSites.push({
                            location_id: result.location_id,
                            location_name: result.location_name,
                            lat: result.lat,
                            lon: result.lon,
                            timezone: result.data.timezone,
                            species: selected,
                            observation_source: result.data.observation_source,
                            precomputed_forecasts: result.data.forecasts,
                            current_forecast: currentForecast,
                            sources: result.sources
                        });
                    }
                }
            });
            processed += batchSize;
            if (filteredSites.length > 0) {
                window.currentForecastData = filteredSites.slice();
                updateMapMarkers(sitesArrayToGeoJSON(filteredSites));
            }
            loadSiteData();
        });
    };
    
    loadSiteData();
}


function finalizeSitesLoadingOptimized(filteredSites) {
    window.currentForecastData = filteredSites;
    const geojson = sitesArrayToGeoJSON(filteredSites);
    updateMapMarkers(geojson);
    hideLoadingDiv();
}

function processHourlySnapshot(hourlySnapshot, filteredIndices) {
    const snapshotMap = {};
    hourlySnapshot.sites.forEach(site => {
        snapshotMap[site.location_name] = site;
    });
    
    const filteredSites = [];
    let skeletonsRemoved = 0;
    
    for (const indexEntry of filteredIndices) {
        try {
            const snapshotData = snapshotMap[indexEntry.location_name];
            if (!snapshotData) continue;
            
            const selected = (indexEntry.species || snapshotData.species || "no2").toLowerCase();
            const isPm25 = selected === "pm25" || selected === "pm2.5";
            
            let forecasted_value = getAqiFromForecast(snapshotData, selected);
            
            if (forecasted_value !== "N/A") {
                const no2AqiVal  = snapshotData.no2_aqi  ?? snapshotData.NO2_AQI;
                const o3AqiVal   = snapshotData.o3_aqi   ?? snapshotData.O3_AQI;
                const pm25AqiVal = snapshotData.pm25_aqi ?? snapshotData.PM25_NowCast_AQI;
                const obsOptions = {
                    no2: { unit: "μg/m³", value: snapshotData.no2 || "N/A" },
                    no2_aqi: { unit: "AQI", value: no2AqiVal || "N/A" },
                    o3: { unit: "μg/m³", value: snapshotData.o3 || "N/A" },
                    o3_aqi: { unit: "AQI", value: o3AqiVal || "N/A" },
                    pm25: { unit: "μg/m³", value: (snapshotData.pm25_conc_cnn ?? snapshotData.pm25) || "N/A" },
                    pm25_aqi: { unit: "AQI", value: pm25AqiVal || "N/A" },
                    t10m: { unit: "K", value: snapshotData.t10m || "N/A" },
                    rh: { unit: "%", value: snapshotData.rh || "N/A" },
                    wind_speed: { unit: "m/s", value: snapshotData.wind_speed || "N/A" }
                };

                const siteDisplayData = {
                    location_name: indexEntry.location_name,
                    observation_source: snapshotData.observation_source || "NASA",
                    forecasted_value: parseInt(forecasted_value),
                    status: "active",
                    latitude: indexEntry.lat,
                    longitude: indexEntry.lon,
                    timezone: snapshotData.timezone,
                    precomputed_forecasts: JSON.stringify([snapshotData]),
                    obs_options: JSON.stringify(obsOptions),
                };

                add_the_banner(siteDisplayData, selected);
                
                if (skeletonsRemoved < 12) {
                    $(".ticker-track .ticker-loading").eq(0).remove();
                    skeletonsRemoved++;
                }
                
                filteredSites.push({
                    location_id: indexEntry.location_id,
                    location_name: indexEntry.location_name,
                    lat: indexEntry.lat,
                    lon: indexEntry.lon,
                    timezone: snapshotData.timezone,
                    observation_source: snapshotData.observation_source || indexEntry.observation_source,
                    species: selected,
                    forecasted_value: forecasted_value,
                    current_forecast: snapshotData,
                    sources: snapshotData.sources || indexEntry.sources
                });
            }
        } catch (error) {
            console.warn(`Error processing ${indexEntry.location_name}:`, error);
        }
    }
    
    finalizeSitesLoading(filteredSites);
}

function loadIndividualSites(filteredIndices) {
    const loadSiteData = async () => {
        const filteredSites = [];
        const maxConcurrent = 2;
        let skeletonsRemoved = 0;
        
        for (let i = 0; i < filteredIndices.length; i += maxConcurrent) {
            const batch = filteredIndices.slice(i, i + maxConcurrent);
            
            const results = await Promise.all(
                batch.map(async (indexEntry) => {
                    try {
                        const siteData = await loadSiteForecasts(indexEntry.location_name, indexEntry.file);
                        if (!siteData) return null;
                        
                        const fileTimezone = siteData.timezone || indexEntry.timezone;
                        const matchingForecast = getCurrentForecast(siteData, fileTimezone);
                        if (!matchingForecast) return null;
                        
                        const selected = (siteData.species || indexEntry.species || "no2").toLowerCase();
                        const isPm25 = selected === "pm25" || selected === "pm2.5";
                        
                        let forecasted_value = getAqiFromForecast(matchingForecast, selected);
                        
                        if (forecasted_value !== "N/A") {
                            const obsOptions = {};
                            Object.keys(matchingForecast).forEach(key => {
                                if (key !== "time") {
                                    obsOptions[key] = {
                                        unit: getUnitForParameter(key),
                                        value: matchingForecast[key] || "N/A"
                                    };
                                }
                            });

                            const siteDisplayData = {
                                location_name: indexEntry.location_name,
                                observation_source: indexEntry.observation_source || "NASA",
                                forecasted_value: parseInt(forecasted_value),
                                status: "active",
                                latitude: indexEntry.lat,
                                longitude: indexEntry.lon,
                                timezone: fileTimezone,
                                precomputed_forecasts: JSON.stringify([matchingForecast]),
                                obs_options: JSON.stringify(obsOptions),
                            };

                            add_the_banner(siteDisplayData, selected);
                            
                            if (skeletonsRemoved < 12) {
                                $(".ticker-track .ticker-loading").eq(0).remove();
                                skeletonsRemoved++;
                            }
                            
                            return {
                                location_id: indexEntry.location_id,
                                location_name: indexEntry.location_name,
                                lat: indexEntry.lat,
                                lon: indexEntry.lon,
                                timezone: fileTimezone,
                                observation_source: indexEntry.observation_source,
                                species: selected,
                                forecasted_value: forecasted_value,
                                current_forecast: matchingForecast,
                                sources: indexEntry.sources
                            };
                        }
                        return null;
                    } catch (error) {
                        console.warn(`Error loading ${indexEntry.location_name}:`, error);
                        return null;
                    }
                })
            );
            
            filteredSites.push(...results.filter(r => r !== null));
        }
        
        finalizeSitesLoading(filteredSites);
    };
    
    loadSiteData();
}

function finalizeSitesLoading(filteredSites) {
    window.currentForecastData = filteredSites;
    const geojson = sitesArrayToGeoJSON(filteredSites);
    
    const mapEl = document.getElementById('map');
    const mapReady = window.currentMap && mapEl && window.currentMap._container === mapEl;
    if (mapReady) {
        updateMapMarkers(geojson);
    } else {
        create_map(geojson);
    }
    hideLoadingDiv();
}


function updateLeafletMarkers(map, geojson) {
    const markerCluster = window.currentMarkers;
    if (!markerCluster) {
        console.error('Marker cluster not initialized');
        return;
    }

    const isAnimSync = !!window.__geotiffAnimating;

    if (!isAnimSync && map && map.getContainer()) {
        const container = map.getContainer();
        container.style.opacity = '0.6';
        container.style.pointerEvents = 'none';
    }
    
    markerCluster.clearLayers();
    
    const hoverDiv = window.hoverDiv;
    
    geojson.features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        const props = feature.properties;
        const latlng = [coords[1], coords[0]];
        
        const aqiValue = props.aqi_value === 'N/A' || props.aqi_value === '--' ? '--' : props.aqi_value;

        const aqiColor = props.aqi_color || '#9e9e9e';
        
        const icon = L.divIcon({
            className: 'custom-marker-icon',
            html: `
                <div class="marker-container" data-marker-id="${index}" style="opacity:0.7;">
                    <div style="
                        width:32px;
                        height:32px;
                        border-radius:50%;
                        background:${aqiColor};
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:#fff;
                        font-weight:bold;
                        font-size:11px;
                        box-shadow:0 2px 8px rgba(0,0,0,0.3);
                        transition:all 0.2s ease;
                    ">${aqiValue}</div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        const marker = L.marker(latlng, { icon: icon });
        
        marker.featureProperties = props;
        
        marker.on('mouseover', function(e) {
            const markerEl = e.target.getElement();
            if (markerEl) {
                const container = markerEl.querySelector('.marker-container');
                if (container) container.style.opacity = '1';
            }
            
            const locationName = props.location_name || "Unknown";
            const param = props.parameter || 'no2';
            
            if (hoverDiv) {
                hoverDiv.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:4px;">${locationName}</div>
                    ${generateSmallAqiBox(aqiValue, param)}
                `;
                hoverDiv.style.display = 'block';
            }
            
            map.on('mousemove', onMove);
            function onMove(ev) {
                if (hoverDiv) {
                    hoverDiv.style.left = (ev.containerPoint.x + 15) + 'px';
                    hoverDiv.style.top = (ev.containerPoint.y + 15) + 'px';
                }
            }
            marker._onMove = onMove;
        });
        
        marker.on('mouseout', function(e) {
            const markerEl = e.target.getElement();
            if (markerEl) {
                const container = markerEl.querySelector('.marker-container');
                if (container) container.style.opacity = '0.7';
            }
            
            if (hoverDiv) {
                hoverDiv.style.display = 'none';
            }
            
            if (marker._onMove) {
                map.off('mousemove', marker._onMove);
                marker._onMove = null;
            }
        });
        
        marker.on('click', function(e) {
            const props = e.target.featureProperties;
            const location_id = props.location_id;
            const location_name = props.location_name.replace(/[^a-z0-9\s]/gi, '_').replace(/[_\s]/g, '_');
            const observation_source = props.observation_source;
            const observation_value = props.forecasted_value;
            const precomputed_forecasts = props.precomputed_forecasts ? JSON.parse(props.precomputed_forecasts) : [];
            const obs_option = props.obs_options ? JSON.parse(props.obs_options) : [];
            const observation_unit = obs_option?.[0]?.no2?.unit || 'N/A';
            const param = props.parameter;
            const timezone = props.time_zone || "UTC";
            const current_forecast_timestamp = precomputed_forecasts[0]?.local_time || null;
            
            const messages = [
                "Connecting to OpenAQ", 
                "Connecting to GMAO", 
                "Fetching data from OpenAQ", 
                "Fetching data from GMAO FTP", 
                "Fetching observations", 
                "Getting the forecasts", 
                "Please wait...", 
                "Connecting..."
            ];
            
            openForecastsWindow({
                messages: messages,
                st_id: location_id,
                param: param || 'no2',
                location_name,
                observation_value,
                current_observation_unit: observation_unit,
                obs_src: observation_source,
                precomputed_forecasts,
                isModal: true,
                timezone,
                current_forecast_timestamp
            });
        });
        
        markerCluster.addLayer(marker);
    });
    
    console.log(`Updated ${geojson.features.length} Leaflet markers`);

    if (!isAnimSync) {
        setTimeout(() => {
            if (map && map.getContainer()) {
                const container = map.getContainer();
                container.style.opacity = '1';
                container.style.pointerEvents = 'auto';
            }
        }, 300);
    }
}

function updateMapMarkers(geojson) {
    const map = window.currentMap;
    
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    updateLeafletMarkers(map, geojson);
}

function showLoadingDiv() {
    // Loader
    if ($(".loading-div").length === 0) {
        const loadingHtml = `
            <div class="loading-div">
                <div class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading markers...</div>
                </div>
            </div>
        `;
        $("body").append(loadingHtml);
    }
    
    const $div = $(".loading-div");
    $div.addClass("show");
}

function hideLoadingDiv() {
    const $div = $(".loading-div");
    $div.removeClass("show");
    setTimeout(() => {
        showToast('Markers updated successfully', 'success');
    }, 300);
}

function getUnitForParameter(parameter) {
    const units = {
        no2: "μg/m³",
        corrected: "μg/m³",
        pandora: "N/A",
        o3: "μg/m³",
        openaq: "N/A",
        pm25: "μg/m³",
        rh: "%",
        t10m: "K", 
        tprec: "mm", 
        hcho: "ppb"
    };

    return units[parameter] || "N/A";
}

function add_the_banner(site, param) {
    const precomputed_forecasts = $.parseJSON(site.precomputed_forecasts);
    const obs_options = $.parseJSON(site.obs_options);

    if (site.observation_source) {

        const siteDataLike = { forecasts: precomputed_forecasts, species: null };
        const timezone = site.timezone || "UTC";
        const forecast = getCurrentForecast(siteDataLike, timezone) || precomputed_forecasts?.[0] || {};
        const t10m = forecast.t10m ?? forecast.t;
        const rh = forecast.rh;

        let aqiValue = '--';
        let source = '';
        
        if (forecast.overall_aqi !== undefined && forecast.overall_aqi !== null && !isNaN(forecast.overall_aqi)) {
            aqiValue = parseInt(forecast.overall_aqi);
            source = "NASA GEOS CF, NASA Pandora";
        } else {
            if (site.forecasted_value !== undefined && site.forecasted_value !== null &&
                site.forecasted_value !== 'N/A' && !isNaN(site.forecasted_value)) {
                aqiValue = parseInt(site.forecasted_value);
            }
        }

        // display
        const _tempUnit = (new URLSearchParams(window.location.search).get('temp') || 'c').toLowerCase();
        const _tempC = (typeof t10m === "number" && !isNaN(t10m)) ? Math.round(t10m - 273.15) : null;
        const temperature = _tempC !== null ? (_tempUnit === 'f' ? Math.round(_tempC * 9 / 5 + 32) : _tempC) : "--";
        const tempLabel = _tempUnit === 'f' ? '°F' : '°C';
        const humidity    = (typeof rh   === "number" && !isNaN(rh))   ? (rh  * 100).toFixed(0)     : "--";

        
        const aqiLevel = getAqiLevel(aqiValue, param);
        
        const aqiClass = aqiValue === '--' ? 'na' : 
            aqiValue <= 50 ? 'good' :
            aqiValue <= 100 ? 'moderate' :
            aqiValue <= 150 ? 'unhealthy-sensitive' :
            aqiValue <= 200 ? 'unhealthy' :
            aqiValue <= 300 ? 'very-unhealthy' : 'hazardous';
        
        const regionParts = site.timezone ? site.timezone.split('/') : ['--'];
        const region = regionParts.length > 1 ? regionParts[1].replace(/_/g, ' ') : regionParts[0];

        const html = `
            <div class="ticker-card launch-local-forecasts"
                obs_src="${site.observation_source}"
                parameter="${param}"
                station_id="${site.location_id}"
                location_name="${site.location_name.replace(/ /g, "-")}"
                observation_value="${site.forecasted_value}"
                status="${site.status}"
                current_observation_unit="${obs_options?.[param]?.unit || 'N/A'}"
                latitude="${site.latitude}"
                longitude="${site.longitude}"
                lastUpdated="--"
                precomputed_forecasts='${JSON.stringify(precomputed_forecasts)}'
                timezone="${site.timezone}"
                tabindex="0"
                role="button">
                <div class="ticker-card-aqi ${aqiClass}">${aqiValue}</div>
                <div class="ticker-card-info">
                    <div class="ticker-card-name">${
                        site.location_name.length > 12
                            ? site.location_name.replace(/_/g, ' ').replace(/\./g, ' ').slice(0, 12) + '...'
                            : site.location_name.replace(/_/g, ' ').replace(/\./g, ' ')
                    }</div>
                    <div class="ticker-card-meta">
                        <span>${forecast.local_time ? forecast.local_time.substring(11, 16) : '--'}</span>
                        <span>${temperature}${tempLabel}</span>
                        <span>${humidity}%</span>
                    </div>
                </div>
            </div>
        `;

        const skeletons = $(".ticker-track .ticker-loading");
        if (skeletons.length > 0) {
            skeletons.first().replaceWith(html);
        } else {
            $(".ticker-track").append(html);
        }
    }
}

function cleanupBanners() {
    const cards = $('.ticker-track .ticker-card');
    
    cards.each(function(index) {
        setTimeout(() => {
            $(this).css('opacity', '0');
            setTimeout(() => $(this).remove(), 200);
        }, index * 30);
    });
    
    $('.ticker-track .ticker-loading').remove();
    
    if (window.currentForecastData) {
        window.currentForecastData = null;
    }
}


function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


function get_all_sites_data(sites, param) {
    let all_sites = [];
            
        $.each(sites, function(index, site) {
            if (site.observation_source == 'openaq'){

                console.log("this is openaq data: " + index)
                
                get_open_aq_observations(index, param).then((site_data) => all_sites.push(site_data));
            }
            else{
                var location = {};
                location.site_data = [];
    
                location.site_data.openaq_id = index;
                location.site_data.location = site.location_name;
                location.site_data.latitude = site.lat;
                location.site_data.longitude = site.lon;
                location.site_data.status = site.status;
                location.site_data.obs_source = site.observation_source;
                location.obs_options = site.obs_options;
                location.meta_data = "data is now updated";
                location.latest_n02 = "---";
                location.latest_03 = "---";
                location.latest_SO2 = "---";
                location.latest_pm25 = "---";
                
                location.latest_measurments = "---";
                all_sites.push(location)
            }           

    });



    return Promise.resolve(all_sites);
}

function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
    const arr = rows.map(function(row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function(object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    return arr;
}
function readApiBaker(options = {}) {
    const {
        location = "",
        timezone = "UTC",
        plotType = "aqi",
        isModal = false,
        current_forecast_timestamp = null
    } = options;

    // Timestamp
    window.currentForecastTimestamp = current_forecast_timestamp;
    window.hasCustomTimestamp = !!current_forecast_timestamp;

    const messages = [
        "Generating data", 
        "Connecting to API Baker", 
        "Fetching the data from API Baker", 
        "Fetching observations", 
        "Getting the forecasts", 
        "Please wait...", 
        "Connecting..."
    ];
    $('.loader').show();


    const locationWithUnderscore = location.replace(/[-\s]/g, "_");
    const locationWithHyphen = location.replace(/[_\s]/g, "-");
    const fileUrl = `https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/all_dts/${locationWithUnderscore}.json?version=${new Date().getTime()}`;

    fetch(fileUrl)
        .then(response => {
            if (!response.ok) {
                const fallbackUrl = `https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/all_dts/${locationWithHyphen}.json?version=${new Date().getTime()}`;
                return fetch(fallbackUrl).then(fallbackResponse => {
                    if (!fallbackResponse.ok) throw new Error('Network response was not ok');
                    return fallbackResponse.text();
                });
            }
            return response.text();
        })
        .then(text => {
            const sanitizedText = text.replace(/NaN/g, "null");
            return JSON.parse(sanitizedText); 
        })
        .then(data => {
            console.log("Data from API Baker:", data);
            if (!data || !Array.isArray(data.forecasts) || data.forecasts.length === 0) {
                console.error("Data validation failed:", {
                    hasData: !!data,
                    status: data?.status,
                    hasForecasts: Array.isArray(data?.forecasts),
                    forecastsLength: data?.forecasts?.length
                });
                throw new Error("No valid data received");
            }

            let masterData = {
                master_datetime: [],
                master_no2: [],
                master_no2_aqi: [],
                master_o3: [],
                master_o3_aqi: [],
                master_pm25: [],
                master_pm25_aqi: [],
                master_pm25_conc_cnn: [],
                master_pm25source: [],
                master_predicted: [],
                master_predicted_aqi: [],
                master_overall_aqi: [],
                master_observation: [],
                master_observation_source: [],   
                master_observation_pandora: [],   
                master_observation_corrected: [], 
                master_t: [],
                master_rh: [],
                master_wind: []
            };

            let timezone = data.timezone;

            data.forecasts.forEach(forecast => {
                if (forecast.local_time) {
                    masterData.master_datetime.push(forecast.local_time);
                }
                // NO2 
                masterData.master_no2.push(
                    (forecast.no2 !== undefined && forecast.no2 !== null) ? forecast.no2 : null
                );
                // O3 
                masterData.master_o3.push(
                    (forecast.o3 !== undefined && forecast.o3 !== null) ? forecast.o3 : null
                );
                
                if (forecast.pm25_conc_cnn !== undefined && forecast.pm25_conc_cnn !== null) {
                    masterData.master_pm25.push(forecast.pm25_conc_cnn);
                    masterData.master_pm25_conc_cnn.push(forecast.pm25_conc_cnn);
                } else if (forecast.PM25_NowCast_Concentration !== undefined && forecast.PM25_NowCast_Concentration !== null) {
                    masterData.master_pm25.push(forecast.PM25_NowCast_Concentration);
                    masterData.master_pm25_conc_cnn.push(forecast.PM25_NowCast_Concentration);
                } else if (forecast.pm25_rh35 !== undefined && forecast.pm25_rh35 !== null) {
                    masterData.master_pm25.push(forecast.pm25_rh35);
                    masterData.master_pm25_conc_cnn.push(forecast.pm25_rh35);
                } else if (forecast.pm25 !== undefined && forecast.pm25 !== null) {
                    masterData.master_pm25.push(forecast.pm25);
                    masterData.master_pm25_conc_cnn.push(forecast.pm25);
                } else {
                    masterData.master_pm25.push(null);
                    masterData.master_pm25_conc_cnn.push(null);
                }

                // PM25 source
                masterData.master_pm25source.push(forecast.pm25source || null);

                if (forecast.PM25_NowCast_AQI !== undefined && forecast.PM25_NowCast_AQI !== null) {
                    masterData.master_pm25_aqi.push(forecast.PM25_NowCast_AQI);
                } else if (forecast.pm25_aqi !== undefined && forecast.pm25_aqi !== null) {
                    masterData.master_pm25_aqi.push(forecast.pm25_aqi);
                } else if (forecast.pm25_conc_cnn !== undefined && forecast.pm25_conc_cnn !== null) {
                    masterData.master_pm25_aqi.push(calculateAqiForPm25(forecast.pm25_conc_cnn));
                } else {
                    masterData.master_pm25_aqi.push(null);
                }

                if (forecast.corrected !== undefined && forecast.corrected !== null) {
                    masterData.master_predicted.push(forecast.corrected);
                }
                if (forecast.pandora !== undefined && forecast.pandora !== null && !isNaN(forecast.pandora)) {
                    masterData.master_observation.push(forecast.pandora);
                    masterData.master_observation_source.push("pandora");
                    masterData.master_observation_pandora.push(forecast.pandora);
                    masterData.master_observation_corrected.push(null);
                } else if (forecast.corrected !== undefined && forecast.corrected !== null && !isNaN(forecast.corrected)) {
                    masterData.master_observation.push(forecast.corrected);
                    masterData.master_observation_source.push("corrected");
                    masterData.master_observation_pandora.push(null);
                    masterData.master_observation_corrected.push(forecast.corrected);
                } else {
                    masterData.master_observation.push(null);
                    masterData.master_observation_source.push(null);
                    masterData.master_observation_pandora.push(null);
                    masterData.master_observation_corrected.push(null);
                }
                const tVal = forecast.t10m ?? forecast.t ?? null;
                masterData.master_t.push(tVal !== null ? Math.round(tVal - 273.15) : null);
                masterData.master_rh.push(forecast.rh != null ? Math.round(forecast.rh <= 1 ? forecast.rh * 100 : forecast.rh) : null);
                masterData.master_wind.push(forecast.wind_speed != null ? Math.round(forecast.wind_speed * 10) / 10 : null);
                

                if (forecast.NO2_AQI !== undefined && forecast.NO2_AQI !== null) {
                    masterData.master_no2_aqi.push(forecast.NO2_AQI);
                } else if (forecast.no2_aqi !== undefined && forecast.no2_aqi !== null) {
                    masterData.master_no2_aqi.push(forecast.no2_aqi);
                } else if (forecast.no2 !== undefined && forecast.no2 !== null) {
                    masterData.master_no2_aqi.push(calculateAqiForNo2(forecast.no2));
                } else {
                    masterData.master_no2_aqi.push(null);
                }

                if (forecast.O3_AQI !== undefined && forecast.O3_AQI !== null) {
                    masterData.master_o3_aqi.push(forecast.O3_AQI);
                } else if (forecast.o3_aqi !== undefined && forecast.o3_aqi !== null) {
                    masterData.master_o3_aqi.push(forecast.o3_aqi);
                } else if (forecast.o3 !== undefined && forecast.o3 !== null) {
                    masterData.master_o3_aqi.push(calculateAqiForO3(forecast.o3));
                } else {
                    masterData.master_o3_aqi.push(null);
                }
                
                if (forecast.overall_aqi !== undefined && forecast.overall_aqi !== null) {
                    masterData.master_overall_aqi.push(Math.round(forecast.overall_aqi));
                } else {
                    masterData.master_overall_aqi.push(null);
                }
            });
            
            // Hero
            generateForecastHeroSection(masterData, location, timezone, options.param);
            
            const tabsNav = $("#pills-tabContent").prev();
            const tabsContainer = $(".tab-content");
            tabsNav.empty();
            tabsContainer.empty();
            const tabsList = $('<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist"></ul>');
            tabsNav.append(tabsList);

            const plots = [
                {
                    id: "plot_overall_aqi",
                    title: "Overall Air Quality Index (AQI)",
                    unit: "US AQI",
                    data: masterData,
                    param: "overall",
                    tabName: "Overall Air Quality Index",
                    tabId: "tab_overall",
                    description: "Source: Composite of all pollutant AQI values",
                    columns: [
                        { column: "master_overall_aqi", name: "Overall AQI", color: "#F57C00", width: 2 }
                    ],
                    naaqsValue: 50,
                    naaqsLabel: "NAAQS Recommended AQI 50",
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: true,
                    additionalColumns: ["master_no2_aqi", "master_pm25_aqi"]
                },
                {
                    id: "plot_corrected_conc",
                    title: `SNWG NO<sub>2</sub> Bias-Corrected Forecast`,
                    unit: "parts per billion by volume (ppbv)",
                    data: masterData,
                    param: "no2",
                    tabName: "Nitrogen Dioxide (NO<sub>2</sub>)",
                    tabId: "tab_no2",
                    description: "Source: NASA SNWG bias-corrected forecasts",
                    columns: [
                        { column: "master_predicted", name: "Estimated NO₂", color: "#1565C0", width: 2 }
                    ],
                    // naaqs
                    naaqsValue: 53,
                    naaqsLabel: "NAAQS Annual Standard (53 ppbv NO₂)",
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                },
                {
                    id: "plot_pm25_conc",
                    title: `Particulate Matter (PM<sub>2.5</sub>) Concentration`,
                    unit: "μg/m³",
                    data: masterData,
                    param: "pm25",
                    tabName: "Fine Particulate Matter (PM<sub>2.5</sub>)",
                    tabId: "tab_pm25",
                    description: "Source: NASA GEOS-CF PM2.5 Concentration Forecast",
                    columns: [
                        { column: "master_pm25_conc_cnn", name: "PM2.5", color: "#732905", width: 2 }
                    ],
                    // naaqs
                    naaqsValue: 9,
                    naaqsLabel: "NAAQS Annual Standard (9 μg/m³ PM2.5)",
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false, 
                    sourceColumn: "master_pm25source",
                    param_text: "PM2.5 Concentration",
                },
                {
                    id: "plot_o3_conc",
                    title: `Ozone (O<sub>3</sub>) Concentration`,
                    unit: "parts per billion by volume (ppbv)",
                    data: masterData,
                    param: "o3",
                    tabName: "Ozone (O<sub>3</sub>)",
                    tabId: "tab_o3",
                    description: "Source: NASA GEOS-CF",
                    columns: [
                        { column: "master_o3", name: "O₃", color: "#E65100", width: 2 }
                    ],

                    naaqsValue: 70,
                    naaqsLabel: "NAAQS 8-hr Standard (70 ppbv O₃)",                    
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                },


                (() => {
                    const hasPandora = masterData.master_observation_source.some(s => s === "pandora");
                    const hasCorrected = masterData.master_observation_source.some(s => s === "corrected");
                    const columns = [];
                    if (hasPandora) {
                        columns.push({ column: "master_observation_pandora", name: "Pandora NO₂ (observed)", color: "#1565C0", width: 2 });
                    }
                    if (hasCorrected) {
                        columns.push({ column: "master_observation_corrected", name: "Estimated NO₂", color: "#5252A3", width: 3, dash: "dot" });
                    }
                    if (!columns.length) {
                        columns.push({ column: "master_observation", name: "NO₂ Observation", color: "#1565C0", width: 2 });
                    }
                    return {
                        id: "plot_pandora",
                        title: hasPandora && hasCorrected
                            ? "Pandora NO<sub>2</sub> Observations"
                            : hasPandora
                                ? "Pandora NO<sub>2</sub> Observations"
                                : "NO<sub>2</sub> Observations (Bias-Corrected Forecast)",
                        unit: "parts per billion by volume (ppbv)",
                        data: masterData,
                        param: "no2",
                        tabName: "Nitrogen dioxide (NO<sub>2</sub>)",
                        tabId: "tab_no2",
                        description: hasPandora && hasCorrected
                            ? "Source: NASA Pandora · Corrected forecast used where Pandora is unavailable"
                            : hasPandora
                                ? "Source: NASA Pandora"
                                : "Source: NASA SNWG bias-corrected forecast (Pandora data unavailable)",
                        columns,
                        // naaqs
                        naaqsValue: 53,
                        naaqsLabel: "NAAQS Annual Standard (53 ppbv NO₂)",
                        displayAQI: false,
                        displayMetrics: false,
                        enableAqiColors: false
                    };
                })(),
                {
                    id: "plot_no2_model",
                    title: "Model-based NO<sub>2</sub> Forecast (GEOS-CF)",
                    unit: "parts per billion by volume (ppbv)",
                    data: masterData,
                    param: "no2",
                    tabName: "Nitrogen dioxide (NO<sub>2</sub>)",
                    tabId: "tab_no2",
                    description: "Source: NASA GEOS-CF",
                    columns: [
                        { column: "master_no2", name: "GEOS-CF NO₂", color: "#1565C0", width: 2 }
                    ],
                    naaqsValue: 53,
                    naaqsLabel: "NAAQS Annual Standard (53 ppbv NO₂)",
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                },
                {
                    id: "plot_no2_aqi",
                    title: "NO<sub>2</sub> Air Quality Index (AQI)",
                    unit: "US AQI",
                    data: masterData,
                    param: "no2",
                    tabName: "Nitrogen Dioxide (NO<sub>2</sub>)",
                    tabId: "tab_no2",
                    description: "Source: NASA SNWG and GEOS-CF",
                    columns: [
                        { column: "master_no2_aqi", name: "NO₂ AQI", color: "#1565C0", width: 2 }
                    ],
                    naaqsValue: 50,
                    naaqsLabel: "NAAQS Recommended AQI 50",
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: true
                },
                {
                    id: "plot_pm25_aqi",
                    title: "PM<sub>2.5</sub> Air Quality Index (AQI)",
                    unit: "US AQI",
                    data: masterData,
                    param: "pm25",
                    tabName: "Fine Particulate Matter (PM<sub>2.5</sub>)",
                    tabId: "tab_pm25",
                    description: "Source: NASA GEOS-CF PM2.5",
                    columns: [
                        { column: "master_pm25_aqi", name: "PM₂.₅ AQI", color: "#2E7D32", width: 2 }
                    ],
                    naaqsValue: 50,
                    naaqsLabel: "NAAQS Recommended AQI 50",
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: true,
                    sourceColumn: "master_pm25source",
                    param_text: "PM2.5 AQI",
                },
                {
                    id: "plot_o3_aqi",
                    title: "Ozone (O<sub>3</sub>) Air Quality Index (AQI)",
                    unit: "US AQI",
                    data: masterData,
                    param: "o3",
                    tabName: "Ozone (O<sub>3</sub>)",
                    tabId: "tab_o3",
                    description: "Source: NASA GEOS-CF",
                    columns: [
                        { column: "master_o3_aqi", name: "O₃ AQI", color: "#E65100", width: 2 }
                    ],
                    naaqsValue: 50,
                    naaqsLabel: "NAAQS Recommended AQI 50",
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: true
                }
            ];

            const hasRealData = (arr) => Array.isArray(arr) && arr.some(v => v !== null && v !== undefined && !isNaN(v));

            const tabMap = {};
            plots.forEach((plot, index) => {
                const colKey = plot.columns[0]?.column;
                const dataArr = plot.data && colKey ? plot.data[colKey] : [];
                if (!hasRealData(dataArr)) {
                    return;
                }

                const tabId = plot.tabId;
                if (!tabMap[tabId]) {
                    const isActive = tabId === "tab_overall" || Object.keys(tabMap).length === 0 ? "active" : "";
                    tabsList.append(`
                        <li class="nav-item" role="presentation">
                            <a class="nav-link ${isActive}" id="tab-${tabId}" data-bs-toggle="pill" href="#${tabId}" role="tab" aria-controls="${tabId}" aria-selected="${isActive === 'active'}">
                                ${plot.tabName}
                            </a>
                        </li>
                    `);
                    tabsContainer.append(`
                        <div class="tab-pane fade${isActive ? ' show active' : ''}" id="${tabId}" role="tabpanel" aria-labelledby="tab-${tabId}">
                        <div class="frcst-plt-dets"> <h2>${pollutant_details(plot.param, "full")}</h2><p>${pollutant_details(plot.param, "desc")}</p></div>
                        
                            <div class="plot-container" id="${plot.id}"></div>
                            <div class="aqi-container" id="aqi-${plot.id}"></div>
                        </div>
                    `);
                    tabMap[tabId] = true;
                } else {
                    $(`#${tabId}`).append(`<div class="plot-container" id="${plot.id}"></div><div class="aqi-container" id="aqi-${plot.id}"></div>`);
                }


                const siteTimeZone = timezone;
                const now = new Date();
                const pad = n => n.toString().padStart(2, '0');
                const siteLocalNow = new Date(now.toLocaleString("en-US", { timeZone: siteTimeZone }));
                const localYear = siteLocalNow.getFullYear();
                const localMonth = pad(siteLocalNow.getMonth() + 1);
                const localDate = pad(siteLocalNow.getDate());
                const currentHour = siteLocalNow.getHours();
                const nextHour = (currentHour + 1) % 24;
                const currentLocalStr = `${localYear}-${localMonth}-${localDate} ${pad(currentHour)}`;
                const nextLocalStr = `${localYear}-${localMonth}-${localDate} ${pad(nextHour)}`;
                

                let currentValue = 'N/A';
                let nextValue = 'N/A';
                
                
                if (plot.param === "pm25") {

                    currentValue = 'N/A';
                    nextValue = 'N/A';
                    for (let i = 0; i < masterData.master_datetime.length; i++) {
                        const dtStr = masterData.master_datetime[i];
                        if (!dtStr) continue;
                        const forecastStart = new Date(dtStr.replace(' ', 'T'));
                        const forecastEnd = new Date(forecastStart.getTime() + 3 * 60 * 60 * 1000);

                        if (siteLocalNow >= forecastStart && siteLocalNow < forecastEnd) {
                            currentValue = masterData[plot.columns[0].column][i];
                        }

                        const nextLocalDate = new Date(siteLocalNow.getTime() + 1 * 60 * 60 * 1000);
                        if (nextLocalDate >= forecastStart && nextLocalDate < forecastEnd) {
                            nextValue = masterData[plot.columns[0].column][i];
                        }
                    }
                } else {

                    currentValue = 'N/A';
                    nextValue = 'N/A';
                    for (let i = 0; i < masterData.master_datetime.length; i++) {
                        const dtStr = masterData.master_datetime[i];
                        if (!dtStr) continue;
                        const forecastHourStr = dtStr.slice(0, 13);
                        if (forecastHourStr === currentLocalStr) {
                            currentValue = masterData[plot.columns[0].column][i];
                        }
                        if (forecastHourStr === nextLocalStr) {
                            nextValue = masterData[plot.columns[0].column][i];
                        }
                    }
                }
                

                if (plot.displayAQI) {
                    const values = masterData.master_overall_aqi || [];
                    const datetimes = masterData.master_datetime || [];
                    const siteTimeZone = timezone;
                    const now = new Date();
                    const pad = n => n.toString().padStart(2, '0');
                    const siteLocalNow = new Date(now.toLocaleString("en-US", { timeZone: siteTimeZone }));
                    const localYear = siteLocalNow.getFullYear();
                    const localMonth = pad(siteLocalNow.getMonth() + 1);
                    const localDate = pad(siteLocalNow.getDate());
                    const currentHour = siteLocalNow.getHours();
                

                    function getAqiForHourOffset(offset) {
                        let targetIdx = -1;
                        if (plot.param === "pm25") {
                            const targetDate = new Date(siteLocalNow.getTime() + offset * 60 * 60 * 1000);
                            for (let i = 0; i < datetimes.length; i++) {
                                const dtStr = datetimes[i];
                                if (!dtStr) continue;
                                const forecastStart = new Date(dtStr.replace(' ', 'T'));
                                const forecastEnd = new Date(forecastStart.getTime() + 3 * 60 * 60 * 1000);
                                if (targetDate >= forecastStart && targetDate < forecastEnd) {
                                    targetIdx = i;
                                    break;
                                }
                            }
                        } else {
                            const targetHour = (currentHour + offset) % 24;
                            for (let i = 0; i < datetimes.length; i++) {
                                const hour = parseInt(datetimes[i].slice(11, 13), 10);
                                if (hour === targetHour) {
                                    targetIdx = i;
                                    break;
                                }
                            }
                        }
                        return targetIdx !== -1 ? values[targetIdx] : 'N/A';
                    }
                
                    const currentAqi = getAqiForHourOffset(0);
                    const nextAqi1 = getAqiForHourOffset(3);
                    const nextAqi2 = getAqiForHourOffset(6);
                    const nextAqi3 = getAqiForHourOffset(9);
                
                    const todayStr = siteLocalNow.toISOString().slice(0, 10);
                    const tomorrowDate = new Date(siteLocalNow.getTime() + 24 * 60 * 60 * 1000);
                    const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);
                
                    const todayVals = datetimes
                        .map((dt, i) => ({ dt, val: values[i] }))
                        .filter(({ dt }) => dt && dt.startsWith(todayStr))
                        .map(({ val }) => typeof val === "number" ? val : parseInt(val))
                        .filter(val => !isNaN(val));
                    const tomorrowVals = datetimes
                        .map((dt, i) => ({ dt, val: values[i] }))
                        .filter(({ dt }) => dt && dt.startsWith(tomorrowStr))
                        .map(({ val }) => typeof val === "number" ? val : parseInt(val))
                        .filter(val => !isNaN(val));
                
                    const todayAvg = todayVals.length ? parseInt(todayVals.reduce((a, b) => a + b, 0) / todayVals.length) : 'N/A';
                    const tomorrowAvg = tomorrowVals.length ? parseInt(tomorrowVals.reduce((a, b) => a + b, 0) / tomorrowVals.length) : 'N/A';
                

                    let aqiHtml = `
                        <div class="aqi-multi-hour-box">
                            <div class="aqi-multi-row">
                            <h6>Forecasted Air Quality Indices today (US Scale)</h6>
                                <div>${generateAqiElement(currentAqi, plot.param, siteTimeZone, currentHour)}<div style="text-align:center;font-size:12px;"></div></div>
                                <div>${generateAqiElement(nextAqi1, plot.param, siteTimeZone, (currentHour + 3) % 24)}<div style="text-align:center;font-size:12px;"></div></div>
                                <div>${generateAqiElement(nextAqi2, plot.param, siteTimeZone, (currentHour + 6) % 24)}<div style="text-align:center;font-size:12px;"></div></div>
                                <div>${generateAqiElement(nextAqi3, plot.param, siteTimeZone, (currentHour + 9) % 24)}<div style="text-align:center;font-size:12px;"></div></div>
                            </div>
                            <div class="aqi-multi-row">
                            <h6>Forecasted daily averages (US Scale)</h6>
                                <div>${generateAqiElement(todayAvg, plot.param, siteTimeZone, "Today")}</div>
                                <div>${generateAqiElement(tomorrowAvg, plot.param, siteTimeZone, "Tomorrow")}</div>
                            </div>
                        </div>
                    `;
                
                    const $plotContainer = $(`#${plot.id}`);
                    if ($plotContainer.length > 0) {
                        $plotContainer.before(aqiHtml);
                    }
                }
            if (plot.displayMetrics) {
            const columnKey = plot.columns[0].column;
            const values = masterData[columnKey] || [];
            const datetimes = masterData.master_datetime || [];
            const siteTimeZone = timezone || "UTC";
            const now = new Date();
            const pad = n => n.toString().padStart(2, '0');
            const siteLocalNow = new Date(now.toLocaleString("en-US", { timeZone: siteTimeZone }));

            const todayStr = siteLocalNow.toISOString().slice(0, 10);
            const tomorrowDate = new Date(siteLocalNow.getTime() + 24 * 60 * 60 * 1000);
            const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);
            const prevDate = new Date(siteLocalNow.getTime() - 24 * 60 * 60 * 1000);
            const prevStr = prevDate.toISOString().slice(0, 10);

            const prevVals = datetimes
            .map((dt, i) => ({ dt, val: values[i] }))
            .filter(({ dt }) => dt && dt.startsWith(prevStr))
            .map(({ val }) => typeof val === "number" ? val : parseFloat(val))
            .filter(val => !isNaN(val));
            const todayVals = datetimes
            .map((dt, i) => ({ dt, val: values[i] }))
            .filter(({ dt }) => dt && dt.startsWith(todayStr))
            .map(({ val }) => typeof val === "number" ? val : parseFloat(val))
            .filter(val => !isNaN(val));
            const tomorrowVals = datetimes
            .map((dt, i) => ({ dt, val: values[i] }))
            .filter(({ dt }) => dt && dt.startsWith(tomorrowStr))
            .map(({ val }) => typeof val === "number" ? val : parseFloat(val))
            .filter(val => !isNaN(val));

            const prevAvg = prevVals.length ? prevVals.reduce((a, b) => a + b, 0) / prevVals.length : 'N/A';
            const todayAvg = todayVals.length ? todayVals.reduce((a, b) => a + b, 0) / todayVals.length : 'N/A';
            const tomorrowAvg = tomorrowVals.length ? tomorrowVals.reduce((a, b) => a + b, 0) / tomorrowVals.length : 'N/A';

            // Changes
            function getChangeRate(newVal, oldVal) {
            if (typeof newVal === "number" && typeof oldVal === "number" && oldVal !== 0) {
            const diff = newVal - oldVal;
            const pct = ((newVal - oldVal) / oldVal) * 100;
            return {
            diff: diff.toFixed(2),
            pct: pct.toFixed(2),
            sign: pct > 0 ? "+" : "",
            class: pct > 0 ? "red" : pct < 0 ? "green" : "",
            arrow: pct > 0 ? "▲" : pct < 0 ? "▼" : ""
            };
            }
            return { diff: "N/A", pct: "N/A", sign: "", class: "", arrow: "" };
            }

            const changeTodayVsPrev = getChangeRate(todayAvg, prevAvg);
            const changeTomorrowVsToday = getChangeRate(tomorrowAvg, todayAvg);

            // Metrics
            const metricsHtml = `
            <div class="xvg_aqi-container">
            <div class="d-xvg" style="flex:1;">
            <div class="xvg_aqi me-3" style="font-size:2em;">${todayAvg !== 'N/A' ? todayAvg.toFixed(2) : '--'}</div>
            <div class="xvg_aqi-change">Today Avg</div>
            <div class="xvg_aqi-change ${changeTodayVsPrev.class}" style="margin-top:8px;">
            ${changeTodayVsPrev.arrow} ${changeTodayVsPrev.sign}${changeTodayVsPrev.diff} (${changeTodayVsPrev.sign}${changeTodayVsPrev.pct !== "N/A" ? changeTodayVsPrev.pct + "%" : "--"})
            </div>
            <div class="xvg_timestamp" style="font-size:12px;">vs Previous Day</div>
            </div>
            <div class="d-xvg" style="flex:1;">
            <div class="xvg_aqi me-3" style="font-size:2em;">${tomorrowAvg !== 'N/A' ? tomorrowAvg.toFixed(2) : '--'}</div>
            <div class="xvg_aqi-change">Tomorrow Avg</div>
            <div class="xvg_aqi-change ${changeTomorrowVsToday.class}" style="margin-top:8px;">
            ${changeTomorrowVsToday.arrow} ${changeTomorrowVsToday.sign}${changeTomorrowVsToday.diff} (${changeTomorrowVsToday.sign}${changeTomorrowVsToday.pct !== "N/A" ? changeTomorrowVsToday.pct + "%" : "--"})
            </div>
            <div class="xvg_timestamp" style="font-size:12px;">vs Today</div>
            </div>
            </div>
            `;

            const $plotContainer = $(`#${plot.id}`);
            if ($plotContainer.length > 0) {
            $plotContainer.before(metricsHtml);
            }
            }
            });

            $(".nav-link").on("click", function () {
                const targetTabId = $(this).attr("href").replace("#", "");
                $(".tab-pane").removeClass("active show");
                $(`#${targetTabId}`).addClass("active show");
            });

            plots.forEach(plot => {
                const colKey = plot.columns[0]?.column;
                const dataArr = plot.data && colKey ? plot.data[colKey] : [];
                if (!hasRealData(dataArr)) return;
                const plotContainer = $(`#${plot.id}`);
                plotContainer.before(`<div class="plot_description"><h4>${plot.title}</h4><h6>${plot.description || ""}</h6></div>`);
                if (plotContainer.length > 0) {
                    draw_plot(
                        plot.data,
                        plot.param,
                        plot.unit, 
                        plot.id,
                        plot.columns,
                        false,
                        false,
                        "",
                        "bar",
                        timezone,
                        plot.enableAqiColors,
                        plot.naaqsValue ?? null,
                        plot.naaqsLabel ?? '',
                        plot.sourceColumn ?? null,
                        plot.additionalColumns ?? null,
                        plot.param_text ?? null,
                    );
                } else {
                    console.error(`No DOM element with id '${plot.id}' exists on the page.`);
                }
            });

            


            $(".nav-link").on("click", function () {
                const targetTabId = $(this).attr("href").replace("#", "");
                $(".tab-pane").removeClass("active show");
                $(`#${targetTabId}`).addClass("active show");

                $(`#${targetTabId} .plot-container`).each(function() {
                    if (this.id) {
                        Plotly.Plots.resize(this.id);
                    }
                });
            });
                        

            $('.loader').hide();
        })
        .catch(error => {
            console.error("Error loading data:", error);
            $('.thewindow').html(`
                <h3 style="text-align: center; color: red; margin-top: 20px;">Sorry :(</h3>
                <p style="text-align: justify;">The forecasts for this location have not been updated recently. Please check back soon, or feel free to contact us at noussair.lazrak@nyu.edu</p>
            `);
            $('.model_data').html(``);
            $('.loader').hide();
        });
}
function calculateAqiForNo2(concentration) {
    if (concentration === null || concentration === undefined || isNaN(concentration)) {
        return 'N/A';
    }

    const breakpoints = [
        { concentration: [0, 53], aqi: [0, 50] },
        { concentration: [54, 100], aqi: [51, 100] },
        { concentration: [101, 360], aqi: [101, 150] },
        { concentration: [361, 649], aqi: [151, 200] },
        { concentration: [650, 1249], aqi: [201, 300] },
        { concentration: [1250, 2049], aqi: [301, 400] },
        { concentration: [2050, 4049], aqi: [401, 500] }
    ];

    for (const breakpoint of breakpoints) {
        const [cLow, cHigh] = breakpoint.concentration;
        const [aqiLow, aqiHigh] = breakpoint.aqi;

        if (concentration >= cLow && concentration <= cHigh) {
            return Math.round(((aqiHigh - aqiLow) / (cHigh - cLow)) * (concentration - cLow) + aqiLow);
        }
    }

    return 'N/A'; 
}

function calculateAqiForO3(concentration) {
    if (concentration === null || concentration === undefined || isNaN(concentration)) {
        return 'N/A';
    }

    const breakpoints = [
        { concentration: [0.0, 0.054], aqi: [0, 50] },
        { concentration: [0.055, 0.070], aqi: [51, 100] },
        { concentration: [0.071, 0.085], aqi: [101, 150] },
        { concentration: [0.086, 0.105], aqi: [151, 200] },
        { concentration: [0.106, 0.200], aqi: [201, 300] }
    ];

    for (const breakpoint of breakpoints) {
        const [cLow, cHigh] = breakpoint.concentration;
        const [aqiLow, aqiHigh] = breakpoint.aqi;

        if (concentration >= cLow && concentration <= cHigh) {
            return Math.round(((aqiHigh - aqiLow) / (cHigh - cLow)) * (concentration - cLow) + aqiLow);
        }
    }

    return 'N/A';
}

function calculateAqiForPm25(concentration) {

    if (concentration === null || concentration === undefined || isNaN(concentration)) {
        return 'N/A';
    }

    const breakpoints = [
        { concentration: [0.0, 12.0], aqi: [0, 50] },
        { concentration: [12.1, 35.4], aqi: [51, 100] },
        { concentration: [35.5, 55.4], aqi: [101, 150] },
        { concentration: [55.5, 150.4], aqi: [151, 200] },
        { concentration: [150.5, 250.4], aqi: [201, 300] },
        { concentration: [250.5, 350.4], aqi: [301, 400] },
        { concentration: [350.5, 500.4], aqi: [401, 500] }
    ];

    for (const breakpoint of breakpoints) {
        const [cLow, cHigh] = breakpoint.concentration;
        const [aqiLow, aqiHigh] = breakpoint.aqi;

        if (concentration >= cLow && concentration <= cHigh) {
            return Math.round(((aqiHigh - aqiLow) / (cHigh - cLow)) * (concentration - cLow) + aqiLow);
        }
    }

    return 'N/A';
}

function generateForecastHeroSection(masterData, locationName, timezone, requestedParam) {
    const $heroSection = $('#forecast-hero-section');
    if (!$heroSection.length) return;

    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');


    let siteTimeZone = (timezone && timezone !== 'UTC') ? timezone : null;
    if (!siteTimeZone) {
        const firstDt = (masterData.master_datetime || []).find(dt => dt && dt.length >= 22);
        if (firstDt) {
            const sign = firstDt[19] === '-' ? -1 : 1;
            const parts = firstDt.slice(20).split(':');
            const offsetH = sign * (parseInt(parts[0]) || 0);
            siteTimeZone = offsetH === 0 ? 'UTC' : `Etc/GMT${offsetH > 0 ? -offsetH : '+' + (-offsetH)}`;
        } else {
            siteTimeZone = 'UTC';
        }
    }

    const fmtParts = {};
    new Intl.DateTimeFormat('en-US', {
        timeZone: siteTimeZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(now).forEach(p => { fmtParts[p.type] = p.value; });

    const currentHour = parseInt(fmtParts.hour) % 24;
    const currentMin  = fmtParts.minute;
    const sYear = fmtParts.year, sMon = fmtParts.month, sDay = fmtParts.day;
    const siteTodayStr     = `${sYear}-${sMon}-${sDay}`;
    const noonUTC          = Date.UTC(parseInt(sYear), parseInt(sMon) - 1, parseInt(sDay), 12);
    const siteTomorrowStr  = new Date(noonUTC + 86400000).toISOString().slice(0, 10);
    const siteYesterdayStr = new Date(noonUTC - 86400000).toISOString().slice(0, 10);


    const addHours = (offsetH) => {
        const totalH = currentHour + offsetH;
        const dayOff = Math.floor(totalH / 24);
        const h = ((totalH % 24) + 24) % 24;
        const base = new Date(noonUTC + dayOff * 86400000);
        return { year: base.getUTCFullYear().toString(), month: pad(base.getUTCMonth()+1), day: pad(base.getUTCDate()), hour: h };
    };

    // aqi
    let aqiData = [], pollutantLabel = 'NO₂';
    const hasOverallAqi = masterData.master_overall_aqi && masterData.master_overall_aqi.some(v => v != null);
    if (requestedParam && requestedParam.toLowerCase().includes('pm25')) {
        aqiData = hasOverallAqi ? masterData.master_overall_aqi : (masterData.master_pm25_aqi || []);
        pollutantLabel = 'PM2.5';
    } else {
        aqiData = hasOverallAqi ? masterData.master_overall_aqi : (masterData.master_predicted_aqi || masterData.master_no2_aqi || []);
    }
    const datetimes = masterData.master_datetime || [];


    const findAqi = (localHourStr) => {
        // Exact match
        for (let i = 0; i < datetimes.length; i++) {
            if (datetimes[i] && datetimes[i].slice(0, 13) === localHourStr && aqiData[i] != null)
                return Math.round(aqiData[i]);
        }
        // nearest
        const targetH = parseInt(localHourStr.slice(11, 13));
        const targetDate = localHourStr.slice(0, 10);
        let bi = -1, bd = Infinity;
        for (let i = 0; i < datetimes.length; i++) {
            if (!datetimes[i] || aqiData[i] == null) continue;
            // adjacent
            const dtDate = datetimes[i].slice(0, 10);
            if (dtDate !== targetDate) continue;
            const dtH = parseInt(datetimes[i].slice(11, 13));
            const d = Math.abs(dtH - targetH);
            if (d < bd && d <= 3) { bd = d; bi = i; }
        }
        return bi !== -1 ? Math.round(aqiData[bi]) : null;
    };

    const findAqiWithLocalTime = (localHourStr) => {
        let matchIndex = -1;
        // Exact match
        for (let i = 0; i < datetimes.length; i++) {
            if (datetimes[i] && datetimes[i].slice(0, 13) === localHourStr && aqiData[i] != null) {
                matchIndex = i;
                break;
            }
        }
        // Nearest within ±3h
        if (matchIndex === -1) {
            const targetH = parseInt(localHourStr.slice(11, 13));
            const targetDate = localHourStr.slice(0, 10);
            let bd = Infinity;
            for (let i = 0; i < datetimes.length; i++) {
                if (!datetimes[i] || aqiData[i] == null) continue;
                const dtDate = datetimes[i].slice(0, 10);
                if (dtDate !== targetDate) continue;
                const dtH = parseInt(datetimes[i].slice(11, 13));
                const d = Math.abs(dtH - targetH);
                if (d < bd && d <= 3) { bd = d; matchIndex = i; }
            }
        }
        
        const aqi = matchIndex !== -1 ? Math.round(aqiData[matchIndex]) : null;
        const localTime = matchIndex !== -1 && datetimes[matchIndex] ? datetimes[matchIndex].substring(11, 16) : '--';
        return { aqi, localTime, index: matchIndex };
    };

    const currentLocalStr = `${siteTodayStr} ${pad(currentHour)}`;
    const currentResult = findAqiWithLocalTime(currentLocalStr);
    let currentAqi = currentResult.aqi ?? '--';
    let localTimeStr = currentResult.localTime;

    const prevT = addHours(-1);
    const prevAqi = findAqi(`${prevT.year}-${prevT.month}-${prevT.day} ${pad(prevT.hour)}`);

    let changeValue = '--', changeClass = '', changeArrow = '';
    if (typeof currentAqi === 'number' && typeof prevAqi === 'number') {
        const diff = currentAqi - prevAqi;
        changeValue = Math.abs(diff);
        changeClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : '';
        changeArrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '';
    }
    const aqiLevel = getAqiLevel(currentAqi);


    let currentThreeHourAvg = '--';
    const isDosMissionData = masterData.master_datetime && masterData.master_datetime.some(dt => {
        const hour = parseInt(dt.substring(11, 13));
        return hour % 3 === 0; 
    });
    
    if (isDosMissionData && typeof currentAqi === 'number') {
        currentThreeHourAvg = currentAqi;
    }

    // Daily aggregates
    const aggAqi = (prefix) => {
        const vals = datetimes.map((dt, i) => aqiData[i]).filter((v, i) => datetimes[i] && datetimes[i].startsWith(prefix) && typeof v === 'number');
        return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : '--';
    };
    const todayAvg = aggAqi(siteTodayStr), tomorrowAvg = aggAqi(siteTomorrowStr), yesterdayAvg = aggAqi(siteYesterdayStr);

    let dailyChange = '--', dailyChangeClass = '', dailyArrow = '';
    if (typeof todayAvg === 'number' && typeof yesterdayAvg === 'number') {
        const diff = todayAvg - yesterdayAvg;
        const pct = yesterdayAvg !== 0 ? ((diff/yesterdayAvg)*100).toFixed(1) : 0;
        dailyChange = `${diff > 0 ? '+' : ''}${diff} (${pct}%)`;
        dailyChangeClass = diff > 0 ? 'up' : diff < 0 ? 'down' : '';
        dailyArrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '';
    }


    const tData = masterData.master_t || [];
    const rhData = masterData.master_rh || [];
    const windData = masterData.master_wind || [];


    const urlTempUnit = (new URLSearchParams(window.location.search).get('temp') || 'c').toLowerCase();
    const useFahrenheit = urlTempUnit === 'f';
    const formatTemp = (tempC) => {
        if (tempC == null) return null;
        if (useFahrenheit) return Math.round(tempC * 9 / 5 + 32);
        return Math.round(tempC);
    };
    const tempUnitLabel = useFahrenheit ? '°F' : '°C';

    // Cutoff
    const nowLocalMs = now.getTime();
    const cutoff72h = nowLocalMs + 72 * 3600 * 1000;


    const allForecastCards = datetimes.map((dt, i) => {
        if (!dt) return null;
        const dtMs = new Date(dt.replace(' ', 'T')).getTime();
        if (isNaN(dtMs)) return null;
        const aqi = aqiData[i] != null ? Math.round(aqiData[i]) : '--';
        const forecastHour = parseInt(dt.substring(11, 13));
        const forecastDate = dt.substring(0, 10);
        
        let isNow = false;
        if (isDosMissionData) {
            const windowStart = Math.floor(currentHour / 3) * 3;

            isNow = forecastDate === siteTodayStr && forecastHour === windowStart;
        } else {
            isNow = forecastDate === siteTodayStr && forecastHour === currentHour;
        }
        
        const isPast = dtMs < nowLocalMs - 1800000;
        const isFuture72 = dtMs <= cutoff72h;
        const dateStr = dt.slice(0, 10);
        const hourStr = dt.slice(11, 16);
        const tempC = tData[i];
        const rh = rhData[i];
        const wind = windData[i];
        return { dt, dtMs, dateStr, hourStr, aqi, isNow, isPast, isFuture72, tempC: formatTemp(tempC), rh, wind };
    }).filter(f => f && (f.isNow || (!f.isPast && f.isFuture72)));

    const periodHours = { '6h': 6, '12h': 12, '18h': 18, '24h': 24, '48h': 48, '72h': 72 };

    const buildCards = (maxHours) => {
        const cutoff = nowLocalMs + maxHours * 3600 * 1000;
        const cards = allForecastCards.filter(f => f.isNow || f.dtMs <= cutoff);
        if (!cards.length) return '<div style="padding:16px;color:#aaa;font-size:12px;">No forecast data</div>';
        
        let foundNow = false;
        cards.forEach(f => {
            if (f.isNow && !foundNow) {
                foundNow = true;
                f.aqi = currentAqi;
            } else if (f.isNow && foundNow) {
                f.isNow = false;
            }
        });
        
        let lastDate = null;
        return cards.map(f => {
            let dateHeader = '';
            if (f.dateStr !== lastDate) {
                lastDate = f.dateStr;
                const d = new Date(f.dateStr + 'T12:00:00Z');
                const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                dateHeader = `<div class="forecast-date-header">${label}</div>`;
            }
            const metHtml = (f.tempC != null || f.rh != null) ? `
                <div class="card-met">
                    ${f.tempC != null ? `<span class="card-met-t"><i class="bi bi-thermometer-half"></i>${f.tempC}${tempUnitLabel}</span>` : ''}
                    ${f.rh != null ? `<span class="card-met-rh"><i class="bi bi-droplet-half"></i>${f.rh}%</span>` : ''}
                </div>` : '';
            return `${dateHeader}<div class="forecast-card${f.isNow ? ' forecast-card-now' : ''}">
                <div class="card-time">${f.isNow ? 'Now' : f.hourStr}</div>
                <div class="card-aqi" style="color:${getAqiLevel(f.aqi).color};">${f.aqi}</div>
                <div class="card-level">${getAqiLevel(f.aqi).level}</div>
                ${metHtml}
            </div>`;
        }).join('');
    };

    // mini bar chart 
    const sourceData = masterData.master_pm25source || [];
    const findEntry = (localHourStr) => {
        for (let i = 0; i < datetimes.length; i++) {
            if (datetimes[i] && datetimes[i].slice(0, 13) === localHourStr && aqiData[i] != null)
                return { aqi: Math.round(aqiData[i]), source: sourceData[i] || null };
        }
        const targetDate = localHourStr.slice(0, 10);
        const targetH = parseInt(localHourStr.slice(11, 13));
        let bi = -1, bd = Infinity;
        for (let i = 0; i < datetimes.length; i++) {
            if (!datetimes[i] || aqiData[i] == null) continue;
            if (datetimes[i].slice(0, 10) !== targetDate) continue;
            const d = Math.abs(parseInt(datetimes[i].slice(11, 13)) - targetH);
            if (d < bd && d <= 3) { bd = d; bi = i; }
        }
        return bi !== -1 ? { aqi: Math.round(aqiData[bi]), source: sourceData[bi] || null } : null;
    };

    const barPoints = [];
    for (let off = -12; off <= 24; off++) {
        const t = addHours(off);
        const entry = findEntry(`${t.year}-${t.month}-${t.day} ${pad(t.hour)}`);
        barPoints.push({ off, hour: t.hour, aqi: entry ? entry.aqi : null, source: entry ? entry.source : null, isCurrent: off === 0 });
    }

    const validAqis = barPoints.filter(p => p.aqi !== null).map(p => p.aqi);
    const maxAqi = Math.max(...validAqis, 50);
    const chartMax = Math.max(maxAqi * 1.15, 60);
    const scaleLines = [50, 100, 150, 200].filter(v => v <= chartMax);

    // Week stats 
    const weekMin  = validAqis.length ? Math.min(...validAqis) : null;
    const weekMax2 = validAqis.length ? Math.max(...validAqis) : null;
    const weekAvg  = validAqis.length ? Math.round(validAqis.reduce((a,b)=>a+b,0)/validAqis.length) : null;

    // Source colors 
    const sourceColors = { 'GEOS-CF': '#1565C0', 'GEOS-FP': '#00838F', 'MERRA-2': '#6A1B9A', 'AirNow': '#2E7D32', 'CNN': '#BF360C', 'ML': '#E65100' };
    const getSourceColor = (s) => sourceColors[s] || '#888';
    const uniqueSources = [...new Set(barPoints.filter(p=>p.source).map(p=>p.source))];
    const sourceLegendHtml = uniqueSources.length > 0 ? `
        <div class="mini-source-legend">
            <span class="source-legend-label">Source:</span>
            ${uniqueSources.map(s => `<span class="source-chip" style="border-color:${getSourceColor(s)};color:${getSourceColor(s)};">&#9679; ${s}</span>`).join('')}
        </div>` : '';


    const makeStatLine = (val, label, cMax, opts = {}) => val !== null && val <= cMax ?
        `<div class="mini-stat-line ${opts.cls || ''}" style="bottom:${Math.min(Math.round((val/cMax)*100), 99)}%;border-top-style:${opts.dash !== false ? 'dashed' : 'solid'};" title="${label}: ${val}">
            <span class="mini-stat-label">${label} ${val}</span>
        </div>` : '';


    const epaGoodAqi = 50;


    const buildHourlyChart = () => {
        const scalesH = [50, 100, 150, 200].filter(v => v <= chartMax);
        return `
        <div class="mini-barchart-inner">
            <div class="mini-barchart-yscale">
                ${scalesH.slice().reverse().map(v => `
                <div class="yscale-tick" style="bottom:${Math.round((v/chartMax)*100)}%"><span>${v}</span></div>`).join('')}
            </div>
            <div class="mini-barchart-area">
                ${scalesH.map(v => `<div class="mini-grid-line" style="bottom:${Math.round((v/chartMax)*100)}%"></div>`).join('')}
                ${makeStatLine(weekAvg,  'Avg',  chartMax)}
                ${makeStatLine(epaGoodAqi, 'NAAQS Recommended AQI ', chartMax, { cls: 'mini-stat-line-epa' })}
                <div class="mini-barchart-bars">
                    ${barPoints.map(p => {
                        const rawPct = p.aqi !== null ? Math.max(Math.round((p.aqi / chartMax) * 100), 2) : 0;
                        const heightPct = Math.min(rawPct, 60);
                        const col = p.aqi !== null ? getAqiLevel(p.aqi).color : '#e0e0e0';
                        const srcCol = p.source ? getSourceColor(p.source) : 'transparent';
                        const showLabel = (p.off % 6 === 0);
                        const aqiLevel = p.aqi !== null ? getAqiLevel(p.aqi).level : '--';
                        return `<div class="mini-bar-wrap${p.isCurrent ? ' mini-bar-now' : ''}"
                            data-hour="${pad(p.hour)}:00"
                            data-aqi="${p.aqi ?? '--'}"
                            data-level="${aqiLevel}"
                            data-source="${p.source || '--'}"
                            data-color="${col}">
                            <div class="mini-bar-inner">
                                <div class="mini-bar" style="height:${heightPct}%;background:${col};box-shadow:inset 0 -3px 0 ${srcCol};"></div>
                                ${p.isCurrent ? `<div class="mini-bar-blink" style="background:${col};"></div>` : ''}
                            </div>
                            <div class="mini-bar-xlabel">${showLabel ? pad(p.hour)+':00' : ''}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>
        <div class="mini-barchart-xlegend">
            <span>← 12h ago</span><span>Now</span><span>+24h →</span>
        </div>`;
    };

    const dailyMap = new Map();
    for (let i = 0; i < datetimes.length; i++) {
        if (!datetimes[i] || aqiData[i] == null) continue;
        const dateKey = datetimes[i].slice(0, 10);
        if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, { aqis: [], sources: new Set() });
        dailyMap.get(dateKey).aqis.push(Math.round(aqiData[i]));
        const src = sourceData[i];
        if (src) dailyMap.get(dateKey).sources.add(src);
    }
    const dailyPoints = [...dailyMap.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .filter(([date]) => date >= siteYesterdayStr && date <= new Date(noonUTC + 6 * 86400000).toISOString().slice(0, 10))
        .map(([date, d]) => {
            const avg = Math.round(d.aqis.reduce((a, b) => a + b, 0) / d.aqis.length);
            const isToday = date === siteTodayStr;
            const sources = [...d.sources];
            const dayName = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' });
            const dateLabel = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return { date, avg, isToday, sources, dayName, dateLabel };
        });

    const buildDailyChart = () => {
        if (!dailyPoints.length) return '<div style="padding:20px;text-align:center;color:#aaa;font-size:12px;">No daily data</div>';
        const dailyAqis = dailyPoints.map(p => p.avg);
        const dMin  = Math.min(...dailyAqis);
        const dMax  = Math.max(...dailyAqis);
        const dAvg  = Math.round(dailyAqis.reduce((a, b) => a + b, 0) / dailyAqis.length);
        const dChartMax = Math.max(dMax * 1.15, 60);
        const dScales = [50, 100, 150, 200].filter(v => v <= dChartMax);
        return `
        <div class="mini-barchart-inner">
            <div class="mini-barchart-yscale">
                ${dScales.slice().reverse().map(v => `
                <div class="yscale-tick" style="bottom:${Math.round((v/dChartMax)*100)}%"><span>${v}</span></div>`).join('')}
            </div>
            <div class="mini-barchart-area">
                ${dScales.map(v => `<div class="mini-grid-line" style="bottom:${Math.round((v/dChartMax)*100)}%"></div>`).join('')}
                ${makeStatLine(dAvg, 'Avg', dChartMax)}
                ${makeStatLine(epaGoodAqi, 'NAAQS Recommended AQI ', dChartMax, { cls: 'mini-stat-line-epa' })}
                <div class="mini-barchart-bars">
                    ${dailyPoints.map(p => {
                        const rawPct = Math.max(Math.round((p.avg / dChartMax) * 100), 2);
                        const heightPct = Math.min(rawPct, 60);
                        const col = getAqiLevel(p.avg).color;
                        const srcCol = p.sources[0] ? getSourceColor(p.sources[0]) : 'transparent';
                        const aqiLevel = getAqiLevel(p.avg).level;
                        return `<div class="mini-bar-wrap${p.isToday ? ' mini-bar-now' : ''}" style="min-width:22px;"
                            data-hour="${p.dayName} ${p.dateLabel}"
                            data-aqi="${p.avg}"
                            data-level="${aqiLevel}"
                            data-source="${p.sources.join('/') || '--'}"
                            data-color="${col}">
                            <div class="mini-bar-inner">
                                <div class="mini-bar" style="height:${heightPct}%;background:${col};box-shadow:inset 0 -3px 0 ${srcCol};"></div>
                                ${p.isToday ? `<div class="mini-bar-blink" style="background:${col};"></div>` : ''}
                            </div>
                            <div class="mini-bar-xlabel">${p.dayName}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>
        <div class="mini-barchart-xlegend">
            <span>← Past</span><span>Today</span><span>Future →</span>
        </div>`;
    };

    const barChartHtml = (barPoints.length > 0 || dailyPoints.length > 0) ? `
        <div class="mini-barchart">
            <div class="mini-barchart-header">
                <div class="mini-barchart-title" id="fh-chart-title">Past 12h &amp; next 24h · US AQI</div>
                <div class="chart-toggle">
                    <button class="chart-toggle-btn active" id="fh-btn-hourly">Hourly</button>
                    <button class="chart-toggle-btn" id="fh-btn-daily">Daily</button>
                </div>
            </div>
            ${sourceLegendHtml}
            <div id="fh-hourly-chart">${buildHourlyChart()}</div>
            <div id="fh-daily-chart" style="display:none;">${buildDailyChart()}</div>
        </div>` : '';

    const formattedDate = now.toLocaleDateString('en-US', {
        timeZone: siteTimeZone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    const formattedTime = `${pad(currentHour)}:${currentMin}`;

    const tzLabel = (() => {
        try {
            const offsetMin = -new Date().toLocaleString('en-US', { timeZone: siteTimeZone, timeZoneName: 'shortOffset' })
                .split('GMT')[1]?.split(' ')[0]?.replace(':', '') || 0;
            const parts = new Intl.DateTimeFormat('en-US', { timeZone: siteTimeZone, timeZoneName: 'shortOffset' })
                .formatToParts(now);
            const tzPart = parts.find(p => p.type === 'timeZoneName');
            return tzPart ? tzPart.value.replace('GMT', 'UTC') : siteTimeZone;
        } catch(e) { return siteTimeZone; }
    })();
    const cleanLocation = locationName.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();

    const heroHtml = `
        <div class="forecast-header">
            <h1 class="location-name1">${cleanLocation}</h1>
            <div class="forecast-meta">US AQI · ${formattedTime} ${tzLabel} · ${formattedDate} · Local: ${localTimeStr}</div>
            <div class="aqi-hero">
                <span class="aqi-value-main">${currentAqi}</span>
                ${changeValue !== '--' ? `<span class="aqi-change ${changeClass}">${changeArrow} ${changeValue}</span>` : ''}
                <span class="aqi-level-badge" style="background-color:${aqiLevel.color};">${aqiLevel.level}</span>
            </div>
            <div class="aqi-subtitle">${isDosMissionData ? `3-hour Average (${currentThreeHourAvg}) · ${localTimeStr} Local` : `Air Quality Index (USAQI) · ${localTimeStr} Local`}</div>
        </div>

        <div class="forecast-periods">
            <button class="period-btn" data-period="6h">6h</button>
            <button class="period-btn" data-period="12h">12h</button>
            <button class="period-btn" data-period="18h">18h</button>
            <button class="period-btn" data-period="24h">24h</button>
            <button class="period-btn" data-period="48h">48h</button>
            <button class="period-btn active" data-period="72h">72h</button>
        </div>

        <div class="forecast-grid" id="fh-forecast-grid">
            ${buildCards(72)}
        </div>

        ${barChartHtml}

        <div class="daily-summary">
            <h6>Daily Outlook</h6>
            <div class="daily-row">
                <div class="daily-item">
                    <div class="day-label">Today</div>
                    <div class="day-aqi" style="color:${getAqiLevel(todayAvg).color};">${todayAvg}</div>
                    <div class="day-change ${dailyChangeClass}">${dailyArrow} ${dailyChange !== '--' ? dailyChange : 'vs yesterday'}</div>
                </div>
                <div class="daily-item">
                    <div class="day-label">Tomorrow</div>
                    <div class="day-aqi" style="color:${getAqiLevel(tomorrowAvg).color};">${tomorrowAvg}</div>
                    <div class="day-change">${typeof tomorrowAvg === 'number' && typeof todayAvg === 'number' ?
                        (tomorrowAvg > todayAvg ? '▲' : tomorrowAvg < todayAvg ? '▼' : '') + ' vs today' : ''}</div>
                </div>
            </div>
        </div>
    `;

    $heroSection.html(heroHtml);


    $heroSection.find('.period-btn').on('click', function() {
        $heroSection.find('.period-btn').removeClass('active');
        $(this).addClass('active');
        const period = $(this).data('period');
        const maxHours = periodHours[period] ?? 24;
        $('#fh-forecast-grid').html(buildCards(maxHours));
    });


    $heroSection.find('#fh-btn-hourly').on('click', function() {
        $heroSection.find('.chart-toggle-btn').removeClass('active');
        $(this).addClass('active');
        $('#fh-chart-title').text(`Past 12h \u0026 next 24h \u00b7 ${pollutantLabel} AQI`);
        $('#fh-hourly-chart').show();
        $('#fh-daily-chart').hide();
    });
    $heroSection.find('#fh-btn-daily').on('click', function() {
        $heroSection.find('.chart-toggle-btn').removeClass('active');
        $(this).addClass('active');
        $('#fh-chart-title').text(`Daily averages \u00b7 ${pollutantLabel} AQI`);
        $('#fh-hourly-chart').hide();
        $('#fh-daily-chart').show();
    });

    // Bar hover popup
    if (!document.getElementById('mini-bar-popup')) {
        $('body').append(`
            <div id="mini-bar-popup" style="
                display:none;position:fixed;z-index:99999;pointer-events:none;
                background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.18);
                padding:10px 14px;min-width:160px;font-size:12px;line-height:1.6;
                border-top:4px solid #ccc;
            "></div>
        `);
    }
    const $barPopup = $('#mini-bar-popup');

    $heroSection.on('mouseenter', '.mini-bar-wrap', function(e) {
        const $el = $(this);
        const hour = $el.data('hour') || '--';
        const aqi = $el.data('aqi');
        const level = $el.data('level') || '--';
        const source = $el.data('source') || '--';
        const color = $el.data('color') || '#888';
        $barPopup.css('border-top-color', color).html(`
            <div style="font-weight:700;margin-bottom:4px;">${hour}</div>
            <div><span style="color:#666;">AQI:</span> <span style="font-weight:600;color:${color};">${aqi ?? '--'}</span></div>
            <div><span style="color:#666;">Level:</span> ${level}</div>
            <div><span style="color:#666;">Source:</span> ${source}</div>
        `).show();
    }).on('mousemove', '.mini-bar-wrap', function(e) {
        $barPopup.css({ left: e.clientX + 14, top: e.clientY - 10 });
    }).on('mouseleave', '.mini-bar-wrap', function() {
        $barPopup.hide();
    });
}

function getAqiLevel(aqi, species = "no2") {
    if (aqi === null || aqi === undefined || isNaN(aqi)) {
        return { level: "N/A", color: "#808080", message: "No AQI data available." };
    }


    const breakpoints = [
        { max: 50,    level: "Good", color: "#4CAF50", message: "Air quality is considered satisfactory." },
        { max: 100,   level: "Moderate", color: "#FFEB3B", message: "Air quality is acceptable." },
        { max: 150,   level: "Unhealthy for Sensitive Groups", color: "#FF9800", message: "Members of sensitive groups may experience health effects." },
        { max: 200,   level: "Unhealthy", color: "#F44336", message: "Everyone may begin to experience health effects." },
        { max: 300,   level: "Very Unhealthy", color: "#9C27B0", message: "Health alert: everyone may experience serious health effects." },
        { max: 500,   level: "Hazardous", color: "#7E0023", message: "Health warnings of emergency conditions." }
    ];



    for (const bp of breakpoints) {
        if (aqi <= bp.max) {
            return { level: bp.level, color: bp.color, message: bp.message };
        }
    }
    return { level: "Beyond Index", color: "#000000", message: "AQI is beyond the standard index." };
}

function generateAqiElement(aqiValue, pollutant, userTimeZone, currentHour) {
    const hourStr = typeof currentHour === "number"
        ? currentHour.toString().padStart(2, '0')+":00" 
        : currentHour;
    if (aqiValue === 'N/A' || aqiValue === null) {
        return `<div class="prediction-box" style="background: #80808017;">
            <h5>${hourStr}</h5>
            <span class="time"> US AQI (${pollutant.toUpperCase()})</span>
            <h2>--</h2>
        </div>`;
    }

    const aqiLevels = [
        { level: "Good", color: "#4CAF50", range: [0, 50], position: 0 },
        { level: "Moderate", color: "#FFEB3B", range: [51, 100], position: 20 },
        { level: "Unhealthy for Sensitive Groups", color: "#FF9800", range: [101, 150], position: 40 },
        { level: "Unhealthy", color: "#F44336", range: [151, 200], position: 60 },
        { level: "Very Unhealthy", color: "#9C27B0", range: [201, 300], position: 80 },
        { level: "Hazardous", color: "#7E0023", range: [301, 500], position: 100 }
    ];

    const matchingLevel = aqiLevels.find(level => aqiValue >= level.range[0] && aqiValue <= level.range[1]);
    const indicatorPosition = matchingLevel ? matchingLevel.position : 0;

    return `
        <div class="prediction-box" style="background: #80808017;">
            <h5>${hourStr}</h5>
            <span class="time"> US AQI (Primary Pollutant: ${pollutant_details(pollutant, format="abbr")})</span>
                        <h2>${aqiValue !== null ? aqiValue : '--'}</h2>
            <h4>${matchingLevel && matchingLevel.level ? matchingLevel.level : '--'}</h4>
            
            <div class="aqi-scale-container">
                <div class="aqi-scale">
                </div>
                <div class="aqi-indicator" style="left: ${indicatorPosition}%;"></div>
            </div>
        </div>`;
}

function generateAverageChangeElement(dataset, pollutant, userTimeZone, currentHour, averageType = "daily") {
    if (!dataset || dataset.length < 2) {
        return '';
    }


    const pointsPerDay = 24;
    const pointsPerWeek = pointsPerDay * 7;
    const pointsToInclude = averageType === "weekly" ? pointsPerWeek : pointsPerDay;


    const subset = dataset.slice(-pointsToInclude);


    const averageConcentration = subset.reduce((sum, value) => sum + value, 0) / subset.length;

 
    const currentConcentration = dataset[dataset.length - 1];

  
    const isAboveAverage = currentConcentration > averageConcentration;


    const percentageChanges = [];
    for (let i = 1; i < subset.length; i++) {
        const previousValue = subset[i - 1];
        const currentValue = subset[i];

        if (previousValue !== null && currentValue !== null && previousValue !== 0) {
            const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
            percentageChanges.push(percentageChange);
        }
    }

    const averageChange = percentageChanges.length > 0
        ? percentageChanges.reduce((sum, change) => sum + change, 0) / percentageChanges.length
        : 0;


    const trendClass = isAboveAverage ? 'negative' : 'positive'; 
    const trendIcon = isAboveAverage
        ? '<svg style="color: rgb(237, 13, 13);" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 1 1 0v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L8.5 10.293V4.5z"/> </svg>'
        : '<svg style="color: rgb(48, 169, 4);" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 7.854a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/> </svg>';

 
    return `
        <div class="prediction-box" style="background: #80808017;">
            <h5>Average Change (${pollutant.toUpperCase()})</h5>
            <span class="time">${currentHour}:00, ${userTimeZone}</span>
            <h2 class="${trendClass}">
                ${trendIcon} ${averageChange >= 0 ? '' : ''}${averageChange.toFixed(2)}%
            </h2>
            <span>${isAboveAverage ? 'Above' : 'Below'} (${averageType} Average)</span>
        </div>`;
}

function getChange(val, avg) {
    if (typeof val === "number" && typeof avg === "number" && avg !== 0) {
        const diff = val - avg;
        const pct = ((val - avg) / avg) * 100;
        return {
            diff: diff.toFixed(2),
            pct: pct.toFixed(2),
            sign: pct > 0 ? "+" : "",
            class: pct > 0 ? "red" : pct < 0 ? "green" : "",
            arrow: pct > 0 ? "▲" : pct < 0 ? "▼" : ""
        };
    }
    return { diff: "N/A", pct: "N/A", sign: "", class: "", arrow: "" };
}

function generateMetricsHtml({
    title = "",
    unit = "",
    currentVal = "N/A",
    prevVal = "N/A",
    nextVal = "N/A",
    dailyAvg = "N/A",
    change = {},
    prevChange = {},
    nextChange = {},
    currentIdx = -1,
    prevIdx = -1,
    nextIdx = -1,
    datetimes = []
} = {}) {
    function formatTime(dtIdx) {
        if (dtIdx === -1 || !datetimes[dtIdx]) return "--";
        const dt = new Date(datetimes[dtIdx]);
        return dt.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, month: "short", day: "2-digit" });
    }

    return `
    <div class="xvg_aqi-container">

        <div>
            <div class="d-xvg">
                <div class="xvg_aqi me-3">${currentVal !== 'N/A' ? currentVal : '--'}</div>
                <div class="xvg_aqi-change ${change.class}">${change.arrow} ${change.sign}${change.diff} (${change.sign}${change.pct !== "N/A" ? change.pct + "%" : "--"})</div>
                <div class="xvg_timestamp">Current AQI (US Scale) </div>
            </div>
            
        </div>

        <div class="d-xvg">
            <div class="xvg_aqi me-3">${nextVal !== 'N/A' ? nextVal : '--'}</div>
            <div class="xvg_aqi-change ${nextChange.class}">${nextChange.arrow} ${nextChange.sign}${nextChange.diff} (${nextChange.sign}${nextChange.pct !== "N/A" ? nextChange.pct + "%" : "--"})</div>
            <div class="xvg_timestamp">Next hour</div>
        </div>
        
        <div class="d-xvg">
            <div class="xvg_aqi me-3">${prevVal !== 'N/A' ? prevVal : '--'}</div>
            <div class="xvg_aqi-change ${prevChange.class}">${prevChange.arrow} ${prevChange.sign}${prevChange.diff} (${prevChange.sign}${prevChange.pct !== "N/A" ? prevChange.pct + "%" : "--"})</div>
            <div class="xvg_timestamp">Previous hour</div>
        </div>
        <div class="d-xvg">
            <div class="xvg_aqi me-3">${dailyAvg !== 'N/A' ? dailyAvg.toFixed(2) : '--'}</div>
            <div class="xvg_aqi-change">Daily Avg</div>
        </div>
    </div>
    `;
}
function readAirNow(options = {}) {

    const {
        location = "",
        param = "pm25",
        unit = "μg/m³",
        forecastsDiv = "main_plot_for_airnow",
        buttonOption = true,
        historical = 2,
        reinforceTraining = 2,
        hpTunning = 2,
        resample = false,
        update = 2,
        timezone = "UTC"
    } = options;

    const messages = [
        "Generating data",
        "Connecting to AirNow",
        "Fetching the data from AirNow API",
        "Fetching observations",
        "Getting the forecasts",
        "Please wait...",
        "Connecting..."
    ];
    $('.loader').show();
    const siteTimeZone = timezone || "UTC";
    const paramCode = pollutant_details(param).id;
    const fileUrl = `https://smce-geos-cf-public.s3.us-west-2.amazonaws.com/snwg_forecast_working_files/precomputed/all_dts/${location}.json?version=${new Date().getTime()}`;

    fetch(fileUrl)
        .then(response => {
            console.log("Fetching data from:", fileUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (!data || data.status !== "200") throw new Error("No valid data received");

            const modelHtml = `
                <div class="container my-5">
                    <h6>Model Information</h6>
                    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        <div class="col">
                            <div class="card shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">Total Estimates</h5>
                                    <p class="card-text fs-3 fw-bold">${data.timezonemetrics.total_observation || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">Last Update</h5>
                                    <p class="card-text fs-3 fw-bold">${data.timezonemetrics.latest_training || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">Start Date</h5>
                                    <p class="card-text">${data.timezonemetrics.start_date || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">End Date</h5>
                                    <p class="card-text">${data.timezonemetrics.end_date || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        ${data.timezonemetrics.validation_score ? `
                        <div class="col">
                            <div class="card shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">Validation Score</h5>
                                    <p class="card-text">${data.timezonemetrics.validation_score}</p>
                                </div>
                            </div>
                        </div>` : ''}
                        ${data.timezonemetrics.performance?.timezonemetrics?.length ? data.timezonemetrics.performance.timezonemetrics.map(metric => `
                        <div class="col">
                            <div class="card shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">${metric.name.toUpperCase()}</h5>
                                    <p class="card-text">${metric.value}</p>
                                </div>
                            </div>
                        </div>`).join('') : ''}
                    </div>
                </div>
            `;
            $('.model_data').html(modelHtml);

            let masterData = {
                master_datetime: [],
                master_observation: [],
                master_aqi: [] 
            };

            if (Array.isArray(data.forecasts) && data.forecasts.length > 0) {
                data.forecasts.forEach(forecast => {
                    const utcTime = forecast.time || null;
                    if (utcTime) {
                        const date = new Date(utcTime);
                        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        const localTime = new Date(date.toLocaleString('en-US', { timeZone: userTimeZone }));
                        masterData.master_datetime.push(localTime.toISOString());
                    } else {
                        masterData.master_datetime.push(null);
                    }

                    const observationValue = forecast.value || null;
                    masterData.master_observation.push(observationValue);

                    // overall
                    const aqiValue = (forecast.overall_aqi !== undefined && forecast.overall_aqi !== null) ? forecast.overall_aqi : calculateAqiForPm25(observationValue);
                    masterData.master_aqi.push(aqiValue);
                });
            }

            const tabsNav = $("#pills-tabContent").prev();
            const tabsContainer = $(".tab-content");

            tabsNav.empty();
            tabsContainer.empty();

            const tabsList = $('<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist"></ul>');
            tabsNav.append(tabsList);
            

            const plots = [
                { id: "main_plot_for_airnow", title: "PM 2.5 Forecasts", data: masterData },
                { id: "aqi_plot_for_airnow", title: "PM 2.5 AQI", data: masterData } 
            ];

            plots.forEach((plot, index) => {
                const isActive = index === 0 ? "active" : "";

                tabsList.append(`
                    <li class="nav-item" role="presentation">
                        <a class="nav-link ${isActive}" id="tab-${plot.id}" data-bs-toggle="pill" href="#${plot.id}" role="tab" aria-controls="${plot.id}" aria-selected="${isActive === 'active'}">
                            ${plot.title}
                        </a>
                    </li>
                `);

                tabsContainer.append(`
                    <div class="tab-pane fade ${isActive} show" id="${plot.id}" role="tabpanel" aria-labelledby="tab-${plot.id}">
                    </div>
                `);
            });

            

            
            $(".nav-link").on("click", function () {
                $(".tab-pane").removeClass("active show");
                $($(this).attr("href")).addClass("active show");
            });

            plots.forEach(plot => {
                const plotColumns = plot.id === "aqi_plot_for_airnow"
                    ? [{ column: "master_aqi", name: "AQI", color: "blue", width: 2 }]
                    : [{ column: "master_observation", name: "Forecasted Value", color: "green", width: 2 }];
            
                draw_plot(
                    plot.data,
                    'pm2.5',
                    plot.id === "aqi_plot_for_airnow" ? "AQI" : "μg/m³",
                    plot.id,
                    plotColumns,
                    false,
                    false,
                    plot.id === "aqi_plot_for_airnow"
                        ? "<b>PM 2.5 AQI</b> | Calculated from PM 2.5 concentrations"
                        : "<b>Sources:</b> NASA Modern-Era Retrospective analysis for Research and Applications (MERRA-2)| | SNWG Bias CNN Model.",
                    "bar",
                    siteTimeZone
                );
            
                window.dispatchEvent(new Event('resize'));
            });
            
            
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; 
            const currentDate = new Date();
            const currentDateString = currentDate.toISOString().split('T')[0];
            const currentHour = currentDate.getHours();
            const nexttHour = (currentDate.getHours() + 1)
            

            let currentAqi = 'N/A';
            let nextAqi = 'N/A';
            
            for (let i = 0; i < masterData.master_datetime.length; i++) {
                const datetime = new Date(masterData.master_datetime[i]);
                const dateString = datetime.toISOString().split('T')[0];
                const hour = datetime.getHours();
                
                if (dateString === currentDateString && hour <= currentHour && currentHour < hour + 3) {
                    currentAqi = masterData.master_aqi[i];
                }
                
                if (dateString === currentDateString && hour <= currentHour + 3 && currentHour + 3 < hour + 3) {
                    nextAqi = masterData.master_aqi[i];
                }
            }

            let aqiElement = `<div class="prediction-container">`;
            
            if (currentAqi !== 'N/A') {
                aqiElement += generateAqiElement(currentAqi, param, userTimeZone, currentHour);
            }
            
            if (nextAqi !== 'N/A') {
                aqiElement += generateAqiElement(nextAqi, param, userTimeZone, nexttHour);
            }
            aqiElement += `</div>`;

            const averageDailyChangeElement = generateAverageChangeElement(masterData.master_observation, param, userTimeZone, currentHour, "daily");
            const averageWeeklyElement = generateAverageChangeElement(masterData.master_observation, param, userTimeZone, currentHour, "weekly");
            
            if (averageDailyChangeElement) {
                $(`#${forecastsDiv}`).after(averageDailyChangeElement);
            }
            if (averageWeeklyElement) {
                $(`#${forecastsDiv}`).after(averageWeeklyElement);
            }
            $('.loader').hide();
            
            $(`#${forecastsDiv}`).before(aqiElement);

            $('.loader').hide();
        })
        .catch(error => {
            console.error("Error loading data:", error);
            $('.api_baker_plots').html('Sorry, we are not able to connect with AirNow API at this moment. Please check back later...');
            $('.loader').hide();
        });
}


function generateModelCards(metrics) {
    return `
        <div class="col"><div class="card shadow-sm"><div class="card-body"><h5 class="card-title">Total Observations</h5><p class="card-text fs-3 fw-bold">${metrics.total_observation}</p></div></div></div>
        <div class="col"><div class="card shadow-sm"><div class="card-body"><h5 class="card-title">Last Model Update</h5><p class="card-text fs-3 fw-bold">${metrics.latest_training.substring(0, 19)}</p></div></div></div>
        <div class="col"><div class="card shadow-sm"><div class="card-body"><h5 class="card-title">Mean Square Error</h5><p class="card-text">${metrics.rmse}</p></div></div></div>
        <div class="col"><div class="card shadow-sm"><div class="card-body"><h5 class="card-title">Mean Absolute Error</h5><p class="card-text">${metrics.preformance.timezonemetrics["Test MAE"]}</p></div></div></div>
    `;
}




function formatToCSV(data) {
    let csvContent = '';
    const headers = ['Datetime', 'Observation', 'Localized', 'Uncorrected'];
    csvContent += headers.join(',') + '\n';
    
    data.master_datetime.forEach((datetime, index) => {
        csvContent += `${datetime},${data.master_observation[index]},${data.master_localized[index]},${data.master_uncorrected[index]}\n`;
    });
    
    return csvContent;
}


function formatToCSV(data) {
    let csvContent = '';
    const headers = ['Datetime', 'Observation', 'Localized', 'Uncorrected'];
    csvContent += headers.join(',') + '\n';
    
    data.master_datetime.forEach((datetime, index) => {
        csvContent += `${datetime},${data.master_observation[index]},${data.master_localized[index]},${data.master_uncorrected[index]}\n`;
    });
    
    return csvContent;
}


function updateUIWithDifferences(differenceLastYear, lastYearForecast, label) {
    if (rewrite_number(lastYearForecast) !== 'N/A') {
        const trendClass = differenceLastYear[0] > 0 ? 'trend-up' : 'trend-down';
        const trendIcon = differenceLastYear[0] > 0 
            ? '<svg style="color: rgb(246, 70, 93);" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z" fill="#d60b15"></path> </svg>'
            : '<svg style="color: rgb(48, 169, 4);" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 a=0-1-1v5.793L5.3546a=.5=.5=1-1-.708-.708l3-3a=.5=.5=0l3-3a=.5=.5=1-.708-.708L8.5=10.293V4.5z" fill="#30a904"></path> </svg>';

        $('.local_forecats_window').prepend(`
            <div class="col-md-4">
                <div class="lf-fcst-info years_difference ${trendClass}">
                    <div class="lf-fcst-name">${label}</div>
                    <div class="lf-fcst-value">${rewrite_number(lastYearForecast)}<span>μg/m³</span></div>
                    <div class="lf-fcst-change">
                        <span class="trend_sign_difference_last_year">${trendIcon}</span> ${rewrite_number(differenceLastYear[1])} % (${rewrite_number(differenceLastYear[0])} <span>μg/m³</span>)
                    </div>
                </div>
            </div>
        `);
    }
}



function combine_historical_and_forecasts(location_name, param, unit, forecasts_div){

    var file_name = location_name + '_' + param;
    
    
    var historical_simulation = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_" + file_name+'_historical.json';

    var forecasts_url = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_" + file_name+'.json';
    

    var list_of_files = [historical_simulation, forecasts_url];
    var forecast_initialization_date = "";
    var master_datetime =[]; 
    var master_observation =[];
    var master_observation_resample =[];
    var master_localized =[]; 
    var master_localized_resample =[]; 
    var master_uncorrected =[];
    var master_uncorrected_resample =[];

    var combined_dataset = {};
    var dataset_year1 = {};
    var dataset_year2 = {};
    var combined_dataset = {};
    var dates_ranges = [];
    var activate_number = 0;
    var year = new Date().getFullYear()
    list_of_files.forEach(function(file_url, index){
        console.log("year: " +year)
        $.ajax({
            url: file_url, 
            async: false,
            timeout: 30000,
            success: function() { 
                d3.json(file_url, function(error, data) {
                    if (error) {
                        alert(error);
                    }
                    
                    if(data){
                        var pure_data = csvToArray(data.latest_forecast.data);
    
    
                        var date_time = $(pure_data).map(function() {
                            return this.forecast_datetime;
                        }).get()


                        var date_time_uncorrected = $(pure_data).map(function() {
                            return this.forecast_datetime;
                        }).get()
          
                        forecast_initialization_date = data.latest_forecast.forecast_initialization_date;
    
                        var localized = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.localized_no2
                            }
                            if (param == "o3") {
                                return this.localized_o3
                            }
                            if (param == "pm25") {
                                return this.localized_pm25
                            }
    
                        }).get()

                        
                        
                       
                        var uncorrected = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.uncorrected_no2
                            }
                            if (param == "o3") {
                                return this.uncorrected_o3
                            }
                            if (param == "pm25") {
                                return this.luncorrected_pm25
                            }
                        }).get()
    
                        var observation_resample = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.observation_24H
                            }
                            if (param == "o3") {
                                return this.observation_8H
                            }
                            if (param == "pm25") {
                                return this.observation_24H
                            }
    
                        }).get()
                       

                        var resample_window = 24;
                        var localized_resample = $(pure_data).map(function() {
                            if (param == "no2") {
                                resample_window = 24;
                                return this.localized_no2_24H
                            }
                            if (param == "o3") {
                                resample_window = 8;
                                return this.localized_o3_8H
                            }
                            if (param == "pm25") {
                                resample_window = 24;
                                return this.localized_pm25_24H
                            }
    
                        }).get()
    
                        var uncorrected_resample = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.uncorrected_no2_24H
                            }
                            if (param == "o3") {
                                return this.uncorrected_o3_8H
                            }
                            if (param == "pm25") {
                                return this.uncorrected_pm25_24H
                            }
    
                        }).get()
    
                        var observation = $(pure_data).map(function() {
                            return this.observation;
                        }).get()
    



                       // combined_dataset["forecast_initialization_date_"+year] = forecast_initialization_date;
    
                        combined_dataset["master_datetime_"+year] = date_time;
                        combined_dataset["master_observation_"+year] = observation;
                        combined_dataset["master_observation_resample_"+year] = observation_resample;
                        combined_dataset["master_localized_"+year] = localized;
                        combined_dataset["master_uncorrected_"+year] = uncorrected;
      
                        activate_number = activate_number + 1;
                        year = year + 1;



                        dates_ranges.push(date_time[0].toString());
                        dates_ranges.push(date_time.slice(-2, -1).toString());
                        
                        if(activate_number == 2){
                            draw_plot(combined_dataset,param,unit,forecasts_div,'Historical Simulation Comparison',false, button= true)
                        }
                        
                      
                    }
                    else {
                        $('.forecasts-view').html("Sorry, data not available for "+param+" in this location");
                    }
                    
                });
    
            },
            error: function(jqXHR, status, er) {
                if (jqXHR.status === 404) {
                    $('.forecasts-view').html("Sorry, PLOT ISSUE, please retry");
                }
    
            }
        });
        
    })
    


    return combined_dataset;
    
}

function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
}


function cleanAndSortData(datetime_data, combined_dataset) {

    const pairedData = datetime_data.map((datetime, index) => {
        const dataPoint = { datetime };
        for (const key in combined_dataset) {
            if (Array.isArray(combined_dataset[key])) {
                dataPoint[key] = combined_dataset[key][index];
            }
        }
        return dataPoint;
    });

   
    const uniqueData = Array.from(new Map(pairedData.map(item => [item.datetime, item])).values());
    uniqueData.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));


    const cleanedData = {};
    for (const key in combined_dataset) {
        if (Array.isArray(combined_dataset[key])) {
            cleanedData[key] = uniqueData.map(item => item[key]);
        }
    }

    return cleanedData;
}
function getAqiBarColor(aqiValue, pollutant, alpha = 1) {
        const aqiLevel = getAqiLevel(aqiValue, pollutant);
        if (!aqiLevel.color) return `rgba(128,128,128,${alpha})`;
        const hex = aqiLevel.color.replace('#', '');
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    }

function validateData(data, requiredKeys = [], minLength = 1) {

    if (!data || typeof data !== 'object') {
        console.error("Data is not available or invalid.");
        return false;
    }


    for (const key of requiredKeys) {
        if (!data[key] || !Array.isArray(data[key]) || data[key].length < minLength) {
            console.error(`Data for key "${key}" is missing or insufficient.`);
            return false;
        }
    }

    return true;
}
function draw_plot(
    combined_dataset,
    param,
    unit,
    forecasts_div,
    plot_columns,
    dates_ranges = false,
    enableFading = false,
    text = "Forecasts",
    plotType = "scatter",
    timezone = "UTC",
    enableAqiColors = false,
    naaqsValue = null,
    naaqsLabel = '',
    sourceColumn = null,
    additionalColumns = null,
    param_text = null
) {

    const datetime_data = combined_dataset["master_datetime"];
    const cleanedData = cleanAndSortData(datetime_data, combined_dataset);
    const sourceData = sourceColumn ? (combined_dataset[sourceColumn] || []) : [];
    const maxValues = plot_columns.map(({ column }) => Math.max(...cleanedData[column]));
    const maxValue = Math.max(...maxValues);

 
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const localNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const currentDateString = localNow.toISOString().split('T')[0];
    const currentHour = localNow.getHours();
    const currentTimeInUserTimeZone = localNow.toISOString();

    const lastIndex = cleanedData.master_datetime.length - 1;
    let currentX = null;
    let currentY = null;
    
   const traces = plot_columns
    .filter(column => column && column.name && column.column)
    .map(({ column, name, color, width, dash }, index) => {
        let barColors;
        if (plotType === "bar" && enableAqiColors) {
            barColors = cleanedData.master_datetime.map((datetime, i) => {
                const value = cleanedData[column][i];
                const dataTime = new Date(datetime);
                const alpha = dataTime <= localNow ? 1 : 0.5;
                return getAqiBarColor(value, param, alpha);
            });
        } else {
            // color
            const baseColor = color || '#2196f3';
            // rgba
            const hexToRgba = (hex, alpha) => {
                const h = hex.replace('#', '');
                const bigint = parseInt(h.length === 3
                    ? h.split('').map(c => c + c).join('')
                    : h, 16);
                return `rgba(${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255},${alpha})`;
            };
            const solidColor = baseColor.startsWith('#') ? hexToRgba(baseColor, 1) : baseColor;
            const fadedColor = baseColor.startsWith('#') ? hexToRgba(baseColor, 0.45) : baseColor + '73';
            barColors = cleanedData.master_datetime.map((datetime) => {
                const dataTime = new Date(datetime);
                return dataTime < localNow ? solidColor : fadedColor;
            });
        }

        const lineColor = color || 'rgba(7, 23, 16, 0.65)';
        const rgbaMatch = lineColor.match(/\d+/g);
        const fadingColor = rgbaMatch
            ? `rgba(${rgbaMatch[0]}, ${rgbaMatch[1]}, ${rgbaMatch[2]}, 0.6)`
            : 'rgba(0, 0, 0, 0.6)';

        return {
            type: plotType === "bar" ? "bar" : "scatter",
            mode: plotType === "bar" ? undefined : "lines",
            connectgaps: plotType === "bar" ? undefined : false,
            x: cleanedData.master_datetime,
            y: cleanedData[column].map(v => {
                const num = Number(v);
                return Number.isFinite(num) ? num.toFixed(2) : v; 
            }),
            line: plotType === "bar" ? undefined : {
                color: enableAqiColors ? barColors[0] : lineColor,
                width: width || 1,
                dash: dash || 'solid'
            },
            marker: plotType === "bar"
                ? { color: barColors }
                : undefined,
            fill: plotType === "bar" ? undefined : enableFading && index === 0 ? 'tozeroy' : 'none',
            fillcolor: plotType === "bar" ? undefined : enableFading && index === 0 ? fadingColor : 'none',
            hovertemplate: (() => {
                if (sourceColumn && sourceData.length > 0) {
                    return '<b>%{x}</b><br>' +
                           param_text + ': %{y}<br>' +
                           'Source: <b>%{customdata[0]}</b><br>' +
                           '<extra></extra>';
                } else if (additionalColumns && additionalColumns.length > 0) {
                    return '<b>%{x}</b><br>' +
                           'Overall AQI: %{y}<br>' +
                           'NO₂ AQI: %{customdata[0]}<br>' +
                           'PM₂.₅ AQI: %{customdata[1]}<br>' +
                           '<extra></extra>';
                }
                return '';
            })(),
            customdata: (() => {
                if (sourceColumn && sourceData.length > 0) {
                    return sourceData.map(s => [s || 'N/A']);
                } else if (additionalColumns && additionalColumns.length > 0) {
                    const additionalData = additionalColumns.map(col => cleanedData[col] || []);
                    return cleanedData.master_datetime.map((_, i) => 
                        additionalData.map(data => data[i] || 'N/A')
                    );
                }
                return undefined;
            })(),
            name: name
        };
    });


    // naaqs
    if (naaqsValue !== null && naaqsValue !== undefined) {
        traces.push({
            type: 'scatter',
            mode: 'lines',
            x: [cleanedData.master_datetime[0], cleanedData.master_datetime[cleanedData.master_datetime.length - 1]],
            y: [naaqsValue, naaqsValue],
            line: { color: '#E53935', width: 2, dash: 'dash' },
            name: naaqsLabel || `NAAQS Standard (${naaqsValue} ${unit})`,
            hoverinfo: 'name+y',
            showlegend: true
        });
    }

    for (let i = 0; i < cleanedData.master_datetime.length; i++) {
        const datetime = new Date(cleanedData.master_datetime[i]);
        const dateString = datetime.toISOString().split('T')[0];
        const hour = datetime.getHours();

        if (dateString === currentDateString && hour === currentHour) {
            currentX = cleanedData.master_datetime[i];
            currentY = cleanedData.master_observation[i];
            break;
        }
    }

    const layout = {
        margin: {
            l: 0,
            r: 0, 
            t: 0, 
            b: 20, 
            pad: 0
        },
        annotations: [
            {
                x: 0,
                y: 1.2,
                xref: 'paper',
                yref: 'paper',
                text: text,
                showarrow: false,
                font: {
                    size: 20,
                    color: '#000000'
                },
                align: 'center'
            }
        ],
        autosize: true,
        plot_bgcolor: '#FFFFFF',
        paper_bgcolor: '#FFFFFF',
        legend: {
            orientation: 'h',
            x: 0.5,
            y: -0.2,
            xanchor: 'center',
            font: {
                color: '#000000'
            }
        },
        font: {
            family: 'Manrope, sans-serif',
            color: '#000000',
            size: 14
        },
        xaxis: {
            type: 'date',
            color: '#000000',
            rangeslider: { visible: false },
            range: [
                new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
                new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
            ],
            showgrid: false,
            gridcolor: '#D3D3D3',
            title: {
                text: '', 
                font: {
                    size: 16,
                    color: '#000000'
                }
            },
            rangeselector: {
                buttons: [
                    {
                        count: 1,
                        label: '1d',
                        step: 'day',
                        stepmode: 'backward'
                    },
                    {
                        count: 7,
                        label: '1w',
                        step: 'day',
                        stepmode: 'backward'
                    },
                    {
                        count: 1,
                        label: '1m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        step: 'all',
                        label: 'All'
                    }
                ]
            },
        },
        yaxis: {
            autorange: true,
            type: 'linear',
            title: {
                text: unit,
                font: {
                    size: 16,
                    color: '#000000'
                }
            },
            
            color: '#000000',
            showgrid: true,
            gridcolor: '#D3D3D3',
            side: 'left',
            automargin: true, 
            ticklabelposition: "outside", 
            tickson: "boundaries",
        },
        hovermode: 'x unified',
        shapes: [
            {
                type: 'line',
                x0: currentTimeInUserTimeZone,
                x1: currentTimeInUserTimeZone,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dot'
                }
            },
            ...(naaqsValue !== null && naaqsValue !== undefined ? [{
                type: 'rect',
                xref: 'paper',
                yref: 'y',
                x0: 0, x1: 1,
                y0: 0, y1: naaqsValue,
                fillcolor: 'rgba(76,175,80,0.06)',
                line: { width: 0 },
                layer: 'below'
            }] : [])
        ]
    };

    Plotly.newPlot(forecasts_div, traces, layout, {responsive: true});

    // Scroll
    if (window.currentForecastTimestamp) {
        try {
            const targetTime = new Date(window.currentForecastTimestamp.replace(' ', 'T'));
            const halfDay = 12 * 60 * 60 * 1000;
            const startTime = new Date(targetTime.getTime() - halfDay).toISOString();
            const endTime = new Date(targetTime.getTime() + halfDay).toISOString();
            
            setTimeout(() => {
                Plotly.relayout(forecasts_div, {
                    'xaxis.range': [startTime, endTime]
                });
            }, 100);
        } catch (e) {
            console.warn("Could not scroll to current forecast:", e);
        }
    }

    $(`#${forecasts_div}`).on('plotly_relayout', function(e, d) {
        if (d['xaxis.range[0]'] && d['xaxis.range[1]']) {
            // Range
            const start = new Date(d['xaxis.range[0]']);
            const end = new Date(d['xaxis.range[1]']);
            const diffDays = (end - start) / (1000 * 60 * 60 * 24);
            // Center
            if (!window.hasCustomTimestamp && diffDays > 6.5 && diffDays < 7.5) {
                // Today
                const today = new Date();
                const center = today.getTime();
                const halfWeek = 3.5 * 24 * 60 * 60 * 1000;
                const newStart = new Date(center - halfWeek).toISOString();
                const newEnd = new Date(center + halfWeek).toISOString();
                Plotly.relayout(forecasts_div, {
                    'xaxis.range': [newStart, newEnd]
                });
            }
        }
    });
    

    const downloadDivId = `download-btns-${forecasts_div}`;
    if (!$(`#${downloadDivId}`).length) {
        $(`#${forecasts_div}`).before(`
            <div class="download_plot_data" id="${downloadDivId}" style="margin-bottom:10px; text-align:right;">
                <button class="btn btn-sm btn-outline-primary" id="download-csv-${forecasts_div}">Download CSV</button>
                <button class="btn btn-sm btn-outline-secondary" id="download-json-${forecasts_div}">Download JSON</button>
            </div>
        `);

        const getDownloadName = () => {
            const locRaw = (window._lastOpenedLocationName || forecasts_div || 'location')
                .replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
            const species = (param || 'pollutant').toLowerCase();
            return `${locRaw}_${species}`;
        };

     
        const buildDownloadCSV = () => {
            const cleanedData = cleanAndSortData(combined_dataset["master_datetime"], combined_dataset);
            const locName = (window._lastOpenedLocationName || '').replace(/[_-]/g, ' ').trim() || forecasts_div;
            const valueColumns = plot_columns.map(c => c.column);
            const valueHeaders = plot_columns.map(c => c.name || c.column);

            const header = ['datetime', 'location', ...valueHeaders].join(',');
            const rows = cleanedData.master_datetime.map((dt, i) => {
                const vals = valueColumns.map(col => {
                    const v = (cleanedData[col] || [])[i];
                    return (v !== null && v !== undefined) ? v : '';
                });
                return [`"${dt}"`, `"${locName}"`, ...vals].join(',');
            });
            return [header, ...rows].join('\n');
        };

        const buildDownloadJSON = () => {
            const cleanedData = cleanAndSortData(combined_dataset["master_datetime"], combined_dataset);
            const locName = (window._lastOpenedLocationName || '').replace(/[_-]/g, ' ').trim() || forecasts_div;
            const valueColumns = plot_columns.map(c => c.column);
            return JSON.stringify(
                cleanedData.master_datetime.map((dt, i) => {
                    const row = { datetime: dt, location: locName };
                    plot_columns.forEach(c => {
                        row[c.name || c.column] = (cleanedData[c.column] || [])[i] ?? null;
                    });
                    return row;
                }),
                null, 2
            );
        };

        $(`#download-csv-${forecasts_div}`).on('click', function() {
            const csv = buildDownloadCSV();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${getDownloadName()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        $(`#download-json-${forecasts_div}`).on('click', function() {
            const json = buildDownloadJSON();
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${getDownloadName()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
}

function get_plot(location_name, param, unit, forecasts_div, forecasts_resample_div,merge,precomputer_forecasts,historical){

    var file_url = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_FR40008_no2.json";
    $(".loading_forecasts").fadeIn(10);
    if(merge){
        file_url.replace('.json', '_historical.json');
    }
    if(historical == "historical"){
        file_url = file_url.replace('.json', '_historical.json');
    }
   
 
    $.ajax({
        url: file_url, 
        success: function() { 
            d3.json(file_url, function(error, data) {
                if (error) {
                    alert(error);
                }
                
                if(data){
                    var pure_data = csvToArray(data.latest_forecast.data);


                    var date_time = $(pure_data).map(function() {
                        return this.forecast_datetime;
                    }).get()

                    var localized = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.localized_no2
                        }
                        if (param == "o3") {
                            return this.localized_o3
                        }
                        if (param == "pm25") {
                            return this.localized_pm25
                        }

                    }).get()
                    
                   
                    var uncorrected = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.uncorrected_no2
                        }
                        if (param == "o3") {
                            return this.uncorrected_o3
                        }
                        if (param == "pm25") {
                            return this.luncorrected_pm25
                        }
                    }).get()

                    var observation_resample = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.observation_24H
                        }
                        if (param == "o3") {
                            return this.observation_8H
                        }
                        if (param == "pm25") {
                            return this.observation_24H
                        }

                    }).get()
                    var resample_window = 24;
                    var localized_resample = $(pure_data).map(function() {
                        if (param == "no2") {
                            resample_window = 24;
                            return this.localized_no2_24H
                        }
                        if (param == "o3") {
                            resample_window = 8;
                            return this.localized_o3_8H
                        }
                        if (param == "pm25") {
                            resample_window = 24;
                            return this.localized_pm25_24H
                        }

                    }).get()

                    var uncorrected_resample = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.uncorrected_no2_24H
                        }
                        if (param == "o3") {
                            return this.uncorrected_o3_8H
                        }
                        if (param == "pm25") {
                            return this.uncorrected_pm25_24H
                        }

                    }).get()

                    var observation = $(pure_data).map(function() {
                        return this.observation;
                    }).get()




                    var trace1 = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: localized,
                        line: {
                            color: 'rgba(59, 59, 59, 0.8)',
                            width: 3
                        },
                        name: 'ML + Model '
                    }

                    var trace2 = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: uncorrected,
                        line: {
                            color: 'rgba(142, 142, 142, 0.8)',
                            width: 3
                        },
                        name: 'Model'
                    }

                    var trace3 = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: observation,
                        line: {
                            color: 'rgba(255, 0, 0, 0.8)',
                            width: 3
                        },
                        name: 'Observation'
                    }

                    var observation_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: observation_resample,
                        line: {
                            color: 'rgba(255, 0, 0, 0.8)',
                            width: 3
                        },
                        name: 'Observation'
                    }
                    var localized_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: localized_resample,
                        line: {
                            color: 'rgba(59, 59, 59, 0.8)',
                            width: 3
                        },
                        name: 'ML + Model'
                    }
                    var uncorrected_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: uncorrected_resample,
                        line: {
                            color: 'rgba(142, 142, 142, 0.8)',
                            width: 3
                        },
                        name: 'Model'
                    }

                    var pred = [trace3, trace1, trace2];

                    var pred_obs = [observation_resample_trace];
                    
                    var plot_resample = [observation_resample_trace,localized_resample_trace,uncorrected_resample_trace];

                    var layout = {
                        title: 'Bias Corrected Model',
                        plot_bgcolor: 'rgb(22 26 30)',
                        paper_bgcolor: 'rgb(22 26 30)',
                        font: {
                            family: 'Roboto, sans-serif',
                            color: '#FFFFFF'
                        },
                        xaxis: {
                            type: 'date',
                            color: '#FFFFFF'
                        },

                        yaxis: {
                            autorange: true,
                            type: 'linear',
                            title: pollutant_details('no2')+' ' +'[ '+ rewriteUnits('ppbv') +']',
                            color: '#FFFFFF'

                        },
                        shapes: [{
                            type: 'line',
                            x0: String(data.latest_forecast.forecast_initialization_date),
                            y0: 0,
                            x1: String(data.latest_forecast.forecast_initialization_date),
                            yref: 'paper',
                            y1: 1,
                            line: {
                                color: 'green',
                                width: 2,
                                dash: 'dot'
                            }
                        }],
                        legend: {
                            orientation: 'h',
                            y: 1.2
                        }
                    };

                    var layout_resample = {
                        title: 'Bias Corrected Model '+ historical +' '+ resample_window+"H Rolling Averages",

                        plot_bgcolor: 'rgb(22 26 30)',
                        paper_bgcolor: 'rgb(22 26 30)',

                        font: {
                            family: 'Roboto, sans-serif',
                            color: '#FFFFFF'
                        },
                        xaxis: {
                            type: 'date',
                            color: '#FFFFFF'
                           
                        },

                        yaxis: {
                            autorange: true,
                            type: 'linear',
                            title: pollutant_details('no2')+' ' +'[ '+ rewriteUnits('ppbv') +']',
                            color: '#FFFFFF'

                        },
                        shapes: [{
                            type: 'line',
                            x0: String(data.latest_forecast.forecast_initialization_date),
                            y0: 0,
                            x1: String(data.latest_forecast.forecast_initialization_date),
                            yref: 'paper',
                            y1: 1,
                            line: {
                                color: 'green',
                                width: 2,
                                dash: 'dot'
                            }
                        }],
                        legend: {
                            orientation: 'h',
                            y: 1.2
                        }
                    };

                    Plotly.newPlot(forecasts_div, pred, layout);
                    Plotly.newPlot(forecasts_resample_div, plot_resample, layout_resample);
                    $(document).on("click", ".download_forecasts_data", function() {
                        var csv_file_name = location_name.replace(/\_/g, '').replace(/\./g, '') + '_' + param + '('+'_'+historical+').csv';
                        let csvContent = "data:text/csv;charset=utf-8," + data.latest_forecast.data;
                        var encodedUri = encodeURI(csvContent);
                        var link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", csv_file_name);
                        document.body.appendChild(link); 
                        link.click();
                    });
                    $('.resample').text(resample_window+"H Rolling Averages");
                    
                    $('.modebar').prepend('<div class="modebar-group"><a rel="tooltip" class="modebar-btn change_plot" data-title="'+historical+ ' '+resample_window+'H Rolling Average" change_to ="main_plot_'+historical+'"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16"> <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/> <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/> <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/> </svg></div>');

                    if(historical){
                        var label_text = "historical simulation";
                        var label_text_rolling_average = "historical simulation ("+resample_window+" H rolling average)";
                        var downlaod_label_text = "download historical simulation data";

                    }else{
                        var label_text = "Forecasts";
                        var label_text_rolling_average = "Forecasts ("+resample_window+" H rolling average)";
                        var downlaod_label_text = "download forecast data";
                    }
                    
                    $('.plot_additional_features').prepend('<button type="button" class="btn btn-outline-primary change_plot" change_to="main_plot_'+historical+'" href="#"> '+label_text+'</button><button type="button" change_to="resample_main_plot_'+historical+'" change_to ="resample_main_plot_'+historical+'" class="btn btn-outline-primary change_plot change_plot resample'+'_'+historical+'" href="#">'+label_text_rolling_average+'</button>');

                    $('.lf-downloads').append('<a class="download_forecasts_data" href="#">| '+downlaod_label_text+' </button>');
                    


                    $('.lf-operations_1').prepend('| <a class="change_plot" change_to ="main_plot_'+historical+'" href="#"> Raw '+historical+' data</a> | <a change_to ="resample_main_plot_'+historical+'" class=" change_plot resample'+'_'+historical+'" href="#">'+historical+' '+resample_window+'H Rolling averages</a> ');
                    

                   
               
                    if (Plotly.newPlot('observations_only', pred_obs, layout)) {


                    } 
                }
               
                $(".loading_forecasts").fadeOut(10);
                
            });

        },
        error: function(jqXHR, status, er) {
            if (jqXHR.status === 404) {
                $('.forecasts-view').html("Sorry, forecasts not available for "+param+" in this location");
            }

        }
    });
}


function openForecastsWindow(options = {}) {
    const {
        messages = ["Loading", "Please hold"],
        st_id = "",
        param = "no2",
        location_name = "",
        observation_value = "N/A",
        current_observation_unit = "N/A",
        obs_src = "N/A",
        precomputed_forecasts = "[]",
        isModal = true,
        timezone = "UTC",
        current_forecast_timestamp = null
    } = options;

    const $loadingDiv = $(".loading_div");
    const $forecastsContainer = $(".forecasts_container");
    const $loadingScreen = $('#loading-screen');

    let obsSrcFinal = obs_src;
    if (obsSrcFinal === 'NASA Pandora') {
        obsSrcFinal = 's3';
    }

    // filename
    window._lastOpenedLocationName = location_name.replace(/[_-]/g, ' ').trim();

    if (isModal) {
        const fileToLoad = `vues/location.html`;
        $forecastsContainer.load(`${fileToLoad}?st=${st_id}&param=${param}&location_name=${location_name}&obs_src=${obsSrcFinal}`, function () {
            $loadingScreen.show();
            $(this).fadeOut(10).fadeIn(10);

            const intervalId = setInterval(() => {
                const message = messages[Math.floor(Math.random() * messages.length)];
                $(".messages").html(message);
            }, 100);

            $('.current_location_name').html(location_name.replace(/[_\W]+/g, " "));
            $('.current_param').html(pollutant_details(param).name);
            $('.current_param_1').html(pollutant_details(param).name);
            $('.current_observation_value').html(observation_value);
            $('.current_observation_unit_span').html(current_observation_unit);

            $forecastsContainer.addClass("noussair_animations zoom_in");
            $loadingDiv.fadeOut(10);

            $("button").css({
                "animation": "intro 2s cubic-bezier(0.03, 1.08, 0.56, 1)",
                "animation-delay": "2s"
            });

            if (param === 'pm25' || param === 'pm2.5') {
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    param: param,
                    current_forecast_timestamp: current_forecast_timestamp
                });
            } else if (param === 'no2') {
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    param: param,
                    current_forecast_timestamp: current_forecast_timestamp
                });
            } else {
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    current_forecast_timestamp: current_forecast_timestamp
                });
            }

            $loadingScreen.hide();
            clearInterval(intervalId);
        });
    } else {
            $loadingScreen.show();
            $(this).fadeOut(10).fadeIn(10);

            const intervalId = setInterval(() => {
                const message = messages[Math.floor(Math.random() * messages.length)];
                $(".messages").html(message);
            }, 100);

            $('.current_location_name').html(location_name.replace(/[_\W]+/g, " "));
            $('.current_param').html(pollutant_details(param).name);
            $('.current_param_1').html(pollutant_details(param).name);
            $('.current_observation_value').html(observation_value);
            $('.current_observation_unit_span').html(current_observation_unit);

            $forecastsContainer.addClass("noussair_animations zoom_in");
            $loadingDiv.fadeOut(10);

            $("button").css({
                "animation": "intro 2s cubic-bezier(0.03, 1.08, 0.56, 1)",
                "animation-delay": "2s"
            });
       if (param === 'pm25' || param === 'pm2.5') {
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    param: param,
                    current_forecast_timestamp: current_forecast_timestamp
                });
            } else if (param === 'no2') {
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    param: param,
                    current_forecast_timestamp: current_forecast_timestamp
                });
            } else {
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    current_forecast_timestamp: current_forecast_timestamp
                });
            }
    }
}


function zoomToLocation(lat, lon, zoomLevel = 10) {
    if (!window.currentMap) {
        console.warn('Map not available for zoom');
        return;
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
        console.warn('Invalid coordinates for zoom:', lat, lon);
        return;
    }
    
    const mapContainer = window.currentMap.getContainer();
    const mapWidth = mapContainer.offsetWidth;
    
    const isMobile = window.innerWidth <= 768;
    const offsetX = isMobile ? 0 : mapWidth * 0.25;
    
    const targetPoint = window.currentMap.project([latitude, longitude], zoomLevel);
    targetPoint.x += offsetX;
    const offsetCenter = window.currentMap.unproject(targetPoint, zoomLevel);
    
    window.currentMap.once('moveend', function() {
        if (typeof window.currentMap.invalidateSize === 'function') {
            window.currentMap.invalidateSize();
        }
        if (window.GeoTIFFManager && window.GeoTIFFManager.getState) {
            const geoState = window.GeoTIFFManager.getState();
            if (geoState.currentLayer && typeof geoState.currentLayer.redraw === 'function') {
                geoState.currentLayer.redraw();
            }
        }
    });
    
    window.currentMap.flyTo([offsetCenter.lat, offsetCenter.lng], zoomLevel, {
        duration: 1.5,
        easeLinearity: 0.25
    });
    
    console.log(`Zooming to location: ${latitude}, ${longitude} (offset center: ${offsetCenter.lat}, ${offsetCenter.lng}) at zoom level ${zoomLevel}`);
}

// Global
window.zoomToLocation = zoomToLocation;

$(document).on("click", ".launch-local-forecasts", function() {
    const messages = [
        "Connecting to OpenAQ", 
        "Connecting to GMAO", 
        "Fetching data from OpenAQ", 
        "Fetching data from GMAO FTP", 
        "Fetching observations", 
        "Getting the forecasts", 
        "Please wait...", 
        "Connecting..."
    ];

    const location_id = $(this).attr("station_id");
    const param = $(this).attr('parameter');
    const location_name = $(this).attr("location_name");
    const observation_source = $(this).attr("observation_source");
    const precomputed_forecasts = $(this).attr("precomputed_forecasts");
    const observation_value = $(this).attr("observation_value");
    const current_observation_unit = $(this).attr("current_observation_unit");
    const obs_src = $(this).attr("obs_src");
    const timezone = $(this).attr("timezone");
    
    const latitude = $(this).attr("latitude");
    const longitude = $(this).attr("longitude");
    
    // Zoom
    zoomToLocation(latitude, longitude, 12);

    openForecastsWindow({
        messages: ["Loading", "Please hold"],
        st_id: location_id,
        param: param || 'no2',
        location_name,
        observation_value,
        current_observation_unit,
        obs_src,
        precomputed_forecasts,
        isModal: true,
        timezone
    });
});


$(document).on("click", ".upload-your-data", function() {
    $(".loading_div").fadeIn(10);
    var messages = ["Connecting to OpenAQ", "Connecting to GMAO", "fetching data from OpenAQ", "fetching data from GMAO FTP", "fetching observations", "getting the forecasts", "please wait...", "connecting...."];
    setInterval(function() {
        var message = messages[Math.floor(Math.random() * messages.length)];
        $(".messages").html(message)
    }, 100);
    var st_id = $(this).attr("station_id");
    var param = $(this).attr("parameter");
    $(".forecasts_container").load("vues/data-handle.html?st=" + st_id + '&param=' + param, function() {
        $(this).fadeOut(10);
        $(this).fadeIn(10);
        $(".forecasts_container").addClass("noussair_animations zoom_in");
        $(".loading_div").fadeOut(10);
    });
});


function save_data_to_csv(data) {
    var blob = new Blob(data, {
        type: "text/csv;charset=utf-8"
    });
    saveAs(blob, "file.csv");
}


$(document).on("click", '.retrain_model', function() {
    current_param = $(this).attr("param");
    current_site = $(this).attr("site");
    current_unit = $(this).attr("unit");
    
    //readApiBaker(current_site,current_param,current_unit,'main_plot_for_api_baker', false);
    
   });



   $(document).on("change", '.form-check-input', function() {
       var auto_refresh = 2;
       var reinforce_training = 2;
       var hpTunning = 2;
       var historical = 2;
    if($(this).prop("checked") == true){
        var item_checked = $(this).attr('id');

        if(item_checked == "auto_refresh"){
            auto_refresh = 1
        }
        else if(item_checked == "model_update"){
            reinforce_training = 1
        }

        else if(item_checked == "model_update_hp"){
            hpTunning = 1
        }
        
        else if(item_checked == "display_historical"){
            historical = 1
        }

        current_param = $(this).attr("param");
        current_site = $(this).attr("site");
        current_unit = $(this).attr("unit");

        
        
        
    }


    //(current_site,current_param,current_unit,'main_plot_for_api_baker', button_option = false, historical=1, reinforce_training=2,hpTunning=2, resample = false, update=1);


    });
    
// Main

$('.modal-dialog').on('show.bs.modal', function () {
    $('#loading-screen').show();
  });
  
 
  // V1.1

$(document).on('click', '.routing_pollutant_param', function(e) {
    $(".loading_div").fadeIn(100);
    const param = $(this).attr('lf-param');
    $(".g-lf-params").attr("param", param);
    $.ajax({
        type: "Get",
        url: location_modules,
        dataType: "json",
        success: function(sites) {
            var param = $(".g-lf-params").attr('param');
            get_all_sites_data(sites).then((all_sites) => map = create_map(all_sites, param))
        },
        error: function(){
            alert("WARNING: LOCATION FILE NOT CONNECTING");
        }
    });
    $(".loading_div").fadeOut(100);

});

    $(document).on("click", '.change_plot', function() {

    var change_to_val = $(this).attr("change_to");
       $('.model_plots').hide();
        $('.'+change_to_val).show(); 

        if (change_to_val == "main_plot_for_api_baker"){
            $('.form-check').show()
        }else{
            $('.form-check').hide()
        }
   });

    $(document).on('keyup', '#filter-input', function() {
        var locationName = $('#filter-input').val().toLowerCase();
        $('.launch-local-forecasts').each(function() {
            var item = $(this);
           
            var item_parent = $(this).parent();
            var itemName = item.attr('location_name').toLowerCase();
             console.log("Filtering item: ", itemName);
                        if (itemName.includes(locationName)) {
                item_parent.removeClass('hide-on-filter');
            } else {
                item_parent.addClass('hide-on-filter');
            }
        });
    });

document.addEventListener("DOMContentLoaded", function () {
    const modalBody = document.querySelector(".modal-body");
    const fullPageButton = document.createElement("button");


    fullPageButton.textContent = "Full Page";
    fullPageButton.className = "btn btn-primary full-page-toggle";
    fullPageButton.style.position = "absolute";
    fullPageButton.style.top = "10px";
    fullPageButton.style.right = "10px";
    fullPageButton.style.zIndex = "1000";


    modalBody.parentElement.appendChild(fullPageButton);


    fullPageButton.addEventListener("click", function () {
        modalBody.classList.toggle("full-page-modal");

        if (modalBody.classList.contains("full-page-modal")) {
            fullPageButton.textContent = "Exit Full Page";
        } else {
            fullPageButton.textContent = "Full Page";
        }
    });
});