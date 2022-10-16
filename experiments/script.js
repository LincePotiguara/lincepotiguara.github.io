let donce = false;
let globalCount = 0;

createMenu();
function createMenu() {
    const menu = document.createElement("fieldset");
    const menudiv = document.createElement("div");
    const body = getBody();
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const div3 = document.createElement("div");
    const div4 = document.createElement("div");
    const color1 = document.createElement("input");
    const color2 = document.createElement("input");
    const color3 = document.createElement("input");
    const legend = document.createElement("legend");
    const label1 = document.createElement("label");
    const label2 = document.createElement("label");
    const label3 = document.createElement("label");
    const button = document.createElement("button");
    color1.checked = true;
    menudiv.id = "choices";
    legend.innerText = "Select circle color";
    color1.type = "radio";
    color1.name = "Colors";
    // for 1
    color1.id = "red";
    label1.setAttribute("for", "red");

    color1.value = label1.innerText = "Red";
    menudiv.appendChild(legend);
    div1.appendChild(color1);
    div1.appendChild(label1);
    menudiv.appendChild(div1);
    // for 2
    color2.type = "radio";
    color2.name = "Colors";
    color2.id = "blue";
    color2.value = label2.innerText = "Blue";
    label2.setAttribute("for", "blue");
    div2.appendChild(color2);
    div2.appendChild(label2);
    menudiv.appendChild(div2);
    // for 3
    color3.type = "radio";
    color3.name = "Colors";
    color3.id = "yellow";
    label3.setAttribute("for", "yellow");
    color3.value = label3.innerText = "Yellow";
    div3.appendChild(color3);
    div3.appendChild(label3);
    menudiv.appendChild(div3);
    // for button
    button.onclick = ()=>createCircle();
    button.innerText = "Create";
    menudiv.appendChild(button);
    menu.appendChild(menudiv);
    const h1 = document.createElement("h1");
    h1.innerText = "Press Esc to create a circle and click to delete";
    body.appendChild(menu);
    body.appendChild(h1);
}

window.onclick = function(event) {
    if(event.target.className === "circle") console.log(event.target.id);
}
window.onkeydown = function (event) {
    const radios = document.getElementsByName("Colors");
    if (event.key === "Escape") createCircle();
    if (!donce) {
        document.getElementsByTagName("h1")[0].remove();
        donce = true;
    }
}
function getBody() {
    return document.getElementsByTagName("body")[0];
}
function createCircle() {
    const body = getBody();
    const circle = document.createElement("div");
    const color = getColor();
    circle.classList.add("circle", `${color}-circle`);
    circle.id = `${color}-${globalCount}`;
    globalCount++;
    circle.onclick = (ev) => {removeCircle(ev)};
    body.appendChild(circle);
}
function removeCircle(ev) {
    const element = document.getElementById(ev.target.id);
    element.remove();
}
function getColor() {
    const radios = document.getElementsByName("Colors");
    for (const el of radios) if(el.checked) return el.id;
}