// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

//variables
let canvas = document.getElementById('user-image');
let ctx = canvas.getContext('2d');

let select = document.getElementById('voice-selection');
let vol = document.querySelector("[type='range']").value / 100;

let textTop = document.getElementById('text-top');
let textBot = document.getElementById('text-bottom');

let submitBtn = document.querySelector("[type='submit']");
let clearBtn = document.querySelector("[type='reset']");
let readBtn = document.querySelector("[type='button']");

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  ctx.clearRect(0, 0, 400, 400); //clear canvas

  //fill canvas with black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  const dim = getDimmensions(400, 400, img.width, img.height);
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

const imgInput = document.getElementById('image-input');
imgInput.addEventListener('change', () => {
  img.src = URL.createObjectURL(imgInput.files[0]);
  img.alt = imgInput.files[0]["name"];
});

const form = document.getElementById('generate-meme');
form.addEventListener('submit', (event) => {
  event.preventDefault();

  //draw text
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "30px sans-serif";
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.textBaseline = "top";
  ctx.strokeText(textTop.value, 200, 10);
  ctx.fillText(textTop.value, 200, 10);
  ctx.textBaseline = "bottom";
  ctx.strokeText(textBot.value, 200, 395);
  ctx.fillText(textBot.value, 200, 395);

  //toggle buttons
  submitBtn.disabled = true;
  clearBtn.disabled = false;
  readBtn.disabled = false;
});

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, 400, 400); //clear canvas

  submitBtn.disabled = false;
  clearBtn.disabled = true;
  readBtn.disabled = true;
});

readBtn.addEventListener('click', () => {
  let voices = speechSynthesis.getVoices();

  let sayTop = new SpeechSynthesisUtterance(textTop.value);
  let sayBot = new SpeechSynthesisUtterance(textBot.value);

  let selectedOption = select.selectedOptions[0].getAttribute('data-name');
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      sayTop.voice = voices[i];
      sayBot.voice = voices[i];
    }
  }
  sayTop.volume = vol;
  sayBot.volume = vol;

  speechSynthesis.speak(sayTop);
  speechSynthesis.speak(sayBot);
});

const slider = document.getElementById('volume-group');
slider.addEventListener('input', () => {
  let val = document.querySelector("[type='range']").value;
  vol = val / 100;

  let volIcon = document.querySelector('img');
  if (val > 66) {
    volIcon.src = "./icons/volume-level-3.svg";
    volIcon.alt = "Volume Level 3";
  } else if (val > 33 && val < 67) {
    volIcon.src = "./icons/volume-level-2.svg";
    volIcon.alt = "Volume Level 2";
  } else if (val > 0 && val < 34) {
    volIcon.src = "./icons/volume-level-1.svg";
    volIcon.alt = "Volume Level 1";
  } else {
    volIcon.src = "./icons/volume-level-0.svg";
    volIcon.alt = "Volume Level 0";
  }
});

//populate voice selection
speechSynthesis.addEventListener('voiceschanged', () => {
  select.disabled = false;

  let voices = speechSynthesis.getVoices();
  select.remove(0);

  for(let i = 0; i < voices.length; i++) {
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    select.appendChild(option);
  }
})

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
