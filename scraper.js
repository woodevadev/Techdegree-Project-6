//Requires
let fs = require('fs');
let Crawler = require('crawler');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

//This initializes the csv file
const csvWriter = createCsvWriter({
  path: './data/data.csv',
  header: [
      {id: 'title', title: 'TITLE'},
      {id: 'price', title: 'PRICE'},
      {id: 'url', title: 'URL'},
      {id: 'imageURL', title: 'IMAGEURL'},
  ]
});

//Checks for data folder
//if it doesnt exist it is created
fs.readdir("./data/",function(err, files){
   if (err) {
      console.error('No data folder exists. Creating data folder...')
      fs.mkdir('./data',function(err){
        if (err) {
           return console.error(err);
        }
        console.log("Directory created successfully!");
     });
   }
});

let anArray = [];

//This block goes through the given page
//and finds all of the other links to crawl later
let aPromise = new Promise(
    function(resolve, reject){
      var c = new Crawler({
        maxConnections : 10,
        // This will be called for each crawled page
        callback : function (error, res, done) {
            if(error){
                console.log(error);
            }else{
                var $ = res.$;
    
                var listOfa = $(".products a");
                // $ is Cheerio by default
                //a lean implementation of core jQuery designed specifically for the server
                for(let i = 0; i < listOfa.length; i ++){
                    anArray.push(`http://${res.request.host}/` + $(listOfa[i]).attr('href'));
                }
            }
            done();    
            resolve(anArray);        
        }
    });
    c.queue('http://www.shirts4mike.com/shirts.php');
    }
)

let myJSONString = '';
let i = 0;

//Used a promise to wait for the first 
//crawl to take place
aPromise.then(function(theArray){
    var d = new Crawler({
    rateLimit: 1000,
    maxConnections : 1,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            //Make individual json string
            myJSONString = `{"title":"${$("title").text()}","price":"${$(".price").text()}","url":"${res.request.href}","imageURL":"http://${res.request.host}/` + `${$("img").attr("src")}"}`;                                         

            //parse the string
            var records = [JSON.parse(myJSONString)];
            
            //Append the record to the file
            csvWriter.writeRecords(records)       // returns a promise
                .then(() => {
                    console.log('...Done');
                    i++
            });
        }
        done();     
    }
});
d.queue(theArray);
});
 
 

 
