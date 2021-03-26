// Constants
const api_host = "https://xenodochial-edison-a2f234.netlify.app/.netlify/";
const api_image_path = "https://www.metaweather.com/static/img/weather/";
const api_data_path = "functions/";

// Elements
const appElement = document.querySelector(".app");
const resultsElement = document.querySelector(".results");
const forecastElement = document.querySelector(".forecast");
const queryElement = document.querySelector("#query");

// Global variables
let lastSearchQuery = "";

// Methods
function ajax(action, callback) {
  let xhr = new XMLHttpRequest();
  // let url = "https://xenodochial-edison-a2f234.netlify.app/.netlify/functions";
  let url = api_host + api_data_path;
  
  switch (action.name) {
    case "search":
      {
        xhr.open("GET", url + "search/?query=" + action.query.split(' ').join('+'));
      }
      break;
      
    case "forecast":
      {
        xhr.open("GET", url + "get-location?id=" + action.woeid);
      } 
      break;
  }
  
  // check ready state the XMLHttpRequest client is in
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.responseText != "") {
      appElement.classList.remove("ajax-in-progress");
      let responseJSON = JSON.parse(xhr.responseText);
      callback(responseJSON);
    }
  };
  
  xhr.send();
  appElement.classList.add("ajax-in-progress");
}

function search(query) {
  setAppState("search");
  
  ajax({
    name: "search",
    query: query
  }, function(results) {
    updateResults(results);
  });
  
  lastSearchQuery = query;
}

function getAppState() {
  return appElement.getAttribute("app-state");
}

function setAppState(newState) {
  if (getAppState() == "forecast") {
    switch (newState) {
      case "intro":
        {
          resultsElement.innerHTML = "";
          forecastElement.innerHTML = "";
        }
        break;
        
      case "search":
        {
          forecastElement.innerHTML = "";
          detachEventListeners();
          queryElement.innerText = lastSearchQuery;
          focusSearchBox();
          attachEventListeners();
        }
        break;
    }
  } else if (getAppState() == "search") {
    switch (newState) {
      case "intro":
        {
          resultsElement.innerHTML = "";
        }
        break;
    }
  }
  
  appElement.setAttribute("app-state", newState);
}

//Get forecast for given city
function fetchForecast(city) {  
  ajax({
    name: "forecast",
    woeid: city.woeid
  }, function(forecast) {
    updateForecast(forecast);
  });
}

//Update No. of results
function updateResults(results) {  
  resultsElement.innerHTML = "";
  resultsElement.setAttribute("results-item-count", results.length);

  if (results.length == 0) {
    resultsElement.classList.add("no-results");
  }
  
  if (results.length == 1) {
    resultsElement.classList.add("one-result");
  } else {
    resultsElement.classList.remove("one-result");
  }
  
  if (results.length > 0) {
    resultsElement.classList.remove("no-results");
  }
  
  if (results.length > 1) {
    resultsElement.classList.add("some-results");
  } else {
    resultsElement.classList.remove("some-results");
  }
  
  results.forEach(function(city) {
    let resultsItem = document.createElement("div");
    resultsItem.classList.add("results-item");
    resultsItem.innerHTML = city.title;
    resultsItem.setAttribute("woeid", city.woeid);
    resultsItem.addEventListener("mouseenter", onResultsItemMouseEnter);
    resultsItem.addEventListener("mouseleave", onResultsItemMouseLeave);
    resultsItem.addEventListener("click", onResultsItemClick);
    resultsElement.appendChild(resultsItem);
    
    if (resultsElement.children.length == 1) {
      resultsItem.classList.add("focused");
    }
  });
}

// Update forecast div with relevant data
function updateForecast(forecast) {  
  forecast.consolidated_weather.forEach(function(day) {
    let date = new Date(day.applicable_date);
    
    let forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");
    forecastItem.innerHTML = "<span class='forecast-item-date'>" + date.getDate() + "/" + (date.getMonth()+1) + "</span><img class='weather-state-icon' src='" + 
    api_image_path + day.weather_state_abbr + ".svg' /><span>" + "</span><span class='forecast-item-temp'><span>Min Temp: " 
    + _.round(day.min_temp) + "&deg;C</span><br><span style='font-weight: normal;'>Max Temp: " + _.round(day.max_temp) + "&deg;C</span></span>";
    forecastElement.appendChild(forecastItem);
  });
}

function getFocusedResultsItem() {
  return document.querySelector(".results-item.focused");
}

function resultsItemSelected() {
  if (resultsElement.children.length > 0) {
    let selectedCity = document.querySelector(".results-item.focused");
    
    detachEventListeners();
    queryElement.innerText = selectedCity.innerText;
    focusSearchBox();
    attachEventListeners();
    
    setAppState("forecast");
    
    fetchForecast({
      name: selectedCity.innerText,
      woeid: selectedCity.getAttribute("woeid")
    });
  }
}

//=== Event Handlers ===/
function onResultsItemMouseEnter(e) {
  if (e.target.classList.contains("focused")) {
    return;
  }
  
  let focusedElement = getFocusedResultsItem();
  if (focusedElement) {
    focusedElement.classList.remove("focused");
  }
  
  e.target.classList.add("focused");
}
function onResultsItemMouseLeave(e) {
  if (e.target.classList.contains("focused")) {
    e.target.classList.remove("focused");
  }
}

function onResultsItemClick() {
  resultsItemSelected();
}

function onSearchQueryChange() {
  let query = queryElement.innerText.trim();
    
  if (query != lastSearchQuery) {
    if (getAppState() == "forecast") {
      setAppState("search");
    }
    
    if (query != "") {
      search(query);
    } else {
      updateResults([]);
    }
  }
}

function onClearSearchClick() {
  queryElement.innerText = "";
  focusSearchBox();
  setAppState("intro");
}

function onEnterKeyPress() {
  resultsItemSelected();
}

function onEscapeKeyPress() {
  switch (getAppState()) {
    case "search":
      setAppState("intro");
      break;
      
    case "forecast":
      setAppState("search");
      break;
  }
}

function onUpArrowKeyPress() {
  let focusedResultsItem = getFocusedResultsItem();
  
  if (focusedResultsItem == null) {
    if (resultsElement.children.length > 0) {
      document.querySelector(".results-item:nth-child(" + resultsElement.children.length + ")").classList.add("focused");
    }
    
    return;
  }
  
  let previousResultsItem = focusedResultsItem.previousElementSibling;
  
  if (previousResultsItem != null) {
    focusedResultsItem.classList.remove("focused"); 
    previousResultsItem.classList.add("focused");
  }  
}

function onDownArrowKeyPress() {
  let focusedResultsItem = getFocusedResultsItem();
  
  if (focusedResultsItem == null) {
    if (resultsElement.children.length > 0) {
      document.querySelector(".results-item:nth-child(1)").classList.add("focused");
    }
    
    return;
  }
  
  let nextResultsItem = focusedResultsItem.nextElementSibling;
  
  if (nextResultsItem != null) {
    focusedResultsItem.classList.remove("focused"); 
    nextResultsItem.classList.add("focused");
  }  
}

function onKeyboardEvent(e) {
  switch (e.keyCode) {
    case 13: // Enter
      if (getAppState() == "search") {
        e.preventDefault();
        onEnterKeyPress();
      }
      break;
      
    case 27: // Escape
      onEscapeKeyPress();
      break;
      
    case 38: // Up Arrow
      if (getAppState() == "search") {
        e.preventDefault();
        onUpArrowKeyPress();
      }
      break;
      
    case 40: // Down Arrow
      if (getAppState() == "search") {
        e.preventDefault();
        onDownArrowKeyPress();
      }
      break;
  }
}

function attachEventListeners() {
  queryElement.addEventListener("input", _.debounce(onSearchQueryChange, 300));
  
  document.addEventListener("keydown", onKeyboardEvent);
  
  document.querySelector(".clear-search")
    .addEventListener("click", onClearSearchClick);
}

function detachEventListeners() {
  queryElement.removeEventListener("input", _.debounce(onSearchQueryChange, 300));
  
  document.removeEventListener("keydown", onKeyboardEvent);
  
  document.querySelector(".clear-search")
    .removeEventListener("click", onClearSearchClick);
}

function focusSearchBox() {
  queryElement.focus();

  if (queryElement.innerText.length > 0) {
    // Place caret at the end of the input
    var textNode = queryElement.firstChild;
    var caret = queryElement.innerText.length;
    var range = document.createRange();
    range.setStart(textNode, caret);
    range.setEnd(textNode, caret);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

attachEventListeners();
focusSearchBox();