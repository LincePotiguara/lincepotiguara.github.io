function hexToRgb(hex) {
    // Convert the hexadecimal value to an integer
    const int = parseInt(hex, 16);

    // Split the integer value into 3 8-bit RGB values
    const r = (int >> 16) & 0xff;
    const g = (int >> 8) & 0xff;
    const b = int & 0xff;

    // Return the RGB values as an array
    return [r, g, b];
}

function get_cor_by_valor(pixel) {
    if (pixel[0] > 200 && pixel[1] > 200 && pixel[2] > 200) {
        return BRANCO;
    } else if (pixel[0] < 100 && pixel[1] > 200 && pixel[2] < 100) {
        return VERDE;
    } else if (pixel[0] > 200 && pixel[1] < 100 && pixel[2] > 200) {
        return ROSA;
    } else {
        return PRETO;
    }
  }

const getColorByValue = get_cor_by_valor;

let srcImage = document.getElementById('i');
var rgb = getAverageRGB(srcImage);
document.body.style.backgroundColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';

function getAverageRGB(imgEl) {
    // o próximo passo é pegar os dados dessa imagem para colocar no tabuleiro
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
        
    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */alert('security error, img on diff domain');
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;

}
