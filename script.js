var Fmanager = false;
var manager = true;
var cShip = '';
const canvas = document.getElementById('canvas-game');
if (!canvas) throw new Error("Script doesn't work on these pages.");
const bigUiContainer = document.querySelector('#big-ui-container');
const exit = document.getElementById("exit_button");
const manage = document.getElementById("team_manager_button");
const chatBox = document.getElementById("chat");
const chatInp = document.getElementById("chat-input");
const commsInp = document.getElementById("comms-input");
const chatContent = document.querySelector("#chat-content");
const commsContent = document.querySelector("#comms-text");
const chatBtn = document.getElementById("chat-send");
const mapBtn = document.getElementById("map_button")
const tmenu = document.getElementById("team_menu");
const disconnectPopup = document.getElementById("disconnect-popup");
const buttonContainer = document.querySelector(".button-container");
const topBar = document.querySelector('#top-bar');
let shipYard = document.getElementById("shipyard-ships");
const config = { childList: true, attributes: true, subtree: true };
let playerID = '';
const keyToggleState = {
    "'": false,
    "/": false
}

function observeNode(node, func, loop = false, conf = config) {
    let observer = new MutationObserver(() => {
        func();
        if (!loop) {
            observer.disconnect();
        }
    });
    observer.observe(node, conf);
}

addCopyInvite();
addInstantSave();
addRejoin();
addChatPhrases();
addChatTrans();
addCustomButtons();
const rejoin = document.getElementById("rejoin_button");
let chatTranslate = document.getElementById("opt_chat_translate");
const langInput = document.getElementById("lang-input");
let pingsBox = document.querySelector('#top-bar select:nth-of-type(2)')

const welcomeMessages = [
    "Welcome aboard Captain. All systems online. ",
    "Welcome back ",
    "Ahoy ",
    "Ahead flank; emergency speed. #",
    "Hello ",
    "Greetings ",
    "Let's gyyat those ships mr. ",
    "Hey, You, You're finally awake ",
    "Rise and shine ",
    "All we had to do, was follow the damn ship ",
    "Wake up, Samurai. We have a ship to burn, mr ",
    "Nanomachines, ",
    "The cake is ",
    "It's A Me, ",
    "It's dangerous to go alone, go with ",
];

// After menu is loaded
observeNode(bigUiContainer, () => {
    addBtnServer();
    addFavShips();
    addEmergCall();
    shipYard = document.getElementById("shipyard-ships");

    // account    
    playerID = document.querySelector('#shipyard code.user').textContent;
    const welcomeMsg = document.createElement('h3');
    welcomeMsg.textContent = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const playerIDspan = document.createElement('code');
    playerIDspan.classList.add('user');
    playerIDspan.textContent = playerID;
    const playerBackgroundColor = document.querySelector('#shipyard code.user').style.background;
    const gradientStyle = `linear-gradient(${playerBackgroundColor}, transparent 200%)`;
    playerIDspan.style = document.querySelector('#shipyard code.user').style.cssText + `; background: ${gradientStyle};`;
    welcomeMsg.append(playerIDspan);

    // removing original account info
    document.querySelector('#shipyard section:nth-of-type(2) h3').classList.add('dnone');
    document.querySelector('#shipyard section:nth-of-type(2) p').classList.add('dnone');

    // adding new account info
    document.querySelector('#shipyard section:nth-of-type(2)').prepend(welcomeMsg);

    // ship list
    const nameInput = document.querySelector('#shipyard section:nth-of-type(3) p input');
    nameInput.setAttribute("placeholder", "Search By Name");
    nameInput.focus();
});

// observeNode(bigUiContainer, () => {
//     if(bigUiContainer.style.display === 'none') {
//         setTimeout(() => {
//             bigUiContainer.classList.add('dnone')
//         }, 300);
//     } else bigUiContainer.classList.remove('dnone')
// }, true, {childList: false, attributes: true, attributeFilter: ['style']});

observeNode(exit, () => {
    if (exit.style.display != 'none') {
        if(pingsBox) pingsBox.classList.remove('dnone');
        rejoin.classList.remove('dnone');
    } else {
        if(pingsBox) pingsBox.classList.add('dnone');
        rejoin.classList.add('dnone');
        document.querySelector('#copy_invite').classList.add('dnone');
        document.querySelector('#instant_save').classList.add('dnone');
        copterState = false;
        showPlayerListCooldown = false;
        if(playerID != '') {
            const mess = document.createElement('p');
            const messB = document.createElement('b');
            messB.textContent = `${playerID} (You) left the ship`;
            mess.append(messB);
            chatContent.append(mess);
        }
    }
}, true);
observeNode(manage, () => {
    if (manage.style.display == 'none') return;
    document.querySelector('#instant_save').classList.remove('dnone');
    document.querySelector('#copy_invite').classList.remove('dnone');
}, true);

chrome.storage.sync.get("key", function (result) {
    let arr = result.key;
    if (arr == null || arr.length != 6) arr = [1, "q", "r", "", "", ""];
    if (arr[0]) {
        document.addEventListener('keydown', async (event) => {
            if (!document.title.includes("- Deep")) {
                if (disconnectPopup.style.display === '' && event.key === 'Escape') Array.from(document.getElementsByTagName("button")).filter(btn => btn.innerText === "Return to Menu")[0].click();
                return
            }
            if (document.activeElement != document.body) {
                if (event.ctrlKey && event.key === "Enter") {
                    if (!langInput.value) return;
                    if(document.activeElement == chatInp) [chatInp.value, _] = await translate(chatInp.value, 'auto', langInput.value);
                    if(document.activeElement == commsInp) [commsInp.value, _] = await translate(commsInp.value, 'auto', langInput.value);
                }
                return;
            };
            const key = event.key.toUpperCase();
            if (!event.shiftKey && key === 'TAB') showPlayerList();
            if (event.shiftKey) {
                if (key === arr[1].toUpperCase()) exit.click();
                else if (key === arr[2].toUpperCase()) rejoin.click();
                else if (key === arr[5].toUpperCase()) switchTXT();
    
                if (!isCap()) return;
                if (key === 'ARROWDOWN') changeGravity(3);
                else if (key === 'ARROWUP') changeGravity(0);
                else if (key === 'ARROWLEFT') changeGravity(1);
                else if (key === 'ARROWRIGHT') changeGravity(2);
                else if (key === 'TAB') {
                    event.preventDefault();
                    manage.click();
                }
                else if (key === arr[3].toUpperCase()) zeroGravity();
                else if (key === arr[4].toUpperCase()) saveShip();
            }
        }, false);
    } else {
        document.addEventListener('keydown', async (event) => {
            if (!document.title.includes("- Deep")) {
                if (disconnectPopup.style.display === '' && event.key === 'Escape') Array.from(document.getElementsByTagName("button")).filter(btn => btn.innerText === "Return to Menu")[0].click();
                return
            }
            if (document.activeElement != document.body) {
                if (event.ctrlKey && event.key === "Enter") {
                    if (!langInput.value) return;
                    if(document.activeElement == chatInp) [chatInp.value, _] = await translate(chatInp.value, 'auto', langInput.value);
                    if(document.activeElement == commsInp) [commsInp.value, _] = await translate(commsInp.value, 'auto', langInput.value);
                }
                return;
            };
            const key = event.key.toUpperCase();
            if (!event.ctrlKey && key === 'TAB') showPlayerList();
            if (event.ctrlKey) {
                if (key === arr[1].toUpperCase()) exit.click();
                else if (key === arr[2].toUpperCase()) rejoin.click();
                else if (key === arr[5].toUpperCase()) switchTXT();
    
                if (!isCap()) return;
                if (key === 'ARROWDOWN') changeGravity(3);
                else if (key === 'ARROWUP') changeGravity(0);
                else if (key === 'ARROWLEFT') changeGravity(1);
                else if (key === 'ARROWRIGHT') changeGravity(2);
                else if (key === 'TAB') {
                    event.preventDefault();
                    manage.click();
                }
                else if (key === arr[3].toUpperCase()) zeroGravity();
                else if (key === arr[4].toUpperCase()) saveShip();

            }
        }, false);
    }
    document.addEventListener('keyup', async (event) => {
        if (!document.title.includes("- Deep") || document.activeElement != document.body) return;
        if(event.key === `'`) {
            keyToggleState["'"] = !keyToggleState["'"];
            if(keyToggleState["'"]) event.stopPropagation();
        }
        else if(event.key === `/`) {
            keyToggleState["/"] = !keyToggleState["/"];
            if(keyToggleState["/"]) event.stopPropagation();
        }
    })
});

var gravityShips = {};
chrome.storage.sync.get("gravity", function (result) {
    if(!result.gravity) return;
    for (const entry of result.gravity) gravityShips[`{${entry[0].toUpperCase()}}`] = parseInt(entry[1]);
});

var params = new URLSearchParams(location.search);
if (params.get('ship') != null) {
    params = (params.get('ship')).toUpperCase();
    observeNode(document.querySelector("#big-ui-container"), () => {
        document.querySelector('.window section:nth-of-type(3) p button').click()
        observeNode(shipYard, () => {
            if (document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
                document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
            } else {
                changeServer(0);
                observeNode(shipYard, () => {
                    if (document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
                        document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
                    } else {
                        changeServer(1);
                        observeNode(shipYard, () => {
                            if (document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
                                document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
                            } else {
                                changeServer(2);
                                if (document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
                                    document.evaluate(`//*[text()="{${params}}"]`, shipYard, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
                                } else {
                                    alert("There is no ship with ID you provided, check your spelling!")
                                }
                            }
                        });
                    }
                });
            }
        });
    });
}

function addCustomButtons() {
    chrome.storage.sync.get("buttons", function (result) {
        if (result.buttons == undefined) return;
        const colors = ['red', 'green', 'blue', 'grey', 'yellow', 'orange'];
        for(const [btn, options] of Object.entries(result.buttons)) {
            const nodePath = document.evaluate(`.//button[contains(., '${btn}')]`, buttonContainer, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const node = nodePath.singleNodeValue;
            if(!node) continue;
            if(!options[0]) {
                node.classList.add('hidden');
                continue;
            }
            const icon = node.querySelector('i');
            node.replaceChildren();
            if(!node.classList.contains(`btn-${options[1]}`)) {
                for(c of colors) node.classList.remove(`btn-${c}`)
                node.classList.add(`btn-${options[1]}`)
            }
            node.classList.add(`btn-${options[1]}`);
            node.append(icon, document.createTextNode(` ${options[2] ? options[2] : btn}`));
        }
    });
}

function addFavShips() {
    chrome.storage.sync.get("fav", function (result) {
        if (result.fav == undefined || result.fav.length == 0) return;
        const menu = document.querySelector('#shipyard > .window');
        const favShips = document.createElement('section');
        favShips.classList.add('fav-ships');
        const favName = document.createElement('h3');
        favName.textContent = 'Favourite ships';
        favShips.append(favName);
        menu.append(favShips);
        const favShipsBtn = document.createElement('select');
        favShipsBtn.classList.add('btn', 'btn-small', 'btn-darkBlue');
        const pc = document.createElement('option');
        pc.textContent = 'Fav Ships';
        favShipsBtn.append(pc);
        result.fav.forEach(nameID => {
            if(nameID[1] == 0) return;
            const favShip = document.createElement('div');
            favShip.textContent = `${nameID[0]} {${nameID[1].toUpperCase()}}`;
            favShip.style.background = `linear-gradient(${nameID[2]}, #000 200%)`;
            favShip.setAttribute("onclick", "window.open('https://drednot.io/?ship=" + nameID[1] + "');")
            favShips.append(favShip);

            const fb = document.createElement('option');
            fb.textContent = nameID[0];
            fb.value = nameID[1];
            favShipsBtn.append(fb);
        });
        favShipsBtn.oninput = function () {
            window.open(`https://drednot.io/?ship=${favShipsBtn.value}`);
            pc.selected = true;
        }
        if(result.fav.findIndex(b => b[1] == 0) == -1) topBar.append(favShipsBtn);
    });
}

function addChatPhrases() {
    chrome.storage.sync.get("word", function (result) {
        if (result.word == undefined || result.word.length == 0) return;
        const wordsBox = document.createElement('select');
        chatBox.append(wordsBox);
        const pc = document.createElement('option');
        pc.textContent = 'Words';
        wordsBox.append(pc);
        result.word.forEach(mess => {
            const cb = document.createElement('option');
            cb.textContent = mess[0];
            cb.value = mess[1];
            wordsBox.append(cb);
        });
        wordsBox.oninput = function () {
            sendChat(wordsBox.value);
            pc.selected = true;
        }
    });
}

function addEmergCall() {
    chrome.storage.sync.get("ping", function (result) {
        if (result.ping == undefined || result.ping.length == 0) return;
        pingsBox = document.createElement('select');
        pingsBox.classList.add('btn', 'btn-small', 'btn-blue');
        const pc = document.createElement('option');
        pc.textContent = 'Emergency';
        pingsBox.append(pc);
        result.ping.forEach(webh => {
            const pb = document.createElement('option');
            pb.textContent = webh[1];
            pb.value = result.ping.indexOf(webh);
            pingsBox.append(pb);
        });
        pingsBox.oninput = function () {
            const channel = result.ping[pingsBox.value];
            emergencyPing(channel[0], channel[2], channel[3]);
            pc.selected = true;
        }
        topBar.append(pingsBox);
    });
}

let lang = 'en';
function addChatTrans() {
    const translateButton = document.createElement('i');
    translateButton.classList.add('fas', 'fa-globe', 'btn-gray', 'btn');

    const langIn = document.createElement('input');
    langIn.id = 'lang-input';
    langIn.maxLength = 4;
    langIn.placeholder = 'en';
    chatBox.append(langIn);
    chatBox.append(translateButton);

    translateButton.onclick = async () => {
        if (!chatInp.value || !langIn.value) return;
        [chatInp.value, _] = await translate(chatInp.value, 'auto', langIn.value == "" ? 'en' : langIn.value);
    }

    const autoTransLabel = document.createElement('label');
    autoTransLabel.textContent = 'Auto Translate';
    const autoTrans = document.createElement('input');
    autoTrans.type = 'checkbox';
    autoTrans.id = 'opt_chat_translate';
    autoTrans.checked = false;
    autoTransLabel.prepend(autoTrans);
    document.querySelector('#chat > button + div').prepend(autoTransLabel);

    chrome.storage.sync.get("transl", function (result) {
        if (!result.transl) return;
        lang = result.transl[0];
        langIn.value = result.transl[1];
        autoTrans.checked = result.transl[2];
    });
}

chrome.storage.sync.get("colors", function (result) {
    let colors;
    if (result.colors == null) {
        colors = ['#000000', '#b7b7b7', '4d'];
    } else
        colors = result.colors;
    document.body.style.setProperty('--scrollTrack', `${colors[0]}${colors[2]}`);
    document.body.style.setProperty('--scrollThumb', colors[1]);
});

chrome.storage.sync.get("ui", function (result) {
    if (result.ui == null) return;
    var rgb = [
        parseInt(result.ui[0].substr(-6, 2), 16),
        parseInt(result.ui[0].substr(-4, 2), 16),
        parseInt(result.ui[0].substr(-2), 16)
    ];
    const bgColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${result.ui[1]})`;
    const r = rgb[0] * 0.2126;
    const g = rgb[1] * 0.7152;
    const b = rgb[2] * 0.0722;
    const lightness = (r + g + b) / 255;

    document.body.style.setProperty('--ui', bgColor);
    document.body.style.setProperty('--luma', (0.5 - lightness) * 100000 + '%');
});

function addRejoin() {
    const rejoinB = document.createElement('button');
    const rejoinBtnIcon = document.createElement('i');
    rejoinBtnIcon.classList.add('fas', 'fa-sync');
    rejoinB.append(rejoinBtnIcon);
    rejoinB.append(document.createTextNode(' Rejoin Ship'));
    rejoinB.classList.add('btn-small', 'btn-orange', 'dnone');
    rejoinB.setAttribute("id", "rejoin_button");
    rejoinB.onclick = function () {
        if (document.title.includes("- Deep")) {
            exit.click();
            rejoinShip(cShip);
        }
    }
    buttonContainer.insertBefore(rejoinB, exit);
}

function rejoinShip(name) {
    const target = [...document.querySelectorAll('.sy-id')].filter(x => x.textContent == name)[0];
    if(target) return target.click();
    document.querySelector('#shipyard section:nth-of-type(3) .btn-small').click();
    setTimeout(() => {
        target.click();
    }, 500);
}

//chat observer
observeNode(chatContent, () => {
    const mess = document.querySelector("#chat-content > p:last-of-type");
    if (!mess) return;
    if (mess.textContent.includes("Joined ship '")) {
        cShip = mess.textContent.match(/{[A-Z\d]+}/)[0];
        if (isCap() && gravityShips.hasOwnProperty(cShip)) changeGravity(gravityShips[cShip]);
    }
    highlightAFK();
    addTimeStamp(mess);
    if (chatTranslate.checked) translateChatMessage(mess);
    else mess.addEventListener("dblclick", () => { translateChatMessage(mess) }, { once: true });
    convertInvite(mess);
    if (isCap()) addPlayer(mess);
    if(mess.textContent.includes('Do The Roar!') && !mess.textContent.includes(playerID)) sendFunnyChat('roar');
}, true, { childList: true, attributes: false, subtree: false });

//comms observer
observeNode(commsContent, () => {
    const mess = document.querySelector("#comms-text > p:last-of-type");
    if (!mess) return;
    else mess.addEventListener("dblclick", () => { translateCommsMessage(mess) }, { once: true });
    convertCommsInvite(mess);
}, true, { childList: true, attributes: false, subtree: false });


async function convertInvite(mess) {
    let link;
    if (link = mess.textContent.match(/https:\/\/.{0,5}drednot\.io\/invite\/[A-z0-9-_]{24}/)) {
        if(mess.querySelector('code.copy-box')) return;
        const playerContent = mess.textContent.replace(/https:\/\/.{0,5}drednot\.io\/invite\/[A-z0-9-_]{24}/, '');
        const messB = mess.querySelector('b');
        const messContent = document.createElement('span');
        messContent.textContent = playerContent.slice(playerContent.indexOf(': ') + 2);
        mess.replaceChildren();
        mess.append(messB, messContent);
        if (document.URL.includes('test') ^ link[0].includes('test')) {
            const d = generateInviteCard(`Invitation to ${link[0].slice(8, -32)} ship.`, link);
            d.classList.add('invite-container');
            mess.appendChild(d);
        } else {
            try {
                const response = await fetch(link[0], { redirect: 'error' });
                const html = await response.text();
                const parser = new DOMParser();
                const meta = parser.parseFromString(html, "text/html").querySelectorAll("meta[property]");
                const d = generateInviteCard(`Invitation to ${meta[0].getAttribute('content').slice(8, -13)}`, link);
                
                const d2 = document.createElement('div');
                d2.classList.add('invite-container');
                const img = new Image();
                img.src = meta[4].getAttribute('content');
                img.onerror = function () { this.src = '/x/asset.2jrQzPpjHFBAjBV0wwRh.png'; }
                d2.appendChild(img);
                d2.appendChild(d);
                mess.appendChild(d2);
            } catch (er) {
                const d = generateInviteCard(`Invitation is broken or goes to LABS.`, link);
                d.classList.add('invite-container');
                mess.appendChild(d);
            }
        }
        if(chatBox.classList.contains('closed')) chatContent.scrollTop = chatContent.scrollHeight;
    }
}

async function convertCommsInvite(mess) {
    let link;
    if (link = mess.textContent.match(/https:\/\/.{0,5}drednot\.io\/invite\/[A-z0-9-_]{24}/)) {
        const playerContent = mess.textContent.replace(/https:\/\/.{0,5}drednot\.io\/invite\/[A-z0-9-_]{24}/, '');
        const messBdi = mess.querySelector('bdi');
        const messContent = document.createElement('data');
        messContent.textContent = `: ${playerContent.slice(playerContent.indexOf(': ') + 2)}`;
        mess.replaceChildren();
        mess.append(messBdi, messContent);
        if (document.URL.includes('test') ^ link[0].includes('test')) {
            const d = generateInviteCard(`Invitation to ${link[0].slice(8, -32)} ship.`, link);
            d.classList.add('invite-container');
            mess.appendChild(d);
        } else {
            try {
                const response = await fetch(link[0], { redirect: 'error' });
                const html = await response.text();
                const parser = new DOMParser();
                const meta = parser.parseFromString(html, "text/html").querySelectorAll("meta[property]");
                const d = generateInviteCard(`Invitation to ${meta[0].getAttribute('content').slice(8, -13)}`, link);

                const d2 = document.createElement('div');
                d2.classList.add('invite-container');
                const img = new Image();
                img.src = meta[4].getAttribute('content');
                img.onerror = function () { this.src = '/x/asset.2jrQzPpjHFBAjBV0wwRh.png'; }
                d2.appendChild(img);
                d2.appendChild(d);
                mess.appendChild(d2);
            } catch (er) {
                const d = generateInviteCard(`Invitation is broken or goes to LABS.`, link);
                d.classList.add('invite-container');
                mess.appendChild(d);
            }
        }
        commsContent.scrollTop = commsContent.scrollHeight;
    }
}

function generateInviteCard(text, url) {
    const inviteD = document.createElement('div');
    const inviteB = document.createElement('b');
    const inviteP = document.createElement('p');
    inviteP.textContent = text;
    inviteB.append(inviteP);
    const inviteButtons = document.createElement('p');
    inviteButtons.append(document.createTextNode('Open in:'));
    const inviteContent = [['New tab', 'red'], ['This tab', 'blue'], ['Copy', 'orange']];
    inviteContent.forEach((b) => {
        const inviteBtn = document.createElement('a');
        inviteBtn.classList.add('btn', `btn-${b[1]}`);
        // const inviteA = document.createElement('a');
        inviteBtn.textContent = b[0];
        if(b[0] != 'Copy') inviteBtn.href = url;
        else inviteBtn.onclick = () => navigator.clipboard.writeText(url);
        if(b[0] == 'New tab') inviteBtn.setAttribute('target', '_blank');
        // inviteBtn.append(inviteA);
        inviteButtons.append(inviteBtn);
    })
    inviteD.append(inviteB, inviteButtons);
    return inviteD;
}

async function translateChatMessage(p) {
    const text = p.textContent;
    if (text.indexOf(': ') == -1) return;
    const t = text.slice(text.indexOf(': ') + 2);
    if (!t) return;
    try {
        const [trans, origin] = await translate(t, 'auto', lang);
        const messIcon = document.createElement('i');
        messIcon.classList.add('fas' ,'fa-globe');
        const messBdi = p.querySelector('b');
        const messTrans = document.createElement('span');
        messTrans.setAttribute('data-trans', '');
        messTrans.textContent = trans;
        const messPre = document.createElement('pre');
        messPre.textContent = `${origin}: ${t.replaceAll('"', "&quot;")}`;
        messPre.onclick = () => { langInput.value = origin; }
        p.replaceChildren();
        p.append(messBdi, messIcon, messTrans, messPre);
        if (isCap()) addPlayer(p);
    } catch { return; }
}

async function translateCommsMessage(p) {
    const text = p.textContent;
    const t = text.slice(text.indexOf(': ') + 2);
    if (!t) return;
    try {
        const [trans, origin] = await translate(t, 'auto', lang);
        const messBdi = p.querySelector('bdi');
        const messTrans = document.createElement('data');
        messTrans.setAttribute('data-trans', '');
        messTrans.textContent = `: ${trans}`;
        const messPre = document.createElement('pre');
        messPre.textContent = `${origin}: ${t.replaceAll('"', "&quot;")}`;
        // messPre.onclick = () => { langInput.value = origin; }
        p.replaceChildren();
        p.append(messBdi, messTrans, messPre);
    } catch { return; }
}

function translate(text, from = 'auto', to = 'en') {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURI(text)}`;
    return new Promise((res, rej) => {
        fetch(url)
            .then(res => res.json())
            .then(out => {
                if (!out[0] || out[2] == to) rej('erorred');
                res([out[0].map(subarray => subarray[0]).join('\n'), out[2]]);
            })
            .catch(err => rej(err));
    });
}

function highlightAFK() {
    if (document.visibilityState === 'hidden') {
        if(document.querySelector("#chat-content .recent:last-of-type"))
            document.querySelector("#chat-content .recent:last-of-type").setAttribute('data-miss', 1)
    }
}

function addTimeStamp(mess) {
    const n = new Date();
    const f = n.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    mess.setAttribute('data-time', f);
}

const playerBox = document.createElement('div');
playerBox.id = 'chat-manage';
playerBox.classList.add('tip-list')
playerBox.setAttribute('tabindex', '0');
const plName = document.createElement('span');
plName.textContent = '--';
playerBox.appendChild(plName);
const plCap = document.createElement('div');
plCap.addEventListener('click', () => { promote(chosenPlayer, 3) });
plCap.textContent = 'Captain';
plCap.classList.add('cyan');
playerBox.appendChild(plCap);
const plCrew = document.createElement('div');
plCrew.addEventListener('click', () => { promote(chosenPlayer, 1) });
plCrew.textContent = 'Crew';
plCrew.classList.add('yellow');
playerBox.appendChild(plCrew);
const plGuest = document.createElement('div');
plGuest.addEventListener('click', () => { promote(chosenPlayer, 0); });
plGuest.textContent = 'Guest';
playerBox.appendChild(plGuest);

const plKick = document.createElement('div');
plKick.addEventListener('click', () => {
    sendChat(`/kick ${chosenPlayer}`);
});
plKick.textContent = 'Kick';
playerBox.appendChild(plKick);
const plBan = document.createElement('div');
plBan.addEventListener('click', () => {
    sendChat(`/ban ${chosenPlayer}`);
});
plBan.textContent = 'Ban';
plBan.classList.add('red');
playerBox.appendChild(plBan);
chatBox.appendChild(playerBox);
var chosenPlayer = null;


function addPlayer(mess) {
    const bdi = mess.querySelector('bdi');
    if (!bdi) return;
    bdi.classList.add('pointer');
    bdi.addEventListener('click', e => {
        if(chatBox.classList.contains('closed')) chatBtn.click();
        chosenPlayer = bdi.textContent;
        plName.textContent = chosenPlayer;
        const chatCoords = chatBox.getBoundingClientRect();
        playerBox.style.left = `${e.clientX - chatCoords.x + 10}px`;
        playerBox.style.bottom = `${chatCoords.height - e.clientY + chatCoords.y + 10}px`;
        playerBox.focus();
    });
}

async function promote(user, rank) {
    manage.click();
    tmenu.classList.add('hidden');
    if(!document.querySelector('#team_players_inner tbody'))
        await swapManager(1);
    observeNode(document.querySelector('#team_players_inner tbody'), () => {
        const s = document.querySelectorAll('#team_players_inner td > code');
        if (s) {
            const el = [...s].find(e => e.textContent == user);
            if (!el) return;

            const select = el.parentElement.parentElement.querySelector('select');
            if (select) {
                select.value = rank;
                select.dispatchEvent(new Event('change'));
            }
        }
        setTimeout(() => {
            tmenu.classList.remove('hidden');
            manage.click();
        }, 250);
    });
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState == 'hidden') return;
    keyToggleState["'"] = keyToggleState["/"] = false;
    document.querySelectorAll('#chat-content [data-miss]').forEach(e => {
        setTimeout(() => { e.removeAttribute('data-miss'); }, 5000);
    });
})

// chat expand bar
const chatExpand = document.createElement('div');
chatExpand.textContent = '⋯';
chatExpand.classList.add('chat-expand');
// chatExpand.setAttribute('draggable', 'true');

let yStart = 0, deltaH = 0, chatMaxHeight = parseInt(getComputedStyle(chatContent).maxHeight), 
chatMinMaxHeight = 50;
chatExpand.addEventListener("mousedown", (e) => {
    yStart = e.clientY;
    chatBox.classList.add('resizing');

    document.addEventListener("mousemove", resizeChatEvent);
    document.addEventListener("mouseup", () => {
        chatBox.classList.remove('resizing');
        document.removeEventListener("mousemove", resizeChatEvent);
    }, {once: true});
});

function resizeChatEvent(e) {
    e.preventDefault();
    chatMaxHeight = parseInt(getComputedStyle(chatContent).maxHeight)
    deltaH = yStart - e.clientY;
    yStart = e.clientY;
    chatMaxHeight += deltaH;
    if(chatMaxHeight < chatMinMaxHeight) chatMaxHeight = chatMinMaxHeight;
    else if(chatMaxHeight > chatContent.getBoundingClientRect().bottom) chatMaxHeight = chatContent.getBoundingClientRect().bottom;
    chatBox.style.setProperty('--chat-max-height', `${chatMaxHeight}px`);
    chatContent.scrollTop = chatContent.scrollHeight
}

function resizeChat() {
    chatBox.style.setProperty('--chat-max-height', `${chatMaxHeight}px`);
    chatContent.scrollTop = chatContent.scrollHeight
}
chrome.storage.sync.get("chatmaxheight", function (result) {
    if(result.chatmaxheight) {
        chatMaxHeight = parseInt(result.chatmaxheight);
        resizeChat();
    }
});



chatBox.prepend(chatExpand);


manage.addEventListener('click', () => {managerPro();})

function managerPro() {
    if (document.getElementById("team_players")) {
        addCopter();
        addStats();
        // document.querySelector('#team_menu .close button').addEventListener('click', () => {document.activeElement.blur();})
    }
    if (document.querySelector("#team_players_inner")) {
        observeNode(document.querySelector("#team_players_inner"), () => { countCrews() }, true);
    }
    if (Fmanager) return;
    Fmanager = true;
    document.querySelectorAll('#team_menu div div:nth-of-type(2) button')[0].onclick = function () { manager = false }
    document.querySelectorAll('#team_menu div div:nth-of-type(2) button')[1].onclick = function () { manager = true; managerPro(); countCrews(); }
}

// fixing blur issue
observeNode(tmenu, () => {
    if(tmenu.style.display === 'none') document.activeElement.blur();
}, true, {childList: false, attributes: true, attributeFilter: ['style']});

function swapManager(x) {
    return new Promise((res, rej) => {
        if (document.querySelectorAll('#team_menu div div:nth-of-type(2) button')[x].classList.contains('btn-green')) res(true);
        document.querySelectorAll('#team_menu div div:nth-of-type(2) button')[x].click();
        observeNode(tmenu, () => {
            res(true);
        });
    });
}

function addCopter() {
    if (document.getElementById("btn-copter")) return;
    const snakefly = document.createElement('button')
    snakefly.classList.add("btn-purple");
    snakefly.setAttribute("id", "btn-copter");
    snakefly.onclick = function () { zeroGravity(); }
    snakefly.textContent = "Snakecopter";
    document.getElementById("team_players").insertAdjacentElement('beforeEnd', snakefly);
}

var copterState = false, durin = false;
async function zeroGravity() {
    if (!manager)
        await swapManager(1);
    if (copterState) {
        clearTimeout(durin);
        return copterState = false;
    }
    const inp = document.querySelector("#team_players input");
    inp.value = 'coolsnake303';
    inp.dispatchEvent(new Event('input'));
    const order = [1, 0, 2, 3];
    chrome.storage.sync.get("dur", function (result) {
        let buttons = document.querySelectorAll("tr .btn-meme");
        copterState = true;
        durin = setTimeout(() => { copterState = false; }, result.dur == null ? 10000 : result.dur);
        let times = 0;
        let time = setInterval(() => {
            times == 0 ? times = 3 : times--;
            buttons[order[times % 4]].click();
            if (!copterState) {
                setTimeout(() => {
                    buttons[3].click();
                    inp.value = '';
                    inp.dispatchEvent(new Event('input'));
                }, 300);
                clearInterval(time);
            }
        }, 10);
    });
}

function addStats() {
    if (document.getElementById("stats")) return;
    const stats = document.createElement("span");
    stats.id = "stats";
    stats.style.display = 'block';
    document.getElementById("team_players").insertAdjacentElement('beforeEnd', stats);
}

function addInstantSave() {
    const saveBtn = document.createElement('button');
    saveBtn.classList.add('btn-small', 'btn-red', 'dnone');
    saveBtn.id = 'instant_save';
    const saveBtnIcon = document.createElement('i');
    saveBtnIcon.classList.add('fas', 'fa-save');
    saveBtn.append(saveBtnIcon);
    saveBtn.append(document.createTextNode(' Save'));
    saveBtn.onclick = function () { saveShip() }
    buttonContainer.prepend(saveBtn);
}

function saveShip() {
    sendChat('/save');
    observeNode(disconnectPopup, () => {
        Array.from(document.getElementsByTagName("button")).filter(btn => btn.innerText === "Return to Menu")[0].click()
        setTimeout(() => {    
            document.querySelector('#shipyard section:nth-of-type(3) .btn-small').click();
        }, 400);
    });
}

function addCopyInvite() {
    const inviteBtn = document.createElement('button');
    inviteBtn.classList.add('btn-small', 'btn-purple', 'dnone');
    inviteBtn.id = 'copy_invite';
    const inviteBtnIcon = document.createElement('i');
    inviteBtnIcon.classList.add('fas', 'fa-copy');
    inviteBtn.append(inviteBtnIcon);
    inviteBtn.append(document.createTextNode(' Invite'));
    inviteBtn.onclick = function () { sendChat('/invite'); }
    buttonContainer.prepend(inviteBtn);
}

observeNode(disconnectPopup, () => {
    const n = new Date();
    const f = n.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    disconnectPopup.querySelector('h2').textContent = `DISCONNECTED [at ${f}]`;
    if(disconnectPopup.querySelector('p .btn-white')) return;

    const btnRejoin = document.createElement('button');
    btnRejoin.classList.add('btn', 'btn-small', 'btn-orange');
    btnRejoin.textContent = 'Try to rejoin';
    btnRejoin.onclick = function () {
        disconnectPopup.querySelector('p button').click();
        rejoinShip(cShip);
    }
    disconnectPopup.querySelector('p').append(btnRejoin);

    const btnQuickChat = document.createElement('button');
    btnQuickChat.classList.add('btn', 'btn-small', 'btn-white');
    btnQuickChat.textContent = 'Open Chat';
    btnQuickChat.onclick = function () {
        chatBtn.click();
    }
    disconnectPopup.querySelector('p').append(btnQuickChat);

}, true, { childList: false, attributes: true, subtree: false });

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

var fileEvent;
chrome.storage.local.get("txt", function (result) {
    if (result.txt == null) {
        fetch(chrome.runtime.getURL("shrekPack.zip"))
            .then(res => res.blob())
            .then(blob => {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(new File([blob], 'txt.zip', { type: "application/x-zip-compressed" }));
                fileEvent = new DragEvent('drop', { dataTransfer })
            });
        return;
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(base64ToFile(result.txt));
    fileEvent = new DragEvent('drop', { dataTransfer });
});

function switchTXT() {
    if (!fileEvent) return;
    if (localStorage.getItem("txt") == undefined) localStorage.setItem("txt", 'f');
    if (localStorage.getItem("txt") == 't') {
        localStorage.setItem("txt", 'f');
        document.evaluate('//button[text()=" Settings"]', tmenu, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
        document.evaluate('//button[text()="Modify Assets"]', tmenu, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
        document.evaluate('//button[text()="Clear X"]', tmenu, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
        document.evaluate('//button[text()="Okay"]', document.querySelector(".modal-container"), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
        document.querySelector("#new-ui-left button").click();
    } else {
        localStorage.setItem("txt", 't');
        window.dispatchEvent(fileEvent);
        document.evaluate('//button[text()="Okay"]', document.querySelector(".modal-container"), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
    }
}

function addBtnServer() {
    const serverSection = document.querySelector("#shipyard section:nth-of-type(1)");
    const options = document.querySelectorAll("#shipyard select option");
    const servBtns = [];
    const servStats = [];

    options.forEach((server, index) => {
        const serverData = getServerData(server.textContent);
        const serverBox = document.createElement('div');
        serverBox.classList.add('server-box', 'server-offline');
        const serverHeader = document.createElement('h4');
        serverHeader.textContent = serverData[1];
        serverBox.onclick = () => { changeServer(index) };

        const serverUsers = document.createElement('p');
        const serverPing = document.createElement('p');
        serverUsers.textContent = '';
        serverPing.textContent = 'Loading...';

        serverBox.append(serverHeader, serverUsers, serverPing);
        serverSection.insertAdjacentElement('beforeEnd', serverBox);
        servBtns.push(serverBox);
        servStats.push(serverUsers, serverPing);
    });
    
    serverSection.querySelectorAll("#shipyard section:nth-of-type(1) div")[JSON.parse(localStorage.getItem("dredark_user_settings")).preferred_server].classList.add("server-selected");

    observeNode(document.querySelector("#shipyard section:nth-of-type(1) select"), () => {
        for (let i = 0; i < servBtns.length; i++) {
            const info = getServerData(options[i].textContent);
                        
            if (info[2] === 'No Response') {
                servBtns[i].classList.add('server-offline');
                servBtns[i].style = `--server-box-fill: 100%`;
                servStats[i * 2].textContent = 'No Response';
                servStats[i * 2 + 1].textContent = '';
            } else {
                servBtns[i].classList.remove('server-offline');

                const users = info[2].split(' / ');
                const fill = parseInt(users[0]) / parseInt(users[1]) * 100;
                servBtns[i].style = `--server-box-fill: ${fill}%`;
                servStats[i * 2].textContent = info[2];
                servStats[i * 2 + 1].textContent = info[3];
            }
        }
    }, true);
}

const getServerData = (text) => {
    const serverData = text.split(' - ');
    return serverData;
}

function changeServer(server) {
    document.querySelectorAll("#shipyard select option")[server].selected = 'selected';
    document.querySelector("#shipyard select").dispatchEvent(new Event('change'));
    document.querySelectorAll("#shipyard section:nth-of-type(1) div").forEach(element => {
        element.classList.remove("server-selected");
    });
    document.querySelectorAll("#shipyard section:nth-of-type(1) div")[server].classList.add("server-selected");
}

function countCrews() {
    if (!document.getElementById("stats")) return;
    let count = [0, 0, 0, 0];
    document.querySelectorAll("#team_players_inner select").forEach(s => {
        count[s.value]++;
    });
    document.querySelectorAll("#team_players_inner b[style='color: cyan;']").forEach(function () { count[3]++; })
    document.querySelectorAll("#team_players_inner b[style='color: red;']").forEach(function () { count[2]++; })
    const crewCount = [['Captains', 'cyan', count[3]], ['Crews', 'yellow', count[1]], ['Guests', 'white', count[0]], ['Banned', 'red', count[2]]];
    const stats = document.getElementById("stats");
    const crewChildren = [];
    crewCount.forEach(el => {
        const b = document.createElement('b');
        b.textContent = ` ${el[0]}: ${el[2]}`;
        b.style.color = el[1];
        crewChildren.push(b);
    });
    stats.replaceChildren(...crewChildren);
}

let showPlayerListCooldown = false;

function showPlayerList() {
    if (showPlayerListCooldown) return;
    showPlayerListCooldown = true;

    if (chatBox.classList.contains('closed')) chatBtn.click();
    chatInp.value = '/kick ';
    chatInp.dispatchEvent(new Event('input'));
    const players = [...document.querySelectorAll('#chat-autocomplete p')];
    document.querySelector('#chat-close').click();
    const playerList = document.createElement('p');
    playerList.classList.add('recent');
    const plListB = document.createElement('b');
    playerList.append(plListB);
    chatContent.append(playerList);

    let cooldown = 10000;
    if(players.length === 0) {
        plListB.textContent = `It's only you here.`;
        cooldown = 1000;
    }
    else {
        plListB.textContent = `There are ${players.length} more players in the ship:`;
        const plListUl = document.createElement('ul');
        for(let player of players){
            const plListLi = document.createElement('li');
            const plListBdi = document.createElement('bdi');
            plListBdi.textContent = player.textContent;
            plListLi.append(plListBdi);
            plListUl.append(plListLi);
            if (isCap()) addPlayer(plListLi);
        }
        playerList.append(plListUl);
    }
    setTimeout(() => {
        playerList.classList.remove('recent');
        showPlayerListCooldown = false;
    }, cooldown)
    if(chatBox.classList.contains('closed')) chatContent.scrollTop = chatContent.scrollHeight;
}

async function changeGravity(direction) {
    if (!manager) {
        await swapManager(1);
    }
    const inp = document.querySelector("#team_players input")
    inp.value = 'coolsnake303';
    inp.dispatchEvent(new Event('input'));
    observeNode(document.querySelector('#team_players_inner table'), () => {
        document.querySelectorAll("tr .btn-meme")[direction].click();
        inp.value = '';
        inp.dispatchEvent(new Event('input'));
    });
}


async function emergencyPing(url, mess, uname) {
    if (!document.title.includes("- Deep")) return;
    let invite = false;
    if (isCap()) {
        manage.click();
        tmenu.classList.add('hidden');
        if (manager) {
            await swapManager(0);
        }
        invite = document.querySelector('.copy-box').textContent;
        manage.click();
        setTimeout(() => {
            tmenu.classList.remove('hidden');
        }, 250)
    }
    let embImg = 'https://cardinalwiseman.coventry.sch.uk/wp-content/uploads/sites/2/2020/03/sign-with-the-word-help-in-a-hand-icon-vector-9381725.png';
    if(invite){
        const response = await fetch(invite, { redirect: 'error' });
        const html = await response.text();
        const parser = new DOMParser();
        const meta = parser.parseFromString(html, "text/html").querySelectorAll("meta[property]");
        if (meta[0].getAttribute('content') != 'Deep Space Airships')
            embImg = meta[4].getAttribute('content')
    }

    const pings = [...mess.matchAll(/(<@\d+>)|@here|@everyone/g)].map(x => x[0]).join(' ')
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: uname,
            embeds: [
                {
                    color: 15105570,
                    title: 'Help required!',
                    ...(invite && { url: invite }),
                    description: mess,
                    fields: [
                        {
                            name: 'Ship:',
                            value: `${document.title.slice(0, -22)} ${cShip}`,
                        }
                    ],
                    ...(invite && {
                        footer: {
                            text: 'click title to join the ship',
                        }
                    }),
                    thumbnail: {
                        url: embImg
                    }
                },
            ],
            ...(pings && { content: `||${pings}|| Come help!` }),
        })
    });
}

function sendChat(mess) {
    if (chatBox.classList.contains('closed')) chatBtn.click();
    chatInp.value = mess;
    chatBtn.click();
}

var chatTimeLimit = 60000, chatLastTime = 0;
function sendFunnyChat(mess) {
    if(chatLastTime + chatTimeLimit >= Date.now()) return;
    chatLastTime = Date.now()
    if (chatBox.classList.contains('closed')) {
        chatBtn.click();
        chatInp.value = mess;
        chatBtn.click();
    }
}

function isTest() {
    return window.location.href.includes('test');
}

function isCap() {
    return manage.getAttribute("style") == "";
}