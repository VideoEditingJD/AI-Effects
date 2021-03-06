import express from "express"
import videoRoutes from './video';
import {speechToText, findWords} from '../utils/ml.utils'
import { upload } from "../utils"
import request from 'request'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'

// var multer  = require('multer')
// var upload = multer({ dest: 'uploads/' })

const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
	res.json({})
})

router.get("/hc", (req, res) => {
	res.sendStatus(200);
})

router.use("/video", videoRoutes)

router.post('/audio', upload.single('audio'), (req, res) => {
  const fileName = req.file.path;
  const duration = req.body.duration;

  speechToText(fileName, duration).then((wordsList) => {
    if (!wordsList) {
      console.log("No one spoke in video!");
      res.send([]);
    }
    else {
      const cuttingList = findWords(wordsList);
      // TODO: cut video with given 'cuttingList' -> cuttingList가 empty list가 아닐때 잘라주기(length 이용)
      // TODO: different captions for each speaker with given 'wordsList[i].speakerTag'
      let tmp = [];
      tmp.push({
        'cut_start': 3.2,
        'cut_end': 7,
      });
      tmp.push({
        'cut_start': 8,
        'cut_end': 10,
      });
      res.send(tmp);
      // res.send(cuttingList);
    }
    
    // temporary host ip... TODO: need to change python-server host
    // request.get('http://127.0.0.1:5000/temp')
    // console.log("get - localhost:5000/temp")
  });

})

module.exports = router
