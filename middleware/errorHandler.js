exports.notFoundHandler = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    next(error);
};

/*exports.errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: err.message })
};*/

exports.errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // ✅ أطبع الخطأ بشكل كامل في الترمينال
    console.error("🔥 FULL ERROR =>", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

    res.status(statusCode).json({
        status: "error",
        message: err.message,
        stack: err.stack, // ✅ عشان توصلك التفاصيل في Postman
    });
};