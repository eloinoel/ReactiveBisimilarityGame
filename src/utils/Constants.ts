
/**
 * class storing all the constants
 */
export class Constants {

    static TIMEOUT_ACTION =  "t";
    static HIDDEN_ACTION ="tau";
    static NO_ACTION = "";

    static isSpecialAction(action: string): boolean {
        if(action === this.TIMEOUT_ACTION || action === this.HIDDEN_ACTION || action === this.NO_ACTION) {
            return true;
        } else {
            return false
        }
    }

    static COLORPACK_1 = {blue: '#08D9D6', black: '#252A34', red_pink: '#FF2E63', white: '#EAEAEA'}; //blue, black, red/pink, white
    static COLORPACK_1_LIGHT = {blue: "#3FC1C9", black: "#364F6B", red_pink: "#FC5185", white: "#F5F5F5"}; //blue, black, red/pink, white
    static COLORS_BLUE_LIGHT = {c1: "#00A9BA", c2: "#45A0A5", c3: "#71C9CE", c4: "#A6E3E9"}; //darker to brighter blue tones
    static COLORS_RED = {c1: "#311D3F", c2: "#522546", c3: "#88304E", c4: "#DB1D49"}; //purple, mat purple, dark red, red
    static COLORPACK_2 = {c1: "#48466D", c2: "#3D84A8", c3: "#46CDCF", c4: "#ABEDD8"}; //dull purple, dull blue, blue, light blue --> weird magic colors
    static COLORS_GREEN = {c1: "#00A072", c2: "#00C897", c3: "#0EDDAA", c4: "#ACFFAD"}; //dark to bright
    static COLORS_GREY = {c1: '#413F42', c2: '#7F8487', c3 : '#CFD2CF', c4: '#DDDDDD'}
    static COLOR_BORDEAUX = Phaser.Display.Color.GetColor(200, Phaser.Display.Color.ColorToRGBA(Constants.convertColorToNumber(Constants.COLORPACK_1.red_pink)).g, Phaser.Display.Color.ColorToRGBA(Constants.convertColorToNumber(Constants.COLORPACK_1.red_pink)).b);
    static COLORS_PARALLAX = {white: '#9db8b9', dark_blue: '#12273b', lighter_blue: '#085b87', very_dark_blue: '#0f1326'}

    static COLORPACK_FINAL = {white: "#EEEEEE", white_blue: "#E4F9F5", teal_greenish: "#30E3CA", teal_darker: "#11999E", teal: "#08D9D6", grey_tealish: "#40514E", grey: "#393E46",
     black: "#222831", red_pink: "#FF2E63", red_purple: "#B91646", red_bordeaux: "#c82e63", green_dark: "#3b845c", green: '#00A97B', green_light: '#00ffd2'}


    static textStyle = "Monospace";
    static UI_height = 60;
    static UI_offset = 60;
    static camFadeSpeed = 500;

    // Aspect Ratio 16:9
    static MAX_WIDTH = 4096 //1920
    static MAX_HEIGHT = 2304 //1080
    static MIN_WIDTH = 480
    static MIN_HEIGHT = 270 
    static DEFAULT_WIDTH = 1280
    static DEFAULT_HEIGHT = 720

    static first_coordinates = new Phaser.Math.Vector2(this.DEFAULT_WIDTH/3.5, this.DEFAULT_HEIGHT/3.5 + 50);
    static second_coordinates = new Phaser.Math.Vector2(this.DEFAULT_WIDTH*2.5/3.5, this.DEFAULT_HEIGHT/3.5 + 50);
    static lts_xy_offset = new Phaser.Math.Vector2(this.DEFAULT_WIDTH/12, this.DEFAULT_WIDTH/8.6);

    /**
     * 
     * @param color should be a string starting with '#'
     */
    static convertColorToNumber(color: string): number {
        let number = -1;
        if(color.startsWith('#')) {
            let strings = color.split('#');
            let tmp = "0x" + strings[1];
            number = Number(tmp);
        } else {
            console.log("convertColorToNumber: wrong color string format")
            return -1;
        }
        return number;
    }
} 

