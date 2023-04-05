import { key } from './config.js';

const locationButton = document.querySelector('#locationButton') 
locationButton.addEventListener('click', ()=> {
    navigator.geolocation.getCurrentPosition(ifSucces, ifError)
})

function ifSucces(position){
   const {latitude, longitude} = position.coords;
   let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`
   fetch(api)
    .then(response => response.json())
    .then(data => {
      const city = data.name;
      alert(`You are currently in ${city}`);
    })
}
function ifError(){
    alert(`Something didn't work well :(\nCheck if you allowed the website to acces your location`);
}