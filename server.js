import express from "express";
import route from "./config/routes.js";
import path from 'path';
import engines from 'consolidate'
const app = express();

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'views')))

app.set('views', __dirname + '/views');
app.engine('html', engines.swig)
app.set('view engine', 'html');

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}))
app.use('/', route);
app.use('/home', (req, res) => {
    res.render('index')
})

app.use('/static', express.static(path.join(__dirname, 'public')))

app.listen(5000, () => {
    console.log("listening on 5000");
})