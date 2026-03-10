import webrtcvad
import pyaudio
import wave
import whisper
import pyttsx3

# ---------------- TEXT TO SPEECH ENGINE ----------------

engine = pyttsx3.init()

# ---------------- VAD SETTINGS ----------------

vad = webrtcvad.Vad(2)  # sensitivity level

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
FRAME_DURATION = 30
CHUNK = int(RATE * FRAME_DURATION / 1000)

audio = pyaudio.PyAudio()

stream = audio.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

print("Listening for patient speech...")

frames = []

# ---------------- VAD DETECTION ----------------

for _ in range(0, int(RATE / CHUNK * 5)):
    data = stream.read(CHUNK)

    if vad.is_speech(data, RATE):

        print("Speech detected! Recording...")

        frames.append(data)

        # record additional audio after speech detected
        for i in range(0, int(RATE / CHUNK * 5)):
            data = stream.read(CHUNK)
            frames.append(data)

        break

print("Recording finished")

stream.stop_stream()
stream.close()
audio.terminate()

# ---------------- SAVE AUDIO ----------------

wf = wave.open("audio.wav", 'wb')
wf.setnchannels(CHANNELS)
wf.setsampwidth(audio.get_sample_size(FORMAT))
wf.setframerate(RATE)
wf.writeframes(b''.join(frames))
wf.close()

# ---------------- WHISPER MODEL ----------------

print("Processing speech...")

model = whisper.load_model("small")

result = model.transcribe(
    "audio.wav",
    language="en",
    temperature=0
)

text_output = result["text"].lower()

print("Recognized speech:", text_output)

# ---------------- KEYWORD DETECTION ----------------

keywords = ["help", "water", "medicine", "pain", "doctor"]

found = False

for word in keywords:

    if word in text_output:

        alert_message = "Patient needs " + word

        print("ALERT:", alert_message)

        # audio alert
        engine.say(alert_message)
        engine.runAndWait()

        found = True

if not found:

    print("No critical keyword detected")
