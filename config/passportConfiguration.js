const LocalStrategy = require("passport-local").Strategy;
const argon2 = require("argon2");


async function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUsers = async (email, password, done) => {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return done(null, false, { message: "No user found with that email" });
            }

            if (await argon2.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Uh-oh Your email or password is incorrect" });
            }
        } catch (error) {
            console.error(error);
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);
            return done(null, user);
        } catch (error) {
            console.error(error);
            return done(error);
        }
    });
}

module.exports = initialize;
