const bcrypt = require("bcryptjs");
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const {usersMongo} = require("../DBModel/DBModel");

passport.serializeUser((user, done) => {
    done(null, user.username);                          //username se guarda en la cookie en la key "passport.user". 
});
  
passport.deserializeUser(async (username, done) => {    //Acá se lee la key "username" de la cookie
    const user = await usersMongo.findOne({username: username});
    done(null, user);
});

passport.use("login", new LocalStrategy(async (username, password, done) => {         //Busca en el body del request las keys "username" y "password" y sus valores los guarda en los dos primeros parametros que pueden llamarse de cualquier manera
    const user = await usersMongo.findOne({username: username});                      //Estos parametros se pasan a "serializerUser"
    if (user) {
        const isOk = bcrypt.compareSync(password, user.password);
        if (isOk) {
            done(null, user);
            return;
        }    
    }
    done(null, false);
}))

passport.use("signup", new LocalStrategy(async (username, password, done) => {        
    const userNameExists = await usersMongo.findOne({username: username});          
    if (!userNameExists) {
        const salt = bcrypt.genSaltSync(10);
        const user = {username: username, password: bcrypt.hashSync(password, salt)};
        await usersMongo.insertMany(user);
        done(null, user);
    } else {
        done(null, false);
    }
}))

