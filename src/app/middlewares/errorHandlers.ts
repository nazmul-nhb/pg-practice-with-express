import configs from '@/configs';
import { ErrorWithStatus } from '@/errors/ErrorWithStatus';
import processErrors from '@/errors/processErrors';
import { deleteFromCloudinary } from '@/utilities/cloudinaryUtilities';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { STATUS_CODES } from 'nhb-toolbox/constants';
import { Stylog } from 'nhb-toolbox/stylog';

/** * Middleware to Handle "Route Not Found" Errors.*/
export const handleRouteNotFound: RequestHandler = (req, _res, next) => {
	const error = new ErrorWithStatus(
		'Not Found Error',
		`Requested End-Point “${req.method}: ${req.path}” Not Found!`,
		STATUS_CODES.NOT_FOUND,
		req.path
	);

	return next(error);
};

/** * Middleware to Handle Global Errors. */
export const catchAllErrors: ErrorRequestHandler = async (err, req, res, next) => {
	if (req?.cloudinary_public_id) {
		try {
			const res = await deleteFromCloudinary(req.cloudinary_public_id);

			if (res.result === 'ok') {
				delete req.cloudinary_public_id;
			} else {
				throw new ErrorWithStatus(
					'Cloudinary Delete Error',
					'Failed to delete image from Cloudinary!',
					STATUS_CODES.BAD_REQUEST,
					req.path
				);
			}
		} catch (err) {
			console.error(Stylog.error.toANSI(`🛑 Cloudinary Error: ${err}`));
		}
	}

	const { statusCode, name, errorSource, stack } = processErrors(err);

	// * Log error msg in the server console
	console.error(Stylog.error.bold.toANSI('🛑 Error(s) Occurred:'));
	errorSource.forEach((err) => {
		console.error(Stylog.error.toANSI(`	➡ ${err.message}`));
	});

	console.error(Stylog.warning.toANSI(`🛑 ${err}`));

	// * Delegate to the default Express error handler
	// ? if the headers have already been sent to the client
	if (res.headersSent) {
		return next(err);
	}

	// * Send error response with status code
	res.status(statusCode).json({
		success: false,
		message: errorSource.map((err) => err.message).join(' | '),
		status: statusCode,
		errors: errorSource.map((source) => ({ name, ...source })),

		...(configs.NODE_ENV === 'development' && {
			stack: stack ? stack : 'Stack Trace Not Available!',
		}),
	});
};
