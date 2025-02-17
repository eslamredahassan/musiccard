const canvas = require("@napi-rs/canvas");
const { cropImage } = require("cropify")
const path = require("path");
const fs = require("fs");

function registerFont(fontPath, fontName) {
    const rootFontsPath = path.join(__dirname, "../fonts", fontPath);
    if (fs.existsSync(rootFontsPath)) {
        canvas.GlobalFonts.registerFromPath(rootFontsPath, fontName);
    } else {
        const srcFontsPath = path.join(__dirname, "../fonts", fontPath);
        if (fs.existsSync(srcFontsPath)) {
            canvas.GlobalFonts.registerFromPath(srcFontsPath, fontName);
        } else {
            throw new Error(`Font file not found at ${rootFontsPath} or ${srcFontsPath}`);
        }
    }
}

registerFont("PlusJakartaSans-Bold.ttf", "bold")
registerFont("PlusJakartaSans-ExtraBold.ttf", "extrabold")
registerFont("PlusJakartaSans-ExtraLight.ttf", "extralight")
registerFont("PlusJakartaSans-Light.ttf", "light")
registerFont("PlusJakartaSans-Medium.ttf", "medium")
registerFont("PlusJakartaSans-Regular.ttf", "regular")
registerFont("PlusJakartaSans-SemiBold.ttf", "semibold")

class PappuZydenMusicCard {
    constructor(options) {
        this.name = options?.name ?? null;
        this.author = options?.author ?? null;
        this.duration = options?.duration ?? null; // Added duration
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

    setDuration(duration) {  // New setter method
        this.duration = duration;
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
        if (!this.duration) throw new Error('Missing duration parameter'); // Ensure duration is set
        if (!this.color) this.setColor('ff0000');
        if (!this.theme) this.setTheme('classic');
        if (!this.brightness) this.setBrightness(0);
        if (!this.thumbnail) this.setThumbnail('https://s6.imgcdn.dev/Opo4a.jpg');

        if (this.name.length > 15) this.name = `${this.name.slice(0, 15)}...`;
        if (this.author.length > 15) this.author = `${this.author.slice(0, 15)}...`;

        if (this.theme == 'dynamic') {
            const frame = canvas.createCanvas(3264, 765);
            const ctx = frame.getContext("2d");

            const generateSvg = (svgContent) => {
                return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
            }

            const dimSvg = generateSvg(`<svg width="3264" height="765" viewBox="0 0 3264 765" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="3264" height="765" fill="black" fill-opacity="0.7"/>
            </svg>`)

            const background = await cropImage({
                imagePath: this.thumbnail,
                cropCenter: true,
                width: 3264,
                height: 765
            })

            ctx.drawImage(await canvas.loadImage(background), 0, 0, frame.width, frame.height);
            ctx.drawImage(await canvas.loadImage(dimSvg), 0, 0, frame.width, frame.height);

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

            ctx.font = "150px medium";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(this.name.toUpperCase(), 900, 330);

            ctx.font = "100px extralight";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(this.author.toUpperCase(), 900, 520);

            // Display duration below author
            ctx.font = "80px light"; 
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(this.duration, 900, 630);

            return frame.toBuffer("image/png");
        } else {
            throw new Error('Invalid theme parameter, must be "classic" or "dynamic"');
        }
    }
}


module.exports = { PappuZydenMusicCard };
