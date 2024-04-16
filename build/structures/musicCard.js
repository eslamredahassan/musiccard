const canvas = require("@napi-rs/canvas");
const { colorFetch } = require("zydenmusiccard/build/functions/colorFetch");
const { cropImage } = require("cropify")

// canvas.GlobalFonts.registerFromPath(`build/structures/font/circularstd-black.otf`, "circular-std");
// canvas.GlobalFonts.registerFromPath(`build/structures/font/notosans-jp-black.ttf`, "noto-sans-jp");
// canvas.GlobalFonts.registerFromPath(`build/structures/font/notosans-black.ttf`, "noto-sans");
// canvas.GlobalFonts.registerFromPath(`build/structures/font/notoemoji-bold.ttf`, "noto-emoji");
// canvas.GlobalFonts.registerFromPath(`build/structures/font/notosans-kr-black.ttf`, "noto-sans-kr");

canvas.GlobalFonts.registerFromPath(`node_modules/musicard/build/structures/font/circularstd-black.otf`, "circular-std");
canvas.GlobalFonts.registerFromPath(`node_modules/musicard/build/structures/font/notosans-jp-black.ttf`, "noto-sans-jp");
canvas.GlobalFonts.registerFromPath(`node_modules/musicard/build/structures/font/notosans-black.ttf`, "noto-sans");
canvas.GlobalFonts.registerFromPath(`node_modules/musicard/build/structures/font/notoemoji-bold.ttf`, "noto-emoji");
canvas.GlobalFonts.registerFromPath(`node_modules/musicard/build/structures/font/notosans-kr-black.ttf`, "noto-sans-kr");

class musicCard {
    constructor(options) {
        this.name = options?.name ?? null;
        this.author = options?.author ?? null;
        this.color = options?.color ?? null;
        this.theme = options?.theme ?? null;
        this.brightness = options?.brightness ?? null;
        this.thumbnail = options?.thumbnail ?? null;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setAuthor(author) {
        this.author = author;
        return this;
    }

    setColor(color) {
        this.color = color;
        return this;
    }

    setTheme(theme) {
        this.theme = theme || 'classic';
        return this;
    }

    setBrightness(brightness) {
        this.brightness = brightness;
        return this;
    }

    setThumbnail(thumbnail) {
        this.thumbnail = thumbnail;
        return this;
    }


    async build() {
        if (!this.name) throw new Error('Missing name parameter');
        if (!this.author) throw new Error('Missing author parameter');
        if (!this.color) this.setColor('ff0000');
        if (!this.theme) this.setTheme('classic');
        if (!this.brightness) this.setBrightness(0);
        if (!this.thumbnail) this.setThumbnail('https://s6.imgcdn.dev/Opo4a.jpg');


        if (this.name.length > 15) this.name = `${this.name.slice(0, 15)}...`;
        if (this.author.length > 15) this.author = `${this.author.slice(0, 15)}...`;

        if (this.theme == 'classic') {

            const circleCanvas = canvas.createCanvas(1000, 1000);
            const circleCtx = circleCanvas.getContext('2d');

            const circleRadius = 20;
            const circleY = 97;

            circleCtx.beginPath();
            circleCtx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
            circleCtx.fillStyle = `#${validatedColor}`;
            circleCtx.fill();

            const background = await canvas.loadImage(`https://s6.imgcdn.dev/ZDjTD.png`);

            const thumbnailCanvas = canvas.createCanvas(564, 564);
            const thumbnailCtx = thumbnailCanvas.getContext('2d');

            let thumbnailImage;

            thumbnailImage = await canvas.loadImage(this.thumbnail, {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                    }
                }
            }).catch(() => {
                thumbnailImage = canvas.loadImage(`https://s6.imgcdn.dev/Opo4a.jpg`);
            })

            const thumbnailSize = Math.min(thumbnailImage.width, thumbnailImage.height);
            const thumbnailX = (thumbnailImage.width - thumbnailSize) / 2;
            const thumbnailY = (thumbnailImage.height - thumbnailSize) / 2;

            const cornerRadius2 = 45;

            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(0 + cornerRadius2, 0);
            thumbnailCtx.arcTo(thumbnailCanvas.width, 0, thumbnailCanvas.width, thumbnailCanvas.height, cornerRadius2);
            thumbnailCtx.arcTo(thumbnailCanvas.width, thumbnailCanvas.height, 0, thumbnailCanvas.height, cornerRadius2);
            thumbnailCtx.arcTo(0, thumbnailCanvas.height, 0, 0, cornerRadius2);
            thumbnailCtx.arcTo(0, 0, thumbnailCanvas.width, 0, cornerRadius2);
            thumbnailCtx.closePath();
            thumbnailCtx.clip();

            thumbnailCtx.drawImage(thumbnailImage, thumbnailX, thumbnailY, thumbnailSize, thumbnailSize, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

            const image = canvas.createCanvas(1280, 450);
            const ctx = image.getContext('2d');

            ctx.drawImage(background, 0, 0, 1280, 450);

            ctx.font = `75px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
            ctx.fillText(this.name, 70, 120);

            ctx.fillStyle = '#b8b8b8';
            ctx.font = `50px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr`;
            ctx.fillText(this.author, 75, 190);


            ctx.drawImage(thumbnailCanvas, 837, 8, 435, 435);
            ctx.drawImage(circleCanvas, 10, 255, 1000, 1000);

            return image.toBuffer('image/png');
        }

        else if (this.theme == 'dynamic') {
            const frame = canvas.createCanvas(3264, 765);
            const ctx = frame.getContext("2d");

            const background = await cropImage({
                imagePath: this.thumbnail,
                cropCenter: true,
                width: 3264,
                height: 765
            })

            ctx.drawImage(await canvas.loadImage(background), 0, 0, frame.width, frame.height);

            let thumbnailImage;

            thumbnailImage = await canvas.loadImage(this.thumbnail, {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                    }
                }
            }).catch(() => {
                thumbnailImage = canvas.loadImage(`https://s6.imgcdn.dev/Opo4a.jpg`);
            })

            ctx.drawImage(await canvas.loadImage(await cropImage({
                imagePath: thumbnailImage,
                borderRadius: 100,
                cropCenter: true,
                width: 650,
                height: 650
            })), 90, 60)

            ctx.font = "bold 150px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(this.name, 900, 350);

            ctx.font = "100px circular-std, noto-emoji, noto-sans-jp, noto-sans, noto-sans-kr";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(this.author, 900, 520);


            return frame.toBuffer("image/png");
        } else {
            throw new Error('Invalid theme parameter, must be "classic" or "dynamic"');
        }
    }
}

module.exports = { musicCard };
