import PogObject from '../PogData';
const parsedEmojis = parseJSON('/emojis.json');

const MODULE_PREFIX = '&6[&9DiscordEmojis&6]&r';
export const data = new PogObject("DiscordEmojis", {
    firstInstall: false,
    trigger: false,
}, './data/data.json');
data.autosave(3);

function isInHypixel() {
    return (World.isLoaded() && Server.getIP().includes('hypixel'));
};

function stripRank(name) {
    const rankNameRegex = /\[(?:MVP\+\+|MVP\+|MVP|VIP\+|VIP)\] (\S+)/;
    return name.match(rankNameRegex)?.[1] || name.trim();
};

function parseJSON(path) {
    return JSON.parse(FileLib.read('DiscordEmojis', path));
};

function getLastColorCode(message) {
    const firstEmojiIndex = message.search(/:(\w+):/);
    if (firstEmojiIndex === -1) return null;
    const colorCodeRegex = /(&[a-z0-9])/g;
    let lastMatch = '', match;
    while ((match = colorCodeRegex.exec(message.slice(0, firstEmojiIndex))) !== null) {
        lastMatch = match[0];
    }
    return lastMatch;
};

function emojis(msg, emojiData) {
    if (!msg) return msg;

    try {
        const emojiRegex = /:\w+:/g;

        const replaceEmojis = (text) => {
            const lastColor = getLastColorCode(text);
            return text.replace(emojiRegex, match => {
                const emoji = emojiData[match] || emojiData[match.toLowerCase()];
                return emoji ? `&r${emoji}&r${lastColor}` : match;
            });
        };

        if (Array.isArray(msg)) {
            return msg.map(m => replaceEmojis(m));
        } else if (typeof msg === 'string') {
            return replaceEmojis(msg);
        } else {
            return msg;
        }
    } catch (error) {
        console.error("Error processing emojis:", error);
        return msg;
    }
}

function hasEmojiPack() {
    return Client.getSettings().getSettings().field_151453_l.includes('biscuitsEmojiPack');
};

const texturePackGitLink = 'https://github.com/dltc0102/biscuitsEmojiPack/releases/tag/v0.1.0';
const tpClickable = new TextComponent('&b&l[Download Here]')
    .setClick('open_url', texturePackGitLink)
    .setHover('show_text', texturePackGitLink);

//! on load
register('gameLoad', () => {
    if (!isInHypixel()) return;
    ChatLib.chat(`${MODULE_PREFIX} &r&9Loaded`);

    const showPartying = data.trigger && hasEmojiPack() ? '㘄 ' : '';
    const discordLink = new TextComponent('&9[Discord]&r')
        .setHover('show_text', '&b#emojis-suggestions')
        .setClick('open_url', 'https://discord.gg/FeYvZu5x');

    data.firstInstall = true; // dev
    if (data.firstInstall) {
        data.trigger = true;
        data.firstInstall = false;
        ChatLib.chat(ChatLib.getChatBreak('&e-&r'))
        ChatLib.chat(ChatLib.getCenteredText(`${showPartying}Thank you for installing &9DiscordEmojis&r! ${showPartying}`));
        ChatLib.chat(new Message( `&3 || &rTexture Pack: `, tpClickable ));
        ChatLib.chat(new Message( `&3 || &rAny suggestions / questions: `, discordLink ));
        ChatLib.chat(`&3 || &rDo &b/toggleemojis&r to turn this module on or off &7|&r Currently: ${data.triggers ? '&a&lON' : '&c&lOFF'}`);
        ChatLib.chat(ChatLib.getChatBreak('&e-&r'))
    };
});

//! commands
register('command', () => {
    if (!isInHypixel()) return;
    if (data.trigger) {
        ChatLib.chat(`${MODULE_PREFIX} Emojis: &c&lOFF&r`);
        data.trigger = false;
        return;

    } else {
        ChatLib.chat(`${MODULE_PREFIX} Emojis: &a&lON&r`);
        data.trigger = true;
        return;
    }
}).setName('toggleemojis', true);

register('command', () => {
    if (!isInHypixel()) return;
    const showLostEmoji = data.trigger && hasEmojiPack() ? '㐸 ' : '';
    ChatLib.chat(`${showLostEmoji}&cLost? Do &b/toggleemojis&c to toggle the emojis!`)
    ChatLib.chat(new Message( `${showLostEmoji}&cNeed the texture pack? `, tpClickable));
}).setName('discordemojis', true);

register('command', () => {
    if (!isInHypixel()) return;
    ChatLib.chat(ChatLib.getChatBreak(' '))
    ChatLib.chat(ChatLib.getCenteredText('-- &9DiscordEmojis Texture Pack&r -- '));
    ChatLib.chat(`&3 || &rDo &b/ct files&r`)
    ChatLib.chat(`&3 || &rThen &bmodules &r> &bDiscordEmojis &r> &bassets &r>&e biscuitsEmojiPack`)
    ChatLib.chat(ChatLib.getChatBreak('&r-'))
}).setName('showTPInstructions', true);

//! party messages
register('chat', (stuff, event) => {
    if (!isInHypixel()) return;
    const message = ChatLib.getChatMessage(event, true);
    const regex = /&r&9Party &8> (.+?): &r(.+)&r/;
    const match = message.match(regex);
    if (!match) return;

    if (match) {
        const [_, rankedName, response] = match;
        const formattedResponse = hasEmojiPack() ? emojis(response, parsedEmojis) : response;
        const formattedMessage = `&r&9P &8> ${rankedName}&f: &r${formattedResponse}`;
        cancel(event);
        ChatLib.chat(formattedMessage);
    }
}).setCriteria('Party > ${stuff}');

//! From DM
register('chat', (name, response, event) => {
    if (!isInHypixel()) return;
    const message = ChatLib.getChatMessage(event, true);
    const regex = /From (.+?): (.+)/;
    const match = message.match(regex);
    if (match) {
        const [_, sender, res] = match;
        const formattedResponse = hasEmojiPack() ? emojis(res, parsedEmojis) : res;
        const formattedMessage = `&dFrom ${sender}&7: &7${formattedResponse}`;
        cancel(event);
        ChatLib.chat(formattedMessage);
    }
}).setCriteria('From ${name}: ${response}');

//! To DM
register('chat', (name, response, event) => {
    if (!isInHypixel()) return;
    const message = ChatLib.getChatMessage(event, true);
    const regex = /To (.+?): (.+)/;
    const match = message.match(regex);
    if (match) {
        const [_, sender, res] = match;
        const formattedResponse = hasEmojiPack() ? emojis(res, parsedEmojis) : res;
        const formattedMessage = `&dTo ${sender}&7: &7${formattedResponse}`;
        cancel(event);
        ChatLib.chat(formattedMessage);
    }
}).setCriteria('To ${name}: ${response}');

//! all chat
register('chat', (sblvl, name, response, event) => {
    if (!isInHypixel()) return;
    const message = ChatLib.getChatMessage(event, true);
    const regex = /(&r&8\[&r&\d+&r&8\] &r&[a-z0-9&]+\S+ )(&r&[a-z0-9&]+\[.+?\] .+?): .+/;
    const match = message.match(regex);
    const strippedResponse = response.removeFormatting();
    if (!match) return;

    if (match) {
        const [_, playerLevelAndEmblem, rankedName] = match;
        const formattedResponse = hasEmojiPack() ? emojis(strippedResponse, parsedEmojis) : strippedResponse;
        const strippedName = stripRank(rankedName.removeFormatting().trim());
        const pvClickable = new TextComponent(rankedName)
            .setClick('run_command', `/pv ${strippedName}`)

        const formattedMessage = new Message(
            playerLevelAndEmblem,
            pvClickable,
            ': ',
            formattedResponse
        );
        cancel(event)
        ChatLib.chat(formattedMessage);
    }
}).setCriteria('[${sblvl}] ${name}: ${response}');
