(() => {
    const config = window.mapConfig;

    if (!config || !window.mapboxgl || !config.accessToken || !config.container) {
        return;
    }

    mapboxgl.accessToken = config.accessToken;

    const map = new mapboxgl.Map({
        container: config.container,
        style: config.style || "mapbox://styles/mapbox/streets-v12",
        center: config.center || [0, 0],
        zoom: config.zoom || 3,
    });

    if (config.type === "cluster" && Array.isArray(config.features)) {
        map.on("load", () => {
            map.addSource("listings", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: config.features,
                },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
            });

            map.addLayer({
                id: "clusters",
                type: "circle",
                source: "listings",
                filter: ["has", "point_count"],
                paint: {
                    "circle-color": "#fe424d",
                    "circle-radius": [
                        "step",
                        ["get", "point_count"],
                        18,
                        10,
                        24,
                        50,
                        32,
                    ],
                    "circle-opacity": 0.85,
                },
            });

            map.addLayer({
                id: "cluster-count",
                type: "symbol",
                source: "listings",
                filter: ["has", "point_count"],
                layout: {
                    "text-field": "{point_count_abbreviated}",
                    "text-size": 12,
                },
            });

            map.addLayer({
                id: "unclustered-point",
                type: "circle",
                source: "listings",
                filter: ["!", ["has", "point_count"]],
                paint: {
                    "circle-color": "#0f172a",
                    "circle-radius": 6,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                },
            });

            map.on("click", "clusters", (event) => {
                const features = map.queryRenderedFeatures(event.point, {
                    layers: ["clusters"],
                });
                const clusterId = features[0].properties.cluster_id;

                map.getSource("listings").getClusterExpansionZoom(
                    clusterId,
                    (error, zoom) => {
                        if (error) {
                            return;
                        }

                        map.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom,
                        });
                    }
                );
            });

            map.on("click", "unclustered-point", (event) => {
                const coordinates = event.features[0].geometry.coordinates.slice();
                const properties = event.features[0].properties;

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(coordinates)
                    .setHTML(
                        `<strong>${properties.title}</strong><br>${properties.location || ""}<br>&#8377; ${Number(properties.price || 0).toLocaleString("en-IN")}`
                    )
                    .addTo(map);
            });

            map.on("mouseenter", "clusters", () => {
                map.getCanvas().style.cursor = "pointer";
            });

            map.on("mouseleave", "clusters", () => {
                map.getCanvas().style.cursor = "";
            });
        });
    }

    if (config.type === "single" && Array.isArray(config.coordinates)) {
        const marker = new mapboxgl.Marker({ color: "#fe424d" })
            .setLngLat(config.coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(config.popupHtml || "")
            )
            .addTo(map);

        map.setCenter(config.coordinates);
        map.setZoom(config.zoom || 9);
        return marker;
    }
})();
