import sounddevice as sd
import numpy as np
import scipy.fftpack
import os

# General settings
SAMPLE_FREQ = 44100 # sample frequency in Hz
WINDOW_SIZE = 44100 # window size of the DFT in samples
WINDOW_STEP = 21050 # step size of window
WINDOW_T_LEN = WINDOW_SIZE / SAMPLE_FREQ # length of the window in seconds
SAMPLE_T_LENGTH = 1 / SAMPLE_FREQ # length between two samples in seconds
windowSamples = [0 for _ in range(WINDOW_SIZE)]

#DEFINED BY CRAWFORD YOUNG
#Set to Guitar Tuner vs Note/Pitch
TUNER = False
#Set to Guitar vs Ukulele
UKULELE = False
#Current String Tuning
ISTRING = "1"
#Error for Tuning
ERROR = 1

# This function finds the closest note for a given pitch
# Returns: note (e.g. A4, G#3, ..), pitch of the tone
CONCERT_PITCH = 440
ALL_NOTES = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]
def find_closest_note(pitch):
  i = int(np.round(np.log2(pitch/CONCERT_PITCH)*12))
  closest_note = ALL_NOTES[i%12] + str(4 + (i + 9) // 12)
  closest_pitch = CONCERT_PITCH*2**(i/12)
  return closest_note, closest_pitch

#DEFINED BY CRAWFORD YOUNG
# Guitar tuner
def tune_to_note(pitch, closestNote):
  #E2 (82.41Hz)
  if ISTRING=="1":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: E2 82.4")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<82.4-ERROR:
      print("Tune up")
    elif pitch>82.4+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #A2 (110Hz)
  elif ISTRING=="2":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: A2 110.0")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<110.0-ERROR:
      print("Tune up")
    elif pitch>110.0+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #D3 (146.83Hz)
  elif ISTRING=="3":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: D3 146.8")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<146.8-ERROR:
      print("Tune up")
    elif pitch>146.8+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #G3 (196.00Hz)
  elif ISTRING=="4":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: G3 196.0")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<196.0-ERROR:
      print("Tune up")
    elif pitch>196.0+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #B3 (246.94Hz)
  elif ISTRING=="5":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: B3 246.9")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<246.9-ERROR:
      print("Tune up")
    elif pitch>246.9+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #E4 (329.63Hz)
  elif ISTRING=="6":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: E4 329.6")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<329.6-ERROR:
      print("Tune up")
    elif pitch>329.6+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  else:
    os.system('cls' if os.name=='nt' else 'clear')
    print("not valid string number")
  return

#DEFINED BY CRAWFORD YOUNG
#Tuner for ukulele
def tune_to_note_uke(pitch, closestNote):
  #G4 (392Hz)
  if ISTRING=="1":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: G4 392.0")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<392.0-ERROR:
      print("Tune up")
    elif pitch>392.0+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #C4 (261.63Hz)
  elif ISTRING=="2":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: C4 261.6")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<261.6-ERROR:
      print("Tune up")
    elif pitch>261.6+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #E4 (329.63Hz)
  elif ISTRING=="3":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: E4 329.6")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<329.6-ERROR:
      print("Tune up")
    elif pitch>329.6+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  #A4 (440.00Hz)
  elif ISTRING=="4":
    os.system('cls' if os.name=='nt' else 'clear')
    print(f"Note to tune to: A4 440.0")
    print(f"Current note: {closestNote} {pitch:.1f}")
    if pitch<440.0-ERROR:
      print("Tune up")
    elif pitch>440.0+ERROR:
      print("Tune down")
    else:
      print("Tuned")
  else:
    os.system('cls' if os.name=='nt' else 'clear')
    print("not valid string number")
  return

# The sounddecive callback function
# Provides us with new data once WINDOW_STEP samples have been fetched
def callback(indata, frames, time, status):
  global windowSamples
  if status:
    print(status)
  if any(indata):
    windowSamples = np.concatenate((windowSamples,indata[:, 0])) # append new samples
    windowSamples = windowSamples[len(indata[:, 0]):] # remove old samples
    magnitudeSpec = abs( scipy.fftpack.fft(windowSamples)[:len(windowSamples)//2] )

    for i in range(int(62/(SAMPLE_FREQ/WINDOW_SIZE))):
      magnitudeSpec[i] = 0 #suppress mains hum

    maxInd = np.argmax(magnitudeSpec)
    maxFreq = maxInd * (SAMPLE_FREQ/WINDOW_SIZE)
    closestNote, closestPitch = find_closest_note(maxFreq)
    if not TUNER:
      os.system('cls' if os.name=='nt' else 'clear')
      print(f"Closest note: {closestNote} {maxFreq:.1f}/{closestPitch:.1f}")
    else:
      if UKULELE:
        tune_to_note_uke(maxFreq, closestNote)
      else:
        tune_to_note(maxFreq, closestNote)
  else:
    print('no input')

# Start the microphone input stream
try:
  with sd.InputStream(channels=1, callback=callback,
    blocksize=WINDOW_STEP,
    samplerate=SAMPLE_FREQ):
    while True:
      pass
except Exception as e:
    print(str(e))