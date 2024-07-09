const socket = io();

if (navigator.geolocation) {
  socket.on('request-username', () => {
    const username = prompt("Enter your name:");
    socket.emit('send-username', username);
  });
  navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("send-location", { latitude, longitude });
  }, (err) => {
    if (err.code == 1) {
      alert("Location services are currently disabled. This feature requires location access. Please enable location and try again.");
      window.location.reload();
    } else {
      console.error(err);
    }
  }, {
    enableHighAccuracy: true,
    timeout: 5000, // send after every 5 sec
    maximumAge: 0, //for no caching, location would not be stored only new fetched
  });
} else {
  alert("The browser doesn't support geolocation");
}
const map = L.map('map').setView([0, 0], 15); // max 18
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; //subdomain, zoomlevel,x,y coordinate
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Coded by PM with ♥'
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(map);

const markers = {};

socket.on("recieve-location", function (data) {
  const { id, username, latitude, longitude } = data;
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
  markers[id].bindPopup(`<strong>${username.toUpperCase()}</strong>`);
  markers[id].bindTooltip(`${latitude}, ${longitude}`).openTooltip();
});

socket.on("user-disconnected", (id) => {
  console.log("disconnect");
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
})