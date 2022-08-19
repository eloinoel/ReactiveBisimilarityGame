import { Constants } from "../utils/Constants";

export default class BaseScene extends Phaser.Scene {

    /**
     * 
     * @param fadeIn true: fadein, false: fadeout
     * @param callbackFn function to execute once fade complete
     * @param delay delay before function is called
     */
    fade(fadeIn: boolean, callbackFn = () => {}, duration = Constants.camFadeSpeed, delay = 0) {
        if(fadeIn) {
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
                if(delay !== 0) {
                    this.time.delayedCall(delay, () => {
                        callbackFn();
                    })
                } else {
                    callbackFn();
                }
            });
            this.cameras.main.fadeIn(duration);
        } else {
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                if(delay !== 0) {
                    this.time.delayedCall(delay, () => {
                        callbackFn();
                    })
                } else {
                    callbackFn();
                }
            })
            this.cameras.main.fadeOut(duration);
        }
        
    }

    fadeImage(obj: Phaser.GameObjects.Image, duration = Constants.camFadeSpeed*2) {
        obj.alpha = 0;
        this.tweens.add({
            targets: obj,
            duration: duration,
            alpha: 1
        })
    }

    fadeImageOut(obj: Phaser.GameObjects.Image, duration = Constants.camFadeSpeed*2) {
        obj.alpha = 1;
        this.tweens.add({
            targets: obj,
            duration: duration,
            alpha: 0
        })
    }



    /* fadeImageInto(obj0: Phaser.GameObjects.Image, obj1: Phaser.GameObjects.Image, duration: number) {
        this.tweens.add()
    } */

}