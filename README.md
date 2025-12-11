# Digital Signal Filter Visualizer  
Interactive DFT-based signal filtering tool (Low-Pass, High-Pass, Band-Pass)

A fully interactive digital signal processing visualizer built using **JavaScript, HTML/CSS, and Canvas**.  
The tool demonstrates how signals behave in both the **time domain** and **frequency domain**, and how filtering reshapes a signal by modifying its spectral components.

This project accompanies a short mathematical note explaining sampling, the Discrete Fourier Transform (DFT), filtering masks, and signal reconstruction.

---

## Features

### Real-time Fourier analysis**
- Computes the DFT of a signal in the browser  
- Shows magnitude spectrum up to the Nyquist limit  
- Displays both the original and filtered spectra  

### Interactive filtering**
- Low-Pass, High-Pass, and Band-Pass modes  
- Adjustable cutoff frequencies  
- Frequency mask applied directly in the spectral domain  
- Real-time reconstruction using the inverse DFT  

### Clean visual intuition**
- Time-domain: original signal vs. filtered signal  
- Frequency-domain: energy distribution before and after filtering  
- Smooth animations and adjustable update speed  

### Mathematical foundations included**
The project includes a technical write-up covering:
- Sampling and the discrete domain  
- Nyquist frequency and frequency resolution  
- DFT and inverse DFT  
- Ideal frequency masks  
- Spectral leakage  
- Time–frequency intuition (sharp edges = high frequencies)  

---

##  Engineering Concepts Demonstrated

- **Fourier decomposition** (signals as sums of sinusoids)  
- **Frequency-domain filtering**  
- **Ideal vs. real filters**  
- **Windowing and leakage**  
- **Reconstruction via inverse DFT**  
- **Signal shaping through frequency selection**  

These concepts form the backbone of digital signal processing (DSP), communications, RF systems, audio engineering, biomedical signal analysis, and more.

---

##  Why I Built This
This project extends my broader interest in understanding physical and mathematical systems by breaking them into components and rebuilding them from first principles.

It complements my other work in:
- **Electromagnetism and Maxwell’s Equations**  
- **Fourier Series and Harmonic Approximation**  

Together, these tools illustrate how engineers use mathematics to reveal structure inside complex systems.

---

## Technologies Used
- **JavaScript (Canvas)** – signal plotting + DFT + reconstruction  
- **MathJax** – rendering equations  
- **HTML / CSS** – interface and layout  

---

## © 2025 — Yousef Fayad

##  Live Demo  
**Open the visualizer here:**  
https://sef1002.github.io/fs/

