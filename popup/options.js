const favCheck = document.getElementById("favcheck");


favCheck.onchange = () => {
    if (favCheck.checked) {
        chrome.storage.sync.get("fav", result => {
            let btns = result.fav;
            if (btns == undefined) btns = [['', 0, '#000000']]
            else {
                btns.push(['', 0, '#000000'])
            }
            chrome.storage.sync.set({ fav: btns });
        });
    } else {
        chrome.storage.sync.get("fav", result => {
            let btns = result.fav;
            btns.splice(btns.findIndex(b => b[1] == 0), 1);
            chrome.storage.sync.set({ fav: btns });
        });

    }
}

var keyIndex = {
    'word': 0,
    'ping': 0,
    'fav': 1,
    'gravity': 0
}

var keyOptions = {
    'word': false,
    'ping': false,
    'fav': favCheck,
    'gravity': false
}

var collSelect = {
    'word': false,
    'ping': false,
    'fav': false,
    'gravity': ['up', 'left', 'right', 'down']
}

appendRows('fav');
appendRows('word');
appendRows('ping');
appendRows('gravity');

document.querySelector("#fav-table .add").onclick = () => add('fav', 'This ship ID already exists');
document.querySelector("#word-table .add").onclick = () => add('word', 'This button text already exists');
document.querySelector("#ping-table .add").onclick = () => add('ping', 'This webhook connection already exists');
document.querySelector("#gravity-table .add").onclick = () => add('gravity', 'This ship ID already exists');


function appendRows(collection) {
    const options = keyOptions[collection];
    const new_tbody = document.createElement('tbody');
    document.querySelector(`#${collection}-table tbody`).replaceWith(new_tbody);
    chrome.storage.sync.get(collection, result => {
        let list = result[collection];
        if (list == undefined) return;
        if(options && list.findIndex(i => i[keyIndex[collection]] == 0) != -1) {
            options.checked = true;
            list.splice(list.findIndex(i => i[keyIndex[collection]] == 0), 1)
        }
        // console.log(collection, list);
        list.forEach(s => {
            const row = document.createElement('tr')
            s.forEach(element => {        
                const td = document.createElement('td');
                console.log(element);
                if(collSelect[collection] && s.indexOf(element) === 1) {
                    const tdSelect = document.createElement('select');
                    for (const opt of collSelect[collection]) {
                        const tdOption = document.createElement('option');
                        tdOption.textContent = opt;
                        tdOption.value = collSelect[collection].indexOf(opt);
                        tdSelect.append(tdOption);
                    }
                    tdSelect.value = element;
                    td.append(tdSelect);
                } else {
                    const tdInput = document.createElement('input');
                    if(/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(element)) tdInput.type = 'color';
                    tdInput.value = element;
                    td.append(tdInput);
                }
                row.append(td);
            });
            const editBtn = document.createElement('td');
            editBtn.textContent = `Save`;
            editBtn.classList.add('orange');
            editBtn.onclick = function () { edit(collection, this, s[keyIndex[collection]]); }
            row.append(editBtn);
            const removeBtn = document.createElement('td')
            removeBtn.textContent = `Delete`
            removeBtn.classList.add('red');
            removeBtn.onclick = function () { remove(collection, this, s[keyIndex[collection]]); }
            row.append(removeBtn);
            document.querySelector(`#${collection}-table tbody`).append(row);
        });
    });
}

function add(collection, errorMessage) {
    const inputs = [...document.querySelectorAll(`#${collection}-table tfoot input, #${collection}-table tfoot textarea, #${collection}-table tfoot select`)];
    for(const i of inputs) {
        if (i.value == '') return info('Fill each input field!', false);
    }
    chrome.storage.sync.get(collection, result => {
        let list = result[collection];
        console.log([inputs.map(i => i.value)]);
        if (list == undefined) list = [inputs.map(i => i.value)];
        else {
            if (list.find(l => l[keyIndex[collection]] == inputs[keyIndex[collection]].value) || inputs[keyIndex[collection]].value == 0)
                return info(errorMessage, false);
            list.push([...inputs.map(i => i.value)])
        }
        chrome.storage.sync.set({ [collection]: list });
        for(const i of inputs) i.value = '';
        info('Successfully added entry');
        appendRows(collection);
    });
}

function remove(collection, node, id) {
    if (confirm("Are you sure you want to remove it?")) {
        chrome.storage.sync.get(collection, result => {
            let list = result[collection];
            list.splice(list.findIndex(i => i[keyIndex[collection]] == id), 1);
            chrome.storage.sync.set({ [collection]: list });
            node.parentElement.remove();
            info('Successfully removed entry');
        });
    }
}

function edit(collection, node, id) {
    chrome.storage.sync.get(collection, result => {
        let list = result[collection];
        const inputs = node.parentElement.querySelectorAll('input, select');
        for(const i of inputs) {
            if (i.value == '') return info('Fill each input field!', false);
        }
        console.log(list, inputs[keyIndex[collection]].value, id);
        if (list.find(i => i[keyIndex[collection]] == inputs[keyIndex[collection]].value && inputs[keyIndex[collection]].value != id))
            return info('Failed. Entry with the same key name already exist', false);
        else list[list.findIndex(i => i[keyIndex[collection]] == id)] = [...inputs].map(i => i.value);
        chrome.storage.sync.set({ [collection]: list });
        info('Successfully edited entry');
    });
}

// Buttons manager

var defaultUIbuttons = {
    'Save': [true, 'red', null],
    'Invite': [true, 'purple', null],
    'Help': [true, 'green', null],
    'Settings': [true, 'yellow', null],
    'Cheat Menu': [true, 'grey', null],
    'Manage Ship': [true, 'blue', null],
    'Rejoin Ship': [true, 'orange', null],
    'Exit Ship': [true, 'red', null],
}

var UIbuttons = {
    'Save': [true, 'red', null],
    'Invite': [true, 'purple', null],
    'Help': [true, 'green', null],
    'Settings': [true, 'yellow', null],
    'Cheat Menu': [true, 'grey', null],
    'Manage Ship': [true, 'blue', null],
    'Rejoin Ship': [true, 'orange', null],
    'Exit Ship': [true, 'red', null],
}

const btnTable = document.querySelector('#buttons-table tbody');

chrome.storage.sync.get('buttons', result => {
    if(result.buttons != undefined) {
        for(const button of Object.keys(result.buttons)) {
            if (Object.keys(defaultUIbuttons).includes(button))
                UIbuttons[button] = result.buttons[button];
        }
    }
    addButtonsRow();
});

document.querySelector('#btnrestore').onclick = () => {
    chrome.storage.sync.remove('buttons').then(() => {
        UIbuttons = defaultUIbuttons;
        addButtonsRow();
    });
    info('Successfully restored buttons');
}

document.querySelector('#btnsave').onclick = () => {
    chrome.storage.sync.set({ buttons: UIbuttons });
    info('Successfully saved');
}

function addButtonsRow() {
    btnTable.replaceChildren();
    for(const [btn, options] of Object.entries(UIbuttons)) {
        const row = document.createElement('tr');
        const btnName = document.createElement('td');
        btnName.textContent = btn;

        const btnText = document.createElement('td');
        const btnTextInput = document.createElement('input');
        btnTextInput.type = 'text'
        btnTextInput.value = options[2] ? options[2] : btn;
        btnTextInput.oninput = () => {
            UIbuttons[btn][2] = btnTextInput.value;
        }
        btnText.append(btnTextInput)

        const btnColor = document.createElement('td');
        const colorSelect = generateColorSelect();
        colorSelect.value = options[1];
        colorSelect.classList.add(`btn-${colorSelect.value}`);
        colorSelect.onchange = () => {
            UIbuttons[btn][1] = colorSelect.value;
            colorSelect.className = '';
            colorSelect.classList.add(`btn-${colorSelect.value}`);
        }
        btnColor.append(colorSelect);

        const btnShow = document.createElement('td');
        const btnShowCheck = document.createElement('input');
        btnShowCheck.type = 'checkbox';
        btnShowCheck.checked = options[0];
        btnShowCheck.onclick = () => {
            UIbuttons[btn][0] = btnShowCheck.checked;
        }
        btnShow.append(btnShowCheck);

        row.append(btnName, btnText, btnColor, btnShow);
        btnTable.append(row);
    }
}

function generateColorSelect() {
    const colorSelect = document.createElement('select');
    ['red', 'green', 'blue', 'white', 'black', 'grey', 'yellow', 'orange', 'purple', 'darkBlue'].forEach(c => {
        const opt = document.createElement('option');
        opt.classList.add(`btn-${c}`);
        opt.value = opt.textContent = c;
        colorSelect.append(opt);
    });
    return colorSelect;
}


// Translation settings

const langInInput = document.querySelector('#langIn-input');
const langOutInput = document.querySelector('#langOut-input');
const autoLangInput = document.querySelector('#lang-auto');
const transout = document.querySelector('#txt-output');

chrome.storage.sync.get("transl", function (result) {
    if (result.transl == undefined) return;
    langInInput.value = result.transl[0];
    langOutInput.value = result.transl[1];
    autoLangInput.checked = result.transl[2];
});

autoLangInput.onchange = () => { setTrans() }
langInInput.onchange = () => { setTrans() }
langOutInput.onchange = () => { setTrans() }

function setTrans() {
    chrome.storage.sync.set({ transl: [langInInput.value || 'en', langOutInput.value || 'en', autoLangInput.checked || false] });
    info('Successfully changed');
}

// Keybins

chrome.storage.sync.get("key", function (result) {
    let arr = result.key;
    if (arr == null || arr.length != 6) arr = [1, "q", "r", "", "", ""];
    for (i = 1; i < arr.length; i++) {
        document.querySelector(`#key-table tr:nth-of-type(${i}) input`).value = arr[i];
    }
    document.querySelector("#fkey").value = arr[0];
});

document.querySelector("#key-table .add").onclick = function () { setKey(); }

function setKey() {
    let keys = [parseInt(document.getElementById("fkey").value)];
    let keysInp = document.querySelectorAll("#key-table input[type='text']");
    for (let i = 0; i < keysInp.length; i++) keys.push(keysInp[i].value.toLowerCase())
    if (!keys[0]) {
        for (i = 1; i < keys.length; i++) {
            if (!/[bimq,./;'\[\]]|^$/i.test(keys[i]))
                return info("Fail!  Because you are using Ctrl, all keys must be one of those characters: b i m q , . / ; ' [ ]", false);
        }
    } else {
        for (i = 1; i < keys.length; i++) {
            if (!/[a-zA-Z]|^$/i.test(keys[i]))
                return info("Fail! Because you are using Shift, key can only be letter a-z", false);
        }
    }
    for (i = 1; i < keys.length; i++) {
        keys[i] = keys[i].trim();
        if (keys[i] == '') i++;
        else {
            for (o = i + 1; o < keys.length; o++) {
                if (keys[i] == keys[o]) return info("Fail! You can't set one key to more than one function!", false);
            }
        }
    }
    chrome.storage.sync.set({ key: keys });
    return info("Successfully changed");
}

// snake copter

const dur = document.querySelector("#duration");
const snakeout = document.querySelector("#snakeoutput");

chrome.storage.sync.get("dur", function (result) {
    if (result.dur != null) {
        snakeout.textContent = result.dur / 1000;
        dur.value = result.dur / 1000;
    } else {
        snakeout.textContent = "(default) 10";
        dur.value = 10;
    }
});
dur.oninput = function () {
    const d = this.value;
    snakeout.textContent = d;
}
dur.onchange = function () {
    chrome.storage.sync.set({ dur: this.value * 1000 });
}

// Scrollbar theme

const sctrack = document.querySelector("#sctrack");
const scthumb = document.querySelector("#scthumb");
const sctrans = document.querySelector("#sctrans");

chrome.storage.sync.get("colors", function (result) {
    if (result.colors == null) {
        sctrack.value = "#0000004d";
        scthumb.value = "#7b7b7b";
    } else {
        let colors = result.colors;
        sctrack.value = colors[0];
        scthumb.value = colors[1];
        if (colors[2] == '4d') sctrans.checked = true;
        document.body.style.setProperty('--scrollTrack', sctrack.value + '' + colors[2]);
        document.body.style.setProperty('--scrollThumb', scthumb.value);
    }
});

sctrack.oninput = function () { previewColors(); }
scthumb.oninput = function () { previewColors(); }
sctrack.onchange = function () { setColors(); }
scthumb.onchange = function () { setColors(); }
sctrans.onchange = function () { previewColors(); setColors(); }

function previewColors() {
    let colors = [sctrack.value, scthumb.value];
    colors[2] = sctrans.checked ? '4d' : '';
    document.body.style.setProperty('--scrollTrack', sctrack.value + '' + colors[2]);
    document.body.style.setProperty('--scrollThumb', scthumb.value);
}

function setColors() {
    let colors = [sctrack.value, scthumb.value];
    colors[2] = sctrans.checked ? '4d' : '';
    chrome.storage.sync.set({ colors: colors });
    info('Successfully changed');
}

// UI Theme

const uiInput = document.querySelector("#uicolor");
const uiOpacityInput = document.querySelector("#uiopacity");
const uiOutput = document.querySelector("#uioutput");
uiInput.onchange = function () { setUI(); }
uiOpacityInput.onchange = function () { setUI(); }

function setUI() {
    const uiColor = [uiInput.value, parseFloat(uiOpacityInput.value)];
    chrome.storage.sync.set({ ui: uiColor });
    info('Successfully changed');
}

chrome.storage.sync.get("ui", function (result) {
    if (result.ui == null) {
        uiInput.value = '#19232d';
        uiOpacityInput.value = 0.9;
    } else {
        uiInput.value = result.ui[0];
        uiOpacityInput.value = result.ui[1];
    }
});

document.querySelector('#defaultUI').onclick = () => {
    uiInput.value = '#19232d';
    uiOpacityInput.value = 0.9;
    uiInput.dispatchEvent(new Event('change'));
}

// Chat Max Height

const chatMaxInput = document.querySelector("#chatmaxheight");

document.querySelector('#saveChatMaxHeight').onclick = () => {
    if(chatMaxInput.value < 50) return info('Height can\'t be lower than 50px!', false);
    if(chatMaxInput.value > 2000) return info('Height can\'t be higher than 2000px!', false);
    chrome.storage.sync.set({ chatmaxheight: chatMaxInput.value });
    info('Successfully changed');
}

document.querySelector('#defaultChatMaxHeight').onclick = () => {
    chatMaxInput.value = '300';
    chrome.storage.sync.remove('chatmaxheight');
    info('Successfully restored');
}

chrome.storage.sync.get("chatmaxheight", function (result) {
    chatMaxInput.value = result.chatmaxheight;
});

// Texture pack

const txtInput = document.querySelector('#txt-input');
const txtRemove = document.querySelector('#txt-remove');
const txtLabel = document.querySelector('#txt-current');
const txtout = document.querySelector('#txt-output');
txtInput.onchange = async function () {
    if (this.files[0].type != 'application/x-zip-compressed') return txtout.textContent = 'That is not a zip file.';
    chrome.storage.local.set({ txt: await fileToBase64(this.files[0]) });
    info('Successfully changed');
    txtLabel.textContent = 'applied';
}
txtRemove.onclick = () => {
    chrome.storage.local.remove("txt");
    info('Successfully removed texture pack');
    txtLabel.textContent = "default shrek's pack";
}

chrome.storage.local.get("txt", function (result) {
    if (result.txt == null) return;
    txtLabel.textContent = 'applied';
});


const fileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

const base64ToFile = url => {
    let arr = url.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let data = arr[1];

    let dataStr = atob(data);
    let n = dataStr.length;
    let dataArr = new Uint8Array(n);

    while (n--) dataArr[n] = dataStr.charCodeAt(n);

    return new File([dataArr], 'File.zip', { type: mime });
};


// Notifications

const messageContainer = document.getElementById('messageContainer');

function info(text, status = true) {
    const messageWrapper = document.createElement('li');
    const message = document.createElement('p');
    message.textContent = `${text}${status ? '! Reload game to see changes' : ''}`;
    if (!status) message.classList.add('error');
    messageWrapper.append(message);
    messageContainer.append(messageWrapper);
    message.onclick = () => {
        removeMessage(message);
    };
    setTimeout(() => {
        messageWrapper.classList.add('show');
        message.classList.add('show');
    }, 15);
    setTimeout(() => {
        removeMessage(message);
    }, 5000);
}

function removeMessage(e) {
    e.classList.remove('show');
    e.parentElement.classList.remove('show');
    e.parentElement.ontransitionend = () => {
        e.parentElement.remove();
    };
}