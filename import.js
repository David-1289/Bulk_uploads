const mongoose = require('mongoose');
const fs = require('fs');
const dotenv=require('dotenv')
const express=require('express')
const path=require('path')
const postModel = require('./model');
const axios = require('axios');
const { json } = require('express');

dotenv.config({path:'./config.env'})

const DB = process.env.DB
const app=express()
const port=process.env.PORT || 500;
const multer=require('multer')
const upload=multer({dest:'uploads/'})

app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.set("view engine","ejs")
app.set('views',path.join(__dirname,'views'))

const importdata = async (files,req,res,next) => {
  const data = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));


if(files.length!==data.length+1){
  res.json({
    status:'failed',
    message:'data not match'
  })
}

  try {
    for(let i=0;i<data.length;i++){
    const username = data[i].username;
    const hlink = data[i].hlink;
    const title = data[i].title;
    const desc = data[i].desc;
    
   
    for(let j=1;j<files.length;j++){
      
      if(files[j].originalname===data[i].Image){
        
        var file=fs.readFileSync(files[j].path);
          break;
      }
    }
    

    const res = await postModel.create({
      username,
      title,
      desc,
      hlink,
    });
    console.log(res._id);
    
      const data1 = new FormData();
  
    data1.append(
      'file',
      new Blob([file], { type: 'image/jpeg' }, data[i].Image)
    );
    data1.append('caption', res._id);

    await axios.post('http://127.0.0.1:5000/api/upload/postfile', data1);
    }



fs.rmdir('./uploads',(err)=>{
  console.log('folder is deleted')
})

    res.json({
      status:true
    })

  
  } catch (err) {
   console.log(err)
  }

  
};



app.post('/',upload.array('files'),(req,res,next)=>{
const datapath=req.files[0].path;
fs.readFile(datapath,(err,data)=>{
  fs.writeFile('./data.json',data,(err)=>{
    console.log('file written')
  })
})
  

importdata(req.files,req,res,next)

 
})

app.get('/',(req,res)=>{
  res.render('index')
})


mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(app.listen(port,()=>{
    console.log(`listening at port ${port}`)
  }));
