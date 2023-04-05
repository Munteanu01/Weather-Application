import { key } from './config.js';

navigator.geolocation.getCurrentPosition(ifSucces, ifError)
function ifSucces(position){
   const {latitude, longitude} = position.coords;
   let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
   fetch(api)
    .then(response => response.json())
    .then(data => {
        document.querySelector('#locationName').innerText = `You are currently in ${data.name}, ${data.sys.country}`
        document.querySelector('#temp').innerText = `${Math.floor(data.main.temp)}  C`
        document.querySelector('#humidity').innerText = `${data.main.humidity}  % humidity`
        document.querySelector('#feelsLike').innerText = `Feels like ${Math.floor(data.main.feels_like)} C`
        document.querySelector('#description').innerText = `Description: ${data.weather[0].description}`
    })
}
function ifError(){
    alert(`Something didn't work well :(\nCheck if you allowed the website to acces your location`);
}
const locationButton = document.querySelector('#locationButton') 
locationButton.addEventListener('click', ()=> {
    navigator.geolocation.getCurrentPosition(ifSucces, ifError)
})


const search = document.querySelector('#search')
search.addEventListener("keyup", e =>{
    if(e.key == "Enter" && search.value != ""){
        let api = `https://api.openweathermap.org/data/2.5/weather?q=${search.value}&units=metric&appid=${key}`;
        fetch(api)
        .then(response => response.json())
        .then(data => {
          document.querySelector('#locationName').innerText = `You are currently in ${data.name}, ${data.sys.country}`
          document.querySelector('#temp').innerText = `${Math.floor(data.main.temp)}  C`
          document.querySelector('#humidity').innerText = `${data.main.humidity}  % humidity`
          document.querySelector('#feelsLike').innerText = `Feels like ${Math.floor(data.main.feels_like)} C`
          document.querySelector('#description').innerText = `Description: ${data.weather[0].description}`
          search.value = "";
        })
    }
});