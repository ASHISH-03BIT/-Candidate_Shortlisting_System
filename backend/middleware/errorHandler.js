const errorHandler = (error, _req, res, _next) => {
  console.error(error.message);

  if (error.code === 11000) {
    return res.status(400).json({ message: "A record with this email already exists." });
  }

  if (error.name === "ValidationError") {
    return res.status(422).json({ message: error.message });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || "Server error.",
    ...(process.env.NODE_ENV === "production" ? {} : { error: error.message })
  });
};

module.exports = errorHandler;
