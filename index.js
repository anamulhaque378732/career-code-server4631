const express = require("express");
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

const port = process.env.PORT || 5000;

// middleware
require('dotenv').config()
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzupc.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // jobs api
        const jobsCollection = client.db('careerCode4631').collection('jobs');
        const applicationCollection = client.db('careerCode4631').collection('applications');



        app.get('/jobs', async (req, res) => {

            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });



        app.get('/jobs/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const result = await jobsCollection.findOne(query);

            res.send(result)
        });

        // get application data

        app.get('/applications', async (req, res) => {
            const email = req.query.email;
            const query = { applicant: email }

            const result = await applicationCollection.find(query).toArray();
            // bad way to aggregate data

            for (const application of result) {
                const jobId = application.jobId;
                const jobQuery = { _id: new ObjectId(jobId) }
                const job = await jobsCollection.findOne(jobQuery)

                application.title = job.title;
                application.company = job.company;
                application.company_logo = job.company_logo;


            };



            res.send(result)

        });




        // job application related api


        app.post('/applications', async (req, res) => {

            const application = req.body
            console.log(application)
            const result = await applicationCollection.insertOne(application)
            res.send(result)

        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("career code server running")

});

app.listen(port, () => {
    console.log(`career code server running on ${port}`);

})



