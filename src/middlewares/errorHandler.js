export function errorHandler(err, req, res, next) {
  console.error('에러 발생:', err);

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((error) => error.message);
    return res.status(400).send({
      name: 'BadRequest',
      message: messages.join(', '),
    });
  }

  if (err.name === 'SequelizeDatabaseError' || err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).send({
      name: 'BadRequest',
      message: '데이터베이스 오류가 발생했습니다.',
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((error) => error.message);
    return res.status(400).send({
      name: 'BadRequest',
      message: messages.join(', '),
    });
  }

  res.status(500).send({
    name: 'InternalServerError',
    message: '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
}

