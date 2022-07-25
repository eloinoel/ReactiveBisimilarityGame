"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/**
 * Data Class representing the current or previous game state
 */
var GamePosition = /** @class */ (function () {
    function GamePosition(process1, process2, activePlayer) {
        this.process1 = process1;
        this.process2 = process2;
        this.activePlayer = activePlayer;
    }
    return GamePosition;
}());
exports.GamePosition = GamePosition;
var Player;
(function (Player) {
    Player[Player["Attacker"] = 0] = "Attacker";
    Player[Player["Defender"] = 1] = "Defender";
})(Player = exports.Player || (exports.Player = {}));
/**
 * @process1 is a Process
 * @process2 is a Process
 */
var AttackerNode = /** @class */ (function (_super) {
    __extends(AttackerNode, _super);
    function AttackerNode(process1, process2) {
        return _super.call(this, process1, process2, Player.Attacker) || this;
    }
    AttackerNode.prototype.invertProcesses = function () {
        return new AttackerNode(this.process2, this.process1);
    };
    return AttackerNode;
}(GamePosition));
exports.AttackerNode = AttackerNode;
/**
 * for situations where a simulation challenge for <previousAction> has been formulated
 * @previousAction can't be timeout action, test before instantiating
 */
var SimulationDefenderNode = /** @class */ (function (_super) {
    __extends(SimulationDefenderNode, _super);
    function SimulationDefenderNode(process1, process2, previousAction) {
        var _this = _super.call(this, process1, process2, Player.Defender) || this;
        _this.previousAction = previousAction;
        return _this;
    }
    SimulationDefenderNode.prototype.invertProcesses = function () {
        return new SimulationDefenderNode(this.process2, this.process1, this.previousAction);
    };
    return SimulationDefenderNode;
}(GamePosition));
exports.SimulationDefenderNode = SimulationDefenderNode;
/**
 * @environment subseteq of all possible actions
 */
var RestrictedAttackerNode = /** @class */ (function (_super) {
    __extends(RestrictedAttackerNode, _super);
    function RestrictedAttackerNode(process1, process2, environment) {
        var _this = _super.call(this, process1, process2, Player.Attacker) || this;
        _this.environment = new Set(environment);
        return _this;
    }
    RestrictedAttackerNode.prototype.invertProcesses = function () {
        return new RestrictedAttackerNode(this.process2, this.process1, this.environment);
    };
    return RestrictedAttackerNode;
}(GamePosition));
exports.RestrictedAttackerNode = RestrictedAttackerNode;
/**
 * for situations where a simulation challenge for <previousAction> has been formulated
 * @previousAction can only be timeout action or hidden action, test before instantiating
 * @environment subseteq of all possible actions
 */
var RestrictedSimulationDefenderNode = /** @class */ (function (_super) {
    __extends(RestrictedSimulationDefenderNode, _super);
    function RestrictedSimulationDefenderNode(process1, process2, previousAction, environment) {
        var _this = _super.call(this, process1, process2, Player.Defender) || this;
        _this.previousAction = previousAction;
        _this.environment = new Set(environment);
        return _this;
    }
    RestrictedSimulationDefenderNode.prototype.invertProcesses = function () {
        return new RestrictedSimulationDefenderNode(this.process2, this.process1, this.previousAction, this.environment);
    };
    return RestrictedSimulationDefenderNode;
}(GamePosition));
exports.RestrictedSimulationDefenderNode = RestrictedSimulationDefenderNode;
