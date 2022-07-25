"use strict";
exports.__esModule = true;
/**
 * class storing all the constants
 */
exports.Constants = {
    TIMEOUT_ACTION: "t",
    HIDDEN_ACTION: "tau",
    NO_ACTION: "",
    isSpecialAction: function (action) {
        if (action === this.TIMEOUT_ACTION || action === this.HIDDEN_ACTION || action === this.NO_ACTION) {
            return true;
        }
        else {
            return false;
        }
    }
};
