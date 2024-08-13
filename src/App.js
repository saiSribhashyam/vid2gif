import React, { useState, useEffect, useCallback } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';

const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [dragActive, setDragActive] = useState(false);

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  useEffect(() => {
    load();
  }, [])

  const convertToGif = async () => {
    ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));
    await ffmpeg.run(
      '-i', 'test.mp4', 
      '-t', '2.5', 
      '-ss', '2.0', 
      '-f', 'gif', 
      'out.gif'
    );
    const data = ffmpeg.FS('readFile', 'out.gif');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
    setGif(url);
  }

  const downloadGif = () => {
    if (gif) {
      const a = document.createElement('a');
      a.href = gif;
      a.download = 'converted.gif';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setVideo(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  return ready ? (
    <div className="App">
      <h1>MadCoder Video to GIF Converter</h1>
      <div className="container">
        <div 
          className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            onChange={handleChange}
            accept="video/*"
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            {video ? 'Change video' : 'Choose a video or drag it here'}
          </label>
          {video && (
            <video controls width="250" src={URL.createObjectURL(video)}>
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        <div className="controls">
          <button onClick={convertToGif} className="convert-btn">Convert to GIF</button>
        </div>
        <div className="output-section">
          <h3>Result</h3>
          {gif && (
            <>
              <img src={gif} width="250" alt="Converted GIF" />
              <button onClick={downloadGif} className="download-btn">Download GIF</button>
            </>
          )}
        </div>
      </div>
      <section>
        <button>Source Code</button>
      </section>
      <footer className="footer">
        <p>&copy; 2024 <a href='https://github.com/saiSribhashyam' target='blank'>Sai Sribhashyam</a> - All rights reserved.</p>
        <p>Powered by FFmpeg and React</p>
        <p><a href='https://github.com/saiSribhashyam'>GitHub</a>    |    <a href='https://www.linkedin.com/in/venkata-anantha-sai-sribhashyam-a96121226/'>LinkedIn</a>     |      <a href="https://www.instagram.com/anantha_sai__s/"> Instagram</a></p>
      </footer>
    </div>
  ) : ( <p className="loading">Loading FFmpeg...</p> );
}

export default App;
