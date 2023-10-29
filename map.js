const searchResult = document.querySelector("[data-search-result]");

$(document).ready(function(){
    var autocomplete;
    autocomplete = new google.maps.place.Autocomplete((document.getElementsByClassName('search-result')),{
        types: ['geocode'],
    })
});