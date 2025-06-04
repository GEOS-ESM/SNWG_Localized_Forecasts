
// LF V1.0
$(document).ready(function() {
    $('body').on('click', '.nl_wave_routing', function(e) {
        e.preventDefault(); 

        const page = $(this).attr('href');
        const $loadingDiv = $(".loading_div");
        const $forecastsContainer = $(".forecasts_container");
        const messages = ["Please wait...", "Connecting..."];
        

        $loadingDiv.fadeIn(10);
        let intervalId = setInterval(() => {
            const message = messages[Math.floor(Math.random() * messages.length)];
            $(".messages").html(message);
        }, 100);


        $forecastsContainer.load("vues/" + page, function() {
            $forecastsContainer.fadeOut(10, function() {
                $(this).fadeIn(10).addClass("noussair_animations zoom_in");
            });
            $loadingDiv.fadeOut(10);
            clearInterval(intervalId); 
        });
    });
});


mapboxgl.accessToken = 'pk.eyJ1IjoibGF6cmFrbiIsImEiOiJjanZodzV3OXUwNmEwNDRxdnVsZGhnaml4In0.-ES_Lt127Id6DEf8H9E3rg';

var deltaDegrees = 25;

function easing(t) {
    return t * (2 - t);
}


function pollutant_details(code) {
    var pollutant_details = [];
    if (code == "no2" || code == "1") {
        pollutant_details.name = "<b>Nitrogen Dioxide</b> (NO<sub>2</sub>)";
        pollutant_details.id= 1;
    }

    if (code == "so2" || code == "2") {
        pollutant_details.name = "<b>Sulfur Dioxide</b> (SO<sub>2</sub>)";
        pollutant_details.id= 2;
    }
    if (code == "pm25" || code == "3") {
        pollutant_details.name = "<b>Particulate Matter</b> (PM<sub>2.5</sub>)";
        pollutant_details.id= 3;
    }

    if (code == "o3" || code == "4") {
        pollutant_details.name = "<b>Ozone</b> (O<sub>3</sub>)";
        pollutant_details.id= 4;
    }

    return pollutant_details;
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

    var filteredPandoraNo2L1ColData = filteredDatetimeIndices.map(function(index) {
        return master_data.master_pandora_no2_l1col[index];
    });

    filteredMasterData.master_datetime = filteredDatetimeData;
    filteredMasterData.master_observation = filteredObservationData;
    filteredMasterData.master_localized = filteredLocalizedData;
    filteredMasterData.master_uncorrected = filteredUncorrectedData;
    filteredMasterData.master_pandora_no2_l1col = filteredPandoraNo2L1ColData;

    return filteredMasterData;
}

function add_marker(map, lat, long, open_aq_id, param, site) {

    var station_id = document.createAttribute("station_id");
    var parameter = document.createAttribute("parameter");
    var location_name = document.createAttribute("location_name");
    var observation_value = document.createAttribute("observation_value");
    var current_observation_unit = document.createAttribute("current_observation_unit");
    var status = document.createAttribute("status");
    var timezone = document.createAttribute("timezone");

    if(site.site_data.obs_source == 's3'){
        location_name.value = site.site_data.location.replace(/[_\W]+/g, "-");
        observation_value.value = 'PND';
        current_observation_unit.value = site.obs_options.no2.unit;
    }
    else{
        if ($.isArray(site.latest_measurments)){
            $.each(site.latest_measurments, function(key, value) {
                if (value.parameter == param) {
                    location_name.value = site.site_data.location.replace(/[_\W]+/g, "-");
                    location_name.status = site.site_data.location.status;
                    observation_value.value = value.value;
                    current_observation_unit.value = value.unit;
                    timezone.value = value.timezone;
                }
        
            });
        }
    }
   
    station_id.value = open_aq_id;
    parameter.value = param;


    var site = [lat, long];
    var el_open_aq_id = document.createElement('div');

    el_open_aq_id.id = 'marker_' + open_aq_id;
    el_open_aq_id.className += " btn-floating pulse launch-local-forecasts";
    el_open_aq_id.setAttributeNode(station_id);
    el_open_aq_id.setAttributeNode(parameter);
    el_open_aq_id.setAttributeNode(location_name);
    el_open_aq_id.setAttributeNode(observation_value);
    el_open_aq_id.setAttributeNode(current_observation_unit);
    el_open_aq_id.setAttributeNode(source);
    el_open_aq_id.setAttributeNode(timezone);
    new mapboxgl.Marker(el_open_aq_id)
        .setLngLat(site)
        .addTo(map);

    
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

    if (window.currentMap && window.currentMap.remove) {
        window.currentMap.remove();
        window.currentMap = null;
    }
    $('#map').html('');
    var deltaDistance = 100;
    var center_point = [30.1272444, -1.9297706];
    var map = new mapboxgl.Map({
        style: 'mapbox://styles/lazrakn/clhoolpb603b701pah3tpcs3a',
        center: center_point,
        zoom: 2,
        pitch: 0,
        bearing: 0,
        container: 'map',
        minZoom: 1,
        maxZoom: 10
       
    });
    map.setRenderWorldCopies(false);
    const bounds = [
    [-180, -85], 
    [180, 85]    
    ];

    map.setMaxBounds(bounds);
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();



    var mapVisible = true;

    $(document).on('click', '#global-view', function() {
    if (mapVisible) {
        map.fitBounds([[-180, -90], [180, 90]], {
            duration: 20, 
            padding: 0, 
            margin: 0
          });

        $('#replay-animation').css({
            'opacity': 0.7
          }).fadeIn('fast');
    } else {
        
        $('#replay-animation').fadeOut('fast');
    }
    
    mapVisible = !mapVisible;
    });


    
    map.on('load', async () => {
        map.resize(); // 
        map.addSource('locations_dst', {
            type: 'geojson',
            data: sites, 
            cluster: false,
            clusterMaxZoom: 2, 
            clusterRadius: 100 
        });
        map.on('click', 'clustered-point', function(e) {
            var features = map.queryRenderedFeatures(e.point, { layers: ['clustered-point'] });

            var clusterId = features[0].properties.cluster_id;
        
            map.getSource('locations_dst').getClusterExpansionZoom(clusterId, function(err, zoom) {
              if (err) return;
        
              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
            });
          });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle', 
            source: 'locations_dst',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': [
                    'case',
                    ['has', 'aqi_color'],
                    ['get', 'aqi_color'],
                    '#9e9e9e'
                ],
                'circle-radius': 18,
                'circle-stroke-width': 0.4,
                'circle-stroke-color': '#ffffff'
            }
        });
        
        map.addLayer({
            id: 'pm25-value-label',
            type: 'symbol',
            source: 'locations_dst',
            filter: ['!', ['has', 'point_count']],
            layout: {
                'text-field': [
                    'case',
                    ['==', ['get', 'aqi_value'], 'N/A'],
                    '',
                    ['to-string', ['get', 'aqi_value']]
                ],
                'text-font': ['Open Sans Bold'],
                'text-size': 12,
                'text-offset': [0, 0],
                'text-anchor': 'center'
            },
            paint: {
                'text-color': '#222',
                'text-halo-color': '#fff',
                'text-halo-width': 1.5
            }
        });

    
    map.addLayer({
            id: 'clustered-point',
            type: 'circle',
            source: 'locations_dst',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'case',
                ['>', ['get', 'point_count'], 10], '#1da1f2',
                ['>', ['get', 'point_count'], 5], '#1da1f2',
                '#1da1f2'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20, 10,
                30, 100,
                40
              ]

            }
          });
        
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'locations_dst',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#ffffff'
            }
          });
    

        
            
    });



   const hoverDiv = document.getElementById('map-hover-info');

        map.on('mouseenter', 'unclustered-point', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features[0];
        const locationName = feature.properties.location_name || "Unknown";
        const aqiValue = feature.properties.aqi_value || 'N/A';
        const param = feature.properties.parameter || 'no2';
    
     
        hoverDiv.innerHTML = `
            <div style="font-weight:bold; margin-bottom:4px;">${locationName}</div>
            ${generateSmallAqiBox(aqiValue, param)}
        `;
        hoverDiv.style.display = 'block';
    
     
        map.on('mousemove', onMove);
        function onMove(ev) {
            hoverDiv.style.left = (ev.point.x + 15) + 'px';
            hoverDiv.style.top = (ev.point.y + 15) + 'px';
        }
  
        map.once('mouseleave', 'unclustered-point', () => {
            map.getCanvas().style.cursor = '';
            hoverDiv.style.display = 'none';
            map.off('mousemove', onMove);
        });
        
    });

    



    var list_in = [];
    map.on("sourcedata", function(e) {
        if (map.getSource('locations_dst') && map.isSourceLoaded('locations_dst')) {
            var features = map.querySourceFeatures('locations_dst');
              
            $.each(features, function(index, site) {
                if(site.properties.location_id){
                    var l_id =site.properties.location_id;
                    if (!~$.inArray(l_id,list_in))  {
                        list_in.push(l_id);
                       
                    }
                }
               
            });  
        }
    });
    
    map.on('click', function(e) {
        var lngLat = e.lngLat;
        var longitude = lngLat.lng;
        var latitude = lngLat.lat;
    
        console.log('Longitude: ' + longitude);
        console.log('Latitude: ' + latitude);
        
    
      });


        map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const location_id = e.features[0].properties.location_id;
        const location_name = e.features[0].properties.location_name.replace(/[^a-z0-9\s]/gi, '_').replace(/[_\s]/g, '_');
        const observation_source = e.features[0].properties.observation_source;
        const observation_value = e.features[0].properties.forecasted_value;
        const precomputed_forecasts = e.features[0].properties.precomputed_forecasts ? $.parseJSON(e.features[0].properties.precomputed_forecasts) : [];
        const obs_option = e.features[0].properties.obs_options ? $.parseJSON(e.features[0].properties.obs_options) : [];
        const observation_unit = obs_option?.[0]?.no2?.unit || 'N/A'; 
        const param = e.features[0].properties.parameter;
        const timezone = e.features[0].properties.time_zone || "UTC";
    
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
            timezone
        });
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });


    return map;
}

function sitesArrayToGeoJSON(sites, param = "no2") {
    return {
        type: "FeatureCollection",
        features: sites.map(site => {
           
            const now = new Date();
            const pad = n => n.toString().padStart(2, '0');
            const siteLocalNow = new Date(now.toLocaleString("en-US", { timeZone: site.timezone }));
            const localYear = siteLocalNow.getFullYear();
            const localMonth = pad(siteLocalNow.getMonth() + 1);
            const localDate = pad(siteLocalNow.getDate());
            const localHour = siteLocalNow.getHours();
            const currentLocalStr = `${localYear}-${localMonth}-${localDate} ${pad(localHour)}`;
 
            let currentForecast = {};
            if (param === "pm25") {
                // For PM2.5, match if current hour is within any 3-hour window
                currentForecast = (site.forecasts || []).find(forecast => {
                    if (!forecast.local_time) return false;
                    const forecastDate = forecast.local_time.slice(0, 10);
                    const forecastHour = parseInt(forecast.local_time.slice(11, 13), 10);
                    return (
                        forecastDate === `${localYear}-${localMonth}-${localDate}` &&
                        localHour >= forecastHour &&
                        localHour < forecastHour + 3
                    );
                }) || {};
            } else {
                // For NO2 and O3, match exact hour
                currentForecast = (site.forecasts || []).find(forecast => {
                    if (!forecast.local_time) return false;
                    const forecastHourStr = forecast.local_time.slice(0, 13);
                    return forecastHourStr === currentLocalStr;
                }) || {};
            }
            

            let value = "N/A";
            let aqi = "N/A";
            if (param === "no2") {
                aqi = currentForecast.no2_aqi ?? "N/A";
            } else if (param === "pm25") {
                aqi = currentForecast.pm25_aqi ?? currentForecast.pm25_conc_cnn ?? "N/A";
            } else if (param === "o3") {
                aqi = currentForecast.o3_aqi ?? "N/A";
            }
            const aqiLevel = getAqiLevel(aqi, param);

            let coordinates = [site.lon, site.lat];

            return {
                type: "Feature",
                properties: {
                    location_id: site.location_id || site.location || "unknown_id",
                    location_name: site.location || "Unknown Location",
                    time_zone: site.timezone,
                    forecasted_value: value,
                    aqi_value: aqi,
                    aqi_color: aqiLevel.color,
                    status: "active",
                    observation_source: "NASA",
                    parameter: param,
                    obs_options: [currentForecast || null],
                    precomputed_forecasts: [currentForecast || null]
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
    if (aqiValue === 'N/A' || aqiValue === undefined || aqiValue === null || isNaN(aqiValue)) return '';

    let aqi = 'N/A';
    if (pollutant === 'no2') {
        aqi = aqiValue;
    } else if (pollutant === 'pm25') {
        aqi = aqiValue;
    } else if (pollutant === 'o3') {
        aqi = aqiValue;
    }

    if (aqi === 'N/A' || isNaN(aqi)) return '';

    const aqiLevel = getAqiLevel(aqi);

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
            <div style="position:relative;height:0;">
                <div style="position:absolute;top:-8px;left:${Math.min(Math.max((aqi/500)*100,0),100)}%;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:7px solid #222;transform:translateX(-50%);"></div>
            </div>
        </div>
    `;
}

function readCompressedJsonAndAddBanners(fileUrl, selectedSpecies) {

    if (window.currentForecastData) window.currentForecastData = null;
    showLoadingDiv();

    fetch(fileUrl)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch the compressed JSON file');
            return response.arrayBuffer();
        })
        .then(buffer => {
            const decompressedData = pako.inflate(new Uint8Array(buffer), { to: 'string' });
            const sanitizedData = decompressedData.replace(/NaN/g, "null");
            return JSON.parse(sanitizedData); 
        })
        .then(data => {
            console.log("Decompressed and parsed data:", data);
            data.sort((a, b) => {
                const nameA = (a.location_name || a.location || '').toLowerCase();
                const nameB = (b.location_name || b.location || '').toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });

            if (!Array.isArray(data)) {
                console.error("Invalid JSON structure: Expected an array of sites.");
                hideLoadingDiv();
                return;
            }


            $(".pollutant-banner-o").empty();

            const now = new Date();
            const pad = n => n.toString().padStart(2, '0');
            const filteredSites = [];

            data.forEach(site => {
                const siteSpecies = (site.species || "").toLowerCase();
                const selected = (selectedSpecies || "").toLowerCase();
                const pm25Aliases = ["pm25", "pm2.5", "pm 2.5", "pm_2.5", "pm-2.5", "pm 25", "pm_25", "pm-25"];
                const isPm25 = pm25Aliases.includes(selected.replace(/\s|_|-/g, ""));
                const isSpeciesMatch = isPm25
                    ? pm25Aliases.includes(siteSpecies.replace(/\s|_|-/g, ""))
                    : siteSpecies === selected;
            
                if (!isSpeciesMatch) return;
                if (!site.timezone || typeof site.timezone !== "string" || site.timezone === "null") return;
            
                const siteLocalNow = new Date(now.toLocaleString("en-US", { timeZone: site.timezone }));
                const localYear = siteLocalNow.getFullYear();
                const localMonth = pad(siteLocalNow.getMonth() + 1);
                const localDate = pad(siteLocalNow.getDate());
                const localHour = siteLocalNow.getHours();
            
                let matchingForecast = null;
            
                if (isPm25) {
                    // For PM2.5, always use 3-hour window match
                    matchingForecast = (site.forecasts || []).find(forecast => {
                        if (!forecast.local_time) return false;
                        // Parse forecast start time as Date
                        const forecastStart = new Date(forecast.local_time.replace(' ', 'T'));
                        // Forecast end is 3 hours later
                        const forecastEnd = new Date(forecastStart.getTime() + 3 * 60 * 60 * 1000);
                        // Current site-local time
                        const nowLocal = new Date(now.toLocaleString("en-US", { timeZone: site.timezone }));
                        return nowLocal >= forecastStart && nowLocal < forecastEnd;
                    });

                   
                } else {
                    const currentLocalStr = `${localYear}-${localMonth}-${localDate} ${pad(localHour)}`;
                    matchingForecast = (site.forecasts || []).find(forecast => {
                        if (!forecast.local_time) return false;
                        const forecastHourStr = forecast.local_time.slice(0, 13);
                        return forecastHourStr === currentLocalStr;
                    });
                }
            
                matchingForecast = matchingForecast || {};
            
                let forecasted_value = "N/A";
                if (selected === "no2" && matchingForecast.corrected !== undefined ) {
                    forecasted_value = matchingForecast.corrected;
                } else if (isPm25) {
                    forecasted_value = matchingForecast.pm25_aqi;
                }
            
                if (forecasted_value !== "N/A") {
                    const obsOptions = {};
                    Object.keys(matchingForecast).forEach(key => {
                        if (key !== "time" && key !== "local_time") {
                            obsOptions[key] = {
                                unit: getUnitForParameter(key),
                                value: matchingForecast[key] || "N/A"
                            };
                        }
                    });
            
                    const siteData = {
                        location_name: site.location,
                        observation_source: "NASA",
                        forecasted_value: forecasted_value,
                        status: "active",
                        latitude: site.lat,
                        longitude: site.lon,
                        timezone: site.timezone,
                        precomputed_forecasts: JSON.stringify([matchingForecast]),
                        obs_options: JSON.stringify(obsOptions),
                    };

            
                    add_the_banner(siteData, selectedSpecies);
                    filteredSites.push({
                        ...site,
                        forecasted_value: forecasted_value
                    });
                }
            });

            const geojson = sitesArrayToGeoJSON(filteredSites, selectedSpecies);

            create_map(geojson, selectedSpecies);

            hideLoadingDiv();
        })
        .catch(error => {
            console.error("Error processing the compressed JSON file:", error);
            hideLoadingDiv();
        });
}

function showLoadingDiv() {
    const $div = $(".loading_div");
    $div.removeClass("slide-up-out").addClass("slide-up-in").show();
}
function hideLoadingDiv() {
    const $div = $(".loading_div");
    $div.removeClass("slide-up-in").addClass("slide-up-out");
    setTimeout(() => $div.hide(), 700); 
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
        const temperature = precomputed_forecasts?.[0]?.t10m ? (precomputed_forecasts[0].t10m - 273.15).toFixed(1) : "N/A";
        const humidity = precomputed_forecasts?.[0]?.rh ? (precomputed_forecasts[0].rh * 100).toFixed(0) : "N/A";
        const windSpeed = precomputed_forecasts?.[0]?.wind_speed || "--";
        const local_time = precomputed_forecasts?.[0]?.local_time || "--";
        const no2 = precomputed_forecasts?.[0]?.no2 || "--";
        const no2_aqi = precomputed_forecasts?.[0]?.no2_aqi || "--";
        const o3 = precomputed_forecasts?.[0]?.o3 || "--";  
        const o3_aqi = precomputed_forecasts?.[0]?.o3_aqi || "--";
        const pm25 = precomputed_forecasts?.[0]?.pm25 || "--";
        const pm25_aqi = precomputed_forecasts?.[0]?.pm25_aqi || "--";


        let aqiValue = 'N/A';
        if (param === "no2") {
            aqiValue = no2_aqi;
            source = "NASA GEOS CF, NASA Pandora";
        } else if (param === "pm25" || param === "pm2.5") {
            aqiValue = pm25_aqi;
            source = "NASA GEOS-FP, AirNow";
        } else if (param === "o3") {
            aqiValue = o3_aqi
            source = "NASA GEOS CF, NASA Pandora";
        }

        const aqiLevel = getAqiLevel(aqiValue, param);

        const html = `
            <div class="col-3 single-pollutant-card">
                <a class="launch-local-forecasts" obs_src="${site.observation_source}" parameter="${param}" station_id="${site.location_id}" location_name="${site.location_name.replace(/ /g, "-")}" observation_value="${site.forecasted_value}" status="${site.status}" current_observation_unit="${obs_options?.[param]?.unit || 'N/A'}" latitude="${site.latitude}" longitude="${site.longitude}" lastUpdated="--" precomputed_forecasts='${JSON.stringify(precomputed_forecasts)}', timezone="${site.timezone}" >
                    <div class="pollutant-banner">
                        <div class="banner-header">
                            <div class="location-info">
                                <h5 class="location-name">${
                                  site.location_name.length > 10
                                    ? site.location_name.replace(/_/g, ' ').replace(/\./g, ' ').slice(0, 10) + '...'
                                    : site.location_name.replace(/_/g, ' ').replace(/\./g, ' ')
                                }</h5>
                                <p class="source">Sources: ${source}</p>
                                <p class="source">${local_time ? local_time.slice(11, 16) : "--"} </p>
                                <p class="timezone_text">(${site.timezone})</p>
                            </div>
                            <div class="aqi-info">
                                <div class="aqi-circle" style="background-color: ${aqiLevel.color};">
                                    <span class="aqi-value">${aqiValue}</span>
                                </div>
                                <span class="aqi-level">${aqiLevel.level}</span>
                            </div>
                        </div>
                        <div class="banner-body compact">
                            <div class="weather-info">
                                <div class="info-item">
                                    <!-- Temperature Icon -->
                                    <span class="info-icon">
                                        <i class="bi bi-thermometer-half"></i>
                                    </span>
                                    <span class="info-value">${temperature}°C</span>
                                </div>
                                <div class="info-item">
                                    <!-- Humidity Icon -->
                                    <span class="info-icon">
                                        <i class="bi bi-droplet-half"></i>
                                    </span>
                                    <span class="info-value">${humidity}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;

        $(".pollutant-banner-o").append(html);
    }
}

function cleanupBanners() {

    $('.pollutant-banner-o').empty();
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
        plotType = "aqi", // "aqi" or "concentration"
    } = options;

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

    const fileUrl = `precomputed/all_dts/${location.replace(/_/g, "-")}.json`;

    fetch(fileUrl)
        .then(response => {
            if (!response.ok) {
                const fallbackUrl = `precomputed/all_dts/${location.replace(/[-\s]/g, "_")}.json`;
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
            if (!data || data.status !== "200" || !Array.isArray(data.forecasts) || data.forecasts.length === 0) {
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
                master_predicted: [],
                master_predicted_aqi: [],
                master_observation: []
            };

            data.forecasts.forEach(forecast => {
                if (forecast.time) {
                    masterData.master_datetime.push(forecast.local_time);
                }
                // Concentrations
                if (forecast.no2 !== undefined) {
                    masterData.master_no2.push(forecast.no2);
                }
                if (forecast.o3 !== undefined) {
                    masterData.master_o3.push(forecast.o3);
                }
                if (forecast.pm25 !== undefined) {
                    masterData.master_pm25.push(forecast.pm25);
                }
                if (forecast.corrected !== undefined) {
                    masterData.master_predicted.push(forecast.corrected);
                }
                if (forecast.pandora !== undefined) {
                    masterData.master_observation.push(forecast.pandora);
                }
                // AQI values
                if (forecast.no2_aqi !== undefined) {
                    masterData.master_no2_aqi.push(forecast.no2_aqi);
                }
                if (forecast.o3_aqi !== undefined) {
                    masterData.master_o3_aqi.push(forecast.o3_aqi);
                }
                if (forecast.pm25_aqi !== undefined) {
                    masterData.master_pm25_aqi.push(forecast.pm25_aqi);
                }
                // For corrected, calculate AQI if not present
                if (forecast.corrected !== undefined) {
                    let aqi = forecast.no2_aqi;
                    if (aqi === undefined && forecast.no2 !== undefined) {
                        aqi = calculateAqiForNo2(forecast.no2);
                    }
                    masterData.master_predicted_aqi.push(aqi);
                }
            });

            const tabsNav = $("#pills-tabContent").prev();
            const tabsContainer = $(".tab-content");
            tabsNav.empty();
            tabsContainer.empty();
            const tabsList = $('<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist"></ul>');
            tabsNav.append(tabsList);

            const plots = [
                {
                    id: "plot_corrected_aqi",
                    title: `SNWG NO<sub>2</sub> Forecasts (AQI)`,
                    unit: "AQI",
                    data: masterData,
                    param: "no2",
                    tabName: "Nitrogen Dioxide (NO<sub>2</sub>)",
                    tabId: "tab_no2",
                    description: "Source: NASA SNWG bias-corrected model",
                    columns: [
                        { column: "master_predicted_aqi", name: "Corrected AQI", color: "blue", width: 2 }
                    ],
                    displayAQI: true,
                    displayMetrics: true,
                    enableAqiColors: true 
                },
                {
                    id: "plot_pm25_aqi",
                    title: `Particulate Matter (PM<sub>2.5</sub>) (AQI)`,
                    unit: "AQI",
                    data: masterData,
                    param: "pm25",
                    tabName: "Fine Particulate Matter (PM<sub>2.5</sub>)",
                    tabId: "tab_pm25",
                    description: (typeof options.param === "string" && options.param.toLowerCase().includes("pm25"))
                    ? "Source: NASA GEOS-FP+ML PM2.5 Forecast"
                    : "Source: NASA GEOS-CF PM2.5 Forecast",
                    columns: [
                        { column: "master_pm25_aqi", name: "PM2.5 AQI", color: "green", width: 2 }
                    ],
                    displayAQI: true,
                    displayMetrics: true,
                    enableAqiColors: true 
                },
                // Supporting concentration plots
                {
                    id: "plot_corrected_conc",
                    title: `SNWG NO<sub>2</sub> Forecasts (ppbv)`,
                    unit: "ppbv",
                    data: masterData,
                    param: "no2",
                    tabName: "Nitrogen Dioxide (NO<sub>2</sub>)",
                    tabId: "tab_no2",
                    description: "Supporting: NASA SNWG bias-corrected model (concentration)",
                    columns: [
                        { column: "master_predicted", name: "Corrected", color: "blue", width: 2 }
                    ],
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                },
                {
                    id: "plot_pm25_conc",
                    title: `Particulate Matter (PM<sub>2.5</sub>) (μg/m³)`,
                    unit: "μg/m³",
                    data: masterData,
                    param: "pm25",
                    tabName: "Fine Particulate Matter (PM<sub>2.5</sub>)",
                    tabId: "tab_pm25",
                    description: "Supporting: NASA GEOS-CF (concentration)",
                    columns: [
                        { column: "master_pm25", name: "PM2.5", color: "green", width: 2 }
                    ],
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                },
                {
                    id: "plot_o3_conc",
                    title: `Ozone (O<sub>3</sub>) (ppbv)`,
                    unit: "ppbv",
                    data: masterData,
                    param: "o3",
                    tabName: "Ozone (O<sub>3</sub>)",
                    tabId: "tab_o3",
                    description: "Supporting: NASA GEOS-CF (concentration)",
                    columns: [
                        { column: "master_o3", name: "O3", color: "orange", width: 2 }
                    ],
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                },
                // Pandora obs plot 
                {
                    id: "plot_pandora",
                    title: "Pandora NO<sub>2</sub> Observations",
                    unit: "ppbv",
                    data: masterData,
                    param: "no2",
                    tabName: "Nitrogen dioxide (NO<sub>2</sub>)",
                    tabId: "tab_no2",
                    description: "Source: NASA Pandora",
                    columns: [
                        { column: "master_observation", name: "Pandora", color: "black", width: 2 }
                    ],
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                },
                {
                    id: "plot_no2_model",
                    title: "Supporting Data: model-based NO<sub>2</sub> forecast",
                    unit: "ppbv",
                    data: masterData,
                    param: "no2",
                    tabName: "Nitrogen dioxide (NO<sub>2</sub>)",
                    tabId: "tab_no2",
                    description: "Source: NASA GEOS-CF",
                    columns: [
                        { column: "master_no2", name: "NO2", color: "red", width: 2 }
                    ],
                    displayAQI: false,
                    displayMetrics: false,
                    enableAqiColors: false 
                }
            ];

            const tabMap = {};
            plots.forEach((plot, index) => {
                const colKey = plot.columns[0]?.column;
                const dataArr = plot.data && colKey && Array.isArray(plot.data[colKey]) ? plot.data[colKey] : [];
                if (!dataArr.length) {
                    return;
                }

                const tabId = plot.tabId;
                if (!tabMap[tabId]) {
                    const isActive = Object.keys(tabMap).length === 0 ? "active" : "";
                    tabsList.append(`
                        <li class="nav-item" role="presentation">
                            <a class="nav-link ${isActive}" id="tab-${tabId}" data-bs-toggle="pill" href="#${tabId}" role="tab" aria-controls="${tabId}" aria-selected="${isActive === 'active'}">
                                ${plot.tabName}
                            </a>
                        </li>
                    `);
                    tabsContainer.append(`
                        <div class="tab-pane fade ${isActive} show" id="${tabId}" role="tabpanel" aria-labelledby="tab-${tabId}">
                            <div class="plot-container" id="${plot.id}"></div>
                            <div class="aqi-container" id="aqi-${plot.id}"></div>
                        </div>
                    `);
                    tabMap[tabId] = true;
                } else {
                    $(`#${tabId}`).append(`<div class="plot-container" id="${plot.id}"></div><div class="aqi-container" id="aqi-${plot.id}"></div>`);
                }

                const siteTimeZone = timezone || "UTC";
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
                    const currentAqi = currentValue;
                    const nextAqi = nextValue;
                

                    let nextLabel = "Next hour";
                    if (plot.param === "pm25") {
                        nextLabel = "Next 3 hours";
                    }
                
                    const currentAqiElement = generateAqiElement(currentAqi, plot.param, siteTimeZone, currentHour);
                    let nextAqiElement = generateAqiElement(nextAqi, plot.param, siteTimeZone, nextHour);
                
                    if (plot.param === "pm25" && typeof nextAqiElement === "string") {
                        nextAqiElement = nextAqiElement.replace(
                            /AQI \([A-Z0-9.]+\) at \d{1,2}:00/,
                            `AQI (${plot.param.toUpperCase()}) ${nextLabel} (${nextHour}:00)`
                        );
                    }
                
                    const $plotContainer = $(`#${plot.id}`);
                    if ($plotContainer.length > 0) {
                        $plotContainer.before(currentAqiElement);
                        $plotContainer.before(nextAqiElement);
                    }
                }
                if (plot.displayMetrics) {
                    const columnKey = plot.columns[0].column;
                    const values = masterData[columnKey] || [];
                    const datetimes = masterData.master_datetime || [];
                    let currentIdx = -1, prevIdx = -1, nextIdx = -1;
                
                    if (plot.param === "pm25") {
                        for (let i = 0; i < datetimes.length; i++) {
                            const dtStr = datetimes[i];
                            if (!dtStr) continue;
                            const forecastStart = new Date(dtStr.replace(' ', 'T'));
                            const forecastEnd = new Date(forecastStart.getTime() + 3 * 60 * 60 * 1000);
                
                
                            if (siteLocalNow >= forecastStart && siteLocalNow < forecastEnd) {
                                currentIdx = i;
                            }
    
                            const prevLocalDate = new Date(siteLocalNow.getTime() - 1 * 60 * 60 * 1000);
                            if (prevLocalDate >= forecastStart && prevLocalDate < forecastEnd) {
                                prevIdx = i;
                            }

                            const nextLocalDate = new Date(siteLocalNow.getTime() + 1 * 60 * 60 * 1000);
                            if (nextLocalDate >= forecastStart && nextLocalDate < forecastEnd) {
                                nextIdx = i;
                            }
                        }
                    } else {
  
                        for (let i = 0; i < datetimes.length; i++) {
                            const hour = parseInt(datetimes[i].slice(11, 13), 10);
                            if (hour === currentHour) currentIdx = i;
                            if (hour === (currentHour - 1 + 24) % 24) prevIdx = i;
                            if (hour === (currentHour + 1) % 24) nextIdx = i;
                        }
                    }
                
                    const today = siteLocalNow.toISOString().slice(0, 10);
                    const todayVals = datetimes
                        .map((dt, i) => ({ dt, val: values[i] }))
                        .filter(({ dt }) => dt && dt.startsWith(today))
                        .map(({ val }) => typeof val === "number" ? val : NaN)
                        .filter(val => !isNaN(val));
                    const dailyAvg = todayVals.length ? (todayVals.reduce((a, b) => a + b, 0) / todayVals.length) : 'N/A';
                    const currentVal = currentIdx !== -1 ? values[currentIdx] : 'N/A';
                    const prevVal = prevIdx !== -1 ? values[prevIdx] : 'N/A';
                    const nextVal = nextIdx !== -1 ? values[nextIdx] : 'N/A';
                    const change = getChange(currentVal, dailyAvg);
                    const prevChange = getChange(prevVal, dailyAvg);
                    const nextChange = getChange(nextVal, dailyAvg);
                
                    const metricsHtml = generateMetricsHtml({
                        title: plot.title,
                        unit: plot.unit,
                        currentVal,
                        prevVal,
                        nextVal,
                        dailyAvg,
                        change,
                        prevChange,
                        nextChange,
                        currentIdx,
                        prevIdx,
                        nextIdx,
                        datetimes
                    });
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
                const dataArr = plot.data && colKey && Array.isArray(plot.data[colKey]) ? plot.data[colKey] : [];
                if (!dataArr.length) return;
                const plotContainer = $(`#${plot.id}`);
                plotContainer.before(`<div class="plot_description"><h4>${plot.title}</h4><h6>${plot.description || ""}</h6></div>`);
                if (plotContainer.length > 0) {
                    draw_plot(
                        plot.data,
                        plot.param,
                        plot.unit, 
                        plot.id,
                        plot.columns,
                        false,   // dates_ranges
                        false,   // enableFading
                        "",      // text
                        "bar",   // plotType
                        timezone,
                        plot.enableAqiColors 
                    );
                } else {
                    console.error(`No DOM element with id '${plot.id}' exists on the page.`);
                }
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
    if (aqiValue === 'N/A') {
        return ''; 
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
            <h5>AQI (${pollutant.toUpperCase()}) at ${currentHour}:00</h5>
            <span class="time">${userTimeZone}</span>
            <h2>${aqiValue}</h2> 
            <span>${matchingLevel.level}</span>
            <div class="aqi-scale-container">
                <div class="aqi-scale">
                    <div class="aqi-scale-step" style="background-color: #4CAF50;" title="Good (0-50)"></div>
                    <div class="aqi-scale-step" style="background-color: #FFEB3B;" title="Moderate (51-100)"></div>
                    <div class="aqi-scale-step" style="background-color: #FF9800;" title="Unhealthy for Sensitive Groups (101-150)"></div>
                    <div class="aqi-scale-step" style="background-color: #F44336;" title="Unhealthy (151-200)"></div>
                    <div class="aqi-scale-step" style="background-color: #9C27B0;" title="Very Unhealthy (201-300)"></div>
                    <div class="aqi-scale-step" style="background-color: #7E0023;" title="Hazardous (301-500)"></div>
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
    const fileUrl = `precomputed/all_dts/${location}.json`;

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


                    const aqiValue = calculateAqiForPm25(observationValue);
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
                { id: "aqi_plot_for_airnow", title: "PM 2.5 AQI", data: masterData } // Add a new tab for AQI
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
                        : "<b>Sources:</b> NASA Modern-Era Retrospective analysis for Research and Applications (MERRA-2)| | SNWG Bias CNN Model.",
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
            

            let currentValue = 'N/A';
            let nextValue = 'N/A';
            
 
            for (let i = 0; i < masterData.master_datetime.length; i++) {
                const datetime = new Date(masterData.master_datetime[i]);
                const dateString = datetime.toISOString().split('T')[0];
                const hour = datetime.getHours();
            

                if (dateString === currentDateString && hour <= currentHour && currentHour < hour + 3) {
                    currentValue = masterData.master_observation[i];
                }
            

                if (dateString === currentDateString && hour <= currentHour + 3 && currentHour + 3 < hour + 3) {
                    nextValue = masterData.master_observation[i];
                }
            }

            const currentAqi = param === "no2" ? calculateAqiForNo2(currentValue) : calculateAqiForPm25(currentValue);
            const nextAqi = param === "no2" ? calculateAqiForNo2(nextValue) : calculateAqiForPm25(nextValue);

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
    enableAqiColors = false  
) {

    const datetime_data = combined_dataset["master_datetime"];
    const cleanedData = cleanAndSortData(datetime_data, combined_dataset);
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
            barColors = cleanedData.master_datetime.map((datetime) => {
                const dataTime = new Date(datetime);
                return dataTime < localNow ? '#2196f3' : '#2196f3c2';
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
            y: cleanedData[column],
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
            hoverinfo: 'x+y',
            name: name
        };
    });


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
            }
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
            gridcolor: '#D3D3D3'
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
            {
                type: 'line',
                x0: cleanedData.master_datetime[0],
                x1: cleanedData.master_datetime[cleanedData.master_datetime.length - 1],
                y0: maxValue,
                y1: maxValue,
                line: {
                    color: 'red',
                    width: 1,
                    dash: 'dash'
                }
            }
        ]
    };

    Plotly.newPlot(forecasts_div, traces, layout, {responsive: true});
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
        timezone = "UTC"
    } = options;


    const $loadingDiv = $(".loading_div");
    const $forecastsContainer = $(".forecasts_container");
    const $loadingScreen = $('#loading-screen');

    let obsSrcFinal = obs_src;
    if (obsSrcFinal === 'NASA Pandora') {
        obsSrcFinal = 's3';
    }




    const fileToLoad = isModal ? `vues/location.html` : `vues/site.html`;

    $forecastsContainer.load(`${fileToLoad}?st=${st_id}&param=${param}&location_name=${location_name}&obs_src=${obsSrcFinal}`, function () {
        if (isModal) {
            $loadingScreen.show();
            $(this).fadeOut(10).fadeIn(10);
    
            const intervalId = setInterval(() => {
                const message = messages[Math.floor(Math.random() * messages.length)];
                $(".messages").html(message);
            }, 100);
    
            const cleanLocationName = cleanText(location_name);
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
                console.log("Calling readAirNow for PM2.5");
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    param: param,
                });
            } else if (param === 'no2') {
                console.log("Calling readApiBaker for NO2");
                readApiBaker({
                    location: location_name,
                    timezone: timezone,
                    param: param,
                });
            } else {

                console.log("Unknown param, defaulting to readApiBaker");
                readApiBaker({
                    location: location_name,
                    timezone: timezone
                });
            }
    
            $loadingScreen.hide();
            clearInterval(intervalId);
        } else {
            console.log("Loaded site.html for full-page mode.");
            $loadingDiv.fadeOut(10);
        }
    });
}
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
    
// MAIN APP

$('.modal-dialog').on('show.bs.modal', function () {
    $('#loading-screen').show();
  });
  
 
  // LF V1.1 starts here

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