let count = 1;
document.getElementById("radio1").checked = true;

setInterval( function(){
nextImage();
}, 4000)

function nextImage(){
count++;
if(count>4){
count = 1;
}
document.getElementById("radio"+count).checked = true;
}

let count2 = 1;
document.getElementById("radio1c").checked = true;

setInterval( function(){
nextImageCategorias();
}, 4000)

function nextImageCategorias(){
count2++;
if(count2>2){
count2 = 1;
}
document.getElementById("radio"+count2+"c").checked = true;
}
