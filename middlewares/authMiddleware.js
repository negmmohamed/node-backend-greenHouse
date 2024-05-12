function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
    }
    next()
}

module.exports = { checkAuthenticated, checkNotAuthenticated };
