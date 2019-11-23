'use strict';

let path = require('path');
let express = require('express');
let morgan = require('morgan');
let mysql = require('mysql');
let bodyParser = require('body-parser');
let session = require('express-session');

let pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: '###',
    password: '###',
    database: '###'
});

let app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'key',
    secure: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
}));

app.get('/ad', (_req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'admin.html'));
});

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.get('/main.js', (_req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'main.js'));
})

app.get('/main.css', (_req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'main.css'));
});

//visitor count
let visitors = 0;
app.get('/visitors', (_req, res) => {
    visitors = visitors + 1;
    res.send(visitors.toString());
});

//search endpoint
app.get('/teacher/:teacherName', (req, res) => {
    pool.query("SELECT * FROM Teacher WHERE TName = ? ", [req.params.teacherName], (err, result) => {
        if (err) {
            res.status(500).send(err.toString());
        }
        let data = result[0];
        if (data === undefined) {
            res.send('<html><body><div style="text-align:center">Details Not Found!</div></ody></html>');
        } else {
            /*  let TName = result[0].TName;
              let Desc = result[0].Description;
              let TMail = result[0].TMail;
              let TContact = result[0].TContact;
              let TBranch = result[0].TBranch;
              let Branch = TBranch.split('$');
              let b1 = Branch.join('<br>');
             res.send(`<body><h1>${TName}</h1><h1>${Desc}</h1><h1>${TMail}</h1><h1>${TContact}</h1><h1>${b1}</h1></body>`);      
             send teacher data
             */

            res.send(JSON.stringify(result[0]));
        };
    })
});
//end of search endpoint

//user login
app.post('/ulogin', (req, res) => {
    let id = req.body.id;
    let password = req.body.password;
    pool.query('SELECT * from Student WHERE StudentId=?', [id], function (err, result) {
        if (err) {
            res.status(500);
            res.send(err.toString());
        } else {
            if (result[0] === [0] || result[0] === undefined) {
                //search id
                res.status(403);
                res.send('id is invalid');
            } else {
                //match password
                let dbString = result[0].Password;
                if (password === dbString) {
                    // set session and cookie
                    let sess = req.session;
                    sess.userLogin = { userId: result[0].StudentId };
                    res.status(200);
                    res.send(`Your Id Is-- ${req.session.userLogin.userId}`);
                } else {
                    res.status(403);
                    res.send('password is invalid');
                }
            }
        }
    });
});

//rating endpoint
app.get('/rateTeacher/:teacherName', (req, res) => {
    let TN = req.params.teacherName;
    if (typeof TN === "undefined") { res.send("Please Provide a Name to Search!") }
    if (req.session.userLogin.userId) {
        pool.query("SELECT SBranch from Student where StudentId=?", [req.session.userLogin.userId], function (err, data) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                pool.query("SELECT TeacherId,TBranch from Teacher where TName=?", [TN], (err, data1) => {
                    if (err) {
                        res.status(500).send(err.toString());
                    } else {
                        if (data1.length > 0) {
                            let t = data1[0].TBranch.split('$');
                            if (data[0].SBranch === t[0] || data[0].SBranch === t[1]) {
                                let sess = req.session;
                                sess.techId = { TId: data1[0].TeacherId };
                                //  res.send("Ok You Got to rate him!");
                                res.sendFile(path.join(__dirname, 'ui', 'rating.html'));
                            } else {
                                res.send("<h1>Sorry You Cannot rate this teacher<h1>");
                            }
                        } else {
                            res.send("No Teacher Found");
                        }
                    }
                });
            };
        });
    } else {
        res.send("Login Again");
    }
});

app.post("/feedback", (req, res) => {
    let rating = req.body.rating;
    if (req.session && req.session.userLogin.userId) {
        if (req.session && req.session.techId.TID) {
            pool.query("INSRET INTO Rating(TeacherId,rating) VALUES ?,?", [req.session.techId.TID, rating], (err, _result1) => {
                if (err) {
                    res.status(500).send(err.toString());
                } else {
                    res.send("<h1>Thank You for rating the Faculty.</h1>");
                }
            });
        }
    }
});

//test the rating page
app.get('/rate', (_req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'rating.html'));
});

//logout from the system
app.get('/logout', (req, res) => {
    delete req.session.userLogin.userId;
    res.send('Logged Out Successfully');
});

//all admin api's
//admin login
app.post('/alogin', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    pool.query('SELECT * from admin WHERE id=?', [username], function (err, result) {
        if (err) {
            res.status(500);
            res.send(err.toString());
        } else {
            if (result[0] === [0] || result[0] === undefined) {
                //search id
                res.status(403);
                res.send('id is invalid');
            } else {
                //match password
                let dbString = result[0].password;
                if (password === dbString) {
                    // set session and cookie
                    let sess = req.session;
                    sess.userLogin = { userId: result[0].id };
                    res.sendFile(path.join(__dirname, 'ui', 'admin.html'));
                } else {
                    res.status(403);
                    res.send('password is invalid');
                }
            }
        }
    });
});


app.post('/addStu', (req, res) => {
    let sid = req.body.sid;
    let sname = req.body.sname;
    let sbranch = req.body.sbranch;
    let smail = req.body.smail;
    let scontact = req.body.scontact;
    let pass = req.body.pass;
    pool.query('INSERT INTO Student VALUES (?,?,?,?,?,?)', [sid, sname, sbranch, smail, scontact, pass], (err) => {
        if (err) {
            res.status(500);
            res.send(err.toString());
        } else {
            res.send("Data Updated Successfully");
        }
    });
});

app.post('/addTec', (req, res) => {
    let TeacherId = req.body.tid;
    let TName = req.body.tname;
    let Description = req.body.desc;
    let TMail = req.body.tmail;
    let TContact = req.body.tcontact;
    let TBranch = req.body.tbranch;
    pool.query('INSERT INTO Teacher VALUES (?,?,?,?,?,?)', [TeacherId, TName, Description, TMail, TContact, TBranch], (err) => {
        if (err) {
            res.status(500);
            res.send(err.toString());
        } else {
            res.send("Teacher Details Updated Successfully");
        }
    });
});


let port = 8080;
app.listen(port);
console.log(`Webapp is listening on port ${port}`);
