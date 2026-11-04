# Awake Driver Buddy

Build step by step fully complete website for this given infomation.
AI Driver Drowsiness Detection System

Project Overview

The AI Driver Drowsiness Detection System is a Python-based computer vision application that monitors eye movements through a webcam and detects prolonged eye closure. It provides a visual warning and audible alert when a potential drowsiness event is detected.

Objectives

Detect facial and eye landmarks in real time.

Calculate the Eye Aspect Ratio (EAR).

Identify prolonged eye closure.

Generate visual and audible alerts.

Demonstrate the use of computer vision for driver-safety research.

Technologies Used

Python

OpenCV

MediaPipe

NumPy

Visual Studio Code

System Requirements

macOS, Windows or Linux

Python environment compatible with the selected dependencies

Webcam

Microphone is not required

How to Run

Create and activate a Python virtual environment.

Install dependencies using python -m pip install -r requirements.txt.

Run python main.py.

Allow webcam access if prompted.

Press Q to close the application.

Methodology

The webcam captures video frames. MediaPipe extracts facial landmarks, and the system calculates EAR for both eyes. When the average EAR stays below the configured threshold for a specified duration, the program displays a warning and plays an alarm.

Limitations

The system may produce false alerts due to lighting, glasses, camera position, individual facial differences, or landmark-detection errors. It is an educational prototype, not a certified driver-safety device.

Future Scope

Yawning detection

Event logging and reporting

Improved calibration

Integration with a vehicle warning interface

Conclusion

This project demonstrates how computer vision can identify a potential sign of driver drowsiness and provide a timely warning in a controlled demonstration environment.




## Build 


- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
