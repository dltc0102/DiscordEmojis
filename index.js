import PogObject from '../PogData';

const MODULE_PREFIX = '&6[&9DiscordEmojis&6]&r';
export const data = new PogObject("DiscordEmojis", {
    firstInstall: false,
    trigger: false,
}, './data/data.json');
data.autosave(3);

function isInHypixel() {
    return (World.isLoaded() && ChatLib.removeFormatting(Scoreboard.getTitle()).includes("SKYBLOCK"));
}

function parseJSON(path) {
    return JSON.parse(FileLib.read('DiscordEmojis', path));
}

function getLastColorCode(message) {
    const firstEmojiIndex = message.search(/:(\w+):/);
    if (firstEmojiIndex === -1) return null;
    const colorCodeRegex = /(&[a-z0-9])/g;
    let lastMatch = null, match;
    while ((match = colorCodeRegex.exec(message.slice(0, firstEmojiIndex))) !== null) {
        lastMatch = match[0];
    }
    return lastMatch;
}

function emojify(message) {
    const emojiRegex = /:(\w+):/g;
    const parsedEmojis = parseJSON('/emojis.json');
    const lastColorCode = getLastColorCode(message);
    return message.replace(emojiRegex, (match) => {
        const replacement = parsedEmojis[match] || match;
        return lastColorCode ? `&r${replacement}${lastColorCode}` : replacement;
    });
};

//! on load
register('gameLoad', () => {
    if (!isInHypixel()) return;
    ChatLib.chat(`${MODULE_PREFIX} &r&9Loaded`);

    const showPartying = data.trigger ? '㘄 ' : '';
    const discordLink = new TextComponent('&9[Discord Link]&r')
        .setHover('show_text', '&b#emojis-suggestions')
        .setClick('open_url', 'https://discord.gg/FeYvZu5x');

    const texturePackGitLink = 'https://github.com/dltc0102/biscuitsEmojiPack/releases/tag/v0.1.0';
    const tpClickable = new TextComponent('&d&l[Texture Pack Download]')
        .setClick('open_url', texturePackGitLink)
        .setHover('show_text', texturePackGitLink.slice(0, 25) + '...')

    if (data.firstInstall) {
        data.trigger = true;
        data.firstInstall = false;
        ChatLib.chat(ChatLib.getChatBreak('&e-&r'))
        ChatLib.chat(`${showPartying}Thank you for installing &9DiscordEmojis&r! ${showPartying}`);
        ChatLib.chat(new Message( `&3 || &rTexture Pack to make this module work: `, tpClickable ));
        ChatLib.chat(new Message( `&3 || &rAny suggestions / questions: `, discordLink ));
        ChatLib.chat(ChatLib.getChatBreak('&e-&r'))
    };
});

//! main
register('chat', (event) => {
    if (!isInHypixel() || !data.trigger) return;
    const message = ChatLib.getChatMessage(event, true);
    if (/:\w+:/.test(message)) {
        cancel(event);
        ChatLib.chat(emojify(message));
    }
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
    const showLostEmoji = data.trigger ? '㐸 ' : '';
    const instructions = getInstructions();
    ChatLib.chat(`${showLostEmoji}&cLost? Do &b/toggleemojis&c to toggle the emojis!`)
    ChatLib.chat(new Message( `${showLostEmoji}&cNeed the texture pack? `, instructions ));
}).setName('discordemojis', true);

register('command', () => {
    if (!isInHypixel()) return;
    ChatLib.chat(ChatLib.getChatBreak(' '))
    ChatLib.chat(ChatLib.getCenteredText('-- &9DiscordEmojis Texture Pack&r -- '));
    ChatLib.chat(`&3 || &rDo &b/ct files&r`)
    ChatLib.chat(`&3 || &rThen &bmodules &r> &bDiscordEmojis &r> &bassets &r>&e biscuitsEmojiPack`)
    ChatLib.chat(ChatLib.getChatBreak('&r-'))
}).setName('showTPInstructions', true);
