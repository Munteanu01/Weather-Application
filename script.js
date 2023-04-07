import { key } from './config.js';

let weather;
let forecast;

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
    weather = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    forecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
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
    weather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
    forecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`;
    setLoading(); 
    fetchData();
}

//RESPONSE
function fetchData(){
    fetch(weather).then(response => response.json()).then(data => weatherData(data)).then(clearLoading());
    fetch(forecast).then(response => response.json()).then(data => forecastData(data));
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
function forecastData(data) {
    const groupedData = data.list.reduce((acc, item) => {
      const [date, hour] = item.dt_txt.split(' ')
      acc[date] = acc[date] || {}
      acc[date][hour.slice(0, 5)] = acc[date][hour.slice(0, 5)] || []
      acc[date][hour.slice(0, 5)].push({temp: item.main.temp, 
                                        humidity: item.main.humidity,
                                        feels_like: item.main.feels_like,
                                        description: item.weather[0].description})
      return acc
    }, {})
    document.querySelector('#daysDiv').innerHTML = Object.entries(groupedData).map(([date, hours]) => `
      <p>Date: ${date}</p>
      ${Object.entries(hours).map(([hour, data]) => `
        <p class='hour'>
          Hour: ${hour} 
          <p class='hourData'>
          Temperature: ${data[0].temp}C / <br>
          Feels like: ${data[0].feels_like}C /<br>
          Humidity: ${data[0].humidity}% /<br>
          Description: ${data[0].description} 
          </p>
        </p>`).join('')}
    `).join('')
  }