/*SEARCH BY USING A CITY NAME (e.g. athens) OR A COMMA-SEPARATED CITY NAME ALONG WITH THE COUNTRY CODE (e.g. athens,gr)*/
const form = document.querySelector(".top-banner form");
const input = document.querySelector(".top-banner input");
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".ajax-section .cities");
/*SUBSCRIBE HERE FOR API KEY: https://home.openweathermap.org/users/sign_up*/

const apiKey = "4d8fb5b93d4af21d66a2948710284366";
var celcii;
const Http = new XMLHttpRequest();

var ifConnected = window.navigator.onLine;
if (!ifConnected) {

    var data = JSON.parse(localStorage.getItem("wetherObj"));

    if(data){
        const { main, name, sys, weather } = data;
        const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
            weather[0]["icon"]
        }.svg`;
        const li = document.createElement("li");
        li.classList.add("city");
        const markup = `<li class="city">
                    <h2 class="city-name" data-name="${name},${sys.country}">
                      <span>${name}</span>
                      <sup>${sys.country}</sup>
                    </h2>
                    <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
                    <figure>
                      <img class="city-icon" src="${icon}" alt="${
            weather[0]["description"]
        }">
                      <figcaption>${weather[0]["description"]}</figcaption>
                    </figure>
                    </li>
                  `;
        list.innerHTML = markup;
    }else{
        alert('connection error')
    }
}

function getLocation() {
    var bdcApi = "https://api.bigdatacloud.net/data/reverse-geocode-client"
    navigator.geolocation.getCurrentPosition(
        (position) => {
            bdcApi = bdcApi
                + "?latitude=" + position.coords.latitude
                + "&longitude=" + position.coords.longitude
                + "&localityLanguage=en";
            getApi(bdcApi);
        },
        (err) => { getApi(bdcApi); },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
}
function getApi(bdcApi) {
    Http.open("GET", bdcApi);
    Http.send();
    Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            // result.innerHTML = json.city;
            generateWether(json.city);
        }
    };
}
function generateWether(inputVal) {

    //check if there's already a city
    const listItems = list.querySelectorAll(".ajax-section .city");
    const listItemsArray = Array.from(listItems);

    if (listItemsArray.length > 0) {
        const filteredArray = listItemsArray.filter(el => {
            let content = "";
            //athens,gr
            if (inputVal.includes(",")) {
                //athens,grrrrrr->invalid country code, so we keep only the first part of inputVal
                if (inputVal.split(",")[1].length > 2) {
                    inputVal = inputVal.split(",")[0];
                    content = el
                        .querySelector(".city-name span")
                        .textContent.toLowerCase();
                } else {
                    content = el.querySelector(".city-name").dataset.name.toLowerCase();
                }
            } else {
                //athens
                content = el.querySelector(".city-name span").textContent.toLowerCase();
            }
            return content == inputVal.toLowerCase();
        });

        if (filteredArray.length > 0) {
            msg.textContent = `You already know the weather for ${
                filteredArray[0].querySelector(".city-name span").textContent
            } ...otherwise be more specific by providing the country code as well 😉`;
            form.reset();
            input.focus();
            return;
        }
    }

    //ajax here
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

    async function checkUrl(){
        var response = await fetch(url);
        if(response.status > 399 && response.status < 200){
            console.log('local_st');
            var data = JSON.parse(localStorage.getItem("wetherObj"));
            const { main, name, sys, weather } = data;
            const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
                weather[0]["icon"]
            }.svg`;
            const li = document.createElement("li");
            li.classList.add("city");
            const markup = `
                <h2 class="city-name" data-name="${name},${sys.country}">
                  <span>${name}</span>
                  <sup>${sys.country}</sup>
                </h2>
                <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
                <figure>
                  <img class="city-icon" src="${icon}" alt="${
                weather[0]["description"]
                }">
                  <figcaption>${weather[0]["description"]}</figcaption>
                </figure>
                `;
            li.innerHTML = markup;
            list.appendChild(li);
        }else{
            console.log('online_data');
            fetch(url)
                .then(function(response) {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }else{
                        response => response.json()
                        // return response;
                    }
                }).then(data => {
                if(!data){
                    if(localStorage.getItem("todoData")){
                        data = JSON.parse(localStorage.getItem("wetherObj"));
                    }else{
                        alert('connection error')
                    }
                }else{
                    localStorage.setItem("wetherObj", JSON.stringify(data));
                }
                const { main, name, sys, weather } = data;

                const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
                    weather[0]["icon"]
                }.svg`;

                const li = document.createElement("li");
                li.classList.add("city");
                console.log(main);
                const markup = `<li class="city">
                    <h2 class="city-name" data-name="${name},${sys.country}">
                      <span>${name}</span>
                      <sup>${sys.country}</sup>
                    </h2>
                    <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
                    <figure>
                      <img class="city-icon" src="${icon}" alt="${
                    weather[0]["description"]
                    }">
                      <figcaption>${weather[0]["description"]}</figcaption>
                    </figure>
                    </li>
                  `;
                list.innerHTML = markup;
            })
            .catch(() => {
                msg.textContent = "Please search for a valid city 😩";
            });
        }
    }
    checkUrl();
    msg.textContent = "";
    form.reset();
    input.focus();
};
getLocation();

form.addEventListener("submit", e => {
    e.preventDefault();
    let inputVal = input.value;

    //check if there's already a city
    const listItems = list.querySelectorAll(".ajax-section .city");
    const listItemsArray = Array.from(listItems);

    if (listItemsArray.length > 0) {
        const filteredArray = listItemsArray.filter(el => {
            let content = "";
            //athens,gr
            if (inputVal.includes(",")) {
                //athens,grrrrrr->invalid country code, so we keep only the first part of inputVal
                if (inputVal.split(",")[1].length > 2) {
                    inputVal = inputVal.split(",")[0];
                    content = el
                        .querySelector(".city-name span")
                        .textContent.toLowerCase();
                } else {
                    content = el.querySelector(".city-name").dataset.name.toLowerCase();
                }
            } else {
                //athens
                content = el.querySelector(".city-name span").textContent.toLowerCase();
            }
            return content == inputVal.toLowerCase();
        });

        if (filteredArray.length > 0) {
            msg.textContent = `You already know the weather for ${
                filteredArray[0].querySelector(".city-name span").textContent
            } ...otherwise be more specific by providing the country code as well 😉`;
            form.reset();
            input.focus();
            return;
        }
    }

    //ajax here
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const { main, name, sys, weather } = data;
            const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
                weather[0]["icon"]
            }.svg`;

            const li = document.createElement("li");
            li.classList.add("city");
            celcii = Math.round(main.temp);
            const fareng = document.querySelector('.c_f').classList.contains('active');
            const markup = `<li class="city">
        <h2 class="city-name" data-name="${name},${sys.country}">
          <span>${name}</span>
          <sup>${sys.country}</sup>
        </h2>
        <div class="city-temp">${fareng == true ? Math.round((main.temp * 9/5+32) * 100) / 100 : Math.round(main.temp) }<sup>°C</sup></div>
        <figure>
          <img class="city-icon" src="${icon}" alt="${
                weather[0]["description"]
            }">
          <figcaption>${weather[0]["description"]}</figcaption>
        </figure>
        </li>
      `;
            list.innerHTML = markup;
        })
        .catch(() => {
            if (!ifConnected) {
                msg.textContent = "Please connect to the Internet 😩";
            }else{
                msg.textContent = "Please search for a valid city 😩";
            }
        });

    celcii = document.querySelector('.ajax-section .city-temp').firstChild.nodeValue;
    msg.textContent = "";
    form.reset();
    input.focus();
});
document.querySelector('.celsii').addEventListener("click", e => {
    document.querySelector('.c_f').classList.remove('active');
    console.log(celcii);
    if(celcii){
        document.querySelector('.ajax-section .city-temp').firstChild.nodeValue = celcii;
        document.querySelector('.ajax-section .city-temp sup').innerHTML = '°C';
    }
});
document.querySelector('.fahrenheit').addEventListener("click", e => {
    document.querySelector('.c_f').classList.add('active');
    celcii = document.querySelector('.ajax-section .city-temp').firstChild.nodeValue;
    document.querySelector('.ajax-section .city-temp sup').innerHTML = '°F';
    document.querySelector('.ajax-section .city-temp').firstChild.nodeValue = Math.round((document.querySelector('.ajax-section .city-temp').firstChild.nodeValue * 9/5+32) * 100) / 100;
    console.log(celcii);
});
