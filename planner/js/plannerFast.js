let data;
let fastLanguage = "En";
let fastAprilFools = false;
const fastDefaultGroups = { "Binah": [], "Chesed": [], "Hod": [], "ShiroKuro": [], "Perorodzilla": [], "Goz": [], "Hieronymous": [], "Kaiten": [] }
let dataCharIndex = {};
let disabledChars = [];
let charlist, chartranslate, language_strings, skillbuffnames = {};
let nameReady = false;
let uiReady = false;
let loaded = false;
let bondgear_characters = [ 10066, 10000, 10028, 20009, 13001, 10047, 10001, 20021, 23007, 23003, 20000, 20005, 10004, 10022, 10036, 10005, 10023, 10009, 16006, 13007, 20015, 10065, 16002, 23008, 20003, 10034, 10041, 10038, 10039, 10008, 13004, 20006, 13008, 10010, 23006, 10025, 10012, 16003, 10062, 10013, 23004, 10033, 26005, 13010, 10016, 10043, 10082, 13003, 10048, 20014, 13013, 26000, 13011, 10090, 10063, 20030 ]

try {
    let tryJSON = JSON.parse(localStorage.getItem('save-data'));
    if (tryJSON) {
        data = tryJSON;
    }
} catch (e) {
    console.log(e);
}

if (data == null) {
    data = { exportVersion: 2, characters: [], character_order: [], disabled_characters: [], owned_materials: {}, groups: fastDefaultGroups, language: "EN", level_cap: 90 };
    localStorage.setItem("save-data", JSON.stringify(data));
}

let charBoxSize = localStorage.getItem("character_box_size") ?? "5";
var dummy = Date.parse(new Date())/1000
fetch('json/students.min.json?q='+dummy).then((response) => response.json()).then((json) => {
    charlist = json;
    if (nameReady && (data.language == "EN" || data.language == "Id")) {
        ShowNames(charlist);
    }
});

fetch('json/strings.json?q='+dummy).then((response) => response.json()).then((json) => {
    language_strings = json;
    if (uiReady) {
        updateUiLanguage();
    }
});

fetch('json/skillinfo/localisation_en.json?q='+dummy).then((response) => response.json()).then((json) => {
    skillbuffnames["en"] = json;
});

if (data?.language) {
    if (data.language != "EN" && data.language != "Id") {
        fetch('json/skillinfo/' + data.language.toLowerCase() + ".json?q="+dummy).then((response) => response.json()).then((json) => {
            chartranslate = json;
            if (nameReady) {
                ShowNames(chartranslate);
            }
        });

        fetch('json/skillinfo/localisation_' + data.language.toLowerCase() + '.json?q='+dummy).then((response) => response.json()).then((json) => {
            skillbuffnames[data.language.toLowerCase()] = json;
        });
    }
}

let imgStyle = localStorage.getItem("image-style");

if (imgStyle === 'true') {
    fastAprilFools = true;
}
else {
    fastAprilFools = false;
}

delete imgStyle;

$(document).ready(function () {

    document.getElementById("charsContainer").classList.add("size-" + charBoxSize);
    document.getElementById("character-size").value = charBoxSize;

    if (data == null) {
    }
    else {

        if (data?.language) {
            fastLanguage = data.language;
            if (fastLanguage == "EN") {
                fastLanguage = "En";
            }
            else if (fastLanguage == "KR") {
                fastLanguage = "Kr";
            }
            else if (fastLanguage == "JP") {
                fastLanguage = "Jp";
            }
            else if (fastLanguage == "CN") {
                fastLanguage = "Tw";
            }
            else if (fastLanguage == "TH") {
                fastLanguage = "Th";
            }
        }

        if (data.characters) {
            DupeCheck();

            for (let i = 0; i < data.characters.length; i++) {
                dataCharIndex[data.characters[i].id] = i;
            }
        }

        if (data.disabled_characters != undefined) {
            disabledChars = data.disabled_characters;
        }

        let charsContainer = document.getElementById("charsContainer");

        if (data.character_order) {
            let lazy = false;

            for (let i = 0; i < data.character_order.length; i++) {
                // let char = data.characters[dataCharIndex[data.character_order[i]]];

                if (i > 40) {
                    lazy = true;
                }
                // if (char) {
                createCharBox(data.character_order[i], charsContainer, "main", lazy);
                // }
            }
        }
        else {
            data.character_order = [];
        }

        for (var i = 0; i < data.characters.length; i++) {
            if (document.getElementById('char_' + data.characters[i].id) == undefined) {
                createCharBox(data.characters[i].id, charsContainer, "main", true);
            }
        }

        if (chartranslate) {
            ShowNames(chartranslate);
        }
        else if ((fastLanguage == "En" || fastLanguage == "Id") && charlist) {
            ShowNames(charlist);
        }
        else {
            nameReady = true;
        }

        if (language_strings) {
            updateUiLanguage();
        }
        else {
            uiReady = true;
        }
    }
})

function DupeCheck() {

    let studentIds = [];
    let anyDupes = false;
    for (let i = 0; i < data.characters.length; i++) {
        if (studentIds.includes(data.characters[i].id)) {
            data.characters[i] = "dupe";
            anyDupes = true;
        }
        studentIds.push(data.characters[i].id);
    }

    if (anyDupes) {
        data.characters = data.characters.filter(a => a !== "dupe");

        localStorage.setItem("save-data", JSON.stringify(data));

        location.reload();
    }
}

function createCharBox(charId, container, location, lazy) {

    let idInject = "";
    // let charName = charNames.get(charId.toString());

    if (location == "teams") {
        idInject = "-teams";
    }
    else if (location == "borrow") {
        idInject = "-borrow";
        borrowed = true;
    }

    const newDiv = document.createElement("div");
    if (location == "main") {
        newDiv.className = "charBox main-display-char";
        newDiv.id = "char_" + charId;
    }
    else if (location == "teams") {
        newDiv.className = "charBox teams-display-char";
        newDiv.id = "char_teams_" + charId;
    }
    else if (location == "borrow") {
        newDiv.className = "charBox teams-display-char";
        newDiv.id = "char_borrow_" + charId;
    }

    if (location == "main") {
        if (disabledChars.includes(charId)) {
            newDiv.classList.add("deselected");
        } else {
            newDiv.classList.add("selected");
        }

        // if (window.matchMedia("(pointer: fine)").matches) {
        //     newDiv.title = GetLanguageString("tooltip-charhoverinfo");
        // }
    }

    const newContent = document.createElement("div");
    newContent.className = "charBoxwrap";

    const newContentBox = document.createElement("div");
    newContentBox.className = "main-box-content";

    let newStarContainer;
    let newUEContainer;
    let newBondContainer;
    let newBondContainerBG;

    let char = data.characters[dataCharIndex[charId]]; //.find(obj => { return obj.id == charId });

    if (location != "borrow" && char) {

        newStarContainer = document.createElement("div");
        newStarContainer.className = "star-container";
        newStarContainer.id = charId + idInject + "-star-container";

        newBondContainer = document.createElement("div");
        newBondContainer.className = "char-heart-container";

        const newBondImg = document.createElement("img");
        newBondImg.src = "icons/Misc/bondheart.png";
        newBondImg.draggable = false;

        const newBondP = document.createElement("p");
        newBondP.id = charId + idInject + "-bond-current";
        newBondP.style = "transform: translate(-50%, -95%)";

        const newBondP2 = document.createElement("p");
        newBondP2.id = charId + idInject + "-bond-target";
        newBondP2.style = "transform: translate(-50%, -25%)";


        newBondContainer.appendChild(newBondImg);
        newBondContainer.appendChild(newBondP);
        newBondContainer.appendChild(newBondP2);

        const newBondgearImg = document.createElement("img");
        newBondgearImg.src = "icons/Misc/bondheart.png";
        newBondgearImg.id = "bondgearPortraitHeart" + charId;
        newBondgearImg.draggable = false;

        newBondContainerBG = document.createElement("div");
        newBondContainerBG.className = "char-heart-container2";
        const newBondgearP = document.createElement("p");
        newBondgearP.id = charId + idInject + "-bondgear-current";
        newBondgearP.style = "transform: translate(-50%, -95%)";

        const newBondgearP2 = document.createElement("p");
        newBondgearP2.id = charId + idInject + "-bondgear-target";
        newBondgearP2.style = "transform: translate(-50%, -25%)";

        newBondContainerBG.appendChild(newBondgearImg);
        newBondContainerBG.appendChild(newBondgearP);
        newBondContainerBG.appendChild(newBondgearP2);



        for (i = 0; i < 5; i++) {
            const newStar = document.createElement("img");
            newStar.draggable = false;
            newStar.className = "display-star";
            newStar.src = "icons/Misc/mysticstar.png";

            newStarContainer.appendChild(newStar);
        }

        newUEContainer = document.createElement("div");
        newUEContainer.className = "ue-container";
        newUEContainer.id = charId + idInject + "-ue-container";

        for (i = 0; i < 5; i++) {
            const newStar = document.createElement("img");
            newStar.draggable = false;
            newStar.className = "display-star";
            newStar.src = "icons/Misc/mysticstar.png";

            newUEContainer.appendChild(newStar);
        }

        var classes = ["skill-bar", "gear-bar", "level-bar", "limitbreak-bar"];

        for (i = 0; i < classes.length; i++) {
            const newBar = document.createElement("div");
            newBar.className = classes[i] + " info-bar";

            const newP = document.createElement("p");
            newP.className = "info-display";
            newP.id = charId + idInject + "-" + classes[i].substring(0, classes[i].indexOf('-')) + "-current";
            newBar.appendChild(newP);

            const newP2 = document.createElement("p");
            newP2.className = "info-display";
            newP2.id = charId + idInject + "-" + classes[i].substring(0, classes[i].indexOf('-')) + "-target";
            newBar.appendChild(newP2);

            newContentBox.appendChild(newBar);
        }

    }

    const newImg = document.createElement("img");
    newImg.src = "icons/Portrait/Icon_" + charId + ".webp";
    newImg.draggable = false;
    newImg.className = "char-img";
    if (location == "main" && lazy) {
        newImg.loading = "lazy";
    }
    else {
        newImg.loading = "eager";
    }

    const nameDiv = document.createElement("div");
    nameDiv.className = "nameBar";
    nameDiv.id = charId + idInject + "-namebar";

    const nameTag = document.createElement("p");
    if (loaded) {
        let charName = charNames.get(charId);

        if (charName.includes(' ')) {
            nameTag.innerText = charName.substring(0, charName.indexOf(' '));
        }
        else if (charName.includes('(')) {
            nameTag.innerText = charName.substring(0, charName.indexOf('('));
        }
        else if (charName.includes('（')) {
            nameTag.innerText = charName.substring(0, charName.indexOf('（'));
        }
        else {
            nameTag.innerText = charName;
        }
    }

    let borrowDiv, borrowTag;

    if (location == "borrow") {
        borrowDiv = document.createElement("div");
        borrowDiv.className = "borrowBar";

        borrowTag = document.createElement("p");
        borrowTag.innerText = GetLanguageString("label-borrowed");
    }

    newContentBox.appendChild(newImg);
    newContentBox.appendChild(nameDiv).appendChild(nameTag);
    if (location == "borrow") {
        newContentBox.appendChild(borrowDiv).appendChild(borrowTag);
    }

    newContent.appendChild(newContentBox);

    newDiv.appendChild(newContent);
    if (location != "borrow" && char) {
        newDiv.appendChild(newStarContainer);
        newDiv.appendChild(newUEContainer);
        newDiv.appendChild(newBondContainer);
        newDiv.appendChild(newBondContainerBG);
    }
    if (location == "main") {
        newDiv.onclick = openModal
    }

    if (location == "main") {

        let lastNode = document.getElementById('addCharButton')

        container.insertBefore(newDiv, lastNode);
    }
    else if (location == "teams" || location == "borrow") {

        container.appendChild(newDiv);
    }

    if (location != "borrow" && char) {
        updateInfoDisplay(charId, idInject, char);
        updateStarDisplay(charId + idInject + "-star-container", charId, "star-display", false, char);
        updateStarDisplay(charId + idInject + "-ue-container", charId, "ue-display", false, char);
    }
}

function updateInfoDisplay(charId, idInject, charData) {

    // var charData = data.characters[dataCharIndex[charId]];

    var skillCurrent = formatLevel("Ex", charData.current?.ex) + formatLevel("Other", charData.current?.basic) +
        formatLevel("Other", charData.current?.passive) + formatLevel("Other", charData.current?.sub);

    var skillTarget = formatLevel("Ex", charData.target?.ex) + formatLevel("Other", charData.target?.basic) +
        formatLevel("Other", charData.target?.passive) + formatLevel("Other", charData.target?.sub);

    var gearCurrent = formatLevel("Gear", charData.current?.gear1) + formatLevel("Gear", charData.current?.gear2) + formatLevel("Gear", charData.current?.gear3);
    var gearTarget = formatLevel("Gear", charData.target?.gear1) + formatLevel("Gear", charData.target?.gear2) +
        formatLevel("Gear", charData.target?.gear3);

    document.getElementById(charId + idInject + "-skill-current").innerText = skillCurrent;
    if (skillCurrent != skillTarget) {
        document.getElementById(charId + idInject + "-skill-target").innerText = skillTarget;
    }
    else {
        document.getElementById(charId + idInject + "-skill-target").innerText = "";
    }

    document.getElementById(charId + idInject + "-gear-current").innerText = gearCurrent;
    if (gearCurrent != gearTarget) {
        document.getElementById(charId + idInject + "-gear-target").innerText = gearTarget;
    }
    else {
        document.getElementById(charId + idInject + "-gear-target").innerText = "";
    }

    document.getElementById(charId + idInject + "-level-current").innerText = formatLevel("Level", charData.current.level);
    if (charData.current.level != charData.target.level) {
        document.getElementById(charId + idInject + "-level-target").innerText = formatLevel("Level", charData.target.level);
    }
    else {
        document.getElementById(charId + idInject + "-level-target").innerText = "";
    }

    document.getElementById(charId + idInject + "-bond-current").innerText = charData.current?.bond;
    if (charData.current?.bond != charData.target?.bond) {
        document.getElementById(charId + idInject + "-bond-target").innerText = charData.target?.bond;
    }
    else {
        document.getElementById(charId + idInject + "-bond-target").innerText = "";
    }
    
    if ( bondgear_characters.includes(parseInt(charId)) ) {
        document.getElementById("bondgearPortraitHeart"+ charId).style.display = ""
        document.getElementById(charId + idInject + "-bondgear-current").innerText = "T"+ charData.current?.bondgear;
        if (charData.current?.bondgear != charData.target?.bondgear) {
            document.getElementById(charId + idInject + "-bondgear-target").innerText = "T"+ charData.target?.bondgear;
        }
        else {
            document.getElementById(charId + idInject + "-bondgear-target").innerText = "";
        }
    }
    else {
        document.getElementById("bondgearPortraitHeart"+ charId).style.display = "none"
    }

    var limitbreakCurrent = formatLevel("LB", charData.current?.potentialmaxhp) + " " + formatLevel("LB", charData.current?.potentialattack) + " " + formatLevel("LB", charData.current?.potentialhealpower);
    var limitbreakTarget = formatLevel("LB", charData.target?.potentialmaxhp) + " " + formatLevel("LB", charData.target?.potentialattack) + " " + formatLevel("LB", charData.target?.potentialhealpower);
    if (limitbreakCurrent != limitbreakTarget) {
        document.getElementById(charId + idInject + "-limitbreak-current").innerText = limitbreakCurrent;
        document.getElementById(charId + idInject + "-limitbreak-target").innerText = limitbreakTarget;
    }
    else {
        if (limitbreakCurrent != "0 0 0") document.getElementById(charId + idInject + "-limitbreak-current").innerText = limitbreakCurrent;
        document.getElementById(charId + idInject + "-limitbreak-target").innerText = "";
    }
}

function updateStarDisplay(id, charId, type, fromTemp, charData) {

    var starContainer = document.getElementById(id);

    var star, star_target, ue, ue_target;

    if (fromTemp) {
        star = modalStars.star;
        star_target = modalStars.star_target;
        ue = modalStars.ue;
        ue_target = modalStars.ue_target;
    }
    else {
        // var charData = data.characters[] .find(obj => { return obj.id == charId });

        star = charData.current?.star;
        star_target = charData.target?.star;
        ue = charData.current?.ue;
        ue_target = charData.target?.ue;
    }

    for (s = 0; s < 5; s++) {
        if (type == "star-current" || type == "star-target") {
            if (star > s) {
                starContainer.children[s].style.filter = "grayscale(0)";
            }
            else if (type == "star-target" && star_target > s) {
                starContainer.children[s].style.filter = "grayscale(0)";
            }
            else {
                starContainer.children[s].style.filter = "grayscale(1)";
            }
        }
        else if (type == "ue-current" || type == "ue-target") {
            if (ue > s) {
                starContainer.children[s].style.filter = "grayscale(0) hue-rotate(150deg)";
            }
            else if (type == "ue-target" && ue_target > s) {
                starContainer.children[s].style.filter = "grayscale(0) hue-rotate(150deg)";
            }
            else {
                starContainer.children[s].style.filter = "grayscale(1)";
            }
        }
        else if (type == "star-display") {
            if (star > s) {
                starContainer.children[s].style.visibility = "";
                //starContainer.children[s].style.filter = "";
                starContainer.children[s].src = "icons/Misc/mysticstar.png"
            }
            else if (star_target > s) {
                starContainer.children[s].style.visibility = "";
                //starContainer.children[s].style.filter = "grayscale(0.5) contrast(0.5)";
                starContainer.children[s].src = "icons/Misc/mysticstar-greyed.png"
            }
            else {
                starContainer.children[s].style.visibility = "hidden";
            }
        }
        else if (type == "ue-display") {
            if (ue > s) {
                starContainer.children[s].style.visibility = "";
                //starContainer.children[s].style.filter = "grayscale(0) hue-rotate(150deg)";
                starContainer.children[s].src = "icons/Misc/mysticstar-blue.png"
            }
            else if (ue_target > s) {
                starContainer.children[s].style.visibility = "";
                //starContainer.children[s].style.filter = "grayscale(0.5) hue-rotate(150deg) contrast(0.5)";
                starContainer.children[s].src = "icons/Misc/mysticstar-blue-greyed.png"
            }
            else {
                starContainer.children[s].style.visibility = "hidden";
            }
        }
    }

}

function ShowNames(source) {

    let nameBars = document.querySelectorAll(".main-display-char .nameBar");

    for (let i = 0; i < nameBars.length; i++) {
        let charId = nameBars[i]?.id.substring(0, 5);

        let charName = source[charId].Name;

        if (charName.includes(' ')) {
            nameBars[i].children[0].innerText = charName.substring(0, charName.indexOf(' '));
        }
        else if (charName.includes('(')) {
            nameBars[i].children[0].innerText = charName.substring(0, charName.indexOf('('));
        }
        else if (charName.includes('（')) {
            nameBars[i].children[0].innerText = charName.substring(0, charName.indexOf('（'));
        }
        else {
            nameBars[i].children[0].innerText = charName;
        }
    }
}

function updateUiLanguage() {

    let textElements = document.getElementsByClassName('display-string');

    for (let i = 0; i < textElements.length; i++) {

        let dataId = textElements[i].getAttribute('data-id');

        textElements[i].innerText = GetLanguageStringEarly(dataId);
    }
}

function GetLanguageStringEarly(dataId) {

    if (language_strings[dataId]) {

        let languageUpper = fastLanguage.toUpperCase();

        if (language_strings[dataId][languageUpper]) {
            return language_strings[dataId][languageUpper];
        }
        else {
            return language_strings[dataId]["EN"];
        }
    }
    else {
        return "Undefined"
    }
}