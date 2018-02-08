let inicializado = false;
let comicsAll = [];
let charactersAll = [];
let jsVotantes;
let apiActualizada = false;

//var imgNotAva = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg";
//var imgNotAva = "recursos/caratulas/image_not_available.jpg";
var imgNotAva = "recursos/caratulas/generica.jpg";

var keyPublic = "94bb05418c2277d4e4065e4a5336879d";
var keyPrivate = "2d1b1267a94252c88f7c88f3edef2964eafd1cd3";

let cardTitle =
    "<div tabindex='-1' class='cardTitle card text-center' style='width: 30%; min-width: 18rem; margin-top: 2rem;'>" +
    "<img aria-label='Imagen de cartelera de la película.' class='card-img-top' src='' alt='Card image cap'>" +
    "<div class='card-body'> " +
    " <h1 tabindex='0' class='card-title'></h1>" +
    " <p tabindex='0' class='card-text'></p>" +
    "<button type='button' href='#' aria-label='Pulse enter para ver más información.' tabindex='0' class='btn btn-primary' data-toggle='modal' data-target='#myModal'>Información</button> " +
    "</div>" +
    "</div>";

$(document).ready(function () {
    if (!apiActualizada)
        peticionMarvel(getData(0), getData(1));
});

//credit: http://stackoverflow.com/a/1527820/52160
function getData(e) {
    let cantidad = 100;
    let urlCo = "https://gateway.marvel.com:443/v1/public/comics?format=comic&formatType=comic&noVariants=true&orderBy=title&limit=" + cantidad + "&apikey=" + keyPublic;
    let urlCh = "https://gateway.marvel.com:443/v1/public/characters?orderBy=name&limit=" + cantidad + "&apikey=" + keyPublic;
    let elegido = e == 0 ? urlCo : urlCh;

    let ts = new Date().getTime();
    let hash = CryptoJS.MD5(ts + keyPrivate + keyPublic);
    elegido += "&ts=" + ts + "&hash=" + hash;

    return $.get(elegido);
}

function buscarCustom() {
    let ordenElegido = $("#inputGroupSelect03").val() != "Orden" ? "&orderBy=" + $("#inputGroupSelect03").val() : "";
    let startWithElegido = $("#inputSearchCustom").val() != "" ? "&nameStartsWith=" + $("#inputSearchCustom").val() : "";
    peticionMarvel(getDataCustom(ordenElegido, startWithElegido, 0), getDataCustom(ordenElegido, startWithElegido, 1));

    return false;
}

function getDataCustom(orden, inicio, e) {
    let ordenFinal;
    let titleFinal;
    if (orden.includes("name"))
        ordenFinal = "&orderBy=title";
    else
        ordenFinal = orden;
    if (inicio.includes("name"))
        titleFinal = "&titleStartsWith=" + inicio.slice(16, inicio.length);
    else
        titleFinal = inicio;

    let cantidad = 100;
    let urlCo = "https://gateway.marvel.com:443/v1/public/comics?format=comic&formatType=comic&noVariants=true&limit=" + cantidad + titleFinal + ordenFinal + "&apikey=" + keyPublic;
    let urlCh = "https://gateway.marvel.com:443/v1/public/characters?limit=" + cantidad + inicio + orden + "&apikey=" + keyPublic;
    let elegido = e == 0 ? urlCo : urlCh;

    let ts = new Date().getTime();
    let hash = CryptoJS.MD5(ts + keyPrivate + keyPublic);
    elegido += "&ts=" + ts + "&hash=" + hash;

    return $.get(elegido);
}

function peticionMarvel(a, b) {
    //if (!inicializado) {
    $("#cuerpo1 *").remove();
    $("#cuerpo2 *").remove();
    let promises = [];
    promises.push(a);
    promises.push(b);
    $(".loader").show();
    comicsAll = [];
    charactersAll = [];

    $.when.apply($, promises).done(function () {
        let args = Array.prototype.slice.call(arguments, 0);

        let comics = args[0][0];
        let jsComics = comics.data.results;
        if (comics.code === 200) {
            $(jsComics).each(function (i) {
                $("#cuerpo1").append(cardTitle);
                let c = new comic();
                c.id = jsComics[i].id != null ? jsComics[i].id : "Indefinido.";
                c.img = jsComics[i].images[0] != null ? jsComics[i].images[0].path + "." + jsComics[i].images[0].extension : imgNotAva;
                c.title = jsComics[i].title != null ? jsComics[i].title : "No contiene título.";
                c.description = jsComics[i].description != null ? jsComics[i].description : "No contiene una descripción válida.";
                c.page = jsComics[i].pageCount != null ? jsComics[i].pageCount : "Indefinido.";
                c.pricePrint = jsComics[i].prices[0] != null ? jsComics[i].prices[0].price : "Indefinido.";
                c.priceDigital = jsComics[i].prices[1] != null ? jsComics[i].prices[1].price : "Indefinido.";
                comicsAll.push(c);
            });
        } else {
            $("#cuerpo1").append("<p>Ha ocurrido un error con la peticion </p>");
        }

        let characters = args[1][0];
        let jsCharacters = characters.data.results
        if (characters.code === 200) {
            $(jsCharacters).each(function (i) {
                $("#cuerpo2").append(cardTitle);
                let c = new character();
                c.id = jsCharacters[i].id != null ? jsCharacters[i].id : "Indefinido.";
                c.img = jsCharacters[i].thumbnail != null ? jsCharacters[i].thumbnail.path + "." + jsCharacters[i].thumbnail.extension : imgNotAva;
                c.name = jsCharacters[i].name != null ? jsCharacters[i].name : "Indefinido.";
                c.description = jsCharacters[i].description != null ? jsCharacters[i].description : "No contiene una descripción válida.";
                charactersAll.push(c);
            });
        } else {
            $("#cuerpo2").append("<p>Ha ocurrido un error con la peticion </p>");
        }

        $cargarTitles();
        $cargarPaginacion();
        $(".loader").hide();
        //inicializado = true;
    });
    //}
}

let $cargarTitles = function () {
    $("#cuerpo1 .cardTitle").each(function (i) {
        $(this).children().eq(0).attr("src", comicsAll[i].img);
        $(this).children().eq(0).attr("alt", comicsAll[i].title);
        $(this).children().eq(1).children().eq(0).text(comicsAll[i].title);
        $(this).children().eq(1).children().eq(1).text(comicsAll[i].description.substring(0, 20) + "...");
        $(this).children().eq(1).children().eq(2).attr("href", i);
        $(this).children().eq(1).children().eq(2).on("click", function () {
            modificarModalComic($(this).attr("href"));
        });
    });

    $("#cuerpo2 .cardTitle").each(function (i) {
        $(this).children().eq(0).attr("src", charactersAll[i].img);
        $(this).children().eq(0).attr("alt", charactersAll[i].name);
        $(this).children().eq(1).children().eq(0).text(charactersAll[i].name);
        $(this).children().eq(1).children().eq(1).text(charactersAll[i].description.substring(0, 20) + "...");
        $(this).children().eq(1).children().eq(2).attr("href", i);
        $(this).children().eq(1).children().eq(2).on("click", function () {
            modificarModalCharacter($(this).attr("href"));
        });
    });
}

function modificarModalComic(i) {
    $("#md-body-info").attr("ident", comicsAll[i].id);
    $("#md-title").text(comicsAll[i].title);
    let $img = $("#md-img");
    $img.attr("src", comicsAll[i].img);
    $img.attr("class", "img-fluid");
    $img.attr("alt", "Imagen portada " + comicsAll[i].title);
    $img.attr("style", "width: 100%");
    $("#md-res").children().eq(0).text("Título: " + comicsAll[i].title);
    $("#md-res").children().eq(1).text("Cantidad páginas: " + comicsAll[i].page);
    $("#md-res").children().eq(2).text("Precio físico: " + comicsAll[i].pricePrint + "$");
    $("#md-res").children().eq(3).text("Precio digital: " + comicsAll[i].priceDigital + "$");
    $("#md-res").children().eq(4).text("");
    $("#md-res").children().eq(5).text("Descripción: " + comicsAll[i].description);
}

function modificarModalCharacter(i) {
    $("#md-body-info").attr("ident", charactersAll[i].id);
    $("#md-title").text(charactersAll[i].name);
    let $img = $("#md-img");
    $img.attr("src", charactersAll[i].img);
    $img.attr("class", "img-fluid");
    $img.attr("alt", "Imagen portada " + charactersAll[i].name);
    $img.attr("style", "width: 100%");
    $("#md-res").children().eq(0).text("Nombre: " + charactersAll[i].name);
    $("#md-res").children().eq(1).text("");
    $("#md-res").children().eq(2).text("");
    $("#md-res").children().eq(3).text("");
    $("#md-res").children().eq(4).text("");
    $("#md-res").children().eq(5).text("Descripción: " + charactersAll[i].description);
}

function saveVote() {
    let nombre = $("#inputName").val();
    let email = $("#inputEmail").val();
    let telefono = $("#inputTelefono").val();
    let index = $("#md-body-info").attr("ident");

    jsVotantes.push({
        nombre: nombre,
        email: email,
        telefono: telefono,
        voto: index
    })

    localStorage.setItem("jsVotantes", JSON.stringify(jsVotantes));
    console.log(jsVotantes)
}