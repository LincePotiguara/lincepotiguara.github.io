const torsoInput = document.querySelector("#torso");
const shoulderInput = document.querySelector("#shoulder");
const armInput = document.querySelector("#arm");
const handInput = document.querySelector("#hand");
const headInput = document.querySelector("#head");
const zoomInput = document.querySelector("#zoom");

torsoInput.addEventListener("input", (event) => {
    //value.textContent = event.target.value;
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

armInput.addEventListener("input", (event) => {
    joint.arm = Number.parseInt(event.target.value);
    var currentArm = new Matrix4()
                .setTranslate(0, 2.5, 1.0)
                .rotate(-joint.arm, 1, 0, 0)
                .translate(0, -2.5, -1.0);
            armMatrix.setTranslate(0, -5, 0).multiply(currentArm);
    draw()
});

handInput.addEventListener("input", (event) => {
    joint.hand = Number.parseInt(event.target.value);
    handMatrix.setTranslate(0, -4, 0).rotate(joint.hand, 0, 1, 0);
    draw()
});

headInput.addEventListener("input", (event) => {
    joint.head = Number.parseInt(event.target.value);
    headMatrix.setTranslate(0, 7, 0).rotate(joint.head, 0, 1, 0);
    draw()
});

zoomInput.addEventListener("input", (event) => {
    console.log(rotator.getViewDistance())
    var d = Number.parseInt(event.target.value);
    rotator.setViewDistance(d);
    draw()
});