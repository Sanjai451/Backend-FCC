const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { type } = require('express/lib/response')
require('dotenv').config()
const url = 'mongodb+srv://sanjai:sanjai@cluster0.jgsqj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
app.use(cors())
// app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const UserSchema = new mongoose.Schema({
  "username": String,
})
const User = mongoose.model('User',UserSchema)

const ExcersizeSchema = new mongoose.Schema({
      user_id: {
        type:String,
        required:true
      },
      description: String,
      duration: Number,
      date: Date  
})
const Excersize = mongoose.model('Excersize',ExcersizeSchema)

mongoose.connect(url).then(()=>{
  console.log("connected")
}).catch((err)=>console.log(err))

app.get('/api/users', async(req, res) => {
  const users = await User.find({}).select("_id username")
  if(!users){
    res.send("Nope")
  }else{
    res.json(users)
  }
});

app.post('/api/users', async(req, res) => {
  console.log(req.body)
  const dataObj = User(req.body)
  const data = await dataObj.save()
  console.log(data)
  res.json(data)
});
//670aace686b3c771a6685ae4
 

app.post('/api/users/:_id/exercises', async(req, res) => {
  const id = req.params._id;

  console.log(req.body.description)
  console.log(req.params._id)
  const {description,duration,date} = req.body

  try {
    const user = await User.findById(req.params._id)
    console.log(`found ${user}`)
    if(!user) {
      res.send("could not find the user")
    }
    else{
      const excersizeobj = new Excersize({
        user_id : user._id,
        description,
        duration,
        date:date?new Date(date):new Date()
      })
      const excersize = await excersizeobj.save()
      console.log("saved")
      res.json({
        _id:user._id,
        username:user.username,
        description:excersize.description,
        duration:excersize.duration,
        date:new Date(excersize.date).toDateString()
      })
      // res.json(excersize)
    }
  } catch (error) {
    console.log('!!!!!!!!!Error')
    res.send("Error while Saving")
  }
});

app.get('/api/users/:_id/logs',async(req,res)=>{
  const {from, to, limit } = req.query;
  const id = req.params._id;
  const user = await User.findById(id)
  if(!user) {
    res.send("Could not find user");
    console.log("user not found")
    return;
  }
  let dateObj = {}
  if(from){
    dateObj["$gte"] = new Date(from)
  }
  if(to){
    dateObj["$lte"] = new Date(to);
  }
  let filter = {
    user_id:id
  }
  if(from || to){
    filter.date = dateObj;
  }


  const excersize = await Excersize.find(filter).limit(+limit??500)

  const log = excersize.map((e) =>({
    description:e.description,
    duration:e.duration,
    date : e.date.toDateString()
}))

  res.json({
    username : user.username,
    count:excersize.length,
    _id:user._id,
    log
  })
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
