import { key } from './config.js';

const daysDiv = document.getElementById('daysDiv')
const hoursDiv = document.getElementById('hoursDiv')
const loading = document.getElementById('loading')
const locationButton = document.getElementById('locationButton') 
const search = document.getElementById('search')
const favoritesList = document.getElementById('favoritesList');
let weather;
let forecast;

//LOADING
function setLoading() {
    loading.style.display = 'block';
    hoursDiv.innerHTML = ''
    daysDiv.innerHTML = ''
    document.getElementById('weatherDiv').style.display = 'none';
    document.getElementById('infoText').innerText = '';
}
function clearLoading() {
    loading.style.display = 'none';
}

//LOCATION
navigator.geolocation.getCurrentPosition(ifSucces, ifError)
function ifSucces(position){
    setLoading(); 
    const {latitude, longitude} = position.coords;
    weather = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    forecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    fetchData()
}
function ifError(){
    clearLoading();
    alert(`Something didn't work well :(\nCheck if you allowed the website to access your location`);
}
locationButton.addEventListener('click', ()=> { 
    navigator.geolocation.getCurrentPosition(ifSucces, ifError)
})

//SEARCH
search.addEventListener("keyup", e =>{
    if(e.key == "Enter" && search.value != ""){
        requestApi(search.value)
    }
})
function requestApi(city){
    weather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
    forecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`; 
    hoursDiv.innerHTML = ''
    fetchData();
}

//RESPONSE
function fetchData(){
    fetch(weather).then(response => response.json()).then(data => weatherData(data)).then(clearLoading());
    fetch(forecast).then(response => response.json()).then(data => forecastData(data));
}
function weatherData(data){
    if(data.cod == "404"){
        document.getElementById('infoText').innerText = `${search.value} isn't a valid city name`;
        document.getElementById('weatherDiv').style.display = 'none';
        daysDiv.innerHTML = ''
    }else{
        clearLoading();
        document.getElementById('locationName').innerText = `You are currently in ${data.name}, ${data.sys.country}`
        document.getElementById('time').innerText = 'Now'
        document.getElementById('temp').innerText = `${Math.round(data.main.temp)}  C`
        document.getElementById('humidity').innerText = `${data.main.humidity}  % humidity`
        document.getElementById('feelsLike').innerText = `Feels like ${Math.round(data.main.feels_like)} C`
        document.getElementById('description').innerText = `Description: ${data.weather[0].description}`
        document.getElementById('weatherSticker').innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" />`
        document.getElementById('infoText').innerText = ''
        document.getElementById('weatherDiv').style.display = 'block';
    }
    search.value = "";
}
function forecastData(data) {
    const groupedData = data.list.reduce((acc, item) => {
        const [date, hour] = item.dt_txt.split(' ')
        acc[date] = acc[date] || {}
        acc[date][hour.slice(0, 5)] = acc[date][hour.slice(0, 5)] || []
        acc[date][hour.slice(0, 5)].push({
            temp: Math.round(item.main.temp),
            humidity: item.main.humidity,
            feels_like: Math.round(item.main.feels_like),
            description: item.weather[0].description,
            icon: item.weather[0].icon
        })
        return acc
    }, {})

    daysDiv.innerHTML = Object.entries(groupedData).map(([date]) => `<p class="date">${date}</p>`).join('')
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
                        <img class="weatherSticker" src="http://openweathermap.org/img/wn/${data[0].icon}@4x.png" />
                        <p>${data[0].temp}C</p>
                    </div>
                `).join('')
                hoursDiv.dataset.selectedDay = day.textContent
                hoursDiv.querySelectorAll('.hoursDivChildren').forEach(hoursDivChild => {
                    const weatherSticker = document.getElementById('weatherSticker');
                    const img = document.createElement('img');
                    hoursDivChild.addEventListener('click', () => {
                        const hour = hoursDivChild.querySelector('p:first-child').textContent
                        const data = hours[hour][0]
                        const date = day.textContent
                        img.src = `http://openweathermap.org/img/wn/${data.icon}@4x.png`;
                        img.addEventListener('load', () => {
                            weatherSticker.innerHTML = `<img src="${img.src}" />`;
                        })
                        document.getElementById('time').innerText = `${date}: ${hour}`
                        document.getElementById('temp').innerText = `${Math.round(data.temp)}  C`
                        document.getElementById('humidity').innerText = `${data.humidity}  % humidity`
                        document.getElementById('feelsLike').innerText = `Feels like ${Math.round(data.feels_like)} C`
                        document.getElementById('description').innerText = `Description: ${data.description}`
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