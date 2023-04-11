import { key } from './config.js';

const daysDiv = document.getElementById('daysDiv')
const hoursDiv = document.getElementById('hoursDiv')
const locationButton = document.getElementById('locationButton') 
const search = document.getElementById('search')
const favoritesList = document.getElementById('favoritesList');
const fButton = document.getElementById('fButton')
const cButton = document.getElementById('cButton')
const weatherDiv = document.getElementById('weatherDiv')
const favoritesDiv = document.getElementById('favoritesDiv')
const loading = document.getElementById('loading')
const nav = document.getElementById('nav')
let weather;
let forecast;
let units = 'metric';
let loadingTimer;
let isLoading = false;

//LOADING
function addLoading() {
    isLoading = true;
    loadingTimer = setTimeout(() => {
      if (isLoading) {
        loading.style.display = "flex";
        weatherDiv.style.display = "none";
        favoritesDiv.style.display = "none";
        nav.style.display = "none";
      }
    }, 300);
  }
  
  function removeLoading() {
    isLoading = false;
    clearTimeout(loadingTimer);
    loading.style.display = "none";
    weatherDiv.style.display = "block";
    favoritesDiv.style.display = "flex";
    nav.style.display = "flex";
  }
//LOCATION
window.addEventListener('load', function() {
    weatherDiv.style.display = "none";
    favoritesDiv.style.display = "none"
    nav.style.display = "none";
    navigator.geolocation.getCurrentPosition(ifSuccess, ifError);
    addLoading()
});
function ifSuccess(position){
    const {latitude, longitude} = position.coords;
    weather = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`
    forecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`
    fetchData()
}
function ifError(){
    removeLoading()
    weatherDiv.style.display = "none";
    alert(`Something didn't work well :(\nCheck if you allowed the website to access your location`);
}
locationButton.addEventListener('click', ()=> { 
    addLoading()
    navigator.geolocation.getCurrentPosition(ifSuccess, ifError)
})

//SEARCH
search.addEventListener("keyup", e =>{
    if(e.key == "Enter" && search.value != ""){
        requestApi(search.value)
    }
})
function requestApi(city){
    weather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
    forecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`; 
    hoursDiv.innerHTML = ''
    fetchData();
}

//UNIT
fButton.addEventListener('click', () => {
    units = 'imperial';
    const unitsElements = document.getElementsByClassName('unit');
    for(let i = 0; i < unitsElements.length; i++){
        unitsElements[i].innerText = 'F'
    }
    fButton.classList.add('active');
    cButton.classList.remove('active');
    updateUnits();
});
cButton.addEventListener('click', () => {
    units = 'metric';
    const unitsElements = document.getElementsByClassName('unit');
    for(let i = 0; i < unitsElements.length; i++){
        unitsElements[i].innerText = 'C';
    }
    cButton.classList.add('active');
    fButton.classList.remove('active');
    updateUnits();
});
function updateUnits() {
    fetchData();
    hoursDiv.innerHTML = ''
}

//RESPONSE
function fetchData(){
    removeLoading()
    fetch(`${weather}&units=${units}`).then(response => response.json()).then(data => weatherData(data));
    fetch(`${forecast}&units=${units}`).then(response => response.json()).then(data => forecastData(data));
}
function weatherData(data){
    if(data.cod == "404"){
        document.getElementById('infoText').innerText = `${search.value} isn't a valid city name`;
        daysDiv.innerHTML = ''
    }else{
        document.getElementById('locationName').innerText = `${data.name}, ${data.sys.country}`
        document.getElementById('time').innerText = 'Now'
        document.getElementById('temp').innerText = `${Math.round(data.main.temp)}`
        document.getElementById('humidity').innerText = `${data.main.humidity}`
        document.getElementById('feelsLike').innerText = `${Math.round(data.main.feels_like)}`
        document.getElementById('description').innerText = `${data.weather[0].description}`
        document.getElementById('weatherSticker').innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" />`
        document.getElementById('infoText').innerText = ''
        
    }
    search.value = "";
}
function forecastData(data) {
    const groupedData = data.list.reduce((acc, item) => {
        const date = new Date(item.dt_txt)
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
        const hour = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        acc[dayOfWeek] = acc[dayOfWeek] || {}
        acc[dayOfWeek][hour] = acc[dayOfWeek][hour] || []
        acc[dayOfWeek][hour].push({
            temp: Math.round(item.main.temp),
            humidity: item.main.humidity,
            feels_like: Math.round(item.main.feels_like),
            description: item.weather[0].description,
            icon: item.weather[0].icon
        })
        return acc
    }, {})
    daysDiv.innerHTML = Object.keys(groupedData).map(dayOfWeek => `<p class="date">${dayOfWeek}</p>`).join('')
    daysDiv.querySelectorAll('.date').forEach(day => {
        day.addEventListener('click', () => {
            if (hoursDiv.dataset.selectedDay === day.textContent) {
                hoursDiv.innerHTML = ''
                hoursDiv.dataset.selectedDay = ''
            } else {
                const hours = groupedData[day.textContent]
                hoursDiv.innerHTML = Object.entries(hours).map(([hour, data]) => `
                    <div class='hoursDivChildren'>
                        <p>${hour}</p>
                        <img class="weatherStickers" src="http://openweathermap.org/img/wn/${data[0].icon}@4x.png" />
                        <p>${data[0].temp} <span>${fButton.classList.contains('active') ? "F" : "C"}</span></p>
                    </div>
                `).join('')
                hoursDiv.dataset.selectedDay = day.textContent
                hoursDiv.querySelectorAll('.hoursDivChildren').forEach(hoursDivChild => {
                    const weatherSticker = document.getElementById('weatherSticker');
                    const img = document.createElement('img');
                    hoursDivChild.addEventListener('click', () => {
                        const hour = hoursDivChild.querySelector('p:first-child').textContent
                        const data = hours[hour][0]
                        const dayOfWeek = day.textContent
                        img.src = `http://openweathermap.org/img/wn/${data.icon}@4x.png`;
                        img.addEventListener('load', () => {
                            weatherSticker.innerHTML = `<img src="${img.src}" />`;
                        })
                        document.getElementById('time').innerText = `${dayOfWeek}: ${hour}`
                        document.getElementById('temp').innerText = `${Math.round(data.temp)}`
                        document.getElementById('humidity').innerText = `${data.humidity}`
                        document.getElementById('feelsLike').innerText = `${Math.round(data.feels_like)}`
                        document.getElementById('description').innerText = `${data.description}`
                    });
                })
            }
        })
    })
}

let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
function saveFavoriteCities() {
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
}

function addCityToList(cityName) {
    const favoriteCityDiv = document.createElement('div')
    const li = document.createElement('li');
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Remove';
    li.innerText = cityName;
    favoriteCityDiv.classList.add('favoriteCityDiv')
    favoriteCityDiv.appendChild(li);
    favoriteCityDiv.appendChild(deleteButton);
    li.addEventListener('click', () => {
        requestApi(cityName);
    });
    deleteButton.addEventListener('click', () => {
        favoriteCities = favoriteCities.filter(city => city !== cityName);
        favoritesList.removeChild(favoriteCityDiv);
        saveFavoriteCities();
    });
    favoritesList.appendChild(favoriteCityDiv);
}

function displayFavoriteCities() {
    favoritesList.innerHTML = '';
    favoriteCities.forEach(city => {
        addCityToList(city);
    });
}
displayFavoriteCities();

document.getElementById('addFavoriteButton').addEventListener('click', () => {
    const cityName = document.getElementById('locationName').innerText.split(',')[0].replace('You are currently in ', '');
    if (!favoriteCities.includes(cityName)) {
        favoriteCities.push(cityName);
        addCityToList(cityName);
        saveFavoriteCities();
    }
})
//THEMES
document.getElementById('themeButton').addEventListener('click', () => {
    const elements = document.querySelectorAll('*')
    elements.forEach((element) => {
        element.classList.toggle('dark')
    })
})