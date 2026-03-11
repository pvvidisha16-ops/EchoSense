/* -------- PATIENT MODE -------- */

function loadPatient(){

let id = document.getElementById("patientID").value

if(!id){
alert("Enter Patient ID")
return
}

localStorage.setItem("patientID", id)

document.getElementById("loginSection").style.display="none"
document.getElementById("patientSection").style.display="block"

document.getElementById("displayID").innerText="Patient ID : "+id

}

let recognition
let listening=false

function startListening(){

if(listening) return

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition

if(!SpeechRecognition){
alert("Use Google Chrome for voice recognition")
return
}

recognition=new SpeechRecognition()
recognition.continuous=true
recognition.lang="en-US"

recognition.onstart=function(){
listening=true
document.getElementById("speechText").innerText="Listening..."
}

recognition.onresult=function(event){

let text=event.results[event.results.length-1][0].transcript

document.getElementById("speechText").innerText=text

sendSpeech(text)

}

recognition.onend=function(){
recognition.start()
}

recognition.start()

}

function sendSpeech(text){

let id=localStorage.getItem("patientID")

fetch("http://192.168.20.113:5000/alert",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
patient_id:id,
speech:text
})

})

}


/* -------- AI VOICE ALERT -------- */

function speakAlert(message){

window.speechSynthesis.cancel()

let speech = new SpeechSynthesisUtterance(message)

speech.lang="en-US"
speech.rate=1
speech.pitch=1
speech.volume=1

window.speechSynthesis.speak(speech)

}


/* -------- CAREGIVER MODE -------- */

let lastAlertCount=0
let lastAlertElement=null
let escalatedAlerts={}

function connectPatient(){

let id=document.getElementById("patientLinkID").value

if(!id){
alert("Enter Patient ID")
return
}

localStorage.setItem("patientID",id)

document.getElementById("dashboard").style.display="block"

loadData(id)

setInterval(()=>{
loadData(id)
},3000)

}

async function loadData(id){

let response=await fetch("http://192.168.20.113:5000/alerts/"+id)

let data=await response.json()

let list=document.getElementById("alerts")

list.innerHTML=""

/* update alert counter */

let counter=document.getElementById("alertCount")
if(counter){
counter.innerText=data.length
}

/* show alerts */

data.forEach(a=>{

let li=document.createElement("li")

let message=""

if(a.intent=="emergency"){
message="EMERGENCY ALERT"
li.classList.add("emergency")
}

else if(a.intent=="medical pain"){
message="PATIENT IN PAIN"
li.classList.add("pain")
}

else if(a.intent=="need water"){
message="PATIENT NEEDS WATER"
li.classList.add("water")
}

let alertKey = a.time + a.speech

li.dataset.key = alertKey

li.innerHTML = message+" - "+a.time+" ("+a.speech+")"

if(escalatedAlerts[alertKey]){

li.classList.remove("emergency","pain","water")
li.classList.add("escalated")

li.innerHTML = "<span class='tag'>ESCALATED</span> " + li.innerHTML

}

list.prepend(li)

lastAlertElement = li

})


/* -------- SHOW POPUP ONLY FOR NEW ALERT -------- */

if(data.length > lastAlertCount){

let latestAlert = data[data.length - 1]

let popup=document.getElementById("alertPopup")
let overlay=document.getElementById("popupOverlay")
let text=document.getElementById("popupText")

let popupMessage=""

/* SIMPLE MESSAGES (NO PATIENT ID) */

if(latestAlert.intent=="emergency"){
popupMessage="Emergency detected"
}

else if(latestAlert.intent=="medical pain"){
popupMessage="Patient is in pain"
}

else if(latestAlert.intent=="need water"){
popupMessage="Patient needs water"
}

if(popup && text){

text.innerText = popupMessage

popup.style.display="block"

if(overlay){
overlay.style.display="block"
}

/* AI VOICE */

speakAlert(popupMessage)

}

let sound=document.getElementById("alertSound")
if(sound) sound.play()

}

lastAlertCount=data.length

}


/* -------- ACKNOWLEDGE ALERT -------- */

function acknowledgeAlert(){

document.getElementById("alertPopup").style.display="none"

let overlay=document.getElementById("popupOverlay")
if(overlay){
overlay.style.display="none"
}

}


/* -------- ESCALATE ALERT -------- */

function escalateAlert(){

document.getElementById("alertPopup").style.display="none"

let overlay=document.getElementById("popupOverlay")
if(overlay){
overlay.style.display="none"
}

if(lastAlertElement){

let key = lastAlertElement.dataset.key

escalatedAlerts[key] = true

lastAlertElement.classList.remove("emergency","pain","water")

lastAlertElement.classList.add("escalated")

lastAlertElement.innerHTML =
"<span class='tag'>ESCALATED</span> " + lastAlertElement.innerHTML

}

alert("Alert escalated to backup caregiver")

}


/* -------- CLEAR ALERTS -------- */

function clearAlerts(){

fetch("http://192.168.20.113:5000/clear",{method:"POST"})

.then(()=>{

document.getElementById("alerts").innerHTML=""

let counter=document.getElementById("alertCount")
if(counter){
counter.innerText="0"
}

escalatedAlerts = {}

})

}