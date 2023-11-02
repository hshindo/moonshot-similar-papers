import { PdfDocument, PdfTextAnno } from '$lib/models';
import { DocState } from './state';

const endpoint = import.meta.env.VITE_API_ENDPOINT;

export async function listPapers() {
	const response = await fetch(`${endpoint}/papers`, {
		method: 'GET'
	});

	if (response.ok) {
		const result: string[] = await response.json();
		return result;
	} else {
		console.error('Error:', response.status, response.statusText);
		return undefined;
	}
}
