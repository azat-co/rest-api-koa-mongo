const Koa = require('koa')
const Router = require('koa-router')
const BodyParser = require('koa-bodyparser')
const app = new Koa()
const router = new Router()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const MONGO_URL = 'mongodb://localhost:27017'
const ObjectID = mongodb.ObjectID
const logger = require('koa-logger');

const mongo = function (app) {
    MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(client=>client.db('test'))
    .then((connection) => {
        app.people = connection.collection('people')
        console.log('Database connection established')
    })
    .catch((err) => console.error(err))

}
mongo(app)
app.use(logger())
app.use(BodyParser())
router.get('/', async function (ctx) {
    let name = ctx.request.query.name || 'World'
    ctx.body = {message: `Hello ${name}!`}
})
router.post('/', async function (ctx) {
    let name = ctx.request.body.name || 'World'
    ctx.body = {message: `Hello ${name}!`}
})
router.get('/people', async (ctx) => {
    ctx.body = await ctx.app.people.find().toArray()
})
router.put('/people/:id', async (ctx) => {
    let documentQuery = {'_id': ObjectID(ctx.params.id)} // Used to find the document
    let valuesToUpdate = ctx.request.body
    ctx.body = await ctx.app.people.updateOne(documentQuery, valuesToUpdate)
})
// Delete one
router.delete('/people/:id', async (ctx) => {
    let documentQuery = {'_id': ObjectID(ctx.params.id)} // Used to find the document
    ctx.body = await ctx.app.people.deleteOne(documentQuery)
})
router.get('/people/:id', async (ctx) => {
    ctx.body = await ctx.app.people.findOne({'_id': ObjectID(ctx.params.id)})
})
router.post('/people', async (ctx) => {
    ctx.body = await ctx.app.people.insert(ctx.request.body)
})

/*

curl -X POST \
  http://localhost:3000/people \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{"name": "genji", "email": "genji.shimada@polyglot.ninja"}'
*/

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000)
