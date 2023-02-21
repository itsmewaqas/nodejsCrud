var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const connection = require('../config/config');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        let newName = Date.now() + '-' + file.originalname;
        cb(null, newName)
    }
})
var upload = multer({ storage: storage });

router.post("/API/userADD", upload.single('profilepic'), (req, resp) => {
    let user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password: req.body.password = bcrypt.hashSync(req.body.password, 10),
        cell: req.body.cell,
        gender: req.body.gender,
        createddate: req.body.createddate,
        qualification: req.body.qualification,
        usertype: req.body.usertype,
        profilepic: req.file.filename,
        status: req.body.status,
    }
    let sql1 = 'INsert INTO users SET ?';
    connection.query(sql1, user, (error, result, fields) => {

        if (error) throw error;
        if (error) {
            resp.send("failed to insert id an other table");
        }
        else {
            if (result.length > 0) {
                resp.send(result[0]);
            }
        }

        console.log('user data', user);
        let ulocation = {
            houseno: req.body.houseno,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            userID: result.insertId
        };
        console.log('user location', ulocation);
        let sql2 = 'INsert INTO userslocation SET ?';
        connection.query(sql2, ulocation, (error, result, fields) => {
            if (error) {
                resp.send("failed to insert ulocation userlocation table");
            } else {
                resp.send(result);
            }
        })
    })
});

router.post('/API/userLogin', async (req, resp, next) => {
    var email = req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM users as u INNER JOIN userslocation as ul on u.ID = ul.userID WHERE  u.email = ?', [email], async function (error, results, fields) {
        if (error) error;
        else {
            if (results.length > 0) {
                const comparision = await bcrypt.compare(password, results[0].password);
                if (comparision) {
                    //resp.send(results[0]);
                    resp.status(200).json(results[0]);
                }
                else if (resp.status(400)) {
                    resp.send('Incorrect email and/or Password!');
                }
                resp.end();
            }
            else {
                resp.status(401).send('Invalid email or password.');
                resp.end();
            }
        }
    });
})

router.get("/API/fetchUser", (req, resp) => {
    connection.query("SELECT * FROM users INNER JOIN userslocation ON users.ID = userslocation.userID", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            var location = [];
            for (let i = 0; i < result.length; i++) {
                let locationOBJ = {
                    "ID": result[i].ID,
                    "name": result[i].name,
                    "email": result[i].email,
                    "password": result[i].password,
                    "cell": result[i].cell,
                    "gender": result[i].gender,
                    "createddate": result[i].createddate,
                    "qualification": result[i].qualification.split(","),
                    "usertype": result[i].usertype,
                    "profilepic": result[i].profilepic,
                    "status": result[i].status,
                    "objLocation": {
                        "ID": result[i].LID,
                        "houseno": result[i].houseno,
                        "city": result[i].city,
                        "state": result[i].state,
                        "country": result[i].country,
                        "userID": result[i].userID,
                    }
                }
                location[location.length] = locationOBJ;
            }
            resp.send(location);
        }
    })
});





























// router.route('/API/userADD').post(controller.userADD);

// router.route('/API/userADD', upload.single('profilepic')).post(controller.userADD);



router.put("/API/UpdateProfile", (req, resp) => {
    connection.query(`UPDATE users u , userlocation ul SET 
    u.name = '${req.body.name}',
    u.email = '${req.body.email}',
    u.cell = '${req.body.cell}',
    u.gender = '${req.body.gender}',
    u.createdDate = '${req.body.createdDate}',
    u.qualification = '${req.body.qualification}',
    u.userType = '${req.body.userType}',
    u.profilePic = '${req.body.profilePic}',
    ul.houseNo = '${req.body.houseNo}',
    ul.city = '${req.body.city}',
    ul.state = '${req.body.state}',
    ul.country = '${req.body.country}'
    WHERE u.ID = ul.userID AND u.ID = ${req.body.ID}`, (err, result) => {
        // if (err) throw err;
        if (err) {
            resp.status(400).send({
                message: "error ocurred",
            });
        } else {
            resp.status(200).send({
                message: "user update sucessfully",
                user: req.body
            });
        }
    });
})

router.delete("/API/UserDelete/:id", (req, resp) => {
    connection.query("DELETE FROM users WHERE ID =" + req.params.id, (error, result, fields) => {
        if (error) error;
        resp.send(result);
    });
    console.log(req);
})

// SELECT *
// FROM users
// INNER JOIN userlocation
// ON users.ID = userlocation.userID;
//u.qualification = '${req.body.qualification}',









router.get("/API/getUsers", (req, resp) => {
    connection.query("select * from users", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});

router.get("/API/FetchUsers", (req, resp) => {
    connection.query("select * from users", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});

router.get("/API/Fetchadmin", (req, resp) => {
    connection.query("select * from Admin", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});

router.get("/API/Fetchemployee", (req, resp) => {
    connection.query("select * from employee", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});

router.get("/API/Fetchdepartment", (req, resp) => {
    connection.query("select * from department", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});

router.get("/API/Fetchproject", (req, resp) => {
    connection.query("select * from project", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});

router.get("/API/Fetchtask", (req, resp) => {
    connection.query("select * from tasklist", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});

router.post("/API/addAdminUser", (req, resp) => {
    let users = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password = bcrypt.hashSync(req.body.password, 10),
        cell: req.body.cell,
        gender: req.body.gender,
        position: req.body.position,
    }
    connection.query('INsert INTO admin SET ?', users, (error, result, fields) => {
        if (error) error;
        resp.send(result);
    })
});

router.post("/API/AddEmployee", (req, resp, next) => {

    let user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password = bcrypt.hashSync(req.body.password, 10),
        cell: req.body.cell,
        gender: req.body.gender,
        date: req.body.date,
        qualification: req.body.qualification,
    }

    let sql1 = 'INsert INTO employee SET ?';
    connection.query(sql1, user, (error, result, fields) => {
        if (error) throw error;
        if (error) {
            resp.send("failed to insert id an other table");
        }
        else {
            if (result.length > 0) {
                resp.send(result[0]);
            }
        }
        console.log('user data', user);
        let data = {
            houseno: req.body.location.houseno,
            city: req.body.location.city,
            state: req.body.location.state,
            country: req.body.location.country,
            empid: result.insertId
        };

        console.log('user location', data);
        let sql2 = 'INsert INTO emplocation SET ?';
        connection.query(sql2, data, (error, result, fields) => {
            if (error) {
                resp.send("failed to insert data userlocation table");
            } else {
                resp.send(result);
            }
        })
    })
});

router.put("/API/UpdateEmployee", (req, resp) => {
    const data = [req.body.name, req.body.email];
    connection.query(`UPDATE employee SET name = ?, email = ? where id IN (${[req.body.getIDS]})`, data, (error, result, fields) => {
        console.log(error, result);
        if (error) error;
        resp.send(result);
    });
})



router.post("/API/Profileimg", upload.single('profilePic'), (req, resp) => {

    let profileData = {
        Profile: req.file.filename,
        picName: req.body.picName,
    }
    console.log(profileData);
    // console.log(req);

    connection.query('INSERT INTO picture SET ?', profileData, (error, result, fields) => {
        if (error) error;
        resp.send(result);
    })

    // var sql = "INSERT INTO `picture`(`Profile`) VALUES ('" + req.file.filename + "')";
    // var query = connection.query(sql, function (err, result) {
    //     resp.json({ message: 'uploded' });
    //     console.log(req.file.filename);
    // });

});

router.get("/API/getAllprofile", (req, resp) => {
    connection.query("select * from picture", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            resp.send(result);
        }
    })
});


// https://www.youtube.com/watch?v=4nZ_xirXhPs
// https://www.youtube.com/watch?v=jn3tYh2QQ-g

// router.post("/API/Profileimg", upload.array('profilePic',3), (req, resp) => {
//     console.log(req.files);
//     resp.json({ message: 'uploded' });
// });


// router.get('/API/Username', function (req, resp) {
//     if (req.session.loggedin) {
//         resp.send('Welcome back, ' + req.session.email + '!');
//     } else {
//         resp.send('Please login to view this page!');
//     }
//     resp.end();
// });


router.post("/API/addTask", (req, resp) => {
    // connection.query(`SELECT ID FROM employee where name =?`, [req.body.empName.name], (error, result, fields) => {
    //     if (error) {
    //         resp.send("failed this query");
    //     } else {
    //         resp.send(result);
    //         console.log(result);
    //         let task = {
    //             taskname: req.body.taskname,
    //             date: req.body.date,
    //             taskPriority: req.body.taskPriority,
    //             taskStatus: req.body.taskStatus,
    //             empid: result[0].ID
    //         }
    //         console.log(req.body.empName.name);
    //         console.log('task', task);
    //         connection.query(`INsert INTO tasklist SET ?`, [task], (error, result, fields) => {
    //             if (error) throw error;
    //             if (error) {
    //                 resp.send("task not insert :(");
    //             }
    //             else {
    //                 if (result.length > 0) {
    //                     resp.send(result[0]);
    //                 }
    //             }
    //         })
    //     }
    // })

    // { 
    //     "taskname": "mobile task", 
    //     "date": "{{todayDate}}", 
    //     "taskPriority":"low",
    //     "taskStatus": "pending", 
    //     "empName":{
    //         "name": "kamilrehman"
    //     }
    // }

    let task = {
        taskname: req.body.taskname,
        date: req.body.date,
        taskPriority: req.body.taskPriority,
        taskStatus: req.body.taskStatus,
        empid: req.body.empid
    }
    console.log(task);
    connection.query(`INsert INTO tasklist SET ?`, task, (error, result, fields) => {
        if (error) throw error;
        if (error) {
            resp.send("failed to task creation :(");
        }
        else {
            resp.send(result);
        }
    })
});

router.post("/API/addDepart", (req, resp) => {
    let depart = {
        departmentName: req.body.departmentName,
        createdDate: req.body.createdDate,
        taskid: req.body.taskid
    }
    console.log(depart);
    connection.query(`INsert INTO department SET ?`, depart, (error, result, fields) => {
        if (error) throw error;
        if (error) {
            resp.send("failed to depart creation :(");
        }
        else {
            resp.send(result);
        }
    })
});

router.put("/API/updateDepart", (req, resp) => {
    const data = [req.body.departmentName, req.body.createdDate, req.body.taskid, req.body.ID];
    connection.query("UPDATE department SET departmentName = ?, createdDate = ?, taskid = ? where id = ?", data, (error, result, fields) => {
        if (error) error;
        resp.send(result);
    });
})

router.post("/API/addProject", (req, resp) => {
    let project = {
        projectName: req.body.projectName,
        date: req.body.date,
        depid: req.body.depid
    }
    console.log(project);
    connection.query(`INsert INTO project SET ?`, project, (error, result, fields) => {
        if (error) throw error;
        if (error) {
            resp.send("failed to project creation :(");
        }
        else {
            resp.send(result);
        }
    })
});

router.put("/API/UpdateUser/:id", (req, resp) => {
    const data = [req.body.name, req.body.email, req.body.password, req.body.cell, req.body.address, req.params.id];
    connection.query("UPDATE users SET name = ?, email = ?, password = ?, cell = ?, address = ? where id = ?", data, (error, result, fields) => {
        if (error) error;
        resp.send(result);
    });
})

router.delete("/API/DeleteUser/:id", (req, resp) => {
    connection.query("DELETE FROM users WHERE id =" + req.params.id, (error, result, fields) => {
        if (error) error;
        resp.send(result);
    });
})

router.put("/API/UpdateMultipal", (req, resp) => {
    const data = [req.body.name, req.body.cell];
    idsArray = [42, 44];
    connection.query(`UPDATE users SET name = ?, cell = ? where id IN (${[idsArray]})`, data, (error, result, fields) => {
        console.log(error, result);
        if (error) error;
        resp.send(result);
    });
})

router.post('/API/LoginUser', async (req, resp, next) => {
    var email = req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM admin WHERE email = ?', [email], async function (error, results, fields) {
        if (error) error;
        else {
            if (results.length > 0) {
                // req.session.loggedin = true;
                // req.session.email = email;
                const comparision = await bcrypt.compare(password, results[0].password);
                if (comparision) {
                    resp.send(results[0]);
                }
                else if (resp.status(400)) {
                    resp.send('Incorrect email and/or Password!');
                }
                resp.end();
            }
            else {
                resp.status(401).send('Invalid email or password.');
                resp.end();
            }
        }
    });
})

module.exports = router;



// router.get("/API/FetchUser", (req, resp) => {
//     connection.query("select * from users", (err, result) => {
//         if (err) {
//             console.log('result not found');
//         }
//         else {
//             resp.send(result);
//         }
//     })
// });