export function notFoundHandler(_req, res, _next) {
	res.status(404).json({ message: '요청하신 자원을 찾을 수 없습니다.' });
}

export function errorHandler(err, _req, res, _next) {
	console.error('[error]', err);
	if (res.headersSent) return;
	const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
	const message = err?.message || '서버 오류가 발생했습니다.';
	res.status(status).json({ message });
}


