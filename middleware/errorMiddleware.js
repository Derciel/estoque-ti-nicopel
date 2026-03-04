const errorMiddleware = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno no servidor';

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorMiddleware;
