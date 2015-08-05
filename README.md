# express-sequelize-user
Created for https://github.com/bkniffler/sequelize-revisions

Expose sequelize query functions in express requests that inject the current user in returned objects.
Should work with findAll, findById, findOne, findOrInitialize, findOrCreate, create, build.

## Install
```shell
npm install express-sequelize-user --save
```

## Usage
```javascript
// Bind middlewares
...
app.use(passport.initialize());
app.use(passport.session());
// Step 1: Bind express-sequelize-user
require("express-sequelize-user")(app);
...

var User = sequelize.define("User", {});

// Expose put user
app.put("/api/user/:id", app.isAuthenticated, function (req, res, next) {
   // Step 2: Query
   // Here is the important part, user req.context.findById(model, id) instead of model.findById(id)
   req.context.findById(User, req.params.id).then(function(item){
      // item.context.user is now req.user
      if(!user){
         return next(new Error("User with id " + id + " not found"));
      }
      user.updateAttributes(req.body).then(function(user) {
         res.json(user);
      }).catch(next);
   }).catch(next);
});

// Add a hook
User.addHook("afterUpdate", function(instance){
   if(instance.context && instance.context.user){
      console.log("A user was changed by " + instance.context.user.id);
   }
});
```

