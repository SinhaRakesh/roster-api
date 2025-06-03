const loggerFn = function (req, res, next) {
  console.log("middle ware here auth ", req.path);
  next();
};

module.exports = loggerFn;
