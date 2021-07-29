//mapboxgl.accessToken = mapToken; // define in show.ejs file
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 12 // starting zoom
});

// To add controls to the map
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
            `<h3>${campground.title}</h3><p> ${campground.location} </p>`
        )
    )
    .addTo(map)