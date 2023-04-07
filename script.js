import { key } from './config.js';

let api;

//LOADING
const loading = document.querySelector('#loading')
function setLoading() {
    loading.style.display = 'block';
    document.querySelector('#weatherDiv').style.display = 'none';
    document.querySelector('#infoText').innerText = '';
}
function clearLoading() {
    loading.style.display = 'none';
}

//LOCATION
const locationButton = document.querySelector('#locationButton') 
navigator.geolocation.getCurrentPosition(ifSucces, ifError)
function ifSucces(position){
    setLoading(); 
    const {latitude, longitude} = position.coords;
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    fetchData()
}
function ifError(){
    alert(`Something didn't work well :(\nCheck if you allowed the website to access your location`);
}
locationButton.addEventListener('click', ()=> {
    setLoading(); 
    navigator.geolocation.getCurrentPosition(ifSucces, ifError)
})

//SEARCH
const search = document.querySelector('#search')
search.addEventListener("keyup", e =>{
    if(e.key == "Enter" && search.value != ""){
        requestApi(search.value)
    }
})
function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;
    setLoading(); 
    fetchData();
}

//RESPONSE
function fetchData(){
    fetch(api).then(response => response.json()).then(data => weatherData(data)).then(clearLoading());
}
function weatherData(data){
    if(data.cod == "404"){
        document.querySelector('#infoText').innerText = `${search.value} isn't a valid city name`;
        document.querySelector('#weatherDiv').style.display = 'none';
    }else{
        clearLoading();
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