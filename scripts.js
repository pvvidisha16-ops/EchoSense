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

checkKeyword(text)

}

/* restart automatically when speech stops */

recognition.onend=function(){
recognition.start()
}

recognition.start()

}

function checkKeyword(text){

text=text.toLowerCase()

let id=localStorage.getItem("patientID")

if(text.includes("help")){
sendAlert(id,"help")
}

if(text.includes("water")){
sendAlert(id,"water")
}

if(text.includes("pain")){
sendAlert(id,"pain")
}

}

function sendAlert(id,keyword){

fetch("http://127.0.0.1:5000/alert",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
patient_id:id,
keyword:keyword
})

})

}


/* -------- CAREGIVER MODE -------- */

let lastAlertCount=0

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

let response=await fetch("http://127.0.0.1:5000/alerts/"+id)

let data=await response.json()

let list=document.getElementById("alerts")

list.innerHTML=""

data.forEach(a=>{

let li=document.createElement("li")

let message=""

if(a.keyword=="pain"){
message="Patient is in pain"
}
else if(a.keyword=="help"){
message="Patient needs help"
}
else{
message="Patient needs "+a.keyword
}

li.innerText=message+" - "+a.time

list.appendChild(li)

})

if(data.length>lastAlertCount){

let sound=document.getElementById("alertSound")

if(sound) sound.play()

}

lastAlertCount=data.length

}

function clearAlerts(){

fetch("http://127.0.0.1:5000/clear",{method:"POST"})

.then(()=>{
document.getElementById("alerts").innerHTML=""
})

}