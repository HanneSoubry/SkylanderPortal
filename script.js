let global = {
    selectedSerie: 0,

    availableChars: [],
    selectedChars: [],
    activePortal: null,

    currentFilters: {
        element: null,
        figuretype: null,
        special: null
    }
}

// SETUP
const setup = async () => {
    // display all series
    let buttons = document.getElementById("series-banner");
    data_series.forEach(s => {
        buttons.appendChild(createSeriesButton(s.Id, s.Name));
    })

    // default player
    selectPlayerByNumber(1);
}
window.addEventListener("load", setup);

const backToMenu = () => {
    // toggle display
    document.getElementById("series-banner").style.display = null;
    document.getElementById("filter-banner").style.display = "none";

    // empty selection & gallery
    document.getElementById("gallery").innerHTML = "";
    global.availableChars = [];
    global.selectedChars = [];

    emptyFilters();
    resetPortals();
}

const newGame = () => {
    // revive all
    global.availableChars.forEach(s => {
        s.Alive = true;
    })

    // reset
    resetFilters();
    resetPortals();
    updateGallery();
    displaySkylanders();
}

// PORTALS

const selectPlayer = (e) => {
    global.activePortal.classList.remove("selected");

    global.activePortal = e.currentTarget;
    global.activePortal.classList.add("selected");
}

const selectPlayerByNumber = (nr) => {
    if(global.activePortal !== null)
        global.activePortal.classList.remove("selected");

    global.activePortal = document.getElementById("playerPortal" + nr);
    global.activePortal.classList.add("selected");
}

const resetPortals = () => {
    let p1 = document.getElementById("playerPortal1");
    let p2 = document.getElementById("playerPortal2");

    p1.querySelector("p").textContent = "-";
    p1.querySelector("img").src = "images/portal_light.png";

    p2.querySelector("p").textContent = "-";
    p2.querySelector("img").src = "images/portal_light.png";
}

const selectSkylander = (e) => {
    let card = e.currentTarget;

    if (card.classList.contains("dead"))
        return; // ignore dead characters

    global.activePortal.querySelector("p").textContent = card.querySelector("p").textContent;
    global.activePortal.querySelector("img").src = card.querySelector("img").src;
}

const randomSkylander = (playerNr) => {
    selectPlayerByNumber(playerNr);

    // pick random
    let temp = global.selectedChars.filter(char => char.Alive === true);
    if (temp.length === 0)
        return; // no more skylanders remaining to select

    const skylander = temp[Math.floor(Math.random() * temp.length)];

    // display
    global.activePortal.querySelector("p").textContent = skylander.Name;
    global.activePortal.querySelector("img").src = `images/skylanders/${skylander.Name.replaceAll(" ", "")}.png`;
}

const deadSkylander = (playerNr) => {
    selectPlayerByNumber(playerNr);

    const name = global.activePortal.querySelector("p").textContent;
    let character = global.availableChars.find(char => char.Name === name);
    character.Alive = false;
    character = global.selectedChars.find(char => char.Name === name);
    if(character) character.Alive = false;

    document.getElementById(name).classList.add("dead");

    global.activePortal.querySelector("p").textContent = "-";
    global.activePortal.querySelector("img").src = "images/portal_light.png";
}

// SERIES

const createSeriesButton = (id, name) => {
    let button = document.createElement("button");
    button.addEventListener("click", (e) => selectSeries(e, id));
    button.id = name;

    let img = document.createElement("img");
    img.src = "images/icons/" + name.replaceAll(/[\s-]/g, "") + ".png";
    button.appendChild(img);

    return button;
}

const selectSeries = (e, id) => {
    //save
    global.selectedSerie = id;

    // update button image
    let selectedButton = document.getElementById("selected-series");
    selectedButton.innerHTML = e.currentTarget.innerHTML; // copy content of selected button

    // load characters from series
    global.availableChars = data_characters.filter(d => { return d.SeriesId <= global.selectedSerie });

    // remove duplicates (variations from different series)  
    global.availableChars = global.availableChars.sort(
        (a, b) => a.Character.localeCompare(b.Character) || b.SeriesId - a.SeriesId); 
        // if char equal, seriesId desc.
    let temp = [global.availableChars[0]];
    global.availableChars.forEach(char => {
        if (temp[temp.length - 1].Character !== char.Character) {
            temp.push(char);
        }
        // else duplicate, ignore
    })
    global.availableChars = temp;
    global.availableChars = global.availableChars.sort((a, b) => a.Name.localeCompare(b.Name));

    newGame();

    // load available filters
    let set = new Set(global.availableChars.map(s => { return s.FigureType }).filter(s => s != null));
    let filters = document.getElementById("figuretype-filters");
    set.values().forEach(s => {
        filters.appendChild(createFilter("figuretype", s));
    })
    checkFilterNeeded(filters);

    set = new Set(global.availableChars.map(s => { return s.Element }).filter(s => s != null));
    filters = document.getElementById("element-filters");
    set.values().forEach(s => {
        filters.appendChild(createFilter("element", s));
    })
    checkFilterNeeded(filters);

    set = new Set(global.availableChars.map(s => { return s.Special }).filter(s => s != null));
    filters = document.getElementById("special-filters");
    set.values().forEach(s => {
        filters.appendChild(createFilter("special", s));
    })
    checkFilterNeeded(filters);
    
    // toggle display
    document.getElementById("series-banner").style.display = "none";
    document.getElementById("filter-banner").style.display = null;

    // fill gallery
    global.selectedChars = global.availableChars;
    displaySkylanders();
}

const checkFilterNeeded = (filters) => {
    if (filters.children.length > 1) {
        filters.style.display = null;
        filters.previousElementSibling.style.display = null;
    }
    else {
        filters.style.display = "none";
        filters.previousElementSibling.style.display = "none";
    }
}

// FILTERS

const createFilter = (group, name) => {
    let button = document.createElement("button");
    button.addEventListener("click", (e) => selectFilter(e, group, name));
    button.id = name;

    let img = document.createElement("img");
    img.src = "images/icons/" + name.replaceAll(/[\s-]/g, "") + ".png";
    button.appendChild(img);

    return button;
}

const selectFilter = (e, group, name) => {
    let button = e.currentTarget;
    activeButton = global.currentFilters[group];

    if (activeButton !== button) {
        // not selected yet
        if (activeButton)
            activeButton.classList.remove("active");

        global.currentFilters[group] = button;
        button.classList.add("active");
    }
    else {
        // selected already
        global.currentFilters[group] = null;
        button.classList.remove("active");
    }

    updateGallery();
}

const emptyFilters = () => {
    document.getElementById("element-filters").innerHTML = "";
    document.getElementById("figuretype-filters").innerHTML = "";
    document.getElementById("special-filters").innerHTML = "";

    global.currentFilters.element = null;
    global.currentFilters.figuretype = null;
    global.currentFilters.special = null;
}

const resetFilters = () => {
    if (global.currentFilters.element) global.currentFilters.element.classList.remove("active");
    if (global.currentFilters.figuretype) global.currentFilters.figuretype.classList.remove("active");
    if (global.currentFilters.special) global.currentFilters.special.classList.remove("active");

    global.currentFilters.element = null;
    global.currentFilters.figuretype = null;
    global.currentFilters.special = null;
}

// GALLERY

const updateGallery = () => {
    global.selectedChars = global.availableChars.filter(char => {
        const matchElement =
            global.currentFilters.element === null ||
            global.currentFilters.element.id === char.Element;

        const matchFigureType =
            global.currentFilters.figuretype === null ||
            global.currentFilters.figuretype.id === char.FigureType;

        const matchSpecial =
            global.currentFilters.special === null ||
            global.currentFilters.special.id === char.Special;

        return matchElement && matchFigureType && matchSpecial;
    });

    displaySkylanders();
}

const displaySkylanders = () => {
    const container = document.getElementById("gallery");
    container.innerHTML = "";

    global.selectedChars.forEach(skylander => {
        container.appendChild(createSkylander(skylander))
    })
}

const createSkylander = (skylander) => {
    let card = document.createElement("div");
    card.classList.add("card");
    card.addEventListener("click", (e) => selectSkylander(e));
    card.id = skylander.Name;
    if (!skylander.Alive) card.classList.add("dead");

    let name = document.createElement("p");
    name.textContent = skylander.Name;
    card.appendChild(name);

    let img = document.createElement("img");
    img.src = `images/skylanders/${skylander.Name.replaceAll(" ", "")}.png`;
    img.alt = `${skylander.Name}`;
    img.className = "portrait";
    card.appendChild(img);

    let icons = document.createElement("div");
    icons.className = "icon-list";

    if (skylander.Series !== null) {
        let series = document.createElement("img");
        const name = data_series.find(item => item.Id === skylander.SeriesId)?.Name;
        series.src = `images/icons/${name.replaceAll(" ", "")}.png`;
        series.alt = `${skylander.Series}`;
        series.className = "icon";
        icons.appendChild(series);
    }

    if (skylander.FigureType !== null) {
        let type = document.createElement("img");
        type.src = `images/icons/${skylander.FigureType.replaceAll(" ", "")}.png`;
        type.alt = `${skylander.FigureType}`;
        type.className = "icon";
        icons.appendChild(type);
    }

    if (skylander.Element !== null) {
        let element = document.createElement("img");
        element.src = `images/icons/${skylander.Element.replaceAll(" ", "")}.png`;
        element.alt = `${skylander.Element}`;
        element.className = "icon";
        icons.appendChild(element);
    }

    if (skylander.Special !== null) {
        let special = document.createElement("img");
        special.src = `images/icons/${skylander.Special.replaceAll(" ", "")}.png`;
        special.alt = `${skylander.Special}`;
        special.className = "icon";
        icons.appendChild(special);
    }

    if (icons.children.length > 0) {
        card.appendChild(icons);
    }

    return card;
}