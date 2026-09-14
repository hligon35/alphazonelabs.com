declare global {
	interface Env {
		REVIEWS_DB: D1Database;
		RESEND_API_KEY?: string;
		RESEND_FROM_EMAIL?: string;
		RESEND_FROM_NAME?: string;
		FORMS_TO_EMAIL?: string;
		FORMS_DISPLAY_TO_EMAIL?: string;
		AUTH_COOKIE_SECRET?: string;
		GOOGLE_CLIENT_ID?: string;
		ALLOWED_GOOGLE_EMAILS?: string;
		REVIEW_SITE_URL?: string;
		ALLOWED_ORIGINS?: string;
		ENVIRONMENT?: string;
		LOCAL_AUTH_BYPASS?: string;
		LOCAL_ADMIN_EMAIL?: string;
	}
}

export {};
