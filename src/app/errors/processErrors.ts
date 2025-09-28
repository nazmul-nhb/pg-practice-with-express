import { ErrorWithStatus } from '@/classes/ErrorWithStatus';
import { typeGuards } from '@/errors/errorGuards';
import { genericErrors } from '@/errors/genericErrors';
import { handleZodErrors } from '@/errors/zodErrors';
import type { IErrorResponse } from '@/types/interfaces';
import { ZodError } from 'zod';

/**
 * * Processes an error of `unknown` type and returns a structured response.
 * @param error An error of `unknown` type.
 * @returns Processed & structured `Error Response`.
 */
const processErrors = (error: unknown): IErrorResponse => {
	const stack = error instanceof Error ? error.stack : 'Stack Not Available!';

	// Zod Validation Error
	if (error instanceof ZodError) {
		return handleZodErrors(error, stack);
	}
	// Express Body Parser Error
	else if (typeGuards.isParserError(error)) {
		return genericErrors.handleParserError(error, stack);
	}
	// Custom ErrorWithStatus
	else if (error instanceof ErrorWithStatus) {
		return genericErrors.handleErrorWithStatus(error, stack);
	}
	// General Error
	else if (error instanceof Error) {
		return genericErrors.handleGenericError(error, stack);
	}

	// Fallback for unknown errors
	return {
		statusCode: 500,
		name: 'Unknown Error!',
		errorSource: [{ path: 'unknown', message: 'An Unknown Error Occurred!' }],
		stack,
	};
};

export default processErrors;
