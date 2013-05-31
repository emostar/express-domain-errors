var domain = require('domain')

module.exports = function(beforeErrorFn, afterErrorFn) {
  return function (req, res, next) {
    var reqDomain = domain.create()
    reqDomain.add(req)
    reqDomain.add(res)

    res.on('close', function() {
      reqDomain.dispose()
    })

    // Only process one error, the rest we will ignore
    reqDomain.once('error', function(err) {
      if (beforeErrorFn) beforeErrorFn(err)

      // Try the standard error handlers
      next(err)

      if (afterErrorFn) afterErrorFn(err)
    })

    reqDomain.run(next)
  }
}
