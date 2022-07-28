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
    static COLORS_BLUE_LIGHT = {c1: "#71C9CE", c2: "#A6E3E9", c3: "#CBF1F5", c4: "#E3FDFD"}; //darker to brighter blue tones
    static COLORS_RED = {c1: "#311D3F", c2: "#522546", c3: "#88304E", c4: "#E23E57"}; //purple, mat purple, dark red, red
    static COLORPACK_2 = {c1: "#48466D", c2: "#3D84A8", c3: "#46CDCF", c4: "#ABEDD8"}; //dull purple, dull blue, blue, light blue --> weird magic colors
    static COLORS_GREEN = {c1: "#1FAB89", c2: "#62D2A2", c3: "#9DF3C4", c4: "#D7FBE8"}; //dark to bright
} 

