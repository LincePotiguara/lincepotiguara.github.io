const torsoInput = document.querySelector("#torso");
const shoulderInput = document.querySelector("#shoulder");
const shoulderRightInput = document.querySelector("#shoulderRight");
const armInput = document.querySelector("#arm");
const armRightInput = document.querySelector("#armRight");
const handInput = document.querySelector("#hand");
const handRightInput = document.querySelector("#handRight");
const headInput = document.querySelector("#head");
const zoomInput = document.querySelector("#zoom");
const legLeftInput = document.querySelector("#legLeft");
const legRightInput = document.querySelector("#legRight");
const shinLeftInput = document.querySelector("#shinLeft");
const shinRightInput = document.querySelector("#shinRight");

torsoInput.addEventListener("input", (event) => {
    joint.torso = Number.parseInt(event.target.value);
    torsoMatrix.setTranslate(0, 0, 0).rotate(joint.torso, 0, 1, 0);
    draw()
});

shoulderInput.addEventListener("input", (event) => {
    joint.shoulder = Number.parseInt(event.target.value);
    var currentShoulderRot = new Matrix4()
                .setTranslate(0, 2, 0)
                .rotate(-joint.shoulder, 1, 0, 0)
                .translate(0, -2, 0);
    shoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
    draw()
});

shoulderRightInput.addEventListener("input", (event) => {
    joint.shoulderRight = Number.parseInt(event.target.value);
    var currentShoulderRot = new Matrix4()
                .setTranslate(0, 2, 0)
                .rotate(-joint.shoulderRight, 1, 0, 0)
                .translate(0, -2, 0);
    shoulderRightMatrix.setTranslate(-6.5, 2, 0).multiply(currentShoulderRot);
    draw()
});

armInput.addEventListener("input", (event) => {
    joint.arm = Number.parseInt(event.target.value);
    var currentArm = new Matrix4()
                .setTranslate(0, 2.5, 1.0)
                .rotate(-joint.arm, 1, 0, 0)
                .translate(0, -2.5, -1.0);
    armMatrix.setTranslate(0, -5, 0).multiply(currentArm);
    draw()
});

armRightInput.addEventListener("input", (event) => {
    joint.armRight = Number.parseInt(event.target.value);
    var currentArm = new Matrix4()
                .setTranslate(0, 2.5, 1.0)
                .rotate(-joint.armRight, 1, 0, 0)
                .translate(0, -2.5, -1.0);
    armRightMatrix.setTranslate(0, -5, 0).multiply(currentArm);
    draw()
});

handInput.addEventListener("input", (event) => {
    joint.hand = Number.parseInt(event.target.value);
    handMatrix.setTranslate(0, -4, 0).rotate(joint.hand, 0, 1, 0);
    draw()
});

handRightInput.addEventListener("input", (event) => {
    joint.handRight = Number.parseInt(event.target.value);
    handRightMatrix.setTranslate(0, -4, 0).rotate(joint.handRight, 0, 1, 0);
    draw()
});

headInput.addEventListener("input", (event) => {
    joint.head = Number.parseInt(event.target.value);
    headMatrix.setTranslate(0, 7, 0).rotate(joint.head, 0, 1, 0);
    draw()
});

zoomInput.addEventListener("input", (event) => {
    var d = Number.parseInt(event.target.value);
    rotator.setViewDistance(d);
    draw()
});

legLeftInput.addEventListener("input", (event) => {
    joint.legLeft = Number.parseInt(event.target.value);
    var currentlegLeftRot = new Matrix4()
                .setTranslate(0, 3, 1.5)
                .rotate(-joint.legLeft, 1, 0, 0)
                .translate(0, -3, -1.5);
    legLeftMatrix.setTranslate(1.5 + 0.5, -8, 1).multiply(currentlegLeftRot);
    draw()
});

legRightInput.addEventListener("input", (event) => {
    joint.legRight = Number.parseInt(event.target.value);
    var currentlegRightRot = new Matrix4()
                .setTranslate(0, 3, 1.5)
                .rotate(-joint.legRight, 1, 0, 0)
                .translate(0, -3, -1.5);
    legRightMatrix.setTranslate(-1.5 - 0.5, -8, 1).multiply(currentlegRightRot);
    draw()
});

shinLeftInput.addEventListener("input", (event) => {
    joint.shinLeft = Number.parseInt(event.target.value);
    var currentShinLeftRot = new Matrix4()
                .setTranslate(0, 2.5, 1.5)
                .rotate(-joint.shinLeft, 1, 0, 0)
                .translate(0, -2.5, -1.5);
    shinLeftMatrix.setTranslate(0, -5, 0).multiply(currentShinLeftRot);
    draw()
});

shinRightInput.addEventListener("input", (event) => {
    joint.shinRight = Number.parseInt(event.target.value);
    var currentShinRightRot = new Matrix4()
                .setTranslate(0, 2.5, 1.5)
                .rotate(-joint.shinRight, 1, 0, 0)
                .translate(0, -2.5, -1.5);
    shinRightMatrix.setTranslate(0, -5, 0).multiply(currentShinRightRot);
    draw()
});