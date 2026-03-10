import webrtcvad
import pyaudio
import wave

vad = webrtcvad.Vad(2)  # sensitivity level (0–3)

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

print("Listening for speech...")

frames = []

for _ in range(0, int(RATE / CHUNK * 5)):
    data = stream.read(CHUNK)

    if vad.is_speech(data, RATE):
        print("Speech detected! Recording...")
        frames.append(data)

        for i in range(0, int(RATE / CHUNK * 5)):
            data = stream.read(CHUNK)
            frames.append(data)

        break


print("Recording finished")

stream.stop_stream()
stream.close()
audio.terminate()

wf = wave.open("audio.wav", 'wb')
wf.setnchannels(CHANNELS)
wf.setsampwidth(audio.get_sample_size(FORMAT))
wf.setframerate(RATE)
wf.writeframes(b''.join(frames))
wf.close()
