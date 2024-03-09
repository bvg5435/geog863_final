require(["esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/renderers/UniqueValueRenderer",
        "esri/widgets/Legend",
        "esri/widgets/Editor",
        "esri/layers/support/LabelClass"],
    (Map, MapView, FeatureLayer, UniqueValueRenderer, Legend, Editor, LabelClass) => {
        const map = new Map({
            basemap: "hybrid"
        });

        // Set the zoom extent to Minnesota.
        const Lat = 46.169553;
        const Long = -94.587120;

        // Create the map view.
        const view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: 7,
            center: [Long, Lat]
        });

        // Function used to create  control point symbology.
        function createValueInfos(varLabel, varValue, symbolColor, symbolSize, symbolType) {
            return {
                label: varLabel,
                value: varValue,
                symbol: {
                    type: "simple-marker",
                    color: symbolColor,
                    size: symbolSize,
                    style: symbolType
                }
            }
        }

        const typeNotVisited = createValueInfos("Not Visited", "Not Visited", "blue", 4, "square");
        const typeLocated = createValueInfos("Visited - Located", "Visited - Located", "white", 4, "square");
        const typeNotLocated = createValueInfos("Visited - Not Located", "Visited - Not Located", "red", 4, "square");

        const ngsRenderer = new UniqueValueRenderer({
            field: "FieldLocated",
            uniqueValueInfos: [
                typeNotVisited,
                typeNotLocated,
                typeLocated
            ]
        });

        // Pop-up Creation for control points.
        const template = {
            title: "{PID}",
            content: "Data Sheet: {DATA_SRCE}<br />Last Reviewed: {LAST_RECV}<br />Last Condition: {LAST_COND}<br />Marker: {MARKER}",
        };

        // Create the feature layer from an item on AGOL.
        const featureLayer = new FeatureLayer({
            portalItem: {
                id: "ed525488e1734683a53144bf4cf95c3d"
            },
            renderer: ngsRenderer,
            outFields: ["PID", "DATA_SRCE", "LAST_RECV", "LAST_COND", "MARKER"],
            popupTemplate: template
        });

        //County labels
        const labelCounty = new LabelClass({
            symbol: {
                type: "text",
                color: "black",
                haloColor: "white",
                haloSize: 1,
                font: {
                    family: "Ubuntu Mono",
                    size: 12
                }
            },
            labelPlacement: "always-horizontal",
            labelExpressionInfo: {
                expression: "$feature.COUNTY_NAME"
            },
            maxScale: 0,
            minScale: 1500000
        });

        // Create counties layer from public web service.
        const featureCounties = new FeatureLayer({
            url: "https://gis.trpdmn.org/traditional/rest/services/CountiesMinnesota_Public_Viewing/FeatureServer/2",
            labelingInfo: [labelCounty],
            renderer: {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: [255, 255, 255, 0.1],
                    outline: {
                        width: 0.25,
                        color: [255, 255, 255, 0.5]
                    }
                }
            }
        });

        map.layers.addMany([featureLayer, featureCounties]);

        // Create a legend for the map.
        const legend = new Legend({
            view: view,
            layerInfos: [{
                layer: featureLayer,
                title: "Control Point Status"
            }]
        });

        // Add the legend.
        view.ui.add(legend, "top-left");

        // Editor Widget
        const editor = new Editor({
            view: view,
            layerInfos: [{
                layer: featureLayer,
                formTemplate: {
                    elements: [{
                        type: "field",
                        fieldName: "FieldLocated",
                        label: "Field Located Status"
                    }
                    ]
                },
                enabled: true,
                addEnabled: false,
                updateEnabled: true,
                deleteEnabled: false,
                attributeUpdatesEnabled: true

            }]
        });

        // Add the widget to the view
        view.ui.add(editor, "top-right");

    });