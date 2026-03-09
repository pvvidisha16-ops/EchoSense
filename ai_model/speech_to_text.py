import whisper

model = whisper.load_model("base")

result = model.transcribe("audio.wav")

print("Recognized text:", result["text"])
