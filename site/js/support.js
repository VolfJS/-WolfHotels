const messages = document.getElementById("chat-messages"),
  input = document.querySelector("#chat-input-text");

var lastMessages = [];
document.querySelector("#send_message_form").addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});
document.querySelector("#chat-input-text").addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    e.preventDefault();
    return sendMessage();
  }
});
let imageFile = document.getElementById("image-file");
function sendImage(){
  imageFile.focus()
  imageFile.click();
}
imageFile.addEventListener("change", (e) => {
  if(imageFile.files.length != 1) return;
  let file = imageFile.files[0];
  if(!file.type.startsWith("image")) return;
  sendNImage(file);
});
async function sendNImage(file){
  let resFile = await getBase64(file);
  imageFile.value = "";
  addMessage("client", resFile, true);
  axios.post("/api/support/sendImage", {
    supportToken: INFO.supportToken,
    image: resFile
  });
}
function getBase64(file) {
 return new Promise((res, rej) => {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     res(reader.result);
   };
   reader.onerror = function (error) {
     rej(error);
   };
  });
}
function addMessage(side, message, image) {
  let inn = message;
  if(image){
    inn = '<img class="image-message" src="' + message + '" width="300" height="1000"/>';
  }
  messages.innerHTML +=
    '<div class="chat-message is-' +
    side +
    '">' +
    '<div class="chat-message__content">' +
    '<div class="chat-message__bubble-wrapper">' +
    '<div class="chat-message__bubble chat-bubble chat-bubble--' +
    side +
    ' js-message-bubble js-open-chat">' +
    '<div class="chat-bubble__inner">' +
    '<div class="chat-bubble__message">' +
    '<span class="chat-bubble__message-text parsed-text parsed-text--message parsed-text' +
    (side == "client" ? "--dark-bg" : "--very-light-bg") +
    '">' +
    inn +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";
}
function sendMessage() {
  var message = input.value.replace(/\s+/g, " ").trim();
  if (message.length < 1) return;
  addMessage("client", message);
  axios.post("/api/support/sendMessage", {
    supportToken: INFO.supportToken,
    message,
  });

  document.querySelector(".chat-scroller").scrollTop =
    document.querySelector(".chat-scroller").scrollHeight;
  input.value = "";
}

function playAudio(){
    const audio = new Audio();
    audio.src = "/audio/new_message.mp3";
    audio.autoplay = true;
    audio.play();
    audio.onended = function (){
        audio.pause();
        delete audio;
    }
}

function updateMessages(without_sound=false) {
  axios
    .post("/api/support/getMessages", {
      supportToken: INFO.supportToken,
    })
    .then((response) => {

      var have_new_messages = response.data.messages.filter(a => !lastMessages.find(b => a.id == b.id))

      lastMessages = response.data.messages;

      if (have_new_messages.length < 1) return;

      if ( !without_sound ) have_new_messages.map(v => v.messageFrom == 0 && playAudio());
      messages.innerHTML = "";
      response.data.messages.forEach((v) => {
        if(v.image) return addMessage(v.messageFrom == 1 ? "client" : "operator", v.image, true);
        addMessage(v.messageFrom == 1 ? "client" : "operator", v.message)
      });

      window.parent.document.querySelector("#chatra").style.display = "block";
      window.parent.document.querySelector(".support-circle").style.display = "none";


      document.querySelector(".chat-scroller").scrollTop =
        document.querySelector(".chat-scroller").scrollHeight;

    }).catch(err=>err).finally(() => setTimeout(updateMessages, 1500))
}

updateMessages(true);