function loadPatient(){

let id = document.getElementById("patientID").value

if(!id){
alert("Enter Patient ID")
return
}

document.getElementById("loginSection").style.display="none"
document.getElementById("patientSection").style.display="block"

document.getElementById("displayID").innerText="Patient ID : "+id

startListening()

}

let recognition

function startListening(){

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition

recognition = new SpeechRecognition()

recognition.continuous = true

recognition.onresult = function(event){

let text = event.results[event.results.length-1][0].transcript

document.getElementById("speechText").innerText=text

checkKeyword(text)

}

recognition.onend = function(){
recognition.start()
}

recognition.start()

}

function checkKeyword(text){

text=text.toLowerCase()

let id=document.getElementById("patientID").value

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

let lastAlertCount = 0

async function connectPatient(){

let id = document.getElementById("patientLinkID").value

setInterval(()=>{

loadData(id)

},3000)

}

async function loadData(id){

let response = await fetch("http://127.0.0.1:5000/alerts/"+id)

let data = await response.json()

let alertList = document.getElementById("alerts")

alertList.innerHTML=""

data.forEach(a=>{

let li=document.createElement("li")

if(a.keyword=="pain"){
li.innerText="Patient is in pain"
}
else{
li.innerText="Patient needs "+a.keyword
}

alertList.appendChild(li)

})

if(data.length > lastAlertCount){
document.getElementById("alertSound").play()
}

lastAlertCount = data.length

}

function clearAlerts(){

fetch("http://127.0.0.1:5000/clear",{
method:"POST"
})

.then(()=>{
document.getElementById("alerts").innerHTML=""
lastAlertCount = 0
})

}