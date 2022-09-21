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

    fadeImage(obj: Phaser.GameObjects.Image, delay = 0, duration = Constants.camFadeSpeed*2) : Phaser.Tweens.Tween {
        obj.alpha = 0;
        let tween: Phaser.Tweens.Tween;
        if(delay !== 0) {
            this.time.delayedCall(delay, () => {
                tween = this.tweens.add({
                    targets: obj,
                    duration: duration,
                    alpha: 1
                })
            });
        } else {
            tween = this.tweens.add({
                targets: obj,
                duration: duration,
                alpha: 1
            })
        }
        return tween!;
    }

    fadeImageOut(obj: Phaser.GameObjects.Image, duration = 25, delayedCall = false, fn = () => {}) {
        //obj.alpha = 1;

        if(delayedCall) {
            this.tweens.add({
                targets: obj,
                duration: duration,
                alpha: 0,
                onComplete: fn
            })
        } else {
            this.tweens.add({
                targets: obj,
                duration: duration,
                alpha: 0
            })
        }
    }

}