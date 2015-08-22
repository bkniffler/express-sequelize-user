// Return express middleware that exposes sequelize query equivalents in req.context with user injected in
// object instances
//
// e.g. req.context.findById(User, 1) => {dataValues: {id: 1}, context}
//
// requires req.user to be available
module.exports = function(app, options){
   app.use(function(req, res, next){
      if(!req.context){
         req.context = {};
      }
      var arrays = ["findAll"];
      var singles = ["findById", "findOne", "findOrInitialize", "findOrCreate", "create"];
      var singleNoPromise = ["build"];

      // Make req.context.findAll and inject user to results
      arrays.forEach(function(name){
         req.context[name] = function(){
            var model = arguments[0];
            // Strip model from arguments
            Array.prototype.shift.apply(arguments);
            // Apply original function
            return model[name].apply(model, arguments).then(function(results){
               results.forEach(function(result){
                  if(result){
                     result.context = {
                        user: req.user
                     }
                  }
               })
               return results;
            });
         };
      });
      // Make req.context.findById, findOne, ... and inject user to result
      singles.forEach(function(name){
         req.context[name] = function(){
            var model = arguments[0];
            // Strip model from arguments
            Array.prototype.shift.apply(arguments);
            // Apply original function
            return model[name].apply(model, arguments).then(function(result){
               if(result){
                  result.context = {
                     user: req.user
                  }
               }
               return result;
            });
         };
      });
      // Make req.context.build and inject user to result
      singleNoPromise.forEach(function(name){
         req.context[name] = function(){
            var model = arguments[0];
            // Strip model from arguments
            Array.prototype.shift.apply(arguments);
            // Apply original function
            var result = model[name].apply(model, arguments);
            if(result){
               result.context = {
                  user: req.user
               }
            }
            return result;
         };
      });
      next();
   });
}
