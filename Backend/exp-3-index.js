require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { default: mongoose } = require('mongoose');
const { MongoClient } = require('mongodb');
const app = express();
const urlParser = require('url')
const dns = require('dns')
const url = 'mongodb+srv://sanjai:<password>@cluster0.jgsqj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
// Basic Configuration  
const port = process.env.PORT || 3000;

mongoose.connect(url).then(()=>{
  console.log("connected")
  getList()
}).catch((err)=>console.log(err))

const client = new MongoClient(url);

const getList = async()=> {
  await console.log(client.db().admin().listDatabases())
}


const db = client.db("urlShortner");
const urls = db.collection("url")
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', async function(req, res) {
  console.log(req.body);
  const url = req.body.url;

  // Parse the hostname from the URL
  const hostname = urlParser.parse(url).hostname;

  // Perform DNS lookup using the parsed hostname
  dns.lookup(hostname, async (err, address, family) => {
    if (err || !address) {
      res.json({ error: 'invalid url' });
      return;
    }

    console.log('address: %j family: IPv%s', address, family);
    const urlcount = await urls.countDocuments({});
    const urlDoc = {
      url: url,
      short_url: urlcount,
    };
    
    await urls.insertOne(urlDoc).then((response) => console.log(response));

    res.json({
      original_url: url,
      short_url: urlcount,
    });
  });
});

app.get('/api/shorturl/:number', async function(req, res) {
  console.log(req.params.number)
  const shorturl = req.params.number;
  const urlDoc = await urls.findOne({short_url:+req.params.number})
  console.log(urlDoc)
  // res.json({url : urlDoc.url}) 
  res.redirect(urlDoc.url)
});
 

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
 