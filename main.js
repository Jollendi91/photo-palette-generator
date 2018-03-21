const UNSPLASH_URL = "https://api.unsplash.com/search/photos";

function getSearchResults(searchText, callback) {
    const settings = {
        data: {
           client_id: '8f38787e053192449fa982baa9609a354ef6e12dafc55c7d1166c486d77017a3', 
           query: searchText,
           per_page: 15
        },
        dataType: 'json',
        success: callback,
    }

    $.ajax(UNSPLASH_URL, settings);

}

function getPaginationButtons(response, status, jqXHR) {
    console.log(jqXHR.getResponseHeader('Link'));
    console.log(response);
}

function listenForPhotoSearchClick() {
    //this listens for a click on the photo search form
    $('#photo-search-form').submit(event => {
    event.preventDefault();
    console.log("Search form was submitted");
    let searchTerm = $('#search-input').val();
    $('#search-input').val('');
    console.log(searchTerm);
    getSearchResults(searchTerm, getPaginationButtons);
    });
}

function renderSearchResults() {
    //this renders the search results on the page
}

function generateColorPalette() {
    //this makes a call to the color extractor api and returns a set of colors in the photo
}

function listenForPhotoSelect() {
    //this listens for a click on a search result photo
}

function callListeners() {
    listenForPhotoSearchClick();
}

$(callListeners);