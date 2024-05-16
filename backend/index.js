import express from "express"
import { Sequelize, DataTypes } from "sequelize"
import cors from "cors"
import bcrypt from "bcrypt"
/// we use bcrypt to hash the password , so when a user register his password is sent crypted to the database


const app = express()
app.use(cors())
app.use(express.json())

const sequelize = new Sequelize("FlavorFlight", "Selim", "Maken_wochen987", {
  host: "localhost",
  dialect: "mysql"
})

                          //// user model ////

const User = sequelize.define("User", {
  username : {
    type : DataTypes.STRING,
    allowNull : false,
    unique : true
  },
  email : {
    type: DataTypes.STRING,
    allowNull : false,
    unique : true
  },
  password : {
    type : DataTypes.STRING,
    allowNull : false
  }
}) 



                         //// resto model ////


const Restaurant = sequelize.define("Restaurant", {
  name : {
    type : DataTypes.STRING,
    allowNull : false
  },
  cuisine : {
    type : DataTypes.STRING,
    allowNull : false
  },
  address : {
    type : DataTypes.STRING,
    allowNull : false
  },
  rating : {
    type : DataTypes.FLOAT,
    allowNull : false
  },
  imageUrl : {
    type : DataTypes.STRING,
    allowNull : false
  }
}, {
  tableName: "restaurant",
  timestamps: false
})




sequelize.sync({force: false }).then(() => {
  console.log("DB HAS BEEN CREATED")
})
////// force:false means that the already existant tables in the db will not be dropped


app.get("/", (req, res) => {
  res.json("welcome to Flavor Flight")
})




                     ////Registration///


app.post("/register", async (req, res) => {
  try {
    const {username, email, password } = req.body
    var hashedPassword = await bcrypt.hash(password, 10)
    /// here where we hash the password with bcrypt before sending it to the db
    /// 10 is the salt rounds what means the complexity of the hashing algorithm

    var user = await User.create({ username, email, password: hashedPassword})
    res.json (user)
  }catch (err) {
    res.status(400).json({ message: err.message })
  }
})

                             ////login////


app.post("/login",async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({where: {username}
    })
    if (!user) {
      throw new Error("user is not found")
    }



    /////// we compare the password provided by the user in the input with the password in the db
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error("wrong password")
    }
    res.json({ message: "login successful", user })
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
})

                              //// now we'll start the CRUD////
                       ///// find all to retrieve all the restos ////


app.get("/restaurants", async (req, res) => {
  try {
    var restaurants = await Restaurant.findAll ()
    res.json (restaurants)
  } catch(err) {
    console.log(err)
    res.status(500).json({ message: "error"})
  }
})

                                //// add a new resto ////

app.post("/restaurants", async (req, res) => {
  try {
    var { name, cuisine, address, rating, imageUrl} = req.body
    var restaurant = await Restaurant.create({ name, cuisine, address, rating, imageUrl})
    res.json(restaurant)
  } catch(err) {
    res.status(500).json({ message: "error" })
  }
})

                                      
                             ///// delete a resto by id ///
 
app.delete("/restaurants/:id", async (req, res) => {
  try {
    var restaurantId = req.params.id
    await Restaurant.destroy({ where: {id: restaurantId} })
    res.json({message: "Restaurant deleted"})
  } catch(err) {
    res.status(500).json({ message: "error"})
  }
})



                        ///// update a resto ////

app.put("/restaurants/:id", async (req, res) => {
  try {
    var restaurantId = req.params.id
    var {name, cuisine, address, rating, imageUrl} = req.body
    var [updated] = await Restaurant.update({ name, cuisine, address, rating, imageUrl }, { where: { id:restaurantId } })
    if (updated) {
      const updatedRestaurant = await Restaurant.findOne({where: { id: restaurantId } })
      res.json(updatedRestaurant)
    } else {
      throw new Error("Restaurant is not found")
    }
  } catch (err) {
    res.status(500).json({ message: "error"})
  }
})

app.listen(8000,() => {
  console.log("connected ")
})
