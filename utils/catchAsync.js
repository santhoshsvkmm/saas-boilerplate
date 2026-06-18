const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Error in async function:', err);
    next(err);
  });
};

module.exports = catchAsync;