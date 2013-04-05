var domain = require('domain')

module.exports = function(beforeErrorFn, afterErrorFn) {
  return function (req, res, next) {
    var reqDomain = domain.create()
    reqDomain.add(req)
    reqDomain.add(res)

    res.on('close', function() {
      reqDomain.dispose()
    })

    res.on('finish', function() {
      reqDomain.dispose()
    })

    // Only process one error, the rest we will ignore
    var callCount = 0
    reqDomain.on('error', function(err) {
      if (callCount >= 1) return
      callCount += 1

      if (beforeErrorFn) beforeErrorFn(err)

      // Try the standard error handlers
      next(err)

      if (afterErrorFn) afterErrorFn(err)
    })

    reqDomain.run(next)
  }
}
