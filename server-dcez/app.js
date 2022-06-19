const express = require('express');
const app = express();
const onlysvg = express();
const fs = require('fs');

const { Client, Intents, Collection } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors');
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
    }
})

io.on("connection", (socket) => {
    console.log(`a user connected ${socket.id}`)

    socket.on("user", function (data) {
        const main_user = data.userid
        const about = data.about
        let member 
        try {
           member = client.guilds.cache.get('782646778347388959').members.cache.get(data.userid);
        } catch (error) {
            console.log(error)
        }
        let activity
        try {
            if(member.presence.activities[0].id === 'custom' && !member.presence.activities[1]){
                no_activity()
            } else if (member.presence.activities[0].id === 'custom' || member.presence.activities[0].type === 'CUSTOM') {
                activity = member.presence.activities[1];
            } else {
                try {
                    activity = member.presence.activities[0];
                } catch (error) {
                    no_activity()
                    return;
                }
            }
        } catch (e) {
            function no_activity() {
                console.log(`${data.userid} has no activity`)
            }
            no_activity()
            return;
        }

        let discord_avatar, username, banner

        let play_along, spotify_logo

        let name, details, state, smallimg, raw, largeText

        if(!activity.name){
            name = 'No name'
        } else {
            name = activity.name.replace(/&/g, '&amp;');
            if (name.length > 23) {
                name = name.substring(0, 23) + '...';
            }
        }
        
        if(!activity.details){
            details = 'No details'
        } else {
            details = activity.details.replace(/&/g, '&amp;');
            if (details.length > 23) {
                details = details.substring(0, 23) + '...';
            }
        }

        if(!activity.state){
            state = 'No description'
        } else {
            state = activity.state.replace(/&/g, '&amp;');
            if (state.length > 23) {
                state = state.substring(0, 23) + '...';
            }
        }

        if(!activity.assets){
            largeText = req.query.large_text || 'No large text'
        } else if(activity.assets.largeText === null) {
            largeText = req.query.large_text || 'No large text'
        } else {
            largeText = activity.assets.largeText.replace(/&/g, '&amp;');
            if (largeText.length > 23) {
                largeText = largeText.substring(0, 23) + '...';
            }
        }
        
        if(!activity.assets){
            raw = discord_avatar
        } else if(activity.assets.smallImage === null) {
            raw = discord_avatar
        } else if(activity.assets.smallImage.startsWith('mp:external')){
            smallimg = activity.assets.smallImage
            let smalllink = smallimg.split('https/')[1]
            raw = 'https://' + smalllink
        } else {
            raw = discord_avatar   
        }

        try {
            discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true})
            spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'
            username = member.user.username + '#' + member.user.discriminator
            banner = data.banner || 'https://cdn.discordapp.com/attachments/970974282681307187/987323350709862420/green-back.png'

            play_along = "https://cdn.discordapp.com/attachments/970974282681307187/987330240609132555/play-along.png"
        } catch (e) {
            console.log(e)
            return;
        }

        let temp;
        if (activity.name === 'Spotify') {
            let start = activity.timestamps.start
            let end = activity.timestamps.end
            let elapsed = end - start
            let minutes = Math.floor(elapsed / 60000)
            let seconds = Math.floor((elapsed % 60000) / 1000)
            let timeString = `${minutes}:${seconds}` 

            let time = 0;

            temp = fs.readFileSync('./assets/spotify-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);

            temp = temp.replace('[play-along]', play_along);

            temp = temp.replace('[details]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[on]', largeText);
            temp = temp.replace('[time]', time + ' -- ' + timeString);
            temp = temp.replace('[pfp]', discord_avatar);       
            temp = temp.replace('[large-image]', discord_avatar);
            temp = temp.replace('[small-image]', spotify_logo);
            temp = temp.replace('[spotify-logo]', spotify_logo);
            temp = temp.replace('[button-text]', "Play on Spotify");
        } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code') {

            let time = activity.timestamps.start;
            let elapsed = Date.now() - time;
            let hours = Math.floor(elapsed / 3600000);
            let minutes = Math.floor((elapsed % 3600000) / 60000);
            let seconds = Math.floor((elapsed % 60000) / 1000);
            let timeString = `${hours}:${minutes}:${seconds}`;
            
            const largeimage = activity.assets.largeImage
            let largelink = largeimage.split('raw')[1]
            const rawlarge = 'https://raw' + largelink

            const smallimage = activity.assets.smallImage
            let smallink = smallimage.split('raw')[1]
            const rawsmall = 'https://raw' + smallink

            temp = fs.readFileSync('./assets/vscode-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', discord_avatar);

            temp = temp.replace('[name]', activity.name);
            temp = temp.replace('[details]', activity.details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[time]', timeString + ' elapsed');
            temp = temp.replace('[large-image]', rawlarge);
            temp = temp.replace('[small-image]', rawsmall);
            temp = temp.replace('[button-text]', activity.buttons[0] || 'View Repository');
        } else if (activity.type === 'PLAYING') {
    
            let time = activity.timestamps.start;
            let elapsed = Date.now() - time;
            let hours = Math.floor(elapsed / 3600000);
            let minutes = Math.floor((elapsed % 3600000) / 60000);
            let seconds = Math.floor((elapsed % 60000) / 1000);
            let timeString = `${hours}:${minutes}:${seconds}`;

            temp = fs.readFileSync('./assets/game-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', discord_avatar);
    
            temp = temp.replace('[name]', name || 'Gaming');
            temp = temp.replace('[details]', details || 'No details');
            temp = temp.replace('[state]', state || 'No description');
            temp = temp.replace('[type]', activity.type || 'PLAYING');
            temp = temp.replace('[large-image]', raw);
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');
        }

        let base64
        try {
            base64 = Buffer.from(temp).toString('base64');
        } catch (error) {
            console.log(error)
        }

        io.emit("message", {
            stuff: activity,
            card: temp,
            baseimg: base64
        })

        function getActivity() {
            const member = client.guilds.cache.get('782646778347388959').members.cache.get(data.userid);
            let activity
            try {
                if (member.presence.activities[0].id === 'custom' || member.presence.activities[0].type === 'CUSTOM') {
                    activity = member.presence.activities[1];
                } else {
                    try {
                        activity = member.presence.activities[0];
                        // console.log(activity)
                    } catch (error) {
                        res.send('No activity')
                        return;
                    }
                }
            } catch (e) {
                console.log(e)
                return;
            }

            let name, details, state, smallimg, raw, largeText

            if(!activity.name){
                name = 'No name'
            } else {
                name = activity.name.replace(/&/g, '&amp;');
                if (name.length > 23) {
                    name = name.substring(0, 23) + '...';
                }
            }
            
            if(!activity.details){
                details = 'No details'
            } else {
                details = activity.details.replace(/&/g, '&amp;');
                if (details.length > 23) {
                    details = details.substring(0, 23) + '...';
                }
            }

            if(!activity.state){
                state = 'No description'
            } else {
                state = activity.state.replace(/&/g, '&amp;');
                if (state.length > 23) {
                    state = state.substring(0, 23) + '...';
                }
            }

            if(!activity.assets){
                largeText = req.query.large_text || 'No large text'
            } else if(activity.assets.largeText === null) {
                largeText = req.query.large_text || 'No large text'
            } else {
                largeText = activity.assets.largeText.replace(/&/g, '&amp;');
                if (largeText.length > 23) {
                    largeText = largeText.substring(0, 23) + '...';
                }
            }

            if(!activity.assets){
                raw = discord_avatar
            } else if(activity.assets.smallImage === null) {
                raw = discord_avatar
            } else if(activity.assets.smallImage.startsWith('mp:external')){
                smallimg = activity.assets.smallImage
                let smalllink = smallimg.split('https/')[1]
                raw = 'https://' + smalllink
            } else {
                raw = discord_avatar   
            }

            let temp;
            if (activity.name === 'Spotify') {
                let start = activity.timestamps.start
                let end = activity.timestamps.end
                let elapsed = end - start
                let minutes = Math.floor(elapsed / 60000)
                let seconds = Math.floor((elapsed % 60000) / 1000)
                let timeString = `${minutes}:${seconds}` 

                let time = 0;

                temp = fs.readFileSync('./assets/spotify-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner);
                temp = temp.replace('[about]', about);
        
                temp = temp.replace('[play-along]', play_along);
        
                temp = temp.replace('[details]', details);
                temp = temp.replace('[state]', state);
                temp = temp.replace('[type]', activity.type);
                temp = temp.replace('[on]', largeText);
                temp = temp.replace('[time]', time + ' -- ' + timeString);
                temp = temp.replace('[pfp]', discord_avatar);
                temp = temp.replace('[large-image]', discord_avatar);
                temp = temp.replace('[small-image]', spotify_logo);
                temp = temp.replace('[spotify-logo]', spotify_logo);
                temp = temp.replace('[button-text]', "Play on Spotify");
            } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code') {

                let time = activity.timestamps.start;
                let elapsed = Date.now() - time;
                let minutes = Math.floor(elapsed / 60000);
                let seconds = Math.floor((elapsed % 60000) / 1000);
                let timeString = `${minutes}:${seconds}`;
                
                const largeimage = activity.assets.largeImage
                let largelink = largeimage.split('raw')[1]
                const rawlarge = 'https://raw' + largelink

                const smallimage = activity.assets.smallImage
                let smallink = smallimage.split('raw')[1]
                const rawsmall = 'https://raw' + smallink

                temp = fs.readFileSync('./assets/vscode-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner);
                temp = temp.replace('[about]', about);
                temp = temp.replace('[pfp]', discord_avatar);

                temp = temp.replace('[name]', activity.name);
                temp = temp.replace('[details]', activity.details);
                temp = temp.replace('[state]', state);
                temp = temp.replace('[type]', activity.type);
                temp = temp.replace('[time]', timeString + ' elapsed');
                temp = temp.replace('[large-image]', rawlarge);
                temp = temp.replace('[small-image]', rawsmall);
                temp = temp.replace('[button-text]', activity.buttons[0] || 'View Repository' );
            } else if (activity.type === 'PLAYING') {
        
                let time = activity.timestamps.start;
                let elapsed = Date.now() - time;
                let hours = Math.floor(elapsed / 3600000);
                let minutes = Math.floor((elapsed % 3600000) / 60000);
                let seconds = Math.floor((elapsed % 60000) / 1000);
                let timeString = `${hours}:${minutes}:${seconds}`;
        
                temp = fs.readFileSync('./assets/game-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner);
                temp = temp.replace('[about]', about);
                temp = temp.replace('[pfp]', discord_avatar);
        
                temp = temp.replace('[name]', name || 'Gaming');
                temp = temp.replace('[details]', details || 'No details');
                temp = temp.replace('[state]', state || 'No description');
                temp = temp.replace('[type]', activity.type || 'PLAYING');
                temp = temp.replace('[large-image]', raw);
                temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');
            }

            let base64 = Buffer.from(temp).toString('base64');

            fs.writeFileSync('./assets/tempcard.svg', temp)

            io.emit("message", {
                stuff: activity,
                card: temp,
                baseimg: base64
            })
        }

        client.on("presenceUpdate", function (newPresence, oldPresence) {
            try {
                if (newPresence.user.bot) {
                    return;
                }
            } catch (e) {
                return;
            }
            if (newPresence.user.id === main_user) {
                if (newPresence.activities[0].name === 'Spotify') {
                    if(newPresence.activities[0].details === oldPresence.activities[0].details) {
                        return;
                    } else {
                        getActivity()
                    }
                } else if (newPresence.activities[0].name === 'Code' || newPresence.activities[0].name === 'Visual Studio Code') {
                    getActivity()
                }
            }
        });
    })
})

onlysvg.get('/svg', (req, res) => {
    const image = fs.readFileSync('./assets/tempcard.svg')
    res.writeHead(200, {'Content-Type': 'image/svg+xml'})
    res.end(image)
})

onlysvg.get('/svgimg/:id', (req, res) => {

    /* queries = {
        banner: 'req.query.banner',
        about: 'req.query.about',
        type: 'req.query.type',
        large_image: 'req.query.large_image',
        small_image: 'req.query.small_image',
    } */

    let member
    try {
        member = client.guilds.cache.get('782646778347388959').members.cache.get(req.params.id);
    } catch (e) {
        res.send('User not found')
        return;
    }
    
    let activity, discord_avatar, spotify_logo, username, banner, about, play_along

    try {
        discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true})
        spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'
        username = member.user.username + '#' + member.user.discriminator
        banner = req.query.banner || 'https://cdn.discordapp.com/attachments/970974282681307187/987323350709862420/green-back.png'
        about = req.query.about || 'No description'

        play_along = "https://cdn.discordapp.com/attachments/970974282681307187/987330240609132555/play-along.png"
    } catch (e) {
        res.send('User not found or no activity')
        return;
    }
    
    try {
        if (member.presence.activities[0].id === 'custom' || member.presence.activities[0].type === 'CUSTOM') {
            activity = member.presence.activities[1];
        } else {
            try {
                activity = member.presence.activities[0];
                // console.log(activity)
            } catch (error) {
                res.send('No activity')
                return;
            }
        }
    } catch (e) {
        res.send('Custom status error')
        return;
    }

    let name, details, state, smallimg, raw, largeText
        
    if(!activity.name){
        name = 'No name'
    } else {
        name = activity.name.replace(/&/g, '&amp;');
        if (name.length > 23) {
            name = name.substring(0, 23) + '...';
        }
    }
    
    if(!activity.details){
        details = 'No details'
    } else {
        details = activity.details.replace(/&/g, '&amp;');
        if (details.length > 23) {
            details = details.substring(0, 23) + '...';
        }
    }
    
    if(!activity.state){
        state = 'No description'
    } else {
        state = activity.state.replace(/&/g, '&amp;');
        if (state.length > 23) {
            state = state.substring(0, 23) + '...';
        }
    }
    
    if(!activity.assets){
        raw = req.query.large_image || discord_avatar
    } else if(activity.assets.smallImage === null) {
        raw = req.query.large_image || discord_avatar
    } else if(activity.assets.smallImage.startsWith('mp:external')){
        smallimg = activity.assets.smallImage
        let smalllink = smallimg.split('https/')[1]
        raw = 'https://' + smalllink
    } else {
        raw = req.query.large_image || discord_avatar   
    }

    if(!activity.assets){
        largeText = req.query.large_text || 'No large text'
    } else if(activity.assets.largeText === null) {
        largeText = req.query.large_text || 'No large text'
    } else {
        largeText = activity.assets.largeText.replace(/&/g, '&amp;');
        if (largeText.length > 23) {
            largeText = largeText.substring(0, 23) + '...';
        }
    }
    
    let temp;
    if (activity.name === 'Spotify') {

        let start = activity.timestamps.start
        let end = activity.timestamps.end
        let elapsed = end - start
        let minutes = Math.floor(elapsed / 60000)
        let seconds = Math.floor((elapsed % 60000) / 1000)
        let timeString = `${minutes}:${seconds}` 

        temp = fs.readFileSync('./assets/spotify-new.svg', {encoding: 'utf-8'}).toString()
        temp = temp.replace('[username]', username);
        temp = temp.replace('[banner]', banner);
        temp = temp.replace('[about]', about);

        temp = temp.replace('[play-along]', play_along);

        temp = temp.replace('[details]', details);
        temp = temp.replace('[state]', state);
        temp = temp.replace('[type]', req.query.type || activity.type);
        temp = temp.replace('[on]', largeText);
        temp = temp.replace('[time]', 0 + ' -- ' + timeString);
        temp = temp.replace('[pfp]', discord_avatar);
        temp = temp.replace('[large-image]', req.query.large_image || discord_avatar);
        temp = temp.replace('[small-image]', req.query.small_image || spotify_logo);
        temp = temp.replace('[spotify-logo]', spotify_logo);
        temp = temp.replace('[button-text]', "Play on Spotify");
    } else if (activity.name === 'Code') {

        let time = activity.timestamps.start;
        let elapsed = Date.now() - time;
        let minutes = Math.floor(elapsed / 60000);
        let seconds = Math.floor((elapsed % 60000) / 1000);
        let timeString = `${minutes}:${seconds}`;
        
        const largeimage = activity.assets.largeImage
        let largelink = largeimage.split('raw')[1]
        const rawlarge = 'https://raw' + largelink

        const smallimage = activity.assets.smallImage
        let smallink = smallimage.split('raw')[1]
        const rawsmall = 'https://raw' + smallink

        temp = fs.readFileSync('./assets/vscode-new.svg', {encoding: 'utf-8'}).toString()
        temp = temp.replace('[username]', username);
        temp = temp.replace('[banner]', banner);
        temp = temp.replace('[about]', about);
        temp = temp.replace('[pfp]', discord_avatar);

        temp = temp.replace('[name]', activity.name || 'Gaming');
        temp = temp.replace('[details]', activity.details || 'No details');
        temp = temp.replace('[state]', state || 'No description');
        temp = temp.replace('[type]', req.query.type || activity.type);
        temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');
        temp = temp.replace('[large-image]', rawlarge);
        temp = temp.replace('[small-image]', rawsmall);
        temp = temp.replace('[button-text]', activity.buttons[0] || 'Playing');
    } else if (activity.type === 'PLAYING') {

        // console.log(activity)

        let time = activity.timestamps.start;
        let elapsed = Date.now() - time;
        let hours = Math.floor(elapsed / 3600000);
        let minutes = Math.floor((elapsed % 3600000) / 60000);
        let seconds = Math.floor((elapsed % 60000) / 1000);
        let timeString = `${hours}:${minutes}:${seconds}`;

        temp = fs.readFileSync('./assets/game-new.svg', {encoding: 'utf-8'}).toString()
        temp = temp.replace('[username]', username);
        temp = temp.replace('[banner]', banner);
        temp = temp.replace('[about]', about);
        temp = temp.replace('[pfp]', discord_avatar);

        temp = temp.replace('[name]', name || 'Gaming');
        temp = temp.replace('[details]', details || 'No details');
        temp = temp.replace('[state]', state || 'No description');
        temp = temp.replace('[type]', req.query.type || activity.type);
        temp = temp.replace('[large-image]', raw);
        temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');
    }
    res.writeHead(200, {'Content-Type': 'image/svg+xml'})
    res.end(temp)

})

io.on("disconnect", (socket) => {
    console.log(`a user disconnected ${socket.id}`)
})

server.listen(3001, () => console.log(`Listening on port 3001`))
onlysvg.listen(5000, () => console.log(`Listening on port 5000 \nhttp://localhost:5000/svgimg/784141856426033233?about=pog&banner=https://wallpapercave.com/wp/wp4771870.jpg`))
client.login(process.env.DISCORD_TOKEN);