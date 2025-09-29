import type { TEmail, TStatusCode, TUserRole } from '@/types';
import type { Router } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import type { StrictObject } from 'nhb-toolbox/object/types';
import type { LooseLiteral } from 'nhb-toolbox/utils/types';
import type Mail from 'nodemailer/lib/mailer';

export interface PrismaErrorMeta extends StrictObject {
	modelName: string;
	target: string[];
}

export interface IParserError {
	expose: boolean;
	statusCode: number;
	status: number;
	body: string;
	type: LooseLiteral<'entity.parse.failed'>;
}

export interface IErrorSource {
	path: string | number;
	message: string;
}

export interface IErrorResponse {
	statusCode: TStatusCode;
	name: string;
	errorSource: IErrorSource[];
	stack?: string;
}

export interface IRoute {
	path: string;
	route: Router;
}

export interface DecodedUser extends JwtPayload {
	email: TEmail;
	role: TUserRole;
}

export interface EmailOptions extends Omit<Mail.Options, 'from' | 'to'> {
	to: TEmail;
}

export interface DestroyResponse extends Record<string, unknown> {
	result: LooseLiteral<'ok' | 'not found' | 'error'>;
}
