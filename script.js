import { key } from './config.js';

const daysDiv = document.querySelector('#daysDiv')
const hoursDiv = document.querySelector('#hoursDiv')
const loading = document.querySelector('#loading')
const locationButton = document.querySelector('#locationButton') 
const search = document.querySelector('#search')
let weather;
let forecast;

//LOADING
function setLoading() {
    loading.style.display = 'block';
    hoursDiv.innerHTML = ''
    daysDiv.innerHTML = ''
    document.querySelector('#weatherDiv').style.display = 'none';
    document.querySelector('#infoText').innerText = '';
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
    setLoading(); 
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
        daysDiv.innerHTML = ''
    }else{
        clearLoading();
        document.querySelector('#locationName').innerText = `You are currently in ${data.name}, ${data.sys.country}`
        document.querySelector('#time').innerText = 'Now'
        document.querySelector('#temp').innerText = `${Math.round(data.main.temp)}  C`
        document.querySelector('#humidity').innerText = `${data.main.humidity}  % humidity`
        document.querySelector('#feelsLike').innerText = `Feels like ${Math.round(data.main.feels_like)} C`
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
      acc[date][hour.slice(0, 5)].push({temp: Math.round(item.main.temp), 
                                        humidity: item.main.humidity,
                                        feels_like: Math.round(item.main.feels_like),
                                        description: item.weather[0].description})
      return acc
    }, {})
    
    daysDiv.innerHTML = Object.entries(groupedData).map(([date]) => `
        <p class="date">${date}</p>
    `).join('')

    daysDiv.querySelectorAll('.date').forEach(day => {
        day.addEventListener('click', () => {
            const hours = groupedData[day.textContent]
            hoursDiv.innerHTML = Object.entries(hours).map(([hour, data]) => `
              <div class='hoursDivChildren'>
                <p>${hour}</p>
                <p>${data[0].temp}C</p>
              </div>
            `).join('')
            hoursDiv.querySelectorAll('.hoursDivChildren').forEach(hoursDivChild => {
                hoursDivChild.addEventListener('click', () => {
                    const hour = hoursDivChild.querySelector('p:first-child').textContent
                    const data = hours[hour][0]
                    const date = day.textContent
                    document.querySelector('#time').innerText = `${date} - ${hour}`
                    document.querySelector('#temp').innerText = `${Math.round(data.temp)}  C`
                    document.querySelector('#humidity').innerText = `${data.humidity}  % humidity`
                    document.querySelector('#feelsLike').innerText = `Feels like ${Math.round(data.feels_like)} C`
                    document.querySelector('#description').innerText = `Description: ${data.description}`
                })
            })
        })
    })   
}