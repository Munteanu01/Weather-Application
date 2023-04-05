import { key } from './config.js';

const search = document.querySelector('#search')
const locationButton = document.querySelector('#locationButton') 
let api;

navigator.geolocation.getCurrentPosition(ifSucces, ifError)
function ifSucces(position){
   const {latitude, longitude} = position.coords;
   api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
   fetchData()
}
function ifError(){
    alert(`Something didn't work well :(\nCheck if you allowed the website to acces your location`);
}
locationButton.addEventListener('click', ()=> {
    navigator.geolocation.getCurrentPosition(ifSucces, ifError)
})

search.addEventListener("keyup", e =>{
    if(e.key == "Enter" && search.value != ""){
        requestApi(search.value)
    }
})
function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;
    fetchData();
}
function fetchData(){
    fetch(api).then(response => response.json()).then(data => weatherData(data))
}
function weatherData(data){
    if(data.cod == "404"){
        document.querySelector('#infoText').innerText = `${search.value} isn't a valid city name`;
        document.querySelector('#weatherDiv').style.display = 'none';
    }else{
        document.querySelector('#locationName').innerText = `You are currently in ${data.name}, ${data.sys.country}`
        document.querySelector('#temp').innerText = `${Math.floor(data.main.temp)}  C`
        document.querySelector('#humidity').innerText = `${data.main.humidity}  % humidity`
        document.querySelector('#feelsLike').innerText = `Feels like ${Math.floor(data.main.feels_like)} C`
        document.querySelector('#description').innerText = `Description: ${data.weather[0].description}`
        document.querySelector('#infoText').innerText = ''
        document.querySelector('#weatherDiv').style.display = 'block';
    }
    search.value = "";
}