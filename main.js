"use strict";

const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";
let links;

function scrollToResults() {
    $('html, body').animate({
        scrollTop: ($('main').offset().top)
    }, 1000, 'swing');
}

function parseLinkHeader(header) {
    const parts = header.split(',');
    const links = {};

    parts.forEach(function (part) {
        let section = part.split(';');
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
    })

    return links;
}

function renderPhoto(photo) {
    const photoUrl = photo.urls.small;
    const userName = photo.user.name;
    const unsplashUserLink = photo.user.links.html;

    return `
    <div class="photo-container">
        <img src="${photoUrl}" alt="A photo by ${userName}" role="button" tabindex="-1" onclick="displayPhotoButtons(event)">
        <div class="target-photo-buttons">
            <p>Photo by <a  href="${unsplashUserLink}?utm_source=photo_palette&utm_medium=referral" target="_blank">${userName}</a> on <a href="https://unsplash.com/?utm_source=photo_palette&utm_medium=referral" target="_blank">Unsplash</a></p>
            <button class="button generate-palette">Generate Color Palette</button>
        </div>
    </div>
    `;
}

function renderSearchResults(data, status, jqXHR) {
    const pageLinks = jqXHR.getResponseHeader('Link');
    $('#no-results').remove();
    if (data.results.length == 0) {
        $('#photo-loading').remove();
        $('#error').remove();
        $('#search-container').append('<div id="no-results"><h2>Your search yielded no results, please try again!</h2></div>');
    } else {
        const results = data.results.map((photo) => renderPhoto(photo));

        $('#search-results').html(results);
        scrollToResults();

        links = parseLinkHeader(pageLinks);
        $('.page-buttons').show();

        $('.page-buttons').html('');

        if (links.prev) {
            $('.page-buttons').append(`<button id="prev" class="page-button" role="button">Previous</button>`);
        }

        if (links.next) {
            $('.page-buttons').append(`<button id="next" class="page-button" role="button">Next</button>`);
        }
    }
}

function renderError() {
    $('#search-container').append('<div id="error"><h2>There was an error, please try again!</h2></div>');
}

function getSearchResults(searchText, callback) {
    const settings = {
        data: {
            client_id: '8f38787e053192449fa982baa9609a354ef6e12dafc55c7d1166c486d77017a3',
            query: searchText,
            per_page: 30,
            page: 1
        },
        dataType: 'json',
        success: callback,
        error: renderError
    };
    $('#search-results').show();
    $('#search-results').append('<div id="photo-loading"><p>Searching for photos...</p></div>');
    $.ajax(UNSPLASH_SEARCH_URL, settings);
}

function listenForPhotoSearchClick() {
    //this listens for a click on the photo search form
    $('#photo-search-form').submit(event => {
        event.preventDefault();
        $('#search-results').empty();
        $('.page-buttons').empty();
        let searchTerm = $('#search-input').val();
        $('#search-input').val('');
        getSearchResults(searchTerm, renderSearchResults);

    });
}

function listenForPaginationClick() {
    const settings = {
        success: renderSearchResults
    }

    $('.page-buttons').on('click', '#prev', () => {
        $.ajax(links.prev, settings);
    });

    $('.page-buttons').on('click', '#next', () => {
        $.ajax(links.next, settings);
    });
}

function a11yClick(event) {
    if (event.type === 'click') {
        return true;
    }
    else if (event.type === 'keydown') {
        var code = event.key;
        if ((code === " ") || (code === "Enter")) {
            event.preventDefault();
            return true;
        }
    }
    else {
        return false;
    }
}

function displayPhotoButtons(targetButton) {
    $(targetButton).slideToggle(600, "swing");
}

function listenForPhotoSelect() {
    $('#search-results').on('click keydown', '.photo-container', event => {
        if (a11yClick(event) === true) {
            let targetButtons = event.currentTarget.lastElementChild;

            $('.target-photo-buttons').not(targetButtons).slideUp();
            displayPhotoButtons(targetButtons);
        }
    });
}

function getColorPalette(imageUrl) {
    const imageToBeExtracted = {
        url: 'https://api.imagga.com/v1/colors',
        "async": true,
        "crossDomain": true,
        data: {
            url: imageUrl
        },
        "method": "GET",
        "headers": {
            "Authorization": "Basic YWNjX2QxMmYyN2E4ZjU3MTFmNzoxZjdiYjViZWE5OGNkYjVkYWM0MGQyNGI0ODQ4OGIyYg==",
            "Cache-Control": "no-cache",
        },
        success: generateColorPalette
    }

    $('#color-palette').append('<div id="palette-loading"><p>Extracting colors...</p></div>');
    $.ajax(imageToBeExtracted);
}

function listenGenColorPalette() {
    $('#search-results').on('click', '.generate-palette', event => {
        const imgUrl = $(event.currentTarget).closest('.photo-container').children('img').attr('src');
        getColorPalette(imgUrl);
        $('#color-palette').show();
        $('#back-to-top').remove();
        $('.target-image-container').empty();
        $('.color-palette-container').empty();
        $('html, body').animate({
            scrollTop: ($('#color-palette').offset().top)
        }, 1000, 'swing');
    });
}

function renderColor(color) {
    const colorRed = color.r;
    const colorGreen = color.g;
    const colorBlue = color.b;
    const colorHex = color.html_code;
    const colorId = colorHex.replace(/\#/g, '');

    $(`#${colorId}`).css('background-color', `#${colorId}`);

    $(`#${colorId}-container`).append(`
        <div id="${colorId}-font" class="color-values">
            <p>rgb(${colorRed}, ${colorGreen}, ${colorBlue})</p>
            <p>Hex: ${colorHex}</p>
        </div>
    `);
    // Sets the text color based on the contrast with the background color
    let rgb = [colorRed, colorGreen, colorBlue];

    console.log(rgb);
    let o = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
    console.log(o);

    if (o >= 128) {
        $(`#${colorId}-font p`).css('color', 'black');
    } else {
        $(`#${colorId}-font p`).css('color', 'white');
    };
}

function generateBackgroundColors(colors) {
    if (colors.length !== 0) {
        $('.color-palette-container').append(`
            <div class="palette background-color">
                <h2 class="palette-header">Background Colors</h2>
            </div>
        `);
        colors.map((color) => {
            const colorId = color.html_code.replace(/\#/g, '');
            $('.background-color').append(`
                <div class="color" id="${colorId}-container">
                    <div class="color-block" id="${colorId}">
                    </div>
                </div>
            `);
            renderColor(color);
        });
    }
}

function generateForegroundColors(colors) {
    if (colors.length !== 0) {
        $('.color-palette-container').append(`
            <div class="palette foreground-color">
                <h2 class="palette-header">Foreground Colors</h2>
            </div>
        `);
        colors.map((color) => {
            const colorId = color.html_code.replace(/\#/g, '');
            $('.foreground-color').append(`
                <div class="color" id="${colorId}-container">
                    <div class="color-block" id="${colorId}">
                    </div>
                </div>
            `);
            renderColor(color);
        });
    }
}

function generateImageColors(colors) {
    if (colors.length !== 0) {
        $('.color-palette-container').append(`
            <div class="palette image-color">
                <h2 class="palette-header">Image Colors</h2>
            </div>
        `);
        colors.map((color) => {
            const colorId = color.html_code.replace(/\#/g, '');
            $('.image-color').append(`
                <div class="color" id="${colorId}-container">
                    <div class="color-block" id="${colorId}">
                    </div>
                </div>
            `);
            renderColor(color);
        });
    }
}

function generateColorPalette(photo) {
    const photoColors = photo.results[0].info
    const backgroundColors = photoColors.background_colors;
    const imageColors = photoColors.image_colors;
    const foregroundColors = photoColors.foreground_colors;
    const photoImage = photo.results[0].image;

    $('#palette-loading').remove();
    $('.target-image-container').empty();
    $('.target-image-container').append(`
        <img src="${photoImage}" alt="Your selected photo">
    `);

    $('.color-palette-container').empty();
    $('#color-palette').prepend('<button id="back-to-top" role="button">Try another!</button>');
    generateBackgroundColors(backgroundColors);
    generateForegroundColors(foregroundColors);
    generateImageColors(imageColors);
}

function listenForBackToTopClick() {
    $('#color-palette').on('click', '#back-to-top', () => {
        $('html, body').animate({
            scrollTop: ($('#scroll').offset().top)
        }, 1000, 'swing');

    });
}

function hideElements() {
    $('#color-palette').hide();
    $('.page-buttons').hide();
    $('#search-results').hide();
}

function callListeners() {
    listenForPhotoSearchClick();
    listenForPhotoSelect();
    listenForPaginationClick();
    listenGenColorPalette();
    listenForBackToTopClick();
    hideElements();
}

$(callListeners);

// Particle Code - for Main landing background

const particlesJS = window.particlesJS;

particlesJS("particle-container", {
    "particles": {
        "number": {
            "value": 50,
            "density": {
                "enable": true,
                "value_area": 1499.3805191013182
            }
        },
        "color": {
            "value": "random"
        },
        "shape": {
            "type": "polygon",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 4
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.6333477640418815,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 48.10236182596568,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 24.36231636904035,
                "size_min": 0,
                "sync": true
            }
        },
        "line_linked": {
            "enable": false,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 0.5,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 2485.28869434156,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});