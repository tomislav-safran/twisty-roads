function initSettings() {
    refreshWeights();
    refreshColorBands();
    refreshHighwayTypes();

    twistinessFilter = document.getElementById("twistinessSlider").value;
}

function refreshWeights() {
    const radiusInput1 = document.getElementById("radius1");
    const radiusInput2 = document.getElementById("radius2");
    const radiusInput3 = document.getElementById("radius3");
    const radiusInput4 = document.getElementById("radius4");
    const weightInput1 = document.getElementById("weight1");
    const weightInput2 = document.getElementById("weight2");
    const weightInput3 = document.getElementById("weight3");
    const weightInput4 = document.getElementById("weight4");

    radiiWeights = [[radiusInput1.value, weightInput1.value], [radiusInput2.value, weightInput2.value], [radiusInput3.value, weightInput3.value], [radiusInput4.value, weightInput4.value]];
}

function refreshColorBands() {
    const twistiness1 = document.getElementById("twistiness1");
    const twistiness2 = document.getElementById("twistiness2");
    const twistiness3 = document.getElementById("twistiness3");
    const twistiness4 = document.getElementById("twistiness4");
    const color1 = document.getElementById("color1");
    const color2 = document.getElementById("color2");
    const color3 = document.getElementById("color3");
    const color4 = document.getElementById("color4");

    colorBands = [[twistiness4.value, color4.value], [twistiness3.value, color3.value], [twistiness2.value, color2.value], [twistiness1.value, color1.value]];
}

function refreshHighwayTypes() {
    highways = [];

    if (document.getElementById("primaryHighway").checked) highways.push("primary");
    if (document.getElementById("secondaryHighway").checked) highways.push("secondary");
    if (document.getElementById("tertiaryHighway").checked) highways.push("tertiary");
    if (document.getElementById("residential").checked) highways.push("residential");
    if (document.getElementById("track").checked) highways.push("track");
    if (document.getElementById("unclassified").checked) highways.push("unclassified");
}

function initInteractions() {

    const saveRadius = document.getElementById("saveRadius");
    saveRadius.onclick = async function() {
        refreshHighwayTypes();
        fetchRoads().then(
            () => {
                refreshRoads();
            }
        );
    }

    const saveWeights = document.getElementById("saveWeights");
    saveWeights.onclick = async function() {
        refreshWeights()
        refreshRoads();
    };

    const saveColorBands = document.getElementById("saveColors");
    saveColorBands.onclick = async function() {
        refreshColorBands();
        refreshRoads();
    }

    const radiusSlider = document.getElementById("radiusSlider");
    const radiusSliderValue = document.getElementById("radiusSliderValue");
    radiusSlider.addEventListener('input', (event) => {
        const value = event.target.value;

        radiusSliderValue.textContent = event.target.value;
        radius = value;
        refreshSearchRadius();
    })

    const twistinessSlider = document.getElementById("twistinessSlider");
    const twistinessValue = document.getElementById("twistinessValue");
    twistinessSlider.addEventListener('input', (event) => {
        const value = event.target.value;

        twistinessValue.textContent = value;

        twistinessFilter = value;
        refreshRoads();
    });

    const collapseExpand = document.getElementById("collapseExpand");
    const collapseIcon = document.getElementById("collapseIcon");
    collapseExpand.onclick = function() {
        document.getElementById("inputSection").classList.toggle("collapsed");
        collapseIcon.classList.toggle("rotate180");

        // wait for the collapse animation to finish before loading the map
        setTimeout(() => {
            map.invalidateSize();
        }, 250);
    }
}