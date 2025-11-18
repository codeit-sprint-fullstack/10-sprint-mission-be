export function errorHandler(err, req, res, next) {
  console.error('에러 발생:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: '유효하지 않은 ID 형식입니다.',
    });
  }

  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
}

