import whisper

model = whisper.load_model("small")

result = model.transcribe("audio.wav", language="en", temperature=0)

text_output = result["text"].lower()

print("Recognized speech:", text_output)

keywords = ["help", "water", "medicine", "pain", "doctor"]

found = False

for word in keywords:
    if word in text_output:
        print("ALERT: Patient needs", word)
        found = True

if not found:
    print("No critical keyword detected")
