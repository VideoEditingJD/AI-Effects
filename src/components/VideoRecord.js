import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components'
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import 'webrtc-adapter';
import RecordRTC from 'recordrtc';
import Record from 'videojs-record/dist/videojs.record.js';
import 'videojs-record/dist/css/videojs.record.css';

const videoJsOptions = {
	controls: true,
	//width: 320,
	//height: 240,
	fluid: false,
	plugins: {
		/*
		// wavesurfer section is only needed when recording audio-only
		wavesurfer: {
				src: 'live',
				waveColor: '#36393b',
				progressColor: 'black',
				debug: true,
				cursorWidth: 1,
				msDisplayMax: 20,
				hideScrollbar: true
		},
		*/
		record: {
			audio: true,
			video: true,
			maxLength: 120,
      debug: true,
      // convertEngine: 'ffmpeg.js',
      // // convert recorded data to MP3
      // convertOptions: ['-f', 'mp4', '-codec:v'],
      // // convertOptions: ['-f', 'mp4', '-codec:v', 'libmp3lame', '-qscale:a', '2'],
      // // specify MP3 output mime-type
      // pluginLibraryOptions: {
      //   outputType: 'audio/mp4'
      // },
      // // use MP4 encoding worker (H.264 & AAC & MP3 encoders)
      // convertWorkerURL: '../../node_modules/ffmpeg.js/ffmpeg-worker-mp4.js'
		}
	}
};

const Wrapper = styled.div`
	position: relative;
	width: 100vw;
	min-height: 100vh;
	height: 100vh;
	scroll-snap-align: start;
`

const Overlay = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	
	.instruction {
		position: absolute;
		top: calc(50% + 40px);
		left: 2%;
		color:#f3f3f3;		
		font-family: 'BebasNeue';
		font-size: 12vmin;
		font-weight: 700;
		font-stretch: 200%;
		letter-spacing: 14px;
	}
	
	${props => props.show ? css`
		.instruction {
			z-index: 10;
		}
	` : css`
		z-index: 0;
	`}
`

const VideoWrapper = styled.video`
	width: 100%;
	height: 100%;
`


const Instructions = {
	first: <>Record Your<br/> First Video</>,
	second: <>Record Your<br/> Second Video</>,
  faceBlur1: <>Record Your<br/> Face blur video</>,
  tongueSlip: <>Record Your<br/> Text Video</>,
}
const VideoRecord = ({ id, processVideo }) => {
	let player;
	let videoNode = useRef (null);

	const [overlay, setOverlay] = useState (true);

	const measuredRef = useCallback(node => {
		if (node !== null) {
			videoNode = node;
			player = videojs (videoNode, videoJsOptions, () => {
				var version_info = 'Using video.js ' + videojs.VERSION +
					' with videojs-record ' + videojs.getPluginVersion('record') +
					' and recordrtc ' + RecordRTC.version;
				videojs.log(version_info);
			})

			// device is ready
			player.on('deviceReady', () => {
				setOverlay (false)
				console.log('device is ready!');
			});

			// user clicked the record button and started recording
			player.on('startRecord', () => {
				console.log('started recording!');
			});

			// user completed recording and stream is available
			player.on('finishRecord', () => {
				// recordedData is a blob object containing the recorded data that
				// can be downloaded by the user, stored on server etc.
				console.log('finished recording: ', player.recordedData);

				processVideo (id, player.recordedData);
				// Create an instance of FormData and append the video parameter that
				// will be interpreted in the server as a file
				// let formData = new FormData();
				// formData.append('video', player.recordedData.video);
      });
      
      // converter started processing
      // player.on('startConvert', function() {
      //   console.log('started converting!');
      // });
      // // converter completed and stream is available
      // player.on('finishConvert', function() {
      //   // the convertedData object contains the recorded data that
      //   // can be downloaded by the user, stored on server etc.
      //   console.log('finished converting: ', player.convertedData);
      //   processVideo (id, player.convertedData);
      // });

			// error handling
			player.on('error', (element, error) => {
				console.warn(error);
			});

			player.on('deviceError', () => {
				console.error('device error:', player.deviceErrorCode);
			});

			//player.record ().getDevice ();

			return () => {
				player.dispose ();
			}
		}
	}, []);

	const startRecord = useCallback (() => {
		if (!player) return;
		try {
			player.record().start();
		} catch (error) {
			player.on('deviceReady', () => {
				player.record().start();
			});
		}
	})

	const stopRecord = useCallback (() => {
		if (!player) return;
		player.record ().stop ();
	})

	return (
		<Wrapper>
			<Overlay className="overlay" show={overlay}>
				<div className="instruction">
					{Instructions[id]}
				</div>
				{/*<button onClick={startRecord} >Record</button>*/}
				{/*<button onClick={stopRecord} >Stop</button>*/}
			</Overlay>
			<div data-vjs-player>
				<VideoWrapper ref={measuredRef} className="video-js vjs-default-skin" playsInline></VideoWrapper>
			</div>
		</Wrapper>
	);
}

VideoRecord.propTypes = {
	id: PropTypes.string.isRequired,
}

VideoRecord.defaultProps = {
	processVideo: (x) => x,
}

export default VideoRecord;
