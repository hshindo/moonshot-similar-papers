import type { PdfAnno } from '$lib/models';
import { PdfDocument, PdfTextAnno, Paper } from '$lib/models';

export class SimilarPapers {
	constructor(
		public label: string,
		public papers: Paper[]
	) {}
}

export class DocState {
	doc: PdfDocument;
	pageIndex: number = 0;
	scaleIndex: number = 5;
	pageAnnos: PdfAnno[][] = []; // annotations for each page
	selectedAnno: PdfAnno;
	metadata: Record<string, SimilarPapers>; // annotation id -> similar papers

	constructor(doc: PdfDocument) {
		this.doc = doc;
		this.pageAnnos = new Array(doc.pageCount);
		for (let i = 0; i < this.pageAnnos.length; i++) this.pageAnnos[i] = [];
		this.metadata = {};
	}

	static async load(paperId: string): Promise<DocState> {
		const endpoint = import.meta.env.VITE_API_ENDPOINT;
		let pdfRes = await fetch(`${endpoint}/static/${paperId}`);
		let pdfData = await pdfRes.arrayBuffer();
		let doc = new PdfDocument(paperId, new Uint8Array(pdfData));
		let state = new DocState(doc);

		let annoRes = await fetch(`${endpoint}/static/${paperId}.anno`);
		const annoIds = [];
		if (annoRes.ok) {
			let annoData = await annoRes.json();
			for (const o of annoData['annos']) {
				let anno = PdfTextAnno.fromObject(o, doc);
				annoIds.push(anno.id);
				state.pageAnnos[anno.page.index].push(anno);
			}
		}

		let jsonRes = await fetch(`${endpoint}/static/${paperId}.json`);
		if (jsonRes.ok) {
			let jsonData = await jsonRes.json();
			const simPapersList = [];
			for (const d of jsonData) {
				let label = d['label'];
				let papers = d['papers'].map((o) => Paper.fromObject(o));
				let simPapers = new SimilarPapers(label, papers);
				simPapersList.push(simPapers);
			}

			// assumes length(annoIds) == length(simPapersList)
			for (let i = 0; i < annoIds.length; i++) {
				state.metadata[annoIds[i]] = simPapersList[i];
			}
		}

		return state;
	}

	selectAnno(anno: PdfAnno) {
		this.selectedAnno = anno;
		if (anno) this.pageIndex = anno.page.index;
	}
}
