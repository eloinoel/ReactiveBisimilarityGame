/**
 * class storing all the constants
 */
export const Constants = {

    TIMEOUT_ACTION: "t",
    HIDDEN_ACTION: "tau",
    NO_ACTION: "",

    isSpecialAction(action: string): boolean {
        if(action === this.TIMEOUT_ACTION || action === this.HIDDEN_ACTION || action === this.NO_ACTION) {
            return true;
        } else {
            return false
        }
    }

} 

