import { ZodError } from "zod";

export class HttpError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
	}
}

export async function handleApi(handler: () => Promise<Response>) {
	try {
		return await handler();
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues[0].message }, { status: 400 });
		}
		if (error instanceof HttpError) {
			return Response.json({ error: error.message }, { status: error.status });
		}
		if (error instanceof SyntaxError) {
			return Response.json(
				{ error: "入力内容を確認してください。" },
				{ status: 400 },
			);
		}
		console.error("QR Pop request failed", error);
		return Response.json(
			{
				error: "接続できませんでした。少し待ってから、もう一度お試しください。",
			},
			{ status: 503 },
		);
	}
}
