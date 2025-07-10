function initSettings() {
    refreshWeights();
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

function refreshHighwayTypes() {
    highways = [];

    if (document.getElementById("primaryHighway").checked) highways.push("primary");
    if (document.getElementById("secondaryHighway").checked) highways.push("secondary");
    if (document.getElementById("tertiaryHighway").checked) highways.push("tertiary");
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

    const radiusSlider = document.getElementById("radiusSlider");
    const radiusSliderValue = document.getElementById("radiusSliderValue");
    radiusSlider.addEventListener('input', (event) => {
        const value = event.target.value;

        radiusSliderValue.textContent = event.target.value;
        radius = value;
        refreshCircle();
    })

    const twistinessSlider = document.getElementById("twistinessSlider");
    const twistinessValue = document.getElementById("twistinessValue");
    twistinessSlider.addEventListener('input', (event) => {
        const value = event.target.value;

        twistinessValue.textContent = value;

        twistinessFilter = value;
        refreshRoads();
    });
}